from fastapi.testclient import TestClient

from app import catalog
from app.main import app

client = TestClient(app)

HER_IDS = {
    "cinderella", "kongjwi", "yexian", "shakuntala", "vasilisa", "anansi", "momotaro", "golden-crab",
    "urashima-taro", "sedna", "rhodopis", "one-hand-girl", "popol-vuh-twins",
}
# Replacements for the frontend's Mufaro and Baba Abdalla stories, which research showed were not
# documented traditional tales of the kind they were presented as.
REPLACEMENTS = {"tam-cam", "fisherman-and-the-jinni"}
EXPECTED_IDS = HER_IDS | REPLACEMENTS


def test_catalog_is_consistent():
    assert catalog.validate() == []


def test_fifteen_stories_and_eleven_motifs():
    assert {s.id for s in catalog.stories()} == EXPECTED_IDS
    assert len(catalog.motifs()) == 11
    used = {m for s in catalog.stories() for m in s.motifs}
    assert used == {m.id for m in catalog.motifs()}  # every motif in the vocabulary is used


def test_mufaro_and_baba_abdalla_are_gone():
    ids = {s.id for s in catalog.stories()}
    assert not ids & {"mufaro", "baba-abdalla", "cendrillon", "ye-xian", "kongjwi-patjwi"}


def test_nothing_is_marked_verified():
    assert all(not s.verified for s in catalog.stories())
    assert all(not m.thompsonVerified for m in catalog.motifs())
    assert all(not e.verified for s in catalog.stories() for e in s.motifEntries)


def test_every_motif_entry_names_its_source():
    for s in catalog.stories():
        for e in s.motifEntries:
            assert e.evidence and e.evidence.url.startswith("http"), (s.id, e.motif)
        assert s.summarySources, s.id


def test_thompson_ids_resolved_against_tmi():
    refs = [t for m in catalog.motifs() for t in m.thompson]
    assert refs and all(t.name for t in refs), [t.id for t in refs if not t.name]
    assert {t.id: t.name for t in refs}["H36.1"] == "Slipper Test"


def test_draft_flags_from_file_markers():
    draft = {s.id: {e.motif for e in s.motifEntries if e.draft} for s in catalog.stories()}
    assert draft["kongjwi"] == set(catalog.get_story("kongjwi").motifs)  # Wikipedia-only
    assert draft["tam-cam"] == set(catalog.get_story("tam-cam").motifs)  # Wikipedia/EBSCO summaries
    assert draft["cinderella"] == {"transformation", "reversal-of-fortune"}
    assert draft["yexian"] == {"lost-object-recognition", "reversal-of-fortune"}
    assert not draft["vasilisa"] and not draft["anansi"] and not draft["popol-vuh-twins"]


def test_atu_family_for_connection_type_rule():
    fam = {s.id: s.atuFamily for s in catalog.stories()}
    assert fam["cinderella"] == fam["yexian"] == fam["kongjwi"] == fam["tam-cam"] == "510"
    assert fam["vasilisa"] == "480" and fam["golden-crab"] == "425" and fam["one-hand-girl"] == "706"
    for sid in ("shakuntala", "anansi", "momotaro", "sedna", "rhodopis", "popol-vuh-twins"):
        assert fam[sid] is None, sid
    unc = {s.id: s.atuUncertain for s in catalog.stories()}
    assert unc["kongjwi"] and unc["tam-cam"] and unc["yexian"]  # 510A not confirmed in an opened source
    assert not unc["cinderella"]


def test_rhodopis_is_not_called_a_cinderella_type():
    assert catalog.get_story("rhodopis").atuType is None


def test_every_story_carries_a_date_caveat_and_coords_note():
    for s in client.get("/api/stories").json():
        assert s["dateCaveat"] and s["coordsNote"]
    assert "Placement unverified" in catalog.get_story("shakuntala").coordsNote
    assert "not verified" in catalog.get_story("golden-crab").coordsNote


def test_living_traditions_carry_a_sensitivity_note():
    for sid in ("anansi", "sedna", "popol-vuh-twins", "tam-cam", "momotaro"):
        assert catalog.get_story(sid).sensitivity, sid


def test_endpoints():
    r = client.get("/api/stories")
    assert r.status_code == 200 and len(r.json()) == 15
    assert "motifEntries" not in r.json()[0]  # globe list is the light shape
    d = client.get("/api/stories/yexian").json()
    assert d["culturalTradition"] and d["summarySources"] and len(d["motifEntries"]) == 5
    assert d["legacyId"] == "yexian"
    assert client.get("/api/stories/nope").status_code == 404
    assert len(client.get("/api/motifs").json()) == 11
    assert "dateRule" in client.get("/api/meta").json()


def test_legacy_id_matches_the_frontend_ids_only():
    mapped = {s.id for s in catalog.stories() if s.legacyId}
    assert mapped == HER_IDS
    assert all(s.legacyId == s.id for s in catalog.stories() if s.legacyId)
