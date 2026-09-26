// Browser-independent combat used by beta6 bots and the matchup runner.
import { beta6Ultimate } from '../config/beta6-balance.js';
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const PROJECTILE_SIZE = 5;
const PROJECTILE_HALF_SIZE = PROJECTILE_SIZE / 2;
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const segmentDistance = (p, a, b) => {
  const dx = b.x - a.x, dz = b.z - a.z;
  const t = clamp(((p.x - a.x) * dx + (p.z - a.z) * dz) / (dx * dx + dz * dz || 1), 0, 1);
  return Math.hypot(p.x - a.x - dx * t, p.z - a.z - dz * t);
};
export function createBeta6Combat(definitions, options = {}) {
  let seed = options.seed ?? 20260919, time = 0, serial = 0;
  const random = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let x = Math.imul(seed ^ seed >>> 15, 1 | seed); x ^= x + Math.imul(x ^ x >>> 7, 61 | x); return ((x ^ x >>> 14) >>> 0) / 4294967296; };
  const actors = [], projectiles = [], zones = [], scheduled = [];
  const emit = (type, data) => options.onEvent?.({ type, time, ...data });
  const enemies = (a, b) => a !== b && (a.team == null || b.team !== a.team);
  const alive = a => a.hp > 0;
  const hidden = a => time < a.hiddenUntil && time >= a.revealedUntil && distance(a, a.bush || a) <= (a.u?.radius ?? 0);
  const blocked = (x, z, radius = .55) => options.blocked?.(x, z, radius) ?? false;
  function move(a, x, z) {
    const bounds = options.bounds ?? 24;
    x = clamp(x, -bounds, bounds); z = clamp(z, -bounds, bounds);
    if (!blocked(x, a.z)) a.x = x;
    if (!blocked(a.x, z)) a.z = z;
  }
  function add(id, data = {}) {
    const d = definitions[id];
    if (!d) throw new Error(`Unknown beta6 character: ${id}`);
    const a = { key: ++serial, id, d, u: beta6Ultimate(d, id), x: 0, z: 0, vx: 0, vz: 0, angle: 0,
      hp: d.maxHealth, ammo: d.maxAmmo ?? 3, reload: 0, next: random() * .2, charge: 0, index: 0,
      automatic: true, team: null, phase: random() * Math.PI * 2, slowUntil: 0, slow: 0,
      frozenUntil: 0, lockUntil: 0, guardUntil: 0, invulnerableUntil: 0, hiddenUntil: 0, revealedUntil: 0,
      focusUntil: 0, ice: 0, poisonUntil: 0, poisonNext: 0, zoneNext: 0, combatAt: 0, regenNext: 0,
      encoreUntil: 0, dodgeUntil: 0, dodgeYaw: 0, approachNext: 0, devices: [], castCount: 0, attackCount: 0, ...data };
    a.rounds = Array.from({ length: a.ammo }, () => rollRound(false));
    actors.push(a); return a;
  }
  function rollRound(focus) { const r = random(); return focus ? (r < 1 / 3 ? 'enhanced' : r < 2 / 3 ? 'cc' : 'plague') : r < .45 ? 'enhanced' : r < .9 ? 'cc' : r < .95 ? 'plague' : 'blank'; }
  function charge(a, amount = 1) { if (a.u && alive(a)) a.charge = Math.min(a.u.chargeRequired, a.charge + amount); }
  function hit(a, b, damage, basic = false, award = 1) {
    if (!alive(b) || damage <= 0 || time < b.invulnerableUntil || !enemies(a, b)) return 0;
    const dealt = Math.min(b.hp, damage * (time < b.guardUntil ? 1 - b.d.ultimate.damageReduction : 1));
    b.hp -= dealt; a.combatAt = b.combatAt = time;
    b.revealedUntil = a.revealedUntil = time + 3;
    emit('damage', { owner: a, target: b, amount: dealt });
    if (basic && dealt > 0) charge(a, award);
    if (dealt > 0 && b.d.ultimateChargeOnHit) charge(b, b.d.ultimateChargeOnHit);
    if (!alive(b) && time < b.encoreUntil) revive(b, b.encoreOwner);
    return dealt;
  }
  function revive(a, owner) {
    a.hp = a.d.maxHealth * owner.u.reviveHealthRatio; a.encoreUntil = 0;
    a.invulnerableUntil = time + owner.u.invulnerabilityDuration;
    emit('revive', { owner, target: a });
  }
  function ice(a, amount) {
    a.ice += amount;
    if (a.ice >= definitions.mint.freezeThreshold) { a.ice = 0; a.frozenUntil = time + definitions.mint.freezeDuration; emit('freeze', { target: a }); }
  }
  function knock(a, yaw, amount) {
    const applied = amount * (1 - clamp(a.d.knockbackResistance ?? 0, 0, 1));
    move(a, a.x + Math.cos(yaw) * applied, a.z + Math.sin(yaw) * applied);
  }
  function range(a) { const d = a.d; return d.attackRange ?? d.boomerangRange ?? d.bulletRange ?? d.bombRange ?? d.electricRange ?? d.spreadLineRange ?? d.needleRange ?? d.healCircleRange ?? d.stage1Range ?? d.iceCreamRange ?? d.chartreuseRange ?? d.iceBulletRange ?? d.crystalRange ?? d.surfLength; }
  function perceivedRange(a) { return a.d.attackPerceptionRange ?? range(a); }
  function shot(a, yaw, speed, reach, damage, extra = {}) {
    const spawn = extra.spawn ?? .6;
    const projectile = { key: ++serial, owner: a, x: a.x + Math.cos(yaw) * spawn, z: a.z + Math.sin(yaw) * spawn,
      origin: { x: a.x, z: a.z }, yaw, speed, reach, traveled: 0, damage, radius: .2, hits: new Set(), start: time,
      ultimate: false, kind: 'bullet', ...extra };
    projectile.radius = (a.d.projectileSize ?? PROJECTILE_SIZE) / 2;
    if (projectile.kind === 'wave') projectile.width = Math.max(PROJECTILE_SIZE, projectile.width ?? 0);
    projectiles.push(projectile);
    for (const b of actors) if (!['wave', 'gale'].includes(projectile.kind) && b.automatic && b.d.projectileDodgeDuration && enemies(a, b)
      && distance(a, b) <= (b.d.projectileDodgeDetectionRange ?? 20)) {
      b.dodgeUntil = time + b.d.projectileDodgeDuration;
      b.dodgeYaw = yaw + (random() < .5 ? -Math.PI / 2 : Math.PI / 2);
    }
  }
  function after(delay, owner, run) { scheduled.push({ at: time + delay, owner, run }); }
  function area(a, center, radius, damage, basic = false) { for (const b of actors) if (enemies(a, b) && distance(center, b) <= radius) hit(a, b, damage, basic); }
  function strike(a, b, yaw, reach, halfAngle, damage) {
    const dx = b.x - a.x, dz = b.z - a.z;
    const delta = Math.atan2(Math.sin(Math.atan2(dz, dx) - yaw), Math.cos(Math.atan2(dz, dx) - yaw));
    if (distance(a, b) <= reach && Math.abs(delta) <= halfAngle) hit(a, b, damage, true);
  }
  function fire(a, target, manualAngle) {
    if (!alive(a) || a.ammo <= 0 || time < a.next || time < a.lockUntil || time < a.frozenUntil || a.wave || a.dash) return false;
    const d = a.d, id = a.id;
    const speed = d.bulletSpeed ?? d.boomerangSpeed ?? d.bombSpeed ?? d.electricSpeed ?? d.needleSpeed ?? d.iceBulletSpeed ?? d.chartreuseSpeed ?? (id === 'azure' ? 10 : 20);
    const lead = distance(a, target) / speed * .65;
    let yaw = manualAngle ?? Math.atan2(target.z + target.vz * lead - a.z, target.x + target.vx * lead - a.x) + (random() * 2 - 1) * (options.aimError ?? .08);
    if (id === 'yellow' && a.devices.length >= 2) {
      const device = a.devices.find(p => distance(a, p) <= range(a));
      if (device) yaw = Math.atan2(device.z - a.z, device.x - a.x);
    }
    a.angle = yaw; a.ammo--; a.next = time + d.attackCooldown; a.combatAt = time; a.revealedUntil = time + 3; a.attackCount++;
    emit('attack', { owner: a, target, kind: id });
    const launch = (v, reach, amount, extra = {}, angle = yaw) => shot(a, angle, v, reach, amount, extra);
    if (id === 'red' || id === 'crimson') for (let i = 0; i < d.attackCount; i++) after(i * d.attackIntervalMs / 1000, a, () => {
      if (time < a.lockUntil || time < a.frozenUntil) return;
      for (const b of actors.filter(b => enemies(a, b))) strike(a, b, yaw + (d.attackAngles?.[i] ?? 0), d.attackRange, d.attackHalfAngle, d.attackDamages?.[i] ?? d.attackDamage);
    });
    else if (id === 'pink') {
      area(a, a, d.healCircleRange, d.healCircleDamage, true);
      for (const b of actors) if (b !== a && !enemies(a, b) && alive(b) && distance(a, b) <= d.healCircleRange) { b.hp = Math.min(b.d.maxHealth, b.hp + d.healCircleHeal); emit('heal', { owner: a, target: b }); }
    } else if (id === 'blue') launch(d.bulletSpeed, d.bulletRange, d.bulletDamage);
    else if (id === 'green') for (const offset of d.boomerangAngles) launch(d.boomerangSpeed, d.boomerangRange, d.boomerangDamage, { kind: 'boomerang', radius: .34, spawn: 0 }, yaw + offset);
    else if (id === 'orange') launch(d.bombSpeed, d.bombRange, d.bombDamage, { kind: 'bomb' });
    else if (id === 'yellow') launch(d.electricSpeed, d.electricRange, d.electricDamage, { kind: 'electric', start: time + d.attackDelay });
    else if (id === 'cyan') for (let i = 0; i < d.spreadLineCount; i++) launch(d.spreadLineSpeed, d.spreadLineRange, d.spreadLineDamage, {}, yaw + (i - (d.spreadLineCount - 1) / 2) * d.betaAngleSpacing);
    else if (id === 'purple') {
      if (a.index++ % 2) launch(d.vialSpeed, d.vialRange, d.vialDamage, { kind: 'vial' });
      else for (let i = 0; i < d.needleCount; i++) launch(d.needleSpeed, d.needleRange, d.needleDamage, { kind: 'needle' }, yaw + (i / (d.needleCount - 1) - .5) * d.needleSpreadAngle);
    } else if (id === 'gold') launch(d.stage1Speed, d.stage1Range, d.stage1Damage, { kind: 'gold', stage: 1, radius: d.stage1Size / 2, token: { hits: new Set(), charge: 0 }, spawn: 0 });
    else if (id === 'ivory') launch(d.iceCreamSpeed, Math.min(d.iceCreamRange, distance(a, target)), d.iceCreamDamage, { kind: 'ivory', start: time + .2, spawn: 0 });
    else if (id === 'chartreuse') {
      const kind = a.rounds.shift() ?? rollRound(time < a.focusUntil);
      a.rounds.push(rollRound(time < a.focusUntil));
      if (kind !== 'blank') launch(d.chartreuseSpeed, d.chartreuseRange, kind === 'enhanced' ? d.chartreuseEnhancedDamage : d.chartreuseDamage, { kind });
    } else if (id === 'mint') for (let i = 0; i < d.burstCount; i++) after(i * d.burstIntervalMs / 1000, a, () => {
      if (time >= a.frozenUntil && time >= a.lockUntil) launch(d.iceBulletSpeed, d.iceBulletRange, d.iceBulletDamage, { kind: 'mint' });
    });
    else if (id === 'azure') wave(a, yaw, false);
    else if (id === 'crystal') launch(d.crystalSpeed, d.crystalRange, d.crystalDamage, { kind: 'crystal', stage: 1, token: { hits: new Set() } });
    return true;
  }
  function wave(a, yaw, ultimate) {
    const d = a.d, u = a.u;
    shot(a, yaw, ultimate ? (u.speed ?? 8) : (d.surfSpeed ?? 10), ultimate ? u.range : d.surfLength, ultimate ? u.damage : d.surfDamage,
      { kind: 'wave', ultimate, width: ultimate ? u.width : d.surfWidth, ride: ultimate ? 0 : d.surfDashDistance, spawn: 0 });
    a.wave = true;
  }
  function cast(a, target, aim = {}) {
    const u = a.u;
    if (!u || !alive(a) || a.charge < u.chargeRequired || time < a.lockUntil || time < a.frozenUntil || a.wave || a.dash) return false;
    if (a.id === 'pink') {
      const allies = actors.filter(b => b !== a && !enemies(a, b) && distance(a, b) <= u.radius);
      if (!allies.length) return false;
      a.charge = 0;
      for (const b of allies) { if (!alive(b)) revive(b, a); else { b.encoreUntil = time + 12; b.encoreOwner = a; } }
    } else {
      if (!target || !alive(target) || hidden(target)) return false;
      const point = aim.point ?? target;
      const dist = distance(a, point);
      let yaw = aim.angle ?? Math.atan2(point.z - a.z, point.x - a.x);
      if (a.automatic && a.id === 'blue') {
        const healthRatio = a.hp / a.d.maxHealth;
        if (healthRatio < a.d.ultimateUseHealthMin || healthRatio > a.d.ultimateUseHealthMax) return false;
      }
      if (a.automatic && (a.id === 'gold' && dist > u.radius || ['azure', 'cyan', 'crimson'].includes(a.id) && dist > u.range)) return false;
      // 사거리 밖이거나 이미 분석당하는 적이면 충전을 쓰기 전에 물러난다
      if (a.id === 'crystal' && (dist > u.range || target.analysisOwner)) return false;
      if (a.automatic && a.id === 'green' && a.ammo > 0 && a.hp > a.d.maxHealth * .4) return false;
      // Spend the stored charge before resolving the skill so successful
      // ultimate hits can immediately begin charging the next ultimate.
      a.charge = 0;
      if (a.id === 'blue' && a.automatic && a.d.dashAwayFromTarget) yaw += Math.PI;
      a.angle = yaw;
      if (a.id === 'red') a.guardUntil = time + u.duration;
      else if (a.id === 'green') { a.hiddenUntil = time + u.duration; a.revealedUntil = 0; a.bush = { x: a.x, z: a.z }; }
      else if (a.id === 'blue') {
        a.dash = { yaw, until: time + u.duration, hits: new Set() };
        a.invulnerableUntil = Math.max(a.invulnerableUntil, time + u.duration);
      }
      else if (a.id === 'crimson') {
        for (const b of actors.filter(b => enemies(a, b))) {
          const dx = b.x - a.x, dz = b.z - a.z, front = dx * Math.cos(yaw) + dz * Math.sin(yaw);
          if (front >= 0 && front <= u.range && Math.abs(-dx * Math.sin(yaw) + dz * Math.cos(yaw)) <= u.width / 2) { hit(a, b, u.damage, true); knock(b, yaw, u.knockback); }
        }
      } else if (a.id === 'cyan') shot(a, yaw, a.d.spreadLineSpeed * u.speedMultiplier, u.range, u.damage, { kind: 'gale', ultimate: true, radius: u.projectileRadius });
      else if (a.id === 'gold') after(u.delay, a, () => zones.push({ key: ++serial, owner: a, kind: 'lock', until: time + u.duration, radius: u.radius }));
      else if (a.id === 'ivory') {
        const x = a.x + Math.cos(yaw) * Math.min(dist, u.castRange), z = a.z + Math.sin(yaw) * Math.min(dist, u.castRange), offset = u.patternRadius / Math.sqrt(2);
        for (const [ox, oz] of [[0, 0], [-offset, -offset], [-offset, offset], [offset, -offset], [offset, offset]]) {
          const dx = x + ox - a.x, dz = z + oz - a.z;
          shot(a, Math.atan2(dz, dx), a.d.iceCreamSpeed, Math.hypot(dx, dz), a.d.iceCreamDamage, { kind: 'ivory', ultimate: true });
        }
      } else if (a.id === 'chartreuse') a.focusUntil = time + u.duration;
      else if (a.id === 'mint') {
        const reach = Math.min(dist, u.castRange), center = { x: a.x + Math.cos(yaw) * reach, z: a.z + Math.sin(yaw) * reach };
        after(reach / 14 + .08, a, () => zones.push({ key: ++serial, ...center, owner: a, kind: 'mint', started: time, until: time + u.duration, next: time, radius: u.radius }));
      } else if (a.id === 'azure') wave(a, yaw, true);
      else if (a.id === 'crystal') {
        move(a, target.x - Math.cos(yaw) * 1.1, target.z - Math.sin(yaw) * 1.1);
        const until = time + u.analysisDuration;
        // 붙잡힌 쪽이 걸어 둔 분석은 풀린다 — 먼저 잡는 쪽이 이긴다
        if (target.analysisTarget) releaseAnalysis(target);
        a.lockUntil = target.lockUntil = until;
        a.analysisTarget = target; target.analysisOwner = a; target.analysisExpires = until;
        emit('analysis', { owner: a, target, expiresAt: until });
      }
      else if (a.id === 'yellow') {
        const offset = a.automatic ? (a.devices.length % 2 ? 2.5 : -2.5) : 0;
        const device = { x: point.x - Math.sin(yaw) * offset, z: point.z + Math.cos(yaw) * offset };
        const installTime = u.deviceThrowSpeed ? dist / u.deviceThrowSpeed + (u.deviceInstallDelay ?? 0) : 0;
        after(installTime, a, () => {
          a.devices.push(device);
          if (a.devices.length > u.maxDevices) a.devices.shift();
          emit('devicePlaced', { owner: a, device });
        });
      }
    }
    a.castCount++; emit('ultimate', { owner: a, target }); return true;
  }
  function finish(p) {
    const a = p.owner, d = a.d;
    if (p.kind === 'vial') area(a, p, d.vialSplashRadius, p.damage, true);
    if (p.kind === 'ivory') { area(a, p, d.iceCreamZoneRadius, p.damage, true); zones.push({ key: ++serial, x: p.x, z: p.z, owner: a, kind: 'ivory', ultimate: p.ultimate, radius: d.iceCreamZoneRadius, until: time + d.iceCreamZoneDuration, next: time + d.iceCreamZoneTickInterval }); }
    if (p.kind === 'bomb') for (let i = 0; i < d.bombSplashCount - (p.hits.size ? d.bombDirectHitJuiceCount : 0); i++) shot(a, i * Math.PI * 2 / d.bombSplashCount, d.bombSplashSpeed, d.bombSplashRange, d.bombSplashDamage, { x: p.x, z: p.z, radius: d.bombSplashHitRadius, kind: 'juice', hits: new Set(p.hits) });
    if (p.kind === 'gold' && p.stage < 3) {
      const stage = p.stage + 1;
      for (const offset of stage === 2 ? [-Math.PI / 2, Math.PI / 2] : Array.from({ length: 6 }, (_, i) => i * Math.PI / 3)) shot(a, p.yaw + offset, d[`stage${stage}Speed`], d[`stage${stage}Range`], d[`stage${stage}Damage`], { x: p.x, z: p.z, kind: 'gold', stage, token: p.token });
    }
    if (p.kind === 'crystal' && p.stage < 3) {
      const stage = p.stage + 1;
      const count = stage === 2 ? d.fragmentCount : d.shardCount;
      const damage = stage === 2 ? d.fragmentDamage : d.shardDamage;
      const speed = stage === 2 ? d.fragmentSpeed : d.shardSpeed;
      const reach = stage === 2 ? d.fragmentRange : d.shardRange;
      for (let i = 0; i < count; i++) shot(a, p.yaw + i * Math.PI * 2 / count, speed, reach, damage, { x: p.x, z: p.z, kind: 'crystal', stage, token: p.token, radius: stage === 2 ? .28 : .18 });
    }
    if (p.kind === 'wave') a.wave = false;
  }
  // 분석 속박 해제 — 한쪽이 쓰러지거나 사라지면 양쪽 모두 풀어 준다.
  function releaseAnalysis(a) {
    const target = a.analysisTarget;
    if (!target) return;
    target.analysisOwner = null; target.analysisExpires = 0; target.lockUntil = time;
    a.analysisTarget = null; a.lockUntil = time;
    emit('analysisReleased', { owner: a, target });
  }
  function tick(dt) {
    time += dt;
    for (const a of actors) {
      // 시전자가 쓰러져도 대상이 영원히 묶이지 않도록 죽음 검사보다 먼저 푼다
      if (a.analysisTarget && (!alive(a) || !alive(a.analysisTarget))) releaseAnalysis(a);
      if (!alive(a)) continue;
      if (a.analysisTarget) {
        const target = a.analysisTarget;
        if (time >= target.analysisExpires) { hit(a, target, target.hp); target.analysisOwner = null; a.analysisTarget = null; a.lockUntil = time; emit('analysisExecute', { owner: a, target }); }
      }
      if (options.suddenDeath && time >= options.suddenDeath.start) {
        const progress = clamp((time - options.suddenDeath.start) / Math.max(.001, options.suddenDeath.end - options.suddenDeath.start), 0, 1);
        const radius = options.suddenDeath.startRadius + (options.suddenDeath.endRadius - options.suddenDeath.startRadius) * progress;
        if (Math.hypot(a.x, a.z) > radius) {
          a.hp = Math.max(0, a.hp - a.d.maxHealth * options.suddenDeath.damagePerSecond * dt);
          emit('zoneDamage', { target: a, radius });
          if (!alive(a)) continue;
        }
      }
      const target = actors.filter(b => alive(b) && enemies(a, b) && !hidden(b)).sort((b, c) => distance(a, b) - distance(a, c))[0];
      a.target = target;
      if (a.automatic) cast(a, target);
      if (time < a.poisonUntil && time >= a.poisonNext) { hit(a.poisonOwner, a, a.poisonOwner.d.poisonDPS ?? definitions.purple.poisonDPS); a.poisonNext = time + 1; }
      if (a.ammo < (a.d.maxAmmo ?? 3) && time >= a.next) { a.reload += dt; if (a.reload >= a.d.reloadDuration) { a.ammo++; a.reload -= a.d.reloadDuration; } }
      else if (a.ammo >= (a.d.maxAmmo ?? 3)) a.reload = 0;
      if (!a.automatic || !target) continue;
      const destination = options.destination?.(a, target) ?? target;
      const previousX = a.x, previousZ = a.z;
      let dist = distance(a, destination), yaw = Math.atan2(destination.z - a.z, destination.x - a.x);
      // Azure's normal surf only reaches four tiles. Ranged bots retreat at the
      // same base speed, so an Azure bot otherwise never gets close enough to
      // use it. This bot-only approach surf closes distance without consuming
      // ammo, dealing damage, or charging the ultimate.
      if (a.id === 'azure' && destination === target && a.d.approachSurfRange
        && dist > range(a) + .5 && dist <= a.d.approachSurfRange && time >= a.approachNext
        && time >= a.lockUntil && time >= a.frozenUntil && !a.wave && !a.dash) {
        const travel = Math.min(a.d.approachSurfDistance, dist - range(a) * .75);
        move(a, a.x + Math.cos(yaw) * travel, a.z + Math.sin(yaw) * travel);
        a.approachNext = time + a.d.approachSurfCooldown;
        emit('approachSurf', { owner: a, target, distance: travel });
        dist = distance(a, destination);
        yaw = Math.atan2(destination.z - a.z, destination.x - a.x);
      }
      const ideal = destination !== target ? 0 : (({ red: 3.5, green: 2, crimson: 2, pink: 3, azure: 2.5 })[a.id] ?? perceivedRange(a) * .7);
      const retreatsAtLowHealth = a.hp <= a.d.maxHealth * .5 && !a.d.pursuesWhileLowHealth;
      const usesRangeBand = destination === target && Number.isFinite(a.d.attackPerceptionMinRange);
      const radial = retreatsAtLowHealth ? -.85 : usesRangeBand
        ? (dist > perceivedRange(a) ? .85 : dist < a.d.attackPerceptionMinRange ? -.85 : 0)
        : dist > ideal + .5 ? .85 : dist < ideal - .5 ? -.85 : 0;
      const strafe = Math.sin(time * 2.4 + a.phase) * .4;
      const dodging = time < a.dodgeUntil;
      const speed = 8 * a.d.moveSpeedMultiplier * (dodging ? a.d.projectileDodgeSpeedMultiplier ?? 1 : 1) * (time < a.slowUntil ? 1 - a.slow : 1) * (time < a.frozenUntil ? 0 : 1);
      const dodgeForward = a.d.projectileDodgeForwardFactor ?? 0;
      const dodgeScale = 1 / Math.hypot(1, dodgeForward);
      if (!a.wave && !a.dash && !hidden(a)) move(a,
        a.x + (dodging ? (Math.cos(a.dodgeYaw) + Math.cos(yaw) * dodgeForward) * dodgeScale : Math.cos(yaw) * radial - Math.sin(yaw) * strafe) * speed * dt,
        a.z + (dodging ? (Math.sin(a.dodgeYaw) + Math.sin(yaw) * dodgeForward) * dodgeScale : Math.sin(yaw) * radial + Math.cos(yaw) * strafe) * speed * dt);
      a.vx = (a.x - previousX) / dt; a.vz = (a.z - previousZ) / dt; a.angle = yaw;
      const attackDistance = destination === target ? dist : distance(a, target);
      if (!(hidden(a) && a.ammo < (a.d.maxAmmo ?? 3)) && attackDistance <= perceivedRange(a)) fire(a, target);
    }
    for (const a of actors) if (a.dash) {
      const dash = a.dash;
      if (!alive(a) || time >= dash.until || time < a.frozenUntil || time < a.lockUntil) { a.dash = null; continue; }
      const x = a.x + Math.cos(dash.yaw) * a.u.speed * dt, z = a.z + Math.sin(dash.yaw) * a.u.speed * dt;
      if (blocked(x, z) || Math.abs(x) > (options.bounds ?? 24) || Math.abs(z) > (options.bounds ?? 24)) dash.yaw += Math.PI;
      else move(a, x, z);
      for (const b of actors) if (enemies(a, b) && !dash.hits.has(b.key) && distance(a, b) <= a.u.hitRadius) { dash.hits.add(b.key); hit(a, b, a.u.damage, true); knock(b, dash.yaw, .65); }
    }
    for (let i = scheduled.length - 1; i >= 0; i--) if (scheduled[i].at <= time) { const event = scheduled.splice(i, 1)[0]; if (alive(event.owner)) event.run(); }
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i], a = p.owner, d = a.d;
      if (time < p.start) continue;
      if (p.kind === 'wave' && !alive(a)) { finish(p); projectiles.splice(i, 1); continue; }
      if (p.returning) p.yaw = Math.atan2(a.z - p.z, a.x - p.x);
      const before = { x: p.x, z: p.z }, advance = Math.min(p.speed * dt, p.returning ? Infinity : Math.max(0, p.reach - p.traveled));
      p.x += Math.cos(p.yaw) * advance; p.z += Math.sin(p.yaw) * advance; p.traveled += advance;
      const air = ['ivory', 'vial'].includes(p.kind);
      let ended = !p.returning && p.traveled >= p.reach;
      const hitWall = !air && !(p.kind === 'wave' && p.ultimate) && blocked(p.x, p.z, p.radius);
      if (hitWall) { ended = true; p.x = before.x; p.z = before.z; }
      if (p.kind === 'wave') move(a, p.origin.x + Math.cos(p.yaw) * Math.min(p.traveled, p.ride), p.origin.z + Math.sin(p.yaw) * Math.min(p.traveled, p.ride));
      if (p.kind === 'electric' && a.devices.some(v => segmentDistance(v, before, p) <= .8 + p.radius)) {
        for (let j = 0; j < a.devices.length - 1; j++) { const from = { ...a.devices[j] }, to = { ...a.devices[j + 1] }; after(j * .18, a, () => {
          for (const b of actors) if (enemies(a, b) && segmentDistance(b, from, to) <= a.u.connectionRadius + .85) { hit(a, b, a.u.connectionDamage, true); b.slowUntil = time + d.shockDuration; b.slow = d.shockSlowPercent; }
          emit('circuit', { owner: a, from, to });
        }); }
        projectiles.splice(i, 1); continue;
      }
      if (!air && !hitWall) for (const b of actors) {
        if (!alive(b) || !enemies(a, b) || p.hits.has(b.key)) continue;
        const touches = p.kind === 'wave' ? segmentDistance(b, before, p) <= .2 && Math.abs(-(b.x - p.x) * Math.sin(p.yaw) + (b.z - p.z) * Math.cos(p.yaw)) <= p.width / 2 : segmentDistance(b, before, p) <= .55 + p.radius;
        // A wave is a moving line segment, not a circular bullet.
        const waveTouches = p.kind === 'wave' && Math.abs((b.x - p.x) * Math.cos(p.yaw) + (b.z - p.z) * Math.sin(p.yaw)) <= advance + .15 && Math.abs(-(b.x - p.x) * Math.sin(p.yaw) + (b.z - p.z) * Math.cos(p.yaw)) <= p.width / 2;
        if (!touches && !waveTouches) continue;
        p.hits.add(b.key);
        let amount = p.kind === 'plague' ? b.hp : p.damage, award = 1;
        if (p.kind === 'boomerang') amount *= (p.traveled > d.boomerangFarThreshold ? d.boomerangFarMultiplier : 1) * (p.returning ? d.boomerangReturnDamageMultiplier : 1);
        if (p.kind === 'gold') { const key = `${b.key}:${p.stage}`; if (p.token.hits.has(key)) amount = 0; p.token.hits.add(key); award = Math.min([0, 3, 2, 1][p.stage], d.maxChargePerAttack - p.token.charge); p.token.charge += award; }
        if (p.kind === 'crystal') { const key = `${b.key}:${p.stage}`; if (p.token.hits.has(key)) amount = 0; p.token.hits.add(key); }
        amount = Math.max(0, amount - (b.d.projectileDamageReduction ?? 0));
        const dealt = hit(a, b, amount, true, award);
        if (dealt > 0) {
          b.lastDamageKind = p.kind;
          if (p.kind === 'needle') { b.poisonOwner = a; b.poisonUntil = time + d.poisonDuration; b.poisonNext = time + 1; }
          if (p.kind === 'mint') ice(b, d.icePerHit);
          if (a.id === 'blue' && !p.ultimate && d.bulletKnockback) knock(b, p.yaw, d.bulletKnockback);
          if (p.kind === 'electric') { b.slowUntil = time + d.shockDuration; b.slow = d.shockSlowPercent; }
          if (p.kind === 'gale' || p.kind === 'wave' && p.ultimate) knock(b, p.yaw, a.u.knockback / 9);
          if (p.kind === 'cc') { const effect = Math.floor(random() * 6); if (effect === 0 || effect === 5) { b.slowUntil = time + 2; b.slow = effect === 5 ? 1 : .35; } if (effect === 1 || effect === 5) b.lockUntil = time + 2; if (effect === 2) b.frozenUntil = time + 2; if (effect === 3) { b.poisonOwner = a; b.poisonUntil = time + 4; b.poisonNext = time + 1; } if (effect === 4) knock(b, p.yaw, 3.5); }
          if (p.kind === 'bomb') hit(a, b, d.bombSplashDamage * d.bombDirectHitJuiceCount);
        }
        if (!['wave', 'gale', 'boomerang'].includes(p.kind)) { ended = true; break; }
      }
      if (p.kind === 'boomerang') {
        if (!p.returning && (ended || p.hits.size)) { p.returning = true; p.hits.clear(); p.traveled = 0; p.speed *= d.boomerangReturnSpeedMultiplier; ended = false; }
        else if (p.returning) ended = !alive(a) || distance(p, a) < .7;
      }
      if (ended) { finish(p); projectiles.splice(i, 1); }
    }
    for (let i = zones.length - 1; i >= 0; i--) {
      const zone = zones[i], a = zone.owner;
      if (time >= zone.until) { zones.splice(i, 1); continue; }
      const center = zone.kind === 'lock' ? a : zone;
      for (const b of actors) if (alive(b) && enemies(a, b) && distance(center, b) <= zone.radius) {
        if (zone.kind === 'lock' && alive(a)) { b.lockUntil = time + .05; b.slowUntil = time + .05; b.slow = .5; }
        if (zone.kind === 'mint') { if (time >= zone.next) { hit(a, b, a.u.damagePerSecond, true); ice(b, a.u.icePerSecond); } if (time >= b.frozenUntil) knock(b, Math.atan2(b.z - zone.z, b.x - zone.x), (a.u.slideStrength + a.u.slideAcceleration * (time - zone.started)) * dt); }
        if (zone.kind === 'ivory') {
          if (time >= zone.next && time >= b.zoneNext) { hit(a, b, a.d.iceCreamDamage, true); b.zoneNext = time + a.d.iceCreamZoneTickInterval; }
        }
      }
      if (time >= zone.next) zone.next = time + (zone.kind === 'ivory' ? a.d.iceCreamZoneTickInterval : 1);
    }
  }
  return { actors, projectiles, zones, add, fire, cast, hit, hidden, range, get time() { return time; },
    update(dt) { let remaining = Math.min(.25, Math.max(0, dt)); while (remaining > 1e-9) { const step = Math.min(1 / 60, remaining); tick(step); remaining -= step; } },
    remove(actor) {
      // 사라지는 액터가 걸어 둔 속박도 함께 푼다
      if (actor.analysisTarget) releaseAnalysis(actor);
      if (actor.analysisOwner) releaseAnalysis(actor.analysisOwner);
      const index = actors.indexOf(actor); if (index >= 0) actors.splice(index, 1);
      for (const list of [projectiles, zones, scheduled]) for (let i = list.length - 1; i >= 0; i--) if (list[i].owner === actor) list.splice(i, 1);
    },
    clear() { actors.length = projectiles.length = zones.length = scheduled.length = 0; },
  };
}
