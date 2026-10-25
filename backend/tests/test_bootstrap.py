import json
import sys
from pathlib import Path

from fastapi.testclient import TestClient

from app import catalog
from app.main import app

client = TestClient(app)
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))


def test_bootstrap_contents():
    r = client.get("/api/bootstrap")
    assert r.status_code == 200
    b = r.json()
    assert len(b["stories"]) == 15 and len(b["motifs"]) == 11
    assert {s["id"] for s in b["stories"]} == {s.id for s in catalog.stories()}
    assert b["library"]["taleCount"] == 1517 and "Ashliman" in b["library"]["attribution"]
    assert "similarityRule" in b["meta"] and "dateRule" in b["meta"]
    for m in b["motifs"]:
        assert m["name"] and m["description"] and m["significance"]
    for s in b["stories"]:
        assert s["kind"] and s["originalTitle"] and s["summary"] and s["dateCaveat"]


def test_bootstrap_comparisons_cover_every_shared_motif_once():
    b = client.get("/api/bootstrap").json()
    stories = {s["id"]: s for s in b["stories"]}
    expected = set()
    ids = [s["id"] for s in b["stories"]]
    for i, a in enumerate(ids):
        for c in ids[i + 1:]:
            for m in set(stories[a]["motifs"]) & set(stories[c]["motifs"]):
                expected.add((a, c, m))
    got = [(c["a"], c["b"], c["motif"]) for c in b["comparisons"]]
    assert len(got) == len(set(got)) == len(expected) and set(got) == expected
    for c in b["comparisons"]:
        assert c["a"] != c["b"] and c["motif"] in c["sharedMotifs"]
    # same rule as /api/compare
    one = next(c for c in b["comparisons"] if (c["a"], c["b"], c["motif"]) == ("cinderella", "yexian", "lost-object-recognition"))
    live = client.get("/api/compare", params={"a": "cinderella", "b": "yexian", "motif": "lost-object-recognition"}).json()
    assert one["connectionType"] == live["connectionType"] and one["difference"] == live["difference"]


def test_bootstrap_related_matches_ranking_endpoint():
    b = client.get("/api/bootstrap").json()
    assert set(b["related"]) == {s["id"] for s in b["stories"]}
    for s in b["stories"]:
        assert set(b["related"][s["id"]]) == set(s["motifs"][:3])  # the book offers the first three motifs
    r = client.get("/api/motifs/lost-object-recognition", params={"story": "cinderella", "all": "true", "library": "false"}).json()
    expected = [x["story"]["id"] for g in ("sameType", "differentType") for x in r[g]["results"]]
    shown = b["related"]["cinderella"]["lost-object-recognition"]
    # the globe lights up at most two stories per motif: the best match, plus one chosen to keep every story reachable
    assert len(shown) <= 2 and shown[0] == expected[0] and set(shown) <= set(expected)


def test_bootstrap_is_small_enough_to_load_at_startup():
    assert len(client.get("/api/bootstrap").content) < 400 * 1024


def test_frontend_snapshot_is_current():
    from export_snapshot import SNAPSHOT_PATH, snapshot_text

    assert SNAPSHOT_PATH.exists(), "run: python scripts/export_snapshot.py"
    assert json.loads(SNAPSHOT_PATH.read_text(encoding="utf-8")) == json.loads(snapshot_text()), (
        "src/data/bootstrap.snapshot.json is out of date: run python scripts/export_snapshot.py"
    )
