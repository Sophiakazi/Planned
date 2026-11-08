/* Petal Planner offline cache. Version changes whenever the app files change. */
const CACHE = 'petal-544e5cdef4';
const ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "vendor/page-flip.browser.js",
  "fonts/fonts.css",
  "fonts/cormorant-garamond-normal-300-latin-ext.woff2",
  "fonts/cormorant-garamond-normal-300-latin.woff2",
  "fonts/jost-italic-300-latin-ext.woff2",
  "fonts/jost-italic-300-latin.woff2",
  "fonts/jost-normal-300-latin-ext.woff2",
  "fonts/jost-normal-300-latin.woff2",
  "fonts/pinyon-script-normal-400-latin-ext.woff2",
  "fonts/pinyon-script-normal-400-latin.woff2",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png",
  "icons/favicon-64.png"
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('petal-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
/* Show the saved copy straight away (works offline), and refresh it in the background when online. */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const key = req.mode === 'navigate' ? 'index.html' : req;
    const hit = await c.match(key, { ignoreSearch: true });
    const net = fetch(req).then(r => {
      if (r && r.ok && r.type === 'basic') c.put(key, r.clone());
      return r;
    }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    const r = await net;
    return r || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }));
});
