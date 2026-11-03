// Beta Season 9 emergency balance, applied on top of applyBeta8Balance on the beta page only.
// Main Season 8 keeps the Beta 8 values. Basis: 3v3 Knockout/Gem Grab simulation
// (tools/simulate-beta9-team-modes.mjs). Applied without counter-cycle re-verification by request;
// see specs/beta-season-9.md.
//  - Patch 1 (2026-11-02): first pass from the 3v3 results.
//  - Patch 2 (2026-11-03): second pass after re-running the 3v3 simulation on patch 1.
//  - Patch 3 (2026-11-03): third pass (Salmon switched from health to throw speed/attack interval).
export const BETA9_BALANCE = Object.freeze({
  // Nerfs: ahead in 3v3.
  ivory: { iceCreamZoneRadius: 4, iceCreamZoneDamage: 1300, iceCreamDamage: 1800 },
  red: { maxHealth: 6800, attackDamage: 2200 },
  orange: { maxHealth: 3400 },
  // Buffs: behind in 3v3.
  salmon: { maxHealth: 9000, directDamage: 2700, throwSpeed: 20, attackCooldown: 1.5 },
  green: { maxHealth: 9600 },
  mint: { maxHealth: 8600, freezeThreshold: 75, iceBulletDamage: 1200, moveSpeedMultiplier: 1.15 },
  yellow: { electricSpeed: 22, maxHealth: 6800, electricDamage: 2500 },
  cyan: { spreadLineDamage: 1000, maxHealth: 8200 },
  crimson: { maxHealth: 11500 },
  azure: { maxHealth: 11500 },
  crystal: { maxHealth: 7000 },
});

const replaceText = (object, key, pairs) => {
  if (typeof object?.[key] !== 'string') return;
  for (const [from, to] of pairs) object[key] = object[key].replaceAll(from, to);
};

export function applyBeta9Balance(characters) {
  for (const [id, patch] of Object.entries(BETA9_BALANCE)) if (characters[id]) Object.assign(characters[id], patch);
  const { ivory, mint, cyan, salmon } = characters;
  if (ivory) {
    replaceText(ivory.basicAttack, 'description', [['착탄 시 2400 피해를 주고, 반경 5타일에 4초 동안 1초마다 2600 피해', '착탄 시 1800 피해를 주고, 반경 4타일에 4초 동안 1초마다 1300 피해']]);
    replaceText(ivory.basicAttack, 'descriptionEn', [['It deals 2400 impact damage and leaves a 5-tile-radius zone for 4 seconds that deals 2600 damage', 'It deals 1800 impact damage and leaves a 4-tile-radius zone for 4 seconds that deals 1300 damage']]);
    replaceText(ivory.ultimate, 'description', [['착탄 피해는 2400, 장판 피해는 1초마다 2600', '착탄 피해는 1800, 장판 피해는 1초마다 1300']]);
    replaceText(ivory.ultimate, 'descriptionEn', [['Each deals 2400 impact damage', 'Each deals 1800 impact damage'], ['dealing 2600 damage every 1 seconds', 'dealing 1300 damage every 1 seconds']]);
  }
  if (mint) {
    replaceText(mint.basicAttack, 'description', [['100이 되면', '75가 되면']]);
    replaceText(mint.basicAttack, 'descriptionEn', [['at 100,', 'at 75,']]);
  }
  if (cyan) {
    replaceText(cyan.basicAttack, 'description', [['알약당 700 피해', '알약당 1000 피해']]);
    replaceText(cyan.basicAttack, 'descriptionEn', [['Each deals 700 damage', 'Each deals 1000 damage']]);
  }
  if (salmon) replaceText(salmon.basicAttack, 'description', [['가장 가까운 적 1명에게 3000 피해', '가장 가까운 적 1명에게 3300 피해']]);
  return characters;
}
