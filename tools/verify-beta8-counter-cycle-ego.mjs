const fs=await import('node:fs/promises'),crypto=await import('node:crypto');
const reportPath=new URL('../specs/beta8-counter-cycle-verification.json',import.meta.url);
const report=JSON.parse(await fs.readFile(reportPath,'utf8'));
const task=await taskSpace(globalThis.__counterSpace ?? ('COLORS full counter verification '+Date.now()));console.log({spaceId:task.spaceId});const page=task.page('p1');
// A read-only JSON document avoids booting the game or modifying account saves.
await page.goto('http://127.0.0.1:4173/__colors_workspace');
for(const [path,hash] of Object.entries(report.sourceHashes)){
 const r=await page.fetch('/'+path,{cache:'no-store'});if(!r.ok||crypto.createHash('sha256').update(r.body.replaceAll('\r\n','\n')).digest('hex')!==hash)throw Error('served source mismatch: '+path);
}
const balance=await page.evaluate(async()=>{
 const [{BETA_CHARACTERS},{applyBeta7Balance},{applyBeta8Balance},{createBeta6Combat}]=await Promise.all([import('/src/config/beta-characters.js'),import('/src/config/beta7-balance.js'),import('/src/config/beta8-balance.js'),import('/src/combat/beta6-combat.js')]);const defs=applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS)),g=defs.gold;
 const stages=[];for(const stage of [2,3]){const sw=createBeta6Combat(defs),sa=sw.add('crystal',{automatic:false}),sb=sw.add('red',{x:.7,automatic:false,hp:100000});sw.projectiles.push({key:999,owner:sa,x:0,z:0,origin:{x:0,z:0},yaw:0,speed:18,reach:4,traveled:0,damage:stage===2?defs.crystal.fragmentDamage:defs.crystal.shardDamage,radius:.18,hits:new Set(),start:0,ultimate:false,kind:'crystal',stage,token:{hits:new Set()}});sw.update(1/60);stages.push({stage,damage:100000-sb.hp,charge:sa.charge});sw.clear();}if(stages[0].damage!==defs.crystal.fragmentDamage||stages[1].damage!==defs.crystal.shardDamage||stages[1].charge!==.5)throw Error('crystal stage change mismatch');
 const w=createBeta6Combat(defs),a=w.add('crystal',{automatic:false}),b=w.add('red',{x:2,automatic:false,hp:50000});b.guardUntil=100;a.charge=a.u.chargeRequired;w.cast(a,b);for(let i=0;i<540;i++)w.update(1/60);const remaining=b.hp;w.clear();
 if(remaining!==22000)throw Error('analysis fixed damage mismatch '+remaining);
 const lock=createBeta6Combat(defs),ca=lock.add('crystal',{next:100}),cb=lock.add('red',{x:5,hp:50000,next:100,automatic:false});ca.charge=ca.u.chargeRequired;for(let i=0;i<96;i++)lock.update(1/60);const before=[ca.x,ca.z,cb.x,cb.z];for(let i=0;i<120;i++)lock.update(1/60);const boundMovement=Math.max(...[ca.x,ca.z,cb.x,cb.z].map((v,i)=>Math.abs(v-before[i])));lock.clear();if(boundMovement>1e-9)throw Error('analysis actors moved while bound');

 return {gold:{health:g.maxHealth,stages:[g.stage1Damage,g.stage2Damage,g.stage3Damage],ultimateTick:g.ultimate.tickDamage},purple:{required:defs.purple.ultimate.chargeRequired,perBasicHit:defs.purple.basicUltimateChargeMultiplier,poison:defs.purple.poisonDPS,poisonDuration:defs.purple.poisonDuration,needleSpeed:defs.purple.needleSpeed,ultimateDamage:defs.purple.ultimate.damage,thornDamage:defs.purple.ultimate.projectileDamage,recycle:defs.purple.ultimate.rechargePerHit},crystal:{fixed:defs.crystal.ultimate.executionFixedAmount,shielded50000Remaining:remaining,boundMovement,stages}};
});
let checked=0;const differences=[];
for(let offset=0;offset<report.browserCases.length;offset+=12){
 const result=await page.evaluate(async cases=>{
  const [{BETA_CHARACTERS},{applyBeta7Balance},{applyBeta8Balance},{createBeta6Combat}]=await Promise.all([import('/src/config/beta-characters.js'),import('/src/config/beta7-balance.js'),import('/src/config/beta8-balance.js'),import('/src/combat/beta6-combat.js')]);
  return cases.map(c=>{
   const config=structuredClone(applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS))),multiplier=1+(c.scenario.level-1)*.02;
   function scale(obj){for(const[k,v]of Object.entries(obj)){if(typeof v==='number'&&(k==='maxHealth'||k.endsWith('Damage')||['damage','damagePerSecond','poisonDPS'].includes(k)))obj[k]=Math.round(v*multiplier);else if(v&&typeof v==='object')scale(v);}}scale(config);
   const w=createBeta6Combat(config,{seed:c.seed,aimError:c.scenario.aimError,bounds:c.scenario.bounds,suddenDeath:{start:30,end:45,startRadius:40,endRadius:8,damagePerSecond:.25}});
   const a=w.add(c.first,{x:-c.mirror*c.scenario.distance/2,charge:0}),b=w.add(c.second,{x:c.mirror*c.scenario.distance/2,charge:0});
   for(let f=0;f<45*60&&a.hp>0&&b.hp>0;f++)w.update(1/60);
   const outcome=a.hp<=0&&b.hp<=0?Math.sign(a.hp/a.d.maxHealth-b.hp/b.d.maxHealth):a.hp<=0?-1:b.hp<=0?1:Math.sign(a.hp/a.d.maxHealth-b.hp/b.d.maxHealth);
   const hp=[a.hp,b.hp];w.clear();return{first:c.first,second:c.second,scenario:c.scenario,seed:c.seed,mirror:c.mirror,outcome,expectedOutcome:c.outcome,hp,expectedHp:c.hp,outcomeMatch:outcome===c.outcome,hpMatch:hp.every((h,i)=>Math.abs(h-c.hp[i])<1e-6)};
  });
 },report.browserCases.slice(offset,offset+12));
 differences.push(...result.filter(r=>!r.outcomeMatch||!r.hpMatch));checked+=result.length;
}
const outcomeDifferences=differences.filter(r=>!r.outcomeMatch).length;
await fs.writeFile(new URL('../specs/beta8-counter-cycle-browser.json',import.meta.url),JSON.stringify({balance,profile:report.profile,checked,outcomeDifferences,hpDifferences:differences.filter(r=>!r.hpMatch).length,differences,sourceHashesMatch:true,scope:'Target edges, seed 0, distances from current report, both actor orders; isolated in-browser combat worlds, no rendered play-through'},null,2));
console.log({balance,profile:report.profile,checked,outcomeDifferences,differences,sourceHashesMatch:true});await task.finish({keep:[]});
