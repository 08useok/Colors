import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,existsSync,statSync,createReadStream,writeFileSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
import {chromium} from 'file:///C:/Users/useok/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const root=resolve('.'),errors=[],report=[];
const probe=`
window.__showdownQA={
start(index,plus=false){document.getElementById('beta-event-map-variant').value=String(index);startGoldRush('showdown',plus);goldRushState.invulnerableUntil=Infinity;for(const b of goldRushBots){b.combatActor.automatic=false;b.invulnerableUntil=Infinity;}return this.snapshot();},
snapshot(){const floor=showdownSolids.find(s=>s.mesh===iceCreamShowdownMap);const tiles=iceCreamShowdownMap.children.filter(o=>o.geometry?.parameters?.height===.12);const spawns=[{x:initialSpawnPoint.x,z:initialSpawnPoint.z},...goldRushBots.map(b=>({x:b.spawn.x,z:b.spawn.z}))];return{mode:currentArenaMode,id:activeEventLayout.id,halfWidth:activeEventLayout.halfWidth,halfDepth:activeEventLayout.halfDepth,floor:[floor.halfW,floor.halfD],tileBounds:[Math.min(...tiles.map(t=>t.position.x-t.geometry.parameters.width/2)),Math.max(...tiles.map(t=>t.position.x+t.geometry.parameters.width/2)),Math.min(...tiles.map(t=>t.position.z-t.geometry.parameters.depth/2)),Math.max(...tiles.map(t=>t.position.z+t.geometry.parameters.depth/2))],spawns,safe:spawns.every(p=>!mapBlocked(activeEventLayout,p.x,p.z,.7)),bots:goldRushBots.length,boundaries:activeEventLayout.walls.filter(r=>Math.abs(r.x)===showdownProfile.halfSize||Math.abs(r.z)===showdownProfile.halfSize).length,navStep:activeEventLayout.navigationStep};},
movement(){player.position.set(30,1.61,40);player.position.x=31;applyArenaWallBlock(player.position,30,40);const beyondOld=player.position.x;const ground=groundHeightAt(31,40);player.position.set(47,1.61,45);player.position.x=60;applyArenaWallBlock(player.position,47,45);return{beyondOld,ground,boundaryStopped:player.position.x===47};},
combat(){const w=beta6Combat,a=w.add('blue',{automatic:false,team:'qa',x:30,z:40,charge:100});w.cast(a,{x:100,z:40,hp:1},{angle:0});for(let i=0;i<80;i++)w.update(1/60);const x=a.x;w.remove(a);return x;},
capture(){const c=camera.clone();c.position.set(0,125,110);c.lookAt(0,1.5,0);renderer.render(scene,c);return renderer.domElement.toDataURL('image/png').split(',')[1];},
end(){endGoldRush('QA',false,null,true);return{mode:currentArenaMode,arenaHidden:!iceCreamShowdownMap.visible};}};`;
const server=createServer((req,res)=>{
 const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+path);
 if(!file.startsWith(root+sep)||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'})[extname(file)]??'application/octet-stream');
 if(path==='/src/beta-season.js')res.end(readFileSync(file,'utf8')+probe);else createReadStream(file).pipe(res);
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));let browser;
try{
 browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-gpu']});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.message));
 const base='http://127.0.0.1:'+server.address().port;
 await page.goto(base+'/beta-season.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__showdownQA,null,{timeout:90000});
 for(const plus of [false,true])for(let index=0;index<3;index++){
  const snap=await page.evaluate(([index,plus])=>__showdownQA.start(index,plus),[index,plus]);
  assert.equal(snap.halfWidth,50);assert.equal(snap.halfDepth,50);assert.deepEqual(snap.floor,[50,50]);assert.deepEqual(snap.tileBounds,[-50,50,-50,50]);assert.equal(snap.bots,9);assert(snap.safe,JSON.stringify(snap));assert.equal(snap.boundaries,4);assert.equal(snap.navStep,3.75);report.push(snap);
  await page.waitForFunction(()=>document.querySelector('#model-loading-screen').hidden,null,{timeout:120000});
  const move=await page.evaluate(()=>__showdownQA.movement());assert.equal(move.beyondOld,31);assert(move.ground>1.5);assert(move.boundaryStopped);
  const dashX=await page.evaluate(()=>__showdownQA.combat());assert(dashX>19&&dashX<=49,dashX);
  if(!plus&&index===2)writeFileSync('specs/beta8-showdown-size.png',Buffer.from(await page.evaluate(()=>__showdownQA.capture()),'base64'));
  const end=await page.evaluate(()=>__showdownQA.end());assert.equal(end.mode,'lobby');assert(end.arenaHidden);
 }
 await page.goto(base+'/beta-season.html?test=beta7',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__showdownQA,null,{timeout:90000});const legacy=await page.evaluate(()=>__showdownQA.start(0));assert.equal(legacy.halfWidth,20);assert.deepEqual(legacy.floor,[20,20]);
 assert.deepEqual(errors,[]);writeFileSync('specs/beta8-showdown-size-verification.json',JSON.stringify({maps:report,legacyHalfSize:legacy.halfWidth,movementBeyondOldBoundary:true,outerWallBlocking:true,combatBoundsExpanded:true,exitReturnsToLobby:true,pageErrors:errors},null,2)+'\n');
 console.log('PASS browser: 6 Showdown/Plus layouts 100x100, actual floor, safe spawns, 31-tile player movement, expanded combat bounds, walls, lobby return and beta7 isolation');
}finally{await browser?.close();server.closeAllConnections();await new Promise(done=>server.close(done));}
