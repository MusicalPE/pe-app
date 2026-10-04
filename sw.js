/* 새 화면 서비스 워커 — 홈 화면에 앱으로 설치할 수 있게 하고, 앱 파일을 기기에 기억해 둠 (v3.2.2, 화면 판 3.2.11)
   · app.html?v=판 : 판마다 주소가 달라 내용이 바뀌지 않음 → 기기에 있으면 바로 씀(빠름). 새 판을 받으면 옛 판은 지움
   · 그 밖의 같은 출처 파일(로더·아이콘·설명 파일) : 인터넷 먼저, 안 되면 기억한 것
   · ready.json 과 학교 서버(구글) 요청은 손대지 않음 — 기록은 늘 학교 시트로 바로 감 */
var C = 'peapp-shell';
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function (e) {
  var req = e.request, u = new URL(req.url);
  if (req.method !== 'GET' || u.origin !== self.location.origin || /ready\.json$/.test(u.pathname) || /\/poc\//.test(u.pathname)) return;
  var isApp = /\/app\.html$/.test(u.pathname) && u.searchParams.get('v');
  if (isApp) {
    e.respondWith(caches.open(C).then(function (c) {
      return c.match(req).then(function (hit) {
        if (hit) return hit;
        return fetch(req).then(function (r) {
          if (r.ok) {
            var copy = r.clone();
            c.keys().then(function (ks) { ks.forEach(function (k) { if (/\/app\.html\?/.test(k.url) && k.url !== req.url) c.delete(k); }); });
            c.put(req, copy);
          }
          return r;
        });
      });
    }));
    return;
  }
  e.respondWith(fetch(req).then(function (r) {
    if (r.ok) { var copy = r.clone(); caches.open(C).then(function (c) { c.put(req, copy); }); }
    return r;
  }).catch(function () {
    return caches.match(req).then(function (m) {
      if (m) return m;
      if (req.mode === 'navigate') return caches.open(C).then(function (c) { return c.keys().then(function (ks) { var a = ks.filter(function (k) { return /\/app\.html\?/.test(k.url); })[0]; return a ? c.match(a) : Response.error(); }); });
      return Response.error();
    });
  }));
});
