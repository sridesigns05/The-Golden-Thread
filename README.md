# The Golden Thread

An interactive 3D globe of 15 traditional tales. Click a story, follow a shared motif to related tales
from other cultures, and read each comparison with its sources and caveats. Similarity of motif is not
evidence that one tale borrowed from another, and the app says so.

- **Frontend:** React, Vite, TypeScript, react-globe.gl / three.js, Motion, Tailwind. Served by `server.ts`
  (Express + Vite) on port 3000, which also keeps the shared-journey feature.
- **Backend:** Python, FastAPI, on port 8000. Serves the story data, rankings, comparisons, library search
  and sources (SerpApi).

## Run it locally

You need Node 20+ and Python 3.11+.

```powershell
# 1. one-time setup
npm install --legacy-peer-deps
pip install -r backend/requirements.txt

# 2. start both servers (frontend http://localhost:3000, backend http://localhost:8000)
npm run dev:all
```

Open http://localhost:3000. Press Ctrl+C once to stop both.

Run them separately if you prefer (two terminals): `npm run dev` and `npm run backend`.

The browser only talks to the app on port 3000: it forwards every `/api` call except journeys to the backend on
`127.0.0.1:8000` (set `BACKEND_URL` to change that). So the library search, sources and myth cards work from any
page address with no CORS setup. If the backend is not running, the app says so instead of showing "no match".

### Demo destination

A solo quest from Cendrillon always ends at Sedna, two steps away (Cendrillon, Ye Xian, Sedna; follow Unjust
Treatment both times). Other start stories also get one fixed destination each. To change the demo, edit
`src/data/demoQuest.ts`; a destination that is not at least two steps away is ignored.

### What if the backend is not running?

The app still works. At startup it loads a bundled snapshot of the data (`src/data/bootstrap.snapshot.json`)
and then replaces it with the backend's data if the backend answers within a couple of seconds. Only the
web-source panels and the folktale-library search need the backend. The About page says which one is in use.

### Sources from SerpApi (optional)

Source panels use SerpApi, filtered to an allowlist of reputable domains. Create `backend/.env` (it is
gitignored; see `backend/.env.example`):

```
SERPAPI_KEY=your_key_here
```

Then save results for all 15 stories once, so the demo works even with no network or no quota left:

```powershell
npm run prefetch          # 15 SerpApi searches; --dry-run (cd backend) prints the queries instead
```

Commit `backend/data/evidence_cache.json` afterwards. Set `EVIDENCE_MODE=cache` in `backend/.env` to serve
only the saved results and never call SerpApi.

### Myth cards and AI summaries (optional)

Clicking a result in the search bar opens a card: the dataset record, a search for that tale, and a short
summary written by Gemini from the record and the search snippets only. Add a key to `backend/.env`:

```
GEMINI_API_KEY=your_key_here
# GEMINI_MODEL=gemini-3.5-flash   (any model your key lists for generateContent)
```

Cards also list the Thompson motifs the ATU index gives for the tale's type, and similar tales (same or nearby tale types, and atlas stories). That data is built from the trilogy repo with `python backend/scripts/build_type_motifs.py <trilogy>/data` into `backend/data/atu_motifs.json`. Without a key the card still shows the record, motifs, similar tales and sources. Results and summaries are saved in
`backend/data/myth_cache.json`. Set `MYTH_CARD_MODE=cache` to stop cards from calling out.

## When you change the data

The story text lives in `backend/data/stories.json` (and `differences.json`, `sort_years.json`). After editing:

```powershell
npm run snapshot          # refreshes the frontend's bundled copy
npm run test:backend      # a test fails if the snapshot is out of date
npx tsc --noEmit          # type-check the frontend
```

## Content rules

- Every entry is `verified: false` until a person checks it against its source. Entries marked DRAFT rest
  on secondary sources (mostly Wikipedia) or on wording the research could not confirm.
- Dates are the earliest record found, not the origin of a tale.
- A tale-type number marked "verify" means the pairing is shown as unconfirmed.
- The folktale library (about 1,500 tales) is metadata only. Its attribution and license note are in
  About; it is never plotted on the globe.
