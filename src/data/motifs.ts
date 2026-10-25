import { MotifId, MotifInfo } from '../types';

// Motif descriptions. Filled in place from the backend vocabulary (backend/data/stories.json)
// before the first render; see src/api/adapter.ts.
export const MOTIFS_CATALOG = {} as Record<MotifId, MotifInfo>;
