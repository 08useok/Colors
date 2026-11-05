import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { createBetaAuth } from './beta-auth.mjs';
import { appendRecord, matchRecord, rankedRows } from '../src/config/beta8-records.js';
let time=Date.now();const auth=createBetaAuth(':memory:',{now:()=>time});
async function call(path,method='GET',data,cookie=''){
  const req=Readable.from(data?[Buffer.from(JSON.stringify(data))]:[]);
  Object.assign(req,{url:'/api/beta-account/'+path,method,headers:{host:'127.0.0.1:4191',origin:'http://127.0.0.1:4191',cookie,'content-type':'application/json'},socket:{remoteAddress:'127.0.0.1'}});
  let result,status,headers;await auth.handle(req,{writeHead(s,h){status=s;headers=h;},end(s){result=JSON.parse(s);}});return{status,result,cookie:headers['Set-Cookie']?.split(';')[0]||cookie};
}
try{
  const a=await call('register','POST',{username:'record_a',nickname:'기록 A',password:'test-password-123'});
  const b=await call('register','POST',{username:'record_b',nickname:'기록 B',password:'test-password-456'});
  const record={id:'match-1',season:'beta8',mode:'knockout',character:'salmon',kills:1,deaths:2,damage:2500,healing:250,duration:10,won:true,endedAt:time};
  const payload={accountId:a.result.user.id,record};
  assert.equal((await call('records/finish','POST',payload)).status,401);
  assert.equal((await call('records/finish','POST',payload,b.cookie)).status,409);
  assert.equal((await call('records/finish','POST',payload,a.cookie)).status,400);
  assert.equal((await call('records/start','POST',{...record,accountId:a.result.user.id},a.cookie)).status,200);
  time+=10000;
  const finished=await call('records/finish','POST',{...payload,record:{...record,points:999999}},a.cookie);
  assert.equal(finished.result.points,8.625);
  assert.equal((await call('records/finish','POST',payload,a.cookie)).result.duplicate,true);
  const ranks=await call('records/ranking','GET',undefined,a.cookie);
  assert.equal(ranks.result.me.points,8.625);assert.equal(ranks.result.rows.length,1);
  assert(!JSON.stringify(ranks.result).includes('record_a'));assert(!JSON.stringify(ranks.result).includes(a.result.user.id));
  assert.equal((await call('records/ranking','GET',undefined,b.cookie)).result.me,null);
  const wrong={...record,id:'match-2'};
  await call('records/start','POST',{...wrong,accountId:a.result.user.id},a.cookie);
  assert.equal((await call('records/finish','POST',{accountId:a.result.user.id,record:{...wrong,damage:-1}},a.cookie)).status,400);
  assert.equal((await call('records/finish','POST',{accountId:a.result.user.id,record:{...wrong,season:'main8'}},a.cookie)).status,400);
  assert.equal((await call('records/finish','POST',{accountId:a.result.user.id,record:{...wrong,character:'red'}},a.cookie)).status,400);
  const quit=await call('records/finish','POST',{accountId:a.result.user.id,record:{...wrong,abandoned:true,won:true}},a.cookie);
  assert.equal(quit.result.points,0);
  assert.equal((await call('records/ranking','GET',undefined,a.cookie)).result.me.points,8.625);
  let book={};for(let i=0;i<25;i++)book=appendRecord(book,{...record,id:'local-'+i});
  assert.equal(book.recent.length,20);assert.equal(book.total.games,25);assert.equal(book.characters.salmon.games,25);assert.equal(book.total.bestStreak,25);
  book=appendRecord(book,{...record,id:'quit',abandoned:true});assert.equal(book.total.streak,0);assert.equal(book.total.losses,1);assert.equal(book.total.points,25*8.625);
  assert.equal(appendRecord(book,{...record,id:'quit'}),book);
  assert.equal(matchRecord({...record,won:false,draw:true}).points,3.625);
  const tied=rankedRows([{id:'a',points:10,wins:2,kills:3},{id:'b',points:10,wins:2,kills:3},{id:'c',points:10,wins:1,kills:9}]);
  assert.deepEqual(tied.map(r=>r.rank),[1,1,3]);
  console.log('PASS records: scoring, fractions, wins/draws/abandon, recent20 versus lifetime totals, character records, streaks, ties, authenticated ownership, ticket validation, duplicate submission, server score calculation, season isolation and nickname-only ranking.');
}finally{auth.close();}
