// Caveats and credits that the UI shows (About, story and comparison views). Filled in place from the
// backend before the first render; see src/api/adapter.ts. Defaults are used only until then.
export interface CatalogMeta {
  dataSource: 'backend' | 'snapshot' | 'none';
  status: string;
  dateRule: string;
  similarityRule: string;
  libraryAttribution: string;
  limitations: string[];
}

export const CATALOG_META: CatalogMeta = {
  dataSource: 'none',
  status: 'Content compiled from the sources listed on each story.',
  dateRule: 'Dates are the earliest record found, not the origin of a tale.',
  similarityRule: 'Shared motifs show similarity of story pattern, not evidence that one tale borrowed from or influenced another.',
  libraryAttribution: '',
  limitations: []
};
