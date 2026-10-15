import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,existsSync,createReadStream,statSync,writeFileSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {chromium} from 'file:///C:/Users/useok/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const root=resolve('.'),errors=[],report=[];
const server=createServer((req,res)=>{
 const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+(path==='/'?'/index.html':path));
 if(!file.startsWith(root)||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'})[extname(file)]??'application/octet-stream');
 if(path==='/src/main.js')res.end(readFileSync(file,'utf8')+'\nwindow.__qa={state,ROSTER,setLanguage,createAccount,loadAccount,saveAccount,updateLobbyUI,startTraining,exitTraining,displayName};');
 else if(path==='/src/beta-season.js')res.end(readFileSync(file,'utf8')+'\nwindow.__qa={betaState,player,THREE,goldRushState,goldRushBots,clock,startGoldRush,endGoldRush,updateKnockout,killGoldRushPlayer,damageGoldRushBot,performCharacterAttack,isKnockoutFrozen,getArenaSolids,flush:()=>{for(const event of beta6PendingEvents.splice(0))processBeta6CombatEvent(event)},combat:()=>beta6Combat,match:()=>knockoutMatch,arena:()=>knockoutArena,solids:()=>knockoutSolids};');
 else createReadStream(file).pipe(res);
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));let browser;
try {
 browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-gpu']});
 const page=await browser.newPage({viewport:{width:1440,height:900}});page.on('pageerror',e=>errors.push(e.message));
 const base='http://127.0.0.1:'+server.address().port;
 await page.goto(base+'/beta-season.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__qa,{timeout:90000});
 await page.evaluate(()=>document.querySelector('.beta6-loading-screen')?.remove());
 await page.locator('#knockout-toggle').click();
 assert.equal(await page.evaluate(()=>__qa.combat().actors.length),6);
 assert.deepEqual(await page.evaluate(()=>__qa.goldRushBots.map(b=>b.team)),['a','a','b','b','b']);
 const before=await page.evaluate(()=>({x:__qa.player.position.x,z:__qa.player.position.z,attacks:__qa.combat().actors[0].attackCount}));
 await page.keyboard.down('w');await page.waitForTimeout(150);await page.keyboard.up('w');
 assert.deepEqual(await page.evaluate(()=>({x:__qa.player.position.x,z:__qa.player.position.z,attacks:__qa.combat().actors[0].attackCount})),before);
 await page.evaluate(()=>__qa.performCharacterAttack());assert.equal(await page.evaluate(()=>__qa.combat().actors[0].attackCount),before.attacks);
 const startFight=()=>page.evaluate(()=>{const q=__qa;q.match().until=q.clock.elapsedTime-1;q.updateKnockout(0);q.goldRushState.invulnerableUntil=0;q.goldRushBots.forEach(b=>b.invulnerableUntil=0);q.combat().actors.forEach(a=>a.invulnerableUntil=0);});
 await startFight();
 const death=await page.evaluate(()=>{const q=__qa,w=q.combat(),hero=w.actors[0],ally=w.actors.find(a=>a.bot?.team==='a'),enemy=w.actors.find(a=>a.team==='b');const hp=ally.hp;w.hit(hero,ally,1e9);const friendlyBlocked=hp===ally.hp;w.hit(enemy,hero,1e9);q.flush();q.goldRushState.respawnAt=-100;q.updateKnockout(.1);return{friendlyBlocked,dead:q.goldRushState.dead,visible:q.player.visible,phase:q.match().phase,overlay:document.querySelector('#respawn-overlay')?.classList.contains('hidden')};});
 assert(death.friendlyBlocked&&death.dead&&!death.visible,JSON.stringify(death));assert.equal(death.phase,'fighting');report.push({death});
 await page.evaluate(()=>{const q=__qa;q.combat().projectiles.push({key:999,owner:q.combat().actors[0]});for(const b of q.goldRushBots.filter(b=>b.team==='b'))q.damageGoldRushBot(b,1e9,false,true);q.combat().projectiles.length=0;q.updateKnockout(0);});
 assert.equal(await page.evaluate(()=>__qa.match().wins.a),1);
 assert.equal(await page.evaluate(()=>__qa.match().phase),'intermission');
 const reset=await page.evaluate(()=>{const q=__qa,w=q.combat();q.match().until=q.clock.elapsedTime-1;q.updateKnockout(0);return{round:q.match().round,phase:q.match().phase,allAlive:q.goldRushBots.every(b=>!b.dead&&b.health===b.maxHealth)&&!q.goldRushState.dead,fullAmmo:q.goldRushState.ammo===q.goldRushState.maxAmmo,charges:q.combat().actors.map(a=>a.charge),oldActors:w.actors.length,projectiles:q.combat().projectiles.length};});
 assert.equal(reset.round,2);assert.equal(reset.phase,'countdown');assert(reset.allAlive&&reset.fullAmmo);assert.equal(reset.oldActors,0);assert(reset.charges.every(c=>c===0));assert.equal(reset.projectiles,0);report.push({reset});
 await startFight();
 await page.screenshot({path:'specs/beta8-knockout.png'});
 await page.evaluate(()=>{const q=__qa;for(const b of q.goldRushBots.filter(b=>b.team==='b'))q.damageGoldRushBot(b,1e9,false,true);q.updateKnockout(0);});
 const result=await page.evaluate(()=>({active:__qa.goldRushState.active,dead:__qa.goldRushState.dead,visible:__qa.player.visible,arena:__qa.arena().visible,bots:__qa.goldRushBots.length,combat:__qa.combat(),score:__qa.match().wins,stats:__qa.betaState.knockout}));
 assert(!result.active&&!result.dead&&!result.arena);assert(result.visible);assert.equal(result.bots,0);assert.equal(result.combat,null);assert.equal(result.score.a,2);assert.equal(result.stats.games,1);assert.equal(result.stats.wins,1);report.push({result});
 assert.equal(await page.locator('[data-knockout-again]').count(),1);
 await page.locator('[data-knockout-again]').click();assert.equal(await page.evaluate(()=>__qa.match().round),1);
 await page.locator('#knockout-exit').click();assert.equal(await page.evaluate(()=>__qa.betaState.knockout.games),1);
 // All three dedicated maps have separate geometry and six safe spawns.
 for(let variant=0;variant<3;variant++) {
  await page.locator('#beta-event-map-variant').selectOption(String(variant));await page.locator('#knockout-toggle').click();
  const layout=await page.evaluate(()=>({id:document.getElementById('beta-canvas').dataset.eventMap,arena:__qa.arena().name,solids:__qa.getArenaSolids()===__qa.solids(),actors:__qa.combat().actors.map(a=>({x:a.x,z:a.z,team:a.team})),walls:Number(document.getElementById('beta-canvas').dataset.eventMapWalls)}));
  assert.equal(layout.id,`knockout-${variant}`);assert(layout.solids);assert.equal(layout.actors.length,6);report.push(layout);await page.locator('#knockout-exit').click();
 }
 await page.locator('#knockout-toggle').click();await startFight();
 const fight=await page.evaluate(()=>{const q=__qa;for(let i=0;i<150&&q.match().phase==='fighting';i++)q.updateKnockout(1/30);return{attacks:q.combat()?.actors.reduce((sum,a)=>sum+a.attackCount,0)??0,moved:q.goldRushBots.some(b=>b.mesh.position.distanceTo(b.spawn)>1)};});
 assert(fight.attacks>0&&fight.moved,'autonomous bots must move and use actual character attacks');report.push({autonomous:fight});
 const poison=await page.evaluate(()=>{const q=__qa;q.match().phase='fighting';q.match().startedAt=q.clock.elapsedTime-65;q.goldRushState.health=q.goldRushState.maxHealth;q.goldRushState.dead=false;q.goldRushState.invulnerableUntil=0;q.player.position.set(18,1.55,18);const hp=q.goldRushState.health;q.updateKnockout(.1);return{hpBefore:hp,hpAfter:q.goldRushState.health};});
 assert(poison.hpAfter<poison.hpBefore);report.push({poison});await page.locator('#knockout-exit').click();
 await page.locator('#knockout-toggle').click();
 for(let round=0;round<2;round++) {
  await startFight();
  await page.evaluate(()=>{const q=__qa,w=q.combat();w.hit(w.actors.find(a=>a.team==='b'),w.actors[0],1e9);q.flush();for(const bot of q.goldRushBots.filter(b=>b.team==='a'))q.damageGoldRushBot(bot,1e9,false,true);q.updateKnockout(0);});
  if(round===0)await page.evaluate(()=>{__qa.match().until=__qa.clock.elapsedTime-1;__qa.updateKnockout(0);});
 }
 assert.equal(await page.evaluate(()=>__qa.betaState.knockout.losses),1);
 assert.equal(await page.evaluate(()=>__qa.goldRushState.dead),false);
 await page.locator('[data-knockout-lobby]').click();
 const lobby=await page.evaluate(()=>__qa.player.position.toArray());await page.keyboard.down('w');await page.waitForTimeout(200);await page.keyboard.up('w');
 assert(await page.evaluate(old=>__qa.player.position.distanceTo(new __qa.THREE.Vector3(...old))>.1,lobby),'defeat must return to a movable lobby');report.push({defeat:'0:2',lobbyMovement:true});
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__qa,{timeout:90000});assert.equal(await page.evaluate(()=>__qa.betaState.knockout.wins),1);
 await page.goto(base+'/beta-season.html?test=beta7',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__qa,{timeout:90000});assert(await page.locator('#knockout-toggle').isHidden());await page.evaluate(()=>__qa.startGoldRush('knockout'));assert.equal(await page.evaluate(()=>__qa.goldRushState.active),false);
 assert.deepEqual(errors,[]);writeFileSync('specs/beta8-knockout-verification.json',JSON.stringify({errors,report},null,2)+'\n');console.log('PASS: actual 3v3 combat, countdown input guard, friendly fire, player death/no respawn, round reset, 2:0 win/result/replay, abandonment, 3 maps, save persistence and beta7 isolation');
} finally {await browser?.close();server.closeAllConnections();await new Promise(done=>server.close(done));}
