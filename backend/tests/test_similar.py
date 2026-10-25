"""Real motifs and similar tales on a myth card: type-level facts from the trilogy data, hedged."""
import pytest
from fastapi.testclient import TestClient

from app import evidence, library, myth_card, similar
from app.main import app

client = TestClient(app)


def lib_tale(code="510A"):
    return next(t for t in library.tales() if t.atuType == code)


def test_library_tale_shows_the_motifs_its_tale_type_lists():
    r = similar.for_tale(lib_tale("510A").id)["typeMotifs"]
    ids = {m["id"] for m in r["motifs"]}
    assert "H36.1" in ids and any(m["name"] == "Slipper Test" for m in r["motifs"])
    assert r["basis"] == "tale-type" and "not this particular telling" in r["note"]
    assert r["shown"] <= similar.type_motifs("510A")["total"]


def test_most_library_tales_get_real_motifs():
    types = similar._types()
    covered = sum(1 for t in library.tales() if t.atuType.upper() in types and types[t.atuType.upper()]["motifs"])
    assert covered / len(library.tales()) > 0.9


def test_same_type_siblings_exclude_the_tale_and_are_capped():
    tale = lib_tale("510A")
    s = similar.for_tale(tale.id)["similar"]
    assert tale.id not in {t["id"] for t in s["sameType"]}
    assert 0 < len(s["sameType"]) <= similar.SIBLING_CAP <= s["sameTypeTotal"]
    assert all(t["atuType"] == "510A" and t["tier"] == "library" for t in s["sameType"])


def test_atlas_stories_of_the_same_type_are_listed_and_unconfirmed_ones_flagged():
    atlas = {a["id"]: a for a in similar.for_tale(lib_tale("510A").id)["similar"]["atlas"]}
    assert atlas["cinderella"]["typeConfirmed"] is True
    assert atlas["kongjwi"]["typeConfirmed"] is False and "unconfirmed" in atlas["kongjwi"]["reason"]


def test_motif_only_links_are_called_thematic():
    atlas = similar.for_tale(lib_tale("510A").id)["similar"]["atlas"]
    thematic = [a for a in atlas if "Shares the motif" in a["reason"]]
    assert all("not the same tale type" in a["reason"] for a in thematic)


def test_nearby_types_come_with_example_tales():
    nearby = similar.for_tale(lib_tale("510A").id)["similar"]["nearbyTypes"]
    assert nearby and len(nearby) <= similar.NEARBY_CAP
    for n in nearby:
        assert n["atuType"] != "510A" and n["examples"] and n["why"]


def test_curated_story_with_confirmed_type_shows_motifs_and_library_siblings():
    r = similar.for_tale("cinderella")
    assert r["typeMotifs"] and r["similar"]["sameType"]
    assert "yexian" in {a["id"] for a in r["similar"]["atlas"]}


def test_curated_story_with_unconfirmed_type_hides_the_motif_list():
    r = similar.for_tale("kongjwi")
    assert r["typeMotifs"] is None and r["similar"]["nearbyTypes"] == []
    assert "unconfirmed" in r["similar"]["typeNote"]
    assert r["similar"]["sameType"]  # tales of the same type family are still offered


def test_story_without_a_tale_type_has_only_atlas_links():
    r = similar.for_tale("sedna")
    assert r["typeMotifs"] is None and r["similar"]["sameType"] == [] and r["similar"]["atlas"]


def test_unknown_id():
    assert similar.for_tale("nope") == {"typeMotifs": None, "similar": None}


def test_no_coordinates_or_tale_text_in_similar_results():
    blob = str(similar.for_tale(lib_tale("510A").id))
    for forbidden in ("'lat'", "'lon'", "'text'", "fullText"):
        assert forbidden not in blob


@pytest.fixture
def isolated(tmp_path, monkeypatch):
    monkeypatch.setattr(myth_card, "CACHE_PATH", tmp_path / "myth_cache.json")
    monkeypatch.setattr(myth_card, "_memo", {})
    monkeypatch.setattr(evidence, "CACHE_PATH", tmp_path / "evidence_cache.json")
    monkeypatch.setattr(evidence, "_memo", {})
    monkeypatch.setenv("MYTH_CARD_MODE", "cache")


def test_card_endpoint_includes_motifs_and_similar(isolated):
    r = client.get("/api/myth-card", params={"id": lib_tale("510A").id}).json()
    assert r["typeMotifs"]["motifs"] and r["similar"]["sameType"] and r["similar"]["atlas"]
    assert r["record"]["tier"] == "library" and "lat" not in r["record"]
