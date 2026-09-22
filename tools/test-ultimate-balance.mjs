import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url);
const report = JSON.parse(readFileSync(new URL('specs/ultimate-balance-comparison.json', root), 'utf8'));
assert.equal(report.comparisonOnly, true);
assert.equal(report.roster.length, 14);
assert.equal(report.initialCharge, 0);
for (const [path, hash] of Object.entries(report.hashes)) {
  assert.equal(createHash('sha256').update(readFileSync(new URL(path, root), 'utf8').replace(/\r\n/g, '\n')).digest('hex'), hash, path);
}
let games = 0;
for (const result of [report.baseline, ...Object.values(report.isolated), ...Object.values(report.combined)]) {
  games += result.games;
  for (const patch of Object.values(result.patches)) assert.deepEqual(Object.keys(patch), ['chargeRequired']);
  let count = 0;
  for (const [a, row] of Object.entries(result.matrix)) for (const [b, match] of Object.entries(row)) {
    assert.equal(match.wins + match.losses + match.draws, 600);
    assert(Math.abs(match.score - (match.wins + match.draws / 2) / 600) < 1e-10);
    assert(Math.abs(match.score + result.matrix[b][a].score - 1) < 1e-10);
    if (!result.patches[a] && !result.patches[b]) assert.deepEqual(match, report.baseline.matrix[a][b]);
    count += 600;
  }
  assert.equal(count / 2, result.games);
  for (const [id, average] of Object.entries(result.averages)) {
    assert(Math.abs(average - Object.values(result.matrix[id]).reduce((sum, m) => sum + m.score, 0) / 13 * 100) < 1e-10);
  }
}
assert.equal(games, report.totalGames);
assert.equal(games, 234000);
for (const id of Object.keys(report.combined.B.patches)) assert(report.combined.B.diagnostics[id] > 0);
assert(report.combined.B.diagnostics._events.azureUltimateHit > 0);
console.log('PASS: hashes, unchanged pair results, ultimate-only patches, 234,000 game totals, averages, natural ultimate casts.');
