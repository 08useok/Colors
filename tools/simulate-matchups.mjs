// Deterministic, browser-free paired basic/ultimate model. See specs/matchup-simulation.md.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { CHARACTERS as C } from '../src/config/characters.js';

const root = new URL('../', import.meta.url);
const read = p => readFileSync(new URL(p, root), 'utf8').replace(/\r\n/g, '\n');
const main = read('src/main.js');
const constant = name => {
  const match = main.match(new RegExp(`const ${name} = ([\\d.]+);`));
  assert(match, `Review simulation: missing ${name}`);
  return Number(match[1]);
};
const MOVE = constant('baseMoveSpeed');
const RED_RANGE = constant('attackDepth'); // Runtime uses this, not red.attackRange.
const RED_WIDTH = constant('attackWidth') / 2 + 0.25;
const redHits = [...main.match(/const attackEvents = \[([\s\S]*?)\];/)[1]
  .matchAll(/delay: ([\d.]+), damage: ([\d.]+)/g)].map(m => [Number(m[1]), Number(m[2])]);
const ids = Object.keys(C);
const names = ids.map(id => id[0].toUpperCase() + id.slice(1));
const icons = ['🔴', '🟢', '🔵', '🟠', '🟡', '🩵', '🟣', '🩷', '🟥', '🟨', '🤍', '🟩', '🍃'];
assert.equal(ids.length, icons.length, 'Update roster labels');
const DT = 1 / 60, LIMIT = 45, RADIUS = 1.05, SEED = 20260917;
const scenarios = [4, 10, 16].flatMap(distance => [0.035, 0.1].map(aimError => ({ distance, aimError })));
const repetitions = 50; // 6 scenarios × 50 seeds × two mirrored starts = 600 per pair.
const range = id => ({ red: RED_RANGE, green: C.green.boomerangRange, blue: C.blue.bulletRange,
  orange: C.orange.bombRange, yellow: C.yellow.electricRange, cyan: C.cyan.spreadLineRange,
  purple: C.purple.needleRange, pink: C.pink.healCircleRange, crimson: C.crimson.attackRange,
  gold: C.gold.stage1Range, ivory: C.ivory.iceCreamRange, chartreuse: C.chartreuse.chartreuseRange,
  mint: C.mint.iceBulletRange })[id];
function random(seed) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let x = Math.imul(seed ^ seed >>> 15, 1 | seed);
    x ^= x + Math.imul(x ^ x >>> 7, 61 | x); return ((x ^ x >>> 14) >>> 0) / 4294967296; };
}
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

export function duel(left, right, scenario, seed, mirror = 1, ultimates = false, diagnostics = null, initialCharge = 0) {
  const rng = random(seed), shots = [], events = [], zones = [];
  const record = key => { if (diagnostics?._events) diagnostics._events[key] = (diagnostics._events[key] ?? 0) + 1; };
  const rollAmmo = focused => { const roll = rng(); return focused
    ? (roll < 1 / 3 ? 'enhanced' : roll < 2 / 3 ? 'cc' : 'plague')
    : roll < 0.45 ? 'enhanced' : roll < 0.9 ? 'cc' : roll < 0.95 ? 'plague' : 'blank'; };
  const make = (id, side) => ({ id, d: C[id], x: mirror * side * scenario.distance / 2, y: 0,
    hp: C[id].maxHealth, ammo: C[id].maxAmmo ?? 3, reload: 0, next: rng() * 0.2,
    vx: 0, vy: 0, angle: 0, index: 0, slowUntil: 0, slow: 0, lock: 0,
    poisonUntil: 0, poisonTick: 0, ice: 0, frozenUntil: 0, combat: 0, regen: 0, phase: rng() * Math.PI * 2,
    charge: initialCharge, guardUntil: 0, concealedUntil: 0, revealedUntil: 0, focusedUntil: 0, fieldUntil: 0, dash: null });
  const a = make(left, -1), b = make(right, 1), fighters = [a, b];
  for (const f of fighters) if (f.id === 'chartreuse') f.ammoTypes = Array.from({ length: f.ammo }, () => rollAmmo(false));
  let time = 0;
  const damage = (target, amount, owner) => {
    if (target.hp <= 0 || amount <= 0) return 0;
    const before = target.hp;
    if (time < target.guardUntil) { amount = Math.round(amount * (1 - C.red.ultimate.damageReduction)); record('guardDamage'); }
    target.hp = Math.max(0, target.hp - Math.max(0, amount)); target.combat = time; owner.combat = time;
    if (time < target.concealedUntil) target.revealedUntil = Math.max(target.revealedUntil, time + 3);
    if (time < owner.concealedUntil) owner.revealedUntil = Math.max(owner.revealedUntil, time + 3);
    return before - target.hp;
  };
  const charge = (f, count = 1) => { if (f.d.ultimate) f.charge = Math.min(f.d.ultimate.chargeRequired, f.charge + count); };
  const visible = f => time >= f.concealedUntil || time < f.revealedUntil;
  const addIce = (f, amount) => { f.ice += amount; if (f.ice >= C.mint.freezeThreshold) { f.ice = 0; f.frozenUntil = time + C.mint.freezeDuration; } };
  function push(target, angle, amount) {
    target.x = clamp(target.x + Math.cos(angle) * amount, -24, 24);
    target.y = clamp(target.y + Math.sin(angle) * amount, -24, 24);
  }
  function ultimate(f, target) {
    const u = f.d.ultimate;
    if (!ultimates || !u || f.charge < u.chargeRequired || f.hp <= 0 || time < f.lock || time < f.frozenUntil || f.dash) return;
    // Encore has no allied recipient in a solo duel; never invent self-revival.
    if (f.id === 'pink' || !visible(target)) return;
    const dist = distance(f, target), angle = Math.atan2(target.y - f.y, target.x - f.x);
    if (f.id === 'crimson' && dist > u.size + RADIUS) return;
    if (f.id === 'cyan' && dist > u.range) return;
    if (f.id === 'gold' && dist > u.radius) return;
    // Defensive dash: preserve ranged spacing until an opponent closes inside 8 tiles.
    if (f.id === 'blue' && dist > 8) return;
    if (f.id === 'green' && f.ammo > 0 && f.hp > f.d.maxHealth * 0.4) return;
    f.charge = 0;
    if (diagnostics) diagnostics[f.id] = (diagnostics[f.id] ?? 0) + 1;
    if (f.id === 'red') f.guardUntil = time + u.duration;
    else if (f.id === 'green') { f.concealedUntil = time + u.duration; f.revealedUntil = 0; f.hideReload = true; }
    else if (f.id === 'chartreuse') f.focusedUntil = time + u.duration;
    else if (f.id === 'blue') f.dash = { angle, remaining: u.duration, hit: false };
    else if (f.id === 'crimson') { damage(target, u.damage, f); push(target, angle, u.knockback); record('crimsonHit'); }
    else if (f.id === 'cyan') projectile(f, angle, f.d.spreadLineSpeed * u.speedMultiplier, u.range, u.damage, { kind: 'gale', radius: u.width / 2, ultimate: true });
    else if (f.id === 'gold') events.push({ at: time + u.delay, run() { if (f.hp > 0) f.fieldUntil = time + u.duration; } });
    else if (f.id === 'ivory') {
      const diagonal = u.patternRadius / Math.sqrt(2);
      const center = { x: f.x + Math.cos(angle) * u.castRange, y: f.y + Math.sin(angle) * u.castRange };
      [[0, 0], [diagonal, diagonal], [-diagonal, diagonal], [diagonal, -diagonal], [-diagonal, -diagonal]].forEach(([x, y], i) => {
        const dx = center.x + x - f.x, dy = center.y + y - f.y;
        projectile(f, Math.atan2(dy, dx), f.d.iceCreamSpeed, Math.max(0.1, Math.hypot(dx, dy) - 0.9), f.d.iceCreamDamage,
          { kind: 'ivory', radius: 0.42, delay: 0.2 + i * 0.06, ultimate: true });
      });
    } else if (f.id === 'mint') {
      const x = f.x + Math.cos(angle) * u.castRange, y = f.y + Math.sin(angle) * u.castRange;
      events.push({ at: time + u.castRange / 14 + 0.08, run() {
        if (f.hp > 0) zones.push({ x, y, owner: f, kind: 'mint', started: time, until: time + u.duration, next: time });
      } });
    } else throw new Error(`Unsupported ultimate: ${f.id}`);
  }
  function projectile(f, angle, speed, reach, amount, options = {}) {
    const offset = options.offset ?? 0, origin = options.origin ?? f;
    shots.push({ owner: f, x: origin.x + Math.cos(angle) * (options.spawn ?? 0.9) - Math.sin(angle) * offset,
      y: origin.y + Math.sin(angle) * (options.spawn ?? 0.9) + Math.cos(angle) * offset,
      angle, speed, reach, amount, traveled: 0, launch: time + (options.delay ?? 0), radius: 0,
      ...options });
  }
  function fire(f, target) {
    const d = f.d, id = f.id;
    const speed = d.bulletSpeed ?? d.bombSpeed ?? d.electricSpeed ?? d.needleSpeed ?? d.iceBulletSpeed ?? 20;
    // Same controller for both sides; partial velocity prediction and seeded angular error.
    const lead = distance(f, target) / speed * 0.65;
    const angle = Math.atan2(target.y + target.vy * lead - f.y, target.x + target.vx * lead - f.x)
      + (rng() * 2 - 1) * scenario.aimError;
    f.angle = angle; f.ammo--; f.next = time + d.attackCooldown; f.combat = time;
    if (time < f.concealedUntil) f.revealedUntil = Math.max(f.revealedUntil, time + C.green.ultimate.revealDuration);
    const shot = (v, r, dmg, opt = {}, yaw = angle) => projectile(f, yaw, v, r, dmg, opt);
    if (id === 'red' || id === 'crimson') {
      const hits = id === 'red' ? redHits : Array.from({ length: d.attackCount }, (_, i) => [i * d.attackIntervalMs / 1000, d.attackDamages?.[i] ?? d.attackDamage]);
      hits.forEach(([delay, amount], i) => events.push({ at: time + delay, run() {
        if (f.hp <= 0 || time < f.frozenUntil || time < f.lock) return;
        const yaw = f.angle + (id === 'red' ? (i ? 20 : -20) * Math.PI / 180 : d.attackAngles[i]);
        const dx = target.x - f.x, dy = target.y - f.y;
        const forward = dx * Math.cos(yaw) + dy * Math.sin(yaw);
        const lateral = -dx * Math.sin(yaw) + dy * Math.cos(yaw);
        const hit = id === 'red' ? forward >= 0 && forward <= range(id) && Math.abs(lateral - (i ? -1 : 0.5)) <= RED_WIDTH
          : distance(f, target) <= d.attackRange && Math.abs(Math.atan2(lateral, forward)) <= d.attackHalfAngle;
        if (hit && visible(target) && damage(target, amount, f) > 0) charge(f);
      } }));
    } else if (id === 'pink') { if (distance(f, target) <= d.healCircleRange && damage(target, d.healCircleDamage, f) > 0) charge(f); }
    else if (id === 'blue') shot(d.bulletSpeed, d.bulletRange, d.bulletDamage);
    else if (id === 'green') d.boomerangAngles.forEach((offset, i) => shot(d.boomerangSpeed, d.boomerangRange, d.boomerangDamage, { kind: 'boomerang', radius: 0.34, spawn: 0, delay: i * 0.08 }, angle + offset));
    else if (id === 'orange') shot(d.bombSpeed, d.bombRange, d.bombDamage, { kind: 'bomb' });
    else if (id === 'yellow') shot(d.electricSpeed, d.electricRange, d.electricDamage, { kind: 'electric', delay: d.attackDelay });
    else if (id === 'cyan') for (let i = 0; i < d.spreadLineCount; i++) shot(d.spreadLineSpeed, d.spreadLineRange, d.spreadLineDamage, { offset: (i - (d.spreadLineCount - 1) / 2) * d.spreadLineSpacing });
    else if (id === 'purple') {
      if (f.index++ % 2) shot(d.vialSpeed, d.vialRange, d.vialDamage, { kind: 'vial' });
      else for (let i = 0; i < d.needleCount; i++) shot(d.needleSpeed, d.needleRange, d.needleDamage, { kind: 'needle' }, angle + (i / (d.needleCount - 1) - 0.5) * d.needleSpreadAngle);
    } else if (id === 'gold') shot(d.stage1Speed, d.stage1Range, d.stage1Damage, { kind: 'gold', stage: 1, stages: new Set(), goldCharge: { value: 0 }, radius: d.stage1Size / 2, spawn: 0 });
    else if (id === 'ivory') shot(d.iceCreamSpeed, d.iceCreamRange, d.iceCreamDamage, { kind: 'ivory', radius: 0.42, delay: 0.2 });
    else if (id === 'chartreuse') {
      // Existing rounds are preserved when Focus starts; only new queue entries use its odds.
      while (f.ammoTypes.length < (d.maxAmmo ?? 3)) f.ammoTypes.push(rollAmmo(time < f.focusedUntil));
      const kind = f.ammoTypes.shift();
      f.ammoTypes.push(rollAmmo(time < f.focusedUntil));
      if (time < f.focusedUntil) record('focusedShot');
      if (kind !== 'blank') shot(d.chartreuseSpeed, d.chartreuseRange, kind === 'enhanced' ? d.chartreuseEnhancedDamage : d.chartreuseDamage, { kind, radius: 0.22 });
    } else if (id === 'mint') for (let i = 0; i < d.burstCount; i++) events.push({ at: time + i * d.burstIntervalMs / 1000,
      run() { if (f.hp > 0 && time >= f.frozenUntil) projectile(f, angle, d.iceBulletSpeed, d.iceBulletRange, d.iceBulletDamage, { radius: 0.24, kind: 'mint' }); } });
    else throw new Error(`Unsupported character: ${id}`);
  }
  function poison(target, reset = false) {
    target.poisonUntil = time + C.purple.poisonDuration;
    if (reset || target.poisonTick < time) target.poisonTick = time + 1;
  }
  function finishShot(p, target, hit) {
    const d = p.owner.d;
    if (hit && !p.hit) {
      let amount = p.kind === 'plague' ? target.hp : p.amount;
      if (p.kind === 'boomerang') amount *= (p.traveled > d.boomerangFarThreshold ? d.boomerangFarMultiplier : 1) * (p.returning ? d.boomerangReturnDamageMultiplier : 1);
      if (p.kind === 'gold' && p.stages.has(p.stage)) amount = 0;
      if (p.kind === 'gold') p.stages.add(p.stage);
      const dealt = p.kind !== 'vial' ? damage(target, amount, p.owner) : 0;
      if (dealt > 0 && !p.ultimate && p.owner.d.ultimate) {
        if (p.kind === 'gold') {
          const award = Math.min([0, 3, 2, 1][p.stage], d.maxChargePerAttack - p.goldCharge.value);
          p.goldCharge.value += award; charge(p.owner, award);
        } else charge(p.owner);
      }
      if (p.kind === 'gale' && dealt > 0) { push(target, p.angle, d.ultimate.knockback); record('galeHit'); }
      if (p.kind === 'needle') poison(target);
      if (p.kind === 'mint') {
        addIce(target, d.icePerHit);
      }
      if (p.kind === 'electric') { target.slowUntil = time + d.shockDuration; target.slow = d.shockSlowPercent; }
      if (p.kind === 'cc') {
        const cc = Math.floor(rng() * 6);
        if (cc === 0 || cc === 5) { target.slowUntil = time + 2; target.slow = cc === 0 ? 0.35 : 1; }
        if (cc === 1 || cc === 5) target.lock = time + 2;
        if (cc === 3) poison(target, true);
        if (cc === 4) { target.x += Math.cos(p.angle) * 3.5; target.y += Math.sin(p.angle) * 3.5; }
      }
    }
    if (p.kind === 'boomerang') {
      if (hit) p.hit = true;
      if (!p.returning && (hit || p.traveled >= p.reach)) { p.returning = true; p.hit = false; p.traveled = 0; p.speed *= d.boomerangReturnSpeedMultiplier; }
      return false;
    }
    if (p.kind === 'bomb') {
      if (distance(p, target) <= 3) damage(target, d.bombDamage, p.owner);
      if (hit) damage(target, d.bombSplashDamage * d.bombDirectHitJuiceCount, p.owner);
      const count = hit ? d.bombSplashCount - d.bombDirectHitJuiceCount : d.bombSplashCount;
      for (let i = 0; i < count; i++) projectile(p.owner, i / d.bombSplashCount * Math.PI * 2, d.bombSplashSpeed, d.bombSplashRange, d.bombSplashDamage,
        { origin: p, spawn: 0, radius: d.bombSplashHitRadius, hit: hit });
    }
    if (p.kind === 'vial' && distance(p, target) <= d.vialSplashRadius) damage(target, d.vialDamage, p.owner);
    if (p.kind === 'ivory') { zones.push({ x: p.x, y: p.y, owner: p.owner, until: time + d.iceCreamZoneDuration, next: time }); if (p.ultimate) record('ivoryUltimateZone'); }
    if (p.kind === 'gold' && p.stage < 3) {
      const stage = p.stage + 1;
      const angles = stage === 2 ? [-Math.PI / 2, Math.PI / 2] : Array.from({ length: 6 }, (_, i) => i * Math.PI / 3);
      angles.forEach(offset => projectile(p.owner, p.angle + offset, d[`stage${stage}Speed`], d[`stage${stage}Range`], d[`stage${stage}Damage`],
        { origin: p, spawn: 0, kind: 'gold', stage, stages: p.stages, goldCharge: p.goldCharge, radius: stage === 2 ? 0.26 : d.projectileRadius }));
    }
    return true;
  }
  for (let frame = 0; frame < LIMIT / DT; frame++) {
    time = frame * DT;
    fighters.forEach((f, i) => {
      const target = fighters[1 - i];
      if (time < f.fieldUntil && distance(f, target) <= f.d.ultimate.radius) { target.lock = Math.max(target.lock, time + 0.15); record('goldLock'); }
      ultimate(f, target);
      if (f.hideReload && (f.ammo >= (f.d.maxAmmo ?? 3) || time >= f.concealedUntil)) f.hideReload = false;
    });
    // Compute both velocities before moving either fighter.
    fighters.forEach((f, i) => {
      const target = fighters[1 - i], dist = distance(f, target), yaw = Math.atan2(target.y - f.y, target.x - f.x);
      const ideal = ({ red: 3.5, green: 1.5, crimson: 2, pink: 3 })[f.id] ?? range(f.id) * 0.8;
      const radial = dist > ideal + 0.7 ? 0.85 : dist < ideal - 0.7 ? -0.85 : 0;
      const strafe = Math.sin(time * 2.4 + f.phase) * 0.4;
      const speed = MOVE * f.d.moveSpeedMultiplier * (time < f.slowUntil ? 1 - f.slow : 1) * (time < f.lock ? 0.5 : 1) * (time < f.frozenUntil ? 0 : 1);
      f.vx = (Math.cos(yaw) * radial - Math.sin(yaw) * strafe) * speed;
      f.vy = (Math.sin(yaw) * radial + Math.cos(yaw) * strafe) * speed;
      f.angle = yaw;
      if (!visible(target)) { f.vx = 0; f.vy = 0; record('concealedTarget'); }
      if (f.dash) {
        if (time < f.frozenUntil || time < f.lock) f.dash = null;
        else { f.vx = Math.cos(f.dash.angle) * f.d.ultimate.speed; f.vy = Math.sin(f.dash.angle) * f.d.ultimate.speed; }
      }
    });
    fighters.forEach(f => { f.x = clamp(f.x + f.vx * DT, -24, 24); f.y = clamp(f.y + f.vy * DT, -24, 24); });
    fighters.forEach((f, i) => {
      if (!f.dash) return;
      const dash = f.dash, target = fighters[1 - i];
      if (Math.abs(f.x) >= 24) dash.angle = Math.PI - dash.angle;
      if (Math.abs(f.y) >= 24) dash.angle = -dash.angle;
      if (!dash.hit && distance(f, target) <= f.d.ultimate.hitRadius) {
        damage(target, f.d.ultimate.damage, f); push(target, dash.angle, 5.5 / 9); dash.hit = true; record('dashHit');
      }
      dash.remaining -= DT;
      if (dash.remaining <= 0) f.dash = null;
    });
    fighters.forEach((f, i) => {
      const target = fighters[1 - i];
      if (f.ammo >= (f.d.maxAmmo ?? 3)) f.reload = 0;
      else if (time >= f.next) { f.reload += DT; if (f.reload >= f.d.reloadDuration) { f.ammo++; f.reload -= f.d.reloadDuration; } }
      if (time < f.poisonUntil && time >= f.poisonTick) { damage(f, C.purple.poisonDPS, target); f.poisonTick = time + 1; }
      if (f.hp > 0 && time - f.combat >= 3 && time >= f.regen) { f.hp = Math.min(f.d.maxHealth, f.hp + f.d.maxHealth * 0.25); f.regen = time + 1; }
    });
    if (a.hp <= 0 || b.hp <= 0) break;
    // Both get to fire in a frame: immediate damage cannot create a left-side advantage.
    const ready = fighters.map((f, i) => !f.dash && !f.hideReload && visible(fighters[1 - i]) && f.ammo > 0 && time >= f.next && time >= f.lock && time >= f.frozenUntil && distance(f, fighters[1 - i]) <= range(f.id));
    fighters.forEach((f, i) => { if (ready[i]) fire(f, fighters[1 - i]); });
    for (let i = events.length - 1; i >= 0; i--) if (events[i].at <= time) { events[i].run(); events.splice(i, 1); }
    for (let i = shots.length - 1; i >= 0; i--) {
      const p = shots[i], target = p.owner === a ? b : a;
      if (time < p.launch) continue;
      if (p.returning) {
        if (p.owner.hp <= 0 || distance(p, p.owner) < 0.7) { shots.splice(i, 1); continue; }
        p.angle = Math.atan2(p.owner.y - p.y, p.owner.x - p.x);
      }
      p.x += Math.cos(p.angle) * p.speed * DT; p.y += Math.sin(p.angle) * p.speed * DT; p.traveled += p.speed * DT;
      const dx = target.x - p.x, dy = target.y - p.y;
      const hit = !p.hit && (p.kind === 'gale'
        ? Math.abs(dx * Math.cos(p.angle) + dy * Math.sin(p.angle)) <= 1 && Math.abs(-dx * Math.sin(p.angle) + dy * Math.cos(p.angle)) <= p.owner.d.ultimate.width / 2 + RADIUS
        : distance(p, target) < RADIUS + p.radius);
      if ((hit || (!p.returning && p.traveled >= p.reach)) && finishShot(p, target, hit)) shots.splice(i, 1);
    }
    for (let i = zones.length - 1; i >= 0; i--) {
      const z = zones[i], target = z.owner === a ? b : a;
      if (time >= z.until) { zones.splice(i, 1); continue; }
      if (z.kind === 'mint') {
        const u = z.owner.d.ultimate;
        if (distance(z, target) <= u.radius) {
          if (time >= z.next) { damage(target, u.damagePerSecond, z.owner); addIce(target, u.icePerSecond); record('mintFieldTick'); }
          if (time >= target.frozenUntil) push(target, Math.atan2(target.y - z.y, target.x - z.x), (u.slideStrength + u.slideAcceleration * (time - z.started)) * DT);
        }
        if (time >= z.next) z.next = time + 1;
        continue;
      }
      if (time >= z.next) { if (distance(z, target) <= z.owner.d.iceCreamZoneRadius) damage(target, z.owner.d.iceCreamDamage, z.owner); z.next = time + z.owner.d.iceCreamZoneTickInterval; }
    }
    if (a.hp <= 0 || b.hp <= 0) break;
  }
  return a.hp <= 0 && b.hp <= 0 ? 0 : a.hp <= 0 ? -1 : b.hp <= 0 ? 1 : 0;
}

const tierIndex = score => {
  const delta = score - 0.5;
  const steps = [0.05, 0.20, 0.35, 0.45].filter(t => Math.abs(delta) + 1e-10 >= t).length;
  return 4 - Math.sign(delta) * steps;
};
function tournament(ultimates) {
  const casts = Object.fromEntries(ids.map(id => [id, 0]));
  const matrix = Object.fromEntries(ids.map(id => [id, {}]));
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    let wins = 0, losses = 0, draws = 0;
    for (let s = 0; s < scenarios.length; s++) for (let n = 0; n < repetitions; n++) for (const mirror of [1, -1]) {
      // Swap participants as well as positions to cancel order effects.
      const seed = SEED + s * 10000 + n;
      const result = mirror === 1 ? duel(ids[i], ids[j], scenarios[s], seed, 1, ultimates, casts) : -duel(ids[j], ids[i], scenarios[s], seed, -1, ultimates, casts);
      if (result > 0) wins++; else if (result < 0) losses++; else draws++;
    }
    const games = wins + losses + draws, score = (wins + draws / 2) / games;
    matrix[ids[i]][ids[j]] = { wins, losses, draws, games, score };
    matrix[ids[j]][ids[i]] = { wins: losses, losses: wins, draws, games, score: 1 - score };
  }
  for (const a of ids) {
    assert.equal(Object.keys(matrix[a]).length, ids.length - 1);
    for (const b of ids.filter(id => id !== a)) {
      const r = matrix[a][b]; assert.equal(r.wins + r.losses + r.draws, 600);
      assert(Math.abs(r.score + matrix[b][a].score - 1) < 1e-10);
      assert.equal(tierIndex(r.score) + tierIndex(matrix[b][a].score), 8);
    }
  }
  return { matrix, casts };
}
function run() {
const baseline = tournament(false);
const combined = tournament(true);
const matrix = combined.matrix;
const average = (matrix, id) => Object.values(matrix[id]).reduce((sum, r) => sum + r.score, 0) / (ids.length - 1) * 100;
const comparison = ids.map(id => ({ character: id, basicScore: average(baseline.matrix, id), ultimateScore: average(matrix, id), deltaPoints: average(matrix, id) - average(baseline.matrix, id), casts: combined.casts[id] }));
const changedPairs = [];
for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
  const a = ids[i], b = ids[j], before = baseline.matrix[a][b].score, after = matrix[a][b].score;
  if (tierIndex(before) !== tierIndex(after)) changedPairs.push({ a, b, before, after, deltaPoints: (after - before) * 100, beforeTier: tierIndex(before), afterTier: tierIndex(after) });
}
changedPairs.sort((a, b) => Math.abs(b.deltaPoints) - Math.abs(a.deltaPoints));
const rows = ids.map((id, i) => {
  const buckets = Array.from({ length: 9 }, () => []);
  ids.forEach((other, j) => { if (id !== other) buckets[tierIndex(matrix[id][other].score)].push(`${icons[j]} ${names[j]} ${(matrix[id][other].score * 100).toFixed(1)}%`); });
  return `                <tr><th scope="row" class="mu-${id}">${icons[i]} ${names[i]}</th>${buckets.map(b => `<td>${b.join('<br>') || '—'}</td>`).join('')}</tr>`;
}).join('\n');
const report = { model: 'ultimate-2d-v2', initialCharge: 0, ultimates: true, seed: SEED, dt: DT, seconds: LIMIT, scenarios, repetitions,
  configHash: createHash('sha256').update(read('src/config/characters.js')).digest('hex'),
  combatSourceHash: createHash('sha256').update(main).digest('hex'),
  simulatorHash: createHash('sha256').update(read('tools/simulate-matchups.mjs')).digest('hex'), matrix, baselineMatrix: baseline.matrix, comparison, changedPairs };
const tiers = ['압도적 유리', '완전 유리', '유리', '약간 유리', '경합', '약간 불리', '불리', '완전 불리', '압도적 불리'];
const label = id => names[ids.indexOf(id)];
const signed = n => Math.abs(n) < 0.05 ? '0.0' : `${n >= 0 ? '+' : ''}${n.toFixed(1)}`;
const comparisonMd = `# 궁극기 포함 상성 비교

같은 모델·시작 거리·조준 오차·난수 시드로 일반 공격 46,800회와 궁극기 포함 46,800회를 비교했다.
상성표는 궁극기 포함 결과를 사용한다. 각 쌍은 조건별 위치 교환을 포함해 600회이며, ${changedPairs.length}/78쌍에서 상성 단계가 바뀌었다.
아래 점수는 (승리 + 무승부 × 0.5) 비율이다. 평균은 자신을 제외한 12종에 같은 가중치를 준 값이며 실전 승률이 아니다.

## 캐릭터별 평균 변화

| 캐릭터 | 일반 공격 | 궁극기 포함 | 차이(%p) | 궁극기 발동 횟수 |
|---|---:|---:|---:|---:|
${comparison.map(r => `| ${label(r.character)} | ${r.basicScore.toFixed(1)}% | ${r.ultimateScore.toFixed(1)}% | ${signed(r.deltaPoints)} | ${r.casts} |`).join('\n')}

발동 횟수는 캐릭터별 7,200경기 합계다. 충전은 0에서 시작한다. 레드·크림슨·골드·아이보리·샤르트뢰즈는 이번 조건에서 충전/사용 조건을 갖추기 전에 결투가 끝나 실제 발동이 0회였다. 구현 누락과 구분하기 위해 별도의 충전 완료 상태 검사에서 9종의 1대1 궁극기 발동 및 주요 효과를 확인한다. 충전 완료로 시작하는 검사는 위 결과에 섞지 않는다.
핑크는 아군 부활 기술이므로 1대1에서 사용할 대상이 없다. 자신의 궁극기가 발동하지 않아도 상대 기술 때문에 점수는 변한다.

## 단계가 바뀐 조합

행의 왼쪽 캐릭터 기준이다. 점수 차이가 큰 순서다.

| 조합 | 일반 공격 | 궁극기 포함 | 차이(%p) | 단계 변화 |
|---|---:|---:|---:|---|
${changedPairs.map(r => `| ${label(r.a)} → ${label(r.b)} | ${(r.before * 100).toFixed(1)}% | ${(r.after * 100).toFixed(1)}% | ${signed(r.deltaPoints)} | ${tiers[r.beforeTier]} → ${tiers[r.afterTier]} |`).join('\n')}

## 해석 범위

- 블루는 8타일 안으로 접근한 적에게 돌진하고, 그린은 탄약 소진 또는 체력 40% 이하에서 은신해 재장전을 기다린다. 다른 기술도 사거리와 상태 조건에 따라 사용한다. 이런 사용 정책 자체가 결과에 영향을 준다.
- 궁극기는 항상 이득이 되는 행동이 아니다. 돌진으로 거리를 좁히거나 넉백으로 상대 위치를 바꾸면 불리해지는 조합도 있다. 특정 조합의 급변을 실전의 확정 상성으로 해석하지 않는다.
- 지형·팀전·실제 사용자 조작을 제외한 2D 근사 모델이다. 팀 지원 능력의 가치는 이 표로 평가할 수 없다.
- 이전에 저장된 옛 표 대신 이번 모델에서 일반 공격 기준도 다시 계산했다. 탄종 대기열 등 모델 보정이 양쪽에 공통으로 적용되므로 궁극기 사용 여부를 같은 기준으로 비교한다.

[조건과 구현 범위](matchup-simulation.md) · [전체 수치](matchup-results.json)
`;
if (process.argv.includes('--write')) {
  const html = read('index.html');
  const pattern = /(<div id="matchup-table"[\s\S]*?<tbody>)[\s\S]*?(<\/tbody>)/;
  assert(pattern.test(html));
  writeFileSync(new URL('index.html', root), html.replace(pattern, `$1\n${rows}\n              $2`));
  writeFileSync(new URL('specs/matchup-results.json', root), JSON.stringify(report, null, 2) + '\n');
  writeFileSync(new URL('specs/matchup-comparison.md', root), comparisonMd);
} else if (process.argv.includes('--check')) {
  assert.deepEqual(JSON.parse(read('specs/matchup-results.json')), report, 'Run npm run simulate:matchups -- --write');
  assert(read('index.html').includes(rows), 'Matchup HTML is stale');
  assert.equal(read('specs/matchup-comparison.md'), comparisonMd, 'Comparison document is stale');
}
console.log(`Completed ${ids.length * (ids.length - 1) * 600} duels; 46,800 basic + 46,800 with ultimates. Changed tiers: ${changedPairs.length}/78.`);
console.table(comparison.map(r => ({ character: r.character, basic: r.basicScore.toFixed(1), ultimate: r.ultimateScore.toFixed(1), delta: r.deltaPoints.toFixed(1), casts: r.casts })));
console.table(changedPairs.slice(0, 12));
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) run();
