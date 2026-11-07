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
| 빼는 내용 | 건강·질병·수명·사고·사망, 종교 권유, 단정적 인연 예측 | 오락 콘텐츠, 겁주지 않기 |
| 말투 | 존댓말, 따뜻하게, 겁주지 않고, 끝에 "손금은 노력으로 바뀐다" | 책의 상담 태도 |
| 음성 | 기본: 휴대폰 내장 음성 / 선택: Azure 무료 음성(월 50만 자) | 무료 |
| 아이콘 | Lucide (SVG 경로를 `ICONS`에 직접 넣음, CDN 안 씀) | 오프라인·아티팩트에서도 표시 |
| 결과 고정 | 같은 손금 → 같은 풀이 (특징값으로 시드 고정 난수) | 다시 찍어도 결과가 안 바뀜 |
| 책 사진 | 저장소에 올리지 않음 (`.gitignore`) | 저작권 |

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
