"""Evidence lookup: live SerpApi search filtered to an allowlist, with an on-disk cache as fallback.

Evidence is keyed per STORY (one search each), and a comparison's evidence is the merge of its two
stories' results. The cache is what keeps the demo alive when the network is down or quota is
spent, so every failure path in here degrades to the cache instead of raising. Never put the API
key (or an exception message that may contain the request URL) into a log line or a response.
"""
import json
import logging
import os
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

import httpx
from dotenv import load_dotenv

from . import data

log = logging.getLogger("golden-thread.evidence")

BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")
load_dotenv(BACKEND_DIR.parent / ".env")

CACHE_PATH = data.DATA_DIR / "evidence_cache.json"
SERPAPI_URL = "https://serpapi.com/search.json"
LIVE_TIMEOUT_S = 12.0
MEMO_TTL_S = 600

# Exact hosts (and their subdomains) plus suffix rules. pitt.edu is restricted to the
# D. L. Ashliman folktexts pages (/~dash); other *.edu hosts are allowed as university sources.
ALLOWED_HOSTS = (
    "britannica.com",
    "jstor.org",
    "loc.gov",
    "academic.oup.com",
    "cambridge.org",
    "muse.jhu.edu",
    "ebsco.com",  # EBSCO Research Starters
    "worldhistory.org",
    "archive.org",
    "gutenberg.org",
    "sacred-texts.com",
    "surlalunefairytales.com",
    "si.edu",
    "mythfolklore.net",  # Andrew Lang fairy-book texts
    "worldoftales.com",
    "surlalunefairytales.blogspot.com",
)
ALLOWED_SUFFIXES = (".edu", ".ac.uk", ".gov")
# Open upload platforms that happen to sit under an allowed suffix; not vetted sources.
BLOCKED_HOSTS = ("academia.edu", "researchgate.net", "scribd.com", "coursehero.com")

# Search-term wording only; not displayed to players and not a factual claim.
STORY_TERMS = {
    "cinderella": '"Cinderella" Perrault Cendrillon',
    "kongjwi": '"Kongjwi" OR "Kong-ji" Patjwi Korean folktale',
    "yexian": '"Ye Xian" OR "Yeh Hsien" Tang Cinderella',
    "shakuntala": "Shakuntala Kalidasa play",
    "vasilisa": '"Vasilisa the Beautiful" OR "Vasilisa the Fair" Baba Yaga Afanasyev',
    "anansi": "Ananse Akan Ashanti Rattray folktale Sky-god stories",
    "momotaro": "Momotaro peach boy Japanese folktale",
    "golden-crab": '"Golden Crab" Greek folktale Andrew Lang Green Fairy Book',
    "urashima-taro": '"Urashima Taro" OR "Urashima Tarō" Japanese legend fisherman turtle Dragon Palace',
    "sedna": "Sedna Nuliajuk Inuit sea mother",
    "rhodopis": '"Rhodopis" Strabo Egyptian Cinderella Naucratis sandal',
    "one-hand-girl": "Steere Swahili Tales Zanzibar \"Blessing or Property\" OR \"one-handed girl\"",
    "tam-cam": '"Tam and Cam" OR "Tấm Cám" Vietnamese folktale',
    "popol-vuh-twins": "Popol Vuh Hero Twins Hunahpu Xbalanque Xibalba",
    "fisherman-and-the-jinni": '"Fisherman and the Jinni" OR "Fisherman and the Genie" Arabian Nights',
}
# A second search per story, aimed at encyclopedias, folklore archives and university pages. One query
# rarely surfaces enough allowlisted pages, so the two result lists are merged.
STORY_EXTRA_TERMS = {
    "cinderella": "Cinderella ATU 510 folktale Ashliman",
    "kongjwi": "Kongjwi Patjwi Korean folktale Cinderella",
    "yexian": "Ye Xian Chinese Cinderella Duan Chengshi",
    "shakuntala": "Shakuntala Kalidasa Britannica",
    "vasilisa": "Baba Yaga Vasilisa Russian folklore",
    "anansi": "Ananse Anansi Akan folktale Britannica",
    "momotaro": '"Momotaro" OR "Momotarō" Japanese folktale text',
    "golden-crab": '"Golden Crab" Greek folktale text',
    "urashima-taro": '"Urashima Taro" legend Japan encyclopedia',
    "sedna": "Sedna Inuit sea goddess Britannica",
    "rhodopis": "Rhodopis Strabo Cinderella Egypt folktale",
    "one-hand-girl": "Swahili tale girl without hands Steere",
    "tam-cam": "Tam Cam Vietnamese Cinderella folktale",
    "popol-vuh-twins": '"Popol Vuh" Maya creation epic Britannica',
    "fisherman-and-the-jinni": "Fisherman and the Jinni Arabian Nights Britannica",
}
# A result must name the story it is attached to in its title or snippet, which drops
# generic university homepages and unrelated pages the search engine pads results with.
STORY_PATTERNS = {
    "cinderella": re.compile(r"cinderella|cendrillon|perrault", re.I),
    "kongjwi": re.compile(r"kong[- ]?j(wi|i|ui)|pat[- ]?j(wi|i|ui)|콩쥐", re.I),
    "yexian": re.compile(r"ye[ -]?xian|yeh[ -]?hsien|葉限|叶限", re.I),
    "shakuntala": re.compile(r"[sś]h?akuntal[aā]|sakoontala|abhij[nñ][aā]na|kalidasa|kālidāsa", re.I),
    "vasilisa": re.compile(r"vasilisa|vassilissa|baba[- ]yaga|afanas", re.I),
    "anansi": re.compile(r"anansi|ananse|akan|ashanti|asante", re.I),
    "momotaro": re.compile(r"momotar|peach boy|peach[- ]?ling", re.I),
    "golden-crab": re.compile(r"golden crab|prinz krebs|yellow fairy book", re.I),
    "urashima-taro": re.compile(r"urashima|浦島", re.I),
    "sedna": re.compile(r"sedna|nuliajuk|takannaaluk|sea mother|sea woman|arnapkapfaaluk", re.I),
    "rhodopis": re.compile(r"rhodopis|doricha|rhodope", re.I),
    "one-hand-girl": re.compile(r"swahili|steere|zanzibar|one-handed girl|maiden without hands|girl without hands", re.I),
    "tam-cam": re.compile(r"tam (and|va|và) cam|t[aấ]m c[aá]m|tam cam|landes", re.I),
    "popol-vuh-twins": re.compile(r"popol vuh|hunahpu|xbalanque|xibalba|hero twins", re.I),
    "fisherman-and-the-jinni": re.compile(r"fisherman and the (jinni|genie|djinn|demon)|fisherman and the", re.I),
}


def is_allowed(url: str) -> bool:
    try:
        u = urlparse(url)
    except ValueError:
        return False
    host = (u.hostname or "").lower()
    if u.scheme not in ("http", "https") or not host:
        return False
    if any(host == h or host.endswith("." + h) for h in BLOCKED_HOSTS):
        return False
    if host == "pitt.edu" or host.endswith(".pitt.edu"):
        return u.path.startswith("/~dash")
    if any(host == h or host.endswith("." + h) for h in ALLOWED_HOSTS):
        return True
    return host.endswith(ALLOWED_SUFFIXES)


def domain_of(url: str) -> str:
    host = (urlparse(url).hostname or "").lower()
    return host[4:] if host.startswith("www.") else host


def build_query(story_id: str) -> str:
    return STORY_TERMS[story_id]  # Google ignores a site: list this long; the allowlist filters instead


def api_key() -> str | None:
    return os.environ.get("SERPAPI_KEY") or os.environ.get("SERPAPI_API_KEY") or None


def filter_results(organic: list[dict], story: str | None = None) -> list[dict]:
    pattern = STORY_PATTERNS.get(story) if story else None
    out = []
    for r in organic:
        link = r.get("link")
        if not link or not is_allowed(link):
            continue
        title, snippet = r.get("title", ""), r.get("snippet", "")
        if pattern and not pattern.search(f"{title} {snippet}"):
            continue
        item = {"title": title, "link": link, "snippet": snippet, "domain": domain_of(link)}
        if story:
            item["story"] = story
        out.append(item)
    return out


def fetch_live(query: str, key: str, timeout: float = LIVE_TIMEOUT_S, story: str | None = None) -> list[dict]:
    """One SerpApi call, filtered to the allowlist. Raises RuntimeError (no URL/key) on failure."""
    try:
        resp = httpx.get(
            SERPAPI_URL,
            params={"engine": "google", "q": query, "num": 20, "api_key": key},
            timeout=timeout,
        )
    except httpx.HTTPError as e:
        raise RuntimeError(f"network error ({type(e).__name__})") from None
    if resp.status_code != 200:
        raise RuntimeError(f"SerpApi returned HTTP {resp.status_code}")
    body = resp.json()
    err = body.get("error")
    if err and "hasn't returned any results" in str(err):
        return []  # a valid search with no hits, not a failure
    if err:
        raise RuntimeError("SerpApi reported an error (quota or query problem)")
    return filter_results(body.get("organic_results", []), story)


def load_cache() -> dict:
    try:
        with open(CACHE_PATH, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return {"version": 2, "entries": {}}


def save_cache(cache: dict) -> None:
    tmp = CACHE_PATH.with_suffix(".tmp")
    tmp.write_text(json.dumps(cache, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    os.replace(tmp, CACHE_PATH)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def refresh_story(story_id: str, key: str, timeout: float = LIVE_TIMEOUT_S) -> dict:
    """Live-fetch one story's evidence in cache-entry shape. Raises RuntimeError if the main search fails.

    The extra search is best effort: if it fails, the main search's results are still returned.
    """
    query = build_query(story_id)
    results = fetch_live(query, key, timeout, story_id)
    queries = [query]
    extra = STORY_EXTRA_TERMS.get(story_id)
    if extra:
        try:
            more = fetch_live(extra, key, timeout, story_id)
        except RuntimeError:
            more = []
        seen = {r["link"] for r in results}
        results += [r for r in more if r["link"] not in seen]
        queries.append(extra)
    return {"query": " | ".join(queries), "fetchedAt": now_iso(), "results": results}


_memo: dict[str, tuple[float, dict]] = {}


def get_story_evidence(story_id: str) -> dict:
    """Live (unless EVIDENCE_MODE=cache or no key) -> cache -> empty. Never raises."""
    base = {"story": story_id}
    key = api_key()
    if key and os.environ.get("EVIDENCE_MODE", "live").lower() != "cache":
        hit = _memo.get(story_id)
        if hit and time.time() - hit[0] < MEMO_TTL_S:
            return {**base, "source": "live", **hit[1]}
        try:
            entry = refresh_story(story_id, key)
            if entry["results"]:  # an empty live answer shouldn't mask a good cached one
                _memo[story_id] = (time.time(), entry)
                cache = load_cache()
                cache.setdefault("entries", {})[story_id] = entry
                try:
                    save_cache(cache)
                except OSError:
                    log.warning("could not write evidence cache")
                return {**base, "source": "live", **entry}
        except Exception as e:  # noqa: BLE001 - any failure must fall back to cache
            log.warning(
                "live evidence failed, using cache: %s",
                e if isinstance(e, RuntimeError) else type(e).__name__,
            )

    cached = load_cache().get("entries", {}).get(story_id)
    if cached:
        return {**base, "source": "cache", **cached}
    return {**base, "source": "none", "query": None, "fetchedAt": None, "results": []}


def get_evidence(a: str, b: str, motif: str) -> dict:
    """Evidence for a comparison: the merged results of both stories' searches. Never raises."""
    parts = [get_story_evidence(a), get_story_evidence(b)]
    seen, results = set(), []
    for part in parts:
        for item in part["results"]:
            if item["link"] not in seen:
                seen.add(item["link"])
                results.append(item)
    sources = {p["source"] for p in parts}
    source = "live" if "live" in sources else "cache" if "cache" in sources else "none"
    stamps = [p["fetchedAt"] for p in parts if p["fetchedAt"]]
    queries = [p["query"] for p in parts if p["query"]]
    return {
        "a": a, "b": b, "motif": motif, "source": source,
        "query": " | ".join(queries) or None, "fetchedAt": min(stamps) if stamps else None, "results": results,
    }
