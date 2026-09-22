// Assign design targets, never rewrite measured simulation scores.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url);
const source = readFileSync(new URL('specs/ultimate-damage-comparison.json', root), 'utf8');
const report = JSON.parse(source), ids = report.roster, matrix = report.results.focused20.matrix;
const names = { red: '레드', green: '그린', blue: '블루', orange: '오렌지', yellow: '옐로우', cyan: '시안', purple: '퍼플', pink: '핑크', crimson: '크림슨', gold: '골드', ivory: '아이보리', chartreuse: '샤르트뢰즈', mint: '민트', azure: '애저' };
const n = ids.length, full = (1 << n) - 1;
assert.equal(n, 14);
// Integer half-win units avoid floating-point tie-breaking differences.
const weights = ids.map(a => ids.map(b => a === b ? -1 : matrix[a][b].wins * 2 + matrix[a][b].draws));
function solve(minimum, reconstruct = false) {
  const dp = new Int32Array((full + 1) * n).fill(-1);
  const previous = reconstruct ? new Int8Array(dp.length).fill(-1) : null;
  dp[n] = 0;
  for (let mask = 1; mask <= full; mask += 2) for (let end = 0; end < n; end++) {
    const value = dp[mask * n + end];
    if (value < 0) continue;
    for (let next = 1; next < n; next++) {
      if ((mask & (1 << next)) || weights[end][next] < minimum) continue;
      const index = (mask | (1 << next)) * n + next, candidate = value + weights[end][next];
      if (candidate > dp[index]) { dp[index] = candidate; if (previous) previous[index] = end; }
    }
  }
  let best = -1, end = -1;
  for (let i = 1; i < n; i++) if (weights[i][0] >= minimum && dp[full * n + i] >= 0) {
    const value = dp[full * n + i] + weights[i][0];
    if (value > best) { best = value; end = i; }
  }
  if (best < 0 || !reconstruct) return best;
  const route = [], total = best;
  let mask = full;
  while (end !== 0) { route.push(end); const last = previous[mask * n + end]; mask ^= 1 << end; end = last; }
  route.push(0); route.reverse();
  return { route, total };
}
// Prefer a cycle whose weakest existing matchup is as strong as possible,
// then maximize total existing score under that constraint.
const thresholds = [...new Set(weights.flat().filter(x => x >= 0))].sort((a, b) => a - b);
let low = 0, high = thresholds.length - 1;
while (low < high) { const middle = Math.ceil((low + high) / 2); if (solve(thresholds[middle]) >= 0) low = middle; else high = middle - 1; }
const { route } = solve(thresholds[low], true);
const winners = {}, losers = {};
for (let i = 0; i < n; i++) { const a = ids[route[i]], b = ids[route[(i + 1) % n]]; winners[a] = b; losers[b] = a; }
const targets = Object.fromEntries(ids.map(a => [a, Object.fromEntries(ids.map(b => [b, a === b ? 'self' : winners[a] === b ? 1 : losers[a] === b ? 0 : 'interior']))]));
for (const a of ids) {
  assert.equal(Object.values(targets[a]).filter(v => v === 1).length, 1);
  assert.equal(Object.values(targets[a]).filter(v => v === 0).length, 1);
  assert.equal(Object.values(targets[a]).filter(v => v === 'interior').length, 11);
  for (const b of ids) if (typeof targets[a][b] === 'number') assert.equal(targets[a][b] + targets[b][a], 1);
}
assert.equal(new Set(route).size, n);
const selected = ids.map(id => ({ id, targetWin: winners[id], targetLoss: losers[id], currentScoreVsTargetWin: matrix[id][winners[id]].score }));
const nonTargetExtremes = [];
for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
  const a = ids[i], b = ids[j], score = matrix[a][b].score;
  if (targets[a][b] === 'interior' && (score === 0 || score === 1)) nonTargetExtremes.push({ a, b, score });
}
const output = { kind: 'design-targets-not-simulation-results', comparisonOnly: true,
  source: 'ultimate-damage-comparison.json', variant: 'focused20', sourceHash: createHash('sha256').update(source).digest('hex'),
  method: 'single-cycle; maximize minimum existing score, then sum of scores', weakestExistingScore: thresholds[low] / 1200,
  roster: ids, cycle: route.map(i => ids[i]), selected, targets, nonTargetExtremes };
const table = '| 카운터 / 카운팅 | ' + ids.map(i => names[i]).join(' | ') + ' |\n|---|' + ids.map(() => '---:|').join('') + '\n'
  + ids.map(a => '| **' + names[a] + '** | ' + ids.map(b => targets[a][b] === 'self' ? 'X' : targets[a][b] === 'interior' ? '—' : `${targets[a][b] * 100}%`).join(' | ') + ' |').join('\n');
const doc = `# 14종 카운터 목표 상성

**목표 지정안이며 시뮬레이션 측정값이 아니다. 게임에는 미적용.**

## 규칙

- 각 캐릭터에 반드시 이길 목표 상대 1명(100%)과 반드시 질 목표 상대 1명(0%)을 지정한다.
- A → B는 A의 목표 100%, B의 목표 0%를 동시에 뜻한다. 자기 자신은 X다.
- 나머지 11종은 목표 범위를 0% 초과·100% 미만으로 둔다. 구체적인 승률은 아직 정하지 않는다.
- 단일 순환으로 연결해 모든 캐릭터가 한 번씩 이기고 지는 상대가 되게 한다. 가능한 여러 순환 중 가장 약한 연결의 기존 점수를 최대화한 뒤 총 점수를 최대화했다.
- 현재 비교안(B + 블루 제외 궁극기 피해 20%)의 계산 결과를 근거로 사용한다. 순환의 모든 선택은 기존 결과와 같은 승리 방향이며, 가장 낮은 기존 점수는 ${(output.weakestExistingScore * 100).toFixed(1)}%다.

## 목표표

행 캐릭터 기준이다. **—는 0% 초과·100% 미만의 미정 목표 범위**이며 50%나 무승부를 의미하지 않는다.

${table}

## 선택 근거

| 캐릭터 | 100% 목표 상대 | 해당 상대에 대한 현재 점수 | 0% 목표 상대 |
|---|---|---:|---|
${selected.map(r => `| ${names[r.id]} | ${names[r.targetWin]} | ${(r.currentScoreVsTargetWin * 100).toFixed(1)}% | ${names[r.targetLoss]} |`).join('\n')}

순환: ${route.map(i => names[ids[i]]).concat(names[ids[route[0]]]).join(' → ')}.

## 아직 달성하지 않은 부분

- 이 문서는 상대를 정한 것이다. 현재 계산 결과의 0%·100%를 덮어쓰거나 임의로 중간 값으로 바꾸지 않았다.
- 목표 이외의 ${nonTargetExtremes.length}개 조합이 현재 모델에서는 정확히 0%/100%다. 이 조합들을 실제 밸런스 조정으로 완화해야 목표를 충족한다.
- 목표 상대도 현재 전승인 것은 아니다. 실제 수치·행동을 조정한 후 전체 조합을 다시 계산해야 한다.
- 유한한 시뮬레이션의 전승·전패는 실전의 필승·필패를 보장하지 않는다. 목표 달성 검증은 고정된 실험 조건에서 정의해야 한다.
- 이번 작업은 목표 지정·일관성 검증까지이며 기존의 비교 전용 범위를 유지한다. 게임 적용·커밋·푸시는 하지 않는다.

검증: 행마다 100%·0% 각 1명, 나머지 11명, 자기 대전 X, 반대 칸 합계 100%, 모든 캐릭터가 순환에 한 번씩 등장함을 자동 검사했다.

재현: \`node tools/plan-counter-cycle.mjs\`. 원자료: [목표 데이터](counter-targets.json).
`;
writeFileSync(new URL('specs/counter-targets.json', root), JSON.stringify(output, null, 2) + '\n');
writeFileSync(new URL('specs/counter-targets.md', root), doc);
console.log(table);
console.log(JSON.stringify({ selected, weakest: output.weakestExistingScore, nonTargetExtremes: nonTargetExtremes.length }, null, 2));
