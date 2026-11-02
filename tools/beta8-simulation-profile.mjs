import {betaShowdownProfile} from '../src/config/beta-showdown.js';
const showdown=betaShowdownProfile(true);
// Enlarged simulation arena; retain the live arena scale as reference and all close starts.
export const BETA8_SIMULATION_PROFILE=Object.freeze({
  mapSide:120,bounds:59,liveMapSide:showdown.halfSize*2,liveBounds:showdown.actorLimit,
  distances:Object.freeze([6,10,14,20,28,36]),
  aimErrors:Object.freeze([.035,.1]),seedsPerScenario:10,
  zone:Object.freeze({start:30,end:45,startRadius:40,endRadius:8,damagePerSecond:.25}),
  scope:'Enlarged 120x120 open simulation arena (live map is 100x100); historical synthetic zone, no obstacles or multiplayer spawns',
});
