# Colors (해골천) — 프로젝트 개요

## 목표
브라우저에서 즉시 실행 가능한 3D TPS 배틀로얄 프로토타입.
브롤스타즈 직관성을 탑다운 3D 감각으로 구현한다.

## 기술 스택
- **렌더링**: Three.js r165 (CDN, 번들러 없음)
- **언어**: Vanilla JS ES Module
- **핵심 코드**: `src/main.js`
- **알파 캐릭터 설정**: `src/config/characters.js`
- **베타 캐릭터 설정**: `src/config/beta-characters.js`
- **스타일**: `styles.css`
- **오디오**: Web Audio API
- **멀티플레이**: Cloudflare Worker 기반 개발 서버 + 로컬 AI 봇
- **배포**: GitHub Pages (08useok.github.io/Colors)

## 주요 기능
1. 탑다운 시점 TPS 전투
2. 마우스 조준 + WASD 이동 분리
3. 로비 화면 (계정 생성, 트로피, 전적, 캐릭터 선택)
4. 캐릭터 9종
   - Red: 더블 펀치 (근접 탱커)
   - Green: 30° 부메랑 4연발 (중거리 암살자)
   - Blue: 고속 저격 (장거리 딜러)
   - Orange: 폭탄 + 5갈래 폭발 (범위 딜러)
   - Yellow: 전기 투사체 + 감전 감속 (이동 제어)
   - Cyan: 6발 직선 투사체 + 궁극기 "질풍 강타"
   - Purple: 독침 2발 + 맹독 (지속 피해 딜러)
   - Pink: 광역 치유 + 근접 타격 (힐러)
   - Crimson: 부채꼴 3연타 + 궁극기 "KO 스트레이트" (근접 브루저, 베타 시즌 1 신규 — `specs/crimson-character.md`)
5. 자기장 5단계 축소 (초록색, 75초)
6. AI 봇 9명 (9캐릭터 랜덤 배정)
7. 배틀 맵 3종 랜덤 로테이션 (훈련장 제외)
8. 캐릭터별 승률/전적 + 연승 시스템
9. 상성표 (5캐릭터 — Cyan 미포함)
10. 다국어 (한국어/영어)
11. 수풀 은신 + 전투 발각 시스템
12. 찹 우드 모드 (3v3 팀 벌목전)
13. 자연 회복 + 자동 재장전

14. 꾸미기 아이템 — 이모트 (인게임 이모지 풍선), 프로필 배경, 뱃지 (상점 코인 구매)
15. 시즌 시스템 — 알파 시즌 1~4 → 베타 시즌 1 (`specs/beta-season-transition.md`)
16. 캐릭터 등급 (일반/희귀/영웅) + 크레딧 화폐 — 희귀·영웅 캐릭터는 크레딧으로 구매 (`specs/character-rarity-shop.md`)
17. 일일 승리 보상 — 승리할 때마다 100 β 크레딧 자동 지급 (`specs/daily-gacha.md`)
18. 스킨 등급 (희귀/초희귀/영웅) + 레드 컬러 테마 스킨 (`specs/skin-red-theme.md`)
19. 베타 테스트 전용 페이지 — `beta-season.html`
20. Blue·Cyan·Pink GLB 모델 및 시작/반복/정지 이동 모션
21. 계획: 베타 시즌 2 골드 러쉬 스킨 3종 — Yellow·Orange·Gold (`specs/skin-gold-rush.md`)
22. 계획: 베타 시즌 캐릭터별 승리·패배 애니메이션과 클릭형 결과 화면 (`specs/beta-result-poses.md`)

## Non-goals
- 대규모 상용 멀티플레이 인프라
- 무기 교체 / 파밍 / 인벤토리
- 점프 / 대시 / 슬라이딩 / 헤드샷
- 이모트 애니메이션 (3D 동작 — 이모지 풍선만 구현)
