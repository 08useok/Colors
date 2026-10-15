import { applyBeta6Balance } from './beta6-balance.js?v=3';

// Season 7 balance and counter-cycle tuning, layered on the beta6 overlay.
// Counter design goals live in beta7-counter-targets.js, separately from combat.
export const BETA7_BALANCE = {
  orange: { maxHealth: 4000, bombSplashDamage: 1170, ultimate: { rechargePerHit: 0.33 } },
  blue: { bulletDamage: 1080, bulletRange: 16 },
  red: { maxHealth: 9000 },
  purple: { poisonDPS: 820, vialDamage: 2920 },
  cyan: { spreadLineDamage: 700 },
  yellow: { shockDuration: 3, botTargetCircuitDevices: true, botAvoidLandingZones: true, botLandingDodgeSpeedMultiplier: 2 },
  crimson: { ultimateChargeRequired: 3 },
  green: { boomerangDamage: 1710 },
  gold: { maxHealth: 8200, stage1Damage: 1190, stage2Damage: 495, stage3Damage: 250, ultimate: { tickDamage: 100, tickInterval: 1, delay: 0.2 } },
  ivory: { maxHealth: 6600, iceCreamDamage: 2400, iceCreamRange: 9, iceCreamZoneDamage: 2600, iceCreamZoneRadius: 5, iceCreamZoneTickInterval: 1, iceCreamSpeed: 28, ultimate: { rechargePerHit: 0.1 } },
  lavender: { attackRange: 9, sprayDuration: 1.5, sprayTickInterval: 0.5, sprayDamage: 1100, sprayDistanceDamageBonus: 0.5, special: { chargeRequired: 2, rechargePerHit: 0.025, damagePerSecond: 780, slowPercent: 0.7 } },
  mint: { iceBulletDamage: 1000, special: { rechargePerHit: 0.33 } },
  pink: { maxHealth: 9900, healCircleDamage: 2200 },
  chartreuse: { maxHealth: 8200, chartreuseDamage: 1320, chartreuseEnhancedDamage: 2640, projectileDodgeDuration: 0.12, projectileDodgeSpeedMultiplier: 3, projectileDodgeDetectionRange: 20, projectileDodgeKinds: ['bullet','electric','enhanced','cc','plague'] },
  crystal: { crystalRange: 12, botAimLeadFactor: 0.5, ultimate: { chargeRequired: 6 } },
  // Bot-only tuning for the simulation: Azure closes in with the approach surf and fires only when the wave can reach.
  azure: { botApproachMin: 3.2, botFireRangeFactor: 0.75, botIdealDistance: 2.2 },
};

export function applyBeta7Balance(source) {
  const result = applyBeta6Balance(source);
  for (const [id, { ultimate, special, ...stats }] of Object.entries(BETA7_BALANCE)) {
    Object.assign(result[id], stats);
    if (ultimate) Object.assign(result[id].ultimate, ultimate);
    if (special) Object.assign(result[id].special, special);
  }
  result.blue.basicAttack.description = `사거리 ${result.blue.bulletRange}타일의 구슬을 빠르게 던져 ${result.blue.bulletDamage} 피해와 ${result.blue.bulletKnockback}타일 넉백을 줍니다.`;
  result.lavender.basicAttack.description = `전방 ${result.lavender.attackRange}타일, 60도 범위로 향수를 분사합니다. 연기가 적에게 도달한 뒤 ${result.lavender.sprayTickInterval}초마다 ${result.lavender.sprayDamage}~${result.lavender.sprayDamage * (1 + result.lavender.sprayDistanceDamageBonus)} 피해를 줍니다. 구름의 발사 위치에서 멀수록 피해가 증가하며 같은 적에게 최대 3회 적중합니다.`;
  result.lavender.special.description = `자신을 따라다니는 반경 ${result.lavender.special.radius}타일의 향기 장판을 ${result.lavender.special.duration}초 동안 생성합니다. 장판 안 적은 ${Math.round(result.lavender.special.slowPercent * 100)}% 느려지고 매초 ${result.lavender.special.damagePerSecond} 피해를 받습니다.`;
  result.blue.basicAttack.descriptionEn = `Throws a fast marble up to ${result.blue.bulletRange} tiles, dealing ${result.blue.bulletDamage} damage and ${result.blue.bulletKnockback} tiles of knockback.`;
  result.yellow.basicAttack.description += ` 적중 시 ${result.yellow.shockDuration}초 동안 이동속도를 ${result.yellow.shockSlowPercent*100}% 감소시킵니다.`;
  result.yellow.basicAttack.descriptionEn += ` Hits slow enemies by ${result.yellow.shockSlowPercent*100}% for ${result.yellow.shockDuration} seconds.`;
  result.gold.basicAttack.description += ` 단계별 피해는 ${result.gold.stage1Damage} / ${result.gold.stage2Damage} / ${result.gold.stage3Damage}입니다.`;
  result.gold.basicAttack.descriptionEn += ` Stage damage: ${result.gold.stage1Damage} / ${result.gold.stage2Damage} / ${result.gold.stage3Damage}.`;
  result.gold.ultimate.description += ` 설치 대기는 ${result.gold.ultimate.delay}초이며, 장판 안 적에게 ${result.gold.ultimate.tickInterval}초마다 ${result.gold.ultimate.tickDamage} 피해를 줍니다.`;
  result.gold.ultimate.descriptionEn += ` Activates after ${result.gold.ultimate.delay} seconds and deals ${result.gold.ultimate.tickDamage} damage to enemies inside every ${result.gold.ultimate.tickInterval} seconds.`;
  result.ivory.basicAttack.description = `0~${result.ivory.iceCreamRange}타일 안의 조준한 위치에 아이스크림을 던집니다. 착탄 시 ${result.ivory.iceCreamDamage} 피해를 주고, 반경 ${result.ivory.iceCreamZoneRadius}타일에 ${result.ivory.iceCreamZoneDuration}초 동안 ${result.ivory.iceCreamZoneTickInterval}초마다 ${result.ivory.iceCreamZoneDamage} 피해를 주는 장판을 만듭니다. 장판 피해는 중첩되지 않습니다.`;
  result.ivory.basicAttack.descriptionEn = `Throws ice cream at an aimed position within ${result.ivory.iceCreamRange} tiles, including at your feet. It deals ${result.ivory.iceCreamDamage} impact damage and leaves a ${result.ivory.iceCreamZoneRadius}-tile-radius zone for ${result.ivory.iceCreamZoneDuration} seconds that deals ${result.ivory.iceCreamZoneDamage} damage every ${result.ivory.iceCreamZoneTickInterval} seconds. Zone damage does not stack.`;
  result.ivory.ultimate.description = `0~${result.ivory.ultimate.castRange}타일 안의 조준한 위치를 중심으로 중앙과 대각선 네 방향에 아이스크림 5개를 던집니다. 착탄 피해는 ${result.ivory.iceCreamDamage}, 장판 피해는 ${result.ivory.iceCreamZoneTickInterval}초마다 ${result.ivory.iceCreamZoneDamage}입니다. 장판 피해는 중첩되지 않습니다.`;
  result.ivory.ultimate.descriptionEn = `Aims the center within ${result.ivory.ultimate.castRange} tiles, including at your feet, and throws five ice creams in a diagonal pattern. Each deals ${result.ivory.iceCreamDamage} impact damage and leaves a non-stacking zone dealing ${result.ivory.iceCreamZoneDamage} damage every ${result.ivory.iceCreamZoneTickInterval} seconds.`;
  result.orange.orangeUltimateEnabled = true;
  result.purple.purpleUltimateEnabled = true;
  return result;
}
