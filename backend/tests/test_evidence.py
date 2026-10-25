import httpx
import pytest
from fastapi.testclient import TestClient

from app import data, evidence
from app.main import app

client = TestClient(app)
PARAMS = {"a": "cinderella", "b": "yexian", "motif": "lost-object-recognition"}
KEY = "sk-test-secret"


@pytest.fixture(autouse=True)
def isolated(tmp_path, monkeypatch):
    monkeypatch.setattr(evidence, "CACHE_PATH", tmp_path / "cache.json")
    monkeypatch.setattr(evidence, "_memo", {})
    monkeypatch.delenv("EVIDENCE_MODE", raising=False)
    monkeypatch.delenv("SERPAPI_KEY", raising=False)
    monkeypatch.delenv("SERPAPI_API_KEY", raising=False)


def entry(n=1):
    result = {"title": "T", "link": "https://a.edu/x", "snippet": "s", "domain": "a.edu"}
    return {"query": "q", "fetchedAt": "t", "results": [result] * n}


def test_allowlist():
    ok = [
        "https://www.britannica.com/topic/Cinderella-folktale",
        "https://www.pitt.edu/~dash/type0510a.html",
        "https://history.princeton.edu/x",
        "https://www.jstor.org/stable/1",
    ]
    bad = [
        "https://en.wikipedia.org/wiki/Cinderella",
        "https://www.pitt.edu/news/foo",
        "https://evil.com/britannica.com",
        "https://britannica.com.evil.com/x",
        "https://notbritannica.com/x",
        "ftp://x.edu/a",
    ]
    assert all(evidence.is_allowed(u) for u in ok)
    assert not any(evidence.is_allowed(u) for u in bad)


def test_filter_keeps_fields_and_drops_others():
    out = evidence.filter_results([
        {"title": "T", "link": "https://www.britannica.com/x", "snippet": "S"},
        {"title": "W", "link": "https://en.wikipedia.org/x", "snippet": "S"},
        {"title": "no link"},
    ])
    assert out == [
        {"title": "T", "link": "https://www.britannica.com/x", "snippet": "S", "domain": "britannica.com"}
    ]


def test_no_key_and_no_cache_returns_empty_not_error():
    r = client.get("/api/evidence", params=PARAMS)
    assert r.status_code == 200
    assert r.json()["source"] == "none" and r.json()["results"] == []


def test_live_success_is_cached_then_served_when_network_dies(monkeypatch):
    monkeypatch.setenv("SERPAPI_KEY", KEY)
    monkeypatch.setattr(evidence, "fetch_live", lambda *a: entry()["results"])
    assert client.get("/api/evidence", params=PARAMS).json()["source"] == "live"

    def boom(*a):
        raise RuntimeError("network error (ConnectError)")

    monkeypatch.setattr(evidence, "fetch_live", boom)
    evidence._memo.clear()
    r = client.get("/api/evidence", params=PARAMS)
    assert r.json()["source"] == "cache" and len(r.json()["results"]) == 1
    # pair order must not matter
    r = client.get("/api/evidence", params={"a": "yexian", "b": "cinderella", "motif": PARAMS["motif"]})
    assert r.json()["source"] == "cache"


def test_unexpected_exception_still_falls_back(monkeypatch):
    monkeypatch.setenv("SERPAPI_KEY", KEY)
    evidence.save_cache({"version": 1, "entries": {evidence.cache_key(*PARAMS.values()): entry()}})
    monkeypatch.setattr(evidence, "fetch_live", lambda *a: 1 / 0)
    assert client.get("/api/evidence", params=PARAMS).json()["source"] == "cache"


def test_empty_live_result_does_not_mask_cache(monkeypatch):
    monkeypatch.setenv("SERPAPI_KEY", KEY)
    evidence.save_cache({"version": 1, "entries": {evidence.cache_key(*PARAMS.values()): entry()}})
    monkeypatch.setattr(evidence, "fetch_live", lambda *a: [])
    r = client.get("/api/evidence", params=PARAMS).json()
    assert r["source"] == "cache" and r["results"]


def test_cache_mode_never_calls_serpapi(monkeypatch):
    monkeypatch.setenv("SERPAPI_KEY", KEY)
    monkeypatch.setenv("EVIDENCE_MODE", "cache")
    monkeypatch.setattr(evidence, "fetch_live", lambda *a: pytest.fail("called live"))
    assert client.get("/api/evidence", params=PARAMS).status_code == 200


def test_http_failures_do_not_leak_key(monkeypatch):
    def fail(*a, **kw):
        raise httpx.ConnectError(f"failed for https://serpapi.com/search?api_key={KEY}")

    monkeypatch.setattr(httpx, "get", fail)
    with pytest.raises(RuntimeError) as ei:
        evidence.fetch_live("q", KEY)
    assert KEY not in str(ei.value)


def test_serpapi_error_body_raises(monkeypatch):
    class Resp:
        status_code = 200

        def json(self):
            return {"error": "Your account has run out of searches."}

    monkeypatch.setattr(httpx, "get", lambda *a, **kw: Resp())
    with pytest.raises(RuntimeError):
        evidence.fetch_live("q", KEY)


def test_unknown_inputs_404():
    assert client.get("/api/evidence", params={**PARAMS, "a": "nope"}).status_code == 404
    assert client.get("/api/evidence", params={**PARAMS, "motif": "transformation"}).status_code == 404


def test_queries_cover_all_comparisons():
    for c in data.comparisons():
        q = evidence.build_query(c["storyAId"], c["storyBId"], c["sharedMotif"]) + evidence.build_query(c["storyBId"], c["storyAId"], c["sharedMotif"])
        assert "site:" in q and len(q) < 400


def test_no_results_error_is_empty_not_failure(monkeypatch):
    class Resp:
        status_code = 200

        def json(self):
            return {"error": "Google hasn't returned any results for this query."}

    monkeypatch.setattr(httpx, "get", lambda *a, **kw: Resp())
    assert evidence.fetch_live("q", KEY) == []


def test_blocked_upload_platforms():
    assert not evidence.is_allowed("https://www.academia.edu/123/paper")
    assert not evidence.is_allowed("https://www.researchgate.net/publication/1")
    assert evidence.is_allowed("https://folklore.usc.edu/kong-ji-and-pat-ji")


def test_relevance_filter_requires_story_name():
    organic = [
        {"title": "Madonna - Like A Prayer", "link": "https://go.middlebury.edu/x", "snippet": "video"},
        {"title": "Kong-Ji and Pat-Ji, A Korean Cinderella Story", "link": "https://folklore.usc.edu/k", "snippet": ""},
        {"title": "Tang tale", "link": "https://a.edu/y", "snippet": "Yeh Hsien is the Chinese Cinderella"},
    ]
    assert [r["link"] for r in evidence.filter_results(organic, "kongjwi")] == ["https://folklore.usc.edu/k"]
    assert [r["link"] for r in evidence.filter_results(organic, "yexian")] == ["https://a.edu/y"]
    assert all(r["story"] == "kongjwi" for r in evidence.filter_results(organic, "kongjwi"))
