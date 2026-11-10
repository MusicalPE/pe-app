/* 체육 매니저 미리보기 — 화면(app.html)은 그대로 두고, 학교 앱 주소로 가는 요청만 이 창 안의 가짜 학교 시트(engine.js)로 돌립니다.
   이 기기에 기억된 진짜 학교 주소·설정은 건드리지 않게 저장소도 이 창 안에만 둡니다. */
(function () {
  'use strict';
  var DEMO_APP = 'https://script.google.com/macros/s/PE-DEMO-PREVIEW/exec';
  // 저장소: 이 창 안에서만 (진짜 학교 주소 대신 미리보기 주소를 기억한 것처럼)
  var mem = { 'peapp.school': DEMO_APP }, P = Storage.prototype, g = P.getItem, s = P.setItem, r = P.removeItem, ss = {};
  P.getItem = function (k) {
    var m = this === window.localStorage ? mem : ss;
    if (k in m) return m[k];
    if (/^pe_news:(web|lib):/.test(k) && window.WEB) return window.WEB.version;   // 새 소식 창은 미리보기에서 띄우지 않음
    return null;
  };
  P.setItem = function (k, v) { (this === window.localStorage ? mem : ss)[k] = String(v); };
  P.removeItem = function (k) { delete (this === window.localStorage ? mem : ss)[k]; };

  var realFetch = window.fetch.bind(window);
  function reply(obj) { return new Response(JSON.stringify(obj), { status: 200, headers: { 'Content-Type': 'application/json' } }); }
  function wrap(p) {
    var t0 = Date.now();
    return Promise.resolve().then(p).then(function (data) { return reply({ ok: true, data: data, ms: Date.now() - t0 }); },
      function (e) { return reply({ ok: false, error: String(e && e.message || e), ms: Date.now() - t0 }); });
  }
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    if (url.indexOf(DEMO_APP) === 0) {
      var q = new URL(url).searchParams, api = q.get('api');
      if (init && init.method === 'POST') {
        var body = {}; try { body = JSON.parse(init.body || '{}'); } catch (e) {}
        return wrap(function () { return window.PEDEMO.rpc(String(body.fn || ''), body.args || []); });
      }
      if (api === 'info') return wrap(function () { return window.PEDEMO.info(); });
      if (api === 'ping') return wrap(function () { return window.PEDEMO.info().then(function (i) { return { t: Date.now(), SERVER_API: i.SERVER_API }; }); });
      if (api === 'rpc') return wrap(function () { return window.PEDEMO.rpc(q.get('fn') || '', JSON.parse(q.get('args') || '[]')); });
      return wrap(function () { throw new Error('미리보기에서는 이 요청을 쓰지 않아요: ' + api); });
    }
    // 새 판 확인(ready.json): 미리보기는 지금 받은 판 그대로
    if (/ready\.json/.test(url) && window.WEB) return Promise.resolve(reply({ version: window.WEB.version, build: window.WEB.build }));
    return realFetch(input, init);
  };

  // 미리보기 안내 줄
  document.addEventListener('DOMContentLoaded', function () {
    var bar = document.createElement('div');
    bar.id = 'peDemoNote'; bar.setAttribute('role', 'note');
    bar.style.cssText = 'position:relative;z-index:300;background:#FFF4D6;color:#5C4510;font-size:13px;line-height:1.55;text-align:center;' +
      'padding:8px max(16px,env(safe-area-inset-right,0px)) 8px max(16px,env(safe-area-inset-left,0px));font-family:inherit';
    bar.innerHTML = '<style>@media (max-width:700px){.pv-long{display:none}}</style><b style="color:#3F2F08">미리보기</b> · 지어낸 학교예요. 비밀번호는 아무거나 넣으면 들어가요.<span class="pv-long"> 새로고침하면 처음으로 돌아가요.</span> ' +
      '<a href="https://docs.google.com/spreadsheets/d/1iyR4cNB6RvOIOdqUHLVmCqZC2Rp6E0fOOJ5P7jc3wxU/copy" target="_blank" rel="noopener" style="color:#0B5C4D;font-weight:700;white-space:nowrap">우리 학교 시트 만들기</a>';
    document.body.insertBefore(bar, document.body.firstChild);
  });
})();
