import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const nextBin = resolve(projectRoot, 'node_modules', '.bin', 'next');
const nodePath = '/usr/local/bin';

const child = spawn(nextBin, ['dev', '--webpack'], {
  cwd: projectRoot,
  env: { ...process.env, PATH: `${nodePath}:${process.env.PATH || '/usr/bin:/bin'}` },
  stdio: 'inherit',
});
child.on('exit', (code) => process.exit(code ?? 1));
