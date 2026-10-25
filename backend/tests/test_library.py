import json

from fastapi.testclient import TestClient

from app import catalog, library
from app.data import DATA_DIR
from app.main import app

client = TestClient(app)
LOST = "lost-object-recognition"
FORBIDDEN = {"text", "lat", "lon", "latitude", "longitude", "earliestRecordedDate"}


def get(path, **params):
    r = client.get(path, params=params)
    assert r.status_code == 200, r.text
    return r.json()


def keys_anywhere(obj, found=None):
    found = set() if found is None else found
    if isinstance(obj, dict):
        found |= set(obj)
        for v in obj.values():
            keys_anywhere(v, found)
    elif isinstance(obj, list):
        for v in obj:
            keys_anywhere(v, found)
    return found


# ---- data file ------------------------------------------------------------------------------
def test_library_file_is_consistent_and_metadata_only():
    assert library.validate() == []
    raw = json.load(open(DATA_DIR / "library.json", encoding="utf-8"))
    assert len(raw["tales"]) == 1517 == len(library.tales())
    assert not (FORBIDDEN & keys_anywhere(raw["tales"]))
    assert all(t["verified"] is False and t["motifBasis"] == "tale-type" for t in raw["tales"])
    assert "Ashliman" in raw["_attribution"] and "BY-NC-SA" in raw["_license"]


def test_perrault_duplicate_is_dropped_not_listed_twice():
    assert not any("Little Glass Slipper" in t.title for t in library.tales())
    dropped = json.load(open(DATA_DIR / "library.json", encoding="utf-8"))["droppedAsDuplicates"]
    assert dropped == [{"title": "Cinderella; or, The Little Glass Slipper", "atuType": "510A", "duplicateOf": "cinderella"}]
    links = json.load(open(DATA_DIR / "library_links.json", encoding="utf-8"))["links"]
    assert set(links.values()) <= {s.id for s in catalog.stories()}


def test_library_motifs_come_from_resolved_thompson_ids_only():
    thompson = {m.id: set(m.thompsonIds) for m in catalog.motifs()}
    for t in library.tales():
        for m in t.motifs:
            assert thompson[m], f"{t.id} linked to a motif with no Thompson ids"
            assert set(t.thompsonMatches[m]) <= thompson[m]
    for m in ("trickster", "transformation", "death-and-rebirth", "unusual-birth", "theft-of-fire-or-light"):
        assert library.motif_counts().get(m, 0) == 0


# ---- the globe stays curated-only -----------------------------------------------------------
def test_stories_endpoint_is_curated_only():
    stories = get("/api/stories")
    assert len(stories) == 15 and all(s["tier"] == "curated" for s in stories)
    assert not any(s["id"].startswith("lib-") for s in stories)
    assert get("/api/stories/yexian")["tier"] == "curated"
    assert client.get("/api/stories/lib-510a-ashey-pelt").status_code == 404


def test_motif_view_timeline_and_highlights_exclude_library():
    curated = {s.id for s in catalog.stories()}
    v = get(f"/api/motifs/{LOST}", story="cinderella", all="true")
    assert set(v["highlightIds"]) <= curated and {t["id"] for t in v["timeline"]} <= curated
    for g in (v["sameType"], v["differentType"]):
        for r in g["library"]:
            assert r["tier"] == "library" and not (FORBIDDEN & keys_anywhere(r["tale"]))
    assert not (keys_anywhere(v["sameType"]["library"]) & {"lat", "lon"})


# ---- curated results are untouched ----------------------------------------------------------
def test_library_never_changes_or_displaces_curated_results():
    for story, motif in (("cinderella", LOST), ("cinderella", "supernatural-assistance"), ("vasilisa", "supernatural-assistance")):
        on = get(f"/api/motifs/{motif}", story=story)
        off = get(f"/api/motifs/{motif}", story=story, library="false")
        for g in ("sameType", "differentType"):
            assert on[g]["results"] == off[g]["results"] and on[g]["total"] == off[g]["total"]
            assert off[g]["library"] == [] and off[g]["libraryTotal"] == 0
        assert on["highlightIds"] == off["highlightIds"]


def test_acceptance_still_holds_with_library_on():
    v = get(f"/api/motifs/{LOST}", story="cinderella")
    assert [r["story"]["id"] for r in v["sameType"]["results"]][:3] and {
        r["story"]["id"] for r in v["sameType"]["results"]
    } == {"yexian", "kongjwi", "tam-cam"}
    assert [r["story"]["id"] for r in v["differentType"]["results"]] == ["rhodopis", "shakuntala"]
    assert v["differentType"]["libraryTotal"] == 0  # thematic links never pull in Cinderella variants


def test_library_lists_are_capped_with_see_all():
    v = get(f"/api/motifs/{LOST}", story="cinderella")
    same = v["sameType"]
    assert len(same["library"]) == 5 and same["libraryTotal"] == 20  # 510A tales minus the Perrault duplicate
    full = get(f"/api/motifs/{LOST}", story="cinderella", all="true")["sameType"]
    assert len(full["library"]) == 20 == full["libraryTotal"]


def test_library_results_are_labelled_type_level_and_classified_by_rule():
    v = get(f"/api/motifs/{LOST}", story="cinderella")
    for r in v["sameType"]["library"]:
        assert r["connectionType"] == "cinderella-parallel" and r["sameExactType"] is True
        assert r["why"]["kind"] == "tale-type" and "type level" in r["why"]["text"]
        assert "H36.1" in r["why"]["text"] and r["weakLink"] is False
    v2 = get("/api/motifs/supernatural-assistance", story="vasilisa")
    assert {r["connectionType"] for r in v2["sameType"]["library"]} == {"same-tale-type"}  # ATU 480 family, not 510
    assert {r["connectionType"] for r in v2["differentType"]["library"]} == {"thematic-parallel"}


def test_library_motif_view_without_viewer_and_counts():
    counts = {m["id"]: m["libraryCount"] for m in get("/api/motifs")}
    assert counts[LOST] == 20 and counts["trickster"] == 0
    v = get("/api/motifs/trickster")
    assert v["sameType"] is None and v["motif"]["libraryCount"] == 0
    assert client.get("/api/motifs/theft-of-fire-or-light").status_code == 404  # no story in the set uses it


def test_library_tale_cannot_be_the_viewed_story():
    assert client.get(f"/api/motifs/{LOST}", params={"story": "lib-510a-ashey-pelt"}).status_code == 400


# ---- search ---------------------------------------------------------------------------------
def test_search_includes_library_in_a_separate_list():
    r = get("/api/search", q="grimm")
    assert r["stories"] == [] and any(h["tale"]["title"] == "Cinderella (Grimm)" for h in r["library"])
    r = get("/api/search", q="cinderella")
    assert r["stories"][0]["story"]["id"] == "cinderella"
    assert not any("Little Glass Slipper" in h["tale"]["title"] for h in r["library"])
    assert all(h["tale"]["tier"] == "library" for h in r["library"])


def test_search_tiers_param():
    assert get("/api/search", q="cinderella", tiers="curated")["library"] == []
    only_lib = get("/api/search", q="cinderella", tiers="library")
    assert only_lib["stories"] == [] and only_lib["motifs"] == [] and only_lib["library"]
    assert client.get("/api/search", params={"q": "x", "tiers": "everything"}).status_code == 400
    assert client.get("/api/search", params={"q": "x", "tiers": ""}).status_code == 400


def test_search_library_respects_limit_and_matches_by_type():
    assert len(get("/api/search", q="cinderella", limit=3)["library"]) <= 3
    r = get("/api/search", q="510A", limit=50)
    assert {h["tale"]["atuType"] for h in r["library"]} == {"510A"}


# ---- /api/library ---------------------------------------------------------------------------
def test_library_browse_filter_and_paging():
    page = get("/api/library", limit=5)
    assert page["total"] == 1517 and len(page["tales"]) == 5
    assert get("/api/library", limit=5, offset=5)["tales"] != page["tales"]
    a = get("/api/library", atu="510A", limit=100)
    assert a["total"] == 20 and {t["atuType"] for t in a["tales"]} == {"510A"}
    fam = get("/api/library", atu="510", limit=100)
    assert fam["total"] == sum(1 for t in library.tales() if t.atuFamily == "510") > a["total"]
    q = get("/api/library", q="grimm", limit=100)
    assert 0 < q["total"] < 1517
    # word-prefix match over title, ATU name, provenance and citation (so "Grimmelshausen" counts too)
    assert all(
        "grimm" in " ".join(filter(None, [t["title"], t["atuName"], t["provenance"], t["citation"]])).lower()
        for t in q["tales"]
    )
    assert get("/api/library", q="zzzzqqqq")["total"] == 0


def test_library_detail_and_404():
    d = get("/api/library/lib-510a-ashey-pelt")
    assert d["tier"] == "library" and d["motifBasis"] == "tale-type" and d["thompsonMatches"]["lost-object-recognition"] == ["H36.1"]
    assert not (FORBIDDEN & set(d))
    assert client.get("/api/library/nope").status_code == 404
    assert client.get("/api/library", params={"limit": 101}).status_code == 422


# ---- compare --------------------------------------------------------------------------------
def test_compare_curated_with_library_tale():
    c = get("/api/compare", a="cinderella", b="lib-510a-ashey-pelt", motif=LOST)
    assert c["a"]["tier"] == "curated" and c["b"]["tier"] == "library"
    assert c["connectionType"] == "cinderella-parallel" and c["difference"] is None
    assert c["inA"]["howItAppears"] and c["inB"]["kind"] == "tale-type" and "type level" in c["inB"]["text"]
    assert set(c["sharedMotifs"]) == {LOST, "unjust-treatment"}
    assert "similarity" in c["caveats"]


def test_compare_library_with_shakuntala_is_thematic_and_symmetric():
    c = get("/api/compare", a="shakuntala", b="lib-510a-ashey-pelt", motif=LOST)
    assert c["connectionType"] == "thematic-parallel"
    r = get("/api/compare", a="lib-510a-ashey-pelt", b="shakuntala", motif=LOST)
    assert r["a"]["tier"] == "library" and r["connectionType"] == "thematic-parallel"


def test_compare_two_library_tales_and_errors():
    c = get("/api/compare", a="lib-510a-ashey-pelt", b="lib-510a-cinderella-grimm", motif=LOST)
    assert c["connectionType"] == "cinderella-parallel" and c["difference"] is None
    assert client.get("/api/compare", params={"a": "lib-510a-ashey-pelt", "b": "yexian", "motif": "trickster"}).status_code == 400
    assert client.get("/api/compare", params={"a": "lib-510a-ashey-pelt", "b": "lib-nope", "motif": LOST}).status_code == 404
    # a library tale linked to a different motif only is rejected for a motif it lacks
    other = next(t for t in library.tales() if t.motifs and LOST not in t.motifs)
    assert client.get("/api/compare", params={"a": "yexian", "b": other.id, "motif": LOST}).status_code == 400


def test_curated_compare_is_unchanged():
    c = get("/api/compare", a="yexian", b="cinderella", motif=LOST)
    assert c["a"]["tier"] == "curated" and c["b"]["tier"] == "curated" and c["difference"]["draft"] is True


# ---- meta -----------------------------------------------------------------------------------
def test_meta_carries_library_attribution_and_limits():
    m = get("/api/meta")["library"]
    assert m["taleCount"] == 1517 and m["linkedToMotifs"] == 95
    assert "Ashliman" in m["attribution"] and "BY-NC-SA" in m["license"]
    assert any("never plotted" in s for s in m["limitations"])
    assert "dateRule" in get("/api/meta")  # curated meta still present
