import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,existsSync,createReadStream,statSync,writeFileSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {chromium} from 'file:///C:/Users/useok/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {CHARACTER_NAMES} from '../src/LANGS/character-names.js';
const root=resolve('.'),errors=[],report=[];
const server=createServer((req,res)=>{
 const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+(path==='/'?'/index.html':path));
 if(!file.startsWith(root)||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'})[extname(file)]??'application/octet-stream');
 if(path==='/src/main.js')res.end(readFileSync(file,'utf8')+'\nwindow.__qa={state,ROSTER,setLanguage,createAccount,loadAccount,saveAccount,updateLobbyUI,startTraining,exitTraining,displayName};');
 else if(path==='/src/beta-season.js')res.end(readFileSync(file,'utf8')+'\nwindow.__qa={betaState,BETA_SKINS,THREE,player,selectCharacter,equipSkin,unequipSkin,setPlayerModel,startGoldRush,endGoldRush,getCharacterMotionSource,updateCharacterMotion,saveBetaState,model:()=>activeCharacterModel,motion:()=>activeCharacterMotion};');
 else createReadStream(file).pipe(res);
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));let browser;
try{
 browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-gpu']});
 const page=await browser.newPage({viewport:{width:1280,height:900}});page.on('pageerror',e=>errors.push(e.message));
 const base='http://127.0.0.1:'+server.address().port;
 await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__qa,{timeout:90000});
 await page.evaluate(()=>{const q=__qa,a=q.createAccount('language-qa','닉네임 유지');a.ownedCharacters=[...q.ROSTER];q.saveAccount(a);q.updateLobbyUI(a);});
 for(const lang of ['ko','en','ko']){
  await page.evaluate(lang=>{__qa.setLanguage(lang);__qa.updateLobbyUI(__qa.loadAccount());document.getElementById('open-shop-btn').click();},lang);
  const names=await page.locator('.char-btn .char-name').allTextContents();
  const actual=await page.evaluate(()=>[...document.querySelectorAll('.char-btn')].map(el=>[el.dataset.char,el.querySelector('.char-name').textContent]));
  for(const[id,name]of actual)assert.equal(name,CHARACTER_NAMES[id][lang==='en'?1:0]);
  assert.equal(await page.locator('#shop-overlay h2').textContent(),lang==='en'?'🪙 Shop':'🪙 상점');
  assert.equal(await page.locator('#color-info .ci-name').textContent(),lang==='en'?'Red':'레드');
  assert.equal(await page.locator('html').getAttribute('lang'),lang);
  if(lang==='en') {
   assert(!/[가-힣]/.test(await page.locator('#notice-current').textContent()));
   assert(!/[가-힣]/.test(await page.locator('#notice-next').textContent()));
   assert(!/[가-힣]/.test(await page.locator('.matchup-desc').textContent()));
   assert(!/[가-힣]/.test(await page.locator('#shop-skins').textContent()));
   assert(!/[가-힣]/.test(await page.locator('#patchnotes').textContent()));
   await page.evaluate(()=>document.getElementById('stats-toggle').click());
   assert((await page.locator('#stats-panel').textContent()).includes('Red'));
   await page.evaluate(()=>__qa.setLanguage('ko'));
   assert((await page.locator('#stats-panel').textContent()).includes('레드'));
   await page.evaluate(()=>__qa.setLanguage('en'));
   assert(!/[가-힣]/.test((await page.locator('#stats-panel').textContent()).replace('닉네임 유지','')));
   await page.evaluate(()=>document.getElementById('stats-toggle').click());
   // Change language while the shop is already open, without reopening it.
   await page.evaluate(()=>__qa.setLanguage('ko'));
   assert.equal(await page.locator('#shop-levelup .shop-card-name').first().textContent(),'레드');
   await page.evaluate(()=>__qa.setLanguage('en'));
   assert.equal(await page.locator('#shop-levelup .shop-card-name').first().textContent(),'Red');
  }
  const before=await page.evaluate(()=>{const q=__qa;return JSON.stringify(q.loadAccount().charStats);});
  await page.evaluate(()=>document.getElementById('shop-close-btn').click());
  assert.equal(await page.evaluate(()=>JSON.stringify(__qa.loadAccount().charStats)),before);
  report.push({lang,names});
  console.log('PASS main language:',lang);
 }
 await page.evaluate(()=>{__qa.setLanguage('en');__qa.startTraining();});
 assert.equal(await page.locator('#char-name').textContent(),'Red');
 await page.evaluate(()=>__qa.exitTraining());
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__qa,{timeout:90000});assert.equal(await page.locator('html').getAttribute('lang'),'en');
 if(process.argv.includes('--main-only')) { assert.deepEqual(errors,[]);console.log('PASS: main UI, archives, open account panel and language persistence');process.exitCode=0; }
 else {
 await page.goto(base+'/beta-season.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__qa,{timeout:90000});
 assert.equal(await page.evaluate(()=>__qa.BETA_SKINS.length),7);
 for(const id of ['orange','purple','lavender']){
  await page.evaluate(id=>{if(!__qa.betaState.ownedCharacters.includes(id))__qa.betaState.ownedCharacters.push(id);__qa.selectCharacter(id);},id);
  await page.waitForFunction(id=>__qa.motion()?.characterId===id,id,{timeout:120000});
  const stats=await page.evaluate(()=>{const q=__qa,model=q.model(),motion=q.motion();model.updateMatrixWorld(true);const box=new q.THREE.Box3().setFromObject(model,true);let tris=0,textured=0,skinned=0,meshes=[],bones=[];model.traverse(o=>{if(o.isBone)bones.push(o);if(!o.isMesh)return;tris+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;skinned+=!!o.isSkinnedMesh;textured+=(Array.isArray(o.material)?o.material:[o.material]).filter(m=>m.map).length;meshes.push(o.name);});const pose=()=>bones.map(b=>b.quaternion.toArray().join(',')).join(';'),before=pose();const action=motion.actions.stop;q.updateCharacterMotion(true,.2);const time=action.time,poseChanged=before!==pose();q.updateCharacterMotion(false,.1);return{id:q.betaState.selectedCharacter,source:q.getCharacterMotionSource(q.betaState.selectedCharacter).paths.stop,box:box.getSize(new q.THREE.Vector3()).toArray(),min:box.min.toArray(),tris,textured,skinned,meshes,time,poseChanged,idleTime:action.time};});
  assert(stats.source.includes('/skins/'));assert(stats.skinned>0);assert(stats.textured>0);assert(stats.time>0);assert(stats.poseChanged);assert.equal(stats.idleTime,0);assert(stats.box[1]>2&&stats.box[1]<5);report.push(stats);
  await page.screenshot({path:`specs/beta8-${id}-model.png`});
  const retained = await page.evaluate(()=>{const q=__qa,model=q.model();q.startGoldRush('showdown');const retained=q.model()===model&&q.getCharacterMotionSource(q.betaState.selectedCharacter).paths.stop.includes('/skins/');q.endGoldRush('QA',false,null,true);return retained;});
  assert(retained);stats.showdownModelRetained=retained;
  console.log('PASS skin model, actual bone motion, showdown:',id);
 }
 const coins = await page.evaluate(()=>{__qa.unequipSkin('lavender');return __qa.betaState.coins;});
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__qa,{timeout:90000});
 assert.equal(await page.evaluate(()=>__qa.betaState.selectedSkins.lavender),undefined);assert.equal(await page.evaluate(()=>__qa.betaState.coins),coins);
 }
 assert.deepEqual(errors,[]);writeFileSync(process.argv.includes('--main-only')?'specs/main-language-verification.json':'specs/main-language-skins-verification.json',JSON.stringify({errors,report},null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{await browser?.close();server.closeAllConnections();await new Promise(done=>server.close(done));}
