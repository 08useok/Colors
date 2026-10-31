import { SALMON_AIRBORNE_DURATION, SALMON_AIRBORNE_HEIGHT } from '../config/salmon.js';
// Salmon rules shared by deterministic matches and the training bridge.
export function createSalmonCombat(h) {
  const flights=[],floats=[],devices=[];
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
  const enemy=(a,b)=>a!==b&&a.owner!==b&&b.owner!==a&&(a.team==null||a.team!==b.team);
  const now=()=>h.time();
  const onFloor=(p,r=.1)=>Math.abs(p.x)<=h.bounds&&Math.abs(p.z)<=h.bounds&&!h.blocked(p.x,p.z,r)&&(h.walkable?.(p.x,p.z,r)??true);
  function clearLine(a,b){const steps=Math.max(1,Math.ceil(dist(a,b)*8));for(let i=1;i<steps;i++){const t=i/steps;if(h.blocked(a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t,.05))return false;}return true;}
  function safeFloor(p){const base={x:Math.max(-h.bounds,Math.min(h.bounds,p.x)),z:Math.max(-h.bounds,Math.min(h.bounds,p.z))};if(onFloor(base))return base;
    for(let r=.25;r<=h.bounds*2;r+=.25)for(let i=0;i<32;i++){const q={x:base.x+Math.cos(i*Math.PI/16)*r,z:base.z+Math.sin(i*Math.PI/16)*r};if(onFloor(q))return q;}return null;}
  function point(a,target,range){const d=dist(a,target),f=Math.min(1,range/(d||1));return{x:a.x+(target.x-a.x)*f,z:a.z+(target.z-a.z)*f};}
  function airborne(a){return !!a.salmonAirborne||!!a.leap||a.airborne===true;}
  function canCapture(a){return a.hp>0&&!a.isSalmonDevice&&!airborne(a)&&now()>=(a.invulnerableUntil??0);}
  function capture(owner,target,slow=false){
    let dx,dz;if(target.salmonLastMove&&now()-target.salmonLastMove.at<=1){dx=-target.salmonLastMove.x;dz=-target.salmonLastMove.z;}
    else {dx=target.x-owner.x;dz=target.z-owner.z;}
    let len=Math.hypot(dx,dz);if(len<1e-6){dx=Math.cos(owner.angle);dz=Math.sin(owner.angle);len=1;}
    const from={x:target.x,z:target.z};let to={...from};
    for(let step=1;step<=40;step++){const p={x:from.x+dx/len*step*.05,z:from.z+dz/len*step*.05};if(!onFloor(p,.55))break;to=p;}
    target.salmonAirborne={from,to,start:now(),until:now()+SALMON_AIRBORNE_DURATION,slow,owner,landingDamage:(slow?owner.u:owner.d).landingDamage??0};target.lockUntil=Math.max(target.lockUntil??0,now()+SALMON_AIRBORNE_DURATION);target.dash=null;target.wave=false;
    h.cancelRide?.(target);h.emit('salmonCapture',{owner,target});
  }
  function recover(a){if(a.ammo>=a.d.maxAmmo)return false;const f=floats.filter(f=>f.owner===a&&dist(a,f)<=4+1e-9&&clearLine(a,f)).sort((b,c)=>dist(a,b)-dist(a,c)||b.key-c.key)[0];if(!f)return false;floats.splice(floats.indexOf(f),1);a.ammo++;h.emit('salmonRecover',{owner:a,float:f});return true;}
  function fire(a,target){if(a.hp<=0||now()<(a.lockUntil??0)||now()<(a.frozenUntil??0)||airborne(a))return false;if(recover(a))return true;if(!target||!Number.isFinite(target.x)||!Number.isFinite(target.z)||a.ammo<=0||now()<a.next)return false;
    // Apply the same moving-target lead used by the other projectile bots.
    // Player aim remains the exact selected ground point.
    const lead=a.automatic?((a.d.throwWindup??0)+dist(a,target)/a.d.throwSpeed)*(a.d.botAimLeadFactor??.65):0;
    const aim={x:target.x+(target.vx??0)*lead,z:target.z+(target.vz??0)*lead};
    const to=safeFloor(point(a,aim,a.d.attackRange));if(!to)return false;
    a.ammo--;a.next=now()+a.d.attackCooldown;a.attackCount++;a.angle=Math.atan2(to.z-a.z,to.x-a.x);a.revealedUntil=now()+3;
    flights.push({key:h.key(),owner:a,kind:'salmonBobber',from:{x:a.x,z:a.z},...to,start:now()+(a.d.throwWindup??0),lands:now()+(a.d.throwWindup??0)+dist(a,to)/a.d.throwSpeed});h.emit('attack',{owner:a,target,kind:'salmon'});return true;
  }
  function slots(a,center){return Array.from({length:a.u.count},(_,i)=>{const angle=i*Math.PI*2/a.u.count;const p={x:center.x+Math.cos(angle)*a.u.radius,z:center.z+Math.sin(angle)*a.u.radius};return{...p,valid:onFloor(p,a.u.deviceRadius)};});}
  function cast(a,target){if(!target||!Number.isFinite(target.x)||!Number.isFinite(target.z)||a.hp<=0||a.charge<a.u.chargeRequired||now()<(a.lockUntil??0)||now()<(a.frozenUntil??0)||airborne(a))return false;
    const center=point(a,target,a.u.castRange);if(!onFloor(center)||!slots(a,center).some(p=>p.valid))return false;
    a.charge=0;a.castCount++;flights.push({key:h.key(),owner:a,kind:'salmonRing',from:{x:a.x,z:a.z},...center,start:now()+(a.d.throwWindup??0),lands:now()+(a.d.throwWindup??0)+dist(a,center)/a.u.throwSpeed+a.u.installDelay});h.emit('ultimate',{owner:a,target});return true;
  }
  function landing(f){const a=f.owner;if(f.kind==='salmonRing'){
      for(const p of slots(a,f).filter(p=>p.valid)){const d=h.addDevice(a,p);devices.push(d);}return;
    }
    const targets=h.actors.filter(b=>b.hp>0&&enemy(a,b)&&dist(f,b)<=a.d.impactRadius+1e-9&&clearLine(f,b));
    const chosen=targets.filter(canCapture).sort((b,c)=>dist(f,b)-dist(f,c)||b.key-c.key)[0];
    for(const b of targets)h.hit(a,b,a.d.splashDamage+(b===chosen?a.d.directDamage:0));
    if(chosen){a.ammo=Math.min(a.d.maxAmmo,a.ammo+1);a.charge=Math.min(20,a.charge+4);if(chosen.hp>0)capture(a,chosen);h.emit('salmonReward',{owner:a,target:chosen});}
    else floats.push({...f,key:h.key(),owner:a,kind:'salmonFloat'});
  }
  function moveBlocked(a,x,z){if(airborne(a))return false;const point={x,z};return devices.some(d=>d.hp>0&&enemy(d,a)&&dist(d,point)<1+(a.radius??.55)-1e-9&&dist(d,point)<dist(d,a)-1e-8);}
  function tick(){
    for(const a of h.actors){if(a.isSalmonDevice)continue;
      if(Math.hypot(a.vx??0,a.vz??0)>.05&&!a.salmonAirborne)a.salmonLastMove={x:a.vx,z:a.vz,at:now()};
      const air=a.salmonAirborne;if(air){if(a.hp<=0){a.salmonAirborne=null;a.salmonHeight=0;continue;}const t=Math.min(1,(now()-air.start)/SALMON_AIRBORNE_DURATION);a.x=air.from.x+(air.to.x-air.from.x)*t;a.z=air.from.z+(air.to.z-air.from.z)*t;a.salmonHeight=Math.sin(Math.PI*t)*SALMON_AIRBORNE_HEIGHT;
        if(t>=1){a.salmonAirborne=null;a.salmonHeight=0;h.hit(air.owner,a,air.landingDamage);if(air.slow&&a.hp>0){a.slow=.3;a.slowUntil=now()+1;}}}
    }
    for(let i=flights.length-1;i>=0;i--){const f=flights[i];if(f.owner.hp<=0){flights.splice(i,1);continue;}if(now()+1e-9>=f.lands){flights.splice(i,1);landing(f);}}
    for(let i=floats.length-1;i>=0;i--)if(floats[i].owner.hp<=0)floats.splice(i,1);
    for(let i=devices.length-1;i>=0;i--){const d=devices[i];if(d.hp<=0||!onFloor(d,1)){d.hp=0;devices.splice(i,1);const index=h.actors.indexOf(d);if(index>=0)h.actors.splice(index,1);continue;}
      for(const a of h.actors)if(enemy(d,a)&&canCapture(a)&&now()>=(a.salmonTrapUntil??0)&&dist(d,a)<=1+(a.radius??.55)+1e-6){a.salmonTrapUntil=now()+2;h.hit(d.owner,a,d.owner.u.damage);if(a.hp>0)capture(d.owner,a,true);d.hp=0;devices.splice(i,1);const index=h.actors.indexOf(d);if(index>=0)h.actors.splice(index,1);break;}
    }
  }
  function remove(a){for(const list of [flights,floats])for(let i=list.length-1;i>=0;i--)if(list[i].owner===a)list.splice(i,1);}
  return {flights,floats,devices,fire,cast,tick,moveBlocked,slots,remove,clear(){flights.length=floats.length=devices.length=0;}};
}
