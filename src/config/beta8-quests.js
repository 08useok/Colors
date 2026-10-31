// Store raw totals so fractional progress survives match boundaries and reloads.
export const BETA8_QUEST_GOALS = [10, 30, 60, ...Array.from({length:100}, (_, i) => (i + 1) * 100)];
export const BETA8_QUEST_REWARDS = BETA8_QUEST_GOALS.map(goal => ({
  goal,
  coins: goal === 10000 ? 1000 : goal % 1000 === 0 ? 250 : goal % 500 === 0 ? 100 : 50,
  credits: goal === 10000 ? 500 : goal % 1000 === 0 ? 100 : goal % 500 === 0 ? 50 : 0,
}));
export function questClaims(value) {
  return [...new Set(Array.isArray(value) ? value : [])].filter(goal => BETA8_QUEST_GOALS.includes(goal));
}
export function claimQuestReward(state, goal) {
  const reward = BETA8_QUEST_REWARDS.find(r => r.goal === goal);
  const claimed = questClaims(state.beta8QuestClaimed);
  if (!reward || claimed.includes(goal) || questPoints(state.beta8Quests) < goal) return null;
  state.beta8QuestClaimed = [...claimed, goal];
  state.coins += reward.coins;
  state.credits += reward.credits;
  return reward;
}
const amount = value => typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : 0;
export function questStats(value = {}) {
  value = value && typeof value === 'object' ? value : {};
  return { kills: Math.floor(amount(value.kills)), healing: amount(value.healing), damage: amount(value.damage) };
}
export function questPoints(value) {
  const stats = questStats(value);
  return stats.kills + stats.healing / 2000 + stats.damage / 1000;
}
export function addQuestStats(total, earned) {
  const a = questStats(total), b = questStats(earned);
  return questStats({ kills: a.kills + b.kills, healing: a.healing + b.healing, damage: a.damage + b.damage });
}
