// Hot Zone (핫 존), Official Season 1 — 3v3, Brawl Stars rules. A team scores while it alone stands in a
// zone (both teams inside: no one scores). First to 100% wins; after 2 minutes the higher score wins.
// Respawn after 5 s. Zones sit in the middle of the 40x60 team arena (see beta9-team-arena.js).
export const HOT_ZONE_RULES = Object.freeze({ matchSeconds: 120, ratePerSecond: 1.25, target: 100, respawnDelay: 5 });

// One zone, or two mirrored zones, depending on the map.
export const HOT_ZONE_LAYOUTS = Object.freeze([
  [{ x: 0, z: 0, radius: 4 }],
  [{ x: -8, z: 0, radius: 3 }, { x: 8, z: 0, radius: 3 }],
  [{ x: 0, z: -7, radius: 3 }, { x: 0, z: 7, radius: 3 }],
]);

export function createHotZone(mapIndex = 0) {
  const layout = HOT_ZONE_LAYOUTS[Math.max(0, Math.min(HOT_ZONE_LAYOUTS.length - 1, mapIndex | 0))];
  return { zones: layout.map(z => ({ ...z, owner: null })), score: { a: 0, b: 0 }, winner: null };
}

// fighters: [{ team, x, z, alive }]. Returns the winning team once someone reaches the target.
export function tickHotZone(state, fighters, dt) {
  if (state.winner) return state.winner;
  for (const zone of state.zones) {
    const inside = new Set(fighters.filter(f => f.alive && f.team && Math.hypot(f.x - zone.x, f.z - zone.z) <= zone.radius).map(f => f.team));
    zone.owner = inside.size === 1 ? [...inside][0] : inside.size > 1 ? 'contested' : null;
    if (inside.size === 1) state.score[zone.owner] = Math.min(HOT_ZONE_RULES.target, state.score[zone.owner] + HOT_ZONE_RULES.ratePerSecond * dt);
  }
  for (const team of ['a', 'b']) if (state.score[team] >= HOT_ZONE_RULES.target) state.winner = team;
  return state.winner;
}

// Result when the match clock runs out: higher score wins, equal is a draw (null).
export function hotZoneTimeResult(state) {
  return state.score.a > state.score.b ? 'a' : state.score.b > state.score.a ? 'b' : null;
}
