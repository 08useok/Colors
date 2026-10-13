import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';

const source = readFileSync(new URL('../src/beta-season.js', import.meta.url), 'utf8');
const extract = name => {
  const start = source.indexOf(`function ${name}(`);
  return source.slice(start, source.indexOf('\n}', start) + 2);
};
const vector = () => ({ x: 0, y: 0, z: 0, set(x,y,z) { Object.assign(this,{x,y,z}); } });
class Group {
  constructor() { this.children=[];this.userData={};this.position=vector();this.rotation=vector();this.scale=vector(); }
  add(part) { this.children.push(part); }
  traverse(visit) { visit(this);for(const child of this.children)child.traverse(visit); }
}
class Mesh extends Group { constructor(geometry, material) { super();this.geometry=geometry;this.material=material; } }
class Sprite extends Mesh { constructor(material) { super(null,material); } }
class Material { constructor(options) { Object.assign(this,options); } dispose() { this.disposed=true; } }
class Geometry { dispose() { this.disposed=true; } }
const ctx = vm.createContext({ BETA_CHARACTERS,
  THREE: { Group,Mesh,Sprite,MeshBasicMaterial:Material,SpriteMaterial:Material,CircleGeometry:Geometry,
    CanvasTexture:class { constructor(image) { this.image=image; } },DoubleSide:2 },
  document: { createElement:()=>({getContext:()=>({createRadialGradient:()=>({addColorStop(){}}),fillRect(){}})}) },
  scene: { add(){},remove(){} }, groundHeightAt:()=>6.2,
});
vm.runInContext('let lavenderMistTexture=null;\n'+['getLavenderMistTexture','createLavenderMist','updateLavenderMist','disposeLavenderMist'].map(extract).join('\n'),ctx);
for(const kind of ['perfumeSpray','fragrance']) {
  const duration=kind==='perfumeSpray' ? .9 : 6;
  const zone={kind,x:2,z:-3,yaw:Math.PI/3,radius:6,halfAngle:Math.PI/6,startedAt:0,spraySpeed:20,until:duration+(kind==='perfumeSpray' ? .3 : 0)};
  const mesh=ctx.createLavenderMist(zone);
  assert.equal(mesh.rotation.x,0,'cloud root stays upright');
  assert.equal(mesh.userData.lavenderFootprint.rotation.x,-Math.PI/2,'only footprint rotates to ground');
  assert.ok(mesh.userData.lavenderParticles.every(p=>p.position.y>.3),'mist stays above raised ground');
  const start=mesh.userData.lavenderParticles[0].position.y;
  if(kind==='perfumeSpray') {
    ctx.updateLavenderMist(mesh,zone,.1);
    assert.equal(mesh.userData.lavenderFootprint.scale.x,1/3,'visual front reaches two tiles after 0.1s');
    assert.ok(mesh.userData.lavenderParticles.every(p=>Math.hypot(p.position.x,p.position.z)<=2),'mist does not arrive early');
  }
  ctx.updateLavenderMist(mesh,zone,duration/2);
  assert.notEqual(mesh.userData.lavenderParticles[0].position.y,start,'mist rises over time');
  for(const p of mesh.userData.lavenderParticles) {
    assert.ok(Math.hypot(p.position.x,p.position.z)<=zone.radius,'cloud remains inside range');
    if(kind==='perfumeSpray')assert.ok(Math.abs(Math.atan2(p.position.z,p.position.x))<=zone.halfAngle,'cloud matches damage sector');
    assert.ok(p.material.opacity>0);
  }
  assert.equal(mesh.rotation.y,kind==='perfumeSpray' ? -zone.yaw : 0);
  zone.owner={x:17,z:9};
  ctx.updateLavenderMist(mesh,zone,duration/2);
  assert.equal(mesh.position.x,kind==='perfumeSpray' ? zone.x : 17,'only ultimate mist follows its owner');
  assert.equal(mesh.position.z,kind==='perfumeSpray' ? zone.z : 9);
  const texture=mesh.userData.lavenderParticles[0].material.map;
  assert.ok(mesh.userData.lavenderParticles.every(p=>p.material.map===texture),'soft texture is shared');
  ctx.updateLavenderMist(mesh,zone,zone.until);
  assert.ok(mesh.userData.lavenderParticles.every(p=>p.material.opacity===0),'cloud fades at expiry');
  ctx.disposeLavenderMist(mesh);
  assert.ok(mesh.userData.lavenderParticles.every(p=>p.material.disposed),'materials cleaned up');
}
assert.match(source,/updateLavenderMist\(mesh, object, world.time\)/,'battle animates mist');
assert.match(source,/updateLavenderMist\(visuals.get\(zone.key\), zone, world.time\)/,'practice animates mist');
console.log('PASS: upright mist, raised floor, spray direction/range, rising particles, fade, shared texture, cleanup and both rendering paths.');
