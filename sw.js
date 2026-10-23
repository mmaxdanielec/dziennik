/* Dziennik Kame Gym – service worker: trzyma „skorupkę” apki (ikony, ładowarkę), żeby startowała szybko.
   Dane i wygląd dziennika zawsze idą z Apps Script – tego tu nie zapisujemy. */
var CACHE = 'kame-shell-v1';
var FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png', 'favicon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return; // API Google – bez zmian
  if (req.mode === 'navigate') {
    // strona startowa: najpierw sieć (nowa wersja skorupki), bez sieci – z pamięci
    e.respondWith(fetch(req).then(function (res) {
      var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put('./', copy); });
      return res;
    }).catch(function () { return caches.match('./'); }));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (hit) { return hit || fetch(req); }));
});
