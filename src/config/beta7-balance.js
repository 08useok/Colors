import { applyBeta6Balance } from './beta6-balance.js';

// Season 7 only: weak (~10%) nudge on top of the beta6 overlay, based on the S6 simulation ranking.
// Nerfs: orange, blue, red, purple, green. Buffs: gold, ivory, pink, chartreuse.
export const BETA7_BALANCE = {
  orange: { maxHealth: 4000, bombSplashDamage: 1170 },
  blue: { bulletDamage: 1080, bulletRange: 16 },
  red: { maxHealth: 9000, attackDamage: 2160 },
  purple: { poisonDPS: 820, vialDamage: 2920 },
  green: { maxHealth: 7600, boomerangDamage: 1710 },
  gold: { maxHealth: 8200, stage1Damage: 990, stage2Damage: 495, stage3Damage: 250 },
  ivory: { maxHealth: 6600, iceCreamDamage: 2200 },
  pink: { maxHealth: 9900, healCircleDamage: 2200 },
  chartreuse: { maxHealth: 6800, chartreuseDamage: 1320, chartreuseEnhancedDamage: 2640 },
};

export function applyBeta7Balance(source) {
  const result = applyBeta6Balance(source);
  for (const [id, patch] of Object.entries(BETA7_BALANCE)) Object.assign(result[id], patch);
  result.blue.basicAttack.description = `사거리 ${result.blue.bulletRange}타일의 구슬을 빠르게 던져 ${result.blue.bulletDamage} 피해와 ${result.blue.bulletKnockback}타일 넉백을 줍니다.`;
  result.blue.basicAttack.descriptionEn = `Throws a fast marble up to ${result.blue.bulletRange} tiles, dealing ${result.blue.bulletDamage} damage and ${result.blue.bulletKnockback} tiles of knockback.`;
  result.ivory.basicAttack.description = `최대 사거리 ${result.ivory.iceCreamRange}타일에 아이스크림을 던집니다. 착탄 시 ${result.ivory.iceCreamDamage} 피해를 주고, 반경 ${result.ivory.iceCreamZoneRadius}타일에 ${result.ivory.iceCreamZoneDuration}초 동안 ${result.ivory.iceCreamZoneTickInterval}초마다 ${result.ivory.iceCreamDamage} 피해를 주는 장판을 만듭니다. 장판 피해는 중첩되지 않습니다.`;
  result.ivory.basicAttack.descriptionEn = `Throws ice cream up to ${result.ivory.iceCreamRange} tiles. It deals ${result.ivory.iceCreamDamage} impact damage and leaves a ${result.ivory.iceCreamZoneRadius}-tile-radius zone for ${result.ivory.iceCreamZoneDuration} seconds that deals ${result.ivory.iceCreamDamage} damage every ${result.ivory.iceCreamZoneTickInterval} seconds. Zone damage does not stack.`;
  return result;
}
