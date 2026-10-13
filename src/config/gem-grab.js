// Shared Gem Grab rules used by the main release; values match the beta arena.
export const GEM_GRAB_RULES=Object.freeze({halfWidth:20,target:10,escapeSeconds:15,matchSeconds:180,spawnInterval:1.5,firstSpawnDelay:3,maxInPlay:21,pickupRange:1.5,respawnDelay:5});
export function gemEscapeResult(state,counts,now){
 for(const team of ['a','b']){if(counts[team]<GEM_GRAB_RULES.target)state[team]=null;else state[team]??=now;}
 for(const team of ['a','b'])if(state[team]!=null&&now-state[team]>=GEM_GRAB_RULES.escapeSeconds)return team;
 return null;
}
