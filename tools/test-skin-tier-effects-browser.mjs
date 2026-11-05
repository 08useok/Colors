import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync, existsSync, createReadStream, statSync, writeFileSync} from 'node:fs';
import {resolve, extname, sep} from 'node:path';
import {chromium} from 'file:///C:/Users/useok/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';


const root=resolve("."),errors=[];
const probe="\nwindow.__skinQA={\nsetup(id,skin){if(!betaState.ownedCharacters.includes(id))betaState.ownedCharacters.push(id);selectCharacter(id);betaState.selectedSkins[id]=skin;applySelectedSkinVisual();for(const t of testTargets)t.visible=false;player.position.set(-40,6.25,0);goldRushState.ammo=goldRushState.maxAmmo;generalAttackReady=true;},\nready(){return !modelLoading.blocking;},\nbasic(){skinEffects.clear();performCharacterAttack();return skinEffects.effects.length;},\nultimate(){skinEffects.clear();redUltimateCharge=100;crimsonUltimateCharge=100;goldUltimateCharge=100;updateCrimsonUltimateGauge();ultimateButton.click();return skinEffects.effects.length;},\nambient(){skinEffects.clear();skinEffects.update(.13,[{key:player,characterId:betaState.selectedCharacter,skinId:betaState.selectedSkins[betaState.selectedCharacter],position:player.position,visible:true}]);return skinEffects.effects.length;},\ncleanup(){skinEffects.clear();return {count:skinEffects.effects.length,orphans:scene.children.filter(o=>o.name==='SkinTierParticle').length};}\n};";
const server=createServer((req,res)=>{const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+path);if(!file.startsWith(root+sep)||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'})[extname(file)]??'application/octet-stream');if(path==='/src/beta-season.js')res.end(readFileSync(file,'utf8')+probe);else createReadStream(file).pipe(res);});

await new Promise(done=>server.listen(0,'127.0.0.1',done));let browser;
try{
 browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-gpu']});const page=await browser.newPage();page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE',e.message);});page.on('response',r=>{if(r.status()>=400)console.log('HTTP',r.status(),r.url());});
 await page.goto('http://127.0.0.1:'+server.address().port+'/beta-season.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__skinQA,null,{timeout:90000});
 await page.waitForFunction(()=>__skinQA.ready(),null,{timeout:90000});const results=[];
 for(const [id,skin,expected] of [['red','alpha_red',[0,0,0]],['crimson','beta_red_crimson',[8,0,0]],['gold','beta7_gold_pharaoh',[8,18,0]],['red','beta_red_red',[8,18,1]]]){
  await page.evaluate(([id,skin])=>__skinQA.setup(id,skin),[id,skin]);await page.waitForFunction(()=>__skinQA.ready(),null,{timeout:30000}).catch(async e=>{console.log(skin,await page.locator('#model-loading-screen').innerText(),errors);throw e;});
  const actual=await page.evaluate(()=>[__skinQA.basic(),__skinQA.ultimate(),__skinQA.ambient()]);assert.deepEqual(actual,expected,skin);results.push({id,skin,basic:actual[0],ultimate:actual[1],ambient:actual[2]});
  assert.deepEqual(await page.evaluate(()=>__skinQA.cleanup()),{count:0,orphans:0});
 }
 assert.deepEqual(errors,[]);writeFileSync('specs/skin-tier-effects-browser.json',JSON.stringify({results,pageErrors:errors},null,2)+'\n');console.log('PASS browser: four skin tiers, real basic/ultimate handlers, legendary ambient, particle cleanup, no runtime errors.');
}finally{if(browser)await browser.close();server.closeAllConnections();await new Promise(done=>server.close(done));}
