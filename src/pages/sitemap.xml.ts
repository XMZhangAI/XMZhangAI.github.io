const routes = [
  ['/', '1.0'],
  ['/projects/mariolm/', '0.8'],
  ['/notes/', '0.8'],
  ['/blog/MetaMind/', '0.9'],
  ['/blog/MetaMind/technical-contribution/', '0.9'],
  ['/blog/MetaMind/cognitive-frontier/', '0.8'],
  ['/connect/', '0.5'],
  ['/privacy/', '0.2']
];

export const GET = ({ site }: { site: URL }) => {
  const entries = routes.map(([path, priority]) =>
    `  <url><loc>${new URL(path, site)}</loc><priority>${priority}</priority></url>`
  ).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`, {
    headers: { 'content-type': 'application/xml; charset=utf-8' }
  });
};
