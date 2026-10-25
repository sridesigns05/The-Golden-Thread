import { StoryId, MotifId } from '../types';
import { STORIES } from '../data/stories';
import { MOTIFS_CATALOG } from '../data/motifs';
import { getRelatedStoriesForMotif, MAX_LENS_MOTIFS } from '../data/comparisons';
import { DEMO_DESTINATIONS } from '../data/demoQuest';

export interface GraphEdge {
  from: StoryId;
  to: StoryId;
  motif: MotifId;
}

export interface PathResult {
  path: StoryId[];
  edges: GraphEdge[];
  hops: number;
}

/**
 * Builds the move graph from the same related-story lists the globe lights up (RELATED, from the backend).
 * A move from A to B exists only if B is highlighted when A is viewed through one of its motifs, so every
 * path found here is a path the player can actually play. Moves are directed because the lists are capped.
 */
export function buildStoryGraph(): Map<StoryId, { neighbor: StoryId; sharedMotifs: MotifId[] }[]> {
  const graph = new Map<StoryId, { neighbor: StoryId; sharedMotifs: MotifId[] }[]>();

  STORIES.forEach((s) => {
    const byNeighbor = new Map<StoryId, MotifId[]>();
    s.motifs.slice(0, MAX_LENS_MOTIFS).forEach((m) => {
      getRelatedStoriesForMotif(s.id, m).forEach((other) => {
        byNeighbor.set(other, [...(byNeighbor.get(other) ?? []), m]);
      });
    });
    graph.set(
      s.id,
      [...byNeighbor.entries()].map(([neighbor, sharedMotifs]) => ({ neighbor, sharedMotifs }))
    );
  });

  return graph;
}

/**
 * Breadth-First Search (BFS) to find the absolute shortest path between two stories.
 */
export function findShortestPath(startId: StoryId, targetId: StoryId): PathResult | null {
  if (startId === targetId) {
    return { path: [startId], edges: [], hops: 0 };
  }

  const graph = buildStoryGraph();
  const queue: { current: StoryId; path: StoryId[]; edges: GraphEdge[] }[] = [
    { current: startId, path: [startId], edges: [] }
  ];
  const visited = new Set<StoryId>([startId]);

  while (queue.length > 0) {
    const { current, path, edges } = queue.shift()!;
    const neighbors = graph.get(current) || [];

    for (const { neighbor, sharedMotifs } of neighbors) {
      const edge: GraphEdge = {
        from: current,
        to: neighbor,
        motif: sharedMotifs[0]
      };

      if (neighbor === targetId) {
        return {
          path: [...path, neighbor],
          edges: [...edges, edge],
          hops: path.length
        };
      }

      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({
          current: neighbor,
          path: [...path, neighbor],
          edges: [...edges, edge]
        });
      }
    }
  }

  return null;
}

/** Same text always gives the same number, so a start story always gets the same destination. */
function stableIndex(text: string, size: number): number {
  let h = 7;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h % size;
}

/**
 * The destination for a solo quest from `startId`. It is always the same for a given start, so a demo does
 * not change between runs:
 *   1. a destination fixed in DEMO_DESTINATIONS, if it is reachable and takes at least two steps;
 *   2. otherwise a story two steps away (then three, then any), picked by a stable hash of the start story.
 */
export function getReachableDestinationForSolo(startId: StoryId): StoryId {
  const fixed = DEMO_DESTINATIONS[startId];
  if (fixed && fixed !== startId) {
    const hops = findShortestPath(startId, fixed)?.hops ?? 0;
    if (hops >= 2) return fixed;
  }

  const byHops = new Map<number, StoryId[]>();
  STORIES.forEach((s) => {
    if (s.id === startId) return;
    const res = findShortestPath(startId, s.id);
    if (res) byHops.set(res.hops, [...(byHops.get(res.hops) ?? []), s.id]);
  });
  const preferred = byHops.get(2) ?? byHops.get(3) ?? [...byHops.entries()].sort((x, y) => y[0] - x[0])[0]?.[1];
  if (preferred && preferred.length > 0) {
    const sorted = [...preferred].sort();
    return sorted[stableIndex(startId, sorted.length)];
  }

  // Nothing reachable: any other story
  const others = STORIES.filter((s) => s.id !== startId).map((s) => s.id).sort();
  return others[stableIndex(startId, others.length)];
}

/**
 * Computes an intelligent hint when the player is stuck or requests assistance.
 */
export function getNextStepHint(
  currentId: StoryId,
  targetId: StoryId
): {
  recommendedMotifId: MotifId;
  recommendedMotifName: string;
  nextStoryId: StoryId;
  nextStoryTitle: string;
  nextCountry: string;
  remainingHops: number;
  scholarlyHint: string;
} | null {
  const shortest = findShortestPath(currentId, targetId);
  if (!shortest || shortest.path.length < 2) return null;

  const nextStoryId = shortest.path[1];
  const nextStory = STORIES.find((s) => s.id === nextStoryId);
  const currentStory = STORIES.find((s) => s.id === currentId);
  const targetStory = STORIES.find((s) => s.id === targetId);
  if (!nextStory || !currentStory || !targetStory) return null;

  // The motif that lights up the next story from here (the edge the path actually uses)
  const chosenMotif = shortest.edges[0].motif;
  const motifInfo = MOTIFS_CATALOG[chosenMotif];

  return {
    recommendedMotifId: chosenMotif,
    recommendedMotifName: motifInfo?.name || 'Shared Archetype',
    nextStoryId,
    nextStoryTitle: nextStory.title,
    nextCountry: nextStory.country,
    remainingHops: shortest.hops,
    scholarlyHint: `The thread of “${motifInfo?.name || chosenMotif}” connects your current tradition to ${nextStory.title} in ${nextStory.country}, leading you closer to your destination in ${targetStory.country}.`
  };
}
