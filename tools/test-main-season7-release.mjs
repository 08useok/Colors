import assert from 'node:assert/strict';
import{readFileSync}from'node:fs';
import vm from'node:vm';
import{CHARACTERS as baseline}from'../src/config/characters.js';
import{BETA_CHARACTERS}from'../src/config/beta-characters.js';
import{applyBeta7Balance}from'../src/config/beta7-balance.js';
import{applyBeta6Balance,beta6Ultimate}from'../src/config/beta6-balance.js';
const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8').replace(/\r\n/g,'\n'),start=main.indexOf('if (["beta6", "beta7"].includes(CURRENT_SEASON)) {'),end=main.indexOf('\nconst ALPHA_SEASONS',start);
assert(start>=0&&end>start);const context=vm.createContext({CURRENT_SEASON:'beta7',CHARACTERS:structuredClone(baseline),BETA_CHARACTERS,applyBeta7Balance,applyBeta6Balance});vm.runInContext(main.slice(start,end),context);
const expected=applyBeta7Balance(BETA_CHARACTERS);assert.equal(Object.keys(context.CHARACTERS).length,16);
for(const[id,d]of Object.entries(expected)){for(const[k,v]of Object.entries(d))if(typeof v==='number')assert.equal(context.CHARACTERS[id][k],v,id+':'+k);const u=beta6Ultimate(d,id);assert(u,id);assert.equal(context.CHARACTERS[id].ultimate.chargeRequired,u.chargeRequired,id+' ultimate charge');}
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');for(const id of Object.keys(expected))assert(html.includes(`data-char="${id}"`));for(const id of ['gemgrab','showdown-plus'])assert(html.includes(`id="mode-${id}"`));assert(html.includes('src/main.js?v=1.7.0.2'));assert(!main.includes('window.__releaseQA'));
const speedStart=main.indexOf('function getMoveSpeed(');vm.runInContext(main.slice(speedStart,main.indexOf('\n}',speedStart)+2),context);assert.equal(context.getMoveSpeed({characterType:'red',seasonSlow:.5}),8*expected.red.moveSpeedMultiplier*.5);
console.log('PASS: all 16 main definitions match beta7 stats, normalized ultimate charges, selection/modes and cache entry');
