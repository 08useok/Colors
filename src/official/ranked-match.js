// Official Season 1 ranked (경쟁전) matchmaking rules, shared by the Worker (party/server.js), the page and tests.
// Pure functions only: no sockets, no DOM. See specs/official-season-1.md (매칭 — 실제 플레이어 + 봇 채움).

export const RANKED_QUEUE_RULES = Object.freeze({
  teamSize: 3,         // 3v3
  startWindow: 150,    // rank points either side when you join the queue
  widenEvery: 5,       // seconds
  widenBy: 75,         // points added to the window every widenEvery seconds
  maxWindow: 600,
  fillAfter: 20,       // seconds: the longest waiter starts with whoever is there, bots fill the rest
});
export const RANKED_QUEUE_MODES = Object.freeze(['gemGrab', 'knockout', 'hotZone']);
export const RANKED_MAP_COUNT = 3;

const R = RANKED_QUEUE_RULES;
const seconds = (now, since) => Math.max(0, (now - since) / 1000);
export const rankWindow = waitSeconds => Math.min(R.maxWindow, R.startWindow + Math.floor(Math.max(0, waitSeconds) / R.widenEvery) * R.widenBy);
// Both players must fall inside each other's window.
export const rankCompatible = (a, b, now) => Math.abs(a.points - b.points) <= Math.min(rankWindow(seconds(now, a.joinedAt)), rankWindow(seconds(now, b.joinedAt)));

const cleanPoints = p => Math.max(0, Math.min(100000, Math.floor(Number(p) || 0)));

// Queue: join / leave / tick. tick(now) returns the groups that start now: [{ mode, players }].
// A group starts as soon as it is full, or when its oldest player has waited fillAfter seconds.
export function createRankedQueue() {
  const waiting = new Map(); // id → { id, mode, points, joinedAt, ...extra }
  return {
    get size() { return waiting.size; },
    has: id => waiting.has(id),
    entry: id => waiting.get(id),
    join(player, now) {
      if (!RANKED_QUEUE_MODES.includes(player.mode)) return null;
      const entry = { ...player, points: cleanPoints(player.points), joinedAt: now };
      waiting.set(player.id, entry);
      return entry;
    },
    leave: id => waiting.delete(id),
    tick(now) {
      const started = [];
      const full = R.teamSize * 2;
      const queue = [...waiting.values()].sort((a, b) => a.joinedAt - b.joinedAt);
      const used = new Set();
      for (const anchor of queue) {
        if (used.has(anchor.id)) continue;
        // Everyone compatible with the anchor and with each other, closest points first.
        const group = [anchor];
        for (const other of queue.filter(p => p !== anchor && !used.has(p.id) && p.mode === anchor.mode)
          .sort((p, q) => Math.abs(p.points - anchor.points) - Math.abs(q.points - anchor.points))) {
          if (group.length >= full) break;
          if (group.every(member => rankCompatible(member, other, now))) group.push(other);
        }
        if (group.length < full && seconds(now, anchor.joinedAt) < R.fillAfter) continue;
        for (const member of group) { used.add(member.id); waiting.delete(member.id); }
        started.push({ mode: anchor.mode, players: group });
      }
      return started;
    },
    // What a waiting player sees: seconds waited, current window, seconds until bots fill.
    status(id, now) {
      const p = waiting.get(id);
      if (!p) return null;
      const waited = seconds(now, p.joinedAt);
      const others = [...waiting.values()].filter(o => o !== p && o.mode === p.mode && rankCompatible(p, o, now)).length;
      return { waited: Math.floor(waited), window: rankWindow(waited), fillIn: Math.max(0, Math.ceil(R.fillAfter - waited)), found: 1 + others };
    },
  };
}

// Six seats, team a = seats 0–2, team b = seats 3–5. Humans are dealt by points in a snake
// (1st → a, 2nd → b, 3rd → b, 4th → a, …) so both teams' totals stay close; bots fill the rest.
// The host (the browser that runs the match) is the best-placed human on team a.
export function assignRankedSeats(players) {
  const sorted = [...players].sort((p, q) => q.points - p.points || String(p.id).localeCompare(String(q.id)));
  const snake = ['a', 'b', 'b', 'a', 'a', 'b'];
  const teams = { a: [], b: [] };
  sorted.slice(0, R.teamSize * 2).forEach((p, i) => teams[snake[i]].push(p));
  const seats = [];
  for (const [team, offset] of [['a', 0], ['b', R.teamSize]]) {
    for (let i = 0; i < R.teamSize; i++) {
      const p = teams[team][i];
      seats.push({ seat: offset + i, team, playerId: p?.id ?? null, nickname: p?.nickname ?? null, charType: p?.charType ?? null, points: p ? p.points : null });
    }
  }
  return { seats, hostId: teams.a[0]?.id ?? null };
}

// Small seeded generator so every browser picks the same bots and the same things from one seed.
export function seededRandom(seed) {
  let s = (Number(seed) >>> 0) || 0x9e3779b9;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
// Bot seats get characters from the roster (different from the humans' picks where possible).
export function fillBotCharacters(seats, seed, roster) {
  const random = seededRandom(seed);
  const taken = new Set(seats.map(s => s.charType).filter(Boolean));
  const pool = roster.filter(id => !taken.has(id));
  return seats.map(s => {
    if (s.charType) return { ...s };
    const from = pool.length ? pool : roster;
    const index = Math.floor(random() * from.length);
    const charType = from[index];
    if (pool.length) pool.splice(index, 1);
    return { ...s, charType, nickname: null };
  });
}

// ── Perspective: everyone plays from the bottom of the screen as team "a" ──
// The host runs the match in its own frame (host team = a). A player on team b sees the field turned 180°
// (x → -x, z → -z, angle + π) with the teams swapped. Plaza maps are mirrored on both axes, so they match.
export const viewFlipped = myTeam => myTeam === 'b';
export const swapTeam = team => team === 'a' ? 'b' : team === 'b' ? 'a' : team;
export const viewTeam = (team, flipped) => flipped ? swapTeam(team) : team;
export const viewPoint = (x, z, flipped) => flipped ? { x: -x, z: -z } : { x, z };
export const viewAngle = (angle, flipped) => flipped ? angle + Math.PI : angle;
// Score objects keyed by team ({ a, b }) as seen by the player.
export const viewScore = (score, flipped) => flipped ? { a: score.b, b: score.a } : { a: score.a, b: score.b };

// Seats other than mine in the page's bot order: my team first, then the other team (seat order).
// The page puts the first two bots on its own team ("a") and the last three on the other side.
export function botSeatOrder(seats, mySeat) {
  const me = seats.find(s => s.seat === mySeat);
  return [...seats.filter(s => s.seat !== mySeat && s.team === me.team), ...seats.filter(s => s.team !== me.team)];
}

// The result the server announces (winner in host frame: 'a', 'b' or null for a draw) seen by one player.
export const rankedOutcome = (winner, myTeam) => winner == null ? 'draw' : winner === myTeam ? 'win' : 'loss';
