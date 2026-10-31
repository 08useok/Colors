import * as THREE from 'three';
import { BETA_ATTACK_MOTIONS } from '../config/beta-attack-motion.js';
const cache=new WeakMap();
const colors={glove:0xf44343,gauntlet:0xb52239,boomerang:0x53e37b,orange:0xff931b,marble:0x5eabff,electric:0xffe443,fan:0x3df7ff,poison:0xad5adb,heart:0xff8dbb,ingot:0xffcf44,iceCream:0xfff0cf,launcher:0x91b83e,iceBlaster:0x98ffe5,water:0x38d8ed,crystal:0xa5ecff,perfume:0xc693ef};
function makeProp(kind,variant=0) {
  const group=new THREE.Group();group.name='BetaAttackProp:'+kind;
  const material=new THREE.MeshStandardMaterial({color:colors[kind],roughness:.4,metalness:['ingot','launcher','gauntlet'].includes(kind)?.55:.05});
  const mesh=(geometry,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);group.add(m);return m;};
  if(kind==='boomerang'){const m=mesh(new THREE.TorusGeometry(.23,.045,7,20,Math.PI*1.4));m.rotation.x=Math.PI/2;}
  else if(kind==='orange'){mesh(new THREE.SphereGeometry(.21,14,10));const leaf=new THREE.Mesh(new THREE.ConeGeometry(.055,.14,5),new THREE.MeshStandardMaterial({color:0x56b34d}));leaf.position.y=.24;leaf.rotation.z=.5;group.add(leaf);}
  else if(kind==='glove'||kind==='gauntlet'){mesh(new THREE.SphereGeometry(.19,12,10),0,.04,.03);mesh(new THREE.CylinderGeometry(.13,.13,.13,10),0,-.12,0);}
  else if(kind==='ingot'){mesh(new THREE.BoxGeometry(.42,.2,.24));}
  else if(kind==='crystal'){mesh(new THREE.OctahedronGeometry(.24));}
  else if(kind==='launcher'){mesh(new THREE.BoxGeometry(.24,.2,.32));const barrel=mesh(new THREE.CylinderGeometry(.08,.09,.35,10),0,.02,.24);barrel.rotation.x=Math.PI/2;}
  else if(kind==='perfume'||(kind==='poison'&&variant)){mesh(new THREE.CylinderGeometry(.12,.15,.27,12));mesh(new THREE.BoxGeometry(.13,.08,.12),0,.19,0);mesh(new THREE.BoxGeometry(.08,.05,.13),0,.21,.09);}
  else if(kind==='poison'){for(let i=0;i<3;i++){const needle=mesh(new THREE.ConeGeometry(.025,.3,5),(i-1)*.065,0,.08);needle.rotation.x=Math.PI/2;}}
  else if(kind==='iceCream'||kind==='iceBlaster'){mesh(new THREE.ConeGeometry(.12,.25,12),0,-.13,0);const scoops=kind==='iceBlaster'?3:1;for(let i=0;i<scoops;i++)mesh(new THREE.SphereGeometry(.14,12,8),0,.06+i*.14,0);}
  else if(kind==='heart'){mesh(new THREE.SphereGeometry(.12,10,8),-.08,.05,0);mesh(new THREE.SphereGeometry(.12,10,8),.08,.05,0);const tip=mesh(new THREE.ConeGeometry(.16,.22,4),0,-.08,0);tip.rotation.z=Math.PI;}
  else if(kind==='water'||kind==='electric'||kind==='fan'){const ring=mesh(new THREE.TorusGeometry(.18,.025,6,20));if(kind==='electric')mesh(new THREE.OctahedronGeometry(.11));if(kind==='fan')for(let i=0;i<3;i++)mesh(new THREE.OctahedronGeometry(.07),(i-1)*.12,0,0);ring.rotation.x=Math.PI/2;}
  else mesh(new THREE.SphereGeometry(.14,12,8));
  return group;
}
function hand(root,right) {
  const candidates=right?['ccbaserhand','mixamorigrighthand','righthand','handr']:['ccbaselhand','mixamoriglefthand','lefthand','handl'];
  let result;root.traverse(node=>{if(node.isBone&&candidates.includes(node.name.replace(/[^a-z0-9]/gi,'').toLowerCase()))result=node;});return result;
}
function dispose(prop){prop.removeFromParent();const materials=new Set();prop.traverse(o=>{o.geometry?.dispose();if(o.material)materials.add(o.material);});for(const m of materials)m.dispose();}
export function hideBetaAttackProps(root){for(const prop of cache.get(root)?.props??[])prop.visible=false;}
export function updateBetaAttackProps(root,id,time,variant=0) {
  const p=BETA_ATTACK_MOTIONS[id];if(!root||!p)return;
  let entry=cache.get(root);
  const type=id+':'+variant;
  if(entry?.type!==type){
    for(const prop of entry?.props??[])dispose(prop);
    entry={type,props:[]};cache.set(root,entry);
    const both=['punch','charge','fan','heal','surf'].includes(p.kind);
    for(const side of both?[true,false]:[true]){const bone=hand(root,side);if(!bone)continue;const prop=makeProp(p.prop,variant);bone.add(prop);entry.props.push(prop);}
  }
  const persistent=['glove','gauntlet','launcher','perfume','water','fan'].includes(p.prop);
  const last=p.release+((p.hits??1)-1)*(p.interval??0);
  for(const prop of entry.props){
    prop.visible=time>=0&&time<p.duration&&(persistent||time<(p.kind==='burst'?last:p.release));
    const scale=prop.parent.getWorldScale(new THREE.Vector3());
    prop.scale.set(1/Math.abs(scale.x||1),1/Math.abs(scale.y||1),1/Math.abs(scale.z||1));
    prop.position.set(0,0,0);
    if(p.prop==='iceBlaster')for(let i=1;i<prop.children.length;i++)prop.children[i].visible=time<p.release+(3-i)*p.interval;
    if(p.prop==='perfume')prop.children[1].position.y=.19-(time>=p.release?.025:0);
  }
}
