/* ──────────────────────────────────────────────────────────────
   체육 매니저 미리보기 — 가짜 학교 시트
   학교 프로그램(라이브러리 PE, MusicalPE/pe-assistant 의 .gs)을 그대로 브라우저에서 돌리고,
   스프레드시트 · 드라이브 · 캐시 대신 이 창 안의 가짜 것을 씁니다. 새로고침하면 처음으로.
   window.PEDEMO = { ready, info(), rpc(fn, args) }
   Made by 음악적체육인
   ────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var RealDate = Date;
  var SRC = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? '/__pe_src/' : 'https://raw.githubusercontent.com/MusicalPE/pe-assistant/main/';
  var FILES = ['Lib.gs', 'Code.gs', 'PAPS_Data.gs', 'FMS_Data.gs', 'Mod_Class.gs', 'Mod_Eval.gs', 'Mod_Paps.gs', 'Mod_Fit.gs', 'Mod_Rope.gs', 'Mod_Fms.gs', 'Mod_Mat.gs', 'Mod_Club.gs', 'Updater.gs'];

  /* ── 시계: 지난 기록을 꾸밀 때만 앞당김 ── */
  var NOW = null;
  function FakeDate() {
    var a = Array.prototype.slice.call(arguments);
    if (!a.length) return new RealDate(NOW !== null ? NOW : RealDate.now());
    return new (Function.prototype.bind.apply(RealDate, [null].concat(a)))();
  }
  FakeDate.prototype = RealDate.prototype;
  FakeDate.now = function () { return NOW !== null ? NOW : RealDate.now(); };
  FakeDate.UTC = RealDate.UTC; FakeDate.parse = RealDate.parse;

  /* ── 모르는 서식 함수는 아무 일 없이 자기 자신을 돌려줌 ── */
  function chainable(obj) { var p = new Proxy(obj, { get: function (t, k) { if (k in t) return t[k]; if (typeof k === 'string' && k !== 'then' && k !== 'toJSON') return function () { return p; }; return undefined; } }); return p; }

  /* ── SHA-256 (비밀번호 거르기, 바로 답해야 해서 직접 계산) ── */
  function sha256Bytes(str) {
    var msg = unescape(encodeURIComponent(str)), K = [], H = [], i, j;
    function frac(x) { return ((x - Math.floor(x)) * 4294967296) | 0; }
    for (var n = 2, c = 0; c < 64; n++) { var pr = true; for (j = 2; j * j <= n; j++) if (n % j === 0) { pr = false; break; } if (pr) { if (c < 8) H[c] = frac(Math.pow(n, 1 / 2)); K[c] = frac(Math.pow(n, 1 / 3)); c++; } }
    var bytes = []; for (i = 0; i < msg.length; i++) bytes.push(msg.charCodeAt(i));
    var bl = bytes.length * 8; bytes.push(0x80); while (bytes.length % 64 !== 56) bytes.push(0);
    for (i = 7; i >= 0; i--) bytes.push(i >= 4 ? 0 : (bl >>> (i * 8)) & 255);
    var w = new Array(64);
    for (var o = 0; o < bytes.length; o += 64) {
      for (i = 0; i < 16; i++) w[i] = (bytes[o + 4 * i] << 24) | (bytes[o + 4 * i + 1] << 16) | (bytes[o + 4 * i + 2] << 8) | bytes[o + 4 * i + 3];
      for (i = 16; i < 64; i++) {
        var s0 = ((w[i - 15] >>> 7) | (w[i - 15] << 25)) ^ ((w[i - 15] >>> 18) | (w[i - 15] << 14)) ^ (w[i - 15] >>> 3);
        var s1 = ((w[i - 2] >>> 17) | (w[i - 2] << 15)) ^ ((w[i - 2] >>> 19) | (w[i - 2] << 13)) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      var a = H[0], b = H[1], c2 = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (i = 0; i < 64; i++) {
        var S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
        var t1 = (h + S1 + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0;
        var S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
        var t2 = (S0 + ((a & b) ^ (a & c2) ^ (b & c2))) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c2; c2 = b; b = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c2) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    var out = []; H.forEach(function (x) { for (var k = 3; k >= 0; k--) { var v = (x >>> (k * 8)) & 255; out.push(v > 127 ? v - 256 : v); } });
    return out;
  }

  /* ── 가짜 스프레드시트 ── */
  function blank(v) { return v === '' || v === null || v === undefined; }
  function Sheet(name) { this.name = name; this.rows = []; this.hidden = false; }
  Sheet.prototype = {
    getName: function () { return this.name; },
    getSheetName: function () { return this.name; },
    _trim: function () { var r = this.rows; while (r.length && r[r.length - 1].every(blank)) r.pop(); },
    getLastRow: function () { this._trim(); return this.rows.length; },
    getMaxRows: function () { return Math.max(1000, this.rows.length); },
    getMaxColumns: function () { return Math.max(26, this.getLastColumn()); },
    getLastColumn: function () {
      var w = 0;
      this.rows.forEach(function (r) { for (var i = r.length - 1; i >= 0; i--) { if (!blank(r[i])) { if (i + 1 > w) w = i + 1; break; } } });
      return w;
    },
    _cell: function (r, c) { var row = this.rows[r - 1]; if (!row) return ''; var v = row[c - 1]; return blank(v) ? '' : v; },
    _put: function (r, c, v) {
      if (r > 5000) return;   // 서식만 넓게 거는 경우(빈 줄 끝까지)는 무시
      while (this.rows.length < r) this.rows.push([]);
      var row = this.rows[r - 1]; while (row.length < c) row.push('');
      row[c - 1] = v instanceof RealDate ? new RealDate(v.getTime()) : v;
    },
    getRange: function (row, col, nr, nc) {
      if (typeof row === 'string') {
        var m = /^([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?$/.exec(row);
        var cn = function (s) { var x = 0; for (var i = 0; i < s.length; i++) x = x * 26 + s.charCodeAt(i) - 64; return x; };
        if (m) { col = cn(m[1]); var r1 = +m[2]; nr = m[3] ? +m[4] - r1 + 1 : 1; nc = m[3] ? cn(m[3]) - col + 1 : 1; row = r1; }
        else { row = 1; col = 1; nr = 1; nc = 1; }
      }
      return chainable(new Range(this, row, col, nr || 1, nc || 1));
    },
    getDataRange: function () { return this.getRange(1, 1, Math.max(1, this.getLastRow()), Math.max(1, this.getLastColumn())); },
    appendRow: function (arr) { this._trim(); var r = this.rows.length + 1; var self = this; arr.forEach(function (v, i) { self._put(r, i + 1, v); }); return this; },
    deleteRow: function (r) { this.rows.splice(r - 1, 1); return this; },
    deleteRows: function (r, n) { this.rows.splice(r - 1, n); return this; },
    insertRowsAfter: function (r, n) { var a = []; for (var i = 0; i < n; i++) a.push([]); Array.prototype.splice.apply(this.rows, [r, 0].concat(a)); return this; },
    hideSheet: function () { this.hidden = true; return this; },
    showSheet: function () { this.hidden = false; return this; },
    isSheetHidden: function () { return this.hidden; },
    getSheetId: function () { return this.name.length; },
    getParent: function () { return book; }
  };
  function Range(sh, r, c, nr, nc) { this.sh = sh; this.r = r; this.c = c; this.nr = nr; this.nc = nc; }
  Range.prototype = {
    getValues: function () {
      var out = [];
      for (var i = 0; i < this.nr; i++) { var row = []; for (var j = 0; j < this.nc; j++) { var v = this.sh._cell(this.r + i, this.c + j); row.push(v instanceof RealDate ? new RealDate(v.getTime()) : v); } out.push(row); }
      return out;
    },
    getDisplayValues: function () { return this.getValues().map(function (r) { return r.map(function (v) { return String(v); }); }); },
    getValue: function () { return this.sh._cell(this.r, this.c); },
    setValue: function (v) { for (var i = 0; i < this.nr; i++) for (var j = 0; j < this.nc; j++) this.sh._put(this.r + i, this.c + j, v); return this; },
    setValues: function (vals) { for (var i = 0; i < vals.length; i++) for (var j = 0; j < vals[i].length; j++) this.sh._put(this.r + i, this.c + j, vals[i][j]); return this; },
    clearContent: function () { for (var i = 0; i < this.nr && this.r + i <= this.sh.rows.length; i++) for (var j = 0; j < this.nc; j++) this.sh._put(this.r + i, this.c + j, ''); return this; },
    clear: function () { return this.clearContent(); },
    getRow: function () { return this.r; }, getColumn: function () { return this.c; },
    getNumRows: function () { return this.nr; }, getNumColumns: function () { return this.nc; },
    getSheet: function () { return this.sh; }
  };

  var book = {
    sheets: [], title: '햇살초등학교 체육 (예시)',
    getName: function () { return this.title; }, getId: function () { return 'demo-sheet'; }, getUrl: function () { return ''; },
    getSpreadsheetTimeZone: function () { return 'Asia/Seoul'; },
    getSheetByName: function (n) { for (var i = 0; i < this.sheets.length; i++) if (this.sheets[i].name === n) return chainable(this.sheets[i]); return null; },
    insertSheet: function (n) { var s = new Sheet(n || ('시트' + (this.sheets.length + 1))); this.sheets.push(s); return chainable(s); },
    getSheets: function () { return this.sheets.map(chainable); },
    deleteSheet: function (s) { this.sheets = this.sheets.filter(function (x) { return x.name !== s.getName(); }); },
    toast: function () {}
  };

  /* ── 드라이브 (사진은 이 창 안에만) ── */
  function Bytes(b64) { this.b64 = String(b64 || ''); this.length = Math.floor(this.b64.length * 3 / 4); }
  function strToB64(s) { return btoa(unescape(encodeURIComponent(String(s)))); }
  function Blob(bytes, type, name) {
    this.b64 = bytes instanceof Bytes ? bytes.b64 : (typeof bytes === 'string' ? strToB64(bytes) : '');
    this.type = type || 'application/octet-stream'; this.name = name || 'file';
  }
  Blob.prototype = {
    getBytes: function () { return new Bytes(this.b64); }, getContentType: function () { return this.type; },
    getName: function () { return this.name; }, setName: function (n) { this.name = n; return this; },
    getDataAsString: function () { try { return decodeURIComponent(escape(atob(this.b64))); } catch (e) { return ''; } },
    copyBlob: function () { return new Blob(new Bytes(this.b64), this.type, this.name); },
    setContentType: function (t) { this.type = t; return this; }
  };
  var drive = {}, dseq = 0;
  function iter(list) { var i = 0; return { hasNext: function () { return i < list.length; }, next: function () { return list[i++]; } }; }
  function DFile(blob, parent) { this.id = 'f' + (++dseq); this.blob = blob; this.parent = parent; drive[this.id] = this; }
  DFile.prototype = {
    getId: function () { return this.id; }, getName: function () { return this.blob.name; }, getBlob: function () { return this.blob; },
    getMimeType: function () { return this.blob.type; }, getSize: function () { return new Bytes(this.blob.b64).length; },
    getUrl: function () { return 'data:' + this.blob.type + ';base64,' + this.blob.b64; },
    getParents: function () { return iter(this.parent ? [this.parent] : []); },
    setTrashed: function () { delete drive[this.id]; return this; }, moveTo: function (f) { this.parent = f; return this; },
    setSharing: function () { return this; }, setName: function (n) { this.blob.name = n; return this; }
  };
  function DFolder(name, parent) { this.id = 'd' + (++dseq); this.name = name; this.parent = parent; drive[this.id] = this; }
  DFolder.prototype = {
    getId: function () { return this.id; }, getName: function () { return this.name; }, getUrl: function () { return '#demo-folder'; },
    createFile: function (blob) { return new DFile(blob instanceof Blob ? blob : new Blob('', '', ''), this); },
    createFolder: function (n) { return new DFolder(n, this); },
    getFoldersByName: function (n) { var self = this; return iter(Object.keys(drive).map(function (k) { return drive[k]; }).filter(function (x) { return x instanceof DFolder && x.parent === self && x.name === n; })); },
    getParents: function () { return iter(this.parent ? [this.parent] : []); },
    setSharing: function () { return this; }, setTrashed: function () { delete drive[this.id]; return this; }
  };
  var root = new DFolder('내 드라이브', null);
  var sheetFile = new DFile(new Blob('', 'application/vnd.google-apps.spreadsheet', book.title), root);
  sheetFile.id = 'demo-sheet'; drive['demo-sheet'] = sheetFile;
  var DriveApp = {
    getFileById: function (id) { var f = drive[id]; if (!f) throw new Error('파일을 찾지 못했습니다.'); return f; },
    getFolderById: function (id) { var f = drive[id]; if (!(f instanceof DFolder)) throw new Error('폴더를 찾지 못했습니다.'); return f; },
    createFolder: function (n) { return new DFolder(n, root); }, createFile: function (b) { return root.createFile(b); },
    getRootFolder: function () { return root; },
    Access: { ANYONE_WITH_LINK: 1, ANYONE: 2, PRIVATE: 3, DOMAIN_WITH_LINK: 4 }, Permission: { VIEW: 1, EDIT: 2, COMMENT: 3 }
  };

  /* ── 캐시 · 잠금 · 그 밖의 도구 ── */
  var cache = {};
  function alive(k) { var x = cache[k]; if (!x) return null; if (x.e < RealDate.now()) { delete cache[k]; return null; } return x.v; }
  var Cache = {
    get: function (k) { return alive(k); },
    put: function (k, v, ttl) { cache[k] = { v: String(v), e: RealDate.now() + Math.min(ttl || 600, 21600) * 1000 }; },
    remove: function (k) { delete cache[k]; },
    getAll: function (ks) { var o = {}; (ks || []).forEach(function (k) { var v = alive(k); if (v !== null) o[k] = v; }); return o; },
    putAll: function (o, ttl) { Object.keys(o || {}).forEach(function (k) { Cache.put(k, o[k], ttl); }); },
    removeAll: function (ks) { (ks || []).forEach(function (k) { delete cache[k]; }); }
  };
  var lock = { waitLock: function () {}, tryLock: function () { return true; }, releaseLock: function () {}, hasLock: function () { return true; } };
  var props = {};
  var Props = {
    getProperty: function (k) { return Object.prototype.hasOwnProperty.call(props, k) ? props[k] : null; },
    setProperty: function (k, v) { props[k] = String(v); return Props; },
    setProperties: function (o) { Object.keys(o || {}).forEach(function (k) { props[k] = String(o[k]); }); return Props; },
    deleteProperty: function (k) { delete props[k]; return Props; },
    getProperties: function () { var o = {}; Object.keys(props).forEach(function (k) { o[k] = props[k]; }); return o; },
    getKeys: function () { return Object.keys(props); }
  };
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  var Utilities = {
    getUuid: function () { try { return crypto.randomUUID(); } catch (e) { return 'u' + RealDate.now().toString(36) + Math.random().toString(36).slice(2); } },
    formatDate: function (d, tz, fmt) {
      if (!(d instanceof RealDate)) d = new RealDate(d);
      var y = d.getFullYear(), M = d.getMonth() + 1, D = d.getDate(), h = d.getHours(), mi = d.getMinutes(), s = d.getSeconds();
      var parts = String(fmt).split("'"), out = '';
      parts.forEach(function (p, i) {
        out += i % 2 ? p : p.replace(/yyyy|yy|MM|dd|HH|mm|ss|M|d|H|E|a/g, function (t) {
          return { yyyy: y, yy: String(y).slice(2), MM: pad(M), dd: pad(D), HH: pad(h), mm: pad(mi), ss: pad(s), M: M, d: D, H: h, E: '일월화수목금토'[d.getDay()], a: h < 12 ? '오전' : '오후' }[t];
        });
      });
      return out;
    },
    computeDigest: function (alg, str) { return sha256Bytes(String(str)); },
    DigestAlgorithm: { SHA_256: 'SHA_256', MD5: 'MD5' }, Charset: { UTF_8: 'UTF_8' },
    base64Encode: function (x) { return x instanceof Bytes ? x.b64 : Array.isArray(x) ? btoa(String.fromCharCode.apply(null, x.map(function (b) { return b & 255; }))) : strToB64(x); },
    base64EncodeWebSafe: function (x) { return Utilities.base64Encode(x).replace(/\+/g, '-').replace(/\//g, '_'); },
    base64Decode: function (s) { return new Bytes(String(s || '').replace(/\s/g, '')); },
    base64DecodeWebSafe: function (s) { var t = String(s || '').replace(/-/g, '+').replace(/_/g, '/'); while (t.length % 4) t += '='; return new Bytes(t); },
    newBlob: function (data, type, name) { return new Blob(data, type, name); },
    newBlobFromString: function (s) { return { getDataAsString: function () { return s; } }; },
    sleep: function () {}
  };
  var G = {
    SpreadsheetApp: { getActiveSpreadsheet: function () { return book; }, openById: function () { return book; }, getUi: function () { throw new Error('미리보기에는 시트 메뉴가 없어요.'); }, flush: function () {} },
    PropertiesService: { getScriptProperties: function () { return Props; }, getDocumentProperties: function () { return Props; }, getUserProperties: function () { return Props; } },
    CacheService: { getScriptCache: function () { return Cache; }, getDocumentCache: function () { return Cache; }, getUserCache: function () { return Cache; } },
    LockService: { getScriptLock: function () { return lock; }, getDocumentLock: function () { return lock; }, getUserLock: function () { return lock; } },
    Utilities: Utilities,
    Session: { getScriptTimeZone: function () { return 'Asia/Seoul'; }, getActiveUser: function () { return { getEmail: function () { return ''; } }; }, getEffectiveUser: function () { return { getEmail: function () { return ''; } }; } },
    UrlFetchApp: { fetch: function () { throw new Error('미리보기에서는 바깥으로 보내지 않아요.'); }, fetchAll: function () { throw new Error('미리보기에서는 바깥으로 보내지 않아요.'); } },
    DriveApp: DriveApp,
    DocumentApp: { create: function () { throw new Error('미리보기에서는 문서를 만들지 않아요. 설치하면 내 드라이브에 결과 문서가 만들어져요.'); }, ParagraphHeading: {}, HorizontalAlignment: {} },
    ScriptApp: { getService: function () { return { getUrl: function () { return ''; } }; }, getProjectTriggers: function () { return []; }, newTrigger: function () { return chainable({}); }, deleteTrigger: function () {} },
    ContentService: { createTextOutput: function (t) { return { setMimeType: function () { return t; }, getContent: function () { return t; } }; }, MimeType: { JSON: 'json', TEXT: 'text' } },
    HtmlService: { createHtmlOutput: function () { return chainable({}); }, createHtmlOutputFromFile: function () { return chainable({ getContent: function () { return ''; } }); }, createTemplateFromFile: function () { return chainable({}); }, XFrameOptionsMode: {} },
    MimeType: { JPEG: 'image/jpeg', PNG: 'image/png', PDF: 'application/pdf' },
    Logger: { log: function () {} },
    Date: FakeDate
  };

  /* ── 학교 프로그램 불러오기 ── */
  var S = null;
  function boot(srcs) {
    var src = srcs.join('\n;\n');
    var names = [], re = /^function\s+([^\s(]+)\s*\(/gm, m;
    while ((m = re.exec(src))) names.push(m[1]);
    var uniq = names.filter(function (n, i) { return names.indexOf(n) === i; });
    var keys = Object.keys(G);
    var tail = '\n;var __G = {' + uniq.map(function (n) { return JSON.stringify(n) + ':' + n; }).join(',') + '};' +
      '전역_ = function () { return __G; };' +
      'return { G: __G, setCtx: function (c) { CTX_ = c; } };';
    var f = new Function(keys.join(','), src + tail);
    S = f.apply(null, keys.map(function (k) { return G[k]; }));
  }

  var ready = Promise.all(FILES.map(function (n) {
    return fetch(SRC + n, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(n + ' 을(를) 받지 못했어요 (' + r.status + ')'); return r.text(); });
  })).then(function (srcs) {
    boot(srcs);
    if (window.PEDEMO_SEED) { try { window.PEDEMO_SEED(api); } catch (e) { console.warn('미리보기 준비', e); } }
  });

  var api = {
    S: function () { return S; },
    clock: function (t) { NOW = t; },
    RealDate: RealDate,
    book: book,
    call: function (fn, args) { return S.G.rpc(fn, args || [], {}); }
  };
  window.PEDEMO = {
    ready: ready,
    api: api,
    info: function () { return ready.then(function () { return S.G.입구정보_(); }); },
    rpc: function (fn, args) {
      return ready.then(function () {
        if (fn === 'loginTeacher') args = [window.PEDEMO_TPW || '1234'];
        if (fn === 'changeTeacherPassword') throw new Error('미리보기에서는 비밀번호를 바꾸지 않아요.');
        if (fn === 'loginStudent' && window.PEDEMO_PIN) args = [args[0], args[1], args[2], window.PEDEMO_PIN(args[0], args[1], args[2]) || args[3]];
        return S.G.rpc(fn, args || [], {});
      });
    }
  };
})();
