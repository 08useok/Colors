import {createServer} from 'node:http';
import{readFileSync,existsSync,statSync,createReadStream}from'node:fs';
import{resolve,extname,sep}from'node:path';
import{createBetaAuth}from'../beta-auth.mjs';
const root=resolve('.'),auth=createBetaAuth(':memory:');
const probe=`
window.__questQA={
 ready(){return !modelLoading.blocking;},
 rewardSetup(points){betaState.beta8Quests={kills:0,damage:points*1000,healing:0};saveBetaState();openPanel('quests');},
 rewardState(){return{claims:betaState.beta8QuestClaimed,coins:betaState.coins,credits:betaState.credits,points:questPoints(betaState.beta8Quests),totalRewards:BETA8_QUEST_REWARDS.length};},
 seed(){betaState.beta8Quests=questStats();betaState.beta8QuestClaimed=[];if(!betaState.ownedCharacters.includes('pink'))betaState.ownedCharacters.push('pink');betaState.selectedSkins.pink='';selectCharacter('pink');saveBetaState();},
 run(){startGoldRush('knockout');knockoutMatch.phase='fighting';goldRushState.invulnerableUntil=0;const w=beta6Combat,a=beta6PlayerActor;for(const actor of w.actors){actor.automatic=false;actor.invulnerableUntil=0;}for(const b of goldRushBots)b.invulnerableUntil=0;
 const enemy=w.actors.find(b=>b.bot?.team==='b'),ally=w.actors.find(b=>b.bot?.team==='a');enemy.hp=enemy.bot.health=2500;enemy.bot.mesh.userData.health=2500;w.hit(a,enemy,10000);for(const e of beta6PendingEvents.splice(0))processBeta6CombatEvent(e);
 const once={...goldRushState.questStats};w.hit(a,enemy,10000);w.hit(a,ally,10000);for(const e of beta6PendingEvents.splice(0))processBeta6CombatEvent(e);
 for(const b of w.actors){if(b!==a){b.x=a.x+50;b.z=a.z;}}
 ally.hp=ally.bot.health=ally.d.maxHealth-250;ally.x=a.x+1;ally.z=a.z;a.next=0;a.ammo=3;w.fire(a,ally,0);for(let i=0;i<12;i++)w.update(1/60);for(const e of beta6PendingEvents.splice(0))processBeta6CombatEvent(e);
 const match={...goldRushState.questStats};endGoldRush('퀘스트 검증',false);const saved={...betaState.beta8Quests};endGoldRush('중복 종료',false);return{once,match,saved,total:{...betaState.beta8Quests},points:questPoints(betaState.beta8Quests)};
 },
 abandon(){startGoldRush('knockout');recordBeta8QuestStat('damage',10000);endGoldRush('중도 퇴장',false,null,true);return{...betaState.beta8Quests};},
 open(){closeBetaModal();openPanel('quests');return{title:modalTitle.textContent,text:modalContent.textContent,goals:modalContent.querySelectorAll('[data-quest-goal]').length,total:{...betaState.beta8Quests}};},
 milestone(){betaState.beta8Quests={kills:10,healing:0,damage:0};saveBetaState();openPanel('quests');return modalContent.querySelector('[data-quest-goal="10"]').textContent;}
};
window.__recordsQA={
 ready(){return !modelLoading.blocking;},
 state(){return structuredClone(betaState.beta8Records);},
 async run(won=true){closeBetaModal();startGoldRush('knockout');await goldRushState.recordMatch.ticket;knockoutMatch.phase='fighting';goldRushState.invulnerableUntil=0;const w=beta6Combat,a=beta6PlayerActor;for(const actor of w.actors){actor.automatic=false;actor.invulnerableUntil=0;}for(const b of goldRushBots)b.invulnerableUntil=0;
 const enemy=w.actors.find(b=>b.bot?.team==='b');enemy.hp=enemy.bot.health=2500;enemy.bot.mesh.userData.health=2500;w.hit(a,enemy,10000);for(const e of beta6PendingEvents.splice(0))processBeta6CombatEvent(e);
 const before={...goldRushState.questStats};endGoldRush('기록 검증',won);endGoldRush('중복 종료',won);return {before,book:this.state()};},
 async abandon(){closeBetaModal();startGoldRush('knockout');await goldRushState.recordMatch.ticket;recordBeta8QuestStat('damage',10000);endGoldRush('중도 퇴장',false,null,true);return this.state();},
 async interrupt(){closeBetaModal();startGoldRush('knockout');await goldRushState.recordMatch.ticket;recordBeta8QuestStat('damage',500);},
 open(){openPanel('records');},
};`;
createServer(async(req,res)=>{
 if(await auth.handle(req,res))return;
 const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+path);
 if(!file.startsWith(root+sep)||file.slice(root.length).split(/[\\/]/).some(p=>p.startsWith('.'))||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'})[extname(file)]??'application/octet-stream');res.setHeader('Cache-Control','no-store');
 if(path==='/src/beta-season.js')res.end(readFileSync(file,'utf8')+probe);
 else if(path==='/beta-season.html')res.end(readFileSync(file,'utf8').replace('<head>',"<head><script>window.__qaErrors=[];addEventListener('error',e=>__qaErrors.push(e.message));addEventListener('unhandledrejection',e=>__qaErrors.push(String(e.reason)));</script>"));
 else createReadStream(file).pipe(res);
}).listen(4196,'127.0.0.1',()=>console.log('Records isolated QA http://127.0.0.1:4196/beta-season.html'));
