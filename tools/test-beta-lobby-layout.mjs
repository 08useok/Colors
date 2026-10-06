import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { betaLobbyWallSegments, canStandInBetaLobby, lobbyFloorHeight } from '../src/config/beta-lobby-layout.js';
const walls = betaLobbyWallSegments();
const corners = new Map();
for (const wall of walls) {
  const mid = (wall.from + wall.to) / 2;
  const x = wall.axis === 'x' ? mid : wall.line;
  const z = wall.axis === 'z' ? mid : wall.line;
  const nx = wall.axis === 'z' ? wall.sign : 0;
  const nz = wall.axis === 'x' ? wall.sign : 0;
  assert(lobbyFloorHeight(x - nx * .01, z - nz * .01) > -5, 'inside each wall must be floor');
  assert(lobbyFloorHeight(x + nx * .01, z + nz * .01) < -5, 'outside each wall must be a fall edge');
  for (const end of [wall.from, wall.to]) {
    const key = wall.axis === 'x' ? `${end},${wall.line}` : `${wall.line},${end}`;
    corners.set(key, (corners.get(key) ?? 0) + 1);
  }
}
assert([...corners.values()].every(count => count === 2), 'wall outline forms a closed loop without gaps');
for (const [dx, dz] of [[1,0],[-1,0],[0,1],[0,-1]]) {
  for (let distance = 0; distance <= 40; distance += .1) assert(canStandInBetaLobby(dx * distance, dz * distance), 'all four room entrances and corridors stay connected');
}
assert(canStandInBetaLobby(-40, 10), 'training teleport stays inside its room');
assert(!canStandInBetaLobby(4, 22), 'corridor side fall is blocked');
assert(!canStandInBetaLobby(48.4, 0), 'room edge reserves player radius');
assert(!canStandInBetaLobby(20, 20), 'empty gaps between rooms are blocked');
assert(canStandInBetaLobby(0, 40), 'highest room remains reachable');
console.log(`PASS: ${walls.length} room/corridor walls, closed perimeter, four open entrances, player radius and fall protection.`);

// Exercise the actual runtime guards, including a dash ending over a gap.
const runtime = readFileSync(new URL('../src/beta-season.js', import.meta.url), 'utf8');
const extract = name => {
  const start = runtime.indexOf(`function ${name}(`);
  return runtime.slice(start, runtime.indexOf('\n}', start) + 2);
};
const context = vm.createContext({ canStandInBetaLobby, currentArenaMode: 'lobby',
  player: { position: { x: 0, z: 22 } }, lastSafeLobbyPosition: null,
  resetPlayer() { throw new Error('safe movement should not teleport to spawn'); },
});
vm.runInContext(extract('keepPlayerInsideLobby') + '\n' + extract('applyArenaWallBlock'), context);
vm.runInContext('keepPlayerInsideLobby(); player.position.x = 7; keepPlayerInsideLobby();', context);
assert.equal(context.player.position.x, 0, 'dash beyond corridor returns to last safe position');
vm.runInContext('player.position.x = 3.4; player.position.z = 22.2; applyArenaWallBlock(player.position, 1.2, 22);', context);
assert.equal(context.player.position.x, 1.2, 'walking slides along the corridor edge');
assert.equal(context.player.position.z, 22.2, 'safe forward movement is retained');
console.log('PASS: runtime walking and dash fall guards.');

const {BETA_LOBBY_STAIRS,lobbyStairAt}=await import('../src/config/beta-lobby-layout.js');
assert.equal(BETA_LOBBY_STAIRS.length,4);
for(const stair of BETA_LOBBY_STAIRS){
  const point=d=>({x:d*stair.dx,z:d*stair.dz});
  const start=point(stair.start),end=point(stair.end);
  assert.ok(Math.abs(lobbyFloorHeight(start.x,start.z)-stair.low)<1e-5);
  assert.ok(Math.abs(lobbyFloorHeight(end.x,end.z)-stair.high)<1e-5);
  let previous=stair.low;
  for(let d=stair.start;d<=stair.end;d+=.05){
    const p=point(d),height=lobbyFloorHeight(p.x,p.z);
    assert.ok(canStandInBetaLobby(p.x,p.z),'stair path stays walkable');
    assert.ok(height>=stair.low-.01 && height<=stair.high+.1,'treads fit their landing');
    assert.ok(Math.abs(height-previous)<1.1,'no full platform-height jump');previous=height;
    const across={x:p.x+stair.dz*3,z:p.z-stair.dx*3};
    assert.equal(canStandInBetaLobby(across.x,across.z),false,'side rails block movement');
  }
  const before=point(stair.start-.01),after=point(stair.end+.01);
  assert.ok(Math.abs(lobbyFloorHeight(before.x,before.z)-stair.low)<1e-5);
  assert.ok(Math.abs(lobbyFloorHeight(after.x,after.z)-stair.high)<1e-5);
}
assert.equal(lobbyStairAt(0,0),undefined,'central plaza stays unchanged');
console.log('PASS: four stair connections, tread profiles, both landing heights and side rails.');

const {BETA_LOBBY_FLOORS}=await import('../src/config/beta-lobby-layout.js');
const groundContext=vm.createContext({currentArenaMode:'lobby',lobbyStairAt,lobbyFloorHeight,
  getArenaSolids:()=>BETA_LOBBY_FLOORS.map(f=>({x:f.x,z:f.z,halfW:f.width/2,halfD:f.depth/2,top:f.y+f.height/2}))});
vm.runInContext(extract('groundHeightAt'),groundContext);
for(const stair of BETA_LOBBY_STAIRS)for(let i=0;i<=100;i++){
 const along=stair.start+(stair.end-stair.start)*i/100,x=along*stair.dx,z=along*stair.dz;
 assert.equal(vm.runInContext(`groundHeightAt(${x},${z})`,groundContext),lobbyFloorHeight(x,z),'runtime uses the stair tread rather than the flat corridor floor');
}
console.log('PASS: actual runtime ground height follows every staircase.');
