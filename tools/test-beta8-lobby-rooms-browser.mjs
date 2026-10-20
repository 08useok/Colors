import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,existsSync,statSync,createReadStream,writeFileSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
import {chromium} from 'file:///C:/Users/useok/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const root=resolve('.'),errors=[],report=[];
const probe=`
window.__roomsQA={player,keys,modal,beta8LobbyRooms,BETA8_LOBBY_ROOMS,solids,canStandInBetaLobby,groundHeightAt,updateLocation,closeBetaModal,endGoldRush,
mode:()=>currentArenaMode,combat:()=>beta6Combat,
snapshot(){return {mode:currentArenaMode,position:player.position.toArray(),room:document.getElementById('location-name').textContent,children:beta8LobbyRooms?.root.children.map(c=>({name:c.name,objects:c.children.length})),prompt:!roomInteractButton.hidden};},
capture(id){const room=BETA8_LOBBY_ROOMS.find(r=>r.id===id);camera.position.set(room.x+18,room.y+22,room.z-22);camera.lookAt(room.x,room.y,room.z);renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png').split(',')[1];}};`;
const server=createServer((req,res)=>{
 const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+path);
 if(!file.startsWith(root+sep)||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'})[extname(file)]??'application/octet-stream');
 if(path==='/src/beta-season.js')res.end(readFileSync(file,'utf8')+probe);else createReadStream(file).pipe(res);
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));let browser;
try{
 browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-gpu']});
 const page=await browser.newPage({viewport:{width:1440,height:900}});page.on('pageerror',e=>errors.push(e.message));
 const base='http://127.0.0.1:'+server.address().port;
 const load=async suffix=>{await page.goto(base+'/beta-season.html'+suffix,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__roomsQA,null,{timeout:90000});await page.waitForFunction(()=>document.querySelector('#model-loading-screen').hidden,null,{timeout:120000});};
 await load('');
 for(const id of ['graveyard','workshop']){
   await page.locator('[data-lobby-room="'+id+'"]').click();
   await page.waitForFunction(()=>!document.getElementById('beta-room-interact').hidden);
   const snapshot=await page.evaluate(()=>__roomsQA.snapshot());assert(snapshot.prompt);assert.equal(snapshot.mode,'lobby');report.push(snapshot);
   assert(await page.evaluate(()=>{const p=__roomsQA.player.position;return __roomsQA.canStandInBetaLobby(p.x,p.z)&&Math.abs(p.y-__roomsQA.groundHeightAt(p.x,p.z)-.05)<.01;}));
   writeFileSync('specs/beta8-'+id+'-room.png',Buffer.from(await page.evaluate(id=>__roomsQA.capture(id),id),'base64'));
 }
 // Workbench opens the existing shop; neither interaction grants or spends currency.
 const credits=await page.locator('#credit-value').textContent();
 await page.locator('#beta-room-interact').click();
 assert(await page.evaluate(()=>!__roomsQA.modal.classList.contains('hidden')));
 assert.equal(await page.locator('#credit-value').textContent(),credits);
 await page.evaluate(()=>__roomsQA.closeBetaModal());
 // E and click share the same guarded interaction, and matches disable room shortcuts.
 await page.locator('[data-lobby-room="graveyard"]').click();await page.keyboard.press('e');
 await page.waitForFunction(()=>__roomsQA.mode()==='knockout');
 assert.equal(await page.evaluate(()=>__roomsQA.combat().actors.length),6);
 await page.waitForFunction(()=>document.querySelector('[data-lobby-room="workshop"]').disabled);
 assert(await page.locator('#beta-room-interact').isHidden());
 assert(await page.evaluate(()=>!__roomsQA.beta8LobbyRooms.root.parent.visible));
 await page.evaluate(()=>__roomsQA.endGoldRush('QA',false,null,true));
 assert.equal(await page.evaluate(()=>__roomsQA.mode()),'lobby');
 assert(await page.evaluate(()=>__roomsQA.beta8LobbyRooms.root.parent.visible));
 // Central paths, both entrances and interactions stay clear of furnishings.
 const paths=await page.evaluate(()=>{
   const q=__roomsQA,points=[];
   for(let z=32;z<=43;z+=.5)points.push([0,z]);
   for(let x=32;x<=41;x+=.5)points.push([x,0]);
   return points.map(([x,z])=>({x,z,safe:q.canStandInBetaLobby(x,z),blocked:q.solids.some(s=>s.walkable===false&&!s.mesh.userData.lobbyBoundary&&Math.abs(s.x-x)<s.halfW+.45&&Math.abs(s.z-z)<s.halfD+.45)}));
 });
 assert(paths.every(p=>p.safe&&!p.blocked),JSON.stringify(paths.filter(p=>!p.safe||p.blocked)));report.push({clearPaths:paths.length,knockoutActors:6,shopCurrencyUnchanged:true});
 await load('?test=beta7');
 assert.equal(await page.evaluate(()=>__roomsQA.beta8LobbyRooms),null);assert(await page.locator('[data-lobby-room="graveyard"]').isHidden());assert(await page.locator('#beta-room-interact').isHidden());
 assert.deepEqual(errors,[]);writeFileSync('specs/beta8-lobby-rooms-verification.json',JSON.stringify({report,pageErrors:errors,beta7Unchanged:true},null,2)+'\n');
 console.log('PASS: furnished rooms, safe paths/heights, shop and E-to-knockout, match isolation, return to lobby, beta7 unchanged; no page errors');
}finally{await browser?.close();server.closeAllConnections();await new Promise(done=>server.close(done));}
