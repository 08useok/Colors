export const SKINS = {
  alpha_red: {
    id: "alpha_red",
    name: "Alpha Red",
    nameKey: "skinAlphaRedName",
    character: "red",
    season: "alpha3",
    rarity: "rare",
    cost: 1000,
    desc: "skinAlphaRedDesc",
  },
  alpha_champion_cyan: {
    id: "alpha_champion_cyan",
    name: "Champion Cyan",
    nameKey: "skinChampionCyanName",
    character: "cyan",
    season: "alpha4",
    rarity: "rare",
    cost: 0,
    desc: "skinChampionCyanDesc",
  },
  beta_red_orange: {
    id: "beta_red_orange",
    name: "Crimson Orange",
    nameKey: "skinBetaRedOrangeName",
    character: "orange",
    season: "beta1",
    rarity: "rare",
    cost: 1000,
    desc: "skinBetaRedOrangeDesc",
  },
  beta_red_crimson: {
    id: "beta_red_crimson",
    name: "Blood Crimson",
    nameKey: "skinBetaRedCrimsonName",
    character: "crimson",
    season: "beta1",
    rarity: "epic",
    cost: 2500,
    desc: "skinBetaRedCrimsonDesc",
  },
  beta_red_red: {
    id: "beta_red_red",
    name: "Scarlet Red",
    nameKey: "skinBetaRedRedName",
    character: "red",
    season: "beta1",
    rarity: "legendary",
    cost: 5000,
    desc: "skinBetaRedRedDesc",
  },
  crown_pink: {
    id: "crown_pink",
    name: "준우승 왕관",
    nameKey: "skinCrownPinkName",
    character: "pink",
    season: "beta1",
    rarity: "rare",
    cost: 0,
    desc: "skinCrownPinkDesc",
  },
  crown_green: {
    id: "crown_green",
    name: "3위 왕관",
    nameKey: "skinCrownGreenName",
    character: "green",
    season: "beta1",
    rarity: "rare",
    cost: 0,
    desc: "skinCrownGreenDesc",
  },
  crown_cyan: {
    id: "crown_cyan",
    name: "우승 왕관",
    nameKey: "skinCrownCyanName",
    character: "cyan",
    season: "beta1",
    rarity: "rare",
    cost: 0,
    desc: "skinCrownCyanDesc",
  },
  beta2_gold_yellow: {
    id: "beta2_gold_yellow",
    name: "황금 광산 기술자 옐로우",
    character: "yellow",
    season: "beta2",
    rarity: "rare",
    cost: 1000,
    desc: "골드 러쉬 시즌 한정 옐로우 스킨",
  },
  beta2_gold_orange: {
    id: "beta2_gold_orange",
    name: "골드 사냥꾼 오렌지",
    character: "orange",
    season: "beta2",
    rarity: "legendary",
    cost: 5000,
    desc: "골드 러쉬 시즌 한정 오렌지 스킨",
  },
  beta2_gold_gold: {
    id: "beta2_gold_gold",
    name: "황금 대농장주 골드",
    character: "gold",
    season: "beta2",
    rarity: "epic",
    cost: 2500,
    desc: "골드 러쉬 시즌 한정 골드 스킨",
  },
};

export const SKIN_ID_MIGRATION = {
  red_orange: "beta_red_orange",
  red_crimson: "beta_red_crimson",
  red_red: "beta_red_red",
};

export function migrateSkinId(skinId) {
  return SKIN_ID_MIGRATION[skinId] || skinId;
}

export function getSkinsForSeason(season) {
  return Object.values(SKINS).filter((skin) => skin.season === season);
}
