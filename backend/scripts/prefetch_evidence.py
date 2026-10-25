"""Pre-fetch evidence for every curated story into data/evidence_cache.json.

    python scripts/prefetch_evidence.py --dry-run   # print the 15 queries, no API calls
    python scripts/prefetch_evidence.py             # one SerpApi call per story (15 total)

A failed story keeps whatever was already cached for it. Re-run is safe. A comparison's evidence is
the merge of its two stories' results, so 15 calls cover every comparison.
"""
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import catalog, evidence  # noqa: E402

PREFETCH_TIMEOUT_S = 30.0  # the live endpoint uses a short timeout; a one-off prefetch can wait
ATTEMPTS = 3


def fetch_with_retry(story_id, key):
    for attempt in range(1, ATTEMPTS + 1):
        try:
            return evidence.refresh_story(story_id, key, PREFETCH_TIMEOUT_S)
        except RuntimeError:
            if attempt == ATTEMPTS:
                raise
            time.sleep(2 * attempt)


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # Windows consoles default to cp1252
    dry = "--dry-run" in sys.argv
    key = evidence.api_key()
    if not dry and not key:
        print("SERPAPI_KEY is not set (put it in backend/.env).")
        return 1
    cache = evidence.load_cache()
    cache["version"] = 2
    entries = cache.setdefault("entries", {})
    failures = 0
    for story in catalog.stories():
        if dry:
            print(f"{story.id}\n    {evidence.build_query(story.id)}")
            continue
        try:
            entries[story.id] = fetch_with_retry(story.id, key)
            print(f"ok    {story.id}: {len(entries[story.id]['results'])} allowlisted results")
        except RuntimeError as e:
            failures += 1
            print(f"FAIL  {story.id}: {e} (kept existing cache entry: {story.id in entries})")
    if not dry:
        evidence.save_cache(cache)
        empty = [k for k, v in entries.items() if not v["results"]]
        print(f"\n{len(entries)} cached, {failures} failed, {len(empty)} with zero results")
        for k in empty:
            print("  empty:", k)
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
