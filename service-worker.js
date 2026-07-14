const CACHE = 'loorebee-business-hub-v1';
const ASSETS = ['dashboard.html','index.html','css/variables.css','css/reset.css','css/layout.css','css/components.css','css/utilities.css','css/responsive.css','js/app.js','js/database.js','js/storage.js','js/formatters.js','js/charts.js','js/components/layout.js','js/pages/dashboard.js','database/schema.js','database/demo-data.json','manifest.json'];
self.addEventListener('install', (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS))));
self.addEventListener('activate', (event) => event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))));
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => response)));
});
