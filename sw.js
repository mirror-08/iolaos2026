const CACHE_NAME = 'iolaos2026-v3';
const BASE = '/iolaos2026';
const ASSETS = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/manifest.json',
  BASE + '/schedule.json',
  BASE + '/events.json',
  BASE + '/icon-192.png',
  BASE + '/icon-512.png',
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(c =>
      // cache:'reload' 로 HTTP 캐시 우회 → 항상 최신 파일을 저장
      Promise.all(
        ASSETS.map(url =>
          fetch(new Request(url, { cache: 'reload' }))
            .then(res => { if (res.ok) c.put(url, res); })
            .catch(() => {})
        )
      )
    )
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())   // 열려있는 모든 탭에 즉시 적용
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res && res.status === 200) {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});