"""Search over the curated catalog only. No open-ended lookup, no web calls.

Every query token must match the start of a word in some field (accent- and case-insensitive).
A story's score is the sum, per token, of the weight of the best field that token matched, plus
a bonus when the whole query appears in the title. Weights favour what a player types first.
"""
import re
import unicodedata

from . import library as library_mod
from .models import LibraryHit, LibraryStory, Motif, MotifHit, SearchResult, StoryDetail, StoryHit, StorySummary

STORY_WEIGHTS = {
    "title": 10,
    "id": 8,
    "legacyId": 6,  # the name the frontend already uses, e.g. "cinderella" -> Cendrillon
    "region": 4,
    "culturalTradition": 4,
    "atuType": 4,
    "motifLabels": 3,
    "summary": 2,
    "sourceTitles": 1,
}
MOTIF_WEIGHTS = {"label": 10, "id": 8, "thompson": 4}
LIBRARY_WEIGHTS = {"title": 10, "atuName": 4, "atuType": 4, "provenance": 4, "citation": 1}
PHRASE_BONUS = 5


def norm(text: str) -> str:
    decomposed = unicodedata.normalize("NFKD", text)
    return "".join(c for c in decomposed if not unicodedata.combining(c)).lower()


def tokens(text: str) -> list[str]:
    return re.findall(r"[a-z0-9]+", norm(text))


def _prefix_match(token: str, field_text: str) -> bool:
    return any(w.startswith(token) for w in tokens(field_text))


def _score(query_tokens: list[str], phrase: str, fields: dict[str, str], weights: dict[str, int]):
    total, matched = 0, set()
    for tok in query_tokens:
        best = max(((weights[f], f) for f, text in fields.items() if _prefix_match(tok, text)), default=None)
        if best is None:
            return 0, []
        total += best[0]
        matched.add(best[1])
    if phrase and "title" in fields and phrase in norm(fields["title"]):
        total += PHRASE_BONUS
    elif phrase and "label" in fields and phrase in norm(fields["label"]):
        total += PHRASE_BONUS
    return total, sorted(matched, key=lambda f: -weights[f])


def search_library(q: str, tales: list[LibraryStory], limit: int | None = 10) -> list[LibraryHit]:
    """Library tales matching `q`, best first. Metadata fields only; there is no tale text to search."""
    phrase = " ".join(tokens(q))
    qt = phrase.split()
    if not qt:
        return []
    hits = []
    for t in tales:
        fields = {
            "title": t.title, "atuName": t.atuName or "", "atuType": t.atuType,
            "provenance": t.provenance or "", "citation": t.citation or "",
        }
        score, matched = _score(qt, phrase, fields, LIBRARY_WEIGHTS)
        if score:
            hits.append(LibraryHit(tale=library_mod.summary(t), score=score, matchedFields=matched))
    hits.sort(key=lambda h: (-h.score, h.tale.title.lower(), h.tale.id))
    return hits if limit is None else hits[:limit]


def search(
    q: str,
    stories: list[StoryDetail],
    motifs: list[Motif],
    limit: int = 10,
    library: list[LibraryStory] | None = None,
) -> SearchResult:
    phrase = " ".join(tokens(q))
    qt = phrase.split()
    if not qt:
        return SearchResult(query=q, stories=[], motifs=[])
    labels = {m.id: m.label for m in motifs}

    story_hits = []
    for s in stories:
        fields = {
            "title": s.title, "id": s.id.replace("-", " "), "legacyId": s.legacyId or "",
            "region": s.region, "culturalTradition": s.culturalTradition, "atuType": s.atuType or "",
            "motifLabels": " ".join(labels[m] for m in s.motifs), "summary": s.summary,
            "sourceTitles": " ".join(x.title for x in s.summarySources),
        }
        score, matched = _score(qt, phrase, fields, STORY_WEIGHTS)
        if score:
            story_hits.append(StoryHit(
                story=StorySummary(**s.model_dump(include=set(StorySummary.model_fields))),
                score=score, matchedFields=matched,
            ))
    story_hits.sort(key=lambda h: (-h.score, h.story.title))

    motif_hits = []
    for m in motifs:
        fields = {
            "label": m.label, "id": m.id.replace("-", " "),
            "thompson": " ".join(m.thompsonIds + [t.name or "" for t in m.thompson]),
        }
        score, matched = _score(qt, phrase, fields, MOTIF_WEIGHTS)
        if score:
            motif_hits.append(MotifHit(motif=m, score=score, matchedFields=matched))
    motif_hits.sort(key=lambda h: (-h.score, h.motif.label))

    lib_hits = search_library(q, library, limit) if library else []
    return SearchResult(query=q, stories=story_hits[:limit], motifs=motif_hits[:limit], library=lib_hits)
