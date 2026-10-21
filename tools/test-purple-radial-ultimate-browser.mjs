import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,existsSync,statSync,createReadStream,writeFileSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
import {chromium} from 'file:///C:/Users/useok/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const root=resolve('.'),errors=[],report=[];
const probe=`
window.__purpleQA={selectCharacter,ultimateButton,
prepare(){if(!betaState.ownedCharacters.includes('purple'))betaState.ownedCharacters.push('purple');selectCharacter('purple');},
practice(targets){
 player.position.set(-40,6.25,0);player.rotation.y=0;
 for(const t of testTargets)t.visible=false;
 for(let i=0;i<2;i++){const t=testTargets[i];t.visible=targets;t.userData.isAlly=false;t.position.set(-40,6.25,i?8:-3);t.userData.health=t.userData.maxHealth=1000000;}
 purpleUltimateAimPoint.set(-40,6.25,8);purpleUltimateAimPointValid=true;purpleUltimateCharge=BETA_CHARACTERS.purple.ultimate.chargeRequired;
 updateCrimsonUltimateGauge();const start=clock.elapsedTime;ultimateButton.click();const thorns=betaProjectiles.filter(p=>p.type==='purpleThorn');return{start,centerSpawn:thorns.every(p=>p.mesh.position.x===player.position.x&&p.mesh.position.z===player.position.z),range:thorns[0]?.range,...this.snapshot()};
},
snapshot(){return{time:clock.elapsedTime,count:betaProjectiles.filter(p=>p.type==='purpleThorn').length,emitted:Number(canvas.dataset.purpleThornsFired||0),phase:canvas.dataset.lastPurpleLeap,charge:purpleUltimateCharge,jumping:!!purpleJumpState,health:testTargets.slice(0,2).map(t=>t.userData.health)};},
capture(){const c=camera.clone();c.position.set(-34,16,7);c.lookAt(-40,6.5,0);renderer.render(scene,c);return renderer.domElement.toDataURL('image/png').split(',')[1];},
battle(){const w=beta6Combat,a=beta6PlayerActor;a.charge=a.u.chargeRequired;const cast=w.cast(a,{x:a.x,z:a.z,hp:1},{point:{x:a.x,z:a.z}});updateBeta6BotCombat(0);const thorns=w.projectiles.filter(p=>p.kind==='purpleThorn');const centered=thorns.every(p=>p.x===p.origin.x&&p.z===p.origin.z);const tailAtCenter=thorns.every(p=>{const g=beta6CombatVisuals.get('p'+p.key)?.geometry;g?.computeBoundingBox();return Math.abs(g?.boundingBox?.min.y??1)<.00001;});return{cast,count:thorns.length,cones:thorns.filter(p=>beta6CombatVisuals.get('p'+p.key)?.geometry?.type==='ConeGeometry').length,centered,tailAtCenter,range:thorns[0]?.reach};},
finish(){endGoldRush('QA',false,null,true);return beta6CombatVisuals.size;},
defs:BETA_CHARACTERS};`;
const server=createServer((req,res)=>{
 const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+path);
 if(!file.startsWith(root+sep)||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'})[extname(file)]??'application/octet-stream');
 if(path==='/src/beta-season.js')res.end(readFileSync(file,'utf8')+probe);else createReadStream(file).pipe(res);
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));let browser;
try{
 browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-gpu']});
 const page=await browser.newPage({viewport:{width:1280,height:900}});page.on('pageerror',e=>errors.push(e.message));
 const base='http://127.0.0.1:'+server.address().port;
 await page.goto(base+'/beta-season.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__purpleQA,null,{timeout:90000});
 await page.evaluate(()=>__purpleQA.prepare());
 await page.waitForFunction(()=>document.querySelector('#model-loading-screen').hidden,null,{timeout:120000});
 const first=await page.evaluate(()=>__purpleQA.practice(false));assert.equal(first.count,16);assert(first.centerSpawn);assert.equal(first.range,10);
 await page.waitForFunction(t=>__purpleQA.snapshot().time>t+.08,first.start);
 writeFileSync('specs/purple-radial-ultimate.png',Buffer.from(await page.evaluate(()=>__purpleQA.capture()),'base64'));
 await page.waitForFunction(()=>!__purpleQA.snapshot().jumping&&__purpleQA.snapshot().count===0);
 const visual=await page.evaluate(()=>__purpleQA.snapshot());assert.equal(visual.emitted,32);assert.equal(visual.phase,'landing');
 const second=await page.evaluate(()=>__purpleQA.practice(true));assert.equal(second.count,16);assert.deepEqual(second.health,[1000000,1000000]);
 await page.waitForFunction(()=>!__purpleQA.snapshot().jumping&&__purpleQA.snapshot().count===0);
 const hits=await page.evaluate(()=>__purpleQA.snapshot());assert.deepEqual(hits.health,[993750,987500]);assert.equal(hits.charge,3);
 await page.locator('[data-lobby-room="graveyard"]').click();await page.keyboard.press('e');
 await page.waitForFunction(()=>document.getElementById('beta-canvas').dataset.beta6BotCharacters);
 await page.waitForFunction(()=>document.querySelector('#model-loading-screen').hidden,null,{timeout:120000});
 const battle=await page.evaluate(()=>__purpleQA.battle());assert(battle.cast);assert.equal(battle.count,16);assert.equal(battle.cones,16);assert(battle.centered);assert(battle.tailAtCenter);assert.equal(battle.range,10);
 const remaining=await page.evaluate(()=>__purpleQA.finish());assert.equal(remaining,0);
 await page.goto(base+'/beta-season.html?test=beta7',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__purpleQA,null,{timeout:90000});assert.equal(await page.evaluate(()=>__purpleQA.defs.purple.ultimate.projectileCount),undefined);
 assert.deepEqual(errors,[]);
 writeFileSync('specs/purple-radial-ultimate-browser.json',JSON.stringify({practice:{count:first.count,total:visual.emitted,range:first.range,centerSpawn:first.centerSpawn,health:hits.health,charge:hits.charge},battle,cleanupVisuals:remaining,beta7Unchanged:true,pageErrors:errors},null,2)+'\n');
 console.log('PASS browser: 16+16 practice thorns, real hit/cap/recharge, 16 battle cone visuals, cleanup and beta7 isolation');
}finally{await browser?.close();server.closeAllConnections();await new Promise(done=>server.close(done));}
