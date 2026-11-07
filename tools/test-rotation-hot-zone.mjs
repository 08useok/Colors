// Official Season 1: mode rotation (3 of 6 every 6 h, Showdown always, Showdown+ last week) and Hot Zone scoring.
import assert from 'node:assert/strict';
import { ROTATION_MODES, activeRotation, showdownPlusOpen, modeOpen } from '../src/config/mode-rotation.js';
import { HOT_ZONE_RULES, createHotZone, tickHotZone, hotZoneTimeResult } from '../src/config/hot-zone.js';

const H = 3600e3, t0 = Date.UTC(2026, 10, 7, 0, 0, 0);
{ // Three open modes, changing every 6 h; every mode once per 12 h; same answer anywhere in a block.
  const a = activeRotation(t0), b = activeRotation(t0 + 6 * H), c = activeRotation(t0 + 12 * H);
  assert.equal(a.modes.length, 3);
  assert.deepEqual(a.modes, activeRotation(t0 + 5.9 * H).modes);
  assert.notDeepEqual(a.modes, b.modes);
  assert.deepEqual([...a.modes, ...b.modes].sort(), [...ROTATION_MODES].sort());
  assert.deepEqual(a.modes, c.modes);
  assert.equal(a.endsAt, t0 + 6 * H);
}
{ // Showdown always; Showdown+ only in the last 7 days of the month.
  assert(modeOpen('showdown', t0));
  assert.equal(showdownPlusOpen(new Date(2026, 10, 23, 12).getTime()), false);
  assert.equal(showdownPlusOpen(new Date(2026, 10, 24, 12).getTime()), true);
  assert.equal(showdownPlusOpen(new Date(2026, 10, 30, 23).getTime()), true);
  assert.equal(showdownPlusOpen(new Date(2026, 11, 1, 0).getTime()), false);
  assert.equal(showdownPlusOpen(new Date(2027, 1, 22, 12).getTime()), true, 'February has 28 days: last week starts on the 22nd');
}
{ // Hot Zone: alone in the zone scores; both teams inside: nobody scores; 100% wins.
  const s = createHotZone(0);
  tickHotZone(s, [{ team: 'a', x: 0, z: 0, alive: true }], 10);
  assert(Math.abs(s.score.a - 10 * HOT_ZONE_RULES.ratePerSecond) < 1e-9);
  tickHotZone(s, [{ team: 'a', x: 0, z: 0, alive: true }, { team: 'b', x: 1, z: 0, alive: true }], 10);
  assert(Math.abs(s.score.a - 10 * HOT_ZONE_RULES.ratePerSecond) < 1e-9 && s.score.b === 0, 'contested: no score');
  assert.equal(s.zones[0].owner, 'contested');
  tickHotZone(s, [{ team: 'b', x: 0, z: 0, alive: false }, { team: 'a', x: 9, z: 0, alive: true }], 10);
  assert.equal(s.zones[0].owner, null, 'dead fighters and outsiders do not count');
  assert.equal(tickHotZone(s, [{ team: 'a', x: 0, z: 0, alive: true }], 200), 'a');
  assert.equal(s.score.a, 100);
}
{ // Two zones score separately; time result by score.
  const s = createHotZone(1);
  tickHotZone(s, [{ team: 'a', x: -8, z: 0, alive: true }, { team: 'b', x: 8, z: 0, alive: true }, { team: 'b', x: 8, z: 1, alive: true }], 4);
  assert.equal(s.score.a, s.score.b);
  assert.equal(hotZoneTimeResult(s), null, 'equal score: draw');
  tickHotZone(s, [{ team: 'b', x: 8, z: 0, alive: true }], 1);
  assert.equal(hotZoneTimeResult(s), 'b');
}
console.log('PASS rotation (3 of 6 / 6 h, Showdown, Showdown+ last week) and Hot Zone scoring.');
