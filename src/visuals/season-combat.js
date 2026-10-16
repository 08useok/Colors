import * as THREE from 'three';
import {createYellowCircuitDeviceMesh,createYellowCircuitWireMesh} from './yellow-circuit.js';
export function createSeasonCombatVisuals(scene,BETA_CHARACTERS){
 let renderTime=0;const clock={get elapsedTime(){return renderTime;}};const visuals=new Map();const groundHeightAt=()=>0;let lavenderMistTexture=null;
 const dispose=mesh=>{scene.remove(mesh);mesh.traverse(p=>{p.geometry?.dispose();for(const m of Array.isArray(p.material)?p.material:[p.material])m?.dispose();});};
 const material=(color,opacity=1)=>new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.3,transparent:opacity<1,opacity,depthWrite:opacity===1});
 function objectMesh(o,zone){
  if(['perfumeSpray','fragrance'].includes(o.kind))return createLavenderMist(o);
  const color=({ivory:0xfff4dd,mint:0x98ffdc,crystal:0x9ef2ff,gold:0xffd347,bomb:0xf28b21,juice:0xffb457,vial:0x9933aa,orangePeel:0xff9b32,wave:0x15cced})[o.kind]??BETA_CHARACTERS[o.owner.id].color??0xffffff;
  if(zone){const m=new THREE.Mesh(new THREE.CircleGeometry(o.radius??4,32),material(color,.25));m.rotation.x=-Math.PI/2;return m;}
  if(o.kind==='orangePeel'){const m=new THREE.Mesh(new THREE.TorusGeometry(.24,.075,6,14,Math.PI*1.35),material(color));m.rotation.x=Math.PI/2;return m;}
  if(o.kind==='wave')return new THREE.Mesh(new THREE.BoxGeometry(o.width??4,.6,1),material(color,.65));
  return createBeta6ProjectileMesh(o,color);
 }
 function put(key,make,visible){visible.add(key);let mesh=visuals.get(key);if(!mesh){mesh=make();visuals.set(key,mesh);scene.add(mesh);}return mesh;}
 return {
  sync(world){const dt=world.time-renderTime;renderTime=world.time;const visible=new Set();
   for(const o of [...world.projectiles,...world.zones]){const zone=world.zones.includes(o),mesh=put(`${zone?'z':'p'}${o.key}`,()=>objectMesh(o,zone),visible);const point=o.kind==='lock'?o.owner:o;mesh.position.set(point.x,zone?.08:.8,point.z);if(!zone&&o.kind==='ivory'){const progress=o.reach>0?Math.min(1,o.traveled/o.reach):1;const start=mesh.userData.throwStartY??=(o.owner.fighter?.mesh.position.y??1.85)+1.35;mesh.position.y=start+(Math.sin(progress*Math.PI)*4.2)-progress*(start-.35);mesh.rotation.x=progress*Math.PI*2;}if(['perfumeSpray','fragrance'].includes(o.kind))updateLavenderMist(mesh,o,world.time);else if(o.kind==='wave')mesh.rotation.y=Math.PI/2-o.yaw;else if(mesh.userData.beta6Oriented)mesh.rotation.y=Math.PI/2-o.yaw;else if(mesh.userData.beta6Spin)mesh.rotation.y=world.time*12;}
   for(const a of world.actors){
    if(a.leap&&!a.fighter.dead){const progress=Math.min(1,(world.time-a.leap.startedAt)/a.leap.duration);a.fighter.mesh.position.y=1.85+Math.sin(progress*Math.PI)*(a.u.jumpHeight??5);}else if(!a.fighter.dead)a.fighter.mesh.position.y=1.85;
    for(let i=0;i<a.devices.length;i++){const d=a.devices[i],mesh=put(`d${a.key}:${i}`,createYellowCircuitDeviceMesh,visible);mesh.position.set(d.x,.02,d.z);if(i){const from=a.devices[i-1];put(`w${a.key}:${i}`,()=>createYellowCircuitWireMesh(new THREE.Vector3(from.x,.52,from.z),new THREE.Vector3(d.x,.52,d.z)),visible);}}
    if(a.analysisTarget){const target=a.analysisTarget,remaining=Math.max(0,target.analysisExpires-world.time),urgency=1-remaining/a.u.analysisDuration,mesh=put(`analysis${a.key}`,createCrystalAnalysisMark,visible);mesh.position.set(target.x,4.7,target.z);updateCrystalAnalysisMark(mesh,urgency,dt);if(remaining<=1){const finisher=put(`finish${a.key}`,createCrystalFinisherMesh,visible),progress=1-remaining;finisher.position.set(target.x,4.35+crystalFinisherRise(progress)*4.5,target.z);finisher.rotation.y+=dt*6;finisher.rotation.x=progress*2.2;}}
    if(world.time<a.guardUntil){const mesh=put(`guard${a.key}`,()=>new THREE.Mesh(new THREE.SphereGeometry(1.5,16,12),material(0xff6666,.2)),visible);mesh.position.set(a.x,1.8,a.z);}
   }
   for(const[key,mesh]of visuals)if(!visible.has(key)){dispose(mesh);visuals.delete(key);}
  },
  clear(){for(const mesh of visuals.values())dispose(mesh);visuals.clear();},
 };
function getLavenderMistTexture() {
  if (lavenderMistTexture) return lavenderMistTexture;
  const image = document.createElement("canvas");
  image.width = image.height = 64;
  const context = image.getContext("2d");
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,0.8)");
  gradient.addColorStop(.4, "rgba(255,255,255,0.4)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  lavenderMistTexture = new THREE.CanvasTexture(image);
  return lavenderMistTexture;
}

function createLavenderMist(zone) {
  const spray = zone.kind === "perfumeSpray";
  // Keep the root upright: only the range marker lies on the ground.
  const mesh = new THREE.Group();
  const footprint = new THREE.Mesh(spray
    ? new THREE.CircleGeometry(zone.radius, 32, -zone.halfAngle, zone.halfAngle * 2)
    : new THREE.CircleGeometry(zone.radius, 32),
    new THREE.MeshBasicMaterial({ color: 0xb48be8, transparent: true, opacity: .1, depthWrite: false, side: THREE.DoubleSide }));
  footprint.rotation.x = -Math.PI / 2;
  mesh.add(footprint);
  mesh.userData.lavenderFootprint = footprint;
  mesh.userData.lavenderParticles = [];
  const count = spray ? 24 : 32;
  for (let index = 0; index < count; index++) {
    const mist = new THREE.Sprite(new THREE.SpriteMaterial({ map: getLavenderMistTexture(),
      color: 0xe6c4ff, transparent: true, opacity: 0, depthWrite: false }));
    mist.userData.seed = (index * .61803398875) % 1;
    mist.userData.angle = spray ? -zone.halfAngle + (index + .5) / count * zone.halfAngle * 2 : index / count * Math.PI * 2;
    mesh.add(mist);
    mesh.userData.lavenderParticles.push(mist);
  }
  updateLavenderMist(mesh, zone, zone.startedAt ?? (zone.kind === "perfumeSpray" ? zone.until - BETA_CHARACTERS.lavender.sprayDuration : zone.until - BETA_CHARACTERS.lavender.special.duration));
  scene.add(mesh);
  return mesh;
}

function updateLavenderMist(mesh, zone, time) {
  const spray = zone.kind === "perfumeSpray";
  const duration = spray ? BETA_CHARACTERS.lavender.sprayDuration : BETA_CHARACTERS.lavender.special.duration;
  const age = Math.max(0, time - (zone.startedAt ?? zone.until - duration));
  const progress = Math.min(1, age / duration);
  const fade = Math.min(1, (zone.until - time) / (spray ? .25 : .7));
  const center = spray ? zone : (zone.owner ?? zone);
  mesh.position.set(center.x, groundHeightAt(center.x, center.z) + .08, center.z);
  mesh.rotation.y = spray ? -zone.yaw : 0;
  const front = spray ? Math.min(zone.radius, age * (zone.spraySpeed ?? BETA_CHARACTERS.lavender.spraySpeed)) : zone.radius;
  mesh.userData.lavenderFootprint.scale.set(front / zone.radius, front / zone.radius, 1);
  mesh.userData.lavenderFootprint.material.opacity = .1 * Math.max(0, fade);
  for (const mist of mesh.userData.lavenderParticles) {
    const seed = mist.userData.seed;
    const phase = spray ? Math.min(1, progress * 1.5 + seed * .45) : (age * .35 + seed) % 1;
    const angle = mist.userData.angle + (spray ? 0 : Math.sin(age + seed * 6) * .12);
    const reach = spray ? front * (.15 + seed * .85) : zone.radius * (.15 + Math.sqrt(seed) * .7);
    mist.position.set(Math.cos(angle) * reach, .35 + phase * 1.1, Math.sin(angle) * reach);
    const size = (spray ? .6 : .8) + phase * .8;
    mist.scale.set(size, size, 1);
    mist.material.opacity = (spray ? .38 : .24) * Math.sin(Math.PI * (.1 + phase * .8)) * Math.max(0, fade);
  }
}

function createBeta6ProjectileMesh(projectile, color) {
  const kind = projectile.kind;
  const ownerId = projectile.owner?.id;
  const orient = (mesh) => { mesh.userData.beta6Oriented = true; return mesh; };
  if (kind === "yellowDevice") return createYellowCircuitDeviceMesh();
  if (kind === "boomerang") {
    const mesh = createGreenBoomerangMesh();
    mesh.userData.beta6Spin = true;
    return mesh;
  }
  if (kind === "electric") return orient(createYellowBoltMesh());
  if (kind === "needle") return orient(createPurpleNeedleMesh());
  if (kind === "vial") return createPurpleVialMesh();
  if (kind === "mint") return orient(createMintIceCreamMesh());
  if (kind === "orangePeel") {
    const mesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.24, 0.075, 6, 14, Math.PI * 1.35),
      new THREE.MeshStandardMaterial({ color: 0xff9b32, emissive: 0x8a2d00, emissiveIntensity: 0.34, roughness: 0.56 }),
    );
    mesh.rotation.x = Math.PI / 2;
    mesh.userData.beta6Spin = true;
    return mesh;
  }
  if (["enhanced", "cc", "plague", "blank"].includes(kind)) return createChartreuseRoundMesh(kind);
  if (kind === "bullet") return orient(ownerId === "cyan" ? createCyanPillMesh() : createBlueMarbleMesh());
  if (kind === "crystal" || kind === "gold") {
    const sizes = kind === "crystal" ? [0, 0.34, 0.24, 0.16] : [0, 0.5, 0.34, 0.22];
    const size = sizes[projectile.stage] ?? 0.24;
    const tint = kind === "crystal" ? 0x9ef2ff : 0xffd347;
    return new THREE.Mesh(
      new THREE.OctahedronGeometry(size, 0),
      new THREE.MeshStandardMaterial({ color: tint, emissive: tint, emissiveIntensity: 0.8, metalness: 0.5, roughness: 0.2 }),
    );
  }
  if (kind === "bomb" || kind === "juice") {
    return new THREE.Mesh(
      new THREE.SphereGeometry(kind === "bomb" ? 0.28 : 0.16, 10, 8),
      new THREE.MeshStandardMaterial({ color: kind === "bomb" ? 0xf28b21 : 0xffb457, roughness: 0.78 }),
    );
  }
  if (kind === "ivory") {
    return new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0xfff3dd, emissive: 0xd9c39a, emissiveIntensity: 0.5, roughness: 0.4 }),
    );
  }
  return new THREE.Mesh(
    new THREE.SphereGeometry(Math.max(0.12, projectile.radius ?? 0.2), 8, 6),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, depthWrite: false }),
  );
}

function createGreenBoomerangMesh() {
  const shape = new THREE.Shape();
  const outerRadius = 0.62;
  const innerRadius = 0.34;
  const start = -Math.PI * 0.78;
  const end = Math.PI * 0.78;
  for (let i = 0; i <= 18; i += 1) {
    const angle = start + (end - start) * (i / 18);
    const x = Math.cos(angle) * outerRadius;
    const y = Math.sin(angle) * outerRadius;
    if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
  }
  for (let i = 18; i >= 0; i -= 1) {
    const angle = start + (end - start) * (i / 18);
    shape.lineTo(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius);
  }
  shape.closePath();
  const material = new THREE.MeshStandardMaterial({
    color: 0x74ee18,
    emissive: 0x2a9a08,
    emissiveIntensity: 1.2,
    roughness: 0.28,
    metalness: 0.08,
  });
  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
  mesh.scale.set(1.05, 1.05, 1.05);
  return mesh;
}

function createBlueMarbleMesh() {
  const group = new THREE.Group();
  const headRadius = 0.14;
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(headRadius, 12, 10),
    new THREE.MeshStandardMaterial({
      color: 0x4f83ff, emissive: 0x1c3fbf, emissiveIntensity: 1.4,
      metalness: 0.5, roughness: 0.15, transparent: true, opacity: 0.95,
    }),
  );
  group.add(head);
  const tailLength = 0.5;
  const tail = new THREE.Mesh(
    // openEnded로 바닥면을 없애 구슬 뒤에 자연스럽게 이어지도록 한다
    new THREE.ConeGeometry(0.1, tailLength, 10, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x9fc6ff, transparent: true, opacity: 0.45,
      depthWrite: false, blending: THREE.AdditiveBlending,
    }),
  );
  // 콘의 뾰족한 끝(로컬 +Y)이 진행 방향의 반대(뒤쪽)를 향하도록 -90도 회전
  tail.rotation.x = -Math.PI / 2;
  tail.position.z = -(headRadius + tailLength / 2 - 0.05);
  group.add(tail);
  return group;
}

function createMintIceCreamMesh() {
  const group = new THREE.Group();
  const scoopRadius = 0.22;
  const scoop = new THREE.Mesh(
    new THREE.SphereGeometry(scoopRadius, 12, 10),
    new THREE.MeshStandardMaterial({ color: 0x98ffed, emissive: 0x2fae8f, emissiveIntensity: 0.35, roughness: 0.4, metalness: 0.05 }),
  );
  group.add(scoop);
  const coneLength = 0.34;
  const cone = new THREE.Mesh(
    // openEnded로 바닥면을 없애 스쿱 뒤에 자연스럽게 이어지도록 한다
    new THREE.ConeGeometry(scoopRadius, coneLength, 8, 1, true),
    new THREE.MeshStandardMaterial({ color: 0xd9a24d, roughness: 0.78, metalness: 0 }),
  );
  // 콘의 뾰족한 끝(로컬 +Y)이 진행 방향의 반대(뒤쪽)를 향하도록 -90도 회전.
  // 콘 밑면이 스쿱 중심 쪽으로 반지름의 절반만큼 파고들어 스쿱과 절반
  // 겹치도록 배치한다.
  cone.rotation.x = -Math.PI / 2;
  cone.position.z = -(scoopRadius / 2 + coneLength / 2);
  group.add(cone);
  return group;
}

function createYellowBoltMesh() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.1, 0.32);
  shape.lineTo(0.08, 0.06);
  shape.lineTo(-0.04, 0.06);
  shape.lineTo(0.1, -0.32);
  shape.lineTo(-0.06, -0.02);
  shape.lineTo(0.06, -0.02);
  shape.closePath();
  const mesh = new THREE.Mesh(
    new THREE.ShapeGeometry(shape),
    new THREE.MeshBasicMaterial({
      color: 0xfff45a, transparent: true, opacity: 0.95,
      side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
    }),
  );
  return mesh;
}

function createCyanPillMesh() {
  const mesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.09, 0.28, 4, 8),
    new THREE.MeshStandardMaterial({
      color: 0x32f4ff, emissive: 0x0aa4b8, emissiveIntensity: 1.1,
      metalness: 0.3, roughness: 0.2, transparent: true, opacity: 0.95,
    }),
  );
  mesh.rotation.x = Math.PI / 2;
  return mesh;
}

function createPurpleNeedleMesh() {
  const mesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.095, 0.78, 8),
    new THREE.MeshStandardMaterial({
      color: 0xc04cff, emissive: 0x6a1899, emissiveIntensity: 1.2,
      metalness: 0.2, roughness: 0.25, transparent: true, opacity: 0.95,
    }),
  );
  mesh.rotation.x = Math.PI / 2;
  return mesh;
}

function createPurpleVialMesh() {
  const group = new THREE.Group();
  const glass = new THREE.MeshStandardMaterial({
    color: 0x9b3fd6, transparent: true, opacity: 0.75, roughness: 0.15, metalness: 0.1,
  });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), glass);
  body.scale.set(1, 1.15, 1);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.16, 8), glass);
  neck.position.y = 0.24;
  const cork = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.075, 0.08, 8),
    new THREE.MeshStandardMaterial({ color: 0x5d3b16, roughness: 0.9 }),
  );
  cork.position.y = 0.34;
  group.add(body, neck, cork);
  return group;
}

function createChartreuseRoundMesh(roundType) {
  const paint = {
    enhanced: { color: 0xfff200, emissive: 0xc8a600, emissiveIntensity: 1.6, opacity: 0.98 },
    cc: { color: 0x9acd32, emissive: 0x5c8a12, emissiveIntensity: 1.2, opacity: 0.96 },
    plague: { color: 0x241832, emissive: 0x3fae2a, emissiveIntensity: 1.3, opacity: 0.95 },
    blank: { color: 0xffffff, emissive: 0x888888, emissiveIntensity: 0.4, opacity: 0.6 },
  }[roundType] || { color: 0xffffff, emissive: 0x888888, emissiveIntensity: 0.6, opacity: 0.9 };
  const mesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.17, 0),
    new THREE.MeshStandardMaterial({
      color: paint.color, emissive: paint.emissive, emissiveIntensity: paint.emissiveIntensity,
      metalness: 0.25, roughness: 0.35, transparent: true, opacity: paint.opacity,
    }),
  );
  return mesh;
}

function createCrystalAnalysisMark() {
  const group = new THREE.Group();
  const glow = (color, opacity) => new THREE.MeshBasicMaterial({
    color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
  // 머리 위에서 도는 두 겹 고리
  const outerRing = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.045, 8, 40), glow(0x9ef2ff, 0.9));
  outerRing.rotation.x = Math.PI / 2;
  const innerRing = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.03, 8, 32), glow(0xffffff, 0.75));
  innerRing.rotation.x = Math.PI / 2;
  group.add(outerRing, innerRing);
  // 고리를 따라 도는 수정 조각
  const shards = [];
  for (let i = 0; i < 5; i += 1) {
    const shard = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.17, 0),
      new THREE.MeshStandardMaterial({
        color: 0x9ef2ff, emissive: 0x2aa6c8, emissiveIntensity: 1.6,
        metalness: 0.5, roughness: 0.12, transparent: true, opacity: 0.95,
      }),
    );
    group.add(shard);
    shards.push(shard);
  }
  // 대상을 감싸는 빛기둥
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.05, 3.4, 18, 1, true), glow(0x6ee7ff, 0.22));
  pillar.position.y = -1.6;
  group.add(pillar);
  group.userData.parts = { outerRing, innerRing, shards, pillar };
  group.renderOrder = 40;
  scene.add(group);
  return group;
}

function updateCrystalAnalysisMark(mark, urgency, dt) {
  const { outerRing, innerRing, shards, pillar } = mark.userData.parts;
  const spin = 1.6 + urgency * 7;
  outerRing.rotation.z += dt * spin;
  innerRing.rotation.z -= dt * spin * 1.6;
  const pulse = 1 + Math.sin(clock.elapsedTime * (5 + urgency * 12)) * (0.06 + urgency * 0.1);
  outerRing.scale.setScalar(pulse);
  innerRing.scale.setScalar(2 - pulse);
  outerRing.material.opacity = 0.75 + urgency * 0.25;
  pillar.material.opacity = 0.18 + urgency * 0.4;
  pillar.scale.set(1 - urgency * 0.25, 1, 1 - urgency * 0.25);
  for (let i = 0; i < shards.length; i += 1) {
    const angle = clock.elapsedTime * spin + (i / shards.length) * Math.PI * 2;
    // 즉사가 가까울수록 조각이 머리 쪽으로 좁혀 들어온다
    const radius = 0.95 - urgency * 0.45;
    shards[i].position.set(Math.cos(angle) * radius, Math.sin(angle * 2 + i) * 0.12, Math.sin(angle) * radius);
    shards[i].rotation.y += dt * 4;
    shards[i].rotation.x += dt * 2.5;
  }
}

function crystalFinisherRise(progress) {
  return progress < 0.45
    ? THREE.MathUtils.smoothstep(progress / 0.45, 0, 1)
    : 1 - Math.pow((progress - 0.45) / 0.55, 2);
}

function createCrystalFinisherMesh() {
  const mesh = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.85, 0),
    new THREE.MeshStandardMaterial({
      color: 0x9ef2ff, emissive: 0x2aa6c8, emissiveIntensity: 1.2,
      metalness: 0.5, roughness: 0.15, transparent: true, opacity: 0.95,
    }),
  );
  scene.add(mesh);
  return mesh;
}
}
