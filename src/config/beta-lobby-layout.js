import { BETA_STAIRS_PROFILE } from "./beta-stairs-profile.js";
// Walkable room and corridor footprints, shared by floor, walls and edge checks.
export const BETA_LOBBY_FLOORS = [
  { x: 0, z: 0, width: 22, depth: 22, y: 0, height: 3 },
  { x: 0, z: -22, width: 7, depth: 23, y: 1.3, height: 1 },
  { x: 0, z: 22, width: 7, depth: 23, y: 1.3, height: 1 },
  { x: -22, z: 0, width: 23, depth: 7, y: 1.3, height: 1 },
  { x: 22, z: 0, width: 23, depth: 7, y: 1.3, height: 1 },
  { x: 0, z: -40, width: 25, depth: 17, y: 2.3, height: 5 },
  { x: 0, z: 40, width: 25, depth: 17, y: 4, height: 8.4 },
  { x: -40, z: 0, width: 17, depth: 25, y: 3.1, height: 6.2 },
  { x: 40, z: 0, width: 17, depth: 25, y: 1.5, height: 3 },
];
const contains = (floor, x, z) => Math.abs(x - floor.x) <= floor.width / 2 && Math.abs(z - floor.z) <= floor.depth / 2;
function baseLobbyFloorHeight(x, z) {
  const floors = BETA_LOBBY_FLOORS.filter(floor => contains(floor, x, z));
  return floors.length ? Math.max(...floors.map(floor => floor.y + floor.height / 2)) : -20;
}
// High room entrances end where the room overlaps its connecting corridor.
export const BETA_LOBBY_STAIRS = [
  {id:'gate',dx:0,dz:-1,width:7,length:7.5,low:1.8,high:4.8},
  {id:'garden',dx:0,dz:1,width:7,length:16,low:1.8,high:8.2},
  {id:'training',dx:-1,dz:0,width:7,length:11,low:1.8,high:6.2},
  {id:'dock',dx:1,dz:0,width:7,length:4,low:1.8,high:3},
].map(s=>({...s,start:31.5-s.length,end:31.5}));
export function lobbyStairAt(x,z) {
  return BETA_LOBBY_STAIRS.find(s=>{
    const along=x*s.dx+z*s.dz,across=x*s.dz-z*s.dx;
    return along>=s.start && along<=s.end && Math.abs(across)<=s.width/2;
  });
}
export function stairTreadHeight(stair,progress) {
  const profile=BETA_STAIRS_PROFILE,t=Math.max(0,Math.min(1,progress))*(profile.treads.length-1),i=Math.floor(t);
  const sample=profile.treads[i]+((profile.treads[i+1] ?? profile.treads[i])-profile.treads[i])*(t-i);
  return stair.low+Math.max(0,Math.min(1,(sample-profile.low)/(profile.high-profile.low)))*(stair.high-stair.low);
}
export function lobbyFloorHeight(x,z) {
  const stair=lobbyStairAt(x,z);
  if(stair)return stairTreadHeight(stair,(x*stair.dx+z*stair.dz-stair.start)/stair.length);
  return baseLobbyFloorHeight(x,z);
}
export function canStandInBetaLobby(x, z, radius = .45) {
  const stair=lobbyStairAt(x,z);
  // The mesh side rails occupy the outer part of each staircase.
  if(stair && Math.abs(x*stair.dz-z*stair.dx)>stair.width*.28-radius)return false;
  return [[0, 0], [-radius, -radius], [-radius, radius], [radius, -radius], [radius, radius]]
    .every(([dx, dz]) => lobbyFloorHeight(x + dx, z + dz) > -5);
}

// Extract the perimeter of the union: shared room/corridor entrances stay open.
export function betaLobbyWallSegments() {
  const xs = [...new Set(BETA_LOBBY_FLOORS.flatMap(f => [f.x - f.width / 2, f.x + f.width / 2]))].sort((a, b) => a - b);
  const zs = [...new Set(BETA_LOBBY_FLOORS.flatMap(f => [f.z - f.depth / 2, f.z + f.depth / 2]))].sort((a, b) => a - b);
  const occupied = (i, j) => i >= 0 && j >= 0 && i < xs.length - 1 && j < zs.length - 1
    && baseLobbyFloorHeight((xs[i] + xs[i + 1]) / 2, (zs[j] + zs[j + 1]) / 2) > -5;
  const edges = [];
  for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < zs.length - 1; j++) {
    if (!occupied(i, j)) continue;
    const base = baseLobbyFloorHeight((xs[i] + xs[i + 1]) / 2, (zs[j] + zs[j + 1]) / 2);
    if (!occupied(i - 1, j)) edges.push({ axis: 'z', line: xs[i], from: zs[j], to: zs[j + 1], sign: -1, base });
    if (!occupied(i + 1, j)) edges.push({ axis: 'z', line: xs[i + 1], from: zs[j], to: zs[j + 1], sign: 1, base });
    if (!occupied(i, j - 1)) edges.push({ axis: 'x', line: zs[j], from: xs[i], to: xs[i + 1], sign: -1, base });
    if (!occupied(i, j + 1)) edges.push({ axis: 'x', line: zs[j + 1], from: xs[i], to: xs[i + 1], sign: 1, base });
  }
  edges.sort((a, b) => a.axis.localeCompare(b.axis) || a.line - b.line || a.sign - b.sign || a.base - b.base || a.from - b.from);
  const merged = [];
  for (const edge of edges) {
    const previous = merged.at(-1);
    if (previous && previous.axis === edge.axis && previous.line === edge.line && previous.sign === edge.sign && previous.base === edge.base && previous.to === edge.from) previous.to = edge.to;
    else merged.push({ ...edge });
  }
  return merged;
}
