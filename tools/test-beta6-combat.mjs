import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta6Balance, beta6Ultimate } from '../src/config/beta6-balance.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';
import { beta6Duel, atCharacterLevel } from './simulate-beta6-balance.mjs';
const original = structuredClone(BETA_CHARACTERS), config = applyBeta6Balance();
assert.deepEqual(BETA_CHARACTERS, original);
assert.equal(Object.keys(config).length, 16);
assert.equal(beta6Ultimate(config.azure, 'azure').chargeRequired, 2);
assert.equal(beta6Ultimate(config.gold, 'gold').chargeRequired, 6);
assert.equal(config.blue.bulletRange, 17.5);
assert.equal(config.blue.bulletSpeed, 68.75);
assert.equal(config.blue.attackPerceptionMinRange, 10);
assert.equal(config.blue.attackPerceptionRange, 16);
assert.equal(config.blue.ultimateUseHealthMin, 0.1);
assert.equal(config.blue.ultimateUseHealthMax, 0.25);
assert.equal(config.chartreuse.chartreuseRange, 9.5);
assert.equal(config.chartreuse.projectileSize, 0.3);
assert.equal(beta6Ultimate(config.crimson, 'crimson').damage, 5400);
assert.equal(beta6Ultimate(config.orange, 'orange'), null);
assert.equal(beta6Ultimate(config.purple, 'purple'), null);
const run = (world, seconds) => { for (let i = 0; i < seconds * 60; i++) world.update(1 / 60); };

{
  const beta7 = applyBeta7Balance(BETA_CHARACTERS);
  assert.equal(beta6Ultimate(beta7.orange, 'orange').name, '오렌지 껍질 회수');
  assert.equal(beta6Ultimate(beta7.purple, 'purple').name, '독성 대도약');
  const world = createBeta6Combat(beta7, { aimError: 0, bounds: 40 });
  const orange = world.add('orange', { x: 0, automatic: false, charge: 100 });
  const target = world.add('red', { x: 8, automatic: false, hp: 100000 });
  assert(world.cast(orange, target, { angle: 0 }));
  assert.equal(world.projectiles.filter(projectile => projectile.kind === 'orangePeel').length, 5);
  run(world, 0.7);
  assert(orange.charge > 0, 'Orange ultimate hits charge the next ultimate');
  assert(world.projectiles.every(projectile => projectile.pausedUntil > world.time), 'Orange peels pause at maximum range');
  run(world, 2.05);
  assert(world.projectiles.every(projectile => projectile.returning), 'Orange peels return after the two-second pause');

  const chargeWorld = createBeta6Combat(beta7, { aimError: 0, bounds: 40 });
  const chargingOrange = chargeWorld.add('orange', { x: 0, automatic: false, next: 0 });
  const chargeTarget = chargeWorld.add('red', { x: 4, automatic: false, hp: 100000 });
  assert(chargeWorld.fire(chargingOrange, chargeTarget, 0));
  run(chargeWorld, 0.4);
  assert.equal(chargingOrange.charge, 1, 'Orange charges once per direct fruit hit');

  const beta8 = applyBeta6Balance(BETA_CHARACTERS);
  beta8.orange.orangeUltimateEnabled = true;
  beta8.purple.purpleUltimateEnabled = true;
  assert.equal(beta6Ultimate(beta8.orange, 'orange').name, '오렌지 껍질 회수');
  assert.equal(beta6Ultimate(beta8.purple, 'purple').name, '독성 대도약');
}
for (const id of Object.keys(config)) {
  const world = createBeta6Combat(config, { seed: 9, aimError: 0 });
  const a = world.add(id, { x: 0, automatic: false, next: 0 }), b = world.add('red', { x: 2, hp: 100000, automatic: false, next: 0 });
  assert(world.fire(a, b, 0), `${id} basic`); assert.equal(a.attackCount, 1); assert.equal(a.ammo, 2);
  run(world, 1.6);
  assert(b.hp < 100000, `${id} basic must deal damage`);
  assert.equal(b.attackCount, 0, 'manual actors must not auto-fire');
}
for (const id of ['red', 'green', 'blue', 'cyan', 'crimson', 'gold', 'ivory', 'chartreuse', 'mint', 'azure', 'yellow']) {
  const world = createBeta6Combat(config, { seed: 7 });
  const a = world.add(id, { charge: 100, automatic: false, next: 0, ammo: 0 }), b = world.add('pink', { x: 3, hp: 100000, automatic: false, next: 0 });
  assert(world.cast(a, b), `${id} ultimate cast`); assert.equal(a.castCount, 1);
  assert.equal(a.charge, id === 'crimson' ? 1 : 0, `${id} post-cast charge`);
  run(world, 2);
  if (['blue', 'cyan', 'crimson', 'ivory', 'mint', 'azure'].includes(id)) assert(b.hp < 100000, `${id} ultimate damage`);
  if (id === 'red') { const before = a.hp; world.hit(b, a, 1000); assert.equal(before - a.hp, 400); }
  if (id === 'green') { assert(world.hidden(a)); world.hit(b, a, 1); assert(!world.hidden(a)); }
  if (id === 'gold') assert(b.lockUntil >= world.time);
  if (id === 'azure') assert.equal(a.x, 0, 'Azure ultimate must not move its owner');
  if (id === 'yellow') assert.equal(a.devices.length, 1);
}

{
  const world = createBeta6Combat(config, { aimError: 0, bounds: 40 });
  const crystal = world.add('crystal', { x: 0, automatic: false, next: 0, charge: 100 });
  const target = world.add('red', { x: 6, automatic: false, hp: 20000 });
  assert(world.fire(crystal, target, 0));
  run(world, 1.5);
  assert(target.hp <= 16500, 'Crystal cascade deals no more than one hit per split stage to a target');
  crystal.charge = 100;
  assert(world.cast(crystal, target));
  assert(crystal.lockUntil === target.lockUntil && crystal.lockUntil > world.time, 'Crystal Analysis locks both actors');
  run(world, 8.1);
  assert.equal(target.hp, 0, 'Crystal Analysis executes its marked target after 8 seconds');
}
{
  const leapEvents = [];
  const world = createBeta6Combat(applyBeta7Balance(BETA_CHARACTERS), {
    bounds: 40, blocked: x => x > .2 && x < 8.8, onEvent: event => leapEvents.push(event),
  });
  const purple = world.add('purple', { automatic: false, charge: 100 });
  const takeoffVictim = world.add('red', { x: 1, hp: 12000, automatic: false });
  const landingVictim = world.add('blue', { x: 9, hp: 12000, automatic: false });
  assert(world.cast(purple, landingVictim, { angle: 0, point: { x: 9, z: 0 } }), 'Purple Toxic Leap casts');
  assert.equal(takeoffVictim.hp, 7000, 'Purple deals 5,000 damage at takeoff');
  assert.equal(purple.charge, 1, 'Purple takeoff hits charge the next ultimate');
  assert.equal(landingVictim.hp, 12000, 'Purple landing damage is delayed until landing');
  assert.equal(purple.leap.to.x, 9, 'Purple leap crosses blocking walls');
  run(world, .4);
  assert(Math.abs(purple.x - 4.5) < .1 && purple.leap, 'Purple is halfway through the 0.8-second leap');
  assert.equal(world.fire(purple, landingVictim), false, 'Purple cannot attack during the leap');
  run(world, .45);
  assert.equal(purple.x, 9, 'Purple reaches the landing point');
  assert.equal(landingVictim.hp, 7000, 'Purple deals 5,000 damage on landing');
  assert.equal(purple.charge, 2, 'Purple landing hits charge the next ultimate');
  assert.equal(purple.leap, null, 'Purple regains control on landing');
  assert.deepEqual(leapEvents.filter(event => event.type === 'purpleLeap').map(event => event.phase), ['takeoff', 'landing']);
}
{
  const world = createBeta6Combat(applyBeta7Balance(BETA_CHARACTERS), { seed: 3, aimError: 0 });
  const purple = world.add('purple', { charge: 100, ammo: 0, next: 99 });
  const target = world.add('red', { x: 3, hp: 12000, automatic: false, next: 99 });
  world.update(1 / 60);
  assert.equal(purple.castCount, 1, 'Purple bot uses its ultimate when charged');
  assert(purple.leap, 'Purple bot starts the leap');
  assert.equal(target.hp, 7000, 'Purple bot takeoff damages nearby enemies');
}

{
  const world = createBeta6Combat(config, { aimError: 0 });
  const blue = world.add('blue', { charge: 100, hp: config.blue.maxHealth * .2, automatic: true });
  const target = world.add('chartreuse', { x: 4, automatic: false });
  assert(world.cast(blue, target));
  assert(Math.cos(blue.dash.yaw) < 0, 'automatic Blue dash points away from its target');
  assert(blue.invulnerableUntil > world.time, 'Blue is invulnerable while escaping');
  assert.equal(world.hit(target, blue, 9999), 0, 'Blue avoids damage during its dash');

  const healthyWorld = createBeta6Combat(config);
  const healthyBlue = healthyWorld.add('blue', { charge: 100, hp: config.blue.maxHealth * .3, automatic: true });
  assert.equal(healthyWorld.cast(healthyBlue, healthyWorld.add('chartreuse', { x: 4, automatic: false })), false, 'Blue waits above 25% health');
}

{
  const world = createBeta6Combat(config);
  const blue = world.add('blue', { automatic: false, next: 0 });
  const target = world.add('red', { x: 8, automatic: false });
  assert(world.fire(blue, target, 0));
  assert.equal(world.projectiles[0].radius, .2, 'ordinary bullets use a 0.4-tile diameter');

  const chartreuse = world.add('chartreuse', { z: 4, automatic: false, next: 0 });
  assert(world.fire(chartreuse, target, 0));
  assert.equal(world.projectiles.at(-1).radius, .15, 'Chartreuse uses a 0.3-tile diameter');
}

{
  const scaled = atCharacterLevel(config);
  assert.equal(scaled.lavender.maxHealth, 6600);
  assert.equal(scaled.lavender.sprayDamage, 770);
  assert.equal(scaled.lavender.special.damagePerSecond, 220);
  assert.equal(scaled.orange.maxHealth, Math.round(config.orange.maxHealth * 1.1));
  assert.equal(scaled.orange.bombSplashDamage, Math.round(config.orange.bombSplashDamage * 1.1));
  assert.equal(scaled.orange.ultimate.damage, Math.round(config.orange.ultimate.damage * 1.1));
  assert.equal(scaled.purple.poisonDPS, Math.round(config.purple.poisonDPS * 1.1));
  assert.equal(scaled.mint.special.damagePerSecond, Math.round(config.mint.special.damagePerSecond * 1.1));
  assert.equal(scaled.orange.attackCooldown, config.orange.attackCooldown);
  assert.equal(scaled.orange.ultimate.chargeRequired, config.orange.ultimate.chargeRequired);
  assert.equal(config.orange.maxHealth, 4400, 'level scaling does not mutate base stats');
  const world = createBeta6Combat(applyBeta7Balance(BETA_CHARACTERS));
  const orange = world.add('orange', { automatic: false, charge: 8 });
  const target = world.add('red', { x: 8, automatic: false });
  assert(world.cast(orange, target));
  assert(world.projectiles.every(p => p.radius === config.orange.ultimate.hitRadius), 'peels preserve their authored radius');
}

{
  const world = createBeta6Combat(config, { bounds: 40 });
  const blue = world.add('blue', { automatic: false, next: 0 });
  const target = world.add('red', { x: 8, z: 2, automatic: false });
  const before = target.hp;
  assert(world.fire(blue, target, 0));
  run(world, .3);
  assert.equal(target.hp, before, 'a bullet misses a target two tiles beside its path');
  const azure = world.add('azure', { z: -10, automatic: false, next: 0 });
  assert(world.fire(azure, target, 0));
  assert.equal(world.projectiles.at(-1).width, config.azure.surfWidth, 'surf keeps its authored width');
}

{
  const world = createBeta6Combat(config, { bounds: 40, suddenDeath: { start: 0, end: 1, startRadius: 10, endRadius: 5, damagePerSecond: .25 } });
  const actor = world.add('red', { x: 20, automatic: false });
  const before = actor.hp;
  world.update(.25);
  assert(actor.hp < before, 'the shrinking duel zone damages actors outside it');
}

{
  const world = createBeta6Combat(config);
  const azure = world.add('azure', { charge: 100, automatic: false, next: 0 });
  const target = world.add('red', { x: 3, automatic: false, next: 0 });
  assert(world.cast(azure, target));
  run(world, 1);
  assert.equal(azure.charge, 1, 'an ultimate hit charges the next ultimate');
}

{
  const world = createBeta6Combat(config);
  const red = world.add('red', { automatic: false });
  const attacker = world.add('blue', { automatic: false });
  world.hit(attacker, red, 100);
  assert.equal(red.charge, config.red.ultimateChargeOnHit, 'Red charges its ultimate when hit');
}

{
  const world = createBeta6Combat(config, { aimError: 0 });
  const target = world.add('yellow', { x: 8, automatic: false });
  const red = world.add('red', { hp: config.red.maxHealth * .4, ammo: 0, next: 99 });
  const redBefore = Math.hypot(red.x - target.x, red.z - target.z);
  world.update(.25);
  assert(Math.hypot(red.x - target.x, red.z - target.z) < redBefore, 'Red keeps pursuing below half health');

  const retreatWorld = createBeta6Combat(config, { aimError: 0 });
  const retreatTarget = retreatWorld.add('yellow', { x: 8, automatic: false });
  const blue = retreatWorld.add('blue', { hp: config.blue.maxHealth * .4, ammo: 0, next: 99 });
  const blueBefore = Math.hypot(blue.x - retreatTarget.x, blue.z - retreatTarget.z);
  retreatWorld.update(.25);
  assert(Math.hypot(blue.x - retreatTarget.x, blue.z - retreatTarget.z) > blueBefore, 'other bots retreat below half health');
}
{
  const world = createBeta6Combat(config);
  const pink = world.add('pink', { team: 'a', charge: 100, automatic: false, next: 0 });
  const ally = world.add('blue', { team: 'a', x: 2, hp: 0, automatic: false, next: 0 });
  const enemy = world.add('red', { team: 'b', x: 3, automatic: false, next: 0 });
  assert(world.cast(pink, enemy)); assert.equal(ally.hp, config.blue.maxHealth * .4); assert(ally.invulnerableUntil > world.time);
  assert.equal(world.hit(pink, ally, 1000), 0, 'friendly fire');
  const solo = createBeta6Combat(config), p = solo.add('pink', { charge: 100 });
  assert.equal(solo.cast(p, solo.add('red', { x: 2 })), false, 'no self-revival');
}
{
  const world = createBeta6Combat(config, { aimError: 0 });
  const mint = world.add('mint', { automatic: false, next: 0 }), victim = world.add('red', { x: 2, automatic: false, next: 0, hp: 100000 });
  world.fire(mint, victim, 0); run(world, 1);
  world.fire(mint, victim, 0); run(world, .3);
  assert(victim.frozenUntil > world.time); assert.equal(world.fire(victim, mint), false);
}
{
  const world = createBeta6Combat(config, { blocked: x => x > 1 && x < 1.8 });
  const a = world.add('blue', { automatic: false, next: 0 }), b = world.add('red', { x: 3, automatic: false, next: 0 });
  const hp = b.hp; world.fire(a, b, 0); run(world, 1); assert.equal(b.hp, hp, 'wall blocks bullet');
}
{
  const world = createBeta6Combat(config), a = world.add('mint', { charge: 100, automatic: false, next: 0 }), b = world.add('red', { x: 3, automatic: false, next: 0 });
  world.fire(a, b); world.cast(a, b); world.remove(a); const hp = b.hp; run(world, 2);
  assert.equal(b.hp, hp, 'removed owner leaves no queued attack');
  world.clear(); assert.equal(world.actors.length + world.projectiles.length + world.zones.length, 0);
}
assert.deepEqual(beta6Duel(config, 'mint', 'azure', { distance: 10, aimError: .1 }, 27), beta6Duel(config, 'mint', 'azure', { distance: 10, aimError: .1 }, 27));
const runtime = readFileSync(new URL('../src/beta-season.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
assert(runtime.includes('const HAS_BETA6_CONTENT = ["beta6", "beta7", "beta8"].includes(BETA_SEASON_ID);'));
assert(runtime.includes('BETA_CHARACTERS.purple.purpleUltimateEnabled = true;'));
assert(runtime.includes('document.title = "Colors - Beta Season 8 Preview";'));
assert(runtime.includes('if (betaState.selectedCharacter === "orange" && (IS_BETA7_TEST || IS_BETA8_TEST))'));
assert(runtime.includes('HAS_BETA6_CONTENT ? applyBeta6Balance(BASE_BETA_CHARACTERS)'));
assert(runtime.includes('if (goldRushState.mode === "soccer") { updateSoccerBots(dt); return; }\n  if (beta6Combat) { updateBeta6BotCombat(dt); return; }'));
assert(runtime.includes('if (beta6Combat !== world) return;'));
// A lethal player hit can end the match and clear all actors during event delivery.
// Exercise the bridge without a browser and verify it stops before using disposed state.
{
  const extract = name => {
    const start = runtime.indexOf(`function ${name}(`);
    assert(start >= 0);
    return runtime.slice(start, runtime.indexOf('\n}', start) + 2);
  };
  const hero = { hp: 100, x: 0, z: 0 };
  const context = vm.createContext({ Math, THREE: {}, IS_BETA6_TEST: true,
    beta6PlayerActor: hero, beta6PendingEvents: [], goldRushBots: [],
    goldRushState: { health: 100, dead: false }, clock: { elapsedTime: 10 },
    player: { position: { x: 0, z: 0 } }, damageCalls: 0 });
  context.beta6Combat = { time: 0, update() { context.beta6PendingEvents.push({ type: 'damage', target: hero, amount: 100 }); } };
  context.damageGoldRushPlayer = () => { context.damageCalls++; context.beta6Combat = null; context.beta6PlayerActor = null; };
  vm.runInContext(extract('processBeta6CombatEvent') + '\n' + extract('updateBeta6BotCombat') + '\nupdateBeta6BotCombat(1 / 60);', context);
  assert.equal(context.damageCalls, 1); assert.equal(context.beta6Combat, null);
}
{
  const world = createBeta6Combat(config), green = world.add('green', { automatic: false, charge: 100 });
  assert(world.cast(green, world.add('red', { automatic: false, x: 3 })), 'player may hide at full HP/ammo');
  const yellow = world.add('yellow', { automatic: false, charge: 100 });
  assert(world.cast(yellow, world.actors.find(a => a.id === 'red'), { point: { x: 7, z: -3 }, angle: 0 }));
  assert.equal(yellow.devices.length, 0, 'circuit device is not installed immediately');
  for (let i = 0; i < 4; i++) world.update(.25);
  assert.deepEqual(yellow.devices[0], { x: 7, z: -3 }, 'manual circuit placement');
}
{
  // A dead or removed caster must never leave its analysis victim locked forever.
  const bind = () => {
    const world = createBeta6Combat(config, { seed: 5 });
    const caster = world.add('crystal', { automatic: false, charge: 99 });
    const victim = world.add('red', { automatic: false, x: 2, hp: 100000 });
    assert(world.cast(caster, victim), 'crystal analysis binds');
    run(world, 1);
    assert(victim.lockUntil > world.time, 'victim stays locked while analysed');
    return { world, caster, victim };
  };
  {
    const { world, caster, victim } = bind();
    caster.hp = 0;
    run(world, .2);
    assert.equal(victim.analysisOwner, null, 'dead caster releases the victim');
    assert(victim.lockUntil <= world.time, 'dead caster unlocks the victim');
  }
  {
    const { world, caster, victim } = bind();
    world.remove(caster);
    assert.equal(victim.analysisOwner, null, 'removed caster releases the victim');
  }
  {
    const { world, victim } = bind();
    run(world, 7.5);
    assert.equal(victim.hp, 0, 'analysis eliminates the victim after its duration');
  }
  {
    // Tail chains: a victim may not be bound twice, and being bound frees the bind it owns.
    const world = createBeta6Combat(config, { seed: 5 });
    const first = world.add('crystal', { automatic: false, charge: 99 });
    const second = world.add('crystal', { automatic: false, charge: 99, team: 'b', x: 6 });
    const victim = world.add('red', { automatic: false, x: 2, hp: 100000 });
    assert(world.cast(first, victim), 'first crystal binds the victim');
    second.charge = 99;
    assert.equal(world.cast(second, victim), false, 'a bound victim cannot be bound again');
    assert.equal(second.charge, 99, 'a refused analysis keeps its charge');
    assert.equal(victim.analysisOwner, first, 'the first caster keeps the victim');

    const chained = world.add('crystal', { automatic: false, charge: 99, team: 'b', x: -3 });
    assert(world.cast(chained, first), 'a caster can be bound by someone else');
    assert.equal(first.analysisTarget, null, 'being bound releases the bind you own');
    assert.equal(victim.analysisOwner, null, 'the freed victim is no longer analysed');
    assert(victim.lockUntil <= world.time, 'the freed victim can act again');
  }
}
{
  const world = createBeta6Combat(config, { bounds: 40 });
  const lavender = world.add('lavender', { automatic: false, next: 0, team: 1 });
  const front = world.add('red', { x: 4, hp: 10000, automatic: false, team: 2 });
  const back = world.add('red', { x: -4, automatic: false, team: 2 });
  const ally = world.add('red', { x: 4, hp: 10000, automatic: false, team: 1 });
  const backHp = back.hp;
  assert(world.fire(lavender, front, 0));
  assert.equal(lavender.ammo, 2);
  run(world, 1);
  assert.equal(front.hp, 7900, 'spray hits three times for 700');
  assert.equal(back.hp, backHp, 'spray does not hit behind its caster');
  assert.equal(ally.hp, 10000, 'spray does not hit allies');
  assert.equal(lavender.charge, 3, 'each spray hit charges the special');
  lavender.charge = 6;
  assert(world.cast(lavender, front));
  run(world, .1);
  assert.equal(front.slow, .3);
  assert(front.slowUntil > world.time);
  front.x = 10;
  const hp = front.hp;
  run(world, 1);
  assert.equal(front.hp, hp, 'leaving the field stops damage');
  assert(front.slowUntil < world.time, 'leaving the field stops slow');
  world.remove(lavender);
  assert.equal(world.zones.length, 0, 'removing Lavender clears her spray and field');

  const wallWorld = createBeta6Combat(config, { blocked: x => x > 1 && x < 2 });
  const caster = wallWorld.add('lavender', { automatic: false, next: 0 });
  const victim = wallWorld.add('red', { x: 4, automatic: false });
  const before = victim.hp;
  assert(wallWorld.fire(caster, victim, 0));
  run(wallWorld, 1);
  assert.equal(victim.hp, before, 'walls block perfume spray');
}
{
  const world = createBeta6Combat(config);
  const caster = world.add('lavender', { automatic: false, charge: 6, team: 1 });
  const target = world.add('red', { automatic: false, hp: 10000, x: 4, team: 2 });
  assert(world.cast(caster, target));
  caster.x = 20;
  run(world, 6.1);
  assert.equal(target.hp, 8800, 'fixed fragrance field deals six 200-damage ticks');
  assert.equal(caster.charge, 6, 'field damage charges the next special');
  assert.equal(world.zones.length, 0, 'fragrance expires after six seconds');
  assert(target.slowUntil < world.time, 'expired field releases slow');
}
{
  const mesh = { visible: true, position: { x: 4, z: 0 }, userData: { health: 10000 } };
  const context = vm.createContext({ createBeta6Combat, BETA_CHARACTERS: config,
    lavenderPractice: null, lavenderSpecialCharge: 0, beta6Combat: null,
    betaState: { selectedCharacter: 'lavender' }, clock: { elapsedTime: 0 },
    player: { position: { x: 0, z: 0 }, rotation: { y: Math.PI / 2 } },
    goldRushState: { health: 6000, dead: false }, testTargets: [mesh],
    getArenaSolids: () => [], groundHeightAt: () => 0,
    createLavenderMist: () => ({}), disposeLavenderMist: () => {}, updateCrimsonUltimateGauge: () => {},
    damageTarget: (target, damage) => { target.userData.health -= damage; },
  });
  for (const name of ['clearLavenderPractice', 'syncLavenderPractice', 'useLavenderPracticeSkill', 'updateLavenderPractice']) {
    const start = runtime.indexOf(`function ${name}(`);
    vm.runInContext(runtime.slice(start, runtime.indexOf('\n}', start) + 2), context);
  }
  vm.runInContext('useLavenderPracticeSkill(false);', context);
  for (let i = 0; i < 60; i++) vm.runInContext('clock.elapsedTime += 1 / 60; updateLavenderPractice(1 / 60);', context);
  assert.equal(mesh.userData.health, 7900, 'training uses the same three spray ticks');
  assert.equal(context.lavenderSpecialCharge, 3, 'training HUD receives charge');
  vm.runInContext('lavenderSpecialCharge = 6; useLavenderPracticeSkill(true); updateLavenderPractice(.1);', context);
  assert.equal(mesh.userData.slowMultiplier, .7, 'training receives fragrance slow');
  assert.equal(context.lavenderSpecialCharge, 1, 'field spends charge and starts charging again');
  vm.runInContext('clearLavenderPractice();', context);
  assert.equal(context.lavenderPractice, null, 'practice cleanup clears the combat world');
  assert.equal(context.lavenderSpecialCharge, 0, 'practice cleanup clears charge');
}
console.log('PASS: shared combat isolation, 16 basic attacks, Lavender spray/slow/cleanup, Orange return, Purple leap, Crystal cascade/analysis, team revival, freezing, walls, deterministic replay.');
