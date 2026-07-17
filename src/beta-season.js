import * as THREE from "three";

const canvas = document.getElementById("beta-canvas");
const locationName = document.getElementById("location-name");
const creditValue = document.getElementById("credit-value");
const modal = document.getElementById("beta-modal");
const modalTitle = document.getElementById("modal-title");
const modalContent = document.getElementById("modal-content");
const toast = document.getElementById("beta-toast");
const BETA_STORAGE_KEY = "colorsBetaSeasonTest";
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
];
const SKINS = [
  { id: "red_orange", name: "Crimson Orange", character: "Orange", rarity: "rare", price: 1000 },
  { id: "red_crimson", name: "Blood Crimson", character: "Crimson", rarity: "epic", price: 2500 },
  { id: "red_red", name: "Scarlet Red", character: "Red", rarity: "legendary", price: 5000 },
  { id: "crown_pink", name: "우승 왕관", character: "Pink", rarity: "rare", price: 1200 },
  { id: "crown_green", name: "준우승 왕관", character: "Green", rarity: "rare", price: 1000 },
  { id: "crown_cyan", name: "3위 왕관", character: "Cyan", rarity: "rare", price: 800 },
];

function loadBetaState() {
  const today = new Date().toISOString().slice(0, 10);
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(BETA_STORAGE_KEY) || "{}"); } catch { saved = {}; }
  const state = {
    credits: Number.isFinite(saved.credits) ? saved.credits : 1500,
    coins: Number.isFinite(saved.coins) ? saved.coins : 3000,
    selectedCharacter: saved.selectedCharacter || "red",
    ownedCharacters: saved.ownedCharacters || ["red", "green", "blue"],
    ownedSkins: saved.ownedSkins || [],
    daily: saved.daily?.date === today ? { claimed: false, ...saved.daily } : { date: today, claimed: false, remaining: 6 },
  };
  return state;
}
const betaState = loadBetaState();
function saveBetaState() { localStorage.setItem(BETA_STORAGE_KEY, JSON.stringify(betaState)); updateWallet(); }
function updateWallet() { creditValue.textContent = betaState.credits.toLocaleString("ko-KR"); }
function rarityName(rarity) { return ({ common: "일반", rare: "희귀", epic: "초희귀", legendary: "영웅" })[rarity]; }
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

function box(x, y, z, width, height, depth, material = platformMaterial, solid = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  map.add(mesh);
  if (solid) solids.push({ x, z, halfW: width / 2, halfD: depth / 2, top: y + height / 2 });
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
box(0, 1.6, 0, 15, 0.35, 15, trimMaterial, false);
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
for (const [x, z, w, d] of [[-6,-38,5,2],[7,-42,3,5],[-42,-5,2,6],[-38,7,5,2],[38,-7,4,2],[43,5,2,5],[-6,38,5,2],[7,42,3,4]]) {
  box(x, 5.5, z, w, 3, d, stoneMaterial);
}

// 베타 시즌 포털
const portal = new THREE.Group();
const portalMat = new THREE.MeshStandardMaterial({ color: 0x75efff, emissive: 0x167b91, emissiveIntensity: 2 });
portal.add(new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.35, 12, 40), portalMat));
portal.position.set(0, 6.5, -40);
map.add(portal);

const player = new THREE.Group();
const bodyMat = new THREE.MeshStandardMaterial({ color: 0xef3c58, roughness: 0.55 });
const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.7, 1.2, 5, 10), bodyMat);
body.position.y = 1.2;
body.castShadow = true;
player.add(body);
const visor = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.28, 0.18), new THREE.MeshStandardMaterial({ color: 0x8cecff, emissive: 0x256879 }));
visor.position.set(0, 1.62, -0.64);
player.add(visor);
scene.add(player);

function selectCharacter(id) {
  const character = CHARACTERS.find((item) => item.id === id);
  if (!character || !betaState.ownedCharacters.includes(id)) return;
  betaState.selectedCharacter = id;
  bodyMat.color.setHex(character.color);
  saveBetaState();
  renderCharacters();
  showToast(`${character.name} 선택 완료`);
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
    return `<article class="beta-card${selected ? " selected" : ""}">
      <span class="rarity ${character.rarity}">${rarityName(character.rarity)}</span>
      <h3>${character.name}</h3>
      <p>${character.id === "crimson" ? "신규 근접 브루저 · 4연속 부채꼴 공격" : "베타 시즌 캐릭터 등급 테스트"}</p>
      <button data-character="${character.id}" data-action="${owned ? "select" : "buy"}" ${selected ? "disabled" : ""}>${selected ? "선택 중" : owned ? "선택" : `${character.price} 크레딧`}</button>
    </article>`;
  }).join("")}</div>`;
}

function renderShop() {
  modalTitle.textContent = "베타 시즌 상점";
  modalContent.innerHTML = `<p>보유 코인: <strong>${betaState.coins.toLocaleString("ko-KR")}</strong></p><div class="beta-grid">${SKINS.map((skin) => {
    const owned = betaState.ownedSkins.includes(skin.id);
    return `<article class="beta-card">
      <span class="rarity ${skin.rarity}">${rarityName(skin.rarity)}</span>
      <h3>${skin.name}</h3><p>${skin.character} 전용 · 베타 시즌 1</p>
      <button data-skin="${skin.id}" ${owned ? "disabled" : ""}>${owned ? "보유 중" : `${skin.price.toLocaleString("ko-KR")} 코인`}</button>
    </article>`;
  }).join("")}</div>`;
}

function buySkin(id) {
  const skin = SKINS.find((item) => item.id === id);
  if (!skin || betaState.ownedSkins.includes(id)) return;
  if (betaState.coins < skin.price) return showToast("코인이 부족합니다.");
  betaState.coins -= skin.price;
  betaState.ownedSkins.push(id);
  saveBetaState();
  renderShop();
  showToast(`${skin.name} 구매 완료`);
}

const DAILY_DROPS = [
  { label: "50 크레딧", weight: 32, credits: 50 },
  { label: "100 크레딧", weight: 16, credits: 100 },
  { label: "200 크레딧", weight: 8, credits: 200 },
  { label: "400 크레딧", weight: 4, credits: 400 },
  { label: "100 코인", weight: 20, coins: 100 },
  { label: "400 코인", weight: 5, coins: 400 },
];
function renderDaily(result = "") {
  modalTitle.textContent = "일일 보상 + 랜덤 드롭";
  modalContent.innerHTML = `<div class="drop-box">
    <span class="rarity legendary">일일 보상</span><h3>매일 100 크레딧</h3>
    <button id="daily-claim-btn" ${betaState.daily.claimed ? "disabled" : ""}>${betaState.daily.claimed ? "오늘 수령 완료" : "일일 보상 받기"}</button>
  </div><div class="drop-box" style="margin-top:12px"><span class="rarity rare">하루 최대 6회</span><h3>베타 보급 상자</h3><div class="drop-result">${result || "상자를 열어 보상을 확인하세요."}</div><button id="drop-btn" ${betaState.daily.remaining <= 0 ? "disabled" : ""}>랜덤 드롭 열기</button><p>오늘 남은 횟수: ${betaState.daily.remaining}/6</p></div>`;
}
function claimDailyReward() {
  if (betaState.daily.claimed) return;
  betaState.daily.claimed = true;
  betaState.credits += 100;
  saveBetaState();
  renderDaily("✨ 일일 보상 100 크레딧 획득");
}
function openDailyDrop() {
  if (betaState.daily.remaining <= 0) return;
  const total = DAILY_DROPS.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  const reward = DAILY_DROPS.find((item) => (roll -= item.weight) <= 0) || DAILY_DROPS[0];
  betaState.daily.remaining -= 1;
  betaState.credits += reward.credits || 0;
  betaState.coins += reward.coins || 0;
  saveBetaState();
  renderDaily(`🎁 ${reward.label} 획득`);
}

function openPanel(panel) {
  modal.classList.remove("hidden");
  if (panel === "characters") renderCharacters();
  if (panel === "shop") renderShop();
  if (panel === "daily") renderDaily();
}
document.querySelectorAll("[data-panel]").forEach((button) => button.addEventListener("click", () => openPanel(button.dataset.panel)));
document.getElementById("modal-close").addEventListener("click", () => modal.classList.add("hidden"));
modal.addEventListener("click", (event) => { if (event.target === modal) modal.classList.add("hidden"); });
modalContent.addEventListener("click", (event) => {
  const characterButton = event.target.closest("[data-character]");
  if (characterButton) characterButton.dataset.action === "buy" ? buyCharacter(characterButton.dataset.character) : selectCharacter(characterButton.dataset.character);
  const skinButton = event.target.closest("[data-skin]");
  if (skinButton) buySkin(skinButton.dataset.skin);
  if (event.target.id === "daily-claim-btn") claimDailyReward();
  if (event.target.id === "drop-btn") openDailyDrop();
});

let ultimateReady = true;
document.getElementById("ultimate-btn").addEventListener("click", () => {
  if (!ultimateReady) return;
  ultimateReady = false;
  document.getElementById("ultimate-btn").classList.add("cooldown");
  document.getElementById("ultimate-state").textContent = "재충전 중 · 10초";
  const wave = new THREE.Mesh(new THREE.RingGeometry(1, 1.35, 48), new THREE.MeshBasicMaterial({ color: 0xffd36b, side: THREE.DoubleSide, transparent: true, opacity: .9 }));
  wave.rotation.x = -Math.PI / 2;
  wave.position.copy(player.position);
  wave.position.y += .1;
  scene.add(wave);
  const started = clock.elapsedTime;
  function expandWave() {
    const elapsed = clock.elapsedTime - started;
    wave.scale.setScalar(1 + elapsed * 10);
    wave.material.opacity = Math.max(0, .9 - elapsed);
    if (elapsed < 1) requestAnimationFrame(expandWave); else scene.remove(wave);
  }
  expandWave();
  setTimeout(() => {
    ultimateReady = true;
    document.getElementById("ultimate-btn").classList.remove("cooldown");
    document.getElementById("ultimate-state").textContent = "사용 가능";
  }, 10000);
});
bodyMat.color.setHex(CHARACTERS.find((item) => item.id === betaState.selectedCharacter)?.color ?? 0xef3c58);
updateWallet();

const keys = new Set();
let yaw = Math.PI;
let pitch = 0.72;
let distance = 14;
let overview = false;
let dragging = false;
let lastPointerX = 0;
let lastPointerY = 0;

addEventListener("keydown", (event) => keys.add(event.code));
addEventListener("keyup", (event) => keys.delete(event.code));
canvas.addEventListener("pointerdown", (event) => { dragging = true; lastPointerX = event.clientX; lastPointerY = event.clientY; canvas.setPointerCapture(event.pointerId); });
canvas.addEventListener("pointerup", () => { dragging = false; });
canvas.addEventListener("pointermove", (event) => {
  if (!dragging || overview) return;
  yaw -= (event.clientX - lastPointerX) * 0.006;
  pitch = THREE.MathUtils.clamp(pitch + (event.clientY - lastPointerY) * 0.004, 0.25, 1.15);
  lastPointerX = event.clientX;
  lastPointerY = event.clientY;
});
canvas.addEventListener("wheel", (event) => { distance = THREE.MathUtils.clamp(distance + event.deltaY * 0.01, 8, 24); }, { passive: true });

function resetPlayer() { player.position.set(0, 1.7, 0); }
resetPlayer();
document.getElementById("reset-btn").addEventListener("click", resetPlayer);
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
  const forward = Number(keys.has("KeyW")) - Number(keys.has("KeyS"));
  const strafe = Number(keys.has("KeyD")) - Number(keys.has("KeyA"));
  const input = new THREE.Vector2(strafe, forward);
  if (input.lengthSq() > 0) {
    input.normalize().multiplyScalar(8 * dt);
    const sin = Math.sin(yaw);
    const cos = Math.cos(yaw);
    player.position.x += input.x * cos + input.y * sin;
    player.position.z += input.x * -sin + input.y * cos;
    player.rotation.y = Math.atan2(input.x * cos + input.y * sin, input.x * -sin + input.y * cos);
  }
  const ground = groundHeightAt(player.position.x, player.position.z);
  if (ground < -5) resetPlayer();
  else player.position.y = THREE.MathUtils.damp(player.position.y, ground + 0.05, 12, dt);

  portal.rotation.y += dt * 0.65;
  water.material.opacity = 0.84 + Math.sin(clock.elapsedTime * 0.7) * 0.04;
  if (overview) {
    camera.position.lerp(new THREE.Vector3(0, 82, 0.01), 1 - Math.exp(-4 * dt));
    camera.lookAt(0, 0, 0);
  } else {
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
animate();
