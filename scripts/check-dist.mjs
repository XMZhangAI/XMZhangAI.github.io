import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve, relative, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../dist', import.meta.url)));
if (!existsSync(root)) { console.error('dist/ does not exist. Run npm run build.'); process.exit(1); }

const walk = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const path = resolve(directory, entry.name);
  return entry.isDirectory() ? walk(path) : [path];
});

const htmlFiles = walk(root).filter((path) => extname(path) === '.html');
let references = 0;
const failures = [];

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)) {
    const ref = match[1];
    if (/^(?:https?:|mailto:|data:|#)/.test(ref)) continue;
    const clean = decodeURIComponent(ref.split(/[?#]/)[0]);
    let target = clean.startsWith('/') ? resolve(root, `.${clean}`) : resolve(dirname(file), clean);
    if (existsSync(target) && statSync(target).isDirectory()) target = resolve(target, 'index.html');
    if (!existsSync(target) && !extname(target)) target = resolve(target, 'index.html');
    references++;
    if (!existsSync(target)) failures.push(`${relative(root, file)} -> ${ref}`);
  }
}

if (existsSync(resolve(root, 'sw.js'))) failures.push('dist/sw.js exists; this release must not register a service worker.');

if (failures.length) {
  console.error(`\nVerification failed (${failures.length} issue(s)):\n${failures.map((item) => `- ${item}`).join('\n')}\n`);
  process.exit(1);
}

console.log(`Verified ${htmlFiles.length} HTML pages and ${references} local references; 0 missing. No service worker present.`);
