export const SALMON_THROW = Object.freeze({release:.36,duration:.84});
const smooth = t => {t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
const mix = (a,b,t) => a.map((v,i)=>v+(b[i]-v)*t);
// Local directions: reach down to the hip, lift the bobber, cast, relax.
export function salmonThrowPose(time) {
  const hip={arm:[-.35,-1,-.15],forearm:[.5,-.7,.35]};
  const ready={arm:[-.3,.75,-.75],forearm:[.08,1,.25]};
  const cast={arm:[-.18,.18,1],forearm:[-.08,.08,1]};
  let a=hip,b=ready,t=smooth((time-.16)/.14);
  if(time>=.30){a=ready;b=cast;t=smooth((time-.30)/.12);}
  return {arm:mix(a.arm,b.arm,t),forearm:mix(a.forearm,b.forearm,t),
    strength:smooth(time/.10)*(1-smooth((time-.52)/.32)),
    holding:time>=.10&&time<SALMON_THROW.release,
    phase:time<.16?'retrieve':time<SALMON_THROW.release?'ready':time<.52?'release':'recover'};
}
