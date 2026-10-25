import { ComparisonDetail, StoryId, MotifId } from '../types';

// Comparisons between the curated stories, one per pair and shared motif. Filled in place from the
// backend (/api/bootstrap) or the bundled snapshot before the first render; see src/api/adapter.ts.
// The rules (tale-type pairing, draft difference lines) live in the backend.
export const COMPARISONS: ComparisonDetail[] = [];

// Story id -> motif id -> other stories that share the motif, best match first (computed by the backend).
export const RELATED: Partial<Record<StoryId, Partial<Record<MotifId, StoryId[]>>>> = {};

export function getComparison(storyA: StoryId, storyB: StoryId, motif?: string): ComparisonDetail | undefined {
  const samePair = (c: ComparisonDetail) =>
    (c.storyAId === storyA && c.storyBId === storyB) || (c.storyAId === storyB && c.storyBId === storyA);
  // Exact pair and motif first; otherwise any comparison for the pair. Nothing is invented here:
  // every comparison comes from the backend data.
  return COMPARISONS.find((c) => samePair(c) && (!motif || c.sharedMotif === motif)) || COMPARISONS.find(samePair);
}

// What to call a pairing. The tale-type label is only claimed when the backend has it as confirmed.
export function classificationLabel(c: ComparisonDetail): string {
  if (c.classification === 'cinderella-parallel') {
    return c.typeConfirmed === false
      ? 'Cinderella-type parallel (tale type unconfirmed)'
      : 'Cinderella-type parallel (ATU 510 family)';
  }
  return 'Broader thematic parallel (not the same tale type)';
}

// Every pair of stories a player can weave: linked in either direction by a related-story list.
// Keys are the two ids sorted and joined with "|".
export function playableThreadKeys(): Set<string> {
  const keys = new Set<string>();
  for (const [from, byMotif] of Object.entries(RELATED)) {
    for (const list of Object.values(byMotif ?? {})) {
      for (const to of (list ?? []).slice(0, MAX_LENS_STORIES)) keys.add([from, to].sort().join('|'));
    }
  }
  return keys;
}

// How many golden threads exist in the atlas (the "N" in "X of N woven").
export function totalThreads(): number {
  return playableThreadKeys().size;
}

// The most stories a motif can light up at once. The backend already picks them (see lens_map); the cut here
// is only a guard so an older backend cannot bring back a long list.
export const MAX_LENS_STORIES = 2;

// The storybook offers a story's first three motifs to follow. The game graph, hints and thread count use the
// same three, so nothing in them can need a motif the player cannot click.
export const MAX_LENS_MOTIFS = 3;

export function getRelatedStoriesForMotif(currentStoryId: StoryId, motifId: string): StoryId[] {
  return (RELATED[currentStoryId]?.[motifId as MotifId] ?? []).slice(0, MAX_LENS_STORIES);
}
