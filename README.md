# Handgold — AI 손금왕

손바닥 사진을 찍거나 카메라에 비추면 AI가 손금을 짚어가며 말로 풀어주는 웹앱 (단일 HTML).

## 기능
- 📸 사진 모드: 촬영·앨범·Ctrl+V 붙여넣기·드래그 → 주요 손금선 오버레이 + 운세 카드 + 음성 풀이
- 🎥 영상 모드: 실시간 카메라로 손 모양 → 생명선 → 두뇌선 → 감정선 → 운명선 → 총평 순서로 말로 풀이 (https 필요)
- 🎙 목소리: 휴대폰 기본 음성 / Azure 자연 음성(무료 F0, 월 50만 자)

## 실행 (Vercel)
1. Vercel에서 이 저장소를 Import → 빌드 설정 없이 Deploy
2. Settings → Environment Variables 에 추가 후 Redeploy
   | 이름 | 값 | 필수 |
   |---|---|---|
   | `ANTHROPIC_API_KEY` | Anthropic 콘솔에서 발급한 키 | 필수 (손금 분석) |
   | `AZURE_SPEECH_KEY` | Azure Speech(Free F0) 키 | 선택 (자연 음성) |
   | `AZURE_SPEECH_REGION` | `koreacentral` | 선택 |
   | `CLAUDE_MODEL` | 기본 `claude-sonnet-5-5` | 선택 |
3. 배포 주소로 열면 키 입력 없이 동작 (오른쪽 위 ⚙에 'AI 연결됨')

## 구조
- `index.html` — 앱 전체 (단일 HTML)
- `api/claude.js` — Claude 호출 서버 함수 (키는 서버에만 보관)
- `api/tts.js` — Azure 음성 서버 함수

> 서버 함수가 없을 때는 ⚙에 개인 키를 넣어 테스트할 수 있습니다(브라우저에만 저장).
> 손금 풀이는 재미로 보는 오락 콘텐츠입니다.
