import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { tournament } from './simulate-beta6-balance.mjs';
const variants = JSON.parse(process.argv[2]);
for (const [name, p] of Object.entries(variants)) {
  const c = applyBeta7Balance(BETA_CHARACTERS); Object.assign(c.ivory, p);
  const r = tournament(c, 20), m = r.matrix.ivory;
  console.log(name.padEnd(22), 'avg', r.averages.ivory.toFixed(1).padStart(5), '| gold', (m.gold.score*100).toFixed(0), 'chart', (m.chartreuse.score*100).toFixed(0), '| wins>50%:', Object.values(m).filter(v=>v.score>.5).length);
}
