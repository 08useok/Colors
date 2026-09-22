// Damage-only follow-up to charge candidate B. No game or live matchup writes.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { comparisonConfigs } from './compare-season5-season6.mjs';
import { createSeasonDuel } from './season-comparison-model.mjs';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const prior = JSON.parse(read('specs/ultimate-balance-comparison.json'));
for (const [path, hash] of Object.entries(prior.hashes)) {
  assert.equal(createHash('sha256').update(read(path).replace(/\r\n/g, '\n')).digest('hex'), hash, `Stale baseline: ${path}`);
}
const base = comparisonConfigs().season6;
for (const [id, patch] of Object.entries(prior.combined.B.patches)) Object.assign(base[id].ultimate, patch);
const ids = Object.keys(base);
const names = { red: '레드', green: '그린', blue: '블루', orange: '오렌지', yellow: '옐로우', cyan: '시안', purple: '퍼플', pink: '핑크', crimson: '크림슨', gold: '골드', ivory: '아이보리', chartreuse: '샤르트뢰즈', mint: '민트', azure: '애저' };
const fields = { blue: 'damage', cyan: 'damage', crimson: 'damage', azure: 'damage', yellow: 'connectionDamage', mint: 'damagePerSecond' };
const scenarios = prior.scenarios, repetitions = prior.repetitions, seedBase = prior.seedBase;
const plans = {
  B: {},
  all20: Object.fromEntries(Object.keys(fields).map(id => [id, 1.2])),
  all40: Object.fromEntries(Object.keys(fields).map(id => [id, 1.4])),
  focused20: Object.fromEntries(Object.keys(fields).filter(id => id !== 'blue').map(id => [id, 1.2])),
};
function configFor(multipliers) {
  const config = structuredClone(base);
  for (const [id, multiplier] of Object.entries(multipliers)) config[id].ultimate[fields[id]] = Math.round(base[id].ultimate[fields[id]] * multiplier);
  for (const id of ids) {
    const normalized = structuredClone(config[id]);
    if (multipliers[id]) normalized.ultimate[fields[id]] = base[id].ultimate[fields[id]];
    assert.deepEqual(normalized, base[id], 'Only the selected ultimate damage field may change');
  }
  return config;
}
function simulate(multipliers) {
  const config = configFor(multipliers), duel = createSeasonDuel(config);
  const matrix = Object.fromEntries(ids.map(id => [id, {}]));
  const diagnostics = { _events: {}, ...Object.fromEntries(ids.map(id => [id, 0])) };
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    const a = ids[i], b = ids[j];
    let wins = 0, losses = 0, draws = 0;
    for (let s = 0; s < scenarios.length; s++) for (let n = 0; n < repetitions; n++) for (const mirror of [1, -1]) {
      const seed = seedBase + s * 10000 + n;
      const result = mirror === 1 ? duel(a, b, scenarios[s], seed, 1, true, diagnostics)
        : -duel(b, a, scenarios[s], seed, -1, true, diagnostics);
      if (result > 0) wins++; else if (result < 0) losses++; else draws++;
    }
    const score = (wins + draws / 2) / 600;
    assert.equal(wins + losses + draws, 600);
    matrix[a][b] = { wins, losses, draws, games: 600, score };
    matrix[b][a] = { wins: losses, losses: wins, draws, games: 600, score: 1 - score };
    if (!multipliers[a] && !multipliers[b]) assert.deepEqual(matrix[a][b], prior.combined.B.matrix[a][b]);
  }
  const averages = Object.fromEntries(ids.map(id => [id, Object.values(matrix[id]).reduce((sum, r) => sum + r.score, 0) / 13 * 100]));
  assert(Math.abs(Object.values(averages).reduce((a, b) => a + b, 0) / 14 - 50) < 1e-8);
  return { multipliers, games: 54600, matrix, averages, diagnostics };
}
const results = {};
for (const [name, plan] of Object.entries(plans)) {
  results[name] = simulate(plan);
  if (name === 'B') {
    assert.deepEqual(results.B.matrix, prior.combined.B.matrix);
    assert.deepEqual(results.B.diagnostics, prior.combined.B.diagnostics);
  }
  console.log(name, '54,600 games complete');
}
// Changes to damage must not change any duel when ultimates are disabled.
const originalDuel = createSeasonDuel(base), strongerDuel = createSeasonDuel(configFor(plans.all40));
for (const id of Object.keys(fields)) for (const other of ids.filter(x => x !== id)) for (const scenario of scenarios) {
  const before = { _events: {} }, after = { _events: {} };
  assert.equal(originalDuel(id, other, scenario, seedBase, 1, false, before), strongerDuel(id, other, scenario, seedBase, 1, false, after));
  assert.deepEqual(before, after);
}
const paths = ['src/config/characters.js', 'src/config/beta-characters.js', 'tools/season-comparison-model.mjs', 'tools/compare-ultimate-damage.mjs', 'specs/ultimate-balance-comparison.json'];
const hashes = Object.fromEntries(paths.map(path => [path, createHash('sha256').update(read(path).replace(/\r\n/g, '\n')).digest('hex')]));
const report = { comparisonOnly: true, model: 'ultimate-damage-v1', roster: ids, initialCharge: 0, seedBase, scenarios, repetitions,
  chargePatches: prior.combined.B.patches, damageFields: fields, totalGames: 218400, hashes, results };
writeFileSync(new URL('specs/ultimate-damage-comparison.json', root), JSON.stringify(report, null, 2) + '\n');
const pct = n => n.toFixed(1);
const doc = `# B안 + 궁극기 피해량 상향 비교

## 범위

- 비교 전용. 게임 설정·상성표 변경 및 커밋·푸시 없음.
- 이전 B안 충전 조정(크림슨 7, 골드 6, 아이보리 3, 샤르트뢰즈 4, 애저 2)을 모든 후보에 유지한다.
- 기본 공격·체력·이동·재장전·궁극기 범위·지속시간은 유지한다. 궁극기에 별도 피해 수치가 있는 6종의 피해만 비교한다.
- 아이보리는 일반 공격과 궁극기가 같은 아이스크림 피해 수치를 사용한다. 기본 공격까지 함께 강화하지 않도록 이번 실험에서는 피해를 유지했다. 방어·은신·부활·공격 방해·탄환 확률 궁극기에 새 피해를 만들지 않는다.

## 피해 후보

| 캐릭터 | B안 피해 | +20% | +40% | 단위 |
|---|---:|---:|---:|---|
${Object.keys(fields).map(id => { const value = base[id].ultimate[fields[id]]; return `| ${names[id]} | ${value.toLocaleString('en-US')} | ${Math.round(value * 1.2).toLocaleString('en-US')} | ${Math.round(value * 1.4).toLocaleString('en-US')} | ${id === 'mint' ? '장판 초당 피해' : id === 'yellow' ? '회로 구간당 피해' : '궁극기 1회 적중 피해'} |`; }).join('\n')}

별도로 **블루는 유지하고 나머지 5종만 +20%**인 선택 상향안도 비교했다. 블루는 B안에서 이미 ${pct(results.B.averages.blue)}%였기 때문에 별도로 구분했다.

## 14종 결과

점수 = (승리 + 무승부 × 0.5) / 경기 수. 실제 플레이 승률이 아니다.

| 캐릭터 | B안 | 6종 +20% | 6종 +40% | 블루 제외 5종 +20% |
|---|---:|---:|---:|---:|
${ids.map(id => `| ${names[id]} | ${pct(results.B.averages[id])}% | ${pct(results.all20.averages[id])}% | ${pct(results.all40.averages[id])}% | ${pct(results.focused20.averages[id])}% |`).join('\n')}

각 후보는 다른 캐릭터도 함께 변경하므로 개별 캐릭터 점수 변화가 자기 궁극기 피해량만의 효과는 아니다.

## 발동과 적중

| 캐릭터 | B안 발동 | 선택 상향안 발동 |
|---|---:|---:|
${Object.keys(fields).map(id => `| ${names[id]} | ${results.B.diagnostics[id]} | ${results.focused20.diagnostics[id]} |`).join('\n')}

- 애저 궁극기 명중: B안 ${results.B.diagnostics._events.azureUltimateHit ?? 0}회 → 선택 상향안 ${results.focused20.diagnostics._events.azureUltimateHit ?? 0}회.
- 옐로우 회로 피해 적중: B안 ${results.B.diagnostics._events.circuitHit ?? 0}회 → 선택 상향안 ${results.focused20.diagnostics._events.circuitHit ?? 0}회. 적중이 없다면 피해량 상향 효과를 이 모델로 평가할 수 없다.
- 민트 피해는 초당 수치다. 장판 안에 10초 내내 머문다고 가정한 총 피해와 실제 전투 피해는 다르다.

## 검증과 한계

- 14종 91조합 × 600전 × 4조건 = **218,400전**을 새로 계산했다. 이전 충전량 비교 234,000전과 별도다.
- 충전 0, 최대 체력·탄약, 45초, 시작 거리 4·10·16과 조준 오차 0.035·0.1, 같은 시드 50개와 순서 교환을 사용했다.
- B안의 모든 조합과 발동·효과 진단이 이전 결과와 일치했다. 영향을 받지 않는 조합도 기준선과 일치했다.
- 설정 비교로 피해 필드 외 변경이 없음을 확인하고, 궁극기 비활성 상태에서 변경 전후 결과·효과 진단이 일치하는지 추가 검사했다(468쌍의 결과 비교, 총 936회 실행; 본 통계에서 제외).
- 기존 2D 모델이며 실제 게임 엔진·팀전·지형·사람의 전술을 재현하지 않는다. 높은 피해가 첫 명중 실패나 잘못된 스킬 사용 정책을 해결하지는 않는다.

재현: \`node tools/compare-ultimate-damage.mjs\`.

원자료: [전체 조합 결과](ultimate-damage-comparison.json).
`;
writeFileSync(new URL('specs/ultimate-damage-comparison.md', root), doc);
console.table(ids.map(id => ({ character: id, B: pct(results.B.averages[id]), all20: pct(results.all20.averages[id]), all40: pct(results.all40.averages[id]), focused20: pct(results.focused20.averages[id]) })));
