import {createServer} from 'node:http';
import{readFileSync,existsSync,statSync,createReadStream}from'node:fs';
import{resolve,extname,sep}from'node:path';
import{createBetaAuth}from'./beta-auth.mjs';
const root=resolve('.'),auth=createBetaAuth(':memory:');
const probe=`
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
}).listen(4191,'127.0.0.1',()=>console.log('Records isolated QA http://127.0.0.1:4191/beta-season.html'));
