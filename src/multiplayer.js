// ── Colors Multiplayer Module ────────────────────────────────────────────
// 배포 후 WS_PROD_URL 을 실제 Railway/Render URL로 교체
const WS_PROD_URL = "wss://colors-server.railway.app";
const WS_URL =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "ws://localhost:3000"
    : WS_PROD_URL;

export const mp = {
  ws: null,
  myId: null,
  isHost: false,
  roomPlayers: [], // [{ id, nickname, charType }]
  _listeners: {},

  on(type, fn) { this._listeners[type] = fn; },
  off(type) { delete this._listeners[type]; },
  _emit(type, data) { const fn = this._listeners[type]; if (fn) fn(data); },

  send(type, data = {}) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...data }));
    }
  },

  relay(relayType, data = {}) {
    this.send("RELAY", { relayType, ...data });
  },

  connect(nickname, charType) {
    return new Promise((resolve, reject) => {
      try { this.ws = new WebSocket(WS_URL); } catch (e) { reject(e); return; }
      const timeout = setTimeout(() => reject(new Error("연결 시간 초과")), 8000);

      this.ws.onopen = () => {
        clearTimeout(timeout);
        this.ws.onmessage = ({ data }) => {
          let msg; try { msg = JSON.parse(data); } catch { return; }
          this._handle(msg);
        };
        this.ws.onclose = () => this._emit("DISCONNECTED", {});
        this.ws.onerror = () => {};
        this.send("JOIN_QUEUE", { nickname, charType });
        resolve();
      };
      this.ws.onerror = () => {
        clearTimeout(timeout);
        reject(new Error("서버에 연결할 수 없습니다"));
      };
    });
  },

  disconnect() {
    if (this.ws) { try { this.ws.close(); } catch (_) {} this.ws = null; }
    this.myId = null;
    this.isHost = false;
    this.roomPlayers = [];
    this._listeners = {};
  },

  _handle(msg) {
    switch (msg.type) {
      case "CONNECTED":
        this.myId = msg.playerId;
        break;
      case "ROOM_JOINED":
        this.myId = msg.playerId;
        this.roomPlayers = msg.players;
        this._emit("ROOM_JOINED", msg);
        break;
      case "PLAYER_JOINED":
        if (!this.roomPlayers.find((p) => p.id === msg.player.id)) {
          this.roomPlayers.push(msg.player);
        }
        this._emit("PLAYER_JOINED", msg.player);
        break;
      case "PLAYER_LEFT":
        this.roomPlayers = this.roomPlayers.filter((p) => p.id !== msg.playerId);
        this._emit("PLAYER_LEFT", msg);
        break;
      case "COUNTDOWN":
        this._emit("COUNTDOWN", msg);
        break;
      case "COUNTDOWN_CANCELLED":
        this._emit("COUNTDOWN_CANCELLED", {});
        break;
      case "GAME_START":
        this.isHost = msg.hostId === this.myId;
        this._emit("GAME_START", msg);
        break;
      case "RELAY":
        this._emit("RELAY", msg);
        break;
    }
  },
};
