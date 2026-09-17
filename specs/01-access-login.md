# 1. 접속·로그인

## 범위

- 정적 서버 실행과 페이지 접속
- 계정 생성·전환·복구
- 일일 ID 인증
- 로그인 실패 횟수와 잠금
- 기존 계정 데이터 마이그레이션

## 접속 주소

| 화면 | 주소 |
|---|---|
| 기본 게임 | `http://localhost:4173/` |
| 베타 시즌 테스트 | `http://localhost:4173/beta-season.html` |
| 멀티플레이 개발 서버 | `http://localhost:8787` |

## 저장 키

| 키 | 저장소 | 역할 |
|---|---|---|
| `skullCreekAccounts` | `localStorage` | 전체 계정 목록 |
| `skullCreekAccount` | `localStorage` | 현재 계정 호환용 복사본 |
| `skullCreekActiveAccountId` | `sessionStorage` | 현재 탭의 활성 계정 |
| `colorsBetaSeason5Test` | `localStorage` | `?test=beta5` 상태와 재화 |
| `colorsBetaSeason6Test` | `localStorage` | 기본 테스트 및 `?test=beta6` 상태와 재화 |
| `colorsBetaSeason7Test` | `localStorage` | `?test=beta7` 상태와 재화 |
| `colorsBetaSeason8Test` | `localStorage` | `?test=beta8` 상태와 재화 |

`colorsBetaSeasonTest`는 과거 테스트 키다. 현재 지원되는 시즌 선택에서는 사용하지 않는다. 베타 저장은 `saveBetaState()`가 선택한 `BETA_STORAGE_KEY`에 기록한다.

## 기준 코드

- 로그인 UI: `index.html`
- 계정 로드·저장·마이그레이션: `src/main.js`
- 베타 테스트 상태: `src/beta-season.js`

## 상세 문서

- [`daily-login.md`](daily-login.md)
- [`fix-initial-render.md`](fix-initial-render.md)
