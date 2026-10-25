import type { ComparisonDetail } from './index';

// Additive extension of the existing ComparisonDetail; no existing field is renamed or removed.
export interface EvidenceSource {
  title: string;
  url: string;
  domain: string;
}

export interface ApiComparison extends ComparisonDetail {
  sources: EvidenceSource[];
  // Content stays 'unverified' until a human has checked it against its sources.
  verification: 'unverified' | 'verified';
}

import type { MotifId, StoryData } from './index';

// Exactly one motif that genuinely links this story to another; two the story does not contain.
export interface GuessOptions {
  correct: MotifId;
  decoys: [MotifId, MotifId];
}

export interface ApiStory extends StoryData {
  guessOptions: GuessOptions;
}
