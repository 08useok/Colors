// Season 8 main release (v1.8.0): the main roster must match the beta8 definitions and the
// page must expose every Season 8 entry point. Static checks only; browser QA is recorded separately.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { CHARACTERS as baseline } from '../src/config/characters.js';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta6Balance } from '../src/config/beta6-balance.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { applyBeta8Balance } from '../src/config/beta8-balance.js';
import { SKINS } from '../src/config/skins.js';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const main = read('../src/main.js'), html = read('../index.html'), server = read('../party/server.js');

// 1. Balance block: evaluate it exactly as main.js runs it for Season 8.
const start = main.indexOf('if (["beta6", "beta7", "beta8"].includes(CURRENT_SEASON)) {');
const end = main.indexOf('\nconst ALPHA_SEASONS', start);
assert(start >= 0 && end > start, 'balance block');
const context = vm.createContext({ CURRENT_SEASON: 'beta8', CHARACTERS: structuredClone(baseline), BETA_CHARACTERS, applyBeta6Balance, applyBeta7Balance, applyBeta8Balance });
vm.runInContext(main.slice(start, end), context);
const expected = applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS));
const ids = Object.keys(expected);
assert.equal(ids.length, 17);
assert.deepEqual(Object.keys(context.CHARACTERS).sort(), [...ids].sort());
for (const id of ids) {
  for (const [key, value] of Object.entries(expected[id])) {
    if (typeof value === 'number') assert.equal(context.CHARACTERS[id][key], value, `${id}.${key}`);
  }
}
// Season 7 main-only tweaks must not leak into Season 8.
assert.equal(context.CHARACTERS.crystal.crystalDamage, expected.crystal.crystalDamage);
assert.equal(context.CHARACTERS.red.moveSpeedMultiplier, 1.15);
assert.equal(context.CHARACTERS.orange.orangeUltimateEnabled, true);
assert.equal(context.CHARACTERS.purple.purpleUltimateEnabled, true);
console.log('PASS: 17 main definitions equal beta8 stats; Season 7 main-only tweaks excluded');

// 2. Entry points on the page.
for (const id of ids) assert(html.includes(`data-char="${id}"`), `select button ${id}`);
for (const id of ['mode-knockout', 'season-quest-toggle', 'season-quest-panel', 'main-season-8-balance-preview']) assert(html.includes(`id="${id}"`), id);
assert(html.includes('src/main.js?v=1.8.0'), 'main cache entry');
const table = html.slice(html.indexOf('id="matchup-table"'), html.indexOf('</table>', html.indexOf('id="matchup-table"')));
assert.equal((table.match(/<tr><th data-character-name=/g) ?? []).length, 17, 'matchup rows');
assert(!html.includes('시즌 8 메인 업데이트 예정'), 'release notes no longer say upcoming');
console.log('PASS: 17 select buttons, KNOCKOUT, quest panel, 17-row matchup table, v1.8.0 notes and cache entry');

// 3. Runtime wiring that has no browser-free test.
assert(main.includes('const BETA_SEASON_8_START_AT = new Date("2026-10-31T00:00:00+09:00")'));
for (const skin of ['beta8_ivory_skeleton', 'beta8_orange_jack_o_lantern', 'beta8_purple_potion_witch', 'beta8_lavender_ghost_bride']) {
  assert(SKINS[skin], skin);
  assert(new RegExp(`${skin}: \\["${SKINS[skin].character}", "${SKINS[skin].character}/skins/`).test(main), `${skin} model folder`);
}
assert(main.includes("allowRevives:()=>!state.knockoutMode"), 'Knockout disables revives');
assert(main.includes('grantRespawnProtection(fighter)'), 'respawn shield');
assert(main.includes('addQuestStats(account.beta8Quests, state.questMatch)'), 'quest progress saved with match result');
assert(!main.includes('window.__debug'), 'debug handle removed');
assert(/PLAYABLE_CHARACTERS = new Set\(\[[^\]]*"salmon"/.test(server), 'server allows Salmon');
console.log('PASS: Season 8 date gate, Halloween skin models, Knockout revives off, respawn shield, quest save, server roster');
