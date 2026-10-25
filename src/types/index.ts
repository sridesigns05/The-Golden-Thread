// Motif ids come from the backend vocabulary (backend/data/stories.json).
export type MotifId =
  | 'unjust-treatment'
  | 'supernatural-assistance'
  | 'lost-object-recognition'
  | 'impossible-tasks'
  | 'trickster'
  | 'transformation'
  | 'death-and-rebirth'
  | 'unusual-birth'
  | 'separation-and-reunion'
  | 'reversal-of-fortune'
  | 'memory-and-forgetting';

// The 15 curated stories, as served by the backend.
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
  | 'tam-cam'
  | 'popol-vuh-twins'
  | 'fisherman-and-the-jinni';

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
  url?: string;
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
  narrativeTraditionType: string; // short label such as "Literary fairy tale" (backend `kind`)
  sources: StorySource[];
  motifManifestations: Partial<Record<MotifId, string>>;
  distinctiveFeatures: string;
  quote?: string;
  // Fields below come from the backend; none are required by older code.
  dateCaveat?: string; // the date is the earliest record we found, not the origin
  earliestRecordedDate?: string | null;
  coordsNote?: string;
  sensitivity?: string | null;
  atuType?: string | null;
  atuUncertain?: boolean; // the tale-type number is marked "verify" in the backend
  verified?: boolean; // false until a person has checked the entry against its sources
  draftMotifs?: MotifId[]; // motif entries marked DRAFT or NEEDS SOURCE
  verifyBeforeUse?: string[];
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
  typeConfirmed?: boolean; // false when either story's tale type is marked unconfirmed
  differenceIsDraft?: boolean; // culturalDifference is a drafted line, not a verified one
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
  // Motifs the joiner followed on the way (one per thread woven)
  motifsDiscovered?: MotifId[];
  // A message is printed on an exported Passport only if its author chose that
  creatorNoteOnPassport?: boolean;
  joinerReflectionOnPassport?: boolean;
}

export type GameStage = 'landing' | 'atlas' | 'story-view' | 'guess-motif' | 'comparison' | 'completed';
