import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,existsSync,statSync,createReadStream,writeFileSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
import {chromium} from 'file:///C:/Users/useok/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const root=resolve('.'),errors=[],report={};
const probes={
 '/src/beta-season.js':`window.__crystalQA={prepare(){betaState.selectedSkins.crystal='';selectCharacter('crystal');},ready(){return activeCharacterMotion?.characterId==='crystal';},clip(){return activeCharacterMotion.actions.stop.getClip();}};`,
 '/src/main.js':`window.__crystalQA={prepare(){ensureSeason7NormalLoading('crystal');},ready(){return !!season7NormalModels.get('crystal')?.loop;},clip(){return season7NormalModels.get('crystal').loop.animations[0];}};`
};
const server=createServer((req,res)=>{
 const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+path);
 if(path==='/audit'){res.setHeader('Content-Type','text/html');res.end('<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/"}}</script>');return;}
 if(!file.startsWith(root+sep)||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'})[extname(file)]??'application/octet-stream');
 if(probes[path])res.end(readFileSync(file,'utf8')+'\n'+probes[path]);else createReadStream(file).pipe(res);
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));let browser;
try{
 browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-gpu']});
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));const base='http://127.0.0.1:'+server.address().port;
 await page.goto(base+'/audit');
 report.asset=await page.evaluate(async()=>{
  const THREE=await import('three'),{FBXLoader}=await import('three/addons/loaders/FBXLoader.js'),{clone}=await import('three/addons/utils/SkeletonUtils.js'),{crystalWalkInPlace}=await import('/src/visuals/crystal-motion.js');
  const loader=new FBXLoader(),model=await loader.loadAsync('/assets/3d/crystal/normal/crystal-walk.fbx');const raw=model.animations[0],fixed=crystalWalkInPlace(raw),original=raw.tracks.find(t=>t.name==='Hips.position');
  function samples(clip){const scene=clone(model),mixer=new THREE.AnimationMixer(scene),action=mixer.clipAction(clip);action.setLoop(THREE.LoopOnce,1);action.clampWhenFinished=true;action.play();const result=[];
   for(const time of [0,.3,.6,.9,1.199]){mixer.setTime(time);scene.updateMatrixWorld(true);const hips=scene.getObjectByName('Hips'),leg=scene.getObjectByName('LeftUpLeg'),box=new THREE.Box3().setFromObject(scene,true);result.push({time,hips:hips.getWorldPosition(new THREE.Vector3()).toArray(),leg:leg.quaternion.toArray(),bounds:[box.min.toArray(),box.max.toArray()]});}return result;}
  const skin=await loader.loadAsync('/assets/3d/crystal/skins/gem-princess/walk-m1s.fbx');
  const sourceTrack=original.values,track=fixed.tracks.find(t=>t.name==='Hips.position');
  return {clip:raw.name,duration:raw.duration,originalForwardTravel:sourceTrack.at(-2)-sourceTrack[1],fixedForwardTravel:track.values.at(-2)-track.values[1],sourceUnmodified:raw!==fixed&&sourceTrack.at(-2)-sourceTrack[1]<-90,verticalUnchanged:Array.from(sourceTrack).every((v,i)=>i%3!==2||v===track.values[i]),limbTracksUnchanged:raw.tracks.filter(t=>t.name!=='Hips.position').every(t=>Array.from(t.values).every((v,i)=>v===fixed.tracks.find(f=>f.name===t.name).values[i])),skinUnchanged:crystalWalkInPlace(skin.animations[0])===skin.animations[0],raw:samples(raw),fixed:samples(fixed)};
 });
 const a=report.asset;assert(a.originalForwardTravel < -90);assert(Math.abs(a.fixedForwardTravel)<.0001);assert(a.sourceUnmodified&&a.verticalUnchanged&&a.limbTracksUnchanged&&a.skinUnchanged);
 const span=s=>Math.max(...s.map(x=>x.hips[2]))-Math.min(...s.map(x=>x.hips[2]));assert(span(a.raw)>90);assert(span(a.fixed)<5);assert.notDeepEqual(a.fixed[0].leg,a.fixed[2].leg);
 for(const [name,path]of [['beta','/beta-season.html'],['main','/index.html']]){
  await page.goto(base+path,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__crystalQA,null,{timeout:90000});await page.evaluate(()=>__crystalQA.prepare());await page.waitForFunction(()=>__crystalQA.ready(),null,{timeout:120000});
  const result=await page.evaluate(()=>{const clip=__crystalQA.clip(),t=clip.tracks.find(t=>t.name==='Hips.position');return {clip:clip.name,forwardTravel:t.values.at(-2)-t.values[1],frames:t.times.length};});assert(Math.abs(result.forwardTravel)<.0001);assert(result.frames>30);report[name]=result;console.log('PASS '+name+': base Crystal uses in-place walk');
 }
 assert.deepEqual(errors,[]);writeFileSync('specs/crystal-motion-verification.json',JSON.stringify({...report,pageErrors:errors},null,2)+'\n');console.log('PASS actual FBX: 95.14 source-unit drift removed; vertical bounce, limb animation and skin retained');
}finally{await browser?.close();server.closeAllConnections();await new Promise(done=>server.close(done));}
