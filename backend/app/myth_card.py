"""Myth cards for the search bar: one tale's dataset record, its own SerpApi search, and a short
Gemini summary of what those sources say.

Order of work for one card: (1) the dataset record (never contains tale text), (2) a search for that
specific myth, filtered to the evidence allowlist, (3) a summary written by Gemini from the record and the
search snippets only. Both the search results and the summary are cached on disk so a repeat view costs
nothing and the demo survives a network or quota failure. Every failure degrades to "no summary" or "no
sources"; nothing here raises to the caller. The API keys never appear in logs or responses.
"""
import json
import logging
import os
import re
import time
from pathlib import Path

import httpx

from . import catalog, data, evidence, library, similar

log = logging.getLogger("golden-thread.myth-card")

CACHE_PATH = data.DATA_DIR / "myth_cache.json"
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
LLM_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.5-flash")
LLM_TIMEOUT_S = 40.0
MEMO_TTL_S = 600
MAX_SOURCES_FOR_SUMMARY = 6

SYSTEM_PROMPT = """You write the summary line for one folktale on an educational atlas of world folktales.

You are given a dataset record and numbered search results (title, domain, snippet). Write only from that
material.

Rules:
- Use only facts that appear in the record or the snippets. Add nothing from memory, even if you know the tale.
- Write 2 to 4 sentences, at most 90 words, in plain language for a general reader.
- Say what the tale is and where it is recorded. Mention the tale type only as the record states it.
- Never say or imply that one tale came from, influenced or was borrowed by another. Similar motifs are not evidence of that.
- Keep culture-specific names and details as the sources give them.
- If the snippets do not describe the tale itself, say that plainly in one sentence and summarise only the record.
- Do not quote the snippets at length and do not retell the whole plot.
- Reply with JSON only: {"summary": "<text>", "sources_used": [<numbers of the results you relied on>]}"""


# ---- tale lookup ------------------------------------------------------------------------------------

def resolve(tale_id: str) -> dict | None:
    """The record shown at the top of the card, from the curated catalog or the metadata-only library."""
    story = catalog.get_story(tale_id)
    if story is not None:
        return {
            "id": story.id, "tier": "curated", "title": story.title, "originalTitle": story.originalTitle,
            "place": story.region, "tradition": story.culturalTradition,
            "atuType": story.atuType, "atuName": None, "citation": None, "provenance": None,
            "summary": story.summary,
        }
    tale = library.get(tale_id)
    if tale is not None:
        return {
            "id": tale.id, "tier": "library", "title": tale.title, "originalTitle": None,
            "place": tale.placeGuess, "tradition": None,
            "atuType": tale.atuType, "atuName": tale.atuName, "citation": tale.citation,
            "provenance": tale.provenance, "summary": None,
        }
    return None


def _title_core(title: str) -> str:
    """Main title without alternate-title tails like '; or, The Little Glass Slipper'."""
    core = re.split(r"[;(]|\bor,", title, maxsplit=1)[0].strip(" ,.\"'")
    return core or title


def build_query(rec: dict) -> str:
    if rec["tier"] == "curated":
        return evidence.build_query(rec["id"])
    parts = [f'"{_title_core(rec["title"])}"', "folktale"]
    if rec.get("atuName"):
        parts.append(rec["atuName"])
    elif rec.get("place"):
        parts.append(rec["place"])
    return " ".join(parts)


def _relevance(rec: dict) -> re.Pattern:
    if rec["tier"] == "curated" and rec["id"] in evidence.STORY_PATTERNS:
        return evidence.STORY_PATTERNS[rec["id"]]
    return re.compile(re.escape(_title_core(rec["title"])), re.I)


# ---- cache ------------------------------------------------------------------------------------------

def _load_cache() -> dict:
    try:
        with open(CACHE_PATH, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return {"version": 1, "entries": {}}


def _save_cache(cache: dict) -> None:
    tmp = Path(str(CACHE_PATH) + ".tmp")
    tmp.write_text(json.dumps(cache, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    os.replace(tmp, CACHE_PATH)


_memo: dict[str, tuple[float, dict]] = {}


# ---- step 2: the myth's own search ------------------------------------------------------------------

def find_sources(rec: dict, cached: dict | None, live_allowed: bool, refresh: bool = False) -> dict:
    """Saved results first (a tale's sources rarely change), then a live search, then nothing.

    A curated story's prefetched evidence counts as saved results. `refresh` skips the saved ones.
    """
    if not refresh:
        if cached and cached.get("sources", {}).get("results"):
            return {"source": "cache", **cached["sources"]}
        if rec["tier"] == "curated":
            saved = evidence.load_cache().get("entries", {}).get(rec["id"])
            if saved and saved.get("results"):
                return {"source": "cache", "query": saved["query"], "fetchedAt": saved["fetchedAt"], "results": saved["results"]}
    key = evidence.api_key()
    if live_allowed and key:
        try:
            if rec["tier"] == "curated":
                entry = evidence.refresh_story(rec["id"], key, evidence.LIVE_TIMEOUT_S)
            else:
                query = build_query(rec)
                results = _filter_for(evidence.fetch_live(query, key, evidence.LIVE_TIMEOUT_S, None), rec)
                entry = {"query": query, "fetchedAt": evidence.now_iso(), "results": results}
            if entry["results"]:
                return {"source": "live", **entry}
        except Exception as e:  # noqa: BLE001 - any failure falls back to what is saved
            log.warning("live myth search failed: %s", e if isinstance(e, RuntimeError) else type(e).__name__)
    if cached and cached.get("sources"):
        return {"source": "cache", **cached["sources"]}
    return {"source": "none", "query": None, "fetchedAt": None, "results": []}


def _filter_for(results: list[dict], rec: dict) -> list[dict]:
    """fetch_live already applied the allowlist; keep only results that name this tale."""
    pat = _relevance(rec)
    return [r for r in results if pat.search(f'{r.get("title", "")} {r.get("snippet", "")}')]


# ---- step 3: the summary ----------------------------------------------------------------------------

def _record_text(rec: dict) -> str:
    lines = [f'Title: {rec["title"]}']
    for label, key in (("Original title", "originalTitle"), ("Place", "place"), ("Tradition", "tradition"),
                       ("Recorded in", "provenance"), ("Tale type (as the dataset lists it)", "atuType"),
                       ("Tale type name", "atuName"), ("Dataset citation", "citation"),
                       ("Atlas summary", "summary")):
        if rec.get(key):
            lines.append(f"{label}: {rec[key]}")
    return "\n".join(lines)


def _prompt(rec: dict, results: list[dict]) -> str:
    blocks = [
        f'[{i}] {r["title"]} ({r["domain"]})\n{r["snippet"]}'
        for i, r in enumerate(results[:MAX_SOURCES_FOR_SUMMARY], 1)
    ]
    return f"DATASET RECORD\n{_record_text(rec)}\n\nSEARCH RESULTS\n" + ("\n\n".join(blocks) or "(none)")


def parse_summary(raw: str, n_sources: int) -> dict | None:
    """Pulls {summary, sources_used} out of the model's reply; None if it is not usable."""
    m = re.search(r"\{.*\}", raw, re.S)
    if not m:
        return None
    try:
        obj = json.loads(m.group(0))
    except ValueError:
        return None
    text = obj.get("summary")
    if not isinstance(text, str) or not text.strip():
        return None
    used = [n for n in obj.get("sources_used", []) if isinstance(n, int) and 1 <= n <= n_sources]
    return {"text": text.strip(), "sourcesUsed": used}


class LlmError(RuntimeError):
    """A failed model call. The message is safe to show: it never contains the URL or the key."""


def llm_key() -> str | None:
    return os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY") or None


def llm_available() -> bool:
    return bool(llm_key())


def call_llm(prompt: str) -> str:
    """One Gemini call (REST, key in a header so it never lands in a URL). Raises LlmError on any failure."""
    request = dict(
        headers={"x-goog-api-key": llm_key() or "", "content-type": "application/json"},
        json={
            "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {
                "responseMimeType": "application/json",
                "maxOutputTokens": 2048,
                "temperature": 0.2,
            },
        },
        timeout=LLM_TIMEOUT_S,
    )
    resp = None
    for attempt in range(2):  # one retry: Gemini answers 503/429 during demand spikes
        try:
            resp = httpx.post(GEMINI_URL.format(model=LLM_MODEL), **request)
        except httpx.HTTPError as e:
            if attempt == 1:
                raise LlmError(f"network error ({type(e).__name__})") from None
            continue
        if resp.status_code not in (429, 503) or attempt == 1:
            break
        time.sleep(1.5)
    if resp.status_code != 200:
        hint = " - check GEMINI_MODEL (list the models your key can use at /v1beta/models)" if resp.status_code == 404 else ""
        raise LlmError(f"Gemini returned HTTP {resp.status_code}{hint}")
    body = resp.json()
    if body.get("promptFeedback", {}).get("blockReason"):
        raise LlmError("Gemini declined the request")
    candidates = body.get("candidates") or []
    if not candidates:
        raise LlmError("Gemini returned no answer")
    parts = (candidates[0].get("content") or {}).get("parts") or []
    text = "".join(p.get("text", "") for p in parts if not p.get("thought"))
    if not text.strip():
        raise LlmError(f"Gemini returned no text (finish reason {candidates[0].get('finishReason')})")
    return text


def summarize(rec: dict, sources: dict, cached: dict | None, live_allowed: bool) -> dict:
    """Cached summary if it was written from these same sources, else a fresh one, else unavailable."""
    results = sources["results"][:MAX_SOURCES_FOR_SUMMARY]
    links = [r["link"] for r in results]
    old = (cached or {}).get("summary")
    if old and old.get("basedOn") == links:
        return {"available": True, **old}
    if not live_allowed or not llm_available():
        reason = "MYTH_CARD_MODE is cache" if not live_allowed else "no GEMINI_API_KEY set on the server"
        return {"available": False, "reason": reason}
    if not results:
        return {"available": False, "reason": "no sources to summarise"}
    try:
        parsed = parse_summary(call_llm(_prompt(rec, results)), len(results))
    except Exception as e:  # noqa: BLE001
        detail = str(e) if isinstance(e, LlmError) else type(e).__name__
        log.warning("summary failed: %s", detail)
        return {"available": False, "reason": f"the summary service did not answer ({detail})" if isinstance(e, LlmError) else "the summary service did not answer"}
    if parsed is None:
        return {"available": False, "reason": "the summary could not be read"}
    return {
        "available": True, "text": parsed["text"], "model": LLM_MODEL, "generatedAt": evidence.now_iso(),
        "basedOn": links, "sourcesUsed": [links[n - 1] for n in parsed["sourcesUsed"]],
    }


# ---- the card ---------------------------------------------------------------------------------------

def get_card(tale_id: str, refresh: bool = False) -> dict | None:
    rec = resolve(tale_id)
    if rec is None:
        return None
    hit = _memo.get(tale_id)
    if hit and not refresh and time.time() - hit[0] < MEMO_TTL_S:
        return hit[1]

    # Cards are opened on demand and cover ~1,500 tales that cannot all be prefetched, so they have their own
    # switch (the evidence panel keeps using EVIDENCE_MODE).
    live_allowed = os.environ.get("MYTH_CARD_MODE", "live").lower() != "cache"
    cache = _load_cache()
    cached = cache.get("entries", {}).get(tale_id)

    sources = find_sources(rec, cached, live_allowed, refresh)
    summary = summarize(rec, sources, None if refresh else cached, live_allowed)

    if sources["results"] or summary.get("available"):
        entry = {"sources": {k: sources[k] for k in ("query", "fetchedAt", "results")}}
        if summary.get("available"):
            entry["summary"] = {k: summary[k] for k in ("text", "model", "generatedAt", "basedOn", "sourcesUsed")}
        elif cached and cached.get("summary"):
            entry["summary"] = cached["summary"]
        cache.setdefault("entries", {})[tale_id] = entry
        try:
            _save_cache(cache)
        except OSError:
            log.warning("could not write myth cache")

    card = {"record": rec, "sources": sources, "summary": summary, **similar.for_tale(tale_id)}
    _memo[tale_id] = (time.time(), card)
    return card
