# 2. 로비·UI

## 범위

- 로비 화면과 게임 시작
- 캐릭터 선택·잠금·구매 표시
- 프로필, 전적, 승률과 연승
- 결과 오버레이를 제외한 HUD
- 스킨, 이모트, 배경과 뱃지 UI
- 모바일 공격·궁극기 버튼

## 주요 UI

| UI | 역할 |
|---|---|
| 캐릭터 선택 | 보유 상태, 설명, 스펙과 미리보기 표시 |
| 전투 HUD | 체력, 탄약, 공격명과 궁극기 충전량 표시 |
| 궁극기 버튼 | 평소 회색, 충전량만큼 색상 표시, 100%에서 발광 |
| 프로필 | 계정 전적, 캐릭터별 승률, 시즌 통계 표시 |
| 꾸미기 | 스킨, 이모트, 배경과 뱃지 구매·장착 |

## 기준 코드

- 마크업: `index.html`, `beta-season.html`
- 스타일: `styles.css`, `beta-season.css`
- UI 상태와 렌더링: `src/main.js`, `src/beta-season.js`

## 상세 문서

- [`lobby.md`](lobby.md)
- [`character-select.md`](character-select.md)
- [`leaderboard-stats-ui.md`](leaderboard-stats-ui.md)
- [`cosmetics-profile.md`](cosmetics-profile.md)
- [`cosmetics-emote.md`](cosmetics-emote.md)
- [`skin-red-theme.md`](skin-red-theme.md)

