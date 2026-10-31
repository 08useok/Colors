# 4. 캐릭터

## 범위

- 캐릭터 능력치와 역할
- 일반 공격, 공식 능력과 궁극기
- 캐릭터 소개와 공격 설명
- 3D 모델, 텍스처와 이동·공격 모션
- 알파와 베타 밸런스 분리

## 설정 기준

| 환경 | 설정 파일 |
|---|---|
| 메인 게임 | `src/config/characters.js` |
| 베타 기본값 | `src/config/beta-characters.js` |
| 베타 시즌8 최종값 | 위 기본값 → `beta7-balance.js` → `beta8-balance.js` |

## 캐릭터별 스펙

캐릭터별 스펙은 `characters/`의 문서 하나로 관리한다. 기본 스탯·공격·궁극기·고유 동작을 같은 문서에 기록하며, 시즌별 변경은 해당 시즌 문서에 연결한다. 현재 수치는 위 설정 파일과 실행 코드를 함께 확인한다.

[시즌8 전체 수치·기능·검증](beta-season-8.md). 각 캐릭터 문서의 **베타 시즌8 현재 확정 수치** 절에서0.8.65를 확인한다. 앞부분의 메인/과거 수치와 구분한다.

| 캐릭터 | 스펙 문서 |
|---|---|
| 레드 (red) | [레드](characters/red.md) |
| 샤르트뢰즈 (chartreuse) | [샤르트뢰즈](characters/chartreuse.md) |
| 옐로 (yellow) | [옐로](characters/yellow.md) |
| 아이보리 (ivory) | [아이보리](characters/ivory.md) |
| 살몬 (salmon) | [살몬](characters/salmon.md) |
| 골드 (gold) | [골드](characters/gold.md) |
| 그린 (green) | [그린](characters/green.md) |
| 애저 (azure) | [애저](characters/azure.md) |
| 라벤더 (lavender) | [라벤더](characters/lavender.md) |
| 크림슨 (crimson) | [크림슨](characters/crimson.md) |
| 블루 (blue) | [블루](characters/blue.md) |
| 오렌지 (orange) | [오렌지](characters/orange.md) |
| 민트 (mint) | [민트](characters/mint.md) |
| 시안 (cyan) | [시안](characters/cyan.md) |
| 핑크 (pink) | [핑크](characters/pink.md) |
| 퍼플 (purple) | [퍼플](characters/purple.md) |
| 크리스탈 (crystal) | [크리스탈](characters/crystal.md) |

## 미구현 전투 계획안

- [라즈베리 (Raspberry)](characters/raspberry.md) — 덩굴 저격·원형 내부 속박. 확정 수치와 제안을 구분하며 출시 시즌은 미정이다.

## 시즌별 변경

- [베타 궁극기 밸런스](beta-ultimate-balance.md)
- [베타 8 캐릭터 밸런스 분석](beta8-character-balance-analysis.md)
- [전체 시즌 목차](README.md#시즌-기획)

## 3D 모델 모션

Blue, Cyan, Pink는 다음 이름을 공통으로 사용한다.

| 파일 | 역할 |
|---|---|
| `walk-m1s.glb` | 걷기 시작 |
| `walk-m2l.glb` | 반복 걷기 |
| `walk-m3e.glb` | 걷기 정지 |

공격 모션은 팔과 상체 뼈대에 별도 회전을 적용하며 이동 모션 위에 합성한다.
