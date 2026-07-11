import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

if (!existsSync(resolve(root, 'node_modules', 'astro'))) {
  console.log('\nInstalling website dependencies once…\n');
  const install = spawnSync(npm, ['install'], { cwd: root, stdio: 'inherit' });
  if (install.status !== 0) process.exit(install.status || 1);
}

const dev = spawn(npm, ['run', 'dev', '--', '--host', '127.0.0.1'], { cwd: root, stdio: 'inherit' });
dev.on('exit', (code) => process.exit(code || 0));
process.on('SIGINT', () => dev.kill('SIGINT'));
