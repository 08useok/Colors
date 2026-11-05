import {writeFileSync} from 'node:fs';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {applyBeta8Balance} from '../src/config/beta8-balance.js';
import {BETA8_COUNTER_TARGETS} from '../src/config/beta8-counter-targets.js';
import {evaluateTarget} from './beta8-target-duels.mjs';
const c=applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS)),rows=[];
for(const {id,targetWin}of BETA8_COUNTER_TARGETS){const r=evaluateTarget(c,id,targetWin);rows.push(r);console.log(JSON.stringify({left:id,right:targetWin,wins:r.wins,losses:r.losses,draws:r.draws}));}
writeFileSync(new URL('../specs/beta8-target-edges-current.json',import.meta.url),JSON.stringify({date:new Date().toISOString(),scope:'17 intended edges only, 240 games per edge; not a full matrix',rows},null,2));
