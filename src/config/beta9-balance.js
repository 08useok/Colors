// Beta Season 9 emergency balance (2026-11-02), applied on top of applyBeta8Balance on the beta page only.
// Main Season 8 keeps the Beta 8 values. Basis: 3v3 Knockout/Gem Grab simulation
// (tools/simulate-beta9-team-modes.mjs). Applied without a full re-verification by request; see
// specs/beta-season-9.md.
export const BETA9_BALANCE = Object.freeze({
  // Nerfs: far ahead in 3v3.
  ivory: { iceCreamZoneRadius: 4, iceCreamZoneDamage: 2000 },
  red: { maxHealth: 8000 },
  // Buffs: far behind in 3v3.
  salmon: { maxHealth: 8800 },
  green: { maxHealth: 9600 },
  mint: { maxHealth: 7800, freezeThreshold: 75 },
  yellow: { electricSpeed: 22 },
  cyan: { spreadLineDamage: 850, maxHealth: 7400 },
});

const replaceText = (object, key, pairs) => {
  if (typeof object?.[key] !== 'string') return;
  for (const [from, to] of pairs) object[key] = object[key].replaceAll(from, to);
};

export function applyBeta9Balance(characters) {
  for (const [id, patch] of Object.entries(BETA9_BALANCE)) if (characters[id]) Object.assign(characters[id], patch);
  const { ivory, mint, cyan } = characters;
  if (ivory) {
    replaceText(ivory.basicAttack, 'description', [['반경 5타일에 4초 동안 1초마다 2600 피해', '반경 4타일에 4초 동안 1초마다 2000 피해']]);
    replaceText(ivory.basicAttack, 'descriptionEn', [['5-tile-radius zone for 4 seconds that deals 2600 damage', '4-tile-radius zone for 4 seconds that deals 2000 damage']]);
    replaceText(ivory.ultimate, 'description', [['장판 피해는 1초마다 2600', '장판 피해는 1초마다 2000']]);
    replaceText(ivory.ultimate, 'descriptionEn', [['dealing 2600 damage every 1 seconds', 'dealing 2000 damage every 1 seconds']]);
  }
  if (mint) {
    replaceText(mint.basicAttack, 'description', [['100이 되면', '75가 되면']]);
    replaceText(mint.basicAttack, 'descriptionEn', [['at 100,', 'at 75,']]);
  }
  if (cyan) {
    replaceText(cyan.basicAttack, 'description', [['알약당 700 피해', '알약당 850 피해']]);
    replaceText(cyan.basicAttack, 'descriptionEn', [['Each deals 700 damage', 'Each deals 850 damage']]);
  }
  return characters;
}
