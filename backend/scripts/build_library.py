"""Build data/library.json: metadata-only index of the trilogy `aft` tales (the "library" tier).

    python scripts/build_library.py path/to/trilogy/data

Copies per tale: title, provenance, citation, ATU type and name. It does NOT copy tale texts
(they come from D. L. Ashliman's Folktexts). Library tales never get coordinates or dates.

Each tale is linked to our motifs only through its ATU *tale type*: a motif is attached when one
of its resolved Thompson ids (data/stories.json) is listed for that type in `atu_seq`. That is a
statement about the type, not about the individual tale. Re-run after Thompson ids are added.

data/library_links.json maps a library tale to a curated story it duplicates; those are dropped.
"""
import csv
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
csv.field_size_limit(10**9)

ATTRIBUTION = (
    "Tale metadata from the trilogy repository (J. Hagedorn, github.com/j-hagedorn/trilogy), derived "
    "from D. L. Ashliman's Folktexts (https://www.pitt.edu/~dash/folktexts.html, (c) 1996-2021). "
    "Tale-type and motif data derive from the Aarne-Thompson-Uther index and Thompson's Motif-Index. "
    "Tale texts are not included."
)
LICENSE = (
    "trilogy's LICENSE.md is CC BY-NC-SA 4.0 (its README says CC BY-SA 4.0); treated here as the "
    "stricter BY-NC-SA. Attribution is required and use must be non-commercial."
)


def read(folder: Path, name: str) -> list[dict]:
    with open(folder / f"{name}.csv", encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def clean(value: str) -> str | None:
    value = (value or "").strip()
    return None if value in ("", "NA") else value


def place_guess(provenance: str | None) -> str | None:
    """Best-effort text before ' (' or ','. Sometimes an author rather than a place; not a coordinate source."""
    if not provenance:
        return None
    return re.split(r"\s*\(|,", provenance, maxsplit=1)[0].strip() or None


def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:60]


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 1
    folder = Path(sys.argv[1])
    stories = json.load(open(ROOT / "data" / "stories.json", encoding="utf-8"))
    links = json.load(open(ROOT / "data" / "library_links.json", encoding="utf-8"))["links"]

    thompson = {m["id"]: m["thompsonIds"] for m in stories["motifs"] if m["thompsonIds"]}
    type_motifs = defaultdict(set)
    for row in read(folder, "atu_seq"):
        type_motifs[row["atu_id"]].add(row["motif"])
    atu_names = {r["atu_id"]: clean(r["tale_name"]) for r in read(folder, "atu_df")}

    tales, dropped, used_ids = [], [], set()
    for row in read(folder, "aft"):
        atu, title = row["atu_id"], row["tale_title"].strip()
        link = links.get(f"{atu}|{title}")
        if link:
            dropped.append({"title": title, "atuType": atu, "duplicateOf": link})
            continue
        matches = {
            motif: sorted(set(ids) & type_motifs.get(atu, set()))
            for motif, ids in thompson.items()
            if set(ids) & type_motifs.get(atu, set())
        }
        base = f"lib-{atu.lower()}-{slug(title)}"
        tale_id, n = base, 1
        while tale_id in used_ids:
            n += 1
            tale_id = f"{base}-{n}"
        used_ids.add(tale_id)
        provenance = clean(row["provenance"])
        tales.append({
            "id": tale_id,
            "title": title,
            "provenance": provenance,
            "placeGuess": place_guess(provenance),
            "atuType": atu,
            "atuName": atu_names.get(atu),
            "citation": clean(row["source"]),
            "dataSource": row["data_source"],
            "motifs": sorted(matches),
            "thompsonMatches": matches,
            "motifBasis": "tale-type",
            "verified": False,
        })

    out = {
        "_attribution": ATTRIBUTION,
        "_license": LICENSE,
        "_note": "Metadata only. motifs are linked at the ATU tale-type level, not read from each tale. Never plotted: no coordinates or dates.",
        "droppedAsDuplicates": dropped,
        "tales": tales,
    }
    (ROOT / "data" / "library.json").write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    mapped = sum(1 for t in tales if t["motifs"])
    print(f"{len(tales)} library tales ({mapped} linked to >=1 of our motifs); {len(dropped)} dropped as duplicates of curated stories")
    for d in dropped:
        print("  dropped:", d)
    return 0


if __name__ == "__main__":
    sys.exit(main())
