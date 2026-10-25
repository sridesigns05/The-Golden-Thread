"""The library tier: metadata-only tales from the trilogy/Ashliman data (data/library.json).

Library tales are searchable and can appear in related-tale lists and comparisons, but they are
never plotted (no coordinates or dates exist on them) and never displace curated stories.
Their motif links come from the ATU tale type, so every explanation says so.
"""
import json
from functools import lru_cache

from . import catalog
from .data import DATA_DIR
from .models import LibraryStory, LibrarySummary, Motif, TypeBasis

FORBIDDEN_KEYS = {"text", "lat", "lon", "latitude", "longitude", "earliestRecordedDate"}


@lru_cache(maxsize=None)
def _raw() -> dict:
    try:
        with open(DATA_DIR / "library.json", encoding="utf-8") as f:
            return json.load(f)
    except OSError:
        return {"tales": [], "droppedAsDuplicates": []}


@lru_cache(maxsize=None)
def tales() -> list[LibraryStory]:
    return [
        LibraryStory(**{**t, "atuFamily": catalog.atu_family(t["atuType"])}) for t in _raw()["tales"]
    ]


@lru_cache(maxsize=None)
def _by_id() -> dict[str, LibraryStory]:
    return {t.id: t for t in tales()}


def get(tale_id: str) -> LibraryStory | None:
    return _by_id().get(tale_id)


def summary(tale: LibraryStory) -> LibrarySummary:
    return LibrarySummary(**tale.model_dump(include=set(LibrarySummary.model_fields)))


def motif_counts() -> dict[str, int]:
    counts: dict[str, int] = {}
    for t in tales():
        for m in t.motifs:
            counts[m] = counts.get(m, 0) + 1
    return counts


def with_counts(motifs: list[Motif]) -> list[Motif]:
    counts = motif_counts()
    return [m.model_copy(update={"libraryCount": counts.get(m.id, 0)}) for m in motifs]


def type_basis(tale: LibraryStory, motif_id: str) -> TypeBasis:
    """Template filled only from stored fields; states the link is at the tale-type level."""
    motif = catalog.get_motif(motif_id)
    wanted = set(tale.thompsonMatches.get(motif_id, []))
    refs = [t for t in (motif.thompson if motif else []) if t.id in wanted]
    listed = ", ".join(f"{t.id} ({t.name})" if t.name else t.id for t in refs)
    name = f" ({tale.atuName})" if tale.atuName else ""
    return TypeBasis(
        motif=motif_id, atuType=tale.atuType, atuName=tale.atuName, thompson=refs,
        text=(
            f"Classified as ATU {tale.atuType}{name} in Ashliman's Folktexts. The ATU index lists Thompson "
            f"motif {listed} for this tale type, so the link is made at the type level, not read from this tale's text."
        ),
    )


def meta_block() -> dict:
    raw = _raw()
    return {
        "attribution": raw.get("_attribution", ""),
        "license": raw.get("_license", ""),
        "taleCount": len(tales()),
        "linkedToMotifs": sum(1 for t in tales() if t.motifs),
        "droppedAsDuplicates": raw.get("droppedAsDuplicates", []),
        "limitations": [
            "Library tales are metadata only: titles, provenance text, citations and ATU types. No tale texts are included.",
            "Motifs are linked through the ATU tale type, not read from each tale.",
            "Provenance is free text, coverage skews European, and library tales have no dates or coordinates, so they are never plotted.",
        ],
    }


def validate() -> list[str]:
    problems = []
    ids = [t.id for t in tales()]
    if len(ids) != len(set(ids)):
        problems.append("duplicate library ids")
    motif_ids = {m.id for m in catalog.motifs()}
    curated_ids = {s.id for s in catalog.stories()}
    for t in tales():
        if t.id in curated_ids:
            problems.append(f"{t.id}: collides with a curated id")
        if set(t.motifs) - motif_ids:
            problems.append(f"{t.id}: unknown motifs {sorted(set(t.motifs) - motif_ids)}")
        if t.verified:
            problems.append(f"{t.id}: marked verified")
    for t in _raw()["tales"]:
        bad = FORBIDDEN_KEYS & set(t)
        if bad:
            problems.append(f"{t['id']}: forbidden keys {sorted(bad)}")
    return problems
