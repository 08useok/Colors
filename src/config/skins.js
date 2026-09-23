export const SKINS = {
  alpha_red: { id: "alpha_red", name: "Alpha Red", nameKey: "skinAlphaRedName", character: "red", season: "alpha3", rarity: "rare", cost: 1000, desc: "skinAlphaRedDesc" },
  alpha_champion_cyan: { id: "alpha_champion_cyan", name: "Champion Cyan", nameKey: "skinChampionCyanName", character: "cyan", season: "alpha4", rarity: "rare", cost: 0, desc: "skinChampionCyanDesc" },
  beta_red_orange: { id: "beta_red_orange", name: "Crimson Orange", nameKey: "skinBetaRedOrangeName", character: "orange", season: "beta1", rarity: "rare", cost: 1000, desc: "skinBetaRedOrangeDesc" },
  beta_red_crimson: { id: "beta_red_crimson", name: "Blood Crimson", nameKey: "skinBetaRedCrimsonName", character: "crimson", season: "beta1", rarity: "epic", cost: 2500, desc: "skinBetaRedCrimsonDesc" },
  beta_red_red: { id: "beta_red_red", name: "Scarlet Red", nameKey: "skinBetaRedRedName", character: "red", season: "beta1", rarity: "legendary", cost: 5000, desc: "skinBetaRedRedDesc" },
  crown_pink: { id: "crown_pink", name: "Runner-up Crown", nameKey: "skinCrownPinkName", character: "pink", season: "beta1", rarity: "rare", cost: 0, desc: "skinCrownPinkDesc" },
  crown_green: { id: "crown_green", name: "Third-place Crown", nameKey: "skinCrownGreenName", character: "green", season: "beta1", rarity: "rare", cost: 0, desc: "skinCrownGreenDesc" },
  beta2_gold_yellow: { id: "beta2_gold_yellow", name: "Gold Rush Yellow", nameKey: "skinBeta2GoldYellowName", character: "yellow", season: "beta2", rarity: "rare", cost: 1000, desc: "skinBeta2GoldYellowDesc" },
  beta2_gold_orange: { id: "beta2_gold_orange", name: "Gold Rush Orange", nameKey: "skinBeta2GoldOrangeName", character: "orange", season: "beta2", rarity: "legendary", cost: 5000, desc: "skinBeta2GoldOrangeDesc" },
  beta2_gold_gold: { id: "beta2_gold_gold", name: "Gold Rush Gold", nameKey: "skinBeta2GoldGoldName", character: "gold", season: "beta2", rarity: "epic", cost: 2500, desc: "skinBeta2GoldGoldDesc" },
  beta2_ivory_shopkeeper: { id: "beta2_ivory_shopkeeper", name: "점원 아이보리", nameKey: "skinBeta2IvoryShopkeeperName", character: "ivory", season: "beta2", rarity: "epic", cost: 2500, desc: "skinBeta2IvoryShopkeeperDesc" },
  beta5_pink_cotton_candy: { id: "beta5_pink_cotton_candy", name: "솜사탕 핑크", nameKey: "skinBeta5PinkCottonCandyName", character: "pink", season: "beta5", rarity: "epic", cost: 2500, desc: "skinBeta5PinkCottonCandyDesc" },
  beta6_cyan_aqua_scout: { id: "beta6_cyan_aqua_scout", name: "잠수부 시안", nameKey: "skinBeta6CyanAquaScoutName", character: "cyan", season: "beta6", rarity: "epic", cost: 2500, desc: "skinBeta6CyanAquaScoutDesc" },
  beta6_chartreuse_pufferfish_boy: { id: "beta6_chartreuse_pufferfish_boy", name: "복어 샤트", nameKey: "skinBeta6ChartreusePufferfishBoyName", character: "chartreuse", season: "beta6", rarity: "rare", cost: 1000, desc: "skinBeta6ChartreusePufferfishBoyDesc" },
  beta6_orange_citrus_luau_buddy: { id: "beta6_orange_citrus_luau_buddy", name: "트로피컬 오렌지", nameKey: "skinBeta6OrangeCitrusLuauBuddyName", character: "orange", season: "beta6", rarity: "epic", cost: 2500, desc: "skinBeta6OrangeCitrusLuauBuddyDesc" },
  beta6_azure_blue_wave_buddy: { id: "beta6_azure_blue_wave_buddy", name: "프로 서퍼 애저", nameKey: "skinBeta6AzureBlueWaveBuddyName", character: "azure", season: "beta6", rarity: "legendary", cost: 5000, desc: "skinBeta6AzureBlueWaveBuddyDesc" },
  beta7_gold_pharaoh: { id: "beta7_gold_pharaoh", name: "파라오 골드", character: "gold", season: "beta7", rarity: "hero", cost: 3500, desc: "황금 왕관과 고대 저주 문양을 두른 유적의 지배자" },
  beta7_green_mummy: { id: "beta7_green_mummy", name: "미라 그린", character: "green", season: "beta7", rarity: "epic", cost: 2500, desc: "무덤 안개 속에서 붕대를 흩날리는 고대의 기습자" },
  beta7_blue_scarab: { id: "beta7_blue_scarab", name: "스카라베 블루", character: "blue", season: "beta7", rarity: "epic", cost: 2500, desc: "금빛 날개로 유적 벽 사이를 튕겨 다니는 수호자" },
  beta7_pink_ruin_explorer: { id: "beta7_pink_ruin_explorer", name: "유적 탐험가 핑크", character: "pink", season: "beta7", rarity: "rare", cost: 1000, desc: "지도와 카메라를 들고 황금 유적을 생중계하는 탐험가" },
};

export const SKIN_ID_MIGRATION = {
  red_orange: "beta_red_orange", red_crimson: "beta_red_crimson", red_red: "beta_red_red",
  champion_cyan: "alpha_champion_cyan", cyan_champion: "alpha_champion_cyan", crown_cyan: "alpha_champion_cyan",
  alpha_cyan_champion: "alpha_champion_cyan", championCyan: "alpha_champion_cyan",
};
export function migrateSkinId(skinId) { return SKIN_ID_MIGRATION[skinId] || skinId; }
export function getSkinsForSeason(season) { return Object.values(SKINS).filter((skin) => skin.season === season); }
