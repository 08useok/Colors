import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createBetaAuth } from './beta-auth.mjs';

const directory=mkdtempSync(join(tmpdir(),'colors-beta-auth-'));
const file=join(directory,'accounts.sqlite');let time=Date.now();let auth=createBetaAuth(file,{now:()=>time});
async function call(path,method='GET',data,cookie='',origin='http://127.0.0.1:4173') {
  const req=Readable.from(data?[Buffer.from(JSON.stringify(data))]:[]);
  Object.assign(req,{url:'/api/beta-account/'+path,method,headers:{host:'127.0.0.1:4173',origin,cookie,'content-type':'application/json'},socket:{remoteAddress:'127.0.0.1'}});
  let status,headers,result;
  await auth.handle(req,{writeHead(s,h){status=s;headers=h;},end(value){result=JSON.parse(value);}});
  return {status,headers,result,cookie:headers?.['Set-Cookie']?.split(';')[0]??cookie};
}
try {
  assert.equal((await call('session')).status,401);
  assert.equal((await call('register','POST',{username:'bad',nickname:'검증',password:'short'})).status,400);
  assert.equal((await call('register','POST',{},'','https://attacker.example')).status,403);
  const a=await call('register','POST',{username:'Tester_A',nickname:'테스터 A',password:'test-only-password-A'});
  assert.equal(a.status,200);assert(a.headers['Set-Cookie'].includes('HttpOnly'));assert(a.headers['Set-Cookie'].includes('SameSite=Strict'));
  assert.equal(a.result.user.username,'tester_a');assert.equal(a.result.user.password_hash,undefined);
  assert.equal((await call('register','POST',{username:'tester_a',nickname:'중복',password:'test-only-password-B'})).status,409);
  assert.equal((await call('login','POST',{username:'tester_a',password:'wrong-password'})).status,401);
  assert.equal((await call('login','POST',{username:'missing',password:'wrong-password'})).status,401);
  const save={coins:1234,credits:7,ownedCharacters:['red'],selectedCharacter:'red'};
  assert.equal((await call('save','PUT',{accountId:a.result.user.id,version:0,state:save},a.cookie)).status,200);
  assert.equal((await call('save','PUT',{accountId:a.result.user.id,version:0,state:{coins:9999}},a.cookie)).status,409);
  const b=await call('register','POST',{username:'tester_b',nickname:'테스터 B',password:'test-only-password-B'});
  assert.equal((await call('session','GET',null,b.cookie)).result.state,null);
  assert.equal((await call('save','PUT',{accountId:a.result.user.id,version:1,state:save},b.cookie)).status,409);
  const protectedInput=JSON.parse('{"__proto__":{"coins":9}}');
  assert.equal((await call('save','PUT',{accountId:a.result.user.id,version:1,state:protectedInput},a.cookie)).status,400);
  auth.close();auth=createBetaAuth(file,{now:()=>time});
  const restored=await call('session','GET',null,a.cookie);assert.deepEqual(restored.result.state,save);assert.equal(restored.result.version,1);
  const stored=auth.db.prepare('SELECT salt,password_hash FROM accounts').all();assert.equal(stored.length,2);assert.notEqual(stored[0].salt,stored[1].salt);assert(stored.every(row=>row.password_hash.length===128));
  assert(!readFileSync(file).includes(Buffer.from('test-only-password-A')),'plaintext password never stored');
  assert.equal((await call('logout','POST',{},a.cookie)).status,200);assert.equal((await call('session','GET',null,a.cookie)).status,401);
  const login=await call('login','POST',{username:'TESTER_A',password:'test-only-password-A'});assert.equal(login.status,200);
  time+=8*86400000;assert.equal((await call('session','GET',null,login.cookie)).status,401);
  for(let i=0;i<30;i++)await call('login','POST',{username:'none',password:7});
  assert.equal((await call('login','POST',{username:'none',password:7})).status,429);
  console.log('PASS beta auth: registration/duplicates, password verification/hashing, server persistence, HttpOnly sessions/logout/expiry, account isolation, version conflicts, CSRF, input validation and throttling.');
}finally{auth.close();rmSync(directory,{recursive:true,force:true});}
