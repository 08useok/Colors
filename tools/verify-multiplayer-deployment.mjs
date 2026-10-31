import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {WebSocket} from 'ws';
const host=process.argv.find(a=>a.startsWith('--host='))?.slice(7)??'colors-multiplayer.useok-jeju.workers.dev';
const version=process.argv.find(a=>a.startsWith('--version='))?.slice(10)??null;
// Defaults reproduce the Season 7 check; Season 8 passes --chars=salmon,lavender --out=specs/main-season8-server-deployment.json
const chars=(process.argv.find(a=>a.startsWith('--chars='))?.slice(8)??'crystal,lavender').split(',');
const out=process.argv.find(a=>a.startsWith('--out='))?.slice(6)??'specs/main-season7-server-deployment.json';
const response=await fetch('https://'+host,{signal:AbortSignal.timeout(15000)});
assert.equal(response.status,200);assert((await response.text()).includes('Colors multiplayer server is running.'));
const room='release-verify-'+randomUUID(),sockets=[];
const starts=await Promise.all(chars.map(charType=>new Promise((resolve,reject)=>{
 const socket=new WebSocket('wss://'+host+'/parties/colors-server/'+room+'?_pk='+randomUUID());sockets.push(socket);
 const timer=setTimeout(()=>{socket.terminate();reject(Error('Match start timed out: '+charType));},25000);
 socket.on('open',()=>socket.send(JSON.stringify({type:'JOIN_QUEUE',nickname:'Release verification',charType,mode:'showdown',mapId:-1})));
 socket.on('error',error=>{clearTimeout(timer);reject(error);});
 socket.on('message',raw=>{const msg=JSON.parse(raw.toString());if(msg.type==='GAME_START'){clearTimeout(timer);resolve(msg);}});
}))).finally(()=>sockets.forEach(socket=>socket.close()));
assert.deepEqual(starts[0],starts[1]);assert.deepEqual(starts[0].players.map(p=>p.charType).sort(),[...chars].sort());assert([0,1,2].includes(starts[0].mapId));
const report={verifiedAt:new Date().toISOString(),host,version,httpStatus:response.status,characters:starts[0].players.map(p=>p.charType),mapId:starts[0].mapId,sharedMap:true,isolatedRoom:true};
writeFileSync(out,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
console.log('PASS: deployed server response, both new characters retained, shared random map and 2-client match start');
