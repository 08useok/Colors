// Official Season 1 progression: power 1–11, gems, battle pass and ranked mode.
// Pure functions over the saved `official` block so they can be tested without the page.
// See specs/official-season-1.md (배틀 시스템 · 배틀 패스 · 보석 · 파워 업그레이드 비용).

// ── Power 1–11 ──────────────────────────────────────────────────────────────
export const POWER_MAX = 11;
export const POWER_STEP = 0.02;          // +2% health and damage per power (power 11 = +20%)
export const GADGET_POWER = 7;           // gadget unlocks at power 7
export const TRANSFORM_POWER = 11;       // transform unlocks at power 11
// Coins to go from power p to p + 1 (index p - 1). 1→2 costs 100, 10→11 costs 7,500; 22,375 in total.
export const POWER_UPGRADE_COSTS = Object.freeze([100, 225, 400, 650, 1000, 1500, 2250, 3250, 5500, 7500]);

const clampPower = p => Math.max(1, Math.min(POWER_MAX, Math.floor(Number(p) || 1)));
export const powerMultiplier = p => 1 + POWER_STEP * (clampPower(p) - 1);
export const powerOf = (official, id) => clampPower(official?.power?.[id]);
export const nextPowerCost = (official, id) => powerOf(official, id) >= POWER_MAX ? null : POWER_UPGRADE_COSTS[powerOf(official, id) - 1];
export const gadgetUnlocked = (official, id) => powerOf(official, id) >= GADGET_POWER;
export const transformUnlocked = (official, id) => powerOf(official, id) >= TRANSFORM_POWER;

// state: the whole save (coins live on it); returns { ok, cost?, power?, reason? }.
export function upgradePower(state, id) {
  const official = state.official;
  const cost = nextPowerCost(official, id);
  if (cost == null) return { ok: false, reason: 'max' };
  if ((state.coins || 0) < cost) return { ok: false, reason: 'coins', cost };
  state.coins -= cost;
  official.power[id] = powerOf(official, id) + 1;
  return { ok: true, cost, power: official.power[id] };
}

// ── Gems ────────────────────────────────────────────────────────────────────
export const DAILY_GEMS = 5;
export const GEM_PACKAGES = Object.freeze([30, 80, 170, 360, 950]); // shop display only — no real payment yet
export const GEM_EXCHANGES = Object.freeze([
  { id: 'coins-small', gems: 30, coins: 300 },
  { id: 'coins-large', gems: 80, coins: 900 },
  { id: 'credits-small', gems: 30, credits: 150 },
  { id: 'credits-large', gems: 80, credits: 450 },
]);
const localDay = now => { const d = new Date(now); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const dailyGemsReady = (official, now = Date.now()) => official.dailyGemDay !== localDay(now);
export function claimDailyGems(official, now = Date.now()) {
  if (!dailyGemsReady(official, now)) return 0;
  official.dailyGemDay = localDay(now); official.gems += DAILY_GEMS;
  return DAILY_GEMS;
}
export function exchangeGems(state, exchangeId) {
  const exchange = GEM_EXCHANGES.find(e => e.id === exchangeId);
  if (!exchange) return { ok: false, reason: 'unknown' };
  if (state.official.gems < exchange.gems) return { ok: false, reason: 'gems' };
  state.official.gems -= exchange.gems;
  state.coins = (state.coins || 0) + (exchange.coins || 0);
  state.credits = (state.credits || 0) + (exchange.credits || 0);
  return { ok: true, exchange };
}

// ── Win star reward ─────────────────────────────────────────────────────────
// Every win gives one star; opening it rolls a grade, then pays that grade's coins or credits (50/50).
// Official uses 12 grades (the beta's 10 plus 11 고귀 and 12 영광), about 2,080 coins per win on average (2,410 with "한 번에 사용"); tiers 1–10 match the beta.
export const STAR_REWARD_TIERS = Object.freeze([
  Object.freeze({ id: 'common', name: '일반', credits: 100, coins: 250 }),
  Object.freeze({ id: 'rare', name: '희귀', credits: 150, coins: 400 }),
  Object.freeze({ id: 'epic', name: '초희귀', credits: 250, coins: 700 }),
  Object.freeze({ id: 'mythic', name: '신화', credits: 400, coins: 1200 }),
  Object.freeze({ id: 'legendary', name: '전설', credits: 600, coins: 2000 }),
  Object.freeze({ id: 'unique', name: '유니크', credits: 900, coins: 3200 }),
  Object.freeze({ id: 'ultra', name: '울트라 전설', credits: 1400, coins: 5000 }),
  Object.freeze({ id: 'transcend', name: '초월', credits: 2100, coins: 8000 }),
  Object.freeze({ id: 'unknown', name: '???', credits: 3200, coins: 12000 }),
  Object.freeze({ id: 'absolute', name: '절대', credits: 5000, coins: 20000 }),
  Object.freeze({ id: 'exalted', name: '고귀', credits: 6000, coins: 25000 }),
  Object.freeze({ id: 'glorious', name: '영광', credits: 7500, coins: 30000 }),
]);
// Extra upgrade jump on top of the beta's 1–10 step weights, so a single jump can reach 영광 from 희귀.
export const STAR_EXTRA_JUMPS = Object.freeze([Object.freeze({ steps: 11, weight: 0.5 })]);

// ── Battle pass ─────────────────────────────────────────────────────────────
export const PASS_TIERS = 50;
export const PASS_XP_PER_TIER = 100;
export const PASS_PREMIUM_COST = 169;
// Match XP: a win is worth more, abandoning gives nothing.
export const passXpForMatch = ({ won = false, draw = false, abandoned = false } = {}) => abandoned ? 0 : won ? 40 : draw ? 25 : 20;

// Free track: mostly coins, credits every 5th tier, 10 gems on tiers 10/20/30/40/50 (50 per season).
// Premium track: more coins, season skins on 15 and 45, a new character on 30 (Black or White when released).
function freeReward(tier) {
  if (tier % 10 === 0) return { gems: 10 };
  if (tier % 5 === 0) return { credits: 100 };
  return { coins: 40 + Math.floor(tier / 10) * 10 };
}
function premiumReward(tier) {
  if (tier === 30) return { character: 'black-or-white', label: '신규 캐릭터 (블랙 또는 화이트, 출시 시 지급)' };
  if (tier === 15) return { skin: 'official1-premium-skin-1', label: '시즌 한정 스킨 1 (출시 예정)' };
  if (tier === 45) return { skin: 'official1-premium-skin-2', label: '시즌 한정 스킨 2 (출시 예정)' };
  if (tier % 5 === 0) return { credits: 200 };
  return { coins: 80 + Math.floor(tier / 10) * 20 };
}
export const PASS_REWARDS = Object.freeze(Array.from({ length: PASS_TIERS }, (_, i) => Object.freeze({ tier: i + 1, free: freeReward(i + 1), premium: premiumReward(i + 1) })));
export const passTier = official => Math.min(PASS_TIERS, Math.floor((official.pass.xp || 0) / PASS_XP_PER_TIER));
export function addPassXp(official, xp) { official.pass.xp = Math.min(PASS_TIERS * PASS_XP_PER_TIER, (official.pass.xp || 0) + Math.max(0, xp)); return passTier(official); }
export function buyPremiumPass(official) {
  if (official.pass.premium) return { ok: false, reason: 'owned' };
  if (official.gems < PASS_PREMIUM_COST) return { ok: false, reason: 'gems' };
  official.gems -= PASS_PREMIUM_COST; official.pass.premium = true;
  return { ok: true };
}
// Grants coins/credits/gems on the save; skins and the character are recorded as pending until they exist.
export function claimPassReward(state, tier, track) {
  const official = state.official, pass = official.pass;
  const entry = PASS_REWARDS[tier - 1];
  if (!entry || !['free', 'premium'].includes(track)) return { ok: false, reason: 'unknown' };
  if (tier > passTier(official)) return { ok: false, reason: 'locked' };
  if (track === 'premium' && !pass.premium) return { ok: false, reason: 'premium' };
  if (pass.claimed[track].includes(tier)) return { ok: false, reason: 'claimed' };
  const reward = entry[track];
  state.coins = (state.coins || 0) + (reward.coins || 0);
  state.credits = (state.credits || 0) + (reward.credits || 0);
  official.gems += reward.gems || 0;
  if (reward.skin || reward.character) official.pendingRewards.push(reward.skin || reward.character);
  pass.claimed[track].push(tier);
  return { ok: true, reward };
}

// ── Ranked (경쟁전) ─────────────────────────────────────────────────────────
export const RANKED_SEASON = 1;              // bump to reset everyone's rank for a new season
export const RANKED_MODES = Object.freeze(['gemGrab', 'knockout', 'hotZone']);
export const RANKS = Object.freeze([
  { id: 'bronze', name: '브론즈', min: 0 },
  { id: 'silver', name: '실버', min: 300 },
  { id: 'gold', name: '골드', min: 600 },
  { id: 'diamond', name: '다이아몬드', min: 1000 },
  { id: 'mythic', name: '신화', min: 1500 },
  { id: 'legendary', name: '전설', min: 2100 },
  { id: 'master', name: '마스터', min: 2800 },
]);
export const RANKED_WIN = 25, RANKED_LOSS = 15, RANKED_DRAW = 0;
export const rankOf = points => [...RANKS].reverse().find(r => points >= r.min);
export const rankedEligible = (state, id) => state.ownedCharacters?.includes(id) && powerOf(state.official, id) >= POWER_MAX;
// Losses never drop you below the floor of your current rank's tier start (Bronze 0).
export function recordRanked(official, { won = false, draw = false, abandoned = false } = {}) {
  const ranked = official.ranked;
  const before = ranked.points;
  const delta = abandoned ? -RANKED_LOSS : won ? RANKED_WIN : draw ? RANKED_DRAW : -RANKED_LOSS;
  ranked.points = Math.max(0, before + delta);
  ranked[won ? 'wins' : draw ? 'draws' : 'losses']++;
  ranked.best = Math.max(ranked.best, ranked.points);
  return { delta: ranked.points - before, rank: rankOf(ranked.points), promoted: rankOf(ranked.points).min > rankOf(before).min };
}

// ── Save block ──────────────────────────────────────────────────────────────
const n = v => Math.max(0, Math.floor(Number(v) || 0));
const tiers = list => [...new Set((Array.isArray(list) ? list : []).map(Number).filter(t => t >= 1 && t <= PASS_TIERS))];
export function normalizeOfficial(saved = {}) {
  const ranked = saved.ranked?.season === RANKED_SEASON ? saved.ranked : {};
  return {
    power: Object.fromEntries(Object.entries(saved.power || {}).map(([id, p]) => [id, clampPower(p)])),
    gems: n(saved.gems),
    dailyGemDay: typeof saved.dailyGemDay === 'string' ? saved.dailyGemDay : null,
    pass: { xp: Math.min(PASS_TIERS * PASS_XP_PER_TIER, n(saved.pass?.xp)), premium: saved.pass?.premium === true, claimed: { free: tiers(saved.pass?.claimed?.free), premium: tiers(saved.pass?.claimed?.premium) } },
    pendingRewards: Array.isArray(saved.pendingRewards) ? saved.pendingRewards.filter(r => typeof r === 'string') : [],
    ranked: { season: RANKED_SEASON, points: n(ranked.points), best: n(ranked.best), wins: n(ranked.wins), losses: n(ranked.losses), draws: n(ranked.draws) },
  };
}
