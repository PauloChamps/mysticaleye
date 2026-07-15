const CACHE = 'loorebee-business-hub-v2';
const ASSETS = ['./', './dashboard.html', './index.html', './clientes.html', './leads.html', './projetos.html', './css/variables.css', './css/reset.css', './css/layout.css', './css/components.css', './css/utilities.css', './css/responsive.css', './js/app.js', './js/database.js', './js/storage.js', './js/formatters.js', './js/charts.js', './js/components/layout.js', './js/pages/dashboard.js', './js/pages/clients.js', './js/pages/leads.js', './js/pages/projects.js', './database/schema.js', './database/demo-data.json', './manifest.json'];
const NETWORK_FIRST = /\/(js|database)\//;

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (NETWORK_FIRST.test(url.pathname)) {
    event.respondWith(fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request)));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(event.request, copy));
    return response;
  })));
});
