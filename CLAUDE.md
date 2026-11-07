# 손금왕 (Handgold) — 작업 안내서

이 저장소를 새로 받아 이어서 고칠 때(사람이든 AI든) 먼저 읽는 문서입니다.
지금까지 정한 것, 코드 구조, 고치는 방법, 배포 방법을 모았습니다.

## 1. 한 줄 요약
손바닥 사진을 점선 가이드에 맞추면 **AI·서버 없이 브라우저 안에서** 손금선을 찾아 해석표로 풀이하고, 선을 짚으며 말로 읽어주는 단일 HTML 웹앱.

- 주소: https://handgold.iux.kr (Vercel, 도메인 iux.kr 서브도메인)
- 저장소: https://github.com/handgoldking1234/iux-handgold
- Claude 아티팩트 미리보기: https://claude.ai/artifact/TkDyMZC4ocSq3kse1x7JeW

## 2. 확정된 결정 (바꾸려면 먼저 상의)
| 항목 | 결정 | 이유 |
|---|---|---|
| 분석 방식 | AI 없음. 영상처리 + 선 모양 후보(템플릿) 매칭 | API 키·비용 0원, 사진을 밖으로 안 보냄 |
| 구조 | `index.html` 한 파일 (빌드 없음) | 아티팩트·Vercel 어디서나 그대로 동작 |
| 해석 기준 | 《손금 해석의 정석》 체계를 **새 문장으로** 쓴 규칙표 → `docs/rules.md` | 책 문장 복제 금지 |
| 빼는 내용 | **사망·수명 시기만 뺀다** (질문해도 정중히 거절). 건강은 '관리 포인트'로만 말하고 진단하지 않으며 병원 안내를 붙인다 | 사용자 결정(2026-11-07) |
| 말투 | 존댓말, 따뜻하게, 겁주지 않고, 끝에 "손금은 노력으로 바뀐다" | 책의 상담 태도 |
| 음성 | 기본: 휴대폰 내장 음성 / 선택: Azure 무료 음성(월 50만 자) | 무료 |
| 아이콘 | Lucide (SVG 경로를 `ICONS`에 직접 넣음, CDN 안 씀) | 오프라인·아티팩트에서도 표시 |
| 결과 고정 | 같은 손금 → 같은 풀이 (특징값으로 시드 고정 난수) | 다시 찍어도 결과가 안 바뀜 |
| 책 사진 | 저장소에 올리지 않음 (`.gitignore`) | 저작권 |

## 2-1. v2 기능 (2026-11-07, 기획: `docs/plan-v2.md`)
- **양손:** 사진 화면 위 [오른손][왼손] 탭. 손마다 사진·정렬·분석·고치기를 `state.hands[손]`에 따로 저장 (`snapHand`, `switchHand`)
- **흑백 선 지도:** `responseMap`이 `state._map={M,R,fine}`을 남김 → `drawLineView`가 흑백으로 그림 (`toggleLineView`)
- **세밀한 선 따기:** `refinePath`가 템플릿 선을 실제 주름 쪽으로 붙임 (`detect` 래퍼 안)
- **보조선:** 결혼선·향상선·여행선·건강선·영향선 자동 추정(`extraTemplates`), 잔선 많음/보통/적음, 비애선·횡재선·섬·별·우물정자는 고치기 칩. `f.extra`, 문장은 `DB3`
- **사주명리:** `computeSaju` — 태양 황경(`sunLon`)으로 입춘·절입 계산, 음력은 `Intl` dangi 달력으로 변환(`lunarToSolar`), 진태양시 −32분, 1987·88 서머타임, 십성·신강신약·보완 오행·대운·세운. 문장은 `DAYMASTER`, `EL_TXT`, `GROUP_TXT`, `YEAR_TXT`, `EL_CARE`
- **종합:** `palmThemes`+`sajuThemes` → `synthesis` → `conclusionText`, 양손 비교 `compareHands`
- **질문:** `answer(q)`가 `INTENTS` 정규식으로 의도를 고르고 손금·사주 근거로 답함, `ask`(읽어 주기), `listen`(음성 질문)
- **전문가 상담:** `consultSteps` → `consult`
- 원래 함수는 `const _detect=detect; detect=function(){...}` 식으로 감싸서 확장함 (index.html 아래쪽 "v2" 블록)

## 2-2. v4 기능 (2026-11-07)
- **화면:** 스포티파이식(둥근 알약 버튼·채워진 선택 칩·평평한 카드·큰 제목). 글꼴(Gowun Batang + Noto Sans KR)과 색(보라 배경 + 금색)은 그대로
- **스크롤:** 분석이 끝나면 `#stage`에 `done` 클래스 → 사진 위에서도 위아래로 밀림 (`stageMode`)
- **엄지 방향 자동 판별:** `thumbSide()`가 피부색 덩어리로 엄지 쪽을 찾아, 고른 손과 다르면 방향을 맞춰 읽고 "○손 칸으로 옮기기" 카드를 띄움 (`moveToOther`). 오른손 손바닥 정면 = 엄지 오른쪽. `flipThumb`을 누르면 자동 판별을 끔(`state.manualThumb`)
- **사주 심화:** 격국(`GYEOK`, 월지 정기 십성), 신살(도화·역마·화개·천을귀인, `sinsal`), 지지 충·육합(`hapchung`), 올해 지지와 일지의 합충(`yearClash`)
- **관상:** 홈 '관상 보기' → `#face` 화면. 타원 가이드에 맞추면 `faceMeasure`가 얼굴형(오행 5형)·이마·눈썹·눈·입·입술·턱을 대략 재고, 코·귀는 고치기 칩. 문장 `FACE_DB`, 점수 `faceScores`, 항목별 `facePart`
- **3원 통합:** `fullReport`가 손금·사주·관상 중 있는 것으로 항목별 통합(`integrate3`). 근거는 접어 두고, 위쪽 항목 바로가기(`.catnav`)

## 2-3. v5~v7 (2026-11-07)
- **화면 구조(v7):** 아래 탭 `#bnav` = 홈 · 손금(`#photo`) · 사주(`#saju`) · 관상(`#face`) · 종합(`#report`). 홈은 세 갈래 타일 + '나의 풀이' 현황(`renderHome`). `renderCombo`가 `#sajuView`·`#reportView`를 그림
- **종합 화면:** 항목 탭(`.ctabs`, `state.cat`)으로 **한 항목씩** 보여 줌 → 통합 결론 크게, 나이 한 줄, 근거는 접기, '다음' 버튼. 총운 탭에는 나이 풀이·총운 자세히(`totalDetail`)·양손 비교
- **입력(v5):** 생년월일 8자리 숫자 한 칸(`sjNum`, 6자리도 됨), 시간은 12시진 칩 또는 '정확히 앎', 성별·양력/음력 알약. 두세 자리만 넣으면 **나이만** 저장(`state.ageOnly`, localStorage `sgw_age`)
- **나이 맞춤(v6):** `ageNow`(만 나이) → `STAGE`(6단계)·`STAGE_TXT` 항목별 문장, `ageReport`(손금 유년법 지난/지금/다가올 시기, 관상 유년 부위 `facePartByAge`, 현재·다음 대운 `DAE_TXT`). 질문 답에도 붙음
- **손금선(v6):** `refinePath`를 2단계 최적 경로(`dpFit`) + 끝 다듬기(`trimEnds`)로 교체, 주름이 약하면 후보선 유지. 선은 곡선으로 그림
- **관상 카메라(v6):** `faceCam`·`faceSnap` (전면 카메라, 찰칵하면 바로 풀이)

- **풀이 보강(v8):** 사주 `DM_DEEP`(일간 10개 × 성향·직업·연애·재물·건강·관계), `EL_MANY`/`EL_NONE`(오행 많음·없음), `TEN_DEEP`(강한 십성). 관상 `SHAPE_DEEP`(얼굴형 5개 × 6분야), `FACE_MORE`(부위별 나이·의미, '보통'도 문장). 책 자료 없이 일반적인 명리·관상 체계를 새 문장으로 씀

- **엄지 방향(v9):** 사진을 넣자마자 `thumbSide`(피부색)→`toneSide`(손바닥 가운데 색과 닮은 쪽, 흑백 사진도)로 엄지 쪽을 짐작해 점선 손을 맞춤. 분석 때는 `bestThumb`(양쪽으로 손금선 점수 비교)까지 봄. 정렬 화면에 '사진 속 엄지는 어느 쪽?' 왼쪽/오른쪽 칸(`renderThumbSeg`, `setThumb`) — 사용자가 고르면 자동 판별 끔. 선 추적은 한 걸음 1칸·넓은 다듬기로 덜 흔들리게

## 3. 파일 구조
```
index.html        앱 전체 (화면·영상처리·해석표·음성)
api/tts.js        Azure 음성 서버 함수 (선택, 환경변수 있을 때만)
docs/rules.md     해석 규칙 정의서 (책 구성별, 앱 반영 상태 ✅/⬜)
tests/smoke.py    합성 손바닥으로 돌리는 스모크 테스트
tests/fixtures/   테스트용 합성 손바닥 이미지
CLAUDE.md         이 문서
README.md         소개·배포 요약
```

## 4. index.html 안의 코드 지도 (함수 이름으로 찾기)
| 구역 | 주요 이름 | 하는 일 |
|---|---|---|
| 상태 | `state` | 손(오른/왼), 주로 쓰는 손(`dom`), 궁금한 것(`focus`), 사진 위치, 검출 결과(`feat`), 선 좌표(`paths`), 고른 언덕(`mountUp`) |
| 아이콘 | `ICONS`, `ic(name,size)` | Lucide SVG. HTML은 `<span class="li" data-ic="이름">`, 템플릿은 `${ic('이름',16)}` |
| 사진 정렬 | `loadFile`, `setImage`, `drawTo`, 제스처 | 끌기·확대·회전으로 점선 가이드에 맞춤 |
| 영상처리 | `responseMap`, `boxBlur`, `maxFilter`, `inPalm` | 손금(어두운 가는 선) 강조 지도. 항상 "엄지 왼쪽" 좌표계로 계산 |
| 선 후보 | `templates()` | 생명선·두뇌선·감정선·운명선(시작점 3종)·재물선·사업선·금성대·솔로몬링·막쥔손금 곡선 후보 |
| 검출 | `detect()` | 후보별 점수(z) → 가장 맞는 선, 끊김, 이중선, 개운선, 신비십자, 잔선 밀도(손 유형·인복선), 유년법 나이 |
| 유년법 | `lifeAge`, `fateAge` | 선 위 위치 → 나이 (대략값) |
| 해석표 | `DB`, `DB2`, `HANDTYPE`, `MOUNTS`, `mountScores` | 규칙 문장과 점수. `docs/rules.md`와 짝 |
| 고치기 칩 | `OPTIONS`, `ATTR_LABEL` | 결과 화면 "직접 고치기"에 나오는 선택지 |
| 풀이 생성 | `buildReading(f)` | 유형·카드·운세·점수·행운·나이 흐름·말하기 단계(`steps`) |
| 화면 | `renderResult`, `drawPaths(only, mount)`, `visibleKeys` | 결과 카드, 선·언덕 표시 |
| 말하기 | `narrate`, `speak`, `deviceSpeak`, `azureDirect`, `serverSpeak` | 선을 하나씩 짚으며 읽기 |
| 카메라 | `startCam`, `snap` | 실시간 카메라 촬영 |

`f`(검출 결과) 구조:
```
life{len,curve,depth,broken} head{len,dir,start,depth} heart{end,shape,depth}
fate{has,len,start} sun{has} biz{has} girdle{has}
marks{dhead,dheart,cross,solomon,inbok} hand{palm,finger} simian
ages{lifeBreak,fateStart,fateBreak,gaeun}
```

## 5. 자주 하는 수정
- **풀이 문장 바꾸기:** `DB`/`DB2`/`HANDTYPE`/`MOUNTS` 문장만 고치면 됨. 바꾸면 `docs/rules.md`도 같이 고치기.
- **새 선·표시 추가** (예: 결혼선):
  1. `templates()`에 곡선 후보 추가
  2. `detect()`에서 `f`에 값 넣기
  3. `DB2`에 문장 추가
  4. `OPTIONS`에 고치기 칩 추가
  5. `buildReading`의 `marks`·`steps`에 연결
  6. `COLORS`·`NAMES`에 색과 이름 추가
  7. `docs/rules.md` 상태를 ⬜→✅로
- **언덕 점수 조정:** `mountScores`.
- **아이콘 추가:** lucide.dev에서 SVG 안쪽 `<path>`만 복사해 `ICONS`에 넣기.

## 6. 확인 방법
```
pip install playwright && playwright install chromium
python tests/smoke.py        # errors [] 가 나와야 함
```
실제 손 사진으로도 한 번 열어서 선이 손금 위에 겹치는지 눈으로 확인할 것 (합성 이미지만으로는 정확도 보장 안 됨).

## 7. 배포
- Vercel에 저장소 연결 → 빌드 설정 없이 Deploy
- 선택 환경변수: `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`(koreacentral)
- 도메인: 가비아 iux.kr → `*` CNAME `cname.vercel-dns.com.`, Vercel 프로젝트에 `handgold.iux.kr` 추가
- 아티팩트도 갱신할 때는 `index.html` 한 파일만 올리면 됨

## 8. 남은 일
`docs/rules.md` 9장 "다음에 넣을 순서" 참고 (결혼선·배우자 영향선 → 인연 시기 카드가 1순위). 실제 손 사진 정확도 점검과 궁합 손금(두 손 비교)도 남아 있음.

---

## 공통 작업 원칙 (IUX 프로젝트 전체)
- **언어:** 화면 문구·문서·커밋 메시지는 한국어. 쉬운 말, 기술 용어 최소화.
- **퍼블리싱 시안:** 순수 HTML/CSS + 간단한 스크립트만 넣는다. 서버·DB 연동 코드는 개발 단계에서 따로 붙인다.
- **아이콘:** Lucide. 디자인 시스템을 따로 정하지 않았으면 스포티파이 스타일(다크/화이트 + 포인트 컬러)을 기본으로 쓴다.
- **배포:** GitHub `main` → Vercel 자동 배포. 도메인은 가비아 `iux.kr`의 서브도메인(`*.iux.kr` CNAME → Vercel)을 쓴다.
- **DB:** Supabase 무료 플랜은 활성 프로젝트 2개까지라, 새 프로젝트를 만들지 말고 기존 `iux-cloud`(studio) 프로젝트에 테이블을 얹는 것을 먼저 검토한다.
- **비밀값:** 공개 저장소다. 서비스 키·AI 키·비밀번호는 절대 커밋하지 않는다. 키는 Vercel 환경 변수나 Supabase secrets에 둔다. Supabase anon(public) 키만 코드에 넣을 수 있다.
- **확인:** 고친 뒤에는 브라우저 콘솔 오류 0개, 모바일(390px)과 PC 화면을 눈으로 확인하고 나서 완료라고 한다.
- **브랜치:** `main`은 배포 중인 상태. 큰 작업이나 검증 전 작업은 브랜치(`wip/…`, `claude/…`)에 올리고, `main`을 강제 푸시(-f)로 덮어쓰지 않는다.
- **전체 프로젝트 목록:** https://github.com/handgoldking1234/iux-app/blob/main/docs/PROJECTS.md
