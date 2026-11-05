import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { createBetaAuth } from './beta-auth.mjs';
const auth=createBetaAuth(':memory:');
async function call(path,data,cookie='',method='POST',origin='http://127.0.0.1:4173') {
  const req=Readable.from(data?[Buffer.from(JSON.stringify(data))]:[]);
  Object.assign(req,{url:'/api/beta-account/'+path,method,headers:{host:'127.0.0.1:4173',origin,cookie,'content-type':'application/json'},socket:{remoteAddress:'127.0.0.1'}});
  let status,result,headers;
  await auth.handle(req,{writeHead(s,h){status=s;headers=h;},end(value){result=JSON.parse(value);}});
  return {status,result,cookie:headers?.['Set-Cookie']?.split(';')[0]??cookie};
}
try{
 const old='test-password-original',changed='test-password-changed',recovered='test-password-recovered';
 const user=await call('register',{username:'recover_test',nickname:'복구 시험',password:old});
 const second=await call('login',{username:'recover_test',password:old});
 assert.equal((await call('save',{accountId:user.result.user.id,version:0,state:{coins:567}},user.cookie,'PUT')).status,200);
 assert.equal((await call('password',{accountId:user.result.user.id,currentPassword:'wrong',newPassword:changed},user.cookie)).status,401);
 assert.equal((await call('recovery-code',{accountId:user.result.user.id,currentPassword:'wrong'},user.cookie)).status,401);
 assert.equal((await call('password',{accountId:user.result.user.id,currentPassword:old,newPassword:changed},'')).status,401);
 const codeBefore=await call('recovery-code',{accountId:user.result.user.id,currentPassword:old},user.cookie);assert.equal(codeBefore.status,200);
 assert.equal((await call('recovery-code',{accountId:user.result.user.id,currentPassword:old},user.cookie,'POST','https://attacker.example')).status,403);
 const change=await call('password',{accountId:user.result.user.id,currentPassword:old,newPassword:changed},user.cookie);assert.equal(change.status,200);
 assert.equal((await call('session',null,user.cookie,'GET')).status,401);assert.equal((await call('session',null,second.cookie,'GET')).status,401);
 assert.equal((await call('session',null,change.cookie,'GET')).result.state.coins,567);
 assert.equal((await call('recover',{username:'recover_test',recoveryCode:codeBefore.result.recoveryCode,newPassword:recovered})).status,401,'password change invalidates recovery code');
 assert.equal((await call('login',{username:'recover_test',password:old})).status,401);
 const codeA=await call('recovery-code',{accountId:user.result.user.id,currentPassword:changed},change.cookie);
 const codeB=await call('recovery-code',{accountId:user.result.user.id,currentPassword:changed},change.cookie);
 assert.notEqual(codeA.result.recoveryCode,codeB.result.recoveryCode);
 const stored=auth.db.prepare('SELECT code_hash FROM recovery_codes').get();assert.equal(stored.code_hash.length,64);assert.notEqual(stored.code_hash,codeB.result.recoveryCode.replaceAll('-',''));
 assert.equal((await call('recover',{username:'recover_test',recoveryCode:codeA.result.recoveryCode,newPassword:recovered})).status,401);
 assert.equal((await call('recover',{username:'missing',recoveryCode:codeB.result.recoveryCode,newPassword:recovered})).status,401);
 assert.equal((await call('recover',{username:'recover_test',recoveryCode:codeB.result.recoveryCode,newPassword:'short'})).status,400);
 const payload={username:'RECOVER_TEST',recoveryCode:codeB.result.recoveryCode.toUpperCase(),newPassword:recovered};
 const results=await Promise.all([call('recover',payload),call('recover',payload)]);
 assert.deepEqual(results.map(r=>r.status).sort(),[200,401],'code is consumed atomically once');
 assert.equal((await call('session',null,change.cookie,'GET')).status,401);
 assert.equal((await call('recover',payload)).status,401);
 assert.equal((await call('login',{username:'recover_test',password:changed})).status,401);
 const login=await call('login',{username:'recover_test',password:recovered});assert.equal(login.status,200);
 const snapshot=await call('session',null,login.cookie,'GET');assert.equal(snapshot.result.state.coins,567);assert.equal(snapshot.result.hasRecoveryCode,false);
 assert.equal(auth.db.prepare('SELECT COUNT(*) n FROM recovery_codes').get().n,0);
 console.log('PASS recovery: current-password proof, new password login, all old sessions revoked, code hashes/rotation, atomic one-use recovery, invalid code/identity/weak password rejection, unchanged save.');
}finally{auth.close();}
