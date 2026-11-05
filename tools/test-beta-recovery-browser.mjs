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
 const ready=()=>page.waitForFunction(()=>window.__authQA&&__authQA.ready(),null,{timeout:90000});
 const open=async()=>{await ready();await page.locator('#beta-account-button').click();};
 const old='browser-password-before',changed='browser-password-changed',reset='browser-password-reset';
 await page.goto('http://127.0.0.1:'+server.address().port+'/beta-season.html',{waitUntil:'domcontentloaded'});await open();await page.locator('[data-account-mode]').click();
 await page.locator('[name=username]').fill('recovery_browser');await page.locator('[name=nickname]').fill('복구 검증');await page.locator('[name=password]').fill(old);await page.locator('[name=confirmation]').fill(old);await page.locator('[data-account-submit]').click();await page.waitForFunction(()=>document.querySelector('#beta-account-button')?.textContent.includes('복구 검증'),null,{timeout:90000});await ready();
 await page.evaluate(async()=>{__authQA.state.credits=321;__authQA.save();await __authQA.flush();});await open();await page.locator('[data-account-security] summary').click();
 await page.locator('[name=currentPassword]').fill('incorrect');await page.locator('[data-account-issue-code]').click();await page.waitForFunction(()=>document.querySelector('[data-account-status]').textContent.includes('맞지 않습니다'));
 await page.locator('[name=currentPassword]').fill(old);await page.locator('[data-account-issue-code]').click();await page.waitForFunction(()=>!document.querySelector('[data-account-code-panel]').hidden);const codeBefore=await page.locator('[data-account-code]').innerText();assert.match(codeBefore,/^[a-f0-9]{8}(-[a-f0-9]{8}){5}$/);
 await page.locator('[name=currentPassword]').fill(old);await page.locator('[name=newPassword]').fill(changed);await page.locator('[name=newConfirmation]').fill('mismatch');await page.locator('[data-account-change-password]').click();assert.match(await page.locator('[data-account-status]').innerText(),/일치하지/);
 await page.locator('[name=newConfirmation]').fill(changed);await page.locator('[data-account-change-password]').click();await page.waitForFunction(()=>document.querySelector('[data-account-status]').textContent.includes('변경했습니다'));assert(await page.locator('[data-account-code-panel]').isHidden());
 await page.screenshot({path:'specs/beta-password-settings.png'});
 await page.locator('[name=currentPassword]').fill(changed);await page.locator('[data-account-issue-code]').click();await page.waitForFunction(()=>!document.querySelector('[data-account-code-panel]').hidden);const code=await page.locator('[data-account-code]').innerText();assert.notEqual(code,codeBefore);
 const downloadPromise=page.waitForEvent('download');await page.locator('[data-account-download]').click();assert.equal((await downloadPromise).suggestedFilename(),'colors-beta-recovery.txt');
 await page.locator('[data-account-close]').last().click();assert.equal(await page.locator('[data-account-code]').innerText(),'');assert(await page.evaluate(code=>!Object.values(localStorage).some(v=>v.includes(code)),code));
 await open();await page.locator('[data-account-logout]').click();await page.waitForFunction(()=>document.querySelector('#beta-account-button')?.textContent==='계정 로그인',null,{timeout:90000});await open();await page.locator('[data-account-forgot]').click();
 await page.locator('[name=username]').fill('recovery_browser');await page.locator('[name=recoveryCode]').fill(codeBefore);await page.locator('[name=recoveredPassword]').fill(reset);await page.locator('[name=recoveredConfirmation]').fill(reset);await page.locator('[data-account-submit]').click();await page.waitForFunction(()=>document.querySelector('[data-account-status]').textContent.includes('맞지 않습니다'));
 await page.locator('[name=recoveryCode]').fill(code);await page.locator('[data-account-submit]').click();await page.waitForFunction(()=>document.querySelector('[data-account-status]').textContent.includes('재설정했습니다'));
 await page.locator('[name=password]').fill(changed);await page.locator('[data-account-submit]').click();await page.waitForFunction(()=>document.querySelector('[data-account-status]').textContent.includes('맞지 않습니다'));
 await page.locator('[name=password]').fill(reset);await page.locator('[data-account-submit]').click();await page.waitForFunction(()=>document.querySelector('#beta-account-button')?.textContent.includes('복구 검증'),null,{timeout:90000});await ready();assert.equal(await page.evaluate(()=>__authQA.state.credits),321);
 assert.deepEqual(errors,[]);writeFileSync('specs/beta-password-recovery-browser.json',JSON.stringify({passwordChange:true,wrongCurrentPasswordRejected:true,confirmationMismatchRejected:true,codeIssued:true,codeDownload:true,secretClearedOnClose:true,oldCodeRejected:true,recovery:true,oldPasswordRejected:true,savePreserved:true,pageErrors:errors},null,2)+'\n');console.log('PASS browser: change password, code issuance/download/clearing, retired code rejection, recover password, old password rejection, restored account save, no page errors.');
}finally{if(browser)await browser.close();server.closeAllConnections();await new Promise(done=>server.close(done));auth.close();}
