import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js";

// ── i18n ────────────────────────────────────────────────────────────────
const LANGS = {
  ko: {
    exitTraining: "훈련장 나가기", survivorsLabel: "생존 인원", zoneLabel: "자기장",
    zoneWaiting: "대기 중", ammoFull: "탄약 가득", ammoLabel: "탄약", attack: "공격",
    zoneWarning: "자기장 밖입니다", matchupBtn: "상성표", matchupBtnClose: "상성표 닫기",
    matchupDesc: "가위바위보 상성 — 유리한 상대를 노려 승률을 높이세요!",
    muChar: "캐릭터", muAdv: "✅ 유리", muDis: "❌ 불리",
    patchnotesBtn: "패치노트", patchnotesBtnClose: "패치노트 닫기",
    gameTitle: "해골천", welcomeMsg: "배틀로얄 전장에 오신 것을 환영합니다.",
    idLabel: "아이디", nicknameLabel: "닉네임", idPlaceholder: "최대 16자",
    nickPlaceholder: "최대 12자", enterBattle: "전장 입장",
    dailyLoginMsg: "오늘의 아이디를 입력하세요.", dailyIdPlaceholder: "아이디 입력",
    confirm: "확인", accountRecovery: "계정 문제 해결하기",
    season: "알파 시즌 1", charSelect: "캐릭터 선택",
    redDesc: "더블 펀치, 근접 압박형 탱커", greenDesc: "부메랑 4연발, 중거리 견제",
    blueDesc: "고속 저격, 긴 사거리",
    controls: "WASD 이동 · 마우스 조준 · 클릭 공격 · 자동 장전",
    startBattle: "전투 시작", training: "훈련장", playAgain: "다시 시작", exit: "나가기",
    trophyLabel: "트로피", record: "{0}승 {1}패", winrate: "승률 {0}%  |  {1}승 / {2}판",
    firstGame: "첫 판에 도전하세요!", streak: "🔥 {0}연승 중",
    nextAmmo: "다음 탄 {0}s", noAmmo: "공격 불가", stability: "안정성 {0}%",
    doublePunch: "더블 펀치", boomerang: "부메랑", sniper: "고속 저격",
    mapPrefix: "맵: ", resultKO: "전투 불능", trainingKO: "훈련 중 쓰러졌습니다.",
    dmgDealt: "입힌 데미지: {0}", rank1: "1위 🏆", rankN: "{0}위",
    resultDead: "전투 불능. {0} 트로피{1}", resultDraw: "무승부. {0} 트로피{1}",
    resultWin: "해골천의 최후의 1인! {0} 트로피{1}",
    resultLose: "{0}이(가) 우승했습니다. {1} 트로피{2}",
    streakAchieve: "🔥 {0}연승!{1}", streakBonus: " (+{0} 보너스)",
    streakBroken: "연승이 끊겼습니다 (최고: {0}연승)",
    milestone100: "🎉 100승 달성! +50 트로피\n",
    loginExceeded: "아이디 입력 횟수를 초과했습니다.",
    loginWrong: "아이디가 틀렸습니다.", loginRemain: "아이디가 틀렸습니다. 남은 시도: {0}회",
    myId: "내 아이디: {0}", totalTrophy: " (총 {0})",
    killFeed: "{0} 처치 -> {1}",
    zonePhase1: "1단계 축소", zonePhase2: "2단계 축소", zonePhase3: "3단계 축소",
    zonePhase4: "4단계 축소", zoneFinal: "최종 구역",
    pv123a: "다국어 시스템 추가 (한국어/영어)",
    pv122a: "상성표 · 패치노트를 로비 우측 상단으로 이동",
    pv121a: "알파 시즌 1 시작", pv121b: "상성표 설명 텍스트 추가", pv121c: "패치노트 스크롤 수정",
    pv12a: "캐릭터별 승률 · 판수 · 승리 횟수 표시 추가",
    pv12b: "연승 시스템 추가 (2연승+1 ~ 5연승이상+4 보너스 트로피)",
    pv12c: "상성표 추가", pv12d: "패치노트 추가",
    pv11a: "즉시회복 시스템 변경 (3초 후 25% 일괄 회복, 봇은 5초)",
    pv11b: "봇 수풀 매복 영구 정지 버그 수정", pv11c: "자기장 피해 중 자연회복 동시 적용 차단",
    pv11d: "수풀 GPU 최적화", pv11e: "봇 타겟팅 로직 개선",
    pv10a: "3종 캐릭터 (Red / Green / Blue)", pv10b: "배틀 맵 3종 로테이션",
    pv10c: "트로피 · 순위 시스템", pv10d: "수풀 은신 메커닉", pv10e: "훈련장",
  },
  en: {
    exitTraining: "Leave Training", survivorsLabel: "Survivors", zoneLabel: "Zone",
    zoneWaiting: "Waiting", ammoFull: "Ammo Full", ammoLabel: "Ammo", attack: "ATK",
    zoneWarning: "Outside the zone!", matchupBtn: "Matchups", matchupBtnClose: "Close Matchups",
    matchupDesc: "Rock-paper-scissors — target your advantage to win!",
    muChar: "Character", muAdv: "✅ Strong", muDis: "❌ Weak",
    patchnotesBtn: "Patch Notes", patchnotesBtnClose: "Close Notes",
    gameTitle: "Skull Creek", welcomeMsg: "Welcome to the Battle Royale arena.",
    idLabel: "User ID", nicknameLabel: "Nickname", idPlaceholder: "Max 16 chars",
    nickPlaceholder: "Max 12 chars", enterBattle: "Enter Arena",
    dailyLoginMsg: "Enter your ID for today.", dailyIdPlaceholder: "Enter ID",
    confirm: "Confirm", accountRecovery: "Account Recovery",
    season: "Alpha Season 1", charSelect: "Select Character",
    redDesc: "Double Punch, close-range tank", greenDesc: "4-shot boomerang, mid-range",
    blueDesc: "Fast sniper, long range",
    controls: "WASD Move · Mouse Aim · Click Attack · Auto Reload",
    startBattle: "Start Battle", training: "Training", playAgain: "Play Again", exit: "Exit",
    trophyLabel: "Trophies", record: "{0}W {1}L", winrate: "WR {0}%  |  {1}W / {2}G",
    firstGame: "Play your first match!", streak: "🔥 {0} Win Streak",
    nextAmmo: "Next {0}s", noAmmo: "No Ammo", stability: "Stability {0}%",
    doublePunch: "Double Punch", boomerang: "Boomerang", sniper: "Sniper",
    mapPrefix: "Map: ", resultKO: "Eliminated", trainingKO: "Knocked out during training.",
    dmgDealt: "Damage Dealt: {0}", rank1: "#1 🏆", rankN: "#{0}",
    resultDead: "Eliminated. {0} trophies{1}", resultDraw: "Draw. {0} trophies{1}",
    resultWin: "Last one standing! {0} trophies{1}",
    resultLose: "{0} wins. {1} trophies{2}",
    streakAchieve: "🔥 {0} Win Streak!{1}", streakBonus: " (+{0} bonus)",
    streakBroken: "Streak broken (best: {0})",
    milestone100: "🎉 100 Wins! +50 Trophies\n",
    loginExceeded: "Too many login attempts.",
    loginWrong: "Incorrect ID.", loginRemain: "Incorrect ID. Remaining: {0}",
    myId: "My ID: {0}", totalTrophy: " (total {0})",
    killFeed: "{0} killed {1}",
    zonePhase1: "Phase 1", zonePhase2: "Phase 2", zonePhase3: "Phase 3",
    zonePhase4: "Phase 4", zoneFinal: "Final Zone",
    pv123a: "Multi-language support (KR/EN)",
    pv122a: "Moved matchups & patch notes to top-right",
    pv121a: "Alpha Season 1 start", pv121b: "Matchup description added", pv121c: "Patch notes scroll fix",
    pv12a: "Per-character win rate / games / wins display",
    pv12b: "Win streak system (2-streak +1 ~ 5+ streak +4 bonus trophies)",
    pv12c: "Matchup table added", pv12d: "Patch notes added",
    pv11a: "Instant regen changed (25% lump after 3s, bots 5s)",
    pv11b: "Bot bush ambush freeze fix", pv11c: "Zone damage blocks natural regen",
    pv11d: "Bush GPU optimization", pv11e: "Bot targeting improvements",
    pv10a: "3 Characters (Red / Green / Blue)", pv10b: "3 Battle Map rotation",
    pv10c: "Trophy & ranking system", pv10d: "Bush stealth mechanic", pv10e: "Training mode",
  },
};

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
const attackDepth = 5;
const attackWidth = 2.3;
const attackHalfWidth = attackWidth * 0.5;
const baseMoveSpeed = 10.4;
const turnSpeed = 4.4;
const maxAmmo = 3;
const reloadDuration = 0.5;
const attackCooldown = 0.62;
const attackEvents = [
  { delay: 0.12, damage: 2000 },
  { delay: 0.36, damage: 2000 },
];

const CHARACTERS = {
  red: {
    color: 0xe53729,
    maxHealth: 10000,
    attackType: "punch",
    reloadDuration: 0.5,
    attackCooldown: 0.62,
    moveSpeedMultiplier: 1.1375,
    walk: { cycleSpeed: 9, armAmp: 0.34, legAmp: 0.40, armRestZ: Math.PI * 0.1 },
  },
  green: {
    color: 0x3dbd4a,
    maxHealth: 8400,
    attackType: "boomerang",
    reloadDuration: 1.0,
    attackCooldown: 0.40,
    moveSpeedMultiplier: 1.0708,
    boomerangCount: 4,
    boomerangDamage: 1000,
    boomerangRange: 5,
    boomerangSpeed: 16,
    boomerangFarThreshold: 3.5,
    boomerangFarMultiplier: 0.625,
    boomerangAngles: [-30, -10, 10, 30].map((d) => d * (Math.PI / 180)),
    walk: { cycleSpeed: 8, armAmp: 0.30, legAmp: 0.38, armRestZ: Math.PI * 0.06 },
  },
  blue: {
    color: 0x4a8fd4,
    maxHealth: 4400,
    attackType: "bullet",
    reloadDuration: 0.1,
    attackCooldown: 0.25,
    bulletDamage: 1000,
    bulletRange: 16,
    bulletSpeed: 28,
    moveSpeedMultiplier: 1.0,
    walk: { cycleSpeed: 7, armAmp: 0.20, legAmp: 0.34, armRestZ: Math.PI * 0.03 },
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
      };
    }
    if (account.winStreak === undefined) account.winStreak = 0;
    if (account.bestStreak === undefined) account.bestStreak = 0;
    if (!account.lang) account.lang = "ko";
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
    selectedCharacter: "red",
    lastLoginDate: getTodayString(),
    loginAttempts: 0,
    charStats: {
      red:   { wins: 0, games: 0 },
      green: { wins: 0, games: 0 },
      blue:  { wins: 0, games: 0 },
    },
    winStreak: 0,
    bestStreak: 0,
    lang: currentLang,
  };
  saveAccount(account);
  return account;
}

function calcLevel(trophies) {
  return Math.floor(trophies / 300) + 1;
}

function updateLobbyUI(account) {
  lobbyNickname.textContent = account.nickname;
  lobbyLevel.textContent = `Lv.${calcLevel(account.trophies)}`;
  lobbyTrophies.textContent = account.trophies;
  lobbyRecord.textContent = t("record", account.wins, account.losses);

  // 캐릭터별 승률
  for (const char of ["red", "green", "blue"]) {
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
  state.selectedCharacter = account.selectedCharacter;
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
  const account = loadAccount();

  if (!account || !account.id) {
    accountCreation.classList.remove("hidden");
    lobbyMain.classList.add("hidden");
    dailyLogin.classList.add("hidden");
    sidePanel.classList.add("hidden");
    idInput.value = "";
    nicknameInput.value = "";
    createAccountBtn.disabled = true;
    setTimeout(() => idInput.focus(), 50);
  } else if (isLoginDoneToday(account)) {
    accountCreation.classList.add("hidden");
    lobbyMain.classList.remove("hidden");
    dailyLogin.classList.add("hidden");
    sidePanel.classList.remove("hidden");
    if (account.lang && account.lang !== currentLang) setLanguage(account.lang);
    updateLobbyUI(account);
  } else {
    accountCreation.classList.add("hidden");
    lobbyMain.classList.add("hidden");
    dailyLogin.classList.remove("hidden");
    sidePanel.classList.add("hidden");
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
  if (!account) return { streakBefore: 0, streakAfter: 0, bonus: 0, milestone: false };

  const char = account.selectedCharacter;
  const prevStreak = account.winStreak;
  let bonus = 0;
  let milestone = false;

  account.charStats[char].games += 1;
  if (rank <= 4) {
    account.wins += 1;
    account.charStats[char].wins += 1;
    account.winStreak += 1;
    if (account.winStreak > account.bestStreak) account.bestStreak = account.winStreak;
    bonus = streakBonus(account.winStreak);
    if (account.charStats[char].wins > 0 && account.charStats[char].wins % 100 === 0) {
      account.trophies += 50;
      milestone = true;
    }
  } else {
    account.losses += 1;
    account.winStreak = 0;
  }

  const delta = calcTrophyChange(rank);
  account.trophies = Math.max(0, account.trophies + delta + bonus);
  saveAccount(account);
  return { streakBefore: prevStreak, streakAfter: account.winStreak, bonus, milestone };
}

// ──────────────────────────────────────────────────────────────────────────
const aimRaycaster = new THREE.Raycaster();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const mouseAimWorld = new THREE.Vector3();

const zonePhases = [
  { start: 0,   end: 30,  radius: 52, damage: 0,    labelKey: "zoneWaiting" },
  { start: 30,  end: 57,  radius: 42, damage: 150,  labelKey: "zonePhase1" },
  { start: 57,  end: 84,  radius: 32, damage: 250,  labelKey: "zonePhase2" },
  { start: 84,  end: 111, radius: 23, damage: 400,  labelKey: "zonePhase3" },
  { start: 111, end: 136, radius: 15, damage: 650,  labelKey: "zonePhase4" },
  { start: 136, end: 999, radius: 8,  damage: 1000, labelKey: "zoneFinal" },
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
    color: 0xffffff,
    transparent: true,
    opacity: 0.17,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  // 히트박스와 정확히 일치하는 구조:
  //   subGroup에 tilt 회전 → rect 위치가 effectiveYaw 프레임(히트박스 검사 프레임)에서 정의됨
  //
  // Hit 0: effectiveYaw = yaw + (-20°), punchSide = +0.5
  const subA = new THREE.Group();
  subA.rotation.y = -20 * (Math.PI / 180);
  const rectA = new THREE.Mesh(new THREE.PlaneGeometry(attackWidth, attackDepth), makeMat());
  rectA.rotation.x = -Math.PI / 2;
  rectA.position.set(0.5, 0.08, attackDepth * 0.5);
  subA.add(rectA);
  group.add(subA);

  // Hit 1: effectiveYaw = yaw + (+20°), punchSide = -1
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

function createStickman(color) {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.82,
    metalness: 0.03,
  });
  const darkMaterial = material.clone();
  darkMaterial.color.offsetHSL(0, 0, -0.08);

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.46, 1.45, 8, 14), material);
  body.position.y = 0.05;
  body.castShadow = true;
  group.add(body);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.16, 12), darkMaterial);
  neck.position.y = 1.1;
  neck.castShadow = true;
  group.add(neck);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.72, 18, 18), material);
  head.position.y = 1.9;
  head.castShadow = true;
  group.add(head);

  const armGeo = new THREE.CapsuleGeometry(0.18, 0.9, 6, 10);
  const legGeo = new THREE.CapsuleGeometry(0.2, 1.15, 6, 10);

  const leftArm = new THREE.Mesh(armGeo, darkMaterial);
  leftArm.position.set(-0.6, 0.35, 0);
  leftArm.rotation.z = Math.PI * 0.1;
  leftArm.castShadow = true;
  const leftFist = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), darkMaterial);
  leftFist.position.set(0, -0.62, 0.02);
  leftFist.scale.set(1.1, 1, 1.12);
  leftFist.castShadow = true;
  leftArm.add(leftFist);
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, darkMaterial);
  rightArm.position.set(0.6, 0.35, 0);
  rightArm.rotation.z = -Math.PI * 0.1;
  rightArm.castShadow = true;
  const rightFist = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), darkMaterial);
  rightFist.position.set(0, -0.62, 0.02);
  rightFist.scale.set(1.1, 1, 1.12);
  rightFist.castShadow = true;
  rightArm.add(rightFist);
  group.add(rightArm);

  const leftLeg = new THREE.Mesh(legGeo, darkMaterial);
  leftLeg.position.set(-0.24, -1.15, 0);
  leftLeg.castShadow = true;
  const leftFoot = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 12), darkMaterial);
  leftFoot.position.set(0, -0.72, 0.14);
  leftFoot.scale.set(1.18, 0.7, 1.55);
  leftFoot.castShadow = true;
  leftLeg.add(leftFoot);
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, darkMaterial);
  rightLeg.position.set(0.24, -1.15, 0);
  rightLeg.castShadow = true;
  const rightFoot = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 12), darkMaterial);
  rightFoot.position.set(0, -0.72, 0.14);
  rightFoot.scale.set(1.18, 0.7, 1.55);
  rightFoot.castShadow = true;
  rightLeg.add(rightFoot);
  group.add(rightLeg);

  group.userData = {
    body,
    neck,
    head,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
  };

  return group;
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
  const fighter = {
    id: options.id,
    name: options.name,
    characterType: options.characterType ?? "red",
    isPlayer: options.isPlayer,
    botStyle: options.botStyle ?? "aggressive",
    health: charDef.maxHealth,
    maxHealth: charDef.maxHealth,
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
    botHoldUntil: 0,
    attackSwing: 0,
    attackAnimTime: -1,
    lastCombatTime: -999,
    nextRegenAt: 0,
    damageDealt: 0,
    ambushing: false,
    ambushUntil: 0,
    ambushCooldownUntil: 0,
  };

  fighter.mesh = createStickman(charDef.color);
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
  return fighter;
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
    const clump = new THREE.Mesh(bushClumpGeo, bushClumpMats[i % bushClumpMats.length]);
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
  bushArr.push({ x, z, radius: radius + 0.25 });
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
      [-39, 39, 6, 2], [-33, 34, 2, 6], [-18, 40, 8, 2], [-7, 35, 2, 8], [9, 36, 2, 10], [24, 38, 2, 8],
      [34, 34, 8, 2], [41, 23, 2, 8], [36, 12, 6, 2], [22, 20, 2, 8], [14, 9, 8, 2], [0, 17, 10, 2],
      [-13, 18, 2, 8], [-24, 15, 6, 2], [-36, 20, 2, 10], [-42, 8, 6, 2], [-28, 4, 2, 8], [-15, -2, 10, 2],
      [-2, 4, 2, 10], [16, -2, 6, 2], [28, 4, 2, 8], [40, -2, 6, 2], [35, -18, 2, 12], [25, -24, 10, 2],
      [15, -30, 2, 8], [0, -26, 8, 2], [-12, -30, 2, 8], [-28, -24, 10, 2], [-38, -16, 2, 8], [-42, -30, 8, 2],
      [-30, -40, 10, 2], [-14, -40, 8, 2], [2, -40, 12, 2], [18, -38, 2, 10], [30, -40, 8, 2], [42, -34, 2, 8],
      [-6, -14, 6, 2], [8, -14, 2, 8], [12, -12, 8, 2], [-20, -14, 2, 8], [-24, -8, 8, 2], [24, -10, 8, 2],
      [31, -8, 2, 8], [5, 28, 8, 2], [15, 28, 2, 8], [-26, 28, 10, 2], [-18, 25, 2, 8], [32, 26, 8, 2],
    ],
    bushSpecs: [
      [-42, 44], [-33, 42], [-23, 44], [-6, 44], [10, 44], [28, 42], [40, 44],
      [-44, 30], [-34, 27], [-20, 30], [-8, 27], [5, 31], [18, 30], [34, 28], [43, 26],
      [-44, 14], [-32, 12], [-17, 10], [0, 9], [16, 12], [33, 14], [43, 9],
      [-41, -2], [-29, -3], [-14, -2], [0, -3], [18, -4], [34, -1], [42, -4],
      [-44, -18], [-31, -17], [-18, -19], [-3, -18], [13, -18], [28, -18], [42, -22],
      [-40, -34], [-22, -36], [-6, -33], [8, -34], [24, -33], [38, -36],
    ],
    skullSpecs: [
      [-18, 12], [-6, 8], [8, 10], [18, 7], [-12, 24], [14, 24], [0, 28], [-28, 0], [30, -18], [-4, -22],
    ],
    lakes: [{ x: 0, z: -18, width: 18, depth: 5.5 }],
    spawns: [
      [-40, 0, 42], [-18, 0, 44], [6, 0, 43], [32, 0, 40], [43, 0, 12],
      [38, 0, -26], [12, 0, -42], [-16, 0, -41], [-39, 0, -22], [-44, 0, 10],
    ],
  },
  {
    id: 1,
    name: "마른 호수",
    wallSpecs: [
      [-38, 42, 8, 2], [-20, 38, 2, 8], [0, 42, 10, 2], [18, 38, 2, 8], [36, 40, 6, 2],
      [-42, 28, 2, 10], [-28, 22, 8, 2], [-10, 28, 2, 8], [10, 22, 8, 2], [28, 28, 2, 10], [42, 20, 6, 2],
      [-36, 10, 6, 2], [-22, 6, 2, 8], [-8, 10, 8, 2], [8, 6, 2, 8], [22, 10, 6, 2], [38, 8, 2, 8],
      [-40, -6, 8, 2], [-24, -10, 2, 8], [-6, -6, 6, 2], [10, -10, 2, 8], [26, -6, 8, 2], [42, -10, 2, 8],
      [-36, -22, 2, 10], [-18, -24, 8, 2], [0, -20, 2, 8], [18, -24, 8, 2], [36, -22, 2, 10],
      [-42, -36, 8, 2], [-26, -38, 2, 8], [-8, -40, 10, 2], [12, -38, 2, 8], [30, -40, 8, 2], [42, -34, 2, 8],
      [-14, 14, 2, 6], [14, 14, 2, 6], [-14, -14, 2, 6], [14, -14, 2, 6], [0, 0, 4, 4],
    ],
    bushSpecs: [
      [-44, 44], [-30, 44], [-10, 44], [10, 44], [30, 44], [44, 44],
      [-44, 28], [-16, 30], [16, 30], [44, 28],
      [-44, 10], [-30, 8], [0, 12], [30, 8], [44, 10],
      [-44, -8], [-30, -8], [0, -8], [30, -8], [44, -8],
      [-44, -24], [-14, -26], [14, -26], [44, -24],
      [-44, -40], [-18, -42], [6, -42], [24, -42], [44, -40],
    ],
    skullSpecs: [
      [-20, 30], [20, 30], [-20, -30], [20, -30], [0, 18], [0, -18], [-30, 0], [30, 0],
    ],
    lakes: [
      { x: -30, z: -14, width: 10, depth: 6 },
      { x: 30, z: 14, width: 10, depth: 6 },
    ],
    spawns: [
      [-42, 0, 44], [-14, 0, 44], [14, 0, 44], [42, 0, 44], [44, 0, 14],
      [44, 0, -20], [14, 0, -42], [-14, 0, -42], [-44, 0, -20], [-44, 0, 14],
    ],
  },
  {
    id: 2,
    name: "뼈의 미로",
    wallSpecs: [
      [-40, 40, 10, 2], [-24, 36, 2, 10], [0, 40, 12, 2], [24, 36, 2, 10], [40, 40, 10, 2],
      [-42, 24, 2, 8], [-30, 18, 8, 2], [-14, 24, 2, 10], [0, 18, 10, 2], [14, 24, 2, 10], [30, 18, 8, 2], [42, 24, 2, 8],
      [-38, 6, 6, 2], [-20, 2, 2, 10], [-6, 6, 6, 2], [6, 2, 2, 10], [20, 6, 6, 2], [38, 2, 2, 10],
      [-42, -10, 8, 2], [-28, -14, 2, 8], [-10, -10, 10, 2], [10, -14, 2, 8], [28, -10, 8, 2], [42, -14, 2, 8],
      [-36, -26, 2, 10], [-18, -28, 8, 2], [0, -26, 2, 10], [18, -28, 8, 2], [36, -26, 2, 10],
      [-40, -40, 10, 2], [-22, -42, 2, 8], [0, -40, 12, 2], [22, -42, 2, 8], [40, -40, 10, 2],
    ],
    bushSpecs: [
      [-42, 44], [-20, 44], [0, 44], [20, 44], [42, 44],
      [-36, 28], [-6, 28], [6, 28], [36, 28],
      [-42, 12], [-28, 8], [0, 8], [28, 8], [42, 12],
      [-42, -6], [-14, -6], [14, -6], [42, -6],
      [-42, -22], [-10, -22], [10, -22], [42, -22],
      [-42, -38], [-10, -38], [10, -38], [42, -38],
    ],
    skullSpecs: [
      [-30, 30], [30, 30], [-30, -30], [30, -30], [0, 0],
      [-20, 14], [20, 14], [-20, -14], [20, -14], [0, 30],
    ],
    lakes: [{ x: 0, z: -34, width: 14, depth: 5 }],
    spawns: [
      [-42, 0, 42], [-10, 0, 42], [10, 0, 42], [42, 0, 42], [44, 0, 10],
      [44, 0, -18], [10, 0, -44], [-10, 0, -44], [-44, 0, -18], [-44, 0, 10],
    ],
  },
];

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

const zoneRing = (() => {
  const geometry = new THREE.RingGeometry(0.96, 1.0, 96);
  const material = new THREE.MeshBasicMaterial({
    color: 0x81f6ff,
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
      color: 0x77c3ff,
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
      color: 0x3dea60,
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
    new THREE.LineBasicMaterial({ color: 0x7dff8a, transparent: true, opacity: 0.55 }),
  );
  group.add(arcLine);

  // Side lines
  [-halfAngle, halfAngle].forEach((a) => {
    const sideLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.09, 0),
        new THREE.Vector3(Math.sin(a) * range, 0.09, Math.cos(a) * range),
      ]),
      new THREE.LineBasicMaterial({ color: 0x7dff8a, transparent: true, opacity: 0.55 }),
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

  // 레이저 빔 라인
  const beam = new THREE.Mesh(
    new THREE.PlaneGeometry(0.16, range),
    new THREE.MeshBasicMaterial({
      color: 0x7ec8ff,
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
      color: 0xaae4ff,
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

const blueAimIndicator = createBlueAimIndicator();

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

function addKillFeed(text) {
  const item = document.createElement("div");
  item.className = "kill-item";
  item.textContent = text;
  killFeed.prepend(item);
  window.setTimeout(() => item.remove(), 4000);
}

function flashHitMarker() {
  hitMarker.classList.remove("flash");
  void hitMarker.offsetWidth;
  hitMarker.classList.add("flash");
}

function showDamageTakenIndicator(amount) {
  damageTakenIndicator.textContent = `${Math.round(amount)}`;
  damageTakenIndicator.classList.remove("flash");
  void damageTakenIndicator.offsetWidth;
  damageTakenIndicator.classList.add("flash");
}

function createAttackEffect(attacker, hitIndex) {
  // 위치: 바라보는 방향(attacker.yaw) 정면 기준으로 고정
  // 회전(각도): X자 기울기(tilt) 적용
  const tilt = (hitIndex === 0 ? -20 : 20) * (Math.PI / 180);
  const effectYaw = attacker.yaw + tilt;
  const color0 = hitIndex === 0 ? 0xffcb66 : 0xff8d57;

  // 정면 기준 위치 (side offset 제거 — 바라보는 방향 정중앙)
  const fwdDist = attackDepth * 0.5;
  const cx = attacker.mesh.position.x + Math.sin(attacker.yaw) * fwdDist;
  const cz = attacker.mesh.position.z + Math.cos(attacker.yaw) * fwdDist;

  // 토러스 고리 — 기울기 방향으로 회전
  const torusMesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.72 + hitIndex * 0.08, 0.08, 8, 20, Math.PI * 0.78),
    new THREE.MeshBasicMaterial({ color: color0, transparent: true, opacity: 0.85 }),
  );
  torusMesh.rotation.y = effectYaw - Math.PI / 2;
  torusMesh.rotation.x = Math.PI / 2;
  torusMesh.position.set(cx, 1.25, cz);
  scene.add(torusMesh);
  state.effects.push({ mesh: torusMesh, life: 0.22, maxLife: 0.22, type: "attack" });

  // 슬래시 라인 — 기울기 방향으로 세운 수직 평면
  const slashMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.26, attackDepth * 0.9),
    new THREE.MeshBasicMaterial({
      color: hitIndex === 0 ? 0xfff2bb : 0xffd4aa,
      transparent: true,
      opacity: 1.0,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  slashMesh.rotation.set(0, effectYaw, 0);
  slashMesh.position.set(cx, 0.9, cz);
  scene.add(slashMesh);
  state.effects.push({ mesh: slashMesh, life: 0.13, maxLife: 0.13, type: "slash" });
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

function createDamagePopup(position, amount) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  ctx.font = "bold 40px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 6;
  ctx.strokeStyle = "rgba(40, 20, 0, 0.75)";
  ctx.fillStyle = "#ffd27a";
  const text = `${Math.round(amount)}`;
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
    const botTypes = ["red", "green", "blue"];
    const characterType = index === 0 ? state.selectedCharacter : botTypes[Math.floor(Math.random() * botTypes.length)];
    const label = characterType === "red" ? "Red" : characterType === "green" ? "Green" : "Blue";
    const name = index === 0 ? label : `${label} AI ${index}`;
    const fighter = makeFighter({
      id: index,
      name,
      characterType,
      isPlayer: index === 0,
      position: spawn,
      yaw: Math.random() * Math.PI * 2,
      botStyle: index % 2 === 0 ? "aggressive" : "skirmisher",
    });
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
    botStyle: "aggressive",
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
        botStyle: "aggressive",
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
  battleMapGroup.visible = false;
  trainingMapGroup.visible = true;
  state.solids = state.trainingSolids;
  state.lakeRects = [];
  state.bushes = [];
  state.trainingMode = true;
  mapNameEl.classList.add("hidden");
  state.gameTime = 0;
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
  battleMapGroup.visible = true;
  trainingMapGroup.visible = false;
  state.solids = state.battleSolids;
  state.lakeRects = state.battleLakeRects;
  state.bushes = state.battleBushes;
  state.trainingMode = false;
  const currentMap = MAP_POOL[state.currentMapId];
  mapNameEl.textContent = t("mapPrefix") + currentMap.name;
  mapNameEl.classList.remove("hidden");
  state.gameTime = 0;
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
}

function isWallAhead(fighter, dirX, dirZ, lookahead) {
  const len = Math.hypot(dirX, dirZ);
  if (len < 0.0001) {
    return false;
  }
  const checkX = fighter.mesh.position.x + (dirX / len) * lookahead;
  const checkZ = fighter.mesh.position.z + (dirZ / len) * lookahead;
  for (const solid of state.solids) {
    if (intersectsRect(checkX, checkZ, fighter.radius, solid)) {
      return true;
    }
  }
  return false;
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
  const zone = fighter.isPlayer ? getCurrentZone() : null;
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
  return reloadDur / fighter.maxAmmo;
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
  if (fighter.characterType === "green") {
    return beginBoomerangAttack(fighter);
  }
  if (fighter.characterType === "blue") {
    return beginBulletAttack(fighter);
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

  attackEvents.forEach((event, index) => {
    queueAttackHit(fighter, index, event.damage, state.gameTime + event.delay);
  });

  createAttackEffect(fighter, 0);
  if (fighter.isPlayer) {
    audio.play("attack");
  }
  return true;
}

function getAttackRange(fighter) {
  if (fighter.characterType === "green") return CHARACTERS.green.boomerangRange;
  if (fighter.characterType === "blue") return CHARACTERS.blue.bulletRange;
  return attackDepth;
}

function getMoveSpeed(fighter) {
  const multiplier = CHARACTERS[fighter.characterType]?.moveSpeedMultiplier ?? 1.0;
  return baseMoveSpeed * multiplier;
}

function createBulletMesh(position, yaw) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 8, 6),
    new THREE.MeshBasicMaterial({ color: 0x7ec8ff }),
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
      projRadius: 0.26,
    });
  });

  if (fighter.isPlayer) {
    audio.play("attack");
  }
  return true;
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
    proj.mesh.position.set(proj.x, proj.isBullet ? 1.3 : 1.2, proj.z);
    if (!proj.isBullet) {
      proj.mesh.rotation.z += dt * 10;
    }

    let hit = false;
    const attacker = state.players.find((p) => p.id === proj.ownerId);
    for (const target of state.players) {
      if (target.id === proj.ownerId || target.dead) {
        continue;
      }
      const dx = target.mesh.position.x - proj.x;
      const dz = target.mesh.position.z - proj.z;
      const hitDist = target.radius + (proj.projRadius || 0);
      if (dx * dx + dz * dz < hitDist * hitDist) {
        const isFar = proj.distTraveled > proj.farThreshold;
        const dmg = isFar ? proj.damage * proj.farMultiplier : proj.damage;
        applyDamage(target, dmg, attacker ?? null);
        if (proj.ownerId === 0) {
          flashHitMarker();
          audio.play("hit");
        }
        tempVec3.set(proj.x, 1.6, proj.z);
        createHitSpark(tempVec3);
        hit = true;
        break;
      }
    }

    // 벽 충돌 시 소멸
    if (!hit) {
      for (const solid of state.solids) {
        if (intersectsRect(proj.x, proj.z, 0.2, solid)) {
          hit = true;
          break;
        }
      }
    }

    if (hit || proj.distTraveled >= proj.range) {
      scene.remove(proj.mesh);
      state.projectiles.splice(i, 1);
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

  const healthBefore = target.health;
  target.health = Math.max(0, target.health - amount);
  target.flashTimer = 0.12;
  target.pitchKick = Math.min(1, target.pitchKick + 0.55);
  if (updateCombatTime) {
    target.lastCombatTime = state.gameTime;
  }
  const dealt = healthBefore - target.health;
  if (attacker) {
    attacker.lastCombatTime = state.gameTime;
    attacker.damageDealt += dealt;
    if (attacker.isPlayer && target.id !== attacker.id) {
      tempVec3.copy(target.mesh.position);
      createDamagePopup(tempVec3, dealt);
    }
  }

  if (target.isPlayer) {
    state.feedback.hitFlashUntil = state.gameTime + 0.18;
    audio.play("hit");
    if (!attacker || target.id !== attacker.id) {
      showDamageTakenIndicator(dealt);
    }
  }

  if (target.health <= 0) {
    target.dead = true;
    target.mesh.visible = false;
    target.shadow.visible = false;
    target.healthBar.visible = false;
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

function updateEffects(dt) {
  for (let i = state.effects.length - 1; i >= 0; i -= 1) {
    const effect = state.effects[i];
    effect.life -= dt;
    if (effect.life <= 0) {
      scene.remove(effect.mesh);
      if (effect.type === "damagePopup") {
        effect.mesh.material.map.dispose();
        effect.mesh.material.dispose();
      }
      state.effects.splice(i, 1);
      continue;
    }
    const alpha = effect.life / effect.maxLife;
    if (effect.type === "attack") {
      effect.mesh.scale.setScalar(1 + (1 - alpha) * 0.28);
      effect.mesh.material.opacity = alpha * 0.85;
    } else if (effect.type === "slash") {
      // 너비는 빠르게 퍼지고, 투명도는 제곱으로 빠르게 사라짐
      effect.mesh.scale.x = 1 + (1 - alpha) * 1.8;
      effect.mesh.scale.y = 1.0;
      effect.mesh.material.opacity = alpha * alpha;
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

  // 오토에임: 클릭(공격) 중일 때만 사거리 내 가장 가까운 적을 자동 추적
  let autoTarget = null;
  if (state.mouseHeld) {
    const autoAimRange = Math.max(15, getAttackRange(player));
    let autoTargetDist = autoAimRange;
    for (const fighter of state.players) {
      if (fighter.id === player.id || fighter.dead) continue;
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

  // 마우스 홀드 시 연속 공격 (beginAttack 내부 nextAttackAt 가드로 쿨다운 자동 제어)
  if (state.mouseHeld && state.running) {
    beginAttack(player);
  }

  moveFighter(player, tempVec3, dt);
}

function chooseBotTarget(bot) {
  let best = null;
  let bestScore = Infinity;
  const playerDead = getPlayer()?.dead ?? false;
  const visionRange = playerDead ? 200 : 50;
  const bushVisionRange = playerDead ? 200 : 9;
  for (const fighter of state.players) {
    if (fighter.id === bot.id || fighter.dead) {
      continue;
    }
    const dx = fighter.mesh.position.x - bot.mesh.position.x;
    const dz = fighter.mesh.position.z - bot.mesh.position.z;
    const distanceSq = dx * dx + dz * dz;
    if (distanceSq > visionRange * visionRange) {
      continue;
    }
    if (!isFighterVisible(bot, fighter) && distanceSq > bushVisionRange * bushVisionRange) continue;
    if (isInBush(fighter) && distanceSq > bushStealthRevealRangeSq) continue;
    if (distanceSq < bestScore) {
      bestScore = distanceSq;
      best = fighter;
    }
  }
  return best;
}

function updateBot(bot, dt, zone) {
  if (bot.dead || bot.isDummy) {
    return;
  }

  const target = chooseBotTarget(bot);
  const botPos = bot.mesh.position;
  const botSpeed = getMoveSpeed(bot);
  tempVec3.set(0, 0, 0);

  // 체력이 낮으면 가장 가까운 수풀로 도피해 매복 (영구 정지 방지: 5초 후 매복 해제 + 8초 재진입 쿨다운)
  if (bot.ambushing) {
    if (bot.ambushUntil > 0 && state.gameTime >= bot.ambushUntil) {
      bot.ambushing = false;
      bot.ambushUntil = 0;
      bot.ambushCooldownUntil = state.gameTime + 8;
    }
  } else if (bot.health < bot.maxHealth * 0.3 && state.gameTime >= bot.ambushCooldownUntil) {
    bot.ambushing = true;
    bot.ambushUntil = state.gameTime + 10;
  }

  const hidingBush = bot.ambushing ? findNearestBush(botPos) : null;
  const inHidingBush = hidingBush !== null && isInBush(bot);
  if (inHidingBush && bot.ambushUntil > state.gameTime + 5) {
    bot.ambushUntil = state.gameTime + 5;
  }

  if (hidingBush && !inHidingBush) {
    const toBushX = hidingBush.x - botPos.x;
    const toBushZ = hidingBush.z - botPos.z;
    const distToBush = Math.hypot(toBushX, toBushZ);
    if (distToBush > 0.5) {
      bot.yaw = Math.atan2(toBushX, toBushZ);
      tempVec3.set(toBushX / distToBush, 0, toBushZ / distToBush).multiplyScalar(botSpeed);
    }
    if (target) {
      const toTargetX = target.mesh.position.x - botPos.x;
      const toTargetZ = target.mesh.position.z - botPos.z;
      const distance = Math.hypot(toTargetX, toTargetZ);
      const atkRange = getAttackRange(bot);
      if (distance <= atkRange * 1.05) {
        beginAttack(bot);
      }
    }
  } else if (inHidingBush) {
    // 수풀 속에서 매복 — 자리를 지키며 사거리 내 적만 공격
    if (target) {
      const toTargetX = target.mesh.position.x - botPos.x;
      const toTargetZ = target.mesh.position.z - botPos.z;
      const distance = Math.hypot(toTargetX, toTargetZ);
      bot.yaw = Math.atan2(toTargetX, toTargetZ);
      const atkRange = getAttackRange(bot);
      if (distance <= atkRange * 1.05) {
        beginAttack(bot);
      }
    }
  } else if (target) {
    const toTargetX = target.mesh.position.x - botPos.x;
    const toTargetZ = target.mesh.position.z - botPos.z;
    const distance = Math.hypot(toTargetX, toTargetZ);
    bot.yaw = Math.atan2(toTargetX, toTargetZ);
    const atkRange = getAttackRange(bot);
    if (distance > atkRange * 0.86) {
      tempVec3.set(Math.sin(bot.yaw), 0, Math.cos(bot.yaw)).multiplyScalar(botSpeed * 0.82);
    } else if (distance < atkRange * 0.58) {
      tempVec3.set(-Math.sin(bot.yaw), 0, -Math.cos(bot.yaw)).multiplyScalar(botSpeed * 0.48);
    } else {
      tempVec3.set(Math.sin(bot.yaw + Math.PI / 2), 0, Math.cos(bot.yaw + Math.PI / 2))
        .multiplyScalar(botSpeed * 0.28 * bot.botStrafeDir);
    }

    if (distance <= atkRange * 1.05) {
      beginAttack(bot);
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

    tempVec3.set(bot.botMoveTarget.x - botPos.x, 0, bot.botMoveTarget.z - botPos.z);
    if (tempVec3.lengthSq() > 1) {
      bot.yaw = Math.atan2(tempVec3.x, tempVec3.z);
      tempVec3.normalize().multiplyScalar(botSpeed * 0.62);
    } else {
      tempVec3.set(0, 0, 0);
    }
  }

  const distFromCenter = Math.hypot(botPos.x - state.safeCenter.x, botPos.z - state.safeCenter.y);
  if (distFromCenter > zone.radius - 4) {
    const toCenterX = state.safeCenter.x - botPos.x;
    const toCenterZ = state.safeCenter.y - botPos.z;
    const len = Math.hypot(toCenterX, toCenterZ) || 1;
    tempVec3.set((toCenterX / len) * botSpeed, 0, (toCenterZ / len) * botSpeed);
    bot.yaw = Math.atan2(tempVec3.x, tempVec3.z);
  }

  const moveSpeed = Math.hypot(tempVec3.x, tempVec3.z);
  if (moveSpeed > 0.0001) {
    const lookahead = bot.radius + 1.5;
    const dirX = tempVec3.x / moveSpeed;
    const dirZ = tempVec3.z / moveSpeed;
    const escapeDir = findWallEscapeDir(bot, dirX, dirZ, lookahead);
    if (escapeDir) {
      tempVec3.set(escapeDir.x * moveSpeed, 0, escapeDir.z * moveSpeed);
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
    } else {
      // 더블 펀치 콤보
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

  body.leftLeg.rotation.x = leftLeg;
  body.rightLeg.rotation.x = rightLeg;
  body.leftArm.rotation.x = leftArmX;
  body.rightArm.rotation.x = rightArmX;
  body.leftArm.rotation.z = leftArmZ;
  body.rightArm.rotation.z = rightArmZ;
  body.body.rotation.z = bodyZ;
  body.body.rotation.y = bodyY;
  body.head.rotation.y = headY;
  body.head.rotation.x = headX;

  fighter.attackSwing = Math.max(0, fighter.attackSwing - dt * 5);
  fighter.spread = Math.max(0, fighter.spread - dt * 0.13);
  fighter.recoilKick = Math.max(0, fighter.recoilKick - dt * 3.4);
  fighter.pitchKick = Math.max(0, fighter.pitchKick - dt * 4.2);

  if (fighter.flashTimer) {
    fighter.flashTimer -= dt;
    fighter.flashMaterial.emissive = new THREE.Color(0x7f0f0f);
    fighter.flashMaterial.emissiveIntensity = fighter.flashTimer > 0 ? 0.75 : 0;
  } else {
    fighter.flashMaterial.emissiveIntensity = 0;
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
  if (state.trainingMode) return;
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

  if (!player || player.dead || !state.running) {
    attackAimIndicator.visible = false;
    greenAimIndicator.visible = false;
    blueAimIndicator.visible = false;
    return;
  }

  const pos = player.mesh.position;
  const yaw = player.yaw;
  const unavailable = player.ammo <= 0;

  attackAimIndicator.visible = false;
  greenAimIndicator.visible = false;
  blueAimIndicator.visible = false;

  if (charType === "green") {
    greenAimIndicator.visible = true;
    greenAimIndicator.position.set(pos.x, 0, pos.z);
    greenAimIndicator.rotation.y = yaw;
    greenAimIndicator.userData.fanMesh.material.opacity = unavailable ? 0.05 : 0.13;
  } else if (charType === "blue") {
    blueAimIndicator.visible = true;
    blueAimIndicator.position.set(pos.x, 0, pos.z);
    blueAimIndicator.rotation.y = yaw;
    blueAimIndicator.userData.beam.material.opacity = unavailable ? 0.07 : 0.22;
    blueAimIndicator.userData.dot.material.opacity = unavailable ? 0.15 : 0.50;
  } else {
    attackAimIndicator.visible = true;
    attackAimIndicator.position.set(pos.x, 0, pos.z);
    attackAimIndicator.rotation.y = yaw;
    const activeAlpha = unavailable ? 0.06 : 0.17;
    attackAimIndicator.userData.rects.forEach((r) => { r.material.opacity = activeAlpha; });
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
  if (player.ammo >= player.maxAmmo) {
    reloadState.textContent = t("ammoFull");
  } else {
    const remain = Math.max(0, getReloadInterval(player) - player.reloadTimer);
    reloadState.textContent = t("nextAmmo", remain.toFixed(1));
  }
  const attackLabel = player.characterType === "green" ? t("boomerang")
    : player.characterType === "blue" ? t("sniper")
    : t("doublePunch");
  attackState.textContent = player.ammo <= 0 ? t("noAmmo") : attackLabel;
  spreadState.textContent = t("stability", Math.round((1 - player.spread * 0.55) * 100));
  updateAmmoPips(player.ammo);

  if (state.trainingMode) {
    survivorsPanel.style.display = "none";
    zonePanel.classList.add("is-hidden-panel");
    warning.classList.add("hidden");
    zoneRing.ring.visible = false;
    zoneRing.wall.visible = false;
    exitTrainingBtn.classList.remove("hidden");
  } else {
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
    if (fighter.dead || fighter.isDummy || fighter.health >= fighter.maxHealth) continue;
    const regenDelay = fighter.isPlayer ? 3 : 5;
    if (state.gameTime - fighter.lastCombatTime >= regenDelay && state.gameTime >= fighter.nextRegenAt) {
      fighter.health = Math.min(fighter.maxHealth, fighter.health + fighter.maxHealth * 0.25);
      fighter.nextRegenAt = state.gameTime + 1;
    }
  }
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
    const winner = alive[0];
    const playerRank = (!player || !player.dead)
      ? 1
      : state.players.length - state.deathOrder.indexOf(player.id);
    const { streakBefore, streakAfter, bonus, milestone } = recordGameResult(playerRank);
    const account = loadAccount();
    const delta = calcTrophyChange(playerRank);
    const deltaText = delta > 0 ? `+${delta}` : `${delta}`;
    const totalText = account ? t("totalTrophy", account.trophies) : "";

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
    resultStats.textContent = player ? t("dmgDealt", Math.round(player.damageDealt)) : "";

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

    resultOverlay.style.display = "flex";
    document.exitPointerLock?.();
  }
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  if (state.running) {
    state.gameTime += dt;
    const zone = getCurrentZone();

    updatePlayerControls(dt);
    for (let i = 1; i < state.players.length; i += 1) {
      updateBot(state.players[i], dt, zone);
    }
    updateAmmoRegen(dt);
    updateNaturalRegen(dt);
    updateScheduledHits();
    updateProjectiles(dt);
    updateZoneDamage(dt, zone);
    updateZoneVisual(zone);
    updateEffects(dt);

    for (const fighter of state.players) {
      updateFighterAnimation(fighter, dt);
    }

    updateCamera(dt);
    updateAttackAimIndicator();
    updateHud();
    checkEndState();
  } else {
    updateAttackAimIndicator();
  }

  renderer.render(scene, camera);
}

function setupInput() {
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

  function triggerDesktopAttack(event) {
    if (event.button !== 0 && event.button !== 2) {
      return;
    }
    event.preventDefault();
    if (state.running) {
      state.mouseHeld = true;
      beginAttack(getPlayer());
    }
  }

  const releaseHold = () => { state.mouseHeld = false; };
  window.addEventListener("mousedown", triggerDesktopAttack);
  window.addEventListener("mouseup", releaseHold);
  window.addEventListener("pointerup", releaseHold);
  window.addEventListener("pointercancel", releaseHold);
  window.addEventListener("blur", releaseHold);
  document.addEventListener("mouseleave", releaseHold);
  canvas.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse") {
      triggerDesktopAttack(event);
    }
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

  // 전투 시작
  startBattleBtn.addEventListener("click", async () => {
    await initAudio();
    messageOverlay.style.display = "none";
    state.currentMapId = Math.floor(Math.random() * MAP_POOL.length);
    createMap(MAP_POOL[state.currentMapId]);
    resetGame();
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

  // 다시 시작
  playAgainButton.addEventListener("click", () => {
    if (state.trainingMode) {
      startTraining();
    } else {
      resetGame();
    }
  });

  // 재시작 → 로비
  restartButton.addEventListener("click", () => {
    showLobby();
  });

  mobileAttackButton.addEventListener("pointerdown", async (event) => {
    event.preventDefault();
    await initAudio();
    if (state.running) {
      state.mouseHeld = true;
      beginAttack(getPlayer());
    }
  });
  mobileAttackButton.addEventListener("pointerup", () => { state.mouseHeld = false; });
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
