const endpoint = document.querySelector<HTMLMetaElement>('meta[name="analytics-endpoint"]')?.content || '';
const dnt = navigator.doNotTrack === '1';

if (endpoint && !dnt) {
  const key = 'xmz-visit-session';
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
    sessionStorage.setItem(key, sessionId);
  }

  const send = (name: string, properties: Record<string, string> = {}) => {
    const payload = JSON.stringify({
      name,
      path: location.pathname,
      referrer: document.referrer ? new URL(document.referrer).hostname : '',
      sessionId,
      language: navigator.language,
      viewport: `${innerWidth}x${innerHeight}`,
      timestamp: new Date().toISOString(),
      ...properties
    });
    navigator.sendBeacon?.(endpoint, new Blob([payload], { type: 'application/json' }));
  };

  send('page_view', { title: document.title });
  document.addEventListener('click', (event) => {
    const target = (event.target as Element).closest<HTMLAnchorElement | HTMLButtonElement>('a, button');
    if (!target) return;
    send('link_click', {
      label: (target.textContent || '').trim().slice(0, 100),
      href: target instanceof HTMLAnchorElement ? target.href.slice(0, 400) : ''
    });
  }, { capture: true });
}
