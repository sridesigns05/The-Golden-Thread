from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from . import catalog, data, evidence, library, myth_card, ranking, search as search_mod
from .models import (
    Bootstrap, Comparison, LibraryPage, LibraryStory, Motif, MotifView, SearchResult, StoryDetail, StorySummary,
)

app = FastAPI(title="The Golden Thread API")

# Vite dev server (her package.json uses port 3000; 5173 is Vite's default).
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"ok": True}


def build_bootstrap() -> Bootstrap:
    stories, motifs = catalog.stories(), catalog.motifs()
    meta = catalog.meta()
    return Bootstrap(
        meta=meta, library=library.meta_block(), motifs=library.with_counts(motifs), stories=stories,
        comparisons=ranking.all_comparisons(stories, motifs, meta, catalog.differences()),
        related=ranking.lens_map(stories),
    )


@app.get("/api/bootstrap", response_model=Bootstrap)
def get_bootstrap():
    """One call with all curated stories, motifs, comparisons and related-story rankings."""
    return build_bootstrap()


@app.get("/api/meta")
def get_meta():
    """Draft-status and caveat text the UI's limitations note can draw from, plus library attribution."""
    return {**catalog.meta(), "library": library.meta_block()}


@app.get("/api/stories", response_model=list[StorySummary])
def get_stories():
    return catalog.story_summaries()


@app.get("/api/stories/{story_id}", response_model=StoryDetail)
def get_story(story_id: str):
    story = catalog.get_story(story_id)
    if story is None:
        raise HTTPException(404, f"Unknown story id: {story_id}")
    return story


@app.get("/api/motifs", response_model=list[Motif])
def get_motifs():
    return library.with_counts(catalog.motifs())


@app.get("/api/motifs/{motif_id}", response_model=MotifView)
def get_motif(
    motif_id: str,
    story: str | None = Query(None, description="Story being viewed; enables ranked related tales"),
    strict: bool = Query(False, description="Drop (instead of flag) results linked only by a generic motif"),
    all: bool = Query(False, description="Return every match instead of the top few"),
    library_tier: bool = Query(True, alias="library", description="Include library tales (separate list, never plotted)"),
):
    motif = catalog.get_motif(motif_id)
    if motif is None:
        raise HTTPException(404, f"Unknown motif id: {motif_id}")
    viewing = None
    if story is not None:
        if library.get(story) is not None:
            raise HTTPException(400, "Library tales can't be the story being viewed; pick a curated story")
        viewing = catalog.get_story(story)
        if viewing is None:
            raise HTTPException(404, f"Unknown story id: {story}")
        if motif_id not in viewing.motifs:
            raise HTTPException(400, f"{story} does not have motif {motif_id}")
    return ranking.motif_view(
        library.with_counts([motif])[0], catalog.stories(), catalog.meta(), viewing, strict=strict,
        cap=None if all else ranking.RESULT_CAP,
        library=library.tales() if library_tier else None,
        library_cap=None if all else ranking.LIBRARY_CAP,
    )


@app.get("/api/search", response_model=SearchResult)
def search(
    q: str = Query(..., max_length=100),
    limit: int = Query(10, ge=1, le=50),
    tiers: str = Query("curated,library", description="Comma list of: curated, library"),
):
    """Searches the curated stories and motifs, and (by default) the metadata-only library tales.
    Curated stories are always in `stories`; library tales are always in the separate `library` list."""
    wanted = {t.strip() for t in tiers.split(",") if t.strip()}
    if not wanted or wanted - {"curated", "library"}:
        raise HTTPException(400, "tiers must be 'curated', 'library', or both")
    result = search_mod.search(
        q, catalog.stories() if "curated" in wanted else [], catalog.motifs() if "curated" in wanted else [], limit,
        library=library.tales() if "library" in wanted else None,
    )
    return result


@app.get("/api/library", response_model=LibraryPage)
def get_library(
    q: str | None = Query(None, max_length=100),
    atu: str | None = Query(None, description="ATU type or family, e.g. 510A or 510"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """Browse the metadata-only library tales. Never includes coordinates or tale text."""
    tales = library.tales()
    if q and q.strip():
        order = {h.tale.id: i for i, h in enumerate(search_mod.search_library(q, tales, None))}
        tales = sorted((t for t in tales if t.id in order), key=lambda t: order[t.id])
    else:
        tales = sorted(tales, key=lambda t: (t.title.lower(), t.id))
    if atu:
        code = atu.strip().upper()
        tales = [t for t in tales if t.atuType.upper() == code or t.atuFamily == code]
    page = tales[offset:offset + limit]
    return LibraryPage(total=len(tales), offset=offset, limit=limit, tales=[library.summary(t) for t in page])


@app.get("/api/library/{tale_id}", response_model=LibraryStory)
def get_library_tale(tale_id: str):
    tale = library.get(tale_id)
    if tale is None:
        raise HTTPException(404, f"Unknown library tale id: {tale_id}")
    return tale


@app.get("/api/compare", response_model=Comparison)
def compare(a: str = Query(...), b: str = Query(...), motif: str = Query(...)):
    """Compare two stories on a motif. Either side may be a library tale (id starting 'lib-'); its
    side then carries a tale-type basis instead of a stored entry, and there is no difference line."""
    if a == b:
        raise HTTPException(400, "Pick two different stories")
    side_a = catalog.get_story(a) or library.get(a)
    side_b = catalog.get_story(b) or library.get(b)
    for sid, st in ((a, side_a), (b, side_b)):
        if st is None:
            raise HTTPException(404, f"Unknown story id: {sid}")
    m = catalog.get_motif(motif)
    if m is None:
        raise HTTPException(404, f"Unknown motif id: {motif}")
    for st in (side_a, side_b):
        if motif not in st.motifs:
            raise HTTPException(400, f"{st.id} does not have motif {motif}")
    return ranking.compare(side_a, side_b, library.with_counts([m])[0], catalog.meta(), catalog.differences())


# --- Legacy: the frontend's current mock data (4 stories, pairwise comparisons). Retired once the
# --- catalog endpoints cover the same screens.
@app.get("/api/legacy/stories")
def get_legacy_stories():
    return data.stories()


@app.get("/api/legacy/motifs")
def get_legacy_motifs():
    return data.motifs()


@app.get("/api/legacy/comparison")
def get_legacy_comparison(a: str = Query(...), b: str = Query(...), motif: str = Query(...)):
    ids = data.story_ids()
    for sid in (a, b):
        if sid not in ids:
            raise HTTPException(404, f"Unknown story id: {sid}")
    if motif not in data.motifs():
        raise HTTPException(404, f"Unknown motif id: {motif}")
    entry = data.find_comparison(a, b, motif)
    if entry is None:
        raise HTTPException(404, f"No comparison for {a} / {b} on {motif}")
    return entry


@app.get("/api/evidence")
def get_evidence(a: str = Query(...), b: str = Query(...), motif: str = Query(...)):
    """Sources for a comparison: live SerpApi results for each of the two stories, filtered to an
    allowlist of reputable domains, falling back to the pre-fetched cache. Never errors on a network
    failure; `source` says whether the results are live, cached or absent."""
    if a == b:
        raise HTTPException(400, "Pick two different stories")
    story_a, story_b = catalog.get_story(a), catalog.get_story(b)
    for sid, st in ((a, story_a), (b, story_b)):
        if st is None:
            raise HTTPException(404, f"Unknown story id: {sid}")
    if catalog.get_motif(motif) is None:
        raise HTTPException(404, f"Unknown motif id: {motif}")
    for st in (story_a, story_b):
        if motif not in st.motifs:
            raise HTTPException(400, f"{st.id} does not have motif {motif}")
    return evidence.get_evidence(a, b, motif)


@app.get("/api/myth-card")
def get_myth_card(
    id: str = Query(..., description="Curated story id or library tale id"),
    refresh: bool = Query(False, description="Ignore the saved search results and summary"),
):
    """Dataset record + this tale's own source search + a short summary written from those sources.
    Never raises on a search or summary failure: the card comes back without them."""
    card = myth_card.get_card(id, refresh)
    if card is None:
        raise HTTPException(404, f"Unknown tale id: {id}")
    return card
