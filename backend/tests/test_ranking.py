import math

import pytest
from fastapi.testclient import TestClient

from app import catalog, ranking
from app.main import app
from app.models import MotifEntry, StoryDetail

client = TestClient(app)
LOST = "lost-object-recognition"


def view(story, motif, **params):
    params = {"library": "false", **params}  # curated ranking is checked on its own here
    r = client.get(f"/api/motifs/{motif}", params={"story": story, **params})
    assert r.status_code == 200, r.text
    return r.json()


def ids(group):
    return [r["story"]["id"] for r in group["results"]]


# ---- acceptance test from the handoff -------------------------------------------------------
def test_acceptance_cinderella_lost_object():
    v = view("cinderella", LOST)
    same, thematic = ids(v["sameType"]), ids(v["differentType"])
    assert {"yexian", "kongjwi"} <= set(same)
    assert set(same) == {"yexian", "kongjwi", "tam-cam"}  # the stories sharing the 510 family
    assert thematic == ["rhodopis", "shakuntala"]  # thematic parallels; the single-motif link is last
    assert {r["connectionType"] for r in v["sameType"]["results"]} == {"cinderella-parallel"}
    assert {r["connectionType"] for r in v["differentType"]["results"]} == {"thematic-parallel"}


def test_shakuntala_never_in_a_same_type_group():
    for s in catalog.stories():
        for m in s.motifs:
            v = view(s.id, m)
            assert "shakuntala" not in ids(v["sameType"])


def test_rhodopis_and_one_hand_girl_are_never_cinderella_type():
    for s in catalog.stories():
        for m in s.motifs:
            v = view(s.id, m)
            assert not {"rhodopis", "one-hand-girl"} & set(ids(v["sameType"]))


def test_strict_mode_drops_single_motif_links():
    v = view("cinderella", LOST, strict="true")
    assert ids(v["differentType"]) == ["rhodopis"]  # Shakuntala shares only the generic motif
    assert set(ids(v["sameType"])) == {"yexian", "kongjwi", "tam-cam"}


def test_weak_link_flag_and_uncertain_type():
    v = view("cinderella", LOST)
    shak = next(r for r in v["differentType"]["results"] if r["story"]["id"] == "shakuntala")
    assert shak["weakLink"] and shak["sharedMotifs"] == [LOST]
    rho = next(r for r in v["differentType"]["results"] if r["story"]["id"] == "rhodopis")
    assert not rho["weakLink"] and set(rho["sharedMotifs"]) == {LOST, "reversal-of-fortune"}
    by = {r["story"]["id"]: r for r in v["sameType"]["results"]}
    assert by["yexian"]["typeConfirmed"] is False  # its 510A is not confirmed in an opened source
    assert not by["kongjwi"]["typeConfirmed"] and not by["tam-cam"]["typeConfirmed"]


def test_why_text_is_stored_text_only():
    v = view("cinderella", LOST)
    ye = next(r for r in v["sameType"]["results"] if r["story"]["id"] == "yexian")
    stored = catalog.get_story("yexian").motifEntries
    assert ye["why"]["howItAppears"] == next(e for e in stored if e.motif == LOST).howItAppears
    assert ye["why"]["evidence"]["url"].startswith("http")


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
    v = client.get("/api/motifs/trickster").json()
    assert [t["id"] for t in v["timeline"]] == ["fisherman-and-the-jinni", "popol-vuh-twins", "anansi"]
    assert v["sameType"] is None and v["viewing"] is None
    assert all(t["dateCaveat"] and "lat" in t for t in v["timeline"])
    assert "similarity" in v["caveats"]


def test_timeline_puts_undated_last():
    t = client.get(f"/api/motifs/{LOST}").json()["timeline"]
    assert [x["id"] for x in t] == ["rhodopis", "shakuntala", "yexian", "cinderella", "tam-cam", "kongjwi"]
    assert t[-1]["sortYear"] is None


def test_idf_scoring_prefers_rarer_shared_motifs():
    n = len(catalog.stories())
    df = ranking.doc_frequencies(catalog.stories())
    v = view("cinderella", LOST, all="true")
    ye = next(r for r in v["sameType"]["results"] if r["story"]["id"] == "yexian")
    expected = sum(math.log(n / df[m]) for m in ye["sharedMotifs"])
    assert ye["score"] == pytest.approx(expected)
    assert set(ye["sharedMotifs"]) == {
        "unjust-treatment", "supernatural-assistance", LOST, "transformation", "reversal-of-fortune"
    }


def test_error_cases():
    assert client.get("/api/motifs/nope").status_code == 404
    assert client.get("/api/motifs/trickster", params={"story": "nope"}).status_code == 404
    assert client.get("/api/motifs/trickster", params={"story": "yexian"}).status_code == 400


def test_few_matches_flag():
    assert view("anansi", "trickster")["fewMatches"] is True  # only two other tales share it
    assert view("shakuntala", "memory-and-forgetting")["fewMatches"] is True  # nothing else does
    assert view("cinderella", LOST)["fewMatches"] is False


# ---- rules on a small synthetic set ---------------------------------------------------------
def fake(id, region, motifs, atu=None, year=None):
    entries = [MotifEntry(story=id, motif=m, howItAppears=f"{id} {m}", draft=False) for m in motifs]
    return StoryDetail(
        id=id, title=id, originalTitle=None, kind="test", region=region, culturalTradition="t", lat=0.0, lon=0.0, coordsNote="c",
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


# ---- the lens: at most two stories per motif, and the game stays winnable ---------------------------

def test_lens_map_offers_at_most_two_stories_per_motif():
    lm = ranking.lens_map(catalog.stories())
    assert all(len(ids) <= ranking.LENS_LIMIT == 2 for per in lm.values() for ids in per.values())
    assert sum(1 for per in lm.values() for ids in per.values() if len(ids) == 2) > 10


def test_lens_picks_share_the_clicked_motif_and_keep_the_best_match():
    stories = catalog.stories()
    by_id = {s.id: s for s in stories}
    lm = ranking.lens_map(stories)
    for sid, per in lm.items():
        for motif, ids in per.items():
            assert sid not in ids and len(set(ids)) == len(ids)
            assert all(motif in by_id[i].motifs for i in ids)
            full = ranking.related_map(stories)[sid][motif]
            assert ids == [] if not full else ids[0] == full[0]  # the best-ranked story is always kept


def test_every_story_can_still_be_reached_from_every_other():
    lm = ranking.lens_map(catalog.stories())
    adj = {sid: {o for ids in per.values() for o in ids} for sid, per in lm.items()}
    for start in adj:
        seen, queue = {start}, [start]
        while queue:
            for n in adj[queue.pop(0)]:
                if n not in seen:
                    seen.add(n)
                    queue.append(n)
        assert seen == set(adj), f"from {start} unreachable: {set(adj) - seen}"


def test_lens_map_is_deterministic():
    assert ranking.lens_map(catalog.stories()) == ranking.lens_map(catalog.stories())


def test_lens_only_covers_the_motifs_the_storybook_offers():
    stories = catalog.stories()
    lm = ranking.lens_map(stories)
    for s in stories:
        assert list(lm[s.id]) == s.motifs[: ranking.LENS_MOTIFS], s.id
