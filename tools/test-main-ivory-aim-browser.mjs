import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync, existsSync, createReadStream, statSync, writeFileSync} from 'node:fs';
import {resolve, extname, sep} from 'node:path';
import {chromium} from 'file:///C:/Users/useok/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const root = resolve('.'), errors = [], report = [];
const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = resolve(root, '.' + path);
  if (!file.startsWith(root + sep) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404).end(); return;
  }
  res.setHeader('Content-Type', ({'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png', '.mp3':'audio/mpeg'})[extname(file)] ?? 'application/octet-stream');
  if (path === '/src/main.js') {
    res.end(readFileSync(file,'utf8')+"\nwindow.__ivoryQA={state,getPlayer,getSeasonCombat,setup(){const a=createAccount(\"ivory-qa\",\"검증\");a.ownedCharacters=[...ROSTER];a.selectedCharacter=\"ivory\";saveAccount(a);updateLobbyUI(a);state.selectedCharacter=\"ivory\";startTraining();const p=getPlayer();p.mesh.position.set(0,1.85,20);const t=state.players.find(f=>!f.isPlayer);for(const f of state.players)if(!f.isPlayer){f.dead=f!==t;f.mesh.visible=f===t;}t.mesh.position.set(3,1.85,24);t.health=t.maxHealth=1000000;t.isDummy=true;},screen(x,z){const v=new THREE.Vector3(x,0,z).project(camera),r=canvas.getBoundingClientRect();return{x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};},reset(){getSeasonCombat().clear();const p=getPlayer();p.ammo=3;p.nextAttackAt=0;},snapshot(){const w=getSeasonCombat().world;return{zones:w.zones.filter(z=>z.kind===\"ivory\").map(z=>({x:z.x,z:z.z})),projectiles:w.projectiles.map(p=>({x:p.x,z:p.z,reach:p.reach,y:scene.children.find(m=>m.userData.throwStartY)?.position.y})),aimY:supplementalAttackAim.group.position.y,ultimateAimY:seasonUltimateAim.group.position.y};}};");
  } else {
    res.setHeader('Content-Length', statSync(file).size);
    createReadStream(file).pipe(res);
  }
});

await new Promise(done=>server.listen(0,'127.0.0.1',done));let browser;
try{
 browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-gpu']});const page=await browser.newPage({viewport:{width:1280,height:900}});page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});
 await page.goto('http://127.0.0.1:'+server.address().port+'/index.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__ivoryQA,null,{timeout:90000});await page.waitForFunction(()=>document.getElementById("model-loading-screen").hidden,null,{timeout:120000});await page.evaluate(()=>__ivoryQA.setup());await page.waitForFunction(()=>document.getElementById("model-loading-screen").hidden,null,{timeout:120000});await page.waitForTimeout(1200);
 const click=async(x,z)=>{const p=await page.evaluate(({x,z})=>__ivoryQA.screen(x,z),{x,z});await page.mouse.click(p.x,p.y);};
 await click(-5,22);const flight=await (await page.waitForFunction(()=>{const s=__ivoryQA.snapshot();return s.projectiles[0]?.y>.35?s:false;})).jsonValue();
 await page.waitForFunction(()=>__ivoryQA.snapshot().zones.length===1);const tap=await page.evaluate(()=>__ivoryQA.snapshot());assert(Math.hypot(tap.zones[0].x-3,tap.zones[0].z-24)<1e-6);
 await page.evaluate(()=>{__ivoryQA.reset();__ivoryQA.state.manualAimActive=true;});
 await click(-3,23);await page.waitForFunction(()=>__ivoryQA.snapshot().zones.length===1);const manual=await page.evaluate(()=>__ivoryQA.snapshot());console.log('MANUAL',JSON.stringify(manual));assert(Math.hypot(manual.zones[0].x+3,manual.zones[0].z-23)<.15);assert(Math.abs(manual.aimY-.28)<1e-8);
 await page.evaluate(()=>{__ivoryQA.reset();const p=__ivoryQA.getPlayer(),a=__ivoryQA.getSeasonCombat().actor(p);a.charge=a.u.chargeRequired;});
 await page.keyboard.down('KeyQ');await page.waitForTimeout(100);const aiming=await page.evaluate(()=>__ivoryQA.snapshot());assert(Math.abs(aiming.ultimateAimY-.28)<1e-8);await page.keyboard.up('KeyQ');
 await page.waitForFunction(()=>__ivoryQA.snapshot().zones.length===5);const ultimate=await page.evaluate(()=>__ivoryQA.snapshot());const cx=ultimate.zones.reduce((n,z)=>n+z.x,0)/5,cz=ultimate.zones.reduce((n,z)=>n+z.z,0)/5;assert(Math.hypot(cx+3,cz-23)<.05);
 await page.screenshot({path:'specs/main-ivory-aim.png'});assert.deepEqual(errors,[]);writeFileSync('specs/main-ivory-aim-verification.json',JSON.stringify({flight,tap,manual,ultimate,pageErrors:errors},null,2)+'\n');console.log('PASS browser main Ivory: tap targets enemy, manual landing matches pointer, five ultimate landings, grounded guides, airborne ice cream');
}finally{if(browser)await browser.close();server.closeAllConnections();await new Promise(done=>server.close(done));}
