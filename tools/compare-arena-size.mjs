import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { tournament } from './simulate-beta6-balance.mjs';
const c = applyBeta7Balance(BETA_CHARACTERS), reps = Number(process.argv[2] ?? 20);
const walls = process.argv.includes('--walls');
const limitArg = process.argv.find(a => a.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.split('=')[1]) : 45;
const noZone = process.argv.includes('--no-zone');
const sizes = { '80': 40, '1000': 500, '2000': 1000 };
const res = {}; for (const [k, b] of Object.entries(sizes)) { res[k] = tournament(c, reps, b, noZone, walls, limit); console.error('done', k); }
const ids = Object.keys(c).sort((a, b) => res['80'].averages[b] - res['80'].averages[a]);
console.table(ids.map(id => ({ id, '80x80': res['80'].averages[id].toFixed(1), '1000': res['1000'].averages[id].toFixed(1), '2000': res['2000'].averages[id].toFixed(1) })));
