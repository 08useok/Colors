import { routePartykitRequest, Server } from "partyserver";
import { DurableObject } from "cloudflare:workers";
import { createRankedQueue, assignRankedSeats, RANKED_MAP_COUNT } from "../src/official/ranked-match.js";
import { getMainChampions, startMainChampions, finishMainChampions } from "./main-champions-store.js";

const ROOM_MAX = 8;
const SOCCER_ROOM_MAX = 6;
const COUNTDOWN_SEC = 5;
// 매칭에서 허용하는 캐릭터 — 베타 시즌 1에서 크림슨 추가
const PLAYABLE_CHARACTERS = new Set(["red", "green", "blue", "orange", "yellow", "cyan", "purple", "pink", "crimson", "gold", "ivory", "chartreuse", "mint", "azure", "crystal", "lavender", "salmon"]);
export class LeaderboardStore extends DurableObject {
  mainChampions() { return getMainChampions(this.ctx.storage); }
  mainChampionsStart(input) { return startMainChampions(this.ctx.storage, input); }
  mainChampionsFinish(input) { return finishMainChampions(this.ctx.storage, input); }
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
  // Official Season 1 ranked (경쟁전): its own queue; matched players share a match and RELAY like the main game.
  rankedQueue = createRankedQueue();
  rankedTimer = null;

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
    else if (data.type === "RANKED_QUEUE") this.joinRanked(sender, data);
    else if (data.type === "RANKED_LEAVE") this.leaveRanked(sender.id);
    else if (data.type === "RANKED_RESULT") this.rankedResult(sender, data);
  }

  onClose(connection) { this.removePlayer(connection.id); }
  onError(connection) { this.removePlayer(connection.id); }

  joinQueue(connection, data) {
    const player = this.players.get(connection.id);
    if (!player) return;
    player.nickname = this.cleanNickname(data.nickname);
    player.charType = PLAYABLE_CHARACTERS.has(data.charType) ? data.charType : "red";
    player.mode = ["showdown", "takedown", "chopwood", "soccer"].includes(data.mode) ? data.mode : "takedown";

    const previousMatchId = this.playerMatch.get(player.id);
    if (previousMatchId) this.leaveMatch(player.id, previousMatchId);

    const randomMap = data.mapId === -1;
    const requestedMap = Number.isInteger(data.mapId) && data.mapId >= 0 && data.mapId < 3 ? data.mapId : 0;
    const roomMax = player.mode === "soccer" ? SOCCER_ROOM_MAX : ROOM_MAX;
    let match = [...this.matches.values()].find((item) => !item.started && item.mode === player.mode && (randomMap ? item.randomMap === true : item.randomMap !== true && item.mapId === requestedMap) && item.playerIds.length < roomMax);
    if (!match) {
      const currentMapId = randomMap ? Math.floor(Math.random() * 3) : requestedMap;
      match = { id: `match-${this.nextMatchId++}`, spawnSeed: crypto.randomUUID(), mode: player.mode, mapId: currentMapId, randomMap, playerIds: [], started: false, countdownTimer: null };
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
    if (["showdown", "chopwood", "soccer"].includes(match.mode)) this.startCountdown(match, 3, true);
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

  // ── Ranked ──────────────────────────────────────────────────────────────
  joinRanked(connection, data) {
    const player = this.players.get(connection.id);
    if (!player) return;
    this.leaveRanked(player.id);
    player.nickname = this.cleanNickname(data.nickname);
    player.charType = typeof data.charType === "string" ? data.charType.slice(0, 24) : "red";
    const entry = this.rankedQueue.join({ id: player.id, mode: data.mode, points: data.points, nickname: player.nickname, charType: player.charType }, Date.now());
    if (!entry) return this.send(connection, { type: "RANKED_ERROR", reason: "mode" });
    this.send(connection, { type: "RANKED_QUEUED", playerId: player.id, mode: entry.mode, ...this.rankedQueue.status(player.id, Date.now()) });
    this.rankedTimer ??= setInterval(() => this.tickRanked(), 1000);
  }

  leaveRanked(playerId) {
    this.rankedQueue.leave(playerId);
    const matchId = this.playerMatch.get(playerId);
    if (matchId && this.matches.get(matchId)?.ranked) this.leaveMatch(playerId, matchId);
  }

  tickRanked() {
    const now = Date.now();
    for (const group of this.rankedQueue.tick(now)) this.startRankedMatch(group);
    for (const player of this.players.values()) {
      const status = this.rankedQueue.status(player.id, now);
      if (status) this.send(player.connection, { type: "RANKED_STATUS", ...status });
    }
    if (this.rankedQueue.size === 0) { clearInterval(this.rankedTimer); this.rankedTimer = null; }
  }

  startRankedMatch({ mode, players }) {
    const present = players.filter((p) => this.players.has(p.id));
    if (!present.length) return;
    const { seats, hostId } = assignRankedSeats(present);
    const match = { id: `ranked-${this.nextMatchId++}`, ranked: true, started: true, ended: false, mode, mapId: Math.floor(Math.random() * RANKED_MAP_COUNT),
      seed: Math.floor(Math.random() * 0x7fffffff), hostId, seats, playerIds: present.map((p) => p.id), countdownTimer: null };
    this.matches.set(match.id, match);
    for (const id of match.playerIds) {
      const previous = this.playerMatch.get(id);
      if (previous && previous !== match.id) this.leaveMatch(id, previous);
      this.playerMatch.set(id, match.id);
    }
    this.broadcastMatch(match, { type: "RANKED_MATCH", matchId: match.id, mode, mapId: match.mapId, seed: match.seed, hostId, seats });
  }

  // Only the host decides the result; the server sends the same result to everyone in the match.
  rankedResult(sender, data) {
    const match = this.matches.get(this.playerMatch.get(sender.id));
    if (!match?.ranked || match.ended || match.hostId !== sender.id) return;
    match.ended = true;
    const winner = data.winner === "a" || data.winner === "b" ? data.winner : null;
    const score = { a: Math.max(0, Math.floor(Number(data.score?.a) || 0)), b: Math.max(0, Math.floor(Number(data.score?.b) || 0)) };
    this.broadcastMatch(match, { type: "RANKED_END", matchId: match.id, winner, score, mode: match.mode });
  }

  removePlayer(playerId) {
    this.rankedQueue.leave(playerId);
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
    if (match.ranked) {
      // Ranked: a guest's seat goes to a bot; if the host leaves, the match is void for everyone else.
      if (!match.ended) this.broadcastMatch(match, match.hostId === playerId ? { type: "RANKED_VOID", matchId: match.id, reason: "host-left" } : { type: "PLAYER_LEFT", playerId });
      if (match.hostId === playerId) match.ended = true;
      if (match.playerIds.length === 0) this.matches.delete(match.id);
      return;
    }
    this.broadcastMatch(match, { type: "PLAYER_LEFT", playerId });
    if (wasHost && match.playerIds.length > 0) {
      this.broadcastMatch(match, {
        type: "HOST_CHANGED",
        hostId: match.playerIds[0],
        players: this.matchPlayers(match),
      });
    }
    if (!match.started && !["showdown", "chopwood", "soccer"].includes(match.mode) && match.playerIds.length < 2) this.cancelCountdown(match);
    if (!match.started && ["showdown", "chopwood", "soccer"].includes(match.mode) && match.playerIds.length > 0) this.startCountdown(match, 3, true);
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

    // Main (Season 8) Champions: its own store, separate from the beta Champions.
    if (pathname === '/api/main-champions' || pathname === '/api/main-champions/start' || pathname === '/api/main-champions/finish') {
      const store = env.LeaderboardStore.getByName('main-champions-global');
      const headers = { ...corsHeaders, 'cache-control': 'no-store' };
      try {
        if (pathname === '/api/main-champions' && request.method === 'GET') return Response.json(await store.mainChampions(), { headers });
        if (request.method !== 'POST' || pathname === '/api/main-champions') return Response.json({ error: 'Method not allowed' }, { status: 405, headers });
        const raw = await request.text(); if (raw.length > 2048) throw Error('요청이 너무 큽니다.');
        const input = JSON.parse(raw);
        return Response.json(pathname.endsWith('/start') ? await store.mainChampionsStart(input) : await store.mainChampionsFinish(input), { headers });
      } catch (error) { return Response.json({ error: error.message || '챔피언스 서버에 연결할 수 없습니다.' }, { status: 400, headers }); }
    }

    const routed = await routePartykitRequest(request, env);
    if (routed) return routed;

    if (pathname === "/favicon.ico") return new Response(null, { status: 204 });
    return new Response("Colors multiplayer server is running.", {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  },
};
