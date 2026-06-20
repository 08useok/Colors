import { THREE, G, CONST } from "./shared.js";
import { CHARACTERS } from "./character.js";

const { attackDepth, attackHalfWidth, attackCooldown, attackEvents, bushStealthRevealRangeSq } = CONST;
const tempVec2 = new THREE.Vector2();

export function isInBush(fighter) {
  for (const bush of G.state.bushes) {
    const dx = fighter.mesh.position.x - bush.x;
    const dz = fighter.mesh.position.z - bush.z;
    if (dx * dx + dz * dz < bush.radius * bush.radius) return true;
  }
  return false;
}

export function isVisibleThroughBush(observer, target) {
  const state = G.state;
  tempVec2.set(target.mesh.position.x - observer.mesh.position.x, target.mesh.position.z - observer.mesh.position.z);
  const lengthSq = tempVec2.lengthSq();
  if (lengthSq < 1) return true;
  for (const bush of state.bushes) {
    const originToBush = new THREE.Vector2(bush.x - observer.mesh.position.x, bush.z - observer.mesh.position.z);
    const proj = originToBush.dot(tempVec2) / lengthSq;
    if (proj <= 0 || proj >= 1) continue;
    const closestX = observer.mesh.position.x + tempVec2.x * proj;
    const closestZ = observer.mesh.position.z + tempVec2.y * proj;
    const dx = bush.x - closestX;
    const dz = bush.z - closestZ;
    if (dx * dx + dz * dz < bush.radius * bush.radius) return false;
  }
  return true;
}

export function isFighterVisible(observer, target) {
  if (G.state.gameTime < target.revealedUntil) return true;
  const dx = target.mesh.position.x - observer.mesh.position.x;
  const dz = target.mesh.position.z - observer.mesh.position.z;
  if (isInBush(target) && dx * dx + dz * dz > bushStealthRevealRangeSq) return false;
  return isVisibleThroughBush(observer, target);
}

export function findNearestBush(pos) {
  let nearest = null, bestDistSq = Infinity;
  for (const bush of G.state.bushes) {
    const dx = bush.x - pos.x, dz = bush.z - pos.z;
    const distSq = dx * dx + dz * dz;
    if (distSq < bestDistSq) { bestDistSq = distSq; nearest = bush; }
  }
  return nearest;
}

export function getAttackRange(fighter) {
  if (fighter.characterType === "green") return CHARACTERS.green.boomerangRange;
  if (fighter.characterType === "blue") return CHARACTERS.blue.bulletRange;
  return attackDepth;
}

export function getMoveSpeed(fighter) {
  return CONST.baseMoveSpeed * (CHARACTERS[fighter.characterType]?.moveSpeedMultiplier ?? 1.0);
}

export function getReloadInterval(fighter) {
  const reloadDur = CHARACTERS[fighter.characterType]?.reloadDuration ?? CONST.reloadDuration;
  return reloadDur / fighter.maxAmmo;
}

export function intersectsRect(x, z, radius, rect) {
  const closestX = Math.max(rect.x, Math.min(x, rect.x + rect.w));
  const closestZ = Math.max(rect.z, Math.min(z, rect.z + rect.d));
  const dx = x - closestX, dz = z - closestZ;
  return dx * dx + dz * dz < radius * radius;
}

function createBulletMesh(position, yaw) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 8, 6),
    new THREE.MeshBasicMaterial({ color: 0x7ec8ff }),
  );
  mesh.position.set(position.x + Math.sin(yaw) * 0.9, 1.3, position.z + Math.cos(yaw) * 0.9);
  G.scene.add(mesh);
  return mesh;
}

function createBoomerangMesh(position, yaw) {
  const mesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.28, 0.08, 6, 14, Math.PI * 1.4),
    new THREE.MeshStandardMaterial({ color: 0x5dea6a, roughness: 0.5, metalness: 0.1 }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.rotation.z = yaw;
  mesh.position.set(position.x, 1.2, position.z);
  mesh.castShadow = false;
  G.scene.add(mesh);
  return mesh;
}

export function queueAttackHit(attacker, hitIndex, damage, executeAt) {
  G.state.scheduledHits.push({ attackerId: attacker.id, hitIndex, damage, executeAt });
}

export function beginAttack(fighter, createAttackEffect, audio) {
  if (fighter.characterType === "green") return beginBoomerangAttack(fighter, audio);
  if (fighter.characterType === "blue") return beginBulletAttack(fighter, audio);
  const state = G.state;
  if (fighter.dead || fighter.ammo <= 0 || state.gameTime < fighter.nextAttackAt) return false;

  const charCooldown = CHARACTERS[fighter.characterType]?.attackCooldown ?? attackCooldown;
  fighter.ammo -= 1;
  fighter.nextAttackAt = state.gameTime + charCooldown;
  fighter.attackSequenceEndsAt = state.gameTime + charCooldown;
  fighter.attackSwing = 1;
  fighter.attackAnimTime = 0;
  fighter.spread = Math.min(1, fighter.spread + 0.18);
  fighter.recoilKick = Math.min(1.5, fighter.recoilKick + 0.5);
  fighter.lastCombatTime = state.gameTime;
  if (isInBush(fighter)) fighter.revealedUntil = state.gameTime + 3;

  attackEvents.forEach((event, index) => {
    queueAttackHit(fighter, index, event.damage, state.gameTime + event.delay);
  });

  createAttackEffect(fighter, 0);
  if (fighter.isPlayer) audio.play("attack");
  return true;
}

function beginBulletAttack(fighter, audio) {
  const state = G.state;
  if (fighter.dead || fighter.ammo <= 0 || state.gameTime < fighter.nextAttackAt) return false;
  const charDef = CHARACTERS.blue;
  fighter.ammo -= 1;
  fighter.nextAttackAt = state.gameTime + charDef.attackCooldown;
  fighter.attackSequenceEndsAt = state.gameTime + charDef.attackCooldown;
  fighter.attackSwing = 1;
  fighter.attackAnimTime = 0;
  fighter.spread = Math.min(1, fighter.spread + 0.06);
  fighter.lastCombatTime = state.gameTime;
  if (isInBush(fighter)) fighter.revealedUntil = state.gameTime + 3;

  const yaw = fighter.yaw;
  const mesh = createBulletMesh(fighter.mesh.position, yaw);
  state.projectiles.push({
    ownerId: fighter.id,
    x: fighter.mesh.position.x + Math.sin(yaw) * 0.9,
    z: fighter.mesh.position.z + Math.cos(yaw) * 0.9,
    vx: Math.sin(yaw) * charDef.bulletSpeed, vz: Math.cos(yaw) * charDef.bulletSpeed,
    damage: charDef.bulletDamage, range: charDef.bulletRange,
    farThreshold: Infinity, farMultiplier: 1, distTraveled: 0,
    launchAt: state.gameTime, mesh, isBullet: true,
  });
  if (fighter.isPlayer) audio.play("attack");
  return true;
}

function beginBoomerangAttack(fighter, audio) {
  const state = G.state;
  if (fighter.dead || fighter.ammo <= 0 || state.gameTime < fighter.nextAttackAt) return false;
  const charDef = CHARACTERS.green;
  fighter.ammo -= 1;
  fighter.nextAttackAt = state.gameTime + charDef.attackCooldown;
  fighter.attackSequenceEndsAt = state.gameTime + charDef.attackCooldown;
  fighter.attackSwing = 1;
  fighter.attackAnimTime = 0;
  fighter.spread = Math.min(1, fighter.spread + 0.12);
  fighter.lastCombatTime = state.gameTime;
  if (isInBush(fighter)) fighter.revealedUntil = state.gameTime + 3;

  charDef.boomerangAngles.forEach((angleOffset, index) => {
    const yaw = fighter.yaw + angleOffset;
    const mesh = createBoomerangMesh(fighter.mesh.position, yaw);
    mesh.visible = false;
    state.projectiles.push({
      ownerId: fighter.id, x: fighter.mesh.position.x, z: fighter.mesh.position.z,
      vx: Math.sin(yaw) * charDef.boomerangSpeed, vz: Math.cos(yaw) * charDef.boomerangSpeed,
      damage: charDef.boomerangDamage, range: charDef.boomerangRange,
      farThreshold: charDef.boomerangFarThreshold, farMultiplier: charDef.boomerangFarMultiplier,
      distTraveled: 0, launchAt: state.gameTime + index * 0.08, mesh, projRadius: 0.26,
    });
  });
  if (fighter.isPlayer) audio.play("attack");
  return true;
}

export function updateProjectiles(dt, applyDamage, flashHitMarker, createHitSpark, audio) {
  const state = G.state;
  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const proj = state.projectiles[i];
    if (state.gameTime < proj.launchAt) continue;
    proj.mesh.visible = true;
    proj.x += proj.vx * dt; proj.z += proj.vz * dt;
    proj.distTraveled += Math.hypot(proj.vx, proj.vz) * dt;
    proj.mesh.position.set(proj.x, proj.isBullet ? 1.3 : 1.2, proj.z);
    if (!proj.isBullet) proj.mesh.rotation.z += dt * 10;

    let hit = false;
    const attacker = state.players.find(p => p.id === proj.ownerId);
    for (const target of state.players) {
      if (target.id === proj.ownerId || target.dead) continue;
      const dx = target.mesh.position.x - proj.x, dz = target.mesh.position.z - proj.z;
      const hitDist = target.radius + (proj.projRadius || 0);
      if (dx * dx + dz * dz < hitDist * hitDist) {
        const isFar = proj.distTraveled > proj.farThreshold;
        const dmg = isFar ? proj.damage * proj.farMultiplier : proj.damage;
        applyDamage(target, dmg, attacker ?? null);
        if (proj.ownerId === 0) { flashHitMarker(); audio.play("hit"); }
        G.tempVec3.set(proj.x, 1.6, proj.z);
        createHitSpark(G.tempVec3);
        hit = true; break;
      }
    }

    if (!hit) {
      for (const solid of state.solids) {
        if (intersectsRect(proj.x, proj.z, 0.2, solid)) { hit = true; break; }
      }
    }

    if (hit || proj.distTraveled >= proj.range) {
      G.scene.remove(proj.mesh);
      state.projectiles.splice(i, 1);
    }
  }
}

export function resolveAttack(attacker, hitIndex, damage, applyDamage, createAttackEffect, flashHitMarker, createHitSpark, audio) {
  if (!attacker || attacker.dead) return;
  const state = G.state;
  const spreadOffset = attacker.spread * 0.2 * (Math.random() * 2 - 1);
  const tilt = (hitIndex === 0 ? -20 : 20) * (Math.PI / 180);
  const effectiveYaw = attacker.yaw + tilt;
  const sinYaw = Math.sin(effectiveYaw), cosYaw = Math.cos(effectiveYaw);
  const punchSide = hitIndex === 0 ? 0.5 : -1;
  const hitTargets = [];
  let bestTarget = null, bestScore = -Infinity;

  for (const target of state.players) {
    if (target.id === attacker.id || target.dead) continue;
    const deltaX = target.mesh.position.x - attacker.mesh.position.x;
    const deltaZ = target.mesh.position.z - attacker.mesh.position.z;
    const localX = deltaX * cosYaw - deltaZ * sinYaw - spreadOffset;
    const localZ = deltaX * sinYaw + deltaZ * cosYaw;
    if (localZ < 0 || localZ > attackDepth) continue;
    if (Math.abs(localX - punchSide) > attackHalfWidth) continue;
    if (!isFighterVisible(attacker, target)) continue;
    hitTargets.push(target);
    const score = localZ * -1 - Math.abs(localX - punchSide) * 0.2;
    if (score > bestScore) { bestScore = score; bestTarget = target; }
  }

  createAttackEffect(attacker, hitIndex);
  const penetrate = attacker.characterType === "red";
  const targets = penetrate ? hitTargets : (bestTarget ? [bestTarget] : []);

  for (const tgt of targets) {
    applyDamage(tgt, damage, attacker);
    G.tempVec3.copy(tgt.mesh.position); G.tempVec3.y = 1.6;
    createHitSpark(G.tempVec3);
  }
  if (targets.length > 0 && attacker.isPlayer) { flashHitMarker(); audio.play("hit"); }
}

export function applyDamage(target, amount, attacker, updateCombatTime, t, addKillFeed, showDamageTakenIndicator, createDamagePopup, audio) {
  if (target.dead) return;
  const state = G.state;
  const healthBefore = target.health;
  target.health = Math.max(0, target.health - amount);
  target.flashTimer = 0.12;
  target.pitchKick = Math.min(1, target.pitchKick + 0.55);
  if (updateCombatTime !== false) target.lastCombatTime = state.gameTime;
  if (isInBush(target)) target.revealedUntil = state.gameTime + 3;
  if (attacker && isInBush(attacker)) attacker.revealedUntil = state.gameTime + 3;
  const dealt = healthBefore - target.health;
  if (attacker) {
    attacker.lastCombatTime = state.gameTime;
    attacker.damageDealt += dealt;
    if (attacker.isPlayer && target.id !== attacker.id) {
      G.tempVec3.copy(target.mesh.position);
      createDamagePopup(G.tempVec3, dealt);
    }
  }
  if (target.isPlayer) {
    state.feedback.hitFlashUntil = state.gameTime + 0.18;
    audio.play("hit");
    if (!attacker || target.id !== attacker.id) showDamageTakenIndicator(dealt);
  }
  if (target.health <= 0) {
    target.dead = true;
    target.mesh.visible = false;
    target.shadow.visible = false;
    target.healthBar.visible = false;
    if (state.trainingMode && target.isDummy) {
      target.respawnAt = state.gameTime + 3;
    } else {
      state.deathOrder.push(target.id);
      if (attacker) {
        addKillFeed(t("killFeed", attacker.name, target.name));
        if (attacker.isPlayer || target.isPlayer) audio.play("kill");
      } else {
        addKillFeed(`${target.name} 사망`);
      }
    }
  }
}

export function updateScheduledHits(resolveAttackFn) {
  const state = G.state;
  for (let i = state.scheduledHits.length - 1; i >= 0; i--) {
    const hit = state.scheduledHits[i];
    if (state.gameTime < hit.executeAt) continue;
    state.scheduledHits.splice(i, 1);
    const attacker = state.players.find(p => p.id === hit.attackerId);
    resolveAttackFn(attacker, hit.hitIndex, hit.damage);
  }
}
