// 3v3 bot simulation of Beta Season 9 Knockout and Gem Grab on the shared combat engine.
// Each match draws 6 distinct characters from the 18-character beta roster and splits them into two
// random teams. A character's mode score is its team's win rate (draw = 0.5) over every match it plays.
//
// Usage: node tools/simulate-beta9-team-modes.mjs [--matches N] [--quick] [--out specs/file.json]
// Writes specs/beta9-team-mode-simulation.json.
//
// Model limits: engine bots fight the nearest visible enemy and path around walls on the Season 9
// team arenas (40x60). Gem Grab adds simple objective rules on top (collect, hold back with many gems, escape).
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { applyBeta8Balance } from '../src/config/beta8-balance.js';
import { applyBeta9Balance } from '../src/config/beta9-balance.js';
import { RASPBERRY_CHARACTER } from '../src/config/raspberry.js';
import { BETA_ATTACK_MOTIONS } from '../src/config/beta-attack-motion.js';
import { BETA_ULTIMATE_MOTIONS } from '../src/config/beta-ultimate-motion.js';
import { KNOCKOUT_RULES } from '../src/config/knockout.js';
import { GEM_GRAB_RULES, gemEscapeResult } from '../src/config/gem-grab.js';
import { mapBlocked, insideMapRect, navigateEventMap } from '../src/config/event-maps.js';
import { TEAM_ARENA, BETA9_GEM_RULES, teamArenaMap, knockoutSafeArea } from '../src/config/beta9-team-arena.js';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';
import { atCharacterLevel } from './simulate-beta6-balance.mjs';

// Same definitions the beta page builds for Season 9 (BETA_SEASON_ID "beta8").
export function season9Definitions() {
  const defs = applyBeta9Balance(applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS)));
  defs.raspberry = structuredClone(RASPBERRY_CHARACTER);
  defs.raspberry.attackWindup = BETA_ATTACK_MOTIONS.raspberry?.release ?? 0;
  defs.raspberry.ultimate.motionWindup = BETA_ULTIMATE_MOTIONS.raspberry?.release ?? 0;
  defs.orange.orangeUltimateEnabled = true;
  defs.purple.purpleUltimateEnabled = true;
  return atCharacterLevel(defs, 6);
}

const BOUNDS_X = TEAM_ARENA.halfWidth - .6, BOUNDS_Z = TEAM_ARENA.halfDepth - .6, DT = 1 / 60, REGEN_DELAY = 5, REGEN_PER_SECOND = .1;
const mulberry = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let x = Math.imul(seed ^ seed >>> 15, 1 | seed); x ^= x + Math.imul(x ^ x >>> 7, 61 | x); return ((x ^ x >>> 14) >>> 0) / 4294967296; };
const spawnSpots = side => [-4, 0, 4].map(x => ({ x, z: side * TEAM_ARENA.spawnZ }));
const sideOf = team => team === 'a' ? -1 : 1;
// Optional event tap for probes (e.g. counting one character's shots and hits).
export const simHooks = { onEvent: null };

function createWorld(defs, mode, mapIndex, seed, aimError, extra = {}) {
  const layout = teamArenaMap(mode, mapIndex);
  return {
    layout,
    world: createBeta6Combat(defs, {
      seed, aimError, bounds: BOUNDS_Z, onEvent: e => simHooks.onEvent?.(e),
      blocked: (x, z, r = .55) => mapBlocked(layout, x, z, r),
      walkable: (x, z) => !mapBlocked(layout, x, z, .5),
      bushAt: (x, z) => layout.bushes.some(rect => insideMapRect(x, z, rect)),
      ...extra,
    }),
  };
}

function regen(world, dt) {
  for (const a of world.actors) if (a.hp > 0 && !a.isSalmonDevice && world.time - a.combatAt >= REGEN_DELAY)
    a.hp = Math.min(a.d.maxHealth, a.hp + a.d.maxHealth * REGEN_PER_SECOND * dt);
}
const defaultLowHealthRetreat = a => a.hp <= a.d.maxHealth * .5 && !a.d.pursuesWhileLowHealth;

// ---------- Knockout: no respawn, best of 3, poison square closes from 45 s to 85 s ----------
function knockoutRound(defs, teams, mapIndex, seed, aimError) {
  let safe = null, layout;
  const { world, layout: arena } = createWorld(defs, 'knockout', mapIndex, seed, aimError, {
    destination(a, target) {
      if (!safe || (Math.abs(a.x) < safe.x - 1.5 && Math.abs(a.z) < safe.z - 1.5)) return navigateEventMap(layout, a, target);
      return navigateEventMap(layout, a, { x: a.x * .3, z: a.z * .3 });
    },
    retreatsAtLowHealth(a, destination, target) { return destination === target ? undefined : false; },
  });
  layout = arena;
  const fighters = [];
  for (const team of ['a', 'b']) teams[team].forEach((id, i) => fighters.push(world.add(id, { team, ...spawnSpots(sideOf(team))[i] })));
  let nextPoison = KNOCKOUT_RULES.poisonStarts;
  const living = team => fighters.filter(f => f.team === team && f.hp > 0);
  while (world.time < KNOCKOUT_RULES.roundSeconds) {
    world.update(DT); regen(world, DT);
    const t = world.time;
    safe = t < KNOCKOUT_RULES.poisonStarts ? null : knockoutSafeArea(t);
    if (t >= nextPoison) {
      nextPoison += 1;
      for (const f of fighters) if (f.hp > 0 && safe && (Math.abs(f.x) > safe.x || Math.abs(f.z) > safe.z)) { f.hp = Math.max(0, f.hp - f.d.maxHealth * .1); f.combatAt = t; }
    }
    // Pink's encore can bring a fallen ally back a moment later, so only end once nobody is pending.
    const a = living('a').length, b = living('b').length, pending = fighters.some(f => f.hp <= 0 && f.encoreReviveAt);
    if ((!a || !b) && !pending) return { winner: a && !b ? 'a' : b && !a ? 'b' : null, time: t, reason: 'elimination' };
  }
  const a = living('a'), b = living('b'), hp = list => list.reduce((s, f) => s + f.hp / f.d.maxHealth, 0);
  const winner = a.length !== b.length ? (a.length > b.length ? 'a' : 'b') : Math.abs(hp(a) - hp(b)) > 1e-6 ? (hp(a) > hp(b) ? 'a' : 'b') : null;
  return { winner, time: world.time, reason: 'timeout' };
}
export function knockoutMatch(defs, teams, mapIndex, seed, aimError) {
  const wins = { a: 0, b: 0 }; let rounds = 0;
  while (wins.a < KNOCKOUT_RULES.winsRequired && wins.b < KNOCKOUT_RULES.winsRequired && rounds < 5) {
    const r = knockoutRound(defs, teams, mapIndex, seed + rounds * 7919, aimError); rounds++;
    if (r.winner) wins[r.winner]++;
  }
  return { winner: wins.a > wins.b ? 'a' : wins.b > wins.a ? 'b' : null, rounds, wins };
}

// ---------- Gem Grab: respawn after 5 s, a gem from the centre every 7 s (max 30), hold 10 for 15 s ----------
export function gemGrabMatch(defs, teams, mapIndex, seed, aimError) {
  const rand = mulberry(seed ^ 0x5bd1e995);
  const gems = [], escape = { a: null, b: null };
  const counts = () => {
    const c = { a: 0, b: 0 };
    for (const f of fighters) if (f.hp > 0) c[f.team] += f.gems;
    return c;
  };
  let world, layout, fighters = [];
  const go = (a, point) => navigateEventMap(layout, a, point);
  ({ world, layout } = createWorld(defs, 'gemGrab', mapIndex, seed, aimError, {
    destination(a, moveTarget) {
      if (!a.team) return undefined;
      const side = sideOf(a.team), c = counts();
      // Escaping or clearly ahead: carriers fall back toward their own side.
      if (a.gems > 0 && (c[a.team] >= GEM_GRAB_RULES.target || a.gems >= 4)) return go(a, { x: a.x * .5, z: side * (TEAM_ARENA.spawnZ - 6) });
      if (gems.length) {
        let best = null, bestDist = Infinity;
        for (const g of gems) { const d = Math.hypot(g.x - a.x, g.z - a.z); if (d < bestDist) { best = g; bestDist = d; } }
        const teammates = fighters.filter(f => f.team === a.team && f.hp > 0 && f !== a);
        const closest = teammates.every(f => Math.hypot(best.x - f.x, best.z - f.z) >= bestDist);
        if (closest || bestDist < 4) return go(a, best);
      }
      return go(a, moveTarget);
    },
    retreatsAtLowHealth(a, destination, target) { return destination === target ? undefined : (a.gems > 0 && defaultLowHealthRetreat(a) ? true : false); },
  }));
  const add = (id, team, i) => { const f = world.add(id, { team, ...spawnSpots(sideOf(team))[i] }); f.gems = 0; f.slot = i; return f; };
  for (const team of ['a', 'b']) teams[team].forEach((id, i) => fighters.push(add(id, team, i)));
  const deadAt = new Map();
  let nextGem = BETA9_GEM_RULES.firstSpawnDelay, collected = { a: 0, b: 0 };
  while (world.time < GEM_GRAB_RULES.matchSeconds) {
    world.update(DT); regen(world, DT);
    const t = world.time;
    if (t >= nextGem) {
      nextGem += BETA9_GEM_RULES.spawnInterval;
      const held = fighters.reduce((s, f) => s + (f.hp > 0 ? f.gems : 0), 0);
      if (gems.length + held < BETA9_GEM_RULES.maxInPlay) { const r = rand() * 2.5, th = rand() * Math.PI * 2; gems.push({ x: Math.cos(th) * r, z: Math.sin(th) * r }); }
    }
    for (let i = fighters.length - 1; i >= 0; i--) {
      const f = fighters[i];
      if (f.hp <= 0 && !deadAt.has(f)) {
        deadAt.set(f, t);
        for (let k = 0; k < f.gems; k++) { const th = rand() * Math.PI * 2, r = .6 + rand() * 1.6; gems.push({ x: Math.max(-BOUNDS_X, Math.min(BOUNDS_X, f.x + Math.cos(th) * r)), z: Math.max(-BOUNDS_Z, Math.min(BOUNDS_Z, f.z + Math.sin(th) * r)) }); }
        f.gems = 0;
      } else if (f.hp > 0 && deadAt.has(f)) deadAt.delete(f); // encore revive
      else if (f.hp <= 0 && t - deadAt.get(f) >= GEM_GRAB_RULES.respawnDelay && !f.encoreReviveAt) {
        deadAt.delete(f); const charge = f.charge; world.remove(f);
        const next = add(f.id, f.team, f.slot); next.charge = charge; fighters[i] = next;
      }
    }
    for (const f of fighters) if (f.hp > 0) for (let g = gems.length - 1; g >= 0; g--)
      if (Math.hypot(gems[g].x - f.x, gems[g].z - f.z) <= GEM_GRAB_RULES.pickupRange) { gems.splice(g, 1); f.gems++; collected[f.team]++; }
    const winner = gemEscapeResult(escape, counts(), t);
    if (winner) return { winner, time: t, reason: 'escape', collected };
  }
  const c = counts();
  return { winner: c.a > c.b ? 'a' : c.b > c.a ? 'b' : null, time: world.time, reason: 'time', collected };
}

// ---------- Tournament ----------
export function runModes({ matches = 1200, seed = 20261102, modes = ['knockout', 'gemGrab'] } = {}) {
  const defs = season9Definitions(), ids = Object.keys(defs);
  assert.equal(ids.length, 18);
  const results = {};
  for (const mode of modes) {
    const rand = mulberry(seed + (mode === 'knockout' ? 1 : 2));
    const stats = Object.fromEntries(ids.map(id => [id, { games: 0, wins: 0, losses: 0, draws: 0 }]));
    const pair = {}; let decided = 0, totalTime = 0;
    for (let m = 0; m < matches; m++) {
      const pool = [...ids];
      for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
      const teams = { a: pool.slice(0, 3), b: pool.slice(3, 6) };
      const mapIndex = m % 3, aimError = m % 2 ? .1 : .035;
      const r = mode === 'knockout' ? knockoutMatch(defs, teams, mapIndex, seed + m * 31, aimError) : gemGrabMatch(defs, teams, mapIndex, seed + m * 31, aimError);
      if (r.winner) decided++;
      totalTime += r.time ?? 0;
      for (const team of ['a', 'b']) for (const id of teams[team]) {
        const s = stats[id]; s.games++;
        if (!r.winner) s.draws++; else if (r.winner === team) s.wins++; else s.losses++;
      }
      for (const team of ['a', 'b']) for (const id of teams[team]) for (const other of teams[team === 'a' ? 'b' : 'a']) {
        const key = `${id}>${other}`, p = pair[key] ??= { games: 0, score: 0 };
        p.games++; p.score += !r.winner ? .5 : r.winner === team ? 1 : 0;
      }
    }
    for (const s of Object.values(stats)) { s.score = (s.wins + s.draws / 2) / s.games; s.stderr = Math.sqrt(s.score * (1 - s.score) / s.games); }
    results[mode] = { matches, decidedRate: decided / matches, stats, pair };
  }
  return { ids, results };
}

// Pick 9 + 9 with no overlap, maximising the total mode-relative advantage (exact search over C(18,9)).
export function splitRoster(ids, knockout, gemGrab) {
  const edge = id => knockout[id].score - gemGrab[id].score, rel = id => knockout[id].score + gemGrab[id].score;
  let best = null;
  const n = ids.length;
  for (let mask = 0; mask < 1 << n; mask++) {
    let bits = 0, total = 0;
    for (let i = 0; i < n; i++) if (mask >> i & 1) { bits++; }
    if (bits !== 9) continue;
    for (let i = 0; i < n; i++) total += mask >> i & 1 ? knockout[ids[i]].score : gemGrab[ids[i]].score;
    if (!best || total > best.total + 1e-12) best = { mask, total };
  }
  const ko = ids.filter((_, i) => best.mask >> i & 1), gg = ids.filter((_, i) => !(best.mask >> i & 1));
  return { knockout: ko.sort((x, y) => knockout[y].score - knockout[x].score), gemGrab: gg.sort((x, y) => gemGrab[y].score - gemGrab[x].score), total: best.total, edge: Object.fromEntries(ids.map(id => [id, edge(id)])), overall: Object.fromEntries(ids.map(id => [id, rel(id) / 2])) };
}

if (process.argv[1]?.endsWith('simulate-beta9-team-modes.mjs')) {
  const arg = name => { const i = process.argv.indexOf(name); return i >= 0 ? Number(process.argv[i + 1]) : null; };
  const matches = arg('--matches') ?? (process.argv.includes('--quick') ? 30 : 1200);
  const started = Date.now();
  const { ids, results } = runModes({ matches });
  const split = splitRoster(ids, results.knockout.stats, results.gemGrab.stats);
  const rows = ids.map(id => ({ id, knockout: +(results.knockout.stats[id].score * 100).toFixed(1), gemGrab: +(results.gemGrab.stats[id].score * 100).toFixed(1), edge: +(split.edge[id] * 100).toFixed(1), group: split.knockout.includes(id) ? 'knockout' : 'gemGrab' }))
    .sort((a, b) => b.edge - a.edge);
  console.table(rows);
  console.log('decided', { knockout: results.knockout.decidedRate, gemGrab: results.gemGrab.decidedRate }, 'seconds', ((Date.now() - started) / 1000).toFixed(0));
  if (!process.argv.includes('--quick')) {
    for (const r of Object.values(results)) delete r.pair;
    const outIndex = process.argv.indexOf('--out'), out = outIndex >= 0 ? process.argv[outIndex + 1] : 'specs/beta9-team-mode-simulation.json';
    writeFileSync(new URL('../' + out, import.meta.url), JSON.stringify({ date: new Date().toISOString().slice(0, 10), scope: '3v3 random teams from the 18-character beta roster, level 6, three event maps per mode, aim error .035/.1', results, split, rows }, null, 2) + '\n');
  }
}
