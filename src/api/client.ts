import type { MotifId, StoryId } from '../types';
import type { LibraryHit, SearchResult } from '../types/catalog';
import { apiFetch } from './adapter';

// Calls the app makes after startup. Each one fails soft: the UI keeps working, with an empty
// result, if the backend is unreachable. (Story, motif and comparison data are loaded once at
// startup by ./adapter.)

const TIMEOUT_MS = 4000;

async function getJson<T>(path: string, params: Record<string, string>): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await apiFetch(`${path}?${new URLSearchParams(params)}`, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export interface EvidenceItem {
  title: string;
  url: string;
  snippet: string;
  domain: string;
  story?: StoryId;
}

export interface Evidence {
  source: 'live' | 'cache' | 'none';
  fetchedAt: string | null;
  query: string | null;
  results: EvidenceItem[];
}

const NO_EVIDENCE: Evidence = { source: 'none', fetchedAt: null, query: null, results: [] };

// Sources for a comparison: reputable-domain search results for each of the two stories.
export async function loadEvidence(a: StoryId, b: StoryId, motif: MotifId): Promise<Evidence> {
  try {
    const r = await getJson<{
      source: Evidence['source'];
      fetchedAt: string | null;
      query: string | null;
      results: Array<{ title: string; link: string; snippet: string; domain: string; story?: StoryId }>;
    }>('/api/evidence', { a, b, motif });
    return {
      source: r.source,
      fetchedAt: r.fetchedAt,
      query: r.query,
      results: r.results.map(({ title, link, snippet, domain, story }) => ({ title, url: link, snippet, domain, story }))
    };
  } catch {
    return NO_EVIDENCE;
  }
}

// Search the metadata-only library of other folktales (titles, provenance and tale types; never text).
// Returns null when the backend could not be reached, so "no match" and "no backend" look different.
export async function searchLibrary(q: string, limit = 12): Promise<LibraryHit[] | null> {
  const query = q.trim();
  if (!query) return [];
  try {
    const r = await getJson<SearchResult>('/api/search', { q: query, tiers: 'library', limit: String(limit) });
    return r.library;
  } catch {
    return null;
  }
}

// ---- Myth card (search bar) -------------------------------------------------------------------
// One tale's dataset record, a search for that specific myth, and a short AI summary of the sources.
export interface MythCardData {
  record: {
    id: string;
    tier: 'curated' | 'library';
    title: string;
    originalTitle: string | null;
    place: string | null;
    tradition: string | null;
    atuType: string | null;
    atuName: string | null;
    provenance: string | null;
    citation: string | null;
    summary: string | null;
  };
  sources: { source: 'live' | 'cache' | 'none'; fetchedAt: string | null; query: string | null; results: EvidenceItem[] };
  summary:
    | { available: true; text: string; model: string; sourcesUsed: string[] }
    | { available: false; reason: string };
  // Thompson motifs the ATU index lists for the tale's TYPE (not read from this tale's text)
  typeMotifs: {
    atuType: string;
    total: number;
    shown: number;
    motifs: Array<{ id: string; name: string | null }>;
    note: string;
  } | null;
  similar: {
    basis: string;
    typeNote?: string | null;
    sameTypeTotal: number;
    sameType: SimilarTale[];
    atlas: Array<SimilarTale & { reason: string; typeConfirmed: boolean }>;
    nearbyTypes: Array<{
      atuType: string;
      atuName: string | null;
      why: string;
      sharedMotifs: Array<{ id: string; name: string | null }>;
      examples: SimilarTale[];
    }>;
  } | null;
}

export interface SimilarTale {
  id: string;
  title: string;
  place: string | null;
  tier: 'curated' | 'library';
  atuType?: string | null;
}

// The card runs a web search and a model call on the server, so it gets a longer wait than other calls.
const CARD_TIMEOUT_MS = 45000;

export async function loadMythCard(id: string): Promise<MythCardData | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), CARD_TIMEOUT_MS);
  try {
    const res = await apiFetch(`/api/myth-card?${new URLSearchParams({ id })}`, { signal: ctrl.signal });
    if (!res.ok) return null;
    const r = await res.json();
    return {
      record: r.record,
      sources: {
        ...r.sources,
        results: (r.sources.results as Array<{ title: string; link: string; snippet: string; domain: string }>).map(
          ({ title, link, snippet, domain }) => ({ title, url: link, snippet, domain })
        )
      },
      summary: r.summary,
      typeMotifs: r.typeMotifs ?? null,
      similar: r.similar ?? null
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
