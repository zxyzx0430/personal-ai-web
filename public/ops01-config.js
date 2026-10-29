/* OPS01 v0.1.0. Only the PUBLIC PostHog project token belongs here. */
(function () {
  const TOKEN = ''; // phc_...; empty means disabled.
  const API_HOST = 'https://us.i.posthog.com'; // Match the PostHog project region.
  const allowedHosts = ['ai.zxyzx.me'];
  if (!TOKEN || !allowedHosts.includes(location.hostname.toLowerCase())) return;
  const sdk = document.createElement('script');
  sdk.src = 'https://zxyzx0430.github.io/zxyzx-me-lab/ops/analytics/dist/ops01-analytics.v0.1.0.js';
  sdk.async = true;
  sdk.onload = () => window.OPS01?.init({
    siteId: 'ai', token: TOKEN, apiHost: API_HOST,
    environment: 'production', allowedHosts
  });
  document.head.appendChild(sdk);
})();
