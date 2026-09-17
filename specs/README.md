# Colors 스펙 문서

스펙은 아래 6개 종류로 구분한다. 각 종류별 파일은 관련 상세 문서와 실제 코드 위치를 연결하는 대표 목차다.

[프로젝트 실행 안내](../README.md) · [프로젝트 개요](overview.md)

## 문서 읽는 순서

1. 아래 기능별 대표 목차에서 관련 문서를 찾는다.
2. 캐릭터 스펙은 `characters/`에서 확인한다. 상위 폴더에 캐릭터별 명세를 중복 생성하지 않는다.
3. 시즌 문서는 해당 시즌의 범위로 읽는다. 같은 캐릭터라도 메인과 베타 테스트 수치를 합치지 않는다.
4. 기획의 완료 기준과 구현 완료 여부는 구분한다. 현재 동작은 설정 파일과 실행 코드로 확인한다.

## 기능별 목차

| 번호 | 종류 | 대표 파일 |
|---|---|---|
| 1 | 접속·로그인 | [`01-access-login.md`](01-access-login.md) |
| 2 | 로비·UI | [`02-lobby-ui.md`](02-lobby-ui.md) |
| 3 | 전투·결과 | [`03-combat-results.md`](03-combat-results.md) |
| 4 | 캐릭터 | [`04-characters.md`](04-characters.md) |
| 5 | 재화 | [`05-currency.md`](05-currency.md) |
| 6 | 시스템 | [`06-systems.md`](06-systems.md) |

## 시즌 기획

- [`alpha-season-2-v13.md`](alpha-season-2-v13.md) — 알파 시즌 2 패치
- [`beta-season-transition.md`](beta-season-transition.md) — 베타 시즌 1 전환
- [`beta-season-2.md`](beta-season-2.md) — 베타 시즌 2 골드 러쉬
- [`beta-season-3.md`](beta-season-3.md) — 베타 시즌 3 아이보리
- [`beta-season-4.md`](beta-season-4.md) — 베타 시즌 4 샤르트뢰즈·레드 가드
- [`beta-season-4-balance-patch.md`](beta-season-4-balance-patch.md) — 베타 시즌 4 밸런스 패치
- [`beta-season-5.md`](beta-season-5.md) — 베타 시즌 5 놀이공원·민트·바운스 샷
- [`beta-season-5-app.md`](beta-season-5-app.md) — 베타 시즌 5 앱 전환 기획
- [`beta-season-6.md`](beta-season-6.md) — 베타 시즌 6
- [`beta-season-7.md`](beta-season-7.md) — 퍼플 독성 대도약
- [`beta-season-8.md`](beta-season-8.md) — 오렌지 껍질 회수
- [`beta-season-8-rotation-tournament.md`](beta-season-8-rotation-tournament.md) — 로테이션 토너먼트 기획 메모
- [`beta-ultimate-balance.md`](beta-ultimate-balance.md) — 궁극기 충전·피해 조정

## 자주 찾는 상세 문서

| 분야 | 문서 |
|---|---|
| 게임 모드 | [찹 우드](chop-wood.md), [훈련장](training-arena.md) |
| 캐릭터 | [캐릭터별 스펙](04-characters.md), [선택](character-select.md), [통계](character-stats.md) |
| 전투 | [조준](mouse-aim.md), [회복·재장전](combat-regen-autoreload.md), [결과 포즈](beta-result-poses.md) |
| 로비 | [로비](lobby.md), [리더보드·전적 UI](leaderboard-stats-ui.md) |
| 상점·보상 | [캐릭터 구매](character-rarity-shop.md), [꾸미기 상점](cosmetics-shop.md), [승리 보상](daily-gacha.md), [트로피](trophy-ranking.md) |
| 꾸미기 | [프로필](cosmetics-profile.md), [이모트](cosmetics-emote.md), [레드 테마 스킨](skin-red-theme.md), [골드 러쉬 스킨](skin-gold-rush.md) |
| 접속 | [일일 인증](daily-login.md), [초기 렌더링 수정](fix-initial-render.md) |
| 맵·오디오 | [맵 로테이션](map-rotation.md), [효과음](sound-effects.md), [오디오 용어](audio-glossary.md), [인게임 용어](ingame-glossary.md) |

## 작성 규칙

- 대표 파일에는 기능 범위, 기준 코드와 관련 상세 문서를 기록한다.
- 세부 수치와 긴 동작 설명은 기존 상세 문서에 유지한다.
- 알파 기본 게임과 베타 테스트 수치는 반드시 구분한다.
- 실제 수치의 최종 기준은 설정 파일과 실행 코드다.
- 아직 구현되지 않은 내용은 `계획`으로 명시한다.
- 새 문서는 관련 대표 목차 또는 이 목차에 연결한다.
- 과거 명세는 적용 시즌을 보존하고, 현재 문서와의 관계를 링크로 표시한다.
