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
    res.end(readFileSync(file, 'utf8') + `\nwindow.__fieldQA={selectCharacter,betaState,ultimateButton,updateCrimsonUltimateGauge,betaUltimateFieldActive,fill(){const id=betaState.selectedCharacter;if(id==='lavender')lavenderSpecialCharge=BETA_CHARACTERS.lavender.special.chargeRequired;if(id==='gold')goldUltimateCharge=BETA_CHARACTERS.gold.ultimateChargeRequired;if(id==='mint')mintUltimateCharge=BETA_CHARACTERS.mint.special.chargeRequired;if(id==='ivory')ivoryUltimateCharge=BETA_CHARACTERS.ivory.ultimate.chargeRequired;if(id==='green')greenUltimateCharge=BETA_CHARACTERS.green.ultimate.chargeRequired;updateCrimsonUltimateGauge();},snapshot(){return{active:betaUltimateFieldActive(),value:ultimateButton.getAttribute('aria-valuenow'),label:ultimateState.textContent,ready:ultimateButton.classList.contains('ready'),pending:goldUltimatePending!==null,zones:malfunctionZones.length};},expire(){for(const list of [malfunctionZones,mintIceZones,ivoryIceCreamZones,greenBushes])for(const zone of list)zone.expiresAt=-1;betaProjectiles.splice(0);if(lavenderPractice)lavenderPractice.world.clear();}};`);
  } else {
    res.setHeader('Content-Length', statSync(file).size);
    createReadStream(file).pipe(res);
  }
});

await new Promise(done => server.listen(0,'127.0.0.1',done));
let browser;
try {
 browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-gpu']});
 const page=await browser.newPage();page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});
 await page.goto('http://127.0.0.1:'+server.address().port+'/beta-season.html',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__fieldQA,null,{timeout:90000});
 for(const id of ['lavender','gold','mint','ivory','green']){
  await page.evaluate(id=>{const q=__fieldQA;if(!q.betaState.ownedCharacters.includes(id))q.betaState.ownedCharacters.push(id);q.selectCharacter(id);q.fill();q.ultimateButton.click();},id);
  await page.waitForFunction(()=>__fieldQA.betaUltimateFieldActive());
  const before=await page.evaluate(()=>{__fieldQA.fill();return __fieldQA.snapshot();});
  assert.equal(before.label,'사용 중',id);assert.equal(before.ready,false,id);
  const after=await page.evaluate(()=>{__fieldQA.ultimateButton.click();return __fieldQA.snapshot();});
  assert.equal(after.value,before.value,id+' preserves full charge');assert(after.active);
  if(id==='gold')await page.waitForFunction(()=>!__fieldQA.snapshot().pending&&__fieldQA.snapshot().zones>0);
  await page.evaluate(()=>__fieldQA.expire());
  await page.waitForFunction(()=>!__fieldQA.betaUltimateFieldActive()&&__fieldQA.snapshot().ready);
  await page.evaluate(()=>__fieldQA.ultimateButton.click());
  assert(await page.evaluate(()=>__fieldQA.betaUltimateFieldActive()),id+' reopens');
  if(id==='gold')await page.waitForFunction(()=>!__fieldQA.snapshot().pending);
  await page.evaluate(()=>__fieldQA.expire());
  report.push({id,activeLabel:before.label,recastBlocked:true,chargePreserved:true,expiryUnlocks:true});
  console.log('PASS browser field:',id);
 }
 assert.deepEqual(errors,[]);
 writeFileSync('specs/ultimate-field-lock-verification.json',JSON.stringify({date:'2026-10-15',report,pageErrors:errors},null,2)+'\n');
}finally{if(browser)await browser.close();server.closeAllConnections();await new Promise(done=>server.close(done));}
