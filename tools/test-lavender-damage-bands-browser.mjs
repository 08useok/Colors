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
  if (path === '/src/beta-season.js') {
    res.end(readFileSync(file,'utf8')+"\nwindow.__balanceQA={defs:BETA_CHARACTERS,betaState,selectCharacter,ultimateButton,setup(){selectCharacter(\"lavender\");player.position.set(-40,6.25,0);player.rotation.y=Math.PI/2;for(const t of testTargets)t.visible=false;const t=testTargets[0];t.visible=true;t.position.set(-37,6.25,0);t.userData.health=t.userData.maxHealth=1000000;lavenderSpecialCharge=0;useLavenderPracticeSkill(false);},cast(){lavenderSpecialCharge=BETA_CHARACTERS.lavender.special.chargeRequired;ultimateButton.click();},snapshot(){return{time:lavenderPractice?.world.time,interval:lavenderPractice?.world.zones.find(z=>z.kind==='perfumeSpray')?.hits.values().next().value?.interval,charge:lavenderSpecialCharge,health:testTargets[0].userData.health,damage:BETA_CHARACTERS.lavender.special.damagePerSecond,field:betaUltimateFieldActive()};}};");
  } else {
    res.setHeader('Content-Length', statSync(file).size);
    createReadStream(file).pipe(res);
  }
});

await new Promise(done=>server.listen(0,'127.0.0.1',done));let browser;
try{
 browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-gpu']});const page=await browser.newPage();page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});
 const base='http://127.0.0.1:'+server.address().port;
 await page.goto(base+'/beta-season.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__balanceQA,null,{timeout:90000});
 assert.equal(await page.evaluate(()=>Object.values(__balanceQA.defs).filter(d=>d.basicUltimateChargeMultiplier===.5).length),16);
 await page.evaluate(()=>__balanceQA.setup());await page.waitForFunction(()=>Math.abs(__balanceQA.snapshot().charge-1.5)<1e-8);
 const basic=await page.evaluate(()=>__balanceQA.snapshot());assert.equal(1000000-basic.health,3300,'3-tile near band deals 1100 x 3');assert.deepEqual(await page.evaluate(()=>__balanceQA.defs.lavender.sprayDamageBands),[{maxRange:3,multiplier:1},{maxRange:6,multiplier:1.25},{maxRange:9,multiplier:1.5}]);assert(Math.abs(basic.interval-1/3)<1e-8);assert(basic.time<1.05);await page.evaluate(()=>__balanceQA.cast());
 await page.waitForFunction(health=>Math.abs(__balanceQA.snapshot().health-(health-975))<.001,basic.health);
 const ultimate=await page.evaluate(()=>__balanceQA.snapshot());assert(Math.abs(ultimate.charge-.025)<1e-8);assert(ultimate.field);
 await page.goto(base+'/beta-season.html?test=beta7',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__balanceQA,null,{timeout:90000});assert.equal(await page.evaluate(()=>__balanceQA.defs.red.basicUltimateChargeMultiplier??1),1);assert.equal(await page.evaluate(()=>__balanceQA.defs.lavender.special.damagePerSecond),780);
 assert.deepEqual(errors,[]);console.log('PASS browser: 3-tile fixed-band damage 3300, 16 beta8 charge modifiers, Lavender 3 basic ticks = 1.5 charge, 975 ultimate tick / .025 recharge, beta7 unchanged');
 writeFileSync('specs/lavender-damage-bands-browser.json',JSON.stringify({basic,ultimate,beta7Unchanged:true,pageErrors:errors},null,2)+'\n');
}finally{if(browser)await browser.close();server.closeAllConnections();await new Promise(done=>server.close(done));}
