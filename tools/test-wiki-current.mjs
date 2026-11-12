import assert from 'node:assert/strict';
import fs from 'node:fs';
import {wikiCharacters,wikiAttackStats,WIKI_EDITIONS} from '../src/wiki-data/current.js';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
const before=JSON.stringify(BETA_CHARACTERS);
for(const edition of Object.keys(WIKI_EDITIONS)) {
 const characters=wikiCharacters(edition);
 assert.equal(Object.keys(characters).length,edition==='main'?17:20);
 assert.equal(Boolean(characters.black),edition!=='main');
 for(const [id,d]of Object.entries(characters)) {
  const attack=wikiAttackStats(id,d);
  assert(Number.isFinite(d.color)&&Number.isFinite(d.maxHealth)&&attack.damage>0&&attack.range>0,edition+' '+id);
 }
}
assert.equal(JSON.stringify(BETA_CHARACTERS),before,'wiki must not mutate game definitions');
let source=fs.readFileSync(new URL('../src/wiki.js',import.meta.url),'utf8');
source=source.replace(/from (["'])(\.\/[^"']+)\1/g,(_,quote,path)=>'from '+quote+new URL('../src/'+path.slice(2),import.meta.url).href+quote);
source+='\nexport {renderHome,renderCharacters,renderSystems,renderShop,renderPatches,openCharacter,openGuide,search};';
for(const edition of Object.keys(WIKI_EDITIONS))for(const language of ['ko','en']) {
 const elements=new Map();
 function element(selector){
  if(!elements.has(selector))elements.set(selector,{innerHTML:'',textContent:'',open:false,dataset:{},style:{setProperty(){}},classList:{toggle(){},add(){},remove(){}},addEventListener(){},showModal(){this.open=true;},close(){this.open=false;},focus(){}});
  return elements.get(selector);
 }
 globalThis.document={documentElement:{lang:language},querySelector:element,querySelectorAll:()=>[],addEventListener(){}};
 globalThis.window={__WIKI_BASE__:'/Colors/',addEventListener(){}};
 globalThis.localStorage={getItem:()=>language,setItem(){}};
 globalThis.location={pathname:'/Colors/wiki/',search:edition==='main'?'':'?edition='+edition,href:'https://example.test/Colors/wiki/?edition='+edition};
 if(edition==='main'&&language==='en'){
  delete window.__WIKI_BASE__;
  location.pathname='/Colors/wiki.html';location.href='https://example.test/Colors/wiki.html';
 }
 globalThis.history={pushState(a,b,path){assert(path.startsWith('/Colors/wiki/'));if(edition!=='main')assert(path.includes('edition='+edition),'edition preserved in deep links');}};
 const wiki=await import('data:text/javascript;base64,'+Buffer.from(source+'\n// '+edition+' '+language).toString('base64'));
 for(const name of ['renderHome','renderCharacters','renderSystems','renderShop','renderPatches']) {
  const html=wiki[name]();assert(!/NaN|undefined/.test(html),edition+' '+language+' '+name);
 }
 const cards=wiki.renderCharacters();
 assert.equal((cards.match(/class="character-card"/g)??[]).length,edition==='main'?17:20);
 for(const id of Object.keys(wikiCharacters(edition))) {
  wiki.openCharacter(id);
  assert(!/NaN|undefined/.test(element('#dialog-content').innerHTML),edition+' '+language+' article '+id);
 }
 for(const guide of ['combat','maps','modes','account','champions','transform','models']) {
  wiki.openGuide(guide,false);assert(element('#dialog-content').innerHTML.length>100);
 }
 wiki.search(language==='ko'?'살몬':'Salmon');assert(element('#search-results').innerHTML.includes('char:salmon'));
}
for(const id of ['crystal','lavender','salmon','raspberry','black','white']){
 const html=fs.readFileSync(new URL(`../wiki/characters/${id}/index.html`,import.meta.url),'utf8');
 assert(html.includes('../../boot.js?v=20261112'),'new character deep link cache version');
}
assert(fs.readFileSync(new URL('../wiki/boot.js',import.meta.url),'utf8').includes('src/wiki.js?v=20261112'));
console.log('PASS: main/beta/official data isolation; 17/20/20 fighters; both languages; five routes; all character articles; current guides, search, subpath links and unchanged game definitions. Rendering uses a DOM adapter; browser visuals are unverified.');
