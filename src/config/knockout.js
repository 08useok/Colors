export const KNOCKOUT_RULES = Object.freeze({ winsRequired: 2, countdown: 3, intermission: 3, roundSeconds: 90, poisonStarts: 45, poisonCloses: 85 });

export function createKnockoutMatch(now = 0) {
  return { round: 1, wins: { a: 0, b: 0 }, phase: "countdown", until: now + KNOCKOUT_RULES.countdown, startedAt: now + KNOCKOUT_RULES.countdown, winner: null, lastWinner: null };
}

export function knockoutSafeHalf(elapsed) {
  return 19.5 * Math.max(0, Math.min(1, (KNOCKOUT_RULES.poisonCloses - elapsed) / (KNOCKOUT_RULES.poisonCloses - KNOCKOUT_RULES.poisonStarts)));
}

// Call once after all combat events for a frame, so simultaneous KOs draw.
export function advanceKnockout(match, fighters, now) {
  if (match.phase === "complete") return null;
  if (match.phase === "countdown") {
    if (now < match.until) return null;
    match.phase = "fighting"; match.startedAt = now;
    return "start";
  }
  if (match.phase === "intermission") {
    if (now < match.until) return null;
    match.round++; match.phase = "countdown";
    match.until = now + KNOCKOUT_RULES.countdown;
    return "next-round";
  }
  const living = team => fighters.filter(f => f.team === team && !f.dead && f.health > 0);
  const a = living("a"), b = living("b"), timeout = now - match.startedAt >= KNOCKOUT_RULES.roundSeconds;
  if (a.length && b.length && !timeout) return null;
  let winner = a.length && !b.length ? "a" : b.length && !a.length ? "b" : null;
  if (a.length && b.length && timeout) {
    const hp = list => list.reduce((total, f) => total + f.health / f.maxHealth, 0);
    winner = a.length !== b.length ? (a.length > b.length ? "a" : "b") : Math.abs(hp(a) - hp(b)) > 1e-6 ? (hp(a) > hp(b) ? "a" : "b") : null;
  }
  match.lastWinner = winner;
  match.lastReason = timeout ? "timeout" : "elimination";
  if (winner) match.wins[winner]++;
  if (winner && match.wins[winner] >= KNOCKOUT_RULES.winsRequired) {
    match.phase = "complete"; match.winner = winner;
    return "match-end";
  }
  match.phase = "intermission"; match.until = now + KNOCKOUT_RULES.intermission;
  return "round-end";
}
