import { applyBeta6Balance } from '../src/config/beta6-balance.js';
import { beta6Duel } from './simulate-beta6-balance.mjs';
const scenarios=[10,13,16].flatMap(distance=>[.035,.1].map(aimError=>({distance,aimError})));
function wins(c,l,r,n=50){let w=0;for(let s=0;s<scenarios.length;s++)for(let i=0;i<n;i++)for(const m of [1,-1]){const x=m===1?beta6Duel(c,l,r,scenarios[s],20260919+s*10000+i,1):beta6Duel(c,r,l,scenarios[s],20260919+s*10000+i,-1);if(x.outcome*m>0)w++;}return w;}
const rows=[];for(const health of [9000])for(const damage of [1850,1900,1950,2000,2050,2100,2150,2200]){const c=applyBeta6Balance();Object.assign(c.pink,{maxHealth:health,healCircleDamage:damage});rows.push({health,damage,pinkVsPurple:wins(c,'pink','purple'),mintVsPink:wins(c,'mint','pink')});}console.table(rows.sort((a,b)=>b.pinkVsPurple-a.pinkVsPurple||b.mintVsPink-a.mintVsPink||a.health-b.health||a.damage-b.damage).slice(0,30));
