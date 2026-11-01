// Measures Ivory's X-pattern ultimate on targets at fixed offsets from the aimed centre.
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { applyBeta8Balance } from '../src/config/beta8-balance.js';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';
const defs = applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS));
const rows = [];
for (const [label, ox, oz] of [['centre', 0, 0], ['on diagonal 3.5', 2.475, 2.475], ['axis 3.5', 3.5, 0], ['axis 6', 6, 0], ['axis 8', 8, 0], ['axis 9', 9, 0]]) {
  const impacts = [];
  const w = createBeta6Combat(defs, { bounds: 40, onEvent: e => { if (e.type === 'damage' && e.target.id === 'red') impacts.push({ t: +w.time.toFixed(2), amount: Math.round(e.amount) }); } });
  const ivory = w.add('ivory', { automatic: false, team: 'a', x: -10, z: 0, next: 0 });
  const t = w.add('red', { automatic: false, team: 'b', x: ox, z: oz, hp: 1e6 }); t.d = { ...t.d, maxHealth: 1e6 };
  ivory.charge = ivory.u.chargeRequired;
  w.cast(ivory, t, { angle: Math.atan2(0 - ivory.z, 0 - ivory.x), point: { x: 0, z: 0 } });
  for (let i = 0; i < 60 * 5; i++) w.update(1 / 60);
  const firstSecond = impacts.filter(i => i.t <= impacts[0]?.t + .05);
  rows.push({ log: impacts, label, impactHits: firstSecond.length, impactDamage: firstSecond.reduce((s, i) => s + i.amount, 0), totalIn5s: impacts.reduce((s, i) => s + i.amount, 0), events: impacts.length });
}
console.table(rows.map(({events,...r})=>r));
for (const r of rows) console.log(r.label.padEnd(18), r.log.map(i=>i.t+":"+i.amount).join(" "));
