// Deterministic, browser-free BASIC-ATTACK model. See specs/matchup-simulation.md.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
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

function duel(left, right, scenario, seed, mirror = 1) {
  const rng = random(seed), shots = [], events = [], zones = [];
  const make = (id, side) => ({ id, d: C[id], x: mirror * side * scenario.distance / 2, y: 0,
    hp: C[id].maxHealth, ammo: C[id].maxAmmo ?? 3, reload: 0, next: rng() * 0.2,
    vx: 0, vy: 0, angle: 0, index: 0, slowUntil: 0, slow: 0, lock: 0,
    poisonUntil: 0, poisonTick: 0, ice: 0, frozenUntil: 0, combat: 0, regen: 0, phase: rng() * Math.PI * 2 });
  const a = make(left, -1), b = make(right, 1), fighters = [a, b];
  let time = 0;
  const damage = (target, amount, owner) => { target.hp = Math.max(0, target.hp - Math.max(0, amount)); target.combat = time; owner.combat = time; };
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
    const shot = (v, r, dmg, opt = {}, yaw = angle) => projectile(f, yaw, v, r, dmg, opt);
    if (id === 'red' || id === 'crimson') {
      const hits = id === 'red' ? redHits : Array.from({ length: d.attackCount }, (_, i) => [i * d.attackIntervalMs / 1000, d.attackDamages?.[i] ?? d.attackDamage]);
      hits.forEach(([delay, amount], i) => events.push({ at: time + delay, run() {
        if (f.hp <= 0 || time < f.frozenUntil) return;
        const yaw = f.angle + (id === 'red' ? (i ? 20 : -20) * Math.PI / 180 : d.attackAngles[i]);
        const dx = target.x - f.x, dy = target.y - f.y;
        const forward = dx * Math.cos(yaw) + dy * Math.sin(yaw);
        const lateral = -dx * Math.sin(yaw) + dy * Math.cos(yaw);
        const hit = id === 'red' ? forward >= 0 && forward <= range(id) && Math.abs(lateral - (i ? -1 : 0.5)) <= RED_WIDTH
          : distance(f, target) <= d.attackRange && Math.abs(Math.atan2(lateral, forward)) <= d.attackHalfAngle;
        if (hit) damage(target, amount, f);
      } }));
    } else if (id === 'pink') { if (distance(f, target) <= d.healCircleRange) damage(target, d.healCircleDamage, f); }
    else if (id === 'blue') shot(d.bulletSpeed, d.bulletRange, d.bulletDamage);
    else if (id === 'green') d.boomerangAngles.forEach((offset, i) => shot(d.boomerangSpeed, d.boomerangRange, d.boomerangDamage, { kind: 'boomerang', radius: 0.34, spawn: 0, delay: i * 0.08 }, angle + offset));
    else if (id === 'orange') shot(d.bombSpeed, d.bombRange, d.bombDamage, { kind: 'bomb' });
    else if (id === 'yellow') shot(d.electricSpeed, d.electricRange, d.electricDamage, { kind: 'electric', delay: d.attackDelay });
    else if (id === 'cyan') for (let i = 0; i < d.spreadLineCount; i++) shot(d.spreadLineSpeed, d.spreadLineRange, d.spreadLineDamage, { offset: (i - (d.spreadLineCount - 1) / 2) * d.spreadLineSpacing });
    else if (id === 'purple') {
      if (f.index++ % 2) shot(d.vialSpeed, d.vialRange, d.vialDamage, { kind: 'vial' });
      else for (let i = 0; i < d.needleCount; i++) shot(d.needleSpeed, d.needleRange, d.needleDamage, { kind: 'needle' }, angle + (i / (d.needleCount - 1) - 0.5) * d.needleSpreadAngle);
    } else if (id === 'gold') shot(d.stage1Speed, d.stage1Range, d.stage1Damage, { kind: 'gold', stage: 1, stages: new Set(), radius: d.stage1Size / 2, spawn: 0 });
    else if (id === 'ivory') shot(d.iceCreamSpeed, d.iceCreamRange, d.iceCreamDamage, { kind: 'ivory', radius: 0.42, delay: 0.2 });
    else if (id === 'chartreuse') {
      const roll = rng(), kind = roll < 0.45 ? 'enhanced' : roll < 0.9 ? 'cc' : roll < 0.95 ? 'plague' : 'blank';
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
      if (p.kind !== 'vial') damage(target, amount, p.owner);
      if (p.kind === 'needle') poison(target);
      if (p.kind === 'mint') {
        target.ice += d.icePerHit;
        if (target.ice >= d.freezeThreshold) { target.ice = 0; target.frozenUntil = time + d.freezeDuration; }
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
    if (p.kind === 'ivory') zones.push({ x: p.x, y: p.y, owner: p.owner, until: time + d.iceCreamZoneDuration, next: time });
    if (p.kind === 'gold' && p.stage < 3) {
      const stage = p.stage + 1;
      const angles = stage === 2 ? [-Math.PI / 2, Math.PI / 2] : Array.from({ length: 6 }, (_, i) => i * Math.PI / 3);
      angles.forEach(offset => projectile(p.owner, p.angle + offset, d[`stage${stage}Speed`], d[`stage${stage}Range`], d[`stage${stage}Damage`],
        { origin: p, spawn: 0, kind: 'gold', stage, stages: p.stages, radius: stage === 2 ? 0.26 : d.projectileRadius }));
    }
    return true;
  }
  for (let frame = 0; frame < LIMIT / DT; frame++) {
    time = frame * DT;
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
    });
    fighters.forEach(f => { f.x = clamp(f.x + f.vx * DT, -24, 24); f.y = clamp(f.y + f.vy * DT, -24, 24); });
    fighters.forEach((f, i) => {
      const target = fighters[1 - i];
      if (f.ammo >= (f.d.maxAmmo ?? 3)) f.reload = 0;
      else if (time >= f.next) { f.reload += DT; if (f.reload >= f.d.reloadDuration) { f.ammo++; f.reload -= f.d.reloadDuration; } }
      if (time < f.poisonUntil && time >= f.poisonTick) { damage(f, C.purple.poisonDPS, target); f.poisonTick = time + 1; }
      if (f.hp > 0 && time - f.combat >= 3 && time >= f.regen) { f.hp = Math.min(f.d.maxHealth, f.hp + f.d.maxHealth * 0.25); f.regen = time + 1; }
    });
    if (a.hp <= 0 || b.hp <= 0) break;
    // Both get to fire in a frame: immediate damage cannot create a left-side advantage.
    const ready = fighters.map((f, i) => f.ammo > 0 && time >= f.next && time >= f.lock && time >= f.frozenUntil && distance(f, fighters[1 - i]) <= range(f.id));
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
      const hit = !p.hit && distance(p, target) < RADIUS + p.radius;
      if ((hit || (!p.returning && p.traveled >= p.reach)) && finishShot(p, target, hit)) shots.splice(i, 1);
    }
    for (let i = zones.length - 1; i >= 0; i--) {
      const z = zones[i], target = z.owner === a ? b : a;
      if (time >= z.until) { zones.splice(i, 1); continue; }
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
const matrix = Object.fromEntries(ids.map(id => [id, {}]));
for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
  let wins = 0, losses = 0, draws = 0;
  for (let s = 0; s < scenarios.length; s++) for (let n = 0; n < repetitions; n++) for (const mirror of [1, -1]) {
    // Swap participants as well as positions to cancel order effects.
    const seed = SEED + s * 10000 + n;
    const result = mirror === 1 ? duel(ids[i], ids[j], scenarios[s], seed) : -duel(ids[j], ids[i], scenarios[s], seed, -1);
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
const rows = ids.map((id, i) => {
  const buckets = Array.from({ length: 9 }, () => []);
  ids.forEach((other, j) => { if (id !== other) buckets[tierIndex(matrix[id][other].score)].push(`${icons[j]} ${names[j]} ${(matrix[id][other].score * 100).toFixed(1)}%`); });
  return `                <tr><th scope="row" class="mu-${id}">${icons[i]} ${names[i]}</th>${buckets.map(b => `<td>${b.join('<br>') || '—'}</td>`).join('')}</tr>`;
}).join('\n');
const report = { model: 'basic-attack-2d-v1', seed: SEED, dt: DT, seconds: LIMIT, scenarios, repetitions,
  configHash: createHash('sha256').update(read('src/config/characters.js')).digest('hex'),
  combatSourceHash: createHash('sha256').update(main).digest('hex'),
  simulatorHash: createHash('sha256').update(read('tools/simulate-matchups.mjs')).digest('hex'), matrix };
if (process.argv.includes('--write')) {
  const html = read('index.html');
  const pattern = /(<div id="matchup-table"[\s\S]*?<tbody>)[\s\S]*?(<\/tbody>)/;
  assert(pattern.test(html));
  writeFileSync(new URL('index.html', root), html.replace(pattern, `$1\n${rows}\n              $2`));
  writeFileSync(new URL('specs/matchup-results.json', root), JSON.stringify(report, null, 2) + '\n');
} else if (process.argv.includes('--check')) {
  assert.deepEqual(JSON.parse(read('specs/matchup-results.json')), report, 'Run npm run simulate:matchups -- --write');
  assert(read('index.html').includes(rows), 'Matchup HTML is stale');
}
console.log(`Completed ${ids.length * (ids.length - 1) / 2 * 600} duels; 13 characters, 78 pairs, 600 per pair.`);
console.table(ids.map(id => ({ character: id, score: (Object.values(matrix[id]).reduce((sum, r) => sum + r.score, 0) / 12 * 100).toFixed(1) + '%', draws: Object.values(matrix[id]).reduce((sum, r) => sum + r.draws, 0) })));
