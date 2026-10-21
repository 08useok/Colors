import * as THREE from 'three';

// The caller supplies its own movement state; an exhibit passes false.
export function createSalmonMotion(model, clips) {
  const mixer = new THREE.AnimationMixer(model);
  const idle = clips.find(clip => clip.name === 'Salmon_Idle');
  const walk = clips.find(clip => clip.name === 'Salmon_Walk_InPlace');
  if (!idle || !walk) throw new Error('Salmon idle/walk clips are missing');
  const actions = { idle: mixer.clipAction(idle), walk: mixer.clipAction(walk) };
  let current = 'idle'; actions.idle.play();
  return { mixer, get current() { return current; },
    update(dt, moving = false) {
      const next = moving ? 'walk' : 'idle';
      if (next !== current) {
        actions[next].reset().play();
        actions[current].crossFadeTo(actions[next], .18, false);
        current = next;
      }
      mixer.update(dt);
    },
  };
}
