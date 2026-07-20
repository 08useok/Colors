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
