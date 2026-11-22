// Official Season 1 progression: power, gems, battle pass, ranked.
import assert from 'node:assert/strict';
import * as P from '../src/official/progression.js';
import { season9Definitions } from './simulate-beta9-team-modes.mjs';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';

const fresh = () => ({ coins: 10000, credits: 0, ownedCharacters: ['red', 'blue'], official: P.normalizeOfficial({}) });

{ // Power: +2% per level, 11 = +20%; costs 100 … 7,500 (22,375 total); gadget at 7, transform at 11.
  assert.equal(P.powerMultiplier(1), 1);
  assert(Math.abs(P.powerMultiplier(11) - 1.2) < 1e-12);
  assert.equal(P.POWER_UPGRADE_COSTS[0], 100); assert.equal(P.POWER_UPGRADE_COSTS.at(-1), 7500);
  assert.equal(P.POWER_UPGRADE_COSTS.reduce((a, b) => a + b), 22375);
  const s = fresh(); s.coins = 30000;
  assert.equal(P.powerOf(s.official, 'red'), 1);
  for (let p = 1; p < 7; p++) assert.equal(P.upgradePower(s, 'red').ok, true);
  assert.equal(P.powerOf(s.official, 'red'), 7);
  assert(P.gadgetUnlocked(s.official, 'red') && !P.transformUnlocked(s.official, 'red'));
  while (P.upgradePower(s, 'red').ok);
  assert.equal(P.powerOf(s.official, 'red'), 11);
  assert(P.transformUnlocked(s.official, 'red'));
  assert.equal(s.coins, 30000 - 22375);
  assert.equal(P.upgradePower(s, 'red').reason, 'max');
  s.coins = 5; assert.equal(P.upgradePower(s, 'blue').reason, 'coins');
}
{ // Gems: 5 a day once per local day; exchanges; shop packages are display-only data.
  const s = fresh(), day = new Date(2026, 10, 8, 10).getTime();
  assert.equal(P.claimDailyGems(s.official, day), 5);
  assert.equal(P.claimDailyGems(s.official, day + 3600e3), 0, 'same day');
  assert.equal(P.claimDailyGems(s.official, day + 86400e3), 5, 'next day');
  assert.equal(s.official.gems, 10);
  assert.equal(P.exchangeGems(s, 'coins-small').reason, 'gems');
  s.official.gems = 30; const coins = s.coins;
  assert.equal(P.exchangeGems(s, 'coins-small').ok, true);
  assert.equal(s.coins, coins + 300); assert.equal(s.official.gems, 0);
  assert.deepEqual([...P.GEM_PACKAGES], [30, 80, 170, 360, 950]);
}
{ // Battle pass: 50 tiers, 100 XP each; free 50 gems/season; premium 169 gems, tier 30 character, 2 skins.
  assert.equal(P.PASS_REWARDS.length, 50);
  assert.equal(P.PASS_REWARDS.reduce((sum, r) => sum + (r.free.gems || 0), 0), 50);
  assert.equal(P.PASS_REWARDS[29].premium.character, 'black-or-white');
  assert.equal(P.PASS_REWARDS.filter(r => r.premium.skin).length, 2);
  const s = fresh();
  assert.equal(P.passXpForMatch({ won: true }), 40); assert.equal(P.passXpForMatch({ abandoned: true }), 0);
  assert.equal(P.claimPassReward(s, 1, 'free').reason, 'locked');
  P.addPassXp(s.official, 250);
  assert.equal(P.passTier(s.official), 2);
  const coins = s.coins;
  assert.equal(P.claimPassReward(s, 1, 'free').ok, true);
  assert.equal(s.coins, coins + P.PASS_REWARDS[0].free.coins);
  assert.equal(P.claimPassReward(s, 1, 'free').reason, 'claimed');
  assert.equal(P.claimPassReward(s, 1, 'premium').reason, 'premium');
  assert.equal(P.buyPremiumPass(s.official).reason, 'gems');
  s.official.gems = 200;
  assert.equal(P.buyPremiumPass(s.official).ok, true); assert.equal(s.official.gems, 31);
  assert.equal(P.claimPassReward(s, 1, 'premium').ok, true);
  P.addPassXp(s.official, 1e9);
  assert.equal(P.passTier(s.official), 50);
  assert.equal(P.claimPassReward(s, 30, 'premium').ok, true);
  assert.deepEqual(s.official.pendingRewards, ['black-or-white']);
}
{ // Ranked: power-11 owned characters only; +25 / -15, never below 0; ranks; season reset.
  const s = fresh();
  assert.equal(P.rankedEligible(s, 'red'), false);
  s.official.power.red = 11;
  assert.equal(P.rankedEligible(s, 'red'), true);
  s.official.power.green = 11;
  assert.equal(P.rankedEligible(s, 'green'), false, 'must own the character');
  assert.equal(P.recordRanked(s.official, { won: false }).delta, 0, 'floor at 0');
  for (let i = 0; i < 12; i++) P.recordRanked(s.official, { won: true });
  assert.equal(s.official.ranked.points, 300);
  assert.equal(P.rankOf(300).id, 'silver');
  assert.equal(P.recordRanked(s.official, { won: false }).delta, -15);
  assert.equal(P.rankOf(0).id, 'bronze'); assert.equal(P.rankOf(5000).id, 'master');
  const old = P.normalizeOfficial({ ranked: { season: P.RANKED_SEASON - 1, points: 900 } });
  assert.equal(old.ranked.points, 0, 'new season resets rank');
  assert.equal(P.normalizeOfficial({ ranked: { season: P.RANKED_SEASON, points: 900 } }).ranked.points, 900);
}
{ // Save block survives garbage.
  const o = P.normalizeOfficial({ power: { red: 99, blue: -3 }, gems: -5, pass: { xp: 1e12, claimed: { free: [0, 1, 1, 51] } } });
  assert.equal(o.power.red, 11); assert.equal(o.power.blue, 1); assert.equal(o.gems, 0);
  assert.equal(o.pass.xp, 5000); assert.deepEqual(o.pass.claimed.free, [1]);
}
{ // Engine: a power-11 fighter has 20% more health and deals 20% more damage; others unchanged.
  const defs = season9Definitions();
  const w = createBeta6Combat(defs, { bounds: 19.4 });
  const strong = w.add('red', { automatic: false, team: 'a', x: 0, z: 0, powerMultiplier: P.powerMultiplier(11) });
  const plain = w.add('red', { automatic: false, team: 'b', x: 3, z: 0 });
  assert(Math.abs(strong.hp - defs.red.maxHealth * 1.2) < 1e-6 && Math.abs(strong.d.maxHealth - defs.red.maxHealth * 1.2) < 1e-6);
  assert.equal(plain.hp, defs.red.maxHealth); assert.equal(defs.red.maxHealth, plain.d.maxHealth, 'shared table untouched');
  assert(Math.abs(w.hit(strong, plain, 1000) - 1200) < 1e-6);
  assert(Math.abs(w.hit(plain, strong, 1000) - 1000) < 1e-6);
}
console.log('PASS official progression: power 1-11 (+2%/level, gadget 7, transform 11), gems, battle pass 50 tiers, ranked.');
