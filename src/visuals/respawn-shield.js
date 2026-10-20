import * as THREE from 'three';

export const RESPAWN_PROTECTION_SECONDS = 5;

export function createRespawnShields() {
  const active = new Map();
  function remove(target) {
    const entry = active.get(target);
    if (!entry) return;
    target.remove(entry.mesh);
    entry.mesh.traverse(part => { part.geometry?.dispose(); part.material?.dispose(); });
    active.delete(target);
  }
  return {
    show(target, until, { radius = 1.35, height = 1.2 } = {}) {
      let entry = active.get(target);
      if (!entry) {
        const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(radius, 2), new THREE.MeshBasicMaterial({
          color: 0x8eeaff, transparent: true, opacity: .45, wireframe: true, depthWrite: false,
        }));
        mesh.add(new THREE.Mesh(new THREE.SphereGeometry(radius, 20, 14), new THREE.MeshBasicMaterial({
          color: 0x8eeaff, transparent: true, opacity: .1, depthWrite: false,
        })));
        mesh.name = 'respawn-invulnerability-shield'; mesh.position.y = height;
        mesh.scale.y = 1.2; target.add(mesh);
        entry = { mesh, until }; active.set(target, entry);
      }
      entry.until = Math.max(entry.until, until);
    },
    update(now) {
      for (const [target, entry] of active) {
        if (now >= entry.until) { remove(target); continue; }
        entry.mesh.visible = target.visible;
        entry.mesh.rotation.y = now * .65;
        const fade = Math.min(1, (entry.until - now) / .4);
        entry.mesh.material.opacity = (.4 + Math.sin(now * 7) * .05) * fade;
        entry.mesh.children[0].material.opacity = .1 * fade;
      }
    },
    remove,
    clear() { for (const target of active.keys()) remove(target); },
    get size() { return active.size; },
  };
}
