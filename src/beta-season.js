import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { clone as skeletonClone } from "three/addons/utils/SkeletonUtils.js";
import { BETA_CHARACTERS } from "./config/beta-characters.js?v=0.5.4";
import { SKINS, getSkinsForSeason, migrateSkinId } from "./config/skins.js?v=0.5.1";
import { LANGS } from "./LANGS/langs.js?v=1.5.138";
import { createHighPolyCrown, fitCrownToHead, getCrownVariant } from "./visuals/crown.js";

const canvas = document.getElementById("beta-canvas");
const galeStrikeTexture = new THREE.TextureLoader().load("./assets/vfx/gale-strike.png");
galeStrikeTexture.colorSpace = THREE.SRGBColorSpace;
// 원본 PNG의 실제 바람은 Y=416~471px에만 있다. 투명 여백을 제외하고 바람 부분만 확대한다.
galeStrikeTexture.repeat.set(1, 55 / 887);
galeStrikeTexture.offset.set(0, 416 / 887);
galeStrikeTexture.needsUpdate = true;
const locationName = document.getElementById("location-name");
const creditValue = document.getElementById("credit-value");
const modal = document.getElementById("beta-modal");
const modalTitle = document.getElementById("modal-title");
const modalContent = document.getElementById("modal-content");
const toast = document.getElementById("beta-toast");
const crimsonControls = document.getElementById("crimson-controls");
const crimsonAttackButton = document.getElementById("crimson-attack-btn");
const attackComboState = document.getElementById("attack-combo-state");
const attackTitle = crimsonAttackButton.querySelector("strong");
const attackHint = crimsonAttackButton.querySelector("small");
const ultimateButton = document.getElementById("ultimate-btn");
const aimModeButton = document.getElementById("aim-mode-btn");
const ultimateState = document.getElementById("ultimate-state");
const goldRushToggle = document.getElementById("gold-rush-toggle");
const goldRushHud = document.getElementById("gold-rush-hud");
const goldCountEl = document.getElementById("gold-count");
const goldRushPlayerPanel = document.getElementById("gold-rush-player-panel");
const goldRushHealthEl = document.getElementById("gold-rush-health");
const goldRushHealthFill = document.getElementById("gold-rush-health-fill");
const goldRushHealthValue = document.getElementById("gold-rush-health-value");
const goldRushReloadState = document.getElementById("gold-rush-reload-state");
const goldRushReloadBar = document.getElementById("gold-rush-reload-bar");
const goldRushAmmoFan = document.getElementById("gold-rush-ammo-fan");
const goldRushTimerEl = document.getElementById("gold-rush-timer");
const goldRushStatusEl = document.getElementById("gold-rush-status");
const goldRushRivalsEl = document.getElementById("gold-rush-rivals");
const respawnOverlay = document.getElementById("respawn-overlay");
const respawnCountdownEl = document.getElementById("respawn-countdown");
const dailyRewardReveal = document.getElementById("daily-reward-reveal");
const dailyRewardGrade = document.getElementById("daily-reward-grade");
const dailyRewardStar = document.getElementById("daily-reward-star");
const dailyRewardAttempts = document.getElementById("daily-reward-attempts");
const dailyRewardMessage = document.getElementById("daily-reward-message");
const dailyRewardReturn = document.getElementById("daily-reward-return");
const dailyRewardUpgradeAll = document.getElementById("daily-reward-upgrade-all");
const BETA_STORAGE_KEY = "colorsBetaSeasonTest";
const CHARACTER_MODEL_VERSION = "62";
const CHARACTERS = [
  { id: "red", name: "Red", rarity: "common", price: 0, color: 0xef3c58 },
  { id: "green", name: "Green", rarity: "common", price: 0, color: 0x42d66b },
  { id: "blue", name: "Blue", rarity: "common", price: 0, color: 0x3d72ee },
  { id: "orange", name: "Orange", rarity: "rare", price: 200, color: 0xf29a38 },
  { id: "yellow", name: "Yellow", rarity: "rare", price: 200, color: 0xf1dd42 },
  { id: "cyan", name: "Cyan", rarity: "rare", price: 200, color: 0x33d8e5 },
  { id: "purple", name: "Purple", rarity: "rare", price: 200, color: 0x9252d7 },
  { id: "pink", name: "Pink", rarity: "rare", price: 200, color: 0xf28cba },
  { id: "crimson", name: "Crimson", rarity: "legendary", price: 900, color: 0xa00000 },
  { id: "gold", name: "Gold", rarity: "legendary", price: 900, color: 0xd4a928 },
  { id: "ivory", name: "Ivory", rarity: "legendary", price: 900, color: 0xfffff0 },
];
const BETA_SEASON_ID = "beta2";
// 베타 시즌 2가 실제로 열리기 전에는 시즌 2 보상 스킨을 공개하지 않는다.
const BETA_SEASON_ACTIVE = true;
const BETA_SKINS = BETA_SEASON_ACTIVE ? getSkinsForSeason(BETA_SEASON_ID) : [];

function loadBetaState() {
  const today = new Date().toISOString().slice(0, 10);
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(BETA_STORAGE_KEY) || "{}"); } catch { saved = {}; }
  const selectedSkins = {};
  for (const [characterId, skinId] of Object.entries(saved.selectedSkins || {})) {
    const migratedId = migrateSkinId(skinId);
    if (SKINS[migratedId]?.character === characterId) selectedSkins[characterId] = migratedId;
  }
  const ownedSkins = [...new Set((saved.ownedSkins || []).map(migrateSkinId))]
    .filter((skinId) => Boolean(SKINS[skinId]));
  const state = {
    credits: Number.isFinite(saved.credits) ? saved.credits : 1500,
    coins: Number.isFinite(saved.coins) ? saved.coins : 3000,
    selectedCharacter: saved.selectedCharacter || "red",
    ownedCharacters: saved.ownedCharacters || ["red", "green", "blue"],
    ownedSkins,
    selectedSkins,
    orderEvent: { progress: Math.max(0, Number(saved.orderEvent?.progress) || 0), claimed: saved.orderEvent?.claimed || [] },
    daily: saved.daily?.date === today ? { winRewards: 0, ...saved.daily } : { date: today, winRewards: 0 },
  };
  // 베타 테스트 전용 캐릭터는 구매 없이 바로 시험할 수 있게 한다.
  if (!state.ownedCharacters.includes("ivory")) state.ownedCharacters.push("ivory");
  localStorage.setItem(BETA_STORAGE_KEY, JSON.stringify(state));
  return state;
}
const betaState = loadBetaState();
function saveBetaState() { localStorage.setItem(BETA_STORAGE_KEY, JSON.stringify(betaState)); updateWallet(); }
function updateWallet() { creditValue.textContent = betaState.credits.toLocaleString("ko-KR"); }
function rarityName(rarity) { return ({ common: "일반", rare: "희귀", epic: "초희귀", legendary: "영웅" })[rarity]; }
function getSkinName(skin) {
  const lang = localStorage.getItem("skullCreekLang") === "en" ? "en" : "ko";
  return LANGS[lang]?.[skin.nameKey] || skin.name;
}
function getBetaText(key) {
  const lang = localStorage.getItem("skullCreekLang") === "en" ? "en" : "ko";
  return LANGS[lang]?.[key] || key;
}
function showToast(message) { toast.textContent = message; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 1700); }
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8ac9dc);
scene.fog = new THREE.FogExp2(0x8ac9dc, 0.012);

const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 300);
const hemi = new THREE.HemisphereLight(0xe8fbff, 0x38515b, 2.2);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff1ce, 3.4);
sun.position.set(-35, 48, 20);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -55;
sun.shadow.camera.right = 55;
sun.shadow.camera.top = 55;
sun.shadow.camera.bottom = -55;
scene.add(sun);

const map = new THREE.Group();
scene.add(map);
const solids = [];
const platformMaterial = new THREE.MeshStandardMaterial({ color: 0x6a7773, roughness: 0.88 });
const trimMaterial = new THREE.MeshStandardMaterial({ color: 0x79d5d2, roughness: 0.42, metalness: 0.25 });
const stoneMaterial = new THREE.MeshStandardMaterial({ color: 0x40545a, roughness: 0.92 });

function box(x, y, z, width, height, depth, material = platformMaterial, solid = true, destructible = false) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  map.add(mesh);
  if (solid) solids.push({ x, z, halfW: width / 2, halfD: depth / 2, top: y + height / 2, mesh, destructible });
  return mesh;
}

const water = new THREE.Mesh(
  new THREE.PlaneGeometry(240, 240),
  new THREE.MeshPhysicalMaterial({ color: 0x167c99, roughness: 0.18, metalness: 0.1, transparent: true, opacity: 0.88 }),
);
water.rotation.x = -Math.PI / 2;
water.position.y = -2.6;
scene.add(water);

// 중앙 광장과 서로 다른 높이의 네 테스트 구역
box(0, 0, 0, 22, 3, 22);
box(0, 1.53, 0, 15, 0.06, 15, trimMaterial, false);
box(0, 1.3, -22, 7, 1, 23, stoneMaterial);
box(0, 1.3, 22, 7, 1, 23, stoneMaterial);
box(-22, 1.3, 0, 23, 1, 7, stoneMaterial);
box(22, 1.3, 0, 23, 1, 7, stoneMaterial);
box(0, 2.3, -40, 25, 5, 17);
box(0, 4.0, 40, 25, 8.4, 17);
box(-40, 3.1, 0, 17, 6.2, 25);
box(40, 1.5, 0, 17, 3, 25);

// 중앙 유적 기둥과 엄폐물
for (let i = 0; i < 8; i += 1) {
  const angle = (i / 8) * Math.PI * 2;
  box(Math.sin(angle) * 7, 3.6, Math.cos(angle) * 7, 1.2, 4.2, 1.2, stoneMaterial);
}
for (const [x, z, w, d] of [[-6,-38,5,2],[7,-42,3,5],[-42,-5,2,6],[-38,7,5,2],[-6,38,5,2],[7,42,3,4]]) {
  box(x, 5.5, z, w, 3, d, stoneMaterial);
}

// 크림슨 궁극기의 벽 파괴를 확인하는 중앙 시험 벽
box(-1.35, 2.55, -4.2, 2.2, 2.1, 0.55, stoneMaterial, true, true);
box(1.35, 2.55, -4.2, 2.2, 2.1, 0.55, stoneMaterial, true, true);

const testTargets = [];
function createTestTarget(x, z, { ally = false } = {}) {
  const target = new THREE.Group();
  const mesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.38, 0.75, 4, 8),
    new THREE.MeshStandardMaterial({ color: ally ? 0x64b5ff : 0xf4d36a, roughness: 0.65 }),
  );
  mesh.position.y = 0.78;
  mesh.castShadow = true;
  target.add(mesh);
  const targetGround = groundHeightAt(x, z);
  target.position.set(x, targetGround > -5 ? targetGround + 0.05 : 1.55, z);
  target.userData.health = 6000;
  target.userData.mesh = mesh;
  target.userData.kind = "jjajjal";
  target.userData.isAlly = ally;
  target.userData.maxHealth = 6000;
  target.userData.deadPosition = target.position.clone();
  target.userData.baseScale = 1;
  scene.add(target);
  testTargets.push(target);
}
createTestTarget(-1.4, -2.4);
createTestTarget(0, -3.2);
createTestTarget(1.4, -2.4);
for (const x of [35, 38, 41, 44, 47]) {
  for (const z of [-7, -3, 3, 7]) createTestTarget(x, z);
}
createTestTarget(-2.2, 1.5, { ally: true });
createTestTarget(2.2, 1.5, { ally: true });
canvas.dataset.testTargetCount = String(testTargets.length);

// 베타 시즌 포털
const portal = new THREE.Group();
const portalMat = new THREE.MeshStandardMaterial({ color: 0x75efff, emissive: 0x167b91, emissiveIntensity: 2 });
portal.add(new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.35, 12, 40), portalMat));
portal.position.set(0, 6.5, -40);
map.add(portal);

function createAlphaBoss() {
  const boss = new THREE.Group();
  const bossMaterial = new THREE.MeshStandardMaterial({ color: 0x74151b, roughness: 0.62 });
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(1.8, 3.2, 7, 12), bossMaterial);
  torso.position.y = 3.1;
  torso.castShadow = true;
  boss.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(2.05, 18, 14), bossMaterial);
  head.position.y = 6.35;
  head.castShadow = true;
  boss.add(head);
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.55, 2.6, 5, 9), bossMaterial);
    arm.position.set(side * 2.15, 3.1, 0);
    arm.rotation.z = side * -0.18;
    arm.castShadow = true;
    boss.add(arm);
  }
  const hornMaterial = new THREE.MeshStandardMaterial({ color: 0xff6848, emissive: 0x7e160c, emissiveIntensity: 1.2 });
  for (const side of [-1, 1]) {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.38, 1.5, 7), hornMaterial);
    horn.position.set(side * 0.9, 8.1, 0);
    horn.rotation.z = side * -0.22;
    boss.add(horn);
  }
  boss.position.set(0, 4.8, -40);
  boss.scale.setScalar(0.72);
  boss.userData.health = 120000;
  boss.userData.mesh = torso;
  boss.userData.kind = "alphaBoss";
  boss.userData.baseScale = 0.72;
  scene.add(boss);
  testTargets.push(boss);
  return boss;
}
const alphaBoss = createAlphaBoss();
canvas.dataset.alphaEnemies = "jjajjal:3,bossHp:120000";

const player = new THREE.Group();
const attackAimIndicator = new THREE.Group();
const attackAimBeam = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1),
  new THREE.MeshBasicMaterial({
    color: 0xffffff, transparent: true, opacity: 0.5,
    toneMapped: false,
    side: THREE.DoubleSide, depthWrite: false, depthTest: true,
  }),
);
attackAimBeam.rotation.x = -Math.PI / 2;
attackAimBeam.renderOrder = 0;
attackAimIndicator.add(attackAimBeam);
// 근접(펀치) 캐릭터는 직선 대신 사정거리 원형 가이드를 쓴다
const attackAimRing = new THREE.Mesh(
  new THREE.RingGeometry(0.92, 1, 48),
  new THREE.MeshBasicMaterial({
    color: 0xffffff, transparent: true, opacity: 0.42,
    toneMapped: false,
    side: THREE.DoubleSide, depthWrite: false, depthTest: true,
  }),
);
attackAimRing.rotation.x = -Math.PI / 2;
attackAimRing.renderOrder = 0;
attackAimRing.visible = false;
attackAimIndicator.add(attackAimRing);
attackAimIndicator.position.y = 0.12;
player.add(attackAimIndicator);
const bodyMat = new THREE.MeshStandardMaterial({ color: 0xef3c58, roughness: 0.55 });
const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.7, 1.2, 5, 10), bodyMat);
body.position.y = 1.2;
body.castShadow = true;
player.add(body);
const visor = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.28, 0.18), new THREE.MeshStandardMaterial({ color: 0x8cecff, emissive: 0x256879 }));
visor.position.set(0, 1.62, -0.64);
player.add(visor);
scene.add(player);
let crown = createHighPolyCrown();
fitCrownToHead(crown, 2.5);
crown.visible = false;
player.add(crown);
const skinAccessory = new THREE.Group();
player.add(skinAccessory);
const characterLoader = new GLTFLoader();
let activeCharacterModel = null;
let activeCharacterMixer = null;
let activeCharacterAction = null;
let activeCharacterWasMoving = false;
let activeCharacterMotion = null;
let modelAttackMotionTime = -1;
let modelAttackCharacter = null;
let modelAttackPoseRestore = [];
let characterLoadToken = 0;
let betaToonGradient = null;

function getBetaToonGradient() {
  if (betaToonGradient) return betaToonGradient;
  const gradientCanvas = document.createElement("canvas");
  gradientCanvas.width = 4;
  gradientCanvas.height = 1;
  const context = gradientCanvas.getContext("2d");
  for (const [index, shade] of [45, 115, 190, 255].entries()) {
    context.fillStyle = `rgb(${shade},${shade},${shade})`;
    context.fillRect(index, 0, 1, 1);
  }
  betaToonGradient = new THREE.CanvasTexture(gradientCanvas);
  betaToonGradient.minFilter = THREE.NearestFilter;
  betaToonGradient.magFilter = THREE.NearestFilter;
  betaToonGradient.generateMipmaps = false;
  return betaToonGradient;
}

function applyBetaToonRendering(model, characterId) {
  const gradientMap = getBetaToonGradient();
  const meshes = [];
  model.traverse((child) => {
    if (child.isMesh) meshes.push(child);
  });
  for (const mesh of meshes) {
    if (mesh.name.startsWith("GreenTShirt")) continue;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const toonMaterials = materials.map((material) => new THREE.MeshToonMaterial({
      map: material.map || null,
      color: material.color?.clone() || new THREE.Color(0xffffff),
      gradientMap,
      transparent: material.transparent || false,
      opacity: material.opacity ?? 1,
      alphaTest: material.alphaTest || 0,
      side: material.side,
    }));
    mesh.material = toonMaterials.length === 1 ? toonMaterials[0] : toonMaterials;
    if (characterId === "blue") continue;
    if (!mesh.isSkinnedMesh) continue;
    const outline = new THREE.SkinnedMesh(
      mesh.geometry,
      new THREE.MeshBasicMaterial({
        color: 0x172129,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.72,
      }),
    );
    outline.bind(mesh.skeleton, mesh.bindMatrix);
    outline.scale.setScalar(1.025);
    outline.frustumCulled = false;
    outline.renderOrder = -1;
    mesh.parent.add(outline);
  }
  model.userData.cartoonRendered = true;
}

function applySkinPaletteToModel(model, characterId) {
  const skinId = betaState.selectedSkins[characterId] || "";
  // beta2_gold_* 원래 색값은 캐릭터 기본색(노랑/주황)과 거의 같아서 토큰 셰이딩에서
  // 구별이 안 됐다 — 뚜렷한 골드 톤 + emissive 글로우로 대체.
  const tintHex = {
    beta_red_orange: 0xb3261e,
    beta2_gold_orange: 0xb8720a,
    beta2_gold_yellow: 0xd9a520,
  }[skinId];
  const tint = tintHex ? new THREE.Color(tintHex) : null;
  const emissiveHex = skinId === "beta2_gold_orange" ? 0x4a2a00 : skinId === "beta2_gold_yellow" ? 0x3d2600 : null;
  model.traverse((child) => {
    if (!child.isMesh) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of materials) {
      if (!material?.color || material.isMeshBasicMaterial) continue;
      material.userData.baseSkinColor ??= material.color.clone();
      material.color.copy(material.userData.baseSkinColor);
      if (tint) material.color.lerp(tint, skinId === "beta2_gold_orange" ? 0.8 : 0.75);
      if ("emissive" in material) {
        material.userData.baseSkinEmissive ??= material.emissive.clone();
        if (emissiveHex) {
          material.emissive.set(emissiveHex);
          material.emissiveIntensity = skinId === "beta2_gold_orange" ? 0.65 : 0.5;
        } else {
          material.emissive.copy(material.userData.baseSkinEmissive);
        }
      }
    }
  });
}

function refreshActiveCharacterSkinPalette() {
  if (activeCharacterMotion) {
    for (const model of Object.values(activeCharacterMotion.scenes)) {
      applySkinPaletteToModel(model, activeCharacterMotion.characterId);
    }
    return;
  }
  if (activeCharacterModel) applySkinPaletteToModel(activeCharacterModel, betaState.selectedCharacter);
}

function addBlueScarf(model) {
  const material = new THREE.MeshStandardMaterial({
    color: 0x55cfff,
    roughness: 0.82,
  });
  const parts = [];
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.055, 24, 96), material);
  collar.name = "BlueScarfCollar";
  collar.rotation.x = Math.PI / 2;
  collar.position.set(0, 0.57, 0.005);
  parts.push(collar);

  const knot = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 15), material);
  knot.name = "BlueScarfKnot";
  knot.position.set(0.068, 0.556, 0.16);
  knot.scale.set(0.04, 0.034, 0.03);
  parts.push(knot);

  const createTail = (name, xStart, yStart, zStart, length, sway, phase) => {
    const segments = 80;
    const sides = 14;
    const positions = [];
    const indices = [];
    for (let ring = 0; ring <= segments; ring += 1) {
      const t = ring / segments;
      const centerX = xStart + sway * Math.sin(Math.PI * t + phase) + 0.018 * t;
      const centerY = yStart + 0.012 * Math.sin(Math.PI * 1.4 * t + phase);
      const centerZ = zStart - length * t;
      const width = 0.0225 * (1 - 0.62 * t);
      const depth = 0.0095 * (1 - 0.48 * t);
      for (let side = 0; side < sides; side += 1) {
        const angle = Math.PI * 2 * side / sides;
        positions.push(
          centerX + width * Math.cos(angle),
          centerZ,
          -(centerY + depth * Math.sin(angle)),
        );
      }
    }
    for (let ring = 0; ring < segments; ring += 1) {
      for (let side = 0; side < sides; side += 1) {
        const current = ring * sides + side;
        const nextSide = ring * sides + (side + 1) % sides;
        const upper = (ring + 1) * sides + side;
        const upperNext = (ring + 1) * sides + (side + 1) % sides;
        indices.push(current, nextSide, upperNext, current, upperNext, upper);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const tail = new THREE.Mesh(geometry, material);
    tail.name = name;
    return tail;
  };
  parts.push(createTail("BlueScarfLongTail", 0.073, -0.16, 0.548, 0.30, 0.032, 0));
  parts.push(createTail("BlueScarfShortTail", 0.053, -0.135, 0.543, 0.23, -0.024, 0.8));
  const scarf = new THREE.Group();
  scarf.name = "BlueScarf";
  for (const part of parts) {
    part.castShadow = true;
    part.receiveShadow = true;
    scarf.add(part);
  }
  model.add(scarf);

  let neckBone = null;
  model.traverse((child) => {
    if (child.isBone && child.name === "CC_Base_NeckTwist02") neckBone = child;
  });
  if (neckBone) {
    model.updateWorldMatrix(true, true);
    neckBone.attach(scarf);
  }
}

function clearCharacterModel() {
  if (activeCharacterModel) player.remove(activeCharacterModel);
  activeCharacterModel = null;
  activeCharacterMixer = null;
  activeCharacterAction = null;
  activeCharacterWasMoving = false;
  activeCharacterMotion = null;
  modelAttackMotionTime = -1;
  modelAttackCharacter = null;
  modelAttackPoseRestore = [];
  canvas.dataset.characterModel = "primitive";
}

function prepareCharacterScene(model, characterId) {
  if (characterId === "blue") addBlueScarf(model);
  if (["red", "orange", "yellow", "blue", "green", "cyan", "pink", "purple"].includes(characterId)) {
    applyBetaToonRendering(model, characterId);
  }
  applySkinPaletteToModel(model, characterId);
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const scale = 2.7 / Math.max(size.y, 0.001);
  model.scale.setScalar(scale);
  model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
  model.rotation.y = 0;
  model.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = true;
    child.receiveShadow = true;
    child.frustumCulled = false;
  });
  return model;
}

function loadCharacterMotionSet(characterId, token) {
  const paths = {
    start: `./assets/3d/${characterId}/walk-m1s.glb?v=${CHARACTER_MODEL_VERSION}`,
    loop: `./assets/3d/${characterId}/walk-m2l.glb?v=${CHARACTER_MODEL_VERSION}`,
    stop: `./assets/3d/${characterId}/walk-m3e.glb?v=${CHARACTER_MODEL_VERSION}`,
  };
  Promise.all(Object.entries(paths).map(async ([key, path]) => [key, await characterLoader.loadAsync(path)]))
    .then((entries) => {
      if (token !== characterLoadToken || betaState.selectedCharacter !== characterId) return;
      const group = new THREE.Group();
      const scenes = {};
      const mixers = {};
      const actions = {};
      for (const [key, gltf] of entries) {
        const sceneModel = prepareCharacterScene(gltf.scene, characterId);
        sceneModel.visible = key === "stop";
        scenes[key] = sceneModel;
        group.add(sceneModel);
        const clip = gltf.animations[0];
        if (!clip) continue;
        clip.tracks = clip.tracks.filter((track) => !/^RootMotion\.position/.test(track.name));
        const mixer = new THREE.AnimationMixer(sceneModel);
        const action = mixer.clipAction(clip);
        action.setLoop(key === "loop" ? THREE.LoopRepeat : THREE.LoopOnce, key === "loop" ? Infinity : 1);
        action.clampWhenFinished = true;
        mixers[key] = mixer;
        actions[key] = action;
      }
      const show = (key) => {
        for (const [sceneKey, sceneModel] of Object.entries(scenes)) sceneModel.visible = sceneKey === key;
      };
      if (actions.stop) {
        actions.stop.play();
        actions.stop.time = Math.max(0, actions.stop.getClip().duration - 0.001);
        mixers.stop.update(0);
        actions.stop.paused = true;
      }
      player.add(group);
      activeCharacterModel = group;
      activeCharacterMotion = { characterId, scenes, mixers, actions, show, state: "idle", current: "stop" };
      canvas.dataset.characterModel = characterId;
    })
    .catch(() => {
      if (token !== characterLoadToken) return;
      body.visible = true;
      visor.visible = true;
      const name = CHARACTERS.find((character) => character.id === characterId)?.name || characterId;
      showToast(`${name} 모델을 불러오지 못했습니다.`);
    });
}

function updateCharacterMotion(isMoving, dt) {
  const motion = activeCharacterMotion;
  if (!motion) return;
  const play = (key) => {
    const action = motion.actions[key];
    if (!action) return false;
    motion.show(key);
    action.reset().play();
    action.paused = false;
    motion.current = key;
    return true;
  };
  if (motion.state === "idle" && isMoving) {
    motion.state = play("start") ? "starting" : "looping";
    if (motion.state === "looping") play("loop");
  } else if (motion.state === "looping" && !isMoving) {
    motion.state = play("stop") ? "stopping" : "idle";
  } else if (motion.state === "stopping" && isMoving) {
    motion.state = play("start") ? "starting" : "looping";
    if (motion.state === "looping") play("loop");
  }

  const mixer = motion.mixers[motion.current];
  const action = motion.actions[motion.current];
  if (mixer && action && !action.paused) mixer.update(dt);

  if (motion.state === "starting" && action?.time >= action.getClip().duration - 0.02) {
    if (isMoving) {
      play("loop");
      motion.state = "looping";
    } else {
      play("stop");
      motion.state = "stopping";
    }
  } else if (motion.state === "stopping" && action?.time >= action.getClip().duration - 0.02) {
    action.paused = true;
    motion.state = "idle";
  }
  canvas.dataset.motionState = motion.state;
}

const MODEL_ATTACK_POSES = {
  red: { duration: 0.44, peak: 0.22, bones: [
    ["CC_Base_R_Upperarm", 1.22, 0, 0.34], ["CC_Base_R_Forearm", 0.52, 0, 0.08],
    ["CC_Base_L_Upperarm", 0.88, 0, -0.32], ["CC_Base_L_Forearm", 0.38, 0, -0.06],
    ["CC_Base_Spine02", 0.18, -0.12, 0],
  ] },
  green: { duration: 0.5, peak: 0.34, bones: [
    ["CC_Base_R_Upperarm", 1.08, -0.28, 0.48], ["CC_Base_R_Forearm", 0.7, 0, 0.12],
    ["CC_Base_L_Upperarm", 0.72, 0.2, -0.32], ["CC_Base_Spine02", 0.12, -0.22, 0],
  ] },
  blue: { duration: 0.34, peak: 0.2, bones: [
    ["CC_Base_R_Upperarm", 1.35, 0, 0.12], ["CC_Base_R_Forearm", 0.22, 0, 0],
    ["CC_Base_L_Upperarm", 0.35, 0, -0.18], ["CC_Base_Spine02", 0.14, -0.08, 0],
  ] },
  orange: { duration: 0.56, peak: 0.42, bones: [
    ["CC_Base_R_Upperarm", 1.5, -0.18, 0.42], ["CC_Base_R_Forearm", 0.88, 0, 0.08],
    ["CC_Base_L_Upperarm", 0.58, 0.14, -0.26], ["CC_Base_Spine02", -0.1, -0.28, 0],
  ] },
  yellow: { duration: 0.42, peak: 0.28, bones: [
    ["CC_Base_R_Upperarm", 1.12, 0, 0.18], ["CC_Base_R_Forearm", 0.3, 0, 0],
    ["CC_Base_L_Upperarm", 1.12, 0, -0.18], ["CC_Base_L_Forearm", 0.3, 0, 0],
    ["CC_Base_Spine02", 0.16, 0, 0],
  ] },
  cyan: { duration: 0.4, peak: 0.24, bones: [
    ["CC_Base_R_Upperarm", 1.1, 0, 0.24], ["CC_Base_R_Forearm", 0.4, 0, 0],
    ["CC_Base_L_Upperarm", 0.82, 0, -0.2], ["CC_Base_L_Forearm", 0.28, 0, 0],
    ["CC_Base_Spine02", 0.12, 0, 0],
  ] },
  pink: { duration: 0.58, peak: 0.38, bones: [
    ["CC_Base_R_Upperarm", 0.56, 0, 0.78], ["CC_Base_R_Forearm", 0.18, 0, 0.22],
    ["CC_Base_L_Upperarm", 0.56, 0, -0.78], ["CC_Base_L_Forearm", 0.18, 0, -0.22],
    ["CC_Base_Spine02", -0.08, 0, 0],
  ] },
  purple: { duration: 0.46, peak: 0.24, bones: [
    ["CC_Base_R_Upperarm", 1.05, 0, 0.3], ["CC_Base_R_Forearm", 0.42, 0, 0.1],
    ["CC_Base_L_Upperarm", 0.3, 0, -0.12],
    ["CC_Base_Spine02", 0.1, -0.1, 0],
  ] },
};

function startModelAttackMotion(characterId = betaState.selectedCharacter) {
  if (!MODEL_ATTACK_POSES[characterId]) return;
  modelAttackMotionTime = 0;
  modelAttackCharacter = characterId;
  canvas.dataset.attackMotion = "firing";
  canvas.dataset.attackMotionProfile = characterId;
}

function restoreModelAttackPose() {
  for (const { bone, quaternion } of modelAttackPoseRestore) bone.quaternion.copy(quaternion);
  modelAttackPoseRestore = [];
}

function updateModelAttackMotion(dt) {
  const profile = MODEL_ATTACK_POSES[modelAttackCharacter];
  if ((!activeCharacterMotion && !activeCharacterModel) || modelAttackMotionTime < 0 || !profile) return;
  modelAttackMotionTime += dt;
  const progress = Math.min(1, modelAttackMotionTime / profile.duration);
  const strength = progress < profile.peak
    ? THREE.MathUtils.smoothstep(progress / profile.peak, 0, 1)
    : 1 - THREE.MathUtils.smoothstep((progress - profile.peak) / (1 - profile.peak), 0, 1);
  const sceneModel = activeCharacterMotion
    ? activeCharacterMotion.scenes[activeCharacterMotion.current]
    : activeCharacterModel;
  if (sceneModel) {
    const pose = (name, rotateX = 0, rotateY = 0, rotateZ = 0) => {
      const bone = sceneModel.getObjectByName(name);
      if (!bone) return;
      modelAttackPoseRestore.push({ bone, quaternion: bone.quaternion.clone() });
      if (rotateX) bone.rotateX(rotateX * strength);
      if (rotateY) bone.rotateY(rotateY * strength);
      if (rotateZ) bone.rotateZ(rotateZ * strength);
    };
    for (const bonePose of profile.bones) pose(...bonePose);
  }
  if (progress >= 1) {
    modelAttackMotionTime = -1;
    modelAttackCharacter = null;
    canvas.dataset.attackMotion = "idle";
  }
}

function setPlayerModel(characterId) {
  const token = ++characterLoadToken;
  clearCharacterModel();
  if (["red", "orange", "yellow", "blue", "green", "cyan", "pink", "purple"].includes(characterId)) {
    body.visible = false;
    visor.visible = false;
    loadCharacterMotionSet(characterId, token);
    return;
  }
  const modelPath = null;
  body.visible = !modelPath;
  visor.visible = !modelPath;
  if (!modelPath) return;

  characterLoader.load(modelPath, (gltf) => {
    if (token !== characterLoadToken || betaState.selectedCharacter !== characterId) return;
    const model = prepareCharacterScene(skeletonClone(gltf.scene), characterId);
    player.add(model);
    activeCharacterModel = model;
    canvas.dataset.characterModel = characterId;
    if (gltf.animations.length) {
      activeCharacterMixer = new THREE.AnimationMixer(model);
      activeCharacterAction = activeCharacterMixer.clipAction(gltf.animations[0]);
      activeCharacterAction.setLoop(THREE.LoopRepeat, Infinity);
      activeCharacterAction.play();
      activeCharacterAction.paused = true;
      activeCharacterAction.time = 0;
      activeCharacterMixer.update(0);
      activeCharacterWasMoving = false;
    }
  }, undefined, () => {
    if (token !== characterLoadToken) return;
    body.visible = true;
    visor.visible = true;
    showToast(`${characterId === "blue" ? "블루" : "핑크"} 모델을 불러오지 못했습니다.`);
  });
}

function selectCharacter(id) {
  const character = CHARACTERS.find((item) => item.id === id);
  if (!character || !betaState.ownedCharacters.includes(id)) return;
  betaState.selectedCharacter = id;
  bodyMat.color.setHex(character.color);
  setPlayerModel(id);
  applySelectedSkinVisual();
  updateCrimsonControls();
  updateAttackAimIndicator();
  resetTestCombatHud();
  saveBetaState();
  renderCharacters();
  showToast(`${character.name} 선택 완료`);
}

function applySelectedSkinVisual() {
  const character = CHARACTERS.find((item) => item.id === betaState.selectedCharacter);
  const skinId = betaState.selectedSkins[betaState.selectedCharacter] || "";
  const skinColors = {
    beta_red_orange: 0xb3261e,
    beta_red_crimson: 0x62000d,
    beta_red_red: 0xff2135,
    beta2_gold_yellow: 0xffdb3d,
    beta2_gold_orange: 0xf28b21,
    beta2_gold_gold: 0xffc928,
  };
  bodyMat.color.setHex(skinColors[skinId] ?? character?.color ?? 0xef3c58);
  bodyMat.metalness = skinId.startsWith("beta2_gold_") ? 0.7 : skinId === "beta_red_red" ? 0.45 : skinId.startsWith("beta_red_") ? 0.2 : 0;
  bodyMat.roughness = skinId.startsWith("beta2_gold_") ? 0.22 : skinId.startsWith("beta_red_") ? 0.32 : 0.55;
  const crownVisible = skinId === "alpha_champion_cyan" || skinId.startsWith("crown_");
  if (crownVisible) {
    const variant = getCrownVariant(skinId);
    if (crown.userData.variant !== variant) replaceCrown(variant);
    crown.visible = true;
    const usesGlbModel = ["blue", "cyan", "pink", "purple"].includes(betaState.selectedCharacter);
    fitCrownToHead(crown, usesGlbModel ? 2.7 : 2.5);
  } else crown.visible = false;
  refreshActiveCharacterSkinPalette();
  rebuildRedThemeAccessory(skinId);
}

function replaceCrown(variant) {
  player.remove(crown);
  crown.traverse((part) => {
    part.geometry?.dispose();
    if (Array.isArray(part.material)) part.material.forEach((material) => material.dispose());
    else part.material?.dispose();
  });
  crown = createHighPolyCrown(variant);
  player.add(crown);
}

function disposeSkinAccessory() {
  for (const child of [...skinAccessory.children]) {
    skinAccessory.remove(child);
    child.traverse((part) => {
      part.geometry?.dispose();
      if (Array.isArray(part.material)) part.material.forEach((material) => material.dispose());
      else part.material?.dispose();
    });
  }
}

const skinHeadPosition = new THREE.Vector3();
const skinHeadWorldQuaternion = new THREE.Quaternion();
const skinPlayerWorldQuaternion = new THREE.Quaternion();
function updateHeadAttachedSkinAccessory() {
  const hat = skinAccessory.getObjectByName("OrangeSkinHat");
  if (!hat) return;
  const model = activeCharacterMotion
    ? activeCharacterMotion.scenes[activeCharacterMotion.current]
    : activeCharacterModel;
  const headBone = model?.getObjectByName("CC_Base_Head");
  if (!headBone) {
    hat.visible = false;
    return;
  }
  player.updateWorldMatrix(true, true);
  headBone.updateWorldMatrix(true, false);
  headBone.getWorldPosition(skinHeadPosition);
  headBone.getWorldQuaternion(skinHeadWorldQuaternion);
  player.worldToLocal(skinHeadPosition);
  player.getWorldQuaternion(skinPlayerWorldQuaternion);
  skinPlayerWorldQuaternion.invert();
  hat.position.copy(skinHeadPosition);
  hat.quaternion.copy(skinPlayerWorldQuaternion.multiply(skinHeadWorldQuaternion));
  hat.visible = true;
}

function rebuildRedThemeAccessory(skinId) {
  disposeSkinAccessory();
  if (skinId === "beta2_gold_orange") {
    const gold = new THREE.MeshStandardMaterial({
      color: 0xffc928,
      emissive: 0x5a3000,
      emissiveIntensity: 0.28,
      metalness: 0.82,
      roughness: 0.2,
    });
    const leather = new THREE.MeshStandardMaterial({
      color: 0x5a2d12,
      metalness: 0.08,
      roughness: 0.72,
    });
    const hat = new THREE.Group();
    hat.name = "OrangeSkinHat";
    hat.visible = false;
    const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.1, 24), leather);
    hatBrim.position.y = 0.89;
    const hatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.54, 0.52, 20), leather);
    hatTop.position.y = 1.15;
    const hatBand = new THREE.Mesh(new THREE.TorusGeometry(0.49, 0.055, 8, 28), gold);
    hatBand.rotation.x = Math.PI / 2;
    hatBand.position.y = 1;
    hat.add(hatBrim, hatTop, hatBand);
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.53, 0.08, 10, 32), leather);
    belt.rotation.x = Math.PI / 2;
    belt.position.y = 1.05;
    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.24, 0.1), gold);
    buckle.position.set(0, 1.05, -0.52);
    skinAccessory.add(hat, belt, buckle);
    for (const side of [-1, 1]) {
      const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.38, 0.24), leather);
      pouch.position.set(side * 0.5, 0.88, 0);
      pouch.rotation.z = side * 0.12;
      skinAccessory.add(pouch);
    }
    const tool = new THREE.Group();
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.92, 10), leather);
    const pick = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.6, 8), gold);
    pick.rotation.z = Math.PI / 2;
    pick.position.y = 0.43;
    tool.add(handle, pick);
    tool.position.set(0.72, 1.1, 0.12);
    tool.rotation.z = -0.38;
    skinAccessory.add(tool);
  } else if (!skinId.startsWith("beta_red_")) {
    return;
  }
  const redMetal = new THREE.MeshStandardMaterial({
    color: skinId === "beta_red_crimson" ? 0x5a0010 : 0xd51f32,
    emissive: skinId === "beta_red_red" ? 0x5c0008 : 0x240002,
    emissiveIntensity: skinId === "beta_red_red" ? 0.8 : 0.35,
    metalness: 0.72,
    roughness: 0.24,
  });
  const gold = new THREE.MeshStandardMaterial({ color: 0xffc83d, metalness: 0.82, roughness: 0.2 });
  if (skinId === "beta2_gold_orange") {
    // 골드 러쉬 장비는 위에서 구성한다.
  } else if (skinId === "beta_red_orange") {
    const hat = new THREE.Group();
    hat.name = "OrangeSkinHat";
    hat.visible = false;
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.76, 0.09, 20), redMetal);
    brim.position.y = 0.89;
    const crownTop = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.52, 0.48, 16), redMetal);
    crownTop.position.y = 1.13;
    const badge = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), gold);
    badge.position.set(0, 1.13, -0.48);
    hat.add(brim, crownTop, badge);
    skinAccessory.add(hat);
  } else if (skinId === "beta_red_crimson") {
    for (const side of [-1, 1]) {
      const shoulder = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.72, 8), redMetal);
      shoulder.position.set(side * 0.86, 1.72, 0);
      shoulder.rotation.z = side * -0.72;
      skinAccessory.add(shoulder);
    }
    const chestGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.22), gold);
    chestGem.position.set(0, 1.55, -0.67);
    skinAccessory.add(chestGem);
  } else if (skinId === "beta_red_red") {
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.08, 10, 32), gold);
    halo.rotation.x = Math.PI / 2;
    halo.position.y = 2.7;
    const crest = new THREE.Mesh(new THREE.OctahedronGeometry(0.25), redMetal);
    crest.position.set(0, 2.35, -0.55);
    skinAccessory.add(halo, crest);
  }
  skinAccessory.traverse((part) => {
    if (!part.isMesh) return;
    part.castShadow = true;
    part.renderOrder = 5;
  });
}

function equipSkin(characterId, skinId) {
  const skin = SKINS[skinId];
  if (!skin || skin.character !== characterId || !betaState.ownedSkins.includes(skinId)) return;
  betaState.selectedSkins[characterId] = skinId;
  saveBetaState();
  applySelectedSkinVisual();
  renderCharacters();
  showToast(`${getSkinName(skin)} 장착`);
}

function unequipSkin(characterId) {
  if (!betaState.selectedSkins[characterId]) return;
  delete betaState.selectedSkins[characterId];
  saveBetaState();
  if (betaState.selectedCharacter === characterId) applySelectedSkinVisual();
  renderCharacters();
  showToast("스킨 착용 해제");
}

function updateCrimsonControls() {
  crimsonControls.classList.remove("hidden");
  const characterDefinition = BETA_CHARACTERS[betaState.selectedCharacter];
  attackHint.textContent = "마우스 좌클릭 · 일반 공격";
  attackTitle.textContent = characterDefinition?.basicAttack?.name || "일반 공격";
  attackComboState.textContent = "준비";
  const hideUltimate = !["crimson", "cyan", "pink", "gold", "ivory"].includes(betaState.selectedCharacter);
  ultimateButton.classList.toggle("hidden", hideUltimate);
  document.querySelector(".ultimate-connector").classList.toggle("hidden", hideUltimate);
  ultimateButton.classList.toggle("gold-ultimate", betaState.selectedCharacter === "gold");
  ultimateButton.classList.toggle("pink-ultimate", betaState.selectedCharacter === "pink");
  updateCrimsonUltimateGauge();
}

function buyCharacter(id) {
  const character = CHARACTERS.find((item) => item.id === id);
  if (!character || betaState.ownedCharacters.includes(id)) return;
  if (betaState.credits < character.price) return showToast("크레딧이 부족합니다.");
  betaState.credits -= character.price;
  betaState.ownedCharacters.push(id);
  saveBetaState();
  renderCharacters();
  showToast(`${character.name} 해제 완료`);
}

function renderCharacters() {
  modalTitle.textContent = "캐릭터 등급";
  modalContent.innerHTML = `<div class="beta-grid">${CHARACTERS.map((character) => {
    const owned = betaState.ownedCharacters.includes(character.id);
    const selected = betaState.selectedCharacter === character.id;
    const characterDescription = BETA_CHARACTERS[character.id]?.description;
    const basicAttack = BETA_CHARACTERS[character.id]?.basicAttack;
    const officialAbility = BETA_CHARACTERS[character.id]?.officialAbility;
    const ultimate = BETA_CHARACTERS[character.id]?.ultimate;
    const ownedCharacterSkins = BETA_SKINS.filter((skin) => skin.character === character.id && betaState.ownedSkins.includes(skin.id));
    const skinList = ownedCharacterSkins.length
      ? `<div class="owned-skin-list">${ownedCharacterSkins.map((skin) => {
        const equipped = betaState.selectedSkins[character.id] === skin.id;
        return `<div class="owned-skin-row"><span>${getSkinName(skin)}</span><button ${equipped ? `data-unequip-skin="${character.id}"` : `data-equip-skin="${skin.id}" data-skin-character="${character.id}"`}>${equipped ? "착용 해제" : "장착"}</button></div>`;
      }).join("")}</div>`
      : `<p>보유 스킨 없음</p>`;
    return `<article class="beta-card${selected ? " selected" : ""}">
      <span class="rarity ${character.rarity}">${rarityName(character.rarity)}</span>
      <h3>${character.name}</h3>
      ${characterDescription ? `<p><strong>캐릭터 소개</strong><br>${characterDescription}</p>` : ""}
      ${basicAttack ? `<p><strong>일반 공격 · ${basicAttack.name}</strong><br>${basicAttack.description}</p>` : ""}
      ${officialAbility ? `<p><strong>공식 능력 · ${officialAbility.name}</strong><br>${officialAbility.description}</p>` : ""}
      ${ultimate ? `<p><strong>궁극기 · ${ultimate.name}</strong><br>${ultimate.description}</p>` : ""}
      <p>${character.id === "gold" ? "베타 시즌 2 신규 · 설치형 컨트롤러" : character.id === "crimson" ? "신규 근접 브루저 · 3연속 펀치" : "베타 시즌 캐릭터 등급 테스트"}</p>
      <button data-character="${character.id}" data-action="${owned ? "select" : "buy"}" ${selected ? "disabled" : ""}>${selected ? "선택 중" : owned ? "선택" : `${character.price} 크레딧`}</button>
      ${skinList}
    </article>`;
  }).join("")}</div>`;
}

function renderShop() {
  modalTitle.textContent = "베타 시즌 상점";
  modalContent.innerHTML = `<p>보유 코인: <strong>${betaState.coins.toLocaleString("ko-KR")}</strong></p><div class="beta-grid">${BETA_SKINS.map((skin) => {
    const owned = betaState.ownedSkins.includes(skin.id);
    return `<article class="beta-card">
      <span class="rarity ${skin.rarity}">${rarityName(skin.rarity)}</span>
      <h3>${getSkinName(skin)}</h3><p>${CHARACTERS.find((character) => character.id === skin.character)?.name || skin.character} 전용 · 베타 시즌 2</p>
      <button data-skin="${skin.id}" ${owned ? "disabled" : ""}>${owned ? "보유 중" : skin.cost === 0 ? getBetaText("shopFree") : `${skin.cost.toLocaleString("ko-KR")} 코인`}</button>
    </article>`;
  }).join("")}</div>`;
}

function renderAssetShowroom() {
  const glbCharacters = new Set(["red", "green", "blue", "orange", "yellow", "cyan", "pink", "purple"]);
  const seasonAssets = Object.values(SKINS).filter((skin) => skin.season === BETA_SEASON_ID);
  modalTitle.textContent = "에셋 쇼룸";
  modalContent.innerHTML = `<div class="beta-grid">${CHARACTERS.map((character) => {
    const usesGlb = glbCharacters.has(character.id);
    const modelPath = usesGlb ? `assets/3d/${character.id}/walk-m1s.glb` : "Three.js 절차형 모델";
    const skinCount = seasonAssets.filter((skin) => skin.character === character.id).length;
    return `<article class="beta-card">
      <span class="rarity ${character.rarity}">${usesGlb ? "GLB MODEL" : "PROCEDURAL"}</span>
      <h3>${character.name}</h3>
      <p>${usesGlb ? "걷기 시작·반복·정지 모션 에셋" : "코드로 생성되는 테스트 외형"}</p>
      <p>베타 시즌 2 스킨 에셋 ${skinCount}개</p>
      <code>${modelPath}</code>
    </article>`;
  }).join("")}</div>`;
}

function buySkin(id) {
  const skin = SKINS[id];
  if (!skin || betaState.ownedSkins.includes(id)) return;
  if (skin.season !== BETA_SEASON_ID) return;
  if (betaState.coins < skin.cost) return showToast("코인이 부족합니다.");
  betaState.coins -= skin.cost;
  betaState.ownedSkins.push(id);
  saveBetaState();
  renderShop();
  showToast(`${getSkinName(skin)} 구매 완료`);
}

function renderDaily(result = "") {
  const rewardCount = betaState.daily.winRewards || 0;
  const claimed = Boolean(betaState.daily.claimed);
  modalTitle.textContent = "일일 승리 보상";
  modalContent.innerHTML = `<div class="drop-box">
    <span class="rarity legendary">경기 종료 후 별 보상</span>
    <h3>${claimed ? "오늘의 보상 획득 완료" : "별을 돌려 등급을 올려보세요"}</h3>
    <div class="drop-result">${result || (claimed ? `${betaState.daily.rewardGrade} · ${betaState.daily.rewardAmount} ${betaState.daily.rewardCurrency || "β 크레딧"}` : `오늘 ${rewardCount}회 획득`)}</div>
    <p>경기가 끝나면 모든 게임 UI가 사라지고 일일 보상 별이 나타납니다.</p>
    ${claimed ? "" : '<button type="button" data-daily-reveal>보상 연출 테스트</button>'}
  </div>`;
}

const ORDER_EVENT_REWARDS = [[1,"코인 100개"],[3,"크레딧 50개"],[5,"아이스크림 핀"],[10,"코인 200개"],[25,"크레딧 150개"],[40,"아이스크림 가게 프로필 배경"],[50,"코인 500개"],[75,"점원 아이보리 스킨"],[90,"아이스크림 가게 프로필 배지"],[100,"완벽한 점장 칭호 + 특별 승리 연출"]];
function getOrderTrackPercent(progress) {
  if (progress <= 0) return 0;
  const milestones = ORDER_EVENT_REWARDS.map(([wins]) => wins);
  const reachedIndex = milestones.findIndex((wins) => progress < wins);
  if (reachedIndex < 0) return 100;
  const previousIndex = Math.max(0, reachedIndex - 1);
  const previousWins = reachedIndex === 0 ? 0 : milestones[previousIndex];
  const nextWins = milestones[reachedIndex];
  const segmentProgress = (progress - previousWins) / Math.max(1, nextWins - previousWins);
  const previousPercent = reachedIndex === 0 ? 0 : (previousIndex / (milestones.length - 1)) * 100;
  const nextPercent = (reachedIndex / (milestones.length - 1)) * 100;
  return previousPercent + (nextPercent - previousPercent) * segmentProgress;
}
function renderOrderEvent() {
  const progress = Math.min(100, betaState.orderEvent.progress);
  const trackPercent = getOrderTrackPercent(progress);
  modalTitle.textContent = "이벤트: 주문 왔어요~!";
  modalContent.innerHTML = `<section class="order-event"><div class="order-event-summary"><strong>${progress} / 100</strong><span>AI전 +1 · 플레이어전 +2</span></div><div class="order-track-scroll"><div class="order-track"><div class="order-track-rail"><i style="width:${trackPercent}%"></i></div>${ORDER_EVENT_REWARDS.map(([wins,label],index)=>{const claimed=betaState.orderEvent.claimed.includes(wins);const unlocked=progress>=wins;const position=(index/(ORDER_EVENT_REWARDS.length-1))*100;return `<article class="order-stop ${claimed?"claimed":unlocked?"available":"locked"}" style="left:${position}%"><strong>${wins}승</strong><button data-order-claim="${wins}" ${!unlocked||claimed?"disabled":""} aria-label="${wins}승 보상 ${label}"><span>${claimed?"✓":unlocked?"!":"🔒"}</span></button><p>${label}</p></article>`;}).join("")}</div></div></section>`;
}
function claimOrderReward(wins) {
  if (betaState.orderEvent.progress < wins || betaState.orderEvent.claimed.includes(wins)) return;
  if (wins === 1) betaState.coins += 100;
  if (wins === 3) betaState.credits += 50;
  if (wins === 10) betaState.coins += 200;
  if (wins === 25) betaState.credits += 150;
  if (wins === 50) betaState.coins += 500;
  betaState.orderEvent.claimed.push(wins); saveBetaState(); renderOrderEvent(); showToast("이벤트 보상 수령 완료");
}

// 9단계 이름은 말 그대로 "???"다. 자리표시자가 아니라 확정된 이름.
const DAILY_REWARD_TIERS = [
  { id: "common", name: "일반", credits: 100, coins: 250 },
  { id: "rare", name: "희귀", credits: 150, coins: 400 },
  { id: "epic", name: "초희귀", credits: 250, coins: 700 },
  { id: "mythic", name: "신화", credits: 400, coins: 1200 },
  { id: "legendary", name: "전설", credits: 600, coins: 2000 },
  { id: "unique", name: "유니크", credits: 900, coins: 3200 },
  { id: "ultra", name: "울트라 전설", credits: 1400, coins: 5000 },
  { id: "transcend", name: "초월", credits: 2100, coins: 8000 },
  { id: "unknown", name: "???", credits: 3200, coins: 12000 },
  { id: "absolute", name: "절대", credits: 5000, coins: 20000 },
];
let dailyRewardTierIndex = 0;
let dailyRewardSpinning = false;
let dailyRewardComplete = false;
// 성공하면 기회를 1회 돌려주므로 실질적으로 기회를 소모하지 않는다.
// 즉 실패를 이 횟수만큼 쌓으면 종료된다.
const DAILY_REWARD_UPGRADE_ATTEMPTS = 4;
const DAILY_REWARD_UPGRADE_CHANCE = 0.55;
let dailyRewardAttemptsUsed = 0;

function updateDailyRewardReveal() {
  const tier = DAILY_REWARD_TIERS[dailyRewardTierIndex];
  const remaining = Math.max(0, DAILY_REWARD_UPGRADE_ATTEMPTS - dailyRewardAttemptsUsed);
  dailyRewardReveal.dataset.tier = tier.id;
  dailyRewardReveal.dataset.upgradeAttemptsUsed = String(dailyRewardAttemptsUsed);
  dailyRewardReveal.dataset.upgradeAttemptsRemaining = String(remaining);
  dailyRewardGrade.textContent = tier.name;
  dailyRewardAttempts.textContent = dailyRewardComplete
    ? `업그레이드 ${dailyRewardAttemptsUsed}회 완료`
    : `업그레이드 기회 ${remaining} / ${DAILY_REWARD_UPGRADE_ATTEMPTS}`;
  // 남은 기회가 있고 아직 최고 등급이 아닐 때만 일괄 사용 버튼을 보여준다
  const showUpgradeAll = !dailyRewardComplete && remaining > 0 && !dailyRewardAtTopTier();
  dailyRewardUpgradeAll.classList.toggle("hidden", !showUpgradeAll);
  dailyRewardUpgradeAll.textContent = `남은 ${remaining}회 한 번에 사용`;
}

function showDailyRewardReveal() {
  // 베타 테스트 페이지는 반복 테스트용이라 하루 1회 제한을 두지 않는다
  dailyRewardTierIndex = 0;
  dailyRewardSpinning = false;
  dailyRewardComplete = false;
  dailyRewardAttemptsUsed = 0;
  dailyRewardStar.disabled = false;
  dailyRewardStar.classList.remove("spinning");
  dailyRewardUpgradeAll.disabled = false;
  dailyRewardMessage.textContent = "별을 클릭해 보상을 확인하세요";
  dailyRewardReturn.classList.add("hidden");
  updateDailyRewardReveal();
  modal.classList.add("hidden");
  document.body.classList.add("daily-reveal-active");
  dailyRewardReveal.classList.remove("hidden");
}

function finishDailyReward() {
  const tier = DAILY_REWARD_TIERS[dailyRewardTierIndex];
  const rewardType = Math.random() < 0.5 ? "coins" : "credits";
  const rewardAmount = tier[rewardType];
  const rewardCurrency = rewardType === "coins" ? "코인" : "β 크레딧";
  dailyRewardComplete = true;
  updateDailyRewardReveal();
  betaState[rewardType] += rewardAmount;
  betaState.daily.claimed = true;
  betaState.daily.winRewards = (betaState.daily.winRewards || 0) + 1;
  betaState.daily.rewardGrade = tier.name;
  betaState.daily.rewardType = rewardType;
  betaState.daily.rewardAmount = rewardAmount;
  betaState.daily.rewardCurrency = rewardCurrency;
  saveBetaState();
  dailyRewardStar.disabled = true;
  dailyRewardMessage.textContent = `${tier.name} 보상 · ${rewardAmount} ${rewardCurrency} 획득!`;
  dailyRewardReturn.classList.remove("hidden");
}

// 성공 시 몇 단계를 뛰어넘을지 가중치 분포로 결정한다. 예: 일반→희귀(1단계)는
// 60, 일반→초희귀(2단계)는 40 식으로 단계가 클수록 가중치가 낮아진다.
const DAILY_REWARD_JUMP_WEIGHTS = [
  { steps: 1, weight: 60 },
  { steps: 2, weight: 40 },
  { steps: 3, weight: 30 },
  { steps: 4, weight: 25 },
  { steps: 5, weight: 21 },
  { steps: 6, weight: 10 },
  { steps: 7, weight: 5 },
  { steps: 8, weight: 3 },
  { steps: 9, weight: 2 },
  { steps: 10, weight: 1 },
];
function rollUpgradeJumpSteps() {
  const totalWeight = DAILY_REWARD_JUMP_WEIGHTS.reduce((sum, w) => sum + w.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const { steps, weight } of DAILY_REWARD_JUMP_WEIGHTS) {
    if (roll < weight) return steps;
    roll -= weight;
  }
  return DAILY_REWARD_JUMP_WEIGHTS[0].steps;
}

// 업그레이드 1회 판정. 최고 등급이면 더 오르지 않는다.
// 굴림 1회. 성공하면 기회를 1회 돌려주므로 실패했을 때만 기회가 준다.
function rollDailyRewardUpgrade() {
  const canUpgrade = dailyRewardTierIndex < DAILY_REWARD_TIERS.length - 1;
  const upgraded = canUpgrade && Math.random() < DAILY_REWARD_UPGRADE_CHANCE;
  if (upgraded) {
    const steps = rollUpgradeJumpSteps();
    dailyRewardTierIndex = Math.min(DAILY_REWARD_TIERS.length - 1, dailyRewardTierIndex + steps);
  } else {
    dailyRewardAttemptsUsed += 1;
  }
  return upgraded;
}

function dailyRewardAttemptsLeft() {
  return Math.max(0, DAILY_REWARD_UPGRADE_ATTEMPTS - dailyRewardAttemptsUsed);
}

function dailyRewardAtTopTier() {
  return dailyRewardTierIndex >= DAILY_REWARD_TIERS.length - 1;
}

// 남은 기회를 한 번에 소모한다. 판정 확률은 한 번씩 누르는 것과 같다.
// 성공해도 기회가 줄지 않으므로, 끝날 때까지(실패 소진 또는 최고 등급) 자동으로 굴린다
dailyRewardUpgradeAll.addEventListener("click", () => {
  if (dailyRewardSpinning || dailyRewardComplete) return;
  if (dailyRewardAttemptsLeft() <= 0 || dailyRewardAtTopTier()) return;
  dailyRewardSpinning = true;
  dailyRewardStar.classList.add("spinning");
  dailyRewardUpgradeAll.disabled = true;
  dailyRewardMessage.textContent = "남은 기회를 한 번에 사용합니다…";
  const startTierIndex = dailyRewardTierIndex;
  const startTier = DAILY_REWARD_TIERS[dailyRewardTierIndex].name;
  setTimeout(() => {
    while (dailyRewardAttemptsLeft() > 0 && !dailyRewardAtTopTier()) {
      rollDailyRewardUpgrade();
    }
    dailyRewardStar.classList.remove("spinning");
    dailyRewardSpinning = false;
    const gained = dailyRewardTierIndex - startTierIndex;
    const endTier = DAILY_REWARD_TIERS[dailyRewardTierIndex].name;
    updateDailyRewardReveal();
    finishDailyReward();
    dailyRewardMessage.textContent = gained > 0
      ? `${startTier} → ${endTier} · ${gained}단계 상승! ${dailyRewardMessage.textContent}`
      : `${startTier} 등급 유지 · ${dailyRewardMessage.textContent}`;
  }, 900);
});

dailyRewardStar.addEventListener("click", () => {
  if (dailyRewardSpinning || dailyRewardComplete) return;
  dailyRewardSpinning = true;
  dailyRewardStar.classList.add("spinning");
  dailyRewardMessage.textContent = "별이 회전하고 있습니다…";
  setTimeout(() => {
    dailyRewardStar.classList.remove("spinning");
    dailyRewardSpinning = false;
    const upgraded = rollDailyRewardUpgrade();
    updateDailyRewardReveal();
    const attemptsRemaining = dailyRewardAttemptsLeft();
    if (attemptsRemaining <= 0 || dailyRewardAtTopTier()) {
      finishDailyReward();
      return;
    }
    dailyRewardMessage.textContent = upgraded
      ? `${DAILY_REWARD_TIERS[dailyRewardTierIndex].name} 등급으로 상승! 기회는 그대로 ${attemptsRemaining}회`
      : `등급 유지 · 남은 기회 ${attemptsRemaining}회`;
  }, 900);
});

dailyRewardReturn.addEventListener("click", () => {
  dailyRewardReveal.classList.add("hidden");
  document.body.classList.remove("daily-reveal-active");
});

function openPanel(panel) {
  modal.classList.remove("hidden");
  if (panel === "characters") renderCharacters();
  if (panel === "shop") renderShop();
  if (panel === "assets") renderAssetShowroom();
  if (panel === "daily") renderDaily();
  if (panel === "orders") renderOrderEvent();
}
document.querySelectorAll("[data-panel]").forEach((button) => button.addEventListener("click", () => openPanel(button.dataset.panel)));
document.getElementById("modal-close").addEventListener("click", () => modal.classList.add("hidden"));
modal.addEventListener("click", (event) => { if (event.target === modal) modal.classList.add("hidden"); });
modalContent.addEventListener("click", (event) => {
  const characterButton = event.target.closest("[data-character]");
  if (characterButton) characterButton.dataset.action === "buy" ? buyCharacter(characterButton.dataset.character) : selectCharacter(characterButton.dataset.character);
  const skinButton = event.target.closest("[data-skin]");
  if (skinButton) buySkin(skinButton.dataset.skin);
  const equipSkinButton = event.target.closest("[data-equip-skin]");
  if (equipSkinButton) equipSkin(equipSkinButton.dataset.skinCharacter, equipSkinButton.dataset.equipSkin);
  const unequipSkinButton = event.target.closest("[data-unequip-skin]");
  if (unequipSkinButton) unequipSkin(unequipSkinButton.dataset.unequipSkin);
  if (event.target.closest("[data-daily-reveal]")) {
    modal.classList.add("hidden");
    showDailyRewardReveal();
  }
  const orderClaim = event.target.closest("[data-order-claim]");
  if (orderClaim) claimOrderReward(Number(orderClaim.dataset.orderClaim));
});

const CRIMSON = BETA_CHARACTERS.crimson;
const crimsonSlashes = [];
const betaProjectiles = [];
const damagePopups = [];
let generalAttackReady = true;

// 본 게임(main.js)의 createDamagePopup을 그대로 이식한 데미지 숫자 표시
function createDamagePopup(position, amount, color = "#ffd27a", prefixOverride = null) {
  const popupCanvas = document.createElement("canvas");
  popupCanvas.width = 128;
  popupCanvas.height = 64;
  const ctx = popupCanvas.getContext("2d");
  ctx.font = "bold 40px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 6;
  ctx.strokeStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillStyle = color;
  const prefix = prefixOverride ?? (color === "#ff5c5c" ? "-" : "");
  const text = `${prefix}${Math.round(amount)}`;
  ctx.strokeText(text, 64, 32);
  ctx.fillText(text, 64, 32);

  const texture = new THREE.CanvasTexture(popupCanvas);
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }),
  );
  sprite.scale.set(1.4, 0.7, 1);
  sprite.position.copy(position);
  sprite.position.y += 3.6;
  sprite.position.x += (Math.random() - 0.5) * 0.6;
  scene.add(sprite);
  damagePopups.push({ mesh: sprite, life: 0.7, maxLife: 0.7 });
}
let purpleAttackIndex = 0;
let goldUltimateCharge = 0;
let pinkUltimateCharge = 0;
let goldAttackSequence = 0;
const goldAttackCharge = new Map();
const goldStageHits = new Map();
const malfunctionZones = [];
const ivoryIceCreamZones = [];

function ensureMalfunctionIndicator(target) {
  if (target.userData.malfunctionIndicator) return target.userData.malfunctionIndicator;
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: 0xffc928,
    emissive: 0xff7a00,
    emissiveIntensity: 1.4,
    metalness: 0.45,
    roughness: 0.25,
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.07, 6, 24), material);
  ring.rotation.x = Math.PI / 2;
  group.add(ring);
  for (const angle of [-Math.PI / 4, Math.PI / 4]) {
    const slash = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.05, 0.12), material);
    slash.rotation.z = angle;
    group.add(slash);
  }
  for (let i = 0; i < 3; i += 1) {
    const spark = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), material);
    const angle = (i / 3) * Math.PI * 2;
    spark.position.set(Math.sin(angle) * 0.95, 0.15 + (i % 2) * 0.22, Math.cos(angle) * 0.95);
    group.add(spark);
  }
  group.position.y = target.userData.kind === "alphaBoss" ? 9.2 : 2.35;
  group.visible = false;
  group.userData.material = material;
  target.add(group);
  target.userData.malfunctionIndicator = group;
  return group;
}

function damageTarget(target, damage, causesKnockback = false) {
  if (!target.visible) return;
  if (target.userData.goldRushBot) {
    damageGoldRushBot(target.userData.goldRushBot, damage);
    return;
  }
  createDamagePopup(target.position, damage);
  target.userData.health -= damage;
  if (causesKnockback) {
    const pushX = target.position.x - player.position.x;
    const pushZ = target.position.z - player.position.z;
    const pushLength = Math.hypot(pushX, pushZ) || 1;
    const pushStrength = target.userData.kind === "alphaBoss" ? 2.2 : 5.5;
    target.userData.knockbackX = (pushX / pushLength) * pushStrength;
    target.userData.knockbackZ = (pushZ / pushLength) * pushStrength;
    target.userData.hitRecoil = 1;
  }
  createHitImpact(target.position);
  createRedThemeHitEffect(target.position);
  flashTarget(target);
  if (target.userData.health <= 0) target.visible = false;
}

function getActiveRedThemeSkin() {
  const skinId = betaState.selectedSkins[betaState.selectedCharacter] || "";
  return skinId.startsWith("beta_red_") ? skinId : "";
}

// 부드럽게 퍼지는 원형 그라디언트. 단색 평면보다 이펙트가 덜 밋밋해진다.
let _sparkTexture = null;
function getSparkTexture() {
  if (_sparkTexture) return _sparkTexture;
  const size = 64;
  const canvasEl = document.createElement("canvas");
  canvasEl.width = size;
  canvasEl.height = size;
  const ctx = canvasEl.getContext("2d");
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.55)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  _sparkTexture = new THREE.CanvasTexture(canvasEl);
  return _sparkTexture;
}

// 피격 임팩트 — 스킨과 무관하게 모든 타격에서 터진다.
// 밝은 코어와 퍼지는 잔광을 겹쳐 타격감을 준다.
function createHitImpact(position, color = 0xffd9a0) {
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 10, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending }),
  );
  core.position.copy(position);
  core.position.y += 0.9;
  scene.add(core);
  crimsonSlashes.push({ group: core, mesh: core, life: 0.16, maxLife: 0.16, grow: 2.4 });

  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 1.5),
    new THREE.MeshBasicMaterial({
      map: getSparkTexture(), color, transparent: true, opacity: 0.85,
      depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    }),
  );
  glow.position.copy(core.position);
  glow.lookAt(camera.position);
  scene.add(glow);
  crimsonSlashes.push({ group: glow, mesh: glow, life: 0.28, maxLife: 0.28, grow: 2.1 });

}

function createRedThemeHitEffect(position) {
  const skinId = getActiveRedThemeSkin();
  if (!skinId) return;
  const color = skinId === "beta_red_crimson" ? 0x9b001b : skinId === "beta_red_red" ? 0xff334d : 0xd22530;
  const pulse = new THREE.Mesh(
    new THREE.RingGeometry(0.2, skinId === "beta_red_red" ? 0.85 : 0.62, 24),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  pulse.rotation.x = -Math.PI / 2;
  pulse.position.copy(position);
  pulse.position.y += 0.18;
  scene.add(pulse);
  crimsonSlashes.push({ group: pulse, mesh: pulse, life: 0.3, maxLife: 0.3 });
}

function fireBetaProjectile({ angle = 0, yawOverride = null, lateralOffset = 0, speed, range, damage, color, radius = 0.18, splash = 0, type = "shot", returnSpeedMultiplier = 1, returnDamageMultiplier = 1, causesKnockback = false }) {
  const yaw = yawOverride ?? player.rotation.y + angle;
  const redThemeSkin = getActiveRedThemeSkin();
  const redThemeColor = redThemeSkin === "beta_red_crimson" ? 0x8f0019 : redThemeSkin === "beta_red_red" ? 0xff2842 : 0xd72834;
  const isOrangeFruit = type === "orangeFruit";
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 10, 8),
    isOrangeFruit
      ? new THREE.MeshStandardMaterial({ color: 0xf28b21, roughness: 0.78, metalness: 0 })
      : redThemeSkin
      ? new THREE.MeshStandardMaterial({
        color: redThemeColor,
        emissive: redThemeColor,
        emissiveIntensity: redThemeSkin === "beta_red_red" ? 2.2 : 1.5,
        metalness: 0.35,
        roughness: 0.18,
        transparent: true,
        opacity: 0.96,
      })
      : new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.92 }),
  );
  if (isOrangeFruit) {
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.045, 0.16, 8),
      new THREE.MeshStandardMaterial({ color: 0x5d3b16, roughness: 0.9 }),
    );
    stem.position.y = radius * 0.92;
    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 8, 5),
      new THREE.MeshStandardMaterial({ color: 0x3f8b35, roughness: 0.86 }),
    );
    leaf.scale.set(1.35, 0.24, 0.58);
    leaf.position.set(0.09, radius * 1.08, 0);
    leaf.rotation.z = -0.35;
    mesh.add(stem, leaf);
  }
  if (redThemeSkin) mesh.scale.setScalar(redThemeSkin === "beta_red_red" ? 1.25 : 1.12);
  mesh.position.set(
    player.position.x + Math.cos(yaw) * lateralOffset,
    player.position.y + 1.25,
    player.position.z - Math.sin(yaw) * lateralOffset,
  );
  scene.add(mesh);
  betaProjectiles.push({ mesh, characterId: betaState.selectedCharacter, vx: Math.sin(yaw) * speed, vz: Math.cos(yaw) * speed, speed, returnSpeedMultiplier, returnDamageMultiplier, traveled: 0, returnTraveled: 0, range, damage, splash, type, hitRadius: radius, hit: new Set(), causesKnockback, launchY: mesh.position.y });
  canvas.dataset.projectilesFired = String(Number(canvas.dataset.projectilesFired || 0) + 1);
  canvas.dataset.lastProjectileType = type;
}

function createIvoryScoopMesh() {
  const scoop = new THREE.Group();
  const cream = new THREE.MeshStandardMaterial({ color: 0xffffe8, roughness: 0.72 });
  const cone = new THREE.MeshStandardMaterial({ color: 0xd7a45b, roughness: 0.88 });
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 10), cream);
  const wafer = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.55, 10), cone);
  wafer.position.y = -0.34;
  wafer.rotation.z = Math.PI;
  scoop.add(ball, wafer);
  return scoop;
}

function fireIvoryIceCream(targetX, targetZ, fromUltimate = false) {
  const def = BETA_CHARACTERS.ivory;
  const dx = targetX - player.position.x;
  const dz = targetZ - player.position.z;
  const range = Math.max(0.01, Math.hypot(dx, dz));
  const mesh = createIvoryScoopMesh();
  mesh.position.set(player.position.x, player.position.y + 1.35, player.position.z);
  scene.add(mesh);
  betaProjectiles.push({
    mesh, characterId: "ivory", vx: (dx / range) * def.iceCreamSpeed, vz: (dz / range) * def.iceCreamSpeed,
    speed: def.iceCreamSpeed, traveled: 0, returnTraveled: 0, range, damage: def.iceCreamDamage,
    splash: 0, type: "ivoryIceCream", hitRadius: 0.34, hit: new Set(), causesKnockback: false,
    launchY: mesh.position.y, landingX: targetX, landingZ: targetZ, fromUltimate,
  });
  canvas.dataset.projectilesFired = String(Number(canvas.dataset.projectilesFired || 0) + 1);
  canvas.dataset.lastProjectileType = "ivoryIceCream";
}

function chargeIvoryUltimate(amount = 1) {
  ivoryUltimateCharge = Math.min(BETA_CHARACTERS.ivory.ultimate.chargeRequired, ivoryUltimateCharge + amount);
  if (betaState.selectedCharacter === "ivory") updateCrimsonUltimateGauge();
}

function createIvoryIceCreamZone(x, z, fromUltimate = false) {
  const def = BETA_CHARACTERS.ivory;
  const group = new THREE.Group();
  const puddle = new THREE.Mesh(
    new THREE.CircleGeometry(def.iceCreamZoneRadius, 36),
    new THREE.MeshStandardMaterial({ color: 0xffffe8, emissive: 0x91dff2, emissiveIntensity: 0.16, transparent: true, opacity: 0.82, side: THREE.DoubleSide, depthWrite: false }),
  );
  puddle.rotation.x = -Math.PI / 2;
  const overturnedScoop = new THREE.Mesh(new THREE.SphereGeometry(0.58, 14, 9, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xfffff2, roughness: 0.7 }));
  overturnedScoop.scale.y = 0.45;
  overturnedScoop.position.y = 0.12;
  const uprightCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.34, 0.9, 12),
    new THREE.MeshStandardMaterial({ color: 0xd7a45b, roughness: 0.88 }),
  );
  uprightCone.position.y = 0.55;
  group.add(puddle, overturnedScoop, uprightCone);
  group.position.set(x, Math.max(0.09, groundHeightAt(x, z) + 0.09), z);
  scene.add(group);
  const now = clock.elapsedTime;
  ivoryIceCreamZones.push({ group, puddle, x, z, radius: def.iceCreamZoneRadius, expiresAt: now + def.iceCreamZoneDuration, nextTickAt: now + def.iceCreamZoneTickInterval, fromUltimate });

  for (const target of testTargets) {
    if (!target.visible || target.userData.isAlly) continue;
    if (Math.hypot(target.position.x - x, target.position.z - z) <= def.iceCreamZoneRadius) {
      damageTarget(target, def.iceCreamDamage);
      chargeIvoryUltimate(1);
    }
  }
  canvas.dataset.lastIvoryLanding = `${x.toFixed(2)},${z.toFixed(2)}`;
}

function createGoldIngotGeometry() {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array([
    -0.28, -0.11, -0.18,  0.28, -0.11, -0.18,  0.28, -0.11,  0.18, -0.28, -0.11,  0.18,
    -0.19,  0.11, -0.11,  0.19,  0.11, -0.11,  0.19,  0.11,  0.11, -0.19,  0.11,  0.11,
  ]), 3));
  geometry.setIndex([
    0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7,
    0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5,
    2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7,
  ]);
  geometry.computeVertexNormals();
  return geometry;
}

function spawnOrangeJuice(position, directHitTarget = null) {
  const def = BETA_CHARACTERS.orange;
  const range = def.bombSplashRange * def.blastRadiusMultiplier;
  const blockedDirectHits = directHitTarget
    ? Math.max(0, def.bombSplashCount - def.bombDirectHitJuiceCount)
    : 0;
  createGroundPulse(range, 0xffb12b, position);
  for (let i = 0; i < def.bombSplashCount; i += 1) {
    const angle = (i / def.bombSplashCount) * Math.PI * 2;
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xffcc44, transparent: true, opacity: 0.92 }),
    );
    mesh.position.copy(position);
    scene.add(mesh);
    betaProjectiles.push({
      mesh, characterId: "orange",
      vx: Math.sin(angle) * def.bombSplashSpeed,
      vz: Math.cos(angle) * def.bombSplashSpeed,
      speed: def.bombSplashSpeed, traveled: 0, returnTraveled: 0,
      range, damage: def.bombSplashDamage, splash: 0,
      type: "orangeJuice", hitRadius: def.bombSplashHitRadius,
      hit: new Set(i < blockedDirectHits ? [directHitTarget] : []), causesKnockback: false,
    });
    canvas.dataset.projectilesFired = String(Number(canvas.dataset.projectilesFired || 0) + 1);
  }
}

function spawnGoldProjectile(position, yaw, stage, attackId) {
  canvas.dataset.projectilesFired = String(Number(canvas.dataset.projectilesFired || 0) + 1);
  canvas.dataset.lastGoldStage = String(stage);
  const def = BETA_CHARACTERS.gold;
  const speed = def[`stage${stage}Speed`];
  const range = def[`stage${stage}Range`];
  const damage = def[`stage${stage}Damage`];
  const colors = [0, 0xffd347, 0xf6b91f, 0xffed8a];
  const radii = [0, def.stage1Size / 2, 0.26, def.projectileRadius];
  const geometry = stage === 1
    ? new THREE.DodecahedronGeometry(def.stage1Size / 2, 0)
    : stage === 3
      ? createGoldIngotGeometry()
      : new THREE.SphereGeometry(radii[stage], 8, 6);
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color: colors[stage],
      emissive: colors[stage],
      emissiveIntensity: 0.8,
      metalness: 0.55,
      roughness: 0.25,
      side: THREE.FrontSide,
    }),
  );
  if (stage === 3) mesh.rotation.y = yaw;
  mesh.position.copy(position);
  mesh.position.y = player.position.y + 1.25;
  scene.add(mesh);
  betaProjectiles.push({
    mesh, characterId: "gold", vx: Math.sin(yaw) * speed, vz: Math.cos(yaw) * speed,
    speed, traveled: 0, returnTraveled: 0, range, damage, splash: 0,
    type: `goldStage${stage}`, hitRadius: radii[stage], hit: new Set(),
    causesKnockback: false, goldStage: stage, goldAttackId: attackId, goldYaw: yaw,
  });
}

function splitGoldProjectile(projectile) {
  canvas.dataset.lastGoldSplit = String(projectile.goldStage);
  const origin = projectile.mesh.position.clone();
  if (projectile.goldStage === 1) {
    spawnGoldProjectile(origin, projectile.goldYaw - Math.PI / 2, 2, projectile.goldAttackId);
    spawnGoldProjectile(origin, projectile.goldYaw + Math.PI / 2, 2, projectile.goldAttackId);
    createGroundPulse(BETA_CHARACTERS.gold.stage1SplashRadius, 0xffd347, origin);
  } else if (projectile.goldStage === 2) {
    for (let i = 0; i < 6; i += 1) {
      spawnGoldProjectile(origin, projectile.goldYaw + (i / 6) * Math.PI * 2, 3, projectile.goldAttackId);
    }
  }
}

function applyGoldProjectileHit(projectile, target) {
  const attackId = projectile.goldAttackId;
  const stage = projectile.goldStage;
  let targetStages = goldStageHits.get(attackId);
  if (!targetStages) {
    targetStages = new Map();
    goldStageHits.set(attackId, targetStages);
  }
  let stages = targetStages.get(target);
  if (!stages) {
    stages = new Set();
    targetStages.set(target, stages);
  }
  const hitOne = (hitTarget) => {
    let hitTargetStages = targetStages.get(hitTarget);
    if (!hitTargetStages) {
      hitTargetStages = new Set();
      targetStages.set(hitTarget, hitTargetStages);
    }
    if (hitTargetStages.has(stage)) return;
    hitTargetStages.add(stage);
    damageTarget(hitTarget, projectile.damage);
    const chargeValue = [0, 3, 2, 1][stage];
    const gained = goldAttackCharge.get(attackId) || 0;
    const awarded = Math.min(chargeValue, BETA_CHARACTERS.gold.maxChargePerAttack - gained);
    if (awarded > 0) {
      goldAttackCharge.set(attackId, gained + awarded);
      goldUltimateCharge = Math.min(BETA_CHARACTERS.gold.ultimateChargeRequired, goldUltimateCharge + awarded);
      updateCrimsonUltimateGauge();
    }
  };
  hitOne(target);
  if (stage === 1) {
    for (const other of testTargets) {
      if (!other.visible || other.userData.isAlly || other === target) continue;
      if (Math.hypot(other.position.x - target.position.x, other.position.z - target.position.z) <= BETA_CHARACTERS.gold.stage1SplashRadius) {
        hitOne(other);
      }
    }
  }
}

// 레드 일자 공격의 폭. 판정과 이펙트가 같은 값을 쓴다.
const RED_BASE_ATTACK_WIDTH = 1.7;

// X자를 이루는 두 타격의 기울기. 본 게임 레드의 이펙트 각도와 같다.
const RED_SLASH_ANGLES = [-20, 20].map((deg) => deg * (Math.PI / 180));

// 정면 length/2 지점을 중심으로 angle만큼 기울어진 직사각형 판정.
// angle이 0이면 일자, ±20도면 X자의 한 획이 된다. 이펙트와 같은 형상을 쓴다.
function collectSlashTargets(length, halfWidth, angle, found) {
  const yaw = player.rotation.y + angle;
  const forward = new THREE.Vector2(Math.sin(yaw), Math.cos(yaw));
  const lateral = new THREE.Vector2(Math.cos(yaw), -Math.sin(yaw));
  const centerX = player.position.x + Math.sin(player.rotation.y) * length * 0.5;
  const centerZ = player.position.z + Math.cos(player.rotation.y) * length * 0.5;
  for (const target of testTargets) {
    if (!target.visible || found.has(target)) continue;
    const delta = new THREE.Vector2(target.position.x - centerX, target.position.z - centerZ);
    if (Math.abs(delta.dot(forward)) > length * 0.5) continue;
    if (Math.abs(delta.dot(lateral)) > halfWidth) continue;
    found.add(target);
  }
  return found;
}

// 여러 획이 겹쳐도 한 타에 한 번만 피해를 준다
function hitSlashes(length, halfWidth, angles, damage) {
  const found = new Set();
  for (const angle of angles) collectSlashTargets(length, halfWidth, angle, found);
  for (const target of found) damageTarget(target, damage);
}

function autoAimAtNearestTarget(maxRange) {
  let nearest = null;
  let nearestDistance = maxRange;
  for (const target of testTargets) {
    if (!target.visible) continue;
    const dx = target.position.x - player.position.x;
    const dz = target.position.z - player.position.z;
    const targetDistance = Math.hypot(dx, dz);
    if (targetDistance >= nearestDistance) continue;
    nearest = target;
    nearestDistance = targetDistance;
  }
  if (!nearest) return false;
  player.rotation.y = Math.atan2(nearest.position.x - player.position.x, nearest.position.z - player.position.z);
  return true;
}

// 사정거리를 원형으로 보여줄 근접 캐릭터
const MELEE_AIM_CHARACTERS = new Set(["red", "crimson"]);

function getBetaAttackRange(id, def) {
  if (id === "red") return def.attackRange;
  if (id === "green") return def.boomerangRange;
  if (id === "blue") return def.bulletRange;
  if (id === "orange") return def.bombRange;
  if (id === "yellow") return def.electricRange;
  if (id === "cyan") return def.spreadLineRange;
  if (id === "purple") return Math.max(def.needleRange, def.vialRange);
  if (id === "pink") return def.healCircleRange;
  if (id === "gold") return def.stage1Range;
  if (id === "ivory") return def.iceCreamRange;
  if (id === "crimson") return def.attackRange;
  return 0;
}

function updateAttackAimIndicator() {
  const definition = BETA_CHARACTERS[betaState.selectedCharacter];
  const range = Math.max(0.5, getBetaAttackRange(betaState.selectedCharacter, definition));
  // 펀치 캐릭터는 방향 대신 닿는 범위를 보여주는 게 맞다
  const melee = MELEE_AIM_CHARACTERS.has(betaState.selectedCharacter);
  attackAimBeam.visible = !melee;
  attackAimRing.visible = melee;
  if (melee) {
    attackAimRing.scale.setScalar(range);
  } else {
    attackAimBeam.scale.set(0.42, range, 1);
    attackAimBeam.position.z = range / 2;
    attackAimBeam.material.color.setHex(0xffffff);
  }
  attackAimIndicator.visible = true;
  canvas.dataset.aimRange = String(range);
  canvas.dataset.aimStyle = melee ? "white-range-circle" : "white-half-transparent-behind-character";
}

function createGroundPulse(radius, color, position = player.position) {
  const pulse = new THREE.Mesh(
    new THREE.RingGeometry(Math.max(0.15, radius - 0.22), radius, 40),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false }),
  );
  pulse.rotation.x = -Math.PI / 2;
  pulse.position.copy(position);
  pulse.position.y += 0.12;
  scene.add(pulse);
  crimsonSlashes.push({ group: pulse, mesh: pulse, life: 0.38, maxLife: 0.38 });
}

// 레드처럼 정면으로 뻗는 공격용 이펙트. 원형 펄스와 달리 바라보는 방향으로
// 길게 깔린다.
function createGroundSlash(length, width, color, angle = 0) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, length),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false }),
  );
  // 오일러 순서를 YXZ로 두면 눕힌 뒤 바라보는 방향으로 그대로 돌아간다.
  // 회전 중심이 막대 한가운데라 angle을 주면 중앙에서 교차하는 X자가 된다.
  mesh.rotation.order = "YXZ";
  mesh.rotation.y = player.rotation.y + angle;
  mesh.rotation.x = Math.PI / 2;
  const forwardX = Math.sin(player.rotation.y);
  const forwardZ = Math.cos(player.rotation.y);
  mesh.position.set(
    player.position.x + forwardX * length * 0.5,
    player.position.y + 0.12,
    player.position.z + forwardZ * length * 0.5,
  );
  scene.add(mesh);
  crimsonSlashes.push({ group: mesh, mesh, life: 0.38, maxLife: 0.38 });
}

// 독병 포물선의 최고 높이. 벽을 넘길 수 있을 만큼 띄운다.
const VIAL_ARC_HEIGHT = 3.4;

// 독병이 착지해 깨질 때 — 주변 적에게 광역 피해
function breakVial(projectile) {
  const landing = projectile.mesh.position.clone();
  landing.y = 0;
  createGroundPulse(projectile.splash, 0xb13cff, landing);
  for (const target of testTargets) {
    if (!target.visible || target.userData.isAlly) continue;
    const distance = Math.hypot(target.position.x - landing.x, target.position.z - landing.z);
    if (distance <= projectile.splash) damageTarget(target, projectile.damage);
  }
}

function performCharacterAttack({ manualAim = false } = {}) {
  if (goldRushState.dead) return;
  const id = betaState.selectedCharacter;
  canvas.dataset.lastCharacterAttack = id;
  if (!generalAttackReady) return;
  const def = BETA_CHARACTERS[id];
  if (!def) return;
  if (goldRushState.ammo <= 0) {
    attackComboState.textContent = "탄약 없음";
    return;
  }
  if (!manualAim) autoAimAtNearestTarget(getBetaAttackRange(id, def));
  generalAttackReady = false;
  goldRushState.ammo -= 1;
  goldRushState.reloadTimer = Math.min(goldRushState.reloadTimer, goldRushState.reloadDuration);
  updateGoldRushCombatHud();
  crimsonAttackButton.classList.add("cooldown");
  startModelAttackMotion(id);
  attackComboState.textContent = "공격 중";
  if (id === "red") {
    const attackWidth = RED_BASE_ATTACK_WIDTH * def.attackWidthMultiplier;
    // 타격마다 기울어진 획(X자)과 가운데 일자를 함께 낸다. 획은 중앙에서
    // 교차했다가 양 끝으로 퍼진다.
    const strike = (index) => {
      const angle = RED_SLASH_ANGLES[index % RED_SLASH_ANGLES.length];
      hitSlashes(def.attackRange, attackWidth / 2, [angle, 0], def.attackDamage);
      createGroundSlash(def.attackRange, attackWidth, 0xff554b, angle);
      createGroundSlash(def.attackRange, attackWidth * 0.8, 0xffa08a, 0);
    };
    strike(0);
    for (let i = 1; i < def.attackCount; i += 1) {
      setTimeout(() => strike(i), def.attackIntervalMs * i);
    }
  } else if (id === "green") {
    def.boomerangAngles.forEach((angle) => fireBetaProjectile({ angle, speed: def.boomerangSpeed, range: def.boomerangRange, damage: def.boomerangDamage, color: 0x58ff70, radius: 0.24, type: "boomerang", returnSpeedMultiplier: def.boomerangReturnSpeedMultiplier, returnDamageMultiplier: def.boomerangReturnDamageMultiplier }));
  } else if (id === "blue") {
    fireBetaProjectile({ speed: def.bulletSpeed, range: def.bulletRange, damage: def.bulletDamage, color: 0x4f83ff, radius: 0.14 });
  } else if (id === "orange") {
    fireBetaProjectile({ speed: def.bombSpeed, range: def.bombRange, damage: def.bombDamage, color: 0xffa12c, radius: 0.32, type: "orangeFruit" });
  } else if (id === "yellow") {
    fireBetaProjectile({ speed: def.electricSpeed, range: def.electricRange, damage: def.electricDamage, color: 0xffff45, radius: 0.25, type: "electric" });
  } else if (id === "cyan") {
    const burstYaw = player.rotation.y;
    for (let i = 0; i < def.spreadLineCount; i += 1) {
      const lateralOffset = (i - (def.spreadLineCount - 1) / 2) * 0.45;
      fireBetaProjectile({ yawOverride: burstYaw, lateralOffset, speed: def.spreadLineSpeed, range: def.spreadLineRange, damage: def.spreadLineDamage, color: 0x32f4ff, radius: 0.13, type: "cyanShot", causesKnockback: false });
    }
  } else if (id === "purple") {
    const vial = purpleAttackIndex++ % 2 === 1;
    if (vial) {
      fireBetaProjectile({ speed: def.vialSpeed, range: def.vialRange, damage: def.vialDamage, color: 0xc04cff, radius: 0.3, splash: def.vialSplashRadius, type: "vial" });
    } else {
      for (let i = 0; i < def.needleCount; i += 1) {
        const angle = def.needleRadial
          ? (i / def.needleCount) * Math.PI * 2
          : def.needleCount > 1
            ? -def.needleSpreadAngle / 2 + i * (def.needleSpreadAngle / (def.needleCount - 1))
            : 0;
        fireBetaProjectile({ angle, speed: def.needleSpeed, range: def.needleRange, damage: def.needleDamage, color: 0x8a25c7, radius: 0.11, type: "needle" });
      }
    }
    attackComboState.textContent = vial ? "독 약병" : "독침";
  } else if (id === "pink") {
    pinkUltimateCharge = Math.min(def.ultimate.chargeRequired, pinkUltimateCharge + 1);
    updateCrimsonUltimateGauge();
    createGroundPulse(def.healCircleRange, 0xff9fcf);
    for (const target of testTargets) {
      const distance = Math.hypot(target.position.x - player.position.x, target.position.z - player.position.z);
      if (target.visible && distance <= def.healCircleRange) {
        if (target.userData.isAlly) {
          target.userData.health = Math.min(target.userData.maxHealth, target.userData.health + def.healCircleHeal);
        } else {
          damageTarget(target, def.healCircleDamage);
        }
      }
    }
  } else if (id === "gold") {
    const attackId = ++goldAttackSequence;
    goldAttackCharge.set(attackId, 0);
    goldStageHits.set(attackId, new Map());
    spawnGoldProjectile(player.position, player.rotation.y, 1, attackId);
    attackComboState.textContent = "금광석 1단계";
  } else if (id === "ivory") {
    const targetX = player.position.x + Math.sin(player.rotation.y) * def.iceCreamRange;
    const targetZ = player.position.z + Math.cos(player.rotation.y) * def.iceCreamRange;
    fireIvoryIceCream(targetX, targetZ);
    attackComboState.textContent = "아이스크림 배달 중";
  } else if (id === "crimson") {
    CRIMSON.attackAngles.forEach((_, hitIndex) => setTimeout(() => createCrimsonSlash(hitIndex), hitIndex * CRIMSON.attackIntervalMs));
  }
  setTimeout(() => {
    generalAttackReady = true;
    crimsonAttackButton.classList.remove("cooldown");
    attackComboState.textContent = "준비";
  }, Math.max(200, def.attackCooldown * 1000));
}

function flashTarget(target) {
  const material = target.userData.mesh?.material;
  if (material?.emissive) {
    const previous = material.emissive.getHex();
    material.emissive.setHex(0xff4030);
    setTimeout(() => material.emissive.setHex(previous), 110);
  }
  // 맞는 순간 살짝 움츠렸다 돌아오게 해서 반응을 눈에 띄게 한다
  const baseScale = target.userData.baseScale ?? 1;
  target.scale.setScalar(baseScale * 1.16);
  setTimeout(() => target.scale.setScalar(baseScale), 90);
}

function hitTargetsInFan(angleOffset, damage) {
  const facing = player.rotation.y + angleOffset;
  const forward = new THREE.Vector2(Math.sin(facing), Math.cos(facing));
  for (const target of testTargets) {
    if (!target.visible) continue;
    const delta = new THREE.Vector2(target.position.x - player.position.x, target.position.z - player.position.z);
    const distanceToTarget = delta.length();
    if (distanceToTarget > CRIMSON.attackRange || distanceToTarget < 0.01) continue;
    if (forward.dot(delta.normalize()) < Math.cos(CRIMSON.attackHalfAngle)) continue;
    target.userData.health -= damage;
    crimsonUltimateCharge = Math.min(CRIMSON.ultimateChargeRequired, crimsonUltimateCharge + 1);
    updateCrimsonUltimateGauge();
    createHitImpact(target.position);
    createRedThemeHitEffect(target.position);
    flashTarget(target);
    if (target.userData.health <= 0) target.visible = false;
  }
}

function createCrimsonSlash(hitIndex) {
  const hitDamage = CRIMSON.attackDamages?.[hitIndex] ?? CRIMSON.attackDamage;
  const halfAngle = CRIMSON.attackHalfAngle;
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  for (let i = 0; i <= 18; i += 1) {
    const angle = -halfAngle + (i / 18) * halfAngle * 2;
    shape.lineTo(Math.sin(angle) * CRIMSON.attackRange, Math.cos(angle) * CRIMSON.attackRange);
  }
  shape.lineTo(0, 0);
  const activeSkin = getActiveRedThemeSkin();
  const material = new THREE.MeshBasicMaterial({
    color: activeSkin === "beta_red_crimson" ? [0x7d0018, 0xb30024, 0xff274c][hitIndex] : [0xff5d68, 0xff7a67, 0xffb15f][hitIndex],
    transparent: true,
    opacity: 0.72,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: false,
  });
  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
  mesh.rotation.x = Math.PI / 2;
  mesh.rotation.z = CRIMSON.attackAngles[hitIndex];
  const group = new THREE.Group();
  group.position.copy(player.position);
  group.position.y += 0.22;
  group.rotation.y = player.rotation.y;
  group.add(mesh);
  scene.add(group);
  mesh.renderOrder = 20;
  crimsonSlashes.push({ group, mesh, life: 0.65, maxLife: 0.65 });
  hitTargetsInFan(CRIMSON.attackAngles[hitIndex], hitDamage);
  attackComboState.textContent = `${hitIndex + 1}/${CRIMSON.attackCount} · ${hitDamage} 피해`;
}

crimsonAttackButton.addEventListener("click", performCharacterAttack);

let crimsonUltimateCharge = 0;
let cyanUltimateCharge = 0;
let ivoryUltimateCharge = 0;

function updateCrimsonUltimateGauge() {
  const id = betaState.selectedCharacter;
  const configs = {
    ivory: { charge: ivoryUltimateCharge, required: BETA_CHARACTERS.ivory.ultimate.chargeRequired, name: "단체 주문", color: "#dff8ff" },
    cyan: { charge: cyanUltimateCharge, required: BETA_CHARACTERS.cyan.ultimate.chargeRequired, name: BETA_CHARACTERS.cyan.ultimate.name, color: "#0ff0fe" },
    crimson: { charge: crimsonUltimateCharge, required: CRIMSON.ultimateChargeRequired, name: BETA_CHARACTERS.crimson.ultimate.name, color: "#a00000" },
    pink: { charge: pinkUltimateCharge, required: BETA_CHARACTERS.pink.ultimate.chargeRequired, name: "앙코르!", color: "#ff79b8" },
    gold: { charge: goldUltimateCharge, required: BETA_CHARACTERS.gold.ultimateChargeRequired, name: "고장 지대", color: "#e2ad20" },
  };
  const config = configs[id] || configs.crimson;
  const { charge, required } = config;
  const ready = charge >= required;
  const chargeRatio = Math.min(1, charge / required);
  ultimateButton.style.setProperty("--ultimate-color", config.color);
  ultimateButton.style.setProperty("--charge-angle", `${chargeRatio * 360}deg`);
  ultimateButton.classList.toggle("ready", ready);
  ultimateButton.setAttribute("aria-valuenow", String(charge));
  ultimateButton.setAttribute("aria-valuemax", String(required));
  ultimateButton.setAttribute("aria-label", `${id} 궁극기 ${config.name}`);
  ultimateButton.title = ready ? `Space 또는 Q · ${config.name} 사용 가능` : `궁극기 ${charge}/${required}`;
  ultimateState.textContent = ready ? "READY" : `${Math.round(chargeRatio * 100)}%`;
}

function performPinkEncore() {
  const def = BETA_CHARACTERS.pink.ultimate;
  let revived = 0;
  createGroundPulse(def.radius, 0xff79b8);
  for (const target of testTargets) {
    if (!target.userData.isAlly || target.visible) continue;
    if (Math.hypot(target.position.x - player.position.x, target.position.z - player.position.z) > def.radius) continue;
    target.visible = true;
    target.userData.health = target.userData.maxHealth * def.reviveHealthRatio;
    target.userData.invulnerableUntil = clock.elapsedTime + def.invulnerabilityDuration;
    createGroundPulse(1.1, 0xffb3d7, target.position);
    revived += 1;
  }
  attackComboState.textContent = revived ? `앙코르! · ${revived}명 부활` : "부활 대상 없음";
}

function performGoldUltimate() {
  const def = BETA_CHARACTERS.gold.ultimate;
  setTimeout(() => {
    const centerX = player.position.x;
    const centerZ = player.position.z;
    const centerGround = groundHeightAt(centerX, centerZ);
    const center = new THREE.Vector3(centerX, centerGround > -5 ? centerGround + 0.08 : 0.08, centerZ);
    const mesh = new THREE.Mesh(
      new THREE.CircleGeometry(def.radius, 48),
      new THREE.MeshBasicMaterial({ color: 0xd9a51f, transparent: true, opacity: 0.34, side: THREE.DoubleSide, depthWrite: false }),
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.copy(center);
    scene.add(mesh);
    malfunctionZones.push({
      mesh, x: center.x, z: center.z, radius: def.radius,
      expiresAt: clock.elapsedTime + def.duration,
      followsPlayer: def.followsCaster,
    });
    canvas.dataset.lastMalfunctionZone = `${center.x.toFixed(2)},${center.y.toFixed(2)},${center.z.toFixed(2)}`;
    attackComboState.textContent = "고장 지대 설치";
  }, def.delay * 1000);
}

function performIvoryUltimate() {
  const def = BETA_CHARACTERS.ivory;
  const yaw = player.rotation.y;
  const centerX = player.position.x + Math.sin(yaw) * def.ultimate.castRange;
  const centerZ = player.position.z + Math.cos(yaw) * def.ultimate.castRange;
  const r = def.ultimate.patternRadius;
  for (const [offsetX, offsetZ] of [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r]]) {
    fireIvoryIceCream(centerX + offsetX, centerZ + offsetZ, true);
  }
  attackComboState.textContent = "단체 주문 5개 배달 중";
  canvas.dataset.lastUltimate = "ivory-group-order:5";
}

function performCyanUltimate() {
  const def = BETA_CHARACTERS.cyan.ultimate;
  autoAimAtNearestTarget(def.range);
  const yaw = player.rotation.y;
  const projectileSpeed = BETA_CHARACTERS.cyan.spreadLineSpeed * def.speedMultiplier;
  const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  const sideways = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
  const wind = new THREE.Mesh(
    new THREE.PlaneGeometry(def.range, 2.8),
    new THREE.MeshBasicMaterial({
      map: galeStrikeTexture, color: 0xc8ffff, transparent: true, opacity: 1, alphaTest: 0.015,
      depthWrite: false, depthTest: false, toneMapped: false,
      blending: THREE.NormalBlending, side: THREE.DoubleSide,
    }),
  );
  wind.quaternion.setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(sideways, forward, new THREE.Vector3(0, -1, 0)),
  );
  wind.renderOrder = 30;
  wind.position.set(player.position.x + Math.sin(yaw), player.position.y + 1.35, player.position.z + Math.cos(yaw));
  scene.add(wind);
  betaProjectiles.push({
    mesh: wind, characterId: "cyan", vx: Math.sin(yaw) * projectileSpeed, vz: Math.cos(yaw) * projectileSpeed,
    speed: projectileSpeed, traveled: 0, returnTraveled: 0, range: def.range, damage: def.damage,
    splash: 0, type: "cyanUltimate", hitRadius: def.projectileRadius, hit: new Set(), knockback: def.knockback,
  });
}

ultimateButton.addEventListener("click", () => {
  if (goldRushState.dead) return;
  if (betaState.selectedCharacter === "ivory") {
    if (ivoryUltimateCharge < BETA_CHARACTERS.ivory.ultimate.chargeRequired) return;
    ivoryUltimateCharge = 0;
    updateCrimsonUltimateGauge();
    performIvoryUltimate();
    return;
  }
  if (betaState.selectedCharacter === "gold") {
    if (goldUltimateCharge < BETA_CHARACTERS.gold.ultimateChargeRequired) return;
    goldUltimateCharge = 0;
    updateCrimsonUltimateGauge();
    performGoldUltimate();
    return;
  }
  if (betaState.selectedCharacter === "pink") {
    if (pinkUltimateCharge < BETA_CHARACTERS.pink.ultimate.chargeRequired) return;
    pinkUltimateCharge = 0;
    updateCrimsonUltimateGauge();
    performPinkEncore();
    return;
  }
  if (betaState.selectedCharacter === "cyan") {
    const required = BETA_CHARACTERS.cyan.ultimate.chargeRequired;
    if (cyanUltimateCharge < required) return;
    cyanUltimateCharge = 0;
    updateCrimsonUltimateGauge();
    performCyanUltimate();
    return;
  }
  if (betaState.selectedCharacter !== "crimson" || crimsonUltimateCharge < CRIMSON.ultimateChargeRequired) return;
  crimsonUltimateCharge = 0;
  updateCrimsonUltimateGauge();
  const forward = new THREE.Vector2(Math.sin(player.rotation.y), Math.cos(player.rotation.y));
  const right = new THREE.Vector2(forward.y, -forward.x);
  const wave = new THREE.Mesh(
    new THREE.PlaneGeometry(CRIMSON.ultimateWidth, CRIMSON.ultimateLength),
    new THREE.MeshBasicMaterial({ color: 0xff5a45, side: THREE.DoubleSide, transparent: true, opacity: .72, depthWrite: false }),
  );
  wave.rotation.x = -Math.PI / 2;
  wave.rotation.z = -player.rotation.y;
  const ultimateHalfLength = CRIMSON.ultimateLength * 0.5;
  const ultimateHalfWidth = CRIMSON.ultimateWidth * 0.5;
  wave.position.set(player.position.x + forward.x * ultimateHalfLength, player.position.y + 0.22, player.position.z + forward.y * ultimateHalfLength);
  scene.add(wave);

  let destroyedWalls = 0;
  let hitTargets = 0;
  for (let i = solids.length - 1; i >= 0; i -= 1) {
    const solid = solids[i];
    if (!solid.destructible) continue;
    const delta = new THREE.Vector2(solid.x - player.position.x, solid.z - player.position.z);
    const forwardDistance = forward.dot(delta);
    const sideDistance = Math.abs(right.dot(delta));
    if (forwardDistance >= 0 && forwardDistance <= CRIMSON.ultimateLength && sideDistance <= ultimateHalfWidth) {
      map.remove(solid.mesh);
      solid.mesh.geometry.dispose();
      solids.splice(i, 1);
      destroyedWalls += 1;
    }
  }
  for (const target of testTargets) {
    if (!target.visible) continue;
    const delta = new THREE.Vector2(target.position.x - player.position.x, target.position.z - player.position.z);
    const forwardDistance = forward.dot(delta);
    const sideDistance = Math.abs(right.dot(delta));
    if (forwardDistance < 0 || forwardDistance > CRIMSON.ultimateLength || sideDistance > ultimateHalfWidth) continue;
    target.userData.health -= CRIMSON.ultimateDamage;
    target.position.x += forward.x * CRIMSON.ultimateKnockback;
    target.position.z += forward.y * CRIMSON.ultimateKnockback;
    flashTarget(target);
    hitTargets += 1;
    if (target.userData.health <= 0) target.visible = false;
  }
  canvas.dataset.lastUltimate = `walls:${destroyedWalls},targets:${hitTargets},damage:${CRIMSON.ultimateDamage},knockback:${CRIMSON.ultimateKnockback}`;
  const started = clock.elapsedTime;
  function expandWave() {
    const elapsed = clock.elapsedTime - started;
    wave.scale.y = 0.25 + Math.min(1, elapsed * 5) * 0.75;
    wave.material.opacity = Math.max(0, .72 - elapsed * 1.4);
    if (elapsed < 0.52) requestAnimationFrame(expandWave);
    else { scene.remove(wave); wave.geometry.dispose(); wave.material.dispose(); }
  }
  expandWave();
});
bodyMat.color.setHex(CHARACTERS.find((item) => item.id === betaState.selectedCharacter)?.color ?? 0xef3c58);
setPlayerModel(betaState.selectedCharacter);
applySelectedSkinVisual();
updateCrimsonControls();
updateAttackAimIndicator();
updateWallet();

const keys = new Set();
let yaw = Math.PI;
let pitch = 0.72;
let distance = 14;
let overview = false;
let dragging = false;
let lastPointerX = 0;
let lastPointerY = 0;
let pointerTravel = 0;
let manualAimActive = false;
// 좌클릭은 공격, 누른 채 0.5초를 넘기면 수동 에임으로 넘어간다
const AIM_HOLD_SECONDS = 0.5;
let pointerHoldTimer = null;
let holdAiming = false;
const manualAimRaycaster = new THREE.Raycaster();
const manualAimPointer = new THREE.Vector2();
const manualAimPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const manualAimPoint = new THREE.Vector3();
const initialSpawnPoint = new THREE.Vector3(0, 1.7, 0);
const goldPickups = [];
const goldRushBots = [];
const goldRushAttackEffects = [];
const GOLD_RUSH_BOT_COLORS = [0xef4d5b, 0x4c78ff, 0x45d66e, 0xf39b35, 0xf4de42, 0x43d9e7, 0x9658dc, 0xf28fbd, 0xa33131];
const goldRushState = {
  active: false, ended: false, gold: 0, startedAt: 0, nextSpawnAt: 0,
  winCountdownStartedAt: null, dead: false, respawnAt: 0, invulnerableUntil: 0,
  mineGoldAvailable: true, mineGoldRespawnAt: 0, health: 1, maxHealth: 1,
  ammo: 3, maxAmmo: 3, reloadTimer: 0, reloadDuration: 0.5,
};

function createGoldRushHealthBar(height = 3.15) {
  const group = new THREE.Group();
  group.position.y = height;
  const backgroundMaterial = new THREE.MeshBasicMaterial({ color: 0x2d1a11, transparent: true, opacity: 0.88 });
  const fillMaterial = new THREE.MeshBasicMaterial({ color: 0xff8455 });
  const background = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 0.16), backgroundMaterial);
  const fill = new THREE.Mesh(new THREE.PlaneGeometry(1.31, 0.1), fillMaterial);
  background.renderOrder = 30;
  fill.position.z = 0.001;
  fill.renderOrder = 31;
  group.add(background, fill);
  group.userData.fill = fill;
  group.userData.materials = [backgroundMaterial, fillMaterial];
  group.userData.geometries = [background.geometry, fill.geometry];
  return group;
}

function updateGoldRushHealthBar(bar, health, maxHealth) {
  const ratio = THREE.MathUtils.clamp(health / Math.max(1, maxHealth), 0, 1);
  const fill = bar.userData.fill;
  fill.scale.x = ratio;
  fill.position.x = (-1.31 * (1 - ratio)) * 0.5;
}

const playerGoldRushHealthBar = createGoldRushHealthBar(3.2);
playerGoldRushHealthBar.visible = false;
player.add(playerGoldRushHealthBar);
const healthBarParentQuaternion = new THREE.Quaternion();

function faceGoldRushHealthBarToCamera(bar) {
  bar.parent.getWorldQuaternion(healthBarParentQuaternion);
  bar.quaternion.copy(healthBarParentQuaternion.invert().multiply(camera.quaternion));
}

const goldMine = new THREE.Group();
const goldMineBase = new THREE.Mesh(
  new THREE.CylinderGeometry(2.2, 2.7, 0.5, 12),
  new THREE.MeshStandardMaterial({ color: 0x735617, metalness: 0.45, roughness: 0.5 }),
);
goldMineBase.position.y = 0.25;
goldMine.add(goldMineBase);
const goldMineCrystal = new THREE.Mesh(
  new THREE.OctahedronGeometry(1.05, 0),
  new THREE.MeshStandardMaterial({ color: 0xffd33d, emissive: 0x7b4c00, emissiveIntensity: 1.2, metalness: 0.7, roughness: 0.18 }),
);
goldMineCrystal.position.y = 1.3;
goldMine.add(goldMineCrystal);
goldMine.position.y = 1.5;
goldMine.visible = false;
scene.add(goldMine);

function clearGoldRushBots() {
  for (const bot of goldRushBots) {
    scene.remove(bot.mesh);
    const targetIndex = testTargets.indexOf(bot.mesh);
    if (targetIndex >= 0) testTargets.splice(targetIndex, 1);
    bot.mixer?.stopAllAction();
    for (const material of bot.healthBar?.userData.materials || []) material.dispose();
    for (const geometry of bot.healthBar?.userData.geometries || []) geometry.dispose();
    for (const disposable of bot.disposableMeshes || []) {
      disposable.geometry.dispose();
      disposable.material.dispose();
    }
  }
  goldRushBots.length = 0;
  for (const effect of goldRushAttackEffects.splice(0)) {
    scene.remove(effect.line);
    effect.line.geometry.dispose();
    effect.line.material.dispose();
  }
}

function createGoldRushBotAvatar(index) {
  const group = new THREE.Group();
  const disposableMeshes = [];
  let mixer = null;
  let usesPlayerModel = false;
  const playerLoopScene = activeCharacterMotion?.scenes.loop;
  const playerLoopClip = activeCharacterMotion?.actions.loop?.getClip();

  if (playerLoopScene && playerLoopClip) {
    const avatar = skeletonClone(playerLoopScene);
    avatar.visible = true;
    avatar.traverse((part) => {
      if (!part.isMesh) return;
      part.castShadow = true;
      part.receiveShadow = true;
    });
    group.add(avatar);
    mixer = new THREE.AnimationMixer(avatar);
    const action = mixer.clipAction(playerLoopClip);
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.play();
    usesPlayerModel = true;
  } else {
    const material = new THREE.MeshStandardMaterial({ color: GOLD_RUSH_BOT_COLORS[index], roughness: 0.58 });
    const fallbackBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.8, 4, 8), material);
    fallbackBody.position.y = 0.86;
    fallbackBody.castShadow = true;
    group.add(fallbackBody);
    disposableMeshes.push(fallbackBody);
  }

  const marker = new THREE.Mesh(
    new THREE.TorusGeometry(0.58, 0.06, 5, 20),
    new THREE.MeshBasicMaterial({ color: GOLD_RUSH_BOT_COLORS[index], transparent: true, opacity: 0.9 }),
  );
  marker.rotation.x = Math.PI / 2;
  marker.position.y = usesPlayerModel ? 3.05 : 1.8;
  group.add(marker);
  disposableMeshes.push(marker);
  const healthBar = createGoldRushHealthBar(usesPlayerModel ? 3.25 : 2.05);
  group.add(healthBar);
  return { group, marker, healthBar, mixer, disposableMeshes, usesPlayerModel };
}

function createGoldRushBots() {
  clearGoldRushBots();
  let playerModelCount = 0;
  for (let i = 0; i < 9; i += 1) {
    const avatar = createGoldRushBotAvatar(i);
    const mesh = avatar.group;
    if (avatar.usesPlayerModel) playerModelCount += 1;
    const angle = (i / 9) * Math.PI * 2;
    const spawn = new THREE.Vector3(Math.sin(angle) * 9, 0, Math.cos(angle) * 9);
    const ground = groundHeightAt(spawn.x, spawn.z);
    spawn.y = ground > -5 ? ground + 0.05 : 1.55;
    mesh.position.copy(spawn);
    scene.add(mesh);
    const maxHealth = BETA_CHARACTERS[betaState.selectedCharacter]?.maxHealth || 6000;
    const maxAmmo = BETA_CHARACTERS[betaState.selectedCharacter]?.maxAmmo || 3;
    const bot = {
      id: i + 1,
      name: `AI ${i + 1}`,
      mesh,
      marker: avatar.marker,
      healthBar: avatar.healthBar,
      mixer: avatar.mixer,
      disposableMeshes: avatar.disposableMeshes,
      usesPlayerModel: avatar.usesPlayerModel,
      spawn,
      gold: 0,
      health: maxHealth,
      maxHealth,
      dead: false,
      respawnAt: 0,
      invulnerableUntil: clock.elapsedTime + 2,
      nextAttackAt: clock.elapsedTime + 0.7 + Math.random() * 0.8,
      attackDamage: 750 + (i % 3) * 125,
      ammo: maxAmmo,
      maxAmmo,
      reloadTimer: 0,
      reloadDuration: BETA_CHARACTERS[betaState.selectedCharacter]?.reloadDuration || 0.5,
      speed: 3.8 + (i % 4) * 0.3,
      winCountdownStartedAt: null,
    };
    mesh.userData.goldRushBot = bot;
    mesh.userData.health = bot.health;
    mesh.userData.maxHealth = bot.maxHealth;
    testTargets.push(mesh);
    updateGoldRushHealthBar(bot.healthBar, bot.health, bot.maxHealth);
    goldRushBots.push(bot);
  }
  canvas.dataset.goldRushBotCount = String(goldRushBots.length);
  canvas.dataset.goldRushPlayerModelBots = String(playerModelCount);
}

function dropGoldRushGold(owner, position) {
  const droppedCount = owner.gold;
  for (let i = 0; i < owner.gold; i += 1) {
    const offset = new THREE.Vector3((Math.random() - 0.5) * 2.5, 0.65, (Math.random() - 0.5) * 2.5);
    spawnGoldPickup(position.clone().add(offset), true);
  }
  owner.gold = 0;
  owner.winCountdownStartedAt = null;
  canvas.dataset.lastGoldRushDroppedGold = String(droppedCount);
  canvas.dataset.goldRushDroppedGoldTotal = String(
    Number(canvas.dataset.goldRushDroppedGoldTotal || 0) + droppedCount,
  );
}

function damageGoldRushBot(bot, damage) {
  if (!goldRushState.active || goldRushState.ended || bot.dead || clock.elapsedTime < bot.invulnerableUntil) return;
  bot.health = Math.max(0, bot.health - damage);
  bot.mesh.userData.health = bot.health;
  createDamagePopup(bot.mesh.position, damage);
  createHitImpact(bot.mesh.position);
  updateGoldRushHealthBar(bot.healthBar, bot.health, bot.maxHealth);
  bot.marker.material.color.setHex(0xffffff);
  setTimeout(() => {
    if (!bot.dead) bot.marker.material.color.setHex(GOLD_RUSH_BOT_COLORS[bot.id - 1]);
  }, 90);
  if (bot.health > 0) return;
  dropGoldRushGold(bot, bot.mesh.position);
  bot.dead = true;
  bot.respawnAt = clock.elapsedTime + 5;
  bot.mesh.visible = false;
  canvas.dataset.lastGoldRushDeath = `ai-${bot.id}`;
}

function damageGoldRushPlayer(damage) {
  if (goldRushState.dead || clock.elapsedTime < goldRushState.invulnerableUntil) return;
  goldRushState.health = Math.max(0, goldRushState.health - damage);
  updateGoldRushHealthBar(playerGoldRushHealthBar, goldRushState.health, goldRushState.maxHealth);
  canvas.dataset.playerGoldRushHealth = String(Math.ceil(goldRushState.health));
  if (goldRushState.health <= 0) killGoldRushPlayer();
}

function createGoldRushAttackEffect(from, to, color) {
  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(from.x, from.y + 1.35, from.z),
    new THREE.Vector3(to.x, to.y + 1.35, to.z),
  ]);
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.95 });
  const line = new THREE.Line(geometry, material);
  scene.add(line);
  goldRushAttackEffects.push({ line, life: 0.18, maxLife: 0.18 });
}

function updateGoldRushAttackEffects(dt) {
  for (let i = goldRushAttackEffects.length - 1; i >= 0; i -= 1) {
    const effect = goldRushAttackEffects[i];
    effect.life -= dt;
    effect.line.material.opacity = Math.max(0, effect.life / effect.maxLife);
    if (effect.life > 0) continue;
    scene.remove(effect.line);
    effect.line.geometry.dispose();
    effect.line.material.dispose();
    goldRushAttackEffects.splice(i, 1);
  }
}

function spawnGoldPickup(position = null, dropped = false) {
  const naturalCount = goldPickups.filter((pickup) => !pickup.dropped).length;
  if (!dropped && naturalCount >= 20) return;
  const angle = Math.random() * Math.PI * 2;
  const radius = 2.8 + Math.random() * 2.4;
  const mesh = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.34, 0),
    new THREE.MeshStandardMaterial({ color: 0xffd33d, emissive: 0x8b5900, emissiveIntensity: 1.3, metalness: 0.65, roughness: 0.2 }),
  );
  mesh.position.copy(position || new THREE.Vector3(Math.sin(angle) * radius, 0, Math.cos(angle) * radius));
  const pickupGround = groundHeightAt(mesh.position.x, mesh.position.z);
  mesh.position.y = pickupGround > -5 ? pickupGround + 0.45 : 0.65;
  scene.add(mesh);
  goldPickups.push({ mesh, dropped });
  canvas.dataset.goldPickupCount = String(goldPickups.length);
  canvas.dataset.lastGoldPickup = `${mesh.position.x.toFixed(2)},${mesh.position.y.toFixed(2)},${mesh.position.z.toFixed(2)}`;
}

function removeGoldPickup(index) {
  const [pickup] = goldPickups.splice(index, 1);
  if (!pickup) return;
  pickup.mesh.visible = false;
  scene.remove(pickup.mesh);
  pickup.mesh.geometry.dispose();
  pickup.mesh.material.dispose();
  canvas.dataset.goldPickupCount = String(goldPickups.length);
}

function updateGoldRushBots(dt) {
  updateGoldRushAttackEffects(dt);
  for (const bot of goldRushBots) {
    if (bot.dead) {
      if (clock.elapsedTime < bot.respawnAt) continue;
      bot.dead = false;
      bot.health = bot.maxHealth;
      bot.mesh.userData.health = bot.health;
      bot.mesh.userData.maxHealth = bot.maxHealth;
      bot.mesh.position.copy(bot.spawn);
      bot.mesh.visible = true;
      bot.invulnerableUntil = clock.elapsedTime + 2;
      bot.nextAttackAt = clock.elapsedTime + 0.8;
      bot.ammo = bot.maxAmmo;
      bot.reloadTimer = 0;
      updateGoldRushHealthBar(bot.healthBar, bot.health, bot.maxHealth);
    }
    if (bot.ammo >= bot.maxAmmo) {
      bot.reloadTimer = 0;
    } else if (clock.elapsedTime >= bot.nextAttackAt) {
      bot.reloadTimer += dt;
      while (bot.reloadTimer >= bot.reloadDuration && bot.ammo < bot.maxAmmo) {
        bot.reloadTimer -= bot.reloadDuration;
        bot.ammo += 1;
      }
    }
    faceGoldRushHealthBarToCamera(bot.healthBar);
    let targetX = goldMine.position.x;
    let targetZ = goldMine.position.z;
    let nearestDistance = Infinity;
    for (const pickup of goldPickups) {
      const distance = Math.hypot(pickup.mesh.position.x - bot.mesh.position.x, pickup.mesh.position.z - bot.mesh.position.z);
      if (distance >= nearestDistance) continue;
      nearestDistance = distance;
      targetX = pickup.mesh.position.x;
      targetZ = pickup.mesh.position.z;
    }
    const dx = targetX - bot.mesh.position.x;
    const dz = targetZ - bot.mesh.position.z;
    const distance = Math.hypot(dx, dz);
    if (distance > 0.05) {
      const step = Math.min(distance, bot.speed * dt);
      bot.mesh.position.x += (dx / distance) * step;
      bot.mesh.position.z += (dz / distance) * step;
      bot.mesh.rotation.y = Math.atan2(dx, dz);
      const ground = groundHeightAt(bot.mesh.position.x, bot.mesh.position.z);
      if (ground > -5) bot.mesh.position.y = THREE.MathUtils.damp(bot.mesh.position.y, ground + 0.05, 12, dt);
    }
    bot.mixer?.update(dt);
    bot.marker.rotation.z += dt * 2.4;

    const combatCandidates = [];
    if (!goldRushState.dead) {
      const playerDistance = Math.hypot(player.position.x - bot.mesh.position.x, player.position.z - bot.mesh.position.z);
      if (playerDistance < 18) combatCandidates.push(goldRushState);
    }
    for (const other of goldRushBots) {
      if (other === bot || other.dead) continue;
      const otherDistance = Math.hypot(other.mesh.position.x - bot.mesh.position.x, other.mesh.position.z - bot.mesh.position.z);
      if (otherDistance < 18) combatCandidates.push(other);
    }
    const combatTarget = combatCandidates.length
      ? combatCandidates[(bot.id + Math.floor(clock.elapsedTime * 1.7)) % combatCandidates.length]
      : null;
    if (combatTarget && bot.ammo > 0 && clock.elapsedTime >= bot.nextAttackAt) {
      const targetPosition = combatTarget === goldRushState ? player.position : combatTarget.mesh.position;
      bot.mesh.rotation.y = Math.atan2(targetPosition.x - bot.mesh.position.x, targetPosition.z - bot.mesh.position.z);
      createGoldRushAttackEffect(bot.mesh.position, targetPosition, GOLD_RUSH_BOT_COLORS[bot.id - 1]);
      if (combatTarget === goldRushState) damageGoldRushPlayer(bot.attackDamage);
      else damageGoldRushBot(combatTarget, bot.attackDamage);
      bot.ammo -= 1;
      bot.nextAttackAt = clock.elapsedTime + 0.85 + Math.random() * 0.55;
    }
  }
  canvas.dataset.goldRushDamagedBots = String(goldRushBots.filter((bot) => !bot.dead && bot.health < bot.maxHealth).length);
  canvas.dataset.goldRushDeadBots = String(goldRushBots.filter((bot) => bot.dead).length);
}

function renderGoldRushAmmoFan(count) {
  goldRushAmmoFan.replaceChildren();
  const spread = 50;
  const step = count > 1 ? spread / (count - 1) : 0;
  for (let i = 0; i < count; i += 1) {
    const segment = document.createElement("div");
    segment.className = "gold-rush-ammo-segment filled";
    segment.style.transform = `rotate(${count > 1 ? -spread / 2 + i * step : 0}deg)`;
    goldRushAmmoFan.appendChild(segment);
  }
}

function updateGoldRushCombatHud() {
  const healthRatio = THREE.MathUtils.clamp(goldRushState.health / Math.max(1, goldRushState.maxHealth), 0, 1);
  goldRushHealthFill.style.width = `${healthRatio * 100}%`;
  goldRushHealthValue.textContent = String(Math.ceil(goldRushState.health));
  goldRushHealthEl.textContent = `${Math.ceil(goldRushState.health)} / ${goldRushState.maxHealth}`;
  const reloadProgress = goldRushState.ammo >= goldRushState.maxAmmo
    ? 1
    : THREE.MathUtils.clamp(goldRushState.reloadTimer / goldRushState.reloadDuration, 0, 1);
  goldRushReloadBar.style.width = `${reloadProgress * 100}%`;
  goldRushReloadBar.dataset.state = goldRushState.ammo >= goldRushState.maxAmmo ? "full" : "reloading";
  goldRushReloadState.textContent = goldRushState.ammo >= goldRushState.maxAmmo
    ? "탄약 가득"
    : `다음 탄약 ${(goldRushState.reloadDuration - goldRushState.reloadTimer).toFixed(1)}초`;
  [...goldRushAmmoFan.children].forEach((segment, index) => {
    segment.classList.toggle("filled", index < goldRushState.ammo);
  });
  canvas.dataset.goldRushAmmo = `${goldRushState.ammo}/${goldRushState.maxAmmo}`;
  canvas.dataset.playerHealth = `${Math.ceil(goldRushState.health)}/${goldRushState.maxHealth}`;
}

function resetTestCombatHud() {
  if (goldRushState.active && !goldRushState.ended) return;
  const def = BETA_CHARACTERS[betaState.selectedCharacter];
  goldRushState.maxHealth = def?.maxHealth || 6000;
  goldRushState.health = goldRushState.maxHealth;
  goldRushState.maxAmmo = def?.maxAmmo || 3;
  goldRushState.ammo = goldRushState.maxAmmo;
  goldRushState.reloadTimer = 0;
  goldRushState.reloadDuration = def?.reloadDuration || 0.5;
  goldRushPlayerPanel.classList.remove("hidden");
  renderGoldRushAmmoFan(goldRushState.maxAmmo);
  updateGoldRushCombatHud();
}

function updateTestCombatHud(dt) {
  if (goldRushState.active && !goldRushState.ended) return;
  if (goldRushState.ammo < goldRushState.maxAmmo) {
    goldRushState.reloadTimer += dt;
    while (goldRushState.reloadTimer >= goldRushState.reloadDuration && goldRushState.ammo < goldRushState.maxAmmo) {
      goldRushState.reloadTimer -= goldRushState.reloadDuration;
      goldRushState.ammo += 1;
    }
  } else {
    goldRushState.reloadTimer = 0;
  }
  updateGoldRushCombatHud();
}

function updateGoldRushHud() {
  goldCountEl.textContent = String(goldRushState.gold);
  updateGoldRushCombatHud();
  const elapsed = Math.max(0, clock.elapsedTime - goldRushState.startedAt);
  const remaining = Math.max(0, 180 - elapsed);
  const remainingSeconds = Math.ceil(remaining);
  goldRushTimerEl.textContent = `${String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:${String(remainingSeconds % 60).padStart(2, "0")}`;
  const leader = goldRushBots.reduce((best, bot) => (!best || bot.gold > best.gold ? bot : best), null);
  goldRushRivalsEl.textContent = leader ? `선두 AI ${leader.id} · 금 ${leader.gold}` : "AI 준비 중";
  const threateningBot = goldRushBots.find((bot) => bot.winCountdownStartedAt !== null);
  if (goldRushState.winCountdownStartedAt !== null) {
    const winRemaining = Math.max(0, 10 - (clock.elapsedTime - goldRushState.winCountdownStartedAt));
    goldRushStatusEl.textContent = `금 10개 방어 ${winRemaining.toFixed(1)}초`;
  } else if (threateningBot) {
    const winRemaining = Math.max(0, 10 - (clock.elapsedTime - threateningBot.winCountdownStartedAt));
    goldRushStatusEl.textContent = `${threateningBot.name} 방어 중 · ${winRemaining.toFixed(1)}초`;
  } else if (!goldRushState.ended) {
    goldRushStatusEl.textContent = "중앙 금광에서 금을 모으세요";
  }
}

function endGoldRush(message) {
  goldRushState.ended = true;
  goldRushState.winCountdownStartedAt = null;
  playerGoldRushHealthBar.visible = false;
  goldRushPlayerPanel.classList.add("hidden");
  goldRushStatusEl.textContent = message;
  showToast(message);
  clearGoldRushBots();
  goldMine.visible = false;
  goldRushHud.classList.add("hidden");
  showDailyRewardReveal();
}

function startGoldRush() {
  goldRushState.active = true;
  goldRushState.ended = false;
  goldRushState.gold = 0;
  goldRushState.startedAt = clock.elapsedTime;
  goldRushState.nextSpawnAt = clock.elapsedTime + 2.5;
  goldRushState.winCountdownStartedAt = null;
  goldRushState.dead = false;
  goldRushState.invulnerableUntil = clock.elapsedTime + 2;
  goldRushState.mineGoldAvailable = true;
  goldRushState.mineGoldRespawnAt = 0;
  goldRushState.maxHealth = BETA_CHARACTERS[betaState.selectedCharacter]?.maxHealth || 6000;
  goldRushState.health = goldRushState.maxHealth;
  goldRushState.maxAmmo = BETA_CHARACTERS[betaState.selectedCharacter]?.maxAmmo || 3;
  goldRushState.ammo = goldRushState.maxAmmo;
  goldRushState.reloadTimer = 0;
  goldRushState.reloadDuration = BETA_CHARACTERS[betaState.selectedCharacter]?.reloadDuration || 0.5;
  canvas.dataset.goldRushDroppedGoldTotal = "0";
  initialSpawnPoint.set(0, 1.7, 15);
  resetPlayer();
  player.visible = true;
  playerGoldRushHealthBar.visible = true;
  updateGoldRushHealthBar(playerGoldRushHealthBar, goldRushState.health, goldRushState.maxHealth);
  canvas.dataset.playerGoldRushHealth = String(goldRushState.health);
  goldMine.visible = true;
  goldMineCrystal.visible = true;
  goldRushHud.classList.remove("hidden");
  goldRushPlayerPanel.classList.remove("hidden");
  renderGoldRushAmmoFan(goldRushState.maxAmmo);
  respawnOverlay.classList.add("hidden");
  goldRushToggle.textContent = "골드 러쉬 재시작";
  for (let i = goldPickups.length - 1; i >= 0; i -= 1) removeGoldPickup(i);
  createGoldRushBots();
  updateGoldRushHud();
}

function killGoldRushPlayer() {
  if (!goldRushState.active || goldRushState.dead || goldRushState.ended) return;
  dropGoldRushGold(goldRushState, player.position);
  goldRushState.health = 0;
  goldRushState.dead = true;
  goldRushState.respawnAt = clock.elapsedTime + 5;
  player.visible = false;
  playerGoldRushHealthBar.visible = false;
  respawnOverlay.classList.remove("hidden");
  updateGoldRushHud();
}

function updateGoldRush(dt) {
  if (!goldRushState.active || goldRushState.ended) return;
  faceGoldRushHealthBarToCamera(playerGoldRushHealthBar);
  if (goldRushState.dead) {
    const remaining = Math.max(0, goldRushState.respawnAt - clock.elapsedTime);
    respawnCountdownEl.textContent = String(Math.ceil(remaining));
    if (remaining <= 0) {
      goldRushState.dead = false;
      goldRushState.invulnerableUntil = clock.elapsedTime + 2;
      goldRushState.health = goldRushState.maxHealth;
      goldRushState.ammo = goldRushState.maxAmmo;
      goldRushState.reloadTimer = 0;
      resetPlayer();
      player.visible = true;
      playerGoldRushHealthBar.visible = true;
      updateGoldRushHealthBar(playerGoldRushHealthBar, goldRushState.health, goldRushState.maxHealth);
      canvas.dataset.playerGoldRushHealth = String(goldRushState.health);
      respawnOverlay.classList.add("hidden");
    }
  }
  // 한 발만 써도 곧바로 채워진다. 공격 쿨다운과 무관하게 진행한다.
  if (!goldRushState.dead && goldRushState.ammo < goldRushState.maxAmmo) {
    goldRushState.reloadTimer += dt;
    let reloaded = false;
    while (goldRushState.reloadTimer >= goldRushState.reloadDuration && goldRushState.ammo < goldRushState.maxAmmo) {
      goldRushState.reloadTimer -= goldRushState.reloadDuration;
      goldRushState.ammo += 1;
      reloaded = true;
    }
    if (reloaded) updateGoldRushCombatHud();
  } else if (goldRushState.ammo >= goldRushState.maxAmmo) {
    goldRushState.reloadTimer = 0;
  }
  updateGoldRushBots(dt);
  if (!goldRushState.mineGoldAvailable && clock.elapsedTime >= goldRushState.mineGoldRespawnAt) {
    goldRushState.mineGoldAvailable = true;
    goldMineCrystal.visible = true;
  }
  let centralCollector = null;
  if (!goldRushState.dead && Math.hypot(player.position.x - goldMine.position.x, player.position.z - goldMine.position.z) <= 2.4) {
    centralCollector = goldRushState;
  } else {
    centralCollector = goldRushBots.find((bot) => !bot.dead &&
      Math.hypot(bot.mesh.position.x - goldMine.position.x, bot.mesh.position.z - goldMine.position.z) <= 2.4,
    ) || null;
  }
  if (goldRushState.mineGoldAvailable && centralCollector) {
    goldRushState.mineGoldAvailable = false;
    goldRushState.mineGoldRespawnAt = clock.elapsedTime + 1.5;
    goldMineCrystal.visible = false;
    centralCollector.gold += 1;
    canvas.dataset.lastGoldPickup = centralCollector === goldRushState ? "central-mine:player" : `central-mine:ai-${centralCollector.id}`;
    updateGoldRushHud();
  }
  if (clock.elapsedTime >= goldRushState.nextSpawnAt) {
    spawnGoldPickup();
    goldRushState.nextSpawnAt += 1.5;
  }
  for (let i = goldPickups.length - 1; i >= 0; i -= 1) {
    const pickup = goldPickups[i];
    pickup.mesh.rotation.y += dt * 3;
    const dx = pickup.mesh.position.x - player.position.x;
    const dz = pickup.mesh.position.z - player.position.z;
    let collector = !goldRushState.dead && Math.hypot(dx, dz) <= 1.5 ? goldRushState : null;
    if (!collector) {
      collector = goldRushBots.find((bot) => !bot.dead &&
        Math.hypot(pickup.mesh.position.x - bot.mesh.position.x, pickup.mesh.position.z - bot.mesh.position.z) <= 1.2,
      ) || null;
    }
    if (!collector) continue;
    removeGoldPickup(i);
    collector.gold += 1;
    canvas.dataset.lastGoldCollector = collector === goldRushState ? "player" : `ai-${collector.id}`;
    updateGoldRushHud();
  }
  if (goldRushState.gold >= 10) {
    goldRushState.winCountdownStartedAt ??= clock.elapsedTime;
    if (clock.elapsedTime - goldRushState.winCountdownStartedAt >= 10) endGoldRush("골드 러쉬 승리!");
  } else {
    goldRushState.winCountdownStartedAt = null;
  }
  for (const bot of goldRushBots) {
    if (bot.gold >= 10) {
      bot.winCountdownStartedAt ??= clock.elapsedTime;
      if (clock.elapsedTime - bot.winCountdownStartedAt >= 10) {
        endGoldRush(`${bot.name} 골드 러쉬 승리!`);
        return;
      }
    } else {
      bot.winCountdownStartedAt = null;
    }
  }
  if (clock.elapsedTime - goldRushState.startedAt >= 180) {
    const standings = [{ name: "플레이어", gold: goldRushState.gold }, ...goldRushBots.map((bot) => ({ name: bot.name, gold: bot.gold }))];
    standings.sort((a, b) => b.gold - a.gold);
    endGoldRush(`시간 종료 · ${standings[0].name} 승리 (${standings[0].gold}금)`);
    return;
  }
  updateGoldRushHud();
}

function groundPointAtPointer(event) {
  const rect = canvas.getBoundingClientRect();
  manualAimPointer.set(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
  );
  manualAimRaycaster.setFromCamera(manualAimPointer, camera);
  manualAimPlane.constant = -player.position.y;
  return manualAimRaycaster.ray.intersectPlane(manualAimPlane, manualAimPoint);
}

function aimPlayerAtPointer(event) {
  if (!groundPointAtPointer(event)) return false;
  const aimX = manualAimPoint.x - player.position.x;
  const aimZ = manualAimPoint.z - player.position.z;
  if (Math.hypot(aimX, aimZ) < 0.25) return false;
  player.rotation.y = Math.atan2(aimX, aimZ);
  canvas.dataset.aimMode = "manual";
  canvas.dataset.aimPoint = `${manualAimPoint.x.toFixed(2)},${manualAimPoint.z.toFixed(2)}`;
  return true;
}

// 수동 에임 고정 토글. 꺼두면 좌클릭은 자동 조준 공격이고, 0.5초 이상
// 누르고 있는 동안만 수동 에임이 된다.
aimModeButton.addEventListener("click", () => {
  manualAimActive = !manualAimActive;
  aimModeButton.classList.toggle("active", manualAimActive);
  aimModeButton.setAttribute("aria-pressed", String(manualAimActive));
  aimModeButton.textContent = manualAimActive ? "수동 에임 고정" : "좌클릭 공격 · 길게 눌러 조준";
  canvas.dataset.aimMode = manualAimActive ? "manual" : "auto";
});
aimModeButton.textContent = "좌클릭 공격 · 길게 눌러 조준";

addEventListener("keydown", (event) => {
  keys.add(event.code);
  if (event.repeat || modal.classList.contains("hidden") === false) return;
  if (event.code === "Space" || event.code === "KeyQ") {
    event.preventDefault();
    document.getElementById("ultimate-btn").click();
  }
});
addEventListener("keyup", (event) => keys.delete(event.code));
function stopHoldAim() {
  if (pointerHoldTimer !== null) {
    clearTimeout(pointerHoldTimer);
    pointerHoldTimer = null;
  }
  holdAiming = false;
  canvas.dataset.aimMode = manualAimActive ? "manual" : "auto";
}

canvas.addEventListener("pointerdown", (event) => {
  dragging = true;
  pointerTravel = 0;
  lastPointerX = event.clientX;
  lastPointerY = event.clientY;
  canvas.setPointerCapture(event.pointerId);
  if (event.button !== 0 || !modal.classList.contains("hidden")) return;
  pointerHoldTimer = setTimeout(() => {
    pointerHoldTimer = null;
    holdAiming = true;
    canvas.dataset.aimMode = "hold";
    aimPlayerAtPointer(event);
  }, AIM_HOLD_SECONDS * 1000);
});
canvas.addEventListener("pointerup", (event) => {
  dragging = false;
  const wasAiming = holdAiming;
  const held = pointerHoldTimer !== null || wasAiming;
  stopHoldAim();
  if (event.button !== 0 || !modal.classList.contains("hidden")) return;
  if (wasAiming) {
    // 수동 에임 유지 후 놓으면 조준한 방향으로 공격
    canvas.dataset.lastAttackInput = "hold-aim";
    performCharacterAttack({ manualAim: aimPlayerAtPointer(event) });
    return;
  }
  if (!held || pointerTravel >= 6) return;
  canvas.dataset.lastAttackInput = "mouse";
  performCharacterAttack({ manualAim: manualAimActive && aimPlayerAtPointer(event) });
});
canvas.addEventListener("pointercancel", stopHoldAim);
canvas.addEventListener("pointermove", (event) => {
  if ((manualAimActive || holdAiming) && modal.classList.contains("hidden")) aimPlayerAtPointer(event);
  if (!dragging || overview) return;
  const dx = event.clientX - lastPointerX;
  const dy = event.clientY - lastPointerY;
  pointerTravel += Math.hypot(dx, dy);
  // 수동 에임 중에는 드래그가 시점을 돌리지 않는다 — 카메라는 조준 방향을 따라간다
  if (holdAiming) {
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    return;
  }
  yaw -= dx * 0.006;
  pitch = THREE.MathUtils.clamp(pitch + dy * 0.004, 0.25, 1.15);
  lastPointerX = event.clientX;
  lastPointerY = event.clientY;
});
canvas.addEventListener("wheel", (event) => {
  distance = THREE.MathUtils.clamp(distance + event.deltaY * 0.01, 3.5, 24);
}, { passive: true });

function resetPlayer() { player.position.copy(initialSpawnPoint); player.rotation.y = Math.PI; }
resetPlayer();
document.getElementById("reset-btn").addEventListener("click", resetPlayer);
goldRushToggle.addEventListener("click", startGoldRush);
document.getElementById("test-death-btn").addEventListener("click", () => {
  if (betaState.selectedCharacter === "pink") {
    let marked = 0;
    for (const target of testTargets) {
      if (!target.userData.isAlly) continue;
      target.userData.deadPosition = target.position.clone();
      target.userData.health = 0;
      target.visible = false;
      marked += 1;
    }
    showToast(`앙코르 테스트 · 아군 ${marked}명 쓰러짐`);
    return;
  }
  killGoldRushPlayer();
});
document.getElementById("overview-btn").addEventListener("click", (event) => {
  overview = !overview;
  event.currentTarget.textContent = overview ? "플레이 시점" : "전체 보기";
});

function groundHeightAt(x, z) {
  let best = -20;
  for (const solid of solids) {
    if (Math.abs(x - solid.x) <= solid.halfW && Math.abs(z - solid.z) <= solid.halfD) best = Math.max(best, solid.top);
  }
  return best;
}

function updateLocation() {
  const { x, z } = player.position;
  if (z < -28) locationName.textContent = "포털 관문";
  else if (z > 28) locationName.textContent = "상층 정원";
  else if (x < -28) locationName.textContent = "침식 유적";
  else if (x > 28) locationName.textContent = "낮은 부두";
  else locationName.textContent = "베타 광장";
}

const clock = new THREE.Clock();
const cameraTarget = new THREE.Vector3();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.04);
  for (let i = betaProjectiles.length - 1; i >= 0; i -= 1) {
    const projectile = betaProjectiles[i];
    let remove = false;
    let shouldSplitGold = false;
    let shouldSplitOrange = false;
    let orangeDirectHitTarget = null;
    let shouldBreakVial = false;
    if (projectile.type === "boomerang" && projectile.returned) {
      const returnX = player.position.x - projectile.mesh.position.x;
      const returnZ = player.position.z - projectile.mesh.position.z;
      const returnDistance = Math.hypot(returnX, returnZ);
      if (returnDistance <= 0.65) {
        remove = true;
      } else {
        const returnSpeed = projectile.speed * projectile.returnSpeedMultiplier;
        projectile.vx = (returnX / returnDistance) * returnSpeed;
        projectile.vz = (returnZ / returnDistance) * returnSpeed;
      }
    }
    const step = Math.hypot(projectile.vx, projectile.vz) * dt;
    if (!remove && !projectile.ivoryLandedAt) {
      projectile.mesh.position.x += projectile.vx * dt;
      projectile.mesh.position.z += projectile.vz * dt;
      if (projectile.returned) projectile.returnTraveled += step;
      else projectile.traveled += step;
      // 독병은 던지는 무기 — 사거리 중간이 가장 높은 포물선을 그린다
      if (projectile.type === "vial" || projectile.type === "ivoryIceCream") {
        const progress = Math.min(1, projectile.traveled / projectile.range);
        const arcHeight = projectile.type === "ivoryIceCream" ? 4.2 : VIAL_ARC_HEIGHT;
        projectile.mesh.position.y = projectile.launchY
          + Math.sin(progress * Math.PI) * arcHeight
          - progress * (projectile.launchY - 0.35);
        projectile.mesh.rotation.x += dt * 6;
      }
    }
    if (projectile.goldStage && solids.some((solid) =>
      solid.top >= projectile.mesh.position.y - projectile.hitRadius
      && Math.abs(projectile.mesh.position.x - solid.x) <= solid.halfW + projectile.hitRadius
      && Math.abs(projectile.mesh.position.z - solid.z) <= solid.halfD + projectile.hitRadius)) {
      remove = true;
      shouldSplitGold = projectile.goldStage < 3;
    }
    if ((projectile.type === "orangeFruit" || projectile.type === "orangeJuice") && solids.some((solid) =>
      solid.top >= projectile.mesh.position.y - projectile.hitRadius
      && Math.abs(projectile.mesh.position.x - solid.x) <= solid.halfW + projectile.hitRadius
      && Math.abs(projectile.mesh.position.z - solid.z) <= solid.halfD + projectile.hitRadius)) {
      remove = true;
      shouldSplitOrange = projectile.type === "orangeFruit";
    }
    if (projectile.type !== "cyanUltimate") projectile.mesh.rotation.y += dt * 9;
    if (projectile.type === "cyanUltimate") {
      projectile.mesh.material.opacity = 0.94 + Math.sin(projectile.traveled * 3) * 0.06;
    }
    if (!remove && projectile.type !== "ivoryIceCream") {
      for (const target of testTargets) {
        if (!target.visible || target.userData.isAlly || projectile.hit.has(target)) continue;
        const targetDx = target.position.x - projectile.mesh.position.x;
        const targetDz = target.position.z - projectile.mesh.position.z;
        if (projectile.goldStage) {
          if (projectile.goldStage === 1) {
            const forwardX = Math.sin(projectile.goldYaw);
            const forwardZ = Math.cos(projectile.goldYaw);
            const forwardDistance = Math.abs(targetDx * forwardX + targetDz * forwardZ);
            const sideDistance = Math.abs(targetDx * forwardZ - targetDz * forwardX);
            const collisionHalfSize = BETA_CHARACTERS.gold.stage1Size / 2 + 0.85;
            if (forwardDistance > collisionHalfSize || sideDistance > collisionHalfSize) continue;
          } else if (Math.hypot(targetDx, targetDz) > 0.85 + projectile.hitRadius) {
            continue;
          }
          applyGoldProjectileHit(projectile, target);
          remove = true;
          shouldSplitGold = projectile.goldStage < 3;
        } else if (projectile.type === "cyanUltimate") {
          const directionLength = Math.hypot(projectile.vx, projectile.vz) || 1;
          const forwardX = projectile.vx / directionLength;
          const forwardZ = projectile.vz / directionLength;
          const forwardDistance = Math.abs(targetDx * forwardX + targetDz * forwardZ);
          const sideDistance = Math.abs(targetDx * forwardZ - targetDz * forwardX);
          if (forwardDistance > 1 || sideDistance > projectile.hitRadius + 0.85) continue;
        } else if (Math.hypot(targetDx, targetDz) > 0.85 + projectile.hitRadius) {
          continue;
        }
        projectile.hit.add(target);
        if (projectile.type === "cyanUltimate") {
          target.userData.health -= projectile.damage;
          const directionLength = Math.hypot(projectile.vx, projectile.vz) || 1;
          target.userData.galeKnockbackX = projectile.vx / directionLength;
          target.userData.galeKnockbackZ = projectile.vz / directionLength;
          target.userData.galeKnockbackRemaining = projectile.knockback;
          target.userData.galeKnockbackSpeed = projectile.speed;
          flashTarget(target);
          if (target.userData.health <= 0) target.visible = false;
        } else {
          const damage = projectile.type === "boomerang" && projectile.returned
            ? projectile.damage * projectile.returnDamageMultiplier
            : projectile.damage;
          damageTarget(target, damage, projectile.causesKnockback);
        }
        if (projectile.type === "orangeFruit") {
          shouldSplitOrange = true;
          orangeDirectHitTarget = target;
        }
        if (projectile.characterId === "cyan" && projectile.type !== "cyanUltimate") {
          cyanUltimateCharge = Math.min(BETA_CHARACTERS.cyan.ultimate.chargeRequired, cyanUltimateCharge + 1);
          if (betaState.selectedCharacter === "cyan") updateCrimsonUltimateGauge();
        }
        if (projectile.splash > 0) {
          createGroundPulse(projectile.splash, projectile.type === "orangeFruit" ? 0xff9b32 : 0xb13cff, target.position);
          for (const other of testTargets) {
            if (other !== target && other.visible && Math.hypot(other.position.x - target.position.x, other.position.z - target.position.z) <= projectile.splash) damageTarget(other, projectile.damage);
          }
        }
        if (!projectile.goldStage && projectile.type !== "boomerang" && projectile.type !== "cyanUltimate") remove = true;
        if (remove) break;
      }
    }
    if (projectile.type === "boomerang" && !projectile.returned && projectile.traveled >= projectile.range) {
      projectile.returned = true;
      projectile.hit.clear();
    }
    if (projectile.type === "boomerang") {
      if (projectile.returnTraveled >= projectile.range * 2) remove = true;
    } else if (projectile.traveled >= projectile.range) {
      if (projectile.type === "ivoryIceCream" && !projectile.ivoryLandedAt) {
        projectile.mesh.position.set(projectile.landingX, 0.35, projectile.landingZ);
        projectile.traveled = projectile.range;
        projectile.ivoryLandedAt = clock.elapsedTime;
      } else if (projectile.type !== "ivoryIceCream" || clock.elapsedTime - projectile.ivoryLandedAt >= 0.08) {
        remove = true;
      }
      if (projectile.goldStage && projectile.goldStage < 3) shouldSplitGold = true;
      if (projectile.type === "orangeFruit") shouldSplitOrange = true;
      if (remove && projectile.type === "ivoryIceCream") {
        const directionX = projectile.vx / projectile.speed;
        const directionZ = projectile.vz / projectile.speed;
        createIvoryIceCreamZone(
          projectile.landingX - directionX,
          projectile.landingZ - directionZ,
          projectile.fromUltimate,
        );
      }
      // 독병은 착지 지점에서 깨지며 주변에 광역 피해를 준다
      if (projectile.type === "vial" && projectile.splash > 0) shouldBreakVial = true;
    }
    if (remove) {
      if (shouldSplitGold) splitGoldProjectile(projectile);
      if (shouldSplitOrange) spawnOrangeJuice(projectile.mesh.position.clone(), orangeDirectHitTarget);
      if (shouldBreakVial) breakVial(projectile);
      scene.remove(projectile.mesh);
      projectile.mesh.traverse((part) => {
        part.geometry?.dispose();
        if (Array.isArray(part.material)) part.material.forEach((material) => material.dispose());
        else part.material?.dispose();
      });
      betaProjectiles.splice(i, 1);
    }
  }
  for (let i = crimsonSlashes.length - 1; i >= 0; i -= 1) {
    const slash = crimsonSlashes[i];
    slash.life -= dt;
    const progress = 1 - slash.life / slash.maxLife;
    // 처음엔 빠르게 밝고 뒤로 갈수록 천천히 사라지도록 감쇠 곡선을 준다
    const fade = (1 - progress) * (1 - progress);
    slash.mesh.material.opacity = Math.max(0, (slash.peakOpacity ?? 0.72) * fade);
    const grow = slash.grow ?? 1.2;
    slash.mesh.scale.setScalar(0.86 + progress * (grow - 0.86));
    if (slash.life <= 0) {
      scene.remove(slash.group);
      slash.mesh.geometry.dispose();
      slash.mesh.material.dispose();
      crimsonSlashes.splice(i, 1);
    }
  }
  for (let i = damagePopups.length - 1; i >= 0; i -= 1) {
    const popup = damagePopups[i];
    popup.life -= dt;
    popup.mesh.position.y += dt * 1.4;
    popup.mesh.material.opacity = Math.max(0, popup.life / popup.maxLife);
    if (popup.life <= 0) {
      scene.remove(popup.mesh);
      popup.mesh.material.map.dispose();
      popup.mesh.material.dispose();
      damagePopups.splice(i, 1);
    }
  }
  const dueIvoryZoneTargets = new Set();
  for (let i = ivoryIceCreamZones.length - 1; i >= 0; i -= 1) {
    const zone = ivoryIceCreamZones[i];
    const remaining = Math.max(0, zone.expiresAt - clock.elapsedTime);
    zone.puddle.material.opacity = 0.5 + Math.min(0.32, remaining * 0.08);
    zone.puddle.scale.setScalar(1 + Math.sin(clock.elapsedTime * 4 + i) * 0.025);
    if (clock.elapsedTime >= zone.nextTickAt && zone.nextTickAt <= zone.expiresAt) {
      zone.nextTickAt += BETA_CHARACTERS.ivory.iceCreamZoneTickInterval;
      for (const target of testTargets) {
        if (!target.visible || target.userData.isAlly) continue;
        if (Math.hypot(target.position.x - zone.x, target.position.z - zone.z) <= zone.radius) dueIvoryZoneTargets.add(target);
      }
    }
    if (clock.elapsedTime >= zone.expiresAt) {
      scene.remove(zone.group);
      zone.group.traverse((part) => { part.geometry?.dispose(); part.material?.dispose(); });
      ivoryIceCreamZones.splice(i, 1);
    }
  }
  for (const target of dueIvoryZoneTargets) {
    damageTarget(target, BETA_CHARACTERS.ivory.iceCreamDamage);
    chargeIvoryUltimate(1);
  }
  canvas.dataset.ivoryZones = String(ivoryIceCreamZones.length);

  for (let i = malfunctionZones.length - 1; i >= 0; i -= 1) {
    if (i === malfunctionZones.length - 1) {
      for (const target of testTargets) target.userData.inMalfunctionZone = false;
    }
    const zone = malfunctionZones[i];
    if (zone.followsPlayer) {
      zone.x = player.position.x;
      zone.z = player.position.z;
      const zoneGround = groundHeightAt(zone.x, zone.z);
      zone.mesh.position.set(zone.x, zoneGround > -5 ? zoneGround + 0.08 : 0.08, zone.z);
    }
    zone.mesh.material.opacity = 0.26 + Math.sin(clock.elapsedTime * 8) * 0.08;
    if (clock.elapsedTime >= zone.expiresAt) {
      scene.remove(zone.mesh);
      zone.mesh.geometry.dispose();
      zone.mesh.material.dispose();
      malfunctionZones.splice(i, 1);
      continue;
    }
    for (const target of testTargets) {
      if (!target.visible || target.userData.isAlly) continue;
      if (Math.hypot(target.position.x - zone.x, target.position.z - zone.z) <= zone.radius) {
        target.userData.inMalfunctionZone = true;
        target.userData.malfunctionUntil = clock.elapsedTime + 0.1;
        const isBoss = target.userData.kind === "alphaBoss";
        target.userData.moveSpeedMultiplier = isBoss ? 0.75 : 0.5;
        target.userData.attackDisabled = !isBoss;
        target.userData.specialDisabled = !isBoss;
      }
    }
  }
  if (malfunctionZones.length === 0) {
    for (const target of testTargets) target.userData.inMalfunctionZone = false;
  }
  for (const target of testTargets) {
    const indicator = target.userData.malfunctionIndicator;
    if (target.userData.inMalfunctionZone) {
      const activeIndicator = indicator || ensureMalfunctionIndicator(target);
      activeIndicator.visible = true;
      activeIndicator.rotation.y += dt * 4.5;
      const pulse = 1 + Math.sin(clock.elapsedTime * 10) * 0.12;
      activeIndicator.scale.setScalar(pulse);
      activeIndicator.userData.material.emissiveIntensity = 1.2 + Math.sin(clock.elapsedTime * 12) * 0.5;
    } else {
      target.userData.moveSpeedMultiplier = 1;
      target.userData.attackDisabled = false;
      target.userData.specialDisabled = false;
      target.userData.malfunctionUntil = 0;
      if (indicator) indicator.visible = false;
    }
  }
  canvas.dataset.malfunctionTargets = String(testTargets.filter((target) => target.userData.inMalfunctionZone).length);
  const forward = Number(keys.has("KeyW")) - Number(keys.has("KeyS"));
  const strafe = Number(keys.has("KeyD")) - Number(keys.has("KeyA"));
  const input = new THREE.Vector2(strafe, forward);
  let isMoving = false;
  if (!goldRushState.dead && input.lengthSq() > 0) {
    isMoving = true;
    input.normalize().multiplyScalar(8 * dt);
    const sin = Math.sin(yaw);
    const cos = Math.cos(yaw);
    const moveX = input.y * sin - input.x * cos;
    const moveZ = input.y * cos + input.x * sin;
    player.position.x += moveX;
    player.position.z += moveZ;
    // 수동 에임 중에는 진행 방향으로 몸을 돌리지 않는다 — 조준 방향을 유지
    if (!manualAimActive && !holdAiming) player.rotation.y = Math.atan2(moveX, moveZ);
  }
  restoreModelAttackPose();
  if (activeCharacterMotion) {
    updateCharacterMotion(isMoving, dt);
    updateModelAttackMotion(dt);
  } else if (activeCharacterMixer && activeCharacterAction) {
    if (isMoving && !activeCharacterWasMoving) {
      activeCharacterAction.reset().play();
      activeCharacterAction.paused = false;
    } else if (!isMoving && activeCharacterWasMoving) {
      // Return to the walk clip's authored standing frame instead of freezing mid-stride.
      activeCharacterAction.paused = true;
      activeCharacterAction.time = 0;
      activeCharacterMixer.update(0);
    }
    if (isMoving) activeCharacterMixer.update(dt);
    activeCharacterWasMoving = isMoving;
    updateModelAttackMotion(dt);
  }
  updateHeadAttachedSkinAccessory();
  const ground = groundHeightAt(player.position.x, player.position.z);
  if (ground < -5) resetPlayer();
  else player.position.y = THREE.MathUtils.damp(player.position.y, ground + 0.05, 12, dt);
  updateGoldRush(dt);
  updateTestCombatHud(dt);

  portal.rotation.y += dt * 0.65;
  goldMineCrystal.rotation.y += dt * 1.4;
  alphaBoss.rotation.y = Math.sin(clock.elapsedTime * 0.45) * 0.16;
  alphaBoss.position.y = 4.8 + Math.sin(clock.elapsedTime * 1.15) * 0.08;
  for (const target of testTargets) {
    if (!target.userData.inMalfunctionZone) {
      target.userData.moveSpeedMultiplier = 1;
    }
    const galeKnockbackRemaining = target.userData.galeKnockbackRemaining || 0;
    if (galeKnockbackRemaining > 0) {
      const knockbackStep = Math.min(galeKnockbackRemaining, target.userData.galeKnockbackSpeed * dt);
      target.position.x += target.userData.galeKnockbackX * knockbackStep;
      target.position.z += target.userData.galeKnockbackZ * knockbackStep;
      target.userData.galeKnockbackRemaining -= knockbackStep;
    }
    if (target.userData.kind === "jjajjal" && target.visible) {
      target.rotation.y += dt * 0.8;
    }
    const recoil = target.userData.hitRecoil || 0;
    if (recoil > 0.001) {
      target.position.x += (target.userData.knockbackX || 0) * dt;
      target.position.z += (target.userData.knockbackZ || 0) * dt;
      target.userData.knockbackX = THREE.MathUtils.damp(target.userData.knockbackX || 0, 0, 9, dt);
      target.userData.knockbackZ = THREE.MathUtils.damp(target.userData.knockbackZ || 0, 0, 9, dt);
      target.userData.hitRecoil = THREE.MathUtils.damp(recoil, 0, 11, dt);
      const tilt = Math.sin(recoil * Math.PI) * (target.userData.kind === "alphaBoss" ? 0.06 : 0.2);
      target.rotation.x = tilt;
      const baseScale = target.userData.baseScale || 1;
      target.scale.y = baseScale * (1 - Math.sin(recoil * Math.PI) * 0.08);
      target.scale.x = baseScale * (1 + Math.sin(recoil * Math.PI) * 0.05);
      target.scale.z = target.scale.x;
    } else if (target.userData.hitRecoil !== undefined) {
      target.userData.hitRecoil = 0;
      target.rotation.x = 0;
      const baseScale = target.userData.baseScale || 1;
      target.scale.setScalar(baseScale);
    }
  }
  water.material.opacity = 0.84 + Math.sin(clock.elapsedTime * 0.7) * 0.04;
  if (overview) {
    camera.position.lerp(new THREE.Vector3(0, 82, 0.01), 1 - Math.exp(-4 * dt));
    camera.lookAt(0, 0, 0);
  } else {
    // 수동 에임 중이면 카메라가 조준 방향 뒤로 부드럽게 돌아간다
    cameraTarget.copy(player.position).add(new THREE.Vector3(0, 1.2, 0));
    const horizontal = Math.cos(pitch) * distance;
    const desired = new THREE.Vector3(
      cameraTarget.x - Math.sin(yaw) * horizontal,
      cameraTarget.y + Math.sin(pitch) * distance,
      cameraTarget.z - Math.cos(yaw) * horizontal,
    );
    camera.position.lerp(desired, 1 - Math.exp(-8 * dt));
    camera.lookAt(cameraTarget);
  }
  updateLocation();
  renderer.render(scene, camera);
}

function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
addEventListener("resize", resize);
resize();
resetTestCombatHud();
animate();
