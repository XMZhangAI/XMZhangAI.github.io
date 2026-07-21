import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const files = {
  layout: await readFile(join(root, 'src/layouts/SiteLayout.astro'), 'utf8'),
  global: await readFile(join(root, 'src/styles/global.css'), 'utf8'),
  essay: await readFile(join(root, 'src/styles/field-note.css'), 'utf8'),
  portability: await readFile(join(root, 'src/components/blog/CrossModelPortability.astro'), 'utf8'),
  trace: await readFile(join(root, 'src/components/LongHorizonTrace.astro'), 'utf8'),
};

const checks = [
  ['responsive viewport metadata', files.layout.includes('width=device-width, initial-scale=1')],
  ['page-level overflow containment', files.global.includes('overflow-x: clip')],
  ['mobile article breakpoint', files.essay.includes('@media (max-width: 720px)')],
  ['formula width reset', /\.equation-row\s*\{\s*min-width:\s*0/.test(files.essay)],
  ['table touch scrolling', files.essay.includes('-webkit-overflow-scrolling: touch')],
  ['portable chart width reset', /\.axis, \.rows\s*\{\s*width:\s*100%;\s*min-width:\s*0/.test(files.portability)],
  ['trajectory chart width reset', /svg\s*\{\s*width:\s*100%;\s*min-width:\s*0/.test(files.trace)],
];

const failures = checks.filter(([, ok]) => !ok).map(([label]) => label);
if (failures.length) {
  console.error(`Mobile contract failed: ${failures.join(', ')}`);
  process.exit(1);
}

console.log(`Mobile contract verified (${checks.length} checks).`);
