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
| 베타 테스트 | `src/config/beta-characters.js` |

## 캐릭터별 스펙

캐릭터별 스펙은 `characters/`의 문서 하나로 관리한다. 기본 스탯·공격·궁극기·고유 동작을 같은 문서에 기록하며, 시즌별 변경은 해당 시즌 문서에 연결한다. 현재 수치는 위 설정 파일과 실행 코드를 함께 확인한다.

| 캐릭터 | 스펙 문서 |
|---|---|
| Red | [Red](characters/red.md) |
| Green | [Green](characters/green.md) |
| Blue | [Blue](characters/blue.md) |
| Orange | [Orange](characters/orange.md) |
| Yellow | [Yellow](characters/yellow.md) |
| Cyan | [Cyan](characters/cyan.md) |
| Purple | [Purple](characters/purple.md) |
| Pink | [Pink](characters/pink.md) |
| Crimson | [Crimson](characters/crimson.md) |
| Gold | [Gold](characters/gold.md) |
| Ivory | [Ivory](characters/ivory.md) |
| Chartreuse | [Chartreuse](characters/chartreuse.md) |
| Mint | [Mint](characters/mint.md) |

Azure는 [베타 시즌 6](beta-season-6.md)에서 확인한다.

## 시즌별 변경

- [베타 궁극기 밸런스](beta-ultimate-balance.md)
- [전체 시즌 목차](README.md#시즌-기획)

## 3D 모델 모션

Blue, Cyan, Pink는 다음 이름을 공통으로 사용한다.

| 파일 | 역할 |
|---|---|
| `walk-m1s.glb` | 걷기 시작 |
| `walk-m2l.glb` | 반복 걷기 |
| `walk-m3e.glb` | 걷기 정지 |

공격 모션은 팔과 상체 뼈대에 별도 회전을 적용하며 이동 모션 위에 합성한다.
