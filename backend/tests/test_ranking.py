import math

import pytest
from fastapi.testclient import TestClient

from app import catalog, ranking
from app.main import app
from app.models import MotifEntry, StoryDetail

client = TestClient(app)
LOST = "lost-object-recognition"


def view(story, motif, **params):
    r = client.get(f"/api/motifs/{motif}", params={"story": story, **params})
    assert r.status_code == 200, r.text
    return r.json()


def ids(group):
    return [r["story"]["id"] for r in group["results"]]


# ---- acceptance test from the handoff -------------------------------------------------------
def test_acceptance_cendrillon_lost_object():
    v = view("cendrillon", LOST)
    same, thematic = ids(v["sameType"]), ids(v["differentType"])
    assert {"ye-xian", "kongjwi-patjwi"} <= set(same)
    assert set(same) == {"ye-xian", "kongjwi-patjwi", "tam-cam"}  # all 510/510A stories
    assert thematic == ["shakuntala"]  # alone, as a thematic parallel
    assert {r["connectionType"] for r in v["sameType"]["results"]} == {"cinderella-parallel"}
    assert v["differentType"]["results"][0]["connectionType"] == "thematic-parallel"


def test_shakuntala_never_in_a_same_type_group():
    for s in catalog.stories():
        for m in s.motifs:
            v = view(s.id, m)
            assert "shakuntala" not in ids(v["sameType"])


def test_strict_mode_drops_single_motif_links():
    v = view("cendrillon", LOST, strict="true")
    assert ids(v["differentType"]) == []  # Shakuntala shares only the generic motif
    assert set(ids(v["sameType"])) == {"ye-xian", "kongjwi-patjwi", "tam-cam"}


def test_weak_link_flag_and_uncertain_type():
    v = view("cendrillon", LOST)
    shak = v["differentType"]["results"][0]
    assert shak["weakLink"] and shak["sharedMotifs"] == [LOST]
    by = {r["story"]["id"]: r for r in v["sameType"]["results"]}
    assert not by["ye-xian"]["weakLink"]
    assert by["ye-xian"]["typeConfirmed"]
    assert not by["kongjwi-patjwi"]["typeConfirmed"] and not by["tam-cam"]["typeConfirmed"]


def test_why_text_is_stored_text_only():
    v = view("cendrillon", LOST)
    ye = next(r for r in v["sameType"]["results"] if r["story"]["id"] == "ye-xian")
    stored = catalog.get_story("ye-xian").motifEntries
    assert ye["why"]["howItAppears"] == next(e for e in stored if e.motif == LOST).howItAppears
    assert ye["whyViewed"]["draft"] is True  # Cendrillon's entries are marked DRAFT in the file


# ---- the 15 curated stories drive everything -----------------------------------------------
def test_results_are_curated_stories_with_coordinates():
    curated = {s.id for s in catalog.stories()}
    for s in catalog.stories():
        for m in s.motifs:
            v = view(s.id, m, all="true")
            assert set(v["highlightIds"]) <= curated and v["highlightIds"][0] == s.id
            for g in (v["sameType"], v["differentType"]):
                for r in g["results"]:
                    assert r["tier"] == "curated" and r["story"]["id"] in curated
                    assert r["story"]["lat"] is not None and r["story"]["dateCaveat"]
            assert {t["id"] for t in v["timeline"]} == {x.id for x in catalog.stories() if m in x.motifs}


def test_timeline_for_motif_without_viewer():
    v = client.get("/api/motifs/theft-of-fire-or-light").json()
    assert [t["id"] for t in v["timeline"]] == ["prometheus", "maui-fire", "raven-light"]
    assert v["sameType"] is None and v["viewing"] is None
    assert all(t["dateCaveat"] and "lat" in t for t in v["timeline"])
    assert "similarity" in v["caveats"]


def test_idf_scoring_prefers_rarer_shared_motifs():
    n = len(catalog.stories())
    df = ranking.doc_frequencies(catalog.stories())
    v = view("cendrillon", LOST, all="true")
    ye = next(r for r in v["sameType"]["results"] if r["story"]["id"] == "ye-xian")
    expected = sum(math.log(n / df[m]) for m in ye["sharedMotifs"])
    assert ye["score"] == pytest.approx(expected)
    assert set(ye["sharedMotifs"]) == {"unjust-treatment", "supernatural-assistance", LOST, "reversal-of-fortune"}


def test_error_cases():
    assert client.get("/api/motifs/nope").status_code == 404
    assert client.get("/api/motifs/trickster", params={"story": "nope"}).status_code == 404
    assert client.get("/api/motifs/trickster", params={"story": "ye-xian"}).status_code == 400


def test_few_matches_flag():
    v = view("prometheus", "theft-of-fire-or-light")  # only Maui and Raven share it
    assert v["fewMatches"] is True
    assert view("cendrillon", LOST)["fewMatches"] is False


# ---- rules on a small synthetic set ---------------------------------------------------------
def fake(id, region, motifs, atu=None, year=None):
    entries = [MotifEntry(story=id, motif=m, howItAppears=f"{id} {m}", draft=False) for m in motifs]
    return StoryDetail(
        id=id, title=id, region=region, culturalTradition="t", lat=0.0, lon=0.0, coordsNote="c",
        atuType=atu, atuFamily=catalog.atu_family(atu), atuUncertain=False, earliestRecordedDate=None,
        sortYear=year, dateCaveat="c", summary="s", motifs=motifs, verified=False, legacyId=None,
        atuNote=None, dateSource=None, form=None, summarySources=[], motifEntries=entries,
        sensitivity=None, verifyBeforeUse=[],
    )


def test_region_leaders_first_then_fill_and_cap():
    x = fake("x", "R0", ["a", "b"], atu="510")
    pool = [x] + [
        fake("same-r1-best", "R1", ["a", "b"], "510", 1900),
        fake("same-r1-second", "R1", ["a", "b"], "510", 1800),
        fake("same-r2", "R2", ["a", "b"], "510", 1950),
    ] + [fake(f"pad{i}", "RX", ["c"]) for i in range(10)]
    same, _ = ranking.rank_related(x, "a", pool, cap=2)
    assert same.total == 3
    assert [r.story.id for r in same.results] == ["same-r1-second", "same-r2"]  # tie -> earliest; one per region first
    same_all, _ = ranking.rank_related(x, "a", pool, cap=None)
    assert [r.story.id for r in same_all.results] == ["same-r1-second", "same-r2", "same-r1-best"]


def test_tiebreak_by_date_with_undated_last():
    x = fake("x", "R0", ["a", "b"])
    pool = [
        x,
        fake("undated", "R1", ["a", "b"]),
        fake("late", "R2", ["a", "b"], year=1900),
        fake("early", "R3", ["a", "b"], year=-500),
    ]
    _, diff = ranking.rank_related(x, "a", pool)
    assert [r.story.id for r in diff.results] == ["early", "late", "undated"]


def test_non_510_same_family_is_not_called_cinderella():
    a, b = fake("a", "R0", ["m"], "425B"), fake("b", "R1", ["m"], "425A")
    assert ranking.connection_type(a, b) == "same-tale-type"
    assert ranking.connection_type(fake("c", "R", ["m"], "510A"), fake("d", "R2", ["m"], "510 (similar)")) == "cinderella-parallel"
    assert ranking.connection_type(fake("c", "R", ["m"]), fake("d", "R2", ["m"])) == "thematic-parallel"
