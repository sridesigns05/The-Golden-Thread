import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'public')));

// In-memory Shared Journey Store (persisting asynchronous multiplayer challenges across browser sessions)
interface StoredJourney {
  id: string;
  creatorStoryId: string;
  creatorNote: string;
  creatorName?: string;
  createdAt: number;
  joinerStoryId?: string;
  joinerReflection?: string;
  joinerName?: string;
  isComplete?: boolean;
  completedAt?: number;
  pathTaken?: string[];
  motifsDiscovered?: string[];
  // Consent flags: a message appears on an exported Passport only if its author said so.
  creatorNoteOnPassport?: boolean;
  joinerReflectionOnPassport?: boolean;
}

const journeyDatabase: Map<string, StoredJourney> = new Map();

// Journeys are saved to a JSON file so a shared link still works after the server restarts.
const JOURNEYS_FILE = path.resolve(__dirname, 'data', 'journeys.json');

function loadJourneys() {
  try {
    const raw = JSON.parse(fs.readFileSync(JOURNEYS_FILE, 'utf-8')) as StoredJourney[];
    raw.forEach((j) => journeyDatabase.set(j.id, j));
  } catch {
    // No file yet, or unreadable: start empty
  }
}

function saveJourneys() {
  try {
    fs.mkdirSync(path.dirname(JOURNEYS_FILE), { recursive: true });
    const tmp = `${JOURNEYS_FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify([...journeyDatabase.values()], null, 2));
    fs.renameSync(tmp, JOURNEYS_FILE);
  } catch (err) {
    console.warn('[The Golden Thread] could not save journeys:', (err as Error).message);
  }
}

const ID_PATTERN = /^[A-Za-z0-9_-]{4,64}$/;
const clip = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const idList = (v: unknown, max = 40): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && ID_PATTERN.test(x)).slice(0, max) : [];

// Seed initial sample journey for immediate discovery
loadJourneys();
if (!journeyDatabase.has('silk-road-ancient')) journeyDatabase.set('silk-road-ancient', {
  id: 'silk-road-ancient',
  creatorStoryId: 'shakuntala',
  creatorName: 'Sage Kanva',
  creatorNote: 'From the quiet hermitage of the Malini River, can you find the golden thread that joins our sacred rings across the mountains?',
  createdAt: Date.now() - 3600000
});

// API Routes
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', name: 'The Golden Thread', timestamp: Date.now() });
});

// GET Journey by ID
app.get('/api/journeys/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const journey = journeyDatabase.get(id);
  if (!journey) {
    return res.status(404).json({ error: 'Journey not found' });
  }
  res.json(journey);
});

// POST Create Shared Journey
app.post('/api/journeys', (req: Request, res: Response) => {
  const { id, creatorStoryId, creatorNote, creatorName, creatorNoteOnPassport } = req.body ?? {};
  if (typeof id !== 'string' || !ID_PATTERN.test(id) || typeof creatorStoryId !== 'string' || !ID_PATTERN.test(creatorStoryId)) {
    return res.status(400).json({ error: 'Missing or invalid journey parameters' });
  }
  if (journeyDatabase.has(id)) {
    return res.status(409).json({ error: 'A journey with this id already exists' });
  }

  const newJourney: StoredJourney = {
    id,
    creatorStoryId,
    creatorNote: clip(creatorNote, 600),
    creatorName: clip(creatorName, 60) || 'Fellow Traveler',
    creatorNoteOnPassport: creatorNoteOnPassport === true,
    createdAt: Date.now(),
    isComplete: false
  };

  journeyDatabase.set(id, newJourney);
  saveJourneys();
  res.status(201).json(newJourney);
});

// POST Complete Journey with Reflection (once only: a finished journey is not overwritten)
app.post('/api/journeys/:id/complete', (req: Request, res: Response) => {
  const { id } = req.params;
  const { joinerStoryId, joinerReflection, joinerName, pathTaken, motifsDiscovered, joinerReflectionOnPassport } =
    req.body ?? {};

  const journey = journeyDatabase.get(id);
  if (!journey) {
    return res.status(404).json({ error: 'Journey not found' });
  }
  if (journey.isComplete) {
    return res.status(409).json({ error: 'This journey is already complete', journey });
  }
  if (typeof joinerStoryId !== 'string' || !ID_PATTERN.test(joinerStoryId)) {
    return res.status(400).json({ error: 'Missing or invalid joinerStoryId' });
  }

  journey.joinerStoryId = joinerStoryId;
  journey.joinerReflection = clip(joinerReflection, 600);
  journey.joinerName = clip(joinerName, 60) || 'Traveler';
  journey.joinerReflectionOnPassport = joinerReflectionOnPassport === true;
  journey.isComplete = true;
  journey.completedAt = Date.now();
  journey.pathTaken = idList(pathTaken);
  journey.motifsDiscovered = idList(motifsDiscovered);

  journeyDatabase.set(id, journey);
  saveJourneys();
  res.json(journey);
});

// Everything else under /api belongs to the Python backend. The browser talks only to this server, so the
// backend works from any page address (localhost, 127.0.0.1, a phone on the same network) with no CORS setup.
const BACKEND_URL = process.env.BACKEND_URL ?? 'http://127.0.0.1:8000';

app.use('/api', async (req: Request, res: Response, next) => {
  if (req.path === '/health' || req.path.startsWith('/journeys')) return next();
  try {
    const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
    const upstream = await fetch(`${BACKEND_URL}${req.originalUrl}`, {
      method: req.method,
      headers: hasBody ? { 'content-type': 'application/json' } : undefined,
      body: hasBody ? JSON.stringify(req.body ?? {}) : undefined,
      signal: AbortSignal.timeout(90_000)
    });
    res.status(upstream.status);
    const type = upstream.headers.get('content-type');
    if (type) res.setHeader('content-type', type);
    res.send(Buffer.from(await upstream.arrayBuffer()));
  } catch {
    res.status(502).json({ error: 'The backend is not reachable', backend: BACKEND_URL });
  }
});

// Integration with Vite
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[The Golden Thread] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
