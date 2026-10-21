import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,existsSync,statSync,createReadStream,writeFileSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
import {chromium} from 'file:///C:/Users/useok/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const root=resolve('.'),errors=[],report=[];
const probe=`
window.__bossQA={prepare(){if(!betaState.ownedCharacters.includes('purple'))betaState.ownedCharacters.push('purple');selectCharacter('purple');},
cast(distance){for(const t of testTargets)t.visible=false;alphaBoss.visible=true;alphaBoss.userData.health=alphaBoss.userData.maxHealth=120000;alphaBoss.userData.invulnerableUntil=0;
 player.position.set(0,4.85,-40+distance);player.rotation.y=Math.PI;purpleUltimateAimPoint.set(0,1.85,-40+distance+8);purpleUltimateAimPointValid=true;purpleUltimateCharge=8;updateCrimsonUltimateGauge();const start=clock.elapsedTime;ultimateButton.click();return{start,...this.snapshot()};},
snapshot(){return{time:clock.elapsedTime,health:alphaBoss.userData.health,charge:purpleUltimateCharge,jumping:!!purpleJumpState,projectiles:betaProjectiles.filter(p=>p.type==='purpleThorn').length};}};`;
const server=createServer((req,res)=>{
 const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+path);
 if(!file.startsWith(root+sep)||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'})[extname(file)]??'application/octet-stream');
 if(path==='/src/beta-season.js')res.end(readFileSync(file,'utf8')+probe);else createReadStream(file).pipe(res);
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));let browser;
try{
 browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-gpu']});
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
 const base='http://127.0.0.1:'+server.address().port;
 await page.goto(base+'/beta-season.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__bossQA,null,{timeout:90000});await page.evaluate(()=>__bossQA.prepare());await page.waitForFunction(()=>document.querySelector('#model-loading-screen').hidden,null,{timeout:120000});
 for(const distance of [2,6]){
  const initial=await page.evaluate(d=>__bossQA.cast(d),distance);
  await page.waitForFunction(health=>__bossQA.snapshot().health<health,initial.health,{timeout:30000});
  const afterThorns=await page.evaluate(()=>__bossQA.snapshot());
  console.log('BOSS_PROBE',JSON.stringify({distance,initial,afterThorns}));
  assert(afterThorns.health<initial.health,'Boss really takes thorn damage');
  assert.equal(initial.charge,distance===2?1:0);assert.equal(afterThorns.charge,initial.charge+1,'First thorn recharges independently of the center hit');
  report.push({distance,initial,afterThorns});
  await page.waitForFunction(()=>!__bossQA.snapshot().jumping&&__bossQA.snapshot().projectiles===0);
 }
 assert.deepEqual(errors,[]);
 writeFileSync('specs/purple-boss-charge-browser.json',JSON.stringify({report,pageErrors:errors},null,2)+'\n');console.log(JSON.stringify(report));
}finally{await browser?.close();server.closeAllConnections();await new Promise(done=>server.close(done));}
