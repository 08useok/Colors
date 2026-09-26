import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { tournament } from './simulate-beta6-balance.mjs';
const variants = JSON.parse(process.argv[2]);
for (const [name, p] of Object.entries(variants)) {
  const c = applyBeta7Balance(BETA_CHARACTERS); const { ultimate, ...st } = p;
  Object.assign(c.crystal, st); if (ultimate) Object.assign(c.crystal.ultimate, ultimate);
  const r = tournament(c, 50), m = r.matrix.crystal;
  const s = Object.entries(m).map(([b, v]) => `${b}:${(v.score*100).toFixed(0)}`).join(' ');
  console.log(name.padEnd(16), 'avg', r.averages.crystal.toFixed(1), '|', s);
}
