// Official Season 1 balance (official page only; the beta keeps its own numbers).
// Starts from the beta (Season 9) values and switches on at OFFICIAL_BALANCE_START. Goal of the first
// pass: the 20-character natural ring with gadgets on (specs/natural-counter-ring-75-20261112.md) wins
// every link in the 48-game gadget duel set (3 maps × 2 orders × 4 seeds × aim error 0 / 0.08).
export const OFFICIAL_BALANCE_START = Date.parse('2026-11-15T18:10:00+09:00');

export const OFFICIAL_RING = Object.freeze(['lavender', 'purple', 'blue', 'raspberry', 'yellow', 'crystal', 'orange', 'cyan', 'black', 'ivory',
  'salmon', 'red', 'gold', 'green', 'azure', 'crimson', 'pink', 'white', 'chartreuse', 'mint']);

// { characterId: { field: value, nested: { field: value } } } — values replace the beta numbers.
// From tools/tune-official-ring.mjs (specs/official-ring-tuning-20261112.json): 919 / 960 ring duels won.
export const OFFICIAL_BALANCE = Object.freeze({
  lavender: { maxHealth: 5000, sprayDamage: 1210 },
  purple: { moveSpeedMultiplier: 0.83 },
  blue: { bulletRange: 16.67 },
  raspberry: { maxHealth: 5280, vineDamage: 2480 },
  yellow: { moveSpeedMultiplier: 1.1 },
  crystal: { crystalDamage: 2400 },
  orange: { moveSpeedMultiplier: 1.1, bombDamage: 680 },
  cyan: { spreadLineDamage: 910 },
  black: { attackRange: 2.5, attackDamage: 2200 },
  salmon: { attackRange: 6.44 },
  red: { moveSpeedMultiplier: 1.14, attackDamage: 1670 },
  gold: { moveSpeedMultiplier: 1.2, maxHealth: 8400, stage3Range: 6.6, stage1Damage: 4080 },
  green: { boomerangDamage: 1430, moveSpeedMultiplier: 1.32, boomerangRange: 8.4 },
  azure: { moveSpeedMultiplier: 1.23 },
  crimson: { attackRange: 2.73, reloadDuration: 0.82 },
  chartreuse: { moveSpeedMultiplier: 1.2, maxHealth: 9020, chartreuseRange: 13.2, chartreuseDamage: 1660 },
  mint: { moveSpeedMultiplier: 1.26, reloadDuration: 0.8 },
});

const merge = (target, patch) => {
  for (const [key, value] of Object.entries(patch)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) merge(target[key] ??= {}, value);
    else target[key] = value;
  }
};
// Applies the official numbers in place once the start time has passed (pass now = Infinity to force it in tools).
export function applyOfficialBalance(characters, now = Date.now(), patch = OFFICIAL_BALANCE) {
  if (now < OFFICIAL_BALANCE_START) return characters;
  for (const [id, values] of Object.entries(patch)) if (characters[id]) merge(characters[id], values);
  return characters;
}
