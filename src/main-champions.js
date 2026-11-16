// Main lobby Champions panel: shared standings from the server, joining a match, and sending results.
// Same flow as the beta Champions, with its own event, server store and saved data.
import { MAIN_CHAMPIONS as R } from './config/main-champions.js?v=1';

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PENDING_KEY = 'colorsMainChampionsPending', PERSONAL_KEY = 'colorsMainChampionsPersonal';
// ?champions-api=http://localhost:8787 points the panel at a local Worker for testing.
const api = () => (new URLSearchParams(location.search).get('champions-api') || 'https://colors-multiplayer.useok-jeju.workers.dev') + '/api/main-champions';
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; } };
const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };
const kst = t => new Date(t).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export function createMainChampions({ title, content, name, onPlay, notify, onState }) {
  let state = null, active = null, syncing = null, generation = 0;
  const personal = read(PERSONAL_KEY, { characters: {}, ids: [] });
  const saved = read(PENDING_KEY, {});
  let pending = Array.isArray(saved.pending) ? saved.pending : [];
  // A match left open by a closed tab counts as abandoned.
  if (saved.active) pending.push({ id: saved.active.id, result: { won: false, draw: false, abandoned: true, damage: 0, kills: 0 } });
  const recovered = saved.active ? { previousCharacter: saved.active.previousCharacter ?? null } : null;
  if (saved.active) recordPersonal(saved.active, { abandoned: true });
  const persist = () => write(PENDING_KEY, { active, pending });
  persist();

  function recordPersonal(ticket, result) {
    if (!ticket?.character || personal.ids.includes(ticket.id)) return;
    const s = personal.characters[ticket.character] ||= { games: 0, wins: 0, losses: 0, draws: 0 };
    const won = !result.abandoned && result.won, draw = !result.abandoned && !won && result.draw;
    s.games++; s.wins += Number(!!won); s.draws += Number(!!draw); s.losses += Number(!won && !draw);
    personal.ids.push(ticket.id); personal.ids = personal.ids.slice(-500);
    write(PERSONAL_KEY, personal);
  }
  async function request(path = '', data) {
    let response;
    try { response = await fetch(api() + path, { method: data ? 'POST' : 'GET', cache: 'no-store', headers: data ? { 'Content-Type': 'application/json' } : {}, body: data ? JSON.stringify(data) : undefined, signal: AbortSignal.timeout(10000) }); }
    catch { throw Error('챔피언스 서버에 연결할 수 없습니다. 잠시 후 다시 열어 주세요.'); }
    let result; try { result = await response.json(); } catch { throw Error('챔피언스 서버에 연결할 수 없습니다. 잠시 후 다시 열어 주세요.'); }
    if (!response.ok) throw Object.assign(Error(result.error || '챔피언스 기록을 불러오지 못했습니다.'), { status: response.status });
    return result;
  }
  function setState(next) { state = next; onState?.(state); }
  function flush() {
    if (syncing) return syncing;
    syncing = (async () => {
      let counted = false;
      while (pending.length) {
        try { const response = await request('/finish', pending[0]); setState(response.state); counted = response.counted; pending.shift(); persist(); if (!response.counted) notify('대회 라운드가 바뀌어 이번 경기는 순위에 반영되지 않았습니다.'); }
        catch (error) { if (error.status === 400) { pending.shift(); persist(); notify(error.message); } else throw error; }
      }
      return counted;
    })().finally(() => { syncing = null; });
    return syncing;
  }
  async function render() {
    const current = ++generation;
    title.textContent = '🏆 CHAMPIONS · 메인 시즌 8';
    content.innerHTML = '<p role="status">전체 플레이어 공통 순위를 불러오는 중…</p>';
    try { await flush(); const next = await request(); if (current !== generation) return; setState(next); draw(); }
    catch (error) {
      if (current !== generation) return;
      content.replaceChildren();
      const p = document.createElement('p'); p.setAttribute('role', 'status'); p.textContent = error.message;
      const retry = document.createElement('button'); retry.type = 'button'; retry.textContent = '다시 불러오기'; retry.onclick = render;
      content.append(p, retry);
    }
  }
  function draw() {
    const s = state, f = s.format, upcoming = s.phase === 'upcoming', complete = s.phase === 'complete', tournament = s.phase === 'tournament';
    const final = s.phase === 'final' || tournament || complete;
    const eliminated = id => (s.eliminations || []).some(e => e.character === id);
    const alive = tournament ? (s.tournament?.seeds || []).filter(id => !eliminated(id)) : final ? (complete ? [s.champion] : s.finalists) : Object.values(s.groups).flat();
    const matches = s.tournament?.matches || [];
    const bracket = matches.length ? `<section class="mc-card"><h3>토너먼트 · 1대1 듀얼</h3><p>대진의 두 캐릭터 중 하나로 참가하면 상대는 AI가 맡습니다. 다음 집계 때 이긴 경기가 많은 캐릭터가 올라가고, 같으면 시드가 높은 캐릭터가 올라갑니다.</p>${matches.map(m => {
      const open = tournament && m.round === s.round && !m.winner, label = m.id === 'final' ? '결승' : m.id === 'semi-1' ? '4강 1 (1위 vs 4위)' : '4강 2 (2위 vs 3위)';
      const side = (id, wins) => `<div class="mc-duel-side${m.winner === id ? ' mc-winner' : ''}"><b>${escape(name(id))}</b> <small>${wins}승</small>${open ? `<button type="button" data-mc-mode="duel" data-mc-character="${id}">${escape(name(id))}(으)로 참가</button>` : ''}</div>`;
      return `<article class="mc-row"><div><b>${label}</b>${side(m.a, m.wins.a)}${side(m.b, m.wins.b)}<small>${m.winner ? `승자: ${escape(name(m.winner))}` : open ? `진행 중 · ${m.games}경기` : '대기'}</small></div></article>`;
    }).join('')}</section>` : '';
    const members = g => upcoming ? g.characters : [...(s.groups[g.id] || []), ...(s.eliminations || []).filter(e => e.phase === 'survival' && e.mode === g.id).map(e => e.character)];
    const panels = final ? [{ id: 'soccer', name: tournament || complete ? 'SOCCER KICK · 최종 순위 (토너먼트 시드)' : 'SOCCER KICK · 최종전', characters: Object.keys(s.finalStats) }] : R.groups.map(g => ({ ...g, characters: members(g) }));
    const stats = final ? s.finalStats : s.survivalStats;
    const headline = upcoming ? '생존전 준비' : complete ? '최종 우승자 확정' : tournament ? (s.round === 1 ? '4강 · 1대1 듀얼' : '결승 · 1대1 듀얼') : final ? `TOP ${s.finalists.length} · 사커 킥 최종전` : `${s.round}차 생존전 · 두 모드`;
    const status = upcoming ? `시작: ${kst(s.startAt)}` : complete ? `🏆 ${escape(name(s.champion))} 우승 · 참가한 플레이어 모두에게 「챔피언스 왕관 ${escape(name(s.champion))}」 스킨 지급` : `생존 ${alive.length}명 · 다음 집계: ${kst(s.nextEliminationAt)}`;
    content.innerHTML = `<section class="mc-intro"><strong>${headline}</strong><p>${status}</p><p>메인 17명 → 젬 그랩·녹아웃 생존전 (매일 18:10 두 모드에서 1명씩 탈락, ${f.swapRound}차부터 모드 교체) → ${f.finalSize}명 이하가 되면 사커 킥 (매일 하위 ${f.finalCut}명 탈락) → ${f.tournamentSize}명 1대1 듀얼 토너먼트 → 우승 캐릭터 왕관 스킨</p><p>대회 경기의 플레이어와 AI 6명 전원을 캐릭터별로 서버에서 함께 집계합니다. 승수 → 승률 → 피해량 → 처치 순이고, 새 경기 기록이 없으면 탈락을 미룹니다. 베타 챔피언스와는 따로 집계합니다.</p>${pending.length ? `<p role="status">전송 대기 ${pending.length}경기</p>` : ''}<button type="button" data-mc-refresh>새로고침</button></section>${bracket}<div class="mc-groups">${panels.map(group => {
      const ranking = s.ranking[group.id] || group.characters;
      const ids = [...ranking, ...group.characters.filter(id => !ranking.includes(id))];
      return `<section class="mc-card"><h3>${escape(group.name)}</h3><p>${group.characters.filter(id => upcoming || alive.includes(id)).length}명 생존 / ${group.characters.length}명</p>${ids.map((id, index) => {
        const st = stats[id] || { games: 0, wins: 0, losses: 0, draws: 0, damage: 0 }, out = !upcoming && !alive.includes(id);
        const eligible = !upcoming && !complete && !tournament && !out, mine = personal.characters[id];
        const myRate = mine?.games ? `${Math.round(mine.wins / mine.games * 100)}% · ${mine.wins}승 ${mine.losses}패 ${mine.draws}무` : '기록 없음';
        return `<article class="mc-row${out ? ' mc-out' : ''}"><div><b>${index + 1}. ${escape(name(id))}</b><small>공통 ${st.wins}승 ${st.losses}패 ${st.draws}무 / ${st.games}경기 · 승률 ${st.games ? Math.round(st.wins / st.games * 100) : 0}% · 피해 ${Math.round(st.damage).toLocaleString('ko-KR')}</small><small>나의 기록 · ${myRate}</small></div><button type="button" data-mc-mode="${group.id}" data-mc-character="${id}" ${eligible ? '' : 'disabled'}>${s.champion === id ? '🏆 우승' : out ? '탈락' : upcoming ? '개최 전' : '참가'}</button></article>`;
      }).join('')}</section>`;
    }).join('')}</div>`;
    content.querySelector('[data-mc-refresh]').onclick = render;
    content.querySelectorAll('[data-mc-character]').forEach(button => button.onclick = async () => {
      content.querySelectorAll('[data-mc-character]').forEach(b => { b.disabled = true; });
      try { await flush(); const response = await request('/start', { mode: button.dataset.mcMode, character: button.dataset.mcCharacter }); setState(response.state); await onPlay(response.ticket); }
      catch (error) { notify(error.message); await render(); }
    });
  }
  return {
    recovered,
    render,
    get state() { return state; },
    get active() { return active; },
    async refresh() { try { await flush(); setState(await request()); } catch {} return state; },
    begin(ticket, previousCharacter) { active = { ...ticket, previousCharacter }; persist(); },
    setParticipants(participants) { if (active) { active.participants = participants; persist(); } },
    // result: { won, draw, abandoned, damage, kills, participants?: [{ id, damage, kills }] } (id: player, ai-1 … ai-5)
    finish(result) {
      if (!active) return null;
      const ticket = active; active = null;
      recordPersonal(ticket, result);
      const clean = r => ({ damage: Math.max(0, Math.round(Number(r?.damage) || 0)), kills: Math.max(0, Math.floor(Number(r?.kills) || 0)) });
      const participants = !result.abandoned && ticket.participants ? ticket.participants.map(p => ({ ...p, ...clean(result.participants?.find(r => r.id === p.id)) })) : undefined;
      pending.push({ id: ticket.id, result: { won: !!result.won, draw: !!result.draw, abandoned: !!result.abandoned, ...clean(result), ...(participants ? { participants } : {}) } });
      persist();
      void flush().then(counted => { if (counted) notify('챔피언스 공통 순위에 반영됐습니다.'); }).catch(() => notify('챔피언스 결과 전송 대기 · 챔피언스 메뉴를 열면 다시 보냅니다.'));
      return ticket;
    },
  };
}
