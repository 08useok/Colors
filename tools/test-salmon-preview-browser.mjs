import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,existsSync,statSync,createReadStream,writeFileSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
import {chromium} from 'file:///C:/Users/useok/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const root=resolve('.'),errors=[],report=[];
const probe=`
window.__salmonQA={salmonPreview,map,scene,camera,renderer,CHARACTERS,start:()=>startGoldRush('knockout'),end:()=>endGoldRush('QA',false,null,true)};`;
const server=createServer((req,res)=>{
 const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+path);
 if(!file.startsWith(root+sep)||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'})[extname(file)]??'application/octet-stream');
 if(path==='/src/beta-season.js')res.end(readFileSync(file,'utf8')+probe);else createReadStream(file).pipe(res);
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));let browser;
try{
 browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-gpu']});
 const page=await browser.newPage({viewport:{width:1440,height:900}});page.on('pageerror',e=>errors.push(e.message));
 const base='http://127.0.0.1:'+server.address().port;
 const load=async suffix=>{await page.goto(base+'/beta-season.html'+suffix,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__salmonQA,null,{timeout:90000});await page.waitForFunction(()=>document.querySelector('#model-loading-screen').hidden,null,{timeout:120000});};
 await load('');
 await page.waitForFunction(()=>document.querySelector('#beta-canvas').dataset.salmonModel==='ready');
 const result=await page.evaluate(async()=>{
   const q=__salmonQA,model=await q.salmonPreview.ready;
   // Import the same Three module as the game for precise world bounds.
   const THREE=await import('three');
   const b=new THREE.Box3().setFromObject(model,true),meshes=[];
   model.traverse(o=>{if(o.isMesh)meshes.push(o);});
   return {height:model.userData.bindHeight,bottom:model.userData.bindBottom,animatedHeight:b.max.y-b.min.y,skinned:meshes.filter(m=>m.isSkinnedMesh).length,walkClip:model.userData.walkClip,meshes:meshes.length,bodyColor:meshes.find(m=>m.material.name==='Salmon coral').material.color.getHexString(),lobbyParent:q.salmonPreview.root.parent===q.map,playable:q.CHARACTERS.some(c=>c.id==='salmon')};
 });
 assert(Math.abs(result.height-2.7)<.001);assert(Math.abs(result.bottom-1.85)<.001);
 assert.equal(result.meshes,23);assert.equal(result.skinned,23);assert(result.walkClip.includes('Salmon_Walk_InPlace'));assert(result.animatedHeight<3.5);assert.equal(result.bodyColor,'fe7974');assert(result.lobbyParent);assert(!result.playable);
 const animation=await page.evaluate(async()=>{
   const q=__salmonQA,model=await q.salmonPreview.ready,mesh=model.getObjectByName('Salmon_body_source_repaired') || (()=>{let best=null;model.traverse(o=>{if(o.isSkinnedMesh&&(!best||o.geometry.attributes.position.count>best.geometry.attributes.position.count))best=o;});return best;})();
   const THREE=await import('three');const positions=[];
   for(const t of [.1,.4]) {q.salmonPreview.mixer.setTime(t);model.updateMatrixWorld(true);mesh.skeleton.update();const samples=[];for(let i=0;i<mesh.geometry.attributes.position.count;i+=37){const v=new THREE.Vector3();mesh.getVertexPosition(i,v);samples.push(...v.toArray());}positions.push(samples);}
   let normalized=true;
   model.traverse(o=>{if(o.isSkinnedMesh){const weights=o.geometry.attributes.skinWeight;for(let i=0;i<weights.count;i++){const total=weights.getX(i)+weights.getY(i)+weights.getZ(i)+weights.getW(i);if(Math.abs(total-1)>.001)normalized=false;}}});
   return {vertexMoves:positions[0].some((v,i)=>Math.abs(v-positions[1][i])>.00001),normalized};
 });
 assert(animation.normalized);assert(animation.vertexMoves);
 // Probe a moving body bone as the first mesh can be a rigid head detail.
 const moves=await page.evaluate(async()=>{const q=__salmonQA,m=await q.salmonPreview.ready,b=m.getObjectByName('thighL')||m.getObjectByName('thigh_L');const bones=[];m.traverse(o=>{if(o.isBone)bones.push(o);});const thigh=b||bones.find(o=>o.name.toLowerCase().includes('thigh'));q.salmonPreview.mixer.setTime(.1);const a=thigh.quaternion.toArray();q.salmonPreview.mixer.setTime(.4);return a.some((v,i)=>Math.abs(v-thigh.quaternion.toArray()[i])>.00001);});
 assert(moves);
 // Capture a close view without fighting the game's camera update loop.
 const image=await page.evaluate(()=>{const q=__salmonQA,c=q.camera.clone();c.position.set(-4,4.2,6);c.lookAt(-4,3.5,-2);q.renderer.render(q.scene,c);return q.renderer.domElement.toDataURL('image/png').split(',')[1];});
 writeFileSync('specs/beta8-salmon-preview.png',Buffer.from(image,'base64'));
 await page.locator('[data-lobby-room="graveyard"]').click();await page.keyboard.press('e');
 await page.waitForFunction(()=>!__salmonQA.map.visible);
 assert(await page.evaluate(()=>!__salmonQA.salmonPreview.root.parent.visible));
 await page.evaluate(()=>__salmonQA.end());
 assert(await page.evaluate(()=>__salmonQA.salmonPreview.root.parent.visible));
 await load('?test=beta7');assert.equal(await page.evaluate(()=>__salmonQA.salmonPreview),null);
 assert.deepEqual(errors,[]);
 writeFileSync('specs/beta8-salmon-preview-verification.json',JSON.stringify({result,animation,boneMoves:moves,matchHidden:true,returnVisible:true,beta7Unchanged:true,pageErrors:errors},null,2)+'\n');
 console.log('PASS: Salmon GLB, bounds, original color, rigged preview and vertex animation, match hide/return, beta7 unchanged');
}finally{await browser?.close();server.closeAllConnections();await new Promise(done=>server.close(done));}
