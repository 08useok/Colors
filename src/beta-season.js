import * as THREE from "three";

const canvas = document.getElementById("beta-canvas");
const locationName = document.getElementById("location-name");
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
