# 일일 아이디 인증 시스템

## 기능 개요
회원가입 시 아이디를 등록하고, 매일 첫 접속 시 아이디를 입력해야 로비로 진입할 수 있다.

## 흐름

```
최초 접속:
  로드 → 회원가입 화면(아이디+닉네임 입력) → 로비 메인

재방문 — 오늘 첫 접속:
  로드 → 일일 인증 화면(아이디 입력) → 맞으면 로비 메인

재방문 — 오늘 이미 인증 완료:
  로드 → 로비 메인 (인증 화면 생략)
```

## 아이디 사양

| 항목 | 값 |
|---|---|
| 허용 문자 | 영문 · 한글 · 숫자 · 기호 전부 |
| 최대 길이 | 16자 |
| 최소 길이 | 1자 |
| 대소문자 | 구분 (입력한 그대로 저장/비교) |

## localStorage 스키마 변경

```json
{
  "id": "myId123",
  "nickname": "플레이어",
  "trophies": 0,
  "wins": 0,
  "losses": 0,
  "selectedCharacter": "red",
  "lastLoginDate": "2026-05-29",
  "loginAttempts": 0
}
```

- `lastLoginDate` — `YYYY-MM-DD` 형식의 날짜 문자열. 인증 성공 시 오늘 날짜로 갱신.
- `loginAttempts` — 오늘의 틀린 횟수. 날짜가 바뀌면 0으로 리셋.

## 회원가입 화면 (최초 1회)

- 아이디 입력 필드 (maxlength=16, placeholder="아이디 최대 16자")
- 닉네임 입력 필드 (maxlength=12, 기존 유지)
- `전장 입장` 버튼 → 둘 다 1자 이상이어야 활성화
- Enter 키 → 버튼 클릭과 동일

## 일일 인증 화면 (매일 첫 접속)

### 정상 상태
- 헤더: 닉네임 + 레벨 표시
- 아이디 입력 필드 (maxlength=16)
- `확인` 버튼
- Enter 키 → 확인과 동일

### 오류 상태 (틀렸을 때)
- 입력 필드 아래 `"아이디가 틀렸습니다."` 메시지 표시
- 남은 시도 횟수 표시: `"남은 시도: N회"`
- 틀린 횟수 `loginAttempts` 1 증가

### 잠금 상태 (5회 초과)
- 입력 필드 + 확인 버튼 비활성화
- `"계정 문제 해결하기"` 버튼 표시
- 해당 버튼 클릭 시: 저장된 아이디를 화면에 표시
  (`"내 아이디: [아이디값]"`)
- 다음 날 접속 시: loginAttempts = 0 리셋, 잠금 해제

## 날짜 비교 로직

```js
function getTodayString() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function isLoginDoneToday(account) {
  return account.lastLoginDate === getTodayString();
}

function isLockedToday(account) {
  // 오늘 날짜가 다르면 attempts 리셋
  if (account.lastLoginDate !== getTodayString()) return false;
  return account.loginAttempts >= 5;
}
```

## showLobby() 분기 로직

```
계정 없음           → 회원가입 화면
계정 있음 + 오늘 인증 완료  → 로비 메인
계정 있음 + 오늘 미인증    → 일일 인증 화면
```

## 비목표
- 서버/백엔드 없음 — localStorage 기반
- 비밀번호 없음 — 아이디만으로 인증
- 이메일 인증 없음
- 아이디 변경 기능 없음
- 계정 삭제 기능 없음

## Regression Guard
- 기존 닉네임 · 트로피 · 전적 · 캐릭터 선택 로직 변경 없음
- 기존 `result-overlay` style="display:none" 픽스 영향 없음
- 기존 계정 데이터(id 필드 없음)가 localStorage에 있을 경우:
  → `account.id`가 undefined이면 회원가입 화면으로 강제 이동

## Acceptance Criteria
- [ ] 최초 접속 시 아이디+닉네임 입력 화면이 표시된다
- [ ] 아이디·닉네임 둘 다 1자 이상 입력해야 전장 입장 버튼이 동작한다
- [ ] 아이디는 최대 16자까지 입력된다
- [ ] 재방문 시 오늘 첫 접속이면 일일 인증 화면이 표시된다
- [ ] 오늘 이미 인증 완료한 경우 로비 메인으로 바로 이동한다
- [ ] 아이디가 맞으면 로비 메인으로 진입하고 lastLoginDate가 갱신된다
- [ ] 아이디가 틀리면 "아이디가 틀렸습니다." 메시지와 남은 시도 횟수가 표시된다
- [ ] 5회 틀리면 입력 필드가 비활성화되고 "계정 문제 해결하기" 버튼이 표시된다
- [ ] "계정 문제 해결하기" 클릭 시 저장된 아이디가 화면에 표시된다
- [ ] 다음 날 접속 시 시도 횟수가 초기화된다
- [ ] 기존 계정(id 필드 없음)은 회원가입 화면으로 이동한다
