import * as THREE from 'three';

export const HALLOWEEN_COLORS = { pumpkin: 0xff7a18, blood: 0xd12f45, phantom: 0x9b6de3, toxic: 0x98d84d, bone: 0xf3e5c9, midnight: 0x171321 };

// Decorations sit on the courtyard parapets or outside walkable rooms.
// They do not change collision, room entrances or teleport destinations.
export function createHalloweenLobby(scene, map) {
  const root = new THREE.Group(); root.name = 'beta8-halloween'; map.add(root);
  const backdrop = new THREE.Group(); backdrop.name = 'beta8-haunted-sky'; scene.add(backdrop);
  const material = color => new THREE.MeshStandardMaterial({ color, roughness: .85 });
  const stone = material(0x40324e), dark = material(HALLOWEEN_COLORS.midnight), pumpkin = material(HALLOWEEN_COLORS.pumpkin);
  const bone = material(HALLOWEEN_COLORS.bone);
  const glow = new THREE.MeshBasicMaterial({ color: 0xffd37a });
  const mesh = (parent, geometry, mat, x, y, z) => { const m = new THREE.Mesh(geometry, mat); m.position.set(x,y,z); parent.add(m); return m; };
  const pumpkinShape = new THREE.SphereGeometry(.7, 16, 10);
  const eye = new THREE.ConeGeometry(.13,.2,3); eye.rotateZ(Math.PI);
  const stem = new THREE.CylinderGeometry(.07,.1,.3,6);
  for (const [x,z,y] of [[-9,-10,4.1],[9,-10,4.1],[-10,9,4.1],[10,9,4.1],[-10,0,4.1],[10,0,4.1],[-47,-9,8.8],[-47,9,8.8],[47,-9,5.6],[47,9,5.6],[-9,-47,7.4],[9,-47,7.4],[-9,47,10.8],[9,47,10.8]]) {
    const group = new THREE.Group(); group.name='jack-o-lantern'; group.position.set(x,y,z);
    group.rotation.y = Math.atan2(-x,-z); root.add(group);
    const body = mesh(group,pumpkinShape,pumpkin,0,.55,0); body.scale.y=.78;
    mesh(group,stem,dark,0,1.17,0);
    for (const side of [-1,1]) mesh(group,eye,glow,side*.24,.63,.64);
    const smile=mesh(group,new THREE.BoxGeometry(.42,.09,.03),glow,0,.35,.66); smile.rotation.z=.08;
  }
  for (const [x,z] of [[-17,-16],[17,-16],[-23,14],[23,14],[-31,-18],[31,-18]]) {
    const group=new THREE.Group(); group.name='grave-marker'; group.position.set(x,-2.5,z); root.add(group);
    mesh(group,new THREE.BoxGeometry(1.5,2.1,.45),stone,0,1.05,0);
    mesh(group,new THREE.SphereGeometry(.75,10,8),stone,0,2.1,0).scale.set(1,.65,.3);
    mesh(group,new THREE.BoxGeometry(.15,.75,.03),bone,0,1.25,.24);
    mesh(group,new THREE.BoxGeometry(.55,.15,.03),bone,0,1.45,.24);
  }
  // Castle silhouette remains behind the traversable north room.
  for (const [x,h] of [[-18,17],[-9,23],[0,29],[9,23],[18,17]]) {
    mesh(backdrop,new THREE.BoxGeometry(6,h,7),dark,x,h/2-2.6,-78);
    mesh(backdrop,new THREE.ConeGeometry(4.8,7,4),dark,x,h+.9,-78).rotation.y=Math.PI/4;
    mesh(backdrop,new THREE.BoxGeometry(.8,2,.1),glow,x,h*.65,-74.4);
  }
  const moon=mesh(backdrop,new THREE.SphereGeometry(9,24,16),new THREE.MeshBasicMaterial({color:0xc5a1f1,fog:false}),25,33,-92);
  moon.name='phantom-moon';
  const batShape=new THREE.Shape(); batShape.moveTo(-1.2,0); batShape.lineTo(-.6,.5); batShape.lineTo(-.2,.1); batShape.lineTo(0,.2); batShape.lineTo(.2,.1); batShape.lineTo(.6,.5); batShape.lineTo(1.2,0); batShape.lineTo(.45,-.15); batShape.lineTo(0,-.4); batShape.lineTo(-.45,-.15); batShape.closePath();
  const bats=[];
  const batGeometry=new THREE.ShapeGeometry(batShape),batMaterial=new THREE.MeshBasicMaterial({color:HALLOWEEN_COLORS.midnight,side:THREE.DoubleSide,fog:false});
  for(let i=0;i<7;i++){const bat=mesh(backdrop,batGeometry,batMaterial,-20+i*7,22+i%3*4,-64-i%2*5);bat.name='halloween-bat';bats.push({mesh:bat,y:bat.position.y,phase:i});}
  return { root, backdrop, update(time) { for(const b of bats){b.mesh.position.y=b.y+Math.sin(time*.7+b.phase)*.35;b.mesh.rotation.z=Math.sin(time+b.phase)*.06;} } };
}
