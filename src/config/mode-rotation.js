// Official Season 1 mode rotation. Showdown is always open; Showdown+ opens only in the last week
// (7 days) of each month. Three of the six rotation modes are open at once and they change every
// 6 hours, by clock time, so everyone sees the same modes: the six modes go round every 12 hours.
export const ROTATION_MODES = ['knockout', 'gemGrab', 'soccer', 'goldRush', 'chopWood', 'hotZone'];
export const ROTATION = Object.freeze({ slots: 3, hours: 6 });
export const MODE_NAMES = Object.freeze({ knockout: 'KNOCKOUT', gemGrab: '젬 그랩', soccer: 'SOCCER KICK', goldRush: '골드 러쉬',
  chopWood: '찹 우드', hotZone: '핫 존', showdown: '쇼다운', showdownPlus: '쇼다운+' });

const BLOCK = ROTATION.hours * 3600e3;

export function activeRotation(now = Date.now()) {
  const block = Math.floor(now / BLOCK), first = block * ROTATION.slots % ROTATION_MODES.length;
  const modes = Array.from({ length: ROTATION.slots }, (_, i) => ROTATION_MODES[(first + i) % ROTATION_MODES.length]);
  return { modes, endsAt: (block + 1) * BLOCK };
}

// Last 7 days of the month, in local time.
export function showdownPlusOpen(now = Date.now()) {
  const date = new Date(now), last = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return date.getDate() > last - 7;
}

export function modeOpen(mode, now = Date.now()) {
  if (mode === 'showdown') return true;
  if (mode === 'showdownPlus') return showdownPlusOpen(now);
  return activeRotation(now).modes.includes(mode);
}
