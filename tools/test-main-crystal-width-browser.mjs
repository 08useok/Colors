import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,existsSync,statSync,createReadStream,writeFileSync} from 'node:fs';
import {resolve,sep,extname} from 'node:path';
import {chromium} from 'file:///C:/Users/useok/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const root=resolve('.'),errors=[];
const debug=`
window.__crystalQA={setup(){const a=createAccount('crystal-width-qa','검증');a.ownedCharacters=[...ROSTER];a.selectedCharacter='crystal';saveAccount(a);updateLobbyUI(a);state.selectedCharacter='crystal';startTraining();},
prepare(side){getSeasonCombat().clear();const p=getPlayer(),t=state.players.find(f=>!f.isPlayer);p.mesh.position.set(0,1.85,20);p.seasonActionLocked=false;p.health=p.maxHealth;p.dead=false;state.freezeUntil=0;for(const f of state.players)if(!f.isPlayer){f.dead=f!==t;f.mesh.visible=f===t;}t.mesh.position.set(8,1.85,20+side);t.health=t.maxHealth=1000000;t.isDummy=true;t.seasonActionLocked=false;getSeasonCombat().actor(p).charge=6;},
screen(){const v=new THREE.Vector3(12,0,20).project(camera),r=canvas.getBoundingClientRect();return{x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};},
snapshot(){const a=getSeasonCombat().actor(getPlayer());return{bound:!!a.analysisTarget,charge:a.charge,yaw:getPlayer().yaw,guideVisible:seasonUltimateAim.group.visible};}};`;
const server=createServer((req,res)=>{const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+path);if(!file.startsWith(root+sep)||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.json':'application/json'})[extname(file)]??'application/octet-stream');if(path==='/src/main.js')res.end(readFileSync(file,'utf8')+debug);else createReadStream(file).pipe(res);});
await new Promise(done=>server.listen(0,'127.0.0.1',done));let browser;
try{
 browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-gpu']});const page=await browser.newPage({viewport:{width:1280,height:900}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/index.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__crystalQA&&document.getElementById('model-loading-screen').hidden,null,{timeout:120000});
 await page.evaluate(()=>__crystalQA.setup());await page.waitForFunction(()=>document.getElementById('model-loading-screen').hidden,null,{timeout:120000});
 const report=[];
 for(const side of [1.4,.9]){await page.evaluate(side=>__crystalQA.prepare(side),side);await page.waitForTimeout(500);const p=await page.evaluate(()=>__crystalQA.screen());await page.mouse.move(p.x,p.y);await page.keyboard.down('KeyQ');await page.waitForTimeout(150);assert((await page.evaluate(()=>__crystalQA.snapshot())).guideVisible);await page.keyboard.up('KeyQ');await page.waitForTimeout(100);const snapshot=await page.evaluate(()=>__crystalQA.snapshot());assert.equal(snapshot.bound,side===.9);assert.equal(snapshot.charge,side===.9?0:6);report.push({side,...snapshot});}
 assert.deepEqual(errors,[]);writeFileSync('specs/main-crystal-width-browser.json',JSON.stringify({report,pageErrors:errors},null,2)+'\n');console.log('PASS browser main Crystal: real Q aim catches .9-tile offset, misses 1.4-tile offset without spending charge');
}finally{if(browser)await browser.close();server.closeAllConnections();await new Promise(done=>server.close(done));}
