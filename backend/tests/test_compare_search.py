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
    r = client.get("/api/search", params={"q": q, **params})
    assert r.status_code == 200, r.text
    return r.json()


# ---- /api/compare ---------------------------------------------------------------------------
def test_compare_assembles_from_stored_entries():
    c = compare("ye-xian", "cendrillon").json()
    stored = {s.id: s for s in catalog.stories()}
    assert c["a"]["id"] == "ye-xian" and c["b"]["id"] == "cendrillon"
    assert c["inA"]["howItAppears"] == next(e for e in stored["ye-xian"].motifEntries if e.motif == LOST).howItAppears
    assert c["inB"]["howItAppears"] == next(e for e in stored["cendrillon"].motifEntries if e.motif == LOST).howItAppears
    assert c["connectionType"] == "cinderella-parallel" and c["typeConfirmed"] is True
    assert set(c["sharedMotifs"]) == {"unjust-treatment", "supernatural-assistance", LOST, "reversal-of-fortune"}
    assert "similarity" in c["caveats"]


def test_compare_is_order_symmetric_in_content():
    ab, ba = compare("ye-xian", "cendrillon").json(), compare("cendrillon", "ye-xian").json()
    assert ab["connectionType"] == ba["connectionType"] and ab["sharedMotifs"] == ba["sharedMotifs"]
    assert ab["inA"] == ba["inB"] and ab["difference"] == ba["difference"]


def test_shakuntala_pairs_are_thematic_never_cinderella():
    for other in ("cendrillon", "ye-xian", "kongjwi-patjwi", "tam-cam"):
        c = compare("shakuntala", other).json()
        assert c["connectionType"] == "thematic-parallel"


def test_unconfirmed_type_is_flagged():
    assert compare("cendrillon", "kongjwi-patjwi").json()["typeConfirmed"] is False
    assert compare("cendrillon", "tam-cam").json()["typeConfirmed"] is False


def test_vasilisa_shares_motifs_but_is_a_different_type():
    c = compare("cendrillon", "vasilisa", "supernatural-assistance").json()
    assert c["connectionType"] == "thematic-parallel"
    assert "unjust-treatment" in c["sharedMotifs"]


def test_difference_is_a_marked_draft_or_absent():
    d = compare("cendrillon", "ye-xian").json()["difference"]
    assert d["draft"] is True and d["verified"] is False and "stored howItAppears" in d["basis"]
    assert compare("cendrillon", "ye-xian", "unjust-treatment").json()["difference"] is None  # no line drafted


def test_no_difference_when_an_entry_needs_a_source():
    c = compare("cendrillon", "kongjwi-patjwi").json()
    assert c["inB"]["draft"] is True and c["difference"] is None


def test_compare_errors():
    assert compare("ye-xian", "ye-xian").status_code == 400
    assert compare("ye-xian", "nope").status_code == 404
    assert compare("ye-xian", "cendrillon", "nope").status_code == 404
    assert compare("ye-xian", "cendrillon", "trickster").status_code == 400  # neither story has it
    assert compare("shakuntala", "cendrillon", "unjust-treatment").status_code == 400


def test_every_pair_sharing_a_motif_can_be_compared():
    stories = catalog.stories()
    count = 0
    for i, a in enumerate(stories):
        for b in stories[i + 1:]:
            for m in set(a.motifs) & set(b.motifs):
                r = compare(a.id, b.id, m)
                assert r.status_code == 200, (a.id, b.id, m)
                count += 1
    assert count > 50


# ---- draft difference lines -----------------------------------------------------------------
def test_difference_lines_reference_real_pairs_and_avoid_transmission_language():
    stories = {s.id: s for s in catalog.stories()}
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
    assert story_ids(search("cendrillon"))[0] == "cendrillon"
    assert story_ids(search("Cinderella"))[0] == "cendrillon"  # frontend id; source titles also mention it
    assert story_ids(search("ye xian"))[0] == "ye-xian"
    assert story_ids(search("ye-xian"))[0] == "ye-xian"


def test_search_is_accent_and_case_insensitive():
    assert story_ids(search("KALIDASA")) == story_ids(search("kālidāsa")) != []
    assert "shakuntala" in story_ids(search("Kalidasa"))


def test_search_by_region_and_tale_type():
    assert "tam-cam" in story_ids(search("vietnam"))
    assert set(story_ids(search("510A"))) >= {"ye-xian", "cendrillon", "tam-cam"}
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
    assert story_ids(search("raven maori")) == []
    assert story_ids(search("raven light"))[0] == "raven-light"
