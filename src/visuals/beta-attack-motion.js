import { BETA_ULTIMATE_MOTIONS, betaUltimatePose } from '../config/beta-ultimate-motion.js';
import * as THREE from 'three';
import { BETA_ATTACK_MOTIONS, betaAttackPose } from '../config/beta-attack-motion.js';
import { RIG_ATTACK_PROFILES, applyRigAttackPose, restoreRigAttackPose } from './rig-attack-motion.js';
import { updateBetaAttackProps, hideBetaAttackProps } from './beta-attack-props.js';
import { updateSalmonHandBobber } from './salmon-attack.js';
export const BETA_ATTACK_PROFILES={...BETA_ATTACK_MOTIONS,salmon:RIG_ATTACK_PROFILES.salmon,...Object.fromEntries(Object.entries(BETA_ULTIMATE_MOTIONS).map(([id,p])=>[id+'Ultimate',p]))};
const rigs=new WeakMap();
function bones(root) {
  if(rigs.has(root))return rigs.get(root);
  const names=new Map();root.traverse(n=>{if(n.isBone)names.set(n.name.replace(/[^a-z0-9]/gi,'').toLowerCase(),n);});
  const lookup=list=>list.map(n=>names.get(n.toLowerCase())).find(Boolean);
  const result={
    right:lookup(['CCBaseRUpperarm','mixamorigRightArm','RightArm','upperarmR']),
    left:lookup(['CCBaseLUpperarm','mixamorigLeftArm','LeftArm','upperarmL']),
    rightForearm:lookup(['CCBaseRForearm','mixamorigRightForeArm','RightForeArm','forearmR']),
    leftForearm:lookup(['CCBaseLForearm','mixamorigLeftForeArm','LeftForeArm','forearmL']),
    torso:lookup(['CCBaseSpine01','mixamorigSpine','Spine02','spine']),
  };rigs.set(root,result);return result;
}
export function restoreBetaAttackPose(saved=[]) {
  restoreRigAttackPose(saved);
  for(const s of saved)s.resetAttackVisual?.();
}
export function applyBetaAttackPose(root,id,time) {
  if(!root)return [];
  const ultimate=id.endsWith('Ultimate');
  const character=ultimate?id.slice(0,-8):id;
  if(character==='salmon'){
    const saved=applyRigAttackPose(root,character,time);
    if(saved.length)saved[0].resetAttackVisual=()=>updateSalmonHandBobber(root,-1);
    return saved;
  }
  const p=ultimate?BETA_ULTIMATE_MOTIONS[character]:BETA_ATTACK_MOTIONS[id],variant=root.userData.betaAttackVariant??0;
  if(ultimate) hideBetaAttackProps(root); else updateBetaAttackProps(root,id,time,variant);
  if(!p||time<0||time>=p.duration)return [];
  const pose=ultimate?betaUltimatePose(character,time):betaAttackPose(id,time,variant);
  const rig=bones(root),saved=[];
  root.updateWorldMatrix(true,true);
  const basis=root.getWorldQuaternion(new THREE.Quaternion());
  function aim(bone,direction,strength) {
    const child=bone?.children.find(n=>n.isBone&&n.position.lengthSq()>1e-8);if(!child||strength<=0)return;
    const from=bone.getWorldPosition(new THREE.Vector3()),current=child.getWorldPosition(new THREE.Vector3()).sub(from).normalize();
    const desired=new THREE.Quaternion().setFromUnitVectors(current,new THREE.Vector3(...direction).normalize().applyQuaternion(basis)).multiply(bone.getWorldQuaternion(new THREE.Quaternion()));
    const local=bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(desired);
    saved.push({bone,quaternion:bone.quaternion.clone()});bone.quaternion.slerp(local,Math.min(1,strength));bone.updateWorldMatrix(false,true);
  }
  if(rig.torso&&pose.twist){saved.push({bone:rig.torso,quaternion:rig.torso.quaternion.clone()});rig.torso.rotateY(pose.twist*pose.strength);rig.torso.updateWorldMatrix(false,true);}
  aim(rig.right,pose.arm,pose.strength);aim(rig.rightForearm,pose.forearm,pose.strength);
  aim(rig.left,pose.leftArm,pose.strength*pose.left);aim(rig.leftForearm,pose.leftForearm,pose.strength*pose.left);
  if(saved.length)saved[0].resetAttackVisual=()=>hideBetaAttackProps(root);
  return saved;
}
