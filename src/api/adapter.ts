import type { ComparisonDetail, MotifId, MotifInfo, StoryData, StoryId } from '../types';
import type { Bootstrap, CatalogMotif, CatalogStory, PairComparison } from '../types/catalog';
import { STORIES } from '../data/stories';
import { COMPARISONS, RELATED } from '../data/comparisons';
import { MOTIFS_CATALOG } from '../data/motifs';
import { CATALOG_META } from '../data/catalogMeta';
import snapshot from '../data/bootstrap.snapshot.json';

// Maps the backend's data into the frontend's existing types and fills the data modules in place, so
// the components keep reading STORIES, COMPARISONS and MOTIFS_CATALOG as before.
//
// Order at startup (see src/main.tsx): hydrate from the bundled snapshot (always works), then try the
// backend and re-hydrate if it answers. The app therefore never starts empty or waits on the network.

// Where the backend can be reached: this app's own address first (the app server forwards /api to the backend,
// so there is no CORS to configure and it works from any host name), then the backend's own address for a
// frontend run without that server. VITE_API_URL pins a single address.
const DIRECT_BACKEND = 'http://localhost:8000';
const API_BASES: string[] = import.meta.env.VITE_API_URL ? [import.meta.env.VITE_API_URL] : ['', DIRECT_BACKEND];

export async function apiFetch(pathAndQuery: string, init?: RequestInit): Promise<Response> {
  let lastError: unknown = new Error('no backend address configured');
  for (const [i, base] of API_BASES.entries()) {
    try {
      const res = await fetch(`${base}${pathAndQuery}`, init);
      // "Not found / bad gateway" from the app's own address means no backend sits behind it: try the next address
      const last = i === API_BASES.length - 1;
      if (res.ok || last || ![404, 502, 503, 504].includes(res.status)) return res;
      lastError = new Error(`HTTP ${res.status}`);
    } catch (e) {
      if (init?.signal?.aborted) throw e;
      lastError = e;
    }
  }
  throw lastError;
}
const BOOTSTRAP_TIMEOUT_MS = 2500;
const SHORT_RETELLING_WORDS = 60;

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

// First sentences of the summary, up to ~60 words, for the open-book page.
export function shortRetelling(summary: string): string {
  const sentences = summary.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [summary];
  let out = '';
  let words = 0;
  for (const sentence of sentences) {
    const n = sentence.trim().split(/\s+/).length;
    if (out && words + n > SHORT_RETELLING_WORDS) break;
    out += sentence;
    words += n;
  }
  const trimmed = out.trim();
  const all = trimmed.split(/\s+/);
  return all.length > SHORT_RETELLING_WORDS ? all.slice(0, SHORT_RETELLING_WORDS).join(' ') + '…' : trimmed;
}

export function toStory(s: CatalogStory): StoryData {
  const motifManifestations: Partial<Record<MotifId, string>> = {};
  const draftMotifs: MotifId[] = [];
  for (const e of s.motifEntries) {
    motifManifestations[e.motif as MotifId] = e.howItAppears;
    if (e.draft) draftMotifs.push(e.motif as MotifId);
  }
  return {
    id: s.id as StoryId,
    title: s.title,
    originalOrAlternateTitle: s.originalTitle ?? '',
    country: s.region,
    culturalTradition: s.culturalTradition,
    coordinates: { lat: s.lat, lng: s.lon, label: s.region },
    summary: s.summary,
    shortRetelling: shortRetelling(s.summary),
    fullRetelling: [s.summary],
    keyElements: s.motifEntries.map((e) => e.howItAppears),
    motifs: s.motifs as MotifId[],
    narrativeTraditionType: s.kind,
    sources: s.summarySources.map((src, i) => ({
      title: src.title,
      authorOrAttribution: hostOf(src.url),
      dateOrEra: s.earliestRecordedDate ?? 'Earliest record not verified',
      context: i === 0 ? s.dateCaveat : '',
      url: src.url
    })),
    motifManifestations,
    distinctiveFeatures: s.dateCaveat,
    // No `quote`: the backend has no sourced quotations.
    dateCaveat: s.dateCaveat,
    earliestRecordedDate: s.earliestRecordedDate,
    coordsNote: s.coordsNote,
    sensitivity: s.sensitivity,
    atuType: s.atuType,
    atuUncertain: s.atuUncertain,
    verified: s.verified,
    draftMotifs,
    verifyBeforeUse: s.verifyBeforeUse
  };
}

export function toMotifInfo(m: CatalogMotif): MotifInfo {
  return { id: m.id as MotifId, name: m.name, shortDescription: m.description, storySignificance: m.significance };
}

export function toComparison(
  c: PairComparison,
  stories: Map<string, StoryData>,
  motifs: Map<string, CatalogMotif>,
  similarityRule: string
): ComparisonDetail {
  const a = stories.get(c.a);
  const b = stories.get(c.b);
  const m = motifs.get(c.motif);
  const cinderellaType = c.connectionType === 'cinderella-parallel';
  const notes = [similarityRule];
  if (cinderellaType && !c.typeConfirmed) {
    notes.push('The tale-type match is unconfirmed: at least one of the two tales has a type number marked "verify".');
  }
  if (!cinderellaType) notes.push('Thematic parallel: the two tales are not classified as the same tale type.');
  return {
    id: `${c.a}-${c.b}-${c.motif}`,
    storyAId: c.a as StoryId,
    storyBId: c.b as StoryId,
    sharedMotif: c.motif as MotifId,
    similarity: m ? `Shared motif: ${m.name}. ${m.description}` : 'These tales share a motif.',
    culturalDifference:
      c.difference?.text ?? 'No difference has been written for this pair yet; compare the two entries.',
    appearanceInA: a?.motifManifestations[c.motif as MotifId],
    appearanceInB: b?.motifManifestations[c.motif as MotifId],
    classification: cinderellaType ? 'cinderella-parallel' : 'thematic-parallel',
    scholarlyNote: notes.join(' '),
    typeConfirmed: c.typeConfirmed,
    differenceIsDraft: Boolean(c.difference)
  };
}

function replaceAll<T extends object>(target: T, next: T) {
  for (const key of Object.keys(target)) delete (target as Record<string, unknown>)[key];
  Object.assign(target, next);
}

// Fill the data modules in place from a backend payload.
export function hydrate(payload: Bootstrap, source: 'backend' | 'snapshot') {
  const stories = payload.stories.map(toStory);
  const storyMap = new Map(stories.map((s) => [s.id as string, s]));
  const motifMap = new Map(payload.motifs.map((m) => [m.id, m]));

  STORIES.splice(0, STORIES.length, ...stories);
  replaceAll(
    MOTIFS_CATALOG as Record<string, MotifInfo>,
    Object.fromEntries(payload.motifs.map((m) => [m.id, toMotifInfo(m)]))
  );
  COMPARISONS.splice(
    0,
    COMPARISONS.length,
    ...payload.comparisons.map((c) => toComparison(c, storyMap, motifMap, payload.meta.similarityRule))
  );
  replaceAll(RELATED as Record<string, unknown>, payload.related);

  Object.assign(CATALOG_META, {
    dataSource: source,
    status: payload.meta.status,
    dateRule: payload.meta.dateRule,
    similarityRule: payload.meta.similarityRule,
    libraryAttribution: payload.library.attribution,
    limitations: payload.library.limitations
  });
}

function looksValid(p: unknown): p is Bootstrap {
  const b = p as Partial<Bootstrap> | null;
  return Boolean(
    b && Array.isArray(b.stories) && b.stories.length > 0 && Array.isArray(b.motifs) &&
      Array.isArray(b.comparisons) && b.related && b.meta && b.library
  );
}

export function hydrateFromSnapshot() {
  hydrate(snapshot as unknown as Bootstrap, 'snapshot');
}

// Try the backend; on any failure keep whatever is already loaded. Never throws.
export async function refreshFromBackend(timeoutMs = BOOTSTRAP_TIMEOUT_MS): Promise<'backend' | 'snapshot'> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await apiFetch('/api/bootstrap', { signal: controller.signal });
    if (!res.ok) return 'snapshot';
    const payload: unknown = await res.json();
    if (!looksValid(payload)) return 'snapshot';
    hydrate(payload, 'backend');
    return 'backend';
  } catch {
    return 'snapshot';
  } finally {
    clearTimeout(timer);
  }
}
