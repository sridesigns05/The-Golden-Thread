export type MotifId =
  | 'unjust-treatment'
  | 'supernatural-assistance'
  | 'lost-object-recognition'
  | 'transformation'
  | 'reversal-of-fortune'
  | 'separation-and-reunion'
  | 'memory-and-forgetting'
  | 'love-and-duty';

export type StoryId =
  | 'cinderella'
  | 'kongjwi'
  | 'yexian'
  | 'shakuntala'
  | 'vasilisa'
  | 'anansi'
  | 'momotaro'
  | 'golden-crab'
  | 'urashima-taro'
  | 'sedna'
  | 'rhodopis'
  | 'one-hand-girl'
  | 'mufaro'
  | 'popol-vuh-twins'
  | 'baba-abdalla';

export type GameMode = 'solo-quest' | 'shared-journey' | 'free-exploration';

export type ConnectionClassification = 'cinderella-parallel' | 'thematic-parallel';

export interface StoryCoordinates {
  lat: number;
  lng: number;
  label: string;
}

export interface MotifInfo {
  id: MotifId;
  name: string;
  shortDescription: string;
  storySignificance: string;
}

export interface StorySource {
  title: string;
  authorOrAttribution: string;
  dateOrEra: string;
  context: string;
}

export interface StoryData {
  id: StoryId;
  title: string;
  originalOrAlternateTitle: string;
  country: string;
  culturalTradition: string;
  coordinates: StoryCoordinates;
  summary: string;
  shortRetelling: string; // Max 60 words for the open book page
  fullRetelling: string[];
  keyElements: string[];
  motifs: MotifId[];
  narrativeTraditionType: 'Cinderella-Type Folktale' | 'Classical Sanskrit Drama' | 'Mythological Epic' | 'Trickster Tale' | 'Heroic Legend' | 'Folk Romance';
  sources: StorySource[];
  motifManifestations: Partial<Record<MotifId, string>>;
  distinctiveFeatures: string;
  quote?: string;
}

export interface ComparisonDetail {
  id: string; // e.g. "cinderella-kongjwi"
  storyAId: StoryId;
  storyBId: StoryId;
  sharedMotif: MotifId;
  similarity: string; // Concise, <= 20 words
  culturalDifference: string; // Concise, <= 20 words
  appearanceInA?: string;
  appearanceInB?: string;
  classification: ConnectionClassification;
  scholarlyNote: string;
}

export interface GoldenThreadConnection {
  id: string;
  storyA: StoryId;
  storyB: StoryId;
  motif: MotifId;
  unlockedAt: number;
}

export interface SoloQuestState {
  isActive: boolean;
  startStoryId: StoryId;
  targetStoryId: StoryId;
  currentStoryId: StoryId;
  visitedStoryIds: StoryId[];
  movesTaken: number;
  minHops: number;
  nonProgressMoves: number;
  activeHint: string | null;
  isComplete: boolean;
}

export interface SharedJourneyData {
  id: string;
  creatorStoryId: StoryId;
  creatorNote: string;
  creatorName?: string;
  createdAt: number;
  // Filled when Player B engages/completes
  joinerStoryId?: StoryId;
  joinerReflection?: string;
  joinerName?: string;
  isComplete?: boolean;
  completedAt?: number;
  pathTaken?: StoryId[];
}

export type GameStage = 'landing' | 'atlas' | 'story-view' | 'guess-motif' | 'comparison' | 'completed';
