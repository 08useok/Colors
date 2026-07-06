import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js";
import { LANGS } from "./LANGS/langs.js";
import { mp } from "./multiplayer.js";
// CHARACTERS는 아래 인라인 정의 사용

// ── i18n ────────────────────────────────────────────────────────────────
// LANGS는 ./LANGS/langs.js에서 import
// (LANGS 데이터는 ./LANGS/langs.js로 이동됨)

let currentLang = localStorage.getItem("skullCreekLang") || "ko";

function t(key, ...args) {
  let str = LANGS[currentLang]?.[key] ?? LANGS.ko[key] ?? key;
  args.forEach((v, i) => { str = str.replace(`{${i}}`, v); });
  return str;
}

function applyLanguage() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.getElementById("lang-toggle").textContent = currentLang === "ko" ? "EN" : "KO";
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("skullCreekLang", lang);
  const account = loadAccount();
  if (account) {
    account.lang = lang;
    saveAccount(account);
  }
  applyLanguage();
}

const canvas = document.getElementById("game-canvas");
const messageOverlay = document.getElementById("message-overlay");
const accountCreation = document.getElementById("account-creation");
const lobbyMain = document.getElementById("lobby-main");
const idInput = document.getElementById("id-input");
const nicknameInput = document.getElementById("nickname-input");
const createAccountBtn = document.getElementById("create-account-btn");
const dailyLogin = document.getElementById("daily-login");
const dailyLoginNickname = document.getElementById("daily-login-nickname");
const dailyLoginLevel = document.getElementById("daily-login-level");
const dailyIdInput = document.getElementById("daily-id-input");
const dailyLoginError = document.getElementById("daily-login-error");
const dailyLoginBtn = document.getElementById("daily-login-btn");
const accountRecoveryBtn = document.getElementById("account-recovery-btn");
const accountRecoveryInfo = document.getElementById("account-recovery-info");
const startBattleBtn = document.getElementById("start-battle-btn");
const startTrainingBtn = document.getElementById("start-training-btn");
const exitTrainingBtn = document.getElementById("exit-training-btn");
const lobbyNickname = document.getElementById("lobby-nickname");
const lobbyLevel = document.getElementById("lobby-level");
const lobbyTrophies = document.getElementById("lobby-trophies");
const lobbyRecord = document.getElementById("lobby-record");
const lobbyWinrate = document.getElementById("lobby-winrate");
const resultOverlay = document.getElementById("result-overlay");
const resultTitle = document.getElementById("result-title");
const resultBody = document.getElementById("result-body");
const resultStats = document.getElementById("result-stats");
const resultStreak = document.getElementById("result-streak");
const playAgainButton = document.getElementById("play-again-button");
const restartButton = document.getElementById("restart-button");
const healthFill = document.getElementById("health-fill");
const healthValue = document.getElementById("health-value");
const healthText = document.getElementById("health-text");
const reloadState = document.getElementById("reload-state");
const attackState = document.getElementById("attack-state");
const charName = document.getElementById("char-name");
const spreadState = document.getElementById("spread-state");
const reloadBar = document.getElementById("reload-bar");
const survivorsLabel = document.getElementById("survivors");
const survivorsPanel = survivorsLabel.parentElement;
const zonePanel = document.getElementById("zone-panel");
const zoneState = document.getElementById("zone-state");
const zoneTimer = document.getElementById("zone-timer");
const warning = document.getElementById("warning");
const ammoPips = document.getElementById("ammo-fan");
const killFeed = document.getElementById("kill-feed");
const hitMarker = document.getElementById("hit-marker");
const damageTakenIndicator = document.getElementById("damage-taken-indicator");
const mobileJoystick = document.getElementById("mobile-joystick");
const mobileJoystickThumb = document.getElementById("mobile-joystick-thumb");
const mobileAttackButton = document.getElementById("mobile-attack-button");
const mapNameEl = document.getElementById("map-name");
const cwHud = document.getElementById("chop-wood-hud");
const cwTreeAFill = document.getElementById("cw-tree-a-fill");
const cwTreeBFill = document.getElementById("cw-tree-b-fill");
const cwTreeAText = document.getElementById("cw-tree-a-text");
const cwTreeBText = document.getElementById("cw-tree-b-text");
const cwTreeALabel = document.getElementById("cw-tree-a-label");
const cwTreeBLabel = document.getElementById("cw-tree-b-label");
const cwAxeIcon = document.getElementById("cw-axe-icon");
const cwAxeName = document.getElementById("cw-axe-name");
const cwChopBar = document.getElementById("cw-chop-bar");
const cwChopLabel = document.getElementById("cw-chop-label");
const cwChopFill = document.getElementById("cw-chop-progress-fill");
const cwRespawnEl = document.getElementById("cw-respawn");
const lobbyCoins = document.getElementById("lobby-coins");
const shopOverlay = document.getElementById("shop-overlay");
const shopCoins = document.getElementById("shop-coins");
const shopCloseBtn = document.getElementById("shop-close-btn");
const shopContent = document.getElementById("shop-levelup");
const shopSkinsContent = document.getElementById("shop-skins");
const openShopBtn = document.getElementById("open-shop-btn");
const rotationOverlay = document.getElementById("rotation-overlay");
const rotationCloseBtn = document.getElementById("rotation-close-btn");
const openRotationBtn = document.getElementById("open-rotation-btn");
const rotationChampionBanner = document.getElementById("rotation-champion-banner");
const rotationRemainingCount = document.getElementById("rotation-remaining-count");
const rotationNextElim = document.getElementById("rotation-next-elim");
const rotationList = document.getElementById("rotation-list");
const tdMapInfoBtn = document.getElementById("td-map-info-btn");
const tdMapOverlay = document.getElementById("td-map-overlay");
const tdCharSelectOverlay = document.getElementById("td-char-select-overlay");
const tdCharSelectGrid = document.getElementById("td-char-select-grid");
const tdCharSelectCloseBtn = document.getElementById("td-char-select-close-btn");
const matchmakingOverlay = document.getElementById("matchmaking-overlay");
const matchmakingStatus = document.getElementById("matchmaking-status");
const matchmakingCountdown = document.getElementById("matchmaking-countdown");
const matchmakingPlayersList = document.getElementById("matchmaking-players");
const matchmakingCancelBtn = document.getElementById("matchmaking-cancel-btn");

// ── Multiplayer state ────────────────────────────────────────────────────
let mpConfig = null;           // null = solo, { players, isHost, hostId }
const mpNetFighters = {};      // networkId → fighter
let mpLastSync = 0;
const MP_SYNC_INTERVAL = 0.05; // 20 Hz
const tdMapCloseBtn = document.getElementById("td-map-close-btn");
const tdMapCanvas = document.getElementById("td-map-canvas");

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xc98353);
scene.fog = new THREE.Fog(0xc98353, 55, 120);

const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 250);
camera.position.set(0, 8, 10);

const clock = new THREE.Clock();
const listener = new THREE.AudioListener();
camera.add(listener);

const worldRadius = 52;

const tdMapRenderer = new THREE.WebGLRenderer({ canvas: tdMapCanvas, antialias: true, preserveDrawingBuffer: true });
tdMapRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
tdMapRenderer.setSize(480, 480);
tdMapRenderer.outputColorSpace = THREE.SRGBColorSpace;
const tdMapCamera = new THREE.OrthographicCamera(-58, 58, 58, -58, 0.1, 200);
tdMapCamera.up.set(0, 0, -1);
tdMapCamera.position.set(0, 100, 0);
tdMapCamera.lookAt(0, 0, 0);
let tdMapOpen = false;

const attackDepth = 5;
const attackWidth = 2.3;
const attackHalfWidth = attackWidth * 0.5;
const baseMoveSpeed = 10.4;
const turnSpeed = 4.4;

const CURRENT_SEASON = "alpha4";
const SEASONS = {
  alpha1: "알파 시즌 1",
  alpha2: "알파 시즌 2",
  alpha3: "알파 시즌 3",
  alpha4: "알파 시즌 4",
};

const LEVEL_UP_COST = [0, 200, 500, 1000, 2000, 4000];
const MAX_CHAR_LEVEL = 6;
const LEVEL_BONUS_PER_LEVEL = 0.02;

const MASTERY_TIERS = [
  { name: "Bronze", emoji: "🥉", threshold: 10 },
  { name: "Silver", emoji: "🥈", threshold: 50 },
  { name: "Gold", emoji: "🥇", threshold: 100 },
  { name: "Diamond", emoji: "💎", threshold: 250 },
  { name: "Master", emoji: "👑", threshold: 500 },
];

function getMasteryTier(wins) {
  let tier = null;
  for (const t of MASTERY_TIERS) {
    if (wins >= t.threshold) tier = t;
  }
  return tier;
}

function getCharLevel(account, charKey) {
  if (!account.charLevels) return 1;
  return account.charLevels[charKey] ?? 1;
}

function getLevelMultiplier(level) {
  return 1 + (level - 1) * LEVEL_BONUS_PER_LEVEL;
}

const SKINS = {
  alpha_red: {
    name: "Alpha Red",
    character: "red",
    season: "alpha3",
    cost: 1000,
    desc: "skinAlphaRedDesc",
  },
};

function createCrown() {
  const crownMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    roughness: 0.3,
    metalness: 0.6,
  });
  const crown = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.62, 0.68, 0.25, 8),
    crownMat,
  );
  crown.add(base);
  const pointGeo = new THREE.ConeGeometry(0.14, 0.32, 4);
  const pointCount = 5;
  for (let i = 0; i < pointCount; i++) {
    const angle = (i / pointCount) * Math.PI * 2;
    const point = new THREE.Mesh(pointGeo, crownMat);
    point.position.set(Math.cos(angle) * 0.54, 0.25, Math.sin(angle) * 0.54);
    crown.add(point);
  }
  return crown;
}

function applySkin(group, skinId) {
  if (!skinId || !SKINS[skinId]) return;
  if (skinId === "alpha_red") {
    const crown = createCrown();
    crown.position.set(0, 2.7, 0);
    group.add(crown);
    group.userData.crown = crown;
  }
}

const EMOTES = {
  emote_thumbs: { emoji: "👍", name: "엄지척", price: 300 },
  emote_laugh:  { emoji: "😂", name: "웃음",   price: 300 },
  emote_cool:   { emoji: "😎", name: "선글라스", price: 300 },
  emote_fire:   { emoji: "🔥", name: "불꽃",   price: 300 },
  emote_skull:  { emoji: "💀", name: "해골",   price: 300 },
};

const PROFILE_BGS = {
  bg_default: { name: "기본",   css: "linear-gradient(160deg,#1a1a2e,#16213e,#0f3460)",   price: 0 },
  bg_flame:   { name: "불꽃",   css: "linear-gradient(135deg,#ff6b00,#cc0000)",          price: 200 },
  bg_ocean:   { name: "바다",   css: "linear-gradient(135deg,#0066ff,#00ccbb)",          price: 200 },
  bg_night:   { name: "밤하늘", css: "linear-gradient(135deg,#1a0066,#6600cc)",          price: 200 },
  bg_forest:  { name: "숲",     css: "linear-gradient(135deg,#1a5c00,#5c6600)",          price: 200 },
  bg_gold:    { name: "황금",   css: "linear-gradient(135deg,#cc8800,#ffee00)",          price: 400 },
};

const BADGES = {
  badge_none:  { emoji: "",   name: "없음",  price: 0 },
  badge_star:  { emoji: "⭐", name: "스타",  price: 150 },
  badge_crown: { emoji: "👑", name: "왕관",  price: 150 },
  badge_sword: { emoji: "⚔️", name: "검",    price: 150 },
  badge_skull: { emoji: "💀", name: "해골",  price: 150 },
  badge_fire:  { emoji: "🔥", name: "불꽃",  price: 150 },
  badge_bolt:  { emoji: "⚡", name: "번개",  price: 150 },
  badge_gem:   { emoji: "💎", name: "보석",  price: 300 },
};

const COIN_REWARDS = {
  win: 50,
  lose: 20,
  first: 50,
  streak3: 20,
  streak5: 50,
  streak10: 100,
};

// ── Rotation Mode ──────────────────────────────────────────────────────
const ROTATION_CHAR_ORDER = ["red", "green", "blue", "orange", "yellow", "cyan", "purple", "pink"];
const ROTATION_ROUND_DAYS = 3;

const ROTATION_NEW_ABILITIES = {
  red: { name: "분노의 질주", desc: "체력 30% 이하 시 이동속도 증가" },
  green: { name: "더블 바운스", desc: "부메랑 추가 튕김" },
  blue: { name: "관통탄", desc: "탄환이 적을 관통" },
  orange: { name: "광역 폭발", desc: "폭발 범위 증가" },
  yellow: { name: "과부하 감전", desc: "감전 지속 2배 + 이동 감속 65%" },
  cyan: { name: "정밀 사격", desc: "집탄률 증가" },
  purple: { name: "쌍독침", desc: "독침 2발 부채꼴(11도) 발사" },
  pink: { name: "광역 치유", desc: "회복 범위 증가" },
};

const ROTATION_PARTICIPATION_REWARD = { coins: 100, trophies: 20 };
const ROTATION_CHAMPION_REWARD = { coins: 1000, trophies: 200 };

function initRotationState(account) {
  if (!account.rotation) {
    account.rotation = {
      startDate: getTodayString(),
      remaining: [...ROTATION_CHAR_ORDER],
      eliminated: [],
      newAbilityChars: [],
      champion: null,
      stats: Object.fromEntries(ROTATION_CHAR_ORDER.map((c) => [c, { wins: 0, games: 0, mvp: 0, bossDmg: 0 }])),
      lastRoundProcessedAt: 0,
    };
    return true;
  }
  return false;
}

function daysSince(dateStr) {
  const start = new Date(dateStr + "T00:00:00");
  const now = new Date(getTodayString() + "T00:00:00");
  return Math.floor((now - start) / 86400000);
}

function getRotationRoundIndex(account) {
  if (!account.rotation) return 0;
  return Math.floor(daysSince(account.rotation.startDate) / ROTATION_ROUND_DAYS);
}

function rankRotationChars(stats, chars) {
  return [...chars].sort((a, b) => {
    const sa = stats[a];
    const sb = stats[b];
    if (sa.wins !== sb.wins) return sa.wins - sb.wins;
    const wra = sa.games > 0 ? sa.wins / sa.games : 0;
    const wrb = sb.games > 0 ? sb.wins / sb.games : 0;
    if (wra !== wrb) return wra - wrb;
    if (sa.mvp !== sb.mvp) return sa.mvp - sb.mvp;
    return sa.bossDmg - sb.bossDmg;
  });
}

function processRotationRounds(account) {
  if (!account.rotation) return;
  const targetRound = getRotationRoundIndex(account);
  while (account.rotation.lastRoundProcessedAt < targetRound && account.rotation.remaining.length > 1) {
    const ranked = rankRotationChars(account.rotation.stats, account.rotation.remaining);
    const lastPlace = ranked[0];
    account.rotation.remaining = account.rotation.remaining.filter((c) => c !== lastPlace);
    account.rotation.eliminated.push(lastPlace);
    if (!account.rotation.newAbilityChars.includes(lastPlace)) {
      account.rotation.newAbilityChars.push(lastPlace);
    }
    account.rotation.lastRoundProcessedAt += 1;
    if (account.rotation.remaining.length === 1) {
      account.rotation.champion = account.rotation.remaining[0];
      if (!account.rotation.newAbilityChars.includes(account.rotation.champion)) {
        account.rotation.newAbilityChars.push(account.rotation.champion);
      }
      account.coins = (account.coins || 0) + ROTATION_CHAMPION_REWARD.coins;
      account.trophies = (account.trophies || 0) + ROTATION_CHAMPION_REWARD.trophies;
    }
  }
}

function getRotationNextEliminationDate(account) {
  if (!account.rotation) return null;
  const round = account.rotation.lastRoundProcessedAt + 1;
  const start = new Date(account.rotation.startDate + "T00:00:00");
  start.setDate(start.getDate() + round * ROTATION_ROUND_DAYS);
  return start;
}

const BOT_NAMES_KO = ["하늘", "별빛", "소금", "달콤", "번개", "구름", "바람", "눈꽃", "폭풍", "태양",
  "은하", "수박", "딸기", "감자", "당근", "호랑이", "토끼", "펭귄", "고양이", "강아지",
  "치킨", "피자", "라면", "떡볶이", "김밥", "초코", "우유", "사이다", "콜라", "커피"];
const BOT_NAMES_EN = ["Shadow", "Storm", "Blaze", "Frost", "Nova", "Echo", "Pixel", "Spark", "Viper", "Comet",
  "Ghost", "Titan", "Flash", "Drift", "Blade", "Rocket", "Wolf", "Hawk", "Bear", "Fox",
  "Ace", "Zero", "Neo", "Max", "Rex", "Dash", "Bolt", "Fury", "Edge", "Pulse"];
const BOT_SUFFIXES = ["", "123", "YT", "TV", "Pro", "GG", "xD", "님", "킹", "짱", "_", "99", "77", "01"];

function randomBotName() {
  const style = Math.random();
  if (style < 0.4) {
    return BOT_NAMES_KO[Math.floor(Math.random() * BOT_NAMES_KO.length)] + BOT_SUFFIXES[Math.floor(Math.random() * BOT_SUFFIXES.length)];
  } else if (style < 0.8) {
    return BOT_NAMES_EN[Math.floor(Math.random() * BOT_NAMES_EN.length)] + BOT_SUFFIXES[Math.floor(Math.random() * BOT_SUFFIXES.length)];
  } else {
    return BOT_NAMES_KO[Math.floor(Math.random() * BOT_NAMES_KO.length)] + BOT_NAMES_EN[Math.floor(Math.random() * BOT_NAMES_EN.length)];
  }
}

let leaderboardBots = JSON.parse(localStorage.getItem("skullCreekLeaderboardBots") || "null");
if (!leaderboardBots) {
  leaderboardBots = [];
  for (let i = 0; i < 19; i++) {
    leaderboardBots.push({ name: randomBotName(), trophies: Math.floor(Math.random() * 600) });
  }
  localStorage.setItem("skullCreekLeaderboardBots", JSON.stringify(leaderboardBots));
}

const maxAmmo = 3;
const reloadDuration = 0.5;
const attackCooldown = 0.62;
const attackEvents = [
  { delay: 0.12, damage: 2200 },
  { delay: 0.36, damage: 2200 },
];

const CHARACTERS = {
  red: {
    color: 0xff0000,
    maxHealth: 9800,
    attackType: "punch",
    reloadDuration: 0.5,
    attackCooldown: 0.55,
    moveSpeedMultiplier: 1.4,
    walk: { cycleSpeed: 9, armAmp: 0.34, legAmp: 0.40, armRestZ: Math.PI * 0.1 },
  },
  green: {
    color: 0x00ff00,
    maxHealth: 8400,
    attackType: "boomerang",
    reloadDuration: 0.5,
    attackCooldown: 0.45,
    moveSpeedMultiplier: 1.2,
    boomerangCount: 4,
    boomerangDamage: 950,
    boomerangRange: 6,
    boomerangSpeed: 20,
    boomerangFarThreshold: 3.5,
    boomerangFarMultiplier: 0.625,
    boomerangAngles: [-30, -10, 10, 30].map((d) => d * (Math.PI / 180)),
    walk: { cycleSpeed: 8, armAmp: 0.30, legAmp: 0.38, armRestZ: Math.PI * 0.06 },
  },
  blue: {
    color: 0x0000ff,
    maxHealth: 4800,
    attackType: "bullet",
    reloadDuration: 0.3,
    attackCooldown: 0.3,
    bulletDamage: 1000,
    bulletRange: 16,
    bulletSpeed: 32,
    moveSpeedMultiplier: 1.0,
    walk: { cycleSpeed: 7, armAmp: 0.20, legAmp: 0.34, armRestZ: Math.PI * 0.03 },
  },
  orange: {
    color: 0xffa500,
    maxHealth: 5800,
    attackType: "bomb",
    reloadDuration: 0.5,
    attackCooldown: 0.35,
    bombDamage: 750,
    bombSplashDamage: 300,
    bombRange: 9,
    bombSpeed: 22,
    bombSplashCount: 5,
    bombSplashSpeed: 10,
    bombSplashRange: 4.4,
    bombSplashHitRadius: 0.60,
    moveSpeedMultiplier: 1.0,
    walk: { cycleSpeed: 8, armAmp: 0.25, legAmp: 0.36, armRestZ: Math.PI * 0.05 },
  },
  yellow: {
    color: 0xffff00,
    maxHealth: 5800,
    attackType: "electric",
    reloadDuration: 0.5,
    attackCooldown: 0.35,
    electricDamage: 2400,
    electricRange: 12,
    electricSpeed: 16,
    shockSlowPercent: 0.4,
    shockDuration: 1.5,
    moveSpeedMultiplier: 1.0,
    walk: { cycleSpeed: 8, armAmp: 0.25, legAmp: 0.36, armRestZ: Math.PI * 0.05 },
  },
  cyan: {
    color: 0x0ff0fe,
    maxHealth: 6200,
    attackType: "spreadLine",
    reloadDuration: 0.5,
    attackCooldown: 0.35,
    spreadLineDamage: 450,
    spreadLineRange: 8.33,
    spreadLineSpeed: 18,
    spreadLineCount: 6,
    spreadLineSpacing: 0.75,
    moveSpeedMultiplier: 1.0,
    walk: { cycleSpeed: 8, armAmp: 0.25, legAmp: 0.36, armRestZ: Math.PI * 0.05 },
  },
  purple: {
    color: 0x800080,
    maxHealth: 6000,
    attackType: "poison",
    reloadDuration: 0.5,
    attackCooldown: 0.45,
    needleRange: 13,
    needleSpeed: 18,
    needleDamage: 700,
    poisonDPS: 760,
    poisonDuration: 4,
    vialRange: 13,
    vialSpeed: 18,
    vialDamage: 3040,
    vialSplashRadius: 5.0,
    moveSpeedMultiplier: 1.0,
    walk: { cycleSpeed: 7, armAmp: 0.22, legAmp: 0.34, armRestZ: Math.PI * 0.04 },
  },
  pink: {
    color: 0xFF69B4,
    maxHealth: 11500,
    attackType: "heal_circle",
    reloadDuration: 0.4,
    attackCooldown: 0.2,
    healCircleRange: 4.5,
    healCircleDamage: 2400,
    healCircleHeal: 1800,
    moveSpeedMultiplier: 1.4,
    walk: { cycleSpeed: 9, armAmp: 0.34, legAmp: 0.40, armRestZ: Math.PI * 0.1 },
  },
};

// ── 계정 관리 ──────────────────────────────────────────────────────────────
const ACCOUNT_KEY = "skullCreekAccount";

function loadAccount() {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    if (!raw) return null;
    const account = JSON.parse(raw);
    if (!account.charStats) {
      account.charStats = {
        red:   { wins: 0, games: 0 },
        green: { wins: 0, games: 0 },
        blue:  { wins: 0, games: 0 },
        orange: { wins: 0, games: 0 },
      };
    }
    if (!account.charStats.orange) account.charStats.orange = { wins: 0, games: 0 };
    if (!account.charStats.yellow) account.charStats.yellow = { wins: 0, games: 0 };
    if (!account.charStats.cyan) account.charStats.cyan = { wins: 0, games: 0 };
    if (!account.charStats.purple) account.charStats.purple = { wins: 0, games: 0 };
    if (!account.charStats.pink) account.charStats.pink = { wins: 0, games: 0 };
    if (account.winStreak === undefined) account.winStreak = 0;
    if (account.bestStreak === undefined) account.bestStreak = 0;
    if (!account.lang) account.lang = "ko";
    if (!account.seasonStats) {
      account.seasonStats = {
        alpha1: { wins: account.wins, losses: account.losses },
      };
    }
    if (!account.seasonStats[CURRENT_SEASON]) {
      account.seasonStats[CURRENT_SEASON] = { wins: 0, losses: 0 };
    }
    if (!account.seasonCharStats) {
      account.seasonCharStats = {
        alpha1: JSON.parse(JSON.stringify(account.charStats)),
      };
    }
    if (!account.seasonCharStats[CURRENT_SEASON]) {
      account.seasonCharStats[CURRENT_SEASON] = {
        red: { wins: 0, games: 0 }, green: { wins: 0, games: 0 },
        blue: { wins: 0, games: 0 }, orange: { wins: 0, games: 0 },
        yellow: { wins: 0, games: 0 }, cyan: { wins: 0, games: 0 }, purple: { wins: 0, games: 0 }, pink: { wins: 0, games: 0 },
      };
    }
    for (const s of Object.values(account.seasonCharStats)) {
      if (!s.yellow) s.yellow = { wins: 0, games: 0 };
      if (!s.cyan) s.cyan = { wins: 0, games: 0 };
      if (!s.purple) s.purple = { wins: 0, games: 0 };
      if (!s.pink) s.pink = { wins: 0, games: 0 };
    }
    let migrated = false;
    if (account.coins === undefined) { account.coins = 0; migrated = true; }
    if (!account.charLevels) {
      account.charLevels = { red: 1, green: 1, blue: 1, orange: 1, yellow: 1, cyan: 1 };
      migrated = true;
    }
    if (!account.charLevels.yellow) { account.charLevels.yellow = 1; migrated = true; }
    if (!account.charLevels.cyan) { account.charLevels.cyan = 1; migrated = true; }
    if (!account.ownedSkins) { account.ownedSkins = []; migrated = true; }
    if (!account.selectedSkins) { account.selectedSkins = {}; migrated = true; }
    if (!account.cosmetics) {
      account.cosmetics = {
        ownedEmotes: [], equippedEmotes: [null, null, null],
        ownedBgs: ["bg_default"], equippedBg: "bg_default",
        ownedBadges: ["badge_none"], equippedBadge: "badge_none",
      };
      migrated = true;
    }
    if (!account.cosmetics.equippedEmotes) {
      const old = account.cosmetics.equippedEmote ?? null;
      account.cosmetics.equippedEmotes = [old, null, null];
      delete account.cosmetics.equippedEmote;
      migrated = true;
    }
    if (initRotationState(account)) migrated = true;
    if (account.rotation) {
      const beforeRound = account.rotation.lastRoundProcessedAt;
      processRotationRounds(account);
      if (account.rotation.lastRoundProcessedAt !== beforeRound) migrated = true;
    }
    if (migrated) saveAccount(account);
    return account;
  } catch {
    return null;
  }
}

function saveAccount(account) {
  try {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  } catch {
    // storage unavailable — ignore
  }
}

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

function isLoginDoneToday(account) {
  return account.lastLoginDate === getTodayString();
}

function getLoginAttemptsToday(account) {
  if (account.lastLoginDate !== getTodayString()) return 0;
  return account.loginAttempts ?? 0;
}

function isLockedToday(account) {
  return getLoginAttemptsToday(account) >= 5;
}

function createAccount(id, nickname) {
  const account = {
    id,
    nickname,
    trophies: 0,
    wins: 0,
    losses: 0,
    coins: 0,
    selectedCharacter: "red",
    lastLoginDate: getTodayString(),
    loginAttempts: 0,
    charStats: {
      red:    { wins: 0, games: 0 },
      green:  { wins: 0, games: 0 },
      blue:   { wins: 0, games: 0 },
      orange: { wins: 0, games: 0 },
      yellow: { wins: 0, games: 0 },
      cyan:   { wins: 0, games: 0 },
      purple: { wins: 0, games: 0 },
      pink:   { wins: 0, games: 0 },
    },
    charLevels: {
      red: 1, green: 1, blue: 1, orange: 1, yellow: 1, cyan: 1,
    },
    ownedSkins: [],
    selectedSkins: {},
    winStreak: 0,
    bestStreak: 0,
    lang: currentLang,
    seasonStats: { [CURRENT_SEASON]: { wins: 0, losses: 0 } },
    seasonCharStats: {
      [CURRENT_SEASON]: {
        red: { wins: 0, games: 0 }, green: { wins: 0, games: 0 },
        blue: { wins: 0, games: 0 }, orange: { wins: 0, games: 0 },
        yellow: { wins: 0, games: 0 }, cyan: { wins: 0, games: 0 }, purple: { wins: 0, games: 0 }, pink: { wins: 0, games: 0 },
      },
    },
  };
  initRotationState(account);
  saveAccount(account);
  return account;
}

function calcLevel(trophies) {
  return Math.floor(trophies / 300) + 1;
}

function applyProfileCosmetics(account) {
  const c = account.cosmetics;
  if (!c) return;
  const lobbyMain = document.getElementById("lobby-main");
  if (lobbyMain) lobbyMain.style.background = PROFILE_BGS[c.equippedBg]?.css ?? "#2a2a2a";
  const badge = BADGES[c.equippedBadge];
  const badgeEmoji = badge?.emoji ? badge.emoji + " " : "";
  lobbyNickname.textContent = badgeEmoji + account.nickname;
}

function updateLobbyUI(account) {
  lobbyNickname.textContent = account.nickname;
  lobbyLevel.textContent = `Lv.${calcLevel(account.trophies)}`;
  lobbyTrophies.textContent = account.trophies;
  if (lobbyCoins) lobbyCoins.textContent = account.coins ?? 0;
  lobbyRecord.textContent = t("record", account.wins, account.losses);
  if (lobbyWinrate) {
    const totalGames = account.wins + account.losses;
    const rate = totalGames === 0 ? 0 : Math.round((account.wins / totalGames) * 100);
    lobbyWinrate.textContent = t("winrate", rate, account.wins, totalGames);
  }

  // 최고 기록
  const bestRecordEl = document.getElementById("lobby-best-record");
  if (bestRecordEl) {
    bestRecordEl.textContent = t("bestStreakLabel", account.bestStreak);
  }

  // 캐릭터별 승률
  for (const char of ["red", "green", "blue", "orange", "yellow", "cyan", "purple", "pink"]) {
    const el = document.getElementById(`winrate-${char}`);
    if (!el) continue;
    const s = account.charStats[char];
    if (s.games === 0) {
      el.textContent = t("firstGame");
    } else {
      const rate = Math.round((s.wins / s.games) * 100);
      el.textContent = t("winrate", rate, s.wins, s.games);
    }
  }

  // 연승 표시
  const streakEl = document.getElementById("streak-display");
  if (streakEl) {
    if (account.winStreak >= 2) {
      streakEl.textContent = t("streak", account.winStreak);
      streakEl.classList.remove("hidden");
    } else {
      streakEl.classList.add("hidden");
    }
  }

  // 캐릭터 선택 상태 반영
  document.querySelectorAll(".char-btn").forEach((btn) => {
    btn.classList.toggle("selected", btn.dataset.char === account.selectedCharacter);
  });
  document.querySelectorAll(".color-dot").forEach((dot) => {
    dot.classList.toggle("selected", dot.dataset.char === account.selectedCharacter);
  });
  updateColorInfo(account.selectedCharacter, account);
  state.selectedCharacter = account.selectedCharacter;
  setPreviewCharacter(account.selectedCharacter);
  applyProfileCosmetics(account);
}

const CHAR_STAT_BARS = {
  red:    { hp: 10, atk: 9, range: 3, speed: 10 },
  green:  { hp: 8,  atk: 7, range: 4, speed: 8 },
  blue:   { hp: 4,  atk: 5, range: 10, speed: 6 },
  orange: { hp: 5,  atk: 6, range: 5, speed: 6 },
  yellow: { hp: 5,  atk: 7, range: 5, speed: 6 },
  cyan:   { hp: 6,  atk: 6, range: 5, speed: 6 },
};

function statBar(label, value) {
  const pct = value * 10;
  return `<div class="ci-stat-row">`
    + `<span class="ci-stat-label">${label}</span>`
    + `<div class="ci-stat-bar"><div class="ci-stat-fill" style="width:${pct}%"></div></div>`
    + `</div>`;
}

function updateColorInfo(charKey, account) {
  const el = document.getElementById("color-info");
  if (!el) return;
  const charDef = CHARACTERS[charKey];
  if (!charDef) { el.innerHTML = ""; return; }
  const name = charKey.charAt(0).toUpperCase() + charKey.slice(1);
  const hp = charDef.maxHealth.toLocaleString();
  const desc = t(charKey + "Desc");
  const s = account?.charStats?.[charKey];
  let winrateText = t("firstGame");
  if (s && s.games > 0) {
    const rate = Math.round((s.wins / s.games) * 100);
    winrateText = t("winrate", rate, s.wins, s.games);
  }
  const bars = CHAR_STAT_BARS[charKey] || { hp: 5, atk: 5, range: 5, speed: 5 };
  const charLevel = account ? getCharLevel(account, charKey) : 1;
  const charWins = s ? s.wins : 0;
  const mastery = getMasteryTier(charWins);
  const masteryText = mastery ? `${mastery.emoji} ${mastery.name}` : "";
  const levelText = `Lv.${charLevel}`;
  const mult = getLevelMultiplier(charLevel);
  const effectiveHp = Math.round(charDef.maxHealth * mult).toLocaleString();

  let skinHtml = "";
  if (account) {
    const ownedForChar = Object.entries(SKINS).filter(([, sk]) => sk.character === charKey && account.ownedSkins.includes(Object.keys(SKINS).find(id => SKINS[id] === sk)));
    for (const [skinId, skin] of Object.entries(SKINS)) {
      if (skin.character !== charKey) continue;
      if (!account.ownedSkins.includes(skinId)) continue;
      const equipped = account.selectedSkins[charKey] === skinId;
      skinHtml += `<div class="ci-skin-row">`
        + `<span class="ci-skin-name">${skin.name}</span>`
        + `<button class="ci-skin-btn${equipped ? " ci-skin-active" : ""}" data-skin="${skinId}" data-char="${charKey}" type="button">`
        + (equipped ? "장착 중" : "장착")
        + `</button></div>`;
    }
  }

  el.innerHTML = `<div class="ci-name">${name}</div>`
    + `<div class="ci-hp">HP ${effectiveHp}</div>`
    + `<div class="ci-desc">${desc}</div>`
    + `<div class="ci-stats">`
    + statBar(t("statHp"), bars.hp)
    + statBar(t("statAtk"), bars.atk)
    + statBar(t("statRange"), bars.range)
    + statBar(t("statSpeed"), bars.speed)
    + `</div>`
    + `<div class="ci-level-mastery">`
    + `<span class="ci-level">${levelText}</span>`
    + (masteryText ? `<span class="ci-mastery">${masteryText}</span>` : "")
    + `</div>`
    + (skinHtml ? `<div class="ci-skins">${skinHtml}</div>` : "")
    + `<div class="ci-winrate">${winrateText}</div>`;

  el.querySelectorAll(".ci-skin-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const acc = loadAccount();
      if (!acc) return;
      const sid = btn.dataset.skin;
      const ch = btn.dataset.char;
      if (acc.selectedSkins[ch] === sid) {
        delete acc.selectedSkins[ch];
      } else {
        acc.selectedSkins[ch] = sid;
      }
      saveAccount(acc);
      updateColorInfo(ch, acc);
      previewChar = null;
      setPreviewCharacter(ch);
    });
  });
}

function showDailyLogin(account) {
  dailyLoginNickname.textContent = account.nickname;
  dailyLoginLevel.textContent = `Lv.${calcLevel(account.trophies)}`;
  dailyIdInput.value = "";
  dailyLoginError.style.display = "none";
  dailyLoginError.textContent = "";
  accountRecoveryInfo.style.display = "none";

  // 날짜가 바뀌었으면 시도 횟수 리셋
  if (account.lastLoginDate !== getTodayString()) {
    account.loginAttempts = 0;
    saveAccount(account);
  }

  const locked = isLockedToday(account);
  dailyIdInput.disabled = locked;
  dailyLoginBtn.disabled = locked;
  accountRecoveryBtn.style.display = locked ? "block" : "none";

  if (locked) {
    dailyLoginError.textContent = t("loginExceeded");
    dailyLoginError.style.display = "block";
  }

  setTimeout(() => { if (!locked) dailyIdInput.focus(); }, 50);
}

function showLobby() {
  messageOverlay.style.display = "flex";
  resultOverlay.style.display = "none";
  mapNameEl.classList.add("hidden");
  const sidePanel = document.getElementById("lobby-side-panel");
  const colorButtons = document.getElementById("color-buttons");
  const account = loadAccount();

  if (!account || !account.id) {
    accountCreation.classList.remove("hidden");
    lobbyMain.classList.add("hidden");
    dailyLogin.classList.add("hidden");
    sidePanel.classList.add("hidden");
    colorButtons.classList.add("hidden");
    idInput.value = "";
    nicknameInput.value = "";
    createAccountBtn.disabled = true;
    setTimeout(() => idInput.focus(), 50);
  } else if (isLoginDoneToday(account)) {
    accountCreation.classList.add("hidden");
    lobbyMain.classList.remove("hidden");
    dailyLogin.classList.add("hidden");
    sidePanel.classList.remove("hidden");
    colorButtons.classList.remove("hidden");
    if (account.lang && account.lang !== currentLang) setLanguage(account.lang);
    updateLobbyUI(account);
  } else {
    accountCreation.classList.add("hidden");
    lobbyMain.classList.add("hidden");
    dailyLogin.classList.remove("hidden");
    sidePanel.classList.add("hidden");
    colorButtons.classList.add("hidden");
    showDailyLogin(account);
  }
}

function calcTrophyChange(rank) {
  return 12 - rank * 2; // 1위 +10, 6위 0, 10위 -8
}

function streakBonus(streak) {
  if (streak <= 1) return 0;
  return Math.min(streak - 1, 4);
}

function recordGameResult(rank) {
  const account = loadAccount();
  if (!account) return { streakBefore: 0, streakAfter: 0, bonus: 0, milestone: false, coinsEarned: 0 };

  const char = account.selectedCharacter;
  const prevStreak = account.winStreak;
  let bonus = 0;
  let milestone = false;
  let coinsEarned = 0;

  account.charStats[char].games += 1;
  const ss = account.seasonStats[CURRENT_SEASON];
  const scs = account.seasonCharStats[CURRENT_SEASON][char];
  scs.games += 1;
  if (rank <= 4) {
    account.wins += 1;
    account.charStats[char].wins += 1;
    ss.wins += 1;
    scs.wins += 1;
    account.winStreak += 1;
    if (account.winStreak > account.bestStreak) account.bestStreak = account.winStreak;
    bonus = streakBonus(account.winStreak);
    if (account.charStats[char].wins > 0 && account.charStats[char].wins % 100 === 0) {
      account.trophies += 50;
      milestone = true;
    }
    coinsEarned += COIN_REWARDS.win;
    if (rank === 1) coinsEarned += COIN_REWARDS.first;
    if (account.winStreak >= 10) coinsEarned += COIN_REWARDS.streak10;
    else if (account.winStreak >= 5) coinsEarned += COIN_REWARDS.streak5;
    else if (account.winStreak >= 3) coinsEarned += COIN_REWARDS.streak3;
  } else {
    account.losses += 1;
    ss.losses += 1;
    account.winStreak = 0;
    coinsEarned += COIN_REWARDS.lose;
  }

  account.coins = (account.coins || 0) + coinsEarned;
  const delta = calcTrophyChange(rank);
  account.trophies = Math.max(0, account.trophies + delta + bonus);
  saveAccount(account);

  for (const bot of leaderboardBots) {
    const botRank = Math.floor(Math.random() * 10) + 1;
    const botDelta = 12 - botRank * 2;
    bot.trophies = Math.max(0, bot.trophies + botDelta);
  }
  localStorage.setItem("skullCreekLeaderboardBots", JSON.stringify(leaderboardBots));

  return { streakBefore: prevStreak, streakAfter: account.winStreak, bonus, milestone, coinsEarned };
}

// ──────────────────────────────────────────────────────────────────────────
const aimRaycaster = new THREE.Raycaster();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const mouseAimWorld = new THREE.Vector3();

// ── Chop Wood constants ──────────────────────────────────────────────────
const AXE_GRADES = [
  { key: "axeWooden",    damage: 1,  color: 0x8B6914 },
  { key: "axeStone",     damage: 2,  color: 0x999999 },
  { key: "axeIron",      damage: 3,  color: 0xC0C0C0 },
  { key: "axeGold",      damage: 5,  color: 0xFFD700 },
  { key: "axeDiamond",   damage: 6,  color: 0x00CED1 },
  { key: "axeEmerald",   damage: 7,  color: 0x50C878 },
  { key: "axeSapphire",  damage: 8,  color: 0x0F52BA },
  { key: "axeRuby",      damage: 9,  color: 0xE0115F },
  { key: "axeAmethyst",  damage: 10, color: 0x9966CC },
  { key: "axeRainbow",   damage: 12, color: 0xffffff },
];
const AXE_ABSORB = [0, 0, 0, 2, 2, 3, 3, 4, 5, 8];
const CHOP_WOOD_SPAWNS_A = [
  new THREE.Vector3(-8, 0, -28),
  new THREE.Vector3( 0, 0, -28),
  new THREE.Vector3( 8, 0, -28),
];
const CHOP_WOOD_SPAWNS_B = [
  new THREE.Vector3(-8, 0, 28),
  new THREE.Vector3( 0, 0, 28),
  new THREE.Vector3( 8, 0, 28),
];

const zonePhases = [
  { start: 0,   end: 15,  radius: 52, damage: 0,    labelKey: "zoneWaiting" },
  { start: 15,  end: 30,  radius: 42, damage: 150,  labelKey: "zonePhase1" },
  { start: 30,  end: 45,  radius: 32, damage: 250,  labelKey: "zonePhase2" },
  { start: 45,  end: 60,  radius: 23, damage: 400,  labelKey: "zonePhase3" },
  { start: 60,  end: 75,  radius: 15, damage: 650,  labelKey: "zonePhase4" },
  { start: 75,  end: 999, radius: 8,  damage: 1000, labelKey: "zoneFinal" },
];

const state = {
  gameTime: 0,
  running: false,
  pointerLocked: false,
  gameOver: false,
  winner: "",
  players: [],
  projectiles: [],
  deathOrder: [],
  solids: [],
  bushes: [],
  lakeRects: [],
  battleSolids: [],
  battleLakeRects: [],
  battleBushes: [],
  trainingSolids: [],
  safeCenter: new THREE.Vector2(0, 0),
  scheduledHits: [],
  effects: [],
  keyState: {},
  mode: "battle",
  mouse: {
    screenX: window.innerWidth * 0.5,
    screenY: window.innerHeight * 0.5,
  },
  mouseHeld: false,
  trainingMode: false,
  mobileMove: {
    x: 0,
    y: 0,
    active: false,
    pointerId: null,
  },
  feedback: {
    hitFlashUntil: 0,
    warningPulseUntil: 0,
  },
  playerOutsideZone: false,
  audioEnabled: false,
  audioContext: null,
  selectedCharacter: "red",
  currentMapId: 0,
  freezeUntil: 0,
  chopWoodMode: false,
  teams: null,
  playerTeam: null,
};

const battleMapGroup = new THREE.Group();
scene.add(battleMapGroup);
const trainingMapGroup = new THREE.Group();
scene.add(trainingMapGroup);
trainingMapGroup.visible = false;

const tempVec3 = new THREE.Vector3();
const tempVec32 = new THREE.Vector3();
const tempVec2 = new THREE.Vector2();

function moveAngleToward(current, target, maxStep) {
  const delta = THREE.MathUtils.euclideanModulo(target - current + Math.PI, Math.PI * 2) - Math.PI;
  if (Math.abs(delta) <= maxStep) {
    return target;
  }
  return current + Math.sign(delta) * maxStep;
}

function createAttackAimIndicator() {
  const group = new THREE.Group();
  const makeMat = () => new THREE.MeshBasicMaterial({
    color: 0xffffff, transparent: true, opacity: 0.17, side: THREE.DoubleSide, depthWrite: false,
  });

  const subA = new THREE.Group();
  subA.rotation.y = -20 * (Math.PI / 180);
  const rectA = new THREE.Mesh(new THREE.PlaneGeometry(attackWidth, attackDepth), makeMat());
  rectA.rotation.x = -Math.PI / 2;
  rectA.position.set(0.5, 0.08, attackDepth * 0.5);
  subA.add(rectA);
  group.add(subA);

  const subB = new THREE.Group();
  subB.rotation.y = 20 * (Math.PI / 180);
  const rectB = new THREE.Mesh(new THREE.PlaneGeometry(attackWidth, attackDepth), makeMat());
  rectB.rotation.x = -Math.PI / 2;
  rectB.position.set(-1.0, 0.08, attackDepth * 0.5);
  subB.add(rectB);
  group.add(subB);

  group.renderOrder = 4;
  group.visible = false;
  group.userData = { rects: [rectA, rectB] };
  scene.add(group);
  return group;
}

const audio = {
  play(type) {
    if (!state.audioEnabled || !state.audioContext) {
      return;
    }

    const ctx = state.audioContext;
    const now = ctx.currentTime;
    const pulse = ({ wave = "triangle", from = 220, to = 140, duration = 0.12, peak = 0.08, attack = 0.005, delay = 0 }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startAt = now + delay;
      osc.type = wave;
      osc.frequency.setValueAtTime(from, startAt);
      if (to !== from) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), startAt + duration);
      }
      gain.gain.setValueAtTime(0.001, startAt);
      gain.gain.exponentialRampToValueAtTime(peak, startAt + attack);
      gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startAt);
      osc.stop(startAt + duration + 0.02);
    };

    if (type === "attack") {
      pulse({ wave: "square", from: 180, to: 92, duration: 0.08, peak: 0.06 });
      pulse({ wave: "triangle", from: 260, to: 180, duration: 0.05, peak: 0.035, delay: 0.01 });
    } else if (type === "hit") {
      pulse({ wave: "square", from: 340, to: 140, duration: 0.07, peak: 0.085 });
      pulse({ wave: "sawtooth", from: 520, to: 260, duration: 0.045, peak: 0.03, delay: 0.004 });
    } else if (type === "reload") {
      pulse({ wave: "triangle", from: 210, to: 290, duration: 0.06, peak: 0.045 });
      pulse({ wave: "triangle", from: 260, to: 360, duration: 0.08, peak: 0.038, delay: 0.055 });
    } else if (type === "kill") {
      pulse({ wave: "square", from: 260, to: 180, duration: 0.07, peak: 0.06 });
      pulse({ wave: "triangle", from: 380, to: 520, duration: 0.12, peak: 0.055, delay: 0.03 });
    } else if (type === "warning") {
      pulse({ wave: "square", from: 170, to: 210, duration: 0.13, peak: 0.05 });
      pulse({ wave: "triangle", from: 140, to: 170, duration: 0.18, peak: 0.02, delay: 0.02 });
    } else {
      return;
    }
  },
};

function createLights() {
  const hemi = new THREE.HemisphereLight(0xfdeac4, 0x7d5131, 1.35);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xfff3d8, 1.9);
  sun.position.set(24, 38, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -70;
  sun.shadow.camera.right = 70;
  sun.shadow.camera.top = 70;
  sun.shadow.camera.bottom = -70;
  scene.add(sun);
}

function createGround(group = scene) {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 120, 40, 40),
    new THREE.MeshStandardMaterial({
      color: 0xc8895a,
      roughness: 0.98,
      metalness: 0,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  group.add(ground);

  const grid = new THREE.GridHelper(120, 24, 0xe2b27b, 0xd6a071);
  grid.position.y = 0.05;
  grid.material.opacity = 0.18;
  grid.material.transparent = true;
  group.add(grid);
}

function createStickman(color, skinId) {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.82,
    metalness: 0.03,
    transparent: true,
    depthWrite: true,
  });
  const darkMaterial = material.clone();
  const hsl = {};
  darkMaterial.color.getHSL(hsl);
  darkMaterial.color.offsetHSL(0, 0, hsl.l < 0.25 ? 0.08 : -0.08);

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.40, 1.0, 8, 14), material);
  body.position.y = 0.1;
  body.castShadow = true;
  group.add(body);

  const neck = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.08, 6, 8), material);
  neck.position.y = 0.9;
  neck.castShadow = true;
  group.add(neck);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.68, 18, 18), material);
  head.position.y = 1.7;
  head.castShadow = true;
  group.add(head);

  // 눈 (캔버스 텍스처 → 얼굴 평면)
  const isFemale = (color === 0xFF69B4 || color === 0x800080);
  const faceCanvas = document.createElement('canvas');
  faceCanvas.width = 256; faceCanvas.height = 256;
  const fctx = faceCanvas.getContext('2d');
  if (isFemale) {
    for (const cx of [58, 198]) {
      fctx.fillStyle = '#ffffff';
      fctx.beginPath();
      fctx.ellipse(cx, 128, 55, 40, 0, 0, Math.PI * 2);
      fctx.fill();
      fctx.fillStyle = '#111111';
      fctx.beginPath();
      fctx.ellipse(cx, 133, 34, 37, 0, 0, Math.PI * 2);
      fctx.fill();
    }
  } else {
    for (const cx of [62, 194]) {
      fctx.fillStyle = '#111111';
      fctx.beginPath();
      fctx.arc(cx, 128, 20, 0, Math.PI * 2);
      fctx.fill();
    }
  }
  const faceTex = new THREE.CanvasTexture(faceCanvas);
  const facePlaneMat = new THREE.MeshBasicMaterial({ map: faceTex, transparent: true, depthTest: false, depthWrite: false });
  const facePlane = new THREE.Mesh(new THREE.PlaneGeometry(0.80, 0.60), facePlaneMat);
  facePlane.position.set(0, 0.22, 0.60);
  facePlane.renderOrder = 2;
  head.add(facePlane);

  const upperArmGeo = new THREE.CapsuleGeometry(0.16, 0.40, 6, 10);
  const foreArmGeo = new THREE.CapsuleGeometry(0.14, 0.36, 6, 10);
  const upperLegGeo = new THREE.CapsuleGeometry(0.19, 0.42, 6, 10);
  const lowerLegGeo = new THREE.CapsuleGeometry(0.17, 0.38, 6, 10);

  const leftShoulder = new THREE.Group();
  leftShoulder.position.set(-0.42, 0.55, 0);
  group.add(leftShoulder);
  const rightShoulder = new THREE.Group();
  rightShoulder.position.set(0.42, 0.55, 0);
  group.add(rightShoulder);

  const leftArm = new THREE.Mesh(upperArmGeo, material);
  leftArm.position.set(-0.44, 0.20, 0);
  leftArm.castShadow = true;
  const leftForeArm = new THREE.Mesh(foreArmGeo, material);
  leftForeArm.position.set(0, -0.42, 0);
  leftForeArm.castShadow = true;
  const leftFist = new THREE.Mesh(new THREE.SphereGeometry(0.20, 12, 12), material);
  leftFist.position.set(0, -0.34, 0.02);
  leftFist.scale.set(1.15, 0.95, 1.1);
  leftFist.castShadow = true;
  leftForeArm.add(leftFist);
  leftArm.add(leftForeArm);
  group.add(leftArm);

  const rightArm = new THREE.Mesh(upperArmGeo, material);
  rightArm.position.set(0.44, 0.20, 0);
  rightArm.castShadow = true;
  const rightForeArm = new THREE.Mesh(foreArmGeo, material);
  rightForeArm.position.set(0, -0.42, 0);
  rightForeArm.castShadow = true;
  const rightFist = new THREE.Mesh(new THREE.SphereGeometry(0.20, 12, 12), material);
  rightFist.position.set(0, -0.34, 0.02);
  rightFist.scale.set(1.15, 0.95, 1.1);
  rightFist.castShadow = true;
  rightForeArm.add(rightFist);
  rightArm.add(rightForeArm);
  group.add(rightArm);

  const leftThigh = new THREE.Group();
  leftThigh.position.set(-0.18, -0.60, 0);
  group.add(leftThigh);
  const rightThigh = new THREE.Group();
  rightThigh.position.set(0.18, -0.60, 0);
  group.add(rightThigh);

  const leftLeg = new THREE.Mesh(upperLegGeo, material);
  leftLeg.position.set(-0.18, -0.90, 0);
  leftLeg.castShadow = true;
  const leftShin = new THREE.Mesh(lowerLegGeo, material);
  leftShin.position.set(0, -0.52, 0);
  leftShin.castShadow = true;
  const leftFoot = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), material);
  leftFoot.position.set(0, -0.36, 0.10);
  leftFoot.scale.set(1.1, 0.65, 1.45);
  leftFoot.castShadow = true;
  leftShin.add(leftFoot);
  leftLeg.add(leftShin);
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(upperLegGeo, material);
  rightLeg.position.set(0.18, -0.90, 0);
  rightLeg.castShadow = true;
  const rightShin = new THREE.Mesh(lowerLegGeo, material);
  rightShin.position.set(0, -0.52, 0);
  rightShin.castShadow = true;
  const rightFoot = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), material);
  rightFoot.position.set(0, -0.36, 0.10);
  rightFoot.scale.set(1.1, 0.65, 1.45);
  rightFoot.castShadow = true;
  rightShin.add(rightFoot);
  rightLeg.add(rightShin);
  group.add(rightLeg);

  group.userData = {
    body,
    neck,
    head,
    leftShoulder,
    rightShoulder,
    leftArm,
    rightArm,
    leftForeArm,
    rightForeArm,
    leftThigh,
    rightThigh,
    leftLeg,
    rightLeg,
    leftShin,
    rightShin,
    bodyMaterials: [material, darkMaterial],
    guitar: null,
  };

  if (color === 0xFF69B4) {
    const guitarGroup = new THREE.Group();
    const gPinkMat = new THREE.MeshStandardMaterial({ color: 0xFF69B4, roughness: 0.35, metalness: 0.3 });
    const gBlackMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4, metalness: 0.2 });
    const gWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.5, metalness: 0.1 });
    const gSilverMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 0.8 });

    const makeV = (inset) => {
      const s = new THREE.Shape();
      const w = 0.50 - inset, h = 0.42 - inset, top = 0.12 - inset * 0.3, g = 0.05 + inset * 0.15;
      s.moveTo(0, top); s.lineTo(-w, -h); s.lineTo(-(w - 0.12), -(h + 0.04));
      s.lineTo(-g, -g * 1.2); s.lineTo(g, -g * 1.2);
      s.lineTo(w - 0.12, -(h + 0.04)); s.lineTo(w, -h); s.lineTo(0, top);
      return s;
    };
    const extOpt = { depth: 0.09, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.012, bevelSegments: 2 };

    const gTrim = new THREE.Mesh(new THREE.ExtrudeGeometry(makeV(0), extOpt), gPinkMat);
    gTrim.rotation.x = -Math.PI / 2;
    gTrim.position.set(0, 0, -0.045);
    guitarGroup.add(gTrim);

    const gBody = new THREE.Mesh(new THREE.ExtrudeGeometry(makeV(0.03), { depth: 0.092, bevelEnabled: false }), gBlackMat);
    gBody.rotation.x = -Math.PI / 2;
    gBody.position.set(0, 0.003, -0.046);
    guitarGroup.add(gBody);

    const pgShape = new THREE.Shape();
    pgShape.moveTo(0, 0.05); pgShape.lineTo(-0.15, -0.13); pgShape.lineTo(-0.07, -0.16);
    pgShape.lineTo(0.07, -0.16); pgShape.lineTo(0.15, -0.13); pgShape.lineTo(0, 0.05);
    const gPG = new THREE.Mesh(new THREE.ExtrudeGeometry(pgShape, { depth: 0.012, bevelEnabled: false }), gWhiteMat);
    gPG.rotation.x = -Math.PI / 2;
    gPG.position.set(0, 0.048, -0.025);
    guitarGroup.add(gPG);

    const puGeo = new THREE.BoxGeometry(0.11, 0.022, 0.035);
    const pu1 = new THREE.Mesh(puGeo, gBlackMat);
    pu1.position.set(0, 0.058, -0.025);
    guitarGroup.add(pu1);
    const pu2 = new THREE.Mesh(puGeo, gBlackMat);
    pu2.position.set(0, 0.058, 0.025);
    guitarGroup.add(pu2);

    for (let p = 0; p < 2; p++) {
      for (let i = 0; i < 6; i++) {
        const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.01, 6), gSilverMat);
        dot.position.set(-0.025 + i * 0.01, 0.07, (p === 0 ? -0.025 : 0.025));
        guitarGroup.add(dot);
      }
    }

    const knob1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.025, 10), gPinkMat);
    knob1.position.set(0.10, 0.06, -0.10);
    guitarGroup.add(knob1);
    const knob2 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.02, 10), gBlackMat);
    knob2.position.set(0.08, 0.06, -0.14);
    guitarGroup.add(knob2);

    const jack = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.03, 6), gSilverMat);
    jack.rotation.x = Math.PI / 2;
    jack.position.set(0, 0.03, -0.20);
    guitarGroup.add(jack);

    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.02, 0.03), gSilverMat);
    bridge.position.set(0, 0.058, -0.06);
    guitarGroup.add(bridge);

    const gNeck = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.055, 1.0), gBlackMat);
    gNeck.position.set(0, 0.02, 0.65);
    guitarGroup.add(gNeck);
    const gFretboard = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.015, 0.98), new THREE.MeshStandardMaterial({ color: 0x3a1a10, roughness: 0.7 }));
    gFretboard.position.set(0, 0.05, 0.65);
    guitarGroup.add(gFretboard);

    for (let i = 0; i < 18; i++) {
      const fret = new THREE.Mesh(new THREE.BoxGeometry(0.072, 0.004, 0.004), gSilverMat);
      fret.position.set(0, 0.058, 0.20 + i * 0.055);
      guitarGroup.add(fret);
    }
    const dots = [2, 4, 6, 8, 11, 14];
    for (const d of dots) {
      const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.005, 6), gWhiteMat);
      dot.position.set(0, 0.06, 0.20 + d * 0.055);
      guitarGroup.add(dot);
    }

    const nut = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.015, 0.015), gWhiteMat);
    nut.position.set(0, 0.055, 0.17);
    guitarGroup.add(nut);

    const hsShape = new THREE.Shape();
    hsShape.moveTo(0, 0.16); hsShape.lineTo(-0.08, 0); hsShape.lineTo(-0.06, -0.04);
    hsShape.lineTo(0.06, -0.04); hsShape.lineTo(0.08, 0); hsShape.lineTo(0, 0.16);
    const hsGeo = new THREE.ExtrudeGeometry(hsShape, { depth: 0.05, bevelEnabled: false });
    const gHead = new THREE.Mesh(hsGeo, gBlackMat);
    gHead.rotation.x = -Math.PI / 2;
    gHead.position.set(0, 0.015, 1.18);
    guitarGroup.add(gHead);
    const gHeadPink = new THREE.Mesh(hsGeo, gPinkMat);
    gHeadPink.rotation.x = -Math.PI / 2;
    gHeadPink.position.set(0, -0.01, 1.18);
    gHeadPink.scale.set(1.06, 1.06, 0.4);
    guitarGroup.add(gHeadPink);

    for (let i = 0; i < 6; i++) {
      const side = i < 3 ? -1 : 1;
      const row = i < 3 ? i : i - 3;
      const peg = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.05, 6), gSilverMat);
      peg.rotation.z = Math.PI / 2;
      peg.position.set(side * 0.065, 0.015, 1.24 + row * 0.05);
      guitarGroup.add(peg);
      const knobP = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.015, 6), gWhiteMat);
      knobP.rotation.z = Math.PI / 2;
      knobP.position.set(side * 0.095, 0.015, 1.24 + row * 0.05);
      guitarGroup.add(knobP);
    }

    for (let i = 0; i < 6; i++) {
      const s = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 1.5, 4), gSilverMat);
      s.rotation.x = Math.PI / 2;
      s.position.set(-0.025 + i * 0.01, 0.06, 0.45);
      guitarGroup.add(s);
    }

    const strapMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.015, 1.6), strapMat);
    strap.position.set(0.18, -0.02, 0.3);
    strap.rotation.set(0.25, 0, 0.55);
    guitarGroup.add(strap);

    guitarGroup.position.set(0.10, -0.10, 0.35);
    guitarGroup.rotation.set(0.0, Math.PI * 0.5, -0.5);
    guitarGroup.scale.set(1.15, 1.15, 1.15);
    group.add(guitarGroup);
    group.userData.guitar = guitarGroup;

    // 머리핀 (나비 리본)
    const pinGroup = new THREE.Group();
    const pinMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4, metalness: 0.3 });
    const pinCenterMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.3, metalness: 0.2 });
    const leftWing = new THREE.Mesh(new THREE.SphereGeometry(0.27, 8, 6), pinMat);
    leftWing.scale.set(1.2, 1.2, 0.4);
    leftWing.position.set(-0.33, 0, 0);
    pinGroup.add(leftWing);
    const rightWing = new THREE.Mesh(new THREE.SphereGeometry(0.27, 8, 6), pinMat);
    rightWing.scale.set(1.2, 1.2, 0.4);
    rightWing.position.set(0.33, 0, 0);
    pinGroup.add(rightWing);
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), pinCenterMat);
    pinGroup.add(knot);
    pinGroup.position.set(-0.35, 2.32, 0.1);
    pinGroup.rotation.z = Math.PI / 4;
    group.add(pinGroup);
    group.userData.hairPin = pinGroup;
  }

  if (color === 0x800080) {
    // 퍼플 머리핀 (나비 리본)
    const purplePinGroup = new THREE.Group();
    const purplePinMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4, metalness: 0.3 });
    const purplePinCenterMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.3, metalness: 0.2 });
    const pLeftWing = new THREE.Mesh(new THREE.SphereGeometry(0.27, 8, 6), purplePinMat);
    pLeftWing.scale.set(1.2, 1.2, 0.4);
    pLeftWing.position.set(-0.33, 0, 0);
    purplePinGroup.add(pLeftWing);
    const pRightWing = new THREE.Mesh(new THREE.SphereGeometry(0.27, 8, 6), purplePinMat);
    pRightWing.scale.set(1.2, 1.2, 0.4);
    pRightWing.position.set(0.33, 0, 0);
    purplePinGroup.add(pRightWing);
    const pKnot = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), purplePinCenterMat);
    purplePinGroup.add(pKnot);
    purplePinGroup.position.set(-0.35, 2.32, 0.1);
    purplePinGroup.rotation.z = Math.PI / 4;
    group.add(purplePinGroup);
    group.userData.hairPin = purplePinGroup;
  }

  if (skinId) applySkin(group, skinId);

  return group;
}

function createNameLabel(name, hexColor) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  ctx.font = "bold 24px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.strokeStyle = "rgba(0,0,0,0.85)";
  ctx.lineWidth = 4;
  const r = (hexColor >> 16) & 0xff;
  const g = (hexColor >> 8) & 0xff;
  const b = hexColor & 0xff;
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.strokeText(name, 128, 32);
  ctx.fillText(name, 128, 32);
  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }),
  );
  sprite.scale.set(2.5, 0.625, 1);
  sprite.position.set(0, 3.6, 0);
  return sprite;
}

// ── Lobby 3D character preview ──
const previewCanvas = document.getElementById("char-preview-canvas");
const previewRenderer = new THREE.WebGLRenderer({ canvas: previewCanvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
previewRenderer.setSize(480, 480);
previewRenderer.outputColorSpace = THREE.SRGBColorSpace;

const previewScene = new THREE.Scene();
const previewCamera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
previewCamera.position.set(0, 0.8, 12.0);
previewCamera.lookAt(0, 0.2, 0);
previewScene.add(new THREE.AmbientLight(0xffffff, 0.7));
const previewDirLight = new THREE.DirectionalLight(0xfff4e0, 1.2);
previewDirLight.position.set(3, 6, 4);
previewScene.add(previewDirLight);
const previewRimLight = new THREE.DirectionalLight(0xffe0c0, 0.4);
previewRimLight.position.set(-3, 2, -3);
previewScene.add(previewRimLight);

let previewModel, previewChar, previewCharType;
let previewTime = 0;

function setPreviewCharacter(charType) {
  const acc = loadAccount();
  const skinId = acc?.selectedSkins?.[charType] || null;
  const key = charType + (skinId || "");
  if (previewChar === key && previewModel) return;
  if (previewModel) previewScene.remove(previewModel);
  previewChar = key;
  previewCharType = charType;
  const charDef = CHARACTERS[charType];
  if (!charDef) return;
  previewModel = createStickman(charDef.color, skinId);
  previewModel.position.y = 0;
  previewScene.add(previewModel);
}

function renderPreview(dt) {
  if (!previewModel) return;
  previewTime += dt;
  const parts = previewModel.userData;
  const charDef = CHARACTERS[previewCharType];
  if (!charDef) return;

  previewModel.rotation.y = previewTime * 0.6;

  const w = charDef.walk;
  const cycle = Math.sin(previewTime * w.cycleSpeed * 0.4);
  let leftArmX = cycle * w.armAmp * 0.5;
  let rightArmX = -cycle * w.armAmp * 0.5;
  let leftArmZ = w.armRestZ;
  let rightArmZ = -w.armRestZ;
  let headX = 0;

  if (previewCharType === "red") {
    leftArmX += -0.7 + Math.sin(previewTime * 1.8) * 0.03;
    rightArmX += -0.7 + Math.sin(previewTime * 1.8 + 1.5) * 0.03;
    leftArmZ = 0.05;
    rightArmZ = -0.05;
    headX = -0.04;
  } else if (previewCharType === "pink") {
    leftArmX = -0.55;
    leftArmZ = 0.20;
    rightArmX = -0.25 + Math.sin(previewTime * 2.5) * 0.04;
    rightArmZ = -0.10;
    headX = -0.06;
  }

  let leftElbowX = 0;
  let rightElbowX = 0;
  if (previewCharType === "red") {
    leftElbowX = -0.6 + Math.sin(previewTime * 1.8) * 0.05;
    rightElbowX = -0.6 + Math.sin(previewTime * 1.8 + 1.5) * 0.05;
  } else if (previewCharType === "pink") {
    leftElbowX = -0.7;
    rightElbowX = -0.4 + Math.sin(previewTime * 2.5) * 0.06;
  }

  parts.leftArm.rotation.x = leftArmX;
  parts.rightArm.rotation.x = rightArmX;
  parts.leftArm.rotation.z = leftArmZ;
  parts.rightArm.rotation.z = rightArmZ;
  parts.leftForeArm.rotation.x = leftElbowX;
  parts.rightForeArm.rotation.x = rightElbowX;
  const leftLegX = -cycle * w.legAmp * 0.4;
  const rightLegX = cycle * w.legAmp * 0.4;
  parts.leftLeg.rotation.x = leftLegX;
  parts.rightLeg.rotation.x = rightLegX;
  parts.leftShin.rotation.x = Math.max(0, leftLegX * 0.5);
  parts.rightShin.rotation.x = Math.max(0, rightLegX * 0.5);
  parts.leftShoulder.rotation.x = leftArmX * 0.35;
  parts.rightShoulder.rotation.x = rightArmX * 0.35;
  parts.leftThigh.rotation.x = -cycle * w.legAmp * 0.18;
  parts.rightThigh.rotation.x = cycle * w.legAmp * 0.18;
  parts.body.rotation.z = Math.sin(previewTime * 1.2) * 0.02;
  parts.head.rotation.x = headX;

  previewRenderer.render(previewScene, previewCamera);
}

function createHealthBarMesh() {
  const group = new THREE.Group();
  const bg = new THREE.Mesh(
    new THREE.PlaneGeometry(1.35, 0.16),
    new THREE.MeshBasicMaterial({ color: 0x2d1a11, transparent: true, opacity: 0.88 }),
  );
  const fill = new THREE.Mesh(
    new THREE.PlaneGeometry(1.31, 0.1),
    new THREE.MeshBasicMaterial({ color: 0xff8455 }),
  );
  fill.position.z = 0.001;
  group.add(bg);
  group.add(fill);
  group.userData.fill = fill;
  return group;
}

function makeFighter(options) {
  const charDef = CHARACTERS[options.characterType ?? "red"];
  let levelMult = 1;
  let skinId = null;
  let hasOrangeBlastAbility = false;
  let hasPurpleFanAbility = false;
  let hasYellowOverloadAbility = false;
  let hasCyanPrecisionAbility = false;
  let hasPinkAreaHealAbility = false;
  let hasRedRageAbility = false;
  let hasGreenBounceAbility = false;
  let hasBlueArmorPierceAbility = false;
  if (options.isPlayer) {
    const acc = loadAccount();
    if (acc) {
      levelMult = getLevelMultiplier(getCharLevel(acc, options.characterType ?? "red"));
      skinId = acc.selectedSkins?.[options.characterType ?? "red"] || null;
      hasOrangeBlastAbility = (options.characterType === "orange") && !!acc.rotation?.newAbilityChars?.includes("orange");
      hasPurpleFanAbility = (options.characterType === "purple") && !!acc.rotation?.newAbilityChars?.includes("purple");
      hasYellowOverloadAbility = (options.characterType === "yellow") && !!acc.rotation?.newAbilityChars?.includes("yellow");
      hasCyanPrecisionAbility = (options.characterType === "cyan") && !!acc.rotation?.newAbilityChars?.includes("cyan");
      hasPinkAreaHealAbility = (options.characterType === "pink") && !!acc.rotation?.newAbilityChars?.includes("pink");
      hasRedRageAbility = (options.characterType === "red") && !!acc.rotation?.newAbilityChars?.includes("red");
      hasGreenBounceAbility = (options.characterType === "green") && !!acc.rotation?.newAbilityChars?.includes("green");
      hasBlueArmorPierceAbility = (options.characterType === "blue") && !!acc.rotation?.newAbilityChars?.includes("blue");
    }
  }
  const effectiveMaxHealth = Math.round(charDef.maxHealth * levelMult);
  const fighter = {
    id: options.id,
    name: options.name,
    characterType: options.characterType ?? "red",
    isPlayer: options.isPlayer,
    levelMult,
    hasOrangeBlastAbility,
    hasPurpleFanAbility,
    hasYellowOverloadAbility,
    hasCyanPrecisionAbility,
    hasPinkAreaHealAbility,
    hasRedRageAbility,
    hasGreenBounceAbility,
    hasBlueArmorPierceAbility,
    health: effectiveMaxHealth,
    maxHealth: effectiveMaxHealth,
    maxAmmo: charDef.maxAmmo ?? maxAmmo,
    ammo: charDef.maxAmmo ?? maxAmmo,
    reloadTimer: 0,
    nextAttackAt: 0,
    attackSequenceEndsAt: 0,
    spread: 0,
    spreadRecovery: 0,
    recoilKick: 0,
    pitchKick: 0,
    yaw: options.yaw ?? 0,
    radius: 1.05,
    dead: false,
    zoneDamageTick: 0,
    botDecisionAt: 0,
    botMoveTarget: new THREE.Vector3(options.position.x, 0, options.position.z),
    botStrafeDir: Math.random() > 0.5 ? 1 : -1,
    botDifficulty: 1,
    botHoldUntil: 0,
    attackSwing: 0,
    attackAnimTime: -1,
    lastCombatTime: -999,
    nextRegenAt: 0,
    damageDealt: 0,
    respawnAt: 0,
    revealedUntil: 0,
    team: null,
    axeLevel: 0,
    isChopping: false,
    chopTimer: 0,
    chopDamageDealt: 0,
    bestAxeLevel: 0,
    cwKills: 0,
    attackIndex: 0,
    poisonUntil: 0,
    poisonSourceId: -1,
    poisonNextTick: 0,
  };

  fighter.mesh = createStickman(charDef.color, skinId);
  fighter.mesh.position.set(options.position.x, 1.85, options.position.z);
  fighter.mesh.rotation.y = fighter.yaw;
  scene.add(fighter.mesh);

  fighter.shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.95, 16),
    new THREE.MeshBasicMaterial({ color: 0x20140f, transparent: true, opacity: 0.22 }),
  );
  fighter.shadow.rotation.x = -Math.PI / 2;
  fighter.shadow.position.set(options.position.x, 0.04, options.position.z);
  scene.add(fighter.shadow);

  fighter.healthBar = createHealthBarMesh();
  fighter.healthBar.position.set(0, 3.05, 0);
  fighter.mesh.add(fighter.healthBar);

  fighter.flashMaterial = fighter.mesh.userData.body.material;
  fighter.bodyMaterials = fighter.mesh.userData.bodyMaterials;
  const charDef2 = CHARACTERS[options.characterType ?? "red"];
  fighter.nameLabel = createNameLabel(options.name, charDef2.color);
  fighter.mesh.add(fighter.nameLabel);
  fighter.teamMarker = null;
  return fighter;
}

function addTeamMarker(fighter, team) {
  const color = team === "a" ? 0x4488ff : 0xff4444;
  const marker = new THREE.Mesh(
    new THREE.CircleGeometry(0.28, 12),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, depthWrite: false }),
  );
  marker.rotation.x = -Math.PI / 2;
  marker.position.set(0, 3.6, 0);
  fighter.mesh.add(marker);
  fighter.teamMarker = marker;

  const nameColor = team === "a" ? "#4488ff" : "#ff4444";
  fighter.teamNameColor = nameColor;
}

function createWall(x, z, width, depth, height = 2.8, group = scene, solidsArr = state.solids, color = 0xb77658) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.9,
      metalness: 0.02,
    }),
  );
  mesh.position.set(x, height * 0.5, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  solidsArr.push({
    type: "wall",
    x,
    z,
    width,
    depth,
    minX: x - width * 0.5,
    maxX: x + width * 0.5,
    minZ: z - depth * 0.5,
    maxZ: z + depth * 0.5,
  });
}

const bushClumpGeo = new THREE.IcosahedronGeometry(1, 0);
const bushClumpMats = [0x5a7d3a, 0x6f9447, 0x4f6f31, 0x7da84f].map(
  (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.95 }),
);

function createBush(x, z, radius = 1.35, group = scene, bushArr = state.bushes) {
  const bush = new THREE.Group();
  const clumpCount = 4 + Math.floor(Math.random() * 2);
  for (let i = 0; i < clumpCount; i += 1) {
    const clumpRadius = radius * (0.5 + Math.random() * 0.3);
    const mat = bushClumpMats[i % bushClumpMats.length].clone();
    mat.transparent = true;
    const clump = new THREE.Mesh(bushClumpGeo, mat);
    const angle = (i / clumpCount) * Math.PI * 2 + Math.random() * 0.6;
    const offset = radius * 0.35;
    clump.position.set(Math.cos(angle) * offset, clumpRadius * 0.7, Math.sin(angle) * offset);
    clump.scale.set(clumpRadius, clumpRadius * 0.75, clumpRadius);
    clump.rotation.y = Math.random() * Math.PI * 2;
    clump.castShadow = true;
    bush.add(clump);
  }
  bush.position.set(x, 0, z);
  group.add(bush);
  bushArr.push({ x, z, radius: radius + 0.25, mesh: bush });
}

function createSkullCluster(x, z, count = 7, group = scene) {
  const cluster = new THREE.Group();
  for (let i = 0; i < count; i += 1) {
    const skull = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0xf5e9d2, roughness: 0.95 }),
    );
    skull.scale.set(1, 0.88, 1);
    skull.position.set((Math.random() - 0.5) * 1.9, 0.28 + Math.random() * 0.12, (Math.random() - 0.5) * 1.6);
    skull.castShadow = true;
    cluster.add(skull);
  }
  cluster.position.set(x, 0, z);
  group.add(cluster);
}

function createLake(x, z, width, depth, group = scene, lakesArr = state.lakeRects) {
  const lake = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.1, depth),
    new THREE.MeshStandardMaterial({
      color: 0x2f96df,
      roughness: 0.2,
      metalness: 0,
      transparent: true,
      opacity: 0.92,
    }),
  );
  lake.position.set(x, 0.07, z);
  lake.receiveShadow = true;
  group.add(lake);
  lakesArr.push({
    x,
    z,
    width,
    depth,
    minX: x - width * 0.5,
    maxX: x + width * 0.5,
    minZ: z - depth * 0.5,
    maxZ: z + depth * 0.5,
  });
}

const MAP_POOL = [
  {
    id: 0,
    name: "해골 협곡",
    wallSpecs: [
      [-33, 34, 2, 6], [-18, 40, 8, 2], [-7, 35, 2, 8], [9, 36, 2, 10], [24, 38, 2, 8],
      [41, 23, 2, 8], [36, 12, 6, 2], [22, 20, 2, 8], [14, 9, 8, 2], [0, 17, 10, 2],
      [-13, 18, 2, 8], [-24, 15, 6, 2], [-36, 20, 2, 10], [-42, 8, 6, 2], [-28, 4, 2, 8], [-15, -2, 10, 2],
      [-2, 4, 2, 10], [16, -2, 6, 2], [28, 4, 2, 8], [40, -2, 6, 2], [35, -18, 2, 12], [25, -24, 10, 2],
      [15, -30, 2, 8], [0, -26, 8, 2], [-12, -30, 2, 8], [-28, -24, 10, 2], [-38, -16, 2, 8],
      [-14, -40, 8, 2], [2, -40, 12, 2], [18, -38, 2, 10],
      [-6, -14, 6, 2], [8, -14, 2, 8], [12, -12, 8, 2], [-20, -14, 2, 8], [-24, -8, 8, 2], [24, -10, 8, 2],
      [31, -8, 2, 8], [5, 28, 8, 2], [15, 28, 2, 8], [-26, 28, 10, 2], [-18, 25, 2, 8], [32, 26, 8, 2],
    ],
    bushSpecs: [
      [-6, 44], [10, 44],
      [-34, 27], [-8, 27], [5, 31], [18, 30],
      [-44, 14], [-32, 12], [-17, 10], [16, 12], [43, 9],
      [-41, -2], [-29, -3], [0, -3], [34, -1],
      [-44, -18], [-31, -17], [13, -18], [28, -18], [42, -22],
      [-22, -36], [-6, -33], [8, -34], [24, -33],
    ],
    skullSpecs: [
      [-18, 12], [-6, 8], [8, 10], [18, 7], [-12, 24], [14, 24], [0, 28], [-28, 0], [30, -18], [-4, -22],
    ],
    lakes: [{ x: 0, z: -18, width: 18, depth: 5.5 }],
    spawns: [
      [-30, 0, 32], [-18, 0, 44], [6, 0, 43], [28, 0, 36], [43, 0, 12],
      [38, 0, -26], [12, 0, -42], [-16, 0, -41], [-39, 0, -22], [-44, 0, 10],
    ],
  },
  {
    id: 1,
    name: "마른 호수",
    wallSpecs: [
      [-20, 38, 2, 8], [0, 42, 10, 2], [18, 38, 2, 8],
      [-28, 22, 8, 2], [-10, 28, 2, 8], [10, 22, 8, 2], [28, 28, 2, 10], [42, 20, 6, 2],
      [-36, 10, 6, 2], [-22, 6, 2, 8], [-8, 10, 8, 2], [8, 6, 2, 8], [22, 10, 6, 2], [38, 8, 2, 8],
      [-40, -6, 8, 2], [-24, -10, 2, 8], [-6, -6, 6, 2], [10, -10, 2, 8], [26, -6, 8, 2], [42, -10, 2, 8],
      [-36, -22, 2, 10], [-18, -24, 8, 2], [0, -20, 2, 8], [18, -24, 8, 2], [36, -22, 2, 10],
      [-26, -38, 2, 8], [-8, -40, 10, 2], [12, -38, 2, 8],
      [-14, 14, 2, 6], [14, 14, 2, 6], [-14, -14, 2, 6], [14, -14, 2, 6], [0, 0, 4, 4],
      [-34, 34, 8, 2], [34, 34, 8, 2], [-34, -34, 8, 2], [34, -34, 8, 2],
    ],
    bushSpecs: [
      [-10, 44], [10, 44],
      [-16, 30], [16, 30],
      [-30, 8], [0, 12], [30, 8],
      [-30, -8], [0, -8],
      [-18, -42], [6, -42],
    ],
    skullSpecs: [
      [-20, 30], [20, 30], [-20, -30], [20, -30], [0, 18], [0, -18], [-30, 0], [30, 0],
    ],
    lakes: [
      { x: -30, z: -14, width: 10, depth: 6 },
      { x: 30, z: 14, width: 10, depth: 6 },
    ],
    spawns: [
      [-30, 0, 32], [-14, 0, 44], [14, 0, 44], [30, 0, 32], [44, 0, 14],
      [38, 0, -20], [14, 0, -42], [-14, 0, -42], [-38, 0, -20], [-44, 0, 14],
    ],
  },
  {
    id: 2,
    name: "뼈의 미로",
    wallSpecs: [
      [-24, 36, 2, 10], [0, 40, 12, 2], [24, 36, 2, 10],
      [-30, 18, 8, 2], [-14, 24, 2, 10], [0, 18, 10, 2], [14, 24, 2, 10], [30, 18, 8, 2],
      [-38, 6, 6, 2], [-20, 2, 2, 10], [-6, 6, 6, 2], [6, 2, 2, 10], [20, 6, 6, 2], [38, 2, 2, 10],
      [-42, -10, 8, 2], [-28, -14, 2, 8], [-10, -10, 10, 2], [10, -14, 2, 8], [28, -10, 8, 2], [42, -14, 2, 8],
      [-36, -26, 2, 10], [-18, -28, 8, 2], [0, -26, 2, 10], [18, -28, 8, 2], [36, -26, 2, 10],
      [-22, -42, 2, 8], [0, -40, 12, 2], [22, -42, 2, 8],
      [-34, 34, 8, 2], [34, 34, 8, 2], [-34, -34, 8, 2], [34, -34, 8, 2],
    ],
    bushSpecs: [
      [0, 44],
      [-36, 28], [-6, 28], [6, 28], [36, 28],
      [-28, 8], [0, 8], [28, 8],
      [-14, -6], [14, -6],
      [-10, -22], [10, -22],
      [-10, -38], [10, -38],
    ],
    skullSpecs: [
      [-30, 30], [30, 30], [-30, -30], [30, -30], [0, 0],
      [-20, 14], [20, 14], [-20, -14], [20, -14], [0, 30],
    ],
    lakes: [{ x: 0, z: -34, width: 14, depth: 5 }],
    spawns: [
      [-30, 0, 32], [-10, 0, 42], [10, 0, 42], [30, 0, 32], [44, 0, 10],
      [44, 0, -18], [10, 0, -44], [-10, 0, -44], [-44, 0, -18], [-44, 0, 10],
    ],
  },
];

// ── Take Down 전용 8방향 대칭 맵 ──────────────────────────────────────
function rotateXZ(x, z, angleDeg) {
  const rad = angleDeg * (Math.PI / 180);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return [x * cos - z * sin, x * sin + z * cos];
}

const TD_ARENA_RADIUS = 14;
const TD_CORRIDOR_LENGTH = 30;
const TD_SPAWN_DIST = TD_ARENA_RADIUS + TD_CORRIDOR_LENGTH;

// 북쪽(+Z) 기준 통로 템플릿 — 8방향으로 회전 복제된다
// 측벽은 정사각형 블록을 이어붙여 구성한다 — 정사각형은 가로/세로가 같아서
// 어떤 각도(0°~315°)로 회전해도 모양이 동일하게 유지되어 8방향이 완벽히 대칭된다
const TD_RAIL_X = 7;
const TD_RAIL_SEG = 3;
const TD_RAIL_SEGMENTS = (() => {
  const segs = [];
  for (let z = TD_ARENA_RADIUS + TD_RAIL_SEG / 2; z <= TD_SPAWN_DIST - TD_RAIL_SEG / 2 + 0.01; z += TD_RAIL_SEG) {
    segs.push([-TD_RAIL_X, z, TD_RAIL_SEG, TD_RAIL_SEG]);
    segs.push([TD_RAIL_X, z, TD_RAIL_SEG, TD_RAIL_SEG]);
  }
  return segs;
})();
const TD_SPOKE_WALLS = [
  ...TD_RAIL_SEGMENTS,
  [-2.5, 18, 2, 2],
  [2.5, 26, 2, 2],
  [-2.5, 34, 2, 2],
  [2.5, 40, 2, 2],
];
const TD_SPOKE_BUSHES = [[-4.5, 17], [4.5, 31]];
const TD_SPOKE_TREES = [[6, 21]];
// 통로 측벽 바깥쪽 열린 공간에 놓이는 호수 — 통로 진행을 막지 않는다
// 정사각형이라 8방향 회전해도 모양이 동일하다
const TD_SPOKE_LAKES = [[11, 24, 4, 4], [-11, 24, 4, 4]];

const TD_SPAWNS = Array.from({ length: 8 }, (_, i) => {
  const [x, z] = rotateXZ(0, TD_SPAWN_DIST, i * 45);
  return [x, 0, z];
});

function createTakeDownMap() {
  clearBattleMap();
  createGround(battleMapGroup);

  for (let i = 0; i < 8; i += 1) {
    const angle = i * 45;

    TD_SPOKE_WALLS.forEach(([x, z, w, d]) => {
      const [rx, rz] = rotateXZ(x, z, angle);
      createWall(rx, rz, w, d, undefined, battleMapGroup, state.battleSolids);
    });
    TD_SPOKE_BUSHES.forEach(([x, z]) => {
      const [rx, rz] = rotateXZ(x, z, angle);
      createBush(rx, rz, 1.45, battleMapGroup, state.battleBushes);
    });
    TD_SPOKE_TREES.forEach(([x, z]) => {
      const [rx, rz] = rotateXZ(x, z, angle);
      createSkullCluster(rx, rz, 8, battleMapGroup);
    });
    TD_SPOKE_LAKES.forEach(([x, z, w, d]) => {
      const [rx, rz] = rotateXZ(x, z, angle);
      createLake(rx, rz, w, d, battleMapGroup, state.battleLakeRects);
    });
  }

  state.solids = state.battleSolids;
  state.lakeRects = state.battleLakeRects;
  state.bushes = state.battleBushes;
}

function clearBattleMap() {
  battleMapGroup.traverse((obj) => {
    if (obj.geometry && obj.geometry !== bushClumpGeo) obj.geometry.dispose();
    if (obj.material) {
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((m) => { if (!bushClumpMats.includes(m)) m.dispose(); });
    }
  });
  battleMapGroup.clear();
  state.battleSolids = [];
  state.battleLakeRects = [];
  state.battleBushes = [];
}

function createMap(mapData) {
  clearBattleMap();

  createGround(battleMapGroup);

  mapData.wallSpecs.forEach((spec) => createWall(...spec, undefined, battleMapGroup, state.battleSolids));

  mapData.bushSpecs.forEach(([x, z]) => createBush(x, z, 1.45 + Math.random() * 0.25, battleMapGroup, state.battleBushes));

  mapData.skullSpecs.forEach(([x, z]) => createSkullCluster(x, z, 8 + Math.floor(Math.random() * 5), battleMapGroup));

  mapData.lakes.forEach((lake) => createLake(lake.x, lake.z, lake.width, lake.depth, battleMapGroup, state.battleLakeRects));

  state.solids = state.battleSolids;
  state.lakeRects = state.battleLakeRects;
  state.bushes = state.battleBushes;
}

function createTrainingMap() {
  state.trainingSolids = [];

  // 콘크리트 바닥
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 85, 25, 42),
    new THREE.MeshStandardMaterial({ color: 0x909090, roughness: 0.96, metalness: 0 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, 0.005, -7);
  ground.receiveShadow = true;
  trainingMapGroup.add(ground);

  // 그리드
  const grid = new THREE.GridHelper(50, 25, 0x6a6a6a, 0x7a7a7a);
  grid.position.set(0, 0.055, -7);
  grid.material.opacity = 0.28;
  grid.material.transparent = true;
  trainingMapGroup.add(grid);

  // 경계 벽 (콘크리트 색)
  const bWalls = [
    [0, 35, 50, 2],   // 앞벽
    [0, -49, 50, 2],  // 뒷벽
    [-26, -7, 2, 88], // 좌벽
    [26, -7, 2, 88],  // 우벽
  ];
  bWalls.forEach(([x, z, w, d]) => createWall(x, z, w, d, 3.5, trainingMapGroup, state.trainingSolids, 0x5c5c5c));

  // 거대 로봇 단상 (팔각형 받침대)
  const podium = new THREE.Mesh(
    new THREE.CylinderGeometry(3.8, 4.4, 0.45, 8),
    new THREE.MeshStandardMaterial({ color: 0x484848, roughness: 0.88, metalness: 0.05 }),
  );
  podium.position.set(0, 0.225, -5);
  podium.castShadow = true;
  podium.receiveShadow = true;
  trainingMapGroup.add(podium);

  // 사격 라인 (발사 위치 표시)
  const lineGeo = new THREE.PlaneGeometry(50, 0.3);
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xffee44, transparent: true, opacity: 0.55 });
  const fireLine = new THREE.Mesh(lineGeo, lineMat);
  fireLine.rotation.x = -Math.PI / 2;
  fireLine.position.set(0, 0.07, 20);
  trainingMapGroup.add(fireLine);

  // 사격 레인 구분선 (세로)
  for (let i = -2; i <= 2; i += 1) {
    const lane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.15, 55),
      new THREE.MeshBasicMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.25 }),
    );
    lane.rotation.x = -Math.PI / 2;
    lane.position.set(i * 8, 0.07, -7);
    trainingMapGroup.add(lane);
  }

  // 타겟 마커 (짤짝이 위치)
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      const tx = (col - 2) * 4;
      const tz = -16 - row * 5;
      const marker = new THREE.Mesh(
        new THREE.CircleGeometry(1.3, 16),
        new THREE.MeshBasicMaterial({ color: 0xdd3311, transparent: true, opacity: 0.38, depthWrite: false }),
      );
      marker.rotation.x = -Math.PI / 2;
      marker.position.set(tx, 0.06, tz);
      trainingMapGroup.add(marker);
    }
  }

  // 거대 로봇 타겟 마커
  const bossMarker = new THREE.Mesh(
    new THREE.CircleGeometry(4, 24),
    new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.28, depthWrite: false }),
  );
  bossMarker.rotation.x = -Math.PI / 2;
  bossMarker.position.set(0, 0.06, -5);
  trainingMapGroup.add(bossMarker);
}

// ── Chop Wood Map & Init ─────────────────────────────────────────────────
const chopWoodMapGroup = new THREE.Group();
scene.add(chopWoodMapGroup);
chopWoodMapGroup.visible = false;

function createTreeMesh(color) {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.8, 4, 8),
    new THREE.MeshStandardMaterial({ color: 0x8B5A2B, roughness: 0.9 }),
  );
  trunk.position.y = 2;
  trunk.castShadow = true;
  group.add(trunk);
  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(2.5, 10, 8),
    new THREE.MeshStandardMaterial({ color, roughness: 0.85 }),
  );
  leaves.position.y = 5;
  leaves.castShadow = true;
  group.add(leaves);
  return group;
}

function createTreeHealthBarMesh() {
  const bg = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 0.4),
    new THREE.MeshBasicMaterial({ color: 0x222222, transparent: true, opacity: 0.7, depthWrite: false }),
  );
  const fill = new THREE.Mesh(
    new THREE.PlaneGeometry(3.0, 0.28),
    new THREE.MeshBasicMaterial({ color: 0x4caf50, depthWrite: false }),
  );
  fill.position.z = 0.001;
  bg.add(fill);
  bg.userData = { fill };
  return bg;
}

function createChopWoodMap() {
  chopWoodMapGroup.traverse((obj) => {
    if (obj.geometry && obj.geometry !== bushClumpGeo) obj.geometry.dispose();
    if (obj.material) {
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((m) => { if (!bushClumpMats.includes(m)) m.dispose(); });
    }
  });
  chopWoodMapGroup.clear();
  state.battleSolids = [];
  state.battleLakeRects = [];
  state.battleBushes = [];

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(34, 64, 17, 32),
    new THREE.MeshStandardMaterial({ color: 0xc8895a, roughness: 0.98, metalness: 0 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  chopWoodMapGroup.add(ground);

  const grid = new THREE.GridHelper(64, 16, 0xe2b27b, 0xd6a071);
  grid.position.y = 0.05;
  grid.material.opacity = 0.18;
  grid.material.transparent = true;
  chopWoodMapGroup.add(grid);

  const borderWalls = [
    [-18, 0, 2, 64], [18, 0, 2, 64],
    [0, -33, 36, 2], [0, 33, 36, 2],
  ];
  borderWalls.forEach(([x, z, w, d]) =>
    createWall(x, z, w, d, 3.5, chopWoodMapGroup, state.battleSolids, 0x7a5a3a));

  const midWalls = [
    [-6, -6, 4, 2], [6, -6, 4, 2],
    [-6, 6, 4, 2], [6, 6, 4, 2],
    [0, 0, 2, 6],
    [0, -12, 8, 2], [0, 12, 8, 2],
  ];
  midWalls.forEach(([x, z, w, d]) =>
    createWall(x, z, w, d, undefined, chopWoodMapGroup, state.battleSolids));

  const bushPositions = [
    [-10, -10], [10, -10], [-10, 10], [10, 10],
    [-5, -18], [5, -18], [-5, 18], [5, 18],
    [-12, 0], [12, 0],
  ];
  bushPositions.forEach(([x, z]) =>
    createBush(x, z, 1.4, chopWoodMapGroup, state.battleBushes));

  const treeA = createTreeMesh(0x4caf50);
  treeA.position.set(0, 0, -25);
  chopWoodMapGroup.add(treeA);

  const treeB = createTreeMesh(0xe53935);
  treeB.position.set(0, 0, 25);
  chopWoodMapGroup.add(treeB);

  const treeBarA = createTreeHealthBarMesh();
  treeBarA.position.set(0, 8.5, 0);
  treeA.add(treeBarA);

  const treeBarB = createTreeHealthBarMesh();
  treeBarB.position.set(0, 8.5, 0);
  treeB.add(treeBarB);

  state.teams = {
    a: { tree: { x: 0, z: -25, health: 50, maxHealth: 50 }, treeMesh: treeA, treeBar: treeBarA },
    b: { tree: { x: 0, z: 25, health: 50, maxHealth: 50 }, treeMesh: treeB, treeBar: treeBarB },
  };
  state.playerTeam = "a";
}

function createAxeIndicator() {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.1),
    new THREE.MeshBasicMaterial({ color: AXE_GRADES[0].color, depthWrite: false }),
  );
  return mesh;
}

function initChopWoodPlayers() {
  state.players.forEach((fighter) => {
    scene.remove(fighter.mesh);
    scene.remove(fighter.shadow);
  });
  state.players = [];

  const botTypes = ["red", "green", "blue", "orange", "yellow", "cyan", "purple", "pink"];
  const teamASpawns = CHOP_WOOD_SPAWNS_A;
  const teamBSpawns = CHOP_WOOD_SPAWNS_B;

  for (let i = 0; i < 3; i += 1) {
    const isPlayer = i === 0;
    const characterType = isPlayer ? state.selectedCharacter : botTypes[Math.floor(Math.random() * botTypes.length)];
    const label = characterType.charAt(0).toUpperCase() + characterType.slice(1);
    const name = isPlayer ? label : randomBotName();
    const fighter = makeFighter({
      id: i,
      name,
      characterType,
      isPlayer,
      position: teamASpawns[i],
      yaw: 0,
    });
    fighter.team = "a";
    addTeamMarker(fighter, "a");
    const axeInd = createAxeIndicator();
    axeInd.position.set(0, 3.9, 0);
    fighter.mesh.add(axeInd);
    fighter.axeIndicator = axeInd;
    state.players.push(fighter);
  }

  for (let i = 0; i < 3; i += 1) {
    const characterType = botTypes[Math.floor(Math.random() * botTypes.length)];
    const label = characterType.charAt(0).toUpperCase() + characterType.slice(1);
    const name = randomBotName();
    const fighter = makeFighter({
      id: i + 3,
      name,
      characterType,
      isPlayer: false,
      position: teamBSpawns[i],
      yaw: Math.PI,
    });
    fighter.team = "b";
    addTeamMarker(fighter, "b");
    const axeInd = createAxeIndicator();
    axeInd.position.set(0, 3.9, 0);
    fighter.mesh.add(axeInd);
    fighter.axeIndicator = axeInd;
    state.players.push(fighter);
  }
}

// ── Take Down ─────────────────────────────────────────────────────────
const TD_BOSS_HP = 120000;
const TD_TIME_LIMIT = 120;
const TD_RESPAWN_TIME = 5;
const TD_SCORE_DAMAGE = 1;
const TD_SCORE_LAST_HIT = 500;
const TD_SCORE_KILL = 200;

const tdHud = document.getElementById("takedown-hud");
const tdBossHpFill = document.getElementById("td-boss-hp-fill");
const tdBossHpText = document.getElementById("td-boss-hp-text");
const tdTimer = document.getElementById("td-timer");
const tdMyRank = document.getElementById("td-my-rank");
const tdMyScore = document.getElementById("td-my-score");
const tdRanking = document.getElementById("td-ranking");

function createBossMesh() {
  const bossGroup = createStickman(0x880000);
  bossGroup.scale.set(2.5, 2.5, 2.5);
  const crownMat = new THREE.MeshStandardMaterial({ color: 0xff2200, roughness: 0.4, metalness: 0.5 });
  const horns = new THREE.Group();
  const hornGeo = new THREE.ConeGeometry(0.15, 0.5, 6);
  const lh = new THREE.Mesh(hornGeo, crownMat);
  lh.position.set(-0.4, 2.4, 0);
  lh.rotation.z = 0.3;
  horns.add(lh);
  const rh = new THREE.Mesh(hornGeo, crownMat);
  rh.position.set(0.4, 2.4, 0);
  rh.rotation.z = -0.3;
  horns.add(rh);
  bossGroup.add(horns);
  return bossGroup;
}

function initTakeDownPlayers() {
  state.players.forEach((f) => { scene.remove(f.mesh); scene.remove(f.shadow); });
  state.players = [];
  Object.keys(mpNetFighters).forEach((k) => delete mpNetFighters[k]);

  const spawns = TD_SPAWNS.map(([x, y, z]) => new THREE.Vector3(x, y, z));
  // 탈락 캐릭터 제외
  const _tdAccount = loadAccount();
  const _tdEliminated = new Set(_tdAccount?.rotation?.eliminated ?? []);
  const allTypes = ["red", "green", "blue", "orange", "yellow", "cyan", "purple", "pink"]
    .filter((c) => !_tdEliminated.has(c));

  // 멀티 기준: 원격 플레이어 목록
  const remotePlayers = mpConfig
    ? mpConfig.players.filter((p) => p.id !== mp.myId)
    : [];

  // 봇 타입 풀: 미사용 타입 1개씩 → 나머지 슬롯은 랜덤(중복 없이)
  const botCount = Math.max(0, 7 - remotePlayers.length);
  const usedTypes = new Set([state.selectedCharacter, ...remotePlayers.map((p) => p.charType)]);
  const unusedTypes = allTypes.filter((c) => !usedTypes.has(c));
  for (let i = unusedTypes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unusedTypes[i], unusedTypes[j]] = [unusedTypes[j], unusedTypes[i]];
  }
  // 남은 슬롯: allTypes에서 아직 한 번도 안 나온 타입 우선, 그 다음 랜덤
  const botTypePool = [...unusedTypes];
  // 남은 슬롯: usedTypes 포함 전체에서 아직 botTypePool에 없는 타입 우선, 그 다음 무작위
  const notInPool = allTypes.filter((c) => !botTypePool.includes(c));
  for (let i = notInPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [notInPool[i], notInPool[j]] = [notInPool[j], notInPool[i]];
  }
  while (botTypePool.length < botCount) {
    botTypePool.push(notInPool.length > 0
      ? notInPool.shift()
      : allTypes[Math.floor(Math.random() * allTypes.length)]);
  }
  let botTypeIdx = 0;
  let spawnIdx = 0;

  function addFighter(opts) {
    const f = makeFighter({ ...opts, position: spawns[spawnIdx % spawns.length] });
    f.tdScore = 0; f.tdBossDmg = 0; f.tdKills = 0; f.tdRespawnAt = 0;
    state.players.push(f);
    spawnIdx++;
    return f;
  }

  // 로컬 플레이어
  addFighter({
    id: spawnIdx,
    name: state.selectedCharacter.charAt(0).toUpperCase() + state.selectedCharacter.slice(1),
    characterType: state.selectedCharacter,
    isPlayer: true,
    yaw: Math.random() * Math.PI * 2,
  });

  // 원격 플레이어
  for (const rp of remotePlayers) {
    const f = addFighter({
      id: spawnIdx,
      name: rp.nickname,
      characterType: rp.charType,
      isPlayer: false,
      yaw: Math.random() * Math.PI * 2,
    });
    f.isNetworkPlayer = true;
    f.networkId = rp.id;
    mpNetFighters[rp.id] = f;
  }

  // 봇 (8명 - 실제 플레이어 수)
  for (let i = 0; i < botCount; i++) {
    const characterType = botTypePool[botTypeIdx++];
    const f = addFighter({
      id: spawnIdx,
      name: randomBotName(),
      characterType,
      isPlayer: false,
      yaw: Math.random() * Math.PI * 2,
    });
    f.botDifficulty = Math.floor(Math.random() * 3);
  }

  // 보스
  const boss = makeFighter({
    id: 99,
    name: "BOSS",
    characterType: "red",
    isPlayer: false,
    position: new THREE.Vector3(0, 0, 0),
    yaw: 0,
  });
  scene.remove(boss.mesh);
  scene.remove(boss.shadow);
  boss.mesh = createBossMesh();
  boss.mesh.position.set(0, 1.85 * 2.5, 0);
  scene.add(boss.mesh);
  boss.shadow = new THREE.Mesh(
    new THREE.CircleGeometry(2.4, 16),
    new THREE.MeshBasicMaterial({ color: 0x20140f, transparent: true, opacity: 0.3 }),
  );
  boss.shadow.rotation.x = -Math.PI / 2;
  boss.shadow.position.set(0, 0.04, 0);
  scene.add(boss.shadow);
  boss.health = TD_BOSS_HP;
  boss.maxHealth = TD_BOSS_HP;
  boss.radius = 2.5;
  boss.isBoss = true;
  boss.isDummy = false;
  boss.bossAttackCd = 0;
  boss.bossNextSlam = 0;
  boss.bossNextCharge = 0;
  boss.bossNextWave = 0;
  boss.bossChargeTarget = null;
  boss.bossCharging = false;
  boss.bossRage = false;
  boss.bossRestUntil = 0;
  boss.bodyMaterials = boss.mesh.userData.bodyMaterials || [];
  boss.healthBar = createHealthBarMesh();
  boss.healthBar.position.set(0, 1.5, 0);
  boss.mesh.add(boss.healthBar);
  state.tdBoss = boss;
  state.players.push(boss);
}

function startTakeDown() {
  clock.getDelta();
  battleMapGroup.visible = true;
  trainingMapGroup.visible = false;
  chopWoodMapGroup.visible = false;
  state.chopWoodMode = false;
  state.teams = null;
  state.playerTeam = null;
  state.trainingMode = false;
  state.takedownMode = true;
  state.mode = "takedown";
  state.solids = state.battleSolids;
  state.lakeRects = state.battleLakeRects;
  state.bushes = state.battleBushes;

  createTakeDownMap();
  mapNameEl.textContent = "Take Down";
  mapNameEl.classList.remove("hidden");

  state.gameTime = 0;
  state.freezeUntil = 3;
  state.running = true;
  state.gameOver = false;
  state.winner = "";
  state.mouseHeld = false;
  state.scheduledHits = [];
  state.projectiles.forEach((p) => scene.remove(p.mesh));
  state.projectiles = [];
  state.deathOrder = [];
  state.effects.forEach((e) => scene.remove(e.mesh));
  state.effects = [];
  state.feedback.hitFlashUntil = 0;
  state.feedback.warningPulseUntil = 0;
  state.mouse.yaw = Math.PI;
  state.mouse.pitch = 0.26;
  state.mobileMove.x = 0;
  state.mobileMove.y = 0;
  state.mobileMove.active = false;
  state.mobileMove.pointerId = null;
  mobileJoystickThumb.style.transform = "translate(-50%, -50%)";
  state.safeCenter.set(0, 0);
  state.tdTimeLeft = TD_TIME_LIMIT;

  initTakeDownPlayers();
  rebuildAmmoPips();
  updateHud();
  tdHud.classList.remove("hidden");
  cwHud.classList.add("hidden");
  resultOverlay.style.display = "none";
  messageOverlay.style.display = "none";
}

function updateTakeDownHud() {
  if (!state.takedownMode || !state.tdBoss) return;
  const boss = state.tdBoss;
  const hpPct = Math.max(0, boss.health / boss.maxHealth) * 100;
  tdBossHpFill.style.width = `${hpPct}%`;
  tdBossHpText.textContent = `${Math.round(Math.max(0, boss.health))} / ${boss.maxHealth}`;

  const timeLeft = Math.max(0, state.tdTimeLeft);
  const mins = Math.floor(timeLeft / 60);
  const secs = Math.floor(timeLeft % 60);
  tdTimer.textContent = `${mins}:${secs.toString().padStart(2, "0")}`;

  const fighters = state.players.filter((f) => !f.isBoss);
  fighters.sort((a, b) => b.tdScore - a.tdScore);
  const player = getPlayer();
  const playerRank = fighters.findIndex((f) => f.isPlayer) + 1;
  tdMyRank.textContent = t("tdRank", playerRank);
  tdMyScore.textContent = t("tdScore", player ? player.tdScore : 0);

  let rankHtml = "";
  for (let i = 0; i < Math.min(5, fighters.length); i++) {
    const f = fighters[i];
    const isMe = f.isPlayer;
    rankHtml += `<div class="td-rank-row${isMe ? " me" : ""}">
      <span class="td-rank-pos">${i + 1}</span>
      <span class="td-rank-name">${f.name}</span>
      <span class="td-rank-score">${f.tdScore}</span>
    </div>`;
  }
  tdRanking.innerHTML = rankHtml;
}

function updateBossAI(dt) {
  const boss = state.tdBoss;
  if (!boss || boss.dead) return;
  if (state.tdTimeLeft > 110) return;
  if (state.gameTime < (boss.bossRestUntil || 0)) return;

  if (boss.health <= boss.maxHealth * 0.3 && !boss.bossRage) {
    boss.bossRage = true;
  }
  const speedMult = boss.bossRage ? 1.5 : 1.0;
  const cdMult = boss.bossRage ? 0.6 : 1.0;
  const dmgMult = boss.bossRage ? 1.4 : 1.0;

  const alivePlayers = state.players.filter((f) => !f.dead && !f.isBoss);
  if (alivePlayers.length === 0) return;

  let nearest = null;
  let nearDist = Infinity;
  for (const f of alivePlayers) {
    const d = Math.hypot(f.mesh.position.x - boss.mesh.position.x, f.mesh.position.z - boss.mesh.position.z);
    if (d < nearDist) { nearDist = d; nearest = f; }
  }
  if (!nearest) return;

  // 돌진 중
  if (boss.bossCharging && boss.bossChargeTarget) {
    const tx = boss.bossChargeTarget.x;
    const tz = boss.bossChargeTarget.z;
    const dx = tx - boss.mesh.position.x;
    const dz = tz - boss.mesh.position.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 2) {
      boss.bossCharging = false;
      boss.bossRestUntil = state.gameTime + 1.5 * cdMult;
      // 돌진 도착 — 근처 플레이어에게 피해
      for (const f of alivePlayers) {
        const fd = Math.hypot(f.mesh.position.x - boss.mesh.position.x, f.mesh.position.z - boss.mesh.position.z);
        if (fd < 4) applyDamage(f, Math.round(2000 * dmgMult), boss);
      }
    } else {
      const speed = 18 * speedMult;
      const mx = (dx / dist) * speed * dt;
      const mz = (dz / dist) * speed * dt;
      boss.mesh.position.x += mx;
      boss.mesh.position.z += mz;
      boss.shadow.position.x = boss.mesh.position.x;
      boss.shadow.position.z = boss.mesh.position.z;
      boss.mesh.rotation.y = Math.atan2(dx, dz);
    }
    return;
  }

  // 보스 이동 (느리게 가장 가까운 플레이어 추적)
  const dx = nearest.mesh.position.x - boss.mesh.position.x;
  const dz = nearest.mesh.position.z - boss.mesh.position.z;
  if (nearDist > 3) {
    const speed = 1 * speedMult;
    const nx = (dx / nearDist) * speed * dt;
    const nz = (dz / nearDist) * speed * dt;
    boss.mesh.position.x += nx;
    boss.mesh.position.z += nz;
    boss.shadow.position.x = boss.mesh.position.x;
    boss.shadow.position.z = boss.mesh.position.z;
  }
  boss.mesh.rotation.y = Math.atan2(dx, dz);

  // ① 근접 내려찍기
  if (state.gameTime >= boss.bossNextSlam && nearDist < 5) {
    boss.bossNextSlam = state.gameTime + 3 * cdMult;
    boss.bossRestUntil = state.gameTime + 1.2 * cdMult;
    for (const f of alivePlayers) {
      const fd = Math.hypot(f.mesh.position.x - boss.mesh.position.x, f.mesh.position.z - boss.mesh.position.z);
      if (fd < 5) applyDamage(f, Math.round(3000 * dmgMult), boss);
    }
    // 이펙트
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.5, 5, 24),
      new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(boss.mesh.position.x, 0.15, boss.mesh.position.z);
    scene.add(ring);
    state.effects.push({ mesh: ring, life: 0.5, maxLife: 0.5, type: "frostRing" });
  }

  // ② 돌진
  if (state.gameTime >= boss.bossNextCharge && nearDist > 8) {
    boss.bossNextCharge = state.gameTime + 6 * cdMult;
    boss.bossCharging = true;
    boss.bossChargeTarget = nearest.mesh.position.clone();
  }

  // ③ 충격파
  if (state.gameTime >= boss.bossNextWave) {
    boss.bossNextWave = state.gameTime + 4.5 * cdMult;
    boss.bossRestUntil = state.gameTime + 0.8 * cdMult;
    const dir = new THREE.Vector3(dx, 0, dz).normalize();
    const waveMat = new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.6, depthWrite: false });
    const wave = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8), waveMat);
    wave.position.set(boss.mesh.position.x + dir.x * 3, 2, boss.mesh.position.z + dir.z * 3);
    scene.add(wave);
    state.projectiles.push({
      mesh: wave,
      x: wave.position.x,
      z: wave.position.z,
      dx: dir.x,
      dz: dir.z,
      speed: 14,
      range: 20,
      distTravelled: 0,
      damage: Math.round(1500 * dmgMult),
      ownerId: boss.id,
      ownerTeam: null,
      type: "bossWave",
      radius: 1.5,
    });
  }
}

function updateTakeDownRespawn() {
  if (!state.takedownMode) return;
  for (const fighter of state.players) {
    if (!fighter.dead || fighter.isBoss) continue;
    if (fighter.tdRespawnAt && state.gameTime >= fighter.tdRespawnAt) {
      fighter.dead = false;
      fighter.health = fighter.maxHealth;
      fighter.mesh.visible = true;
      fighter.shadow.visible = true;
      fighter.healthBar.visible = true;
      const spawn = TD_SPAWNS[Math.floor(Math.random() * TD_SPAWNS.length)];
      fighter.mesh.position.set(spawn[0], 1.85, spawn[2]);
      fighter.shadow.position.set(fighter.mesh.position.x, 0.04, fighter.mesh.position.z);
      fighter.tdRespawnAt = 0;
    }
  }
}

function checkTakeDownEnd() {
  if (!state.takedownMode || state.gameOver) return;

  const boss = state.tdBoss;
  const bossKilled = boss && boss.dead;
  const timeUp = state.tdTimeLeft <= 0;

  if (bossKilled || timeUp) {
    state.gameOver = true;
    state.running = false;

    const fighters = state.players.filter((f) => !f.isBoss);
    fighters.sort((a, b) => b.tdScore - a.tdScore);
    const player = getPlayer();
    const playerRank = fighters.findIndex((f) => f.isPlayer) + 1;

    const coinRewards = [150, 100, 80, 60, 40, 30, 20, 10];
    const coinsEarned = coinRewards[playerRank - 1] || 10;
    const account = loadAccount();
    let rotationMsg = "";
    if (account) {
      account.coins = (account.coins || 0) + coinsEarned;

      if (account.rotation) {
        fighters.forEach((f, idx) => {
          const rank = idx + 1;
          const charKey = f.characterType;
          const cs = account.rotation.stats[charKey];
          if (!cs) return;
          cs.games += 1;
          if (rank <= 4) cs.wins += 1;
          if (rank === 1) cs.mvp += 1;
          cs.bossDmg += f.tdBossDmg || 0;
        });
        account.coins += ROTATION_PARTICIPATION_REWARD.coins;
        account.trophies = (account.trophies || 0) + ROTATION_PARTICIPATION_REWARD.trophies;
        const beforeChampion = account.rotation.champion;
        processRotationRounds(account);
        if (!beforeChampion && account.rotation.champion) {
          rotationMsg = t("rotationWinMsg", account.rotation.champion);
        }
      }
      saveAccount(account);
    }

    const resultTag = playerRank <= 4 ? t("tdWin") : t("tdLose");
    resultTitle.textContent = bossKilled ? "💀 BOSS DOWN!" : t("tdTimeUp");
    resultBody.textContent = t("tdResultBody", resultTag, playerRank, player ? player.tdScore : 0, coinsEarned, rotationMsg);
    const statsLines = [];
    if (player) {
      statsLines.push(t("tdBossDmg", player.tdBossDmg));
      statsLines.push(t("tdKills", player.tdKills));
    }
    resultStats.textContent = statsLines.join("  |  ");
    resultStreak.style.display = "none";
    resultOverlay.style.display = "flex";
    tdHud.classList.add("hidden");
    tdMapOverlay.classList.add("hidden");
    tdMapOpen = false;
    document.exitPointerLock?.();
    // 멀티플레이어 종료 정리
    if (mpConfig) {
      mp.disconnect();
      mpConfig = null;
    }
  }
}

// ── Multiplayer sync ─────────────────────────────────────────────────────
function syncMp(dt) {
  mpLastSync += dt;
  if (mpLastSync < MP_SYNC_INTERVAL) return;
  mpLastSync = 0;

  const player = getPlayer();
  if (player) {
    mp.relay("PSTATE", {
      x: player.mesh.position.x,
      z: player.mesh.position.z,
      yaw: player.mesh.rotation.y,
      health: player.health,
      dead: !!player.dead,
    });
  }
  if (mpConfig.isHost && state.tdBoss) {
    const b = state.tdBoss;
    mp.relay("BSTATE", {
      x: b.mesh.position.x,
      z: b.mesh.position.z,
      health: b.health,
      dead: !!b.dead,
    });
  }
}

function setupMpHandlers() {
  mp.on("RELAY", (msg) => {
    if (msg.relayType === "PSTATE") {
      const f = mpNetFighters[msg.fromId];
      if (!f) return;
      f.mesh.position.x = msg.x;
      f.mesh.position.z = msg.z;
      f.mesh.position.y = 1.85;
      f.shadow.position.x = msg.x;
      f.shadow.position.z = msg.z;
      f.mesh.rotation.y = msg.yaw;
      f.health = msg.health;
      if (msg.dead && !f.dead) { f.dead = true; f.mesh.visible = false; f.shadow.visible = false; if (f.healthBar) f.healthBar.visible = false; }
      if (!msg.dead && f.dead) { f.dead = false; f.mesh.visible = true; f.shadow.visible = true; if (f.healthBar) f.healthBar.visible = true; }
    } else if (msg.relayType === "BSTATE" && !mpConfig?.isHost) {
      const b = state.tdBoss;
      if (!b) return;
      b.mesh.position.x = msg.x;
      b.mesh.position.z = msg.z;
      b.shadow.position.x = msg.x;
      b.shadow.position.z = msg.z;
      b.health = msg.health;
      if (msg.dead && !b.dead) { b.dead = true; }
    }
  });

  mp.on("PLAYER_LEFT", ({ playerId }) => {
    const f = mpNetFighters[playerId];
    if (f) {
      f.isNetworkPlayer = false;
      f.botDifficulty = 1;
    }
    delete mpNetFighters[playerId];
  });

  mp.on("DISCONNECTED", () => {
    Object.values(mpNetFighters).forEach((f) => { f.isNetworkPlayer = false; f.botDifficulty = 1; });
    Object.keys(mpNetFighters).forEach((k) => delete mpNetFighters[k]);
    mpConfig = null;
  });
}

function updateMatchmakingUI() {
  const list = mp.roomPlayers;
  matchmakingStatus.textContent = t("mmWaiting", list.length);
  matchmakingPlayersList.innerHTML = list.map((p) => `
    <div class="mm-player-row${p.id === mp.myId ? " me" : ""}">
      <span class="mm-player-name">${p.nickname}${p.id === mp.myId ? ` ${t("mmMe")}` : ""}</span>
      <span class="mm-player-char">${p.charType}</span>
    </div>`).join("");
}

async function enterMatchmaking() {
  const account = loadAccount();
  if (!account) return;

  matchmakingOverlay.classList.remove("hidden");
  matchmakingStatus.textContent = t("mmConnecting");
  matchmakingCountdown.classList.add("hidden");
  matchmakingCountdown.textContent = "";
  matchmakingPlayersList.innerHTML = "";

  try {
    await mp.connect(account.nickname, state.selectedCharacter);
  } catch (e) {
    matchmakingStatus.textContent = t("mmConnFail", e.message);
    return;
  }

  updateMatchmakingUI();

  mp.on("ROOM_JOINED", () => updateMatchmakingUI());
  mp.on("PLAYER_JOINED", () => updateMatchmakingUI());
  mp.on("PLAYER_LEFT", () => updateMatchmakingUI());

  mp.on("COUNTDOWN", ({ seconds }) => {
    matchmakingCountdown.classList.remove("hidden");
    matchmakingCountdown.textContent = seconds > 0 ? t("mmCountdown", seconds) : t("mmCountdownGo");
  });

  mp.on("COUNTDOWN_CANCELLED", () => {
    matchmakingCountdown.classList.add("hidden");
    matchmakingCountdown.textContent = "";
    updateMatchmakingUI();
  });

  mp.on("GAME_START", async (data) => {
    matchmakingOverlay.classList.add("hidden");
    mpConfig = { players: data.players, isHost: data.isHost, hostId: data.hostId };
    setupMpHandlers();
    await initAudio();
    rotationOverlay.classList.add("hidden");
    modeSelector.classList.add("hidden");
    startBattleBtn.classList.remove("hidden");
    startTakeDown();
  });

  mp.on("DISCONNECTED", () => {
    matchmakingStatus.textContent = t("mmDisconnected");
  });
}

function startChopWood() {
  clock.getDelta();
  battleMapGroup.visible = false;
  trainingMapGroup.visible = false;
  chopWoodMapGroup.visible = true;
  state.chopWoodMode = true;
  state.trainingMode = false;
  state.mode = "chopwood";
  mapNameEl.textContent = t("chopWood");
  mapNameEl.classList.remove("hidden");

  state.gameTime = 0;
  state.freezeUntil = 5;
  state.running = true;
  state.gameOver = false;
  state.winner = "";
  state.mouseHeld = false;
  state.scheduledHits = [];
  state.projectiles.forEach((p) => scene.remove(p.mesh));
  state.projectiles = [];
  state.deathOrder = [];
  state.effects.forEach((effect) => scene.remove(effect.mesh));
  state.effects = [];
  state.feedback.hitFlashUntil = 0;
  state.feedback.warningPulseUntil = 0;
  state.mouse.yaw = Math.PI;
  state.mouse.pitch = 0.26;
  state.mobileMove.x = 0;
  state.mobileMove.y = 0;
  state.mobileMove.active = false;
  state.mobileMove.pointerId = null;
  mobileJoystickThumb.style.transform = "translate(-50%, -50%)";
  state.safeCenter.set(0, 0);

  createChopWoodMap();

  state.solids = state.battleSolids;
  state.lakeRects = state.battleLakeRects;
  state.bushes = state.battleBushes;

  initChopWoodPlayers();
  rebuildAmmoPips();
  updateHud();
  resultOverlay.style.display = "none";
  messageOverlay.style.display = "none";
}

const zoneRing = (() => {
  const geometry = new THREE.RingGeometry(0.96, 1.0, 96);
  const material = new THREE.MeshBasicMaterial({
    color: 0x5dea6a,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
  });
  const ring = new THREE.Mesh(geometry, material);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.08;
  scene.add(ring);

  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, 12, 96, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x4ac75a,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
    }),
  );
  wall.position.y = 6;
  scene.add(wall);
  return { ring, wall };
})();

const attackAimIndicator = createAttackAimIndicator();

function createGreenAimIndicator() {
  const group = new THREE.Group();
  const range = CHARACTERS.green.boomerangRange;
  const halfAngle = Math.PI / 6; // 30° = half of 60°

  // Fan fill (ShapeGeometry in XZ plane via rotation)
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  const segments = 24;
  for (let i = 0; i <= segments; i += 1) {
    const a = -halfAngle + (i / segments) * halfAngle * 2;
    shape.lineTo(Math.sin(a) * range, Math.cos(a) * range);
  }
  shape.lineTo(0, 0);
  const fanMesh = new THREE.Mesh(
    new THREE.ShapeGeometry(shape),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.13,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  fanMesh.rotation.x = Math.PI / 2;
  fanMesh.position.y = 0.08;
  group.add(fanMesh);

  // Arc outline
  const arcPts = [];
  for (let i = 0; i <= 32; i += 1) {
    const a = -halfAngle + (i / 32) * halfAngle * 2;
    arcPts.push(new THREE.Vector3(Math.sin(a) * range, 0.09, Math.cos(a) * range));
  }
  const arcLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(arcPts),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 }),
  );
  group.add(arcLine);

  // Side lines
  [-halfAngle, halfAngle].forEach((a) => {
    const sideLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.09, 0),
        new THREE.Vector3(Math.sin(a) * range, 0.09, Math.cos(a) * range),
      ]),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 }),
    );
    group.add(sideLine);
  });

  group.renderOrder = 4;
  group.visible = false;
  group.userData = { fanMesh };
  scene.add(group);
  return group;
}

const greenAimIndicator = createGreenAimIndicator();

function createBlueAimIndicator() {
  const group = new THREE.Group();
  const range = CHARACTERS.blue.bulletRange;

  const beam = new THREE.Mesh(
    new THREE.PlaneGeometry(1, range),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  beam.rotation.x = -Math.PI / 2;
  beam.position.set(0, 0.08, range * 0.5);
  group.add(beam);

  // 사거리 끝 원형 마커
  const dot = new THREE.Mesh(
    new THREE.CircleGeometry(0.3, 12),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.50,
      depthWrite: false,
    }),
  );
  dot.rotation.x = -Math.PI / 2;
  dot.position.set(0, 0.08, range);
  group.add(dot);

  group.renderOrder = 4;
  group.visible = false;
  group.userData = { beam, dot };
  scene.add(group);
  return group;
}

function createOrangeAimIndicator() {
  const group = new THREE.Group();
  const range = CHARACTERS.orange.bombRange;

  const beam = new THREE.Mesh(
    new THREE.PlaneGeometry(1, range),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  beam.rotation.x = -Math.PI / 2;
  beam.position.set(0, 0.08, range * 0.5);
  group.add(beam);

  const dot = new THREE.Mesh(
    new THREE.CircleGeometry(0.4, 12),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    }),
  );
  dot.rotation.x = -Math.PI / 2;
  dot.position.set(0, 0.08, range);
  group.add(dot);

  group.renderOrder = 4;
  group.visible = false;
  group.userData = { beam, dot };
  scene.add(group);
  return group;
}

const blueAimIndicator = createBlueAimIndicator();
const orangeAimIndicator = createOrangeAimIndicator();

function createYellowAimIndicator() {
  const group = new THREE.Group();
  const range = CHARACTERS.yellow.electricRange;

  const beam = new THREE.Mesh(
    new THREE.PlaneGeometry(1, range),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  beam.rotation.x = -Math.PI / 2;
  beam.position.set(0, 0.08, range * 0.5);
  group.add(beam);

  const dot = new THREE.Mesh(
    new THREE.CircleGeometry(0.3, 12),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    }),
  );
  dot.rotation.x = -Math.PI / 2;
  dot.position.set(0, 0.08, range);
  group.add(dot);

  group.renderOrder = 4;
  group.visible = false;
  group.userData = { beam, dot };
  scene.add(group);
  return group;
}

const yellowAimIndicator = createYellowAimIndicator();

function createCyanAimIndicator() {
  const group = new THREE.Group();
  const range = CHARACTERS.cyan.spreadLineRange;
  const totalWidth = (CHARACTERS.cyan.spreadLineCount - 1) * CHARACTERS.cyan.spreadLineSpacing;

  const beam = new THREE.Mesh(
    new THREE.PlaneGeometry(totalWidth, range),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  beam.rotation.x = -Math.PI / 2;
  beam.position.set(0, 0.08, range * 0.5);
  group.add(beam);

  const dot = new THREE.Mesh(
    new THREE.PlaneGeometry(totalWidth, 0.3),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    }),
  );
  dot.rotation.x = -Math.PI / 2;
  dot.position.set(0, 0.08, range);
  group.add(dot);

  group.renderOrder = 4;
  group.visible = false;
  group.userData = { beam, dot };
  scene.add(group);
  return group;
}

const cyanAimIndicator = createCyanAimIndicator();

function createPurpleAimIndicator() {
  const group = new THREE.Group();
  const range = CHARACTERS.purple.needleRange;
  const splashR = CHARACTERS.purple.vialSplashRadius;

  const beam = new THREE.Mesh(
    new THREE.PlaneGeometry(0.4, range),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  beam.rotation.x = -Math.PI / 2;
  beam.position.set(0, 0.08, range * 0.5);
  group.add(beam);

  const ringGeo = new THREE.RingGeometry(splashR - 0.12, splashR, 24);
  const ring = new THREE.Mesh(
    ringGeo,
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(0, 0.08, range);
  group.add(ring);

  const fill = new THREE.Mesh(
    new THREE.CircleGeometry(splashR, 24),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
    }),
  );
  fill.rotation.x = -Math.PI / 2;
  fill.position.set(0, 0.07, range);
  group.add(fill);

  const dot = new THREE.Mesh(
    new THREE.CircleGeometry(0.3, 12),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    }),
  );
  dot.rotation.x = -Math.PI / 2;
  dot.position.set(0, 0.08, range);
  dot.visible = false;
  group.add(dot);

  group.renderOrder = 4;
  group.visible = false;
  group.userData = { beam, ring, fill, dot };
  scene.add(group);
  return group;
}

const purpleAimIndicator = createPurpleAimIndicator();

function createPinkAimIndicator() {
  const group = new THREE.Group();
  const range = CHARACTERS.pink.healCircleRange;

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(range - 0.12, range, 32),
    new THREE.MeshBasicMaterial({ color: 0xFF69B4, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(0, 0.08, 0);
  group.add(ring);

  const fill = new THREE.Mesh(
    new THREE.CircleGeometry(range, 32),
    new THREE.MeshBasicMaterial({ color: 0xFF88CC, transparent: true, opacity: 0.06, depthWrite: false }),
  );
  fill.rotation.x = -Math.PI / 2;
  fill.position.set(0, 0.07, 0);
  group.add(fill);

  group.renderOrder = 4;
  group.visible = false;
  group.userData = { ring, fill };
  scene.add(group);
  return group;
}

const pinkAimIndicator = createPinkAimIndicator();

function rebuildAmmoPips() {
  const player = getPlayer();
  const count = player?.maxAmmo ?? maxAmmo;
  ammoPips.innerHTML = "";
  const spread = 64;
  const step = count > 1 ? spread / (count - 1) : 0;
  for (let i = 0; i < count; i += 1) {
    const pip = document.createElement("div");
    pip.className = "ammo-fan-segment filled";
    const angle = count > 1 ? -spread / 2 + i * step : 0;
    pip.style.transform = `rotate(${angle}deg)`;
    ammoPips.appendChild(pip);
  }
}

function updateAmmoPips(value) {
  [...ammoPips.children].forEach((pip, index) => {
    pip.classList.toggle("filled", index < value);
  });
}

function formatTime(seconds) {
  const clamped = Math.max(0, Math.ceil(seconds));
  const minutes = `${Math.floor(clamped / 60)}`.padStart(2, "0");
  const secs = `${clamped % 60}`.padStart(2, "0");
  return `${minutes}:${secs}`;
}

function addKillFeed(text, attackerColor, targetColor) {
  const item = document.createElement("div");
  item.className = "kill-item";
  if (attackerColor || targetColor) {
    item.innerHTML = text;
  } else {
    item.textContent = text;
  }
  killFeed.prepend(item);
  if (killFeed.children.length > 6) {
    killFeed.lastChild?.remove();
  }
  window.setTimeout(() => item.remove(), 5200);
}

function flashHitMarker() {
  hitMarker.classList.remove("flash");
  void hitMarker.offsetWidth;
  hitMarker.classList.add("flash");
}

function showDamageTakenIndicator(amount) {
  damageTakenIndicator.textContent = `-${Math.round(amount)}`;
  damageTakenIndicator.classList.remove("flash");
  void damageTakenIndicator.offsetWidth;
  damageTakenIndicator.classList.add("flash");
}

function createAttackEffect(attacker, hitIndex) {
  const tilt = (hitIndex === 0 ? -20 : 20) * (Math.PI / 180);
  const effectYaw = attacker.yaw + tilt;

  const fwdDist = attackDepth * 0.55;
  const cx = attacker.mesh.position.x + Math.sin(attacker.yaw) * fwdDist;
  const cz = attacker.mesh.position.z + Math.cos(attacker.yaw) * fwdDist;

  const fist = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 8, 6),
    new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.9 }),
  );
  fist.position.set(cx, 1.2, cz);
  scene.add(fist);
  state.effects.push({ mesh: fist, life: 0.18, maxLife: 0.18, type: "fist" });

  const impact = new THREE.Mesh(
    new THREE.RingGeometry(0.3, 0.6, 12),
    new THREE.MeshBasicMaterial({
      color: hitIndex === 0 ? 0xffcb66 : 0xff8d57,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  impact.rotation.y = effectYaw;
  impact.rotation.x = Math.PI / 2;
  impact.position.set(cx, 1.2, cz);
  scene.add(impact);
  state.effects.push({ mesh: impact, life: 0.25, maxLife: 0.25, type: "punchImpact" });

  const burst = new THREE.Mesh(
    new THREE.PlaneGeometry(1.6, 1.6),
    new THREE.MeshBasicMaterial({
      color: 0xffee88,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  burst.rotation.set(0, effectYaw, (hitIndex === 0 ? -1 : 1) * 0.4);
  burst.position.set(cx, 1.2, cz);
  scene.add(burst);
  state.effects.push({ mesh: burst, life: 0.12, maxLife: 0.12, type: "punchBurst" });
}

function createHitSpark(position) {
  const spark = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.36, 0),
    new THREE.MeshBasicMaterial({ color: 0xffe388, transparent: true, opacity: 0.92 }),
  );
  spark.position.copy(position);
  scene.add(spark);
  state.effects.push({
    mesh: spark,
    life: 0.18,
    maxLife: 0.18,
    type: "spark",
  });
}

function createBombExplosionEffect(x, z) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.3, 0.5, 24),
    new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(x, 0.2, z);
  scene.add(ring);
  state.effects.push({ mesh: ring, life: 0.35, maxLife: 0.35, type: "bombRing" });

  const flash = new THREE.Mesh(
    new THREE.CircleGeometry(1.2, 16),
    new THREE.MeshBasicMaterial({ color: 0xffaa33, transparent: true, opacity: 0.5, depthWrite: false }),
  );
  flash.rotation.x = -Math.PI / 2;
  flash.position.set(x, 0.15, z);
  scene.add(flash);
  state.effects.push({ mesh: flash, life: 0.2, maxLife: 0.2, type: "bombFlash" });
}

function createElectricHitEffect(x, z) {
  const flash = new THREE.Mesh(
    new THREE.CircleGeometry(0.6, 12),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false }),
  );
  flash.rotation.x = -Math.PI / 2;
  flash.position.set(x, 0.25, z);
  scene.add(flash);
  state.effects.push({ mesh: flash, life: 0.08, maxLife: 0.08, type: "electricFlash" });

  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.random() * 0.5;
    const points = [new THREE.Vector3(0, 0, 0)];
    const len = 0.8 + Math.random() * 0.6;
    const segs = 3 + Math.floor(Math.random() * 2);
    for (let s = 1; s <= segs; s++) {
      const t = s / segs;
      const jx = (Math.random() - 0.5) * 0.4;
      const jz = (Math.random() - 0.5) * 0.4;
      points.push(new THREE.Vector3(
        Math.cos(angle) * len * t + jx,
        0,
        Math.sin(angle) * len * t + jz,
      ));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(
      geo,
      new THREE.LineBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.9, linewidth: 2 }),
    );
    line.position.set(x, 1.3, z);
    scene.add(line);
    state.effects.push({ mesh: line, life: 0.18, maxLife: 0.18, type: "electricBolt" });
  }

  for (let i = 0; i < 5; i++) {
    const spark = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 4, 4),
      new THREE.MeshBasicMaterial({ color: 0xffff88, transparent: true, opacity: 0.9, depthWrite: false }),
    );
    const a = Math.random() * Math.PI * 2;
    const r = 0.3 + Math.random() * 0.5;
    spark.position.set(x + Math.cos(a) * r, 1.0 + Math.random() * 0.6, z + Math.sin(a) * r);
    scene.add(spark);
    state.effects.push({
      mesh: spark, life: 0.2 + Math.random() * 0.1, maxLife: 0.3, type: "electricSpark",
      vx: Math.cos(a) * 3, vy: 2 + Math.random() * 2, vz: Math.sin(a) * 3,
    });
  }
}

function createBoomerangHitEffect(x, z) {
  const slash = new THREE.Mesh(
    new THREE.RingGeometry(0.3, 0.5, 4),
    new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false }),
  );
  slash.rotation.x = -Math.PI / 2;
  slash.position.set(x, 0.2, z);
  scene.add(slash);
  state.effects.push({ mesh: slash, life: 0.2, maxLife: 0.2, type: "boomerangHit" });
}

function createBulletHitEffect(x, z) {
  const flash = new THREE.Mesh(
    new THREE.CircleGeometry(0.3, 8),
    new THREE.MeshBasicMaterial({ color: 0x6666ff, transparent: true, opacity: 0.8, depthWrite: false }),
  );
  flash.rotation.x = -Math.PI / 2;
  flash.position.set(x, 0.2, z);
  scene.add(flash);
  state.effects.push({ mesh: flash, life: 0.15, maxLife: 0.15, type: "bulletHit" });
}

function createSpreadLineHitEffect(x, z) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.15, 0.3, 8),
    new THREE.MeshBasicMaterial({ color: 0x0ff0fe, transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(x, 0.2, z);
  scene.add(ring);
  state.effects.push({ mesh: ring, life: 0.18, maxLife: 0.18, type: "spreadHit" });
}

function createNeedleHitEffect(x, z) {
  const puff = new THREE.Mesh(
    new THREE.CircleGeometry(0.35, 8),
    new THREE.MeshBasicMaterial({ color: 0x800080, transparent: true, opacity: 0.6, depthWrite: false }),
  );
  puff.rotation.x = -Math.PI / 2;
  puff.position.set(x, 0.2, z);
  scene.add(puff);
  state.effects.push({ mesh: puff, life: 0.3, maxLife: 0.3, type: "needleHit" });
}

function createDamagePopup(position, amount, color = "#ffd27a") {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  ctx.font = "bold 40px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 6;
  ctx.strokeStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillStyle = color;
  const prefix = color === "#ff5c5c" ? "-" : "";
  const text = `${prefix}${Math.round(amount)}`;
  ctx.strokeText(text, 64, 32);
  ctx.fillText(text, 64, 32);

  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }),
  );
  sprite.scale.set(1.4, 0.7, 1);
  sprite.position.copy(position);
  sprite.position.y += 3.6;
  sprite.position.x += (Math.random() - 0.5) * 0.6;
  scene.add(sprite);
  state.effects.push({
    mesh: sprite,
    life: 0.7,
    maxLife: 0.7,
    type: "damagePopup",
  });
}

function initPlayers() {
  state.players.forEach((fighter) => {
    scene.remove(fighter.mesh);
    scene.remove(fighter.shadow);
  });
  state.players = [];

  const mapData = MAP_POOL[state.currentMapId];
  const spawns = mapData.spawns.map(([x, y, z]) => new THREE.Vector3(x, y, z));

  spawns.forEach((spawn, index) => {
    const botTypes = ["red", "green", "blue", "orange", "yellow", "cyan", "purple", "pink"];
    const characterType = index === 0 ? state.selectedCharacter : botTypes[Math.floor(Math.random() * botTypes.length)];
    const label = characterType.charAt(0).toUpperCase() + characterType.slice(1);
    const name = index === 0 ? label : randomBotName();
    const fighter = makeFighter({
      id: index,
      name,
      characterType,
      isPlayer: index === 0,
      position: spawn,
      yaw: Math.random() * Math.PI * 2,
    });
    if (!fighter.isPlayer) {
      fighter.botDifficulty = Math.floor(Math.random() * 3);
    }
    state.players.push(fighter);
  });
}

function initTrainingPlayers() {
  state.players.forEach((fighter) => {
    scene.remove(fighter.mesh);
    scene.remove(fighter.shadow);
  });
  state.players = [];

  // 플레이어
  const characterType = state.selectedCharacter;
  const label = characterType.charAt(0).toUpperCase() + characterType.slice(1);
  const player = makeFighter({
    id: 0,
    name: label,
    characterType,
    isPlayer: true,
    position: new THREE.Vector3(0, 0, 25),
    yaw: Math.PI,
  });
  state.players.push(player);

  // 거대 로봇 (HP 150,000, 스케일 2)
  const giant = makeFighter({
    id: 1,
    name: "거대 로봇",
    characterType: "red",
    isPlayer: false,
    position: new THREE.Vector3(0, 0, -5),
    yaw: 0,
  });
  giant.isDummy = true;
  giant.health = 150000;
  giant.maxHealth = 150000;
  giant.radius = 2.1;
  giant.mesh.scale.set(2, 2, 2);
  giant.mesh.position.y = 3.7;
  giant.shadow.geometry.dispose();
  giant.shadow.geometry = new THREE.CircleGeometry(1.9, 16);
  state.players.push(giant);

  // 짤짝이 로봇 (HP 1,500) — 5열 × 4행
  let dummyId = 2;
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      const x = (col - 2) * 4;
      const z = -16 - row * 5;
      const small = makeFighter({
        id: dummyId,
        name: "짤짝이",
        characterType: "red",
        isPlayer: false,
        position: new THREE.Vector3(x, 0, z),
        yaw: 0,
          });
      small.isDummy = true;
      small.health = 1500;
      small.maxHealth = 1500;
      state.players.push(small);
      dummyId += 1;
    }
  }
}

function startTraining() {
  clock.getDelta();
  battleMapGroup.visible = false;
  trainingMapGroup.visible = true;
  state.solids = state.trainingSolids;
  state.lakeRects = [];
  state.bushes = [];
  state.trainingMode = true;
  mapNameEl.classList.add("hidden");
  state.gameTime = 0;
  state.freezeUntil = 0;
  state.running = true;
  state.gameOver = false;
  state.winner = "";
  state.mouseHeld = false;
  state.scheduledHits = [];
  state.projectiles.forEach((p) => scene.remove(p.mesh));
  state.projectiles = [];
  state.deathOrder = [];
  state.effects.forEach((effect) => scene.remove(effect.mesh));
  state.effects = [];
  state.feedback.hitFlashUntil = 0;
  state.feedback.warningPulseUntil = 0;
  state.mouse.yaw = Math.PI;
  state.mouse.pitch = 0.26;
  state.mobileMove.x = 0;
  state.mobileMove.y = 0;
  state.mobileMove.active = false;
  state.mobileMove.pointerId = null;
  mobileJoystickThumb.style.transform = "translate(-50%, -50%)";
  state.safeCenter.set(0, 0);
  initTrainingPlayers();
  rebuildAmmoPips();
  updateHud();
  resultOverlay.style.display = "none";
  messageOverlay.style.display = "none";
}

function exitTraining() {
  state.running = false;
  state.gameOver = true;
  state.trainingMode = false;
  state.mouseHeld = false;
  battleMapGroup.visible = false;
  trainingMapGroup.visible = false;
  mapNameEl.classList.add("hidden");
  exitTrainingBtn.classList.add("hidden");

  state.players.forEach((fighter) => {
    scene.remove(fighter.mesh);
    scene.remove(fighter.shadow);
  });
  state.players = [];
  state.projectiles.forEach((p) => scene.remove(p.mesh));
  state.projectiles = [];
  state.effects.forEach((effect) => {
    scene.remove(effect.mesh);
    if (effect.type === "damagePopup") {
      effect.mesh.material.map.dispose();
      effect.mesh.material.dispose();
    }
  });
  state.effects = [];

  document.exitPointerLock?.();
  showLobby();
}

function resetGame() {
  clock.getDelta();
  battleMapGroup.visible = true;
  trainingMapGroup.visible = false;
  chopWoodMapGroup.visible = false;
  state.chopWoodMode = false;
  state.takedownMode = false;
  state.tdBoss = null;
  tdHud.classList.add("hidden");
  state.teams = null;
  state.playerTeam = null;
  state.solids = state.battleSolids;
  state.lakeRects = state.battleLakeRects;
  state.bushes = state.battleBushes;
  state.trainingMode = false;
  const currentMap = MAP_POOL[state.currentMapId];
  mapNameEl.textContent = t("mapPrefix") + currentMap.name;
  mapNameEl.classList.remove("hidden");
  state.gameTime = 0;
  state.freezeUntil = 5;
  state.running = true;
  state.gameOver = false;
  state.winner = "";
  state.mouseHeld = false;
  state.scheduledHits = [];
  state.projectiles.forEach((p) => scene.remove(p.mesh));
  state.projectiles = [];
  state.deathOrder = [];
  state.effects.forEach((effect) => scene.remove(effect.mesh));
  state.effects = [];
  state.feedback.hitFlashUntil = 0;
  state.feedback.warningPulseUntil = 0;
  state.mouse.yaw = Math.PI;
  state.mouse.pitch = 0.26;
  state.mobileMove.x = 0;
  state.mobileMove.y = 0;
  state.mobileMove.active = false;
  state.mobileMove.pointerId = null;
  mobileJoystickThumb.style.transform = "translate(-50%, -50%)";
  state.safeCenter.set(0, 0);
  initPlayers();
  rebuildAmmoPips();
  updateHud();
  resultOverlay.style.display = "none";
  messageOverlay.style.display = "none";
}

function getPlayer() {
  return state.players[0];
}

function clampToWorld(position, radius) {
  const dist = Math.hypot(position.x, position.z);
  const maxDist = worldRadius - radius;
  if (dist > maxDist) {
    const scale = maxDist / dist;
    position.x *= scale;
    position.z *= scale;
  }
}

function clampToZone(position, radius, zoneRadius) {
  const dx = position.x - state.safeCenter.x;
  const dz = position.z - state.safeCenter.y;
  const dist = Math.hypot(dx, dz);
  const maxDist = Math.max(0, zoneRadius - radius);
  if (dist > maxDist && dist > 0) {
    const scale = maxDist / dist;
    position.x = state.safeCenter.x + dx * scale;
    position.z = state.safeCenter.y + dz * scale;
  }
}

function intersectsRect(x, z, radius, rect) {
  const closestX = THREE.MathUtils.clamp(x, rect.minX, rect.maxX);
  const closestZ = THREE.MathUtils.clamp(z, rect.minZ, rect.maxZ);
  const dx = x - closestX;
  const dz = z - closestZ;
  return dx * dx + dz * dz < radius * radius;
}

function resolveMovementCollision(position, radius, zoneRadius = null) {
  clampToWorld(position, radius);

  if (zoneRadius !== null) {
    clampToZone(position, radius, zoneRadius);
  }

  for (const rect of state.lakeRects) {
    if (intersectsRect(position.x, position.z, radius, rect)) {
      const pushX = Math.min(Math.abs(position.x - rect.minX), Math.abs(position.x - rect.maxX));
      const pushZ = Math.min(Math.abs(position.z - rect.minZ), Math.abs(position.z - rect.maxZ));
      if (pushX < pushZ) {
        position.x = position.x < rect.x ? rect.minX - radius : rect.maxX + radius;
      } else {
        position.z = position.z < rect.z ? rect.minZ - radius : rect.maxZ + radius;
      }
    }
  }

  for (const solid of state.solids) {
    if (!intersectsRect(position.x, position.z, radius, solid)) {
      continue;
    }

    const left = Math.abs((solid.minX - radius) - position.x);
    const right = Math.abs((solid.maxX + radius) - position.x);
    const top = Math.abs((solid.minZ - radius) - position.z);
    const bottom = Math.abs((solid.maxZ + radius) - position.z);
    const minPush = Math.min(left, right, top, bottom);
    if (minPush === left) {
      position.x = solid.minX - radius;
    } else if (minPush === right) {
      position.x = solid.maxX + radius;
    } else if (minPush === top) {
      position.z = solid.minZ - radius;
    } else {
      position.z = solid.maxZ + radius;
    }
  }

  if (zoneRadius !== null) {
    clampToZone(position, radius, zoneRadius);
  }
}

function isWallAhead(fighter, dirX, dirZ, lookahead) {
  const len = Math.hypot(dirX, dirZ);
  if (len < 0.0001) {
    return false;
  }
  const checkX = fighter.mesh.position.x + (dirX / len) * lookahead;
  const checkZ = fighter.mesh.position.z + (dirZ / len) * lookahead;
  for (const solid of state.solids) {
    if (intersectsRect(checkX, checkZ, fighter.radius, solid)) return true;
  }
  for (const rect of state.lakeRects) {
    if (intersectsRect(checkX, checkZ, fighter.radius, rect)) return true;
  }
  return false;
}

function isPathBlocked(ax, az, bx, bz, radius) {
  const dx = bx - ax;
  const dz = bz - az;
  const len = Math.hypot(dx, dz);
  if (len < 0.1) return false;
  const step = Math.max(radius, 2);
  const steps = Math.ceil(len / step);
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const cx = ax + dx * t;
    const cz = az + dz * t;
    for (const solid of state.solids) {
      if (intersectsRect(cx, cz, radius, solid)) return true;
    }
    for (const rect of state.lakeRects) {
      if (intersectsRect(cx, cz, radius, rect)) return true;
    }
  }
  return false;
}

function findNavTarget(fighter, targetX, targetZ) {
  if (fighter._navUntil && state.gameTime < fighter._navUntil &&
      fighter._navGoalX === targetX && fighter._navGoalZ === targetZ) {
    return fighter._navResult;
  }
  const result = _computeNavTarget(fighter, targetX, targetZ);
  fighter._navUntil = state.gameTime + 0.4;
  fighter._navGoalX = targetX;
  fighter._navGoalZ = targetZ;
  fighter._navResult = result;
  return result;
}

function _computeNavTarget(fighter, targetX, targetZ) {
  const fx = fighter.mesh.position.x;
  const fz = fighter.mesh.position.z;
  const navRadius = fighter.radius * 0.85;
  if (!isPathBlocked(fx, fz, targetX, targetZ, navRadius)) {
    return { x: targetX, z: targetZ };
  }
  const pad = fighter.radius + 0.6;
  const searchRange = 25;
  let bestCorner = null;
  let bestScore = Infinity;
  const obstacles = state.solids.concat(state.lakeRects);
  for (const ob of obstacles) {
    if (Math.abs(ob.x - fx) > searchRange && Math.abs(ob.x - targetX) > searchRange) continue;
    if (Math.abs(ob.z - fz) > searchRange && Math.abs(ob.z - targetZ) > searchRange) continue;
    const corners = [
      { x: ob.minX - pad, z: ob.minZ - pad },
      { x: ob.maxX + pad, z: ob.minZ - pad },
      { x: ob.minX - pad, z: ob.maxZ + pad },
      { x: ob.maxX + pad, z: ob.maxZ + pad },
    ];
    for (const c of corners) {
      const distToCorner = Math.hypot(c.x - fx, c.z - fz);
      if (distToCorner < 1 || distToCorner > searchRange) continue;
      const cornerToTarget = Math.hypot(c.x - targetX, c.z - targetZ);
      const score = distToCorner + cornerToTarget;
      if (score >= bestScore) continue;
      if (isPathBlocked(fx, fz, c.x, c.z, navRadius)) continue;
      bestScore = score;
      bestCorner = c;
    }
  }
  return bestCorner || { x: targetX, z: targetZ };
}

function findWallEscapeDir(fighter, dirX, dirZ, lookahead) {
  if (!isWallAhead(fighter, dirX, dirZ, lookahead)) {
    return null;
  }
  const baseAngle = Math.atan2(dirX, dirZ);
  const step = Math.PI / 8;
  for (let i = 1; i <= 8; i++) {
    for (const sign of [1, -1]) {
      const angle = baseAngle + sign * step * i;
      const dx = Math.sin(angle);
      const dz = Math.cos(angle);
      if (!isWallAhead(fighter, dx, dz, lookahead)) {
        return { x: dx, z: dz };
      }
    }
  }
  return null;
}

function moveFighter(fighter, desiredMove, dt) {
  if (fighter.dead) {
    return;
  }

  const pos = fighter.mesh.position;
  const next = tempVec32.copy(pos);
  next.x += desiredMove.x * dt;
  next.z += desiredMove.z * dt;
  const zone = (fighter.isPlayer && !state.chopWoodMode && !state.trainingMode && !state.takedownMode) ? getCurrentZone() : null;
  resolveMovementCollision(next, fighter.radius, zone ? zone.radius : null);

  pos.x = next.x;
  pos.z = next.z;
  fighter.shadow.position.set(pos.x, 0.04, pos.z);
}

function getForward(yaw) {
  return new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
}

function getCurrentZone() {
  const first = zonePhases[0];
  if (state.gameTime < first.end) {
    return {
      label: first.label,
      radius: first.radius,
      damage: first.damage,
      phaseEnd: first.end,
    };
  }

  for (let i = 1; i < zonePhases.length; i += 1) {
    const phase = zonePhases[i];
    const previous = zonePhases[i - 1];
    if (state.gameTime < phase.end) {
      const t = phase.end === phase.start ? 1 : THREE.MathUtils.clamp((state.gameTime - phase.start) / (phase.end - phase.start), 0, 1);
      const radius = THREE.MathUtils.lerp(previous.radius, phase.radius, t);
      return {
        label: phase.label,
        radius,
        damage: phase.damage,
        phaseEnd: phase.end,
      };
    }
  }

  const finalPhase = zonePhases[zonePhases.length - 1];
  return {
    label: finalPhase.label,
    radius: finalPhase.radius,
    damage: finalPhase.damage,
    phaseEnd: finalPhase.end,
  };
}

function getReloadInterval(fighter) {
  const reloadDur = CHARACTERS[fighter.characterType]?.reloadDuration ?? reloadDuration;
  return reloadDur;
}

function queueAttackHit(attacker, hitIndex, damage, executeAt) {
  state.scheduledHits.push({
    executeAt,
    attackerId: attacker.id,
    hitIndex,
    damage,
  });
}

function beginAttack(fighter) {
  if (state.gameTime < state.freezeUntil) return false;
  if (fighter.characterType === "green") {
    return beginBoomerangAttack(fighter);
  }
  if (fighter.characterType === "blue") {
    return beginBulletAttack(fighter);
  }
  if (fighter.characterType === "orange") {
    return beginBombAttack(fighter);
  }
  if (fighter.characterType === "yellow") {
    return beginElectricAttack(fighter);
  }
  if (fighter.characterType === "cyan") {
    return beginSpreadLineAttack(fighter);
  }
  if (fighter.characterType === "purple") {
    return beginPoisonAttack(fighter);
  }
  if (fighter.characterType === "pink") {
    return beginHealCircleAttack(fighter);
  }
  if (fighter.dead || fighter.ammo <= 0 || state.gameTime < fighter.nextAttackAt) {
    return false;
  }

  const charCooldown = CHARACTERS[fighter.characterType]?.attackCooldown ?? attackCooldown;
  fighter.ammo -= 1;
  fighter.nextAttackAt = state.gameTime + charCooldown;
  fighter.attackSequenceEndsAt = state.gameTime + charCooldown;
  fighter.attackSwing = 1;
  fighter.attackAnimTime = 0;
  fighter.spread = Math.min(1, fighter.spread + 0.18);
  fighter.recoilKick = Math.min(1.5, fighter.recoilKick + 0.5);
  fighter.lastCombatTime = state.gameTime;
  if (isInBush(fighter)) fighter.revealedUntil = state.gameTime + 3;

  attackEvents.forEach((event, index) => {
    queueAttackHit(fighter, index, event.damage, state.gameTime + event.delay);
  });

  createAttackEffect(fighter, 0);
  if (fighter.isPlayer) {
    audio.play("attack");
  }
  return true;
}

function findAutoAimTarget(player) {
  const range = Math.max(15, getAttackRange(player));
  let best = null;
  let bestDist = range;
  for (const fighter of state.players) {
    if (fighter.id === player.id || fighter.dead) continue;
    if (state.chopWoodMode && fighter.team === player.team) continue;
    if (!isFighterVisible(player, fighter)) continue;
    const dx = fighter.mesh.position.x - player.mesh.position.x;
    const dz = fighter.mesh.position.z - player.mesh.position.z;
    const dist = Math.hypot(dx, dz);
    if (dist < bestDist) { bestDist = dist; best = fighter; }
  }
  return best;
}

function getAttackRange(fighter) {
  if (fighter.characterType === "green") return CHARACTERS.green.boomerangRange;
  if (fighter.characterType === "blue") return CHARACTERS.blue.bulletRange;
  if (fighter.characterType === "orange") return CHARACTERS.orange.bombRange;
  if (fighter.characterType === "yellow") return CHARACTERS.yellow.electricRange;
  if (fighter.characterType === "cyan") return CHARACTERS.cyan.spreadLineRange;
  if (fighter.characterType === "purple") return CHARACTERS.purple.needleRange;
  if (fighter.characterType === "pink") return CHARACTERS.pink.healCircleRange;
  return attackDepth;
}

function getMoveSpeed(fighter) {
  const multiplier = CHARACTERS[fighter.characterType]?.moveSpeedMultiplier ?? 1.0;
  let speed = baseMoveSpeed * multiplier;
  if (fighter.hasRedRageAbility && fighter.health < fighter.maxHealth * 0.3) {
    speed *= 1.5;
  }
  if (fighter.shockUntil && state.gameTime < fighter.shockUntil) {
    const slowPercent = fighter.shockSlowOverride ?? CHARACTERS.yellow.shockSlowPercent;
    speed *= (1 - slowPercent);
  }
  return speed;
}

function createBulletMesh(position, yaw) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 8, 6),
    new THREE.MeshBasicMaterial({ color: 0x0000ff }),
  );
  mesh.position.set(
    position.x + Math.sin(yaw) * 0.9,
    1.3,
    position.z + Math.cos(yaw) * 0.9,
  );
  scene.add(mesh);
  return mesh;
}

function beginBulletAttack(fighter) {
  if (fighter.dead || fighter.ammo <= 0 || state.gameTime < fighter.nextAttackAt) {
    return false;
  }
  const charDef = CHARACTERS.blue;
  fighter.ammo -= 1;
  fighter.nextAttackAt = state.gameTime + charDef.attackCooldown;
  fighter.attackSequenceEndsAt = state.gameTime + charDef.attackCooldown;
  fighter.attackSwing = 1;
  fighter.attackAnimTime = 0;
  fighter.spread = Math.min(1, fighter.spread + 0.06);
  fighter.lastCombatTime = state.gameTime;
  if (isInBush(fighter)) fighter.revealedUntil = state.gameTime + 3;

  const yaw = fighter.yaw;
  const mesh = createBulletMesh(fighter.mesh.position, yaw);
  state.projectiles.push({
    ownerId: fighter.id,
    x: fighter.mesh.position.x + Math.sin(yaw) * 0.9,
    z: fighter.mesh.position.z + Math.cos(yaw) * 0.9,
    vx: Math.sin(yaw) * charDef.bulletSpeed,
    vz: Math.cos(yaw) * charDef.bulletSpeed,
    damage: charDef.bulletDamage,
    range: charDef.bulletRange,
    farThreshold: Infinity,
    farMultiplier: 1,
    distTraveled: 0,
    launchAt: state.gameTime,
    mesh,
    isBullet: true,
    isPenetrating: !!fighter.hasBlueArmorPierceAbility,
  });

  if (fighter.isPlayer) {
    audio.play("attack");
  }
  return true;
}

function createBoomerangMesh(position, yaw) {
  const mesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.28, 0.08, 6, 14, Math.PI * 1.4),
    new THREE.MeshStandardMaterial({ color: 0x5dea6a, roughness: 0.5, metalness: 0.1 }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.rotation.z = yaw;
  mesh.position.set(position.x, 1.2, position.z);
  mesh.castShadow = false;
  scene.add(mesh);
  return mesh;
}

function beginBoomerangAttack(fighter) {
  if (fighter.dead || fighter.ammo <= 0 || state.gameTime < fighter.nextAttackAt) {
    return false;
  }

  const charDef = CHARACTERS.green;
  fighter.ammo -= 1;
  fighter.nextAttackAt = state.gameTime + charDef.attackCooldown;
  fighter.attackSequenceEndsAt = state.gameTime + charDef.attackCooldown;
  fighter.attackSwing = 1;
  fighter.attackAnimTime = 0;
  fighter.spread = Math.min(1, fighter.spread + 0.12);
  fighter.lastCombatTime = state.gameTime;
  if (isInBush(fighter)) fighter.revealedUntil = state.gameTime + 3;

  charDef.boomerangAngles.forEach((angleOffset, index) => {
    const yaw = fighter.yaw + angleOffset;
    const mesh = createBoomerangMesh(fighter.mesh.position, yaw);
    mesh.visible = false;
    state.projectiles.push({
      ownerId: fighter.id,
      x: fighter.mesh.position.x,
      z: fighter.mesh.position.z,
      vx: Math.sin(yaw) * charDef.boomerangSpeed,
      vz: Math.cos(yaw) * charDef.boomerangSpeed,
      damage: charDef.boomerangDamage,
      range: charDef.boomerangRange,
      farThreshold: charDef.boomerangFarThreshold,
      farMultiplier: charDef.boomerangFarMultiplier,
      distTraveled: 0,
      launchAt: state.gameTime + index * 0.08,
      mesh,
      projRadius: 0.34,
      isBoomerang: true,
      bounceCount: 0,
    });
  });

  if (fighter.isPlayer) {
    audio.play("attack");
  }
  return true;
}

function createBombMesh(position, yaw) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0xffa500, roughness: 0.4, metalness: 0.2 }),
  );
  mesh.position.set(position.x + Math.sin(yaw) * 0.9, 1.2, position.z + Math.cos(yaw) * 0.9);
  mesh.castShadow = false;
  scene.add(mesh);
  return mesh;
}

function beginBombAttack(fighter) {
  if (fighter.dead || fighter.ammo <= 0 || state.gameTime < fighter.nextAttackAt) return false;
  const charDef = CHARACTERS.orange;
  fighter.ammo -= 1;
  fighter.nextAttackAt = state.gameTime + charDef.attackCooldown;
  fighter.attackSequenceEndsAt = state.gameTime + charDef.attackCooldown;
  fighter.attackSwing = 1;
  fighter.attackAnimTime = 0;
  fighter.spread = Math.min(1, fighter.spread + 0.08);
  fighter.lastCombatTime = state.gameTime;
  if (isInBush(fighter)) fighter.revealedUntil = state.gameTime + 3;

  const yaw = fighter.yaw;
  const mesh = createBombMesh(fighter.mesh.position, yaw);
  state.projectiles.push({
    ownerId: fighter.id,
    x: fighter.mesh.position.x + Math.sin(yaw) * 0.9,
    z: fighter.mesh.position.z + Math.cos(yaw) * 0.9,
    vx: Math.sin(yaw) * charDef.bombSpeed,
    vz: Math.cos(yaw) * charDef.bombSpeed,
    damage: charDef.bombDamage,
    range: charDef.bombRange,
    farThreshold: Infinity,
    farMultiplier: 1,
    distTraveled: 0,
    launchAt: state.gameTime,
    mesh,
    isBomb: true,
    projRadius: 0.70,
  });
  if (fighter.isPlayer) audio.play("attack");
  return true;
}

function spawnBombSplash(x, z, ownerId) {
  const charDef = CHARACTERS.orange;
  const owner = state.players.find((p) => p.id === ownerId);
  const blastMult = owner?.hasOrangeBlastAbility ? 1.2 : 1;
  const blastR2 = 3 * 3;
  for (const target of state.players) {
    if (target.dead || target.id === ownerId) continue;
    if (state.chopWoodMode && owner && target.team === owner.team) continue;
    const dx = target.mesh.position.x - x;
    const dz = target.mesh.position.z - z;
    if (dx * dx + dz * dz <= blastR2) {
      applyDamage(target, charDef.bombDamage, owner ?? null);
      if (owner?.isPlayer) { flashHitMarker(); audio.play("hit"); }
    }
  }
  for (let i = 0; i < charDef.bombSplashCount; i++) {
    const angle = (i / charDef.bombSplashCount) * Math.PI * 2;
    const splashMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xffcc44, transparent: true, opacity: 0.9 }),
    );
    splashMesh.position.set(x, 1.0, z);
    scene.add(splashMesh);
    state.projectiles.push({
      ownerId,
      x, z,
      vx: Math.sin(angle) * charDef.bombSplashSpeed,
      vz: Math.cos(angle) * charDef.bombSplashSpeed,
      damage: charDef.bombSplashDamage,
      range: charDef.bombSplashRange * blastMult,
      farThreshold: Infinity,
      farMultiplier: 1,
      distTraveled: 0,
      launchAt: state.gameTime,
      mesh: splashMesh,
      isSplash: true,
      projRadius: charDef.bombSplashHitRadius * blastMult,
    });
  }
}

function createElectricMesh(position, yaw) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 8, 6),
    new THREE.MeshBasicMaterial({ color: 0xffff00 }),
  );
  mesh.position.set(position.x + Math.sin(yaw) * 0.9, 1.3, position.z + Math.cos(yaw) * 0.9);
  mesh.castShadow = false;
  scene.add(mesh);
  return mesh;
}

function beginElectricAttack(fighter) {
  if (fighter.dead || fighter.ammo <= 0 || state.gameTime < fighter.nextAttackAt) return false;
  const charDef = CHARACTERS.yellow;
  fighter.ammo -= 1;
  fighter.nextAttackAt = state.gameTime + charDef.attackCooldown;
  fighter.attackSequenceEndsAt = state.gameTime + charDef.attackCooldown;
  fighter.attackSwing = 1;
  fighter.attackAnimTime = 0;
  fighter.spread = Math.min(1, fighter.spread + 0.06);
  fighter.lastCombatTime = state.gameTime;
  if (isInBush(fighter)) fighter.revealedUntil = state.gameTime + 3;

  const yaw = fighter.yaw;
  const mesh = createElectricMesh(fighter.mesh.position, yaw);
  state.projectiles.push({
    ownerId: fighter.id,
    x: fighter.mesh.position.x + Math.sin(yaw) * 0.9,
    z: fighter.mesh.position.z + Math.cos(yaw) * 0.9,
    vx: Math.sin(yaw) * charDef.electricSpeed,
    vz: Math.cos(yaw) * charDef.electricSpeed,
    damage: charDef.electricDamage,
    range: charDef.electricRange,
    farThreshold: Infinity,
    farMultiplier: 1,
    distTraveled: 0,
    launchAt: state.gameTime,
    mesh,
    isElectric: true,
  });
  if (fighter.isPlayer) audio.play("attack");
  return true;
}

function createSpreadLineMesh(position, yaw, offsetX) {
  const mesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.12, 0.28, 4, 6),
    new THREE.MeshBasicMaterial({ color: 0x0ff0fe }),
  );
  const perpX = Math.cos(yaw);
  const perpZ = -Math.sin(yaw);
  mesh.position.set(
    position.x + Math.sin(yaw) * 0.9 + perpX * offsetX,
    1.3,
    position.z + Math.cos(yaw) * 0.9 + perpZ * offsetX,
  );
  mesh.rotation.x = Math.PI / 2;
  mesh.rotation.z = -yaw;
  scene.add(mesh);
  return mesh;
}

function beginSpreadLineAttack(fighter) {
  if (fighter.dead || fighter.ammo <= 0 || state.gameTime < fighter.nextAttackAt) return false;
  const charDef = CHARACTERS.cyan;
  fighter.ammo -= 1;
  fighter.nextAttackAt = state.gameTime + charDef.attackCooldown;
  fighter.attackSequenceEndsAt = state.gameTime + charDef.attackCooldown;
  fighter.attackSwing = 1;
  fighter.attackAnimTime = 0;
  fighter.spread = Math.min(1, fighter.spread + 0.06);
  fighter.lastCombatTime = state.gameTime;
  if (isInBush(fighter)) fighter.revealedUntil = state.gameTime + 3;

  const yaw = fighter.yaw;
  const count = charDef.spreadLineCount;
  const spacing = fighter.hasCyanPrecisionAbility ? charDef.spreadLineSpacing * 0.4 : charDef.spreadLineSpacing;
  const halfWidth = (count - 1) * spacing * 0.5;

  for (let j = 0; j < count; j++) {
    const offsetX = -halfWidth + j * spacing;
    const mesh = createSpreadLineMesh(fighter.mesh.position, yaw, offsetX);
    const perpX = Math.cos(yaw);
    const perpZ = -Math.sin(yaw);
    state.projectiles.push({
      ownerId: fighter.id,
      x: fighter.mesh.position.x + Math.sin(yaw) * 0.9 + perpX * offsetX,
      z: fighter.mesh.position.z + Math.cos(yaw) * 0.9 + perpZ * offsetX,
      vx: Math.sin(yaw) * charDef.spreadLineSpeed,
      vz: Math.cos(yaw) * charDef.spreadLineSpeed,
      damage: charDef.spreadLineDamage,
      range: charDef.spreadLineRange,
      farThreshold: Infinity,
      farMultiplier: 1,
      distTraveled: 0,
      launchAt: state.gameTime,
      mesh,
      isSpreadLine: true,
    });
  }
  if (fighter.isPlayer) audio.play("attack");
  return true;
}

function createNeedleMesh(position, yaw) {
  const mesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.5, 6),
    new THREE.MeshBasicMaterial({ color: 0x800080 }),
  );
  mesh.position.set(
    position.x + Math.sin(yaw) * 0.9,
    1.3,
    position.z + Math.cos(yaw) * 0.9,
  );
  mesh.rotation.z = Math.PI / 2;
  mesh.rotation.y = -yaw;
  scene.add(mesh);
  return mesh;
}

function createVialMesh(position, yaw) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 8, 6),
    new THREE.MeshStandardMaterial({ color: 0x660066, roughness: 0.4, metalness: 0.2 }),
  );
  mesh.position.set(
    position.x + Math.sin(yaw) * 0.9,
    1.3,
    position.z + Math.cos(yaw) * 0.9,
  );
  scene.add(mesh);
  return mesh;
}

function beginHealCircleAttack(fighter) {
  if (fighter.dead || fighter.ammo <= 0 || state.gameTime < fighter.nextAttackAt) return false;
  const charDef = CHARACTERS.pink;
  fighter.ammo -= 1;
  fighter.nextAttackAt = state.gameTime + charDef.attackCooldown;
  fighter.attackSequenceEndsAt = state.gameTime + charDef.attackCooldown;
  fighter.attackSwing = 1;
  fighter.attackAnimTime = 0;
  fighter.spread = Math.min(1, fighter.spread + 0.06);
  fighter.lastCombatTime = state.gameTime;
  if (isInBush(fighter)) fighter.revealedUntil = state.gameTime + 3;

  const fx = fighter.mesh.position.x;
  const fz = fighter.mesh.position.z;
  const effectiveRange = fighter.hasPinkAreaHealAbility
    ? charDef.healCircleRange * 1.75
    : charDef.healCircleRange;
  const r2 = effectiveRange * effectiveRange;

  for (const target of state.players) {
    if (target.dead || target.id === fighter.id) continue;
    const dx = target.mesh.position.x - fx;
    const dz = target.mesh.position.z - fz;
    if (dx * dx + dz * dz > r2) continue;

    const isAlly = state.chopWoodMode && target.team === fighter.team;
    if (isAlly) {
      const healDebuff = (target.poisonUntil && target.poisonUntil > state.gameTime) ? 0.5 : 1;
      target.health = Math.min(target.maxHealth, target.health + charDef.healCircleHeal * healDebuff);
      createHealEffect(target.mesh.position.x, target.mesh.position.z);
    } else if (!state.chopWoodMode || target.team !== fighter.team) {
      applyDamage(target, charDef.healCircleDamage, fighter);
      if (fighter.isPlayer) {
        flashHitMarker();
        audio.play("hit");
      }
    }
  }

  createHealCircleEffect(fx, fz, effectiveRange);
  if (fighter.isPlayer) audio.play("attack");
  return true;
}

function createNoteShape() {
  const shape = new THREE.Shape();
  shape.ellipse(0, 0, 0.12, 0.15, 0, Math.PI * 2, false, -0.3);
  shape.moveTo(0.12, 0);
  shape.lineTo(0.12, 0.5);
  shape.lineTo(0.10, 0.5);
  shape.lineTo(0.10, 0);
  const geo = new THREE.ShapeGeometry(shape);
  return geo;
}

function createHealCircleEffect(x, z, radius) {
  for (let w = 0; w < 2; w++) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.5, 0.7, 32),
      new THREE.MeshBasicMaterial({ color: 0xFF69B4, transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, 0.15 + w * 0.5, z);
    scene.add(ring);
    state.effects.push({ mesh: ring, life: 0.5 + w * 0.1, maxLife: 0.5 + w * 0.1, type: "sonicWave", targetRadius: radius });
  }

  const fill = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 32),
    new THREE.MeshBasicMaterial({ color: 0xFF88CC, transparent: true, opacity: 0.18, depthWrite: false }),
  );
  fill.rotation.x = -Math.PI / 2;
  fill.position.set(x, 0.1, z);
  scene.add(fill);
  state.effects.push({ mesh: fill, life: 0.4, maxLife: 0.4, type: "healFill" });

  const noteGeo = createNoteShape();
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 + Math.random() * 0.5;
    const colors = [0xFF69B4, 0xFF88CC, 0xFFAADD, 0xFF55AA, 0xFFCCEE];
    const note = new THREE.Mesh(
      noteGeo,
      new THREE.MeshBasicMaterial({ color: colors[i], transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false }),
    );
    const dist = 0.8 + Math.random() * 0.5;
    note.position.set(x + Math.cos(angle) * dist, 1.0 + Math.random() * 0.5, z + Math.sin(angle) * dist);
    note.rotation.z = (Math.random() - 0.5) * 0.6;
    note.scale.setScalar(1.5 + Math.random() * 1.0);
    scene.add(note);
    state.effects.push({
      mesh: note, life: 0.7 + Math.random() * 0.3, maxLife: 1.0, type: "musicNote",
      vx: Math.cos(angle) * (2 + Math.random()), vy: 1.5 + Math.random() * 1.5, vz: Math.sin(angle) * (2 + Math.random()),
      wobblePhase: Math.random() * Math.PI * 2,
    });
  }
}

function createHealEffect(x, z) {
  const cross = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.5),
    new THREE.MeshBasicMaterial({ color: 0x44ff88, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false }),
  );
  cross.position.set(x, 2.5, z);
  scene.add(cross);
  state.effects.push({ mesh: cross, life: 0.6, maxLife: 0.6, type: "healPopup", vy: 1.2 });
}

function beginPoisonAttack(fighter) {
  if (fighter.dead || fighter.ammo <= 0 || state.gameTime < fighter.nextAttackAt) return false;
  const charDef = CHARACTERS.purple;
  fighter.ammo -= 1;
  fighter.nextAttackAt = state.gameTime + charDef.attackCooldown;
  fighter.attackSequenceEndsAt = state.gameTime + charDef.attackCooldown;
  fighter.attackSwing = 1;
  fighter.attackAnimTime = 0;
  fighter.spread = Math.min(1, fighter.spread + 0.06);
  fighter.lastCombatTime = state.gameTime;
  if (isInBush(fighter)) fighter.revealedUntil = state.gameTime + 3;

  const yaw = fighter.yaw;
  const isNeedle = fighter.attackIndex % 2 === 0;
  fighter.attackIndex += 1;

  if (isNeedle) {
    const fanAngles = fighter.hasPurpleFanAbility
      ? [yaw - 0.096, yaw + 0.096]  // 11도 부채꼴 (±5.5도)
      : [yaw];
    for (const angle of fanAngles) {
      const mesh = createNeedleMesh(fighter.mesh.position, angle);
      state.projectiles.push({
        ownerId: fighter.id,
        x: fighter.mesh.position.x + Math.sin(angle) * 0.9,
        z: fighter.mesh.position.z + Math.cos(angle) * 0.9,
        vx: Math.sin(angle) * charDef.needleSpeed,
        vz: Math.cos(angle) * charDef.needleSpeed,
        damage: charDef.needleDamage,
        range: charDef.needleRange,
        farThreshold: Infinity,
        farMultiplier: 1,
        distTraveled: 0,
        launchAt: state.gameTime,
        mesh,
        isNeedle: true,
      });
    }
  } else {
    const mesh = createVialMesh(fighter.mesh.position, yaw);
    const flightTime = charDef.vialRange / charDef.vialSpeed;
    const gravity = 20;
    const vy0 = gravity * flightTime * 0.5;
    state.projectiles.push({
      ownerId: fighter.id,
      x: fighter.mesh.position.x + Math.sin(yaw) * 0.9,
      z: fighter.mesh.position.z + Math.cos(yaw) * 0.9,
      y: 1.3,
      vx: Math.sin(yaw) * charDef.vialSpeed,
      vz: Math.cos(yaw) * charDef.vialSpeed,
      vy: vy0,
      gravity,
      damage: charDef.vialDamage,
      range: charDef.vialRange,
      farThreshold: Infinity,
      farMultiplier: 1,
      distTraveled: 0,
      launchAt: state.gameTime,
      mesh,
      isVial: true,
    });
  }
  if (fighter.isPlayer) audio.play("attack");
  return true;
}

function createVialSplashEffect(x, z) {
  const splashR = CHARACTERS.purple.vialSplashRadius;

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(splashR * 0.3, splashR * 0.35, 32),
    new THREE.MeshBasicMaterial({
      color: 0x800080,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(x, 0.15, z);
  scene.add(ring);
  state.effects.push({ mesh: ring, life: 0.5, maxLife: 0.5, type: "vialRing", targetScale: splashR });

  const fill = new THREE.Mesh(
    new THREE.CircleGeometry(splashR, 32),
    new THREE.MeshBasicMaterial({
      color: 0x660066,
      transparent: true,
      opacity: 0.25,
      depthWrite: false,
    }),
  );
  fill.rotation.x = -Math.PI / 2;
  fill.position.set(x, 0.12, z);
  scene.add(fill);
  state.effects.push({ mesh: fill, life: 0.4, maxLife: 0.4, type: "vialFill" });
}

function spawnVialSplash(x, z, ownerId) {
  const charDef = CHARACTERS.purple;
  const attacker = state.players.find((p) => p.id === ownerId);
  for (const target of state.players) {
    if (target.id === ownerId || target.dead) continue;
    if (state.chopWoodMode && attacker && target.team === attacker.team) continue;
    const dx = target.mesh.position.x - x;
    const dz = target.mesh.position.z - z;
    if (dx * dx + dz * dz < charDef.vialSplashRadius * charDef.vialSplashRadius) {
      applyDamage(target, charDef.vialDamage, attacker ?? null);
      if (ownerId === 0) {
        flashHitMarker();
        audio.play("hit");
      }
    }
  }
  createVialSplashEffect(x, z);
}

function updateProjectiles(dt) {
  for (let i = state.projectiles.length - 1; i >= 0; i -= 1) {
    const proj = state.projectiles[i];

    if (state.gameTime < proj.launchAt) {
      continue;
    }
    proj.mesh.visible = true;

    const step = Math.hypot(proj.vx, proj.vz) * dt;
    proj.x += proj.vx * dt;
    proj.z += proj.vz * dt;
    proj.distTraveled += step;
    if (proj.isVial) {
      proj.vy -= proj.gravity * dt;
      proj.y += proj.vy * dt;
      proj.mesh.position.set(proj.x, proj.y, proj.z);
      proj.mesh.rotation.z += dt * 6;
      if (proj.y <= 0.2) {
        spawnVialSplash(proj.x, proj.z, proj.ownerId);
        tempVec3.set(proj.x, 0.5, proj.z);
        createHitSpark(tempVec3);
        scene.remove(proj.mesh);
        state.projectiles.splice(i, 1);
        continue;
      }
    } else {
      proj.mesh.position.set(proj.x, (proj.isBullet || proj.isElectric || proj.isSpreadLine || proj.isNeedle) ? 1.3 : 1.2, proj.z);
      if (!proj.isBullet && !proj.isElectric && !proj.isSpreadLine && !proj.isNeedle) {
        proj.mesh.rotation.z += dt * 10;
      }
    }

    if (proj.isBullet || proj.isElectric || proj.isNeedle) {
      const color = proj.isBullet ? 0x0000ff : proj.isElectric ? 0xffff00 : 0x800080;
      const size = proj.isBullet ? 0.24 : proj.isElectric ? 0.28 : 0.2;
      const trail = new THREE.Mesh(
        new THREE.SphereGeometry(size, 4, 4),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, depthWrite: false }),
      );
      trail.position.set(proj.x, proj.mesh.position.y, proj.z);
      scene.add(trail);
      state.effects.push({ mesh: trail, life: 0.15, maxLife: 0.15, type: "trail" });
    }

    let hit = false;
    const attacker = state.players.find((p) => p.id === proj.ownerId);
    for (const target of state.players) {
      if (target.id === proj.ownerId || target.dead) {
        continue;
      }
      if (state.chopWoodMode && attacker && target.team === attacker.team) continue;
      const dx = target.mesh.position.x - proj.x;
      const dz = target.mesh.position.z - proj.z;
      const hitDist = target.radius + (proj.projRadius || 0);
      if (dx * dx + dz * dz < hitDist * hitDist) {
        if (proj.isVial) {
          spawnVialSplash(proj.x, proj.z, proj.ownerId);
          tempVec3.set(proj.x, 0.5, proj.z);
          createHitSpark(tempVec3);
          hit = true;
          break;
        }
        const isFar = proj.distTraveled > proj.farThreshold;
        const dmg = isFar ? proj.damage * proj.farMultiplier : proj.damage;
        applyDamage(target, dmg, attacker ?? null);
        if (attacker && attacker.isPlayer) {
          flashHitMarker();
          audio.play("hit");
        }
        tempVec3.set(proj.x, 1.6, proj.z);
        createHitSpark(tempVec3);
        if (proj.isBomb) {
          spawnBombSplash(proj.x, proj.z, proj.ownerId);
          createBombExplosionEffect(proj.x, proj.z);
        }
        if (proj.isElectric) {
          const shooter = state.players.find((p) => p.id === proj.ownerId);
          const shockDur = shooter?.hasYellowOverloadAbility
            ? CHARACTERS.yellow.shockDuration * 2
            : CHARACTERS.yellow.shockDuration;
          const shockSlow = shooter?.hasYellowOverloadAbility ? 0.65 : CHARACTERS.yellow.shockSlowPercent;
          target.shockUntil = state.gameTime + shockDur;
          target.shockSlowOverride = shooter?.hasYellowOverloadAbility ? shockSlow : null;
          createElectricHitEffect(proj.x, proj.z);
        }
        if (proj.isBullet) createBulletHitEffect(proj.x, proj.z);
        if (proj.isBoomerang) {
          createBoomerangHitEffect(proj.x, proj.z);
          if (attacker?.hasGreenBounceAbility && proj.bounceCount < 1) {
            const nextTarget = state.players
              .filter((p) => !p.dead && p.id !== proj.ownerId && p.id !== target.id)
              .sort((a, b) => {
                const da = (a.mesh.position.x - proj.x) ** 2 + (a.mesh.position.z - proj.z) ** 2;
                const db = (b.mesh.position.x - proj.x) ** 2 + (b.mesh.position.z - proj.z) ** 2;
                return da - db;
              })[0];
            if (nextTarget) {
              const bx = nextTarget.mesh.position.x - proj.x;
              const bz = nextTarget.mesh.position.z - proj.z;
              const bLen = Math.sqrt(bx * bx + bz * bz) || 1;
              const charDef = CHARACTERS.green;
              const bounceMesh = createBoomerangMesh({ x: proj.x, y: 1.3, z: proj.z }, Math.atan2(bx, bz));
              state.projectiles.push({
                ownerId: proj.ownerId,
                x: proj.x, z: proj.z,
                vx: (bx / bLen) * charDef.boomerangSpeed,
                vz: (bz / bLen) * charDef.boomerangSpeed,
                damage: proj.damage,
                range: charDef.boomerangRange,
                farThreshold: Infinity,
                farMultiplier: 1,
                distTraveled: 0,
                launchAt: state.gameTime,
                mesh: bounceMesh,
                projRadius: 0.34,
                isBoomerang: true,
                bounceCount: 1,
              });
            }
          }
        }
        if (proj.isSpreadLine) createSpreadLineHitEffect(proj.x, proj.z);
        if (proj.isNeedle) {
          createNeedleHitEffect(proj.x, proj.z);
          target.poisonUntil = state.gameTime + CHARACTERS.purple.poisonDuration;
          target.poisonSourceId = proj.ownerId;
          target.revealedUntil = state.gameTime + CHARACTERS.purple.poisonDuration;
          if (!target.poisonNextTick || target.poisonNextTick < state.gameTime) {
            target.poisonNextTick = state.gameTime + 1;
          }
        }
        hit = true;
        if (!proj.isPenetrating) break;
      }
    }

    // 벽 충돌 시 소멸 (폭탄은 벽에 맞아도 폭발, 독병은 공중이면 무시)
    if (!hit && !(proj.isVial && proj.y > 1.5)) {
      for (const solid of state.solids) {
        if (intersectsRect(proj.x, proj.z, 0.2, solid)) {
          if (proj.isBomb) { spawnBombSplash(proj.x, proj.z, proj.ownerId); createBombExplosionEffect(proj.x, proj.z); }
          if (proj.isVial) spawnVialSplash(proj.x, proj.z, proj.ownerId);
          hit = true;
          break;
        }
      }
    }

    if (hit || proj.distTraveled >= proj.range) {
      if (proj.isBomb && !hit) { spawnBombSplash(proj.x, proj.z, proj.ownerId); createBombExplosionEffect(proj.x, proj.z); }
      if (proj.isVial && !hit) spawnVialSplash(proj.x, proj.z, proj.ownerId);
      scene.remove(proj.mesh);
      state.projectiles.splice(i, 1);
    }
  }
}

function updatePoisonTicks() {
  const purpleDef = CHARACTERS.purple;
  for (const fighter of state.players) {
    if (fighter.dead || !fighter.poisonUntil || state.gameTime >= fighter.poisonUntil) {
      fighter.poisonUntil = 0;
      continue;
    }
    if (state.gameTime >= fighter.poisonNextTick) {
      const attacker = state.players.find((p) => p.id === fighter.poisonSourceId) ?? null;
      applyDamage(fighter, purpleDef.poisonDPS, attacker);
      fighter.poisonNextTick = state.gameTime + 1;
      for (let pi = 0; pi < 6; pi++) {
        const pa = Math.random() * Math.PI * 2;
        const pr = 0.4 + Math.random() * 0.8;
        const size = 0.18 + Math.random() * 0.14;
        const pp = new THREE.Mesh(
          new THREE.SphereGeometry(size, 6, 6),
          new THREE.MeshBasicMaterial({ color: pi % 2 === 0 ? 0x88ff44 : 0x66cc22, transparent: true, opacity: 0.85, depthWrite: false }),
        );
        pp.position.set(
          fighter.mesh.position.x + Math.cos(pa) * pr,
          0.5 + Math.random() * 1.5,
          fighter.mesh.position.z + Math.sin(pa) * pr,
        );
        scene.add(pp);
        state.effects.push({
          mesh: pp, life: 0.8, maxLife: 0.8, type: "poisonBubble",
          vy: 0.8 + Math.random() * 0.6,
          wobbleSpeed: 4 + Math.random() * 4,
          wobbleAmp: 0.3 + Math.random() * 0.3,
          wobblePhase: Math.random() * Math.PI * 2,
        });
      }
    }
  }
}

function isVisibleThroughBush(observer, target) {
  tempVec2.set(target.mesh.position.x - observer.mesh.position.x, target.mesh.position.z - observer.mesh.position.z);
  const lengthSq = tempVec2.lengthSq();
  if (lengthSq < 1) {
    return true;
  }

  for (const bush of state.bushes) {
    const originToBush = new THREE.Vector2(bush.x - observer.mesh.position.x, bush.z - observer.mesh.position.z);
    const proj = originToBush.dot(tempVec2) / lengthSq;
    if (proj <= 0 || proj >= 1) {
      continue;
    }
    const closestX = observer.mesh.position.x + tempVec2.x * proj;
    const closestZ = observer.mesh.position.z + tempVec2.y * proj;
    const dx = bush.x - closestX;
    const dz = bush.z - closestZ;
    if (dx * dx + dz * dz < bush.radius * bush.radius) {
      return false;
    }
  }

  return true;
}

// 수풀 안에 들어가면 일정 거리 밖에서는 완전히 보이지 않음
const bushStealthRevealRangeSq = 3 * 3;

function isInBush(fighter) {
  for (const bush of state.bushes) {
    const dx = fighter.mesh.position.x - bush.x;
    const dz = fighter.mesh.position.z - bush.z;
    if (dx * dx + dz * dz < bush.radius * bush.radius) {
      return true;
    }
  }
  return false;
}

function isFighterVisible(observer, target) {
  if (state.gameTime < target.revealedUntil) return true;
  const dx = target.mesh.position.x - observer.mesh.position.x;
  const dz = target.mesh.position.z - observer.mesh.position.z;
  if (isInBush(target) && dx * dx + dz * dz > bushStealthRevealRangeSq) {
    return false;
  }
  return isVisibleThroughBush(observer, target);
}

function findNearestBush(pos) {
  let nearest = null;
  let bestDistSq = Infinity;
  for (const bush of state.bushes) {
    const dx = bush.x - pos.x;
    const dz = bush.z - pos.z;
    const distSq = dx * dx + dz * dz;
    if (distSq < bestDistSq) {
      bestDistSq = distSq;
      nearest = bush;
    }
  }
  return nearest;
}

function resolveAttack(attacker, hitIndex, damage) {
  if (!attacker || attacker.dead) {
    return;
  }

  const spreadOffset = attacker.spread * 0.2 * (Math.random() * 2 - 1);
  // X자형: hitIndex 0 -20도(오른→왼), hitIndex 1 +20도(왼→오른)
  const tilt = (hitIndex === 0 ? -20 : 20) * (Math.PI / 180);
  const effectiveYaw = attacker.yaw + tilt;
  const sinYaw = Math.sin(effectiveYaw);
  const cosYaw = Math.cos(effectiveYaw);
  // 첫 번째 공격(hitIndex 0): 오른쪽(+0.5), 두 번째(hitIndex 1): 왼쪽(-1)
  const punchSide = hitIndex === 0 ? 0.5 : -1;
  let bestTarget = null;
  let bestScore = -Infinity;
  const hitTargets = [];

  for (const target of state.players) {
    if (target.id === attacker.id || target.dead) {
      continue;
    }
    if (state.chopWoodMode && target.team === attacker.team) continue;

    const deltaX = target.mesh.position.x - attacker.mesh.position.x;
    const deltaZ = target.mesh.position.z - attacker.mesh.position.z;
    const localX = deltaX * cosYaw - deltaZ * sinYaw - spreadOffset;
    const localZ = deltaX * sinYaw + deltaZ * cosYaw;
    if (localZ < 0 || localZ > attackDepth) {
      continue;
    }
    if (Math.abs(localX - punchSide) > attackHalfWidth) {
      continue;
    }

    if (!isFighterVisible(attacker, target)) {
      continue;
    }

    hitTargets.push(target);
    const score = localZ * -1 - Math.abs(localX - punchSide) * 0.2;
    if (score > bestScore) {
      bestScore = score;
      bestTarget = target;
    }
  }

  createAttackEffect(attacker, hitIndex);

  // 레드: 관통 (히트박스 내 전체 타격)
  const penetrate = attacker.characterType === "red";
  const targets = penetrate ? hitTargets : (bestTarget ? [bestTarget] : []);

  for (const t of targets) {
    applyDamage(t, damage, attacker);
    tempVec3.copy(t.mesh.position);
    tempVec3.y = 1.6;
    createHitSpark(tempVec3);
  }
  if (targets.length > 0 && attacker.isPlayer) {
    flashHitMarker();
    audio.play("hit");
  }
}

function applyDamage(target, amount, attacker = null, updateCombatTime = true) {
  if (target.dead) {
    return;
  }

  const finalAmount = (attacker && attacker.levelMult) ? Math.round(amount * attacker.levelMult) : amount;
  const healthBefore = target.health;
  target.health = Math.max(0, target.health - finalAmount);
  target.flashTimer = 0.12;
  target.pitchKick = Math.min(1, target.pitchKick + 0.55);
  if (updateCombatTime) {
    target.lastCombatTime = state.gameTime;
  }
  if (isInBush(target)) target.revealedUntil = state.gameTime + 3;
  if (attacker && isInBush(attacker)) attacker.revealedUntil = state.gameTime + 3;
  const dealt = healthBefore - target.health;
  if (attacker) {
    attacker.lastCombatTime = state.gameTime;
    attacker.damageDealt += dealt;
    if (state.takedownMode && target.isBoss && !attacker.isBoss && dealt > 0) {
      attacker.tdScore = (attacker.tdScore || 0) + Math.round(dealt * TD_SCORE_DAMAGE);
      attacker.tdBossDmg = (attacker.tdBossDmg || 0) + dealt;
    }
    if (attacker.isPlayer && target.id !== attacker.id) {
      tempVec3.copy(target.mesh.position);
      createDamagePopup(tempVec3, dealt);
    }
  }

  if (target.isPlayer) {
    state.feedback.hitFlashUntil = state.gameTime + 0.18;
    audio.play("hit");
    if (!attacker || target.id !== attacker.id) {
      tempVec3.copy(target.mesh.position);
      createDamagePopup(tempVec3, dealt, "#ff5c5c");
    }
  }

  if (target.health <= 0) {
    target.dead = true;
    target.mesh.visible = false;
    target.shadow.visible = false;
    target.healthBar.visible = false;
    if (state.trainingMode && target.isDummy) {
      target.respawnAt = state.gameTime + 3;
    } else if (state.takedownMode) {
      if (target.isBoss) {
        if (attacker && !attacker.isBoss) {
          attacker.tdScore = (attacker.tdScore || 0) + TD_SCORE_LAST_HIT;
          addKillFeed(t("tdBossKill", attacker.name));
          if (attacker.isPlayer) audio.play("kill");
        }
      } else {
        target.tdRespawnAt = state.gameTime + TD_RESPAWN_TIME;
        if (attacker && !attacker.isBoss && attacker.id !== target.id) {
          attacker.tdScore = (attacker.tdScore || 0) + TD_SCORE_KILL;
          attacker.tdKills = (attacker.tdKills || 0) + 1;
          addKillFeed(t("killFeed", attacker.name, target.name));
          if (attacker.isPlayer || target.isPlayer) audio.play("kill");
        }
      }
    } else if (state.chopWoodMode) {
      target.respawnAt = state.gameTime + 5;
      target.axeLevel = 0;
      target.chopTimer = 0;
      target.isChopping = false;
      if (target.axeIndicator) target.axeIndicator.material.color.setHex(AXE_GRADES[0].color);
      if (attacker && attacker.team !== target.team) {
        onChopWoodKill(attacker, target);
        const ac = attacker.teamNameColor || "#fff";
        const tc = target.teamNameColor || "#fff";
        addKillFeed(`<span style="color:${ac}">${attacker.name}</span> 처치 → <span style="color:${tc}">${target.name}</span>`, ac, tc);
        if (attacker.isPlayer || target.isPlayer) audio.play("kill");
      }
    } else {
      state.deathOrder.push(target.id);
      if (attacker) {
        addKillFeed(t("killFeed", attacker.name, target.name));
        if (attacker.isPlayer || target.isPlayer) {
          audio.play("kill");
        }
      } else {
        addKillFeed(`${target.name} 사망`);
      }
    }
  }
}

function updateScheduledHits() {
  for (let i = state.scheduledHits.length - 1; i >= 0; i -= 1) {
    const hit = state.scheduledHits[i];
    if (state.gameTime < hit.executeAt) {
      continue;
    }
    state.scheduledHits.splice(i, 1);
    const attacker = state.players.find((player) => player.id === hit.attackerId);
    resolveAttack(attacker, hit.hitIndex, hit.damage);
  }
}

const EMOTE_KEYS = ["emote-btn-0", "emote-btn-1", "emote-btn-2"];
const emoteBtns = EMOTE_KEYS.map(id => document.getElementById(id));
const emoteCooldownUntil = [0, 0, 0];

function updateEmoteBtns(account) {
  const slots = account?.cosmetics?.equippedEmotes ?? [null, null, null];
  emoteBtns.forEach((btn, i) => {
    if (!btn) return;
    const id = slots[i];
    if (!id) { btn.classList.add("hidden"); return; }
    btn.textContent = EMOTES[id]?.emoji ?? "";
    btn.classList.remove("hidden");
  });
}

function triggerEmote(slot = 0) {
  if ((!state.gameStarted && !state.trainingMode) || state.gameOver) return;
  if (state.gameTime < emoteCooldownUntil[slot]) return;
  const player = getPlayer();
  if (!player) return;
  const acc = loadAccount();
  const eq = acc?.cosmetics?.equippedEmotes?.[slot];
  if (!eq) return;
  const emoji = EMOTES[eq]?.emoji ?? "😊";
  emoteCooldownUntil[slot] = state.gameTime + 5;

  const canvas = document.createElement("canvas");
  canvas.width = 128; canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.beginPath();
  ctx.arc(64, 64, 58, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = "72px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, 64, 66);
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.renderOrder = 999;
  sprite.scale.set(3.0, 3.0, 1);
  sprite.position.set(
    player.mesh.position.x,
    player.mesh.position.y + 4.5,
    player.mesh.position.z,
  );
  scene.add(sprite);
  state.effects.push({ mesh: sprite, life: 2.5, maxLife: 2.5, type: "emote" });
}

emoteBtns.forEach((btn, i) => {
  if (btn) btn.addEventListener("click", () => triggerEmote(i));
});
updateEmoteBtns(loadAccount());

function updateEffects(dt) {
  for (let i = state.effects.length - 1; i >= 0; i -= 1) {
    const effect = state.effects[i];
    effect.life -= dt;
    if (effect.life <= 0) {
      scene.remove(effect.mesh);
      if (effect.type === "damagePopup" || effect.type === "emote") {
        effect.mesh.material.map?.dispose();
        effect.mesh.material.dispose();
      }
      state.effects.splice(i, 1);
      continue;
    }
    if (effect.type === "emote") {
      const player = getPlayer();
      const elapsed = effect.maxLife - effect.life;

      // 팝인: easeOutBack (0~0.35s)
      let scale = 3.0;
      if (elapsed < 0.35) {
        const t = elapsed / 0.35;
        const c1 = 1.70158, c3 = c1 + 1;
        const eob = 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        scale = 3.0 * Math.max(0, eob);
      }

      // 팝아웃: 마지막 0.4s — 축소 + 페이드
      let opacity = 1;
      if (effect.life < 0.4) {
        const t = effect.life / 0.4;
        opacity = t;
        scale *= 0.5 + t * 0.5;
      }

      // 위로 살짝 떠오름
      const floatY = elapsed * 0.4;

      if (player) {
        effect.mesh.position.set(
          player.mesh.position.x,
          player.mesh.position.y + 6.0 + floatY,
          player.mesh.position.z,
        );
      }
      effect.mesh.scale.set(scale, scale, 1);
      effect.mesh.material.opacity = opacity;
      continue;
    }
    const alpha = effect.life / effect.maxLife;
    const groundTypes = ["sonicWave", "healFill", "vialRing", "vialFill", "frostRing", "bombRing", "bombFlash", "bulletHit", "spreadHit", "needleHit", "boomerangHit"];
    if (!groundTypes.includes(effect.type)) {
      effect.mesh.quaternion.copy(camera.quaternion);
    }
    if (effect.type === "fist") {
      effect.mesh.scale.setScalar(1 + (1 - alpha) * 0.5);
      effect.mesh.material.opacity = alpha * 0.9;
    } else if (effect.type === "punchImpact") {
      effect.mesh.scale.setScalar(1 + (1 - alpha) * 3.0);
      effect.mesh.material.opacity = alpha * 0.85;
    } else if (effect.type === "punchBurst") {
      effect.mesh.scale.setScalar(1 + (1 - alpha) * 2.0);
      effect.mesh.material.opacity = alpha * alpha * 0.7;
    } else if (effect.type === "attack") {
      effect.mesh.scale.setScalar(1 + (1 - alpha) * 0.28);
      effect.mesh.material.opacity = alpha * 0.85;
    } else if (effect.type === "slash") {
      effect.mesh.scale.x = 1 + (1 - alpha) * 1.8;
      effect.mesh.scale.y = 1.0;
      effect.mesh.material.opacity = alpha * alpha;
    } else if (effect.type === "bombRing") {
      effect.mesh.scale.setScalar(1 + (1 - alpha) * 3.0);
      effect.mesh.material.opacity = alpha * 0.8;
    } else if (effect.type === "bombFlash") {
      effect.mesh.scale.setScalar(1 + (1 - alpha) * 1.5);
      effect.mesh.material.opacity = alpha * alpha * 0.5;
    } else if (effect.type === "electricFlash") {
      effect.mesh.scale.setScalar(1 + (1 - alpha) * 2.0);
      effect.mesh.material.opacity = alpha * 0.9;
    } else if (effect.type === "electricBolt") {
      effect.mesh.material.opacity = alpha * 0.9;
    } else if (effect.type === "electricSpark") {
      effect.mesh.position.x += (effect.vx ?? 0) * dt;
      effect.mesh.position.y += (effect.vy ?? 0) * dt;
      effect.mesh.position.z += (effect.vz ?? 0) * dt;
      if (effect.vy !== undefined) effect.vy -= 12 * dt;
      effect.mesh.scale.setScalar(alpha);
      effect.mesh.material.opacity = alpha * 0.9;
    } else if (effect.type === "electricHit") {
      effect.mesh.scale.setScalar(1 + (1 - alpha) * 2.5);
      effect.mesh.rotation.z += dt * 15;
      effect.mesh.material.opacity = alpha * 0.9;
    } else if (effect.type === "boomerangHit") {
      effect.mesh.scale.setScalar(1 + (1 - alpha) * 2.0);
      effect.mesh.rotation.z += dt * 12;
      effect.mesh.material.opacity = alpha * 0.7;
    } else if (effect.type === "iceCrystal") {
      const elapsed = effect.maxLife - effect.life;
      const a = effect.angle + elapsed * 5;
      effect.mesh.position.set(
        effect.cx + Math.cos(a) * effect.radius,
        0.3 + Math.sin(elapsed * 8) * 0.15,
        effect.cz + Math.sin(a) * effect.radius,
      );
      effect.mesh.rotation.y += dt * 6;
      effect.mesh.rotation.x += dt * 4;
      effect.mesh.material.opacity = alpha * 0.8;
    } else if (effect.type === "frostRing") {
      effect.mesh.material.opacity = alpha * 0.4;
    } else if (effect.type === "poisonBubble") {
      effect.mesh.position.y += (effect.vy ?? 0.8) * dt;
      const elapsed = effect.maxLife - effect.life;
      effect.mesh.position.x += Math.sin(elapsed * (effect.wobbleSpeed ?? 5) + (effect.wobblePhase ?? 0)) * (effect.wobbleAmp ?? 0.3) * dt;
      effect.mesh.scale.setScalar(0.6 + alpha * 0.6);
      effect.mesh.material.opacity = alpha * 0.85;
    } else if (effect.type === "trail") {
      effect.mesh.scale.setScalar(alpha);
      effect.mesh.material.opacity = alpha * 0.5;
    } else if (effect.type === "bulletHit" || effect.type === "spreadHit" || effect.type === "needleHit") {
      effect.mesh.scale.setScalar(1 + (1 - alpha) * 1.8);
      effect.mesh.material.opacity = alpha * alpha;
    } else if (effect.type === "sonicWave") {
      const expand = (1 - alpha) * effect.targetRadius / 0.6;
      effect.mesh.scale.setScalar(1 + expand);
      effect.mesh.material.opacity = alpha * 0.7;
    } else if (effect.type === "healFill") {
      effect.mesh.material.opacity = alpha * 0.18;
    } else if (effect.type === "musicNote") {
      effect.mesh.position.x += (effect.vx ?? 0) * dt;
      effect.mesh.position.y += (effect.vy ?? 1.5) * dt;
      effect.mesh.position.z += (effect.vz ?? 0) * dt;
      if (effect.vy !== undefined) effect.vy -= 2.0 * dt;
      const elapsed = effect.maxLife - effect.life;
      effect.mesh.rotation.z += Math.sin(elapsed * 6 + (effect.wobblePhase ?? 0)) * dt * 2;
      effect.mesh.scale.setScalar((1.5 + Math.random() * 0.3) * (0.5 + alpha * 0.5));
      effect.mesh.material.opacity = alpha * 0.9;
    } else if (effect.type === "healPopup") {
      effect.mesh.position.y += (effect.vy ?? 1.2) * dt;
      effect.mesh.scale.setScalar(0.7 + alpha * 0.3);
      effect.mesh.material.opacity = alpha * 0.9;
    } else if (effect.type === "vialRing") {
      const expand = 1 + (1 - alpha) * 2.0;
      effect.mesh.scale.setScalar(expand);
      effect.mesh.material.opacity = alpha * 0.6;
    } else if (effect.type === "vialFill") {
      effect.mesh.material.opacity = alpha * 0.25;
    } else if (effect.type === "damagePopup") {
      effect.mesh.position.y += dt * 1.4;
      effect.mesh.material.opacity = alpha;
    } else {
      effect.mesh.scale.setScalar(1 + (1 - alpha) * 1.6);
      effect.mesh.material.opacity = alpha;
    }
  }
}

function updatePlayerControls(dt) {
  const player = getPlayer();
  if (!player || player.dead) {
    return;
  }

  const keyboardX = (state.keyState.KeyD ? 1 : 0) - (state.keyState.KeyA ? 1 : 0);
  const keyboardZ = (state.keyState.KeyW ? 1 : 0) - (state.keyState.KeyS ? 1 : 0);
  const inputX = THREE.MathUtils.clamp(keyboardX + state.mobileMove.x, -1, 1);
  const inputZ = THREE.MathUtils.clamp(keyboardZ + state.mobileMove.y, -1, 1);

  tempVec3.set(0, 0, 0);
  if (Math.abs(inputX) > 0.001 || Math.abs(inputZ) > 0.001) {
    const inputLength = Math.hypot(inputX, inputZ) || 1;
    tempVec3.set(inputX / inputLength, 0, -inputZ / inputLength).multiplyScalar(getMoveSpeed(player));
  }

  // 오토에임: 모바일 조이스틱에서만 사거리 내 가장 가까운 적을 자동 추적
  let autoTarget = null;
  if (state.mouseHeld && state.mobileMove.active) {
    const autoAimRange = Math.max(15, getAttackRange(player));
    let autoTargetDist = autoAimRange;
    for (const fighter of state.players) {
      if (fighter.id === player.id || fighter.dead) continue;
      if (state.chopWoodMode && fighter.team === player.team) continue;
      if (!isFighterVisible(player, fighter)) continue;
      const dx = fighter.mesh.position.x - player.mesh.position.x;
      const dz = fighter.mesh.position.z - player.mesh.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist < autoTargetDist) { autoTargetDist = dist; autoTarget = fighter; }
    }
  }

  if (autoTarget) {
    // 타겟 발견 → 마우스/조이스틱 무시하고 자동 추적
    const dx = autoTarget.mesh.position.x - player.mesh.position.x;
    const dz = autoTarget.mesh.position.z - player.mesh.position.z;
    const targetYaw = Math.atan2(dx, dz);
    player.yaw = moveAngleToward(player.yaw, targetYaw, dt * 28);
  } else {
    // 타겟 없음 → 일반 조준 (조이스틱 or 마우스)
    const isMobile = state.mobileMove.active;
    if (isMobile) {
      if (Math.abs(inputX) > 0.001 || Math.abs(inputZ) > 0.001) {
        const desiredYaw = Math.atan2(tempVec3.x, tempVec3.z);
        player.yaw = moveAngleToward(player.yaw, desiredYaw, dt * turnSpeed * 2.4);
      }
    } else {
      const ndcX = (state.mouse.screenX / window.innerWidth) * 2 - 1;
      const ndcY = -(state.mouse.screenY / window.innerHeight) * 2 + 1;
      aimRaycaster.setFromCamera({ x: ndcX, y: ndcY }, camera);
      if (aimRaycaster.ray.intersectPlane(groundPlane, mouseAimWorld)) {
        const dx = mouseAimWorld.x - player.mesh.position.x;
        const dz = mouseAimWorld.z - player.mesh.position.z;
        if (Math.hypot(dx, dz) > 0.3) {
          player.yaw = Math.atan2(dx, dz);
        }
      }
    }
  }

  player.mesh.rotation.y = player.yaw;

  moveFighter(player, tempVec3, dt);
}

function chooseBotTarget(bot) {
  if (state.takedownMode && !bot.isBoss) {
    const boss = state.tdBoss;
    let nearPlayer = null;
    let nearPlayerDist = Infinity;
    for (const f of state.players) {
      if (f.id === bot.id || f.dead || f.isBoss) continue;
      const d = Math.hypot(f.mesh.position.x - bot.mesh.position.x, f.mesh.position.z - bot.mesh.position.z);
      if (d < 8 && f.health < f.maxHealth * 0.4 && d < nearPlayerDist) {
        nearPlayerDist = d;
        nearPlayer = f;
      }
    }
    if (nearPlayer && Math.random() < 0.4) return nearPlayer;
    if (boss && !boss.dead) {
      if (boss.bossRage && bot.health < bot.maxHealth * 0.3) {
        const bDist = Math.hypot(boss.mesh.position.x - bot.mesh.position.x, boss.mesh.position.z - bot.mesh.position.z);
        if (bDist < 8) return nearPlayer || null;
      }
      return boss;
    }
    return nearPlayer;
  }

  let best = null;
  let bestScore = Infinity;
  const playerDead = getPlayer()?.dead ?? false;
  const visionRange = playerDead ? 200 : 50;
  const bushVisionRange = playerDead ? 200 : 9;
  for (const fighter of state.players) {
    if (fighter.id === bot.id || fighter.dead) continue;
    if (state.chopWoodMode && fighter.team === bot.team) continue;
    const dx = fighter.mesh.position.x - bot.mesh.position.x;
    const dz = fighter.mesh.position.z - bot.mesh.position.z;
    const distanceSq = dx * dx + dz * dz;
    if (distanceSq > visionRange * visionRange) continue;
    if (!isFighterVisible(bot, fighter) && distanceSq > bushVisionRange * bushVisionRange) continue;
    if (isInBush(fighter) && distanceSq > bushStealthRevealRangeSq) continue;

    const healthRatio = fighter.health / fighter.maxHealth;
    const lowHpBonus = healthRatio * 200;
    const bushPenalty = isInBush(fighter) ? 240 : 0;
    const score = distanceSq + lowHpBonus + bushPenalty;

    if (score < bestScore) {
      bestScore = score;
      best = fighter;
    }
  }
  return best;
}

const BOT_DIFF = [
  { speedMult: 0.9, aimMult: 1.3, fleePct: 0.15, reactDelay: 0.3 },
  { speedMult: 0.95, aimMult: 1.05, fleePct: 0.25, reactDelay: 0.1 },
  { speedMult: 1.0, aimMult: 0.9, fleePct: 0.35, reactDelay: 0 },
];

function updateBot(bot, dt, zone) {
  if (bot.dead || bot.isDummy || bot.isBoss || bot.isNetworkPlayer) {
    return;
  }

  const diff = BOT_DIFF[bot.botDifficulty] ?? BOT_DIFF[1];
  const target = chooseBotTarget(bot);
  const botPos = bot.mesh.position;
  const botSpeed = getMoveSpeed(bot) * diff.speedMult;
  tempVec3.set(0, 0, 0);

  const dxZone = botPos.x - state.safeCenter.x;
  const dzZone = botPos.z - state.safeCenter.y;
  const distToZoneCenter = Math.hypot(dxZone, dzZone);
  const outsideZone = !state.chopWoodMode && !state.takedownMode && zone && distToZoneCenter > zone.radius * 0.85;

  if (outsideZone && zone.damage > 0) {
    const toCenter = Math.atan2(-dxZone, -dzZone);
    bot.yaw = toCenter;
    tempVec3.set(Math.sin(toCenter), 0, Math.cos(toCenter)).multiplyScalar(botSpeed);
    if (target) {
      const toTargetX = target.mesh.position.x - botPos.x;
      const toTargetZ = target.mesh.position.z - botPos.z;
      if (Math.hypot(toTargetX, toTargetZ) <= getAttackRange(bot) * 1.05) {
        bot.yaw = Math.atan2(toTargetX, toTargetZ);
        beginAttack(bot);
      }
    }
  } else if (bot.health < bot.maxHealth * diff.fleePct && target) {
    const toTargetX = target.mesh.position.x - botPos.x;
    const toTargetZ = target.mesh.position.z - botPos.z;
    const distance = Math.hypot(toTargetX, toTargetZ);
    const nearBush = findNearestBush(botPos);
    if (nearBush && !isInBush(bot)) {
      const toBushX = nearBush.x - botPos.x;
      const toBushZ = nearBush.z - botPos.z;
      const bushDist = Math.hypot(toBushX, toBushZ);
      if (bushDist < 15) {
        bot.yaw = Math.atan2(toBushX, toBushZ);
        tempVec3.set(Math.sin(bot.yaw), 0, Math.cos(bot.yaw)).multiplyScalar(botSpeed);
      } else {
        const fleeYaw = Math.atan2(-toTargetX, -toTargetZ);
        bot.yaw = fleeYaw;
        tempVec3.set(Math.sin(fleeYaw), 0, Math.cos(fleeYaw)).multiplyScalar(botSpeed * 0.9);
      }
    } else if (isInBush(bot)) {
      tempVec3.set(0, 0, 0);
    } else {
      const fleeYaw = Math.atan2(-toTargetX, -toTargetZ);
      bot.yaw = fleeYaw;
      tempVec3.set(Math.sin(fleeYaw), 0, Math.cos(fleeYaw)).multiplyScalar(botSpeed * 0.9);
    }
    if (distance <= getAttackRange(bot) * 1.05) {
      bot.yaw = Math.atan2(toTargetX, toTargetZ);
      beginAttack(bot);
    }
  } else if (target) {
    const nav = findNavTarget(bot, target.mesh.position.x, target.mesh.position.z);
    const toTargetX = nav.x - botPos.x;
    const toTargetZ = nav.z - botPos.z;
    const distance = Math.hypot(target.mesh.position.x - botPos.x, target.mesh.position.z - botPos.z);
    bot.yaw = Math.atan2(toTargetX, toTargetZ);
    const atkRange = getAttackRange(bot);
    const isRanged = ["green", "blue", "orange", "yellow", "cyan", "purple"].includes(bot.characterType);
    const ct = bot.characterType;
    let idealDist;
    if (ct === "green") idealDist = 1.5;
    else if (ct === "red") idealDist = 3.5;
    else if (ct === "orange") idealDist = 8;
    else if (ct === "blue") idealDist = 14;
    else if (ct === "yellow") idealDist = 9;
    else if (ct === "cyan") idealDist = 6;
    else if (ct === "purple") idealDist = 11;
    else if (ct === "pink") idealDist = 3;
    else idealDist = atkRange * 0.6;

    let purpleIsVialTurn = false;
    if (ct === "purple") {
      purpleIsVialTurn = ((bot.attackIndex || 0) % 2) === 1;
      if (!purpleIsVialTurn) {
        idealDist = 11; // 침 턴: 최대 사거리 유지
      } else if (state.gameTime < bot.nextAttackAt) {
        idealDist = 14; // 침 발사 직후: 독 틱 동안 후퇴
      } else {
        idealDist = 8;  // 약병 준비됨: 접근
      }
    }

    if (ct === "pink" && state.chopWoodMode) {
      // 체력 낮은 아군 근처에서 싸우기
      let lowestAlly = null, lowestHpPct = 0.7;
      for (const f of state.players) {
        if (f.dead || f.id === bot.id || f.team !== bot.team) continue;
        const hpPct = f.health / f.maxHealth;
        if (hpPct < lowestHpPct) { lowestHpPct = hpPct; lowestAlly = f; }
      }
      if (lowestAlly) {
        const allyDist = Math.hypot(lowestAlly.mesh.position.x - botPos.x, lowestAlly.mesh.position.z - botPos.z);
        if (allyDist > CHARACTERS.pink.healCircleRange + 1) {
          const allyNav = findNavTarget(bot, lowestAlly.mesh.position.x, lowestAlly.mesh.position.z);
          bot.yaw = Math.atan2(allyNav.x - botPos.x, allyNav.z - botPos.z);
          tempVec3.set(Math.sin(bot.yaw), 0, Math.cos(bot.yaw)).multiplyScalar(botSpeed);
        } else {
          tempVec3.set(Math.sin(bot.yaw + Math.PI / 2), 0, Math.cos(bot.yaw + Math.PI / 2)).multiplyScalar(botSpeed * 0.3 * bot.botStrafeDir);
        }
      }
    } else if (ct === "blue" && distance < 8) {
      // 적이 반사거리 이내로 접근하면 전속력 후퇴
      const fleeYaw = Math.atan2(-toTargetX, -toTargetZ);
      tempVec3.set(Math.sin(fleeYaw), 0, Math.cos(fleeYaw)).multiplyScalar(botSpeed);
    } else if (ct === "orange" && distance < 8) {
      // 적이 반사거리 이내로 접근하면 전속력 후퇴 (탱커 견제용 거리 유지)
      const fleeYaw = Math.atan2(-toTargetX, -toTargetZ);
      tempVec3.set(Math.sin(fleeYaw), 0, Math.cos(fleeYaw)).multiplyScalar(botSpeed);
    } else if (ct === "cyan" && distance < 8) {
      // 적이 반사거리 이내로 접근하면 전속력 후퇴
      const fleeYaw = Math.atan2(-toTargetX, -toTargetZ);
      tempVec3.set(Math.sin(fleeYaw), 0, Math.cos(fleeYaw)).multiplyScalar(botSpeed);
    } else if (ct === "yellow" && state.gameTime < (bot.yellowKiteUntil || 0)) {
      // 감전 후 키팅: 거리 벌리며 계속 견제
      const fleeYaw = Math.atan2(-toTargetX, -toTargetZ);
      tempVec3.set(Math.sin(fleeYaw), 0, Math.cos(fleeYaw)).multiplyScalar(botSpeed * 0.75);
    } else if (ct === "purple" && !purpleIsVialTurn && distance >= idealDist - 1.5) {
      const sYaw = bot.yaw + Math.PI / 2 * bot.botStrafeDir;
      tempVec3.set(Math.sin(sYaw), 0, Math.cos(sYaw)).multiplyScalar(botSpeed * 0.55);
    } else if (ct === "green" && distance > idealDist + 1.5 && getAttackRange(target) > atkRange) {
      const zigzag = Math.sin(state.gameTime * 4 + bot.id) * 0.8;
      const rushYaw = bot.yaw + zigzag;
      tempVec3.set(Math.sin(rushYaw), 0, Math.cos(rushYaw)).multiplyScalar(botSpeed);
    } else if (distance > idealDist + 1.5) {
      tempVec3.set(Math.sin(bot.yaw), 0, Math.cos(bot.yaw)).multiplyScalar(botSpeed * 0.85);
    } else if (distance < idealDist - 1) {
      const fleeYaw = Math.atan2(-toTargetX, -toTargetZ);
      tempVec3.set(Math.sin(fleeYaw), 0, Math.cos(fleeYaw)).multiplyScalar(botSpeed * 0.6);
    } else {
      tempVec3.set(Math.sin(bot.yaw + Math.PI / 2), 0, Math.cos(bot.yaw + Math.PI / 2))
        .multiplyScalar(botSpeed * 0.3 * bot.botStrafeDir);
    }

    // 오렌지: 매 프레임 상대 위치 기록 (선조준용)
    if (ct === "orange") {
      bot.prevTargetX = target.mesh.position.x;
      bot.prevTargetZ = target.mesh.position.z;
      bot.prevTargetTime = state.gameTime;
    }

    if (distance <= atkRange * diff.aimMult && Math.random() > diff.reactDelay) {
      // 오렌지: 폭탄 비행시간 × 상대 속도로 선조준
      if (ct === "orange") {
        const bombSpd = CHARACTERS.orange.bombSpeed;
        const travelTime = distance / bombSpd;
        const prevX = bot.prevPrevTargetX ?? target.mesh.position.x;
        const prevZ = bot.prevPrevTargetZ ?? target.mesh.position.z;
        const prevT = bot.prevPrevTargetTime ?? state.gameTime;
        const dtPrev = state.gameTime - prevT;
        if (dtPrev > 0.02) {
          const tvx = (bot.prevTargetX - prevX) / dtPrev;
          const tvz = (bot.prevTargetZ - prevZ) / dtPrev;
          const predX = target.mesh.position.x + tvx * travelTime;
          const predZ = target.mesh.position.z + tvz * travelTime;
          bot.yaw = Math.atan2(predX - botPos.x, predZ - botPos.z);
        }
        bot.prevPrevTargetX = bot.prevTargetX;
        bot.prevPrevTargetZ = bot.prevTargetZ;
        bot.prevPrevTargetTime = bot.prevTargetTime;
      }
      if (ct === "yellow") bot.yellowKiteUntil = state.gameTime + 1.5;
      if (ct === "purple" && target.health < target.maxHealth * 0.3) {
        if ((bot.attackIndex || 0) % 2 === 0) bot.attackIndex = (bot.attackIndex || 0) + 1;
      }
      beginAttack(bot);
    }
  } else if (state.chopWoodMode) {
    const enemyTree = getChopWoodEnemyTree(bot);
    if (enemyTree) {
      const treeDist = Math.hypot(enemyTree.x - botPos.x, enemyTree.z - botPos.z);
      if (treeDist > 2.5) {
        const treeNav = findNavTarget(bot, enemyTree.x, enemyTree.z);
        bot.yaw = Math.atan2(treeNav.x - botPos.x, treeNav.z - botPos.z);
        tempVec3.set(Math.sin(bot.yaw), 0, Math.cos(bot.yaw)).multiplyScalar(botSpeed * 0.75);
      } else {
        tempVec3.set(0, 0, 0);
      }
    }
  } else {
    if (state.gameTime >= bot.botDecisionAt) {
      bot.botDecisionAt = state.gameTime + 1.6 + Math.random() * 2.1;
      const angle = Math.random() * Math.PI * 2;
      const radius = 8 + Math.random() * 16;
      bot.botMoveTarget.set(
        THREE.MathUtils.clamp(botPos.x + Math.cos(angle) * radius, -46, 46),
        0,
        THREE.MathUtils.clamp(botPos.z + Math.sin(angle) * radius, -46, 46),
      );
    }

    const wanderNav = findNavTarget(bot, bot.botMoveTarget.x, bot.botMoveTarget.z);
    tempVec3.set(wanderNav.x - botPos.x, 0, wanderNav.z - botPos.z);
    if (tempVec3.lengthSq() > 1) {
      bot.yaw = Math.atan2(tempVec3.x, tempVec3.z);
      tempVec3.normalize().multiplyScalar(botSpeed * 0.62);
    } else {
      tempVec3.set(0, 0, 0);
    }
  }

  if (!state.chopWoodMode && !state.takedownMode) {
    const distFromCenter = Math.hypot(botPos.x - state.safeCenter.x, botPos.z - state.safeCenter.y);
    if (distFromCenter > zone.radius - 4) {
      const zoneNav = findNavTarget(bot, state.safeCenter.x, state.safeCenter.y);
      const toCenterX = zoneNav.x - botPos.x;
      const toCenterZ = zoneNav.z - botPos.z;
      const len = Math.hypot(toCenterX, toCenterZ) || 1;
      tempVec3.set((toCenterX / len) * botSpeed, 0, (toCenterZ / len) * botSpeed);
      bot.yaw = Math.atan2(tempVec3.x, tempVec3.z);
    }
  }

  const moveSpeed = Math.hypot(tempVec3.x, tempVec3.z);
  if (moveSpeed > 0.0001) {
    const lookahead = bot.radius + 0.35;
    const dirX = tempVec3.x / moveSpeed;
    const dirZ = tempVec3.z / moveSpeed;
    const escapeDir = findWallEscapeDir(bot, dirX, dirZ, lookahead);
    if (escapeDir) {
      tempVec3.set(escapeDir.x * moveSpeed, 0, escapeDir.z * moveSpeed);
      bot.yaw = Math.atan2(escapeDir.x, escapeDir.z);
    }
  }

  bot.mesh.rotation.y = bot.yaw;
  moveFighter(bot, tempVec3, dt);
}

function updateFighterAnimation(fighter, dt) {
  if (fighter.dead) {
    return;
  }

  const pulse = (time, start, peak, end) => {
    if (time <= start || time >= end) {
      return 0;
    }
    if (time <= peak) {
      return (time - start) / Math.max(peak - start, 0.0001);
    }
    return 1 - (time - peak) / Math.max(end - peak, 0.0001);
  };

  const body = fighter.mesh.userData;
  const speed = Math.hypot(
    fighter.mesh.position.x - (fighter.lastX ?? fighter.mesh.position.x),
    fighter.mesh.position.z - (fighter.lastZ ?? fighter.mesh.position.z),
  ) / Math.max(dt, 0.001);
  fighter.lastX = fighter.mesh.position.x;
  fighter.lastZ = fighter.mesh.position.z;

  const charType = fighter.characterType;
  const walkStyle = CHARACTERS[charType]?.walk ?? CHARACTERS.red.walk;
  const walkCycle = state.gameTime * walkStyle.cycleSpeed + fighter.id;
  const swing = Math.min(1, speed / 8);
  let leftLeg = Math.sin(walkCycle) * walkStyle.legAmp * swing;
  let rightLeg = -Math.sin(walkCycle) * walkStyle.legAmp * swing;
  let leftArmX = -Math.sin(walkCycle) * walkStyle.armAmp * swing;
  let rightArmX = Math.sin(walkCycle) * walkStyle.armAmp * swing;
  let leftArmZ = walkStyle.armRestZ;
  let rightArmZ = -walkStyle.armRestZ;
  let bodyZ = Math.sin(walkCycle * 0.5) * 0.03;
  let bodyY = 0;
  let headX = 0;
  let headY = 0;
  let leftElbowX = 0;
  let rightElbowX = 0;

  if (charType === "red") {
    leftArmX += -0.7 + Math.sin(state.gameTime * 2.5) * 0.04;
    rightArmX += -0.7 + Math.sin(state.gameTime * 2.5 + 1) * 0.04;
    leftArmZ = 0.05;
    rightArmZ = -0.05;
    leftElbowX = -1.0 + Math.sin(state.gameTime * 2.5) * 0.05;
    rightElbowX = -1.0 + Math.sin(state.gameTime * 2.5 + 1) * 0.05;
    bodyZ += Math.sin(walkCycle) * 0.02 * swing;
    headX += -0.06;
  } else if (charType === "pink") {
    leftArmX = -0.55;
    leftArmZ = 0.20;
    leftElbowX = -0.7;
    rightArmX = -0.25 + Math.sin(state.gameTime * 2.5) * 0.04;
    rightArmZ = -0.10;
    rightElbowX = -0.4 + Math.sin(state.gameTime * 2.5) * 0.06;
    rightElbowX = -0.8 + Math.sin(state.gameTime * 3) * 0.1;
    headX = -0.05;
  }

  if (fighter.attackAnimTime >= 0) {
    fighter.attackAnimTime += dt;
    const t = fighter.attackAnimTime;

    if (charType === "green") {
      // 부메랑 던지기: 팔을 뒤로 젖혔다가 앞으로 내던짐
      const windup = pulse(t, 0, 0.1, 0.2);
      const release = pulse(t, 0.2, 0.28, 0.5);
      rightArmX += windup * 0.9 - release * 1.6;
      rightArmZ += -windup * 0.4 - release * 0.2;
      leftArmX += -windup * 0.15 + release * 0.25;
      bodyY += windup * 0.12 - release * 0.28;
      bodyZ += -windup * 0.04 + release * 0.06;
      headY += windup * 0.06 - release * 0.14;
      rightLeg += -windup * 0.08 + release * 0.15;
    } else if (charType === "blue") {
      // 사격: 양팔로 조준 후 발사 반동
      const raise = Math.min(1, t / 0.06) * (t > 0.5 ? Math.max(0, 1 - (t - 0.5) / 0.1) : 1);
      const recoil = pulse(t, 0.06, 0.1, 0.25);
      rightArmX += -raise * 1.3 + recoil * 0.3;
      leftArmX += -raise * 1.1 + recoil * 0.2;
      bodyZ += -recoil * 0.05;
      headX += recoil * 0.04;
    } else if (charType === "pink") {
      const slam = pulse(t, 0.02, 0.12, 0.25);
      const recover = pulse(t, 0.25, 0.4, 0.55);
      leftArmX += -slam * 1.2 + recover * 0.3;
      rightArmX += -slam * 1.2 + recover * 0.3;
      leftArmZ += slam * 0.4;
      rightArmZ += -slam * 0.4;
      bodyZ += slam * 0.06 - recover * 0.02;
      bodyY += -slam * 0.08;
    } else if (charType === "purple") {
      const raise = Math.min(1, t / 0.08) * (t > 0.5 ? Math.max(0, 1 - (t - 0.5) / 0.1) : 1);
      const recoil = pulse(t, 0.08, 0.14, 0.3);
      rightArmX += -raise * 1.2 + recoil * 0.4;
      leftArmX += -raise * 0.6 + recoil * 0.15;
      bodyZ += -recoil * 0.04;
      headX += recoil * 0.03;
    } else if (charType === "orange" || charType === "cyan" || charType === "yellow") {
      const windup = pulse(t, 0.00, 0.10, 0.18);
      const throwRelease = pulse(t, 0.18, 0.24, 0.32);
      const recover = pulse(t, 0.32, 0.50, 0.60);
      rightArmX += -windup * 1.2 + throwRelease * 1.8 - recover * 0.4;
      rightArmZ += -windup * 0.5;
      leftArmX += windup * 0.2 - throwRelease * 0.3;
      bodyY += windup * 0.1 - throwRelease * 0.15;
      bodyZ += -windup * 0.08 + throwRelease * 0.1;
      headY += windup * 0.05;
      leftLeg += -windup * 0.05 + recover * 0.08;
      rightLeg += windup * 0.05 - recover * 0.08;
    } else if (charType === "red") {
      // Red 더블 펀치 — 몸 전체로 치는 강펀치
      const punchOne = pulse(t, 0.02, 0.10, 0.18);
      const punchTwo = pulse(t, 0.20, 0.30, 0.40);
      const recover = pulse(t, 0.40, 0.50, 0.6);
      rightArmX += -fighter.attackSwing * 0.5 - punchOne * 1.8 + recover * 0.3;
      leftArmX += -fighter.attackSwing * 0.3 - punchTwo * 1.7 + recover * 0.25;
      rightArmZ += -punchOne * 0.25;
      leftArmZ += punchTwo * 0.25;
      rightElbowX += punchOne * 0.5 - recover * 0.3;
      leftElbowX += punchTwo * 0.5 - recover * 0.3;
      leftLeg += -punchOne * 0.15 + punchTwo * 0.25;
      rightLeg += punchOne * 0.25 - punchTwo * 0.15;
      bodyY += -punchOne * 0.30 + punchTwo * 0.30;
      bodyZ += punchOne * 0.08 - punchTwo * 0.07;
      headY += -punchOne * 0.18 + punchTwo * 0.18;
      headX += punchOne * 0.06 + punchTwo * 0.04;
    } else {
      // 기본 더블 펀치 콤보
      const punchOne = pulse(t, 0.02, 0.11, 0.2);
      const punchTwo = pulse(t, 0.2, 0.31, 0.43);
      const recover = pulse(t, 0.43, 0.5, 0.6);
      leftLeg += -punchOne * 0.08 + punchTwo * 0.18;
      rightLeg += punchOne * 0.18 - punchTwo * 0.08;
      leftArmX += -fighter.attackSwing * 0.32 - punchTwo * 1.25 + recover * 0.18;
      rightArmX += -fighter.attackSwing * 0.42 - punchOne * 1.35 + recover * 0.2;
      leftArmZ += punchTwo * 0.18;
      rightArmZ += -punchOne * 0.18;
      bodyZ += punchOne * 0.06 - punchTwo * 0.05;
      bodyY += -punchOne * 0.22 + punchTwo * 0.22;
      headY += -punchOne * 0.12 + punchTwo * 0.12;
      headX += punchOne * 0.03 + punchTwo * 0.03;
    }

    if (t > 0.6) {
      fighter.attackAnimTime = -1;
    }
  }

  body.leftArm.rotation.x = leftArmX;
  body.rightArm.rotation.x = rightArmX;
  body.leftArm.rotation.z = leftArmZ;
  body.rightArm.rotation.z = rightArmZ;
  body.leftForeArm.rotation.x = leftElbowX;
  body.rightForeArm.rotation.x = rightElbowX;
  body.leftLeg.rotation.x = leftLeg;
  body.rightLeg.rotation.x = rightLeg;
  body.leftShin.rotation.x = Math.max(0, leftLeg * 0.5);
  body.rightShin.rotation.x = Math.max(0, rightLeg * 0.5);
  body.leftShoulder.rotation.x = leftArmX * 0.35;
  body.leftShoulder.rotation.z = (leftArmZ - Math.PI * 0.1) * 0.3;
  body.rightShoulder.rotation.x = rightArmX * 0.35;
  body.rightShoulder.rotation.z = (rightArmZ + Math.PI * 0.1) * 0.3;
  body.leftThigh.rotation.x = leftLeg * 0.45;
  body.rightThigh.rotation.x = rightLeg * 0.45;
  body.body.rotation.z = bodyZ;
  body.body.rotation.y = bodyY;
  body.head.rotation.y = headY;
  body.head.rotation.x = headX;

  fighter.attackSwing = Math.max(0, fighter.attackSwing - dt * 5);
  fighter.spread = Math.max(0, fighter.spread - dt * 0.13);
  fighter.recoilKick = Math.max(0, fighter.recoilKick - dt * 3.4);
  fighter.pitchKick = Math.max(0, fighter.pitchKick - dt * 4.2);

  const setEmissive = (color, intensity) => {
    for (const m of fighter.bodyMaterials) { m.emissive = color; m.emissiveIntensity = intensity; }
  };
  if (fighter.flashTimer > 0) {
    fighter.flashTimer -= dt;
    setEmissive(new THREE.Color(0x7f0f0f), fighter.flashTimer > 0 ? 0.75 : 0);
  } else if (fighter.shockUntil && state.gameTime < fighter.shockUntil) {
    const pulse = Math.sin(state.gameTime * 12) * 0.15 + 0.3;
    setEmissive(new THREE.Color(0x2299cc), pulse);
    if (!fighter.nextShockVfx || state.gameTime >= fighter.nextShockVfx) {
      fighter.nextShockVfx = state.gameTime + 0.5;
      const fx = fighter.mesh.position.x;
      const fz = fighter.mesh.position.z;
      for (let ci = 0; ci < 4; ci++) {
        const crystal = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.5, 0),
          new THREE.MeshBasicMaterial({ color: 0x88ddff, transparent: true, opacity: 0.8, depthWrite: false }),
        );
        const baseAngle = (ci / 4) * Math.PI * 2;
        crystal.position.set(fx + Math.cos(baseAngle) * 1.5, 1.2, fz + Math.sin(baseAngle) * 1.5);
        scene.add(crystal);
        state.effects.push({ mesh: crystal, life: 0.5, maxLife: 0.5, type: "iceCrystal", cx: fx, cz: fz, angle: baseAngle, radius: 1.5 });
      }
      const frost = new THREE.Mesh(
        new THREE.RingGeometry(1.4, 1.65, 6),
        new THREE.MeshBasicMaterial({ color: 0xaaeeff, transparent: true, opacity: 0.4, side: THREE.DoubleSide, depthWrite: false }),
      );
      frost.rotation.x = -Math.PI / 2;
      frost.position.set(fx, 0.1, fz);
      scene.add(frost);
      state.effects.push({ mesh: frost, life: 0.5, maxLife: 0.5, type: "frostRing" });
    }
  } else if (fighter.poisonUntil && state.gameTime < fighter.poisonUntil) {
    const pulse = Math.sin(state.gameTime * 8) * 0.15 + 0.25;
    setEmissive(new THREE.Color(0x44aa22), pulse);
  } else {
    setEmissive(new THREE.Color(0x000000), 0);
  }

  const fill = fighter.healthBar.userData.fill;
  const healthRatio = fighter.health / fighter.maxHealth;
  fill.scale.x = THREE.MathUtils.clamp(healthRatio, 0, 1);
  fill.position.x = (-1.31 * (1 - fill.scale.x)) * 0.5;
  fighter.healthBar.quaternion.copy(camera.quaternion);
}

function updateAmmoRegen(dt) {
  for (const fighter of state.players) {
    if (fighter.dead) {
      continue;
    }
    if (fighter.ammo >= fighter.maxAmmo) {
      fighter.reloadTimer = 0;
      continue;
    }
    if (state.gameTime < fighter.nextAttackAt) {
      continue;
    }
    fighter.reloadTimer += dt;
    const interval = getReloadInterval(fighter);
    while (fighter.reloadTimer >= interval && fighter.ammo < fighter.maxAmmo) {
      fighter.reloadTimer -= interval;
      fighter.ammo += 1;
      if (fighter.isPlayer && fighter.ammo >= fighter.maxAmmo) {
        audio.play("reload");
      }
    }
  }
}

function updateZoneDamage(dt, zone) {
  if (state.trainingMode || state.chopWoodMode) return;
  state.playerOutsideZone = false;
  for (const fighter of state.players) {
    if (fighter.dead || zone.damage <= 0) {
      continue;
    }

    const dx = fighter.mesh.position.x - state.safeCenter.x;
    const dz = fighter.mesh.position.z - state.safeCenter.y;
    const distance = Math.hypot(dx, dz);
    if (distance > zone.radius) {
      applyDamage(fighter, zone.damage * dt);
      if (fighter.isPlayer) {
        state.playerOutsideZone = true;
        warning.classList.remove("hidden");
        if (state.gameTime > state.feedback.warningPulseUntil) {
          audio.play("warning");
          state.feedback.warningPulseUntil = state.gameTime + 1.25;
        }
      }
    }
  }
}

function updateCamera(dt) {
  const player = getPlayer();
  if (!player) {
    return;
  }

  const target = player.mesh.position.clone();
  target.y = 0.8;

  const desired = target.clone();
  desired.y += 18.5;
  camera.up.set(0, 0, -1);
  camera.position.lerp(desired, 1 - Math.exp(-dt * 10));
  camera.lookAt(target);
}

function updateAttackAimIndicator() {
  const player = getPlayer();
  const charType = player?.characterType;

  if (!player || player.dead || !state.running || !state.mouseHeld) {
    attackAimIndicator.visible = false;
    greenAimIndicator.visible = false;
    blueAimIndicator.visible = false;
    orangeAimIndicator.visible = false;
    yellowAimIndicator.visible = false;
    cyanAimIndicator.visible = false;
    purpleAimIndicator.visible = false;
    pinkAimIndicator.visible = false;
    return;
  }

  const pos = player.mesh.position;
  const yaw = player.yaw;
  const unavailable = player.ammo <= 0;

  attackAimIndicator.visible = false;
  greenAimIndicator.visible = false;
  blueAimIndicator.visible = false;
  orangeAimIndicator.visible = false;
  yellowAimIndicator.visible = false;
  cyanAimIndicator.visible = false;
  purpleAimIndicator.visible = false;
  pinkAimIndicator.visible = false;

  const range = getAttackRange(player);
  const alpha = unavailable ? 0.06 : 0.2;

  if (charType === "red") {
    attackAimIndicator.visible = true;
    attackAimIndicator.position.set(pos.x, 0, pos.z);
    attackAimIndicator.rotation.y = yaw;
    attackAimIndicator.userData.rects.forEach((r) => { r.material.opacity = alpha; });
  } else if (charType === "green") {
    greenAimIndicator.visible = true;
    greenAimIndicator.position.set(pos.x, 0, pos.z);
    greenAimIndicator.rotation.y = yaw;
    greenAimIndicator.userData.fanMesh.material.opacity = unavailable ? 0.05 : 0.13;
  } else if (charType === "blue") {
    blueAimIndicator.visible = true;
    blueAimIndicator.position.set(pos.x, 0, pos.z);
    blueAimIndicator.rotation.y = yaw;
    blueAimIndicator.userData.beam.scale.set(1, 1, 1);
    blueAimIndicator.userData.beam.material.opacity = unavailable ? 0.07 : 0.22;
    blueAimIndicator.userData.dot.material.opacity = unavailable ? 0.15 : 0.50;
  } else if (charType === "orange") {
    orangeAimIndicator.visible = true;
    orangeAimIndicator.position.set(pos.x, 0, pos.z);
    orangeAimIndicator.rotation.y = yaw;
    orangeAimIndicator.userData.beam.scale.set(1, 1, 1);
    orangeAimIndicator.userData.beam.material.opacity = unavailable ? 0.06 : 0.2;
    orangeAimIndicator.userData.dot.material.opacity = unavailable ? 0.12 : 0.45;
  } else if (charType === "yellow") {
    yellowAimIndicator.visible = true;
    yellowAimIndicator.position.set(pos.x, 0, pos.z);
    yellowAimIndicator.rotation.y = yaw;
    yellowAimIndicator.userData.beam.scale.set(1, 1, 1);
    yellowAimIndicator.userData.beam.material.opacity = unavailable ? 0.06 : 0.2;
    yellowAimIndicator.userData.dot.material.opacity = unavailable ? 0.12 : 0.45;
  } else if (charType === "cyan") {
    cyanAimIndicator.visible = true;
    cyanAimIndicator.position.set(pos.x, 0, pos.z);
    cyanAimIndicator.rotation.y = yaw;
    cyanAimIndicator.userData.beam.scale.set(1, 1, 1);
    cyanAimIndicator.userData.beam.material.opacity = unavailable ? 0.06 : 0.2;
    cyanAimIndicator.userData.dot.material.opacity = unavailable ? 0.12 : 0.45;
  } else if (charType === "purple") {
    const isNeedle = (player.attackIndex ?? 0) % 2 === 0;
    purpleAimIndicator.visible = true;
    purpleAimIndicator.position.set(pos.x, 0, pos.z);
    purpleAimIndicator.rotation.y = yaw;
    purpleAimIndicator.userData.beam.material.opacity = unavailable ? 0.04 : 0.15;
    purpleAimIndicator.userData.ring.visible = !isNeedle;
    purpleAimIndicator.userData.fill.visible = !isNeedle;
    purpleAimIndicator.userData.dot.visible = isNeedle;
    if (isNeedle) {
      purpleAimIndicator.userData.dot.material.opacity = unavailable ? 0.12 : 0.45;
    } else {
      purpleAimIndicator.userData.ring.material.opacity = unavailable ? 0.1 : 0.4;
      purpleAimIndicator.userData.fill.material.opacity = unavailable ? 0.02 : 0.08;
    }
  } else if (charType === "pink") {
    pinkAimIndicator.visible = true;
    pinkAimIndicator.position.set(pos.x, 0, pos.z);
    pinkAimIndicator.scale.setScalar(player.hasPinkAreaHealAbility ? 1.75 : 1);
    pinkAimIndicator.userData.ring.material.opacity = unavailable ? 0.1 : 0.35;
    pinkAimIndicator.userData.fill.material.opacity = unavailable ? 0.02 : 0.06;
  }
}

function updateBushVisuals() {
  const player = getPlayer();
  if (!player) return;

  for (const bush of state.bushes) {
    if (!bush.mesh) continue;
    const dx = player.mesh.position.x - bush.x;
    const dz = player.mesh.position.z - bush.z;
    const playerInThis = dx * dx + dz * dz < bush.radius * bush.radius;
    bush.mesh.traverse((child) => {
      if (child.isMesh) child.material.opacity = playerInThis ? 0.35 : 1.0;
    });
  }

  for (const fighter of state.players) {
    if (fighter.isPlayer || fighter.dead) continue;
    const inBush = isInBush(fighter);
    const dx = fighter.mesh.position.x - player.mesh.position.x;
    const dz = fighter.mesh.position.z - player.mesh.position.z;
    const distSq = dx * dx + dz * dz;
    const revealed = state.gameTime < fighter.revealedUntil;
    const shouldHide = inBush && !revealed && distSq > bushStealthRevealRangeSq;
    fighter.mesh.visible = !shouldHide && !fighter.dead;
    fighter.shadow.visible = !shouldHide && !fighter.dead;
    fighter.healthBar.visible = !shouldHide;
  }
}

function updateHud() {
  const player = getPlayer();
  if (!player) {
    return;
  }

  const healthRatio = THREE.MathUtils.clamp(player.health / player.maxHealth, 0, 1);
  healthFill.style.width = `${healthRatio * 100}%`;
  healthText.textContent = `${Math.round(player.health)} / ${player.maxHealth}`;
  healthValue.textContent = `${Math.round(player.health)}`;
  charName.textContent = player.name;
  const reloadInterval = getReloadInterval(player);
  const reloadProgress = player.ammo >= player.maxAmmo
    ? 1
    : THREE.MathUtils.clamp(player.reloadTimer / reloadInterval, 0, 1);

  reloadBar.style.width = `${reloadProgress * 100}%`;
  reloadBar.dataset.state = player.ammo >= player.maxAmmo ? "full" : "reloading";

  if (player.ammo >= player.maxAmmo) {
    reloadState.textContent = t("ammoFull");
  } else {
    const remain = Math.max(0, reloadInterval - player.reloadTimer);
    reloadState.textContent = t("nextAmmo", remain.toFixed(1));
  }
  const attackLabel =
  player.characterType === "green" ? t("boomerang") :
  player.characterType === "blue" ? t("sniper") :
  player.characterType === "orange" ? t("bombAttack") :
  player.characterType === "yellow" ? t("electricAttack") :
  player.characterType === "cyan" ? t("spreadLineAttack") :
  player.characterType === "purple" ? t("poisonAttack") :
  player.characterType === "pink" ? t("healCircleAttack") :
  t("doublePunch");
  attackState.textContent = player.ammo <= 0 ? t("noAmmo") : attackLabel;
  spreadState.textContent = t("stability", Math.round((1 - player.spread * 0.55) * 100));
  updateAmmoPips(player.ammo);

  emoteBtns.forEach((btn, i) => {
    if (!btn || btn.classList.contains("hidden")) return;
    const cdLeft = Math.ceil(emoteCooldownUntil[i] - state.gameTime);
    let cdLabel = btn.querySelector(".emote-cd-label");
    if (cdLeft > 0) {
      btn.classList.add("cooldown");
      if (!cdLabel) { cdLabel = document.createElement("span"); cdLabel.className = "emote-cd-label"; btn.appendChild(cdLabel); }
      cdLabel.textContent = `${cdLeft}s`;
    } else {
      btn.classList.remove("cooldown");
      if (cdLabel) cdLabel.remove();
    }
  });

  if (state.takedownMode) {
    survivorsPanel.style.display = "none";
    zonePanel.classList.add("is-hidden-panel");
    warning.classList.add("hidden");
    zoneRing.ring.visible = false;
    zoneRing.wall.visible = false;
    exitTrainingBtn.classList.add("hidden");
    cwHud.classList.add("hidden");
  } else if (state.chopWoodMode) {
    survivorsPanel.style.display = "none";
    zonePanel.classList.add("is-hidden-panel");
    warning.classList.add("hidden");
    zoneRing.ring.visible = false;
    zoneRing.wall.visible = false;
    exitTrainingBtn.classList.add("hidden");
    cwHud.classList.remove("hidden");

    if (state.teams) {
      const allyTeam = state.playerTeam || "a";
      const enemyTeam = allyTeam === "a" ? "b" : "a";
      const allyTree = state.teams[allyTeam].tree;
      const enemyTree = state.teams[enemyTeam].tree;

      cwTreeALabel.textContent = t("cwTeamA");
      cwTreeBLabel.textContent = t("cwTeamB");
      cwTreeAFill.style.width = `${(allyTree.health / allyTree.maxHealth) * 100}%`;
      cwTreeBFill.style.width = `${(enemyTree.health / enemyTree.maxHealth) * 100}%`;
      cwTreeAText.textContent = `${Math.round(allyTree.health)} / ${allyTree.maxHealth}`;
      cwTreeBText.textContent = `${Math.round(enemyTree.health)} / ${enemyTree.maxHealth}`;

      const treeBarA = state.teams[allyTeam].treeBar;
      const treeBarB = state.teams[enemyTeam].treeBar;
      if (treeBarA) {
        const fill = treeBarA.userData.fill;
        fill.scale.x = THREE.MathUtils.clamp(allyTree.health / allyTree.maxHealth, 0, 1);
        fill.position.x = (-3.0 * (1 - fill.scale.x)) * 0.5;
        treeBarA.quaternion.copy(camera.quaternion);
      }
      if (treeBarB) {
        const fill = treeBarB.userData.fill;
        fill.scale.x = THREE.MathUtils.clamp(enemyTree.health / enemyTree.maxHealth, 0, 1);
        fill.position.x = (-3.0 * (1 - fill.scale.x)) * 0.5;
        treeBarB.quaternion.copy(camera.quaternion);
      }
    }

    const grade = AXE_GRADES[player.axeLevel];
    cwAxeIcon.style.backgroundColor = `#${grade.color.toString(16).padStart(6, "0")}`;
    cwAxeName.textContent = `${t("cwAxeLabel")}: ${t(grade.key)}`;

    if (player.dead && player.respawnAt > 0) {
      const remain = Math.max(0, player.respawnAt - state.gameTime);
      cwRespawnEl.textContent = t("cwRespawn", Math.ceil(remain));
      cwRespawnEl.classList.remove("hidden");
    } else {
      cwRespawnEl.classList.add("hidden");
    }

    if (player.isChopping && !player.dead) {
      cwChopBar.classList.remove("hidden");
      cwChopLabel.textContent = t("cwChopping");
      cwChopFill.style.width = `${(player.chopTimer / 1) * 100}%`;
    } else {
      cwChopBar.classList.add("hidden");
    }

    for (const fighter of state.players) {
      if (fighter.axeIndicator) {
        fighter.axeIndicator.quaternion.copy(camera.quaternion);
      }
    }
  } else if (state.trainingMode) {
    cwHud.classList.add("hidden");
    survivorsPanel.style.display = "none";
    zonePanel.classList.add("is-hidden-panel");
    warning.classList.add("hidden");
    zoneRing.ring.visible = false;
    zoneRing.wall.visible = false;
    exitTrainingBtn.classList.remove("hidden");
  } else {
    cwHud.classList.add("hidden");
    exitTrainingBtn.classList.add("hidden");
    survivorsPanel.style.display = "";
    const alive = state.players.filter((fighter) => !fighter.dead).length;
    survivorsLabel.textContent = `${alive}`;
    const zone = getCurrentZone();
    const showZoneEvent = state.gameTime >= zonePhases[1].start;
    zonePanel.classList.toggle("is-hidden-panel", !showZoneEvent);
    zoneState.textContent = t(zone.labelKey);
    zoneTimer.textContent = formatTime(zone.phaseEnd - state.gameTime);
    warning.classList.toggle("hidden", !state.playerOutsideZone);
    zoneRing.ring.visible = true;
    zoneRing.wall.visible = true;
  }
}

function updateNaturalRegen(dt) {
  for (const fighter of state.players) {
    if (fighter.dead || fighter.isDummy || fighter.isBoss || fighter.health >= fighter.maxHealth) continue;
    const regenDelay = fighter.isPlayer ? 3 : 5;
    if (state.gameTime - fighter.lastCombatTime >= regenDelay && state.gameTime >= fighter.nextRegenAt) {
      fighter.health = Math.min(fighter.maxHealth, fighter.health + fighter.maxHealth * 0.25);
      fighter.nextRegenAt = state.gameTime + 1;
    }
  }
}

function updateTrainingRespawn() {
  if (!state.trainingMode) return;
  for (const fighter of state.players) {
    if (!fighter.isDummy || !fighter.dead || !fighter.respawnAt) continue;
    if (state.gameTime >= fighter.respawnAt) {
      fighter.dead = false;
      fighter.health = fighter.maxHealth;
      fighter.mesh.visible = true;
      fighter.shadow.visible = true;
      fighter.healthBar.visible = true;
      fighter.respawnAt = 0;
    }
  }
}

// ── Chop Wood mechanics ───────────────────────────────────────────────────
function updateChopping(dt) {
  if (!state.chopWoodMode || !state.teams) return;
  for (const fighter of state.players) {
    if (fighter.dead) {
      fighter.isChopping = false;
      continue;
    }
    const enemyTeam = fighter.team === "a" ? "b" : "a";
    const tree = state.teams[enemyTeam].tree;
    const dx = fighter.mesh.position.x - tree.x;
    const dz = fighter.mesh.position.z - tree.z;
    const dist = Math.hypot(dx, dz);
    if (dist <= 3) {
      fighter.isChopping = true;
      fighter.chopTimer += dt;
      if (fighter.chopTimer >= 1) {
        fighter.chopTimer -= 1;
        const dmg = AXE_GRADES[fighter.axeLevel].damage;
        tree.health = Math.max(0, tree.health - dmg);
        fighter.chopDamageDealt += dmg;
        if (fighter.isPlayer) {
          audio.play("hit");
        }
      }
    } else {
      fighter.isChopping = false;
      fighter.chopTimer = Math.min(fighter.chopTimer, 0);
    }
  }
}

function onChopWoodKill(attacker, target) {
  if (!attacker) return;
  attacker.cwKills += 1;
  let upgrade = 1;
  upgrade += AXE_ABSORB[target.axeLevel] ?? 0;
  attacker.axeLevel = Math.min(9, attacker.axeLevel + upgrade);
  if (attacker.axeLevel > attacker.bestAxeLevel) attacker.bestAxeLevel = attacker.axeLevel;
  if (attacker.axeIndicator) {
    const grade = AXE_GRADES[attacker.axeLevel];
    attacker.axeIndicator.material.color.setHex(grade.color);
  }
}

function updateChopWoodRespawn() {
  if (!state.chopWoodMode) return;
  for (const fighter of state.players) {
    if (!fighter.dead || !fighter.respawnAt) continue;
    if (state.gameTime >= fighter.respawnAt) {
      fighter.dead = false;
      fighter.health = fighter.maxHealth;
      fighter.mesh.visible = true;
      fighter.shadow.visible = true;
      fighter.healthBar.visible = true;
      fighter.respawnAt = 0;
      fighter.shockUntil = 0;
      fighter.axeLevel = 0;
      fighter.chopTimer = 0;
      fighter.isChopping = false;
      if (fighter.axeIndicator) {
        fighter.axeIndicator.material.color.setHex(AXE_GRADES[0].color);
      }
      const spawns = fighter.team === "a" ? CHOP_WOOD_SPAWNS_A : CHOP_WOOD_SPAWNS_B;
      const spawn = spawns[Math.floor(Math.random() * spawns.length)];
      fighter.mesh.position.set(spawn.x, 1.85, spawn.z);
      fighter.shadow.position.set(spawn.x, 0.04, spawn.z);
    }
  }
}

function getChopWoodEnemyTree(fighter) {
  if (!state.teams) return null;
  const enemyTeam = fighter.team === "a" ? "b" : "a";
  return state.teams[enemyTeam].tree;
}

function updateZoneVisual(zone) {
  zoneRing.ring.scale.set(zone.radius, zone.radius, zone.radius);
  zoneRing.wall.scale.set(zone.radius, 1, zone.radius);
  zoneRing.ring.position.set(state.safeCenter.x, 0.08, state.safeCenter.y);
  zoneRing.wall.position.set(state.safeCenter.x, 6, state.safeCenter.y);
}

function checkEndState() {
  if (state.gameOver) {
    return;
  }

  if (state.takedownMode) return;

  if (state.chopWoodMode && state.teams) {
    const player = getPlayer();
    const allyTeam = state.playerTeam || "a";
    const enemyTeam = allyTeam === "a" ? "b" : "a";
    let winningTeam = null;
    if (state.teams[allyTeam].tree.health <= 0) winningTeam = enemyTeam;
    if (state.teams[enemyTeam].tree.health <= 0) winningTeam = allyTeam;
    if (winningTeam) {
      state.gameOver = true;
      state.running = false;
      if (winningTeam === allyTeam) {
        resultTitle.textContent = t("cwWin");
      } else {
        resultTitle.textContent = t("cwLose");
      }
      resultBody.textContent = "";
      const statsLines = [];
      if (player) {
        statsLines.push(t("cwKills", player.cwKills));
        statsLines.push(t("cwChopDmg", player.chopDamageDealt));
        statsLines.push(t("cwBestAxe", t(AXE_GRADES[player.bestAxeLevel].key)));
      }
      resultStats.textContent = statsLines.join("  |  ");
      resultStreak.style.display = "none";
      resultOverlay.style.display = "flex";
      document.exitPointerLock?.();
    }
    return;
  }

  if (state.trainingMode) {
    const player = getPlayer();
    if (player && player.dead) {
      state.gameOver = true;
      state.running = false;
      resultTitle.textContent = t("resultKO");
      resultBody.textContent = t("trainingKO");
      resultStats.textContent = t("dmgDealt", Math.round(player.damageDealt));
      resultStreak.style.display = "none";
      resultOverlay.style.display = "flex";
      document.exitPointerLock?.();
    }
    return;
  }

  const alive = state.players.filter((fighter) => !fighter.dead);
  const player = getPlayer();
  const playerDead = !!player?.dead;
  if (alive.length <= 1 || playerDead) {
    state.gameOver = true;
    state.running = false;
    try {
      const winner = alive[0];
      const playerRank = (!player || !player.dead)
        ? 1
        : state.players.length - state.deathOrder.indexOf(player.id);
      const { streakBefore, streakAfter, bonus, milestone, coinsEarned } = recordGameResult(playerRank);
      const account = loadAccount();
      const delta = calcTrophyChange(playerRank);
      const deltaText = delta > 0 ? `+${delta}` : `${delta}`;
      const totalText = account ? t("totalTrophy", account.trophies) : "";
      const coinText = coinsEarned > 0 ? `  🪙 +${coinsEarned}` : "";

      if (playerDead && alive.length > 1) {
        resultTitle.textContent = t("rankN", playerRank);
        resultBody.textContent = t("resultDead", deltaText, totalText);
      } else if (!winner) {
        resultTitle.textContent = t("rankN", playerRank);
        resultBody.textContent = t("resultDraw", deltaText, totalText);
      } else if (winner.isPlayer) {
        resultTitle.textContent = t("rank1");
        resultBody.textContent = t("resultWin", deltaText, totalText);
      } else {
        resultTitle.textContent = playerRank === 1 ? t("rank1") : t("rankN", playerRank);
        resultBody.textContent = t("resultLose", winner.name, deltaText, totalText);
      }
      resultStats.textContent = (player ? t("dmgDealt", Math.round(player.damageDealt)) : "") + coinText;

      let streakMsg = "";
      if (milestone) streakMsg += t("milestone100");
      if (streakAfter >= 2) {
        const bonusText = bonus > 0 ? t("streakBonus", bonus) : "";
        streakMsg += t("streakAchieve", streakAfter, bonusText);
      } else if (streakBefore >= 2 && streakAfter === 0) {
        streakMsg += t("streakBroken", account?.bestStreak ?? streakBefore);
      }
      resultStreak.textContent = streakMsg;
      resultStreak.style.display = streakMsg ? "block" : "none";
    } catch (e) {
      console.error("End state error:", e);
      resultTitle.textContent = t("rank1");
      resultBody.textContent = "";
      resultStats.textContent = "";
    }
    resultOverlay.style.display = "flex";
    document.exitPointerLock?.();
  }
}

let bgInterval = null;
let inBackground = false;
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    inBackground = true;
    if (!bgInterval) bgInterval = setInterval(animate, 50);
  } else {
    inBackground = false;
    if (bgInterval) { clearInterval(bgInterval); bgInterval = null; }
    clock.getDelta();
    requestAnimationFrame(animate);
  }
});

function animate() {
  if (!inBackground) requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  if (state.running) {
    state.gameTime += dt;
    const zone = getCurrentZone();
    const frozen = state.gameTime < state.freezeUntil;

    if (!frozen) {
      updatePlayerControls(dt);
      for (let i = 1; i < state.players.length; i += 1) {
        updateBot(state.players[i], dt, zone);
      }
      updateAmmoRegen(dt);
      updateNaturalRegen(dt);
      updateTrainingRespawn();
      updateChopWoodRespawn();
      updateTakeDownRespawn();
      if (state.takedownMode) {
        if (!mpConfig || mpConfig.isHost) updateBossAI(dt);
        state.tdTimeLeft -= dt;
        updateTakeDownHud();
        checkTakeDownEnd();
        if (mpConfig) syncMp(dt);
      }
      updateChopping(dt);
      updateScheduledHits();
      updateProjectiles(dt);
      updatePoisonTicks();
      if (!state.chopWoodMode && !state.takedownMode) {
        updateZoneDamage(dt, zone);
      }
    }
    if (!state.chopWoodMode && !state.takedownMode) {
      updateZoneVisual(zone);
    }
    updateEffects(dt);

    for (const fighter of state.players) {
      updateFighterAnimation(fighter, dt);
    }

    updateCamera(dt);
    updateAttackAimIndicator();
    updateBushVisuals();
    updateHud();

    if (frozen) {
      const remain = Math.ceil(state.freezeUntil - state.gameTime);
      mapNameEl.textContent = remain > 0 ? `${remain}` : "";
    }

    checkEndState();
  } else {
    updateAttackAimIndicator();
  }

  renderer.render(scene, camera);

  if (tdMapOpen && state.takedownMode) {
    tdMapRenderer.render(scene, tdMapCamera);
  }

  if (!state.running) {
    renderPreview(dt);
  }
}

function setupInput() {
  document.getElementById("stats-toggle").addEventListener("click", () => {
    const panel = document.getElementById("stats-panel");
    const btn = document.getElementById("stats-toggle");
    panel.classList.toggle("hidden");
    btn.textContent = panel.classList.contains("hidden") ? t("statsBtn") : t("statsBtnClose");
    if (!panel.classList.contains("hidden")) {
      const account = loadAccount();
      if (account) {
        const totalGames = account.wins + account.losses;
        const winRate = totalGames === 0 ? 0 : Math.round((account.wins / totalGames) * 100);
        let html = `<div class="stats-header">${account.nickname} · Lv.${calcLevel(account.trophies)}</div>`;
        html += `<div class="stats-row">🏆 ${t("trophyLabel")}: ${account.trophies}</div>`;
        html += `<div class="stats-row">${t("record", account.wins, account.losses)}</div>`;
        html += `<div class="stats-row">${t("winrate", winRate, account.wins, totalGames)}</div>`;
        html += `<div class="stats-row">${t("bestStreakLabel", account.bestStreak)}</div>`;
        html += `<div class="stats-divider"></div>`;
        for (const char of ["red", "green", "blue", "orange", "yellow", "cyan", "purple", "pink"]) {
          const s = account.charStats?.[char];
          if (!s || s.games === 0) {
            html += `<div class="stats-char">${char.charAt(0).toUpperCase() + char.slice(1)}: ${t("statsNoRecord")}</div>`;
          } else {
            const r = Math.round((s.wins / s.games) * 100);
            html += `<div class="stats-char">${char.charAt(0).toUpperCase() + char.slice(1)}: ${t("charWinrate", r, s.wins, s.games)}</div>`;
          }
        }
        html += `<div class="stats-divider"></div>`;
        html += `<div class="stats-row" style="font-weight:700">📅 시즌별 전적</div>`;
        for (const [key, label] of Object.entries(SEASONS)) {
          const ss = account.seasonStats?.[key];
          if (!ss) { html += `<div class="stats-char">${label}: -</div>`; continue; }
          const sg = ss.wins + ss.losses;
          const sr = sg === 0 ? 0 : Math.round((ss.wins / sg) * 100);
          const current = key === CURRENT_SEASON ? " ⬅" : "";
          html += `<div class="stats-char" style="font-weight:600">${label}: ${sr}% (${ss.wins}W/${sg}G)${current}</div>`;
          const scs = account.seasonCharStats?.[key];
          if (scs) {
            for (const c of ["red", "green", "blue", "orange", "yellow", "cyan", "purple", "pink"]) {
              const cs = scs[c];
              if (!cs || cs.games === 0) {
                html += `<div class="stats-char" style="padding-left:12px;font-size:11px;color:var(--muted)">  ${c.charAt(0).toUpperCase() + c.slice(1)}: -</div>`;
              } else {
                const cr = Math.round((cs.wins / cs.games) * 100);
                html += `<div class="stats-char" style="padding-left:12px;font-size:11px;color:var(--muted)">  ${c.charAt(0).toUpperCase() + c.slice(1)}: ${cr}% (${cs.wins}W/${cs.games}G)</div>`;
              }
            }
          }
        }
        panel.innerHTML = html;
      }
    }
  });

  document.getElementById("leaderboard-toggle").addEventListener("click", () => {
    const panel = document.getElementById("leaderboard-panel");
    const btn = document.getElementById("leaderboard-toggle");
    panel.classList.toggle("hidden");
    btn.textContent = panel.classList.contains("hidden") ? t("leaderboardBtn") : t("leaderboardBtnClose");
    if (!panel.classList.contains("hidden")) {
      const account = loadAccount();
      if (account) {
        const entries = [];
        entries.push({ name: account.nickname, trophies: account.trophies, isPlayer: true });
        leaderboardBots.forEach((bot) => entries.push({ ...bot, isPlayer: false }));
        entries.sort((a, b) => b.trophies - a.trophies);
        let html = `<div class="stats-row" style="font-weight:700;margin-bottom:6px">🏆 ${t("leaderboardBtn")}</div>`;
        entries.forEach((e, i) => {
          const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
          const highlight = e.isPlayer ? ' style="color:#ffcc66;font-weight:700"' : '';
          html += `<div class="stats-char"${highlight}>${medal} ${e.name} — ${e.trophies}</div>`;
        });
        panel.innerHTML = html;
      }
    }
  });

  document.getElementById("matchup-toggle").addEventListener("click", () => {
    const table = document.getElementById("matchup-table");
    const btn = document.getElementById("matchup-toggle");
    table.classList.toggle("hidden");
    btn.textContent = table.classList.contains("hidden") ? t("matchupBtn") : t("matchupBtnClose");
  });

  document.getElementById("patchnotes-toggle").addEventListener("click", () => {
    const panel = document.getElementById("patchnotes");
    const btn = document.getElementById("patchnotes-toggle");
    panel.classList.toggle("hidden");
    btn.textContent = panel.classList.contains("hidden") ? t("patchnotesBtn") : t("patchnotesBtnClose");
  });

  document.getElementById("lang-toggle").addEventListener("click", () => {
    setLanguage(currentLang === "ko" ? "en" : "ko");
    const account = loadAccount();
    if (account) updateLobbyUI(account);
  });

  const coarsePointerQuery = window.matchMedia("(hover: none) and (pointer: coarse)");
  const syncVirtualControlsVisibility = () => {
    mobileJoystick.style.display = "block";
    mobileAttackButton.style.display = coarsePointerQuery.matches ? "block" : "none";
  };
  syncVirtualControlsVisibility();
  coarsePointerQuery.addEventListener?.("change", syncVirtualControlsVisibility);

  window.addEventListener("keydown", (event) => {
    if (["KeyW", "KeyA", "KeyS", "KeyD", "Space"].includes(event.code)) {
      event.preventDefault();
    }
    if (event.code === "KeyQ") triggerEmote(0);
    if (event.code === "KeyE") triggerEmote(1);
    if (event.code === "KeyT") triggerEmote(2);
    state.keyState[event.code] = true;
  });

  window.addEventListener("keyup", (event) => {
    if (["KeyW", "KeyA", "KeyS", "KeyD", "Space"].includes(event.code)) {
      event.preventDefault();
    }
    state.keyState[event.code] = false;
  });

  canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  mobileJoystick.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  let mouseDownAt = 0;
  function startAiming(event) {
    if (event.button !== 0 && event.button !== 2) return;
    event.preventDefault();
    if (state.running) {
      state.mouseHeld = true;
      mouseDownAt = performance.now();
    }
  }

  function attackOnRelease() {
    if (state.mouseHeld && state.running) {
      state.mouseHeld = false;
      const player = getPlayer();
      if (player && !player.dead && performance.now() - mouseDownAt < 500) {
        const target = findAutoAimTarget(player);
        if (target) {
          const dx = target.mesh.position.x - player.mesh.position.x;
          const dz = target.mesh.position.z - player.mesh.position.z;
          player.yaw = Math.atan2(dx, dz);
          player.mesh.rotation.y = player.yaw;
        }
      }
      beginAttack(getPlayer());
    } else {
      state.mouseHeld = false;
    }
  }

  const releaseHold = () => { state.mouseHeld = false; };
  window.addEventListener("mousedown", startAiming);
  window.addEventListener("mouseup", attackOnRelease);
  window.addEventListener("pointerup", attackOnRelease);
  window.addEventListener("pointercancel", releaseHold);
  window.addEventListener("blur", releaseHold);
  document.addEventListener("mouseleave", releaseHold);
  canvas.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse") startAiming(event);
  });

  function setJoystickFromEvent(event) {
    const rect = mobileJoystick.getBoundingClientRect();
    const centerX = rect.left + rect.width * 0.5;
    const centerY = rect.top + rect.height * 0.5;
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;
    const maxRadius = rect.width * 0.34;
    const distance = Math.hypot(dx, dy);
    const clampedDistance = Math.min(distance, maxRadius);
    const angle = distance > 0 ? Math.atan2(dy, dx) : 0;
    const knobX = Math.cos(angle) * clampedDistance;
    const knobY = Math.sin(angle) * clampedDistance;

    mobileJoystickThumb.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;
    state.mobileMove.x = THREE.MathUtils.clamp(knobX / maxRadius, -1, 1);
    state.mobileMove.y = THREE.MathUtils.clamp(-knobY / maxRadius, -1, 1);
  }

  function resetJoystick() {
    state.mobileMove.x = 0;
    state.mobileMove.y = 0;
    state.mobileMove.active = false;
    state.mobileMove.pointerId = null;
    mobileJoystickThumb.style.transform = "translate(-50%, -50%)";
  }

  mobileJoystick.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    state.mobileMove.active = true;
    state.mobileMove.pointerId = event.pointerId;
    mobileJoystick.setPointerCapture(event.pointerId);
    setJoystickFromEvent(event);
  });

  mobileJoystick.addEventListener("pointermove", (event) => {
    if (!state.mobileMove.active || state.mobileMove.pointerId !== event.pointerId) {
      return;
    }
    event.preventDefault();
    setJoystickFromEvent(event);
  });

  mobileJoystick.addEventListener("pointerup", (event) => {
    if (state.mobileMove.pointerId !== event.pointerId) {
      return;
    }
    event.preventDefault();
    resetJoystick();
  });

  mobileJoystick.addEventListener("pointercancel", (event) => {
    if (state.mobileMove.pointerId !== event.pointerId) {
      return;
    }
    event.preventDefault();
    resetJoystick();
  });

  window.addEventListener("mousemove", (event) => {
    state.mouse.screenX = event.clientX;
    state.mouse.screenY = event.clientY;
  });

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  async function initAudio() {
    if (!state.audioContext) {
      state.audioContext = new window.AudioContext();
      state.audioEnabled = true;
    }
    if (state.audioContext.state === "suspended") {
      await state.audioContext.resume();
    }
  }

  // 계정 생성 — 버튼 활성화 검사
  function validateCreateBtn() {
    createAccountBtn.disabled = !idInput.value.trim() || !nicknameInput.value.trim();
  }
  idInput.addEventListener("input", validateCreateBtn);
  nicknameInput.addEventListener("input", validateCreateBtn);
  idInput.addEventListener("keydown", (e) => { if (e.key === "Enter") nicknameInput.focus(); });

  createAccountBtn.addEventListener("click", () => {
    const id = idInput.value.trim();
    const nick = nicknameInput.value.trim();
    if (!id || !nick) return;
    const account = createAccount(id, nick);
    accountCreation.classList.add("hidden");
    lobbyMain.classList.remove("hidden");
    document.getElementById("lobby-side-panel").classList.remove("hidden");
    updateLobbyUI(account);
  });

  nicknameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") createAccountBtn.click();
  });

  // 일일 아이디 인증
  function handleDailyLogin() {
    const account = loadAccount();
    if (!account) return;

    const today = getTodayString();
    // 날짜 바뀌었으면 시도 리셋
    if (account.lastLoginDate !== today) {
      account.loginAttempts = 0;
    }

    const entered = dailyIdInput.value.trim();
    if (!entered) { dailyIdInput.focus(); return; }

    if (entered === account.id) {
      // 성공
      account.lastLoginDate = today;
      account.loginAttempts = 0;
      saveAccount(account);
      dailyLogin.classList.add("hidden");
      lobbyMain.classList.remove("hidden");
      document.getElementById("lobby-side-panel").classList.remove("hidden");
      if (account.lang && account.lang !== currentLang) setLanguage(account.lang);
      updateLobbyUI(account);
    } else {
      // 실패
      account.loginAttempts += 1;
      saveAccount(account);

      const remaining = Math.max(0, 5 - account.loginAttempts);
      if (account.loginAttempts >= 5) {
        dailyLoginError.textContent = t("loginWrong");
        dailyLoginError.style.display = "block";
        dailyIdInput.disabled = true;
        dailyLoginBtn.disabled = true;
        accountRecoveryBtn.style.display = "block";
      } else {
        dailyLoginError.textContent = t("loginRemain", remaining);
        dailyLoginError.style.display = "block";
      }
      dailyIdInput.value = "";
      dailyIdInput.focus();
    }
  }

  dailyLoginBtn.addEventListener("click", handleDailyLogin);
  dailyIdInput.addEventListener("keydown", (e) => { if (e.key === "Enter") handleDailyLogin(); });

  // 계정 문제 해결하기
  accountRecoveryBtn.addEventListener("click", () => {
    const account = loadAccount();
    if (!account) return;
    accountRecoveryInfo.textContent = t("myId", account.id);
    accountRecoveryInfo.style.display = "block";
  });

  // 캐릭터 선택 (선택만, 게임 시작은 전투 시작 버튼)
  document.getElementById("select-red").addEventListener("click", () => {
    const account = loadAccount();
    if (!account) return;
    account.selectedCharacter = "red";
    saveAccount(account);
    updateLobbyUI(account);
  });

  document.getElementById("select-green").addEventListener("click", () => {
    const account = loadAccount();
    if (!account) return;
    account.selectedCharacter = "green";
    saveAccount(account);
    updateLobbyUI(account);
  });

  document.getElementById("select-blue").addEventListener("click", () => {
    const account = loadAccount();
    if (!account) return;
    account.selectedCharacter = "blue";
    saveAccount(account);
    updateLobbyUI(account);
  });

  document.getElementById("select-orange").addEventListener("click", () => {
    const account = loadAccount();
    if (!account) return;
    account.selectedCharacter = "orange";
    saveAccount(account);
    updateLobbyUI(account);
  });

  document.getElementById("select-yellow").addEventListener("click", () => {
    const account = loadAccount();
    if (!account) return;
    account.selectedCharacter = "yellow";
    saveAccount(account);
    updateLobbyUI(account);
  });

  document.getElementById("select-cyan").addEventListener("click", () => {
    const account = loadAccount();
    if (!account) return;
    account.selectedCharacter = "cyan";
    saveAccount(account);
    updateLobbyUI(account);
  });

  document.getElementById("select-purple")?.addEventListener("click", () => {
    const account = loadAccount();
    if (!account) return;
    account.selectedCharacter = "purple";
    saveAccount(account);
    updateLobbyUI(account);
  });

  document.getElementById("select-pink")?.addEventListener("click", () => {
    const account = loadAccount();
    if (!account) return;
    account.selectedCharacter = "pink";
    saveAccount(account);
    updateLobbyUI(account);
  });

  document.querySelectorAll(".color-dot").forEach((dot) => {
    dot.addEventListener("click", () => {
      const account = loadAccount();
      if (!account) return;
      account.selectedCharacter = dot.dataset.char;
      saveAccount(account);
      updateLobbyUI(account);
    });
  });

  // 전투 시작
  const modeSelector = document.getElementById("mode-selector");

  startBattleBtn.addEventListener("click", () => {
    modeSelector.classList.toggle("hidden");
    startBattleBtn.classList.toggle("hidden");
  });

  document.getElementById("mode-back").addEventListener("click", () => {
    modeSelector.classList.add("hidden");
    startBattleBtn.classList.remove("hidden");
  });

  document.getElementById("mode-showdown").addEventListener("click", async () => {
    await initAudio();
    modeSelector.classList.add("hidden");
    startBattleBtn.classList.remove("hidden");
    messageOverlay.style.display = "none";
    state.currentMapId = Math.floor(Math.random() * MAP_POOL.length);
    createMap(MAP_POOL[state.currentMapId]);
    resetGame();
  });

  document.getElementById("mode-chopwood").addEventListener("click", async () => {
    await initAudio();
    modeSelector.classList.add("hidden");
    startBattleBtn.classList.remove("hidden");
    startChopWood();
  });

  // 훈련장 시작
  startTrainingBtn.addEventListener("click", async () => {
    await initAudio();
    startTraining();
  });

  // 훈련장 나가기
  exitTrainingBtn.addEventListener("click", () => {
    exitTraining();
  });

  // ── 상점 ──
  function renderShopLevelUp() {
    const account = loadAccount();
    if (!account) return;
    const chars = ["red", "green", "blue", "orange", "yellow", "cyan", "purple", "pink"];
    const colorMap = { red: "#ff4444", green: "#44ff44", blue: "#4488ff", orange: "#ffa500", yellow: "#ffff00", cyan: "#0ff0fe", purple: "#aa44ff", pink: "#ff69b4" };
    let html = '<div class="shop-grid">';
    for (const c of chars) {
      if (!CHARACTERS[c]) continue;
      const lv = getCharLevel(account, c);
      const name = c.charAt(0).toUpperCase() + c.slice(1);
      const wins = account.charStats[c]?.wins ?? 0;
      const mastery = getMasteryTier(wins);
      const masteryText = mastery ? `${mastery.emoji} ${mastery.name}` : "";
      const charDef = CHARACTERS[c];
      const curMult = getLevelMultiplier(lv);
      const curHp = Math.round(charDef.maxHealth * curMult);
      const lvPct = ((lv - 1) / (MAX_CHAR_LEVEL - 1)) * 100;
      const lvDots = Array.from({length: MAX_CHAR_LEVEL}, (_, i) =>
        `<span class="shop-lv-dot${i < lv ? " filled" : ""}" style="background:${i < lv ? colorMap[c] || "#fff" : "rgba(255,255,255,0.15)"}"></span>`
      ).join("");

      if (lv >= MAX_CHAR_LEVEL) {
        html += `<div class="shop-card shop-card-max" style="border-color:${colorMap[c]}">
          <div class="shop-card-name" style="color:${colorMap[c]}">${name}</div>
          <div class="shop-card-level">Lv.${lv} <span class="shop-max-badge">MAX</span></div>
          <div class="shop-lv-dots">${lvDots}</div>
          <div class="shop-card-stat">HP ${curHp.toLocaleString()} · +${Math.round((curMult - 1) * 100)}%</div>
          ${masteryText ? `<div class="shop-card-mastery">${masteryText}</div>` : ""}
        </div>`;
      } else {
        const cost = LEVEL_UP_COST[lv];
        const canBuy = account.coins >= cost;
        const nextMult = getLevelMultiplier(lv + 1);
        const nextHp = Math.round(charDef.maxHealth * nextMult);
        html += `<div class="shop-card" style="border-color:${colorMap[c]}">
          <div class="shop-card-name" style="color:${colorMap[c]}">${name}</div>
          <div class="shop-card-level">Lv.${lv} → Lv.${lv + 1}</div>
          <div class="shop-lv-dots">${lvDots}</div>
          <div class="shop-card-stat">HP ${curHp.toLocaleString()} → <span class="shop-stat-up">${nextHp.toLocaleString()}</span></div>
          <div class="shop-card-effect">${t("shopCardEffect")}</div>
          ${masteryText ? `<div class="shop-card-mastery">${masteryText}</div>` : ""}
          <button class="shop-buy-btn${canBuy ? "" : " disabled"}" data-char="${c}" data-cost="${cost}" type="button"${canBuy ? "" : " disabled"}>
            🪙 ${cost}${!canBuy ? ` <span class="shop-coin-short">${t("shopCoinShort")}</span>` : ""}
          </button>
        </div>`;
      }
    }
    html += "</div>";
    shopContent.innerHTML = html;
    if (shopCoins) shopCoins.textContent = account.coins ?? 0;

    shopContent.querySelectorAll(".shop-buy-btn:not(.disabled)").forEach((btn) => {
      btn.addEventListener("click", () => {
        const acc = loadAccount();
        if (!acc) return;
        const char = btn.dataset.char;
        const cost = parseInt(btn.dataset.cost);
        const curLv = getCharLevel(acc, char);
        if (curLv >= MAX_CHAR_LEVEL || acc.coins < cost) return;
        acc.coins -= cost;
        acc.charLevels[char] = curLv + 1;
        saveAccount(acc);
        const card = btn.closest(".shop-card");
        if (card) {
          card.classList.add("shop-card-bought");
          setTimeout(() => renderShopLevelUp(), 400);
        } else {
          renderShopLevelUp();
        }
      });
    });
  }

  function renderShopSkins() {
    const account = loadAccount();
    if (!account) return;
    const colorMap = { red: "#ff4444", green: "#44ff44", blue: "#4488ff", orange: "#ffa500", yellow: "#ffff00", cyan: "#0ff0fe" };
    let html = '<div class="shop-grid">';
    for (const [skinId, skin] of Object.entries(SKINS)) {
      const owned = account.ownedSkins.includes(skinId);
      const equipped = account.selectedSkins[skin.character] === skinId;
      const canBuy = !owned && account.coins >= skin.cost;
      const seasonOk = skin.season === CURRENT_SEASON;
      const borderColor = colorMap[skin.character] || "#fff";
      html += `<div class="shop-card" style="border-color:${borderColor}">`;
      html += `<div class="shop-card-name" style="color:${borderColor}">${skin.name}</div>`;
      html += `<div class="shop-card-effect">${t(skin.desc)}</div>`;
      if (!seasonOk && !owned) {
        html += `<div class="shop-card-mastery">${t("shopSeasonEnded")}</div>`;
      } else if (equipped) {
        html += `<button class="shop-buy-btn shop-skin-unequip" data-skin="${skinId}" type="button">${t("skinUnequip")}</button>`;
      } else if (owned) {
        html += `<button class="shop-buy-btn shop-skin-equip" data-skin="${skinId}" type="button">${t("skinEquip")}</button>`;
      } else {
        html += `<button class="shop-buy-btn${canBuy ? "" : " disabled"}" data-skin="${skinId}" data-cost="${skin.cost}" type="button"${canBuy ? "" : " disabled"}>🪙 ${skin.cost}</button>`;
      }
      html += `</div>`;
    }
    html += "</div>";
    shopSkinsContent.innerHTML = html;

    shopSkinsContent.querySelectorAll(".shop-buy-btn[data-cost]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const acc = loadAccount();
        if (!acc) return;
        const sid = btn.dataset.skin;
        const cost = parseInt(btn.dataset.cost);
        if (acc.ownedSkins.includes(sid) || acc.coins < cost) return;
        acc.coins -= cost;
        acc.ownedSkins.push(sid);
        acc.selectedSkins[SKINS[sid].character] = sid;
        saveAccount(acc);
        renderShopSkins();
        if (shopCoins) shopCoins.textContent = acc.coins;
      });
    });
    shopSkinsContent.querySelectorAll(".shop-skin-equip").forEach((btn) => {
      btn.addEventListener("click", () => {
        const acc = loadAccount();
        if (!acc) return;
        const sid = btn.dataset.skin;
        acc.selectedSkins[SKINS[sid].character] = sid;
        saveAccount(acc);
        renderShopSkins();
      });
    });
    shopSkinsContent.querySelectorAll(".shop-skin-unequip").forEach((btn) => {
      btn.addEventListener("click", () => {
        const acc = loadAccount();
        if (!acc) return;
        const sid = btn.dataset.skin;
        delete acc.selectedSkins[SKINS[sid].character];
        saveAccount(acc);
        renderShopSkins();
      });
    });
  }

  openShopBtn.addEventListener("click", () => {
    shopOverlay.classList.remove("hidden");
    renderShopLevelUp();
    renderShopSkins();
  });

  function renderRotationScreen() {
    const account = loadAccount();
    if (!account || !account.rotation) return;
    processRotationRounds(account);
    saveAccount(account);

    const rot = account.rotation;
    rotationRemainingCount.textContent = rot.remaining.length;

    if (rot.champion) {
      const champName = rot.champion.charAt(0).toUpperCase() + rot.champion.slice(1);
      rotationChampionBanner.textContent = `🏆 Rotation Champion: ${champName}`;
      rotationChampionBanner.classList.remove("hidden");
      rotationNextElim.textContent = t("rotationEnd");
    } else {
      rotationChampionBanner.classList.add("hidden");
      const nextDate = getRotationNextEliminationDate(account);
      if (nextDate) {
        const now = new Date();
        const diffMs = nextDate - now;
        const diffDays = Math.max(0, Math.ceil(diffMs / 86400000));
        rotationNextElim.textContent = diffDays > 0 ? `${diffDays}${t("rotationDays")}` : t("rotationToday");
      }
    }

    const ranked = rankRotationChars(rot.stats, ROTATION_CHAR_ORDER).reverse();
    let html = "";
    ranked.forEach((charKey, idx) => {
      const name = charKey.charAt(0).toUpperCase() + charKey.slice(1);
      const s = rot.stats[charKey];
      const isEliminated = rot.eliminated.includes(charKey);
      const isChampion = rot.champion === charKey;
      const hasNewAbility = rot.newAbilityChars.includes(charKey);
      const winRate = s.games > 0 ? Math.round((s.wins / s.games) * 100) : 0;

      let rowClass = "rotation-row";
      if (isEliminated && !isChampion) rowClass += " eliminated";
      if (isChampion) rowClass += " champion";

      let badges = "";
      if (isChampion) badges += `<span class="rotation-champion-badge">🏆 CHAMPION</span> `;
      if (hasNewAbility) badges += `<span class="rotation-new-ability-badge">NEW ABILITY</span>`;

      const ability = ROTATION_NEW_ABILITIES[charKey];
      const abilityText = hasNewAbility && ability ? `<div class="rotation-char-stats">${ability.name}: ${ability.desc}</div>` : "";

      html += `<div class="${rowClass}">
        <div class="rotation-rank">${idx + 1}</div>
        <div class="rotation-char-name">${name} ${badges}${abilityText}</div>
        <div class="rotation-char-stats">${t("rotationRecord", s.wins, s.games, winRate)}</div>
      </div>`;
    });
    rotationList.innerHTML = html;
  }

  openRotationBtn.addEventListener("click", () => {
    rotationOverlay.classList.remove("hidden");
    renderRotationScreen();
  });

  rotationCloseBtn.addEventListener("click", () => {
    rotationOverlay.classList.add("hidden");
  });

  const TD_CHAR_COLORS = {
    red: "#ff4444", green: "#44ff44", blue: "#4488ff", orange: "#ffa500",
    yellow: "#ffff00", cyan: "#0ff0fe", purple: "#aa44ff", pink: "#ff69b4",
  };
  const TD_CHAR_EMOJIS = {
    red: "🔴", green: "🟢", blue: "🔵", orange: "🟠",
    yellow: "🟡", cyan: "🩵", purple: "🟣", pink: "🩷",
  };

  function openTdCharSelect(onSelect) {
    const account = loadAccount();
    const eliminated = account?.rotation?.eliminated ?? [];
    const chars = ["red", "green", "blue", "orange", "yellow", "cyan", "purple", "pink"];

    tdCharSelectGrid.innerHTML = chars.map((c) => {
      const isElim = eliminated.includes(c);
      const name = c.charAt(0).toUpperCase() + c.slice(1);
      const color = TD_CHAR_COLORS[c];
      const emoji = TD_CHAR_EMOJIS[c];
      return `<button class="td-char-btn${isElim ? " eliminated" : ""}"
        data-char="${c}" style="color:${color}; border-color:${isElim ? "transparent" : color}22"
        ${isElim ? "disabled" : ""}>
        ${emoji}<br>${name}
        ${isElim ? `<span class="td-elim-badge">OUT</span>` : ""}
      </button>`;
    }).join("");

    tdCharSelectGrid.querySelectorAll(".td-char-btn:not(.eliminated)").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedCharacter = btn.dataset.char;
        const acc = loadAccount();
        if (acc) { acc.selectedCharacter = btn.dataset.char; saveAccount(acc); }
        tdCharSelectOverlay.classList.add("hidden");
        onSelect();
      });
    });

    tdCharSelectOverlay.classList.remove("hidden");
  }

  tdCharSelectCloseBtn.addEventListener("click", () => {
    tdCharSelectOverlay.classList.add("hidden");
  });

  document.getElementById("rotation-takedown-btn").addEventListener("click", () => {
    openTdCharSelect(() => {
      rotationOverlay.classList.add("hidden");
      state.tdSolo = false;
      enterMatchmaking();
    });
  });

  document.getElementById("rotation-takedown-solo-btn").addEventListener("click", () => {
    openTdCharSelect(() => {
      rotationOverlay.classList.add("hidden");
      state.tdSolo = true;
      startTakeDown();
    });
  });


  matchmakingCancelBtn.addEventListener("click", () => {
    mp.disconnect();
    mpConfig = null;
    matchmakingOverlay.classList.add("hidden");
  });

  tdMapInfoBtn.addEventListener("click", () => {
    tdMapOverlay.classList.remove("hidden");
    tdMapOpen = true;
  });

  tdMapCloseBtn.addEventListener("click", () => {
    tdMapOverlay.classList.add("hidden");
    tdMapOpen = false;
  });

  shopCloseBtn.addEventListener("click", () => {
    shopOverlay.classList.add("hidden");
    const acc = loadAccount();
    if (acc) {
      updateLobbyUI(acc);
      previewChar = null;
      setPreviewCharacter(acc.selectedCharacter);
    }
  });

  document.querySelectorAll(".shop-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".shop-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const target = tab.dataset.tab;
      document.getElementById("shop-levelup").classList.toggle("hidden", target !== "levelup");
      document.getElementById("shop-skins").classList.toggle("hidden", target !== "skins");
      document.getElementById("shop-cosmetics").classList.toggle("hidden", target !== "cosmetics");
      if (target === "cosmetics") renderCosmeticsShop();
    });
  });

  // 꾸미기 서브탭
  document.querySelectorAll(".cosmetics-subtab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".cosmetics-subtab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const sub = tab.dataset.subtab;
      document.getElementById("cosmetics-emote-grid").classList.toggle("hidden", sub !== "emote");
      document.getElementById("cosmetics-bg-grid").classList.toggle("hidden", sub !== "bg");
      document.getElementById("cosmetics-badge-grid").classList.toggle("hidden", sub !== "badge");
    });
  });

  function renderCosmeticsShop() {
    const acc = loadAccount();
    if (!acc) return;
    const c = acc.cosmetics;

    function makeCard(preview, name, price, owned, equipped, onBuy, onEquip) {
      const card = document.createElement("div");
      card.className = "cosmetics-card";
      card.innerHTML = `<div class="cosmetics-preview">${preview}</div>
        <div class="cosmetics-name">${name}</div>
        <div class="cosmetics-price">${price === 0 ? "무료" : `🪙 ${price}`}</div>`;
      const btn = document.createElement("button");
      btn.className = "cosmetics-btn";
      if (equipped) {
        btn.textContent = "장착됨";
        btn.classList.add("equipped");
        btn.disabled = true;
      } else if (owned) {
        btn.textContent = "장착";
        btn.addEventListener("click", () => { onEquip(); renderCosmeticsShop(); });
      } else {
        btn.textContent = `구매 🪙${price}`;
        if ((acc.coins ?? 0) < price) btn.disabled = true;
        btn.addEventListener("click", () => { onBuy(); renderCosmeticsShop(); });
      }
      card.appendChild(btn);
      return card;
    }

    function toast(msg) {
      const el = document.createElement("div");
      el.textContent = msg;
      el.style.cssText = "position:fixed;bottom:120px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:8px 18px;border-radius:8px;font-size:13px;z-index:9999;pointer-events:none";
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2000);
    }

    // 이모트
    const emoteGrid = document.getElementById("cosmetics-emote-grid");
    emoteGrid.innerHTML = "";
    for (const [id, em] of Object.entries(EMOTES)) {
      const owned = c.ownedEmotes.includes(id);
      const slots = c.equippedEmotes ?? [null, null, null];
      const equippedSlot = slots.indexOf(id);
      const equipped = equippedSlot !== -1;
      emoteGrid.appendChild(makeCard(em.emoji, em.name, em.price, owned, equipped,
        () => {
          const a = loadAccount();
          if ((a.coins ?? 0) < em.price) return toast("코인이 부족합니다");
          a.coins -= em.price;
          a.cosmetics.ownedEmotes.push(id);
          const firstEmpty = a.cosmetics.equippedEmotes.indexOf(null);
          a.cosmetics.equippedEmotes[firstEmpty !== -1 ? firstEmpty : 0] = id;
          saveAccount(a);
          updateEmoteBtns(a);
          if (document.getElementById("shop-coins")) document.getElementById("shop-coins").textContent = a.coins;
          if (typeof lobbyCoins !== "undefined" && lobbyCoins) lobbyCoins.textContent = a.coins;
          renderCosmeticsShop();
        },
        () => {
          const a = loadAccount();
          const s = a.cosmetics.equippedEmotes;
          const idx = s.indexOf(id);
          if (idx !== -1) {
            s[idx] = null; // 해제
          } else {
            const empty = s.indexOf(null);
            s[empty !== -1 ? empty : 0] = id; // 빈 슬롯 or 슬롯0 교체
          }
          saveAccount(a);
          updateEmoteBtns(a);
          renderCosmeticsShop();
        }
      ));
    }

    // 배경
    const bgGrid = document.getElementById("cosmetics-bg-grid");
    bgGrid.innerHTML = "";
    for (const [id, bg] of Object.entries(PROFILE_BGS)) {
      const owned = c.ownedBgs.includes(id);
      const equipped = c.equippedBg === id;
      const preview = `<div class="cosmetics-bg-preview" style="background:${bg.css}"></div>`;
      bgGrid.appendChild(makeCard(preview, bg.name, bg.price, owned, equipped,
        () => {
          const a = loadAccount();
          if ((a.coins ?? 0) < bg.price) return toast("코인이 부족합니다");
          a.coins -= bg.price;
          a.cosmetics.ownedBgs.push(id);
          a.cosmetics.equippedBg = id;
          saveAccount(a);
          applyProfileCosmetics(a);
          if (document.getElementById("shop-coins")) document.getElementById("shop-coins").textContent = a.coins;
          if (typeof lobbyCoins !== "undefined" && lobbyCoins) lobbyCoins.textContent = a.coins;
        },
        () => {
          const a = loadAccount();
          a.cosmetics.equippedBg = id;
          saveAccount(a);
          applyProfileCosmetics(a);
        }
      ));
    }

    // 뱃지
    const badgeGrid = document.getElementById("cosmetics-badge-grid");
    badgeGrid.innerHTML = "";
    for (const [id, badge] of Object.entries(BADGES)) {
      const owned = c.ownedBadges.includes(id);
      const equipped = c.equippedBadge === id;
      const preview = badge.emoji || "—";
      badgeGrid.appendChild(makeCard(preview, badge.name, badge.price, owned, equipped,
        () => {
          const a = loadAccount();
          if ((a.coins ?? 0) < badge.price) return toast("코인이 부족합니다");
          a.coins -= badge.price;
          a.cosmetics.ownedBadges.push(id);
          a.cosmetics.equippedBadge = id;
          saveAccount(a);
          applyProfileCosmetics(a);
          if (document.getElementById("shop-coins")) document.getElementById("shop-coins").textContent = a.coins;
          if (typeof lobbyCoins !== "undefined" && lobbyCoins) lobbyCoins.textContent = a.coins;
        },
        () => {
          const a = loadAccount();
          a.cosmetics.equippedBadge = id;
          saveAccount(a);
          applyProfileCosmetics(a);
        }
      ));
    }
  }

  // 다시 시작
  playAgainButton.addEventListener("click", () => {
    if (state.takedownMode) {
      resultOverlay.style.display = "none";
      if (state.tdSolo) {
        openTdCharSelect(() => startTakeDown());
      } else {
        openTdCharSelect(() => enterMatchmaking());
      }
    } else if (state.chopWoodMode) {
      startChopWood();
    } else if (state.trainingMode) {
      startTraining();
    } else {
      resetGame();
    }
  });

  // 재시작 → 로비
  restartButton.addEventListener("click", () => {
    if (state.takedownMode) {
      state.takedownMode = false;
      state.tdBoss = null;
      tdHud.classList.add("hidden");
      tdMapOverlay.classList.add("hidden");
      tdMapOpen = false;
      state.running = false;
      state.gameOver = true;
      state.players.forEach((f) => { scene.remove(f.mesh); scene.remove(f.shadow); });
      state.players = [];
      state.projectiles.forEach((p) => scene.remove(p.mesh));
      state.projectiles = [];
      state.effects.forEach((e) => { scene.remove(e.mesh); });
      state.effects = [];
    } else if (state.chopWoodMode) {
      state.chopWoodMode = false;
      state.teams = null;
      state.playerTeam = null;
      chopWoodMapGroup.visible = false;
      cwHud.classList.add("hidden");
      state.running = false;
      state.gameOver = true;
      state.players.forEach((f) => { scene.remove(f.mesh); scene.remove(f.shadow); });
      state.players = [];
      state.projectiles.forEach((p) => scene.remove(p.mesh));
      state.projectiles = [];
      state.effects.forEach((e) => { scene.remove(e.mesh); });
      state.effects = [];
    }
    showLobby();
  });

  mobileAttackButton.addEventListener("pointerdown", async (event) => {
    event.preventDefault();
    await initAudio();
    if (state.running) state.mouseHeld = true;
  });
  mobileAttackButton.addEventListener("pointerup", () => {
    if (state.mouseHeld && state.running) {
      state.mouseHeld = false;
      beginAttack(getPlayer());
    } else {
      state.mouseHeld = false;
    }
  });
  mobileAttackButton.addEventListener("pointercancel", () => { state.mouseHeld = false; });
}

createLights();
createMap(MAP_POOL[0]);
createTrainingMap();
setupInput();
animate();
rebuildAmmoPips();
updateHud();
applyLanguage();
showLobby();
