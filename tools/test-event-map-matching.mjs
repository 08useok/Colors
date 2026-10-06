import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const source=await readFile(new URL('../party/server.js',import.meta.url),'utf8');
const method=source.slice(source.indexOf('  joinQueue(connection, data) {'),source.indexOf('\n  relay(sender, data)'));
const join=vm.runInNewContext('({'+method+'}).joinQueue',{PLAYABLE_CHARACTERS:new Set(['red']),ROOM_MAX:10,SOCCER_ROOM_MAX:6,crypto:{randomUUID:()=> 'seed'}});
const server={players:new Map(),matches:new Map(),playerMatch:new Map(),nextMatchId:1,cleanNickname:x=>x,leaveMatch(){},broadcastMatch(){},publicPlayer:p=>p,send(){},matchPlayers:()=>[],startCountdown(){}};
for(const [id,mapId]of [['a',0],['b',1],['c',0],['d',2],['e',100]]){
 server.players.set(id,{id});join.call(server,{id},{nickname:id,charType:'red',mode:'showdown',mapId});
}
assert.equal(server.matches.size,3);
assert.equal(server.playerMatch.get('a'),server.playerMatch.get('c'));
assert.equal(server.playerMatch.get('a'),server.playerMatch.get('e'));
assert.notEqual(server.playerMatch.get('a'),server.playerMatch.get('b'));
assert.notEqual(server.playerMatch.get('b'),server.playerMatch.get('d'));
console.log('Matchmaking: selected maps partition rooms; invalid map safely defaults to 0');
