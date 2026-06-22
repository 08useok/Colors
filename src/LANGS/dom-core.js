// src/LANGS/dom-core.js
export const DOM = {
  canvas: document.getElementById("game-canvas"),
  messageOverlay: document.getElementById("message-overlay"),
  accountCreation: document.getElementById("account-creation"),
  lobbyMain: document.getElementById("lobby-main"),

  idInput: document.getElementById("id-input"),
  nicknameInput: document.getElementById("nickname-input"),

  createAccountBtn: document.getElementById("create-account-btn"),
  dailyLoginBtn: document.getElementById("daily-login-btn"),

  startBattleBtn: document.getElementById("start-battle-btn"),
  startTrainingBtn: document.getElementById("start-training-btn"),
  exitTrainingBtn: document.getElementById("exit-training-btn"),

  lobbyNickname: document.getElementById("lobby-nickname"),
  lobbyLevel: document.getElementById("lobby-level"),
  lobbyTrophies: document.getElementById("lobby-trophies"),
  lobbyRecord: document.getElementById("lobby-record"),
  lobbyWinrate: document.getElementById("lobby-winrate"),

  resultOverlay: document.getElementById("result-overlay"),
  resultTitle: document.getElementById("result-title"),
  resultBody: document.getElementById("result-body"),
  resultStats: document.getElementById("result-stats"),
  resultStreak: document.getElementById("result-streak"),

  healthFill: document.getElementById("health-fill"),
  healthValue: document.getElementById("health-value"),
  healthText: document.getElementById("health-text"),

  reloadState: document.getElementById("reload-state"),
  attackState: document.getElementById("attack-state"),
  charName: document.getElementById("char-name"),

  reloadBar: document.getElementById("reload-bar"),

  survivorsLabel: document.getElementById("survivors"),
  survivorsPanel: document.getElementById("survivors-panel"),

  zonePanel: document.getElementById("zone-panel"),
  zoneState: document.getElementById("zone-state"),
  zoneTimer: document.getElementById("zone-timer"),

  warning: document.getElementById("warning"),

  ammoPips: document.getElementById("ammo-fan"),
  killFeed: document.getElementById("kill-feed"),
  hitMarker: document.getElementById("hit-marker"),
  damageTakenIndicator: document.getElementById("damage-taken-indicator"),

  mobileJoystick: document.getElementById("mobile-joystick"),
  mobileJoystickThumb: document.getElementById("mobile-joystick-thumb"),
  mobileAttackButton: document.getElementById("mobile-attack-button"),

  mapNameEl: document.getElementById("map-name"),

  dailyLogin: document.getElementById("daily-login"),
  dailyLoginNickname: document.getElementById("daily-login-nickname"),
  dailyLoginLevel: document.getElementById("daily-login-level"),
  dailyIdInput: document.getElementById("daily-id-input"),
  dailyLoginError: document.getElementById("daily-login-error"),
  accountRecoveryBtn: document.getElementById("account-recovery-btn"),
  accountRecoveryInfo: document.getElementById("account-recovery-info"),

  spreadState: document.getElementById("spread-state"),
  playAgainButton: document.getElementById("play-again-button"),
  restartButton: document.getElementById("restart-button"),
};