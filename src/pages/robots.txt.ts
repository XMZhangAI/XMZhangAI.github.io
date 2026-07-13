export const GET = ({ site }: { site: URL }) => new Response(
  `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', site)}\n`,
  { headers: { 'content-type': 'text/plain; charset=utf-8' } }
);
