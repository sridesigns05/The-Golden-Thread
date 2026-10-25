import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { hydrateFromSnapshot, refreshFromBackend } from './api/adapter';

// The story, motif and comparison data is loaded before the first render:
//   1. from the bundled snapshot (always available, so the app never starts empty), then
//   2. from the backend, if it answers within a couple of seconds (fresher data wins).
hydrateFromSnapshot();

refreshFromBackend().finally(() => {
  createRoot(document.getElementById('root')!).render(<App />);
});
