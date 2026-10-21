import * as THREE from 'three';

// Additive poses run after the walk mixer, then are restored before its next
// update. They never move the fighter root or change combat timing/hitboxes.
export const RIG_ATTACK_PROFILES = {
  red: {duration:.48, kind:'combo', hits:2},
  crimson: {duration:.42, kind:'combo', hits:3},
  mint: {duration:.54, kind:'combo', hits:3},
  green: {duration:.5, kind:'throw'},
  orange: {duration:.56, kind:'throw'},
  purple: {duration:.5, kind:'throw'},
  ivory: {duration:.56, kind:'throw'},
  blue: {duration:.34, kind:'shot'},
  cyan: {duration:.4, kind:'dual'},
  yellow: {duration:.4, kind:'dual'},
  gold: {duration:.5, kind:'shot'},
  pink: {duration:.55, kind:'slam'},
  chartreuse: {duration:.42, kind:'shot'},
  azure: {duration:.5, kind:'dual'},
  crystal: {duration:.4, kind:'shot'},
  lavender: {duration:.55, kind:'spray'},
};
const rigCache = new WeakMap();
const aliases = {
  rightArm:['CC_Base_R_Upperarm','mixamorigRightArm','RightArm','upper_arm.R'],
  leftArm:['CC_Base_L_Upperarm','mixamorigLeftArm','LeftArm','upper_arm.L'],
  rightForearm:['CC_Base_R_Forearm','mixamorigRightForeArm','RightForeArm','forearm.R'],
  leftForearm:['CC_Base_L_Forearm','mixamorigLeftForeArm','LeftForeArm','forearm.L'],
};
function rigBones(root) {
  if (rigCache.has(root)) return rigCache.get(root);
  const names = new Map();
  root.traverse(node => {if(node.isBone) names.set(node.name.replace(/[^a-z0-9]/gi,'').toLowerCase(),node);});
  const bones = {};
  for (const [role, candidates] of Object.entries(aliases)) {
    bones[role] = candidates.map(name=>names.get(name.replace(/[^a-z0-9]/gi,'').toLowerCase())).find(Boolean);
  }
  rigCache.set(root,bones);
  return bones;
}
export function restoreRigAttackPose(saved = []) {
  for (const {bone,quaternion} of saved) bone.quaternion.copy(quaternion);
}
function pulse(t) {return t<=0||t>=1 ? 0 : Math.sin(Math.PI*t);}
export function applyRigAttackPose(root, characterId, time) {
  const profile=RIG_ATTACK_PROFILES[characterId];
  if (!root || !profile || time<0 || time>=profile.duration) return [];
  const t=time/profile.duration, bones=rigBones(root), saved=[];
  root.updateWorldMatrix(true,true);
  const basis=root.getWorldQuaternion(new THREE.Quaternion());
  let right=pulse(t),left=right*.32,forward=1,up=.12;
  if(profile.kind==='combo') {
    const phase=t*profile.hits,hit=Math.floor(phase),strength=pulse(phase-hit);
    right=hit%2===0?strength:0;left=hit%2===1?strength:0;
  } else if(profile.kind==='dual') left=right;
  else if(profile.kind==='slam') {left=right;up=.45*(1-t);}
  else if(profile.kind==='spray') {right=Math.min(1,t/.16,(1-t)/.2);left=right*.25;}
  else if(profile.kind==='throw') {
    if(t<.32) {right=pulse(t/.64)*.55;forward=-.65;up=.6;}
    else {right=pulse((t-.32)/.68);up=.3;}
  }
  function aim(bone,side,strength,forearm=false) {
    const child=bone?.children.find(node=>node.isBone&&node.position.lengthSq()>1e-8);
    if(!bone || !child || strength<=0) return;
    const origin=bone.getWorldPosition(new THREE.Vector3());
    const current=child.getWorldPosition(new THREE.Vector3()).sub(origin).normalize();
    const target=new THREE.Vector3(side*(forearm ? .08 : .25),up,forward).normalize().applyQuaternion(basis);
    const world=bone.getWorldQuaternion(new THREE.Quaternion());
    const delta=new THREE.Quaternion().setFromUnitVectors(current,target);
    const desired=delta.multiply(world);
    const parent=bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert();
    saved.push({bone,quaternion:bone.quaternion.clone()});
    bone.quaternion.slerp(parent.multiply(desired),Math.min(1,strength*(forearm ? .6 : .9)));
    bone.updateWorldMatrix(false,true);
  }
  aim(bones.rightArm,-1,right);aim(bones.rightForearm,-1,right,true);
  aim(bones.leftArm,1,left);aim(bones.leftForearm,1,left,true);
  return saved;
}
