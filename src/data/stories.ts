import { StoryData } from '../types';

// The 15 curated stories. This array starts empty and is filled in place, before the first render,
// from the backend (/api/bootstrap) or from the bundled snapshot (bootstrap.snapshot.json); see
// src/api/adapter.ts and src/main.tsx. The story text now lives in backend/data/stories.json.
export const STORIES: StoryData[] = [];
