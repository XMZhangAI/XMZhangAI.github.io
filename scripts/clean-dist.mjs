import { rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

rmSync(resolve(fileURLToPath(new URL('../dist', import.meta.url))), { recursive: true, force: true });
