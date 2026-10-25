"""Loads and validates the curated catalog (data/stories.json + data/thompson_names.json)."""
import json
import re
from functools import lru_cache

from .data import DATA_DIR
from .models import Motif, MotifEntry, Source, StoryDetail, StorySummary, ThompsonRef

# The frontend's mock data uses shorter ids for the four original stories.
LEGACY_IDS = {
    "cendrillon": "cinderella",
    "kongjwi-patjwi": "kongjwi",
    "ye-xian": "yexian",
    "shakuntala": "shakuntala",
}
DEFAULT_DATE_CAVEAT = "earliest known record, not origin"
_UNCERTAIN_ATU = re.compile(r"verify|similar|commonly|also listed|predecessor", re.I)


def atu_family(atu_type: str | None) -> str | None:
    """Leading tale-type number: '510A' and '510 (similar)' -> '510'. Free text like 'predecessor of ...' -> None."""
    m = re.match(r"\s*(\d+)", atu_type or "")
    return m.group(1) if m else None


def _raw() -> dict:
    with open(DATA_DIR / "stories.json", encoding="utf-8") as f:
        return json.load(f)


def _thompson_names() -> dict:
    try:
        with open(DATA_DIR / "thompson_names.json", encoding="utf-8") as f:
            return json.load(f).get("names", {})
    except OSError:
        return {}


def _sort_years() -> dict:
    try:
        with open(DATA_DIR / "sort_years.json", encoding="utf-8") as f:
            return json.load(f).get("years", {})
    except OSError:
        return {}


def _is_draft(text: str) -> bool:
    return text.startswith(("DRAFT", "NEEDS SOURCE")) or "NEEDS SOURCE" in text


def _build() -> tuple[dict, list[Motif], list[StoryDetail]]:
    raw = _raw()
    meta = raw["meta"]
    names = _thompson_names()
    years = _sort_years()
    n_stories = len(raw["stories"])
    df = {}
    for s in raw["stories"]:
        for mid in set(s["motifs"]):
            df[mid] = df.get(mid, 0) + 1
    motifs = [
        Motif(
            id=m["id"], label=m["label"], thompsonIds=m["thompsonIds"],
            thompson=[ThompsonRef(id=t, name=names.get(t)) for t in m["thompsonIds"]],
            thompsonNote=m.get("thompsonNote", ""), thompsonVerified=bool(m.get("thompsonVerified", False)),
            storyCount=df.get(m["id"], 0), share=df.get(m["id"], 0) / n_stories,
        )
        for m in raw["motifs"]
    ]
    stories = []
    for s in raw["stories"]:
        entries = [
            MotifEntry(
                story=s["id"], motif=e["motif"], howItAppears=e["howItAppears"],
                evidence=Source(**e["evidence"]) if e.get("evidence") else None,
                verified=bool(e.get("verified", False)), draft=_is_draft(e["howItAppears"]),
            )
            for e in s["motifEntries"]
        ]
        atu = s.get("atuType")
        stories.append(StoryDetail(
            id=s["id"], title=s["title"], region=s["region"], culturalTradition=s["tradition"],
            lat=s["lat"], lon=s["lon"], coordsNote=meta["coordsNote"],
            atuType=atu, atuFamily=atu_family(atu), atuUncertain=bool(atu and _UNCERTAIN_ATU.search(atu)),
            atuNote=s.get("atuNote"),
            earliestRecordedDate=s.get("earliestRecordedDate"), sortYear=years.get(s["id"]), dateSource=s.get("dateSource"),
            dateCaveat=s.get("dateCaveat", DEFAULT_DATE_CAVEAT), form=s.get("form"),
            summary=s["summary"], summarySources=[Source(**x) for x in s.get("sources", [])],
            motifs=s["motifs"], motifEntries=entries, sensitivity=s.get("sensitivity"),
            verifyBeforeUse=s.get("verifyBeforeUse", []), verified=bool(s.get("verified", False)),
            legacyId=LEGACY_IDS.get(s["id"]),
        ))
    return meta, motifs, stories


@lru_cache(maxsize=None)
def _cached():
    return _build()


def meta() -> dict:
    return _cached()[0]


def motifs() -> list[Motif]:
    return _cached()[1]


def stories() -> list[StoryDetail]:
    return _cached()[2]


def story_summaries() -> list[StorySummary]:
    fields = StorySummary.model_fields
    return [StorySummary(**s.model_dump(include=set(fields))) for s in stories()]


def get_story(story_id: str) -> StoryDetail | None:
    return next((s for s in stories() if s.id == story_id), None)


def get_motif(motif_id: str) -> Motif | None:
    return next((m for m in motifs() if m.id == motif_id), None)


def validate() -> list[str]:
    """Referential-integrity problems in the catalog (empty list = consistent)."""
    problems = []
    motif_ids = [m.id for m in motifs()]
    story_ids = [s.id for s in stories()]
    for label, ids in (("motif", motif_ids), ("story", story_ids)):
        dupes = {i for i in ids if ids.count(i) > 1}
        if dupes:
            problems.append(f"duplicate {label} ids: {sorted(dupes)}")
    for s in stories():
        entry_motifs = [e.motif for e in s.motifEntries]
        if sorted(entry_motifs) != sorted(s.motifs):
            problems.append(f"{s.id}: motifs and motifEntries differ")
        unknown = set(s.motifs) - set(motif_ids)
        if unknown:
            problems.append(f"{s.id}: unknown motifs {sorted(unknown)}")
        if not (-90 <= s.lat <= 90 and -180 <= s.lon <= 180):
            problems.append(f"{s.id}: coordinates out of range")
        if s.id not in _sort_years():
            problems.append(f"{s.id}: no entry in data/sort_years.json")
        if s.verified or any(e.verified for e in s.motifEntries):
            problems.append(f"{s.id}: marked verified; nothing has been human-checked yet")
    return problems


def differences() -> dict[str, str]:
    try:
        with open(DATA_DIR / "differences.json", encoding="utf-8") as f:
            return json.load(f).get("differences", {})
    except OSError:
        return {}


def difference_key(a: str, b: str, motif: str) -> str:
    x, y = sorted((a, b))
    return f"{x}|{y}|{motif}"
