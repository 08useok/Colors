import * as THREE from 'three';
import { SALMON_THROW, salmonThrowPose } from '../config/salmon-animation.js';
const props=new WeakMap();
export function updateSalmonHandBobber(root,time) {
  if(!root)return;
  let prop=props.get(root);
  if(!prop&&time>=0&&time<SALMON_THROW.duration){
    let hand;root.traverse(node=>{if(node.isBone&&node.name.replace(/[^a-z0-9]/gi,'').toLowerCase()==='handr')hand=node;});
    if(!hand)return;
    prop=new THREE.Group();prop.name='SalmonHeldBobber';
    for(const[start,color]of [[0,0xfe7974],[Math.PI/2,0xfff3dc]])prop.add(new THREE.Mesh(new THREE.SphereGeometry(.19,14,10,0,Math.PI*2,start,Math.PI/2),new THREE.MeshStandardMaterial({color,roughness:.55})));
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.28,8),new THREE.MeshStandardMaterial({color:0xfe7974}));stem.position.y=.24;prop.add(stem);
    hand.add(prop);props.set(root,prop);
  }
  if(!prop)return;
  prop.visible=time>=0&&time<SALMON_THROW.duration&&salmonThrowPose(time).holding;
  const scale=prop.parent.getWorldScale(new THREE.Vector3());
  prop.scale.set(1/Math.abs(scale.x||1),1/Math.abs(scale.y||1),1/Math.abs(scale.z||1));
  prop.position.set(-.035,0,0);
}
