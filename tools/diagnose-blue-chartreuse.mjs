import { applyBeta6Balance } from '../src/config/beta6-balance.js';
import { beta6Duel } from './simulate-beta6-balance.mjs';

const config = applyBeta6Balance();
const minArg = process.argv.find(arg => arg.startsWith('--blue-min='));
if (minArg) config.blue.attackPerceptionMinRange = Number(minArg.split('=')[1]);
const boundsArg = process.argv.find(arg => arg.startsWith('--bounds='));
const bounds = boundsArg ? Number(boundsArg.split('=')[1]) : 40;
const scenarios = [10, 13, 16].flatMap(distance => [.035, .1].map(aimError => ({ distance, aimError, bounds })));
const rows = [];
for (let s = 0; s < scenarios.length; s++) {
  const row = { ...scenarios[s], wins: 0, losses: 0, draws: 0, blueHpDraw: 0, chartHpDraw: 0, drawDistance: 0, casts: 0, lossKinds: {} };
  for (let n = 0; n < 50; n++) for (const mirror of [1, -1]) {
    const result = mirror === 1
      ? beta6Duel(config, 'blue', 'chartreuse', scenarios[s], 20260919 + s * 10000 + n, 1)
      : beta6Duel(config, 'chartreuse', 'blue', scenarios[s], 20260919 + s * 10000 + n, -1);
    const blueIndex = mirror === 1 ? 0 : 1, chartIndex = 1 - blueIndex, outcome = result.outcome * mirror;
    row.casts += result.casts[blueIndex];
    if (outcome > 0) row.wins++;
    else if (outcome < 0) {
      row.losses++;
      const kind = result.lastDamageKind[blueIndex] ?? 'unknown';
      row.lossKinds[kind] = (row.lossKinds[kind] ?? 0) + 1;
    } else {
      row.draws++;
      row.blueHpDraw += result.hp[blueIndex]; row.chartHpDraw += result.hp[chartIndex]; row.drawDistance += result.distance;
    }
  }
  if (row.draws) {
    row.blueHpDraw = Math.round(row.blueHpDraw / row.draws);
    row.chartHpDraw = Math.round(row.chartHpDraw / row.draws);
    row.drawDistance = +(row.drawDistance / row.draws).toFixed(1);
  }
  row.lossKinds = JSON.stringify(row.lossKinds);
  rows.push(row);
}
console.table(rows);
