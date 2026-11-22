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
//  - Raspberry (2026-11-07): basic bind 1.6 → 2.0 s (raspberry.js). Chartreuse → Raspberry fell to 238-2, so
//    Chartreuse shots fly faster (22 → 26) and reload faster (1.2 → 1.1 s): 240-0 again, Red → Chartreuse stays 240-0.
//  - Chartreuse (2026-11-07): range 9.5 → 11, damage 1320 → 1380, enhanced 2640 → 2760 (more than this lets
//    Chartreuse beat Red). Keeps Red → Chartreuse and Chartreuse → Raspberry at 240-0.
//    Ultimate damage bonus +25% → +50% (both links still 240-0).
//  - 2026-11-08: the 11.07 simulation-based package was rolled back (live Champions results disagreed).
//    Nerfs for characters strong in both live results and simulation: Ivory impact 1800 → 1600 and reload
//    0.9 → 1.05 s; Azure 11500 → 10500 HP (ultimate untouched). Yellow → Ivory → Salmon and Green → Azure →
//    Lavender stay 240-0.
//    Azure's wave ultimate was too hard to land: range 6 → 10, width 4 → 5 (still 240-0).
export const BETA9_BALANCE = Object.freeze({
  // Nerfs: ahead in 3v3.
  // 11.12 (before Champions round 4): smaller zone 4 → 3.5, range 9 → 9.5 keeps Ivory → Salmon 240-0.
  ivory: { iceCreamZoneRadius: 3.5, iceCreamRange: 9.5, iceCreamZoneDamage: 1300, iceCreamDamage: 1600, reloadDuration: 1.05, ultimate: { zoneRadius: 4 } },
  // 11.22: Purple's leap hits 5000 at takeoff and landing; the 16 thorns fly forward in a 60-degree fan until a wall.
  purple: { ultimate: { damage: 5000, projectileRange: 60, projectileSpread: Math.PI / 3 } },
  // 11.22: reload 0.9 → 1.1 s per ammo (beta and official).
  red: { attackDamage: 2000, reloadDuration: 1.1, attackRange: 4, moveSpeedMultiplier: 1.25, botIdealDistance: 3, ultimate: { damageReduction: .75, duration: 4 } },
  // Orange's ultimate charges by fixed shares: 10% per orange hit, 5% per juice hit (they add up).
  orange: { maxHealth: 3400, ultimateChargeShare: { bomb: .1, juice: .05 } },
  // Buffs: behind in 3v3.
  // 2026-11-04: faster throw (windup 0.36 → 0.22 s, speed 20 → 26, impact radius 1.75 → 2.3) so Salmon can
  // land hits on Orange (1v1 55-185 → 152-88); the beta page plays the throw clip faster to match.
  salmon: { maxHealth: 7200, directDamage: 2700, throwSpeed: 26, throwWindup: .22, impactRadius: 2.3, attackCooldown: 1.5, salmonAirborneDuration: 2.4, pursuesWhileLowHealth: true, attackPerceptionMinRange: 7.8 },
  green: { maxHealth: 9600 },
  // Mint's three-shot burst fans out: side shots 10% of a right angle (9°) off the aim line.
  // 2026-11-03: faster burst (120 → 80 ms), no windup, 0.55 s between attacks and a 4-unit ultimate
  // (was 7; the field was cast 0.01–0.18 times per 3v3 match).
  mint: { maxHealth: 8600, freezeThreshold: 75, iceBulletDamage: 1200, moveSpeedMultiplier: 1.15, burstSpreadAngle: Math.PI / 20,
    burstIntervalMs: 80, attackWindup: 0, attackCooldown: .55,
    // Standing 3 s on the field freezes (25 ice/s vs 75); no ice builds while frozen, so freezes re-apply after thawing.
    iceBlockedWhileFrozen: true, special: { chargeRequired: 4, icePerSecond: 25 } },
  // Yellow's orb was hard to land (18% in 3v3): no release delay, 0.5 hitbox (was 0.2), speed 30.
  // 11.17 (Champions round-3 out): orb 2500 → 2700; the bot powers a circuit only when an enemy is near a connection.
  yellow: { electricSpeed: 30, maxHealth: 6800, electricDamage: 2700, electricRange: 14, shockSlowPercent: .4, attackDelay: 0, attackWindup: 0, electricRadius: .5, botCircuitOnlyOnEnemies: true },
  // 11.17 (Champions round-3 out): circle 4.5 → 5 tiles, damage 2200 → 2400, heal 1400 → 1500, Encore 12 → 10.
  // (Backing off at low health was tried and dropped: it lost Pink → Purple in 1v1.)
  pink: { healCircleRange: 5, healCircleDamage: 2400, healCircleHeal: 1500, ultimate: { chargeRequired: 10 } },
  cyan: { spreadLineDamage: 1000, maxHealth: 8200 },
  chartreuse: { chartreuseSpeed: 26, reloadDuration: 1.1, chartreuseRange: 11, chartreuseDamage: 1380, chartreuseEnhancedDamage: 2760, ultimate: { damageMultiplier: 1.5 } },
  crimson: { maxHealth: 13000, attackCooldown: .6 },
  // Tanks (Red, Crimson, Azure, Pink) keep fighting at low health; Azure was the only one retreating.
  // Big Wave (11.12): reaches the edge of any arena (80 tiles, the wave ends at the arena boundary), through walls, hitting everyone.
  azure: { maxHealth: 10500, pursuesWhileLowHealth: true, ultimate: { range: 80, width: 5 } },
  crystal: { maxHealth: 6600 },
  // 11.10 Gold rework: back to a damage dealer. Big ore, faster and wider; split ore skips targets the same attack already hit; projectile defense 1650 -> 900.
  // 11.12: Blue reload 0.5 → 0.3 s per ammo (bottom of the 1v1 gadget runs; Crimson → Blue and Blue → Orange stay 240-0).
  blue: { reloadDuration: 0.3 },
  gold: { maxHealth: 7000, stage1Damage: 3400, stage2Damage: 1700, stage3Damage: 850, stage1Speed: 26, stage1Size: 2.6, stage1SplashRadius: 2,
    goldSplitsSkipHitTargets: true, projectileDamageReduction: 900, ultimate: { radius: 4.5 } },
});

const replaceText = (object, key, pairs) => {
  if (typeof object?.[key] !== 'string') return;
  for (const [from, to] of pairs) object[key] = object[key].replaceAll(from, to);
};

export function applyBeta9Balance(characters) {
  const merge = (target, patch) => { for (const [key, value] of Object.entries(patch)) { if (value && typeof value === 'object' && !Array.isArray(value)) merge(target[key] ??= {}, value); else target[key] = value; } };
  for (const [id, patch] of Object.entries(BETA9_BALANCE)) if (characters[id]) merge(characters[id], patch);
  const { ivory, mint, cyan, salmon, red, gold, yellow, orange } = characters;
  if (characters.chartreuse) {
    replaceText(characters.chartreuse.ultimate, 'description', [['피해가 25% 증가', '피해가 50% 증가']]);
    replaceText(characters.chartreuse.ultimate, 'descriptionEn', [['increased by 25%', 'increased by 50%']]);
  }
  if (orange) replaceText(orange.basicAttack, 'description', [[' 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다.', ' 오렌지 적중은 궁극기를 10%, 과즙은 하나당 5% 충전하며 함께 맞으면 더해집니다.']]);
  if (yellow) {
    replaceText(yellow.basicAttack, 'description', [['이동속도를 25% 감소', '이동속도를 40% 감소']]);
    replaceText(yellow.basicAttack, 'descriptionEn', [['by 25%', 'by 40%']]);
  }
  if (gold) {
    replaceText(gold.ultimate, 'description', [['반경 6타일 장판', '반경 4.5타일 장판']]);
    replaceText(gold.ultimate, 'descriptionEn', [['6-tile', '4.5-tile']]);
    replaceText(gold.basicAttack, 'description', [['2×2타일', '2.6×2.6타일'], ['1300 / 600 / 300입니다.', '3400 / 1700 / 850입니다. 분열탄과 금괴는 같은 공격에 이미 맞은 적을 통과합니다.'], ['1650 감소', '900 감소']]);
    replaceText(gold.basicAttack, 'descriptionEn', [['2x2', '2.6x2.6'], ['1300 / 600 / 300.', '3400 / 1700 / 850. Fragments and bars pass through enemies the same attack already hit.'], ['by 1650', 'by 900']]);
  }
  if (red) {
    replaceText(red.ultimate, 'description', [['8초 동안 피해를 60% 감소', '4초 동안 피해를 75% 감소']]);
    replaceText(red.ultimate, 'descriptionEn', [['by 60% for 8 seconds', 'by 75% for 4 seconds']]);
  }
  if (characters.purple) {
    replaceText(characters.purple.ultimate, 'description', [['즉시 1000 피해', '즉시 5000 피해'], ['가시 16발을 사방으로 발사합니다. 가시는 사거리 10타일,', '가시 16발을 바라보는 방향 60도 부채꼴로 발사합니다. 가시는 벽에 닿을 때까지 날아가고,']]);
    replaceText(characters.purple.ultimate, 'descriptionEn', [['deals 1000 damage', 'deals 5000 damage'], ['fires 16 thorns from the center. Each thorn deals 550 damage with 10-tile range;', 'fires 16 thorns forward in a 60-degree fan. Each thorn flies until it hits a wall and deals 550 damage;']]);
  }
  if (ivory) {
    replaceText(ivory.basicAttack, 'description', [['착탄 시 2400 피해를 주고, 반경 5타일에 4초 동안 1초마다 2600 피해', '착탄 시 1600 피해를 주고, 반경 3.5타일에 4초 동안 1초마다 1300 피해'], ['0~9타일', '0~9.5타일']]);
    replaceText(ivory.basicAttack, 'descriptionEn', [['It deals 2400 impact damage and leaves a 5-tile-radius zone for 4 seconds that deals 2600 damage', 'It deals 1600 impact damage and leaves a 3.5-tile-radius zone for 4 seconds that deals 1300 damage'], ['within 9 tiles', 'within 9.5 tiles']]);
    replaceText(ivory.ultimate, 'description', [['착탄 피해는 2400, 장판 피해는 1초마다 2600', '착탄 피해는 1600, 장판 피해는 1초마다 1300']]);
    replaceText(ivory.ultimate, 'descriptionEn', [['Each deals 2400 impact damage', 'Each deals 1600 impact damage'], ['dealing 2600 damage every 1 seconds', 'dealing 1300 damage every 1 seconds']]);
  }
  if (mint) {
    replaceText(mint.special, 'description', [['매초 563 피해와 얼음 수치 5를 받습니다.', '매초 563 피해와 얼음 수치 25를 받아, 장판 위에 3초 있으면 빙결됩니다. 빙결 중에는 얼음이 쌓이지 않고 풀린 뒤 다시 쌓입니다.']]);
    replaceText(mint.special, 'descriptionEn', [['plus 5 ice each second.', 'plus 25 ice each second, so 3 seconds on it freezes them. No ice builds while frozen; it builds again after thawing.']]);
    replaceText(mint.basicAttack, 'description', [['100이 되면', '75가 되면'], ['3발 연속 발사합니다.', '3발 연속 발사합니다. 3발은 좌우 9도로 부채꼴처럼 퍼져 나갑니다.']]);
    replaceText(mint.basicAttack, 'descriptionEn', [['at 100,', 'at 75,'], ['in succession.', 'in succession, fanning out 9° to each side.']]);
  }
  if (characters.azure) {
    replaceText(characters.azure.ultimate, 'description', [['큰 파도를 전방으로 보내', '큰 파도를 맵 끝까지 폭 5타일로, 벽을 뚫고 보내']]);
    replaceText(characters.azure.ultimate, 'descriptionEn', [['Launches a huge wave', 'Launches a huge 5-wide wave through walls to the edge of the arena']]);
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

// Official Season 1 only (official.html), applied after applyBeta9Balance; the beta page keeps the Season 9 values.
//  - 2026-11-22: Red's guard 4 → 2 s (Red led the official 1v1 bot league at 82.5% with gadgets on).
export const OFFICIAL_BALANCE = Object.freeze({
  red: { ultimate: { duration: 2 } },
});

export function applyOfficialBalance(characters) {
  const red = characters.red;
  if (red) {
    const before = red.ultimate.duration;
    red.ultimate.duration = OFFICIAL_BALANCE.red.ultimate.duration;
    replaceText(red.ultimate, 'description', [[`${before}초 동안`, `${red.ultimate.duration}초 동안`]]);
    replaceText(red.ultimate, 'descriptionEn', [[`for ${before} seconds`, `for ${red.ultimate.duration} seconds`]]);
  }
  return characters;
}
