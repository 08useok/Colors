import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync, existsSync, createReadStream, statSync, writeFileSync} from 'node:fs';
import {resolve, extname, sep} from 'node:path';
import {chromium} from 'file:///C:/Users/useok/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';


import {createBetaAuth} from './beta-auth.mjs';
const root=resolve("."),auth=createBetaAuth(":memory:"),errors=[];
const probe="window.__authQA={state:betaState,save:saveBetaState,flush:()=>betaAccount.flush(),key:BETA_STORAGE_KEY,ready:()=>!modelLoading.blocking};";
const server=createServer(async(req,res)=>{if(await auth.handle(req,res))return;const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+path);if(!file.startsWith(root+sep)||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'})[extname(file)]??'application/octet-stream');if(path==='/src/beta-season.js')res.end(readFileSync(file,'utf8')+probe);else createReadStream(file).pipe(res);});

await new Promise(done=>server.listen(0,'127.0.0.1',done));let browser;
try{
 browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-gpu']});const page=await browser.newPage({viewport:{width:1280,height:900}});page.on('pageerror',e=>errors.push(e.message));
 const url='http://127.0.0.1:'+server.address().port+'/beta-season.html';
 await page.addInitScript(()=>{if(!localStorage.getItem('authQASeeded')){localStorage.setItem('colorsBetaSeason8Test',JSON.stringify({credits:733,coins:99}));localStorage.setItem('authQASeeded','yes');}});
 const ready=()=>page.waitForFunction(()=>window.__authQA&&__authQA.ready(),null,{timeout:90000});
 const open=async()=>{await ready();await page.locator('#beta-account-button').click();};
 await page.goto(url,{waitUntil:'domcontentloaded'});await open();await page.locator('[data-account-mode]').click();
 await page.locator('[name=username]').fill('browser_tester');await page.locator('[name=nickname]').fill('로그인 검증');await page.locator('[name=password]').fill('test-only-browser-password');await page.locator('[name=confirmation]').fill('does-not-match');await page.locator('[data-account-submit]').click();assert.match(await page.locator('[data-account-status]').innerText(),/일치하지/);
 await page.locator('[name=confirmation]').fill('test-only-browser-password');await page.locator('[data-account-submit]').click();await page.waitForFunction(()=>document.querySelector('#beta-account-button')?.textContent.includes('로그인 검증'),null,{timeout:90000});await ready();
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('colorsBetaSeason8Test')).credits),733,'guest save preserved');
 assert.equal(await page.evaluate(()=>__authQA.state.credits),1500,'new account starts separately');assert(!await page.evaluate(()=>document.cookie.includes('colors_beta_session')));
 await page.evaluate(async()=>{__authQA.state.credits=444;__authQA.save();await __authQA.flush();});await page.reload({waitUntil:'domcontentloaded'});await ready();assert.equal(await page.evaluate(()=>__authQA.state.credits),444,'server restore');
 await open();await page.screenshot({path:'specs/beta-account-login.png'});await page.locator('[data-account-logout]').click();await page.waitForFunction(()=>document.querySelector('#beta-account-button')?.textContent==='계정 로그인',null,{timeout:90000});await ready();assert.equal(await page.evaluate(()=>__authQA.state.credits),733,'logout restores guest');
 await open();await page.locator('[name=username]').fill('browser_tester');await page.locator('[name=password]').fill('wrong-password');await page.locator('[data-account-submit]').click();await page.waitForFunction(()=>document.querySelector('[data-account-status]').textContent.includes('맞지 않습니다'));
 await page.locator('[name=password]').fill('test-only-browser-password');await page.locator('[data-account-submit]').click();await page.waitForFunction(()=>document.querySelector('#beta-account-button')?.textContent.includes('로그인 검증'),null,{timeout:90000});await ready();assert.equal(await page.evaluate(()=>__authQA.state.credits),444);
 assert.deepEqual(errors,[]);writeFileSync('specs/beta-account-browser.json',JSON.stringify({signup:true,passwordConfirmation:true,wrongPassword:true,guestCredits:733,accountCredits:444,restoredAfterReload:true,restoredAfterLogin:true,cookieHttpOnly:true,pageErrors:errors},null,2)+'\n');console.log('PASS browser: signup/confirmation, separate account save, reload persistence, logout guest preservation, wrong/correct password, HttpOnly cookie, no runtime errors.');
}finally{if(browser)await browser.close();server.closeAllConnections();await new Promise(done=>server.close(done));auth.close();}
