import * as THREE from 'three';
export function createSalmonVisuals(scene,ground) {
 const meshes=new Map();
 function dispose(mesh){scene.remove(mesh);mesh.traverse(p=>{p.geometry?.dispose();for(const m of Array.isArray(p.material)?p.material:[p.material])m?.dispose();});}
 function bobber(radius=.19){const group=new THREE.Group();for(const [start,length,color] of [[0,Math.PI/2,0xfe7974],[Math.PI/2,Math.PI/2,0xfff3dc]])group.add(new THREE.Mesh(new THREE.SphereGeometry(radius,12,8,0,Math.PI*2,start,length),new THREE.MeshStandardMaterial({color,roughness:.65})));const stem=new THREE.Mesh(new THREE.CylinderGeometry(radius*.13,radius*.13,radius*1.47,8),new THREE.MeshStandardMaterial({color:0xfe7974}));stem.position.y=radius*1.26;group.add(stem);return group;}
 function ring(radius,color){const mesh=new THREE.Mesh(new THREE.RingGeometry(radius-.06,radius,40),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide,transparent:true,opacity:.7,depthWrite:false}));mesh.rotation.x=-Math.PI/2;return mesh;}
 function get(key,make){if(!meshes.has(key)){const m=make();meshes.set(key,m);scene.add(m);}return meshes.get(key);}
 return {meshes,update(world){const live=new Set(),s=world.salmon;if(!s)return;
  for(const f of s.flights){const key='f'+f.key;live.add(key);const group=get(key,()=>{const g=new THREE.Group();g.add(bobber(),ring(f.kind==='salmonRing'?3.5:1.75,0xfe7974));return g;});const travel=Math.hypot(f.x-f.from.x,f.z-f.from.z)/14;const t=Math.max(0,Math.min(1,(world.time-f.start)/(travel||.001)));group.children[0].visible=world.time>=f.start;group.children[0].position.set(f.from.x+(f.x-f.from.x)*t,ground(f.x,f.z)+.4+(1-t)*1.15+Math.sin(Math.PI*t)*3,f.from.z+(f.z-f.from.z)*t);group.children[1].position.set(f.x,ground(f.x,f.z)+.08,f.z);}
  for(const f of s.floats){const key='r'+f.key;live.add(key);const m=get(key,()=>bobber());m.position.set(f.x,ground(f.x,f.z)+.3,f.z);}
  for(const d of s.devices){const key='d'+d.key;live.add(key);const m=get(key,()=>{const g=bobber(.5);g.add(ring(1,0xfe7974));const health=new THREE.Mesh(new THREE.PlaneGeometry(1.4,.12),new THREE.MeshBasicMaterial({color:0x71eaa1,side:THREE.DoubleSide}));health.position.y=1.2;g.add(health);g.userData.health=health;return g;});m.position.set(d.x,ground(d.x,d.z)+.1,d.z);m.userData.health.scale.x=Math.max(0,d.hp/900);}
  for(const [key,m]of meshes)if(!live.has(key)){dispose(m);meshes.delete(key);}
 },clear(){for(const m of meshes.values())dispose(m);meshes.clear();}};
}
