// Official Season 1 Christmas event (12.1–12.31 KST): a gift track filled by playing matches, and a
// Christmas calendar with one box per December day. Pure functions over the saved `official.christmas`
// block so they can be tested without the page. See specs/official-season-1.md (크리스마스 이벤트).

export const CHRISTMAS_ID = 'official1-christmas-2026';
export const CHRISTMAS_START = Date.parse('2026-12-01T00:00:00+09:00');
export const CHRISTMAS_END = Date.parse('2027-01-01T00:00:00+09:00');
const KST = 9 * 3600e3, DAY = 86400e3;

// Gifts per match: win 3, draw 2, loss 1, abandoning 0.
export const giftsForMatch = ({ won = false, draw = false, abandoned = false } = {}) => abandoned ? 0 : won ? 3 : draw ? 2 : 1;
export const GIFT_TRACK = Object.freeze([
  { gifts: 5, coins: 1000 },
  { gifts: 15, credits: 300 },
  { gifts: 30, gems: 10 },
  { gifts: 50, coins: 2500 },
  { gifts: 75, credits: 600 },
  { gifts: 100, gems: 15 },
  { gifts: 125, coins: 5000 },
  { gifts: 150, credits: 1200 },
  { gifts: 175, gems: 15 },
  { gifts: 200, coins: 10000, gems: 30 },
].map(Object.freeze));
export const GIFT_MAX = GIFT_TRACK[GIFT_TRACK.length - 1].gifts;

// Calendar: one box per day, opened only on its own day (missed days stay closed).
// Every 5th day 5 gems, every 3rd day 200 credits, other days coins that grow each week;
// 25th (Christmas) and 31st are special boxes.
function calendarReward(day) {
  if (day === 25) return { coins: 5000, gems: 25, special: true };
  if (day === 31) return { coins: 3000, credits: 500, special: true };
  if (day % 5 === 0) return { gems: 5 };
  if (day % 3 === 0) return { credits: 200 };
  return { coins: 500 + Math.floor((day - 1) / 7) * 250 };
}
export const CALENDAR_DAYS = 31;
export const CALENDAR = Object.freeze(Array.from({ length: CALENDAR_DAYS }, (_, i) => Object.freeze({ day: i + 1, ...calendarReward(i + 1) })));

export const christmasPhase = (now = Date.now()) => now < CHRISTMAS_START ? 'before' : now >= CHRISTMAS_END ? 'ended' : 'open';
// December day (1–31) in KST while the event is open, otherwise null.
export const calendarDay = (now = Date.now()) => christmasPhase(now) === 'open' ? Math.floor((now - CHRISTMAS_START) / DAY) + 1 : null;
// Start of the next KST day, for the "next box" countdown.
export const nextKstDay = (now = Date.now()) => (Math.floor((now + KST) / DAY) + 1) * DAY - KST;

const n = v => Math.max(0, Math.floor(Number(v) || 0));
const pick = (list, valid) => [...new Set((Array.isArray(list) ? list : []).map(Number).filter(v => valid.includes(v)))];
export function normalizeChristmas(saved = {}) {
  const s = saved?.id === CHRISTMAS_ID ? saved : {};
  return { id: CHRISTMAS_ID, gifts: Math.min(GIFT_MAX, n(s.gifts)), trackClaimed: pick(s.trackClaimed, GIFT_TRACK.map(r => r.gifts)),
    calendarClaimed: pick(s.calendarClaimed, CALENDAR.map(r => r.day)) };
}

function grant(state, reward) {
  state.coins = (state.coins || 0) + (reward.coins || 0);
  state.credits = (state.credits || 0) + (reward.credits || 0);
  state.official.gems += reward.gems || 0;
}

// Adds a match's gifts while the event is open; returns the gifts added (0 outside the event).
export function addChristmasGifts(official, result, now = Date.now()) {
  if (christmasPhase(now) !== 'open') return 0;
  const event = official.christmas, before = event.gifts;
  event.gifts = Math.min(GIFT_MAX, before + giftsForMatch(result));
  return event.gifts - before;
}
// Track rewards already earned can be claimed even after the event ends.
export function claimGiftReward(state, gifts) {
  const event = state.official.christmas, reward = GIFT_TRACK.find(r => r.gifts === gifts);
  if (!reward) return { ok: false, reason: 'unknown' };
  if (event.trackClaimed.includes(gifts)) return { ok: false, reason: 'claimed' };
  if (event.gifts < gifts) return { ok: false, reason: 'locked' };
  grant(state, reward); event.trackClaimed.push(gifts);
  return { ok: true, reward };
}
export function claimCalendarBox(state, day, now = Date.now()) {
  const event = state.official.christmas, reward = CALENDAR[day - 1];
  if (!reward) return { ok: false, reason: 'unknown' };
  if (event.calendarClaimed.includes(day)) return { ok: false, reason: 'claimed' };
  const today = calendarDay(now);
  if (today == null || day > today) return { ok: false, reason: 'locked' };
  if (day < today) return { ok: false, reason: 'missed' };
  grant(state, reward); event.calendarClaimed.push(day);
  return { ok: true, reward };
}
export const unclaimedGiftRewards = event => GIFT_TRACK.filter(r => event.gifts >= r.gifts && !event.trackClaimed.includes(r.gifts)).length;
export const calendarReady = (event, now = Date.now()) => { const d = calendarDay(now); return d != null && !event.calendarClaimed.includes(d); };
