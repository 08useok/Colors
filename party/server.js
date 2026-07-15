import { routePartykitRequest, Server } from "partyserver";

const ROOM_MAX = 8;
const COUNTDOWN_SEC = 5;
const CHARACTERS = new Set(["red", "green", "blue", "orange", "yellow", "cyan", "purple", "pink"]);

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
    match.playerIds = match.playerIds.filter((id) => id !== playerId);
    this.broadcastMatch(match, { type: "PLAYER_LEFT", playerId });
    if (!match.started && match.playerIds.length < 2) this.cancelCountdown(match);
    if (match.playerIds.length === 0) {
      if (match.countdownTimer) clearInterval(match.countdownTimer);
      this.matches.delete(match.id);
    }
  }

  matchPlayers(match) {
    return match.playerIds.map((id) => this.players.get(id)).filter(Boolean).map((player) => this.publicPlayer(player));
  }

  publicPlayer(player) { return { id: player.id, nickname: player.nickname, charType: player.charType }; }

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
    const routed = await routePartykitRequest(request, env);
    if (routed) return routed;

    const { pathname } = new URL(request.url);
    if (pathname === "/favicon.ico") return new Response(null, { status: 204 });
    return new Response("Colors multiplayer server is running.", {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  },
};
