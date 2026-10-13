import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta6Balance} from '../src/config/beta6-balance.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {createBeta6Combat} from '../src/combat/beta6-combat.js';
import {beta6Duel} from './simulate-beta6-balance.mjs';
const config=applyBeta7Balance(BETA_CHARACTERS),before=structuredClone(config);
delete before.crystal.botAimLeadFactor;
const trace=JSON.parse(readFileSync(new URL('../specs/crystal-red-loss-trace.json',import.meta.url),'utf8'));
assert.equal(trace.losses.length,2);
for(const row of trace.losses){const ids=row.mirror===1?['red','crystal']:['crystal','red'];assert.equal(beta6Duel(before,...ids,row.scenario,row.seed,row.mirror).outcome*row.mirror,1);assert.equal(beta6Duel(config,...ids,row.scenario,row.seed,row.mirror).outcome*row.mirror,-1);}
function angle(definitions,automatic,manualAngle){const w=createBeta6Combat(definitions,{seed:1,aimError:0});const a=w.add('crystal',{automatic,next:0}),b=w.add('red',{x:10,vz:8,automatic:false});assert(w.fire(a,b,manualAngle));return w.projectiles[0].yaw;}
assert(angle(config,true)<angle(before,true),'shorter lead avoids overshooting lateral movement');
assert.equal(angle(config,false),angle(before,false),'manual actor keeps existing aim');
assert.equal(angle(config,true,.3),.3,'explicit aim overrides prediction');
assert.equal(applyBeta6Balance(BETA_CHARACTERS).crystal.botAimLeadFactor,undefined);
for(const key of ['maxHealth','crystalDamage','crystalSpeed','reloadDuration','attackCooldown'])assert.equal(config.crystal[key],before.crystal[key]);
console.log('PASS: both losing seeds repaired, bot-only lead, manual aiming and beta6 unchanged');
