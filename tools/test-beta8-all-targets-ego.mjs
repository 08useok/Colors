const task=await taskSpace('COLORS all target edges '+Date.now());console.log({spaceId:task.spaceId});const page=task.page('p1');await page.goto('http://127.0.0.1:4173/__colors_workspace');
const {BETA8_SIMULATION_PROFILE:p}=await import(new URL('./beta8-simulation-profile.mjs',import.meta.url));const {BETA8_COUNTER_TARGETS:targets}=await import(new URL('../src/config/beta8-counter-targets.js',import.meta.url));const rows=[];
for(const {id:left,targetWin:right}of targets){
 const r=await page.evaluate(async({p,left,right})=>{
  const[{BETA_CHARACTERS},{applyBeta7Balance},{applyBeta8Balance},{createBeta6Combat}]=await Promise.all([import('/src/config/beta-characters.js'),import('/src/config/beta7-balance.js'),import('/src/config/beta8-balance.js'),import('/src/combat/beta6-combat.js')]);const c=applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS));
  const scale=o=>{for(const[k,v]of Object.entries(o)){if(typeof v==='number'&&(k==='maxHealth'||k.endsWith('Damage')||['damage','damagePerSecond','poisonDPS'].includes(k)))o[k]=Math.round(v*1.1);else if(v&&typeof v==='object')scale(v);}};scale(c);
  const result={left,right,wins:0,losses:0,draws:0,byDistance:{}};
  for(const distance of p.distances)for(const aimError of p.aimErrors)for(let n=0;n<10;n++)for(const reverse of [false,true]){
   const m=reverse?-1:1,w=createBeta6Combat(structuredClone(c),{seed:20261025+n+distance*1000+(aimError===.1?10000:0),aimError,bounds:p.bounds,suddenDeath:p.zone}),a=w.add(reverse?right:left,{x:-m*distance/2,charge:0}),b=w.add(reverse?left:right,{x:m*distance/2,charge:0});
   for(let f=0;f<2700&&a.hp>0&&b.hp>0;f++)w.update(1/60);
   const v=(a.hp<=0&&b.hp<=0?Math.sign(a.hp/a.d.maxHealth-b.hp/b.d.maxHealth):a.hp<=0?-1:b.hp<=0?1:Math.sign(a.hp/a.d.maxHealth-b.hp/b.d.maxHealth))*m;
   const d=result.byDistance[distance]??={wins:0,losses:0,draws:0};for(const row of[result,d]){row.wins+=+(v>0);row.losses+=+(v<0);row.draws+=+(v===0);}w.clear();
  }return result;
 },{p,left,right});rows.push(r);console.log({left,right,wins:r.wins,losses:r.losses,draws:r.draws});if(r.wins!==240||r.losses||r.draws)throw Error('Target edge failed: '+JSON.stringify(r));
}
const fs=await import('node:fs/promises');await fs.writeFile(new URL('../specs/beta8-target-edges-browser.json',import.meta.url),JSON.stringify({version:'0.8.65',scope:'Actual browser isolated combat worlds, 17 specified target edges x240. Not rendered full-match play.',games:4080,rows},null,2));await task.finish({keep:[]});
