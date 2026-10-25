// Types for the curated-catalog endpoints (/api/stories, /api/stories/{id}, /api/motifs).
// Separate from ./index.ts, which describes the frontend's current mock data.

export interface CatalogSource {
  title: string;
  url: string;
}

export interface ThompsonRef {
  id: string;
  name: string | null;
}

export interface CatalogMotif {
  id: string;
  label: string;
  thompsonIds: string[];
  thompson: ThompsonRef[];
  thompsonNote: string;
  thompsonVerified: boolean;
  storyCount: number;
  libraryCount: number; // library tales linked to this motif at the tale-type level
  share: number;
}

export interface CatalogMotifEntry {
  story: string;
  motif: string;
  howItAppears: string;
  evidence: CatalogSource | null;
  verified: boolean;
  draft: boolean; // text is marked DRAFT / NEEDS SOURCE
}

export interface CatalogStorySummary {
  tier: 'curated';
  id: string;
  title: string;
  region: string;
  culturalTradition: string;
  lat: number;
  lon: number;
  coordsNote: string;
  atuType: string | null;
  atuFamily: string | null;
  atuUncertain: boolean;
  earliestRecordedDate: string | null;
  sortYear: number | null; // ordering aid only, never display
  dateCaveat: string;
  summary: string;
  motifs: string[];
  verified: boolean;
  legacyId: string | null; // id in the frontend's mock data, for the original four stories
}

export interface CatalogStory extends CatalogStorySummary {
  atuNote: string | null;
  dateSource: string | null;
  form: string | null;
  summarySources: CatalogSource[];
  motifEntries: CatalogMotifEntry[];
  sensitivity: string | null;
  verifyBeforeUse: string[];
}

// GET /api/motifs/{id}[?story=...]
export interface RankedStory {
  story: CatalogStorySummary;
  tier: 'curated';
  connectionType: 'cinderella-parallel' | 'same-tale-type' | 'thematic-parallel';
  typeConfirmed: boolean; // false if either story's ATU type is itself marked uncertain
  sharedMotifs: string[];
  score: number;
  weakLink: boolean; // shares only the clicked (generic) motif
  why: CatalogMotifEntry; // how the clicked motif appears in this story (stored text)
  whyViewed: CatalogMotifEntry; // same, in the story being viewed
}

// Library tales: metadata-only entries from the trilogy/Ashliman data. They have NO coordinates or
// dates, so they can never be plotted on the globe. Their motif links come from the ATU tale type.
export interface LibrarySummary {
  tier: 'library';
  id: string;
  title: string;
  provenance: string | null; // free text as given
  placeGuess: string | null; // best-effort; sometimes an author rather than a place
  atuType: string;
  atuName: string | null;
  atuFamily: string | null;
  citation: string | null;
  motifs: string[];
  verified: boolean;
}

export interface LibraryTale extends LibrarySummary {
  dataSource: string;
  motifBasis: 'tale-type';
  thompsonMatches: Record<string, string[]>;
}

export interface TypeBasis {
  kind: 'tale-type';
  motif: string;
  atuType: string;
  atuName: string | null;
  thompson: ThompsonRef[];
  text: string; // says the link is made at the type level, not read from the tale's text
}

export interface RankedLibrary {
  tale: LibrarySummary;
  tier: 'library';
  connectionType: 'cinderella-parallel' | 'same-tale-type' | 'thematic-parallel';
  sameExactType: boolean; // same ATU code (510A with 510A), not just the same family
  sharedMotifs: string[];
  score: number;
  weakLink: boolean;
  why: TypeBasis;
}

export interface RankedGroup {
  total: number; // all curated matches; `results` is capped (pass ?all=true for everything)
  results: RankedStory[];
  libraryTotal: number; // library matches, listed separately and never ahead of curated ones
  library: RankedLibrary[];
}

export interface LibraryPage {
  total: number;
  offset: number;
  limit: number;
  tales: LibrarySummary[];
}

export interface LibraryHit {
  tale: LibrarySummary;
  score: number;
  matchedFields: string[];
}

export interface TimelineItem {
  id: string;
  title: string;
  region: string;
  lat: number;
  lon: number;
  earliestRecordedDate: string | null;
  sortYear: number | null; // ordering aid only, never display
  dateCaveat: string;
  form: string | null;
}

export interface MotifView {
  motif: CatalogMotif;
  totalStories: number;
  generic: boolean;
  viewing: string | null;
  sameType: RankedGroup | null;
  differentType: RankedGroup | null;
  fewMatches: boolean;
  highlightIds: string[]; // curated story ids to light up on the globe
  timeline: TimelineItem[];
  caveats: Record<string, string>;
}

// GET /api/search?q=
export interface StoryHit {
  story: CatalogStorySummary;
  score: number;
  matchedFields: string[];
}

export interface MotifHit {
  motif: CatalogMotif;
  score: number;
  matchedFields: string[];
}

export interface SearchResult {
  query: string;
  stories: StoryHit[]; // curated stories only
  motifs: MotifHit[];
  library: LibraryHit[]; // separate list; pass ?tiers=curated to omit
}

// GET /api/compare?a=&b=&motif=
export interface Difference {
  text: string;
  draft: boolean; // always true for now
  verified: boolean;
  basis: string;
}

export interface Comparison {
  a: CatalogStorySummary | LibrarySummary; // discriminate on `tier`
  b: CatalogStorySummary | LibrarySummary;
  motif: CatalogMotif;
  connectionType: 'cinderella-parallel' | 'same-tale-type' | 'thematic-parallel';
  typeConfirmed: boolean;
  sharedMotifs: string[];
  inA: CatalogMotifEntry | TypeBasis; // TypeBasis for a library tale
  inB: CatalogMotifEntry | TypeBasis;
  difference: Difference | null; // null when no draft line exists, an entry needs a source, or a side is a library tale
  caveats: Record<string, string>;
}
