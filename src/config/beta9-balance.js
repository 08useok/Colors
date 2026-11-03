// Beta Season 9 emergency balance, applied on top of applyBeta8Balance on the beta page only.
// Main Season 8 keeps the Beta 8 values. Basis: 3v3 Knockout/Gem Grab simulation
// (tools/simulate-beta9-team-modes.mjs). Applied without counter-cycle re-verification by request;
// see specs/beta-season-9.md.
//  - Patch 1 (2026-11-02): first pass from the 3v3 results.
//  - Patch 2 (2026-11-03): second pass after re-running the 3v3 simulation on patch 1.
//  - Patch 3 (2026-11-03): third pass (Salmon switched from health to throw speed/attack interval).
//  - Cycle fix (2026-11-03): Salmon 8200 HP, Gold 7000 HP, Crystal 6600 HP restore all 18 links.
//  - Tank fix (2026-11-03): Red keeps its 9000 HP (tank identity); nerfed via punch 2000, reach 4 and a
//    stronger but shorter guard (75% for 4 s instead of 60% for 8 s). Speed 1.15 → 1.25 and a bot spacing of
//    3 tiles (was a fixed 3.5 tuned for the old 5.5 reach) keep Red → Chartreuse at 240-0.
//  - Salmon (2026-11-03): enemies stay airborne twice as long (1.2 → 2.4 s), basic and ultimate. To keep
//    Ivory → Salmon → Gold at 240-0: Salmon 7200 HP, bot keeps 7.8 tiles and chases at low health,
//    Ivory's zone stays 4 s, Gold's ultimate field radius 6 → 4.5.
export const BETA9_BALANCE = Object.freeze({
  // Nerfs: ahead in 3v3.
  ivory: { iceCreamZoneRadius: 4, iceCreamZoneDamage: 1300, iceCreamDamage: 1800 },
  red: { attackDamage: 2000, attackRange: 4, moveSpeedMultiplier: 1.25, botIdealDistance: 3, ultimate: { damageReduction: .75, duration: 4 } },
  orange: { maxHealth: 3400 },
  // Buffs: behind in 3v3.
  salmon: { maxHealth: 7200, directDamage: 2700, throwSpeed: 20, attackCooldown: 1.5, salmonAirborneDuration: 2.4, pursuesWhileLowHealth: true, attackPerceptionMinRange: 7.8 },
  green: { maxHealth: 9600 },
  // Mint's three-shot burst fans out: side shots 10% of a right angle (9°) off the aim line.
  // 2026-11-03: faster burst (120 → 80 ms), no windup, 0.55 s between attacks and a 4-unit ultimate
  // (was 7; the field was cast 0.01–0.18 times per 3v3 match).
  mint: { maxHealth: 8600, freezeThreshold: 75, iceBulletDamage: 1200, moveSpeedMultiplier: 1.15, burstSpreadAngle: Math.PI / 20,
    burstIntervalMs: 80, attackWindup: 0, attackCooldown: .55,
    // Standing 3 s on the field freezes (25 ice/s vs 75); no ice builds while frozen, so freezes re-apply after thawing.
    iceBlockedWhileFrozen: true, special: { chargeRequired: 4, icePerSecond: 25 } },
  yellow: { electricSpeed: 22, maxHealth: 6800, electricDamage: 2500 },
  cyan: { spreadLineDamage: 1000, maxHealth: 8200 },
  crimson: { maxHealth: 11500 },
  // Tanks (Red, Crimson, Azure, Pink) keep fighting at low health; Azure was the only one retreating.
  azure: { maxHealth: 11500, pursuesWhileLowHealth: true },
  crystal: { maxHealth: 6600 },
  gold: { maxHealth: 7000, ultimate: { radius: 4.5 } },
});

const replaceText = (object, key, pairs) => {
  if (typeof object?.[key] !== 'string') return;
  for (const [from, to] of pairs) object[key] = object[key].replaceAll(from, to);
};

export function applyBeta9Balance(characters) {
  const merge = (target, patch) => { for (const [key, value] of Object.entries(patch)) { if (value && typeof value === 'object' && !Array.isArray(value)) merge(target[key] ??= {}, value); else target[key] = value; } };
  for (const [id, patch] of Object.entries(BETA9_BALANCE)) if (characters[id]) merge(characters[id], patch);
  const { ivory, mint, cyan, salmon, red, gold } = characters;
  if (gold) {
    replaceText(gold.ultimate, 'description', [['반경 6타일 장판', '반경 4.5타일 장판']]);
    replaceText(gold.ultimate, 'descriptionEn', [['6-tile', '4.5-tile']]);
  }
  if (red) {
    replaceText(red.ultimate, 'description', [['8초 동안 피해를 60% 감소', '4초 동안 피해를 75% 감소']]);
    replaceText(red.ultimate, 'descriptionEn', [['by 60% for 8 seconds', 'by 75% for 4 seconds']]);
  }
  if (ivory) {
    replaceText(ivory.basicAttack, 'description', [['착탄 시 2400 피해를 주고, 반경 5타일에 4초 동안 1초마다 2600 피해', '착탄 시 1800 피해를 주고, 반경 4타일에 4초 동안 1초마다 1300 피해']]);
    replaceText(ivory.basicAttack, 'descriptionEn', [['It deals 2400 impact damage and leaves a 5-tile-radius zone for 4 seconds that deals 2600 damage', 'It deals 1800 impact damage and leaves a 4-tile-radius zone for 4 seconds that deals 1300 damage']]);
    replaceText(ivory.ultimate, 'description', [['착탄 피해는 2400, 장판 피해는 1초마다 2600', '착탄 피해는 1800, 장판 피해는 1초마다 1300']]);
    replaceText(ivory.ultimate, 'descriptionEn', [['Each deals 2400 impact damage', 'Each deals 1800 impact damage'], ['dealing 2600 damage every 1 seconds', 'dealing 1300 damage every 1 seconds']]);
  }
  if (mint) {
    replaceText(mint.special, 'description', [['매초 563 피해와 얼음 수치 5를 받습니다.', '매초 563 피해와 얼음 수치 25를 받아, 장판 위에 3초 있으면 빙결됩니다. 빙결 중에는 얼음이 쌓이지 않고 풀린 뒤 다시 쌓입니다.']]);
    replaceText(mint.special, 'descriptionEn', [['plus 5 ice each second.', 'plus 25 ice each second, so 3 seconds on it freezes them. No ice builds while frozen; it builds again after thawing.']]);
    replaceText(mint.basicAttack, 'description', [['100이 되면', '75가 되면'], ['3발 연속 발사합니다.', '3발 연속 발사합니다. 3발은 좌우 9도로 부채꼴처럼 퍼져 나갑니다.']]);
    replaceText(mint.basicAttack, 'descriptionEn', [['at 100,', 'at 75,'], ['in succession.', 'in succession, fanning out 9° to each side.']]);
  }
  if (cyan) {
    replaceText(cyan.basicAttack, 'description', [['알약당 700 피해', '알약당 1000 피해']]);
    replaceText(cyan.basicAttack, 'descriptionEn', [['Each deals 700 damage', 'Each deals 1000 damage']]);
  }
  if (salmon) {
    replaceText(salmon.basicAttack, 'description', [['가장 가까운 적 1명에게 3000 피해', '가장 가까운 적 1명에게 3300 피해'], ['1.2초 포획', '2.4초 포획'], ['1.2초간 띄운', '2.4초간 띄운']]);
    replaceText(salmon.ultimate, 'description', [['1.2초 포획', '2.4초 포획']]);
  }
  return characters;
}
