// IDs stay stable in saves, combat and model paths; only display names change.
export const CHARACTER_NAMES = {
  red: ["레드", "Red"], green: ["그린", "Green"], blue: ["블루", "Blue"],
  orange: ["오렌지", "Orange"], yellow: ["옐로우", "Yellow"], cyan: ["시안", "Cyan"],
  purple: ["퍼플", "Purple"], pink: ["핑크", "Pink"], crimson: ["크림슨", "Crimson"],
  gold: ["골드", "Gold"], ivory: ["아이보리", "Ivory"], chartreuse: ["샤르트뢰즈", "Chartreuse"],
  mint: ["민트", "Mint"], azure: ["애저", "Azure"], crystal: ["크리스탈", "Crystal"],
  lavender: ["라벤더", "Lavender"], salmon: ["살몬", "Salmon"],
};
export function characterDisplayName(id, lang = "ko") {
  return CHARACTER_NAMES[id]?.[lang === "en" ? 1 : 0] ?? id;
}
