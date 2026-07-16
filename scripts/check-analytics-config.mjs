const raw = process.env.PUBLIC_ANALYTICS_ENDPOINT?.trim() || '';

if (!raw) {
  console.error('PUBLIC_ANALYTICS_ENDPOINT is empty. Refusing to publish a production build with analytics disabled.');
  console.error('Set the GitHub Actions repository variable to the full HTTPS Worker URL ending in /collect.');
  process.exit(1);
}

let endpoint;
try {
  endpoint = new URL(raw);
} catch {
  console.error('PUBLIC_ANALYTICS_ENDPOINT is not a valid absolute URL.');
  process.exit(1);
}

if (endpoint.protocol !== 'https:' || !endpoint.pathname.endsWith('/collect')) {
  console.error('PUBLIC_ANALYTICS_ENDPOINT must use HTTPS and end with /collect.');
  process.exit(1);
}

console.log(`Analytics collector configured: ${endpoint.origin}${endpoint.pathname}`);
