import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { BETA_STAIRS_PROFILE } from '../config/beta-stairs-profile.js';
let stairsPromise;
function loadStairs(){
  return stairsPromise ??= new GLTFLoader().loadAsync(new URL('../../assets/3d/environment/beta-stairs/stairs.glb?v=1',import.meta.url).href).then(({scene})=>{
    scene.updateMatrixWorld(true);
    const bounds=new THREE.Box3().setFromObject(scene),size=bounds.getSize(new THREE.Vector3());
    if(Math.min(size.x,size.y,size.z)<=0)throw new Error('Empty beta stairs bounds');
    const offset=new THREE.Matrix4().makeTranslation(-(bounds.min.x+bounds.max.x)/2,-BETA_STAIRS_PROFILE.low,-(bounds.min.z+bounds.max.z)/2),parts=[];
    scene.traverse(mesh=>{if(mesh.isMesh)parts.push({geometry:mesh.geometry.clone().applyMatrix4(mesh.matrixWorld).applyMatrix4(offset),material:mesh.material});});
    return {size,parts};
  });
}
export function createBetaStairs(stair,canvas){
  const root=new THREE.Group();root.name=`beta-stairs-${stair.id}`;
  const middle=(stair.start+stair.end)/2;
  root.position.set(stair.dx*middle,stair.low,stair.dz*middle);
  root.rotation.y=Math.atan2(-stair.dx,-stair.dz);
  const fallback=new THREE.Group(),material=new THREE.MeshStandardMaterial({color:0xba9567,roughness:.9});
  for(let i=0;i<8;i++){
    const height=(stair.high-stair.low)*(i+1)/8,depth=stair.length/8;
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(stair.width,height,depth),material);
    mesh.position.set(0,height/2,stair.length/2-(i+.5)*depth);mesh.receiveShadow=true;fallback.add(mesh);
  }
  root.add(fallback);
  loadStairs().then(({size,parts})=>{
    const model=new THREE.Group();model.name='scarab-temple-stairs';
    // Fit the usable tread rise. Decorative pillars are higher than the landing.
    model.scale.set(stair.width/size.x,(stair.high-stair.low)/(BETA_STAIRS_PROFILE.high-BETA_STAIRS_PROFILE.low),stair.length/size.z);
    for(const part of parts){const mesh=new THREE.Mesh(part.geometry,part.material);mesh.castShadow=true;mesh.receiveShadow=true;model.add(mesh);}
    root.remove(fallback);fallback.traverse(p=>p.geometry?.dispose());material.dispose();root.add(model);
    canvas.dataset.betaStairsModel='ready';canvas.dataset.betaStairsCount=String(Number(canvas.dataset.betaStairsCount||0)+1);
    canvas.dataset.betaStairsSourceSize=`${size.x.toFixed(3)},${size.y.toFixed(3)},${size.z.toFixed(3)}`;
  }).catch(error=>{canvas.dataset.betaStairsModel='fallback';console.error('Beta stairs model failed to load',error);});
  return root;
}
