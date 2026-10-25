// Starts the backend (FastAPI on :8000) and the frontend (Express + Vite on :3000) together.
//   npm run dev:all
// Press Ctrl+C once to stop both.
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const python = process.env.PYTHON || 'python';
const isWindows = process.platform === 'win32';

const services = [
  {
    name: 'backend ',
    command: python,
    args: ['-m', 'uvicorn', 'app.main:app', '--reload', '--port', '8000'],
    cwd: path.join(root, 'backend')
  },
  {
    name: 'frontend',
    command: isWindows ? 'npx.cmd' : 'npx',
    args: ['tsx', 'server.ts'],
    cwd: root
  }
];

const children = [];
let stopping = false;

function stopAll(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    try {
      if (isWindows) spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore' });
      else child.kill('SIGTERM');
    } catch {
      // already gone
    }
  }
  setTimeout(() => process.exit(code), 500);
}

for (const svc of services) {
  const child = spawn(svc.command, svc.args, { cwd: svc.cwd, shell: isWindows, env: process.env });
  children.push(child);
  const prefix = (stream) => (chunk) =>
    String(chunk)
      .split(/\r?\n/)
      .filter(Boolean)
      .forEach((line) => stream.write(`[${svc.name}] ${line}\n`));
  child.stdout.on('data', prefix(process.stdout));
  child.stderr.on('data', prefix(process.stderr));
  child.on('error', (err) => {
    console.error(`[${svc.name}] could not start: ${err.message}`);
    stopAll(1);
  });
  child.on('exit', (code) => {
    if (!stopping) {
      console.error(`[${svc.name}] exited with code ${code}; stopping the other service`);
      stopAll(code ?? 1);
    }
  });
}

process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));

console.log('Starting The Golden Thread: frontend http://localhost:3000 , backend http://localhost:8000');
