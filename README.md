# pe-app — 체육교사 보조 프로그램 새 화면

v3.0 부터 **화면(html)은 이 저장소의 GitHub Pages 한 곳에서**, 저장은 지금처럼 각 학교 구글 시트 + Apps Script 라이브러리에서 합니다.

- 새 화면: https://musicalpe.github.io/pe-app/?app=<학교 웹앱 …/exec 주소>
  (한 번 열면 이 기기에 학교 주소를 기억합니다. `?page=teacher` 를 붙이면 선생님 탭이 먼저 열립니다.)
- `index.html` — 빌드 결과물입니다. 직접 고치지 말고 라이브러리 html 을 고친 뒤 `node tools/build-web.js` 로 다시 만듭니다.
- `ready.json` — `ready: true` 일 때만 학교 설정의 "화면 방식 → 새 화면"을 고를 수 있습니다. `minServerApi` 는 필요한 서버 기능 번호(라이브러리 37 = 1).
- `poc/` — v3.0 0단계 연결 시험 페이지 (보관용).

학생 자료는 이 저장소에 들어오지 않습니다. 화면 파일만 있고, 자료는 각 학교 구글 시트·드라이브에 저장됩니다.
