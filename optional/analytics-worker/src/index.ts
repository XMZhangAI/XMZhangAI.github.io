interface Env {
  DB: D1Database;
  IP_SALT: string;
  ALLOWED_ORIGIN: string;
}

const ALLOWED_EVENTS = new Set([
  'page_view',
  'link_click',
  'citation_copy',
  'research_pillar',
  'theme_change'
]);

const text = (value: unknown, limit: number) =>
  typeof value === 'string' ? value.replace(/[\u0000-\u001f]/g, '').slice(0, limit) : '';

const hex = (buffer: ArrayBuffer) =>
  [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('');

async function dailyHash(ip: string, day: string, salt: string) {
  if (!ip || !salt) return '';
  const data = new TextEncoder().encode(`${salt}:${day}:${ip}`);
  return hex(await crypto.subtle.digest('SHA-256', data)).slice(0, 24);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('origin') || '';
    const allowedOrigin = env.ALLOWED_ORIGIN || 'https://xmzhangai.github.io';
    const headers = {
      'access-control-allow-origin': origin === allowedOrigin ? origin : allowedOrigin,
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
      'cache-control': 'no-store',
      'content-type': 'application/json; charset=utf-8',
      'vary': 'Origin'
    };

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST' || origin !== allowedOrigin) {
      return new Response('{"ok":false}', { status: 403, headers });
    }

    const length = Number(request.headers.get('content-length') || 0);
    if (length > 8192) return new Response('{"ok":false}', { status: 413, headers });

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return new Response('{"ok":false}', { status: 400, headers });
    }

    const eventName = text(body.name, 40);
    if (!ALLOWED_EVENTS.has(eventName)) return new Response('{"ok":false}', { status: 400, headers });

    const now = new Date();
    const day = now.toISOString().slice(0, 10);
    const ip = request.headers.get('CF-Connecting-IP') || '';
    const visitorHash = await dailyHash(ip, day, env.IP_SALT);
    const properties = JSON.stringify({
      label: text(body.label, 100),
      href: text(body.href, 400),
      paper: text(body.paper, 80),
      pillar: text(body.pillar, 40),
      theme: text(body.theme, 12)
    });

    await env.DB.prepare(`
      INSERT INTO events
      (occurred_at, day, event_name, path, referrer, session_id, visitor_day_hash, country, language, viewport, properties)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      now.toISOString(),
      day,
      eventName,
      text(body.path, 300),
      text(body.referrer, 200),
      text(body.sessionId, 80),
      visitorHash,
      text(request.cf?.country, 2),
      text(body.language, 20),
      text(body.viewport, 30),
      properties
    ).run();

    return new Response('{"ok":true}', { status: 202, headers });
  }
};
