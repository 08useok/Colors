import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,existsSync,statSync,createReadStream,writeFileSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
import {chromium} from 'file:///C:/Users/useok/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const root=resolve('.'),errors=[];
const probe=`
window.__shieldQA={run(){
 const shield=target=>!!target.getObjectByName('respawn-invulnerability-shield');
 killPracticePlayer();clock.elapsedTime=goldRushState.respawnAt;updatePracticeRespawn();
 const born=clock.elapsedTime,hp=goldRushState.health;
 respawnShields.update(born);damageGoldRushPlayer(100);
 const practice={duration:goldRushState.invulnerableUntil-born,visible:shield(player),healthProtected:goldRushState.health===hp};
 clock.elapsedTime=born+4.999;damageGoldRushPlayer(100);practice.protectedAt4999=goldRushState.health===hp;
 clock.elapsedTime=born+5;respawnShields.update(clock.elapsedTime);damageGoldRushPlayer(1);
 practice.expiredAt5=!shield(player)&&goldRushState.health===hp-1;
 startGoldRush('gemGrab');for(const a of beta6Combat.actors)a.automatic=false;
 killGoldRushPlayer();clock.elapsedTime=goldRushState.respawnAt;updateGoldRush(0);
 const match={duration:goldRushState.invulnerableUntil-clock.elapsedTime,alive:!goldRushState.dead,visible:shield(player)};
 const bot=goldRushBots.find(b=>b.team!==beta6PlayerActor.team);
 bot.invulnerableUntil=0;damageGoldRushBot(bot,1e9,true,true);clock.elapsedTime=bot.respawnAt;updateBeta6BotCombat(0);
 const botBorn=clock.elapsedTime,actor=bot.combatActor;
 const ai={duration:bot.invulnerableUntil-botBorn,visible:shield(bot.mesh),blocked:beta6Combat.hit(beta6PlayerActor,actor,10)===0};
 clock.elapsedTime=botBorn+5;updateBeta6BotCombat(0);ai.expires=beta6Combat.hit(beta6PlayerActor,actor,10)>0;
 actor.hp=0;bot.dead=true;
 const pinkCaster=beta6Combat.add('pink',{team:actor.team,automatic:false,next:0,charge:100,x:actor.x,z:actor.z});
 beta6Combat.cast(pinkCaster,beta6PlayerActor);
 for(const e of beta6PendingEvents.splice(0))processBeta6CombatEvent(e);
 const pink={duration:bot.invulnerableUntil-clock.elapsedTime,visible:shield(bot.mesh),engineProtected:actor.invulnerableUntil-beta6Combat.time>=5};
 endGoldRush('QA',false,null,true);const cleaned=respawnShields.size===0;
 const target=testTargets.find(t=>!t.userData.goldRushBot&&t.userData.kind==='jjajjal');
 grantBetaRespawnProtection(target.userData,target);const targetHP=target.userData.health;
 damageTarget(target,1000);const practiceTarget={blocked:target.userData.health===targetHP,visible:shield(target)};
 startGoldRush('knockout');knockoutMatch.phase='fighting';knockoutMatch.startedAt=clock.elapsedTime;killGoldRushPlayer();clock.elapsedTime+=6;updateGoldRush(0);
 const knockout={dead:goldRushState.dead,noShield:!shield(player)};endGoldRush('QA',false,null,true);
 return {practice,match,ai,pink,cleaned,practiceTarget,knockout};
},capture(){grantBetaRespawnProtection(goldRushState,player);respawnShields.update(clock.elapsedTime);camera.position.set(player.position.x+5,player.position.y+10,player.position.z+6);camera.lookAt(player.position.x,player.position.y+1,player.position.z);renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png').split(',')[1];}};`;
const server=createServer((req,res)=>{
 const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+path);
 if(!file.startsWith(root+sep)||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'})[extname(file)]??'application/octet-stream');
 if(path==='/src/beta-season.js')res.end(readFileSync(file,'utf8')+probe);else createReadStream(file).pipe(res);
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));let browser;
try{
 browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-gpu']});const page=await browser.newPage({viewport:{width:1440,height:900}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/beta-season.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__shieldQA,null,{timeout:90000});await page.waitForFunction(()=>document.querySelector('#model-loading-screen').hidden,null,{timeout:120000});
 const report=await page.evaluate(()=>__shieldQA.run());
 for(const key of ['practice','match','ai','pink']){assert(Math.abs(report[key].duration-5)<1e-9,key+' five seconds');report[key].duration=5;}
 assert.deepEqual(report.practice,{duration:5,visible:true,healthProtected:true,protectedAt4999:true,expiredAt5:true});
 assert.deepEqual(report.match,{duration:5,alive:true,visible:true});assert.deepEqual(report.ai,{duration:5,visible:true,blocked:true,expires:true});
 assert.deepEqual(report.pink,{duration:5,visible:true,engineProtected:true});assert(report.cleaned);assert.deepEqual(report.practiceTarget,{blocked:true,visible:true});assert.deepEqual(report.knockout,{dead:true,noShield:true});
 await page.waitForFunction(()=>document.querySelector('#model-loading-screen').hidden,null,{timeout:120000});
 writeFileSync('specs/beta-respawn-shield.png',Buffer.from(await page.evaluate(()=>__shieldQA.capture()),'base64'));
 assert.deepEqual(errors,[]);writeFileSync('specs/beta-respawn-shield-verification.json',JSON.stringify({...report,pageErrors:errors},null,2)+'\n');console.log('PASS: 5 second player/bot/practice/Pink protection, actual damage blocked through 4.999s and allowed at 5s, visible shield/cleanup, no knockout respawn');
}finally{await browser?.close();server.closeAllConnections();await new Promise(done=>server.close(done));}
