// Visible warning shared by live combat and training. No combat decisions here.
export function createCrystalTelegraphEffects({THREE,scene,document}) {
 const visuals=new Map(),badge=document.createElement('div');badge.id='crystal-ultimate-warning';badge.className='crystal-ultimate-warning';badge.setAttribute('role','status');badge.hidden=true;document.body.appendChild(badge);
 const material=(opacity)=>new THREE.MeshBasicMaterial({color:0x76eaff,transparent:true,opacity,depthWrite:false,side:THREE.DoubleSide});
 function build(entry){
  const root=new THREE.Group();root.name='crystal-ultimate-telegraph';
  const lane=new THREE.Mesh(new THREE.BoxGeometry(1,.035,1),material(.22));lane.name='crystal-warning-path';lane.position.x=entry.length/2;lane.scale.set(entry.length,1,entry.width);root.add(lane);
  const ring=new THREE.Mesh(new THREE.RingGeometry(.65,.85,40),material(.85));ring.rotation.x=-Math.PI/2;ring.position.y=.05;root.add(ring);
  const arrow=new THREE.Mesh(new THREE.ConeGeometry(.4,1.1,3),material(.9));arrow.rotation.z=-Math.PI/2;arrow.position.set(Math.max(.5,entry.length-.5),.18,0);root.add(arrow);
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const texture=new THREE.CanvasTexture(canvas),sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false,transparent:true}));sprite.name='crystal-ultimate-used-label';sprite.position.y=3.6;sprite.scale.set(5,1.25,1);root.add(sprite);
  const target=new THREE.Mesh(new THREE.RingGeometry(.6,.86,32),new THREE.MeshBasicMaterial({color:0xff875b,transparent:true,opacity:.85,depthWrite:false,side:THREE.DoubleSide}));target.name='crystal-ultimate-target-warning';target.rotation.x=-Math.PI/2;scene.add(root,target);return{root,lane,ring,canvas,texture,target,stamp:''};
 }
 function dispose(v){for(const object of [v.root,v.target]){scene.remove(object);object.traverse(p=>{p.geometry?.dispose();p.material?.map?.dispose();p.material?.dispose();});}}
 function update(entries){
  const active=new Set();let nearest=null;
  for(const e of entries){if(e.remaining<=0)continue;active.add(e.key);const v=visuals.get(e.key)??build(e);visuals.set(e.key,v);v.root.position.set(e.origin.x,e.origin.y,e.origin.z);v.root.rotation.y=-e.yaw;v.lane.position.x=e.length/2;v.lane.scale.x=e.length;v.ring.scale.setScalar(1+Math.sin(e.remaining*12)*.1);v.lane.material.opacity=.2+Math.sin(e.remaining*14)*.07;
   v.target.visible=!!e.target;if(e.target)v.target.position.set(e.target.x,e.target.y+.06,e.target.z);
   const stamp=Math.max(0,e.remaining).toFixed(1);if(stamp!==v.stamp){v.stamp=stamp;const c=v.canvas.getContext('2d');c.clearRect(0,0,512,128);c.fillStyle='rgba(8,30,48,.94)';c.fillRect(2,2,508,124);c.strokeStyle='#8aefff';c.lineWidth=5;c.strokeRect(3,3,506,122);c.fillStyle='#fff';c.font='bold 36px sans-serif';c.textAlign='center';c.fillText('궁극기 사용! '+stamp+'초',256,77);v.texture.needsUpdate=true;}
   if(!nearest||e.remaining<nearest.remaining)nearest=e;
  }
  for(const[k,v]of visuals)if(!active.has(k)){dispose(v);visuals.delete(k);}
  badge.hidden=!nearest;if(nearest)badge.textContent='수정 분석 준비 '+nearest.remaining.toFixed(1)+'초 · 표시된 돌진 경로에서 벗어나세요';
 }
 return{update,clear(){for(const v of visuals.values())dispose(v);visuals.clear();badge.hidden=true;},get activeCount(){return visuals.size;}};
}
