import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const assetUrl = new URL('../../assets/3d/environment/beta-wall/wall.glb?v=1', import.meta.url);
let templatePromise;

function loadWall() {
  return templatePromise ??= new GLTFLoader().loadAsync(assetUrl.href).then(({ scene }) => {
    scene.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(scene);
    const size = bounds.getSize(new THREE.Vector3());
    if (Math.min(size.x, size.y, size.z) <= 0) throw new Error('Empty beta wall bounds');
    const offset = new THREE.Matrix4().makeTranslation(
      -(bounds.min.x + bounds.max.x) / 2, -bounds.min.y, -(bounds.min.z + bounds.max.z) / 2);
    const parts = [];
    scene.traverse(mesh => {
      if (!mesh.isMesh) return;
      const geometry = mesh.geometry.clone();
      geometry.applyMatrix4(mesh.matrixWorld).applyMatrix4(offset);
      parts.push({ geometry, material: mesh.material });
    });
    return { size, parts };
  });
}

// Extend the wall along its long horizontal axis; Y always remains vertical.
// Repeating sections avoids stretching a single stone texture across 40 tiles.
export function wallLayout(width, height, depth, size) {
  const alongZ = depth > width;
  const length = Math.max(width, depth);
  const thickness = Math.min(width, depth);
  const count = Math.max(1, Math.round(length / (height * size.x / size.y)));
  return { alongZ, count, section: length / count, thickness };
}

export function applyBetaWallModel(mesh, width, height, depth, canvas) {
  mesh.userData.betaWall = true;
  loadWall().then(({ size, parts }) => {
    if(mesh.userData.disposed)return;
    const layout = wallLayout(width, height, depth, size);
    const group = new THREE.Group();
    group.name = 'beta-wall-model';
    const transform = new THREE.Object3D();
    for (const part of parts) {
      const instances = new THREE.InstancedMesh(part.geometry, part.material, layout.count);
      instances.castShadow = true;
      instances.receiveShadow = true;
      for (let index = 0; index < layout.count; index++) {
        const offset = (index + .5) * layout.section - Math.max(width, depth) / 2;
        transform.position.set(layout.alongZ ? 0 : offset, -height / 2, layout.alongZ ? offset : 0);
        transform.rotation.set(0, layout.alongZ ? Math.PI / 2 : 0, 0);
        transform.scale.set(layout.section / size.x, height / size.y, layout.thickness / size.z);
        transform.updateMatrix();
        instances.setMatrixAt(index, transform.matrix);
      }
      instances.instanceMatrix.needsUpdate = true;
      instances.computeBoundingBox();
      instances.computeBoundingSphere();
      group.add(instances);
    }
    // Keep the same root for collision, wall destruction and mode visibility.
    mesh.add(group);
    if(mesh.userData.eventTerrain)mesh.material.dispose();
    mesh.material = new THREE.MeshBasicMaterial({ visible: false });
    mesh.castShadow = false;
    canvas.dataset.betaWallModel = 'ready';
    canvas.dataset.betaWallCount = String(Number(canvas.dataset.betaWallCount || 0) + 1);
    canvas.dataset.betaWallSourceSize = `${size.x.toFixed(3)},${size.y.toFixed(3)},${size.z.toFixed(3)}`;
  }).catch(error => {
    // The original solid box remains usable when the asset cannot load.
    canvas.dataset.betaWallModel = 'fallback';
    console.error('Beta wall model failed to load', error);
  });
}
