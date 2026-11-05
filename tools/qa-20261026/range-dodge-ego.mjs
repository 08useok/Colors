const qaProjectRoot=(await import('node:url')).fileURLToPath(new URL('../../',import.meta.url));
const task=await taskSpace('COLORS range and bot evasion '+Date.now());console.log({spaceId:task.spaceId});
const page=task.page('p1');await page.goto('http://127.0.0.1:4173/__colors_workspace');
const result=await page.evaluate(async()=>{
 const [{BETA_CHARACTERS},{applyBeta7Balance},{applyBeta8Balance},{createBeta6Combat}]=await Promise.all([import('/src/config/beta-characters.js'),import('/src/config/beta7-balance.js'),import('/src/config/beta8-balance.js'),import('/src/combat/beta6-combat.js')]);
 const defs=applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS));
 const w=createBeta6Combat(defs,{aimError:0,bounds:40}),a=w.add('blue',{next:0}),b=w.add('red',{x:19,automatic:false,hp:100000});
 for(let i=0;i<60;i++)w.update(1/60);
 const range={range:defs.blue.bulletRange,recognition:defs.blue.attackPerceptionRange,attacks:a.attackCount,damage:100000-b.hp};w.clear();
 const d=createBeta6Combat(defs,{aimError:0,bounds:40}),shooter=d.add('blue',{next:0,automatic:false}),bot=d.add('green',{x:6,next:0});d.fire(shooter,bot,0);
 for(let i=0;i<6;i++)d.update(1/60);
 const dodge={active:bot.dodgeUntil>d.time,cooldown:bot.dodgeNext,attacks:bot.attackCount,position:[bot.x,bot.z]};d.clear();return {range,dodge};
});
if(result.range.range!==20||result.range.recognition!==20||!result.range.attacks||result.range.damage<=0||!result.dodge.active||!result.dodge.attacks)throw Error(JSON.stringify(result));
console.log(result);const fs=await import('node:fs/promises');await fs.writeFile(qaProjectRoot+'specs/beta8-range-dodge-browser.json',JSON.stringify(result,null,2));
globalThis.__counterSpace=task.spaceId;await import('../verify-beta8-counter-cycle-ego.mjs');
