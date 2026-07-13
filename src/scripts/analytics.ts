const endpoint = document.querySelector<HTMLMetaElement>('meta[name="analytics-endpoint"]')?.content.trim() || '';
const privacySignal = navigator.doNotTrack === '1' || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;

if (endpoint && !privacySignal) {
  const sessionKey = 'xmz-visit-session';
  let sessionId = sessionStorage.getItem(sessionKey);
  if (!sessionId) {
    sessionId = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
    sessionStorage.setItem(sessionKey, sessionId);
  }

  const campaign = new URLSearchParams(location.search);
  const common = {
    path: location.pathname,
    title: document.title,
    referrer: document.referrer ? new URL(document.referrer).hostname : '',
    sessionId,
    language: navigator.language,
    viewport: `${innerWidth}x${innerHeight}`,
    screen: `${screen.width}x${screen.height}`,
    utmSource: campaign.get('utm_source') || '',
    utmMedium: campaign.get('utm_medium') || '',
    utmCampaign: campaign.get('utm_campaign') || ''
  };

  const send = (name: string, properties: Record<string, string | number | boolean> = {}) => {
    const payload = JSON.stringify({ name, timestamp: new Date().toISOString(), ...common, properties });
    const blob = new Blob([payload], { type: 'application/json' });
    if (!navigator.sendBeacon?.(endpoint, blob)) {
      void fetch(endpoint, { method: 'POST', body: payload, headers: { 'content-type': 'application/json' }, keepalive: true, mode: 'cors' }).catch(() => {});
    }
  };

  send('page_view');

  document.addEventListener('click', (event) => {
    const target = (event.target as Element).closest<HTMLAnchorElement | HTMLButtonElement>('a, button');
    if (!target) return;
    const href = target instanceof HTMLAnchorElement ? target.href.slice(0, 400) : '';
    const label = (target.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 100);
    const customEvent = target.dataset.analytics;
    send(customEvent || 'link_click', {
      label,
      href,
      outbound: target instanceof HTMLAnchorElement && target.origin !== location.origin
    });
  }, { capture: true });

  const reached = new Set<number>();
  const reportDepth = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const depth = max > 0 ? Math.round((scrollY / max) * 100) : 100;
    [25, 50, 75, 90].forEach((threshold) => {
      if (depth >= threshold && !reached.has(threshold)) {
        reached.add(threshold);
        send('scroll_depth', { depth: threshold });
      }
    });
  };
  addEventListener('scroll', reportDepth, { passive: true });
  reportDepth();

  const startedAt = Date.now();
  let visibleSince = document.visibilityState === 'visible' ? Date.now() : 0;
  let engagedMs = 0;
  const captureVisibleTime = () => {
    if (!visibleSince) return;
    engagedMs += Date.now() - visibleSince;
    visibleSince = 0;
  };
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') captureVisibleTime();
    else visibleSince = Date.now();
  });
  addEventListener('pagehide', () => {
    captureVisibleTime();
    send('engaged_time', {
      seconds: Math.max(1, Math.round(engagedMs / 1000)),
      elapsedSeconds: Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
      maxDepth: reached.size ? Math.max(...reached) : 0
    });
  });
}
