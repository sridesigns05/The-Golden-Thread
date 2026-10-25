from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_stories_has_four():
    r = client.get("/api/legacy/stories")
    assert r.status_code == 200
    assert {s["id"] for s in r.json()} == {"cinderella", "kongjwi", "yexian", "shakuntala"}


def test_comparison_order_insensitive():
    a = client.get("/api/legacy/comparison", params={"a": "cinderella", "b": "yexian", "motif": "lost-object-recognition"})
    b = client.get("/api/legacy/comparison", params={"a": "yexian", "b": "cinderella", "motif": "lost-object-recognition"})
    assert a.status_code == 200 and a.json() == b.json()


def test_shakuntala_is_thematic_only():
    for s in ("cinderella", "kongjwi", "yexian"):
        r = client.get("/api/legacy/comparison", params={"a": s, "b": "shakuntala", "motif": "lost-object-recognition"})
        assert r.json()["classification"] == "thematic-parallel"
    r = client.get("/api/legacy/comparison", params={"a": "cinderella", "b": "shakuntala", "motif": "unjust-treatment"})
    assert r.status_code == 404


def test_unknown_ids_404():
    assert client.get("/api/legacy/comparison", params={"a": "x", "b": "yexian", "motif": "lost-object-recognition"}).status_code == 404


def test_cors_for_vite():
    r = client.get("/api/legacy/stories", headers={"Origin": "http://localhost:3000"})
    assert r.headers["access-control-allow-origin"] == "http://localhost:3000"


def test_fifteen_comparisons_with_expected_coverage():
    from app import data

    comps = data.comparisons()
    assert len(comps) == 15
    keys = {(frozenset((c["storyAId"], c["storyBId"])), c["sharedMotif"]) for c in comps}
    assert len(keys) == 15
    cinderella_type = ["cinderella", "kongjwi", "yexian"]
    shared = ["unjust-treatment", "supernatural-assistance", "lost-object-recognition", "reversal-of-fortune"]
    for i, a in enumerate(cinderella_type):
        for b in cinderella_type[i + 1:]:
            for m in shared:
                assert (frozenset((a, b)), m) in keys
        assert (frozenset((a, "shakuntala")), "lost-object-recognition") in keys
    for c in comps:
        thematic = "shakuntala" in (c["storyAId"], c["storyBId"])
        assert c["classification"] == ("thematic-parallel" if thematic else "cinderella-parallel")
        assert c["verification"] == "unverified"


def test_guess_options_one_correct_two_decoys():
    from app import data

    by_id = {s["id"]: s for s in data.stories()}
    for s in by_id.values():
        g = s["guessOptions"]
        assert g["correct"] in s["motifs"]
        assert len(g["decoys"]) == 2 and not set(g["decoys"]) & set(s["motifs"])
        assert any(g["correct"] in o["motifs"] for sid, o in by_id.items() if sid != s["id"])
