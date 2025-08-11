// api/scholar.ts
export const config = { runtime: 'edge' };

export default async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get('user');
  if (!user) return new Response(JSON.stringify({ error: 'missing user' }), { status: 400 });

  const key = (globalThis as any).SERPAPI_KEY; // ✅ 从环境变量读取（Edge Runtime）
  if (!key) return new Response(JSON.stringify({ error: 'missing key' }), { status: 500 });

  const u = `https://serpapi.com/search.json?engine=google_scholar_author&author_id=${user}&api_key=${key}`;
  const r = await fetch(u, { cache: 'no-store' }); // 避免边缘缓存
  if (!r.ok) return new Response(JSON.stringify({ error: 'bad upstream' }), { status: 502 });

  const j = await r.json();
  const citations = j?.cited_by?.table?.[0]?.citations?.all ?? j?.author?.cited_by?.all ?? null;
  const hindex    = j?.cited_by?.table?.[1]?.h_index?.all ?? j?.author?.h_index ?? null;

  return new Response(JSON.stringify({ citations, hindex }), {
    headers: {
      'content-type': 'application/json',
      // 彻底禁止缓存，保证你看到最新数
      'cache-control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'pragma': 'no-cache',
      'expires': '0',
      'surrogate-control': 'no-store',
    },
  });
};
