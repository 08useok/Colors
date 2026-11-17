// Durable Object storage for the main game's Champions (separate key and tickets from the beta event).
import { MAIN_CHAMPIONS as R } from '../src/config/main-champions.js';

const key = 'main-champions:' + R.id, ticketKey = id => 'main-champions-ticket:' + id;
const fail = message => { throw new Error(message); };
// One-time fixes to the live state, applied once and remembered in state.fixes.
// crystal-r1: the 11.17 first cut eliminated Crystal by roster order while Knockout had no games yet.
export function applyMainChampionsFixes(state) {
  state.fixes ??= [];
  if (!state.fixes.includes('crystal-r1')) {
    const i = state.eliminations.findIndex(e => e.character === 'crystal' && e.phase === 'survival' && e.round === 1);
    if (i >= 0 && state.phase === 'survival') {
      const { mode } = state.eliminations[i];
      state.eliminations.splice(i, 1);
      if (!state.groups[mode].includes('crystal')) state.groups[mode].push('crystal');
    }
    state.fixes.push('crystal-r1');
  }
  return state;
}
async function stateAt(tx, now) { const state = applyMainChampionsFixes(await tx.get(key) || R.create()); R.advance(state, now); return state; }

export async function getMainChampions(storage) {
  return storage.transaction(async tx => { const now = Date.now(), state = await stateAt(tx, now); await tx.put(key, state); return R.snapshot(state, now); });
}
export async function startMainChampions(storage, input) {
  return storage.transaction(async tx => {
    const now = Date.now(), state = await stateAt(tx, now);
    if (now < R.start) fail('메인 챔피언스는 11월 16일 오후 6시 10분(KST)에 시작합니다.');
    if (state.phase === 'complete') fail('메인 챔피언스가 끝났습니다.');
    const roster = R.rosterFor(state, input?.mode);
    if (!roster.includes(input?.character)) fail('해당 모드의 생존 캐릭터를 선택해 주세요.');
    const opponent = input.mode === 'duel' ? R.duelOpponent(state, input.character) : null;
    const ticket = { id: crypto.randomUUID(), phase: state.phase, round: state.round, mode: input.mode, character: input.character, startedAt: now, roster, ...(opponent ? { opponent } : {}) };
    await tx.put(ticketKey(ticket.id), ticket); await tx.put(key, state);
    return { ticket, state: R.snapshot(state, now) };
  });
}
export async function finishMainChampions(storage, input) {
  return storage.transaction(async tx => {
    if (typeof input?.id !== 'string' || !/^[a-f0-9-]{36}$/i.test(input.id)) fail('경기 번호를 확인해 주세요.');
    const now = Date.now(), state = await stateAt(tx, now), ticket = await tx.get(ticketKey(input.id));
    if (!ticket) fail('챔피언스 경기 기록을 찾을 수 없습니다.');
    if (ticket.finished) { await tx.put(key, state); return { counted: ticket.counted, state: R.snapshot(state, now) }; }
    if (now - ticket.startedAt > 2 * 3600000) fail('챔피언스 경기 기록이 만료되었습니다.');
    const r = input.result;
    if (!r || typeof r.won !== 'boolean' || typeof r.draw !== 'boolean' || typeof r.abandoned !== 'boolean') fail('경기 결과를 확인해 주세요.');
    const number = (value, max) => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= max;
    if (!number(r.damage, 1e8) || !number(r.kills, 1000)) fail('경기 수치를 확인해 주세요.');
    let participants;
    if (r.participants !== undefined) {
      // Team modes report all six slots (player and AI 1-5). Small rosters can repeat a character, as in the beta event.
      if (!Array.isArray(r.participants) || r.participants.length !== 6) fail('참가자 6명의 기록이 필요합니다.');
      const slots = new Set(['player', 'ai-1', 'ai-2', 'ai-3', 'ai-4', 'ai-5']), seen = new Set();
      participants = r.participants.map(p => {
        if (!p || !slots.has(p.id) || seen.has(p.id) || !ticket.roster.includes(p.character) || !['a', 'b'].includes(p.team) || !number(p.damage, 1e8) || !number(p.kills, 1000)) fail('참가자 기록을 확인해 주세요.');
        if (p.id === 'player' && (p.character !== ticket.character || p.team !== 'a')) fail('플레이어 참가 기록이 일치하지 않습니다.');
        seen.add(p.id); return { character: p.character, team: p.team, damage: p.damage, kills: p.kills };
      });
      if (participants.filter(p => p.team === 'a').length !== 3) fail('참가자 팀 구성을 확인해 주세요.');
    }
    const counted = R.record(state, ticket, { won: r.won, draw: r.draw, abandoned: r.abandoned, damage: r.damage, kills: r.kills, participants }, now);
    await tx.put(ticketKey(ticket.id), { ...ticket, finished: true, counted }); await tx.put(key, state);
    return { counted, state: R.snapshot(state, now) };
  });
}
