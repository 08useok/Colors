import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,existsSync,statSync,createReadStream,writeFileSync} from 'node:fs';
import {resolve,sep,extname} from 'node:path';
import {chromium} from 'file:///C:/Users/useok/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const root=resolve('.'),errors=[];
const debug=`window.__homingQA={setup(){const a=createAccount('homing-qa','검증');a.ownedCharacters=[...ROSTER];a.selectedCharacter='crystal';saveAccount(a);updateLobbyUI(a);state.selectedCharacter='crystal';startTraining();},prepare(){getSeasonCombat().clear();const p=getPlayer(),t=state.players.find(f=>!f.isPlayer);p.mesh.position.set(0,1.85,20);p.ammo=3;p.nextAttackAt=0;state.freezeUntil=0;for(const f of state.players)if(!f.isPlayer){f.dead=f!==t;f.mesh.visible=f===t;}t.mesh.position.set(8,1.85,22);t.health=t.maxHealth=1000000;t.isDummy=true;},screen(){const v=new THREE.Vector3(12,0,20).project(camera),r=canvas.getBoundingClientRect();return{x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};},snapshot(){const world=getSeasonCombat().world,p=world.projectiles.find(p=>p.owner.id==='crystal'&&p.stage===1);return{shot:p?{yaw:p.yaw,radius:p.radius,x:p.x,z:p.z}:null,targetHp:state.players.find(f=>!f.isPlayer).health};}};`;
const server=createServer((req,res)=>{const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+path);if(!file.startsWith(root+sep)||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.json':'application/json'})[extname(file)]??'application/octet-stream');if(path==='/src/main.js')res.end(readFileSync(file,'utf8')+debug);else createReadStream(file).pipe(res);});
await new Promise(done=>server.listen(0,'127.0.0.1',done));let browser;
try{
 browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-gpu']});const page=await browser.newPage({viewport:{width:1280,height:900}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/index.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__homingQA&&document.getElementById('model-loading-screen').hidden,null,{timeout:120000});await page.evaluate(()=>__homingQA.setup());await page.waitForFunction(()=>document.getElementById('model-loading-screen').hidden,null,{timeout:120000});await page.evaluate(()=>__homingQA.prepare());await page.waitForTimeout(500);
 const p=await page.evaluate(()=>__homingQA.screen());await page.mouse.click(p.x,p.y);
 const flight=await(await page.waitForFunction(()=>{const s=__homingQA.snapshot();return s.shot?.yaw>.04?s:false;})).jsonValue();assert.equal(flight.shot.radius,.2);
 await page.waitForFunction(()=>__homingQA.snapshot().targetHp<1000000);const hit=await page.evaluate(()=>__homingQA.snapshot());assert.deepEqual(errors,[]);
 writeFileSync('specs/main-crystal-homing-browser.json',JSON.stringify({flight,hit,pageErrors:errors},null,2)+'\n');console.log('PASS browser main Crystal: actual click launches unchanged-size first shot, it turns toward off-axis target and deals damage');
}finally{if(browser)await browser.close();server.closeAllConnections();await new Promise(done=>server.close(done));}
