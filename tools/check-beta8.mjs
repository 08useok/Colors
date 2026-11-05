import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const modules=['src/beta-season.js','src/beta-account.js','src/beta-records.js','src/config/beta8-balance.js','src/config/beta8-counter-targets.js','src/config/beta8-quests.js','src/config/beta8-records.js','src/config/salmon.js','src/config/salmon-animation.js','src/config/beta-attack-motion.js','src/config/beta-ultimate-motion.js','src/config/skin-effects.js','src/combat/beta6-combat.js','src/combat/salmon-combat.js','src/visuals/crystal-telegraph.js','src/visuals/salmon-combat.js','src/visuals/salmon-attack.js','src/visuals/beta-attack-motion.js','src/visuals/beta-attack-props.js','src/visuals/skin-effects.js','tools/beta-auth.mjs','tools/beta-records.mjs','tools/serve-game.mjs'];
const tests=['test-beta-auth.mjs','test-beta-recovery.mjs','test-beta8-records.mjs','test-beta8-records-client.mjs','test-beta8-quests.mjs','test-salmon-combat.mjs','test-beta8-cyan-defense.mjs','test-beta8-ultimate-balance.mjs','test-beta-attack-release.mjs','test-beta-ultimate-motion.mjs','test-skin-tier-effects.mjs','test-beta6-combat.mjs','test-aim-guides.mjs'];
tests.push('test-beta8-blue-knockback.mjs','test-beta8-blue-shield.mjs');
tests.push('test-beta8-blue-charge.mjs');
tests.push('test-beta8-bot-dodge.mjs');
tests.push('test-beta8-dodge-chance.mjs');
tests.push('test-beta8-counter-targets.mjs');
tests.push('test-beta8-purple-crystal.mjs');
tests.push('test-beta8-crystal-stages.mjs');
tests.push('test-beta8-crystal-windup.mjs');
tests.push('test-beta8-crystal-telegraph.mjs');
tests.push('test-beta8-purple-smart-ultimate.mjs');
tests.push('test-beta8-yellow-spacing.mjs');
tests.push('test-beta8-gold-defense.mjs');
tests.push('test-beta8-salmon-spacing.mjs');
tests.push('test-beta8-azure-width.mjs');
tests.push('test-beta8-blue-burst.mjs');
tests.push('test-beta8-orange-tracking.mjs');
tests.push('test-beta8-remaining-edges.mjs');
const results=[];
function run(args){const started=Date.now(),result=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8'});results.push({command:args.join(' '),passed:result.status===0,ms:Date.now()-started});if(result.stdout)process.stdout.write(result.stdout);if(result.stderr)process.stderr.write(result.stderr);if(result.status!==0){save();process.exit(result.status||1);}}
function save(){writeFileSync(new URL('../specs/beta8-maintenance-verification.json',import.meta.url),JSON.stringify({date:new Date().toISOString(),timeZone:'Asia/Seoul',syntaxModules:modules.length,testSuites:tests.length,allPassed:results.every(r=>r.passed),results},null,2)+'\n');}
for(const file of modules)run(['--check',file]);
for(const file of tests)run(['tools/'+file]);
save();console.log(`PASS Beta8: ${modules.length} syntax checks and ${tests.length} test suites. Browser QA is reported separately.`);
