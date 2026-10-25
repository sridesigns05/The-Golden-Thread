"""Motif-click ranking over the curated catalog.

For the story being viewed (X) and a clicked motif M, every other curated story Y that has M is
scored by  sum over motifs shared by X and Y of log(N / df(motif))  (N = curated stories,
df = stories containing the motif), so rare shared motifs count for more than common ones.

Functions take the story/motif lists as arguments so they can be tested on small synthetic sets.
Only curated stories are ever returned; each carries lat/lon so the globe can highlight it.
"""
import math
import re

from . import library as library_mod
from .models import (
    Comparison, Difference, LibraryStory, Motif, MotifEntry, MotifView, RankedGroup, RankedLibrary, RankedStory,
    StoryDetail, StorySummary, TimelineItem,
)

GENERIC_SHARE = 0.15  # a motif in more than this share of stories is "generic"
RESULT_CAP = 6
LIBRARY_CAP = 5
CINDERELLA_FAMILY = "510"


def doc_frequencies(stories: list[StoryDetail]) -> dict[str, int]:
    df: dict[str, int] = {}
    for s in stories:
        for m in set(s.motifs):
            df[m] = df.get(m, 0) + 1
    return df


def connection_type(x: StoryDetail | LibraryStory, y: StoryDetail | LibraryStory) -> str:
    """Pair-level classification, by rule: same ATU family is a same-type parallel, else thematic."""
    if x.atuFamily is not None and x.atuFamily == y.atuFamily:
        return "cinderella-parallel" if x.atuFamily == CINDERELLA_FAMILY else "same-tale-type"
    return "thematic-parallel"


def atu_code(atu_type: str | None) -> str | None:
    """'510A' -> '510A'; '510 (similar)' -> '510'; free text like 'predecessor of ...' -> None."""
    m = re.match(r"\s*(\d+[A-Za-z]*\*?)", atu_type or "")
    return m.group(1).upper() if m else None


def same_exact_type(x: StoryDetail | LibraryStory, y: StoryDetail | LibraryStory) -> bool:
    code = atu_code(x.atuType)
    return code is not None and code == atu_code(y.atuType)


def _entry(story: StoryDetail, motif_id: str) -> MotifEntry:
    return next(e for e in story.motifEntries if e.motif == motif_id)


def _summary(s: StoryDetail) -> StorySummary:
    return StorySummary(**s.model_dump(include=set(StorySummary.model_fields)))


def _order_key(r: RankedStory):
    year = r.story.sortYear
    # strong links before weak, higher score first, curated first, then earliest record, then id
    return (r.weakLink, -r.score, 0, math.inf if year is None else year, r.story.id)


def _diversify(ordered: list[RankedStory]) -> list[RankedStory]:
    """Top result per region first, then the rest in rank order."""
    seen, leaders, rest = set(), [], []
    for r in ordered:
        if r.story.region not in seen:
            seen.add(r.story.region)
            leaders.append(r)
        else:
            rest.append(r)
    return leaders + rest


def _library_order_key(r: RankedLibrary):
    return (r.weakLink, -r.score, r.tale.title.lower(), r.tale.id)


def _diversify_library(ordered: list[RankedLibrary]) -> list[RankedLibrary]:
    """Top result per best-effort place first (tales with no place never share a bucket)."""
    seen, leaders, rest = set(), [], []
    for r in ordered:
        key = r.tale.placeGuess or f"?{r.tale.id}"
        if key not in seen:
            seen.add(key)
            leaders.append(r)
        else:
            rest.append(r)
    return leaders + rest


def rank_library(
    viewed: StoryDetail,
    motif_id: str,
    library_tales: list[LibraryStory],
    n_curated: int,
    df: dict[str, int],
    *,
    strict: bool,
    cap: int | None,
) -> tuple[tuple[int, list[RankedLibrary]], tuple[int, list[RankedLibrary]]]:
    """Library tales carrying the clicked motif (by tale type), scored with the curated df so the
    curated ranking is untouched. Returns ((total, capped) same-type, (total, capped) different-type)."""
    generic = df.get(motif_id, 0) / n_curated > GENERIC_SHARE
    viewed_motifs = set(viewed.motifs)
    ranked = []
    for t in library_tales:
        if motif_id not in t.motifs:
            continue
        shared = sorted(viewed_motifs & set(t.motifs))
        weak = generic and len(shared) < 2
        if weak and strict:
            continue
        ranked.append(RankedLibrary(
            tale=library_mod.summary(t), connectionType=connection_type(viewed, t),
            sameExactType=same_exact_type(viewed, t), sharedMotifs=shared,
            score=sum(math.log(n_curated / df[m]) for m in shared if m in df), weakLink=weak,
            why=library_mod.type_basis(t, motif_id),
        ))
    out = []
    for same in (True, False):
        members = sorted((r for r in ranked if (r.connectionType != "thematic-parallel") == same), key=_library_order_key)
        picked = _diversify_library(members)
        out.append((len(picked), picked if cap is None else picked[:cap]))
    return out[0], out[1]


def rank_related(
    viewed: StoryDetail,
    motif_id: str,
    stories: list[StoryDetail],
    *,
    strict: bool = False,
    cap: int | None = RESULT_CAP,
    library: list[LibraryStory] | None = None,
    library_cap: int | None = LIBRARY_CAP,
) -> tuple[RankedGroup, RankedGroup]:
    """Returns (same-type group, different-type group) of other stories sharing `motif_id`.

    Rule 1 (a generic motif needs a second shared motif) is applied as demote-and-flag by default:
    a story linked only by the generic clicked motif is kept, flagged `weakLink`, and sorted after
    the rest. `strict=True` drops such stories instead. With the 15 curated stories every motif is
    generic, so strict mode would remove Shakuntala from Cinderella's recognition results.
    """
    n = len(stories)
    df = doc_frequencies(stories)
    generic = df.get(motif_id, 0) / n > GENERIC_SHARE
    viewed_motifs = set(viewed.motifs)

    ranked: list[RankedStory] = []
    for y in stories:
        if y.id == viewed.id or motif_id not in y.motifs:
            continue
        shared = sorted(viewed_motifs & set(y.motifs))
        weak = generic and len(shared) < 2
        if weak and strict:
            continue
        ranked.append(RankedStory(
            story=_summary(y), tier="curated", connectionType=connection_type(viewed, y),
            typeConfirmed=not (viewed.atuUncertain or y.atuUncertain),
            sharedMotifs=shared, score=sum(math.log(n / df[m]) for m in shared), weakLink=weak,
            why=_entry(y, motif_id), whyViewed=_entry(viewed, motif_id),
        ))

    groups = []
    for same in (True, False):
        members = sorted(
            (r for r in ranked if (r.connectionType != "thematic-parallel") == same), key=_order_key
        )
        picked = _diversify(members)
        groups.append(RankedGroup(total=len(picked), results=picked if cap is None else picked[:cap]))
    if library:
        lib_same, lib_diff = rank_library(viewed, motif_id, library, n, df, strict=strict, cap=library_cap)
        for group, (total, shown) in zip(groups, (lib_same, lib_diff)):
            group.libraryTotal, group.library = total, shown
    return groups[0], groups[1]


def motif_view(
    motif: Motif,
    stories: list[StoryDetail],
    meta: dict,
    viewing: StoryDetail | None = None,
    *,
    strict: bool = False,
    cap: int | None = RESULT_CAP,
    library: list[LibraryStory] | None = None,
    library_cap: int | None = LIBRARY_CAP,
) -> MotifView:
    n = len(stories)
    with_motif = [s for s in stories if motif.id in s.motifs]
    timeline = sorted(
        (
            TimelineItem(
                id=s.id, title=s.title, region=s.region, lat=s.lat, lon=s.lon,
                earliestRecordedDate=s.earliestRecordedDate, sortYear=s.sortYear,
                dateCaveat=s.dateCaveat, form=s.form,
            )
            for s in with_motif
        ),
        key=lambda t: (math.inf if t.sortYear is None else t.sortYear, t.id),
    )
    same = different = None
    highlight = [t.id for t in timeline]
    if viewing is not None:
        same, different = rank_related(
            viewing, motif.id, stories, strict=strict, cap=cap, library=library, library_cap=library_cap
        )
        # Globe highlights are curated stories only; library tales have no coordinates.
        shown = [r.story.id for g in (same, different) for r in g.results]
        highlight = [viewing.id] + shown
    others = sum(g.total for g in (same, different) if g) if viewing else len(with_motif)
    return MotifView(
        motif=motif, totalStories=n, generic=len(with_motif) / n > GENERIC_SHARE,
        viewing=viewing.id if viewing else None, sameType=same, differentType=different,
        fewMatches=viewing is not None and others <= 2, highlightIds=highlight, timeline=timeline,
        caveats={k: meta[k] for k in ("coordsNote", "dateRule", "status") if k in meta}
        | {"similarity": "Shared motifs show similarity of story pattern. They are not evidence that one tale borrowed from or influenced another."},
    )


DIFFERENCE_BASIS = "Drafted only from the stored howItAppears text of both stories; unverified."


def _side(x: StoryDetail | LibraryStory, motif_id: str):
    """(summary, stored entry or type-level basis) for one side of a comparison."""
    if isinstance(x, LibraryStory):
        return library_mod.summary(x), library_mod.type_basis(x, motif_id)
    return _summary(x), _entry(x, motif_id)


def compare(
    a: StoryDetail | LibraryStory, b: StoryDetail | LibraryStory, motif: Motif, meta: dict, differences: dict[str, str]
) -> Comparison:
    """Assemble one comparison at request time. A library side carries a type-level basis instead of
    a stored 'how it appears' entry, and a pair involving a library tale never gets a difference line."""
    from .catalog import difference_key  # local import: catalog imports models, not ranking

    sum_a, in_a = _side(a, motif.id)
    sum_b, in_b = _side(b, motif.id)
    curated_pair = not isinstance(a, LibraryStory) and not isinstance(b, LibraryStory)
    text = differences.get(difference_key(a.id, b.id, motif.id)) if curated_pair else None
    needs_source = curated_pair and ("NEEDS SOURCE" in in_a.howItAppears or "NEEDS SOURCE" in in_b.howItAppears)
    return Comparison(
        a=sum_a, b=sum_b, motif=motif,
        connectionType=connection_type(a, b),
        typeConfirmed=not (getattr(a, "atuUncertain", False) or getattr(b, "atuUncertain", False)),
        sharedMotifs=sorted(set(a.motifs) & set(b.motifs)), inA=in_a, inB=in_b,
        difference=Difference(text=text, basis=DIFFERENCE_BASIS) if text and not needs_source else None,
        caveats={k: meta[k] for k in ("coordsNote", "dateRule", "status", "pairTypeRule") if k in meta}
        | {"similarity": "Shared motifs show similarity of story pattern. They are not evidence that one tale borrowed from or influenced another."},
    )
