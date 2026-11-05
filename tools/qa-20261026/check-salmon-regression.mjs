import {BETA_CHARACTERS} from '../../src/config/beta-characters.js';import {applyBeta7Balance} from '../../src/config/beta7-balance.js';import {applyBeta8Balance} from '../../src/config/beta8-balance.js';import {beta6Duel} from '../simulate-beta6-balance.mjs';
const defs=applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS));
for(const [name,change]of Object.entries({current:{},shorter:{projectileDodgeDuration:.18},brief:{projectileDodgeDuration:.12},longer:{projectileDodgeDuration:.4},reengage:{pursuesWhileLowHealth:true}})){
 const config=structuredClone(defs);Object.assign(config.salmon,change);let wins=0;const failures=[];
 for(const distance of [6,10,14])for(const aimError of [.035,.1])for(let n=0;n<10;n++)for(const reverse of [false,true]){const scenario={distance,aimError,bounds:40,level:6},seed=20261025+n+distance*1000+(aimError===.1?10000:0),mirror=reverse?-1:1,r=beta6Duel(config,reverse?'gold':'salmon',reverse?'salmon':'gold',scenario,seed,mirror);wins+=+(r.outcome*mirror>0);if(r.outcome*mirror<=0)failures.push({scenario,seed,reverse,...r});}
 console.log(JSON.stringify({name,change,wins,failures}));
}
