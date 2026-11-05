import assert from 'node:assert/strict';
import {createBetaRecords} from '../src/beta-records.js';
const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)};
const calls=[];
globalThis.fetch=async(url,options={})=>{
 const input=options.body?JSON.parse(options.body):null;calls.push({url,input});
 return {ok:true,status:200,json:async()=>({ok:true})};
};
const state={beta8Records:{},beta8RecordPending:[]};
const client=createBetaRecords({state,save(){},storageKey:'client-test',account:{user:{id:'test-account'}},characters:[],title:{},content:{},open(){}});
const flush=()=>new Promise(resolve=>setImmediate(resolve));await flush();
const match=client.start('knockout','red');await match.ticket;
client.finish(match,{kills:1,deaths:0,damage:2500,healing:0,duration:10,won:true});
await flush();await flush();
assert.equal(calls.filter(c=>c.url.endsWith('/finish')).length,1,'first match must sync even when startup queue was empty');
assert.equal(state.beta8RecordPending.length,0,'acknowledged record removed from queue');
console.log('PASS records client: empty startup queue does not lock future match uploads.');
const make=(key,state)=>createBetaRecords({state,save(){},storageKey:key,account:{user:{id:'test-account'}},characters:[],title:{},content:{},open(){}});
const result={kills:1,deaths:0,damage:2500,healing:0,duration:10,won:true};
let release,blocked=true;const uploads=[];
globalThis.fetch=async(url,options={})=>{
 const input=options.body?JSON.parse(options.body):null;
 if(url.endsWith('/finish')){uploads.push(input.record.id);if(blocked){blocked=false;await new Promise(r=>{release=r;});}}
 return{ok:true,status:200,json:async()=>({ok:true})};
};
const concurrent={beta8Records:{},beta8RecordPending:[]},parallelClient=make('concurrent',concurrent);await flush();
const first=parallelClient.start('knockout','red');await first.ticket;parallelClient.finish(first,result);await flush();assert(release);
const second=parallelClient.start('knockout','blue');await second.ticket;parallelClient.finish(second,result);await flush();release();await flush();await flush();
assert.deepEqual(uploads,[first.id,second.id]);assert.equal(concurrent.beta8RecordPending.length,0);assert.equal(concurrent.beta8Records.total.games,2);
let offline=true,attempts=0;
globalThis.fetch=async url=>{const fail=url.endsWith('/finish')&&offline;if(url.endsWith('/finish'))attempts++;return{ok:!fail,status:fail?503:200,json:async()=>fail?{error:'offline'}:{ok:true}};};
const reconnect={beta8Records:{},beta8RecordPending:[]},offlineClient=make('offline',reconnect);await flush();const queued=offlineClient.start('knockout','red');await queued.ticket;offlineClient.finish(queued,result);await flush();await flush();
assert.equal(reconnect.beta8RecordPending.length,1);assert.equal(attempts,1,'offline failure must not spin');
offline=false;const restored={beta8Records:{},beta8RecordPending:[]};make('offline',restored);await flush();await flush();assert.equal(attempts,2);assert.equal(restored.beta8RecordPending.length,0);assert.equal(restored.beta8Records.total.games,1);
globalThis.fetch=async url=>({ok:!url.endsWith('/finish'),status:url.endsWith('/finish')?400:200,json:async()=>({error:'invalid ticket'})});
const rejected={beta8Records:{},beta8RecordPending:[]},rejectClient=make('rejected',rejected);await flush();const bad=rejectClient.start('knockout','red');await bad.ticket;rejectClient.finish(bad,result);await flush();await flush();
assert.equal(rejected.beta8RecordPending.length,0);assert.equal(rejected.beta8RecordFailed[0].id,bad.id);assert.equal(rejected.beta8Records.total.games,1,'local history survives server rejection');
console.log('PASS records client: concurrent FIFO uploads, offline persistence/reconnect, no retry loop and visible rejection metadata without lost local history.');
