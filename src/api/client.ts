import { STORIES } from '../data/stories';
import { COMPARISONS } from '../data/comparisons';
import type { StoryData, ComparisonDetail, MotifId, StoryId } from '../types';
import type { ApiStory, ApiComparison, EvidenceSource } from '../types/api';

// Backend client. Every call falls back to the bundled mock data (or an empty evidence list),
// so the app keeps working when the backend is down. Nothing here modifies existing files.

const BASE_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const TIMEOUT_MS = 4000;

async function getJson<T>(path: string, params?: Record<string, string>): Promise<T> {
  const qs = params ? `?${new URLSearchParams(params)}` : '';
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE_URL}${path}${qs}`, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export interface Loaded<T> {
  data: T;
  fromBackend: boolean;
}

export async function loadStories(): Promise<Loaded<StoryData[] | ApiStory[]>> {
  try {
    return { data: await getJson<ApiStory[]>('/api/legacy/stories'), fromBackend: true };
  } catch {
    return { data: STORIES, fromBackend: false };
  }
}

export async function loadComparison(
  a: StoryId,
  b: StoryId,
  motif: MotifId
): Promise<Loaded<ComparisonDetail | ApiComparison | undefined>> {
  try {
    return { data: await getJson<ApiComparison>('/api/legacy/comparison', { a, b, motif }), fromBackend: true };
  } catch {
    const local = COMPARISONS.find(
      (c) =>
        c.sharedMotif === motif &&
        ((c.storyAId === a && c.storyBId === b) || (c.storyAId === b && c.storyBId === a))
    );
    return { data: local, fromBackend: false };
  }
}

export interface EvidenceResult extends EvidenceSource {
  snippet: string;
  story?: StoryId;
}

export interface Evidence {
  source: 'live' | 'cache' | 'none';
  results: EvidenceResult[];
}

export async function loadEvidence(a: StoryId, b: StoryId, motif: MotifId): Promise<Evidence> {
  try {
    const r = await getJson<{ source: Evidence['source']; results: Array<{ title: string; link: string; snippet: string; domain: string; story?: StoryId }> }>(
      '/api/evidence',
      { a, b, motif }
    );
    return {
      source: r.source,
      results: r.results.map(({ title, link, snippet, domain, story }) => ({ title, url: link, snippet, domain, story })),
    };
  } catch {
    return { source: 'none', results: [] };
  }
}
