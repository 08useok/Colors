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
  else if(path==='/src/beta-season.js') res.end(readFileSync(file,'utf8')+'\nwindow.__aimQA={BETA_SEASON_ID,CHARACTERS,BETA_SKINS,BETA_STORAGE_KEY,betaState};');
  else createReadStream(file).pipe(res);
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));let browser;
try {
 browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-gpu']});
 const page=await browser.newPage({viewport:{width:1280,height:900}});page.on('pageerror',e=>errors.push(e.message));
 const base='http://127.0.0.1:'+server.address().port;
 await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__aimQA,{timeout:60000});
 await page.evaluate(()=>{const q=__aimQA,a=q.createAccount('pins-qa','핀검증');a.coins=3000;a.cosmetics.ownedEmotes=['emote_thumbs'];a.cosmetics.equippedEmotes=['emote_thumbs',null,null];q.saveAccount(a);q.updateLobbyUI(a);});
 for(const[id,name]of [['beta6_pin_shark','상어 핀'],['beta6_pin_pufferfish','복어 핀'],['beta7_pin_scarab','스카라베 핀'],['beta7_pin_pharaoh','파라오 왕관 핀']]){
  await page.evaluate(()=>{document.getElementById('open-shop-btn').click();document.querySelector('.shop-tab[data-tab="cosmetics"]').click();});
  assert.equal(await page.locator('#cosmetics-emote-grid .cosmetics-card').count(),9);
  const purchased=await page.evaluate(({id,name})=>{const before=__aimQA.loadAccount().coins;const card=[...document.querySelectorAll('#cosmetics-emote-grid .cosmetics-card')].find(c=>c.textContent.includes(name));card.querySelector('button').click();const a=__aimQA.loadAccount();document.getElementById('shop-close-btn').click();return{owned:a.cosmetics.ownedEmotes.includes(id),delta:before-a.coins,slot:a.cosmetics.equippedEmotes.indexOf(id)};},{id,name});
  assert(purchased.owned);assert.equal(purchased.delta,300);assert(purchased.slot>=0);
  await page.evaluate(()=>{const q=__aimQA;q.startTraining();q.state.gameTime=10;q.state.freezeUntil=0;q.updateHud();});
  if(id.startsWith('beta6'))await page.waitForFunction(id=>__aimQA.emoteImages.get(id)?.naturalWidth>0,id);
  await page.keyboard.press(String(purchased.slot+1));
  assert.equal(await page.evaluate(id=>__aimQA.state.effects.filter(e=>e.type==='emote'&&e.emoteId===id).length,id),1);
  await page.keyboard.press(String(purchased.slot+1));assert.equal(await page.evaluate(()=>__aimQA.state.effects.filter(e=>e.type==='emote').length),1);
  await page.evaluate(()=>{const q=__aimQA;q.getPlayer().dead=true;q.state.gameTime+=5;});await page.keyboard.press(String(purchased.slot+1));assert.equal(await page.evaluate(()=>__aimQA.state.effects.filter(e=>e.type==='emote').length),1);
  await page.evaluate(()=>{__aimQA.getPlayer().dead=false;__aimQA.exitTraining();});assert(await page.locator('#emote-btns').evaluate(el=>el.classList.contains('hidden')));
  report.push({id,owned:true,price:300,used:true,cooldown:true,deathBlocked:true});
 }
 const a=await page.evaluate(()=>__aimQA.loadAccount());assert.equal(a.coins,1800);assert(a.cosmetics.ownedEmotes.includes('emote_thumbs'));assert.equal(a.cosmetics.ownedEmotes.length,5);
 await page.goto(base+'/beta-season.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__aimQA,{timeout:60000});
 const beta=await page.evaluate(()=>({season:__aimQA.BETA_SEASON_ID,roster:__aimQA.CHARACTERS.map(c=>c.id),skinCount:__aimQA.BETA_SKINS.length,storage:__aimQA.BETA_STORAGE_KEY,heading:document.querySelector('.beta-header h1').textContent,title:document.title}));assert.equal(beta.season,'beta8');assert.equal(beta.roster.length,16);assert(beta.roster.includes('lavender'));assert.equal(beta.skinCount,8);assert.equal(beta.storage,'colorsBetaSeason8Test');assert(beta.heading.includes('8'));report.push(beta);
 for (const season of ['beta5','beta6','beta7']) {
  await page.goto(base+'/beta-season.html?test='+season,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__aimQA,{timeout:60000});
  const current=await page.evaluate(()=>({season:__aimQA.BETA_SEASON_ID,title:document.title,heading:document.querySelector('.beta-header h1').textContent}));
  assert.equal(current.season,season);assert(current.title.includes(season.slice(-1)));assert(current.heading.includes(season.slice(-1)));report.push(current);
 }
 assert.deepEqual(errors,[]);writeFileSync('specs/emote-beta8-verification.json',JSON.stringify({errors,report},null,2)+'\n');console.log('PASS: 9 shop emotes, 4 actual purchases/equips/key uses, image pins, cooldown/death/lobby guards, preserved ownership, beta8 default16 and 8 skins');
}finally{await browser?.close();server.closeAllConnections();await new Promise(done=>server.close(done));}
