interface Env {
  DB: D1Database;
  IP_SALT: string;
  ADMIN_USER: string;
  ADMIN_PASSWORD: string;
  ALLOWED_ORIGINS: string;
  STORE_RAW_IP: string;
  RETENTION_DAYS: string;
}

const ALLOWED_EVENTS = new Set([
  'page_view', 'link_click', 'scroll_depth', 'engaged_time', 'cv_request',
  'contact_intent', 'citation_copy', 'research_pillar', 'theme_change'
]);

const text = (value: unknown, limit: number) =>
  typeof value === 'string' ? value.replace(/[\u0000-\u001f]/g, '').slice(0, limit) : '';

const number = (value: unknown, min: number, max: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : 0;
};

const hex = (buffer: ArrayBuffer) =>
  [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('');

async function identifier(ip: string, scope: string, salt: string) {
  if (!ip || !salt) return '';
  const bytes = new TextEncoder().encode(`${salt}:${scope}:${ip}`);
  return hex(await crypto.subtle.digest('SHA-256', bytes)).slice(0, 32);
}

function networkPrefix(ip: string) {
  if (ip.includes('.')) {
    const parts = ip.split('.');
    return parts.length === 4 ? `${parts[0]}.${parts[1]}.${parts[2]}.0/24` : '';
  }
  if (ip.includes(':')) return `${ip.split(':').slice(0, 3).join(':')}::/48`;
  return '';
}

function allowedOrigins(env: Env) {
  return (env.ALLOWED_ORIGINS || 'https://xmzhangai.github.io').split(',').map((item) => item.trim()).filter(Boolean);
}

function cors(origin: string, env: Env) {
  const isAllowed = allowedOrigins(env).includes(origin);
  return {
    allowed: isAllowed,
    headers: {
      'access-control-allow-origin': isAllowed ? origin : 'null',
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
      'access-control-max-age': '86400',
      'cache-control': 'no-store',
      'content-type': 'application/json; charset=utf-8',
      'vary': 'Origin'
    }
  };
}

function json(data: unknown, status = 200, headers: HeadersInit = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers }
  });
}

function isAdmin(request: Request, env: Env) {
  const auth = request.headers.get('authorization') || '';
  if (!auth.startsWith('Basic ')) return false;
  try {
    const [user, ...passwordParts] = atob(auth.slice(6)).split(':');
    return user === env.ADMIN_USER && passwordParts.join(':') === env.ADMIN_PASSWORD;
  } catch {
    return false;
  }
}

function unauthorized() {
  return new Response('Authentication required', {
    status: 401,
    headers: { 'www-authenticate': 'Basic realm="Xuanming Research Analytics", charset="UTF-8"', 'cache-control': 'no-store' }
  });
}

async function collect(request: Request, env: Env) {
  const origin = request.headers.get('origin') || '';
  const access = cors(origin, env);
  if (!access.allowed) return new Response('{"ok":false}', { status: 403, headers: access.headers });

  const length = Number(request.headers.get('content-length') || 0);
  if (length > 12288) return new Response('{"ok":false}', { status: 413, headers: access.headers });

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return new Response('{"ok":false}', { status: 400, headers: access.headers }); }

  const eventName = text(body.name, 40);
  if (!ALLOWED_EVENTS.has(eventName)) return new Response('{"ok":false}', { status: 400, headers: access.headers });

  const propertiesInput = body.properties && typeof body.properties === 'object'
    ? body.properties as Record<string, unknown>
    : {};
  const properties = JSON.stringify({
    label: text(propertiesInput.label, 100),
    href: text(propertiesInput.href, 400),
    outbound: Boolean(propertiesInput.outbound),
    paper: text(propertiesInput.paper, 80),
    pillar: text(propertiesInput.pillar, 40),
    theme: text(propertiesInput.theme, 12),
    depth: number(propertiesInput.depth, 0, 100),
    seconds: number(propertiesInput.seconds, 0, 86400),
    elapsedSeconds: number(propertiesInput.elapsedSeconds, 0, 86400),
    maxDepth: number(propertiesInput.maxDepth, 0, 100)
  });

  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const ip = request.headers.get('CF-Connecting-IP') || '';
  const cf = request.cf as Record<string, unknown> | undefined;
  const stableVisitor = await identifier(ip, 'visitor', env.IP_SALT);
  const dailyVisitor = await identifier(ip, day, env.IP_SALT);

  await env.DB.prepare(`
    INSERT INTO events (
      occurred_at, day, event_name, path, title, referrer, session_id,
      visitor_hash, visitor_day_hash, ip_address, network_prefix,
      country, region, city, colo, timezone, user_agent, language,
      viewport, screen, utm_source, utm_medium, utm_campaign, properties
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    now.toISOString(), day, eventName, text(body.path, 300), text(body.title, 200),
    text(body.referrer, 200), text(body.sessionId, 80), stableVisitor, dailyVisitor,
    env.STORE_RAW_IP === 'true' ? text(ip, 64) : '', networkPrefix(ip),
    text(cf?.country, 2), text(cf?.region, 100), text(cf?.city, 100), text(cf?.colo, 10),
    text(cf?.timezone, 80), text(request.headers.get('user-agent'), 300), text(body.language, 30),
    text(body.viewport, 30), text(body.screen, 30), text(body.utmSource, 100),
    text(body.utmMedium, 100), text(body.utmCampaign, 150), properties
  ).run();

  return new Response('{"ok":true}', { status: 202, headers: access.headers });
}

function range(request: Request) {
  const days = number(new URL(request.url).searchParams.get('days') || 30, 1, 365);
  const since = new Date(Date.now() - (days - 1) * 86400000).toISOString().slice(0, 10);
  return { days, since };
}

async function summary(request: Request, env: Env) {
  const { days, since } = range(request);
  const statements = [
    env.DB.prepare(`SELECT
      SUM(CASE WHEN event_name='page_view' THEN 1 ELSE 0 END) AS pageViews,
      COUNT(DISTINCT CASE WHEN event_name='page_view' THEN visitor_hash END) AS visitors,
      COUNT(DISTINCT CASE WHEN event_name='page_view' THEN session_id END) AS sessions,
      SUM(CASE WHEN event_name='engaged_time' THEN CAST(json_extract(properties,'$.seconds') AS INTEGER) ELSE 0 END) AS engagedSeconds,
      SUM(CASE WHEN event_name='cv_request' THEN 1 ELSE 0 END) AS cvRequests,
      SUM(CASE WHEN event_name='link_click' THEN 1 ELSE 0 END) AS linkClicks
      FROM events WHERE day >= ?`).bind(since),
    env.DB.prepare(`SELECT day, COUNT(*) AS value FROM events WHERE event_name='page_view' AND day >= ? GROUP BY day ORDER BY day`).bind(since),
    env.DB.prepare(`SELECT path AS label, COUNT(*) AS value FROM events WHERE event_name='page_view' AND day >= ? GROUP BY path ORDER BY value DESC LIMIT 12`).bind(since),
    env.DB.prepare(`SELECT CASE WHEN referrer='' THEN 'Direct / unknown' ELSE referrer END AS label, COUNT(*) AS value FROM events WHERE event_name='page_view' AND day >= ? GROUP BY referrer ORDER BY value DESC LIMIT 10`).bind(since),
    env.DB.prepare(`SELECT CASE WHEN country='' THEN 'Unknown' ELSE country END AS label, COUNT(*) AS value FROM events WHERE event_name='page_view' AND day >= ? GROUP BY country ORDER BY value DESC LIMIT 12`).bind(since),
    env.DB.prepare(`SELECT event_name AS label, COUNT(*) AS value FROM events WHERE day >= ? GROUP BY event_name ORDER BY value DESC`).bind(since),
    env.DB.prepare(`SELECT utm_campaign AS label, COUNT(*) AS value FROM events WHERE event_name='page_view' AND day >= ? AND utm_campaign != '' GROUP BY utm_campaign ORDER BY value DESC LIMIT 10`).bind(since)
  ];
  const [headline, daily, pages, referrers, countries, events, campaigns] = await env.DB.batch(statements);
  return json({ days, since, headline: headline.results[0] || {}, daily: daily.results, pages: pages.results, referrers: referrers.results, countries: countries.results, events: events.results, campaigns: campaigns.results, rawIpEnabled: env.STORE_RAW_IP === 'true' });
}

async function recent(request: Request, env: Env) {
  const limit = Math.floor(number(new URL(request.url).searchParams.get('limit') || 100, 1, 500));
  const rows = await env.DB.prepare(`SELECT occurred_at, event_name, path, referrer, session_id, visitor_hash,
    ip_address, network_prefix, country, region, city, user_agent, properties
    FROM events ORDER BY id DESC LIMIT ?`).bind(limit).all();
  return json({ rows: rows.results, rawIpEnabled: env.STORE_RAW_IP === 'true' });
}

function csvCell(value: unknown) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

async function exportCsv(request: Request, env: Env) {
  const { days, since } = range(request);
  const result = await env.DB.prepare(`SELECT occurred_at,event_name,path,title,referrer,session_id,visitor_hash,
    ip_address,network_prefix,country,region,city,colo,timezone,user_agent,language,viewport,screen,
    utm_source,utm_medium,utm_campaign,properties FROM events WHERE day >= ? ORDER BY id DESC LIMIT 50000`).bind(since).all();
  const columns = ['occurred_at','event_name','path','title','referrer','session_id','visitor_hash','ip_address','network_prefix','country','region','city','colo','timezone','user_agent','language','viewport','screen','utm_source','utm_medium','utm_campaign','properties'];
  const lines = [columns.map(csvCell).join(','), ...result.results.map((row) => columns.map((key) => csvCell((row as Record<string, unknown>)[key])).join(','))];
  return new Response(lines.join('\n'), { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="xmz-analytics-${days}d.csv"`, 'cache-control': 'no-store' } });
}

function dashboard() {
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>XMZ Research Analytics</title><style>
  :root{color-scheme:dark;--bg:#07141e;--panel:#0d2231;--line:#26404e;--ink:#f4f1e9;--muted:#91a0a9;--accent:#50d7c8}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.5 ui-sans-serif,system-ui,-apple-system,sans-serif}header,main{width:min(1420px,calc(100% - 40px));margin:auto}header{padding:34px 0 25px;display:flex;align-items:end;justify-content:space-between;gap:25px;border-bottom:1px solid var(--line)}h1{margin:0;font:500 clamp(28px,4vw,54px)/1 Georgia,serif}header p{margin:8px 0 0;color:var(--muted)}button,a{color:var(--bg);background:var(--accent);border:0;padding:10px 14px;border-radius:999px;font-weight:750;text-decoration:none;cursor:pointer}.controls{display:flex;gap:8px;flex-wrap:wrap}.controls button{color:var(--muted);background:transparent;border:1px solid var(--line)}.controls button.on{color:var(--bg);background:var(--accent);border-color:var(--accent)}main{padding:35px 0 70px}.cards{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}.card,.panel{background:var(--panel);border:1px solid var(--line)}.card{padding:18px;min-height:125px}.card span,.panel h2{color:var(--muted);font-size:11px;letter-spacing:.08em;text-transform:uppercase}.card strong{display:block;margin-top:25px;color:var(--accent);font:500 28px/1 Georgia,serif}.grid{margin-top:10px;display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:10px}.panel{padding:20px;min-width:0}.panel h2{margin:0 0 18px}.chart{height:230px;display:flex;align-items:end;gap:4px}.bar{min-width:5px;flex:1;background:var(--accent);position:relative}.bar:hover:after{content:attr(data-tip);position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);white-space:nowrap;background:#fff;color:#000;padding:4px 7px;font-size:11px}.rank{display:grid;gap:12px}.rank div{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px}.rank span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#c5ced3}.rank i{grid-column:1/-1;height:4px;background:var(--line)}.rank i b{display:block;height:100%;background:var(--accent)}.table-panel{margin-top:10px;overflow:auto}.table-head{display:flex;align-items:center;justify-content:space-between;gap:20px}table{width:100%;min-width:1000px;border-collapse:collapse;font-size:12px}th,td{padding:11px 9px;text-align:left;border-bottom:1px solid var(--line);white-space:nowrap}th{color:var(--muted);font-size:10px;text-transform:uppercase}td.path{max-width:270px;overflow:hidden;text-overflow:ellipsis}.status{margin-left:10px;color:var(--muted);font-size:12px}.warning{color:#ffbe5c}@media(max-width:1000px){.cards{grid-template-columns:repeat(3,1fr)}.grid{grid-template-columns:1fr}}@media(max-width:600px){header{align-items:flex-start;flex-direction:column}.cards{grid-template-columns:1fr 1fr}}</style></head><body>
  <header><div><h1>Research analytics</h1><p>First-party traffic, reading, and research-intent signals.</p></div><div class="controls"><button data-days="7">7 days</button><button class="on" data-days="30">30 days</button><button data-days="90">90 days</button><a id="export" href="/api/export.csv?days=30">Export CSV</a></div></header>
  <main><section class="cards" id="cards"></section><section class="grid"><article class="panel"><h2>Page views over time</h2><div class="chart" id="daily"></div></article><article class="panel"><h2>Top pages</h2><div class="rank" id="pages"></div></article><article class="panel"><h2>Referrers</h2><div class="rank" id="referrers"></div></article></section><section class="grid"><article class="panel"><h2>Countries</h2><div class="rank" id="countries"></div></article><article class="panel"><h2>Events</h2><div class="rank" id="events"></div></article><article class="panel"><h2>Campaigns</h2><div class="rank" id="campaigns"></div></article></section><section class="panel table-panel"><div class="table-head"><h2>Recent event stream <span class="status" id="status"></span></h2><button id="refresh">Refresh</button></div><table><thead><tr><th>Time</th><th>Event</th><th>Path</th><th>Country</th><th>Network / IP</th><th>Referrer</th><th>Visitor</th></tr></thead><tbody id="recent"></tbody></table></section></main>
  <script>let days=30;const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const fmt=(n)=>new Intl.NumberFormat().format(Number(n||0));const rank=(id,rows)=>{const max=Math.max(1,...rows.map(r=>Number(r.value)));document.getElementById(id).innerHTML=rows.length?rows.map(r=>'<div><span title="'+esc(r.label)+'">'+esc(r.label)+'</span><b>'+fmt(r.value)+'</b><i><b style="width:'+Number(r.value)/max*100+'%"></b></i></div>').join(''):'<p style="color:var(--muted)">No data yet.</p>'};async function load(){document.getElementById('status').textContent='loading…';const [s,r]=await Promise.all([fetch('/api/summary?days='+days).then(x=>x.json()),fetch('/api/recent?limit=100').then(x=>x.json())]);const h=s.headline||{};const cards=[['Page views',h.pageViews],['Visitors',h.visitors],['Sessions',h.sessions],['Engaged minutes',Math.round((h.engagedSeconds||0)/60)],['CV requests',h.cvRequests],['Link clicks',h.linkClicks]];document.getElementById('cards').innerHTML=cards.map(x=>'<article class="card"><span>'+x[0]+'</span><strong>'+fmt(x[1])+'</strong></article>').join('');const max=Math.max(1,...s.daily.map(x=>Number(x.value)));document.getElementById('daily').innerHTML=s.daily.length?s.daily.map(x=>'<i class="bar" style="height:'+Math.max(3,Number(x.value)/max*100)+'%" data-tip="'+esc(x.day)+' · '+fmt(x.value)+'"></i>').join(''):'<p style="color:var(--muted)">No page views yet.</p>';['pages','referrers','countries','events','campaigns'].forEach(id=>rank(id,s[id]||[]));document.getElementById('recent').innerHTML=r.rows.map(x=>'<tr><td>'+esc(x.occurred_at)+'</td><td>'+esc(x.event_name)+'</td><td class="path" title="'+esc(x.path)+'">'+esc(x.path)+'</td><td>'+esc(x.country||'—')+'</td><td>'+esc(x.ip_address||x.network_prefix||'hashed only')+'</td><td>'+esc(x.referrer||'direct')+'</td><td>'+esc((x.visitor_hash||'').slice(0,10))+'</td></tr>').join('');document.getElementById('status').innerHTML=r.rawIpEnabled?'<span class="warning">exact IP enabled</span>':'privacy-safe network mode';document.getElementById('export').href='/api/export.csv?days='+days}document.querySelectorAll('[data-days]').forEach(b=>b.onclick=()=>{days=Number(b.dataset.days);document.querySelectorAll('[data-days]').forEach(x=>x.classList.toggle('on',x===b));load()});document.getElementById('refresh').onclick=load;load().catch(e=>document.getElementById('status').textContent='error: '+e.message);</script>
  </body></html>`, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' } });
}

async function purge(env: Env) {
  const retention = Math.floor(number(env.RETENTION_DAYS || 90, 7, 730));
  const before = new Date(Date.now() - retention * 86400000).toISOString();
  await env.DB.prepare('DELETE FROM events WHERE occurred_at < ?').bind(before).run();
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS' && url.pathname === '/collect') {
      const access = cors(request.headers.get('origin') || '', env);
      return new Response(null, { status: access.allowed ? 204 : 403, headers: access.headers });
    }
    if (request.method === 'POST' && url.pathname === '/collect') return collect(request, env);
    if (request.method === 'GET' && url.pathname === '/health') return json({ ok: true, service: 'xmz-research-analytics' });

    if (url.pathname === '/admin' || url.pathname.startsWith('/api/')) {
      if (!isAdmin(request, env)) return unauthorized();
      if (request.method === 'GET' && url.pathname === '/admin') return dashboard();
      if (request.method === 'GET' && url.pathname === '/api/summary') return summary(request, env);
      if (request.method === 'GET' && url.pathname === '/api/recent') return recent(request, env);
      if (request.method === 'GET' && url.pathname === '/api/export.csv') return exportCsv(request, env);
    }
    return json({ ok: false, error: 'not_found' }, 404);
  },
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(purge(env));
  }
};
