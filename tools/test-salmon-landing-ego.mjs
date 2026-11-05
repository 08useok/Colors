const qaProjectRoot=(await import('node:url')).fileURLToPath(new URL('../',import.meta.url));
const task=await taskSpace('COLORS Salmon landing buff '+Date.now());console.log({spaceId:task.spaceId});const page=task.page('p1');
await page.goto('http://127.0.0.1:4173/beta-season.html?test=beta8');
const result=await page.evaluate(async()=>{
 const [{BETA_CHARACTERS},{applyBeta7Balance},{applyBeta8Balance},{createBeta6Combat}]=await Promise.all([import('/src/config/beta-characters.js'),import('/src/config/beta7-balance.js'),import('/src/config/beta8-balance.js'),import('/src/combat/beta6-combat.js')]);
 const world=createBeta6Combat(applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS))),a=world.add('salmon',{automatic:false,team:'a',next:0}),b=world.add('red',{x:3,automatic:false,team:'b',hp:100000});
 world.fire(a,b);for(let i=0;i<40&&!b.salmonAirborne;i++)world.update(1/60);const before=b.hp,air=b.salmonAirborne;if(!air)throw Error('not captured');
 while(world.time<air.start+.6-1e-9)world.update(Math.min(1/60,air.start+.6-world.time));const peak=b.salmonHeight;
 for(let i=0;i<40;i++)world.update(1/60);const after=b.hp;
 for(let i=0;i<30;i++)world.update(1/60);const stable=b.hp;
 const result={captureDamage:100000-before,landingDamage:before-after,stable,after,peak,duration:air.until-air.start,charge:a.charge};world.clear();return result;
});
if(result.captureDamage!==3000||result.landingDamage!==600||result.stable!==result.after||Math.abs(result.peak-4.5)>1e-7||Math.abs(result.duration-1.2)>1e-7||result.charge!==4)throw Error(JSON.stringify(result));
const fs=await import('node:fs/promises');await fs.writeFile(qaProjectRoot+'specs/salmon-landing-browser.json',JSON.stringify(result,null,2));console.log(result);await task.finish({keep:[]});
