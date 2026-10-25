"""Pre-fetch evidence for every comparison (pair + motif) into data/evidence_cache.json.

    python scripts/prefetch_evidence.py --dry-run   # print queries, no API calls
    python scripts/prefetch_evidence.py             # two SerpApi calls per entry (30 total)

A failed entry keeps whatever was already cached for it. Re-run is safe.
"""
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import data, evidence  # noqa: E402


PREFETCH_TIMEOUT_S = 30.0  # the live endpoint uses a short timeout; a one-off prefetch can wait
ATTEMPTS = 3


def fetch_with_retry(a, b, motif, key):
    for attempt in range(1, ATTEMPTS + 1):
        try:
            return evidence.refresh_entry(a, b, motif, key, PREFETCH_TIMEOUT_S)
        except RuntimeError:
            if attempt == ATTEMPTS:
                raise
            time.sleep(2 * attempt)


def main() -> int:
    dry = "--dry-run" in sys.argv
    key = evidence.api_key()
    if not dry and not key:
        print("SERPAPI_KEY is not set (put it in backend/.env).")
        return 1
    cache = evidence.load_cache()
    entries = cache.setdefault("entries", {})
    failures = 0
    for c in data.comparisons():
        a, b, motif = c["storyAId"], c["storyBId"], c["sharedMotif"]
        k = evidence.cache_key(a, b, motif)
        if dry:
            print(f"{k}\n    {evidence.build_query(a, b, motif)}")
            continue
        try:
            entries[k] = fetch_with_retry(a, b, motif, key)
            print(f"ok    {k}: {len(entries[k]['results'])} allowlisted results")
        except RuntimeError as e:
            failures += 1
            print(f"FAIL  {k}: {e} (kept existing cache entry: {k in entries})")
    if not dry:
        evidence.save_cache(cache)
        empty = [k for k, v in entries.items() if not v["results"]]
        print(f"\n{len(entries)} cached, {failures} failed, {len(empty)} with zero results")
        for k in empty:
            print("  empty:", k)
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
