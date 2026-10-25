from fastapi.testclient import TestClient

from app import catalog
from app.main import app

client = TestClient(app)

EXPECTED_IDS = {
    "ye-xian", "cendrillon", "kongjwi-patjwi", "tam-cam", "vasilisa", "shakuntala", "cupid-psyche",
    "two-brothers", "prometheus", "raven-light", "maui-fire", "popol-vuh-twins", "anansi-stories",
    "aladdin", "taketori",
}


def test_catalog_is_consistent():
    assert catalog.validate() == []


def test_fifteen_stories_and_eleven_motifs():
    assert {s.id for s in catalog.stories()} == EXPECTED_IDS
    assert len(catalog.motifs()) == 11


def test_nothing_is_marked_verified_or_sourced_from_memory():
    assert all(not s.verified for s in catalog.stories())
    assert all(not m.thompsonVerified for m in catalog.motifs())
    assert all(e.evidence is None and not e.verified for s in catalog.stories() for e in s.motifEntries)


def test_thompson_ids_resolved_against_tmi():
    refs = [t for m in catalog.motifs() for t in m.thompson]
    assert refs and all(t.name for t in refs), [t.id for t in refs if not t.name]
    assert {t.id: t.name for t in refs}["H36.1"] == "Slipper Test"


def test_draft_flags_from_file_markers():
    kongjwi = catalog.get_story("kongjwi-patjwi")
    flagged = {e.motif for e in kongjwi.motifEntries if e.draft}
    assert flagged == {"lost-object-recognition", "impossible-tasks"}
    assert not any(e.draft for e in catalog.get_story("ye-xian").motifEntries)


def test_atu_family_for_connection_type_rule():
    fam = {s.id: s.atuFamily for s in catalog.stories()}
    assert fam["cendrillon"] == fam["ye-xian"] == fam["kongjwi-patjwi"] == fam["tam-cam"] == "510"
    assert fam["vasilisa"] == "480" and fam["cupid-psyche"] == "425" and fam["aladdin"] == "561"
    assert fam["shakuntala"] is None and fam["two-brothers"] is None and fam["raven-light"] is None
    unc = {s.id: s.atuUncertain for s in catalog.stories()}
    assert unc["kongjwi-patjwi"] and unc["tam-cam"] and not unc["ye-xian"] and not unc["cendrillon"]


def test_every_story_carries_a_date_caveat_and_coords_note():
    for s in client.get("/api/stories").json():
        assert s["dateCaveat"] and s["coordsNote"]


def test_endpoints():
    r = client.get("/api/stories")
    assert r.status_code == 200 and len(r.json()) == 15
    assert "motifEntries" not in r.json()[0]  # globe list is the light shape
    d = client.get("/api/stories/ye-xian").json()
    assert d["culturalTradition"] and d["summarySources"] and len(d["motifEntries"]) == 4
    assert d["legacyId"] == "yexian"
    assert client.get("/api/stories/nope").status_code == 404
    assert len(client.get("/api/motifs").json()) == 11
    assert "dateRule" in client.get("/api/meta").json()


def test_legacy_ids_map_the_original_four_only():
    mapped = {s.id: s.legacyId for s in catalog.stories() if s.legacyId}
    assert mapped == {"cendrillon": "cinderella", "kongjwi-patjwi": "kongjwi", "ye-xian": "yexian", "shakuntala": "shakuntala"}
