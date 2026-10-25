import type { StoryId } from '../types';

// A fixed destination for a start story, so a demo runs the same way every time.
// Cendrillon (France) -> Ye Xian (China) -> Sedna (Inuit): two steps. Both steps can follow "Unjust Treatment", and
// the two comparisons have written difference lines. Use it only if the route is still two steps; otherwise the
// quest falls back to a stable choice (see getReachableDestinationForSolo). Change the right-hand story to demo
// a different destination, and check it is two steps away with the first three motifs of each story.
export const DEMO_DESTINATIONS: Partial<Record<StoryId, StoryId>> = {
  cinderella: 'sedna'
};
