import {createBeta6Combat} from './beta6-combat.js?v=26';
import {beta6Ultimate} from '../config/beta6-balance.js';

// Main fighters use Three.js positions and wall-clock status fields; the shared
// combat world uses x/z and its own simulation clock. Keep that boundary here.
export function createMainSeasonCombat(definitions,hooks) {
  const units=new Map();
  const scaled=(source,mult)=>{const result=structuredClone(source);function walk(o){for(const[k,v]of Object.entries(o)){if(typeof v==='number'&&(k==='maxHealth'||k.endsWith('Damage')||['damage','damagePerSecond','poisonDPS'].includes(k)))o[k]=Math.round(v*mult);else if(v&&typeof v==='object')walk(v);}}walk(result);return result;};
  const world=createBeta6Combat(definitions,{
    bounds:100,aimError:.08,blocked:(x,z,r)=>hooks.blocked(x,z,r),
    bushAt:(x,z)=>hooks.bushAt?.(x,z)??false,
    destination:(a,b)=>hooks.destination?.(a.fighter,b)??b,
    onEvent(e){
      const source=e.owner?.fighter,target=e.target?.fighter;
      if(e.type==='damage'&&target)hooks.damage(target,e.amount,source);
      if(['heal','revive'].includes(e.type)&&target)hooks.heal?.(target,e.target.hp,e.type==='revive');
      if(e.type==='attack'&&source){source.attackSwing=1;source.attackAnimTime=0;source.lastCombatTime=hooks.time();}
      hooks.event?.(e);
    },
  });
  function add(f){
    let a=units.get(f);if(a)return a;
    const id=definitions[f.characterType]?f.characterType:'red';
    a=world.add(id,{automatic:!f.isPlayer&&!f.isNetworkPlayer&&!f.isDummy&&!f.isBoss&&(hooks.automatic?.(f)??true),fighter:f,next:world.time+Math.max(0,(f.nextAttackAt??0)-hooks.time())});
    a.d=scaled(definitions[id],f.levelMult??1);a.d.maxHealth=f.maxHealth;a.u=beta6Ultimate(a.d,id);
    units.set(f,a);syncIn(f,a);a.lastInputX=a.x;a.lastInputZ=a.z;return a;
  }
  function syncIn(f,a,dt=0){
    // Recreate transient state after a genuine respawn, never after mere healing.
    if(a.hp<=0&&!f.dead&&f.health>0){world.remove(a);units.delete(f);return add(f);}
    a.hp=f.dead?0:f.health;a.team=f.team;a.x=f.mesh.position.x;a.z=f.mesh.position.z;
    a.angle=Math.PI/2-f.yaw;a.ammo=f.ammo;
    if(!a.automatic&&dt>0){a.vx=f.isNetworkPlayer?(f.netVelocityX??0):(a.x-(a.lastInputX??a.x))/dt;a.vz=f.isNetworkPlayer?(f.netVelocityZ??0):(a.z-(a.lastInputZ??a.z))/dt;a.lastInputX=a.x;a.lastInputZ=a.z;}
    a.invulnerableUntil=world.time+Math.max(0,(f.invulnerableUntil??0)-hooks.time());
    return a;
  }
  function synchronize(dt=0){const fighters=hooks.fighters();for(const[f,a]of units)if(!fighters.includes(f)){world.remove(a);units.delete(f);}for(const f of fighters)syncIn(f,add(f),dt);}
  function target(a){return world.actors.filter(b=>b!==a&&b.hp>0&&(a.team==null||a.team!==b.team)).sort((b,c)=>Math.hypot(a.x-b.x,a.z-b.z)-Math.hypot(a.x-c.x,a.z-c.z))[0];}
  function out(a){const f=a.fighter;f.ammo=a.ammo;f[`${f.characterType}UltimateCharge`]=a.charge;f.seasonUltimateCharge=a.charge;f.seasonUltimateFieldActive=world.ultimateFieldActive(a);f.mintIce=a.ice;f.seasonActionLocked=world.time<a.lockUntil||world.time<a.frozenUntil||!!a.dash||!!a.leap||!!a.wave;f.seasonHidden=world.hidden(a);f.seasonSlow=world.time<a.slowUntil?1-a.slow:1;f.nextAttackAt=hooks.time()+Math.max(0,a.next-world.time);f.attackIndex=a.index;f.redGuardUntil=hooks.time()+Math.max(0,a.guardUntil-world.time);f.invulnerableUntil=hooks.time()+Math.max(0,a.invulnerableUntil-world.time);f.revealedUntil=hooks.time()+Math.max(0,a.revealedUntil-world.time);
    if(!f.dead&&!f.isNetworkPlayer){f.mesh.position.x=a.x;f.mesh.position.z=a.z;f.shadow.position.set(a.x,.04,a.z);if(a.automatic)f.yaw=Math.PI/2-a.angle;}
    if(f.dead)f.seasonActionLocked=false;
  }
  return {
    world,actor:add,
    fire(f,visualOnly=false){synchronize();const a=add(f),point=f.characterType==="ivory"?hooks.aim?.(f):null,b=point?{...point,vx:0,vz:0}:target(a)??{x:a.x+Math.sin(f.yaw)*20,z:a.z+Math.cos(f.yaw)*20,vx:0,vz:0};const old=a.next;if(visualOnly)a.next=0;const fired=world.fire(a,b,Math.PI/2-f.yaw);if(visualOnly)a.next=old;for(const unit of world.actors)out(unit);return fired;},
    cast(f,remote=false){synchronize();const a=add(f),b=target(a);if(remote)a.charge=a.u?.chargeRequired??0;const aim=hooks.aim?.(f);const cast=world.cast(a,b,{angle:Math.PI/2-f.yaw,...(aim?{point:aim}:{})});for(const unit of world.actors)out(unit);return cast;},
    update(dt){synchronize(dt);const locked=world.actors.filter(a=>a.automatic&&world.time<a.lockUntil);for(const a of locked)a.automatic=false;world.update(dt);for(const a of locked)a.automatic=true;for(const a of world.actors)out(a);hooks.render?.(world);},
    remove(f){const a=units.get(f);if(a)world.remove(a);units.delete(f);},
    clear(){world.clear();units.clear();hooks.clear?.();},
  };
}
