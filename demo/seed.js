/* 체육 매니저 미리보기 — 지어낸 학교 채우기
   학교 프로그램의 함수를 그대로 불러 쓰므로(교사 · 학생으로 로그인해서 넣음) 실제로 쓴 것과 같은 모양의 자료가 쌓입니다.
   학생 이름은 모두 지어낸 것입니다. */
window.PEDEMO_SEED = function (api) {
  'use strict';
  var G = api.S().G, D = api.RealDate, DAY = 86400000;
  var seed = 11; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  function pick(a) { return a[Math.floor(rnd() * a.length)]; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  var T0 = new D(); T0.setHours(0, 0, 0, 0);
  function day(n) { return new D(T0.getTime() + n * DAY); }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function at(n, h, m) { var d = day(n); d.setHours(h, m || 0, 0, 0); api.clock(d.getTime()); return d; }
  function safe(name, fn) { try { return fn(); } catch (e) { console.warn('미리보기 준비 · ' + name, e); } }
  function bizDays(from, to) { var out = []; for (var i = from; i <= to; i++) { var w = day(i).getDay(); if (w > 0 && w < 6) out.push(i); } return out; }

  at(-75, 8);
  var tok = G.loginTeacher('1234').토큰;
  // 초기 비밀번호(1234)를 쓰면 로그인하자마자 비밀번호 바꾸기 화면이 떠서, 미리보기는 따로 정한 비밀번호로 (아무거나 넣어도 이것으로 들어감)
  window.PEDEMO_TPW = 'demo-' + Math.random().toString(36).slice(2, 8);
  G.속성저장_('TEACHER_PW_HASH', G.hash_(window.PEDEMO_TPW));
  G.설정저장_({ 학년범위: '5,6', 반범위: '3' });   // 화면의 학년·반 고르기가 5학년부터 보이게
  G.t_saveSettings(tok, { 프로그램이름: '체육 매니저', 학생용이름: '나의 체육 매니저', 학교명: '햇살초등학교 (예시)', 담당자: '예시 선생님', 사용알림: '끔' });

  /* ── 학생 명단: 5학년 1·2반, 6학년 1반 ── */
  var 성 = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '류', '홍'];
  var 남이름 = ['도윤', '하준', '서준', '시우', '은우', '지호', '이안', '유준', '민준', '건우', '우진', '선우', '연우', '지한', '도현', '현우', '준서', '승우'];
  var 여이름 = ['서아', '하윤', '지아', '하은', '서윤', '아린', '지유', '채원', '수아', '예린', '다인', '유나', '지안', '소율', '하린', '나은', '시아', '윤서'];
  var 반들 = [[5, 1], [5, 2], [6, 1]], used = {};
  반들.forEach(function (gc) {
    var lines = [];
    for (var n = 1; n <= 22; n++) {
      var sex = n % 2 ? '남' : '여', nm;
      do { nm = pick(성) + pick(sex === '남' ? 남이름 : 여이름); } while (used[nm]);
      used[nm] = 1; lines.push(n + ' ' + nm + ' ' + sex);
    }
    G.t_bulkAdd(tok, gc[0], gc[1], lines.join('\n'), {});
  });
  var 학생 = G.학생목록_(false);
  function 반학생(g, c) { return 학생.filter(function (s) { return s.학년 === g && s.반 === c; }); }
  window.PEDEMO_PIN = function (g, c, n) {
    var s = G.학생목록_(false).filter(function (x) { return x.학년 === Number(g) && x.반 === Number(c) && x.번호 === Number(n); })[0];
    return s ? s.초기비밀번호 : '';
  };
  var 토큰표 = {};
  function 학생토큰(s) {
    if (!토큰표[s.학생ID]) { var r = G.loginStudent(s.학년, s.반, s.번호, s.초기비밀번호); 토큰표[s.학생ID] = r && r.토큰; }
    return 토큰표[s.학생ID];
  }
  var 힘 = {}; 학생.forEach(function (s) { 힘[s.학생ID] = 0.55 + rnd() * 0.9; });

  /* ── 수업 도우미: 시간표 · 진도 · 수업 기록 · 팀 ── */
  safe('수업 도우미', function () {
    var 표 = { '1-1': '5-1', '1-3': '6-1', '2-2': '5-2', '2-5': '5-1', '3-1': '6-1', '3-4': '5-2', '4-2': '5-1', '4-3': '6-1', '5-1': '5-2', '5-5': '6-1' };
    [1, 2].forEach(function (sem) { Object.keys(표).forEach(function (k) { G.class_t_saveCell(tok, sem, k, { 반: 표[k], 장소: pick(['체육관', '운동장', '체육관', '강당']) }); }); });
    var 진도5 = [['건강', '체력 운동의 원리'], ['건강', '순환 운동으로 체력 기르기'], ['건강', '줄넘기로 심폐지구력 기르기'], ['스포츠', '티볼 던지기와 받기'], ['스포츠', '티볼 치고 달리기'],
      ['스포츠', '티볼 수비 위치 익히기'], ['스포츠', '티볼 간이 경기'], ['스포츠', '티볼 리그전'], ['표현', '리듬에 맞춰 움직이기'], ['표현', '모둠 줄넘기 표현 만들기'], ['표현', '표현 발표회'], ['건강', '2학기 체력 측정']];
    var 진도6 = [['건강', '나의 체력 진단하기'], ['건강', '체력 운동 계획 세우기'], ['스포츠', '플라잉디스크 던지고 받기'], ['스포츠', '얼티밋 규칙 익히기'], ['스포츠', '얼티밋 간이 경기'],
      ['스포츠', '킨볼 협동 경기'], ['스포츠', '킨볼 리그전'], ['표현', '민속 무용 기본 동작'], ['표현', '모둠 창작 무용'], ['표현', '창작 무용 발표'], ['건강', '응급 처치 익히기'], ['건강', '2학기 체력 측정']];
    [[5, 진도5], [6, 진도6]].forEach(function (x) {
      G.class_t_addPlans(tok, x[0], x[1].map(function (p, i) { return { 차시: i + 1, 단원: p[0], 주제: p[1], 내용: p[1] + ' 활동', 준비물: i % 3 === 0 ? '줄넘기, 콘' : i % 3 === 1 ? '공, 조끼' : '음악, 스피커', 장소: '체육관' }; }), true);
    });
    var 계획 = G.class_t_boot(tok).계획 || [];
    var 태그 = ['적극 참여', '배려 행동', '복장 미비', '준비물 미지참'];
    bizDays(-18, -1).forEach(function (n) {
      var w = day(n).getDay();
      Object.keys(표).forEach(function (k) {
        var p = k.split('-'); if (Number(p[0]) !== w) return;
        var gc = 표[k].split('-').map(Number), 명단 = 반학생(gc[0], gc[1]);
        var 상태 = {}, 특이 = {};
        if (rnd() < 0.5) 상태[pick(명단).학생ID] = pick(['결석', '지각', '견학']);
        for (var i = 0; i < 2; i++) if (rnd() < 0.7) 특이[pick(명단).학생ID] = pick(태그);
        var pl = 계획.filter(function (x) { return Number(x.학년) === gc[0]; })[Math.min(8, Math.floor((18 + n) / 3))];
        at(n, 9 + Number(p[1]), 40);
        G.class_t_saveRecord(tok, { 날짜: ymd(day(n)), 교시: Number(p[1]), 반: 표[k], 계획id: pl ? (pl.id || pl.계획ID) : '', 연결: '자동', 메모: pick(['', '', '모둠 활동이 잘 됨', '비가 와서 체육관으로']), 상태: 상태, 특이: 특이 });
      });
    });
    api.clock(null);
    var 명단 = 반학생(5, 1).slice().sort(function () { return rnd() - 0.5; }), 팀 = [[], [], [], []];
    명단.forEach(function (s, i) { 팀[i % 4].push({ 학생ID: s.학생ID, 주장: i < 4 }); });
    G.class_t_saveTeams(tok, { 학년: 5, 반: 1, 이름: '티볼 리그 팀', 방식: '팀수', 수: 4, 팀: 팀.map(function (t, i) { return { 이름: ['호랑이', '독수리', '돌고래', '치타'][i], 학생: t }; }), 공개: true });
  });

  /* ── 수행평가 ── */
  safe('수행평가', function () {
    G.eval_t_addPlans(tok, 5, 2, ['티볼 치고 달리기, 관찰 평가, 10월', '모둠 줄넘기 표현, 발표 평가, 11월', '체력 운동 계획 실천, 기록장, 12월'].join('\n'), 3);
    G.eval_t_addPlans(tok, 6, 2, ['얼티밋 패스와 움직임, 관찰 평가, 10월', '창작 무용 발표, 발표 평가, 11월', '응급 처치 실습, 실기 평가, 12월'].join('\n'), 3);
    var 계획 = G.eval_계획목록_();
    var 특기 = ['정확한 자세로 끝까지 참여함', '친구를 도우며 협력함', '기본 동작을 꾸준히 연습함', '창의적인 동작을 만들어 냄', ''];
    반들.forEach(function (gc) {
      계획.filter(function (p) { return p.학년 === gc[0] && p.학기 === 2; }).slice(0, 2).forEach(function (p, k) {
        var rows = 반학생(gc[0], gc[1]).map(function (s) {
          var r = rnd() * 힘[s.학생ID];
          return { 학생ID: s.학생ID, 단계: r > 0.75 ? p.라벨[0] : r > 0.35 ? p.라벨[1] : p.라벨[2], 특기사항: rnd() < 0.4 ? pick(특기) : '' };
        });
        if (k === 1 && gc[0] === 5 && gc[1] === 2) rows = rows.slice(0, 12);   // 아직 입력 중인 반
        G.eval_t_saveResults(tok, p.id, gc[0], gc[1], ymd(day(k ? -6 : -24)), rows);
      });
    });
  });

  /* ── PAPS ── */
  var paps = { 왕복오래달리기: [20, 75, 0], 앉아윗몸앞으로굽히기: [-3, 18, 1], 윗몸말아올리기: [8, 60, 0], '50m달리기': [11.2, 7.9, 2], 제자리멀리뛰기: [125, 205, 1], 악력: [12, 30, 1], '오래달리기-걷기': [420, 280, 0] };
  safe('PAPS', function () {
    G.paps_t_fillScale(tok);
    var 종목 = G.paps_종목목록_();
    function 값(s, t) {
      var p = paps[t.종목]; if (!p) return null;
      var f = Math.min(1, Math.max(0, (힘[s.학생ID] - 0.55) / 0.9 * 0.8 + rnd() * 0.3 + (s.성별 === '남' && t.종목 !== '앉아윗몸앞으로굽히기' ? 0.05 : 0)));
      var v = p[0] + (p[1] - p[0]) * f; return Number(v.toFixed(p[2]));
    }
    ['1차', '2차'].forEach(function (회, k) {
      var list = [];
      학생.forEach(function (s) {
        if (k === 1 && !(s.학년 === 6)) return;   // 2차는 6학년만 측정함
        종목.forEach(function (t) {
          if (t.방식 === 'BMI') {
            var 키 = Math.round(138 + (s.학년 - 5) * 6 + rnd() * 18), 몸 = Math.round(키 * 키 / 10000 * (15.5 + rnd() * 8));
            list.push({ 학생ID: s.학생ID, 종목: t.종목, 참고1: 키, 참고2: 몸 });
          } else { var v = 값(s, t); if (v !== null) list.push({ 학생ID: s.학생ID, 종목: t.종목, 값: v + (k ? 0.03 * (paps[t.종목][1] - paps[t.종목][0]) : 0) }); }
        });
      });
      at(k ? -14 : -150, 10);
      G.paps_t_saveRecords(tok, { 회차: 회, 기록: list });
    });
    api.clock(null);
  });

  /* ── 건강체력교실 ── */
  safe('건강체력교실', function () {
    var 대상 = 학생.filter(function (s) { return 힘[s.학생ID] < 0.85; }).slice(0, 12);
    at(-60, 9);
    G.fit_t_addMembers(tok, 대상.map(function (s) { return { 학생ID: s.학생ID, 사유: rnd() < 0.5 ? 'PAPS 4등급 (왕복오래달리기)' : '체질량지수 과체중' }; }));
    var 종목 = G.fit_종목목록_(false);
    for (var n = -40; n <= 0; n++) {
      var w = day(n).getDay();
      대상.forEach(function (s, i) {
        var 교실 = (w === 1 || w === 5) && rnd() < 0.85, 집 = !교실 && rnd() < 0.18;
        if (!교실 && !집) return;
        at(n, 교실 ? 15 : 19, Math.floor(rnd() * 50));
        var t = pick(종목), tk = 학생토큰(s);
        var 수치 = Math.max(1, Math.round(t.기준량 * (0.6 + rnd() * 1.2)));
        G.fit_s_addRecord(tk, { 날짜: ymd(day(n)), 장소: 교실 ? '교실' : '가정', 종목: t.종목, 수치: 수치, 소감: rnd() < 0.3 ? pick(['힘들었지만 끝까지 했다', '어제보다 많이 했다', '친구랑 같이 해서 재미있었다']) : '' });
        if (교실) G.fit_t_setAttendance(tok, ymd(day(n)), s.학생ID, '출석');
      });
    }
    // 집에서 한 기록 중 지난 것은 선생님이 확인
    var 대기 = G.fit_t_getPending(tok) || [];
    var ids = (대기.기록 || 대기).filter(function (r) { return r.날짜 < ymd(day(-2)); }).map(function (r) { return r.기록ID; });
    if (ids.length) G.fit_t_review(tok, ids, '확인', '', '유지');
    api.clock(null);
  });

  /* ── 줄넘기 ── */
  safe('줄넘기', function () {
    var 종류 = ['모아뛰기', '모아뛰기', '엇갈아뛰기', '이중뛰기', '십자뛰기'], objs = [];
    for (var n = -35; n <= 0; n++) {
      var w = day(n).getDay();
      학생.forEach(function (s, i) {
        var chance = (w === 0 || w === 6) ? 0.25 : 0.7; if (i % 7 === 2) chance = 0.97;
        if (rnd() > chance) return;
        var 종 = pick(종류), base = 종 === '이중뛰기' ? 25 : 종 === '십자뛰기' ? 60 : 130;
        var d = at(n, 9 + Math.floor(rnd() * 9), Math.floor(rnd() * 60));
        var 횟수 = Math.max(5, Math.round(base * 힘[s.학생ID] * (0.7 + rnd() * 0.8) * (1 + (35 + n) / 90)));
        objs.push({ 기록ID: 'R' + d.getTime().toString(36) + i, 입력일시: G.지금_(), 날짜: ymd(d), 시각: pad(d.getHours()) + ':' + pad(d.getMinutes()), 학생ID: s.학생ID, 횟수: 횟수,
                    상태: n === 0 && rnd() < 0.2 ? '대기' : '확인', 확인일시: G.지금_(), 입력자: rnd() < 0.15 ? '교사' : '학생', 메모: '', 종류: 종 });
      });
    }
    api.clock(null);
    G.appendRows_('줄넘기_기록', ['기록ID', '입력일시', '날짜', '시각', '학생ID', '횟수', '상태', '확인일시', '입력자', '메모', '종류'], objs);
    var ch = [];
    학생.forEach(function (s) {
      var lv = 힘[s.학생ID] > 1.2 ? 2 : 힘[s.학생ID] > 0.85 ? 1 : 0;
      for (var L = 0; L <= lv; L++) for (var it = 0; it < 5; it++) if (L < lv || rnd() < 0.5) ch.push({ 학생ID: s.학생ID, 급수: L, 항목: it, 통과: true, 날짜: ymd(day(-28 + L * 9)) });
    });
    G.rope_t_levelsSave(tok, ch);
    try { G.rope_캐시지우기_(); } catch (e) {}
  });

  /* ── FMS 도전 (고학년군) ── */
  safe('FMS', function () {
    var 단계 = G.rows_('FMS_도전단계').filter(function (r) { return String(r['학년군']) === '고' && String(r['사용(Y/N)']).toUpperCase() !== 'N'; });
    var 준거 = G.rows_('FMS_준거').filter(function (r) { return String(r['학년군']) === '고'; });
    var 기술들 = {}; 단계.forEach(function (r) { (기술들[r.기술ID] = 기술들[r.기술ID] || []).push(r); });
    Object.keys(기술들).forEach(function (k) { 기술들[k].sort(function (a, b) { return Number(a.단계) - Number(b.단계); }); });
    var 기술키 = Object.keys(기술들), 배지 = [], 평가 = [];
    function 체크(skill) { return 준거.filter(function (c) { return c.기술ID === skill; }).map(function (c) { return c.준거ID + ':' + (rnd() < 0.85 ? 1 : 0); }).join(', '); }
    학생.forEach(function (s, i) {
      var 짝 = 학생[(i % 22 === 21) ? i - 1 : i + 1];
      기술키.slice(0, 2 + Math.floor(rnd() * 4)).forEach(function (sk, j) {
        var 통과 = Math.floor(rnd() * 기술들[sk].length * 힘[s.학생ID]);
        for (var L = 0; L < Math.min(통과, 기술들[sk].length); L++) {
          var d = ymd(day(-50 + L * 12 + j)), lv = 기술들[sk][L];
          배지.push({ 신청ID: 'B' + i + sk + L, '신청 일시': d + ' 10:20', 학생ID: s.학생ID, 단계ID: lv.단계ID, 기록값: '', '확인 동료ID': 짝.학생ID, '동료 확인 일시': d + ' 10:40',
                      상태: '승인', '처리 일시': d + ' 16:00', '동료 체크(준거ID:1/0)': 체크(sk) });
        }
        if (j === 0 && rnd() < 0.09 && 통과 < 기술들[sk].length) {
          var lv2 = 기술들[sk][통과], d2 = ymd(day(-1));
          배지.push({ 신청ID: 'B' + i + sk + 'p', '신청 일시': d2 + ' 10:20', 학생ID: s.학생ID, 단계ID: lv2.단계ID, 기록값: '', '확인 동료ID': 짝.학생ID, '동료 확인 일시': d2 + ' 10:45', 상태: '교사승인대기', '동료 체크(준거ID:1/0)': 체크(sk) });
        }
        if (rnd() < 0.3) 평가.push({ 기록ID: 'E' + i + sk, 일시: ymd(day(-20)) + ' 11:00', 학생ID: s.학생ID, 기술ID: sk, '적용 학년군': '고', '준거 결과(준거ID:1/0)': 체크(sk), '충족 준거 수': 3, '평가자 유형': '교사', 평가자ID: '교사', 메모: '' });
      });
    });
    G.appendRows_('FMS_배지기록', ['신청ID', '신청 일시', '학생ID', '단계ID', '기록값', '확인 동료ID', '동료 확인 일시', '상태', '처리 일시', '피드백 문구ID', '미충족 준거ID', '동료 체크(준거ID:1/0)', '인증파일ID', '인증종류', '인증썸네일ID', '인증파일명'], 배지);
    G.appendRows_('FMS_평가기록', ['기록ID', '일시', '학생ID', '기술ID', '적용 학년군', '준거 결과(준거ID:1/0)', '충족 준거 수', '평가자 유형', '평가자ID', '메모'], 평가);
  });

  /* ── 색깔 매트 놀이터 ── */
  safe('색깔 매트', function () {
    var 게임 = ['basic', 'stroop', 'memory', 'rhythm', 'dir', 'quiz', 'freeze', 'lava'];
    bizDays(-30, -1).forEach(function (n, k) {
      if (k % 3) return;
      반들.forEach(function (gc) {
        var g = pick(게임), 시간 = 300 + Math.floor(rnd() * 400);
        at(n, 10 + gc[1], 20);
        G.mat_t_saveClassRecord(tok, gc[0], gc[1], { 게임: g, 난이도: pick(['쉬움', '보통', '어려움']), 진행시간: 시간, 점프: Math.round(시간 * 0.9), 전체단계: 10, 완주: rnd() < 0.8 ? '완주' : '중간' });
      });
    });
    반학생(5, 1).slice(0, 14).forEach(function (s, i) {
      for (var j = 0; j < 1 + Math.floor(rnd() * 4); j++) {
        var n = -Math.floor(rnd() * 20), 시간 = 60 + Math.floor(rnd() * 240), g = pick(게임);
        at(n, 12, 30 + j);
        G.mat_s_saveRecord(학생토큰(s), { id: 'demo-' + i + '-' + j, 구분: '연습', 게임: g, 난이도: '보통', 진행시간: 시간, 인정시간: 시간, 점프: Math.round(시간 * 0.8), 인정점프: Math.round(시간 * 0.8), 확인단계: 8, 전체단계: 10, 완주: '완주' }, []);
      }
    });
    api.clock(null);
  });

  /* ── 스포츠클럽 ── */
  safe('스포츠클럽', function () {
    var 클럽 = [['6학년 티볼부', '티볼', '6학년', '화·목 점심시간', '운동장', 300000, 학생.filter(function (s) { return s.학년 === 6; }).slice(0, 14)],
                ['5학년 줄넘기부', '줄넘기', '5학년', '수 방과후', '체육관', 200000, 학생.filter(function (s) { return s.학년 === 5; }).filter(function (s, i) { return i % 3 === 0; })]];
    클럽.forEach(function (c) {
      at(-80, 9);
      var r = G.club_t_saveClub(tok, { 이름: c[0], 종목: c[1], 대상: c[2], 운영시작: ymd(day(-75)), 운영종료: ymd(day(40)), 활동시간대: c[3], 활동장소: c[4], 목표시간: 17, 배정예산: c[5],
                                        개요: c[1] + ' 기본 기능을 익히고 친선 경기에 나가요.', 내용: '기본기 연습, 팀 경기, 교내 대회' });
      var id = r.id, ids = c[6].map(function (s) { return s.학생ID; });
      G.club_t_addMembers(tok, id, ids);
      bizDays(-70, -1).forEach(function (n) {
        var w = day(n).getDay(); if (c[1] === '티볼' ? (w !== 2 && w !== 4) : w !== 3) return;
        at(n, 13, 0);
        G.club_t_saveActivity(tok, { 클럽ID: id, 날짜: ymd(day(n)), 시작: c[1] === '티볼' ? '12:40' : '14:50', 종료: c[1] === '티볼' ? '13:20' : '15:50', 분: c[1] === '티볼' ? 40 : 60,
          유형: rnd() < 0.85 ? '정규 연습' : '교내 경기', 장소: c[4], 내용: pick(c[1] === '티볼' ? ['타격 연습', '수비 연습', '주루 연습', '팀 경기'] : ['기본 뛰기', '긴 줄 뛰기', '음악 줄넘기', '단체 줄넘기']),
          참여: ids.filter(function () { return rnd() < 0.88; }) });
      });
      G.club_t_saveComps(tok, id, c[1] === '티볼' ? [{ 일자: ymd(day(-21)), 대회명: '교육장배 학교스포츠클럽 티볼 대회 (예시)', 주최: '교육지원청', 장소: '종합운동장', 결과: '3위', 인원: 12 }]
        : [{ 일자: ymd(day(-12)), 대회명: '교내 줄넘기 한마당 (예시)', 주최: '햇살초', 장소: '체육관', 결과: '단체 줄넘기 1등', 인원: 8 }]);
      G.club_t_saveBudget(tok, id, c[5], c[1] === '티볼' ? [{ 항목: '물품', 세부: '티볼 배트·공', 단가: 35000, 수량: 4, 금액: 140000, 집행일: ymd(day(-60)) }, { 항목: '간식', 세부: '대회 간식', 단가: 3000, 수량: 14, 금액: 42000, 집행일: ymd(day(-21)) }]
        : [{ 항목: '물품', 세부: '긴 줄넘기', 단가: 18000, 수량: 3, 금액: 54000, 집행일: ymd(day(-50)) }]);
    });
    api.clock(null);
  });

  api.clock(null);
  try { G.캐시지우기_('home'); } catch (e) {}
};
