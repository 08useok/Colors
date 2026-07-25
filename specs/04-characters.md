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
| 알파 기본 게임 | `src/config/characters.js` |
| 베타 테스트 | `src/config/beta-characters.js` |

## 캐릭터 문서

- Red: `src/config/characters.js`, `src/config/beta-characters.js`
- [`green-boomerang.md`](green-boomerang.md)
- Blue: `assets/3d/blue/`
- [`orange-rebalance.md`](orange-rebalance.md)
- [`yellow-character.md`](yellow-character.md)
- [`cyan-character.md`](cyan-character.md)
- [`purple-character.md`](purple-character.md)
- [`pink-character.md`](pink-character.md)
- [`crimson-character.md`](crimson-character.md)

## 3D 모델 모션

Blue, Cyan, Pink는 다음 이름을 공통으로 사용한다.

| 파일 | 역할 |
|---|---|
| `walk-m1s.glb` | 걷기 시작 |
| `walk-m2l.glb` | 반복 걷기 |
| `walk-m3e.glb` | 걷기 정지 |

공격 모션은 팔과 상체 뼈대에 별도 회전을 적용하며 이동 모션 위에 합성한다.

