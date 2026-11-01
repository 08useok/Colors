import * as THREE from 'three';

// Raspberry visuals: vine shot, prison warning/field and the vine coil on bound targets.
export const RASPBERRY_COLORS = { berry: 0xd6336c, vine: 0x4caf50, leaf: 0x7bd36b, warning: 0xff5c8a };

export function createVineShotMesh() {
  const group = new THREE.Group();
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, .9, 8), new THREE.MeshStandardMaterial({ color: RASPBERRY_COLORS.vine, roughness: .6 }));
  stem.rotation.z = Math.PI / 2;
  group.add(stem);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(.15, 12, 8), new THREE.MeshStandardMaterial({ color: RASPBERRY_COLORS.berry, roughness: .45 }));
  tip.position.x = .5;
  group.add(tip);
  for (const side of [-1, 1]) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(.12, 8, 6), new THREE.MeshStandardMaterial({ color: RASPBERRY_COLORS.leaf }));
    leaf.scale.set(1.4, .25, .7); leaf.position.set(-.1, .05, side * .12);
    group.add(leaf);
  }
  // Shots travel along +x in local space; the caller orients by yaw.
  group.userData.beta6Oriented = true;
  return group;
}

export function createVinePrisonMesh(radius, warning) {
  const group = new THREE.Group();
  group.name = warning ? 'raspberry-prison-warning' : 'raspberry-prison';
  const disk = new THREE.Mesh(new THREE.CircleGeometry(radius, 40), new THREE.MeshBasicMaterial({ color: warning ? RASPBERRY_COLORS.warning : RASPBERRY_COLORS.vine, transparent: true, opacity: warning ? .16 : .2, depthWrite: false, side: THREE.DoubleSide }));
  disk.rotation.x = -Math.PI / 2;
  group.add(disk);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, warning ? .06 : .12, 6, 48), new THREE.MeshBasicMaterial({ color: warning ? RASPBERRY_COLORS.warning : RASPBERRY_COLORS.vine, transparent: true, opacity: .85, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = .03;
  group.add(ring);
  if (!warning) {
    // Thorny posts around the rim read as a cage from the top-down camera.
    for (let i = 0; i < 12; i++) {
      const angle = i / 12 * Math.PI * 2;
      const post = new THREE.Mesh(new THREE.ConeGeometry(.16, .9, 5), new THREE.MeshStandardMaterial({ color: RASPBERRY_COLORS.vine }));
      post.position.set(Math.cos(angle) * radius, .45, Math.sin(angle) * radius);
      group.add(post);
      if (i % 3 === 0) {
        const berry = new THREE.Mesh(new THREE.SphereGeometry(.14, 10, 8), new THREE.MeshStandardMaterial({ color: RASPBERRY_COLORS.berry }));
        berry.position.set(Math.cos(angle) * radius, .95, Math.sin(angle) * radius);
        group.add(berry);
      }
    }
  }
  group.userData = { disk, ring, warning };
  return group;
}

export function updateVinePrisonMesh(mesh, time) {
  const { disk, ring, warning } = mesh.userData;
  if (warning) {
    const pulse = .5 + .5 * Math.sin(time * 18);
    ring.material.opacity = .45 + pulse * .5;
    disk.material.opacity = .1 + pulse * .12;
  } else {
    mesh.rotation.y = time * .25;
  }
}

export function createRootMarker() {
  const group = new THREE.Group();
  group.name = 'raspberry-root';
  const material = new THREE.MeshStandardMaterial({ color: RASPBERRY_COLORS.vine, roughness: .7 });
  for (let i = 0; i < 3; i++) {
    const coil = new THREE.Mesh(new THREE.TorusGeometry(.55 - i * .06, .05, 6, 24), material);
    coil.rotation.x = -Math.PI / 2; coil.position.y = .12 + i * .22;
    group.add(coil);
  }
  const leaf = new THREE.Mesh(new THREE.SphereGeometry(.13, 8, 6), new THREE.MeshStandardMaterial({ color: RASPBERRY_COLORS.leaf }));
  leaf.scale.set(1.5, .3, .8); leaf.position.set(.5, .6, 0);
  group.add(leaf);
  return group;
}

// Draws a combat world's vine shots, prisons and bound actors. Used by beta matches and practice.
export function createRaspberryVisuals(scene, ground = () => 0) {
  const meshes = new Map();
  const dispose = mesh => { scene.remove(mesh); mesh.traverse(p => { p.geometry?.dispose(); for (const m of Array.isArray(p.material) ? p.material : [p.material]) m?.dispose(); }); };
  const get = (key, make) => { let m = meshes.get(key); if (!m) { m = make(); meshes.set(key, m); scene.add(m); } return m; };
  return {
    update(world) {
      const live = new Set();
      for (const p of world.projectiles) if (p.kind === 'vine' && world.time >= p.start) {
        const key = 'v' + p.key; live.add(key);
        const m = get(key, createVineShotMesh);
        m.position.set(p.x, ground(p.x, p.z) + 1.25, p.z); m.rotation.y = -p.yaw;
      }
      for (const z of world.zones) if (z.kind === 'vinePrison' || z.kind === 'vinePrisonWarning') {
        const key = 'z' + z.key; live.add(key);
        const m = get(key, () => createVinePrisonMesh(z.radius, z.kind === 'vinePrisonWarning'));
        m.position.set(z.x, ground(z.x, z.z) + .06, z.z); updateVinePrisonMesh(m, world.time);
      }
      for (const a of world.actors) if (a.hp > 0 && world.time < (a.rootUntil ?? 0)) {
        const key = 'r' + a.key; live.add(key);
        const m = get(key, createRootMarker);
        m.position.set(a.x, ground(a.x, a.z) + .02, a.z);
        m.rotation.y = world.time * .8;
      }
      for (const [key, m] of meshes) if (!live.has(key)) { dispose(m); meshes.delete(key); }
    },
    clear() { for (const m of meshes.values()) dispose(m); meshes.clear(); },
    get size() { return meshes.size; },
  };
}
