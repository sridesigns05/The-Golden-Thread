import { StoryId, MotifId } from '../types';
import { STORIES } from '../data/stories';
import { MOTIFS_CATALOG } from '../data/motifs';

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
 * Builds an adjacency map of the 15-story graph based on shared motifs.
 * Two stories share an edge if they have at least one motif in common.
 */
export function buildStoryGraph(): Map<StoryId, { neighbor: StoryId; sharedMotifs: MotifId[] }[]> {
  const graph = new Map<StoryId, { neighbor: StoryId; sharedMotifs: MotifId[] }[]>();

  STORIES.forEach((s) => {
    graph.set(s.id, []);
  });

  for (let i = 0; i < STORIES.length; i++) {
    for (let j = i + 1; j < STORIES.length; j++) {
      const storyA = STORIES[i];
      const storyB = STORIES[j];

      // Find shared motifs
      const shared = storyA.motifs.filter((m) => storyB.motifs.includes(m));
      if (shared.length > 0) {
        graph.get(storyA.id)?.push({ neighbor: storyB.id, sharedMotifs: shared });
        graph.get(storyB.id)?.push({ neighbor: storyA.id, sharedMotifs: shared });
      }
    }
  }

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

/**
 * Picks a random reachable destination that is ideally 2 to 3 hops away from the start story.
 * If 2-3 hops not available, picks the furthest reachable node.
 */
export function getReachableDestinationForSolo(startId: StoryId): StoryId {
  const candidate2Hops: StoryId[] = [];
  const candidate3Hops: StoryId[] = [];
  const candidateAnyHops: StoryId[] = [];

  STORIES.forEach((s) => {
    if (s.id === startId) return;
    const res = findShortestPath(startId, s.id);
    if (res) {
      if (res.hops === 2) candidate2Hops.push(s.id);
      else if (res.hops === 3) candidate3Hops.push(s.id);
      else candidateAnyHops.push(s.id);
    }
  });

  if (candidate2Hops.length > 0 && (candidate3Hops.length === 0 || Math.random() > 0.4)) {
    return candidate2Hops[Math.floor(Math.random() * candidate2Hops.length)];
  }
  if (candidate3Hops.length > 0) {
    return candidate3Hops[Math.floor(Math.random() * candidate3Hops.length)];
  }
  if (candidateAnyHops.length > 0) {
    return candidateAnyHops[Math.floor(Math.random() * candidateAnyHops.length)];
  }

  // Fallback to another story
  const others = STORIES.filter((s) => s.id !== startId);
  return others[Math.floor(Math.random() * others.length)].id;
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

  // Find shared motif between current and next
  const shared = currentStory.motifs.filter((m) => nextStory.motifs.includes(m));
  const chosenMotif = shared[0] || currentStory.motifs[0];
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
