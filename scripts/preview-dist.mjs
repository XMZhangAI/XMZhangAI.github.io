import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { resolve, extname, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const distRoot = resolve(projectRoot, 'dist');
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || '127.0.0.1';
const displayHost = host === '0.0.0.0' ? '127.0.0.1' : host;

if (!existsSync(resolve(distRoot, 'index.html'))) {
  console.error('\nThe production build is missing. Run: npm install && npm run build\n');
  process.exit(1);
}

const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.xml': 'application/xml; charset=utf-8'
};

const openBrowser = (url) => {
  const command = process.platform === 'win32' ? 'cmd' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
  const child = spawn(command, args, { detached: true, stdio: 'ignore' });
  child.unref();
};

const server = createServer((request, response) => {
  let pathname;
    try { pathname = decodeURIComponent(new URL(request.url || '/', `http://${displayHost}:${port}`).pathname); }
  catch { response.writeHead(400).end('Bad request'); return; }

  let candidate = resolve(distRoot, `.${normalize(pathname).split(sep).join('/')}`);
  if (!candidate.startsWith(distRoot)) { response.writeHead(403).end('Forbidden'); return; }
  if (existsSync(candidate) && statSync(candidate).isDirectory()) candidate = resolve(candidate, 'index.html');
  if (!existsSync(candidate) && !extname(candidate)) candidate = resolve(candidate, 'index.html');
  if (!existsSync(candidate)) candidate = resolve(distRoot, '404.html');

  response.writeHead(candidate.endsWith('404.html') && pathname !== '/404.html' ? 404 : 200, {
    'content-type': mime[extname(candidate)] || 'application/octet-stream',
    'cache-control': 'no-store'
  });
  createReadStream(candidate).pipe(response);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') console.error(`\nPort ${port} is already in use. Close the other preview window or run: PORT=4174 npm run preview:dist\n`);
  else console.error(error);
  process.exit(1);
});

server.listen(port, host, () => {
  const url = `http://${displayHost}:${port}/`;
  console.log(`\nXuanming Zhang research website\n${url}\n\nKeep this window open while reviewing. Press Ctrl+C to stop.\n`);
  if (process.env.NO_OPEN !== '1') {
    try { openBrowser(url); } catch { console.log(`Open ${url} in a browser.`); }
  }
});
