// Official Season 1 ranked (경쟁전) networking: queue, then a host-authoritative 3v3 match.
// The host's browser runs the combat engine, bots, gems/zones/rounds and the result; every other player
// (a guest) moves only their own fighter and sends position and actions; the host sends state ~15 times
// a second. Guests on team b see the field turned 180° (see ranked-match.js). Messages go through the
// Worker's RELAY, inside the match the server made. The page supplies an adapter; this file owns no game state.
import { viewFlipped, viewPoint, viewAngle, viewTeam, viewScore, rankedOutcome, fillBotCharacters, botSeatOrder } from './ranked-match.js';

export const RANKED_SEND_INTERVAL = 1 / 15; // seconds between snapshots / inputs
export const RANKED_ROOM = 'ranked';

export function rankedServerUrl(loc = globalThis.location) {
  const local = ['localhost', '127.0.0.1'].includes(loc?.hostname);
  const host = local ? 'localhost:8787' : (globalThis.PARTYKIT_HOST || 'colors-multiplayer.useok-jeju.workers.dev');
  return `${local ? 'ws' : 'wss'}://${host}/parties/colors-server/${RANKED_ROOM}`;
}

// ── Snapshot (host frame) → what one player sees ──────────────────────────
// Snapshot: { t, f: [[seat, x, z, angle, hp, maxHp, dead, life, gems, charge, transformCharge]], g: [[x, z]],
//   gem?: { ea, eb, sp, nx }, hot?: { s: [a, b], z: [[x, z, owner]] }, ko?: { r, p, w: [a, b], u, s, lw, lr, win } }
const r2 = v => Math.round(v * 100) / 100;
export function packFighter({ seat, x, z, angle, hp, maxHp, dead, life, gems, charge, transformCharge }) {
  return [seat, r2(x), r2(z), r2(angle), Math.round(hp), Math.round(maxHp), dead ? 1 : 0, life | 0, gems | 0, r2(charge || 0), r2(transformCharge || 0)];
}
export function unpackFighter(f) {
  return { seat: f[0], x: f[1], z: f[2], angle: f[3], hp: f[4], maxHp: f[5], dead: f[6] === 1, life: f[7], gems: f[8], charge: f[9], transformCharge: f[10] };
}
export function viewSnapshot(snap, flipped) {
  const point = (x, z) => viewPoint(x, z, flipped);
  const out = {
    t: snap.t,
    fighters: snap.f.map(unpackFighter).map(f => ({ ...f, ...point(f.x, f.z), angle: viewAngle(f.angle, flipped) })),
    gems: (snap.g || []).map(([x, z]) => point(x, z)),
  };
  if (snap.gem) out.gem = { escape: viewScore({ a: snap.gem.ea, b: snap.gem.eb }, flipped), spawned: snap.gem.sp, nextIn: snap.gem.nx };
  if (snap.hot) out.hot = { score: viewScore({ a: snap.hot.s[0], b: snap.hot.s[1] }, flipped), zones: snap.hot.z.map(([x, z, owner]) => ({ ...point(x, z), owner: viewTeam(owner, flipped) })) };
  if (snap.ko) out.ko = { round: snap.ko.r, phase: snap.ko.p, wins: viewScore({ a: snap.ko.w[0], b: snap.ko.w[1] }, flipped), untilIn: snap.ko.u, startedAgo: snap.ko.s,
    lastWinner: viewTeam(snap.ko.lw, flipped), lastReason: snap.ko.lr, winner: viewTeam(snap.ko.win, flipped) };
  return out;
}
// Positions and actions flip the same way in both directions (turning 180° twice is the identity).
export const viewInput = (input, flipped) => ({ ...input, ...viewPoint(input.x, input.z, flipped), angle: viewAngle(input.angle, flipped) });
export const viewAction = (action, flipped) => ({ ...action, angle: action.angle == null ? null : viewAngle(action.angle, flipped), point: action.point ? viewPoint(action.point.x, action.point.z, flipped) : null });

// ── Session ───────────────────────────────────────────────────────────────
// adapter: {
//   startMatch({ mode, mapId, seed, seats, mySeat, botSeats, role, flipped })  start the ranked match on the page
//   startOffline(mode)            no server / nobody else: today's bot match
//   hostSnapshot()                host: snapshot in host frame (see above)
//   guestInput()                  guest: { x, z, angle, dead, life } in the guest's own frame
//   applySnapshot(view)           guest: view = viewSnapshot(...)
//   applyInput(seat, input)       host: a guest's position (host frame)
//   remoteAction(seat, action)    host: run a guest's action on its fighter; guest: show another fighter's action
//   seatLeft(seat)                a guest left: the host hands its fighter to the AI
//   endMatch({ outcome, score })  guest: the server's result ('win' | 'loss' | 'draw'), score seen by this player
//   voidMatch(reason)             guest: host gone, no rank change
//   status(text | null)           queue overlay text (null hides it)
// }
export function createRankedSession({ adapter, roster, url = rankedServerUrl(), WebSocketImpl = globalThis.WebSocket }) {
  let ws = null, myId = null, queued = null, match = null, sendClock = 0;
  const session = {
    get active() { return !!match; },
    get queued() { return !!queued; },
    get role() { return match?.role ?? null; },
    get match() { return match; },
    isHost: () => match?.role === 'host',
    isGuest: () => match?.role === 'guest',
    seatOfPlayer: id => match?.seats.find(s => s.playerId === id)?.seat ?? null,
    queue, cancel, leave, frame, localAction, hostEvent, reportResult,
  };
  const send = (type, data = {}) => { if (ws?.readyState === 1) ws.send(JSON.stringify({ type, ...data })); };
  const relay = (relayType, data) => send('RELAY', { relayType, ...data });
  function close() { if (ws) { ws.onclose = ws.onmessage = ws.onerror = null; try { ws.close(); } catch {} } ws = null; }

  function queue({ mode, charType, points, nickname }) {
    if (match) return;
    cancel(false);
    queued = { mode, charType, points, nickname };
    adapter.status('서버에 연결하는 중…');
    let opened = false;
    try { ws = new WebSocketImpl(url); } catch { return offline(); }
    const timer = setTimeout(() => { if (!opened) offline(); }, 5000);
    ws.onopen = () => { opened = true; clearTimeout(timer); send('RANKED_QUEUE', queued); };
    ws.onerror = () => { if (!opened) { clearTimeout(timer); offline(); } };
    ws.onclose = () => { clearTimeout(timer); if (!opened && queued) return offline(); disconnected(); };
    ws.onmessage = ({ data }) => { let msg; try { msg = JSON.parse(data); } catch { return; } handle(msg); };
  }
  // No server (or it failed): play today's bot match so ranked is never blocked.
  function offline() {
    const mode = queued?.mode; close(); queued = null; adapter.status(null);
    if (mode) adapter.startOffline(mode, '멀티플레이 서버에 연결할 수 없어 봇과 경기합니다.');
  }
  function cancel(notify = true) {
    if (!queued) return;
    send('RANKED_LEAVE'); close(); queued = null;
    if (notify) adapter.status(null);
  }
  // Leaving a running match (abandon, or after it ended).
  function leave() {
    if (!match && !queued) return;
    send('RANKED_LEAVE'); close(); match = null; queued = null; adapter.status(null);
  }
  function disconnected() {
    if (queued && !match) { queued = null; adapter.status(null); return; }
    if (!match) return;
    const m = match; close();
    if (m.role === 'host') { for (const s of m.seats) if (s.playerId && s.seat !== m.mySeat) adapter.seatLeft(s.seat); match = { ...m, offline: true }; }
    else { match = null; adapter.voidMatch('서버 연결이 끊겨 경기가 무효 처리되었습니다.'); }
  }

  function handle(msg) {
    switch (msg.type) {
      case 'CONNECTED': myId = msg.playerId; break;
      case 'RANKED_QUEUED': myId = msg.playerId ?? myId; // fall through
      case 'RANKED_STATUS': if (queued && !match) adapter.status(`경쟁전 상대 찾는 중… ${msg.waited}초 · 찾은 인원 ${msg.found}/6 · 점수 범위 ±${msg.window} · ${msg.fillIn > 0 ? `${msg.fillIn}초 뒤 봇으로 채워 시작` : '곧 시작'}`); break;
      case 'RANKED_ERROR': offline(); break;
      case 'RANKED_MATCH': return matched(msg);
      case 'RELAY': return relayed(msg);
      case 'PLAYER_LEFT': if (match) { const seat = session.seatOfPlayer(msg.playerId); if (seat != null) { match.seats = match.seats.map(s => s.seat === seat ? { ...s, playerId: null, left: true } : s); adapter.seatLeft(seat); } } break;
      case 'RANKED_END': if (match && match.role === 'guest') { const m = match; match = null; close(); adapter.endMatch({ outcome: rankedOutcome(msg.winner, m.myTeam), score: viewScore(msg.score, m.flipped) }); } break;
      case 'RANKED_VOID': if (match && match.role === 'guest') { match = null; close(); adapter.voidMatch('호스트가 나가서 경기가 무효 처리되었습니다 (점수 변동 없음).'); } break;
    }
  }
  function matched(msg) {
    const mode = queued?.mode ?? msg.mode;
    queued = null; adapter.status(null);
    const seats = fillBotCharacters(msg.seats, msg.seed, roster);
    const me = seats.find(s => s.playerId === myId);
    if (!me) return;
    const humans = seats.filter(s => s.playerId).length;
    if (humans < 2) { close(); adapter.startOffline(mode, '함께할 사람이 없어 봇으로 채워 시작합니다.'); return; }
    const role = msg.hostId === myId ? 'host' : 'guest';
    match = { id: msg.matchId, mode, mapId: msg.mapId, seed: msg.seed, seats, mySeat: me.seat, myTeam: me.team, flipped: viewFlipped(me.team), role, hostId: msg.hostId };
    sendClock = 0;
    adapter.startMatch({ ...match, botSeats: botSeatOrder(seats, me.seat) });
  }
  function relayed(msg) {
    if (!match) return;
    const from = session.seatOfPlayer(msg.fromId);
    if (match.role === 'host') {
      if (from == null) return;
      if (msg.relayType === 'RIN') adapter.applyInput(from, msg.input);
      else if (msg.relayType === 'RACT') adapter.remoteAction(from, msg.action);
    } else if (msg.fromId === match.hostId) {
      if (msg.relayType === 'RSNAP') adapter.applySnapshot(viewSnapshot(msg.snap, match.flipped));
      else if (msg.relayType === 'RFX' && msg.seat !== match.mySeat) adapter.remoteAction(msg.seat, viewAction(msg.action, match.flipped));
    }
  }

  // Called every frame during the match.
  function frame(dt) {
    if (!match || match.offline) return;
    sendClock += dt;
    if (sendClock < RANKED_SEND_INTERVAL) return;
    sendClock %= RANKED_SEND_INTERVAL;
    if (match.role === 'host') relay('RSNAP', { snap: adapter.hostSnapshot() });
    else relay('RIN', { input: viewInput(adapter.guestInput(), match.flipped) });
  }
  // Guest: my own attack / ultimate / gadget / transform, sent in host frame.
  function localAction(action) { if (match?.role === 'guest') relay('RACT', { action: viewAction(action, match.flipped) }); }
  // Host: any fighter's action, so guests can show it.
  function hostEvent(seat, action) { if (match?.role === 'host' && !match.offline) relay('RFX', { seat, action }); }
  // Host: the result in host frame (winner 'a' | 'b' | null). The server sends it back to everyone.
  function reportResult(winner, score) {
    if (match?.role !== 'host') return;
    send('RANKED_RESULT', { winner, score });
    const done = () => { close(); match = null; };
    setTimeout(done, 300);
  }
  return session;
}
