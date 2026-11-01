// Crystal edge cases not covered by the stage/telegraph/windup tests:
// per-stage hit caps on one target, the fixed 28,000 execution through damage-reduction guards,
// and release when either side falls during analysis.
import assert from 'node:assert/strict';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { applyBeta8Balance } from '../src/config/beta8-balance.js';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';

const defs = applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS));
const step = (w, s) => { for (let i = 0; i < Math.ceil(s * 60); i++) w.update(1 / 60); };
const bind = (w, crystal, target) => {
  crystal.charge = crystal.u.chargeRequired;
  assert(w.cast(crystal, target, { angle: Math.atan2(target.z - crystal.z, target.x - crystal.x) }), 'analysis cast');
  for (let i = 0; i < 6 * 60 && crystal.analysisTarget !== target; i++) w.update(1 / 60);
  assert.equal(crystal.analysisTarget, target, 'bound');
};

{
  // Point-blank cascade: each stage hits one target at most once -> 2,000 + 1,000 + 500.
  const hits = [];
  const w = createBeta6Combat(defs, { bounds: 30, aimError: 0, onEvent: e => { if (e.type === 'damage' && e.owner?.id === 'crystal') hits.push(Math.round(e.amount)); } });
  const crystal = w.add('crystal', { automatic: false, team: 'a', x: 0, z: 0, next: 0 });
  const target = w.add('red', { automatic: false, team: 'b', x: 3, z: 0, hp: 1e6 });
  target.d = { ...target.d, maxHealth: 1e6 };
  assert(w.fire(crystal, target, 0));
  step(w, 2);
  const total = hits.reduce((s, v) => s + v, 0);
  assert(hits.length <= 3, `at most one hit per stage, got ${hits.join(',')}`);
  assert(total <= 3500, `cascade cap 3,500, got ${total}`);
}
for (const [id, guard] of [['red', 'Red guard'], ['blue', 'Blue roll shield']]) {
  // The 28,000 execution ignores damage-reduction guards and kills any regular character.
  const w = createBeta6Combat(defs, { bounds: 30 });
  const crystal = w.add('crystal', { automatic: false, team: 'a', x: 0, z: 0, next: 0 });
  const target = w.add(id, { automatic: false, team: 'b', x: 6, z: 0 });
  bind(w, crystal, target);
  if (id === 'red') { target.guardUntil = w.time + 60; assert(w.damageReductionFor(target) > 0, `${guard} active`); }
  // A bound Blue is action-locked, so its roll shield cannot be up while analysed.
  else { target.ultimatePreparing = true; assert.equal(w.damageReductionFor(target), 0, `${guard} is off while bound`); }
  step(w, crystal.u.analysisDuration + .2);
  assert.equal(target.hp, 0, `${guard} does not stop the execution`);
}
{
  // A target with more than 28,000 health survives and is released.
  const w = createBeta6Combat(defs, { bounds: 30 });
  const crystal = w.add('crystal', { automatic: false, team: 'a', x: 0, z: 0, next: 0 });
  const boss = w.add('red', { automatic: false, team: 'b', x: 6, z: 0, hp: 50000 });
  boss.d = { ...boss.d, maxHealth: 50000 };
  bind(w, crystal, boss);
  step(w, crystal.u.analysisDuration + .2);
  assert.equal(Math.round(boss.hp), 22000, 'fixed 28,000');
  assert.equal(boss.analysisOwner, null, 'released after execution');
}
{
  // Target falls to someone else during analysis: Crystal is freed immediately.
  const w = createBeta6Combat(defs, { bounds: 30 });
  const crystal = w.add('crystal', { automatic: false, team: 'a', x: 0, z: 0, next: 0 });
  const ally = w.add('red', { automatic: false, team: 'a', x: -5, z: 0 });
  const target = w.add('red', { automatic: false, team: 'b', x: 6, z: 0 });
  bind(w, crystal, target);
  w.hit(ally, target, 1e6);
  step(w, .1);
  assert.equal(crystal.analysisTarget, null, 'Crystal released');
  assert(crystal.lockUntil <= w.time, 'Crystal can act');
}
{
  // Crystal falls during analysis: the bound target is freed and takes no execution.
  const w = createBeta6Combat(defs, { bounds: 30 });
  const crystal = w.add('crystal', { automatic: false, team: 'a', x: 0, z: 0, next: 0 });
  const target = w.add('red', { automatic: false, team: 'b', x: 6, z: 0 });
  const other = w.add('red', { automatic: false, team: 'b', x: -6, z: 0 });
  bind(w, crystal, target);
  w.hit(other, crystal, 1e6);
  step(w, crystal.u.analysisDuration + .5);
  assert.equal(target.analysisOwner, null, 'target released');
  assert(target.hp > 0, 'no execution after Crystal falls');
  assert(target.lockUntil <= w.time, 'target can act');
}
console.log('PASS Crystal: one hit per stage (cap 3,500), execution through Red guard (Blue shield off while bound), 28,000 fixed with survivor release, release when either side falls.');
