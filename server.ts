import express, { Request, Response } from 'express';
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
}

const journeyDatabase: Map<string, StoredJourney> = new Map();

// Seed initial sample journey for immediate discovery
journeyDatabase.set('silk-road-ancient', {
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
  const { id, creatorStoryId, creatorNote, creatorName } = req.body;
  if (!id || !creatorStoryId) {
    return res.status(400).json({ error: 'Missing required journey parameters' });
  }

  const newJourney: StoredJourney = {
    id,
    creatorStoryId,
    creatorNote: creatorNote || '',
    creatorName: creatorName || 'Fellow Traveler',
    createdAt: Date.now(),
    isComplete: false
  };

  journeyDatabase.set(id, newJourney);
  res.status(201).json(newJourney);
});

// POST Complete Journey with Reflection
app.post('/api/journeys/:id/complete', (req: Request, res: Response) => {
  const { id } = req.params;
  const { joinerStoryId, joinerReflection, joinerName, pathTaken } = req.body;

  const journey = journeyDatabase.get(id);
  if (!journey) {
    return res.status(404).json({ error: 'Journey not found' });
  }

  journey.joinerStoryId = joinerStoryId;
  journey.joinerReflection = joinerReflection;
  journey.joinerName = joinerName || 'Traveler';
  journey.isComplete = true;
  journey.completedAt = Date.now();
  if (pathTaken) journey.pathTaken = pathTaken;

  journeyDatabase.set(id, journey);
  res.json(journey);
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
