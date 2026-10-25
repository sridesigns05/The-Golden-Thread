"""Build data/atu_motifs.json: the Thompson motifs the trilogy repo lists for each ATU tale type.

    python scripts/build_type_motifs.py path/to/trilogy/data

Reads `atu_seq.csv` (the motifs in each tale type's synopsis in the Aarne-Thompson-Uther index) and `tmi.csv`
(motif names from Thompson's Motif-Index). For every tale type used by the library or the atlas it stores:

  - the motifs listed for the type, most often listed first (capped; `total` is the full count),
  - where the type sits in the ATU index (`group`, for nearby types),
  - up to three related tale types: types that list many of the same motifs. A motif listed by many types
    counts for less, so common motifs such as "Magic object" do not link everything to everything.

These are facts about the TALE TYPE, not about any single tale's text, and "related" means "lists similar
motifs", never "borrowed from". Only short motif labels are copied; no tale texts.
"""
import csv
import json
import math
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
csv.field_size_limit(10**9)

MOTIFS_PER_TYPE = 12
RELATED_PER_TYPE = 3
MIN_SHARED = 2


def atu_code(text: str | None) -> str | None:
    m = re.match(r"\s*(\d+[A-Za-z]*\*?)", text or "")
    return m.group(1).upper() if m else None


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 1
    folder = Path(sys.argv[1])

    names: dict[str, str] = {}
    with open(folder / "tmi.csv", encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            names[row["id"]] = row["motif_name"]

    counts: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
    first_seen: dict[str, dict[str, int]] = defaultdict(dict)
    with open(folder / "atu_seq.csv", encoding="utf-8", newline="") as f:
        for i, row in enumerate(csv.DictReader(f)):
            t, m = row["atu_id"].strip().upper(), row["motif"].strip()
            if not m:
                continue
            counts[t][m] += 1
            first_seen[t].setdefault(m, i)

    # Where each type sits in the ATU index (chapter > division > sub-division), for "nearby tale types"
    placement: dict[str, str] = {}
    with open(folder / "atu_df.csv", encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            for key in ("sub_division", "division", "chapter"):
                if row[key] and row[key] != "NA":
                    placement[row["atu_id"].strip().upper()] = row[key]
                    break

    # Types we need: every library tale's type and every atlas story's type
    needed = {t["atuType"].upper() for t in json.load(open(ROOT / "data" / "library.json", encoding="utf-8"))["tales"]}
    for s in json.load(open(ROOT / "data" / "stories.json", encoding="utf-8"))["stories"]:
        code = atu_code(s.get("atuType"))
        if code:
            needed.add(code)
    needed &= set(counts)

    # How many tale types list each motif (for down-weighting common motifs)
    df: dict[str, int] = defaultdict(int)
    for t in counts:
        for m in counts[t]:
            df[m] += 1
    n_types = len(counts)
    idf = {m: math.log(n_types / d) for m, d in df.items()}

    def ordered(t: str) -> list[str]:
        return sorted(counts[t], key=lambda m: (-counts[t][m], first_seen[t][m]))

    out: dict[str, dict] = {}
    for t in sorted(needed):
        mine = set(counts[t])
        scored = []
        for u in needed:
            if u == t:
                continue
            shared = mine & set(counts[u])
            if len(shared) < MIN_SHARED:
                continue
            union = mine | set(counts[u])
            score = sum(idf[m] for m in shared) / sum(idf[m] for m in union)
            scored.append((score, u, sorted(shared, key=lambda m: -idf[m])))
        scored.sort(key=lambda x: (-x[0], x[1]))
        out[t] = {
            "total": len(mine),
            "group": placement.get(t),
            "motifs": [{"id": m, "name": names.get(m)} for m in ordered(t)[:MOTIFS_PER_TYPE]],
            "related": [
                {"atuType": u, "score": round(sc, 3), "shared": [{"id": m, "name": names.get(m)} for m in sh[:3]]}
                for sc, u, sh in scored[:RELATED_PER_TYPE]
            ],
        }

    result = {
        "_source": "trilogy repo (github.com/j-hagedorn/trilogy): data/atu_seq.csv (motifs listed per tale type) and data/tmi.csv (motif names)",
        "_note": (
            "Motifs are those the ATU index lists for the TALE TYPE, not read from any one tale. 'related' means two "
            "types list similar motifs (idf-weighted overlap, at least 2 shared); it is not evidence of borrowing."
        ),
        "types": out,
    }
    (ROOT / "data" / "atu_motifs.json").write_text(json.dumps(result, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    with_motifs = sum(1 for v in out.values() if v["motifs"])
    print(f"{len(out)} tale types written ({with_motifs} with motifs, {sum(1 for v in out.values() if v['related'])} with related types)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
