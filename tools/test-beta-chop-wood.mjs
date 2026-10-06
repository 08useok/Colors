import assert from 'node:assert/strict';
import { AXES, resetAxe, upgradeAxe, chopTree } from '../src/config/beta-chop-wood.js';
const f={dead:false};resetAxe(f);
const tree={x:0,z:25,health:100};
assert.equal(chopTree(f,{x:0,z:22},tree,1.99),0);
assert.equal(chopTree(f,{x:0,z:22},tree,.01),1);
chopTree(f,{x:0,z:21},tree,10);assert.equal(tree.health,99);assert.equal(f.chopTimer,0);
f.dead=true;chopTree(f,tree,tree,10);assert.equal(tree.health,99);f.dead=false;
upgradeAxe(f,9);assert.equal(f.axeLevel,9);assert.equal(f.chopKills,1);
assert.equal(chopTree(f,tree,tree,4),24);assert.equal(tree.health,75);
resetAxe(f);assert.equal(f.axeLevel,0);assert.equal(f.chopTimer,0);
for(let rank=0;rank<10;rank++){f.axeLevel=rank;tree.health=100;assert.equal(chopTree(f,tree,tree,2),AXES[rank][1]);}
tree.health=1;f.axeLevel=9;assert.equal(chopTree(f,tree,tree,2),1);assert.equal(tree.health,0);
console.log('Beta Chop Wood: range, timer, death reset, absorption, 10 ranks and tree destruction passed');

// A full native 3v3 match must reach the trees, respawn fighters and finish.
const {createBeta6Combat}=await import('../src/combat/beta6-combat.js');
const {BETA_CHARACTERS}=await import('../src/config/beta-characters.js');
const {CHOP_WOOD_COVER,chopWoodDestination}=await import('../src/config/beta-chop-wood.js');
const {eventMap,navigateEventMap,mapBlocked}=await import('../src/config/event-maps.js');
for(const mapIndex of [0,1,2]){
const layout=eventMap('chopWood',mapIndex,15,30,[[0,-25,4],[0,25,4],...[-8,0,8].flatMap(x=>[[x,-28,2],[x,28,2]])]);
const trees={a:{x:0,z:-25,health:100},b:{x:0,z:25,health:100}};
const roster=[];let deaths=0;
const world=createBeta6Combat(BETA_CHARACTERS,{
 seed:42,bounds:29.5,retreatsAtLowHealth:()=>false,
 destination:(actor)=>mapIndex===0 ? chopWoodDestination(actor,trees[actor.team==='a'?'b':'a']) : navigateEventMap(layout,actor,trees[actor.team==='a'?'b':'a']),
 blocked:(x,z,r=.55)=>mapIndex!==0 ? mapBlocked(layout,x,z,r) : Math.abs(x)>15-r || Math.abs(z)>30-r || CHOP_WOOD_COVER.some(([cx,cz,w,d])=>Math.abs(x-cx)<w/2+r && Math.abs(z-cz)<d/2+r),
 onEvent(event){
   if(event.type==='damage' && event.target.hp<=0 && !event.target.bot.dead){
     const victim=event.target.bot,rank=victim.axeLevel;
     victim.dead=true;victim.respawnAt=world.time+5;deaths++;resetAxe(victim);
     upgradeAxe(event.owner.bot,rank);
   }
 }
});
for(const [i,id] of ['red','green','blue','orange','yellow','cyan'].entries()){
 const team=i<3?'a':'b';const spawn={x:[-8,0,8][i%3],z:team==='a'?-28:28};
 const fighter={id:i+1,team,spawn,dead:false};resetAxe(fighter);
 fighter.actor=world.add(id,{...spawn,team,bot:fighter,automatic:i!==0});roster.push(fighter);
}
for(let i=0;i<54000 && trees.a.health>0 && trees.b.health>0;i++){
 for(const fighter of roster)if(fighter.dead && world.time>=fighter.respawnAt){const id=fighter.actor.id;world.remove(fighter.actor);fighter.actor=world.add(id,{...fighter.spawn,team:fighter.team,bot:fighter});fighter.dead=false;}
 world.update(1/30);
 for(const fighter of roster)chopTree(fighter,fighter.actor,trees[fighter.team==='a'?'b':'a'],1/30);
}
assert.ok(deaths>0,'character combat and respawn happen');
assert.ok(trees.a.health===0 || trees.b.health===0,'bots can navigate cover and finish a match');
console.log(`Native 3v3 completed in ${world.time.toFixed(1)}s, trees ${trees.a.health}:${trees.b.health}, ${deaths} deaths`);

}
