const http = require("http");
const { WebSocketServer } = require("ws");
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Colors WS Server OK");
});
const wss = new WebSocketServer({ server });
server.listen(PORT, () => console.log(`Colors WS server on port ${PORT}`));

const ROOM_MAX = 8;
const COUNTDOWN_SEC = 5;

let nextId = 1;
const rooms = {};       // roomId → room
const playerRoom = {};  // playerId → roomId
const players = {};     // playerId → { id, ws, nickname, charType }

function roomBroadcast(room, data, excludeId = null) {
  const msg = JSON.stringify(data);
  for (const pid of room.playerIds) {
    if (pid === excludeId) continue;
    const p = players[pid];
    if (p && p.ws.readyState === 1) p.ws.send(msg);
  }
}

function startCountdown(room) {
  if (room.countdownTimer || room.started) return;
  let secs = COUNTDOWN_SEC;
  roomBroadcast(room, { type: "COUNTDOWN", seconds: secs });

  room.countdownTimer = setInterval(() => {
    secs--;
    roomBroadcast(room, { type: "COUNTDOWN", seconds: secs });

    if (secs <= 0) {
      clearInterval(room.countdownTimer);
      room.countdownTimer = null;
      room.started = true;
      const hostId = room.playerIds[0];
      roomBroadcast(room, {
        type: "GAME_START",
        hostId,
        players: room.playerIds.map((pid) => ({
          id: pid,
          nickname: players[pid]?.nickname || "플레이어",
          charType: players[pid]?.charType || "red",
        })),
      });
    }
  }, 1000);
}

function cancelCountdown(room) {
  if (room.countdownTimer) {
    clearInterval(room.countdownTimer);
    room.countdownTimer = null;
    roomBroadcast(room, { type: "COUNTDOWN_CANCELLED" });
  }
}

wss.on("connection", (ws) => {
  const pid = nextId++;
  players[pid] = { id: pid, ws, nickname: "플레이어", charType: "red" };
  ws.send(JSON.stringify({ type: "CONNECTED", playerId: pid }));

  ws.on("message", (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }

    const player = players[pid];
    if (!player) return;

    if (msg.type === "JOIN_QUEUE") {
      player.nickname = msg.nickname || "플레이어";
      player.charType = msg.charType || "red";

      let room = Object.values(rooms).find(
        (r) => !r.started && r.playerIds.length < ROOM_MAX
      );
      if (!room) {
        const rid = `r${nextId++}`;
        room = { id: rid, playerIds: [], started: false, countdownTimer: null };
        rooms[rid] = room;
      }

      room.playerIds.push(pid);
      playerRoom[pid] = room.id;

      roomBroadcast(room, {
        type: "PLAYER_JOINED",
        player: { id: pid, nickname: player.nickname, charType: player.charType },
      }, pid);

      ws.send(JSON.stringify({
        type: "ROOM_JOINED",
        playerId: pid,
        players: room.playerIds.map((p) => ({
          id: p,
          nickname: players[p]?.nickname || "플레이어",
          charType: players[p]?.charType || "red",
        })),
        countdownActive: room.countdownTimer !== null,
      }));

      if (room.playerIds.length >= 2) startCountdown(room);

    } else if (msg.type === "RELAY") {
      const rid = playerRoom[pid];
      if (!rid) return;
      const room = rooms[rid];
      if (!room || !room.started) return;
      roomBroadcast(room, { ...msg, fromId: pid }, pid);
    }
  });

  ws.on("close", () => {
    const rid = playerRoom[pid];
    if (rid) {
      const room = rooms[rid];
      if (room) {
        room.playerIds = room.playerIds.filter((p) => p !== pid);
        roomBroadcast(room, { type: "PLAYER_LEFT", playerId: pid });

        if (room.playerIds.length < 2 && !room.started) {
          cancelCountdown(room);
        }
        if (room.playerIds.length === 0) {
          if (room.countdownTimer) clearInterval(room.countdownTimer);
          delete rooms[rid];
        }
      }
      delete playerRoom[pid];
    }
    delete players[pid];
  });
});

console.log(`Colors WS server on port ${PORT}`);
