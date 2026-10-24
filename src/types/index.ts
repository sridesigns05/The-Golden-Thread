export type MotifId =
  | 'unjust-treatment'
  | 'supernatural-assistance'
  | 'lost-object-recognition'
  | 'transformation'
  | 'reversal-of-fortune'
  | 'separation-and-reunion'
  | 'memory-and-forgetting'
  | 'love-and-duty';

export type StoryId = 'cinderella' | 'kongjwi' | 'yexian' | 'shakuntala';

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
  storySignificance: string; // How this motif manifests broadly
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
  fullRetelling: string[];
  keyElements: string[];
  motifs: MotifId[];
  narrativeTraditionType: 'Cinderella-Type Folktale' | 'Classical Sanskrit Drama';
  sources: StorySource[];
  motifManifestations: Record<MotifId, string>;
  distinctiveFeatures: string;
  quote?: string;
}

export interface ComparisonDetail {
  id: string; // e.g. "cinderella-kongjwi"
  storyAId: StoryId;
  storyBId: StoryId;
  sharedMotif: MotifId;
  appearanceInA: string;
  appearanceInB: string;
  culturalDifference: string;
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

export type GameStage = 'landing' | 'atlas' | 'story-view' | 'guess-motif' | 'comparison' | 'completed';
