import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync, existsSync, createReadStream, statSync, writeFileSync} from 'node:fs';
import {resolve, extname, sep} from 'node:path';
import {chromium} from 'file:///C:/Users/useok/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';


const root=resolve('.'),errors=[];
const probe=String.raw`
window.__salmonCombatQA={
setup(){selectCharacter('salmon');player.position.set(-40,6.25,0);player.rotation.y=Math.PI/2;for(const t of testTargets)t.visible=false;const t=testTargets[0];t.visible=true;t.position.set(-37,6.25,0);t.userData.health=t.userData.maxHealth=100000;goldRushState.health=7600;goldRushState.ammo=5;salmonUltimateCharge=0;},
fire(){performCharacterAttack();},
miss(){clearSalmonPractice();for(const t of testTargets)t.visible=false;goldRushState.ammo=5;salmonAimRange=3;useSalmonPracticeSkill(false,true);},
recover(){goldRushState.ammo=0;useSalmonPracticeSkill(false,true);},
prepareUltimate(){salmonUltimateCharge=20;modal.classList.add("hidden");},
snapshot(){return {selected:betaState.selectedCharacter,health:testTargets[0].userData.health,ammo:goldRushState.ammo,charge:salmonUltimateCharge,aiming:directionalUltimateAiming,flights:salmonPractice?.world.salmon.flights.length??0,devices:salmonPractice?.world.salmon.devices.length??0,floats:salmonPractice?.world.salmon.floats.length??0,model:activeCharacterMotion?.characterId,motion:canvas.dataset.motionState,blocking:modelLoading.blocking,practice:!!salmonPractice,dead:goldRushState.dead,errors:[]};},
start(){startGoldRush("knockout");},battle(){return {active:!!beta6Combat,health:goldRushState.health,actor:beta6PlayerActor?.id};},clear(){clearSalmonPractice();return salmonBattleVisuals.meshes.size;}
};`;
const server=createServer((req,res)=>{const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+path);if(!file.startsWith(root+sep)||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'})[extname(file)]??'application/octet-stream');if(path==='/src/beta-season.js')res.end(readFileSync(file,'utf8')+probe);else createReadStream(file).pipe(res);});
await new Promise(done=>server.listen(0,'127.0.0.1',done));let browser;
try{
browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-gpu']});const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:'+server.address().port+'/beta-season.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__salmonCombatQA,null,{timeout:90000});
await page.evaluate(()=>__salmonCombatQA.setup());await page.waitForFunction(()=>__salmonCombatQA.snapshot().model==='salmon',null,{timeout:90000});
await page.waitForFunction(()=>!__salmonCombatQA.snapshot().blocking,null,{timeout:90000});await page.evaluate(()=>__salmonCombatQA.fire());await page.waitForFunction(()=>__salmonCombatQA.snapshot().charge===4,null,{timeout:15000}).catch(async e=>{console.log(await page.evaluate(()=>__salmonCombatQA.snapshot()),errors);throw e;});const basic=await page.evaluate(()=>__salmonCombatQA.snapshot());assert.equal(basic.health,98200);assert.equal(basic.ammo,5);
await page.evaluate(()=>__salmonCombatQA.miss());await page.waitForFunction(()=>__salmonCombatQA.snapshot().floats===1);await page.evaluate(()=>__salmonCombatQA.recover());const recovery=await page.evaluate(()=>__salmonCombatQA.snapshot());assert.equal(recovery.ammo,1);assert.equal(recovery.floats,0);
await page.evaluate(()=>__salmonCombatQA.prepareUltimate());await page.keyboard.down('q');await page.waitForTimeout(800);const held=await page.evaluate(()=>__salmonCombatQA.snapshot());assert.equal(held.aiming,true);assert.equal(held.charge,20);assert.equal(held.devices,0);assert.equal(held.flights,0);await page.keyboard.up('q');await page.waitForFunction(()=>__salmonCombatQA.snapshot().devices>0);const ultimate=await page.evaluate(()=>__salmonCombatQA.snapshot());assert.equal(ultimate.charge,0);assert.equal(await page.evaluate(()=>__salmonCombatQA.clear()),0);await page.evaluate(()=>__salmonCombatQA.start());await page.waitForFunction(()=>__salmonCombatQA.battle().active);await page.waitForTimeout(1500);const battle=await page.evaluate(()=>__salmonCombatQA.battle());assert.equal(battle.actor,"salmon");assert.deepEqual(errors,[]);
writeFileSync('specs/salmon-combat-browser.json',JSON.stringify({basic,recovery,held,ultimate,battle,pageErrors:errors},null,2)+'\n');console.log('PASS browser: Salmon selection/model, real attack input, 1800 capture/reward, zero-ammo recovery, ultimate devices and visual cleanup.');
}finally{if(browser)await browser.close();server.closeAllConnections();await new Promise(done=>server.close(done));}
