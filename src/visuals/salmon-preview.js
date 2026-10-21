import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Rigged walk preview only: Salmon has no playable combat implementation yet.
export function createSalmonPreview(map, solids, manager, canvas) {
  const root = new THREE.Group(); root.name = 'salmon-model-preview';
  root.position.set(-4, 1.5, -2); map.add(root);
  const pedestal = new THREE.Mesh(new THREE.BoxGeometry(3.4, .35, 2.4), new THREE.MeshStandardMaterial({ color: 0x48394f, roughness: .8 }));
  pedestal.position.y = .175; pedestal.receiveShadow = true; root.add(pedestal);
  solids.push({ x: -4, z: -2, halfW: 1.7, halfD: 1.2, top: 1.85, mesh: pedestal, walkable: false, destructible: false });
  const label = document.createElement('canvas'); label.width = 1024; label.height = 160;
  const ctx = label.getContext('2d');
  function caption(text) {
    ctx.fillStyle = '#251c33'; ctx.fillRect(0, 0, 1024, 160);
    ctx.fillStyle = '#fe7974'; ctx.font = 'bold 52px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, 512, 80); texture.needsUpdate = true;
  }
  const texture = new THREE.CanvasTexture(label);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.4, .69), new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }));
  sign.position.set(0, 3.9, 0); root.add(sign);
  caption('살몬 · 모델 준비 중'); canvas.dataset.salmonModel = 'loading';
  let mixer = null;
  const ready = new GLTFLoader(manager).loadAsync('./assets/3d/salmon/normal/salmon-preview.glb?v=2').then(({ scene: model, animations }) => {
    // GLB already supplies Y-up coordinates and its original-color materials.
    const bounds = new THREE.Box3().setFromObject(model, true);
    const size = bounds.getSize(new THREE.Vector3()), center = bounds.getCenter(new THREE.Vector3());
    const scale = 2.7 / Math.max(size.y, .001);
    model.scale.setScalar(scale);
    model.position.set(-center.x * scale, .35 - bounds.min.y * scale, -center.z * scale);
    model.traverse(part => { if (part.isMesh) { part.castShadow = true; part.receiveShadow = true; } });
    model.name = 'salmon-rigged-model'; root.add(model);
    model.userData.bindHeight = size.y * scale;
    model.userData.bindBottom = 1.5 + .35;
    const walk = animations.find(clip => clip.name.includes('Salmon_Walk_InPlace'));
    if (walk) { mixer = new THREE.AnimationMixer(model); mixer.clipAction(walk).play(); }
    model.userData.walkClip = walk?.name ?? null;
    caption('살몬 · 리깅 미리보기'); canvas.dataset.salmonModel = 'ready';
    return model;
  }).catch(error => {
    canvas.dataset.salmonModel = 'error'; caption('살몬 · 모델 불러오기 실패');
    console.error('Salmon preview model failed to load', error); return null;
  });
  return { root, ready, get mixer() { return mixer; }, update(dt) { if (root.parent?.visible) mixer?.update(dt); } };
}
