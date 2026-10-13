// Design goals used by reports only; these never modify combat damage or AI.
// Each character should beat the next and lose to the previous in one cycle.
export const BETA7_COUNTER_CYCLE = [
  'red', 'blue', 'orange', 'mint', 'cyan', 'pink', 'purple', 'chartreuse',
  'yellow', 'ivory', 'gold', 'green', 'azure', 'lavender', 'crimson', 'crystal',
];
export const BETA7_COUNTER_TARGETS = BETA7_COUNTER_CYCLE.map((id, index, cycle) => ({
  id,
  targetWin: cycle[(index + 1) % cycle.length],
  targetLoss: cycle[(index + cycle.length - 1) % cycle.length],
}));
