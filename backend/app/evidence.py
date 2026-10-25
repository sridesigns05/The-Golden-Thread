"""Evidence lookup: live SerpApi search filtered to an allowlist, with an on-disk cache as fallback.

The cache is what keeps the demo alive when the network is down or quota is spent, so every
failure path in here degrades to the cache instead of raising. Never put the API key (or an
exception message that may contain the request URL) into a log line or a response.
"""
import json
import logging
import os
import re
import time
from concurrent.futures import ThreadPoolExecutor
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
LIVE_TIMEOUT_S = 4.0
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
)
ALLOWED_SUFFIXES = (".edu", ".ac.uk")
# Open upload platforms that happen to sit under an allowed suffix; not vetted sources.
BLOCKED_HOSTS = ("academia.edu", "researchgate.net", "scribd.com", "coursehero.com")
SEARCH_SITE_HINT = "(site:edu OR site:britannica.com OR site:jstor.org OR site:ac.uk)"

# Search-term wording only; not displayed to players and not a factual claim.
STORY_TERMS = {
    "cinderella": '"Cinderella" Perrault',
    "kongjwi": '"Kongjwi" OR "Kong-ji" Patjwi Korean folktale',
    "yexian": '"Ye Xian" OR "Yeh Hsien" Tang Cinderella',
    "shakuntala": "Shakuntala Kalidasa",
}
# A result must name the story it is attached to in its title or snippet, which drops
# generic university homepages and unrelated pages the search engine pads results with.
STORY_PATTERNS = {
    "cinderella": re.compile(r"cinderella|cendrillon|perrault", re.I),
    "kongjwi": re.compile(r"kong[- ]?j(wi|i|ui)|pat[- ]?j(wi|i|ui)|콩쥐", re.I),
    "yexian": re.compile(r"ye[ -]?xian|yeh[ -]?hsien|葉限|叶限", re.I),
    "shakuntala": re.compile(r"[sś]h?akuntal[aā]|sakoontala|abhij[nñ][aā]na|kalidasa|kālidāsa", re.I),
}
MOTIF_TERMS = {
    "unjust-treatment": "persecuted stepdaughter stepmother",
    "supernatural-assistance": "magical helper donor",
    "lost-object-recognition": "lost shoe slipper recognition",
    "reversal-of-fortune": "marries king rise",
}
SHAKUNTALA_MOTIF_TERM = "signet ring recognition"


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


def build_query(story: str, other: str, motif: str) -> str:
    """Search for one story of a pair, worded for the motif they share."""
    if "shakuntala" in (story, other) and motif == "lost-object-recognition":
        motif_term = SHAKUNTALA_MOTIF_TERM
    else:
        motif_term = MOTIF_TERMS.get(motif, motif.replace("-", " "))
    return f"{STORY_TERMS[story]} {motif_term} {SEARCH_SITE_HINT}"


def cache_key(a: str, b: str, motif: str) -> str:
    x, y = sorted((a, b))
    return f"{x}|{y}|{motif}"


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
        return {"version": 1, "entries": {}}


def save_cache(cache: dict) -> None:
    tmp = CACHE_PATH.with_suffix(".tmp")
    tmp.write_text(json.dumps(cache, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    os.replace(tmp, CACHE_PATH)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def refresh_entry(a: str, b: str, motif: str, key: str, timeout: float = LIVE_TIMEOUT_S) -> dict:
    """Live-fetch one entry (one search per story) in cache-entry shape.

    Raises RuntimeError if either search fails, so a half-filled entry is never cached.
    """
    queries = [build_query(a, b, motif), build_query(b, a, motif)]
    with ThreadPoolExecutor(max_workers=2) as pool:
        futures = [pool.submit(fetch_live, q, key, timeout, s) for q, s in zip(queries, (a, b))]
        batches = [f.result() for f in futures]
    seen, results = set(), []
    for item in batches[0] + batches[1]:
        if item["link"] not in seen:
            seen.add(item["link"])
            results.append(item)
    return {"query": " | ".join(queries), "fetchedAt": now_iso(), "results": results}


_memo: dict[str, tuple[float, dict]] = {}


def get_evidence(a: str, b: str, motif: str) -> dict:
    """Live (unless EVIDENCE_MODE=cache or no key) -> cache -> empty. Never raises."""
    k = cache_key(a, b, motif)
    base = {"a": a, "b": b, "motif": motif}

    key = api_key()
    if key and os.environ.get("EVIDENCE_MODE", "live").lower() != "cache":
        hit = _memo.get(k)
        if hit and time.time() - hit[0] < MEMO_TTL_S:
            return {**base, "source": "live", **hit[1]}
        try:
            entry = refresh_entry(a, b, motif, key)
            if entry["results"]:  # an empty live answer shouldn't mask a good cached one
                _memo[k] = (time.time(), entry)
                cache = load_cache()
                cache.setdefault("entries", {})[k] = entry
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

    cached = load_cache().get("entries", {}).get(k)
    if cached:
        return {**base, "source": "cache", **cached}
    return {**base, "source": "none", "query": None, "fetchedAt": None, "results": []}
