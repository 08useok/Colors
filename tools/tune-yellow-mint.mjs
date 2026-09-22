import { applyBeta6Balance } from '../src/config/beta6-balance.js';
import { beta6Duel } from './simulate-beta6-balance.mjs';
const scenarios = [10, 13, 16].flatMap(distance => [.035, .1].map(aimError => ({ distance, aimError })));
function wins(config, left, right) { let total = 0; for (let s = 0; s < scenarios.length; s++) for (let n = 0; n < 50; n++) for (const mirror of [1, -1]) { const r = mirror === 1 ? beta6Duel(config, left, right, scenarios[s], 20260919 + s * 10000 + n, 1) : beta6Duel(config, right, left, scenarios[s], 20260919 + s * 10000 + n, -1); if (r.outcome * mirror > 0) total++; } return total; }
const rows = [];
for (const cooldown of [.3, .35, .4, .45]) for (const reload of [.5, .6, .7, .8, .9]) { const c = applyBeta6Balance(); Object.assign(c.yellow, { attackCooldown: cooldown, reloadDuration: reload }); rows.push({ cooldown, reload, yellowVsMint: wins(c, 'yellow', 'mint'), crimsonVsYellow: wins(c, 'crimson', 'yellow') }); }
console.table(rows);
