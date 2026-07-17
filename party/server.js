import { routePartykitRequest, Server } from "partyserver";
import { DurableObject } from "cloudflare:workers";

const ROOM_MAX = 8;
const COUNTDOWN_SEC = 5;
const CHARACTERS = new Set(["red", "green", "blue", "orange", "yellow", "cyan", "purple", "pink"]);
const CHARACTER_ORDER = [...CHARACTERS];
const ROTATION_START_DATE = "2026-07-12";
const ROTATION_INITIAL_ROUND = 5;

function emptyRotationStats() {
  return Object.fromEntries(CHARACTER_ORDER.map((char) => [char, { wins: 0, games: 0, mvp: 0, bossDmg: 0 }]));
}

function rankCharacters(stats, characters) {
  return [...characters].sort((a, b) => {
    const sa = stats[a];
    const sb = stats[b];
    if (sa.wins !== sb.wins) return sa.wins - sb.wins;
    const rateA = sa.games ? sa.wins / sa.games : 0;
    const rateB = sb.games ? sb.wins / sb.games : 0;
    if (rateA !== rateB) return rateA - rateB;
    if (sa.mvp !== sb.mvp) return sa.mvp - sb.mvp;
    return sa.bossDmg - sb.bossDmg;
  });
}

function publicRotationState(state) {
  const { submissions: _submissions, ...publicState } = state;
  return publicState;
}

export class RotationStats extends DurableObject {
  async getState() {
    let state = await this.ctx.storage.get("rotation-state");
    if (!state) {
      state = {
        campaignVersion: 2,
        startDate: ROTATION_START_DATE,
        lastRoundProcessedAt: ROTATION_INITIAL_ROUND,
        remaining: ["cyan", "purple", "pink"],
        eliminated: ["red", "green", "blue", "orange", "yellow"],
        champion: null,
        stats: emptyRotationStats(),
        submissions: [],
      };
    }

    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
    const targetRound = Math.floor((new Date(`${today}T00:00:00+09:00`) - new Date(`${state.startDate}T00:00:00+09:00`)) / 86400000);
    while (state.lastRoundProcessedAt < targetRound && state.remaining.length > 1) {
      const eliminated = rankCharacters(state.stats, state.remaining)[0];
      state.remaining = state.remaining.filter((char) => char !== eliminated);
      if (!state.eliminated.includes(eliminated)) state.eliminated.push(eliminated);
      state.lastRoundProcessedAt += 1;
    }
    if (state.remaining.length === 1) state.champion = state.remaining[0];
    await this.ctx.storage.put("rotation-state", state);
    return state;
  }

  async recordResult(result) {
    const state = await this.getState();
    const resultId = typeof result?.resultId === "string" ? result.resultId.slice(0, 80) : "";
    const charType = result?.charType;
    if (!resultId || !CHARACTERS.has(charType) || state.submissions.includes(resultId)) return state;

    const stats = state.stats[charType];
    stats.games += 1;
    if (result.won === true) stats.wins += 1;
    if (result.mvp === true) stats.mvp += 1;
    stats.bossDmg += Math.max(0, Math.min(120000, Number(result.bossDmg) || 0));
    state.submissions.push(resultId);
    if (state.submissions.length > 5000) state.submissions.splice(0, state.submissions.length - 5000);
    await this.ctx.storage.put("rotation-state", state);
    return state;
  }
}

function cleanAbilityChars(value) {
  return Array.isArray(value) ? [...new Set(value.filter((charType) => CHARACTERS.has(charType)))] : [];
}

export class ColorsServer extends Server {
  players = new Map();
  matches = new Map();
  playerMatch = new Map();
  nextMatchId = 1;

  onConnect(connection) {
    this.players.set(connection.id, { id: connection.id, connection, nickname: "플레이어", charType: "red" });
    this.send(connection, { type: "CONNECTED", playerId: connection.id });
  }

  onMessage(sender, message) {
    if (typeof message !== "string") return;
    let data;
    try { data = JSON.parse(message); } catch { return; }
    if (data.type === "JOIN_QUEUE") this.joinQueue(sender, data);
    else if (data.type === "RELAY") this.relay(sender, data);
  }

  onClose(connection) { this.removePlayer(connection.id); }
  onError(connection) { this.removePlayer(connection.id); }

  joinQueue(connection, data) {
    const player = this.players.get(connection.id);
    if (!player) return;
    player.nickname = this.cleanNickname(data.nickname);
    player.charType = CHARACTERS.has(data.charType) ? data.charType : "red";
    player.newAbilityChars = cleanAbilityChars(data.newAbilityChars);

    const previousMatchId = this.playerMatch.get(player.id);
    if (previousMatchId) this.leaveMatch(player.id, previousMatchId);

    let match = [...this.matches.values()].find((item) => !item.started && item.playerIds.length < ROOM_MAX);
    if (!match) {
      match = { id: `match-${this.nextMatchId++}`, playerIds: [], started: false, countdownTimer: null };
      this.matches.set(match.id, match);
    }
    match.playerIds.push(player.id);
    this.playerMatch.set(player.id, match.id);

    this.broadcastMatch(match, { type: "PLAYER_JOINED", player: this.publicPlayer(player) }, player.id);
    this.send(connection, {
      type: "ROOM_JOINED",
      playerId: player.id,
      players: this.matchPlayers(match),
      countdownActive: match.countdownTimer !== null,
    });
    if (match.playerIds.length >= 2) this.startCountdown(match);
  }

  relay(sender, data) {
    const match = this.matches.get(this.playerMatch.get(sender.id));
    if (match?.started) this.broadcastMatch(match, { ...data, fromId: sender.id }, sender.id);
  }

  startCountdown(match) {
    if (match.countdownTimer || match.started) return;
    let seconds = COUNTDOWN_SEC;
    this.broadcastMatch(match, { type: "COUNTDOWN", seconds });
    match.countdownTimer = setInterval(() => {
      seconds -= 1;
      this.broadcastMatch(match, { type: "COUNTDOWN", seconds });
      if (seconds <= 0) {
        clearInterval(match.countdownTimer);
        match.countdownTimer = null;
        match.started = true;
        this.broadcastMatch(match, { type: "GAME_START", hostId: match.playerIds[0], players: this.matchPlayers(match) });
      }
    }, 1000);
  }

  cancelCountdown(match) {
    if (!match.countdownTimer) return;
    clearInterval(match.countdownTimer);
    match.countdownTimer = null;
    this.broadcastMatch(match, { type: "COUNTDOWN_CANCELLED" });
  }

  removePlayer(playerId) {
    const matchId = this.playerMatch.get(playerId);
    if (matchId) this.leaveMatch(playerId, matchId);
    this.players.delete(playerId);
  }

  leaveMatch(playerId, matchId) {
    const match = this.matches.get(matchId);
    this.playerMatch.delete(playerId);
    if (!match) return;
    const wasHost = match.started && match.playerIds[0] === playerId;
    match.playerIds = match.playerIds.filter((id) => id !== playerId);
    this.broadcastMatch(match, { type: "PLAYER_LEFT", playerId });
    if (wasHost && match.playerIds.length > 0) {
      this.broadcastMatch(match, {
        type: "HOST_CHANGED",
        hostId: match.playerIds[0],
        players: this.matchPlayers(match),
      });
    }
    if (!match.started && match.playerIds.length < 2) this.cancelCountdown(match);
    if (match.playerIds.length === 0) {
      if (match.countdownTimer) clearInterval(match.countdownTimer);
      this.matches.delete(match.id);
    }
  }

  matchPlayers(match) {
    return match.playerIds.map((id) => this.players.get(id)).filter(Boolean).map((player) => this.publicPlayer(player));
  }

  publicPlayer(player) {
    return { id: player.id, nickname: player.nickname, charType: player.charType, newAbilityChars: player.newAbilityChars ?? [] };
  }

  broadcastMatch(match, data, excludeId = null) {
    const payload = JSON.stringify(data);
    for (const playerId of match.playerIds) {
      if (playerId !== excludeId) this.players.get(playerId)?.connection.send(payload);
    }
  }

  send(connection, data) { connection.send(JSON.stringify(data)); }

  cleanNickname(value) {
    const nickname = typeof value === "string" ? value.trim().slice(0, 20) : "";
    return nickname || "플레이어";
  }
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    const corsHeaders = {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "content-type",
    };
    if (request.method === "OPTIONS" && pathname.startsWith("/api/rotation")) {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (pathname === "/api/rotation") {
      const statsServer = env.RotationStats.getByName("global-event");
      try {
        const state = request.method === "POST"
          ? await statsServer.recordResult(await request.json())
          : await statsServer.getState();
        return Response.json(publicRotationState(state), { headers: corsHeaders });
      } catch {
        return Response.json({ error: "Invalid event request" }, { status: 400, headers: corsHeaders });
      }
    }

    const routed = await routePartykitRequest(request, env);
    if (routed) return routed;

    if (pathname === "/favicon.ico") return new Response(null, { status: 204 });
    return new Response("Colors multiplayer server is running.", {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  },
};
