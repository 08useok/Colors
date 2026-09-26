import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance, BETA7_BALANCE } from '../src/config/beta7-balance.js';
import { applyBeta6Balance } from '../src/config/beta6-balance.js';
import { tournament } from './simulate-beta6-balance.mjs';
const variants = JSON.parse(process.argv[2]);
const pairs = [['red','blue'],['blue','red'],['cyan','green'],['green','cyan'],['green','azure'],['orange','red'],['purple','orange']];
for (const [name, patch] of Object.entries(variants)) {
  const c = applyBeta7Balance(BETA_CHARACTERS);
  for (const [id, p] of Object.entries(patch)) Object.assign(c[id], p);
  const r = tournament(c, 10);
  console.log(name.padEnd(28), pairs.map(([a,b]) => `${a}>${b}:${(r.matrix[a][b].score*100).toFixed(0)}`).join(' '));
}
