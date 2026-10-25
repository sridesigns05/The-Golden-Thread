"""Response models for the curated catalog (data/stories.json).

Field names follow the handoff schema. The raw file keeps its drafting names (`tradition`,
`sources`); catalog.py maps them. Nothing here is verified content: `verified` stays False
until a human has checked the entry against its source.
"""
from typing import Annotated, Literal

from pydantic import BaseModel, Field


class Source(BaseModel):
    title: str
    url: str


class ThompsonRef(BaseModel):
    id: str
    name: str | None  # label from the trilogy `tmi` table; None if the id is not in it


class Motif(BaseModel):
    id: str
    label: str
    thompsonIds: list[str]
    thompson: list[ThompsonRef]
    thompsonNote: str
    thompsonVerified: bool
    storyCount: int  # curated stories containing this motif (df)
    share: float  # storyCount / number of curated stories
    libraryCount: int = 0  # library tales linked to this motif at the tale-type level


class MotifEntry(BaseModel):
    story: str
    motif: str
    howItAppears: str
    evidence: Source | None = None  # never filled in from memory; stays None until sourced
    verified: bool = False
    draft: bool  # text is marked DRAFT / NEEDS SOURCE in the file


class StorySummary(BaseModel):
    """What the globe needs."""
    tier: Literal["curated"] = "curated"
    id: str
    title: str
    region: str
    culturalTradition: str
    lat: float
    lon: float
    coordsNote: str
    atuType: str | None
    atuFamily: str | None  # leading number of atuType ("510A" -> "510"); drives connectionType
    atuUncertain: bool  # atuType text itself says "verify", "similar", "also listed", ...
    earliestRecordedDate: str | None
    sortYear: int | None  # rough ordering aid only (see data/sort_years.json); never display it
    dateCaveat: str  # always present: the date is the earliest record, not the origin
    summary: str
    motifs: list[str]
    verified: bool
    legacyId: str | None  # id used by the frontend's current mock data


class StoryDetail(StorySummary):
    atuNote: str | None
    dateSource: str | None
    form: str | None
    summarySources: list[Source]
    motifEntries: list[MotifEntry]
    sensitivity: str | None
    verifyBeforeUse: list[str]


class LibrarySummary(BaseModel):
    """A tale from the trilogy/Ashliman library. Metadata only: no text, no coordinates, no dates,
    so it can never be plotted on the globe."""
    tier: Literal["library"] = "library"
    id: str
    title: str
    provenance: str | None  # free text as given, e.g. "Germany (Jacob and Wilhelm Grimm)"
    placeGuess: str | None  # best-effort text before " (" or ","; sometimes an author, not a place
    atuType: str
    atuName: str | None
    atuFamily: str | None
    citation: str | None
    motifs: list[str]  # our motif ids, linked through the tale TYPE (see motifBasis)
    verified: bool = False


class LibraryStory(LibrarySummary):
    dataSource: str
    motifBasis: Literal["tale-type"] = "tale-type"
    thompsonMatches: dict[str, list[str]]  # motif id -> the Thompson ids listed for this tale type


class TypeBasis(BaseModel):
    """Why a library tale is linked to a motif. States the link is by tale type, not from the tale's text."""
    kind: Literal["tale-type"] = "tale-type"
    motif: str
    atuType: str
    atuName: str | None
    thompson: list[ThompsonRef]
    text: str


class RankedLibrary(BaseModel):
    tale: LibrarySummary
    tier: Literal["library"] = "library"
    connectionType: str  # cinderella-parallel | same-tale-type | thematic-parallel
    sameExactType: bool  # same ATU code (510A with 510A), not just the same family
    sharedMotifs: list[str]
    score: float  # uses the curated stories' document frequencies
    weakLink: bool
    why: TypeBasis


class LibraryHit(BaseModel):
    tale: LibrarySummary
    score: int
    matchedFields: list[str]


class LibraryPage(BaseModel):
    total: int
    offset: int
    limit: int
    tales: list[LibrarySummary]


class RankedStory(BaseModel):
    """One related tale for the story being viewed. Carries what the globe and panel need."""
    story: StorySummary
    tier: str  # "curated" (a larger library tier is out of scope)
    connectionType: str  # cinderella-parallel | same-tale-type | thematic-parallel
    typeConfirmed: bool  # False if either story's ATU type is itself marked uncertain
    sharedMotifs: list[str]
    score: float
    weakLink: bool  # shares only the clicked (generic) motif
    why: MotifEntry  # how the clicked motif appears in THIS story (stored text, nothing generated)
    whyViewed: MotifEntry  # same, in the story being viewed


class RankedGroup(BaseModel):
    total: int  # all curated matches in this group; `results` is capped
    results: list[RankedStory]
    # Library tales are listed separately and never displace curated results.
    libraryTotal: int = 0
    library: list[RankedLibrary] = []


class TimelineItem(BaseModel):
    id: str
    title: str
    region: str
    lat: float
    lon: float
    earliestRecordedDate: str | None
    sortYear: int | None
    dateCaveat: str
    form: str | None


class MotifView(BaseModel):
    motif: Motif
    totalStories: int
    generic: bool  # motif appears in more than GENERIC_SHARE of stories
    viewing: str | None
    sameType: RankedGroup | None
    differentType: RankedGroup | None
    fewMatches: bool  # only 1-2 other stories match: say so in the UI
    highlightIds: list[str]  # curated story ids to light up on the globe (displayed results)
    timeline: list[TimelineItem]  # every curated story with this motif, earliest record first
    caveats: dict


class StoryHit(BaseModel):
    story: StorySummary
    score: int
    matchedFields: list[str]


class MotifHit(BaseModel):
    motif: Motif
    score: int
    matchedFields: list[str]


class SearchResult(BaseModel):
    query: str
    stories: list[StoryHit]
    motifs: list[MotifHit]
    library: list[LibraryHit] = []  # separate list; curated stories are always in `stories`


class Difference(BaseModel):
    text: str
    draft: bool = True
    verified: bool = False
    basis: str  # what the line was written from


class Comparison(BaseModel):
    a: Annotated[StorySummary | LibrarySummary, Field(discriminator="tier")]
    b: Annotated[StorySummary | LibrarySummary, Field(discriminator="tier")]
    motif: Motif
    connectionType: str  # cinderella-parallel | same-tale-type | thematic-parallel
    typeConfirmed: bool  # False if either story's ATU type is itself marked uncertain
    sharedMotifs: list[str]  # every motif the two stories share, not just the clicked one
    inA: MotifEntry | TypeBasis  # TypeBasis for a library tale: linked by tale type, not from its text
    inB: MotifEntry | TypeBasis
    difference: Difference | None  # None when no draft line exists, an entry needs a source, or a side is a library tale
    caveats: dict
