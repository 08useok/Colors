export const AXES = [
  ["나무",1,0x8b6914], ["돌",2,0x999999], ["철",3,0xc0c0c0], ["금",5,0xffd700],
  ["다이아",6,0x00ced1], ["에메랄드",7,0x50c878], ["사파이어",8,0x0f52ba],
  ["루비",9,0xe0115f], ["아메시스트",10,0x9966cc], ["무지개",12,0xff80dd],
];
const BONUS = [0,0,0,2,2,3,3,4,5,8];
export function resetAxe(fighter) { fighter.axeLevel = 0; fighter.chopTimer = 0; }
export function upgradeAxe(attacker, victimRank) {
  attacker.axeLevel = Math.min(9, (attacker.axeLevel || 0) + 1 + BONUS[victimRank]);
  attacker.chopKills = (attacker.chopKills || 0) + 1;
  attacker.maxAxeLevel = Math.max(attacker.maxAxeLevel || 0, attacker.axeLevel);
}
export function chopTree(fighter, position, tree, dt) {
  if (fighter.dead || tree.health <= 0 || Math.hypot(position.x-tree.x, position.z-tree.z) > 3) {
    fighter.chopTimer = 0; return 0;
  }
  fighter.chopTimer = (fighter.chopTimer || 0) + dt;
  let damage = 0;
  while (fighter.chopTimer >= 2 && tree.health > 0) {
    fighter.chopTimer -= 2;
    const hit = Math.min(tree.health, AXES[fighter.axeLevel || 0][1]);
    tree.health -= hit; damage += hit;
  }
  fighter.chopDamage = (fighter.chopDamage || 0) + damage;
  return damage;
}

export const CHOP_WOOD_COVER = [[-6,-6,4,3],[6,-6,4,3],[-6,6,4,3],[6,6,4,3],[0,0,5,3]];
function clearPath(a,b) {
  const steps=Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)*4);
  for(let i=0;i<=steps;i++) {
    const x=a.x+(b.x-a.x)*i/Math.max(1,steps),z=a.z+(b.z-a.z)*i/Math.max(1,steps);
    if(CHOP_WOOD_COVER.some(([cx,cz,w,d])=>Math.abs(x-cx)<w/2+.7 && Math.abs(z-cz)<d/2+.7))return false;
  }
  return true;
}
const routes=new Map();
export function chopWoodDestination(actor, tree) {
  if(clearPath(actor,tree))return tree;
  let nodes=routes.get(tree.z);
  if(!nodes) {
    nodes=[...[-10,0,10].flatMap(z=>[-11,11].map(x=>({x,z,cost:Infinity}))),{x:tree.x,z:tree.z,cost:0}];
    for(let pass=0;pass<nodes.length;pass++)for(const a of nodes)for(const b of nodes)
      if(a!==b && clearPath(a,b))a.cost=Math.min(a.cost,b.cost+Math.hypot(a.x-b.x,a.z-b.z));
    routes.set(tree.z,nodes);
  }
  return nodes.filter(n=>clearPath(actor,n)).sort((a,b)=>a.cost+Math.hypot(actor.x-a.x,actor.z-a.z)-b.cost-Math.hypot(actor.x-b.x,actor.z-b.z))[0] ?? tree;
}
