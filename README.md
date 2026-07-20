# Colors

브라우저에서 실행하는 Three.js 기반 3D TPS 배틀로얄 프로토타입입니다.

- 현재 버전: `v1.4.14`
- 알파 시즌 라스트 패치
- 빌드 도구 없이 ES 모듈과 Three.js CDN을 사용합니다.

## 실행

프로젝트 폴더에서 정적 파일 서버를 실행합니다.

```powershell
py -m http.server 4173
```

브라우저에서 다음 주소로 접속합니다.

```text
http://localhost:4173/
```

## 조작법

- `WASD`: 이동
- 마우스 드래그: 시점 회전
- 마우스 휠: 확대 및 축소
- 마우스 좌클릭 또는 공격 버튼: 일반 공격
- `Space` 또는 `Q`: 사용 가능한 어빌리티

## 멀티플레이 개발 서버

Cloudflare Worker를 함께 테스트하려면 별도 터미널에서 다음 명령을 실행합니다.

```powershell
npm install
npm run dev
```

Worker 개발 서버 주소는 `http://localhost:8787`입니다.

## 프로젝트 구조

- `index.html`: 게임 화면, 메뉴와 HUD 마크업
- `styles.css`: 전체 화면 스타일
- `src/main.js`: 게임 상태, 전투, 맵, 캐릭터와 렌더링 로직
- `src/config/characters.js`: 캐릭터 스펙 설정
- `src/multiplayer.js`: 멀티플레이 연결 코드
- `assets/`: 모델, 이미지, 사운드와 시각 효과 리소스
- `specs/`: 캐릭터와 시스템 상세 문서
- `server/`, `party/`: 멀티플레이 서버 코드

## 코드 설명서

### 게임이 시작되는 순서

1. `index.html`이 게임 화면과 버튼을 만듭니다.
2. `<script type="module">`이 `src/main.js`를 불러옵니다.
3. JavaScript가 Three.js 장면, 카메라, 조명, 맵과 캐릭터를 생성합니다.
4. 게임 루프가 매 프레임 이동, 공격, 충돌, UI와 화면 렌더링을 갱신합니다.

README는 게임 화면에 표시되는 페이지가 아닙니다. 게임 코드 변경 결과는 로컬 서버를 실행한 뒤 브라우저를 새로고침해 확인합니다.

### `src/main.js`

현재 게임의 핵심 코드입니다.

- `state`: 플레이어, 투사체, 효과, 맵과 로비 정보를 보관하는 게임 상태
- `scene`: 화면에 표시할 Three.js 객체가 들어가는 장면
- `camera`: 플레이어가 보는 시점
- `renderer`: 장면을 브라우저 캔버스에 그리는 렌더러
- `createMap()`: 전투 맵과 충돌 구조물 생성
- `state.projectiles`: 현재 날아가는 투사체 목록
- `state.effects`: 일시적인 타격 및 시각 효과 목록
- `updateEffects(dt)`: 효과의 수명과 애니메이션 갱신
- 게임 루프: 이동, 전투, 카메라와 렌더링을 프레임마다 처리

### 캐릭터 수치

캐릭터 체력, 이동속도, 피해량, 사거리와 공격 속도는 `src/config/characters.js`에서 관리합니다.

일반적으로 사용하는 이름:

- `maxHealth`: 최대 체력
- `moveSpeed`: 이동속도
- `damage`: 공격 피해량
- `range`: 공격 사거리
- `projectileSpeed`: 투사체 속도
- `cooldown`: 다음 공격까지의 대기 시간
- `reloadDuration`: 재장전 시간
- `maxAmmo`: 최대 탄약

설정 파일의 수치를 먼저 수정하고, 실제 공격 동작은 `src/main.js`에서 해당 캐릭터의 공격 처리 코드를 확인합니다.

### 게임 상태와 효과

게임 중 변경되는 값은 가능한 한 `state` 객체에 저장합니다. 투사체나 타격 효과처럼 잠시 존재하는 3D 객체는 장면에 추가한 뒤 해당 배열에도 등록해야 합니다.

모드가 종료될 때는 장면에서 객체를 제거하고 관련 배열도 비워야 이전 전투의 투사체나 효과가 남지 않습니다.

### 맵의 벽 생성

일반 전투 맵의 배치는 `src/main.js`의 `MAP_POOL`에 저장됩니다. 각 맵의 `wallSpecs`는 벽 하나를 다음 순서로 정의합니다.

```js
wallSpecs: [
  [x, z, width, depth],
]
```

예를 들어 `[-18, 40, 8, 2]`는 월드 좌표 `(-18, 40)`에 가로 8타일, 세로 2타일인 벽을 만듭니다. 높이를 생략하면 기본값 2.8을 사용합니다.

`createMap(mapData)`가 `wallSpecs`를 순회하며 `createWall()`을 호출합니다. `createWall()`은 두 가지 일을 합니다.

1. `THREE.BoxGeometry`로 화면에 보이는 직육면체 벽을 생성합니다.
2. 벽의 좌표와 크기를 `state.battleSolids`에 등록해 플레이어와 투사체의 충돌 판정에 사용합니다.

회전 벽은 `angle` 값을 받을 수 있습니다. 충돌 영역은 회전된 벽을 감싸는 AABB의 `minX`, `maxX`, `minZ`, `maxZ`로 계산됩니다.

```js
createWall(x, z, width, depth, height, group, solids, color, angle);
```

- `x`, `z`: 벽 중심 위치
- `width`, `depth`, `height`: 벽 크기
- `group`: 벽을 추가할 Three.js 그룹
- `solids`: 충돌 정보를 저장할 배열
- `color`: 벽 색상
- `angle`: Y축 회전 각도(라디안)

맵을 바꿀 때 `clearBattleMap()`이 기존 벽의 3D 객체와 충돌 배열을 정리한 뒤 새 맵을 생성합니다.

### 수풀 생성과 은신

수풀 위치도 `MAP_POOL`의 `bushSpecs`에 저장됩니다.

```js
bushSpecs: [
  [x, z],
]
```

`createMap()`은 각 좌표에 `createBush()`를 호출합니다. 수풀 하나는 4~5개의 저해상도 정이십면체 덩어리를 원형으로 배치해 만듭니다. 덩어리마다 크기, 회전, 위치와 녹색 계열 재질이 조금씩 달라 자연스럽게 보입니다.

```js
createBush(x, z, radius, group, bushArray);
```

생성된 수풀은 화면의 `group`에 추가되고, `{ x, z, radius, mesh }` 형태로 `state.battleBushes`에 저장됩니다. 수풀은 벽처럼 이동을 막는 고체가 아니라 은신 영역입니다.

`isInBush(fighter)`는 캐릭터와 수풀 중심 사이의 거리 제곱이 수풀 반지름 제곱보다 작은지 검사합니다. 수풀 안에 있는 캐릭터는 3타일보다 먼 상대에게 숨겨지며, 공격하거나 피해를 받으면 `revealedUntil`이 설정되어 잠시 드러납니다. `isVisibleThroughBush()`는 관찰자와 대상 사이에 수풀이 있는지도 검사합니다.

### 재화 저장 방식

일반 재화는 계정 객체의 `coins` 숫자로 저장됩니다.

```js
account.coins = (account.coins || 0) + coinsEarned;
saveAccount(account);
```

계정 데이터는 브라우저 저장소를 사용합니다.

- `skullCreekAccounts`: 모든 계정을 ID별로 저장하는 `localStorage` 레지스트리
- `skullCreekAccount`: 현재 계정의 호환용 복사본
- `skullCreekActiveAccountId`: 현재 탭에서 사용하는 계정 ID를 저장하는 `sessionStorage`

`saveAccount(account)`은 현재 계정을 `skullCreekAccounts`에 넣고, 활성 계정 ID와 호환용 복사본도 함께 갱신합니다. `loadAccount()`은 활성 ID로 계정을 찾고, 없으면 호환용 복사본을 읽어 레지스트리로 이전합니다.

전투 보상, 이벤트 보상이나 상점 구매로 `account.coins`가 바뀌면 반드시 `saveAccount(account)`을 호출해야 새로고침 후에도 유지됩니다. 로비의 재화 표시는 저장된 `account.coins`를 읽어 갱신합니다.

이 방식은 브라우저 로컬 저장이므로 다른 기기나 다른 브라우저로 자동 동기화되지 않습니다. 사이트 데이터나 `localStorage`를 삭제하면 저장된 계정과 재화도 사라질 수 있습니다.

### 변경 후 확인 순서

1. 수정한 파일을 저장합니다.
2. JavaScript 문법 검사를 실행합니다.
3. 로컬 서버를 실행합니다.
4. 브라우저에서 강력 새로고침합니다.
5. 변경한 캐릭터와 기능을 직접 시험합니다.
6. 브라우저 개발자 도구에서 콘솔 오류를 확인합니다.

## 검증

```powershell
npm run check
node --check src/main.js
node --check src/multiplayer.js
node --check src/config/characters.js
```

별도의 테스트 프레임워크와 빌드 단계는 없습니다.
