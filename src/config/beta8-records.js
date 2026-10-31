import { questStats, questPoints } from './beta8-quests.js';
export const RECORD_SEASON = 'beta8';
export const RECORD_MODES = ['goldRush','showdown','soccer','gemGrab','chopWood','knockout'];
export function matchRecord(input) {
  if (!input || !RECORD_MODES.includes(input.mode) || typeof input.id !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(input.id)) return null;
  if (typeof input.character !== 'string' || !/^[a-z]+$/.test(input.character)) return null;
  const stats = questStats(input);
  const abandoned = input.abandoned === true, won = !abandoned && input.won === true;
  const number = v => Number.isFinite(v) ? Math.max(0, v) : 0;
  return { id: input.id, season: RECORD_SEASON, mode: input.mode, character: input.character,
    endedAt: number(input.endedAt), duration: number(input.duration), ...stats,
    deaths: Math.floor(number(input.deaths)), rank: input.mode === 'showdown' && Number.isInteger(input.rank) ? Math.min(10,Math.max(1,input.rank)) : null,
    abandoned, won, draw: !abandoned && !won && input.draw === true,
    points: abandoned ? 0 : questPoints(stats) + (won ? 5 : 0) };
}
export function emptySummary() { return { games:0,wins:0,losses:0,draws:0,abandoned:0,kills:0,deaths:0,damage:0,healing:0,points:0,streak:0,bestStreak:0,bestKills:0,bestDamage:0,bestHealing:0 }; }
export function addSummary(previous, record) {
  const s = { ...emptySummary(), ...previous };
  s.games++; s.wins += Number(record.won); s.draws += Number(record.draw); s.losses += Number(!record.won && !record.draw); s.abandoned += Number(record.abandoned);
  for (const key of ['kills','deaths','damage','healing','points']) s[key] += record[key];
  s.streak = record.won ? s.streak + 1 : 0;
  s.bestStreak = Math.max(s.bestStreak,s.streak);
  for (const key of ['Kills','Damage','Healing']) s['best'+key] = Math.max(s['best'+key],record[key.toLowerCase()]);
  return s;
}
export function appendRecord(book, input) {
  const record = matchRecord(input);
  const b = book && typeof book === 'object' ? book : {};
  if (!record || b.recent?.some(r => r.id === record.id)) return b;
  return { ...b, recent:[record,...(b.recent || [])].slice(0,20),
    total:addSummary(b.total,record), characters:{ ...b.characters,[record.character]:addSummary(b.characters?.[record.character],record) } };
}
export function rankedRows(entries) {
  const sorted = entries.slice().sort((a,b)=>b.points-a.points || b.wins-a.wins || b.kills-a.kills || String(a.id).localeCompare(String(b.id)));
  let rank = 0;
  return sorted.map((row,i)=>{const prev=sorted[i-1];if(!prev || row.points!==prev.points || row.wins!==prev.wins || row.kills!==prev.kills)rank=i+1;return {...row,rank};});
}
