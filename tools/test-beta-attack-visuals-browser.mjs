import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, createReadStream, writeFileSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { chromium } from 'file:///C:/Users/useok/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const root = resolve('.'), errors = [];
// Instrument only the served response; no debug globals enter the game source.
const probe = `
window.__visualQA = {
  run() {
    const signature = mesh => ({geometry:mesh.geometry?.type, color:mesh.material?.color?.getHex(), emissive:mesh.material?.emissive?.getHex(), children:mesh.children.map(signature)});
    const pairs = [
      ['orange', 'bomb', 1, createOrangeFruitMesh], ['ivory','ivory',1,createIvoryScoopMesh],
      ...[1,2,3].map(stage=>['gold','gold',stage,()=>createGoldProjectileMesh(stage)]),
      ...[1,2,3].map(stage=>['crystal','crystal',stage,()=>createCrystalProjectileMesh(stage)]),
      ['green','boomerang',1,createGreenBoomerangMesh], ['blue','bullet',1,createBlueMarbleMesh],
      ['cyan','bullet',1,createCyanPillMesh], ['purple','needle',1,createPurpleNeedleMesh],
      ['purple','vial',1,createPurpleVialMesh], ['yellow','electric',1,createYellowBoltMesh],
      ['mint','mint',1,createMintIceCreamMesh]
    ].map(([id,kind,stage,make])=>({id,kind,stage,lobby:signature(make()),battle:signature(createBeta6ProjectileMesh({kind,stage,owner:{id}},0xffffff))}));
    const results=[];
    clearGoldRushBots();
    for(const id of Object.keys(BETA_CHARACTERS)) {
      clearBeta6RoundCombat(); betaState.selectedCharacter=id;
      player.position.set(-40,groundHeightAt(-40,0)+.05,0);
      Object.assign(goldRushState,{health:BETA_CHARACTERS[id].maxHealth,dead:false,invulnerableUntil:0});
      const options={seed:87,aimError:0,onEvent:e=>beta6PendingEvents.push(e)};
      beta6Combat=createBeta6Combat(BETA_CHARACTERS,options);
      const reference=createBeta6Combat(BETA_CHARACTERS,{seed:87,aimError:0});
      const data={automatic:false,x:-40,z:0,next:0,index:id==='purple'?1:0};
      beta6PlayerActor=beta6Combat.add(id,data);
      const mirror=reference.add(id,data);
      const targetData={automatic:false,x:-38,z:0,hp:1000000,next:0};
      const target=beta6Combat.add('red',targetData), other=reference.add('red',targetData);
      const fired=beta6Combat.fire(beta6PlayerActor,target,0);
      reference.fire(mirror,other,0);
      const seen=new Set(), heights=[];
      for(let i=0;i<100;i++) {
        updateBeta6BotCombat(.01); reference.update(.01);
        for(const mesh of beta6CombatVisuals.values()) {
          if(mesh.userData.attackVisual)seen.add(mesh.userData.attackVisual);
          if(mesh.userData.launchY!=null) heights.push(mesh.position.y-mesh.userData.launchY);
        }
      }
      const effects=crimsonSlashes.filter(e=>e.beta6CombatEffect);
      results.push({id,fired,seen:[...seen],maxArc:Math.max(0,...heights),effects:effects.length,
        gloves:effects.filter(e=>e.type==='redGlove').length,
        fans:effects.filter(e=>e.mesh.geometry.type==='ShapeGeometry').length,
        notes:effects.filter(e=>e.noteOrigin).length,
        actual:{hp:target.hp,charge:beta6PlayerActor.charge},reference:{hp:other.hp,charge:mirror.charge}});
    }
    const spin=[];
    for(const [type,make] of [['boomerang',createGreenBoomerangMesh],['orangeFruit',createOrangeFruitMesh],['marble',createBlueMarbleMesh],['needle',createPurpleNeedleMesh],['gold',()=>createGoldProjectileMesh(3)]]) {
      const mesh=make();
      updateBetaProjectileSpin(mesh,type,.1);const first=mesh.quaternion.toArray();
      updateBetaProjectileSpin(mesh,type,.1);const second=mesh.quaternion.toArray();
      spin.push({type,first,second,angle:mesh.userData.visualSpin??0});
    }
    const hero=beta6PlayerActor,w=beta6Combat;
    hero.poisonUntil=hero.slowUntil=hero.lockUntil=w.time+2;
    updateBeta6StatusVisuals(w);
    const statusCount=beta6StatusVisuals.size, original=beta6StatusVisuals.get(hero.key+':poison');
    hero.x+=3;hero.z+=4;hero.poisonUntil+=1;
    updateBeta6StatusVisuals(w);
    const status={count:statusCount,reused:original===beta6StatusVisuals.get(hero.key+':poison'),follows:original.group.position.x===hero.x&&original.group.position.z===hero.z,extended:original.life===3};
    hero.poisonUntil=hero.slowUntil=hero.lockUntil=0;updateBeta6StatusVisuals(w);
    status.expired=beta6StatusVisuals.size===0&&original.life===0;
    const hidden=w.actors[1];hidden.poisonUntil=hidden.hiddenUntil=w.time+2;hidden.revealedUntil=0;hidden.bush={x:hidden.x,z:hidden.z};
    updateBeta6StatusVisuals(w);status.hiddenEnemy=!beta6StatusVisuals.has(hidden.key+':poison');
    const zone=createIvoryIceCreamZoneMesh(2),puddle=zone.children.find(c=>c.geometry?.type==='CircleGeometry');
    updateIvoryZoneVisual(zone,5,0);const initialOpacity=puddle.material.opacity;
    updateIvoryZoneVisual(zone,5,4.8);const ivoryFade={initial:initialOpacity,ending:puddle.material.opacity};
    clearBeta6RoundCombat();
    return {pairs,results,spin,status,ivoryFade,cleanup:{visuals:beta6CombatVisuals.size,queue:beta6AttackVisualQueue.length,projectiles:beta6VisualProjectiles.size,status:beta6StatusVisuals.size,effects:crimsonSlashes.filter(e=>e.beta6CombatEffect).length}};
  },
  scene(){
    betaState.selectedCharacter='ivory';startGoldRush('gemGrab');
    for(const a of beta6Combat.actors)a.automatic=false;
    beta6PlayerActor.next=0;beta6PlayerActor.ammo=3;
    beta6Combat.fire(beta6PlayerActor,{x:player.position.x+5,z:player.position.z},0);
    updateBeta6BotCombat(.25);
    renderer.render(scene,camera);
  },
  gallery(){
    const gallery=new THREE.Scene();gallery.background=new THREE.Color(0x252136);
    gallery.add(new THREE.HemisphereLight(0xffffff,0x666080,3));
    const light=new THREE.DirectionalLight(0xffffff,4);light.position.set(-4,10,8);gallery.add(light);
    const view=new THREE.PerspectiveCamera(40,1440/900,.1,100);view.position.set(0,16,22);view.lookAt(0,0,0);
    const types=[['Orange',()=>createOrangeFruitMesh(),{kind:'bomb',owner:{id:'orange'}}],
      ['Ivory',()=>createIvoryScoopMesh(),{kind:'ivory',owner:{id:'ivory'}}],
      ['Gold ore',()=>createGoldProjectileMesh(1),{kind:'gold',stage:1,owner:{id:'gold'}}],
      ['Gold ingot',()=>createGoldProjectileMesh(3),{kind:'gold',stage:3,owner:{id:'gold'}}],
      ['Azure wave',()=>createAzureWaveMesh(2),null]];
    for(let row=0;row<2;row++)for(let i=0;i<types.length;i++){
      const [name,make,p]=types[i],mesh=row===0||!p?make():createBeta6ProjectileMesh(p,0xffffff);
      mesh.position.set((i-2)*4,0,(row-.5)*6);mesh.scale.setScalar(2);gallery.add(mesh);
      const label=document.createElement('canvas');label.width=512;label.height=64;
      const ctx=label.getContext('2d');ctx.fillStyle='#ffffff';ctx.font='30px sans-serif';ctx.textAlign='center';ctx.fillText((row?'BATTLE':'LOBBY')+' / '+name,256,42);
      const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(label)}));sprite.scale.set(3.8,.48,1);sprite.position.set((i-2)*4,-.3,(row-.5)*6+2);gallery.add(sprite);
    }
    renderer.render(gallery,view);const png=renderer.domElement.toDataURL('image/png');
    gallery.traverse(part=>{part.geometry?.dispose();const m=part.material;if(m){m.map?.dispose();m.dispose();}});
    return png.split(',')[1];
  }
};`;
const server = createServer((req,res)=>{
  const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname), file=resolve(root,'.'+path);
  if(!file.startsWith(root+sep)||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404).end();return;}
  res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'})[extname(file)]??'application/octet-stream');
  if(path==='/src/beta-season.js')res.end(readFileSync(file,'utf8')+probe);
  else createReadStream(file).pipe(res);
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));let browser;
try {
  browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-gpu']});
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/beta-season.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__visualQA,null,{timeout:90000});
  await page.waitForFunction(()=>document.querySelector('#model-loading-screen')?.hidden,null,{timeout:120000});
  const report=await page.evaluate(()=>__visualQA.run());
  for(const pair of report.pairs)assert.deepEqual(pair.battle,pair.lobby,pair.id+' '+pair.stage);
  for(const r of report.results){assert(r.fired,r.id);assert.deepEqual(r.actual,r.reference,r.id+' damage/charge');}
  const result=id=>report.results.find(r=>r.id===id);
  assert.equal(result('red').gloves,2);assert.equal(result('crimson').fans,3);assert.equal(result('pink').notes,8);
  assert(result('orange').seen.includes('orangeFruit'));
  assert(result('ivory').seen.includes('ivoryZone'));assert(result('ivory').maxArc>1);
  assert(result('purple').maxArc>1);assert(result('azure').seen.includes('azureWave'));
  for(const s of report.spin) {
    if(['marble','needle'].includes(s.type))assert.deepEqual(s.first,s.second,s.type+' fixed heading');
    else {assert.notDeepEqual(s.first,s.second,s.type+' accumulated spin');assert(Math.abs(s.angle-(s.type==='boomerang'?1.6:1.8))<1e-8);}
  }
  assert.deepEqual(report.status,{count:3,reused:true,follows:true,extended:true,expired:true,hiddenEnemy:true});
  assert(report.ivoryFade.ending<report.ivoryFade.initial);
  assert.deepEqual(report.cleanup,{visuals:0,queue:0,projectiles:0,status:0,effects:0});
  await page.evaluate(()=>__visualQA.scene());
  await page.waitForFunction(()=>document.querySelector('#model-loading-screen')?.hidden,null,{timeout:120000});
  writeFileSync('specs/beta-attack-visuals.png',Buffer.from(await page.evaluate(()=>__visualQA.gallery()),'base64'));
  assert.deepEqual(errors,[]);
  writeFileSync('specs/beta-attack-visuals-verification.json',JSON.stringify({...report,pageErrors:errors},null,2)+'\n');
  console.log('PASS: 15 lobby/battle mesh pairs, 16 character attacks with unchanged damage/charge, arcs, melee effects and teardown; no page errors');
} finally {await browser?.close();server.closeAllConnections();await new Promise(done=>server.close(done));}
