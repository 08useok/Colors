import { createSalmonCombat } from "./salmon-combat.js?v=1";
// Browser-independent combat used by beta6 bots and the matchup runner.
import { beta6Ultimate } from '../config/beta6-balance.js';
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
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
  const enemies = (a, b) => a !== b && a.owner !== b && b.owner !== a && !(a.owner && a.owner === b.owner) && (a.team == null || b.team !== a.team);
  const alive = a => a.hp > 0;
  const hidden = (a,observer) => time >= a.revealedUntil && ((time < a.hiddenUntil && distance(a, a.bush || a) <= (a.u?.radius ?? 0)) || (observer && options.bushAt?.(a.x,a.z) && distance(a,observer)>3));
  const blocked = (x, z, radius = .55) => options.blocked?.(x, z, radius) ?? false;
  function move(a, x, z) {
    const bounds = options.bounds ?? 24;
    x = clamp(x, -bounds, bounds); z = clamp(z, -bounds, bounds);
    if (!blocked(x, a.z) && !salmon.moveBlocked(a, x, a.z)) a.x = x;
    if (!blocked(a.x, z) && !salmon.moveBlocked(a, a.x, z)) a.z = z;
  }
  function add(id, data = {}) {
    const d = definitions[id];
    if (!d) throw new Error(`Unknown beta6 character: ${id}`);
    const a = { key: ++serial, id, d, u: beta6Ultimate(d, id), x: 0, z: 0, vx: 0, vz: 0, angle: 0,
      hp: d.maxHealth, ammo: d.maxAmmo ?? 3, reload: 0, next: random() * .2, charge: 0, index: 0,
      automatic: true, team: null, phase: random() * Math.PI * 2, slowUntil: 0, slow: 0,
      frozenUntil: 0, lockUntil: 0, guardUntil: 0, invulnerableUntil: 0, hiddenUntil: 0, revealedUntil: 0,
      focusUntil: 0, ice: 0, poisonUntil: 0, poisonNext: 0, zoneNext: 0, combatAt: 0, regenNext: 0,
      encoreUntil: 0, dodgeUntil: 0, dodgeYaw: 0, approachNext: 0, devices: [], leap: null, castCount: 0, attackCount: 0, ...data };
    a.rounds = Array.from({ length: a.ammo }, () => rollRound(false));
    actors.push(a); return a;
  }
  function rollRound(focus) { const r = random(); return focus ? (r < 1 / 3 ? 'enhanced' : r < 2 / 3 ? 'cc' : 'plague') : r < .45 ? 'enhanced' : r < .9 ? 'cc' : r < .95 ? 'plague' : 'blank'; }
  function charge(a, amount = 1) { if (a.u && alive(a)) a.charge = Math.min(a.u.chargeRequired, a.charge + amount); }
  function damageReductionFor(a) {
    const guard=time<a.guardUntil?(a.u?.damageReduction??a.d.ultimate?.damageReduction??0):0;
    const rolling=(a.dash&&time<a.dash.until)||(a.ultimatePreparing&&a.u?.guardDuringPreparation);
    const dash=alive(a)&&!a.salmonAirborne&&time>=a.lockUntil&&time>=a.frozenUntil&&rolling?(a.u?.damageReduction??0):0;
    return clamp(Math.max(guard,dash),0,1);
  }
  function hit(a, b, damage, basic = false, award = 1, ultimate = false, bypassGuard = false) {
    if (!alive(b) || damage <= 0 || time < b.invulnerableUntil || !enemies(a, b)) return 0;
    const dealt = Math.min(b.hp, damage * (bypassGuard?1:1-damageReductionFor(b)));
    b.hp -= dealt; a.combatAt = b.combatAt = time;
    b.revealedUntil = a.revealedUntil = time + 3;
    emit('damage', { owner: a, target: b, amount: dealt });
    if (basic && dealt > 0 && !b.isSalmonDevice) charge(a, award * (ultimate ? 1 : (a.d.basicUltimateChargeMultiplier ?? 1)));
    if (dealt > 0 && b.d.ultimateChargeOnHit) charge(b, b.d.ultimateChargeOnHit);
    if (!alive(b) && time < b.encoreUntil) revive(b, b.encoreOwner);
    return dealt;
  }
  function revive(a, owner) {
    if (options.allowRevives === false) return;
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
    // Preserve the authored radius of peels, fragments and boomerangs.
    // Character size overrides apply only to ordinary bullets.
    if (a.d.projectileSize != null && ['bullet', 'enhanced', 'cc', 'plague'].includes(projectile.kind)) {
      projectile.radius = a.d.projectileSize / 2;
    }
    if(a.id==='blue'&&!projectile.ultimate&&projectile.kind==='bullet')projectile.radius*=a.d.bulletHitboxMultiplier??1;
    projectiles.push(projectile);
    for (const b of actors) if (!['wave', 'gale'].includes(projectile.kind) && b.automatic && b.d.projectileDodgeDuration
      && (!b.d.projectileDodgeKinds || b.d.projectileDodgeKinds.includes(projectile.kind)) && enemies(a, b)
      && distance(a, b) <= (b.d.projectileDodgeDetectionRange ?? 20)) {
      if (time < (b.dodgeNext ?? 0)) continue;
      if (b.d.projectileDodgeThreatOnly) {
        const end = { x: projectile.x + Math.cos(yaw) * reach, z: projectile.z + Math.sin(yaw) * reach };
        if (segmentDistance(b, projectile, end) > projectile.radius + .55) continue;
      }
      // Consume this reaction opportunity even on failure: a multi-shot volley
      // must not roll repeatedly until the nominal 50% chance becomes certain.
      b.dodgeNext = time + (b.d.projectileDodgeCooldown ?? 0);
      if (b.d.projectileDodgeChance != null && random() >= b.d.projectileDodgeChance) continue;
      b.dodgeUntil = time + b.d.projectileDodgeDuration;
      b.dodgeYaw = yaw + (random() < .5 ? -Math.PI / 2 : Math.PI / 2);
    }
  }
  function purpleLeapBurst(a, position, phase) {
    const u = a.u;
    if (u.projectileCount) {
      const burstChargeHits = new Set();
      for (const b of actors) if (enemies(a, b) && distance(position, b) <= u.radius) {
        hit(a, b, u.damage, true, u.rechargePerHit ?? 1, true);
      }
      for (let i = 0; i < u.projectileCount; i++) {
        shot(a, a.angle + i * Math.PI * 2 / u.projectileCount, u.projectileSpeed, u.projectileRange ?? u.radius, u.projectileDamage,
          { kind: 'purpleThorn', ultimate: true, radius: u.projectileRadius, spawn: 0,
            x: position.x, z: position.z, origin: { ...position }, burstChargeHits });
      }
    } else area(a, position, u.radius, u.damage, true, u.rechargePerHit ?? 1, true);
    emit('purpleLeap', { owner: a, phase, position });
  }
  function after(delay, owner, run, ultimateField = false) { scheduled.push({ at: time + delay, owner, run, ultimateField }); }
  function ultimateFieldActive(a) {
    return scheduled.some(event => event.owner === a && event.ultimateField)
      || zones.some(zone => zone.owner === a && time + 1e-9 < zone.until
        && ['fragrance', 'lock'].includes(zone.kind));
  }
  function area(a, center, radius, damage, basic = false, award = 1, ultimate = false) { for (const b of actors) if (enemies(a, b) && distance(center, b) <= radius) hit(a, b, damage, basic, award, ultimate); }
  function strike(a, b, yaw, reach, halfAngle, damage) {
    const dx = b.x - a.x, dz = b.z - a.z;
    const delta = Math.atan2(Math.sin(Math.atan2(dz, dx) - yaw), Math.cos(Math.atan2(dz, dx) - yaw));
    if (distance(a, b) <= reach && Math.abs(delta) <= halfAngle) hit(a, b, damage, true);
  }
  // Tactical walking around visible burst/control trajectories; this does not reroll
  // the separate common projectile-dodge chance or grant movement speed.
  function burstEvasion(a,speed) {
    if((!a.d.botAvoidBurstProjectiles&&!a.d.botAvoidControlProjectiles&&!a.d.botAvoidVolleyProjectiles) || time<a.lockUntil || time<a.frozenUntil)return null;
    const lookAhead=a.d.botPathLookAhead??.9,safety=a.d.botPathSafetyMargin??.3,directions=a.d.botPathDirections??16;
    const visible=p=>{
      if(!options.blocked)return true;
      const gap=distance(a,p);for(let step=.25;step<gap;step+=.25){const t=step/gap;if(blocked(a.x+(p.x-a.x)*t,a.z+(p.z-a.z)*t,.05))return false;}return true;
    };
    const threats=projectiles.filter(p=>((a.d.botAvoidBurstProjectiles&&['bomb','juice'].includes(p.kind))||(a.d.botAvoidControlProjectiles&&p.control)||(a.d.botAvoidVolleyProjectiles&&p.formation==='parallel'))&&enemies(a,p.owner)&&time>=p.start
      && distance(a,p)<(p.speed+speed)*lookAhead+p.radius+.55&&visible(p));
    for(const p of [...threats])if(p.kind==='bomb'){
      const remaining=Math.max(0,p.reach-p.traveled),delay=remaining/p.speed;
      if(delay>lookAhead)continue;
      for(let i=0;i<p.owner.d.bombSplashCount;i++)threats.push({x:p.x+Math.cos(p.yaw)*remaining,z:p.z+Math.sin(p.yaw)*remaining,
        yaw:i*Math.PI*2/p.owner.d.bombSplashCount,speed:p.owner.d.bombSplashSpeed,reach:p.owner.d.bombSplashRange,traveled:0,radius:p.owner.d.bombSplashHitRadius,predictDelay:delay});
    }
    const clearance=(p,vx,vz)=>{const delay=p.predictDelay??0,dx=p.x-a.x-Math.cos(p.yaw)*p.speed*delay,dz=p.z-a.z-Math.sin(p.yaw)*p.speed*delay,rx=Math.cos(p.yaw)*p.speed-vx,rz=Math.sin(p.yaw)*p.speed-vz;
      const horizon=Math.min(lookAhead,delay+Math.max(0,p.reach-p.traveled)/p.speed);
      const t=clamp(-(dx*rx+dz*rz)/(rx*rx+rz*rz||1),delay,horizon);
      return Math.hypot(dx+rx*t,dz+rz*t)-p.radius-.55;};
    if(!threats.some(p=>clearance(p,a.vx,a.vz)<safety))return null;
    let best=null,bestScore=-Infinity;
    for(let i=0;i<directions;i++){const yaw=i*Math.PI*2/directions,x=Math.cos(yaw),z=Math.sin(yaw);let clear=true;
      for(let t=.05;t<=lookAhead;t+=.05){const nx=a.x+x*speed*t,nz=a.z+z*speed*t;
        if(Math.abs(nx)>(options.bounds??24)||Math.abs(nz)>(options.bounds??24)||blocked(nx,nz)){clear=false;break;}}
      if(!clear)continue;
      const score=Math.min(...threats.map(p=>clearance(p,x*speed,z*speed)));
      if(score>bestScore){bestScore=score;best={x,z};}
    }return best;
  }
  function landingEvasion(a, speed) {
    if (!a.d.botAvoidLandingZones || time < a.lockUntil || time < a.frozenUntil) return null;
    const threats=[];
    for(const p of projectiles) if(p.kind==='ivory' && alive(p.owner) && enemies(a,p.owner)) {
      const remaining=Math.max(0,p.reach-p.traveled);
      const eta=Math.max(0,p.start-time)+remaining/p.speed;
      const center={x:p.x+Math.cos(p.yaw)*remaining,z:p.z+Math.sin(p.yaw)*remaining};
      const radius=p.owner.d.iceCreamZoneRadius;
      if(eta<=1.2 && distance(a,center)<radius+speed*eta+.5)
        threats.push({...center,radius,eta:Math.max(1/60,eta),key:p.key,ultimate:p.ultimate});
    }
    // Include every field reachable during the escape horizon. A fixed narrow
    // margin toggled a neighboring field in/out every frame and reversed dodges.
    for(const zone of zones) if(zone.kind==='ivory' && enemies(a,zone.owner) && zone.until>time
      && distance(a,zone)<zone.radius+speed*.3+1.2)
      threats.push({x:zone.x,z:zone.z,radius:zone.radius,eta:.3,key:zone.key,ultimate:zone.ultimate});
    if(!threats.length)return null;
    const bounds=options.bounds??24;
    let best=null,bestScore=-Infinity;
    for(let i=0;i<16;i++) {
      const yaw=i*Math.PI/8,dx=Math.cos(yaw),dz=Math.sin(yaw);
      // Check the whole path so a dodge never crosses a solid wall.
      const horizon=Math.max(...threats.map(t=>t.eta));
      let clear=true;
      for(let t=.05;t<=horizon+.05;t+=.05) {
        const x=clamp(a.x+dx*speed*t,-bounds,bounds),z=clamp(a.z+dz*speed*t,-bounds,bounds);
        if(blocked(x,z)){clear=false;break;}
      }
      if(!clear)continue;
      const score=Math.min(...threats.map(t=>Math.hypot(
        clamp(a.x+dx*speed*t.eta,-bounds,bounds)-t.x,
        clamp(a.z+dz*speed*t.eta,-bounds,bounds)-t.z)-t.radius));
      if(score>bestScore){bestScore=score;best={x:dx,z:dz,yaw};}
    }
    if(best) {
      const key=threats.map(t=>t.key).join(':');
      if(a.lastLandingThreat!==key)emit('landingDodge',{owner:a,ultimate:threats.some(t=>t.ultimate),clearance:bestScore});
      a.lastLandingThreat=key;
    }
    return best;
  }
  function ultimateEvasion(a) {
    if(time<a.lockUntil||time<a.frozenUntil)return null;
    const caster=actors.find(b=>alive(b)&&enemies(a,b)&&b.ultimatePreparing&&b.ultimateTelegraph&&!hidden(b,a)
      &&time>=b.ultimateTelegraph.startedAt+(b.u.telegraphReaction??.15)&&time<b.ultimateTelegraph.endsAt
      &&(b.ultimateTelegraph.targetKey===a.key||a.telegraphAvoid?.key===b.key||(()=>{const t=b.ultimateTelegraph,dx=a.x-t.x,dz=a.z-t.z;return dx*Math.cos(t.yaw)+dz*Math.sin(t.yaw)>=-1&&dx*Math.cos(t.yaw)+dz*Math.sin(t.yaw)<=t.range+1&&Math.abs(-dx*Math.sin(t.yaw)+dz*Math.cos(t.yaw))<=t.width/2+.85;})()));
    if(!caster){
      if(a.telegraphAvoid&&time<a.telegraphAvoid.until){const owner=actors.find(b=>b.key===a.telegraphAvoid.key);if(owner&&alive(owner)){const dx=a.x-owner.x,dz=a.z-owner.z,length=Math.hypot(dx,dz)||1;return{x:dx/length,z:dz/length};}}
      a.telegraphAvoid=null;return null;
    }
    const t=caster.ultimateTelegraph,dx=a.x-t.x,dz=a.z-t.z,cross=-dx*Math.sin(t.yaw)+dz*Math.cos(t.yaw);
    if(a.telegraphAvoid?.key!==caster.key||a.telegraphAvoid.startedAt!==t.startedAt){a.telegraphAvoid={key:caster.key,startedAt:t.startedAt,until:t.endsAt+(caster.u.telegraphEscapeDuration??3),side:Math.abs(cross)>.1?Math.sign(cross):(Math.cos(a.phase)>=0?1:-1)};emit('ultimateEvade',{owner:a,target:caster});}
    const away=t.yaw+a.telegraphAvoid.side*(caster.u.telegraphEscapeAngle??Math.PI/2),speed=8*a.d.moveSpeedMultiplier,horizon=Math.min(.4,t.endsAt-time);
    for(const angle of [away,away+Math.PI/4,away-Math.PI/4,away+Math.PI/2,away-Math.PI/2]){const x=Math.cos(angle),z=Math.sin(angle);let clear=true;for(let step=.05;step<horizon+.05;step+=.05){const nx=a.x+x*speed*step,nz=a.z+z*speed*step;if(Math.abs(nx)>(options.bounds??24)||Math.abs(nz)>(options.bounds??24)||blocked(nx,nz)){clear=false;break;}}if(clear)return{x,z};}

    for(const side of [a.telegraphAvoid.side,-a.telegraphAvoid.side]){
      const x=-Math.sin(t.yaw)*side,z=Math.cos(t.yaw)*side,horizon=Math.min(.4,t.endsAt-time),speed=8*a.d.moveSpeedMultiplier;
      let clear=true;for(let step=.05;step<horizon+.05;step+=.05){const nx=a.x+x*speed*step,nz=a.z+z*speed*step;if(Math.abs(nx)>(options.bounds??24)||Math.abs(nz)>(options.bounds??24)||blocked(nx,nz)){clear=false;break;}}
      if(clear){a.telegraphAvoid.side=side;return{x,z};}
    }
    return {x:-Math.cos(t.yaw),z:-Math.sin(t.yaw)};
  }
  function interceptTime(a,target,speed){
    const x=target.x-a.x,z=target.z-a.z,vx=target.vx??0,vz=target.vz??0,A=vx*vx+vz*vz-speed*speed,B=2*(x*vx+z*vz),C=x*x+z*z;
    const discriminant=B*B-4*A*C;if(discriminant<0)return Math.sqrt(C)/speed;
    if(Math.abs(A)<1e-8)return B<0?-C/B:Math.sqrt(C)/speed;
    const roots=[(-B-Math.sqrt(discriminant))/(2*A),(-B+Math.sqrt(discriminant))/(2*A)].filter(t=>t>=0);
    return roots.length?Math.min(...roots):Math.sqrt(C)/speed;
  }
  function fire(a, target, manualAngle) {
    if (a.id === 'salmon' && !a.isSalmonDevice) return salmon.fire(a, target);
    if (a.ultimatePreparing || !alive(a) || a.ammo <= 0 || time < a.next || time < a.lockUntil || time < a.frozenUntil || a.wave || a.dash || a.leap) return false;
    const d = a.d, id = a.id;
    const speed = id === 'purple' && a.index % 2 ? d.vialSpeed : (d.bulletSpeed ?? d.boomerangSpeed ?? d.bombSpeed ?? d.electricSpeed ?? d.needleSpeed ?? d.iceBulletSpeed ?? d.chartreuseSpeed ?? (id === 'azure' ? 10 : 20));
    const windupLead = a.automatic ? (d.attackWindup ?? 0) * (d.botAimWindupLeadFactor ?? 0) : 0;
    const lead = distance(a, target) / speed * (a.automatic ? d.botAimLeadFactor ?? .65 : .65) + windupLead;
    const initialAimYaw=Math.atan2(target.z + target.vz * lead - a.z - a.vz * windupLead, target.x + target.vx * lead - a.x - a.vx * windupLead);
    let yaw = manualAngle ?? initialAimYaw + (random() * 2 - 1) * (options.aimError ?? .08);
    const yawError=yaw-initialAimYaw;
    if (id === 'yellow' && a.automatic && manualAngle == null && a.devices.length >= 2) {
      const device = a.devices.filter(p => distance(a, p) <= range(a)).sort((b,c)=>distance(a,b)-distance(a,c))[0];
      if (device) yaw = Math.atan2(device.z - a.z, device.x - a.x);
    }
    a.angle = yaw; a.ammo--; a.next = time + d.attackCooldown; a.combatAt = time; a.revealedUntil = time + 3; a.attackCount++;
    emit('attack', { owner: a, target, kind: id });
    const resolveAttack = () => {
    if (!alive(a) || time < a.lockUntil || time < a.frozenUntil || a.salmonAirborne) return;
    if(a.automatic&&d.botTrackTargetDuringWindup&&manualAngle==null&&alive(target)&&!hidden(target,a)){
      const releaseLead=(d.botAimIntercept?interceptTime(a,target,speed):distance(a,target)/speed)*(d.botAimLeadFactor??.65);
      yaw=Math.atan2(target.z+target.vz*releaseLead-a.z,target.x+target.vx*releaseLead-a.x)+yawError;
      a.angle=yaw;
    }
    const launch = (v, reach, amount, extra = {}, angle = yaw) => shot(a, angle, v, reach, amount, extra);
    if (id === 'lavender') {
      zones.push({ key: ++serial, owner: a, kind: 'perfumeSpray', x: a.x, z: a.z, yaw, radius: d.attackRange,
        halfAngle: d.sprayAngle / 2, startedAt: time, spraySpeed: d.spraySpeed,
        until: time + d.attackRange / d.spraySpeed + d.sprayDuration, hits: new Map(),
        next: time, tickInterval: d.sprayTickInterval, damage: d.sprayDamage });
    } else if (id === 'red' || id === 'crimson') for (let i = 0; i < d.attackCount; i++) after(i * d.attackIntervalMs / 1000, a, () => {
      if (time < a.lockUntil || time < a.frozenUntil) return;
      for (const b of actors.filter(b => enemies(a, b))) strike(a, b, yaw + (d.attackAngles?.[i] ?? 0), d.attackRange, d.attackHalfAngle, d.attackDamages?.[i] ?? d.attackDamage);
    });
    else if (id === 'pink') {
      area(a, a, d.healCircleRange, d.healCircleDamage, true);
      for (const b of actors) if (b !== a && !enemies(a, b) && alive(b) && distance(a, b) <= d.healCircleRange) { const before = b.hp; b.hp = Math.min(b.d.maxHealth, b.hp + d.healCircleHeal); emit('heal', { owner: a, target: b, amount: b.hp - before }); }
    } else if (id === 'blue') launch(d.bulletSpeed, d.bulletRange, d.bulletDamage);
    else if (id === 'green') for (const offset of d.boomerangAngles) launch(d.boomerangSpeed, d.boomerangRange, d.boomerangDamage, { kind: 'boomerang', radius: .34, spawn: 0 }, yaw + offset);
    else if (id === 'orange') launch(d.bombSpeed, d.bombRange, d.bombDamage, { kind: 'bomb' });
    else if (id === 'yellow') launch(d.electricSpeed, d.electricRange, d.electricDamage, { kind: 'electric', control:'shock', start: time + (d.attackWindup ? 0 : d.attackDelay) });
    else if (id === 'cyan') for (let i = 0; i < d.spreadLineCount; i++) {
      const offset = (i - (d.spreadLineCount - 1) / 2) * (d.spreadLineSpacing ?? .75);
      launch(d.spreadLineSpeed, d.spreadLineRange, d.spreadLineDamage, { x: a.x + Math.cos(yaw) * .6 - Math.sin(yaw) * offset, z: a.z + Math.sin(yaw) * .6 + Math.cos(yaw) * offset, formation:'parallel' });
    }
    else if (id === 'purple') {
      if (a.index++ % 2) launch(d.vialSpeed, d.vialRange, d.vialDamage, { kind: 'vial' });
      else for (let i = 0; i < d.needleCount; i++) launch(d.needleSpeed, d.needleRange, d.needleDamage, { kind: 'needle' }, yaw + (i / (d.needleCount - 1) - .5) * d.needleSpreadAngle);
    } else if (id === 'gold') launch(d.stage1Speed, d.stage1Range, d.stage1Damage, { kind: 'gold', stage: 1, radius: d.stage1Size / 2, token: { hits: new Set(), charge: 0 }, spawn: 0 });
    else if (id === 'ivory') launch(d.iceCreamSpeed, Math.min(d.iceCreamRange, distance(a, target)), d.iceCreamDamage, { kind: 'ivory', start: time + (d.attackWindup ? 0 : .2), spawn: 0 });
    else if (id === 'chartreuse') {
      const kind = a.rounds.shift() ?? rollRound(time < a.focusUntil);
      a.rounds.push(rollRound(time < a.focusUntil));
      if (kind !== 'blank') launch(d.chartreuseSpeed, d.chartreuseRange, (kind === 'enhanced' ? d.chartreuseEnhancedDamage : d.chartreuseDamage) * (time < a.focusUntil ? a.u.damageMultiplier ?? 1 : 1), { kind, control:kind==='cc'?'crowdControl':kind==='plague'?'execute':undefined });
    } else if (id === 'mint') for (let i = 0; i < d.burstCount; i++) after(i * d.burstIntervalMs / 1000, a, () => {
      if (time >= a.frozenUntil && time >= a.lockUntil) launch(d.iceBulletSpeed, d.iceBulletRange, d.iceBulletDamage, { kind: 'mint', control: 'ice' });
    });
    else if (id === 'azure') wave(a, yaw, false);
    else if (id === 'crystal') launch(d.crystalSpeed, d.crystalRange, d.crystalDamage, { kind: 'crystal', stage: 1, token: { hits: new Set() }, homingTarget: target });
    };
    if (d.attackWindup > 0) after(d.attackWindup, a, resolveAttack); else resolveAttack();
    return true;
  }
  function wave(a, yaw, ultimate) {
    const d = a.d, u = a.u;
    shot(a, yaw, ultimate ? (u.speed ?? 8) : (d.surfSpeed ?? 10), ultimate ? u.range : d.surfLength, ultimate ? u.damage : d.surfDamage,
      { kind: 'wave', ultimate, width: ultimate ? u.width : d.surfWidth, ride: ultimate ? 0 : d.surfDashDistance, spawn: 0 });
    a.wave = true;
  }
  function beginUltimate(a, target, resolve) {
    a.charge = 0; a.castCount++;
    const delay = a.u.motionWindup ?? 0;
    if (delay > 0) {
      a.ultimatePreparing = true;
      if (a.id === 'crystal' && a.u.telegraphWidth) {
        a.ultimateTelegraph = {x:a.x,z:a.z,yaw:a.angle,range:Math.min(a.u.range,distance(a,target)),width:a.u.telegraphWidth,startedAt:time,endsAt:time+delay,targetKey:target.key};
        a.revealedUntil=Math.max(a.revealedUntil,time+delay+.3);
      }
      emit('ultimatePrepare', { owner: a, target });
      after(delay, a, () => {
        const telegraph=a.ultimateTelegraph;
        a.ultimatePreparing = false; a.ultimateTelegraph=null;
        if (!alive(a) || time < a.lockUntil || time < a.frozenUntil || time < (a.airborneUntil ?? 0)) return;
        if (a.id === 'crystal' && (!alive(target) || target.analysisOwner)) return;
        if (telegraph) {
          const dx=target.x-telegraph.x,dz=target.z-telegraph.z;
          const front=dx*Math.cos(telegraph.yaw)+dz*Math.sin(telegraph.yaw),cross=-dx*Math.sin(telegraph.yaw)+dz*Math.cos(telegraph.yaw);
          if(front<-.55||front>telegraph.range+.55||Math.abs(cross)>telegraph.width/2+.55){
            move(a,telegraph.x+Math.cos(telegraph.yaw)*telegraph.range,telegraph.z+Math.sin(telegraph.yaw)*telegraph.range);
            emit('ultimateMiss',{owner:a,target});emit('ultimate',{owner:a,target,miss:true});return;
          }
        }
        resolve(); emit('ultimate', { owner: a, target });
      });
    } else { resolve(); emit('ultimate', { owner: a, target }); }
    return true;
  }
  function cast(a, target, aim = {}) {
    const u = a.u;
    if (a.id === 'salmon' && !a.isSalmonDevice) return salmon.cast(a, aim.point ?? target);
    if (a.ultimatePreparing || !u || !alive(a) || a.charge < u.chargeRequired || ultimateFieldActive(a) || time < a.lockUntil || time < a.frozenUntil || a.wave || a.dash || a.leap) return false;
    if (a.automatic && u.knockback > 0 && Number.isFinite(a.d.botKnockbackUltimateTankRange)) {
      target = actors.filter(b=>alive(b)&&enemies(a,b)&&!b.isSalmonDevice&&b.d.botTankTarget&&!hidden(b,a)
        &&distance(a,b)<=Math.min(a.d.botKnockbackUltimateTankRange,u.range??Infinity))
        .sort((b,c)=>distance(a,b)-distance(a,c)||b.key-c.key)[0];
      if (!target) return false;
      aim = {};
    }
    if (a.id === 'pink') {
      if (options.allowRevives === false) return false;
      const allies = actors.filter(b => b !== a && !enemies(a, b) && distance(a, b) <= u.radius);
      if (!allies.length) return false;
      return beginUltimate(a, target, () => {
      for (const b of allies) { if (!alive(b)) revive(b, a); else { b.encoreUntil = time + 12; b.encoreOwner = a; } }
      });
    } else {
      if (!target || !alive(target) || hidden(target,a)) return false;
      const point = aim.point ?? target;
      const dist = distance(a, point);
      let yaw = aim.angle ?? Math.atan2(point.z - a.z, point.x - a.x);
      if (a.id === 'purple' && aim.point) yaw = Math.atan2(point.z - a.z, point.x - a.x);
      if(a.automatic&&a.id==='purple'&&a.d.botSmartUltimate){
        const lowHealth=a.hp/a.d.maxHealth<=.35;
        const poisonTicks=target.poisonOwner===a&&target.poisonUntil>time?Math.max(0,Math.ceil(target.poisonUntil-Math.max(time,target.poisonNext)-1e-9)):0;
        if(lowHealth&&poisonTicks*(a.d.poisonDPS??0)>=target.hp)return false;
        if(target.hp<=a.d.needleDamage&&dist<=a.d.needleRange)return false;
        const eta=(u.motionWindup??0)+u.duration;
        const predicted=Math.hypot(target.x+target.vx*eta-a.x,target.z+target.vz*eta-a.z);
        if(predicted>u.range+u.radius&&dist>u.radius)return false;
      }
      if (a.automatic && a.id === 'blue') {
        const healthRatio = a.hp / a.d.maxHealth;
        if (healthRatio < a.d.ultimateUseHealthMin || healthRatio > a.d.ultimateUseHealthMax) return false;
      }
      if (a.automatic && (a.id === 'gold' && dist > u.radius || ['azure', 'cyan', 'crimson'].includes(a.id) && dist > u.range)) return false;
      // 사거리 밖이거나 이미 분석당하는 적이면 충전을 쓰기 전에 물러난다
      if (a.id === 'crystal') {
        if (Number.isFinite(u.width)) {
          // Main's aimed analysis binds the first enemy inside its visible beam.
          const front = b => (b.x-a.x)*Math.cos(yaw)+(b.z-a.z)*Math.sin(yaw);
          target = actors.filter(b => alive(b) && enemies(a,b) && !hidden(b,a) && !b.analysisOwner
            && front(b)>=0 && front(b)<=u.range
            && Math.abs(-(b.x-a.x)*Math.sin(yaw)+(b.z-a.z)*Math.cos(yaw))<=u.width/2)
            .sort((b,c)=>front(b)-front(c))[0];
          if (!target) return false;
        } else if (dist > u.range || target.analysisOwner) return false;
      }
      if (a.automatic && a.id === 'green' && a.ammo > 0 && a.hp > a.d.maxHealth * .4) return false;
      // Spend the stored charge before resolving the skill so successful
      // ultimate hits can immediately begin charging the next ultimate.
      if (a.id === 'blue' && a.automatic && a.d.dashAwayFromTarget) yaw += Math.PI;
      a.angle = yaw;
      return beginUltimate(a, target, () => {
      if (a.id === 'lavender') zones.push({ key: ++serial, owner: a, kind: 'fragrance', x: a.x, z: a.z,
        radius: u.radius, until: time + u.duration, next: time, tickInterval: u.tickInterval });
      else if (a.id === 'red') a.guardUntil = time + u.duration;
      else if (a.id === 'green') { a.hiddenUntil = time + u.duration; a.revealedUntil = 0; a.bush = { x: a.x, z: a.z }; }
      else if (a.id === 'blue') {
        a.dash = { yaw, until: time + u.duration, hits: new Set() };
        if(u.invulnerableDuringDash!==false)a.invulnerableUntil = Math.max(a.invulnerableUntil, time + u.duration);
      }
      else if (a.id === 'crimson') {
        for (const b of actors.filter(b => enemies(a, b))) {
          const dx = b.x - a.x, dz = b.z - a.z, front = dx * Math.cos(yaw) + dz * Math.sin(yaw);
          if (front >= 0 && front <= u.range && Math.abs(-dx * Math.sin(yaw) + dz * Math.cos(yaw)) <= u.width / 2) { hit(a, b, u.damage, true, 1, true); knock(b, yaw, u.knockback); }
        }
      } else if (a.id === 'cyan') shot(a, yaw, a.d.spreadLineSpeed * u.speedMultiplier, u.range, u.damage, { kind: 'gale', ultimate: true, radius: u.projectileRadius });
      else if (a.id === 'gold') after(u.delay, a, () => zones.push({ key: ++serial, owner: a, kind: 'lock', until: time + u.duration, radius: u.radius, next: time, tickInterval: u.tickInterval ?? 1 }), true);
      else if (a.id === 'ivory') {
        const x = a.x + Math.cos(yaw) * Math.min(dist, u.castRange), z = a.z + Math.sin(yaw) * Math.min(dist, u.castRange), offset = u.patternRadius / Math.sqrt(2);
        for (const [ox, oz] of [[0, 0], [-offset, -offset], [-offset, offset], [offset, -offset], [offset, offset]]) {
          const dx = x + ox - a.x, dz = z + oz - a.z;
          shot(a, Math.atan2(dz, dx), a.d.iceCreamSpeed, Math.hypot(dx, dz), a.d.iceCreamDamage * (u.damageMultiplier ?? 1), { kind: 'ivory', ultimate: true, spawn: 0 });
        }
      } else if (a.id === 'chartreuse') a.focusUntil = time + u.duration;
      else if (a.id === 'orange') {
        for (let i = 0; i < u.count; i++) {
          const offset = u.count > 1 ? -u.spreadAngle / 2 + i * u.spreadAngle / (u.count - 1) : 0;
          shot(a, yaw + offset, u.speed, u.range, u.damage, { kind: 'orangePeel', ultimate: true, radius: u.hitRadius });
        }
      }
      else if (a.id === 'purple') {
        const reach = Math.min(u.range, dist);
        const bounds = options.bounds ?? 24;
        const from = { x: a.x, z: a.z };
        const to = {
          x: clamp(a.x + Math.cos(yaw) * reach, -bounds, bounds),
          z: clamp(a.z + Math.sin(yaw) * reach, -bounds, bounds),
        };
        a.leap = { from, to, startedAt: time, duration: u.duration, jumpHeight: u.jumpHeight };
        a.lockUntil = time + u.duration;
        purpleLeapBurst(a, from, 'takeoff');
      }
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
        if (u.bindStopsMovement) {
          for (const bound of [a,target]) { bound.leap=null; bound.dash=null; bound.wave=null; bound.vx=0; bound.vz=0; }
        }
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
      });
    }
  }
  function finish(p) {
    const a = p.owner, d = a.d;
    if (p.kind === 'vial') area(a, p, d.vialSplashRadius, p.damage, true);
    if (p.kind === 'ivory') { area(a, p, d.iceCreamZoneRadius, p.damage, true, p.ultimate ? (a.u.rechargePerHit ?? 1) : 1, p.ultimate); zones.push({ key: ++serial, x: p.x, z: p.z, owner: a, kind: 'ivory', ultimate: p.ultimate, radius: d.iceCreamZoneRadius, until: time + d.iceCreamZoneDuration, next: time + d.iceCreamZoneTickInterval }); }
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
    salmon.tick();
    for (const a of actors) {
      // 시전자가 쓰러져도 대상이 영원히 묶이지 않도록 죽음 검사보다 먼저 푼다
      if (a.analysisTarget && (!alive(a) || !alive(a.analysisTarget))) releaseAnalysis(a);
      if (!alive(a) || a.isSalmonDevice || a.salmonAirborne) continue;
      if (a.analysisTarget) {
        const target = a.analysisTarget;
        if (time >= target.analysisExpires) { hit(a, target, a.u.executionFixedAmount ?? target.hp, false, 0, true, a.u.executeBypassesGuard === true); target.analysisOwner = null; a.analysisTarget = null; a.lockUntil = time; emit('analysisExecute', { owner: a, target }); }
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
      if (a.leap) {
        const leap = a.leap;
        const previousX = a.x, previousZ = a.z;
        const progress = clamp((time - leap.startedAt) / leap.duration, 0, 1);
        a.x = leap.from.x + (leap.to.x - leap.from.x) * progress;
        a.z = leap.from.z + (leap.to.z - leap.from.z) * progress;
        if (progress >= 1) {
          a.leap = null;
          a.lockUntil = time;
          purpleLeapBurst(a, leap.to, 'landing');


        }
        a.vx = (a.x - previousX) / dt;
        a.vz = (a.z - previousZ) / dt;
        continue;
      }
      const opponents=actors.filter(b=>alive(b)&&enemies(a,b)).sort((b,c)=>distance(a,b)-distance(a,c));
      const target=opponents.find(b=>!hidden(b,a)) ?? opponents[0];
      a.target = target;
      if (a.automatic) cast(a, target);
      if (a.leap) continue;
      if (time < a.poisonUntil && time >= a.poisonNext) { hit(a.poisonOwner, a, a.poisonOwner.d.poisonDPS ?? definitions.purple.poisonDPS); a.poisonNext = time + 1; }
      if (!a.d.noAutomaticReload && a.ammo < (a.d.maxAmmo ?? 3) && time >= a.next) { a.reload += dt; if (a.reload >= a.d.reloadDuration) { a.ammo++; a.reload -= a.d.reloadDuration; } }
      else if (a.ammo >= (a.d.maxAmmo ?? 3)) a.reload = 0;
      if (!a.automatic || !target) continue;
      const circuitDevice = a.id === 'yellow' && a.d.botTargetCircuitDevices && a.devices.length >= 2
        ? [...a.devices].sort((b,c)=>distance(a,b)-distance(a,c))[0] : null;
      const approachingDevice = circuitDevice && distance(a,circuitDevice)>range(a);
      const recoverTarget = a.id === 'salmon' && a.ammo < a.d.maxAmmo ? salmon.floats.filter(f=>f.owner===a).sort((b,c)=>distance(a,b)-distance(a,c))[0] : null;
      if (recoverTarget && distance(a,recoverTarget)<=4) salmon.fire(a,target);
      const moveTarget = recoverTarget ?? (approachingDevice ? circuitDevice : target);
      const destination = options.destination?.(a, moveTarget) ?? moveTarget;
      const previousX = a.x, previousZ = a.z;
      let dist = distance(a, destination), yaw = Math.atan2(destination.z - a.z, destination.x - a.x);
      // Azure's normal surf only reaches four tiles. Ranged bots retreat at the
      // same base speed, so an Azure bot otherwise never gets close enough to
      // use it. This bot-only approach surf closes distance without consuming
      // ammo, dealing damage, or charging the ultimate.
      if (a.id === 'azure' && destination === target && a.d.approachSurfRange
        && dist > (a.d.botApproachMin ?? range(a) + .5) && dist <= a.d.approachSurfRange && time >= a.approachNext
        && time >= a.lockUntil && time >= a.frozenUntil && !a.wave && !a.dash) {
        const travel = Math.min(a.d.approachSurfDistance, dist - range(a) * .75);
        move(a, a.x + Math.cos(yaw) * travel, a.z + Math.sin(yaw) * travel);
        a.approachNext = time + a.d.approachSurfCooldown;
        emit('approachSurf', { owner: a, target, distance: travel });
        dist = distance(a, destination);
        yaw = Math.atan2(destination.z - a.z, destination.x - a.x);
      }
      const ideal = recoverTarget ? 0 : destination !== moveTarget ? 0 : (({ red: 3.5, green: 2, crimson: 2, pink: 3, azure: a.d.botIdealDistance ?? 2.5 })[a.id] ?? perceivedRange(a) * .7);
      const groundStandoff=destination===target&&a.d.botGroundAttackSpacing&&Number.isFinite(target.d.groundAttackRange)
        ? Math.min(perceivedRange(a)-1,target.d.groundAttackRange+a.d.botGroundAttackSpacing):null;
      const retreatsAtLowHealth = !approachingDevice && (options.retreatsAtLowHealth?.(a, destination, target) ?? (a.hp <= a.d.maxHealth * .5 && !a.d.pursuesWhileLowHealth && groundStandoff==null));
      const bandMin = groundStandoff ?? a.d.attackPerceptionMinRange;
      const usesRangeBand = destination === target && Number.isFinite(bandMin);
      const radial = retreatsAtLowHealth ? -.85 : usesRangeBand
        ? (dist > perceivedRange(a) ? .85 : dist < bandMin ? -.85 : 0)
        : dist > ideal + .5 ? .85 : dist < ideal - .5 ? -.85 : 0;
      const strafe = Math.sin(time * 2.4 + a.phase) * .4;
      const dodging = time < a.dodgeUntil;
      let speed = 8 * a.d.moveSpeedMultiplier * (dodging ? a.d.projectileDodgeSpeedMultiplier ?? 1 : 1) * (time < a.slowUntil ? 1 - a.slow : 1) * (time < a.frozenUntil ? 0 : 1);
      const landingSpeed=speed*(a.d.botLandingDodgeSpeedMultiplier??1);
      const landing=landingEvasion(a,landingSpeed);
      const evasion=landing??burstEvasion(a,speed)??(dodging?null:ultimateEvasion(a));
      if(landing)speed=landingSpeed;
      const dodgeForward = a.d.projectileDodgeForwardFactor ?? 0;
      const dodgeScale = 1 / Math.hypot(1, dodgeForward);
      const analysisBound = (a.analysisOwner?.u.bindStopsMovement || (a.analysisTarget && a.u?.bindStopsMovement));
      if (!(a.ultimatePreparing && a.ultimateTelegraph) && !analysisBound && !a.wave && !a.dash && !a.leap && !hidden(a)) move(a,
        a.x + (evasion ? evasion.x : dodging ? (Math.cos(a.dodgeYaw) + Math.cos(yaw) * dodgeForward) * dodgeScale : Math.cos(yaw) * radial - Math.sin(yaw) * strafe) * speed * dt,
        a.z + (evasion ? evasion.z : dodging ? (Math.sin(a.dodgeYaw) + Math.sin(yaw) * dodgeForward) * dodgeScale : Math.sin(yaw) * radial + Math.cos(yaw) * strafe) * speed * dt);
      a.vx = (a.x - previousX) / dt; a.vz = (a.z - previousZ) / dt; a.angle = yaw;
      const attackDistance = destination === target ? dist : distance(a, target);
      if (circuitDevice && distance(a,circuitDevice)<=range(a)) fire(a,{...circuitDevice,vx:0,vz:0});
      else if (!(hidden(a) && a.ammo < (a.d.maxAmmo ?? 3)) && !hidden(target,a) && attackDistance <= perceivedRange(a) * (a.id === 'azure' ? (a.d.botFireRangeFactor ?? 1) : 1)) fire(a, target);
    }
    for (const a of actors) if (a.dash) {
      const dash = a.dash;
      if (!alive(a) || time >= dash.until || time < a.frozenUntil || time < a.lockUntil) { a.dash = null; continue; }
      const x = a.x + Math.cos(dash.yaw) * a.u.speed * dt, z = a.z + Math.sin(dash.yaw) * a.u.speed * dt;
      if (blocked(x, z) || Math.abs(x) > (options.bounds ?? 24) || Math.abs(z) > (options.bounds ?? 24)) dash.yaw += Math.PI;
      else move(a, x, z);
      for (const b of actors) if (enemies(a, b) && !dash.hits.has(b.key) && distance(a, b) <= a.u.hitRadius) { dash.hits.add(b.key); hit(a, b, a.u.damage, true, a.u.rechargePerHit, true); knock(b, dash.yaw, .65); }
    }
    for (let i = scheduled.length - 1; i >= 0; i--) if (scheduled[i].at <= time) { const event = scheduled.splice(i, 1)[0]; if (alive(event.owner)) event.run(); else { event.owner.ultimatePreparing = false; event.owner.ultimateTelegraph=null; } }
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i], a = p.owner, d = a.d;
      if (time < p.start) continue;
      if (p.kind === 'orangePeel' && p.pausedUntil) {
        if (time < p.pausedUntil) continue;
        p.pausedUntil = 0; p.returning = true; p.hits.clear(); p.traveled = 0;
      }
      if (p.kind === 'wave' && !alive(a)) { finish(p); projectiles.splice(i, 1); continue; }
      if (p.kind === 'crystal' && p.stage === 1 && d.crystalHomingTurnRate && alive(p.homingTarget)) {
        const wanted = Math.atan2(p.homingTarget.z-p.z, p.homingTarget.x-p.x);
        const diff = Math.atan2(Math.sin(wanted-p.yaw), Math.cos(wanted-p.yaw));
        p.yaw += clamp(diff, -d.crystalHomingTurnRate*dt, d.crystalHomingTurnRate*dt);
      }
      if (p.returning) p.yaw = Math.atan2(a.z - p.z, a.x - p.x);
      const before = { x: p.x, z: p.z }, advance = Math.min(p.speed * dt, p.returning ? Infinity : Math.max(0, p.reach - p.traveled));
      p.x += Math.cos(p.yaw) * advance; p.z += Math.sin(p.yaw) * advance; p.traveled += advance;
      const air = ['ivory', 'vial'].includes(p.kind);
      let ended = !p.returning && p.traveled >= p.reach;
      const hitWall = !air && !(p.kind === 'wave' && p.ultimate) && !(p.kind === 'orangePeel' && p.returning) && blocked(p.x, p.z, p.radius);
      if (hitWall) { ended = true; p.x = before.x; p.z = before.z; }
      if (p.kind === 'wave') move(a, p.origin.x + Math.cos(p.yaw) * Math.min(p.traveled, p.ride), p.origin.z + Math.sin(p.yaw) * Math.min(p.traveled, p.ride));
      if (p.kind === 'electric' && a.devices.some(v => segmentDistance(v, before, p) <= .8 + p.radius)) {
        for (let j = 0; j < a.devices.length - 1; j++) { const from = { ...a.devices[j] }, to = { ...a.devices[j + 1] }; after(j * .18, a, () => {
          for (const b of actors) if (enemies(a, b) && segmentDistance(b, from, to) <= a.u.connectionRadius + .85) { hit(a, b, a.u.connectionDamage, true, 1, true); b.slowUntil = time + d.shockDuration; b.slow = d.shockSlowPercent; }
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
        if (p.kind === 'crystal') {
          if (p.stage === 3) award = d.shardUltimateCharge ?? 1;
          const key = `${b.key}:${p.stage}`, limit = p.stage === 2 ? (d.fragmentHitLimit ?? 1) : p.stage === 3 ? (d.shardHitLimit ?? 1) : 1;
          const counts = p.token.hitCounts ??= new Map(), count = counts.get(key) ?? 0;
          if (count >= limit) amount = 0;
          else { counts.set(key, count + 1); p.token.hits.add(key); }
        }
        amount = Math.max(0, amount - (b.d.projectileDamageReduction ?? 0));
        if (p.burstChargeHits?.has(b.key)) award = 0;
        const dealt = hit(a, b, amount, true, p.ultimate ? award * (a.u.rechargePerHit ?? 1) : award, p.ultimate);
        if (dealt > 0) {
          p.burstChargeHits?.add(b.key);
          b.lastDamageKind = p.kind;
          if (p.kind === 'needle') { b.poisonOwner = a; b.poisonUntil = time + d.poisonDuration; b.poisonNext = time + 1; }
          if (p.kind === 'mint') ice(b, d.icePerHit);
          if (a.id === 'blue' && !p.ultimate && d.bulletKnockback) knock(b, p.yaw, d.bulletKnockback);
          if (p.kind === 'electric') { b.slowUntil = time + d.shockDuration; b.slow = d.shockSlowPercent; }
          if (p.kind === 'gale' || p.kind === 'wave' && p.ultimate) knock(b, p.yaw, a.u.knockback * (a.d.fullUltimateKnockback ? 1 : 1/9));
          if (p.kind === 'cc') { const effect = Math.floor(random() * 6); if (effect === 0 || effect === 5) { b.slowUntil = time + 2; b.slow = effect === 5 ? 1 : .35; } if (effect === 1 || effect === 5) b.lockUntil = time + 2; if (effect === 2) b.frozenUntil = time + 2; if (effect === 3) { b.poisonOwner = a; b.poisonUntil = time + 4; b.poisonNext = time + 1; } if (effect === 4) knock(b, p.yaw, 3.5); }
          if (p.kind === 'bomb') hit(a, b, d.bombSplashDamage * d.bombDirectHitJuiceCount);
        }
        if (!['wave', 'gale', 'boomerang', 'orangePeel'].includes(p.kind)) { ended = true; break; }
      }
      if (p.kind === 'boomerang') {
        if (!p.returning && (ended || p.hits.size)) { p.returning = true; p.hits.clear(); p.traveled = 0; p.speed *= d.boomerangReturnSpeedMultiplier; ended = false; }
        else if (p.returning) ended = !alive(a) || distance(p, a) < .7;
      }
      if (p.kind === 'orangePeel') {
        if (!p.returning && ended) { p.pausedUntil = time + a.u.pauseDuration; p.speed = 0; ended = false; }
        else if (p.returning) { p.speed = a.u.speed; ended = !alive(a) || distance(p, a) < .7; }
      }
      if (ended) { finish(p); projectiles.splice(i, 1); }
    }
    const ivoryHits = new Map();
    for (let i = zones.length - 1; i >= 0; i--) {
      const zone = zones[i], a = zone.owner;
      if (time + 1e-9 >= zone.until) { zones.splice(i, 1); continue; }
      if (zone.kind === 'fragrance') { zone.x = a.x; zone.z = a.z; }
      const center = zone.kind === 'lock' ? a : zone;
      for (const b of actors) if (alive(b) && enemies(a, b) && distance(center, b) <= zone.radius) {
        if (zone.kind === 'perfumeSpray') {
          const yaw = Math.atan2(b.z - zone.z, b.x - zone.x);
          if (Math.abs(Math.atan2(Math.sin(yaw - zone.yaw), Math.cos(yaw - zone.yaw))) > zone.halfAngle) continue;
          const length = distance(zone, b);
          let occluded = false;
          for (let step = .25; step < length; step += .25) {
            if (blocked(zone.x + Math.cos(yaw) * step, zone.z + Math.sin(yaw) * step, .1)) { occluded = true; break; }
          }
          if (occluded) continue;
          const arrivalAt = zone.startedAt + length / zone.spraySpeed;
          if (time + 1e-9 < arrivalAt) continue;
          const closeInterval = a.d.sprayCloseTickInterval ?? zone.tickInterval;
          const interval = closeInterval + (zone.tickInterval - closeInterval) * clamp(length / zone.radius, 0, 1);
          const duration = a.d.sprayDuration * interval / zone.tickInterval;
          const record = zone.hits.get(b.key) ?? { count: 0, nextAt: arrivalAt, interval, until: arrivalAt + duration };
          if (a.d.sprayCloseTickInterval != null && time + 1e-9 >= record.until) continue;
          const maxHits = Math.round(a.d.sprayDuration / zone.tickInterval);
          if (record.count < maxHits && time + 1e-9 >= record.nextAt) {
            const band = a.d.sprayDamageBands?.find(entry => length <= entry.maxRange);
            const multiplier = band?.multiplier ?? (1 + (a.d.sprayDistanceDamageBonus ?? 0) * clamp(length / zone.radius, 0, 1));
            const damage = zone.damage * multiplier;
            if (hit(a, b, damage, true) > 0) {
              record.count++;
              record.nextAt = time + record.interval;
              zone.hits.set(b.key, record);
            }
          }
        }
        if (zone.kind === 'fragrance') {
          const previousSlow = time < b.slowUntil ? b.slow : 0;
          b.slowUntil = Math.max(b.slowUntil, time + .05);
          b.slow = Math.max(previousSlow, a.u.slowPercent);
          if (time + 1e-9 >= zone.next) hit(a, b, a.u.damagePerSecond, true, a.u.rechargePerHit ?? 1, true);
        }
        if (zone.kind === 'lock' && alive(a)) {
          b.lockUntil = time + .05; b.slowUntil = time + .05; b.slow = .5;
          if (time + 1e-9 >= zone.next) hit(a, b, a.u.tickDamage ?? 0);
        }
        if (zone.kind === 'mint') { if (time + 1e-9 >= zone.next) { hit(a, b, a.u.damagePerSecond, true, a.u.rechargePerHit ?? 1, true); ice(b, a.u.icePerSecond); } if (time >= b.frozenUntil) knock(b, Math.atan2(b.z - zone.z, b.x - zone.x), (a.u.slideStrength + a.u.slideAcceleration * (time - zone.started)) * dt); }
        if (zone.kind === 'ivory') {
          if (time + 1e-9 >= zone.next && time + 1e-9 >= b.zoneNext) {
            if (a.d.basicUltimateChargeMultiplier == null) {
              hit(a, b, a.d.iceCreamZoneDamage ?? a.d.iceCreamDamage, true, zone.ultimate ? (a.u.rechargePerHit ?? 1) : 1, zone.ultimate);
              b.zoneNext = time + a.d.iceCreamZoneTickInterval;
              continue;
            }
            const damage = (a.d.iceCreamZoneDamage ?? a.d.iceCreamDamage) * (zone.ultimate ? a.u.damageMultiplier ?? 1 : 1);
            const award = zone.ultimate ? a.u.rechargePerHit ?? 1 : a.d.basicUltimateChargeMultiplier ?? 1;
            const previous = ivoryHits.get(b);
            if (!previous || previous.owner === a) ivoryHits.set(b, { owner: a, damage: Math.max(previous?.damage ?? 0, damage), award: Math.max(previous?.award ?? 0, award) });
          }
        }
      }
      if (time + 1e-9 >= zone.next) zone.next += zone.tickInterval ?? (zone.kind === 'ivory' ? a.d.iceCreamZoneTickInterval : 1);
    }
    for (const [target, { owner, damage, award }] of ivoryHits) {
      hit(owner, target, damage, true, award, true);
      target.zoneNext = time + owner.d.iceCreamZoneTickInterval;
    }
  }
  const salmon = createSalmonCombat({actors, time:()=>time, key:()=>++serial, bounds:options.bounds??24, blocked, walkable:options.walkable, hit, emit,
    cancelRide(a){for(let i=projectiles.length-1;i>=0;i--)if(projectiles[i].owner===a&&projectiles[i].kind==='wave')projectiles.splice(i,1);},
    addDevice(owner,p){return add('salmon',{...p,owner,isSalmonDevice:true,automatic:false,team:owner.team,hp:owner.u.deviceHealth,ammo:0,charge:0,u:null,d:{maxHealth:owner.u.deviceHealth,maxAmmo:0,noAutomaticReload:true,moveSpeedMultiplier:0},next:Infinity});}});
  return { actors, projectiles, zones, salmon, add, fire, cast, hit, hidden, range, damageReductionFor, ultimateFieldActive, get time() { return time; },
    update(dt) { let remaining = Math.min(.25, Math.max(0, dt)); while (remaining > 1e-9) { const step = Math.min(1 / 60, remaining); tick(step); remaining -= step; } },
    remove(actor) {
      actor.ultimatePreparing=false;actor.ultimateTelegraph=null;
      salmon.remove(actor);
      // 사라지는 액터가 걸어 둔 속박도 함께 푼다
      if (actor.analysisTarget) releaseAnalysis(actor);
      if (actor.analysisOwner) releaseAnalysis(actor.analysisOwner);
      const index = actors.indexOf(actor); if (index >= 0) actors.splice(index, 1);
      for (const list of [projectiles, zones, scheduled]) for (let i = list.length - 1; i >= 0; i--) if (list[i].owner === actor) list.splice(i, 1);
    },
    clear() { salmon.clear(); actors.length = projectiles.length = zones.length = scheduled.length = 0; },
  };
}
