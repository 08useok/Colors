import assert from 'node:assert/strict';
import {fork} from 'node:child_process';
import {createServer} from 'node:http';
import {DatabaseSync} from 'node:sqlite';
import {copyFileSync,readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {resolve,dirname,join,relative,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash,randomUUID} from 'node:crypto';
import {once} from 'node:events';
import {createBetaAuth} from './beta-auth.mjs';
const self=fileURLToPath(import.meta.url),root=resolve(dirname(self),'..');
const insideBackups=path=>{const rel=relative(join(root,'.local','backups'),path);return rel!==''&&!rel.startsWith('..')&&!isAbsolute(rel);};
if(process.argv[2]==='--worker') {
 const dbPath=resolve(process.argv[3]);
 assert(insideBackups(dbPath));
 const auth=createBetaAuth(dbPath),server=createServer(async(req,res)=>{if(!await auth.handle(req,res))res.writeHead(404).end();});
 server.listen(0,'127.0.0.1',()=>process.send({port:server.address().port}));
 process.on('message',message=>{if(message==='stop')server.close(()=>{auth.close();process.exit(0);});});
} else {
 const backup=resolve(process.argv[2]||'');assert(insideBackups(backup)&&existsSync(backup));
 const folder=join(dirname(backup),'restore-drill-'+Date.now());mkdirSync(folder);
 const working=join(folder,'working.sqlite'),checkpoint=join(folder,'checkpoint.sqlite'),restored=join(folder,'restored.sqlite');
 const sha=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
 function fingerprint(path){const db=new DatabaseSync(path,{readOnly:true});try{assert.equal(db.prepare('PRAGMA integrity_check').get().integrity_check,'ok');assert.equal(db.prepare('PRAGMA foreign_key_check').all().length,0);const names=db.prepare("SELECT name,sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all();return Object.fromEntries(names.map(({name,sql})=>{const rows=db.prepare('SELECT * FROM "'+name.replaceAll('"','""')+'"').all().map(r=>JSON.stringify(r)).sort();return[name,{rows:rows.length,hash:createHash('sha256').update(sql+'\n'+rows.join('\n')).digest('hex')}];}));}finally{db.close();}}
 const originalHash=sha(backup),originalTables=fingerprint(backup);copyFileSync(backup,working);assert.deepEqual(fingerprint(working),originalTables);
 let child,base;
 async function start(path){child=fork(self,['--worker',path],{stdio:['ignore','ignore','inherit','ipc']});const ready=once(child,'message');const early=once(child,'exit').then(([code])=>{throw Error('server exited before ready: '+code);});let timer;try{const [message]=await Promise.race([ready,early,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('server startup timeout')),15000);})]);base='http://127.0.0.1:'+message.port;}finally{clearTimeout(timer);}}
 async function stop(){if(!child)return;const done=once(child,'exit');child.send('stop');await done;child=null;}
 async function api(route,method='GET',data,cookie=''){const response=await fetch(base+'/api/beta-account/'+route,{method,headers:{Origin:base,'Content-Type':'application/json',Cookie:cookie},body:data?JSON.stringify(data):undefined,signal:AbortSignal.timeout(15000)});const body=await response.json();assert.equal(response.status,200,route+': '+response.status);return{body,cookie:response.headers.get('set-cookie')?.split(';')[0]||cookie};}
 const checks={};
 try {
  await start(working);checks.backupBoots=true;
  const username='restore_'+randomUUID().slice(0,12).replaceAll('-',''),password='restore-drill-password-20261029';
  const account=await api('register','POST',{username,nickname:'Restore QA',password}),accountId=account.body.user.id;let cookie=account.cookie;
  const state={coins:11400,credits:3400,ownedCharacters:['red','salmon'],selectedCharacter:'salmon',beta8Quests:{kills:2,healing:250,damage:2500},beta8QuestClaimed:[10,30],beta8Records:{marker:'restore-check'}};
  await api('save','PUT',{accountId,version:0,state},cookie);
  await api('recovery-code','POST',{accountId,currentPassword:password},cookie);
  const match={id:randomUUID(),season:'beta8',mode:'knockout',character:'salmon',kills:1,deaths:2,damage:2500,healing:250,duration:0,won:true};
  await api('records/start','POST',{...match,accountId},cookie);await api('records/finish','POST',{accountId,record:match},cookie);
  const before=(await api('session','GET',null,cookie)).body;assert.deepEqual(before.state,state);assert(before.hasRecoveryCode);assert.equal((await api('records/ranking','GET',null,cookie)).body.me.points,8.625);
  await stop();
  copyFileSync(working,checkpoint);const checkpointTables=fingerprint(checkpoint);
  await start(working);const restarted=(await api('session','GET',null,cookie)).body;assert.deepEqual(restarted,before);checks.sessionAndSaveSurviveServerRestart=true;
  const login=await api('login','POST',{username,password});cookie=login.cookie;assert.deepEqual((await api('session','GET',null,cookie)).body.state,state);checks.passwordLoginAfterRestart=true;
  await api('save','PUT',{accountId,version:1,state:{...state,coins:1,beta8QuestClaimed:[]}},cookie);assert.equal((await api('session','GET',null,cookie)).body.state.coins,1);await stop();checks.laterChangesWritten=true;
  copyFileSync(checkpoint,restored);assert.deepEqual(fingerprint(restored),checkpointTables);checks.allTablesRestoredExactly=true;
  await start(restored);const restoredLogin=await api('login','POST',{username,password});cookie=restoredLogin.cookie;
  const recovered=(await api('session','GET',null,cookie)).body;assert.deepEqual(recovered.state,state);assert.equal(recovered.version,1);assert(recovered.hasRecoveryCode);checks.accountProgressQuestsRewardsRecoveryPreserved=true;
  const ranking=(await api('records/ranking','GET',null,cookie)).body;assert.equal(ranking.me.points,8.625);assert.equal((await api('records/finish','POST',{accountId,record:match},cookie)).body.duplicate,true);checks.rankingAndDuplicateRecordProtectionPreserved=true;
  await stop();assert.equal(sha(backup),originalHash);assert.deepEqual(fingerprint(backup),originalTables);checks.originalBackupUnchanged=true;
  const report={checkedAt:new Date().toISOString(),passed:true,backup,backupSha256:originalHash,drillDirectory:folder,checks,scope:'Real local beta SQLite snapshot and isolated HTTP child-server restart/restore drill; original DB opened read-only only during backup',limitations:['Browser localStorage guest/main progress is not part of the server SQLite backup','No production deployment, main/beta migration or original-DB rollback performed']};
  writeFileSync(join(root,'specs/beta8-backup-restore-verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:true,checks,backup}));
 } finally {if(child){child.kill();await once(child,'exit');}}
}
