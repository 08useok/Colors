# 베타 시즌 8 할로윈 테마 적용

2026-10-14 · 기본 베타 페이지 `beta-season.html`에 로드맵의 할로윈 테마를 적용했다.

## 실제 적용 범위

- 로딩 화면: 텍스트 없는 유령 광장 이미지, 호박등·달·성·보라색 안개, 할로윈 / KNOCKOUT 시즌 표기. 이 이미지는 시즌 8에서만 로드한다.
- 화면: 헤더·지갑·메뉴·상점·모달·전투 패널에 한밤색과 유령 보라, 호박 주황 테두리, 독빛 초록 강조를 사용한다.
- 3D 로비: 보라색 지면·벽·기둥·계단, 어두운 불투명 외곽 지면, 호박등 14개·묘비 6개·박쥐 7개·유령 성·보라색 달을 추가했다.
- 구역 이름: 할로윈 유령 광장, 유령 성 관문, 달빛 묘지, 저주받은 훈련장, 호박 작업장.
- 장식은 벽 상단이나 이동 영역 바깥에 두며, 기존 방·복도·계단 높이·충돌과 텔레포트 좌표는 유지한다.
- 모바일에서 위치 카드를 메뉴 아래로 내리고, 테스트 버튼과 전투 패널의 겹침을 줄였다.
- 다른 시즌 페이지에서는 기존 재질과 장식을 사용한다. 메인 시즌 7에는 이 테마를 적용하지 않는다.

초기 테마 작업 이후 **2026-10-15에 할로윈 스킨 FBX 4종과 KNOCKOUT 3대3 라운드 모드를 추가 적용했다.** [시즌 8 적용 현황과 규칙](beta-season-8.md)을 참조한다. 기존 정규 이벤트와 라벤더 포함 16종 테스트도 유지한다. 로비에는 사용자 제공 「Midnight At The Manor Gates」를 반복 재생한다. KNOCKOUT에서는 사용자 제공 「The Midnight Gambit」를 반복 재생하고, 경기 종료 시 로비 음악으로 돌아간다. 쇼다운·젬 그랩·사커 킥·찹 우드·골드 러시에도 아래 전용곡을 적용했다. 쇼다운+는 쇼다운 곡을 함께 사용한다. 이전 시즌과 메인 음악은 유지한다.

| 모드 | 시즌 8 전용곡 |
|---|---|
| 쇼다운 / 쇼다운+ | Graveyard Gambit |
| 젬 그랩 | The Midnight Gem Heist |
| 사커 킥 | Trick or Goal |
| 골드 러시 | Vault of the Greedy Phantom |
| 찹 우드 | The Crooked Grove |

모든 전투곡은 반복 재생한다. 훈련장에는 「Violet Courtyard Study」를 적용했다. 로비 서쪽 훈련장(위치 안내 기준)에 들어가면 훈련장 곡으로, 중앙 광장 등 다른 로비 구역으로 나오면 로비곡으로 전환한다. 경기 종료 후 훈련장에 복귀하면 훈련장 곡을 재생한다.

## 검증

- `node tools/test-beta8-theme-browser.mjs`: 시즌 8 실제 색상·장식 수·불투명 지면·16종, 캐릭터 이동, 모바일 가로 넘침과 메뉴 겹침, 시즌 7 격리, 페이지 실행 오류 없음.
- `npm run check:maps`: 21개 이벤트 맵의 밀도·경로·매칭·사커 반사와 찹 우드 검사.
- `npm run check:main7`, `node tools/test-aim-guides.mjs`.
- [브라우저 기록](beta8-theme-verification.json), [로비](beta8-halloween-lobby.png), [전체 보기](beta8-halloween-overview.png), [모바일](beta8-halloween-mobile.png).

## 로딩 이미지 제작

내장 image generation 도구로 제작한 `assets/art/beta8-halloween-loading.png`를 사용한다. 로딩 이미지는 콘셉트 배경이며, 3D 로비는 별도 코드 장식과 기존 지형 모델로 구현했다.

### 제작 프롬프트

Create a polished wide landscape 16:9 loading-background illustration for COLORS BETA SEASON 8, whose actual roadmap theme is HALLOWEEN and KNOCKOUT. Stylized 3D cartoon game environment, no characters, no text, no logo, no color swatches, no interface elements. A haunted courtyard with simple stone platforms, pumpkin lanterns along the edges, a few tombstones and twisted trees, a distant gothic castle silhouetted under an enormous violet moon, tiny bats. Color palette pumpkin orange #FF7A18, phantom violet #9B6DE3, toxic green #98D84D accents, bone cream #F3E5C9, dark midnight #171321. Gentle low violet mist, warm glowing pumpkin eyes, restrained green magical glow. Composition leaves center and bottom-center relatively dark and uncluttered for readable UI text overlaid by code. Visually cohesive with smooth spherical toy-like game mascots, friendly playful spooky atmosphere. Environment art only, high-quality subtle depth, clearly different from a beach or desert. Opaque background.
