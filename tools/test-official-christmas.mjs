// Official Season 1 Christmas event: gift track, calendar, event window and save normalization.
import assert from 'node:assert/strict';
import * as X from '../src/official/christmas-event.js';
import { normalizeOfficial } from '../src/official/progression.js';

const at = s => Date.parse(`${s}+09:00`);
const fresh = () => ({ coins: 0, credits: 0, official: normalizeOfficial({}) });

// Window: 12.1 00:00 – 12.31 23:59 KST.
assert.equal(X.christmasPhase(at('2026-11-30T23:59:59')), 'before');
assert.equal(X.christmasPhase(at('2026-12-01T00:00:00')), 'open');
assert.equal(X.christmasPhase(at('2026-12-31T23:59:59')), 'open');
assert.equal(X.christmasPhase(at('2027-01-01T00:00:00')), 'ended');
assert.equal(X.calendarDay(at('2026-12-01T00:00:00')), 1);
assert.equal(X.calendarDay(at('2026-12-25T23:59:00')), 25);
assert.equal(X.calendarDay(at('2026-11-30T12:00:00')), null);
assert.equal(X.nextKstDay(at('2026-12-05T13:00:00')), at('2026-12-06T00:00:00'));

// Gifts: win 3, draw 2, loss 1, abandon 0; only while open; capped at the track end.
const s = fresh();
assert.equal(X.addChristmasGifts(s.official, { won: true }, at('2026-11-30T12:00:00')), 0);
assert.equal(X.addChristmasGifts(s.official, { won: true }, at('2026-12-02T12:00:00')), 3);
assert.equal(X.addChristmasGifts(s.official, { draw: true }, at('2026-12-02T12:00:00')), 2);
assert.equal(X.addChristmasGifts(s.official, {}, at('2026-12-02T12:00:00')), 1);
assert.equal(X.addChristmasGifts(s.official, { abandoned: true, won: true }, at('2026-12-02T12:00:00')), 0);
assert.equal(X.addChristmasGifts(s.official, { won: true }, at('2027-01-01T00:00:00')), 0);
assert.equal(s.official.christmas.gifts, 6);

// Track claims.
assert.equal(X.claimGiftReward(s, 15).reason, 'locked');
assert.deepEqual(X.claimGiftReward(s, 5), { ok: true, reward: X.GIFT_TRACK[0] });
assert.equal(s.coins, 1000);
assert.equal(X.claimGiftReward(s, 5).reason, 'claimed');
assert.equal(X.claimGiftReward(s, 7).reason, 'unknown');
s.official.christmas.gifts = 999; s.official.christmas = normalizeOfficial(s.official).christmas;
assert.equal(s.official.christmas.gifts, X.GIFT_MAX);
assert.equal(X.unclaimedGiftRewards(s.official.christmas), X.GIFT_TRACK.length - 1);

// Calendar: only today's box.
const c = fresh(), day5 = at('2026-12-05T08:00:00');
assert.equal(X.claimCalendarBox(c, 6, day5).reason, 'locked');
assert.equal(X.claimCalendarBox(c, 4, day5).reason, 'missed');
assert.equal(X.calendarReady(c.official.christmas, day5), true);
assert.equal(X.claimCalendarBox(c, 5, day5).ok, true);
assert.equal(c.official.gems, 5);
assert.equal(X.claimCalendarBox(c, 5, day5).reason, 'claimed');
assert.equal(X.calendarReady(c.official.christmas, day5), false);
assert.equal(X.claimCalendarBox(c, 1, at('2026-11-30T12:00:00')).reason, 'locked');
assert.equal(X.claimCalendarBox(c, 31, at('2027-01-01T01:00:00')).reason, 'locked');
assert.deepEqual(X.CALENDAR[24], { day: 25, coins: 5000, gems: 25, special: true });

// Totals (keep in sync with specs/official-season-1.md).
const sum = (list, key) => list.reduce((t, r) => t + (r[key] || 0), 0);
assert.deepEqual([sum(X.GIFT_TRACK, 'coins'), sum(X.GIFT_TRACK, 'credits'), sum(X.GIFT_TRACK, 'gems')], [18500, 2100, 70]);
assert.deepEqual([sum(X.CALENDAR, 'coins'), sum(X.CALENDAR, 'credits'), sum(X.CALENDAR, 'gems')], [22500, 2100, 50]);

// Save round trip keeps progress; a different event id starts fresh.
const saved = JSON.parse(JSON.stringify(c.official));
assert.deepEqual(normalizeOfficial(saved).christmas.calendarClaimed, [5]);
assert.equal(normalizeOfficial({ christmas: { id: 'other', gifts: 50 } }).christmas.gifts, 0);
console.log('official christmas event: ok');
