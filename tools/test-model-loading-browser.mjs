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
  if (path === '/src/main.js' || path === '/src/beta-season.js') {
    res.end(readFileSync(file,'utf8') + (path === '/src/main.js' ? '\nwindow.__loadingQA={gate:modelLoading,state,beginAttack,createAccount,saveAccount,updateLobbyUI,startTraining,getPlayer};' : '\nwindow.__loadingQA={gate:modelLoading,betaState,selectCharacter,model:()=>activeCharacterModel,clock};'));
  } else {
    res.setHeader('Content-Length', statSync(file).size);
    createReadStream(file).pipe(res);
  }
});

await new Promise(done=>server.listen(0,'127.0.0.1',done));let browser;
try{
 browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-gpu']});
 for(const [name,path]of [['main','/index.html'],['beta','/beta-season.html']]){
  const page=await browser.newPage({viewport:{width:1280,height:900}});page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});let release;const held=new Promise(done=>release=done);let requests=0;
  await page.addInitScript(()=>{window.__loadingReopens=0;new MutationObserver(records=>{for(const r of records)if(r.target.id==='model-loading-screen'&&r.attributeName==='hidden'&&r.oldValue!==null)window.__loadingReopens++;}).observe(document,{subtree:true,attributes:true,attributeOldValue:true,attributeFilter:['hidden']});});
  await page.route(/\.(?:glb|fbx)(?:\?|$)/,async route=>{requests++;await held;await route.continue();});
  await page.goto('http://127.0.0.1:'+server.address().port+path,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__loadingQA,null,{timeout:90000});
  await page.waitForFunction(()=>__loadingQA.gate.blocking);assert(await page.locator('#model-loading-screen').isVisible());
  if(name==='main')await page.evaluate(()=>{const q=__loadingQA,a=q.createAccount('loading-qa','검증');a.ownedCharacters.push('ivory');a.selectedCharacter='ivory';q.saveAccount(a);q.updateLobbyUI(a);q.state.selectedCharacter='ivory';q.startTraining();});
  await page.waitForTimeout(500);assert(requests>0);assert(await page.locator('#model-loading-screen').isVisible());
  const before=await page.evaluate(()=>__loadingQA.state?.gameTime??__loadingQA.clock.elapsedTime);await page.keyboard.press('KeyW');await page.waitForTimeout(250);const after=await page.evaluate(()=>__loadingQA.state?.gameTime??__loadingQA.clock.elapsedTime);assert(Math.abs(before-after)<.001);
  await page.screenshot({path:'specs/'+name+'-model-loading.png'});release();
  try{await page.waitForFunction(()=>!__loadingQA.gate.blocking,null,{timeout:120000});}catch(error){console.log('BLOCKED',name,await page.locator('#model-loading-screen').innerText());throw error;}
  await page.waitForTimeout(1000);assert.equal(await page.evaluate(()=>window.__loadingReopens),0,'initial loading must not reopen');
  if(name==='beta')assert(await page.evaluate(()=>Boolean(__loadingQA.model())));
  else assert(await page.evaluate(()=>__loadingQA.getPlayer().mesh.userData.isGlbModel));
  report.push({page:name,delayedRequests:requests,screenHeldUntilReady:true,clockPaused:true,initialReopens:0,ready:true});console.log('PASS loading:',name);
  if(name==='beta'){
   await page.unroute(/\.(?:glb|fbx)(?:\?|$)/);
   await page.route(/\/azure\/normal\/.*\.fbx/,route=>route.abort());
   await page.evaluate(()=>{if(!__loadingQA.betaState.ownedCharacters.includes('azure'))__loadingQA.betaState.ownedCharacters.push('azure');__loadingQA.selectCharacter('azure');});
   await page.waitForFunction(()=>!document.querySelector('#model-loading-screen button').hidden);assert(await page.locator('#model-loading-screen').isVisible());
   assert((await page.locator('#model-loading-screen').innerText()).includes('불러오지 못했습니다'));report.push({page:'beta error',screenStays:true,retryVisible:true});console.log('PASS model failure/retry');
  }
  await page.close();
 }
 assert.deepEqual(errors,[]);writeFileSync('specs/model-loading-verification.json',JSON.stringify({date:'2026-10-17',report,pageErrors:errors},null,2)+'\n');
}finally{if(browser)await browser.close();server.closeAllConnections();await new Promise(done=>server.close(done));}
