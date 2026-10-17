import assert from 'node:assert/strict';
import{readFileSync}from'node:fs';
import vm from'node:vm';
import{CHARACTERS as baseline}from'../src/config/characters.js';
import{BETA_CHARACTERS}from'../src/config/beta-characters.js';
import{applyBeta7Balance}from'../src/config/beta7-balance.js';
import{applyBeta6Balance,beta6Ultimate}from'../src/config/beta6-balance.js';
const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8').replace(/\r\n/g,'\n'),start=main.indexOf('if (["beta6", "beta7"].includes(CURRENT_SEASON)) {'),end=main.indexOf('\nconst ALPHA_SEASONS',start);
assert(start>=0&&end>start);const context=vm.createContext({CURRENT_SEASON:'beta7',CHARACTERS:structuredClone(baseline),BETA_CHARACTERS,applyBeta7Balance,applyBeta6Balance});vm.runInContext(main.slice(start,end),context);
const expected=applyBeta7Balance(BETA_CHARACTERS);delete expected.lavender;assert.equal(Object.keys(context.CHARACTERS).length,15);assert(!context.CHARACTERS.lavender);
expected.azure.surfDashDistance = 4;expected.azure.surfSpeed = 4 / (2 / 17 * 0.7);
Object.assign(expected.crimson,{projectileDodgeSpeedMultiplier:1.35,projectileDodgeCooldown:.45,projectileDodgeThreatOnly:true});
expected.crystal.crystalDamage=2200;
expected.crystal.crystalHomingTurnRate=2.2;
expected.crystal.fragmentDamage=1100;expected.crystal.shardDamage=550;
expected.crystal.fragmentHitLimit=3;
expected.crystal.shardHitLimit=4;
expected.crystal.ultimate.width=2.2;
for(const[id,d]of Object.entries(expected)){for(const[k,v]of Object.entries(d))if(typeof v==='number')assert.equal(context.CHARACTERS[id][k],v,id+':'+k);const u=beta6Ultimate(d,id);assert(u,id);assert.equal(context.CHARACTERS[id].ultimate.chargeRequired,u.chargeRequired,id+' ultimate charge');}
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');for(const id of Object.keys(expected))assert(html.includes(`data-char="${id}"`));for(const id of ['gemgrab','showdown-plus'])assert(html.includes(`id="mode-${id}"`));assert(html.includes('src/main.js?v=1.7.0.30'));assert(!main.includes('window.__releaseQA'));
const speedStart=main.indexOf('function getMoveSpeed(');vm.runInContext(main.slice(speedStart,main.indexOf('\n}',speedStart)+2),context);assert.equal(context.getMoveSpeed({characterType:'red',seasonSlow:.5}),8*expected.red.moveSpeedMultiplier*.5);
console.log('PASS: all 15 main definitions match beta7 stats, normalized ultimate charges, selection/modes and cache entry');

const beta=readFileSync(new URL('../src/beta-season.js',import.meta.url),'utf8').replace(/\r\n/g,'\n');
const rosterStart=beta.indexOf('const CHARACTERS = ['),rosterEnd=beta.indexOf('\n];',rosterStart)+3;
const loadStart=beta.indexOf('function loadBetaState()'),loadEnd=beta.indexOf('\nconst betaState',loadStart);
for(const season of ['beta7','beta8']) {
 const saved={selectedCharacter:'lavender',credits:1234,coins:4321,ownedCharacters:['red','lavender'],characterTrophies:{lavender:88},characterShowdownWins:{lavender:7},characterShowdownKills:{lavender:19},characterTrophyRankMigration:true};
 const c=vm.createContext({IS_BETA5_TEST:false,HAS_BETA6_CONTENT:true,IS_BETA6_TEST:false,IS_BETA7_TEST:season==='beta7',IS_BETA8_TEST:season==='beta8',BETA_STORAGE_KEY:season,SKINS:{},BETA_SKINS:[],SEA_SEASON_PROPS:{},migrateSkinId:id=>id,localStorage:{getItem:()=>JSON.stringify(saved),setItem:()=>{}}});
 vm.runInContext(beta.slice(rosterStart,rosterEnd)+beta.slice(loadStart,loadEnd)+';globalThis.ids=CHARACTERS.map(c=>c.id);globalThis.account=loadBetaState();',c);
 assert.equal(c.ids.length,season==='beta7'?15:16);assert.equal(c.ids.includes('lavender'),season==='beta8');assert(c.ids.includes('crystal'));
 assert.equal(c.account.selectedCharacter,season==='beta7'?'red':'lavender');assert(c.account.ownedCharacters.includes('lavender'));
 for(const field of ['characterTrophies','characterShowdownWins','characterShowdownKills'])assert.equal(c.account[field].lavender,saved[field].lavender);
 assert.equal(c.account.credits,1234);assert.equal(c.account.coins,4321);
}
assert(!/<th>라벤더<\/th>/.test(html));assert(!html.includes('data-char="lavender"'));
console.log('PASS: Lavender beta8-only selection, beta7 safe fallback, ownership/currency/stat preservation, main table exclusion');
