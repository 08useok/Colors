import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js";

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
const lobbyNickname = document.getElementById("lobby-nickname");
const lobbyLevel = document.getElementById("lobby-level");
const lobbyTrophies = document.getElementById("lobby-trophies");
const lobbyRecord = document.getElementById("lobby-record");
const resultOverlay = document.getElementById("result-overlay");
const resultTitle = document.getElementById("result-title");
const resultBody = document.getElementById("result-body");
const restartButton = document.getElementById("restart-button");
const healthFill = document.getElementById("health-fill");
const healthText = document.getElementById("health-text");
const reloadState = document.getElementById("reload-state");
const attackState = document.getElementById("attack-state");
const charName = document.getElementById("char-name");
const spreadState = document.getElementById("spread-state");
const survivorsLabel = document.getElementById("survivors");
const zonePanel = document.getElementById("zone-panel");
const zoneState = document.getElementById("zone-state");
const zoneTimer = document.getElementById("zone-timer");
const warning = document.getElementById("warning");
const ammoPips = document.getElementById("ammo-pips");
const killFeed = document.getElementById("kill-feed");
const hitMarker = document.getElementById("hit-marker");
const mobileJoystick = document.getElementById("mobile-joystick");
const mobileJoystickThumb = document.getElementById("mobile-joystick-thumb");
const mobileAttackButton = document.getElementById("mobile-attack-button");

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
const attackDepth = 4;
const attackWidth = 1;
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
  },
  green: {
    color: 0x3dbd4a,
    maxHealth: 8400,
    attackType: "boomerang",
    reloadDuration: 1.0,
    boomerangCount: 4,
    boomerangDamage: 1000,
    boomerangRange: 5,
    boomerangSpeed: 16,
    boomerangFarThreshold: 3.5,
    boomerangFarMultiplier: 0.30,
    boomerangAngles: [-30, -10, 10, 30].map((d) => d * (Math.PI / 180)),
  },
};

// ── 계정 관리 ──────────────────────────────────────────────────────────────
const ACCOUNT_KEY = "skullCreekAccount";

function loadAccount() {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    return raw ? JSON.parse(raw) : null;
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
  lobbyRecord.textContent = `${account.wins}승 ${account.losses}패`;

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
    dailyLoginError.textContent = "아이디 입력 횟수를 초과했습니다.";
    dailyLoginError.style.display = "block";
  }

  setTimeout(() => { if (!locked) dailyIdInput.focus(); }, 50);
}

function showLobby() {
  messageOverlay.style.display = "flex";
  resultOverlay.style.display = "none";
  const account = loadAccount();

  if (!account || !account.id) {
    // 계정 없거나 구버전 계정(id 없음) → 회원가입
    accountCreation.style.display = "block";
    lobbyMain.style.display = "none";
    dailyLogin.style.display = "none";
    idInput.value = "";
    nicknameInput.value = "";
    createAccountBtn.disabled = true;
    setTimeout(() => idInput.focus(), 50);
  } else if (isLoginDoneToday(account)) {
    // 오늘 인증 완료 → 로비 메인
    accountCreation.style.display = "none";
    lobbyMain.style.display = "block";
    dailyLogin.style.display = "none";
    updateLobbyUI(account);
  } else {
    // 오늘 미인증 → 일일 인증 화면
    accountCreation.style.display = "none";
    lobbyMain.style.display = "none";
    dailyLogin.style.display = "block";
    showDailyLogin(account);
  }
}

function calcTrophyChange(rank) {
  return 12 - rank * 2; // 1위 +10, 6위 0, 10위 -8
}

function recordGameResult(rank) {
  const account = loadAccount();
  if (!account) return;
  if (rank <= 4) {
    account.wins += 1;
  } else {
    account.losses += 1;
  }
  const delta = calcTrophyChange(rank);
  account.trophies = Math.max(0, account.trophies + delta);
  saveAccount(account);
}

// ──────────────────────────────────────────────────────────────────────────
const aimRaycaster = new THREE.Raycaster();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const mouseAimWorld = new THREE.Vector3();

const zonePhases = [
  { start: 0, end: 30, radius: 52, damage: 0, label: "대기 중" },
  { start: 30, end: 85, radius: 42, damage: 150, label: "1단계 축소" },
  { start: 85, end: 140, radius: 32, damage: 250, label: "2단계 축소" },
  { start: 140, end: 195, radius: 23, damage: 400, label: "3단계 축소" },
  { start: 195, end: 245, radius: 15, damage: 650, label: "4단계 축소" },
  { start: 245, end: 999, radius: 8, damage: 1000, label: "최종 구역" },
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
  safeCenter: new THREE.Vector2(0, 0),
  scheduledHits: [],
  effects: [],
  keyState: {},
  mouse: {
    screenX: window.innerWidth * 0.5,
    screenY: window.innerHeight * 0.5,
  },
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
};

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
  const rectMat = new THREE.MeshBasicMaterial({
    color: 0xe53729,
    transparent: true,
    opacity: 0.14,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  // 첫 번째 공격: 오른쪽 0.5타일
  const rectRight = new THREE.Mesh(new THREE.PlaneGeometry(attackWidth, attackDepth), rectMat.clone());
  rectRight.rotation.x = -Math.PI / 2;
  rectRight.position.set(0.5, 0.08, attackDepth * 0.5);
  group.add(rectRight);

  // 두 번째 공격: 왼쪽 1타일
  const rectLeft = new THREE.Mesh(new THREE.PlaneGeometry(attackWidth, attackDepth), rectMat.clone());
  rectLeft.rotation.x = -Math.PI / 2;
  rectLeft.position.set(-1, 0.08, attackDepth * 0.5);
  group.add(rectLeft);

  const edge = new THREE.Mesh(
    new THREE.PlaneGeometry(attackWidth * 2 + 2, 0.2),
    new THREE.MeshBasicMaterial({
      color: 0xffb4a1,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  edge.rotation.x = -Math.PI / 2;
  edge.position.set(0, 0.09, attackDepth);
  group.add(edge);

  group.renderOrder = 4;
  group.visible = false;
  group.userData = { rects: [rectLeft, rectRight], edge };
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

function createGround() {
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
  scene.add(ground);

  const grid = new THREE.GridHelper(120, 24, 0xe2b27b, 0xd6a071);
  grid.position.y = 0.05;
  grid.material.opacity = 0.18;
  grid.material.transparent = true;
  scene.add(grid);
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
    ammo: maxAmmo,
    isReloading: false,
    reloadEndsAt: 0,
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
    pendingAutoReload: false,
    lastCombatTime: -999,
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

function createWall(x, z, width, depth, height = 2.8) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({
      color: 0xb77658,
      roughness: 0.9,
      metalness: 0.02,
    }),
  );
  mesh.position.set(x, height * 0.5, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  state.solids.push({
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

function createBush(x, z, radius = 1.35) {
  const bush = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.9, radius, 0.7, 8),
    new THREE.MeshStandardMaterial({ color: 0xd4ab48, roughness: 1 }),
  );
  const top = new THREE.Mesh(
    new THREE.ConeGeometry(radius, 1.65, 8),
    new THREE.MeshStandardMaterial({ color: 0xe7bf58, roughness: 1 }),
  );
  top.position.y = 0.95;
  base.castShadow = true;
  top.castShadow = true;
  bush.add(base);
  bush.add(top);
  bush.position.set(x, 0.3, z);
  scene.add(bush);
  state.bushes.push({ x, z, radius: radius + 0.25 });
}

function createSkullCluster(x, z, count = 7) {
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
  scene.add(cluster);
}

function createLake(x, z, width, depth) {
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
  scene.add(lake);
  state.lakeRects.push({
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

function createMap() {
  createGround();

  const wallSpecs = [
    [-39, 39, 6, 2], [-33, 34, 2, 6], [-18, 40, 8, 2], [-7, 35, 2, 8], [9, 36, 2, 10], [24, 38, 2, 8],
    [34, 34, 8, 2], [41, 23, 2, 8], [36, 12, 6, 2], [22, 20, 2, 8], [14, 9, 8, 2], [0, 17, 10, 2],
    [-13, 18, 2, 8], [-24, 15, 6, 2], [-36, 20, 2, 10], [-42, 8, 6, 2], [-28, 4, 2, 8], [-15, -2, 10, 2],
    [-2, 4, 2, 10], [16, -2, 6, 2], [28, 4, 2, 8], [40, -2, 6, 2], [35, -18, 2, 12], [25, -24, 10, 2],
    [15, -30, 2, 8], [0, -26, 8, 2], [-12, -30, 2, 8], [-28, -24, 10, 2], [-38, -16, 2, 8], [-42, -30, 8, 2],
    [-30, -40, 10, 2], [-14, -40, 8, 2], [2, -40, 12, 2], [18, -38, 2, 10], [30, -40, 8, 2], [42, -34, 2, 8],
    [-6, -14, 6, 2], [8, -14, 2, 8], [12, -12, 8, 2], [-20, -14, 2, 8], [-24, -8, 8, 2], [24, -10, 8, 2],
    [31, -8, 2, 8], [5, 28, 8, 2], [15, 28, 2, 8], [-26, 28, 10, 2], [-18, 25, 2, 8], [32, 26, 8, 2],
  ];

  wallSpecs.forEach((spec) => createWall(...spec));

  const bushSpecs = [
    [-42, 44], [-33, 42], [-23, 44], [-6, 44], [10, 44], [28, 42], [40, 44],
    [-44, 30], [-34, 27], [-20, 30], [-8, 27], [5, 31], [18, 30], [34, 28], [43, 26],
    [-44, 14], [-32, 12], [-17, 10], [0, 9], [16, 12], [33, 14], [43, 9],
    [-41, -2], [-29, -3], [-14, -2], [0, -3], [18, -4], [34, -1], [42, -4],
    [-44, -18], [-31, -17], [-18, -19], [-3, -18], [13, -18], [28, -18], [42, -22],
    [-40, -34], [-22, -36], [-6, -33], [8, -34], [24, -33], [38, -36],
  ];

  bushSpecs.forEach(([x, z]) => createBush(x, z, 1.45 + Math.random() * 0.25));

  const skullSpecs = [
    [-18, 12], [-6, 8], [8, 10], [18, 7], [-12, 24], [14, 24], [0, 28], [-28, 0], [30, -18], [-4, -22],
  ];
  skullSpecs.forEach(([x, z]) => createSkullCluster(x, z, 8 + Math.floor(Math.random() * 5)));

  createLake(0, -18, 18, 5.5);
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
  fanMesh.rotation.x = -Math.PI / 2;
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

function rebuildAmmoPips() {
  ammoPips.innerHTML = "";
  for (let i = 0; i < maxAmmo; i += 1) {
    const pip = document.createElement("div");
    pip.className = `ammo-pip${i < maxAmmo ? " filled" : ""}`;
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

function createAttackEffect(attacker, hitIndex) {
  const geometry = new THREE.TorusGeometry(0.72 + hitIndex * 0.08, 0.08, 8, 20, Math.PI * 0.78);
  const material = new THREE.MeshBasicMaterial({
    color: hitIndex === 0 ? 0xffcb66 : 0xff8d57,
    transparent: true,
    opacity: 0.85,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.y = attacker.yaw - Math.PI / 2;
  mesh.rotation.x = Math.PI / 2;
  // 앞방향 + 좌우 오프셋 (hitIndex 0: 오른쪽 0.5, 1: 왼쪽 -1)
  const effectSide = hitIndex === 0 ? 0.5 : -1;
  tempVec3.set(Math.sin(attacker.yaw), 0, Math.cos(attacker.yaw)).multiplyScalar(Math.max(1.2, attackDepth * 0.55));
  tempVec3.x += Math.cos(attacker.yaw) * effectSide;
  tempVec3.z -= Math.sin(attacker.yaw) * effectSide;
  mesh.position.copy(attacker.mesh.position).add(tempVec3);
  mesh.position.y = 1.25;
  scene.add(mesh);
  state.effects.push({
    mesh,
    life: 0.24,
    maxLife: 0.24,
    type: "attack",
  });
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

function initPlayers() {
  state.players.forEach((fighter) => {
    scene.remove(fighter.mesh);
    scene.remove(fighter.shadow);
  });
  state.players = [];

  const spawns = [
    new THREE.Vector3(-40, 0, 42),
    new THREE.Vector3(-18, 0, 44),
    new THREE.Vector3(6, 0, 43),
    new THREE.Vector3(32, 0, 40),
    new THREE.Vector3(43, 0, 12),
    new THREE.Vector3(38, 0, -26),
    new THREE.Vector3(12, 0, -42),
    new THREE.Vector3(-16, 0, -41),
    new THREE.Vector3(-39, 0, -22),
    new THREE.Vector3(-44, 0, 10),
  ];

  spawns.forEach((spawn, index) => {
    const characterType = index === 0 ? state.selectedCharacter : (Math.random() < 0.5 ? "red" : "green");
    const label = characterType === "red" ? "Red" : "Green";
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

function resetGame() {
  state.gameTime = 0;
  state.running = true;
  state.gameOver = false;
  state.winner = "";
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

function startReload(fighter) {
  if (fighter.dead || fighter.isReloading || fighter.ammo === maxAmmo) {
    return false;
  }
  fighter.isReloading = true;
  fighter.pendingAutoReload = false;
  fighter.reloadEndsAt = state.gameTime + (CHARACTERS[fighter.characterType]?.reloadDuration ?? reloadDuration);
  if (fighter.isPlayer) {
    audio.play("reload");
  }
  return true;
}

function finishReload(fighter) {
  fighter.ammo = maxAmmo;
  fighter.isReloading = false;
  fighter.reloadEndsAt = 0;
  fighter.pendingAutoReload = false;
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
  if (fighter.dead || fighter.isReloading || fighter.ammo <= 0 || state.gameTime < fighter.nextAttackAt) {
    return false;
  }

  fighter.ammo -= 1;
  fighter.nextAttackAt = state.gameTime + attackCooldown;
  fighter.attackSequenceEndsAt = state.gameTime + attackCooldown;
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
  if (fighter.ammo < maxAmmo) {
    fighter.pendingAutoReload = true;
  }
  return true;
}

function getAttackRange(fighter) {
  if (fighter.characterType === "green") return CHARACTERS.green.boomerangRange;
  return attackDepth;
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
  if (fighter.dead || fighter.isReloading || fighter.ammo <= 0 || state.gameTime < fighter.nextAttackAt) {
    return false;
  }

  const charDef = CHARACTERS.green;
  fighter.ammo -= 1;
  fighter.nextAttackAt = state.gameTime + attackCooldown;
  fighter.attackSequenceEndsAt = state.gameTime + attackCooldown;
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
    });
  });

  if (fighter.ammo < maxAmmo) {
    fighter.pendingAutoReload = true;
  }
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
    proj.mesh.position.set(proj.x, 1.2, proj.z);
    proj.mesh.rotation.z += dt * 10;

    let hit = false;
    const attacker = state.players.find((p) => p.id === proj.ownerId);
    for (const target of state.players) {
      if (target.id === proj.ownerId || target.dead) {
        continue;
      }
      const dx = target.mesh.position.x - proj.x;
      const dz = target.mesh.position.z - proj.z;
      if (dx * dx + dz * dz < target.radius * target.radius) {
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

function resolveAttack(attacker, hitIndex, damage) {
  if (!attacker || attacker.dead) {
    return;
  }

  const spreadOffset = attacker.spread * 0.2 * (Math.random() * 2 - 1);
  const sinYaw = Math.sin(attacker.yaw);
  const cosYaw = Math.cos(attacker.yaw);
  // 첫 번째 공격(hitIndex 0): 오른쪽(+0.5), 두 번째(hitIndex 1): 왼쪽(-1)
  const punchSide = hitIndex === 0 ? 0.5 : -1;
  let bestTarget = null;
  let bestScore = -Infinity;

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

    if (!isVisibleThroughBush(attacker, target)) {
      continue;
    }

    const score = localZ * -1 - Math.abs(localX - punchSide) * 0.2;
    if (score > bestScore) {
      bestScore = score;
      bestTarget = target;
    }
  }

  createAttackEffect(attacker, hitIndex);

  if (bestTarget) {
    applyDamage(bestTarget, damage, attacker);
    tempVec3.copy(bestTarget.mesh.position);
    tempVec3.y = 1.6;
    createHitSpark(tempVec3);
    if (attacker.isPlayer) {
      flashHitMarker();
      audio.play("hit");
    }
  }
}

function applyDamage(target, amount, attacker = null) {
  if (target.dead) {
    return;
  }

  target.health = Math.max(0, target.health - amount);
  target.flashTimer = 0.12;
  target.pitchKick = Math.min(1, target.pitchKick + 0.55);
  target.lastCombatTime = state.gameTime;
  if (attacker) attacker.lastCombatTime = state.gameTime;

  if (target.isPlayer) {
    state.feedback.hitFlashUntil = state.gameTime + 0.18;
    audio.play("hit");
  }

  if (target.health <= 0) {
    target.dead = true;
    target.mesh.visible = false;
    target.shadow.visible = false;
    target.healthBar.visible = false;
    state.deathOrder.push(target.id);
    if (attacker) {
      addKillFeed(`${attacker.name} 처치 -> ${target.name}`);
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
      state.effects.splice(i, 1);
      continue;
    }
    const alpha = effect.life / effect.maxLife;
    if (effect.type === "attack") {
      effect.mesh.scale.setScalar(1 + (1 - alpha) * 0.28);
      effect.mesh.material.opacity = alpha * 0.85;
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
    tempVec3.set(inputX / inputLength, 0, -inputZ / inputLength).multiplyScalar(baseMoveSpeed);
  }

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

  player.mesh.rotation.y = player.yaw;

  moveFighter(player, tempVec3, dt);
}

function chooseBotTarget(bot) {
  let best = null;
  let bestScore = Infinity;
  for (const fighter of state.players) {
    if (fighter.id === bot.id || fighter.dead) {
      continue;
    }
    const dx = fighter.mesh.position.x - bot.mesh.position.x;
    const dz = fighter.mesh.position.z - bot.mesh.position.z;
    const distanceSq = dx * dx + dz * dz;
    if (distanceSq > 50 * 50) {
      continue;
    }
    if (!isVisibleThroughBush(bot, fighter) && distanceSq > 9 * 9) {
      continue;
    }
    if (distanceSq < bestScore) {
      bestScore = distanceSq;
      best = fighter;
    }
  }
  return best;
}

function updateBot(bot, dt, zone) {
  if (bot.dead) {
    return;
  }

  const target = chooseBotTarget(bot);
  const botPos = bot.mesh.position;
  tempVec3.set(0, 0, 0);

  if (target) {
    const toTargetX = target.mesh.position.x - botPos.x;
    const toTargetZ = target.mesh.position.z - botPos.z;
    const distance = Math.hypot(toTargetX, toTargetZ);
    bot.yaw = Math.atan2(toTargetX, toTargetZ);
    const atkRange = getAttackRange(bot);
    if (distance > atkRange * 0.86) {
      tempVec3.set(Math.sin(bot.yaw), 0, Math.cos(bot.yaw)).multiplyScalar(baseMoveSpeed * 0.82);
    } else if (distance < atkRange * 0.58) {
      tempVec3.set(-Math.sin(bot.yaw), 0, -Math.cos(bot.yaw)).multiplyScalar(baseMoveSpeed * 0.48);
    } else {
      tempVec3.set(Math.sin(bot.yaw + Math.PI / 2), 0, Math.cos(bot.yaw + Math.PI / 2))
        .multiplyScalar(baseMoveSpeed * 0.28 * bot.botStrafeDir);
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
      tempVec3.normalize().multiplyScalar(baseMoveSpeed * 0.62);
    } else {
      tempVec3.set(0, 0, 0);
    }
  }

  const distFromCenter = Math.hypot(botPos.x - state.safeCenter.x, botPos.z - state.safeCenter.y);
  if (distFromCenter > zone.radius - 4) {
    const toCenterX = state.safeCenter.x - botPos.x;
    const toCenterZ = state.safeCenter.y - botPos.z;
    const len = Math.hypot(toCenterX, toCenterZ) || 1;
    tempVec3.set((toCenterX / len) * baseMoveSpeed, 0, (toCenterZ / len) * baseMoveSpeed);
    bot.yaw = Math.atan2(tempVec3.x, tempVec3.z);
  }

  if (bot.ammo < maxAmmo && !bot.isReloading) {
    startReload(bot);
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

  const walkCycle = state.gameTime * 8 + fighter.id;
  const swing = Math.min(1, speed / 8);
  const leftLegWalk = Math.sin(walkCycle) * 0.38 * swing;
  const rightLegWalk = -Math.sin(walkCycle) * 0.38 * swing;
  const leftArmWalk = -Math.sin(walkCycle) * 0.32 * swing;
  const rightArmWalk = Math.sin(walkCycle) * 0.32 * swing;

  let punchOne = 0;
  let punchTwo = 0;
  let recover = 0;
  if (fighter.attackAnimTime >= 0) {
    fighter.attackAnimTime += dt;
    punchOne = pulse(fighter.attackAnimTime, 0.02, 0.11, 0.2);
    punchTwo = pulse(fighter.attackAnimTime, 0.2, 0.31, 0.43);
    recover = pulse(fighter.attackAnimTime, 0.43, 0.5, 0.6);
    if (fighter.attackAnimTime > 0.6) {
      fighter.attackAnimTime = -1;
    }
  }

  body.leftLeg.rotation.x = leftLegWalk - punchOne * 0.08 + punchTwo * 0.18;
  body.rightLeg.rotation.x = rightLegWalk + punchOne * 0.18 - punchTwo * 0.08;
  body.leftArm.rotation.x = leftArmWalk - fighter.attackSwing * 0.32 - punchTwo * 1.25 + recover * 0.18;
  body.rightArm.rotation.x = rightArmWalk - fighter.attackSwing * 0.42 - punchOne * 1.35 + recover * 0.2;
  body.leftArm.rotation.z = Math.PI * 0.1 + punchTwo * 0.18;
  body.rightArm.rotation.z = -Math.PI * 0.1 - punchOne * 0.18;
  body.body.rotation.z = Math.sin(walkCycle * 0.5) * 0.03 + punchOne * 0.06 - punchTwo * 0.05;
  body.body.rotation.y = -punchOne * 0.22 + punchTwo * 0.22;
  body.head.rotation.y = -punchOne * 0.12 + punchTwo * 0.12;
  body.head.rotation.x = punchOne * 0.03 + punchTwo * 0.03;

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

function updateReloads() {
  for (const fighter of state.players) {
    if (fighter.dead) {
      continue;
    }
    if (!fighter.isReloading && fighter.ammo < maxAmmo && state.gameTime >= fighter.nextAttackAt) {
      fighter.pendingAutoReload = true;
    }
    if (fighter.isReloading && state.gameTime >= fighter.reloadEndsAt) {
      finishReload(fighter);
    }
    if (fighter.pendingAutoReload && !fighter.isReloading && state.gameTime >= fighter.nextAttackAt) {
      fighter.pendingAutoReload = false;
      startReload(fighter);
    }
  }
}

function updateZoneDamage(dt, zone) {
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
  const isGreen = player?.characterType === "green";

  if (!player || player.dead || !state.running) {
    attackAimIndicator.visible = false;
    greenAimIndicator.visible = false;
    return;
  }

  const pos = player.mesh.position;
  const yaw = player.yaw;
  const unavailable = player.isReloading || player.ammo <= 0;

  if (isGreen) {
    attackAimIndicator.visible = false;
    greenAimIndicator.visible = true;
    greenAimIndicator.position.set(pos.x, 0, pos.z);
    greenAimIndicator.rotation.y = yaw;
    greenAimIndicator.userData.fanMesh.material.opacity = unavailable ? 0.05 : 0.13;
  } else {
    greenAimIndicator.visible = false;
    attackAimIndicator.visible = true;
    attackAimIndicator.position.set(pos.x, 0, pos.z);
    attackAimIndicator.rotation.y = yaw;

    const activeAlpha = unavailable ? 0.08 : 0.14;
    const edgeAlpha = unavailable ? 0.22 : 0.5;
    attackAimIndicator.userData.rects.forEach((r) => { r.material.opacity = activeAlpha; });
    attackAimIndicator.userData.edge.material.opacity = edgeAlpha;
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
  charName.textContent = player.name;
  reloadState.textContent = player.isReloading ? `장전 중 ${Math.max(0, (player.reloadEndsAt - state.gameTime)).toFixed(1)}s` : "준비 완료";
  const attackLabel = player.characterType === "green" ? "부메랑 4연발" : "더블 펀치";
  attackState.textContent = player.isReloading ? "공격 불가" : attackLabel;
  spreadState.textContent = `안정성 ${Math.round((1 - player.spread * 0.55) * 100)}%`;
  updateAmmoPips(player.ammo);

  const alive = state.players.filter((fighter) => !fighter.dead).length;
  survivorsLabel.textContent = `${alive}`;

  const zone = getCurrentZone();
  const showZoneEvent = state.gameTime >= zonePhases[1].start;
  zonePanel.classList.toggle("is-hidden-panel", !showZoneEvent);
  zoneState.textContent = zone.label;
  zoneTimer.textContent = formatTime(zone.phaseEnd - state.gameTime);
  warning.classList.toggle("hidden", !state.playerOutsideZone);
}

function updateNaturalRegen(dt) {
  for (const fighter of state.players) {
    if (fighter.dead || fighter.health >= fighter.maxHealth) continue;
    if (state.gameTime - fighter.lastCombatTime >= 5) {
      fighter.health = Math.min(fighter.maxHealth, fighter.health + fighter.maxHealth * 0.1 * dt);
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

  const alive = state.players.filter((fighter) => !fighter.dead);
  if (alive.length <= 1) {
    state.gameOver = true;
    state.running = false;
    const winner = alive[0];
    const player = getPlayer();
    const playerRank = (!player || !player.dead)
      ? 1
      : state.players.length - state.deathOrder.indexOf(player.id);
    recordGameResult(playerRank);
    const account = loadAccount();
    const delta = calcTrophyChange(playerRank);
    const deltaText = delta > 0 ? `+${delta}` : `${delta}`;
    const totalText = account ? ` (총 ${account.trophies})` : "";

    if (!winner) {
      resultTitle.textContent = `${playerRank}위`;
      resultBody.textContent = `무승부. ${deltaText} 트로피${totalText}`;
    } else if (winner.isPlayer) {
      resultTitle.textContent = "1위 🏆";
      resultBody.textContent = `해골천의 최후의 1인! ${deltaText} 트로피${totalText}`;
    } else {
      const rankLabel = playerRank === 1 ? "1위" : `${playerRank}위`;
      resultTitle.textContent = rankLabel;
      resultBody.textContent = `${winner.name}이(가) 우승했습니다. ${deltaText} 트로피${totalText}`;
    }
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
    updateReloads();
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
  const coarsePointerQuery = window.matchMedia("(hover: none) and (pointer: coarse)");
  const syncVirtualControlsVisibility = () => {
    mobileJoystick.style.display = "block";
    mobileAttackButton.style.display = coarsePointerQuery.matches ? "block" : "none";
  };
  syncVirtualControlsVisibility();
  coarsePointerQuery.addEventListener?.("change", syncVirtualControlsVisibility);

  window.addEventListener("keydown", (event) => {
    if (["KeyW", "KeyA", "KeyS", "KeyD", "KeyR", "Space"].includes(event.code)) {
      event.preventDefault();
    }
    state.keyState[event.code] = true;
    if (event.code === "KeyR") {
      startReload(getPlayer());
    }
  });

  window.addEventListener("keyup", (event) => {
    if (["KeyW", "KeyA", "KeyS", "KeyD", "KeyR", "Space"].includes(event.code)) {
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
      beginAttack(getPlayer());
    }
  }

  window.addEventListener("mousedown", triggerDesktopAttack);
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
    accountCreation.style.display = "none";
    lobbyMain.style.display = "block";
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
      dailyLogin.style.display = "none";
      lobbyMain.style.display = "block";
      updateLobbyUI(account);
    } else {
      // 실패
      account.loginAttempts += 1;
      saveAccount(account);

      const remaining = Math.max(0, 5 - account.loginAttempts);
      if (account.loginAttempts >= 5) {
        dailyLoginError.textContent = "아이디가 틀렸습니다.";
        dailyLoginError.style.display = "block";
        dailyIdInput.disabled = true;
        dailyLoginBtn.disabled = true;
        accountRecoveryBtn.style.display = "block";
      } else {
        dailyLoginError.textContent = `아이디가 틀렸습니다. 남은 시도: ${remaining}회`;
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
    accountRecoveryInfo.textContent = `내 아이디: ${account.id}`;
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

  // 전투 시작
  startBattleBtn.addEventListener("click", async () => {
    await initAudio();
    messageOverlay.style.display = "none";
    resetGame();
  });

  // 재시작 → 로비
  restartButton.addEventListener("click", () => {
    showLobby();
  });

  mobileAttackButton.addEventListener("pointerdown", async (event) => {
    event.preventDefault();
    await initAudio();
    if (state.running) {
      beginAttack(getPlayer());
    }
  });
}

createLights();
createMap();
setupInput();
animate();
rebuildAmmoPips();
updateHud();
showLobby();
