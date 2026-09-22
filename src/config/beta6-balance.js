import { BETA_CHARACTERS } from './beta-characters.js';

// Only the beta6 page consumes this overlay. Other seasons keep their source values.
export const BETA6_BALANCE = {
  red: { attackDamage: 2400, ultimateChargeOnHit: 2, pursuesWhileLowHealth: true },
  blue: { bulletDamage: 1200, bulletRange: 17.5, bulletSpeed: 68.75, bulletKnockback: 1.5, attackPerceptionMinRange: 10, attackPerceptionRange: 16, ultimateUseHealthMin: 0.1, ultimateUseHealthMax: 0.25, dashAwayFromTarget: true, special: { chargeRequired: 3 } },
  green: { boomerangDamage: 1900 },
  orange: { maxHealth: 4400, bombSplashDamage: 1300 },
  purple: { needleDamage: 1100, poisonDPS: 912, vialDamage: 3240 },
  pink: { maxHealth: 9000, healCircleDamage: 2000, pursuesWhileLowHealth: true },
  crimson: { maxHealth: 10500, ultimateChargeRequired: 7, ultimateDamage: 5400, pursuesWhileLowHealth: true, projectileDodgeDuration: 0.18, projectileDodgeSpeedMultiplier: 5, projectileDodgeForwardFactor: 0.6, projectileDodgeDetectionRange: 20 },
  gold: { maxHealth: 7500, attackCooldown: 1.5, projectileDamageReduction: 650, stage1Damage: 900, stage2Damage: 450, stage3Damage: 225, ultimateChargeRequired: 6 },
  ivory: { maxHealth: 6000, reloadDuration: 0.9, iceCreamDamage: 2000, iceCreamRange: 6, iceCreamSpeed: 25, iceCreamZoneTickInterval: 0.5, ultimate: { chargeRequired: 3 } },
  chartreuse: { projectileSize: 3, ultimate: { chargeRequired: 4 } },
  azure: { maxHealth: 10500, reloadDuration: 0.65, surfSpeed: 17, approachSurfRange: 18, approachSurfDistance: 4, approachSurfCooldown: 0.5, ultimate: { chargeRequired: 2 } },
  cyan: { ultimate: { damage: 3120 } },
  yellow: { attackCooldown: 0.3, ultimate: { connectionDamage: 1200, deviceThrowSpeed: 14, deviceInstallDelay: 0.35 } },
  mint: { special: { damagePerSecond: 450 } },
};

export function applyBeta6Balance(source = BETA_CHARACTERS) {
  const result = structuredClone(source);
  for (const [id, patch] of Object.entries(BETA6_BALANCE)) {
    const { ultimate, special, ...stats } = patch;
    Object.assign(result[id], stats);
    if (ultimate) Object.assign(result[id].ultimate, ultimate);
    if (special) Object.assign(result[id].special, special);
  }
  result.azure.ultimate.description = `큰 파도를 전방으로 보내 ${result.azure.ultimate.damage} 피해와 강한 넉백을 줍니다. 애저 본인은 이동하지 않습니다.`;
  result.azure.ultimate.descriptionEn = `Launches a huge wave dealing ${result.azure.ultimate.damage} damage and knockback while Azure remains in place.`;
  result.red.ultimate.description = `${result.red.ultimate.duration}초 동안 피해를 ${Math.round(result.red.ultimate.damageReduction * 100)}% 감소시키는 보호막을 생성합니다. 피해를 받을 때마다 궁극기가 ${result.red.ultimateChargeOnHit}칸 충전됩니다.`;
  result.red.ultimate.descriptionEn = `Creates a shield that reduces damage taken by ${Math.round(result.red.ultimate.damageReduction * 100)}% for ${result.red.ultimate.duration} seconds. Taking a hit charges ${result.red.ultimateChargeOnHit} ultimate units.`;
  result.blue.basicAttack.description = `사거리 ${result.blue.bulletRange}타일의 구슬을 빠르게 던져 ${result.blue.bulletDamage} 피해와 ${result.blue.bulletKnockback}타일 넉백을 줍니다.`;
  result.blue.basicAttack.descriptionEn = `Throws a fast marble up to ${result.blue.bulletRange} tiles, dealing ${result.blue.bulletDamage} damage and ${result.blue.bulletKnockback} tiles of knockback.`;
  result.azure.basicAttack.description = `파도를 타고 전방 2타일 이동하며, 앞쪽 ${result.azure.surfLength}×${result.azure.surfWidth}타일 범위의 적에게 ${result.azure.surfDamage} 피해를 줍니다.`;
  result.azure.basicAttack.descriptionEn = `Rides a wave two tiles forward and deals ${result.azure.surfDamage} damage in a ${result.azure.surfLength}-by-${result.azure.surfWidth}-tile area ahead.`;
  result.ivory.basicAttack.description = `최대 사거리 ${result.ivory.iceCreamRange}타일에 아이스크림을 던집니다. 착탄 시 ${result.ivory.iceCreamDamage} 피해를 주고, 반경 ${result.ivory.iceCreamZoneRadius}타일에 ${result.ivory.iceCreamZoneDuration}초 동안 ${result.ivory.iceCreamZoneTickInterval}초마다 ${result.ivory.iceCreamDamage} 피해를 주는 장판을 만듭니다. 장판 피해는 중첩되지 않습니다.`;
  result.ivory.basicAttack.descriptionEn = `Throws ice cream up to ${result.ivory.iceCreamRange} tiles. It deals ${result.ivory.iceCreamDamage} impact damage and leaves a ${result.ivory.iceCreamZoneRadius}-tile-radius zone for ${result.ivory.iceCreamZoneDuration} seconds that deals ${result.ivory.iceCreamDamage} damage every ${result.ivory.iceCreamZoneTickInterval} seconds. Zone damage does not stack.`;
  result.mint.special.description = `지정한 위치에 10초 동안 반경 9타일의 얼음 장판을 생성합니다. 적은 미끄러지며 매초 ${result.mint.special.damagePerSecond} 피해와 얼음 수치 5를 받습니다.`;
  result.yellow.ultimate.description = `장치를 목표 지점으로 던지고 ${result.yellow.ultimate.deviceInstallDelay}초 설치 대기 후 사용할 수 있습니다. 장치가 2개 이상일 때 일반 공격으로 맞히면 설치 순서대로 전기가 흐르며 구간당 ${result.yellow.ultimate.connectionDamage} 피해를 줍니다.`;
  return result;
}

export function beta6Ultimate(d, id) {
  if (id === 'orange' || id === 'purple') return null; // Released in later seasons.
  if (id === 'crimson') return { ...d.ultimate, damage: d.ultimateDamage, range: d.ultimateLength, width: d.ultimateWidth, knockback: d.ultimateKnockback, chargeRequired: d.ultimateChargeRequired };
  if (id === 'gold') return { ...d.ultimate, chargeRequired: d.ultimateChargeRequired };
  return d.special || d.ultimate || null;
}
