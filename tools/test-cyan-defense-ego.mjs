const qaProjectRoot=(await import('node:url')).fileURLToPath(new URL('../',import.meta.url));
const task=await taskSpace('COLORS Cyan defense '+Date.now());console.log({spaceId:task.spaceId});const page=task.page('p1');
await page.goto('http://127.0.0.1:4194/beta-season.html?test=beta8');await page.waitForFunction(()=>window.__cyanDefenseQA?.ready(),undefined,{timeout:90000});
await page.evaluate(()=>__cyanDefenseQA.pick());await page.waitForFunction(()=>__cyanDefenseQA.ready(),undefined,{timeout:90000});
const samples=[];
for(const yaw of [0,Math.PI/2,.7]){
 const shots=await page.evaluate(yaw=>__cyanDefenseQA.shoot(yaw),yaw);if(shots.length!==6)throw Error('expected six pills: '+JSON.stringify(shots));
 for(const p of shots)if(Math.abs(p.vx-shots[0].vx)>1e-7||Math.abs(p.vz-shots[0].vz)>1e-7)throw Error('fan regression');
 // Lateral projection is unaffected by frame-to-frame forward movement.
 for(let i=1;i<6;i++){const spacing=(shots[i].x-shots[i-1].x)*Math.cos(yaw)-(shots[i].z-shots[i-1].z)*Math.sin(yaw);if(Math.abs(spacing-.75)>1e-6)throw Error('spacing mismatch: '+spacing);}
 samples.push({yaw,count:shots.length,parallel:true,spacing:.75});
}
const policy=await page.evaluate(async()=>{
 const [{BETA_CHARACTERS},{applyBeta7Balance},{applyBeta8Balance},{createBeta6Combat}]=await Promise.all([import('/src/config/beta-characters.js'),import('/src/config/beta7-balance.js'),import('/src/config/beta8-balance.js'),import('/src/combat/beta6-combat.js')]);
 const defs=applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS)),rows=[];
 for(const id of ['cyan','azure','crimson'])for(const [enemy,distance,manual]of [['red',2,false],['pink',2,false],['red',defs[id].botKnockbackUltimateTankRange+.1,false],['green',2,false],['green',2,true]]){
  const w=createBeta6Combat(defs),a=w.add(id,{automatic:!manual,team:'a'}),b=w.add(enemy,{x:distance,automatic:false,team:'b'});a.charge=a.u.chargeRequired;const cast=w.cast(a,b);rows.push({id,enemy,distance,manual,cast,reach:defs[id].botKnockbackUltimateTankRange});w.clear();
 }
 const pushes=[];for(const id of ['cyan','azure']){const w=createBeta6Combat(defs,{bounds:40}),a=w.add(id,{automatic:false,team:'a'}),b=w.add('red',{automatic:false,team:'b',x:2,hp:100000});a.charge=a.u.chargeRequired;w.cast(a,b,{angle:0});for(let i=0;i<60;i++)w.update(1/60);pushes.push({id,distance:b.x-2,expected:a.u.knockback});w.clear();}
 const w=createBeta6Combat(defs),a=w.add('crystal',{automatic:false,team:'a'}),b=w.add('red',{automatic:false,team:'b',x:2,hp:100000});a.charge=a.u.chargeRequired;b.guardUntil=100;w.cast(a,b);for(let i=0;i<510;i++)w.update(1/60);const executionHp=b.hp;w.clear();
 return{cyanDamage:defs.cyan.ultimate.damage,rows,pushes,executionHp,charge:{cyan:defs.cyan.ultimate.chargeRequired,lavender:defs.lavender.special.chargeRequired,crystal:defs.crystal.ultimate.chargeRequired}};
});
if(policy.cyanDamage!==5200||policy.rows.some(r=>r.cast!==(r.manual||(['red','pink'].includes(r.enemy)&&r.distance<=r.reach))))throw Error(JSON.stringify(policy));
if(policy.executionHp!==0||policy.pushes.some(r=>Math.abs(r.distance-r.expected)>1e-6)||policy.charge.cyan!==2||policy.charge.lavender!==1||policy.charge.crystal!==1.5)throw Error('ability regression '+JSON.stringify(policy));
const fs=await import('node:fs/promises');await fs.writeFile(qaProjectRoot+'specs/cyan-defense-browser.json',JSON.stringify({samples,policy},null,2));console.log({samples,policy});if(!globalThis.__keepCounterSpace)await task.finish({keep:[]});
