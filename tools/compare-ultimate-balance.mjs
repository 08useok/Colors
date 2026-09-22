// Proposals only: writes two experiment reports; never edits game configuration.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { comparisonConfigs } from './compare-season5-season6.mjs';
import { createSeasonDuel } from './season-comparison-model.mjs';

const root = new URL('../', import.meta.url);
const base = comparisonConfigs().season6, ids = Object.keys(base);
const names = { red: '레드', green: '그린', blue: '블루', orange: '오렌지', yellow: '옐로우', cyan: '시안', purple: '퍼플', pink: '핑크', crimson: '크림슨', gold: '골드', ivory: '아이보리', chartreuse: '샤르트뢰즈', mint: '민트', azure: '애저' };
const scenarios = [4, 10, 16].flatMap(distance => [.035, .1].map(aimError => ({ distance, aimError })));
const seedBase = 20260917, repetitions = 50;
const candidates = {
  A: { crimson: { chargeRequired: 7 }, gold: { chargeRequired: 8 }, ivory: { chargeRequired: 4 }, chartreuse: { chargeRequired: 5 }, azure: { chargeRequired: 3 } },
  B: { crimson: { chargeRequired: 7 }, gold: { chargeRequired: 6 }, ivory: { chargeRequired: 3 }, chartreuse: { chargeRequired: 4 }, azure: { chargeRequired: 2 } },
};
const trials = { green5: ['green', 5], blue5: ['blue', 5], yellow1: ['yellow', 1], crimson6: ['crimson', 6], gold6: ['gold', 6], ivory3: ['ivory', 3], chartreuse4: ['chartreuse', 4], azure2: ['azure', 2], azure1: ['azure', 1] };
function configure(patches) {
  const config = structuredClone(base);
  for (const [id, patch] of Object.entries(patches)) Object.assign(config[id].ultimate, patch);
  for (const id of ids) {
    const { ultimate: before, ...basicBefore } = base[id];
    const { ultimate: after, ...basicAfter } = config[id];
    assert.deepEqual(basicBefore, basicAfter, 'Basic stats must not change');
    if (!patches[id]) assert.deepEqual(before, after);
  }
  return config;
}
function simulate(patches, onlyCharacter = null) {
  const config = configure(patches), duel = createSeasonDuel(config);
  const matrix = Object.fromEntries(ids.map(id => [id, {}]));
  const diagnostics = { _events: {}, ...Object.fromEntries(ids.map(id => [id, 0])) };
  let games = 0;
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    const a = ids[i], b = ids[j];
    if (onlyCharacter && a !== onlyCharacter && b !== onlyCharacter) continue;
    let wins = 0, losses = 0, draws = 0;
    for (let s = 0; s < scenarios.length; s++) for (let n = 0; n < repetitions; n++) for (const mirror of [1, -1]) {
      const seed = seedBase + s * 10000 + n;
      const r = mirror === 1 ? duel(a, b, scenarios[s], seed, 1, true, diagnostics)
        : -duel(b, a, scenarios[s], seed, -1, true, diagnostics);
      if (r > 0) wins++; else if (r < 0) losses++; else draws++;
    }
    assert.equal(wins + losses + draws, 600);
    const score = (wins + draws / 2) / 600;
    matrix[a][b] = { wins, losses, draws, games: 600, score };
    matrix[b][a] = { wins: losses, losses: wins, draws, games: 600, score: 1 - score };
    games += 600;
  }
  const averages = Object.fromEntries((onlyCharacter ? [onlyCharacter] : ids).map(id => [id, Object.values(matrix[id]).reduce((sum, r) => sum + r.score, 0) / 13 * 100]));
  if (!onlyCharacter) assert(Math.abs(Object.values(averages).reduce((a, b) => a + b, 0) / ids.length - 50) < 1e-8);
  return { patches, games, matrix, averages, diagnostics };
}
const baseline = simulate({});
assert.deepEqual(baseline.matrix, JSON.parse(readFileSync(new URL('specs/season5-vs-season6-comparison.json', root), 'utf8')).season6.matrix);
console.log('Baseline matches prior 14-character result.');
const isolated = {};
for (const [key, [id, chargeRequired]] of Object.entries(trials)) {
  isolated[key] = { id, chargeRequired, ...simulate({ [id]: { chargeRequired } }, id) };
  console.log(key, isolated[key].averages[id].toFixed(2), 'casts', isolated[key].diagnostics[id]);
}
const combined = {};
for (const [name, patch] of Object.entries(candidates)) {
  combined[name] = simulate(patch);
  console.log('Combined candidate', name, 'complete');
}
const sources = ['src/config/characters.js', 'src/config/beta-characters.js', 'tools/season-comparison-model.mjs', 'tools/compare-season5-season6.mjs', 'tools/compare-ultimate-balance.mjs'];
const hashes = Object.fromEntries(sources.map(path => [path, createHash('sha256').update(readFileSync(new URL(path, root), 'utf8').replace(/\r\n/g, '\n')).digest('hex')]));
const totalGames = baseline.games + Object.values(isolated).reduce((n, r) => n + r.games, 0) + Object.values(combined).reduce((n, r) => n + r.games, 0);
const report = { model: 'ultimate-balance-proposals-v1', comparisonOnly: true, roster: ids, initialCharge: 0, seedBase, repetitions, scenarios, totalGames, hashes, baseline, isolated, combined };
writeFileSync(new URL('specs/ultimate-balance-comparison.json', root), JSON.stringify(report, null, 2) + '\n');
const pct = n => n.toFixed(1), delta = (a, b) => `${a - b >= 0 ? '+' : ''}${pct(a - b)}`;
const doc = `# 궁극기 중심 밸런스 패치 후보 비교

## 범위와 조건

- **시뮬레이션 제안만 작성한다. 게임 설정·상성표에 적용하지 않으며 커밋·푸시하지 않는다.**
- 기존 13종에 민트를 유지하고 애저·옐로우 전기 회로를 추가한 가상 시즌 6, 총 14종 기준이다. 현재 베타 테스트 페이지 그대로의 비교는 아니다.
- 기본 체력·공격·이동·재장전은 모두 고정했다. 이번 후보는 궁극기 충전 요구량만 조정한다.
- 충전 0으로 시작, 1대1, 최대 45초. 거리 3종 × 조준 오차 2종 × 시드 50개 × 순서 교환 2회 = 조합당 600전.
- 기준선 54,600전 + 단독 변경 9안 × 7,800전 + 묶음 후보 2안 × 54,600전 = **${totalGames.toLocaleString('en-US')}전**.
- 점수 = (승리 + 무승부 × 0.5) / 경기 수. 실제 플레이 승률이나 통계적으로 독립적인 실전 표본이 아니다.
- 이전 14종 기준 결과와 모든 조합의 승·패·무가 정확히 일치하는지 먼저 검증했다.

## 묶음 패치 후보

숫자는 궁극기 충전에 필요한 명중 횟수다. 골드는 단계별 가중 충전량을 사용한다. 피해량·지속시간·범위는 현재 값을 유지한다.

| 캐릭터 | 현재 | A: 소폭 완화 | B: 발동 기회 확대 |
|---|---:|---:|---:|
${Object.keys(candidates.B).map(id => `| ${names[id]} | ${base[id].ultimate.chargeRequired} | ${candidates.A[id].chargeRequired} | ${candidates.B[id].chargeRequired} |`).join('\n')}

| 캐릭터 | 현재 점수 | A 점수 | B 점수 | B 변화 | 현재 / A / B 궁극기 발동 |
|---|---:|---:|---:|---:|---:|
${ids.map(id => `| ${names[id]} | ${pct(baseline.averages[id])}% | ${pct(combined.A.averages[id])}% | ${pct(combined.B.averages[id])}% | ${delta(combined.B.averages[id], baseline.averages[id])}%p | ${baseline.diagnostics[id]} / ${combined.A.diagnostics[id]} / ${combined.B.diagnostics[id]} |`).join('\n')}

발동 횟수는 캐릭터별 7,800전 합계이며, 발동한 경기 비율이 아니다. 여러 번 사용한 경기가 있을 수 있다. 변경하지 않은 캐릭터의 점수도 상대 변화에 따라 달라진다.

## 한 캐릭터씩 바꾼 결과

다른 13종을 현재 값으로 고정해 각 조정의 영향을 분리했다. 묶음 후보의 결과와 합산하면 안 된다.

| 단독 변경 | 현재 점수 | 변경 점수 | 변화 | 변경 후 발동 |
|---|---:|---:|---:|---:|
${Object.values(isolated).map(r => `| ${names[r.id]} 충전 ${base[r.id].ultimate.chargeRequired} → ${r.chargeRequired} | ${pct(baseline.averages[r.id])}% | ${pct(r.averages[r.id])}% | ${delta(r.averages[r.id], baseline.averages[r.id])}%p | ${r.diagnostics[r.id]} |`).join('\n')}

## 해석 시 주의할 점

- 궁극기의 발동 횟수를 늘리는 것과 캐릭터 밸런스를 맞추는 것은 다르다. 레드처럼 이미 점수가 높은 캐릭터는 발동 0회라는 이유만으로 충전을 완화하지 않았다.
- 핑크는 아군 부활 궁극기다. 이 1대1 모델로 충전량·부활 성능 조정을 결정하지 않는다. 현재 메인 설정에 궁극기가 없는 오렌지·퍼플도 이번 조정 대상에서 제외했다.
- 옐로우는 현재 모델의 고정 장치 배치·장치 조준 전략에 영향을 크게 받는다. 충전 완화만으로 회로 배치 문제를 해결했다고 볼 수 없다.
- 블루는 궁극기 돌진 동안 원거리 일반 공격을 멈춘다. 사용 빈도가 낮아져 점수가 오르면 조작 정책의 영향부터 확인해야 하므로, 그 결과를 곧바로 너프 성공으로 해석하지 않는다.
- 애저는 일반 공격을 먼저 맞혀야 충전된다. 궁극기 요구량만 줄여도 첫 명중 전의 불리함은 남는다. 애저의 낮은 결과를 없애기 위해 피해량부터 과도하게 올리는 안은 제외했다.
- 이번 결과에는 팀전, 지형, 실제 플레이어의 조준·전술이 없다. 특히 아이보리 착탄·충전과 투사체 충돌은 기존 단순 모델을 따른다. 실전 밸런스 확정 자료로 사용하지 않는다.

## 재현

\`node tools/compare-ultimate-balance.mjs\`

전체 결과·조합별 승패·발동 횟수·소스 해시: \`ultimate-balance-comparison.json\`.
`;
writeFileSync(new URL('specs/ultimate-balance-comparison.md', root), doc);
console.table(ids.map(id => ({ character: id, current: pct(baseline.averages[id]), A: pct(combined.A.averages[id]), B: pct(combined.B.averages[id]), castsB: combined.B.diagnostics[id] })));
console.log('Total games:', totalGames);
