import { routePartykitRequest, Server } from "partyserver";
import { DurableObject } from "cloudflare:workers";

const ROOM_MAX = 8;
const COUNTDOWN_SEC = 5;
// 매칭에서 허용하는 캐릭터 — 베타 시즌 1에서 크림슨 추가
const PLAYABLE_CHARACTERS = new Set(["red", "green", "blue", "orange", "yellow", "cyan", "purple", "pink", "crimson", "gold", "ivory"]);
export class LeaderboardStore extends DurableObject {
  async getLeaderboard() {
    return await this.ctx.storage.get("global-leaderboard") ?? [];
  }

  async recordLeaderboard(entry) {
    const playerId = typeof entry?.playerId === "string" ? entry.playerId.slice(0, 80) : "";
    const nickname = typeof entry?.nickname === "string" ? entry.nickname.trim().slice(0, 20) : "";
    const trophies = Math.max(0, Math.min(10000000, Math.floor(Number(entry?.trophies) || 0)));
    if (!playerId || !nickname) return this.getLeaderboard();
    const leaderboard = await this.getLeaderboard();
    const existing = leaderboard.find((player) => player.playerId === playerId);
    const next = { playerId, nickname, trophies, updatedAt: Date.now() };
    if (existing) Object.assign(existing, next);
    else leaderboard.push(next);
    leaderboard.sort((a, b) => b.trophies - a.trophies || b.updatedAt - a.updatedAt);
    leaderboard.splice(100);
    await this.ctx.storage.put("global-leaderboard", leaderboard);
    return leaderboard;
  }

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
    player.charType = PLAYABLE_CHARACTERS.has(data.charType) ? data.charType : "red";
    player.mode = data.mode === "showdown" ? "showdown" : "takedown";

    const previousMatchId = this.playerMatch.get(player.id);
    if (previousMatchId) this.leaveMatch(player.id, previousMatchId);

    let match = [...this.matches.values()].find((item) => !item.started && item.mode === player.mode && item.playerIds.length < ROOM_MAX);
    if (!match) {
      const currentMapId = Math.floor(Date.now() / 86400000) % 3;
      match = { id: `match-${this.nextMatchId++}`, spawnSeed: crypto.randomUUID(), mode: player.mode, mapId: currentMapId, playerIds: [], started: false, countdownTimer: null };
      this.matches.set(match.id, match);
    }
    match.playerIds.push(player.id);
    this.playerMatch.set(player.id, match.id);

    this.broadcastMatch(match, { type: "PLAYER_JOINED", player: this.publicPlayer(player) }, player.id);
    this.send(connection, {
      type: "ROOM_JOINED",
      playerId: player.id,
      players: this.matchPlayers(match),
      mode: match.mode,
      countdownActive: match.countdownTimer !== null,
    });
    if (match.mode === "showdown") this.startCountdown(match, 3, true);
    else if (match.playerIds.length >= 2) this.startCountdown(match);
  }

  relay(sender, data) {
    const match = this.matches.get(this.playerMatch.get(sender.id));
    if (match?.started) this.broadcastMatch(match, { ...data, fromId: sender.id }, sender.id);
  }

  startCountdown(match, duration = COUNTDOWN_SEC, restart = false) {
    if (match.started) return;
    if (match.countdownTimer) {
      if (!restart) return;
      clearInterval(match.countdownTimer);
      match.countdownTimer = null;
    }
    let seconds = duration;
    this.broadcastMatch(match, { type: "COUNTDOWN", seconds });
    match.countdownTimer = setInterval(() => {
      seconds -= 1;
      this.broadcastMatch(match, { type: "COUNTDOWN", seconds });
      if (seconds <= 0) {
        clearInterval(match.countdownTimer);
        match.countdownTimer = null;
        match.started = true;
        this.broadcastMatch(match, { type: "GAME_START", mode: match.mode, mapId: match.mapId, spawnSeed: match.spawnSeed, hostId: match.playerIds[0], players: this.matchPlayers(match) });
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
    if (!match.started && match.mode !== "showdown" && match.playerIds.length < 2) this.cancelCountdown(match);
    if (!match.started && match.mode === "showdown" && match.playerIds.length > 0) this.startCountdown(match, 3, true);
    if (match.playerIds.length === 0) {
      if (match.countdownTimer) clearInterval(match.countdownTimer);
      this.matches.delete(match.id);
    }
  }

  matchPlayers(match) {
    return match.playerIds.map((id) => this.players.get(id)).filter(Boolean).map((player) => this.publicPlayer(player));
  }

  publicPlayer(player) {
    return { id: player.id, nickname: player.nickname, charType: player.charType };
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
    if (request.method === "OPTIONS" && pathname.startsWith("/api/")) {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (pathname === "/api/leaderboard") {
      const statsServer = env.LeaderboardStore.getByName("global-event");
      try {
        const leaderboard = request.method === "POST"
          ? await statsServer.recordLeaderboard(await request.json())
          : await statsServer.getLeaderboard();
        return Response.json({ leaderboard }, { headers: corsHeaders });
      } catch {
        return Response.json({ error: "Invalid leaderboard request" }, { status: 400, headers: corsHeaders });
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
