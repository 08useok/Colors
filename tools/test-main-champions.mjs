// Main Champions: rules from opening to the champion, plus the server store's checks (fake Durable Object storage).
// Usage: node tools/test-main-champions.mjs
import assert from 'node:assert/strict';
import { MAIN_CHAMPIONS as R, mainChampionsCrownSkin } from '../src/config/main-champions.js';
import { championsCutAt } from '../src/config/champions-rules.js';

const DAY = 86400000, start = R.start;
assert.equal(new Date(start).toISOString(), '2026-11-16T09:10:00.000Z', 'opens 11.16 18:10 KST');
assert.equal(R.roster.length, 17);
assert.deepEqual([...new Set(R.roster)].length, 17, 'no duplicates');

// Survival: one cut a day per group once there is a new result.
const state = R.create();
assert.equal(state.nextEliminationAt, championsCutAt(start + DAY));
const ticket = (mode, character) => ({ phase: state.phase, round: state.round, mode, character });
function playTeam(mode, now, winners) {
  const roster = R.rosterFor(state, mode), a = roster.slice(0, 3), b = roster.slice(3, 6);
  const participants = [...a.map(c => ({ character: c, team: 'a', damage: 1000, kills: 1 })), ...b.map(c => ({ character: c, team: 'b', damage: 500, kills: 0 }))];
  return R.record(state, ticket(mode, a[0]), { won: winners === 'a', draw: false, abandoned: false, damage: 1000, kills: 1, participants }, now);
}
let now = start + 3600000;
assert.equal(R.snapshot(state, start - 1).phase, 'upcoming');
assert.ok(playTeam('gemGrab', now, 'a'));
assert.ok(playTeam('knockout', now, 'a'));
assert.equal(state.survivalStats.red.wins, 1);
assert.equal(state.survivalStats[R.rosterFor(state, 'gemGrab')[3]].losses, 1);
// No cut before 18:10 the next day; a stale ticket from another round is ignored.
R.advance(state, start + DAY - 1); assert.equal(state.round, 1);
let day = 1;
while (state.phase === 'survival') {
  now = start + day * DAY + 60000; // just after the cut
  R.advance(state, now);
  playTeam('gemGrab', now, 'a'); playTeam('knockout', now, 'b');
  day++;
  assert.ok(day < 12, 'survival ends');
}
assert.equal(state.swapped, true, 'groups swapped at round 3');
assert.equal(state.phase, 'final');
assert.ok(state.finalists.length <= 10 && state.finalists.length >= 8, `final has ${state.finalists.length}`);
assert.equal(state.eliminations.filter(e => e.phase === 'survival').length, 17 - state.finalists.length);

// Soccer Kick final: bottom 2 out daily until 4 are left.
while (state.phase === 'final') {
  playTeam('soccer', now, 'a');
  now = championsCutAt(state.nextEliminationAt) + 60000; R.advance(state, now);
  assert.ok(++day < 20);
}
assert.equal(state.phase, 'tournament');
assert.equal(state.tournament.seeds.length, 4);
const semis = R.openMatches(state);
assert.deepEqual(semis.map(m => [m.a, m.b]), [[state.tournament.seeds[0], state.tournament.seeds[3]], [state.tournament.seeds[1], state.tournament.seeds[2]]]);

// Duel: the lower seed wins semi 1 twice; semi 2 gets no games (better seed goes through).
const semi1 = semis[0];
assert.equal(R.duelOpponent(state, semi1.b), semi1.a);
for (let i = 0; i < 2; i++) assert.ok(R.record(state, { ...ticket('duel', semi1.b), opponent: semi1.a }, { won: true, draw: false, abandoned: false, damage: 0, kills: 0 }, now));
assert.equal(semi1.wins.b, 2);
now = championsCutAt(state.nextEliminationAt) + 60000; R.advance(state, now);
const final = R.openMatches(state)[0];
assert.equal(final.id, 'final');
assert.deepEqual([final.a, final.b], [semi1.b, semis[1].a]);
R.record(state, { ...ticket('duel', final.a), opponent: final.b }, { won: true, draw: false, abandoned: false, damage: 0, kills: 0 }, now);
now = championsCutAt(state.nextEliminationAt) + 60000; R.advance(state, now);
assert.equal(state.phase, 'complete');
assert.equal(state.champion, final.a);
assert.equal(state.reward.skin, mainChampionsCrownSkin(final.a));

// A group with no games is not cut, and a character that never played is not cut by roster order (11.17 Crystal).
{
  const s2 = R.create(), cut = s2.nextEliminationAt;
  const six = R.rosterFor(s2, 'gemGrab').slice(0, 6).map((c, i) => ({ character: c, team: i < 3 ? 'a' : 'b', damage: 100 * (6 - i), kills: 0 }));
  R.record(s2, { phase: 'survival', round: 1, mode: 'gemGrab', character: six[0].character }, { won: true, draw: false, abandoned: false, damage: 0, kills: 0, participants: six }, cut - 1000);
  R.advance(s2, cut + 1000);
  assert.equal(s2.groups.knockout.length, 8, 'Knockout had no games: nobody cut there');
  const out = s2.eliminations.find(e => e.mode === 'gemGrab');
  assert.ok(six.some(p => p.character === out.character), 'the Gem Grab loser is someone who played');
  assert.equal(s2.groups.gemGrab.length, 8);
}
// The live 11.17 state: Crystal comes back once.
{
  const { applyMainChampionsFixes } = await import('../party/main-champions-store.js');
  const s3 = R.create();
  s3.groups.knockout = s3.groups.knockout.filter(c => c !== 'crystal');
  s3.eliminations.push({ character: 'crystal', mode: 'knockout', phase: 'survival', round: 1, at: 0 });
  applyMainChampionsFixes(s3); applyMainChampionsFixes(s3);
  assert.ok(s3.groups.knockout.includes('crystal')); assert.equal(s3.eliminations.length, 0); assert.deepEqual(s3.fixes, ['crystal-r1']);
}
// Store: fake storage with transactions; start/finish validation.
const map = new Map();
const storage = { transaction: async fn => fn({ get: async k => structuredClone(map.get(k)), put: async (k, v) => { map.set(k, structuredClone(v)); } }) };
globalThis.crypto ??= (await import('node:crypto')).webcrypto;
const realNow = Date.now;
Date.now = () => start + 7200000;
const store = await import('../party/main-champions-store.js');
const snap = await store.getMainChampions(storage);
assert.equal(snap.phase, 'survival');
await assert.rejects(store.startMainChampions(storage, { mode: 'gemGrab', character: 'purple' }), /생존 캐릭터/);
const { ticket: t } = await store.startMainChampions(storage, { mode: 'gemGrab', character: 'red' });
const six = ['red', 'green', 'blue', 'orange', 'pink', 'gold'].map((c, i) => ({ id: i ? `ai-${i}` : 'player', character: c, team: i < 3 ? 'a' : 'b', damage: 100, kills: 0 }));
await assert.rejects(store.finishMainChampions(storage, { id: t.id, result: { won: true, draw: false, abandoned: false, damage: 1, kills: 0, participants: six.slice(0, 5) } }), /6명/);
const done = await store.finishMainChampions(storage, { id: t.id, result: { won: true, draw: false, abandoned: false, damage: 100, kills: 0, participants: six } });
assert.equal(done.counted, true);
assert.equal(done.state.survivalStats.red.wins, 1);
assert.equal(done.state.survivalStats.pink.losses, 1);
const again = await store.finishMainChampions(storage, { id: t.id, result: { won: true, draw: false, abandoned: false, damage: 100, kills: 0, participants: six } });
assert.equal(again.state.survivalStats.red.wins, 1, 'a ticket counts once');
Date.now = () => start - 1000;
await assert.rejects(store.startMainChampions(storage, { mode: 'gemGrab', character: 'red' }), /시작합니다/);
Date.now = realNow;
console.log(`PASS main Champions: 17 characters, survival ${day} days incl. swap, Soccer Kick final, duel tournament → champion ${state.champion} (${state.reward.skin}), store checks.`);
