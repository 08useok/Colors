// Coordinates are fractions of each mode's half-width / half-length.
const TITLES = {
  showdown: ["마지막 광장", "철벽 골목", "안개 호수"],
  showdownPlus: ["승부의 거리", "포위된 구역", "그림자 수풀"],
  chopWood: ["톱밥 숲", "목재 미로", "깊은 숲 벌목지"],
  goldRush: ["황금 광맥", "금고 요새", "황금 오아시스"],
  soccer: ["킥오프 광장", "반격의 성벽", "풀숲 골문"],
  gemGrab: ["황금 신전", "봉인의 미로", "비밀 정원"],
  takedown: ["거인의 광장", "강철 포위망", "수호자의 숲"],
};
const denseWalls = [];
for(const x of [-.62,.62])for(const z of [-.48,-.16,.16,.48])denseWalls.push([x,z,.24,.065]);
for(const x of [-.3,.3])for(const z of [-.5,.5])denseWalls.push([x,z,.07,.2]);
for(const x of [-.3,.3])for(const z of [-.25,.25])denseWalls.push([x,z,.065,.16]);
for(const x of [-.62,.62])for(const z of [-.32,.32])denseWalls.push([x,z,.055,.12]);
const fewWalls = [[-.56,-.25,.25,.075],[.56,-.25,.25,.075],[-.56,.25,.25,.075],[.56,.25,.25,.075]];
const fewBushes = [[-.32,-.18,.1,.13],[.32,-.18,.1,.13],[-.32,.18,.1,.13],[.32,.18,.1,.13]];
const denseBushes = [];
for(const x of [-.7,-.36,.36,.7])for(const z of [-.57,-.18,.18,.57])denseBushes.push([x,z,.18,.18]);
export const EVENT_MAPS = Object.fromEntries(Object.entries(TITLES).map(([mode,names])=>[mode,names.map((name,index)=>({
  id:`${mode}-${index}`,name,index,profile:["balanced","walls","bushes"][index],
  walls:index===1?denseWalls.map(v=>[...v]):index===2?fewWalls.map(v=>[...v]):[],
  bushes:index===1?fewBushes.map(v=>[...v]):index===2?denseBushes.map(v=>[...v]):[],
  lakes:index===2 && ["showdown","showdownPlus","goldRush","takedown"].includes(mode)
    ? [[-.76,.36,.1,.16],[.76,-.36,.1,.16]]:[],
}))]));
// Keep the boss's open arena intact on both added Take Down layouts.
EVENT_MAPS.takedown[1].walls=[.38,.5,.62,.74].flatMap(r=>Array.from({length:16},(_,i)=>[Math.cos(i*Math.PI/8)*r,Math.sin(i*Math.PI/8)*r,.065,.05]));
EVENT_MAPS.takedown[1].bushes=[[-.4,-.5,.12,.12],[.4,-.5,.12,.12],[-.4,.5,.12,.12],[.4,.5,.12,.12]];
EVENT_MAPS.takedown[2].bushes=denseBushes.filter(([x,z])=>Math.hypot(x,z)>.48).map(v=>[...v]);
EVENT_MAPS.takedown[2].walls=fewWalls.map(([x,z,w,d])=>[x,z*2,w,d]);
export function eventMap(mode,index=0,halfWidth=20,halfDepth=20,reserved=[]) {
  const source=EVENT_MAPS[mode]?.[Math.max(0,Math.min(2,Math.trunc(Number(index))||0))];
  if(!source)throw new Error(`Unknown regular event ${mode}`);
  const scale=([x,z,w,d])=>({x:x*halfWidth,z:z*halfDepth,width:w*halfWidth,depth:d*halfDepth});
  const keep=rect=>!reserved.some(([x,z,r=2])=>Math.abs(x-rect.x)<rect.width/2+r && Math.abs(z-rect.z)<rect.depth/2+r);
  return {...source,halfWidth,halfDepth,walls:source.walls.map(scale).filter(keep),
    bushes:source.bushes.map(scale),lakes:source.lakes.map(scale).filter(keep)};
}
export function insideMapRect(x,z,rect,radius=0) {
  return Math.abs(x-rect.x)<rect.width/2+radius && Math.abs(z-rect.z)<rect.depth/2+radius;
}
export function mapBlocked(layout,x,z,radius=.6) {
  return Math.abs(x)>layout.halfWidth-radius || Math.abs(z)>layout.halfDepth-radius
    || layout.walls.some(rect=>insideMapRect(x,z,rect,radius)) || layout.lakes.some(rect=>insideMapRect(x,z,rect,radius));
}
function clearSegment(layout,a,b,radius) {
  const n=Math.ceil(Math.hypot(a.x-b.x,a.z-b.z)*2);
  for(let i=0;i<=n;i++)if(mapBlocked(layout,a.x+(b.x-a.x)*i/Math.max(1,n),a.z+(b.z-a.z)*i/Math.max(1,n),radius))return false;
  return true;
}
const fields=new WeakMap();
// Small navigation grid, cached per destination; objectives remain reachable around cover.
export function navigateEventMap(layout,actor,target,radius=.65) {
  if(!target || clearSegment(layout,actor,target,radius))return target;
  const step=1.5,cols=Math.floor(layout.halfWidth*2/step),rows=Math.floor(layout.halfDepth*2/step);
  const point=(c,r)=>({x:-layout.halfWidth+step/2+c*step,z:-layout.halfDepth+step/2+r*step});
  const cell=p=>[Math.max(0,Math.min(cols-1,Math.round((p.x+layout.halfWidth-step/2)/step))),Math.max(0,Math.min(rows-1,Math.round((p.z+layout.halfDepth-step/2)/step)))];
  const [tc,tr]=cell(target),key=`${tc}:${tr}:${radius}`;
  let cache=fields.get(layout);if(!cache)fields.set(layout,cache=new Map());
  let field=cache.get(key);
  if(!field){
    const distances=new Int32Array(cols*rows).fill(-1),queue=[];
    // A moving opponent can stand between grid cells; seed every clear nearby cell.
    for(let r=Math.max(0,tr-1);r<=Math.min(rows-1,tr+1);r++)for(let c=Math.max(0,tc-1);c<=Math.min(cols-1,tc+1);c++){
      const p=point(c,r);if(clearSegment(layout,p,target,radius)){distances[r*cols+c]=0;queue.push([c,r]);}
    }
    for(let head=0;head<queue.length;head++){
      const [c,r]=queue[head],p=point(c,r);
      for(const [dc,dr]of [[1,0],[-1,0],[0,1],[0,-1]]){
        const nc=c+dc,nr=r+dr;if(nc<0||nc>=cols||nr<0||nr>=rows||distances[nr*cols+nc]>=0)continue;
        const next=point(nc,nr);if(!clearSegment(layout,p,next,radius))continue;
        distances[nr*cols+nc]=distances[r*cols+c]+1;queue.push([nc,nr]);
      }
    }
    field=distances;cache.set(key,field);if(cache.size>16)cache.delete(cache.keys().next().value);
  }
  const [ac,ar]=cell(actor);let best=null,cost=Infinity;
  for(let r=Math.max(0,ar-2);r<=Math.min(rows-1,ar+2);r++)for(let c=Math.max(0,ac-2);c<=Math.min(cols-1,ac+2);c++){
    const dist=field[r*cols+c],p=point(c,r);if(dist<0||!clearSegment(layout,actor,p,radius))continue;
    const value=dist*step+Math.hypot(actor.x-p.x,actor.z-p.z)*.1;
    if(value<cost){cost=value;best=p;}
  }
  return best??target;
}
export function bounceMapBall(position,velocity,rectangles,radius=.55,previous=null) {
  if(previous){
    const dx=position.x-previous.x,dz=position.z-previous.z;let first=null;
    for(const rect of rectangles){
      if(insideMapRect(previous.x,previous.z,rect,radius))continue;
      let enter=0,leave=1,axis=null,valid=true;
      for(const [key,delta,extent]of [["x",dx,rect.width/2+radius],["z",dz,rect.depth/2+radius]]){
        if(Math.abs(delta)<1e-9){if(Math.abs(previous[key]-rect[key])>extent)valid=false;continue;}
        let a=(rect[key]-extent-previous[key])/delta,b=(rect[key]+extent-previous[key])/delta;if(a>b)[a,b]=[b,a];
        if(a>enter){enter=a;axis=key;}leave=Math.min(leave,b);
      }
      if(valid && axis && enter<=leave && enter>=0 && enter<=1 && (!first || enter<first.time))first={time:enter,axis};
    }
    if(first){position.x=previous.x+dx*Math.max(0,first.time-1e-5);position.z=previous.z+dz*Math.max(0,first.time-1e-5);velocity[first.axis]*=-.8;return;}
  }
  for(const rect of rectangles){
    if(!insideMapRect(position.x,position.z,rect,radius))continue;
    const dx=rect.width/2+radius-Math.abs(position.x-rect.x),dz=rect.depth/2+radius-Math.abs(position.z-rect.z);
    if(dx<dz){const sign=Math.sign(position.x-rect.x)||-Math.sign(velocity.x)||1;position.x=rect.x+sign*(rect.width/2+radius);if(velocity.x*sign<0)velocity.x*=-.8;}
    else{const sign=Math.sign(position.z-rect.z)||-Math.sign(velocity.z)||1;position.z=rect.z+sign*(rect.depth/2+radius);if(velocity.z*sign<0)velocity.z*=-.8;}
  }
}
