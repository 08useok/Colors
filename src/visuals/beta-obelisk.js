import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let obeliskPromise;
function loadObelisk() {
  return obeliskPromise ??= new GLTFLoader().loadAsync(
    new URL('../../assets/3d/environment/beta-obelisk/obelisk.glb?v=1', import.meta.url).href,
  ).then(({ scene }) => {
    scene.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(scene);
    const size = bounds.getSize(new THREE.Vector3());
    if (Math.min(size.x, size.y, size.z) <= 0) throw new Error('Empty obelisk bounds');
    const offset = new THREE.Matrix4().makeTranslation(
      -(bounds.min.x + bounds.max.x) / 2, -bounds.min.y, -(bounds.min.z + bounds.max.z) / 2);
    const parts = [];
    scene.traverse(mesh => {
      if (!mesh.isMesh) return;
      const geometry = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld).applyMatrix4(offset);
      parts.push({ geometry, material: mesh.material });
    });
    return { size, parts };
  });
}

// The existing root keeps its position, lean, visibility and collision bounds.
export function applyBetaObeliskModel(root, width, height, depth, canvas) {
  loadObelisk().then(({ size, parts }) => {
    const model = new THREE.Group();
    model.name = 'beta-obelisk-model';
    model.position.y = -height / 2;
    model.scale.set(width / size.x, height / size.y, depth / size.z);
    for (const part of parts) {
      const mesh = new THREE.Mesh(part.geometry, part.material);
      mesh.castShadow = true; mesh.receiveShadow = true;
      model.add(mesh);
    }
    root.add(model);
    root.material = new THREE.MeshBasicMaterial({ visible: false });
    root.castShadow = false;
    root.userData.betaObelisk = true;
    canvas.dataset.betaObeliskModel = 'ready';
    canvas.dataset.betaObeliskCount = String(Number(canvas.dataset.betaObeliskCount || 0) + 1);
    canvas.dataset.betaObeliskSourceSize = `${size.x.toFixed(3)},${size.y.toFixed(3)},${size.z.toFixed(3)}`;
  }).catch(error => {
    canvas.dataset.betaObeliskModel = 'fallback';
    console.error('Beta obelisk model failed to load', error);
  });
}
