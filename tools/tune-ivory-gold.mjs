import { applyBeta6Balance } from '../src/config/beta6-balance.js';
import { beta6Duel } from './simulate-beta6-balance.mjs';
const scenarios = [10, 13, 16].flatMap(distance => [.035, .1].map(aimError => ({ distance, aimError })));
function wins(config, left, right) {
  let total = 0;
  for (let s = 0; s < scenarios.length; s++) for (let n = 0; n < 50; n++) for (const mirror of [1, -1]) {
    const r = mirror === 1 ? beta6Duel(config, left, right, scenarios[s], 20260919 + s * 10000 + n, 1) : beta6Duel(config, right, left, scenarios[s], 20260919 + s * 10000 + n, -1);
    if (r.outcome * mirror > 0) total++;
  }
  return total;
}
const rows = [];
for (const health of [7550, 7600, 7650, 7700, 7750, 7800, 7850, 7900, 7950]) for (const damage of [900]) for (const armor of [650]) for (const cooldown of [1.5]) {
  const c = applyBeta6Balance();
  Object.assign(c.gold, { maxHealth: health, stage1Damage: damage, stage2Damage: damage / 2, stage3Damage: damage / 4, projectileDamageReduction: armor, attackCooldown: cooldown });
  rows.push({ health, damage, armor, cooldown, ivoryVsGold: wins(c, 'ivory', 'gold'), chartVsIvory: wins(c, 'chartreuse', 'ivory'), goldVsCyan: wins(c, 'gold', 'cyan') });
}
console.table(rows);
