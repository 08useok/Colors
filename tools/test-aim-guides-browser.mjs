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
  if(path==='/src/main.js') res.end(readFileSync(file,'utf8')+'\nwindow.__aimQA={state,CHARACTERS,ROSTER,startTraining,getPlayer,mouseAimWorld,updateAttackAimIndicator,supplementalAttackAim,seasonUltimateAim,createAccount,saveAccount,updateLobbyUI,indicators:[attackAimIndicator,greenAimIndicator,blueAimIndicator,orangeAimIndicator,yellowAimIndicator,cyanAimIndicator,purpleAimIndicator,pinkAimIndicator,crimsonAimIndicator,ivoryAimIndicator,chartreuseAimIndicator,season7AttackAim]};');
  else if(path==='/src/beta-season.js') res.end(readFileSync(file,'utf8')+'\nwindow.__aimQA={betaState,BETA_CHARACTERS,player,betaUltimateGuide,betaCyanGuide,modal,updateAttackAimIndicator};');
  else createReadStream(file).pipe(res);
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));let browser;
try {
  browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-gpu']});
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  page.on('pageerror',e=>errors.push(e.message));
  const base='http://127.0.0.1:'+server.address().port;
  await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__aimQA,{timeout:60000});
  await page.evaluate(()=>{const q=__aimQA,a=q.createAccount('aim-qa','조준검증');q.saveAccount(a);q.updateLobbyUI(a);q.startTraining();q.state.running=true;q.state.freezeUntil=0;});
  for(const id of await page.evaluate(()=>__aimQA.ROSTER)) {
    const basic=await page.evaluate(id=>{const q=__aimQA,p=q.getPlayer();p.characterType=id;q.state.manualAimActive=true;q.mouseAimWorld.set(p.mesh.position.x+4,0,p.mesh.position.z);q.updateAttackAimIndicator();return q.supplementalAttackAim.group.visible||q.indicators.some(g=>g.visible);},id);
    assert(basic,id+' main basic preview');
    await page.keyboard.down('q');await page.waitForTimeout(60);
    const ultimate=await page.evaluate(()=>__aimQA.seasonUltimateAim.group.visible&&__aimQA.seasonUltimateAim.group.children.length>0);
    assert(ultimate,id+' main ultimate key hold');await page.keyboard.up('q');await page.waitForTimeout(30);
    assert.equal(await page.evaluate(()=>__aimQA.seasonUltimateAim.group.visible),false);
    report.push({page:'main',id,basic,ultimate});
  }
  await page.evaluate(()=>{const q=__aimQA;q.getPlayer().characterType='ivory';q.state.manualAimActive=true;q.state.ultimateAiming=true;});
  await page.waitForTimeout(60);await page.screenshot({path:'specs/aim-guide-ivory.png'});
  await page.goto(base+'/beta-season.html?test=beta8',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__aimQA,{timeout:60000});
  await page.evaluate(()=>__aimQA.modal.classList.add('hidden'));
  for(const id of ['blue','cyan','crimson','yellow','purple','azure','orange','crystal','ivory','lavender','gold','green','pink','red','chartreuse','mint']) {
    await page.evaluate(id=>{__aimQA.betaState.selectedCharacter=id;__aimQA.updateAttackAimIndicator();},id);
    await page.keyboard.down('q');await page.waitForTimeout(70);
    assert(await page.evaluate(()=>__aimQA.betaUltimateGuide.group.visible&&__aimQA.betaUltimateGuide.group.children.length>0),id+' beta8 ultimate');
    await page.keyboard.up('q');await page.waitForTimeout(30);
    assert.equal(await page.evaluate(()=>__aimQA.betaUltimateGuide.group.visible),false);
    report.push({page:'beta8',id,ultimate:true});
  }
  assert.deepEqual(errors,[]);
  writeFileSync('specs/aim-guide-browser-verification.json',JSON.stringify({errors,report},null,2)+'\n');
  console.log('PASS: main 15 basic/ultimate previews, beta8 16 ultimate previews, key release cleanup, no browser runtime errors');
} finally {await browser?.close();server.closeAllConnections();await new Promise(done=>server.close(done));}
