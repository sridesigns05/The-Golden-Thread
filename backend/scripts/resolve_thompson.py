"""Resolve the Thompson ids listed in data/stories.json against the trilogy `tmi` table.

    python scripts/resolve_thompson.py path/to/trilogy/data/tmi.csv

Writes data/thompson_names.json ({id: name or null}). This only confirms an id exists in the
dataset and records its label; it does NOT mark anything verified. A human still confirms each
id in Thompson's Motif-Index. trilogy (J. Hagedorn) is under a Creative Commons license; see
its repo before redistributing more than these short labels.
"""
import csv
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
csv.field_size_limit(10**9)


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 1
    wanted = {
        t
        for m in json.load(open(ROOT / "data" / "stories.json", encoding="utf-8"))["motifs"]
        for t in m["thompsonIds"]
    }
    found = {}
    with open(sys.argv[1], encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            if row["id"] in wanted:
                found[row["id"]] = row["motif_name"]
    names = {t: found.get(t) for t in sorted(wanted)}
    out = {
        "_source": "trilogy repo (github.com/j-hagedorn/trilogy), data/tmi.csv; labels only, not verified against Thompson's index",
        "names": names,
    }
    (ROOT / "data" / "thompson_names.json").write_text(
        json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    for t, n in names.items():
        print(f"{t}: {n or 'NOT FOUND in tmi'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
