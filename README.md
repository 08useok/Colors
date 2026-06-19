# Skull Creek Prototype

브라우저에서 실행되는 3D TPS 배틀로얄 프로토타입입니다.

## 실행

PowerShell에서 아래 명령으로 로컬 서버를 띄운 뒤 브라우저에서 접속합니다.

```powershell
cd "C:\Users\useok\OneDrive\문서\New project"
py -m http.server 4173
```

주소:

```text
http://localhost:4173
```

## 조작

- `WASD`: 방향 이동
- 마우스: 조준
- `클릭/우클릭`: 공격
- 탄약 소진 시 자동 장전
- 웹: 좌측 조이스틱을 마우스로 드래그해 보조 이동 가능
- 모바일: 좌측 하단 조이스틱으로 이동, 우측 하단 `공격` 버튼으로 공격

## 포함된 시스템

- Red, Green, Blue 캐릭터 선택
- 계정 생성, 일일 로그인, 전적과 트로피
- 배틀로얄 모드와 훈련장
- 자동 장전, 피격, 처치, 자기장 축소
- 해골천 스타일 사막형 맵
- HUD, 킬 피드, 결과 화면
