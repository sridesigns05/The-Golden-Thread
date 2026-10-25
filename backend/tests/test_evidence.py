import httpx
import pytest
from fastapi.testclient import TestClient

from app import catalog, evidence
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


def item(link="https://a.edu/x", story=None):
    return {"title": "T", "link": link, "snippet": "s", "domain": "a.edu", **({"story": story} if story else {})}


def entry(*links, story=None):
    return {"query": "q", "fetchedAt": "2026-01-01T00:00:00+00:00", "results": [item(link, story) for link in links]}


def fake_live(per_story):
    """fetch_live stand-in returning a fixed result list per story id."""
    def fn(query, key, timeout=None, story=None):
        return per_story[story]
    return fn


def test_allowlist():
    ok = [
        "https://www.britannica.com/topic/Cinderella-folktale",
        "https://www.pitt.edu/~dash/type0510a.html",
        "https://history.princeton.edu/x",
        "https://www.jstor.org/stable/1",
    ]
    bad = [
        "https://www.reddit.com/r/folklore",
        "https://www.pitt.edu/news/foo",
        "https://evil.com/britannica.com",
        "https://britannica.com.evil.com/x",
        "https://notbritannica.com/x",
        "ftp://x.edu/a",
        "https://www.academia.edu/123/paper",
        "https://www.researchgate.net/publication/1",
    ]
    assert all(evidence.is_allowed(u) for u in ok)
    assert not any(evidence.is_allowed(u) for u in bad)


def test_filter_keeps_fields_and_drops_others():
    out = evidence.filter_results([
        {"title": "T", "link": "https://www.britannica.com/x", "snippet": "S"},
        {"title": "W", "link": "https://www.reddit.com/x", "snippet": "S"},
        {"title": "no link"},
    ])
    assert out == [
        {"title": "T", "link": "https://www.britannica.com/x", "snippet": "S", "domain": "britannica.com"}
    ]


def test_relevance_filter_requires_story_name():
    organic = [
        {"title": "Madonna - Like A Prayer", "link": "https://go.middlebury.edu/x", "snippet": "video"},
        {"title": "Kong-Ji and Pat-Ji, A Korean Cinderella Story", "link": "https://folklore.usc.edu/k", "snippet": ""},
        {"title": "Tang tale", "link": "https://a.edu/y", "snippet": "Yeh Hsien is the Chinese Cinderella"},
    ]
    assert [r["link"] for r in evidence.filter_results(organic, "kongjwi")] == ["https://folklore.usc.edu/k"]
    assert [r["link"] for r in evidence.filter_results(organic, "yexian")] == ["https://a.edu/y"]
    assert all(r["story"] == "kongjwi" for r in evidence.filter_results(organic, "kongjwi"))


def test_every_curated_story_has_a_query_and_a_relevance_pattern():
    for s in catalog.stories():
        q = evidence.build_query(s.id)
        assert q and len(q) < 400, s.id
        assert s.id in evidence.STORY_PATTERNS, s.id


def test_no_key_and_no_cache_returns_empty_not_error():
    r = client.get("/api/evidence", params=PARAMS)
    assert r.status_code == 200
    assert r.json()["source"] == "none" and r.json()["results"] == []


def test_live_success_is_cached_then_served_when_network_dies(monkeypatch):
    monkeypatch.setenv("SERPAPI_KEY", KEY)
    monkeypatch.setattr(evidence, "fetch_live", fake_live({
        "cinderella": [item("https://a.edu/c", "cinderella")], "yexian": [item("https://b.edu/y", "yexian")],
    }))
    r = client.get("/api/evidence", params=PARAMS).json()
    assert r["source"] == "live" and {x["link"] for x in r["results"]} == {"https://a.edu/c", "https://b.edu/y"}

    def boom(*a, **kw):
        raise RuntimeError("network error (ConnectError)")

    monkeypatch.setattr(evidence, "fetch_live", boom)
    evidence._memo.clear()
    r = client.get("/api/evidence", params=PARAMS).json()
    assert r["source"] == "cache" and len(r["results"]) == 2
    # pair order must not matter for what is returned
    r2 = client.get("/api/evidence", params={"a": "yexian", "b": "cinderella", "motif": PARAMS["motif"]}).json()
    assert r2["source"] == "cache" and {x["link"] for x in r2["results"]} == {x["link"] for x in r["results"]}


def test_one_story_cached_other_missing_still_returns_what_exists():
    evidence.save_cache({"version": 2, "entries": {"cinderella": entry("https://a.edu/c", story="cinderella")}})
    r = client.get("/api/evidence", params=PARAMS).json()
    assert r["source"] == "cache" and [x["link"] for x in r["results"]] == ["https://a.edu/c"]


def test_merge_removes_duplicate_links():
    evidence.save_cache({"version": 2, "entries": {
        "cinderella": entry("https://a.edu/same", "https://a.edu/c1"),
        "yexian": entry("https://a.edu/same", "https://b.edu/y1"),
    }})
    links = [x["link"] for x in client.get("/api/evidence", params=PARAMS).json()["results"]]
    assert links == ["https://a.edu/same", "https://a.edu/c1", "https://b.edu/y1"]


def test_unexpected_exception_still_falls_back(monkeypatch):
    monkeypatch.setenv("SERPAPI_KEY", KEY)
    evidence.save_cache({"version": 2, "entries": {"cinderella": entry("https://a.edu/c"), "yexian": entry("https://b.edu/y")}})
    monkeypatch.setattr(evidence, "fetch_live", lambda *a, **kw: 1 / 0)
    assert client.get("/api/evidence", params=PARAMS).json()["source"] == "cache"


def test_empty_live_result_does_not_mask_cache(monkeypatch):
    monkeypatch.setenv("SERPAPI_KEY", KEY)
    evidence.save_cache({"version": 2, "entries": {"cinderella": entry("https://a.edu/c"), "yexian": entry("https://b.edu/y")}})
    monkeypatch.setattr(evidence, "fetch_live", lambda *a, **kw: [])
    r = client.get("/api/evidence", params=PARAMS).json()
    assert r["source"] == "cache" and len(r["results"]) == 2


def test_cache_mode_never_calls_serpapi(monkeypatch):
    monkeypatch.setenv("SERPAPI_KEY", KEY)
    monkeypatch.setenv("EVIDENCE_MODE", "cache")
    monkeypatch.setattr(evidence, "fetch_live", lambda *a, **kw: pytest.fail("called live"))
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


def test_no_results_error_is_empty_not_failure(monkeypatch):
    class Resp:
        status_code = 200

        def json(self):
            return {"error": "Google hasn't returned any results for this query."}

    monkeypatch.setattr(httpx, "get", lambda *a, **kw: Resp())
    assert evidence.fetch_live("q", KEY) == []


def test_endpoint_validation():
    assert client.get("/api/evidence", params={**PARAMS, "a": "nope"}).status_code == 404
    assert client.get("/api/evidence", params={**PARAMS, "motif": "nope"}).status_code == 404
    assert client.get("/api/evidence", params={**PARAMS, "motif": "trickster"}).status_code == 400
    assert client.get("/api/evidence", params={**PARAMS, "b": "cinderella"}).status_code == 400
