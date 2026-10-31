import * as THREE from 'three';
import { skinEffectProfile } from '../config/skin-effects.js';

// Independent cosmetic particles: no collision meshes or combat state writes.
export function createSkinEffects(scene) {
  const effects = [], ambient = new Map();
  const geometry = new THREE.OctahedronGeometry(.075);
  const limit = 160;
  function remove(index) {
    const e = effects.splice(index,1)[0];
    scene.remove(e.mesh); e.mesh.material.dispose();
  }
  function particle(position,color,velocity,life,size=1) {
    if (effects.length >= limit) remove(0);
    const mesh = new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color,transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending}));
    mesh.name = 'SkinTierParticle'; mesh.position.copy(position); mesh.scale.setScalar(size);
    scene.add(mesh); effects.push({mesh,velocity,life,maxLife:life,size});
  }
  function burst(characterId,skinId,kind,position) {
    const profile = skinEffectProfile(characterId,skinId);
    if (!profile?.[kind]) return false;
    const count = kind === 'ultimate' ? 18 : 8;
    for (let i=0;i<count;i++) {
      const angle=i/count*Math.PI*2, speed=kind==='ultimate'?3.2:1.7;
      const origin=position.clone(); origin.y+=.9;
      particle(origin,profile.color,new THREE.Vector3(Math.cos(angle)*speed,1+i%3*.25,Math.sin(angle)*speed),kind==='ultimate'?.65:.35,kind==='ultimate'?1.6:1);
    }
    return true;
  }
  return {
    effects, burst,
    update(dt,subjects=[]) {
      const active = new Set();
      for (const subject of subjects) {
        const profile=skinEffectProfile(subject.characterId,subject.skinId);
        if (!profile?.ambient || !subject.visible) continue;
        active.add(subject.key);
        const previous=ambient.get(subject.key);
        const timer=(previous?.timer??0)+dt;
        if (timer>=.12) {
          const position=subject.position.clone();
          const angle=(previous?.phase??0)+2.4;
          position.x+=Math.cos(angle)*.55; position.z+=Math.sin(angle)*.55; position.y+=.25;
          particle(position,profile.color,new THREE.Vector3(0,.7,0),.5,.7);
          ambient.set(subject.key,{timer:0,phase:angle});
        } else ambient.set(subject.key,{timer,phase:previous?.phase??0});
      }
      for (const key of ambient.keys()) if (!active.has(key)) ambient.delete(key);
      for (let i=effects.length-1;i>=0;i--) {
        const e=effects[i]; e.life-=dt;
        if (e.life<=0) {remove(i);continue;}
        e.mesh.position.addScaledVector(e.velocity,dt);
        e.mesh.material.opacity=.8*e.life/e.maxLife;
        e.mesh.scale.setScalar(e.size*(.4+.6*e.life/e.maxLife));
        e.mesh.rotation.y+=dt*3;
      }
    },
    clear(){for(let i=effects.length-1;i>=0;i--)remove(i);ambient.clear();},
  };
}
