import { THREE, G, CONST } from "./shared.js";
import { isFighterVisible, isInBush, getAttackRange, getMoveSpeed } from "./combat.js";

export function chooseBotTarget(bot, getPlayer) {
  const state = G.state;
  let best = null, bestScore = Infinity;
  const playerDead = getPlayer()?.dead ?? false;
  const visionRange = playerDead ? 200 : 50;
  const bushVisionRange = playerDead ? 200 : 9;
  for (const fighter of state.players) {
    if (fighter.id === bot.id || fighter.dead) continue;
    const dx = fighter.mesh.position.x - bot.mesh.position.x;
    const dz = fighter.mesh.position.z - bot.mesh.position.z;
    const distanceSq = dx * dx + dz * dz;
    if (distanceSq > visionRange * visionRange) continue;
    if (!isFighterVisible(bot, fighter) && distanceSq > bushVisionRange * bushVisionRange) continue;
    if (isInBush(fighter) && distanceSq > CONST.bushStealthRevealRangeSq) continue;

    const healthRatio = fighter.health / fighter.maxHealth;
    const lowHpBonus = healthRatio * 200;
    const bushPenalty = isInBush(fighter) ? 240 : 0;
    const score = distanceSq + lowHpBonus + bushPenalty;
    if (score < bestScore) { bestScore = score; best = fighter; }
  }
  return best;
}

export function updateBot(bot, dt, zone, { getPlayer, beginAttack, findWallEscapeDir, moveFighter }) {
  if (bot.dead || bot.isDummy) return;
  const state = G.state;
  const target = chooseBotTarget(bot, getPlayer);
  const botPos = bot.mesh.position;
  const botSpeed = getMoveSpeed(bot);
  G.tempVec3.set(0, 0, 0);

  const dxZone = botPos.x - state.safeCenter.x;
  const dzZone = botPos.z - state.safeCenter.y;
  const distToZoneCenter = Math.hypot(dxZone, dzZone);
  const outsideZone = distToZoneCenter > zone.radius * 0.85;

  if (outsideZone && zone.damage > 0) {
    const toCenter = Math.atan2(-dxZone, -dzZone);
    bot.yaw = toCenter;
    G.tempVec3.set(Math.sin(toCenter), 0, Math.cos(toCenter)).multiplyScalar(botSpeed);
    if (target) {
      const tx = target.mesh.position.x - botPos.x, tz = target.mesh.position.z - botPos.z;
      if (Math.hypot(tx, tz) <= getAttackRange(bot) * 1.05) {
        bot.yaw = Math.atan2(tx, tz);
        beginAttack(bot);
      }
    }
  } else if (bot.health < bot.maxHealth * 0.25 && target) {
    const tx = target.mesh.position.x - botPos.x, tz = target.mesh.position.z - botPos.z;
    const distance = Math.hypot(tx, tz);
    const fleeYaw = Math.atan2(-tx, -tz);
    bot.yaw = fleeYaw;
    G.tempVec3.set(Math.sin(fleeYaw), 0, Math.cos(fleeYaw)).multiplyScalar(botSpeed * 0.9);
    if (distance <= getAttackRange(bot) * 1.05) {
      bot.yaw = Math.atan2(tx, tz);
      beginAttack(bot);
    }
  } else if (target) {
    const tx = target.mesh.position.x - botPos.x, tz = target.mesh.position.z - botPos.z;
    const distance = Math.hypot(tx, tz);
    bot.yaw = Math.atan2(tx, tz);
    const atkRange = getAttackRange(bot);
    const isRanged = bot.characterType === "green" || bot.characterType === "blue";
    if (distance > atkRange * 0.86) {
      G.tempVec3.set(Math.sin(bot.yaw), 0, Math.cos(bot.yaw)).multiplyScalar(botSpeed * 0.82);
    } else if (isRanged && distance < atkRange * 0.5) {
      const fleeYaw = Math.atan2(-tx, -tz);
      G.tempVec3.set(Math.sin(fleeYaw), 0, Math.cos(fleeYaw)).multiplyScalar(botSpeed * 0.55);
    } else if (distance < atkRange * 0.58) {
      G.tempVec3.set(-Math.sin(bot.yaw), 0, -Math.cos(bot.yaw)).multiplyScalar(botSpeed * 0.48);
    } else {
      G.tempVec3.set(Math.sin(bot.yaw + Math.PI / 2), 0, Math.cos(bot.yaw + Math.PI / 2))
        .multiplyScalar(botSpeed * 0.28 * bot.botStrafeDir);
    }
    if (distance <= atkRange * 1.05) beginAttack(bot);
  } else {
    if (state.gameTime >= bot.botDecisionAt) {
      bot.botDecisionAt = state.gameTime + 1.6 + Math.random() * 2.1;
      const angle = Math.random() * Math.PI * 2;
      const radius = 8 + Math.random() * 16;
      bot.botMoveTarget.set(
        THREE.MathUtils.clamp(botPos.x + Math.cos(angle) * radius, -46, 46), 0,
        THREE.MathUtils.clamp(botPos.z + Math.sin(angle) * radius, -46, 46),
      );
    }
    G.tempVec3.set(bot.botMoveTarget.x - botPos.x, 0, bot.botMoveTarget.z - botPos.z);
    if (G.tempVec3.lengthSq() > 1) {
      bot.yaw = Math.atan2(G.tempVec3.x, G.tempVec3.z);
      G.tempVec3.normalize().multiplyScalar(botSpeed * 0.62);
    } else {
      G.tempVec3.set(0, 0, 0);
    }
  }

  const distFromCenter = Math.hypot(botPos.x - state.safeCenter.x, botPos.z - state.safeCenter.y);
  if (distFromCenter > zone.radius - 4) {
    const toCenterX = state.safeCenter.x - botPos.x;
    const toCenterZ = state.safeCenter.y - botPos.z;
    const len = Math.hypot(toCenterX, toCenterZ) || 1;
    G.tempVec3.set((toCenterX / len) * botSpeed, 0, (toCenterZ / len) * botSpeed);
    bot.yaw = Math.atan2(G.tempVec3.x, G.tempVec3.z);
  }

  const moveSpeed = Math.hypot(G.tempVec3.x, G.tempVec3.z);
  if (moveSpeed > 0.0001) {
    const lookahead = bot.radius + 1.5;
    const dirX = G.tempVec3.x / moveSpeed, dirZ = G.tempVec3.z / moveSpeed;
    const escapeDir = findWallEscapeDir(bot, dirX, dirZ, lookahead);
    if (escapeDir) G.tempVec3.set(escapeDir.x * moveSpeed, 0, escapeDir.z * moveSpeed);
  }

  bot.mesh.rotation.y = bot.yaw;
  moveFighter(bot, G.tempVec3, dt);
}
