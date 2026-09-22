import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { BETA6_BALANCE } from '../src/config/beta6-balance.js';
const root = new URL('../', import.meta.url);
const read = p => readFileSync(new URL(p, root), 'utf8');
const r = JSON.parse(read('specs/beta6-balance-results.json'));
for (const [p, hash] of Object.entries(r.hashes)) assert.equal(createHash('sha256').update(read(p).replace(/\r\n/g, '\n')).digest('hex'), hash, `Stale report: ${p}`);
const ids = Object.keys(r.after.matrix);
const names = { red: '레드', green: '그린', blue: '블루', orange: '오렌지', yellow: '옐로우', cyan: '시안', purple: '퍼플', pink: '핑크', crimson: '크림슨', gold: '골드', ivory: '아이보리', chartreuse: '샤르트뢰즈', mint: '민트', azure: '애저' };
const labels = { maxHealth: '체력', projectileDamageReduction: '투사체 1발당 피해 감소', reloadDuration: '탄약당 재장전 시간', attackCooldown: '공격 간격', moveSpeedMultiplier: '이동속도 배율', knockbackResistance: '넉백 저항', attackDamage: '일반 공격 피해', bombSplashDamage: '과즙 피해', bulletDamage: '구슬 피해', bulletRange: '구슬 사거리', bulletSpeed: '구슬 속도', bulletKnockback: '구슬 넉백', attackPerceptionMinRange: '봇 인식 최소 거리', attackPerceptionRange: '봇 공격 인식 최대 거리', ultimateUseHealthMin: '궁극기 사용 최소 체력 비율', ultimateUseHealthMax: '궁극기 사용 최대 체력 비율', dashAwayFromTarget: '궁극기 탈출 사용', ultimateChargeOnHit: '피격 시 궁극기 충전', pursuesWhileLowHealth: '체력 50% 이하 추적', projectileDodgeDuration: '탄환 회피 시간', projectileDodgeSpeedMultiplier: '탄환 회피 속도 배율', projectileDodgeForwardFactor: '탄환 회피 전진 성분', projectileDodgeDetectionRange: '탄환 회피 감지 거리', projectileSize: '투사체 판정 크기', chartreuseRange: '샤르트뢰즈 공격 사거리', healCircleDamage: '음표 피해', iceCreamDamage: '아이스크림 피해', iceCreamRange: '아이스크림 사거리', iceCreamSpeed: '아이스크림 투척 속도', iceCreamZoneRadius: '아이스크림 장판 반경', iceCreamZoneSlowPercent: '아이스크림 장판 둔화율', iceCreamZoneTickInterval: '아이스크림 장판 틱 간격', stage1Damage: '1단계 금광석 피해', stage2Damage: '2단계 금광석 피해', stage3Damage: '3단계 금괴 피해', surfLength: '서프 공격 길이', surfSpeed: '서프 판정 속도', approachSurfRange: '접근 서프 감지 거리', approachSurfDistance: '접근 서프 이동 거리', approachSurfCooldown: '접근 서프 간격', range: '궁극기 사거리', boomerangDamage: '부메랑 피해', needleDamage: '독침 피해', poisonDPS: '독 초당 피해', vialDamage: '독병 피해', ultimateChargeRequired: '궁극기 충전', ultimateDamage: '궁극기 피해', chargeRequired: '궁극기 충전', damage: '궁극기 피해', damagePerSecond: '궁극기 초당 피해', connectionDamage: '회로 구간당 피해', deviceThrowSpeed: '장치 투척 속도', deviceInstallDelay: '장치 설치 대기 시간' };
const displayPatchValue = (field, value) => {
  if (value === undefined) return '신규';
  if (field === 'ultimateUseHealthMin' || field === 'ultimateUseHealthMax' || field === 'iceCreamZoneSlowPercent') return `${value * 100}%`;
  if (typeof value === 'boolean') return value ? '적용' : '미적용';
  return value;
};
const botOnlyFields = new Set(['attackPerceptionMinRange', 'attackPerceptionRange', 'ultimateUseHealthMin', 'ultimateUseHealthMax', 'dashAwayFromTarget', 'pursuesWhileLowHealth', 'projectileDodgeDuration', 'projectileDodgeSpeedMultiplier', 'projectileDodgeForwardFactor', 'projectileDodgeDetectionRange', 'approachSurfRange', 'approachSurfDistance', 'approachSurfCooldown']);
const patches = [], botPatches = [];
const addPatch = (id, field, before, after) => (botOnlyFields.has(field) ? botPatches : patches)
  .push({ id, field, before, after });
for (const [id, patch] of Object.entries(BETA6_BALANCE)) for (const [key, value] of Object.entries(patch)) {
  if (typeof value === 'object') for (const [field, after] of Object.entries(value)) addPatch(id, field, BETA_CHARACTERS[id][key][field], after);
  else addPatch(id, key, BETA_CHARACTERS[id][key], value);
}
const groupedPatchTable = rows => Object.entries(Object.groupBy(rows, row => row.id))
  .map(([id, changes]) => `| ${names[id]} | ${changes.map(({ field, before, after }) => `${labels[field] ?? field}: ${displayPatchValue(field, before)} → ${displayPatchValue(field, after)}`).join(' · ')} |`)
  .join('\n');
const pct = v => (v * 100).toFixed(1) + '%';
const winsAchieved = r.audit.filter(a => a.winScore === 1).length;
const exactRows = r.audit.filter(a => a.winScore === 1 && a.lossScore === 0 && a.winCount === 1 && a.lossCount === 1).length;
const targets = Object.fromEntries(r.audit.map(a => [a.id, new Set([a.winTarget, a.lossTarget])]));
const matrixCell = (a, b) => {
  const score = r.after.matrix[a][b].score, value = pct(score);
  if (targets[a].has(b) && (score === 0 || score === 1)) return `**${value}**`;
  if (score === 0 || score === 1) return `*${value}*`;
  return value;
};
const matrix = '| 카운터 / 카운팅 | ' + ids.map(id => names[id]).join(' | ') + ' |\n|---|' + ids.map(() => '---:|').join('') + '\n'
  + ids.map(a => '| **' + names[a] + '** | ' + ids.map(b => a === b ? 'X' : matrixCell(a, b)).join(' | ') + ' |').join('\n');
const text = `# 베타 시즌 6 캐릭터 전투·밸런스 패치

## 적용 범위와 결과

**베타 시즌 6 코드에 적용. 지정 순환 상성 14개는 모두 달성했으며, 캐릭터별 유일한 100%·0% 조건은 아직 미달성이다.**

- 메인 게임과 베타 시즌 5·7·8의 능력치는 유지한다. 시즌 6만 별도 설정을 복사해 사용한다.
- 민트를 시즌 6 선택·무료 테스트 목록에 추가하고 궁극기 게이지·입력을 연결했다. 총 14종이다.
- 시즌 6 골드 러쉬·쇼다운은 플레이어와 봇이 같은 전투 엔진으로 일반 공격·궁극기·탄약·충전·상태 효과를 계산한다. 플레이어는 직접 조준하고, 봇은 자동으로 조준·이동한다.
- 봇은 다른 캐릭터 9종으로 구성하고 다음 경기에서 명단을 순환한다. 복제된 플레이어 모델 대신 캐릭터 색상의 몸체와 이름을 표시한다. 축구 모드는 기존 공 추적·패스 동작을 유지한다.
- 보정 계수나 상대별 승패 강제 처리는 없다. 사용자 요청대로 기본 능력치와 기술 수치만 조정했다.
- 14종 중 지정한 상대에게 전승한 방향은 **${winsAchieved}/14**. 지정한 승·패 상대가 맞고 100%·0% 상대가 정확히 한 명씩인 캐릭터는 **${exactRows}/14**다.

## 게임 수치 변경

이 표는 **실제 베타 설정의 변경 전 값** 기준이다. 앞선 메인 기반 가상 시즌 6 비교의 숫자와 다르다.

| 캐릭터 | 변경 내용 |
|---|---|
${groupedPatchTable(patches)}

### 봇 전용 행동 변경

아래 항목은 자동 조작 봇에게만 적용된다. 플레이어의 공격 가능 거리와 궁극기 사용 조건을 제한하지 않는다.

| 캐릭터 | 변경 내용 |
|---|---|
${groupedPatchTable(botPatches)}

체력·일반 공격 조정은 비목표 전승·전패를 줄이는 방향으로 적용했다. 모든 변경은 모든 상대에게 동일하게 적용된다.

## 실제 계산 결과

각 칸은 행 캐릭터의 **승리 + 무승부 0.5점** 비율이다. 조합당 600전이며 자기 대전은 X다. 목표값으로 덮어쓰지 않았다. 지정된 목표 상대에게 실제로 100%·0%를 달성한 칸은 **굵게**, 목표 상대가 아닌데 실제 결과가 100%·0%인 칸은 *이탤릭체*로 표시한다. 목표에 도달하지 못한 지정 상대는 일반 글씨다.

${matrix}

## 목표 대비

| 캐릭터 | 100% 목표 상대 | 변경 전 | 변경 후 | 0% 목표 상대 | 변경 후 | 현재 100% / 0% 상대 수 |
|---|---|---:|---:|---|---:|---:|
${r.audit.map(a => `| ${names[a.id]} | ${names[a.winTarget]} | ${pct(r.before.matrix[a.id][a.winTarget].score)} | ${pct(a.winScore)} | ${names[a.lossTarget]} | ${pct(a.lossScore)} | ${a.winCount} / ${a.lossCount} |`).join('\n')}

아직 목표에 도달하지 않은 조합과 비목표 전승·전패가 남아 있으므로 전체 목표 달성 패치라고 표시하지 않는다. 전승·전패는 이 실험의 유한한 표본에 관한 값이며 실전 필승·필패 보장이 아니다.

## 검증

- 새로운 시즌 6 전투 엔진에서 변경 전·후 각 54,600전, 총 **109,200전**을 계산했다.
- 14종 91조합, 거리 10·13·16, 조준 오차 0.035·0.1, 시드 50개, 참가자 순서 교환 2회. 80×80 전장에서 경기당 최대 45초, 초당 60회 계산, 궁극기 충전 0으로 시작한다.
- 30초부터 안전 구역이 반경 40에서 8타일까지 축소된다. 45초에도 양쪽이 생존하면 남은 체력 비율이 높은 캐릭터가 승리한다.
- 후보 탐색은 시드 5개를 사용하고 최종 결과는 50개로 확대했다. 시드 45개는 후보 선택에 사용하지 않았다.
- 14종 일반 공격, 11종 궁극기 및 핑크 아군 부활, 빙결, 은신 해제, 보호막, 벽 충돌, 공격 정리, 동일 시드 재현을 자동 검사했다.
- 사망 이벤트로 경기가 끝날 때 이미 정리된 전투 객체를 참조하지 않는지 연결 코드도 검사했다.
- 기존 메인의 민트·블루·그린·핑크 검증과 구문 검사를 통과했다. 새 브라우저를 열어 화면을 확인하지는 않았다.
- 상성 계산은 장애물 없는 1대1이다. 실제 경기에는 벽·인원·수동 조준·목표물 수집이 있으므로 게임 전체의 실측 승률은 아니다. 팀원이 없는 1대1에서 핑크 부활은 발동하지 않는다.

## 구현과 재현

- 설정: [beta6-balance.js](../src/config/beta6-balance.js)
- 공통 전투: [beta6-combat.js](../src/combat/beta6-combat.js)
- 연결: [beta-season.js](../src/beta-season.js)
- 검증: \`npm run check:beta6\`, \`npm run check\`.
- 계산: \`npm run simulate:beta6\`, 문서 갱신: \`node tools/render-beta6-report.mjs\`.
- 원자료: [beta6-balance-results.json](beta6-balance-results.json). 변경 전·후 전체 조합 및 소스 해시를 포함한다.

커밋·푸시는 하지 않았다.
`;
writeFileSync(new URL('specs/beta-season-6-balance-patch.md', root), text);
console.log(`Report written. Target edges: ${winsAchieved}/14; exact rows: ${exactRows}/14.`);
