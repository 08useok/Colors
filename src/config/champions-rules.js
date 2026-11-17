// Champions event rules as a factory, so the main game can run its own event apart from the beta one.
// Flow: survival (two mode groups, the last of each group out at every cut, groups trade modes at swapRound)
// → Soccer Kick final (bottom finalCut out at every cut) → 1v1 duel tournament (semifinals 1v4, 2v3, then the final).
const KST = 9 * 3600000, DAY = 86400000, CUT_TIME = (18 * 60 + 10) * 60000;
// Cuts always fall at 18:10 KST on the day the round ends, even when a cut was processed late.
export const championsCutAt = t => Math.floor((t + KST) / DAY) * DAY - KST + CUT_TIME;

export function createChampionsRules({ id, start, roundMs, swapRound, finalSize, finalCut, tournamentSize, groups }) {
  const roster = groups.flatMap(g => g.characters);
  const empty = () => ({ games: 0, wins: 0, losses: 0, draws: 0, damage: 0, kills: 0 });
  const table = ids => Object.fromEntries(ids.map(c => [c, empty()]));
  const games = (stats, ids) => ids.reduce((sum, c) => sum + (stats[c]?.games || 0), 0);

  function create() {
    return { id, phase: 'survival', round: 1, nextEliminationAt: championsCutAt(start + roundMs),
      groups: Object.fromEntries(groups.map(g => [g.id, [...g.characters]])), survivalStats: table(roster),
      finalists: [], finalStats: {}, eliminations: [], checkpointGames: { ...Object.fromEntries(groups.map(g => [g.id, 0])), soccer: 0 },
      champion: null, reward: null };
  }
  // Wins first, then win rate, damage, kills; ties fall back to roster order.
  function rank(stats, ids) {
    return [...ids].sort((a, b) => {
      const x = stats[a] || empty(), y = stats[b] || empty();
      return y.wins - x.wins || (y.games ? y.wins / y.games : 0) - (x.games ? x.wins / x.games : 0) || y.damage - x.damage || y.kills - x.kills || roster.indexOf(a) - roster.indexOf(b);
    });
  }
  const openMatches = state => (state.tournament?.matches || []).filter(m => m.round === state.round && !m.winner);
  function rosterFor(state, mode) {
    if (state.phase === 'survival') return [...(state.groups[mode] || [])];
    if (state.phase === 'tournament' && mode === 'duel') return openMatches(state).flatMap(m => [m.a, m.b]);
    return state.phase === 'final' && mode === 'soccer' ? [...state.finalists] : [];
  }
  function duelOpponent(state, character) {
    const match = openMatches(state).find(m => m.a === character || m.b === character);
    return match ? (match.a === character ? match.b : match.a) : null;
  }
  function startTournament(state) {
    const seeds = rank(state.finalStats, state.finalists);
    state.phase = 'tournament'; state.round = 1;
    state.tournament = { seeds, matches: [
      { id: 'semi-1', round: 1, a: seeds[0], b: seeds[3], wins: { a: 0, b: 0 }, games: 0, winner: null },
      { id: 'semi-2', round: 1, a: seeds[1], b: seeds[2], wins: { a: 0, b: 0 }, games: 0, winner: null },
    ] };
  }
  // A series goes to the character with more won matches; a tie (or no games) goes to the better seed.
  function settleMatch(state, match, now) {
    const seed = c => state.tournament.seeds.indexOf(c);
    match.winner = match.wins.a > match.wins.b ? match.a : match.wins.b > match.wins.a ? match.b : (seed(match.a) < seed(match.b) ? match.a : match.b);
    const loser = match.winner === match.a ? match.b : match.a;
    state.eliminations.push({ character: loser, mode: 'duel', phase: 'tournament', round: state.round, match: match.id, at: now });
  }
  function advance(state, now) {
    state.nextEliminationAt = championsCutAt(state.nextEliminationAt);
    if (now < state.nextEliminationAt || state.phase === 'complete') return;
    if (state.phase === 'survival') {
      // Each group is cut on its own: only when it has new results since its last cut, and only among characters that
      // have played (a group with no games, or a character never picked, is not cut by roster order). Wait while no
      // group has new results, and never replay several missed cuts at once.
      const stats = state.survivalStats;
      const due = groups.filter(g => games(stats, state.groups[g.id]) > state.checkpointGames[g.id] && state.groups[g.id].some(c => stats[c]?.games > 0));
      if (!due.length) return;
      for (const g of due) {
        const loser = rank(stats, state.groups[g.id].filter(c => stats[c]?.games > 0)).at(-1);
        state.groups[g.id] = state.groups[g.id].filter(c => c !== loser);
        state.eliminations.push({ character: loser, mode: g.id, phase: 'survival', round: state.round, at: now });
      }
      for (const g of groups) state.checkpointGames[g.id] = games(stats, state.groups[g.id]);
      if (Object.values(state.groups).flat().length <= finalSize) {
        state.phase = 'final'; state.finalists = Object.values(state.groups).flat(); state.finalStats = table(state.finalists); state.round = 1;
      } else {
        state.round++;
        if (state.round === swapRound && !state.swapped) {
          const [a, b] = groups.map(g => g.id);
          [state.groups[a], state.groups[b]] = [state.groups[b], state.groups[a]]; state.swapped = true;
          [state.checkpointGames[a], state.checkpointGames[b]] = [state.checkpointGames[b], state.checkpointGames[a]];
        }
      }
    } else if (state.phase === 'final') {
      const all = Object.keys(state.finalStats);
      if (games(state.finalStats, all) <= state.checkpointGames.soccer) return;
      const out = rank(state.finalStats, state.finalists).slice(-Math.min(finalCut, state.finalists.length - tournamentSize));
      for (const loser of out) state.eliminations.push({ character: loser, mode: 'soccer', phase: 'final', round: state.round, at: now });
      state.finalists = state.finalists.filter(c => !out.includes(c));
      state.checkpointGames.soccer = games(state.finalStats, all); state.round++;
      if (state.finalists.length <= tournamentSize) startTournament(state);
    } else if (state.phase === 'tournament') {
      for (const match of openMatches(state)) settleMatch(state, match, now);
      const winners = state.tournament.matches.filter(m => m.round === state.round).map(m => m.winner);
      if (winners.length === 1) {
        state.phase = 'complete'; state.champion = winners[0];
        state.reward = { character: state.champion, type: 'crown', skin: `crown_main_champions_${state.champion}` };
      } else {
        state.round++;
        state.tournament.matches.push({ id: 'final', round: state.round, a: winners[0], b: winners[1], wins: { a: 0, b: 0 }, games: 0, winner: null });
      }
    }
    state.nextEliminationAt = championsCutAt(now + roundMs);
  }
  // Records one finished match: all six participants for team modes, or one duel game for the tournament.
  function record(state, ticket, result, now) {
    const list = rosterFor(state, ticket.mode);
    if (ticket.phase !== state.phase || ticket.round !== state.round || !list.includes(ticket.character)) return false;
    if (ticket.mode === 'duel') {
      const match = openMatches(state).find(m => (m.a === ticket.character && m.b === ticket.opponent) || (m.b === ticket.character && m.a === ticket.opponent));
      if (!match) return false;
      match.games++;
      if (!result.abandoned && !result.draw) { const side = (match.a === ticket.character) === !!result.won ? 'a' : 'b'; match.wins[side]++; }
      advance(state, now); return true;
    }
    const participants = !result.abandoned && result.participants?.length ? result.participants : [{ character: ticket.character, team: 'a', damage: result.damage, kills: result.kills }];
    if (participants.some(p => !list.includes(p.character))) return false;
    const stats = state.phase === 'survival' ? state.survivalStats : state.finalStats;
    for (const p of participants) {
      const s = stats[p.character];
      const draw = !result.abandoned && result.draw;
      const won = !result.abandoned && !draw && (p.team === 'a' ? result.won : !result.won);
      s.games++; s.wins += Number(won); s.draws += Number(draw); s.losses += Number(!won && !draw);
      if (!result.abandoned) { s.damage += p.damage; s.kills += p.kills; }
    }
    advance(state, now); return true;
  }
  function snapshot(state, now) {
    return { ...state, phase: now < start ? 'upcoming' : state.phase, startAt: start, roundDays: roundMs / DAY,
      format: { finalSize, finalCut, tournamentSize, swapRound },
      tournament: state.tournament ? structuredClone(state.tournament) : null,
      ranking: state.phase === 'survival' ? Object.fromEntries(groups.map(g => [g.id, rank(state.survivalStats, state.groups[g.id])])) : { soccer: rank(state.finalStats, Object.keys(state.finalStats)) },
      reward: state.reward ? { ...state.reward } : null };
  }
  return { id, start, groups, roster, create, rank, rosterFor, duelOpponent, openMatches, advance, record, snapshot };
}
