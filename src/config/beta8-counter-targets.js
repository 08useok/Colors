// Design targets only. These never alter combat damage, stats or AI.
// Crystal counters tanks; use Purple instead of Crimson as its target counter.
export const BETA8_COUNTER_CYCLE = [
  // Season 9 (2026-11-02): Raspberry joins between Chartreuse and Yellow.
  'red', 'chartreuse', 'raspberry', 'yellow', 'ivory', 'salmon', 'gold', 'green', 'azure',
  'lavender', 'crimson', 'blue', 'orange', 'mint', 'cyan', 'pink', 'purple', 'crystal',
];
export const BETA8_COUNTER_TARGETS = BETA8_COUNTER_CYCLE.map((id,index,cycle)=>({
  id,targetWin:cycle[(index+1)%cycle.length],targetLoss:cycle[(index+cycle.length-1)%cycle.length],
}));
