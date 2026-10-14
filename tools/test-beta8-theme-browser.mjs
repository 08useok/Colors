import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,existsSync,createReadStream,statSync,writeFileSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {chromium} from 'file:///C:/Users/useok/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const root=resolve('.'), errors=[],report=[];
const server=createServer((req,res)=>{
  const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+(path==='/'?'/index.html':path));
  if(!file.startsWith(root)||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404).end();return;}
  res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'})[extname(file)]??'application/octet-stream');
  if(path==='/src/main.js') res.end(readFileSync(file,'utf8')+'\nwindow.__aimQA={state,EMOTES,emoteImages,createAccount,saveAccount,loadAccount,updateLobbyUI,startTraining,exitTraining,getPlayer,updateHud};');
  else if(path==='/src/beta-season.js') res.end(readFileSync(file,'utf8')+'\nwindow.__aimQA={BETA_SEASON_ID,CHARACTERS,scene,water,halloweenDecor,platformMaterial,trimMaterial,stoneMaterial,solids,player,updateLocation};');
  else createReadStream(file).pipe(res);
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));let browser;
try {
 browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-gpu']});
 const page=await browser.newPage({viewport:{width:1440,height:900}});page.on('pageerror',e=>errors.push(e.message));
 const base='http://127.0.0.1:'+server.address().port;
 await page.goto(base+'/beta-season.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__aimQA,{timeout:60000});
 const theme=await page.evaluate(()=>{const q=__aimQA;q.updateLocation();return {season:q.BETA_SEASON_ID,background:q.scene.background.getHexString(),ground:q.platformMaterial.color.getHexString(),waterOpacity:q.water.material.opacity,waterTransparent:q.water.material.transparent,pumpkins:q.halloweenDecor.root.children.filter(o=>o.name==='jack-o-lantern').length,graves:q.halloweenDecor.root.children.filter(o=>o.name==='grave-marker').length,bats:q.halloweenDecor.backdrop.children.filter(o=>o.name==='halloween-bat').length,moon:!!q.scene.getObjectByName('phantom-moon'),location:document.getElementById('location-name').textContent,roster:q.CHARACTERS.length,colliders:q.solids.length};});
 assert.equal(theme.season,'beta8');assert.equal(theme.background,'171321');assert.equal(theme.ground,'514062');assert.equal(theme.waterOpacity,1);assert.equal(theme.waterTransparent,false);assert.equal(theme.pumpkins,14);assert.equal(theme.graves,6);assert.equal(theme.bats,7);assert(theme.moon);assert(['할로윈 유령 광장','유령 성 관문','달빛 묘지','저주받은 훈련장','호박 작업장'].includes(theme.location));assert.equal(theme.roster,16);report.push(theme);
 await page.waitForFunction(()=>document.getElementById('beta-canvas').dataset.betaWallModel==='ready',{timeout:60000});
 await page.evaluate(()=>{document.querySelector('.beta6-loading-screen')?.remove();});await page.waitForTimeout(600);
 await page.screenshot({path:'specs/beta8-halloween-lobby.png'});
 await page.locator('#overview-btn').click();await page.waitForTimeout(500);await page.screenshot({path:'specs/beta8-halloween-overview.png'});
 const coords=await page.evaluate(()=>({x:__aimQA.player.position.x,y:__aimQA.player.position.y,z:__aimQA.player.position.z}));await page.keyboard.down('w');await page.waitForTimeout(300);await page.keyboard.up('w');assert(await page.evaluate(old=>Math.hypot(__aimQA.player.position.x-old.x,__aimQA.player.position.z-old.z)>.1,coords));
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(400);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile page overflow');
 assert(await page.evaluate(()=>document.querySelector('.location-card').getBoundingClientRect().top>=document.querySelector('.beta-header').getBoundingClientRect().bottom),'mobile location covers navigation');await page.screenshot({path:'specs/beta8-halloween-mobile.png'});
 await page.setViewportSize({width:1440,height:900});await page.goto(base+'/beta-season.html?test=beta7',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__aimQA,{timeout:60000});const old=await page.evaluate(()=>({season:__aimQA.BETA_SEASON_ID,sky:__aimQA.scene.background.getHexString(),hasHalloween:!!__aimQA.halloweenDecor}));assert.equal(old.season,'beta7');assert.equal(old.sky,'d59a52');assert.equal(old.hasHalloween,false);report.push(old);
 assert.deepEqual(errors,[]);writeFileSync('specs/beta8-theme-verification.json',JSON.stringify({errors,report},null,2)+'\n');console.log('PASS: beta8 Halloween world/UI, decor, opaque ground, player movement, mobile layout, beta7 isolation and no runtime errors');
}finally{await browser?.close();server.closeAllConnections();await new Promise(done=>server.close(done));}
