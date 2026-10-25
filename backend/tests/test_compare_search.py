import re

from fastapi.testclient import TestClient

from app import catalog
from app.main import app

client = TestClient(app)
LOST = "lost-object-recognition"
# Words that would assert shared origin or transmission between tales.
BANNED = re.compile(r"borrow|influenc|originat|derived from|spread|transmit|adapted from|descend", re.I)


def compare(a, b, motif=LOST):
    return client.get("/api/compare", params={"a": a, "b": b, "motif": motif})


def search(q, **params):
    r = client.get("/api/search", params={"q": q, "tiers": "curated", **params})
    assert r.status_code == 200, r.text
    return r.json()


# ---- /api/compare ---------------------------------------------------------------------------
def test_compare_assembles_from_stored_entries():
    c = compare("yexian", "cinderella").json()
    stored = {s.id: s for s in catalog.stories()}
    assert c["a"]["id"] == "yexian" and c["b"]["id"] == "cinderella"
    assert c["inA"]["howItAppears"] == next(e for e in stored["yexian"].motifEntries if e.motif == LOST).howItAppears
    assert c["inB"]["howItAppears"] == next(e for e in stored["cinderella"].motifEntries if e.motif == LOST).howItAppears
    assert c["inA"]["evidence"]["url"].startswith("http")
    assert c["connectionType"] == "cinderella-parallel"
    assert set(c["sharedMotifs"]) == {
        "unjust-treatment", "supernatural-assistance", LOST, "transformation", "reversal-of-fortune"
    }
    assert "similarity" in c["caveats"]


def test_compare_is_order_symmetric_in_content():
    ab, ba = compare("yexian", "cinderella").json(), compare("cinderella", "yexian").json()
    assert ab["connectionType"] == ba["connectionType"] and ab["sharedMotifs"] == ba["sharedMotifs"]
    assert ab["inA"] == ba["inB"] and ab["difference"] == ba["difference"]


def test_shakuntala_pairs_are_thematic_never_cinderella():
    for other in ("cinderella", "yexian", "kongjwi", "tam-cam", "rhodopis"):
        assert compare("shakuntala", other).json()["connectionType"] == "thematic-parallel"


def test_rhodopis_and_one_hand_girl_pair_as_thematic_with_cinderella():
    assert compare("cinderella", "rhodopis").json()["connectionType"] == "thematic-parallel"
    c = compare("cinderella", "one-hand-girl", "unjust-treatment").json()
    assert c["connectionType"] == "thematic-parallel"


def test_unconfirmed_type_is_flagged():
    assert compare("cinderella", "yexian").json()["typeConfirmed"] is False  # Ye Xian's 510A is unconfirmed
    assert compare("cinderella", "kongjwi").json()["typeConfirmed"] is False
    assert compare("cinderella", "tam-cam").json()["typeConfirmed"] is False
    assert compare("cinderella", "rhodopis").json()["typeConfirmed"] is True  # no uncertain type on either side


def test_vasilisa_shares_motifs_but_is_a_different_type():
    c = compare("cinderella", "vasilisa", "supernatural-assistance").json()
    assert c["connectionType"] == "thematic-parallel"
    assert "unjust-treatment" in c["sharedMotifs"]


def test_difference_is_a_marked_draft_or_absent():
    d = compare("cinderella", "yexian").json()["difference"]
    assert d["draft"] is True and d["verified"] is False and "stored howItAppears" in d["basis"]
    other = compare("cinderella", "yexian", "unjust-treatment").json()["difference"]
    assert other and other["draft"] is True  # every pair with two sourced entries has a line


def test_no_difference_for_entries_that_rest_on_wikipedia_only():
    c = compare("cinderella", "kongjwi").json()
    assert c["inB"]["draft"] is True and c["difference"] is None


def test_compare_errors():
    assert compare("yexian", "yexian").status_code == 400
    assert compare("yexian", "nope").status_code == 404
    assert compare("yexian", "cinderella", "nope").status_code == 404
    assert compare("yexian", "cinderella", "trickster").status_code == 400  # neither story has it
    assert compare("shakuntala", "cinderella", "unjust-treatment").status_code == 400


def test_every_pair_sharing_a_motif_can_be_compared():
    stories = catalog.stories()
    count = 0
    for i, a in enumerate(stories):
        for b in stories[i + 1:]:
            for m in set(a.motifs) & set(b.motifs):
                r = compare(a.id, b.id, m)
                assert r.status_code == 200, (a.id, b.id, m)
                count += 1
    assert count > 100


# ---- draft difference lines -----------------------------------------------------------------
def test_difference_lines_reference_real_pairs_and_avoid_transmission_language():
    stories = {s.id: s for s in catalog.stories()}
    assert catalog.differences()
    for key, text in catalog.differences().items():
        a, b, motif = key.split("|")
        assert a < b and a in stories and b in stories and motif in stories[a].motifs and motif in stories[b].motifs
        assert not BANNED.search(text), key
        entries = [e for s in (a, b) for e in stories[s].motifEntries if e.motif == motif]
        assert not any("NEEDS SOURCE" in e.howItAppears for e in entries), key


# ---- /api/search ----------------------------------------------------------------------------
def story_ids(result):
    return [h["story"]["id"] for h in result["stories"]]


def test_search_finds_by_title_and_frontend_name():
    assert story_ids(search("cendrillon"))[0] == "cinderella"
    assert story_ids(search("Cinderella"))[0] == "cinderella"
    assert story_ids(search("perrault"))[0] == "cinderella"
    assert story_ids(search("ye xian"))[0] == "yexian"
    assert story_ids(search("fisherman jinni"))[0] == "fisherman-and-the-jinni"


def test_search_is_accent_and_case_insensitive():
    assert story_ids(search("KALIDASA")) == story_ids(search("kālidāsa")) != []
    assert "shakuntala" in story_ids(search("Kalidasa"))


def test_search_by_region_and_tale_type():
    assert story_ids(search("vietnam")) == ["tam-cam"]
    assert story_ids(search("inuit"))[0] == "sedna"
    assert set(story_ids(search("510A"))) >= {"cinderella", "yexian", "tam-cam"}
    assert "vasilisa" not in story_ids(search("510A"))


def test_search_returns_motifs_too():
    r = search("slipper")  # matches the Thompson label "Slipper Test" on lost-object-recognition
    assert r["motifs"][0]["motif"]["id"] == LOST
    assert search("trickster")["motifs"][0]["motif"]["id"] == "trickster"


def test_search_only_returns_curated_stories_and_respects_limit():
    curated = {s.id for s in catalog.stories()}
    r = search("the", limit=3)
    assert len(r["stories"]) <= 3 and set(story_ids(r)) <= curated


def test_search_no_match_and_blank_query():
    assert search("zzzzqqqq") == {"query": "zzzzqqqq", "stories": [], "motifs": [], "library": []}
    assert search("   ")["stories"] == []
    assert client.get("/api/search").status_code == 422
    assert client.get("/api/search", params={"q": "x" * 101}).status_code == 422


def test_search_all_tokens_must_match():
    assert story_ids(search("anansi inuit")) == []
    assert story_ids(search("sedna inuit"))[0] == "sedna"
