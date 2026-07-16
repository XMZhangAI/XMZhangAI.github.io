const endpoint = new URL(process.env.PUBLIC_ANALYTICS_ENDPOINT);
const siteOrigin = new URL(process.env.PUBLIC_SITE_URL || 'https://xmzhangai.github.io').origin;
const health = new URL('/health', endpoint);
const signal = AbortSignal.timeout(12_000);

const healthResponse = await fetch(health, { signal, headers: { accept: 'application/json' } });
if (!healthResponse.ok) {
  console.error(`Analytics health check failed: ${healthResponse.status} ${healthResponse.statusText}`);
  process.exit(1);
}

const healthBody = await healthResponse.json();
if (healthBody?.ok !== true || (healthBody?.database && healthBody.database !== 'ready')) {
  console.error('Analytics Worker is reachable, but its health check is not ready.');
  process.exit(1);
}

const corsResponse = await fetch(endpoint, {
  method: 'OPTIONS',
  signal,
  headers: {
    origin: siteOrigin,
    'access-control-request-method': 'POST',
    'access-control-request-headers': 'content-type'
  }
});

if (corsResponse.status !== 204 || corsResponse.headers.get('access-control-allow-origin') !== siteOrigin) {
  console.error(`Analytics CORS check failed for ${siteOrigin}. Add this exact origin to ALLOWED_ORIGINS and redeploy the Worker.`);
  process.exit(1);
}

const databaseStatus = healthBody.database === 'ready' ? 'Worker and D1 are ready' : 'Worker is reachable (redeploy the bundled Worker to add the D1 probe)';
console.log(`${databaseStatus}; CORS allows ${siteOrigin}.`);
