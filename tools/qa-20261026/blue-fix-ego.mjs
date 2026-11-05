const qaProjectRoot=(await import('node:url')).fileURLToPath(new URL('../../',import.meta.url));
const task=await taskSpace('COLORS Crimson dodge and Blue fix '+Date.now());console.log({spaceId:task.spaceId});const page=task.page('p1');
await page.goto('http://127.0.0.1:4173/__colors_workspace');
const result=await page.evaluate(async()=>{
 const [{BETA_CHARACTERS},{applyBeta7Balance},{applyBeta8Balance},{createBeta6Combat}]=await Promise.all([import('/src/config/beta-characters.js'),import('/src/config/beta7-balance.js'),import('/src/config/beta8-balance.js'),import('/src/combat/beta6-combat.js')]);
 const defs=applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS));let evaded=0;
 for(let seed=1;seed<=400;seed++){const w=createBeta6Combat(defs,{seed,aimError:0}),a=w.add('blue',{automatic:false,next:0}),b=w.add('green',{x:6});w.fire(a,b,0);w.update(.07);evaded+=+(b.dodgeUntil>w.time);w.clear();}
 const movement=[];for(const x of [25,17,8]){const w=createBeta6Combat(defs,{bounds:40}),a=w.add('blue',{hp:100,next:100});w.add('red',{x,automatic:false});w.update(1/60);movement.push({distance:x,dx:a.x});w.clear();}
 return {chance:defs.green.projectileDodgeChance,evaded,opportunities:400,crimson:{speed:defs.crimson.projectileDodgeSpeedMultiplier,cooldown:defs.crimson.projectileDodgeCooldown},blue:{min:defs.blue.attackPerceptionMinRange,max:defs.blue.attackPerceptionRange,duration:defs.blue.projectileDodgeDuration},movement};
});
if(result.chance!==.5||result.evaded!==188||result.crimson.speed!==1.5||result.crimson.cooldown!==.9||result.movement[0].dx<=0||result.movement[1].dx!==0||result.movement[2].dx>=0)throw Error(JSON.stringify(result));
console.log(result);const fs=await import('node:fs/promises');await fs.writeFile(qaProjectRoot+'specs/beta8-blue-fix-browser.json',JSON.stringify(result,null,2));globalThis.__counterSpace=task.spaceId;await import('../verify-beta8-counter-cycle-ego.mjs');
