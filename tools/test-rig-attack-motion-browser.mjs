import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,existsSync,statSync,createReadStream,writeFileSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
import {chromium} from 'file:///C:/Users/useok/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const root=resolve('.'),errors=[],report=[];
const probe=`window.__attackQA={
 inventory(){const items=CHARACTERS.filter(c=>RIG_ATTACK_PROFILES[c.id]).map(c=>({id:c.id,skin:''}));for(const skins of [SEASON6_MODEL_SKINS,SEASON7_MODEL_SKINS,SEASON8_MODEL_SKINS])for(const [id,s]of Object.entries(skins))items.push({id,skin:s.skinId});items.push({id:'pink',skin:'beta5_pink_cotton_candy'},{id:'ivory',skin:'beta2_ivory_shopkeeper'});return items;},
 async sample({id,skin}){const source=getCharacterMotionSource(id,skin),asset=await source.motionLoader.loadAsync(source.paths.loop),raw=source.usesFbxMotion?asset:asset.scene,model=prepareCharacterScene(raw,id,skin);
 const bones=[];model.traverse(n=>{if(n.isBone)bones.push(n);});const original=bones.map(b=>b.quaternion.clone()),position=model.position.clone(),scale=model.scale.clone();
 let maxChanged=0,matched=[];for(const fraction of [.12,.25,.45,.65,.85]){const saved=applyRigAttackPose(model,id,RIG_ATTACK_PROFILES[id].duration*fraction);maxChanged=Math.max(maxChanged,saved.filter(s=>s.bone.quaternion.angleTo(s.quaternion)>.01).length);matched=[...new Set([...matched,...saved.map(s=>s.bone.name)])];restoreRigAttackPose(saved);}
 const restored=bones.every((b,i)=>b.quaternion.equals(original[i]));const repeated=[];for(let i=0;i<60;i++){restoreRigAttackPose(repeated.splice(0));repeated.push(...applyRigAttackPose(model,id,(i%20)/20*RIG_ATTACK_PROFILES[id].duration));}restoreRigAttackPose(repeated);
 return {id,skin,path:source.paths.loop,boneCount:bones.length,maxChanged,matched,restored,repeatedRestored:bones.every((b,i)=>b.quaternion.equals(original[i])),rootUnchanged:position.equals(model.position)&&scale.equals(model.scale)};
 },
 prepare(){betaState.selectedSkins.gold='';if(!betaState.ownedCharacters.includes('gold'))betaState.ownedCharacters.push('gold');selectCharacter('gold');},ready(){return activeCharacterMotion?.characterId==='gold';},
 player(){restoreModelAttackPose();startModelAttackMotion('gold');updateModelAttackMotion(.1);const changed=modelAttackPoseRestore.filter(s=>s.bone.quaternion.angleTo(s.quaternion)>.01).length;restoreModelAttackPose();modelAttackMotionTime=-1;return changed;}
};`;
const server=createServer((req,res)=>{const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+path);if(!file.startsWith(root+sep)||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'})[extname(file)]??'application/octet-stream');if(path==='/src/beta-season.js')res.end(readFileSync(file,'utf8')+probe);else createReadStream(file).pipe(res);});
await new Promise(done=>server.listen(0,'127.0.0.1',done));let browser;
try{browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-gpu']});const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:'+server.address().port+'/beta-season.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__attackQA,null,{timeout:90000});
 const inventory=await page.evaluate(()=>__attackQA.inventory());
 for(const item of inventory){const result=await page.evaluate(item=>__attackQA.sample(item),item);console.log(JSON.stringify(result));report.push(result);assert(result.maxChanged>=2,'Attack bones missing: '+JSON.stringify(result));assert(result.restored&&result.repeatedRestored&&result.rootUnchanged);}
 await page.evaluate(()=>__attackQA.prepare());await page.waitForFunction(()=>__attackQA.ready(),null,{timeout:120000});const playerChanged=await page.evaluate(()=>__attackQA.player());assert(playerChanged>=2);assert.deepEqual(errors,[]);writeFileSync('specs/rig-attack-motion-verification.json',JSON.stringify({report,playerChanged,pageErrors:errors},null,2)+'\n');console.log('PASS all models: attack, recovery, repeated attack and fixed root');
}finally{await browser?.close();server.closeAllConnections();await new Promise(done=>server.close(done));}
