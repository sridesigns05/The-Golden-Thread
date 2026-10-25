"""Myth cards: record + own search + grounded summary, with every failure degrading quietly."""
import pytest
from fastapi.testclient import TestClient

from app import evidence, library, myth_card
from app.main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def isolated(tmp_path, monkeypatch):
    monkeypatch.setattr(myth_card, "CACHE_PATH", tmp_path / "myth_cache.json")
    monkeypatch.setattr(myth_card, "_memo", {})
    monkeypatch.setattr(evidence, "CACHE_PATH", tmp_path / "evidence_cache.json")
    monkeypatch.setattr(evidence, "_memo", {})
    monkeypatch.setenv("SERPAPI_KEY", "test-key")
    monkeypatch.delenv("EVIDENCE_MODE", raising=False)
    monkeypatch.delenv("MYTH_CARD_MODE", raising=False)
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    monkeypatch.delenv("GOOGLE_API_KEY", raising=False)


def hit(link="https://www.britannica.com/x", title="Cinderella", snippet="A tale of a girl and a slipper."):
    return {"title": title, "link": link, "snippet": snippet, "domain": evidence.domain_of(link)}


def library_id():
    return next(t.id for t in library.tales() if t.atuType == "510A" or t.title)


def test_unknown_id_is_404():
    assert client.get("/api/myth-card", params={"id": "nope"}).status_code == 404


def test_curated_card_has_record_sources_and_summary(monkeypatch):
    monkeypatch.setattr(evidence, "load_cache", lambda: {"entries": {}})
    monkeypatch.setattr(evidence, "fetch_live", lambda *a, **k: [hit(title="Cinderella (Perrault)")])
    monkeypatch.setenv("GEMINI_API_KEY", "k")
    seen = {}

    def fake_llm(prompt):
        seen["prompt"] = prompt
        return '{"summary": "A tale recorded by Perrault.", "sources_used": [1, 9]}'

    monkeypatch.setattr(myth_card, "call_llm", fake_llm)
    r = client.get("/api/myth-card", params={"id": "cinderella"}).json()
    assert r["record"]["tier"] == "curated" and r["record"]["title"]
    assert r["sources"]["source"] == "live" and r["sources"]["results"]
    assert r["summary"]["available"] and r["summary"]["text"] == "A tale recorded by Perrault."
    assert len(r["summary"]["sourcesUsed"]) == 1  # source 9 does not exist and is dropped
    assert "SEARCH RESULTS" in seen["prompt"] and "britannica.com" in seen["prompt"]


def test_library_card_uses_its_own_title_search(monkeypatch):
    tale = next(t for t in library.tales() if t.title)
    queries = []

    def fake_live(q, key, timeout=None, story=None):
        queries.append(q)
        return [hit(title=f"About {tale.title}", snippet=f"{tale.title} is a folktale.")]

    monkeypatch.setattr(evidence, "fetch_live", fake_live)
    r = client.get("/api/myth-card", params={"id": tale.id}).json()
    assert r["record"]["tier"] == "library" and "lat" not in r["record"]
    assert queries and "folktale" in queries[0]
    assert r["sources"]["results"]


def test_irrelevant_results_are_dropped_for_library_tale(monkeypatch):
    tale = next(t for t in library.tales() if t.title)
    monkeypatch.setattr(evidence, "fetch_live", lambda *a, **k: [hit(title="Unrelated page", snippet="nothing here")])
    r = client.get("/api/myth-card", params={"id": tale.id}).json()
    assert r["sources"]["results"] == [] and r["sources"]["source"] == "none"


def test_no_llm_key_gives_sources_without_summary(monkeypatch):
    monkeypatch.setattr(evidence, "fetch_live", lambda *a, **k: [hit()])
    r = client.get("/api/myth-card", params={"id": "cinderella"}).json()
    assert r["sources"]["results"] and r["summary"]["available"] is False
    assert "GEMINI_API_KEY" in r["summary"]["reason"]


def test_llm_failure_and_garbage_degrade(monkeypatch):
    monkeypatch.setattr(evidence, "fetch_live", lambda *a, **k: [hit()])
    monkeypatch.setenv("GEMINI_API_KEY", "k")
    monkeypatch.setattr(myth_card, "call_llm", lambda p: 1 / 0)
    assert client.get("/api/myth-card", params={"id": "cinderella"}).json()["summary"]["available"] is False
    monkeypatch.setattr(myth_card, "_memo", {})
    monkeypatch.setattr(myth_card, "call_llm", lambda p: "not json")
    assert client.get("/api/myth-card", params={"id": "cinderella"}).json()["summary"]["available"] is False


def test_saved_results_are_used_before_searching_again(monkeypatch):
    monkeypatch.setattr(evidence, "fetch_live", lambda *a, **k: [hit()])
    first = client.get("/api/myth-card", params={"id": "cinderella"}).json()
    assert first["sources"]["source"] in ("live", "cache")
    monkeypatch.setattr(evidence, "fetch_live", lambda *a, **k: pytest.fail("searched again"))
    monkeypatch.setattr(myth_card, "_memo", {})
    again = client.get("/api/myth-card", params={"id": "cinderella"}).json()
    assert again["sources"]["source"] == "cache" and again["sources"]["results"]
    # refresh=true does search again (and falls back to the saved results if that fails)
    monkeypatch.setattr(myth_card, "_memo", {})
    monkeypatch.setattr(evidence, "fetch_live", lambda *a, **k: (_ for _ in ()).throw(RuntimeError("network error")))
    refreshed = client.get("/api/myth-card", params={"id": "cinderella", "refresh": "true"}).json()
    assert refreshed["sources"]["source"] == "cache"


def test_search_failure_falls_back_to_cache_then_nothing(monkeypatch):
    monkeypatch.setattr(evidence, "load_cache", lambda: {"entries": {}})
    monkeypatch.setattr(evidence, "fetch_live", lambda *a, **k: [hit()])
    first = client.get("/api/myth-card", params={"id": "cinderella"}).json()
    assert first["sources"]["source"] == "live"

    def boom(*a, **k):
        raise RuntimeError("network error")

    monkeypatch.setattr(evidence, "fetch_live", boom)
    monkeypatch.setattr(myth_card, "_memo", {})
    again = client.get("/api/myth-card", params={"id": "cinderella", "refresh": "true"}).json()
    assert again["sources"]["source"] == "cache" and again["sources"]["results"]


def test_cached_summary_is_reused_without_a_second_llm_call(monkeypatch):
    monkeypatch.setattr(evidence, "fetch_live", lambda *a, **k: [hit()])
    monkeypatch.setenv("GEMINI_API_KEY", "k")
    calls = []
    monkeypatch.setattr(myth_card, "call_llm", lambda p: calls.append(1) or '{"summary": "S.", "sources_used": [1]}')
    client.get("/api/myth-card", params={"id": "cinderella"})
    monkeypatch.setattr(myth_card, "_memo", {})
    r = client.get("/api/myth-card", params={"id": "cinderella"}).json()
    assert len(calls) == 1 and r["summary"]["text"] == "S."


def test_cache_mode_never_calls_out(monkeypatch):
    monkeypatch.setenv("MYTH_CARD_MODE", "cache")
    monkeypatch.setenv("GEMINI_API_KEY", "k")
    monkeypatch.setattr(evidence, "fetch_live", lambda *a, **k: pytest.fail("called live"))
    monkeypatch.setattr(myth_card, "call_llm", lambda p: pytest.fail("called llm"))
    r = client.get("/api/myth-card", params={"id": "cinderella"}).json()
    assert r["summary"]["available"] is False


def test_parse_summary():
    assert myth_card.parse_summary('x {"summary": " Hi. ", "sources_used": [1, 2, "a", 5]} y', 2) == {"text": "Hi.", "sourcesUsed": [1, 2]}
    assert myth_card.parse_summary('{"summary": ""}', 1) is None
    assert myth_card.parse_summary("nope", 1) is None


class FakeResponse:
    def __init__(self, status=200, body=None):
        self.status_code, self._body = status, body or {}

    def json(self):
        return self._body


def test_gemini_request_shape_and_reply_parsing(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "secret-key")
    seen = {}

    def fake_post(url, headers=None, json=None, timeout=None):
        seen.update(url=url, headers=headers, json=json)
        return FakeResponse(200, {"candidates": [{"content": {"parts": [{"text": "hello"}]}}]})

    monkeypatch.setattr(myth_card.httpx, "post", fake_post)
    assert myth_card.call_llm("the prompt") == "hello"
    assert "secret-key" not in seen["url"] and seen["headers"]["x-goog-api-key"] == "secret-key"
    assert seen["json"]["contents"][0]["parts"][0]["text"] == "the prompt"
    assert seen["json"]["generationConfig"]["responseMimeType"] == "application/json"
    assert seen["json"]["system_instruction"]["parts"][0]["text"] == myth_card.SYSTEM_PROMPT


def test_gemini_errors_are_safe_and_specific(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "secret-key")
    monkeypatch.setattr(myth_card.httpx, "post", lambda *a, **k: FakeResponse(404))
    with pytest.raises(myth_card.LlmError) as e:
        myth_card.call_llm("p")
    assert "404" in str(e.value) and "GEMINI_MODEL" in str(e.value) and "secret-key" not in str(e.value)
    monkeypatch.setattr(myth_card.httpx, "post", lambda *a, **k: FakeResponse(200, {"promptFeedback": {"blockReason": "SAFETY"}}))
    with pytest.raises(myth_card.LlmError):
        myth_card.call_llm("p")
    monkeypatch.setattr(myth_card.httpx, "post", lambda *a, **k: FakeResponse(200, {"candidates": []}))
    with pytest.raises(myth_card.LlmError):
        myth_card.call_llm("p")


def test_thought_parts_are_ignored(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "k")
    body = {"candidates": [{"content": {"parts": [{"text": "thinking...", "thought": True}, {"text": "answer"}]}}]}
    monkeypatch.setattr(myth_card.httpx, "post", lambda *a, **k: FakeResponse(200, body))
    assert myth_card.call_llm("p") == "answer"
