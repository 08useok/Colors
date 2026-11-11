// Official Season 1 ranked (경쟁전) matchmaking: queue rules, seats, bot fill, perspective, snapshots,
// and two sessions talking through an in-memory copy of the server's ranked messages.
// Run: node tools/test-ranked-matchmaking.mjs
import assert from 'node:assert/strict';
import * as M from '../src/official/ranked-match.js';
import { createRankedSession, viewSnapshot, viewInput, viewAction, packFighter, unpackFighter, rankedServerUrl } from '../src/official/ranked-net.js';

const R = M.RANKED_QUEUE_RULES;
const at = s => s * 1000;

{ // Window: ±150 at first, +75 every 5 s, at most ±600.
  assert.equal(M.rankWindow(0), 150);
  assert.equal(M.rankWindow(4.9), 150);
  assert.equal(M.rankWindow(5), 225);
  assert.equal(M.rankWindow(30), 600);
  assert.equal(M.rankWindow(999), 600);
}
{ // Close points match only when full; far points never share a group early.
  const q = M.createRankedQueue();
  q.join({ id: 'a', mode: 'gemGrab', points: 500 }, at(0));
  q.join({ id: 'b', mode: 'gemGrab', points: 600 }, at(1));
  q.join({ id: 'c', mode: 'gemGrab', points: 1400 }, at(1));
  q.join({ id: 'k', mode: 'knockout', points: 500 }, at(1));
  assert.deepEqual(q.tick(at(10)), [], 'nobody starts before the fill timeout');
  assert.equal(q.status('a', at(10)).found, 2, 'a sees b (100 apart) but not c (900 apart)');
  const started = q.tick(at(R.fillAfter));
  assert.equal(started.length, 1, 'only the oldest group starts at 20 s');
  assert.deepEqual(started[0].players.map(p => p.id).sort(), ['a', 'b']);
  assert.equal(started[0].mode, 'gemGrab');
  assert(!q.has('a') && !q.has('b') && q.has('c') && q.has('k'), 'other mode and far points keep waiting');
  assert.equal(q.status('c', at(R.fillAfter)).fillIn, 1);
}
{ // Six compatible players start at once, without waiting for the timeout.
  const q = M.createRankedQueue();
  for (let i = 0; i < 7; i++) q.join({ id: `p${i}`, mode: 'hotZone', points: 1000 + i * 10 }, at(i * .1));
  const [group, ...rest] = q.tick(at(1));
  assert.equal(group.players.length, 6); assert.equal(rest.length, 0);
  assert(q.has('p6'), 'the seventh waits for the next match');
}
{ // A player who joins late but within the window of someone waiting long is pulled in.
  const q = M.createRankedQueue();
  q.join({ id: 'old', mode: 'knockout', points: 0 }, at(0));
  q.join({ id: 'new', mode: 'knockout', points: 140 }, at(19));
  assert.deepEqual(q.tick(at(20))[0].players.map(p => p.id), ['old', 'new']);
  // Windows are mutual: the newcomer's ±150 limits the pair even if the old player's window is wide.
  const q2 = M.createRankedQueue();
  q2.join({ id: 'old', mode: 'knockout', points: 0 }, at(0));
  q2.join({ id: 'new', mode: 'knockout', points: 300 }, at(19));
  assert.deepEqual(q2.tick(at(20))[0].players.map(p => p.id), ['old']);
  assert.equal(q2.join({ id: 'x', mode: 'showdown', points: 0 }, at(0)), null, 'only ranked modes queue');
}
{ // Seats: snake by points, host = best human on team a; two people play on opposite teams.
  const { seats, hostId } = M.assignRankedSeats([{ id: 'low', points: 100, charType: 'red' }, { id: 'high', points: 900, charType: 'blue' }]);
  assert.equal(seats.length, 6);
  assert.deepEqual(seats.map(s => s.team), ['a', 'a', 'a', 'b', 'b', 'b']);
  assert.equal(hostId, 'high');
  assert.equal(seats.find(s => s.playerId === 'high').team, 'a');
  assert.equal(seats.find(s => s.playerId === 'low').team, 'b');
  assert.equal(seats.filter(s => !s.playerId).length, 4, 'four bot seats');
  const six = M.assignRankedSeats([600, 500, 400, 300, 200, 100].map((points, i) => ({ id: `p${i}`, points })));
  const total = team => six.seats.filter(s => s.team === team).reduce((sum, s) => sum + s.points, 0);
  assert.equal(total('a'), 600 + 300 + 200); assert.equal(total('b'), 500 + 400 + 100);
}
{ // Bot characters: same seed → same picks on every browser, humans' picks avoided.
  const roster = ['red', 'green', 'blue', 'orange', 'yellow', 'cyan', 'purple'];
  const { seats } = M.assignRankedSeats([{ id: 'x', points: 0, charType: 'red' }, { id: 'y', points: 0, charType: 'blue' }]);
  const one = M.fillBotCharacters(seats, 1234, roster), two = M.fillBotCharacters(seats, 1234, roster);
  assert.deepEqual(one, two);
  assert(one.every(s => s.charType));
  const bots = one.filter(s => !s.playerId).map(s => s.charType);
  assert(!bots.includes('red') && !bots.includes('blue'));
  assert.equal(new Set(bots).size, bots.length, 'no duplicate bots while the roster lasts');
  assert.notDeepEqual(M.fillBotCharacters(seats, 99, roster).map(s => s.charType), one.map(s => s.charType));
}
{ // Perspective: team b sees the field turned 180°, teams swapped; flipping twice is the identity.
  assert.deepEqual(M.viewPoint(3, -7, true), { x: -3, z: 7 });
  assert.deepEqual(M.viewPoint(3, -7, false), { x: 3, z: -7 });
  assert.equal(M.viewTeam('a', true), 'b'); assert.equal(M.viewTeam('contested', true), 'contested'); assert.equal(M.viewTeam(null, true), null);
  assert.deepEqual(M.viewScore({ a: 7, b: 10 }, true), { a: 10, b: 7 });
  const input = { x: 1.5, z: 20, angle: .3, life: 2 };
  const back = viewInput(viewInput(input, true), true);
  assert(Math.abs(back.x - 1.5) < 1e-9 && Math.abs(back.z - 20) < 1e-9 && Math.abs(Math.cos(back.angle) - Math.cos(.3)) < 1e-9);
  const a = viewAction({ kind: 'cast', angle: 0, point: { x: 4, z: 5 } }, true);
  assert.deepEqual(a.point, { x: -4, z: -5 }); assert(Math.abs(Math.cos(a.angle) + 1) < 1e-9);
  assert.equal(viewAction({ kind: 'transform', angle: null, point: null }, true).angle, null);
  // Seat order: own team first (the page puts bots 0–1 on its own team), then the other team.
  const { seats } = M.assignRankedSeats([{ id: 'h', points: 9 }, { id: 'g', points: 1 }]);
  const guest = seats.find(s => s.playerId === 'g');
  const order = M.botSeatOrder(seats, guest.seat);
  assert.deepEqual(order.map(s => s.team), ['b', 'b', 'a', 'a', 'a']);
  assert(order.some(s => s.playerId === 'h'));
  assert.equal(M.rankedOutcome('a', 'a'), 'win'); assert.equal(M.rankedOutcome('a', 'b'), 'loss'); assert.equal(M.rankedOutcome(null, 'b'), 'draw');
  // Plaza maps and hot zones are symmetric under the 180° turn (so both views show the same field).
  const { PLAZA_LAYOUTS } = await import('../src/official/plaza-maps.js');
  const { HOT_ZONE_LAYOUTS } = await import('../src/config/hot-zone.js');
  for (const layout of PLAZA_LAYOUTS) for (const list of [layout.walls, layout.bushes]) for (const [x, z, w, d] of list)
    assert(list.some(([x2, z2, w2, d2]) => x2 === -x && z2 === -z && w2 === w && d2 === d), `${layout.name} symmetric`);
  for (const zones of HOT_ZONE_LAYOUTS) for (const z of zones) assert(zones.some(o => o.x === -z.x && o.z === -z.z && o.radius === z.radius));
}
{ // Snapshot packing and the guest's view of it.
  const f = { seat: 4, x: 1.234, z: -5.678, angle: 1, hp: 4321.6, maxHp: 7200, dead: false, life: 3, gems: 2, charge: 1.5, transformCharge: .25 };
  const u = unpackFighter(packFighter(f));
  assert.deepEqual(u, { ...f, x: 1.23, z: -5.68, hp: 4322 });
  const snap = { t: 12.5, f: [packFighter(f)], g: [[1, 2]], hot: { s: [40, 10], z: [[-8, 0, 'a'], [8, 0, 'contested']] },
    ko: { r: 2, p: 'fighting', w: [1, 0], u: 0, s: 12, lw: 'a', lr: 'elimination', win: null }, gem: { ea: 3, eb: null, sp: 5, nx: 2 } };
  const v = viewSnapshot(snap, true);
  assert.deepEqual([v.fighters[0].x, v.fighters[0].z], [-1.23, 5.68]);
  assert.deepEqual(v.gems, [{ x: -1, z: -2 }]);
  assert.deepEqual(v.hot.score, { a: 10, b: 40 });
  assert.deepEqual(v.hot.zones, [{ x: 8, z: -0, owner: 'b' }, { x: -8, z: -0, owner: 'contested' }]);
  assert.deepEqual(v.ko.wins, { a: 0, b: 1 }); assert.equal(v.ko.lastWinner, 'b');
  assert.deepEqual(v.gem.escape, { a: null, b: 3 });
  assert.equal(viewSnapshot(snap, false).hot.zones[0].owner, 'a');
  assert.equal(rankedServerUrl({ hostname: 'localhost' }), 'ws://localhost:8787/parties/colors-server/ranked');
  assert(rankedServerUrl({ hostname: 'example.com' }).startsWith('wss://'));
}

// ── Two sessions through an in-memory server (same rules as party/server.js) ──
function createHub() {
  const queue = M.createRankedQueue(), sockets = new Map(), matchOf = new Map();
  let clock = 0, nextId = 1;
  const deliver = (id, msg) => sockets.get(id)?.receive(msg);
  class FakeSocket {
    constructor() { this.id = `c${nextId++}`; this.readyState = 0; sockets.set(this.id, this); queueMicrotask(() => { this.readyState = 1; this.onopen?.(); this.receive({ type: 'CONNECTED', playerId: this.id }); }); }
    receive(msg) { this.onmessage?.({ data: JSON.stringify(msg) }); }
    close() { this.readyState = 3; sockets.delete(this.id); leave(this.id); }
    send(raw) {
      const data = JSON.parse(raw);
      if (data.type === 'RANKED_QUEUE') { queue.join({ id: this.id, mode: data.mode, points: data.points, nickname: data.nickname, charType: data.charType }, clock); deliver(this.id, { type: 'RANKED_QUEUED', playerId: this.id, ...queue.status(this.id, clock) }); }
      else if (data.type === 'RANKED_LEAVE') leave(this.id);
      else if (data.type === 'RELAY') { const m = matchOf.get(this.id); for (const id of m?.ids ?? []) if (id !== this.id) deliver(id, { ...data, fromId: this.id }); }
      else if (data.type === 'RANKED_RESULT') { const m = matchOf.get(this.id); if (m && m.hostId === this.id && !m.ended) { m.ended = true; for (const id of m.ids) deliver(id, { type: 'RANKED_END', winner: data.winner, score: data.score }); } }
    }
  }
  function leave(id) {
    queue.leave(id);
    const m = matchOf.get(id); if (!m) return;
    matchOf.delete(id); m.ids = m.ids.filter(other => other !== id);
    if (!m.ended) for (const other of m.ids) deliver(other, m.hostId === id ? { type: 'RANKED_VOID' } : { type: 'PLAYER_LEFT', playerId: id });
    if (m.hostId === id) m.ended = true;
  }
  return {
    FakeSocket,
    advance(seconds) {
      clock += seconds * 1000;
      for (const group of queue.tick(clock)) {
        const { seats, hostId } = M.assignRankedSeats(group.players);
        const m = { ids: group.players.map(p => p.id), hostId, ended: false };
        for (const id of m.ids) matchOf.set(id, m);
        for (const id of m.ids) deliver(id, { type: 'RANKED_MATCH', matchId: 'r1', mode: group.mode, mapId: 1, seed: 42, hostId, seats });
      }
    },
  };
}
function recorder() {
  const log = { status: [], started: null, offline: null, snaps: [], inputs: [], actions: [], left: [], ended: null, voided: null };
  return { log, adapter: {
    status: t => log.status.push(t), startOffline: (mode, note) => { log.offline = { mode, note }; },
    startMatch: m => { log.started = m; }, hostSnapshot: () => ({ t: 1, f: [packFighter({ seat: log.started.mySeat, x: 2, z: 20, angle: 0, hp: 100, maxHp: 100, dead: false, life: 0, gems: 3 })], g: [[0, 1]], gem: { ea: null, eb: null, sp: 1, nx: 3 } }),
    guestInput: () => ({ x: 1, z: 26, angle: Math.PI / 2, dead: false, life: 0 }),
    applySnapshot: v => log.snaps.push(v), applyInput: (seat, input) => log.inputs.push({ seat, input }),
    remoteAction: (seat, action) => log.actions.push({ seat, action }), seatLeft: seat => log.left.push(seat),
    endMatch: r => { log.ended = r; }, voidMatch: reason => { log.voided = reason; },
  } };
}
const roster = ['red', 'green', 'blue', 'orange', 'yellow', 'cyan'];
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
{
  const hub = createHub();
  const H = recorder(), G = recorder();
  const host = createRankedSession({ adapter: H.adapter, roster, url: 'x', WebSocketImpl: hub.FakeSocket });
  const guest = createRankedSession({ adapter: G.adapter, roster, url: 'x', WebSocketImpl: hub.FakeSocket });
  host.queue({ mode: 'gemGrab', charType: 'red', points: 800, nickname: '호스트' });
  guest.queue({ mode: 'gemGrab', charType: 'blue', points: 700, nickname: '게스트' });
  await tick();
  assert(host.queued && guest.queued);
  assert(G.log.status.at(-1).includes('찾은 인원'), 'queue status text shown');
  hub.advance(5); assert(!H.log.started, 'two people do not fill six seats: wait for the timeout');
  hub.advance(R.fillAfter);
  assert(H.log.started && G.log.started, 'both land in the same match after the timeout');
  assert.equal(H.log.started.role, 'host'); assert.equal(G.log.started.role, 'guest');
  assert.deepEqual(H.log.started.seats, G.log.started.seats, 'same seats, same bot characters on both pages');
  assert.equal(H.log.started.seats.filter(s => !s.playerId).length, 4, 'bots fill the other four seats');
  assert.equal(G.log.started.myTeam, 'b'); assert.equal(G.log.started.flipped, true);
  assert.equal(G.log.started.botSeats.length, 5); assert.equal(G.log.started.botSeats[0].team, 'b');
  assert(G.log.status.at(-1) === null, 'queue box hidden once matched');
  // Host → guest snapshot (turned 180° for team b), guest → host input (back in host frame).
  host.frame(1); guest.frame(1);
  assert.equal(G.log.snaps.length, 1);
  assert.deepEqual([G.log.snaps[0].fighters[0].x, G.log.snaps[0].fighters[0].z], [-2, -20]);
  assert.deepEqual(G.log.snaps[0].gems, [{ x: -0, z: -1 }]);
  assert.equal(H.log.inputs.length, 1);
  assert.equal(H.log.inputs[0].seat, G.log.started.mySeat);
  assert.deepEqual([H.log.inputs[0].input.x, H.log.inputs[0].input.z], [-1, -26]);
  host.frame(.01); assert.equal(G.log.snaps.length, 1, 'about 15 sends a second, not every frame');
  // Actions: guest → host in host frame; host → guest for other fighters only.
  guest.localAction({ kind: 'fire', angle: 0, point: { x: 3, z: 4 } });
  assert.deepEqual(H.log.actions[0], { seat: G.log.started.mySeat, action: { kind: 'fire', angle: Math.PI, point: { x: -3, z: -4 } } });
  host.hostEvent(G.log.started.mySeat, { kind: 'fire', angle: Math.PI, point: null });
  host.hostEvent(H.log.started.mySeat, { kind: 'cast', angle: 0, point: { x: 1, z: 1 } });
  assert.equal(G.log.actions.length, 1, 'a guest ignores the echo of its own action');
  assert.deepEqual(G.log.actions[0].action.point, { x: -1, z: -1 });
  // Result: the host reports team a won 10:7; the guest (team b) sees a loss 7:10.
  host.reportResult('a', { a: 10, b: 7 });
  assert.deepEqual(G.log.ended, { outcome: 'loss', score: { a: 7, b: 10 } });
  assert(!guest.active, 'guest session ends with the result');
}
{ // Host leaving voids the match for the guest; a guest leaving hands its seat to a bot on the host.
  const hub = createHub();
  const H = recorder(), G = recorder(), G2 = recorder();
  const host = createRankedSession({ adapter: H.adapter, roster, url: 'x', WebSocketImpl: hub.FakeSocket });
  const guest = createRankedSession({ adapter: G.adapter, roster, url: 'x', WebSocketImpl: hub.FakeSocket });
  const guest2 = createRankedSession({ adapter: G2.adapter, roster, url: 'x', WebSocketImpl: hub.FakeSocket });
  host.queue({ mode: 'knockout', charType: 'red', points: 900 }); guest.queue({ mode: 'knockout', charType: 'blue', points: 850 }); guest2.queue({ mode: 'knockout', charType: 'cyan', points: 800 });
  await tick(); hub.advance(R.fillAfter);
  assert.equal(H.log.started.role, 'host');
  const leaverSeat = G2.log.started.mySeat;
  guest2.leave();
  assert.deepEqual(H.log.left, [leaverSeat]);
  host.leave();
  assert(G.log.voided, 'host left → void');
  assert(!guest.active);
}
{ // Alone in the queue at the timeout, or no server: today's bot match.
  const hub = createHub();
  const S = recorder();
  const solo = createRankedSession({ adapter: S.adapter, roster, url: 'x', WebSocketImpl: hub.FakeSocket });
  solo.queue({ mode: 'hotZone', charType: 'red', points: 0 });
  await tick(); hub.advance(R.fillAfter);
  assert.equal(S.log.offline.mode, 'hotZone'); assert(!solo.active);
  class Broken { constructor() { queueMicrotask(() => this.onerror?.()); } close() {} }
  const O = recorder();
  createRankedSession({ adapter: O.adapter, roster, url: 'x', WebSocketImpl: Broken }).queue({ mode: 'gemGrab', charType: 'red', points: 0 });
  await tick();
  assert.equal(O.log.offline.mode, 'gemGrab');
  // Cancelling the queue hides the box and does not start anything.
  const C = recorder();
  const c = createRankedSession({ adapter: C.adapter, roster, url: 'x', WebSocketImpl: hub.FakeSocket });
  c.queue({ mode: 'gemGrab', charType: 'red', points: 0 }); await tick(); c.cancel(); hub.advance(R.fillAfter);
  assert(!C.log.started && !C.log.offline && C.log.status.at(-1) === null && !c.queued);
}
console.log('ranked matchmaking: ok');
