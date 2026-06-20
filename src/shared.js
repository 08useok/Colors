import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js";

export { THREE };

export const G = {
  state: null,
  scene: null,
  camera: null,
  renderer: null,
  clock: null,
  tempVec3: null,
  battleMapGroup: null,
  trainingMapGroup: null,
  audio: null,
};

export const CONST = {
  worldRadius: 52,
  attackDepth: 5,
  attackWidth: 2.3,
  attackHalfWidth: 2.3 * 0.5,
  baseMoveSpeed: 10.4,
  turnSpeed: 4.4,
  maxAmmo: 3,
  reloadDuration: 0.5,
  attackCooldown: 0.62,
  attackEvents: [
    { delay: 0.12, damage: 2000 },
    { delay: 0.36, damage: 2000 },
  ],
  bushStealthRevealRangeSq: 3 * 3,
};
