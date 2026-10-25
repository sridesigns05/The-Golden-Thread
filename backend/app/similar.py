"""Real motifs and similar tales for a myth card, from the datasets the backend already holds.

Everything here is a statement about TALE TYPES in the Aarne-Thompson-Uther index, as the trilogy repo
records them, never about a single tale's text:

  - `type_motifs`: the Thompson motifs the index lists for the tale's type (data/atu_motifs.json).
  - `similar`: other library tales of the same type, atlas stories linked to the tale by its type or
    through the atlas motifs, and nearby tale types (types that list similar motifs, or sit next to it in
    the same part of the index).

"Similar" means "same or neighbouring tale type". It is not evidence that one tale came from another.
Atlas stories whose tale type is marked unconfirmed in the atlas are flagged, not hidden.
"""
import json
import re
from functools import lru_cache

from . import catalog, data, library, ranking

SIBLING_CAP = 6
ATLAS_CAP = 5
NEARBY_CAP = 3
EXAMPLES_PER_TYPE = 2


@lru_cache(maxsize=1)
def _types() -> dict:
    try:
        with open(data.DATA_DIR / "atu_motifs.json", encoding="utf-8") as f:
            return json.load(f).get("types", {})
    except (OSError, ValueError):
        return {}


def _number(code: str) -> int:
    m = re.match(r"\d+", code)
    return int(m.group(0)) if m else 0


def type_motifs(code: str | None) -> dict | None:
    info = _types().get(code or "")
    if not info:
        return None
    return {
        "atuType": code,
        "total": info["total"],
        "shown": len(info["motifs"]),
        "motifs": info["motifs"],
        "basis": "tale-type",
        "note": "Motifs the ATU index lists for this tale type. They describe the type, not this particular telling.",
    }


def _tale_entry(t) -> dict:
    return {"id": t.id, "title": t.title, "place": t.placeGuess or t.provenance, "tier": "library", "atuType": t.atuType}


def _diverse(tales: list, cap: int) -> list:
    """Round-robin over provenance so a type with ten Grimm versions also shows the other places."""
    buckets: dict[str, list] = {}
    for t in tales:
        buckets.setdefault((t.placeGuess or t.provenance or "").lower(), []).append(t)
    out: list = []
    while len(out) < cap and any(buckets.values()):
        for key in list(buckets):
            if buckets[key] and len(out) < cap:
                out.append(buckets[key].pop(0))
    return out


def _atlas_entry(s, reason: str, confirmed: bool) -> dict:
    return {
        "id": s.id, "title": s.title, "place": s.region, "tier": "curated",
        "reason": reason, "typeConfirmed": confirmed,
    }


def _motif_name(motif_id: str) -> str:
    m = catalog.get_motif(motif_id)
    return m.name if m else motif_id


def _nearby_types(code: str | None, lib: list, exclude_id: str) -> list[dict]:
    """Types that list similar motifs first, then the closest types in the same part of the ATU index."""
    types = _types()
    info = types.get(code or "")
    if not info:
        return []
    by_type: dict[str, list] = {}
    for t in lib:
        by_type.setdefault(t.atuType.upper(), []).append(t)

    candidates: list[tuple[str, str, list[dict]]] = []  # (type, why, shared motifs)
    for r in info.get("related", []):
        candidates.append((r["atuType"], "lists similar motifs", r["shared"]))
    seen = {c[0] for c in candidates}
    same_group = [
        c for c, v in types.items() if v.get("group") and v["group"] == info.get("group") and c != code and c not in seen
    ]
    same_group.sort(key=lambda c: (abs(_number(c) - _number(code or "")), c))
    for c in same_group:
        candidates.append((c, f"nearby in the ATU index ({info['group']})", []))

    out = []
    for c, why, shared in candidates:
        tales = [t for t in by_type.get(c, []) if t.id != exclude_id]
        if not tales:
            continue
        out.append({
            "atuType": c,
            "atuName": tales[0].atuName,
            "why": why,
            "sharedMotifs": shared,
            "examples": [_tale_entry(t) for t in _diverse(tales, EXAMPLES_PER_TYPE)],
        })
        if len(out) >= NEARBY_CAP:
            break
    return out


def for_tale(tale_id: str) -> dict:
    """{'typeMotifs': ... | None, 'similar': {...}} for a curated story or a library tale."""
    lib = library.tales()
    stories = catalog.stories()

    tale = library.get(tale_id)
    if tale is not None:
        code = tale.atuType.upper()
        siblings = [t for t in lib if t.id != tale.id and t.atuType.upper() == code]
        atlas: list[dict] = []
        for s in stories:
            if s.atuFamily and s.atuFamily == tale.atuFamily:
                atlas.append(_atlas_entry(
                    s, f"Listed under tale type {tale.atuFamily}" + ("; the atlas marks that type as unconfirmed" if s.atuUncertain else ""),
                    not s.atuUncertain,
                ))
        have = {a["id"] for a in atlas}
        for s in stories:
            shared = [m for m in tale.motifs if m in s.motifs]
            if s.id not in have and shared:
                atlas.append(_atlas_entry(s, f"Shares the motif {_motif_name(shared[0])} through the tale type; a broader thematic parallel, not the same tale type", True))
        return {
            "typeMotifs": type_motifs(code),
            "similar": {
                "basis": "Same or neighbouring tale type; not evidence of borrowing.",
                "sameTypeTotal": len(siblings),
                "sameType": [_tale_entry(t) for t in _diverse(siblings, SIBLING_CAP)],
                "atlas": atlas[:ATLAS_CAP],
                "nearbyTypes": _nearby_types(code, lib, tale.id),
            },
        }

    story = catalog.get_story(tale_id)
    if story is None:
        return {"typeMotifs": None, "similar": None}
    code = ranking.atu_code(story.atuType)
    confirmed_type = bool(code) and not story.atuUncertain
    siblings = [t for t in lib if t.atuFamily == story.atuFamily] if story.atuFamily else []
    siblings.sort(key=lambda t: (t.atuType.upper() != code, t.title))
    related_ids: list[str] = []
    for ids in ranking.related_map(stories).get(story.id, {}).values():
        for i in ids:
            if i not in related_ids:
                related_ids.append(i)
    by_id = {s.id: s for s in stories}
    atlas = []
    for i in related_ids[:ATLAS_CAP]:
        other = by_id[i]
        shared = [m for m in story.motifs if m in other.motifs]
        atlas.append(_atlas_entry(other, f"Shares the motif {_motif_name(shared[0])}" if shared else "Shares a motif", True))
    return {
        "typeMotifs": type_motifs(code) if confirmed_type else None,
        "similar": {
            "basis": "Same or neighbouring tale type, or a shared atlas motif; not evidence of borrowing.",
            "sameTypeTotal": len(siblings),
            "sameType": [_tale_entry(t) for t in _diverse(siblings, SIBLING_CAP)],
            "atlas": atlas,
            "nearbyTypes": _nearby_types(code, lib, story.id) if confirmed_type else [],
            "typeNote": None if confirmed_type or not story.atuFamily else
                "The atlas lists this story's tale type as unconfirmed, so tales of the same type family are shown without its motif list.",
        },
    }
