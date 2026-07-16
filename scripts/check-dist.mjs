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
if (existsSync(resolve(root, 'CV.pdf'))) failures.push('dist/CV.pdf exists; the CV must remain private in this release.');

const primaryPages = [
  'index.html',
  'notes/index.html',
  'blog/MetaMind/index.html',
  'blog/MetaMind/technical-contribution/index.html',
  'blog/MetaMind/cognitive-frontier/index.html',
  'connect/index.html'
];
for (const page of primaryPages) {
  const file = resolve(root, page);
  if (!existsSync(file)) { failures.push(`${page} is missing.`); continue; }
  const html = readFileSync(file, 'utf8');
  if (!/property="og:image" content="https:\/\//.test(html)) failures.push(`${page} has no absolute Open Graph image.`);
  if (process.env.PUBLIC_ANALYTICS_ENDPOINT && !html.includes(`name="analytics-endpoint" content="${process.env.PUBLIC_ANALYTICS_ENDPOINT}"`)) {
    failures.push(`${page} does not contain the configured analytics endpoint.`);
  }
}

for (const page of ['notes/index.html', 'blog/MetaMind/index.html', 'blog/MetaMind/technical-contribution/index.html', 'blog/MetaMind/cognitive-frontier/index.html']) {
  const html = readFileSync(resolve(root, page), 'utf8');
  if (/\p{Script=Han}/u.test(html)) failures.push(`${page} contains non-English Han-script content.`);
}

if (failures.length) {
  console.error(`\nVerification failed (${failures.length} issue(s)):\n${failures.map((item) => `- ${item}`).join('\n')}\n`);
  process.exit(1);
}

console.log(`Verified ${htmlFiles.length} HTML pages and ${references} local references; 0 missing. Social metadata present; CV private; no service worker.`);
