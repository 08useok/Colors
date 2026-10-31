// Season 8 only. Release times are shared by combat and the displayed pose.
export const BETA_ATTACK_MOTIONS = {
  red:{kind:'punch',duration:.52,release:.08,interval:.24,hits:2,prop:'glove'},
  crimson:{kind:'punch',duration:.5,release:.07,interval:.12,hits:3,prop:'gauntlet'},
  green:{kind:'throw',duration:.48,release:.14,prop:'boomerang'},
  orange:{kind:'throw',duration:.44,release:.13,prop:'orange'},
  blue:{kind:'flick',duration:.32,release:.06,prop:'marble'},
  yellow:{kind:'charge',duration:.38,release:.12,prop:'electric'},
  cyan:{kind:'fan',duration:.42,release:.08,prop:'fan'},
  purple:{kind:'throw',duration:.48,release:.14,prop:'poison'},
  pink:{kind:'heal',duration:.58,release:.12,prop:'heart'},
  gold:{kind:'push',duration:.52,release:.14,prop:'ingot'},
  ivory:{kind:'throw',duration:.58,release:.2,prop:'iceCream'},
  chartreuse:{kind:'recoil',duration:.44,release:.08,prop:'launcher'},
  mint:{kind:'burst',duration:.58,release:.08,interval:.12,hits:3,prop:'iceBlaster'},
  azure:{kind:'surf',duration:.64,release:.1,prop:'water'},
  crystal:{kind:'flick',duration:.46,release:.12,prop:'crystal'},
  lavender:{kind:'spray',duration:.68,release:.12,prop:'perfume'},
};
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
const lerp=(a,b,t)=>a.map((x,i)=>x+(b[i]-x)*t);
export function betaAttackPose(id,time,variant=0) {
  const p=BETA_ATTACK_MOTIONS[id];if(!p)return null;
  const last=p.release+((p.hits??1)-1)*(p.interval??0);
  const strength=smooth(time/Math.min(.05,p.release))*(1-smooth((time-Math.max(last+.08,p.duration*.62))/(p.duration-Math.max(last+.08,p.duration*.62))));
  const ready=[-.35,.65,-.65],forward=[-.18,.2,1];
  let arm=lerp(ready,forward,smooth((time-p.release*.55)/(p.release*.6))),forearm=[-.08,.1,1],leftArm=[.3,-.55,.5],leftForearm=[-.1,.3,1],left=.3,twist=0;
  if(p.kind==='punch') {
    let right=0,leftHit=0;
    for(let i=0;i<p.hits;i++){const hit=Math.exp(-Math.pow((time-p.release-i*p.interval)/.055,2));if(i%2===0)leftHit+=hit;else right+=hit;}
    arm=lerp([-.45,.1,.35],[.35,.1,1],Math.min(1,right));forearm=lerp([.2,.9,.3],[.2,.1,1],Math.min(1,right));
    leftArm=lerp([.45,.1,.35],[-.35,.1,1],Math.min(1,leftHit));leftForearm=lerp([-.2,.9,.3],[-.2,.1,1],Math.min(1,leftHit));left=1;twist=(leftHit-right)*.15;
  } else if(p.kind==='throw') {
    if(id==='purple'&&!variant){arm=lerp([-.6,.1,-.25],forward,smooth(time/p.release));forearm=[-.3,.05,1];}
  } else if(['push','recoil','burst','spray'].includes(p.kind)) {
    let recoil=0;for(let i=0;i<(p.hits||1);i++)recoil+=Math.exp(-Math.pow((time-p.release-i*(p.interval||0))/.04,2));
    arm=[-.25,.15+recoil*.18,.9];forearm=[-.05,.08+recoil*.28,1];leftArm=[.32,-.25,.8];leftForearm=[-.55,.2,.8];left=.85;
  } else if(p.kind==='charge'||p.kind==='fan') {
    arm=lerp([-.45,-.1,.3],[-.4,.2,1],smooth(time/p.release));leftArm=[-arm[0],arm[1],arm[2]];leftForearm=[.2,.1,1];left=1;
  } else if(p.kind==='heal') {
    arm=lerp([-.15,.8,.4],[-.85,-.15,.55],smooth(time/p.release));forearm=[-.65,.2,.8];leftArm=[-arm[0],arm[1],arm[2]];leftForearm=[.65,.2,.8];left=1;
  } else if(p.kind==='surf') {
    arm=lerp([-.9,.1,-.2],[-.6,.1,.8],smooth(time/p.release));forearm=[-.6,.05,.8];leftArm=[-arm[0],arm[1],arm[2]];leftForearm=[.6,.05,.8];left=1;twist=.12*strength;
  } else if(p.kind==='flick') {
    arm=lerp([-.4,-.35,.1],forward,smooth(time/p.release));forearm=lerp([.1,.7,.2],[-.05,.25,1],smooth(time/p.release));
  }
  return {arm,forearm,leftArm,leftForearm,left,strength,twist,release:p.release,
    holding:time>=0&&time<p.release,
    phase:time<p.release*.5?'prepare':time<p.release?'ready':time<last+.1?'release':'recover'};
}
