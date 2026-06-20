import { THREE, G } from "./shared.js";

const bushClumpGeo = new THREE.IcosahedronGeometry(1, 0);
const bushClumpMats = [0x5a7d3a, 0x6f9447, 0x4f6f31, 0x7da84f].map(
  (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.95 }),
);

export const MAP_POOL = [
  { id: 0, name: "해골 협곡",
    wallSpecs: [[-39,39,6,2],[-33,34,2,6],[-18,40,8,2],[-7,35,2,8],[9,36,2,10],[24,38,2,8],[34,34,8,2],[41,23,2,8],[36,12,6,2],[22,20,2,8],[14,9,8,2],[0,17,10,2],[-13,18,2,8],[-24,15,6,2],[-36,20,2,10],[-42,8,6,2],[-28,4,2,8],[-15,-2,10,2],[-2,4,2,10],[16,-2,6,2],[28,4,2,8],[40,-2,6,2],[35,-18,2,12],[25,-24,10,2],[15,-30,2,8],[0,-26,8,2],[-12,-30,2,8],[-28,-24,10,2],[-38,-16,2,8],[-42,-30,8,2],[-30,-40,10,2],[-14,-40,8,2],[2,-40,12,2],[18,-38,2,10],[30,-40,8,2],[42,-34,2,8],[-6,-14,6,2],[8,-14,2,8],[12,-12,8,2],[-20,-14,2,8],[-24,-8,8,2],[24,-10,8,2],[31,-8,2,8],[5,28,8,2],[15,28,2,8],[-26,28,10,2],[-18,25,2,8],[32,26,8,2]],
    bushSpecs: [[-42,44],[-33,42],[-23,44],[-6,44],[10,44],[28,42],[40,44],[-44,30],[-34,27],[-20,30],[-8,27],[5,31],[18,30],[34,28],[43,26],[-44,14],[-32,12],[-17,10],[0,9],[16,12],[33,14],[43,9],[-41,-2],[-29,-3],[-14,-2],[0,-3],[18,-4],[34,-1],[42,-4],[-44,-18],[-31,-17],[-18,-19],[-3,-18],[13,-18],[28,-18],[42,-22],[-40,-34],[-22,-36],[-6,-33],[8,-34],[24,-33],[38,-36]],
    skullSpecs: [[-18,12],[-6,8],[8,10],[18,7],[-12,24],[14,24],[0,28],[-28,0],[30,-18],[-4,-22]],
    lakes: [{x:0,z:-18,width:18,depth:5.5}],
    spawns: [[-40,0,42],[-18,0,44],[6,0,43],[32,0,40],[43,0,12],[38,0,-26],[12,0,-42],[-16,0,-41],[-39,0,-22],[-44,0,10]] },
  { id: 1, name: "마른 호수",
    wallSpecs: [[-38,42,8,2],[-20,38,2,8],[0,42,10,2],[18,38,2,8],[36,40,6,2],[-42,28,2,10],[-28,22,8,2],[-10,28,2,8],[10,22,8,2],[28,28,2,10],[42,20,6,2],[-36,10,6,2],[-22,6,2,8],[-8,10,8,2],[8,6,2,8],[22,10,6,2],[38,8,2,8],[-40,-6,8,2],[-24,-10,2,8],[-6,-6,6,2],[10,-10,2,8],[26,-6,8,2],[42,-10,2,8],[-36,-22,2,10],[-18,-24,8,2],[0,-20,2,8],[18,-24,8,2],[36,-22,2,10],[-42,-36,8,2],[-26,-38,2,8],[-8,-40,10,2],[12,-38,2,8],[30,-40,8,2],[42,-34,2,8],[-14,14,2,6],[14,14,2,6],[-14,-14,2,6],[14,-14,2,6],[0,0,4,4]],
    bushSpecs: [[-44,44],[-30,44],[-10,44],[10,44],[30,44],[44,44],[-44,28],[-16,30],[16,30],[44,28],[-44,10],[-30,8],[0,12],[30,8],[44,10],[-44,-8],[-30,-8],[0,-8],[30,-8],[44,-8],[-44,-24],[-14,-26],[14,-26],[44,-24],[-44,-40],[-18,-42],[6,-42],[24,-42],[44,-40]],
    skullSpecs: [[-20,30],[20,30],[-20,-30],[20,-30],[0,18],[0,-18],[-30,0],[30,0]],
    lakes: [{x:-30,z:-14,width:10,depth:6},{x:30,z:14,width:10,depth:6}],
    spawns: [[-42,0,44],[-14,0,44],[14,0,44],[42,0,44],[44,0,14],[44,0,-20],[14,0,-42],[-14,0,-42],[-44,0,-20],[-44,0,14]] },
  { id: 2, name: "뼈의 미로",
    wallSpecs: [[-40,40,10,2],[-24,36,2,10],[0,40,12,2],[24,36,2,10],[40,40,10,2],[-42,24,2,8],[-30,18,8,2],[-14,24,2,10],[0,18,10,2],[14,24,2,10],[30,18,8,2],[42,24,2,8],[-38,6,6,2],[-20,2,2,10],[-6,6,6,2],[6,2,2,10],[20,6,6,2],[38,2,2,10],[-42,-10,8,2],[-28,-14,2,8],[-10,-10,10,2],[10,-14,2,8],[28,-10,8,2],[42,-14,2,8],[-36,-26,2,10],[-18,-28,8,2],[0,-26,2,10],[18,-28,8,2],[36,-26,2,10],[-40,-40,10,2],[-22,-42,2,8],[0,-40,12,2],[22,-42,2,8],[40,-40,10,2]],
    bushSpecs: [[-42,44],[-20,44],[0,44],[20,44],[42,44],[-36,28],[-6,28],[6,28],[36,28],[-42,12],[-28,8],[0,8],[28,8],[42,12],[-42,-6],[-14,-6],[14,-6],[42,-6],[-42,-22],[-10,-22],[10,-22],[42,-22],[-42,-38],[-10,-38],[10,-38],[42,-38]],
    skullSpecs: [[-30,30],[30,30],[-30,-30],[30,-30],[0,0],[-20,14],[20,14],[-20,-14],[20,-14],[0,30]],
    lakes: [{x:0,z:-34,width:14,depth:5}],
    spawns: [[-42,0,42],[-10,0,42],[10,0,42],[42,0,42],[44,0,10],[44,0,-18],[10,0,-44],[-10,0,-44],[-44,0,-18],[-44,0,10]] },
];

export function createLights() {
  const scene = G.scene;
  const hemi = new THREE.HemisphereLight(0xfdeac4, 0x7d5131, 1.35);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff3d8, 1.9);
  sun.position.set(24, 38, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -70; sun.shadow.camera.right = 70;
  sun.shadow.camera.top = 70; sun.shadow.camera.bottom = -70;
  scene.add(sun);
}

export function createGround(group) {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 120, 40, 40),
    new THREE.MeshStandardMaterial({ color: 0xc8895a, roughness: 0.98, metalness: 0 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  group.add(ground);
  const grid = new THREE.GridHelper(120, 24, 0xe2b27b, 0xd6a071);
  grid.position.y = 0.05;
  grid.material.opacity = 0.18; grid.material.transparent = true;
  group.add(grid);
}

export function createWall(x, z, width, depth, height = 2.8, group, solidsArr, color = 0xb77658) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0.02 }),
  );
  mesh.position.set(x, height * 0.5, z);
  mesh.castShadow = true; mesh.receiveShadow = true;
  group.add(mesh);
  solidsArr.push({ type: "wall", x, z, width, depth,
    minX: x - width * 0.5, maxX: x + width * 0.5,
    minZ: z - depth * 0.5, maxZ: z + depth * 0.5 });
}

export function createBush(x, z, radius, group, bushArr) {
  const bush = new THREE.Group();
  const clumpCount = 4 + Math.floor(Math.random() * 2);
  for (let i = 0; i < clumpCount; i++) {
    const cr = radius * (0.5 + Math.random() * 0.3);
    const clump = new THREE.Mesh(bushClumpGeo, bushClumpMats[i % bushClumpMats.length]);
    const angle = (i / clumpCount) * Math.PI * 2 + Math.random() * 0.6;
    const offset = radius * 0.35;
    clump.position.set(Math.cos(angle) * offset, cr * 0.7, Math.sin(angle) * offset);
    clump.scale.set(cr, cr * 0.75, cr);
    clump.rotation.y = Math.random() * Math.PI * 2;
    clump.castShadow = true;
    bush.add(clump);
  }
  bush.position.set(x, 0, z);
  group.add(bush);
  bushArr.push({ x, z, radius: radius + 0.25 });
}

function createSkullCluster(x, z, count, group) {
  const cluster = new THREE.Group();
  for (let i = 0; i < count; i++) {
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

function createLake(x, z, width, depth, group, lakesArr) {
  const lake = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.1, depth),
    new THREE.MeshStandardMaterial({ color: 0x2f96df, roughness: 0.2, metalness: 0, transparent: true, opacity: 0.92 }),
  );
  lake.position.set(x, 0.07, z);
  lake.receiveShadow = true;
  group.add(lake);
  lakesArr.push({ x, z, width, depth,
    minX: x - width * 0.5, maxX: x + width * 0.5,
    minZ: z - depth * 0.5, maxZ: z + depth * 0.5 });
}

export function clearBattleMap() {
  const bmg = G.battleMapGroup;
  bmg.traverse((obj) => {
    if (obj.geometry && obj.geometry !== bushClumpGeo) obj.geometry.dispose();
    if (obj.material) {
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((m) => { if (!bushClumpMats.includes(m)) m.dispose(); });
    }
  });
  bmg.clear();
  G.state.battleSolids = [];
  G.state.battleLakeRects = [];
  G.state.battleBushes = [];
}

export function createMap(mapData) {
  const state = G.state;
  const bmg = G.battleMapGroup;
  clearBattleMap();
  createGround(bmg);
  mapData.wallSpecs.forEach((spec) => createWall(...spec, undefined, bmg, state.battleSolids));
  mapData.bushSpecs.forEach(([x, z]) => createBush(x, z, 1.45 + Math.random() * 0.25, bmg, state.battleBushes));
  mapData.skullSpecs.forEach(([x, z]) => createSkullCluster(x, z, 8 + Math.floor(Math.random() * 5), bmg));
  mapData.lakes.forEach((lake) => createLake(lake.x, lake.z, lake.width, lake.depth, bmg, state.battleLakeRects));
  state.solids = state.battleSolids;
  state.lakeRects = state.battleLakeRects;
  state.bushes = state.battleBushes;
}

export function createTrainingMap() {
  const state = G.state;
  const tmg = G.trainingMapGroup;
  state.trainingSolids = [];

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 85, 25, 42),
    new THREE.MeshStandardMaterial({ color: 0x909090, roughness: 0.96, metalness: 0 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, 0.005, -7);
  ground.receiveShadow = true;
  tmg.add(ground);

  const grid = new THREE.GridHelper(50, 25, 0x6a6a6a, 0x7a7a7a);
  grid.position.set(0, 0.055, -7);
  grid.material.opacity = 0.28; grid.material.transparent = true;
  tmg.add(grid);

  const bWalls = [[0,35,50,2],[0,-49,50,2],[-26,-7,2,88],[26,-7,2,88]];
  bWalls.forEach(([x, z, w, d]) => createWall(x, z, w, d, 3.5, tmg, state.trainingSolids, 0x5c5c5c));

  const podium = new THREE.Mesh(
    new THREE.CylinderGeometry(3.8, 4.4, 0.45, 8),
    new THREE.MeshStandardMaterial({ color: 0x484848, roughness: 0.88, metalness: 0.05 }),
  );
  podium.position.set(0, 0.225, -5);
  podium.castShadow = true; podium.receiveShadow = true;
  tmg.add(podium);

  const lineGeo = new THREE.PlaneGeometry(50, 0.3);
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xffee44, transparent: true, opacity: 0.55 });
  const fireLine = new THREE.Mesh(lineGeo, lineMat);
  fireLine.rotation.x = -Math.PI / 2;
  fireLine.position.set(0, 0.07, 20);
  tmg.add(fireLine);

  for (let i = -2; i <= 2; i++) {
    const lane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.15, 55),
      new THREE.MeshBasicMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.25 }),
    );
    lane.rotation.x = -Math.PI / 2;
    lane.position.set(i * 8, 0.07, -7);
    tmg.add(lane);
  }

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      const marker = new THREE.Mesh(
        new THREE.CircleGeometry(1.3, 16),
        new THREE.MeshBasicMaterial({ color: 0xdd3311, transparent: true, opacity: 0.38, depthWrite: false }),
      );
      marker.rotation.x = -Math.PI / 2;
      marker.position.set((col - 2) * 4, 0.06, -16 - row * 5);
      tmg.add(marker);
    }
  }

  const bossMarker = new THREE.Mesh(
    new THREE.CircleGeometry(4, 24),
    new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.28, depthWrite: false }),
  );
  bossMarker.rotation.x = -Math.PI / 2;
  bossMarker.position.set(0, 0.06, -5);
  tmg.add(bossMarker);
}
