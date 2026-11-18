import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rootEnvPath = path.join(rootDirectory, '.env');
if (existsSync(rootEnvPath)) {
  process.loadEnvFile(rootEnvPath);
}

function readPort(name, fallback) {
  const value = process.env[name] ?? fallback;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${name} debe ser un puerto entre 1 y 65535.`);
  }
  return port;
}

const backendPort = readPort('BACKEND_PORT', 3000);
const frontendPort = readPort('FRONTEND_PORT', 5173);
const backendDirectory = path.join(rootDirectory, 'apps', 'backend');
const frontendDirectory = path.join(rootDirectory, 'apps', 'frontend');
const children = [];
let shuttingDown = false;

function signalChild(child, signal) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  if (process.platform === 'win32') {
    child.kill(signal);
    return;
  }
  try {
    process.kill(-child.pid, signal);
  } catch (error) {
    if (error.code !== 'ESRCH') throw error;
  }
}

function shutdown(signal = 'SIGTERM', exitCode = signal === 'SIGINT' ? 130 : 143) {
  if (shuttingDown) return;
  shuttingDown = true;
  process.exitCode = exitCode;
  for (const child of children) signalChild(child, signal);
}

function startProcess(name, directory, args, extraEnv) {
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const child = spawn(npmCommand, args, {
    cwd: directory,
    env: { ...process.env, ...extraEnv },
    stdio: 'inherit',
    detached: process.platform !== 'win32',
    shell: process.platform === 'win32',
  });
  children.push(child);
  console.info(`[${name}] starting`);

  child.once('error', (error) => {
    console.error(`[${name}] failed to start:`, error);
    shutdown('SIGTERM', 1);
  });
  child.once('exit', (code, signal) => {
    if (shuttingDown) return;
    console.error(`[${name}] stopped unexpectedly (code=${code}, signal=${signal}).`);
    shutdown('SIGTERM', code ?? 1);
  });
  return child;
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

startProcess('backend', backendDirectory, ['run', 'dev'], {
  PORT: String(backendPort),
  CORS_ORIGIN: process.env.CORS_ORIGIN || `http://127.0.0.1:${frontendPort}`,
});
startProcess('frontend', frontendDirectory, ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(frontendPort), '--strictPort'], {
  BACKEND_URL: `http://127.0.0.1:${backendPort}`,
});

console.info(`Frontend: http://127.0.0.1:${frontendPort}`);
console.info(`Backend:  http://127.0.0.1:${backendPort}/api`);
