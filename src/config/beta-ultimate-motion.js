// Season 8 only. Flight and installation delays follow the release.
export const BETA_ULTIMATE_MOTIONS = {
  "red": {
    "kind": "guard",
    "release": 0.16,
    "duration": 0.72
  },
  "crimson": {
    "kind": "slam",
    "release": 0.22,
    "duration": 0.78
  },
  "green": {
    "kind": "conceal",
    "release": 0.18,
    "duration": 0.7
  },
  "blue": {
    "kind": "dash",
    "release": 0.12,
    "duration": 0.55
  },
  "yellow": {
    "kind": "install",
    "release": 0.24,
    "duration": 0.82
  },
  "cyan": {
    "kind": "gale",
    "release": 0.2,
    "duration": 0.76
  },
  "orange": {
    "kind": "scatter",
    "release": 0.22,
    "duration": 0.78
  },
  "purple": {
    "kind": "leap",
    "release": 0.16,
    "duration": 0.72
  },
  "pink": {
    "kind": "encore",
    "release": 0.26,
    "duration": 0.92
  },
  "gold": {
    "kind": "seal",
    "release": 0.24,
    "duration": 0.86
  },
  "ivory": {
    "kind": "volley",
    "release": 0.28,
    "duration": 0.88
  },
  "chartreuse": {
    "kind": "focus",
    "release": 0.18,
    "duration": 0.72
  },
  "mint": {
    "kind": "toss",
    "release": 0.24,
    "duration": 0.82
  },
  "azure": {
    "kind": "wave",
    "release": 0.24,
    "duration": 0.9
  },
  "crystal": {
    "kind": "analysis",
    "release": 1.5,
    "duration": 1.85
  },
  "lavender": {
    "kind": "aura",
    "release": 0.24,
    "duration": 0.9
  },
  "salmon": {
    "kind": "bobber",
    "release": 0.36,
    "duration": 0.84
  }
};
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
const mix=(a,b,t)=>a.map((x,i)=>x+(b[i]-x)*t);
export function betaUltimatePose(id,time){
 const p=BETA_ULTIMATE_MOTIONS[id];if(!p)return null;
 const t=smooth(time/p.release),strength=smooth(time/.06)*(1-smooth((time-p.release-.12)/(p.duration-p.release-.12)));
 let ready=[-.35,.7,-.4],end=[-.4,.15,1],forearm=[-.1,.2,1],left=1,twist=.12;
 if(['guard','focus'].includes(p.kind)){ready=[-.4,-.3,.2];end=[-.3,.4,.7];forearm=[.2,1,.2];twist=0;}
 if(['slam','leap'].includes(p.kind)){ready=[-.3,.9,-.1];end=[-.45,-.7,.7];forearm=[-.1,-.3,1];twist=.2;}
 if(['conceal','aura','encore','wave'].includes(p.kind)){ready=[-.15,-.4,.6];end=[-1,.35,.15];forearm=[-.8,.3,.5];twist=0;}
 if(p.kind==='dash'){ready=[-.4,.1,.7];end=[-.55,-.4,-.7];forearm=[0,.8,.2];twist=.15;}
 if(p.kind==='analysis'){ready=[-.4,.6,.2];end=[-.1,.1,1];left=.4;twist=.1;}
 if(p.kind==='scatter'){ready=[-.2,.1,-.5];end=[-.85,.1,.7];forearm=[-.6,.1,1];}
 if(p.kind==='focus'){ready=[-.2,.1,.4];end=[-.2,.1,1];forearm=[0,.7,.8];left=.65;}
 if(p.kind==='install'){ready=[-.4,-.6,-.2];end=[-.25,.6,.9];forearm=[0,.7,.8];left=.35;}
 if(p.kind==='gale'){ready=[-.9,.1,-.2];end=[-.5,.1,1];forearm=[-.3,.1,1];twist=.3;}
 if(p.kind==='seal'){ready=[-.25,.8,.5];end=[-.45,-.3,.85];forearm=[-.2,-.6,.8];}
 if(p.kind==='volley'){ready=[-.6,.9,-.6];end=[-.7,.7,.8];forearm=[-.3,.6,1];}
 if(p.kind==='toss'){ready=[-.3,-.7,-.4];end=[-.3,.45,1];forearm=[0,.5,1];left=.4;}
 if(p.kind==='conceal'){end=[-.8,-.4,-.2];forearm=[-.7,-.5,.2];}
 if(p.kind==='aura'){end=[-.8,.1,.6];forearm=[-.5,.8,.2];}
 if(p.kind==='encore'){end=[-.65,1,.1];forearm=[-.4,1,.1];}
 if(p.kind==='wave'){end=[-1,-.2,.5];forearm=[-.8,-.1,.8];}
 const arm=mix(ready,end,t);
 return {arm,forearm,leftArm:[-arm[0],arm[1],arm[2]],leftForearm:[-forearm[0],forearm[1],forearm[2]],left,strength,twist:twist*Math.sin(t*Math.PI),phase:time<p.release?'prepare':time<p.release+.12?'release':'recover'};
}
