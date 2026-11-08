// Ranked (경쟁전) against the real Worker: two sockets queue, land in one match after the timeout with bots
// filling four seats, relay snapshots, and both receive the same result. Needs `npm run dev` (port 8787).
// Run: node tools/test-ranked-server.mjs [ws://localhost:8787]
import assert from 'node:assert/strict';
import WebSocket from 'ws';
import { RANKED_QUEUE_RULES } from '../src/official/ranked-match.js';

const base = process.argv[2] ?? 'ws://localhost:8787';
const url = `${base}/parties/colors-server/ranked`;
function client(name) {
  const ws = new WebSocket(url), inbox = [], waiters = [];
  ws.on('message', raw => { const msg = JSON.parse(raw); inbox.push(msg); for (const w of [...waiters]) if (w.test(msg)) { waiters.splice(waiters.indexOf(w), 1); w.resolve(msg); } });
  const opened = new Promise((resolve, reject) => { ws.on('open', resolve); ws.on('error', reject); });
  return {
    name, ws, inbox, opened,
    send: data => ws.send(JSON.stringify(data)),
    wait(type, timeout = 30000) {
      const found = inbox.find(m => m.type === type);
      if (found) { inbox.splice(inbox.indexOf(found), 1); return Promise.resolve(found); }
      return new Promise((resolve, reject) => {
        const w = { test: m => m.type === type, resolve: m => { clearTimeout(timer); inbox.splice(inbox.indexOf(m), 1); resolve(m); } };
        const timer = setTimeout(() => reject(new Error(`${name}: no ${type} in ${timeout} ms`)), timeout);
        waiters.push(w);
      });
    },
  };
}

const a = client('A'), b = client('B');
try { await Promise.all([a.opened, b.opened]); }
catch { console.log(`ranked server: skipped (no server at ${base}; run npm run dev)`); process.exit(0); }
const started = Date.now();
a.send({ type: 'RANKED_QUEUE', mode: 'gemGrab', points: 820, nickname: '에이', charType: 'red' });
b.send({ type: 'RANKED_QUEUE', mode: 'gemGrab', points: 760, nickname: '비', charType: 'blue' });
const qa = await a.wait('RANKED_QUEUED');
assert.equal(qa.window, RANKED_QUEUE_RULES.startWindow);
await b.wait('RANKED_STATUS');
const [ma, mb] = await Promise.all([a.wait('RANKED_MATCH'), b.wait('RANKED_MATCH')]);
const waited = (Date.now() - started) / 1000;
assert(waited >= RANKED_QUEUE_RULES.fillAfter - 1.5, `matched after the fill timeout (${waited.toFixed(1)} s)`);
assert.deepEqual(ma, mb, 'both get the same match');
assert.equal(ma.seats.length, 6);
assert.equal(ma.seats.filter(s => s.playerId).length, 2);
assert.equal(ma.seats.filter(s => !s.playerId).length, 4, 'bots fill four seats');
const seatA = ma.seats.find(s => s.playerId === ma.hostId);
assert.equal(seatA.team, 'a'); assert.equal(seatA.nickname, '에이', 'higher points hosts on team a');
assert.equal(ma.seats.find(s => s.nickname === '비').team, 'b');
// RELAY inside the match.
a.send({ type: 'RELAY', relayType: 'RSNAP', snap: { t: 1, f: [], g: [] } });
const relayed = await b.wait('RELAY');
assert.equal(relayed.relayType, 'RSNAP'); assert.equal(relayed.fromId, ma.hostId);
// Only the host can report; both get the same RANKED_END.
const guestId = ma.seats.find(s => s.nickname === '비').playerId;
b.send({ type: 'RANKED_RESULT', winner: 'b', score: { a: 0, b: 10 } });
a.send({ type: 'RANKED_RESULT', winner: 'a', score: { a: 10, b: 7 } });
const [ea, eb] = await Promise.all([a.wait('RANKED_END'), b.wait('RANKED_END')]);
assert.deepEqual(ea, eb); assert.equal(ea.winner, 'a'); assert.deepEqual(ea.score, { a: 10, b: 7 });
assert.notEqual(guestId, ma.hostId);
a.ws.close(); b.ws.close();
console.log(`ranked server: ok (matched after ${waited.toFixed(1)} s, host ${ma.hostId.slice(0, 6)}, winner a 10:7)`);
process.exit(0);
