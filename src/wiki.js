import { CHARACTERS } from "./config/characters.js";
import { BETA_CHARACTERS } from "./config/beta-characters.js";
import { SKINS } from "./config/skins.js";
import { applyBeta6Balance } from "./config/beta6-balance.js?v=1.6.0";

// 시즌 6부터 메인 게임이 시즌 6 밸런스를 그대로 쓰므로 위키도 같은 수치를 보여준다
const LIVE_CHARACTERS = applyBeta6Balance(BETA_CHARACTERS);

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// 사이트가 하위 경로(GitHub Pages의 /Colors/)에 올라갈 수 있어 라우팅도 베이스를 탄다.
// boot.js가 먼저 계산해두지만, 단독 로드 대비 여기서도 구한다.
const BASE = window.__WIKI_BASE__ ?? (location.pathname.replace(/\/wiki(\/.*)?$/, "") + "/");
// 베이스를 뺀 위키 내부 경로 ("/Colors/wiki/shop/" → "/wiki/shop/")
function wikiPath() {
  const path = location.pathname.toLowerCase();
  const base = BASE.toLowerCase().replace(/\/$/, "");
  return base && path.startsWith(base) ? path.slice(base.length) || "/" : path;
}

const copy = {
  ko: {
    wiki: "게임 위키", home: "홈", characters: "캐릭터", systems: "게임 가이드", shop: "상점",
    patches: "패치노트", play: "게임 플레이", official: "OFFICIAL GAME WIKI",
    heroTitle: "전장에 들어가기 전,<br><em>모든 색을 알아보세요.</em>",
    heroDesc: "캐릭터 능력치부터 전투 규칙, 맵과 시즌 업데이트까지 COLORS의 모든 정보를 한곳에서 확인하세요.",
    searchPlaceholder: "캐릭터, 스킬, 맵을 검색하세요", battleRules: "전투 규칙", categories: "카테고리",
    liveData: "베타 데이터 연동", liveDataDesc: "능력치와 일반 공격은 베타 설정 기준입니다.",
    footer: "이 위키의 수치 정보는 게임 설정을 기준으로 자동 표시됩니다.", backGame: "게임으로 돌아가기 →",
    allCharacters: "전체 캐릭터", charDesc: "서로 다른 색과 전투 방식을 가진 14명의 파이터를 만나보세요.",
    viewAll: "모두 보기", beginnerGuides: "초보자 가이드", guideDesc: "처음 전장에 들어가기 전에 알아둘 핵심 정보",
    latestPatch: "최근 업데이트", seasonDesc: "v1.6.0까지의 최신 변경 사항", hp: "체력", damage: "공격", range: "사거리",
    speed: "이동 속도", cooldown: "공격 간격", reload: "장전", role: "역할", basicAttack: "일반 공격",
    strategy: "초보자 운영 팁", related: "관련 문서", open: "문서 보기", allGuides: "게임 가이드",
    guidePageDesc: "전투 규칙부터 계정 성장까지, 플레이에 필요한 시스템을 익혀보세요.",
    shopTitle: "상점과 수집품", shopDesc: "재화, 캐릭터 성장, 스킨과 꾸미기 아이템 정보를 확인하세요.",
    patchTitle: "패치노트", patchDesc: "COLORS의 시즌별 주요 변경 내역입니다.", free: "무료",
    matchupNote: "수치는 베타 시즌 6 상성표(궁극기 포함 1대1 시뮬레이션)의 승률이며 실전 승률이 아닙니다. 지형·팀 효과는 제외됩니다.", noResult: "검색 결과가 없습니다.", dataNote: "베타 시즌 게임 코드 기준", guideNote: "공략은 초보자용 추천이며 절대적인 정답은 아닙니다.",
  },
  en: {
    wiki: "Game Wiki", home: "Home", characters: "Characters", systems: "Game Guide", shop: "Shop",
    patches: "Patch Notes", play: "Play Game", official: "OFFICIAL GAME WIKI",
    heroTitle: "Before entering battle,<br><em>learn every color.</em>",
    heroDesc: "Explore character stats, combat rules, maps, seasons, and everything else in COLORS.",
    searchPlaceholder: "Search characters, skills, and maps", battleRules: "Combat Rules", categories: "Categories",
    liveData: "Beta game data", liveDataDesc: "Stats and basic attacks use the Beta config.",
    footer: "Numerical information is loaded from the current game configuration.", backGame: "Back to game →",
    allCharacters: "All Characters", charDesc: "Meet fourteen fighters with distinct colors and combat styles.",
    viewAll: "View all", beginnerGuides: "Beginner Guides", guideDesc: "Essentials to know before your first battle",
    latestPatch: "Latest Updates", seasonDesc: "Latest changes through v1.6.0", hp: "HP", damage: "Damage", range: "Range",
    speed: "Move Speed", cooldown: "Cooldown", reload: "Reload", role: "Role", basicAttack: "Basic Attack",
    strategy: "Beginner Strategy", related: "Related articles", open: "Open article", allGuides: "Game Guide",
    guidePageDesc: "Learn the systems you need, from combat rules to account progression.",
    shopTitle: "Shop & Collections", shopDesc: "Currencies, character progression, skins, and cosmetics.",
    patchTitle: "Patch Notes", patchDesc: "Major changes across COLORS seasons.", free: "Free",
    matchupNote: "Figures are win rates from the Beta Season 6 matchup table (1v1 simulation with ultimates), not live win rates. Terrain and team effects are excluded.", noResult: "No results found.", dataNote: "Beta Season game config", guideNote: "Tips are beginner recommendations, not absolute rules.",
  },
};

const characterMeta = {
  red: {
    role: ["근접 탱커", "Melee Tank"], attack: ["잽 잽", "Jab Jab"],
    desc: ["TV에 나오는 복싱 선수입니다. 빠른 발로 거리를 좁혀 2연타를 꽂고, 레드 가드로 버티며 싸우는 근접 파이터입니다.", "A TV boxer who closes distance with fast footwork, lands a two-hit combo, and outlasts fights with Red Guard."],
    tip: ["벽과 수풀로 사격선을 끊고 접근하세요. 체력이 깎이기 시작하면 레드 가드를 켜고 밀어붙이는 편이 안전합니다.", "Break lines of fire with walls and bushes before approaching. Once you start taking damage, pop Red Guard and push in."],
    range: 5.5, damage: 4800,
  },
  green: {
    role: ["암살자", "Assassin"], attack: ["부메랑", "Boomerang"],
    desc: ["시골에서 올라와 이사 자금을 벌려고 대회에 나선 파이터입니다. 부메랑 네 개를 한 번에 던져 가까운 적을 순식간에 쓰러뜨립니다.", "A countryside fighter chasing moving money. Green throws four boomerangs at once to delete nearby targets."],
    tip: ["3.5타일 안에서 네 발을 모두 맞혀야 최대 피해가 나옵니다. 은신 수풀로 숨어 있다가 붙는 순간 쏘세요.", "Full damage needs all four boomerangs inside 3.5 tiles. Hide with Hiding Bush and fire the moment you close in."],
    range: 7, damage: 7600,
  },
  blue: {
    role: ["저격수", "Marksman"], attack: ["스피드 구슬", "Speed Marble"],
    desc: ["손이 누구보다 빠른 평범한 일반인입니다. 가장 긴 사거리에서 초고속 구슬을 연사해 적을 밀어내며 깎아 냅니다.", "An ordinary person with unmatched hand speed. Blue fires ultra-fast marbles from the longest range in the game, chipping and pushing enemies away."],
    tip: ["10~16타일 거리를 유지하세요. 레드처럼 빠른 근접 캐릭터가 붙으면 돌진으로 벽을 튕겨 빠져나가는 것이 먼저입니다.", "Stay 10-16 tiles away. When a fast melee fighter like Red gets close, use Ricochet Dash to bounce off walls and escape first."],
    range: 17.5, damage: 1200,
  },
  orange: {
    role: ["범위 딜러", "Area Damage"], attack: ["오렌지 슛", "Orange Shot"],
    desc: ["오렌지 하나로 첫 우승을 노리는 오렌지 농부입니다. 오렌지가 터지며 흩어지는 과즙으로 넓은 범위에 큰 피해를 줍니다.", "An orange farmer aiming to win with nothing but oranges. Orange's bursting juice deals heavy damage across a wide area."],
    tip: ["과즙은 오렌지가 멈추거나 부딪힌 자리에서 퍼집니다. 적의 몸에 직접 맞히면 과즙 대부분이 함께 들어가니 가까운 적에게는 정면으로 던지세요.", "Juice bursts where the orange stops or hits. A direct hit lands most of the juice too, so throw straight at nearby enemies."],
    range: 9, damage: 750,
  },
  yellow: {
    role: ["컨트롤러", "Controller"], attack: ["찌릿찌릿 전기구슬", "Zappy Orb"],
    desc: ["월세를 벌려고 대회에 나온 전기 기술자입니다. 전기구슬로 적을 느리게 만들고, 전기 회로 장치로 길목에 전류를 흘립니다.", "An electrician entering the tournament to pay rent. Yellow slows enemies with electric orbs and runs current through lanes with circuit devices."],
    tip: ["첫 명중의 감속으로 다음 구슬을 맞히세요. 전기 회로는 적이 지나갈 길을 따라 장치를 줄지어 깔아야 전류 구간이 길어집니다.", "Use the first hit's slow to land the next orb. Place circuit devices in a line along enemy paths to make longer current segments."],
    range: 12, damage: 2200,
  },
  cyan: {
    role: ["탄막 딜러", "Barrage Damage"], attack: ["압축 알약", "Compressed Pill"],
    desc: ["평범해 보이지만 어딘가 수상한 회사원 출신 파이터입니다. 압축 알약 여섯 발을 나란히 쏘고, 질풍 강타로 적을 멀리 날려 버립니다.", "A suspicious former office worker. Cyan fires six compressed pills side by side and blasts enemies away with Gale Strike."],
    tip: ["탄막 폭이 넓어 도망치는 적에게 강합니다. 질풍 강타는 자기장 가장자리나 벽 쪽으로 밀어낼 때 가장 효과적입니다.", "The wide barrage punishes fleeing enemies. Gale Strike is strongest when it pushes targets into the zone edge or walls."],
    range: 8.33, damage: 3900,
  },
  purple: {
    role: ["지속 피해", "Damage over Time"], attack: ["독침과 독병", "Needle & Vial"],
    desc: ["의사 자격증을 가진 향수 가게 사장님입니다. 독침 세 발로 독을 묻히고, 벽을 넘어가는 독병으로 숨은 적까지 마무리합니다.", "A perfume-shop owner with a medical license. Purple poisons with three needles and finishes hidden targets with vials that fly over walls."],
    tip: ["독침으로 독을 건 뒤 거리를 벌리세요. 독병은 벽 뒤나 수풀 속 적을 노릴 때 쓰는 차례로 아껴 두면 좋습니다.", "Apply poison with needles, then back off. Save the vial turn for enemies behind walls or in bushes."],
    range: 13, damage: 3240,
  },
  pink: {
    role: ["탱커·서포터", "Tank / Support"], attack: ["퍼지는 음표", "Spreading Notes"],
    desc: ["음악이 좋아 돈벌이를 잊은 스트리머입니다. 높은 체력과 빠른 발로 앞장서며, 음표로 적을 치고 아군을 회복하고, 앙코르로 아군을 되살립니다.", "A streamer who loves music more than money. Pink leads with high health and speed, hitting enemies and healing allies with notes, and revives allies with Encore."],
    tip: ["혼자 싸우면 약하고 팀과 함께일 때 강한 캐릭터입니다. 아군과 적이 모두 음표 범위에 들어오는 자리를 잡고, 앙코르는 한타 직전에 쓰세요.", "Pink is weak alone and strong with a team. Stand where notes reach both allies and enemies, and cast Encore right before a team fight."],
    range: 4.5, damage: 2000,
  },
  crimson: {
    role: ["근접 브루저", "Melee Bruiser"], attack: ["3연속 펀치", "Triple Punch"],
    desc: ["레드를 보고 권투를 시작해 세계적인 선수가 된 파이터입니다. 가장 빠른 발로 붙어 3연속 펀치를 넣고, 벽까지 부수는 KO 스트레이트로 끝냅니다.", "A world-class boxer who started after watching Red. Crimson rushes in with top speed, lands a triple punch, and finishes with a wall-breaking KO Straight."],
    tip: ["사거리가 3타일로 가장 짧습니다. 벽 뒤로 접근한 뒤 한 번에 붙으세요. 궁극기 게이지는 죽어도 유지되니 벽 뒤에 숨은 적에게 아껴 두세요.", "With only 3 tiles of range, approach behind walls and commit at once. The ultimate gauge survives death, so save it for enemies hiding behind walls."],
    range: 3, damage: 4000,
  },
  gold: {
    role: ["고장 지대 컨트롤러", "Malfunction Controller"], attack: ["연쇄 금광석", "Chain Gold Ore"],
    desc: ["금과 돈을 좋아하는 부자입니다. 금광석을 세 단계로 쪼개 넓은 범위를 덮고, 고장 지대로 주변 적의 공격을 막습니다.", "A wealthy gold lover. Gold splits ore in three stages to cover wide areas and shuts down nearby attacks with Malfunction Zone."],
    tip: ["첫 광석을 벽이나 적에게 맞혀야 분열이 시작됩니다. 1대1보다는 여러 적이 모인 곳에서 강하니, 고장 지대로 적의 공격을 끊는 동안 아군이 마무리하게 하세요.", "The first ore must hit a wall or enemy to split. Gold shines in crowds more than duels; shut enemies down with Malfunction Zone while allies finish them."],
    range: 8, damage: 900,
  },
  ivory: {
    role: ["지역 제어", "Area Control"], attack: ["안 녹는 아이스크림", "Unmelting Ice Cream"],
    desc: ["아이스크림을 너무 좋아해서 가게 아이스크림이 자꾸 사라지는 가게 직원입니다. 아이스크림을 던져 남는 장판으로 길목을 막습니다.", "A shop employee whose love of ice cream keeps emptying the freezer. Ivory throws ice cream that leaves zones to block lanes."],
    tip: ["적이 지나갈 길목과 수풀 입구에 장판을 깔아 두세요. 1대1 정면 승부는 약하므로 팀 싸움에서 공간을 나누는 역할에 집중하세요.", "Pre-place zones on lanes and bush entrances. Ivory is weak in head-on duels, so focus on splitting space in team fights."],
    range: 6, damage: 2000,
  },
  chartreuse: {
    role: ["변칙형 딜러", "Wildcard Damage"], attack: ["무슨 공격이지?", "What Attack?"],
    desc: ["어딘가 나사가 빠져 보이는 발명가입니다. 직접 만든 ‘샤단라’가 쏠 때마다 강화탄·CC탄·흑사병탄·무탄 중 하나가 무작위로 나갑니다.", "A slightly scatterbrained inventor. Their homemade Shadanra randomly fires an enhanced, CC, plague, or blank round every shot."],
    tip: ["탄환 UI 색으로 다음 탄을 확인하고, 무탄 차례에는 무리하지 마세요. 49% 정신 차림을 켠 6초 동안이 가장 강하게 압박할 수 있는 시간입니다.", "Check the ammo UI color for the next round and avoid committing on blanks. The six seconds of 49% Clear Mind are your strongest window."],
    range: 9.5, damage: 1200,
  },
  mint: {
    role: ["빙결 컨트롤러", "Freeze Controller"], attack: ["아이스크림 탄", "Ice Cream Bullets"],
    desc: ["차가운 아이스크림으로 적을 얼리는 베타 시즌 5 영웅 컨트롤러입니다. 3연발로 얼음 수치를 쌓아 빙결시키고, 넓은 얼음 장판으로 적을 미끄러뜨립니다.", "The Beta Season 5 Hero controller who freezes enemies with ice cream. Mint builds ice with three-round bursts and makes enemies slide on a wide ice field."],
    tip: ["세 발을 모두 맞혀야 얼음이 빨리 쌓입니다. 빙결된 2초 동안 가장 큰 피해를 몰아넣고, 장판은 적의 도주로에 까세요.", "Land all three rounds to build ice quickly. Dump your biggest damage into the two-second freeze and place the field on escape routes."],
    range: 10, damage: 2100,
  },
  azure: {
    role: ["돌격", "Diver"], attack: ["서프 대시", "Surf Dash"],
    desc: ["애저 해변의 서퍼이자 베타 시즌 6 영웅 캐릭터입니다. 파도를 타고 직접 전진하며 앞쪽을 휩쓸고, 빅 웨이브로 벽 너머까지 적을 밀어냅니다.", "A surfer from Azure Beach and the Beta Season 6 Hero fighter. Azure rides waves forward to sweep the area ahead and pushes enemies even through walls with Big Wave."],
    tip: ["서프 대시는 이동기이자 공격입니다. 벽에 막히면 대시가 끝나므로 열린 방향으로 파고드세요. 빅 웨이브는 두 번만 맞히면 다시 쓸 수 있습니다.", "Surf Dash is both movement and attack. Walls end the dash, so dive through open lanes. Big Wave is ready again after just two hits."],
    range: 4, damage: 3000,
  },
};

const characterDetails = {
  red: {
    setting: ["TV에 나오는 복싱 선수입니다. 하지만 때로는 무식해서 펀치를 잘 못 때린다는 평을 듣습니다. 크림슨이 권투를 시작하게 만든 장본인이며, 크림슨은 지금도 레드를 이길 수 없다고 말합니다.", "A boxer who appears on TV, though sometimes too reckless to land punches cleanly. Red inspired Crimson to take up boxing, and Crimson still says Red is unbeatable."],
    attack: ["사거리 5.5타일의 X자 근접 2연타입니다. 왼팔로 오른쪽, 오른팔로 왼쪽을 0.24초 간격으로 때리며 타격당 2,400, 모두 맞히면 4,800 피해를 줍니다. 공격 간격 0.55초, 탄약 1개당 재장전 0.9초입니다.", "An X-shaped two-hit melee combo with 5.5 tiles of reach. Red hits right with the left arm and left with the right arm 0.24 seconds apart for 2,400 each, 4,800 total. Cooldown 0.55s, reload 0.9s per ammo."],
    strong: ["Blue·Cyan·Purple·Pink·Crimson·Gold·Ivory·Azure 100%, Mint 87.8%, Chartreuse 83.7%", "Blue, Cyan, Purple, Pink, Crimson, Gold, Ivory, Azure 100%; Mint 87.8%; Chartreuse 83.7%"],
    weak: ["Green·Orange·Yellow 0%", "Green, Orange, Yellow 0%"],
    matchup: ["이동 배율 1.4의 빠른 발과 9,800 체력으로 원거리 캐릭터 대부분을 따라잡아 이깁니다. 반면 가까이 붙을수록 강해지는 그린의 부메랑, 오렌지의 과즙 폭발, 옐로우의 감속 앞에서는 접근하는 동안 무너집니다. 이 셋을 만나면 정면 돌진 대신 벽을 끼고 돌아 들어가세요.", "With 1.4x speed and 9,800 HP, Red runs down most ranged fighters. But Green's close-range boomerangs, Orange's juice bursts, and Yellow's slows break Red during the approach. Against those three, flank around walls instead of charging head-on."],
    history: [["초기", "최초 3개 캐릭터 중 하나로 등장", "Launch", "One of the original three characters"], ["v1.3.2", "이동 속도 상향", "v1.3.2", "Movement speed increased"], ["v1.3.9", "체력 9,800, 공격 간격 0.55초로 조정", "v1.3.9", "Adjusted to 9,800 HP and 0.55s cooldown"], ["v1.4.9", "공격 가로 범위 조정", "v1.4.9", "Horizontal attack reach adjusted"], ["v1.6.0", "일반 공격 2,200→2,400, 피격 시 궁극기 충전 2", "v1.6.0", "Basic attack 2,200→2,400; +2 ultimate charge when hit"]],
    other: ["궁극기 레드 가드는 명중 7회로 충전되며, 8초 동안 받는 피해를 60% 줄이는 보호막을 만듭니다. 시즌 6부터 피해를 받을 때마다 궁극기가 2씩 추가로 충전되므로, 맞으면서 싸울수록 보호막을 자주 켤 수 있습니다.", "The Red Guard ultimate charges after 7 hits and creates a shield that cuts damage taken by 60% for 8 seconds. Since Season 6, each hit taken adds 2 charge, so Red can shield more often the more they brawl."],
  },
  green: {
    setting: ["항구 출신이 아닌 유일한 캐릭터입니다. 평범한 시골에 살다가 돈을 벌어 이사하려고 대회에 참가했습니다.", "The only fighter not from the harbor. Green lived in an ordinary countryside village and entered the tournament to earn enough to move away."],
    attack: ["부메랑 네 개를 부채꼴로 던집니다. 한 개당 1,900 피해로 모두 맞히면 7,600입니다. 3.5타일보다 멀리 날아간 뒤에는 피해가 62.5%로 줄고, 되돌아오는 부메랑은 35% 피해를 줍니다. 사거리 7타일, 공격 간격 0.45초입니다.", "Throws four boomerangs in a fan for 1,900 each, 7,600 if all hit. Damage drops to 62.5% beyond 3.5 tiles, and returning boomerangs deal 35%. Range 7 tiles, cooldown 0.45s."],
    strong: ["Red·Pink·Crimson·Gold·Ivory·Mint·Azure 100%, Orange 90.0%, Chartreuse 80.7%", "Red, Pink, Crimson, Gold, Ivory, Mint, Azure 100%; Orange 90.0%; Chartreuse 80.7%"],
    weak: ["Blue·Yellow·Cyan·Purple 0%", "Blue, Yellow, Cyan, Purple 0%"],
    matchup: ["다가오는 근접·돌격 캐릭터에게는 최고의 카운터입니다. 가까울수록 부메랑이 모두 꽂히기 때문에 레드·크림슨·애저가 붙는 순간 녹아내립니다. 대신 7타일 밖에서 견제하는 블루·옐로우·시안·퍼플에게는 닿지 못하고 깎이기만 하니, 이들을 상대로는 은신 수풀과 벽으로 거리를 몰래 좁혀야 합니다.", "Green is the best counter to incoming melee and divers: up close every boomerang lands, so Red, Crimson, and Azure melt on contact. But Blue, Yellow, Cyan, and Purple poke from beyond 7 tiles, so Green must sneak in with Hiding Bush and walls."],
    history: [["초기", "최초 3개 캐릭터 중 하나로 등장", "Launch", "One of the original three characters"], ["v1.2.5", "부메랑 피해량 조정", "v1.2.5", "Boomerang damage adjusted"], ["v1.4.3", "부메랑 피해 950, 사거리와 판정 개선", "v1.4.3", "Set to 950 damage with range and hitbox improvements"], ["v1.4.13", "사거리 증가, 발사 각도 축소", "v1.4.13", "Range increased and spread narrowed"], ["v1.6.0", "부메랑 피해 1,000→1,900, 은신 중 공격 시 즉시 발각", "v1.6.0", "Boomerang 1,000→1,900; attacking from stealth reveals instantly"]],
    other: ["궁극기 은신 수풀은 명중 7회로 충전되며, 자기 자리에 3타일 크기의 수풀을 만들어 최대 10초 동안 숨습니다. 시즌 6부터 은신 중 공격하면 즉시 모습이 드러나므로, 첫 공격에 네 발을 모두 맞힐 거리까지 기다렸다가 쏘세요.", "The Hiding Bush ultimate charges after 7 hits and summons a 3-tile bush that hides Green for up to 10 seconds. Since Season 6, attacking reveals Green immediately, so wait until the first volley can land all four boomerangs."],
  },
  blue: {
    setting: ["평범한 일반인이지만 손 빠르기만큼은 누구에게도 지지 않는다고 합니다. 아마도요.", "An ordinary person whose hands are supposedly faster than anyone's. Probably."],
    attack: ["사거리 17.5타일, 탄속 68.75의 구슬을 직선으로 던져 1,200 피해와 1.5타일 넉백을 줍니다. 공격 간격 0.3초, 탄약 1개당 재장전 0.5초로 쉬지 않고 연사할 수 있습니다. 한 발은 약하지만 여러 발이 모이면 크게 아픕니다.", "Throws a straight marble with 17.5 range and 68.75 speed for 1,200 damage and 1.5 tiles of knockback. With a 0.3s cooldown and 0.5s reload per ammo, Blue can fire almost nonstop. One marble stings; many hurt a lot."],
    strong: ["Green·Orange·Cyan·Pink·Gold·Ivory·Chartreuse 100%, Crimson 99.8%, Mint 95.8%", "Green, Orange, Cyan, Pink, Gold, Ivory, Chartreuse 100%; Crimson 99.8%; Mint 95.8%"],
    weak: ["Red 0%, Purple 23.3%, Azure 31.5%, Yellow 33.3%", "Red 0%; Purple 23.3%; Azure 31.5%; Yellow 33.3%"],
    matchup: ["가장 긴 사거리와 넉백으로 대부분의 캐릭터를 다가오기 전에 밀어내며 이깁니다. 하지만 5,200의 낮은 체력 때문에 빠르고 단단한 레드에게는 한 번 잡히면 버티지 못합니다. 퍼플의 벽 넘는 독병, 애저의 대시, 옐로우의 감속도 거리 유지를 어렵게 만드니 항상 뒤로 빠질 길을 남겨 두세요.", "The longest range plus knockback lets Blue beat most fighters before they arrive. But with only 5,200 HP, Blue cannot survive once fast, sturdy Red catches up. Purple's wall-hopping vials, Azure's dashes, and Yellow's slows also disrupt spacing, so always keep an escape route."],
    history: [["초기", "최초 3개 캐릭터 중 하나로 등장", "Launch", "One of the original three characters"], ["v1.3.2", "공격 간격 0.3초로 조정", "v1.3.2", "Cooldown adjusted to 0.3s"], ["v1.4.3", "체력 4,800, 탄속 32로 조정", "v1.4.3", "Adjusted to 4,800 HP and 32 projectile speed"], ["v1.4.14", "전용 3D 모델과 걷기 애니메이션 적용", "v1.4.14", "Received a dedicated 3D model and walk animation"], ["v1.6.0", "구슬 피해 1,200·사거리 17.5·넉백 추가", "v1.6.0", "Marble 1,200 damage, 17.5 range, knockback added"]],
    other: ["특수 공격 돌진은 명중 3회로 충전됩니다. 1.15초 동안 빠르게 굴러가며 경로의 적에게 1,600 피해와 넉백을 주고, 벽에 부딪히면 튕겨 나갑니다. 공격보다는 체력이 낮을 때 거리를 벌리는 탈출기로 쓰는 것이 좋습니다.", "The Ricochet Dash special charges after 3 hits. Blue rolls rapidly for 1.15 seconds, dealing 1,600 damage and knockback to enemies in the path and bouncing off walls. It works best as an escape when health is low."],
  },
  orange: {
    setting: ["평범한 오렌지 농부입니다. 오직 오렌지 하나만으로 컬러스의 첫 번째 우승자가 되겠다는 꿈을 꾸고 있습니다.", "An ordinary orange farmer who dreams of becoming the first Colors champion with nothing but oranges."],
    attack: ["최대 9타일까지 오렌지를 던집니다. 오렌지가 최대 거리에 닿거나 벽에 부딪히면 과즙 5개가 사방으로 퍼지며 한 방울당 1,300 피해를 줍니다. 적에게 직접 맞히면 750 피해와 과즙 4개(5,200)가 한꺼번에 들어가 총 5,950 피해를 주고, 남은 과즙 1개만 주변으로 퍼집니다. 공식 능력 ‘광역 폭발’은 폭발 범위를 25% 늘립니다.", "Throws an orange up to 9 tiles. When it reaches max range or hits a wall, five juice drops burst outward for 1,300 each. A direct hit deals 750 plus four juice drops (5,200) at once for 5,950 total, and only the last drop splashes around. The Wide Blast ability increases blast radius by 25%."],
    strong: ["Red·Yellow·Pink·Gold·Ivory·Mint·Azure 100%, Cyan 98.6%, Crimson 94.3%, Chartreuse 91.7%", "Red, Yellow, Pink, Gold, Ivory, Mint, Azure 100%; Cyan 98.6%; Crimson 94.3%; Chartreuse 91.7%"],
    weak: ["Blue·Purple 0%, Green 10.0%", "Blue, Purple 0%; Green 10.0%"],
    matchup: ["다가오는 적에게 직격과 과즙을 한꺼번에 넣으면 순간 피해가 가장 높은 캐릭터 중 하나입니다. 그래서 레드·크림슨·애저 같은 근접 캐릭터를 강하게 받아칩니다. 체력이 4,400으로 낮아서 9타일 밖에서 쏘는 블루, 벽을 넘겨 독을 거는 퍼플에게는 닿기 전에 쓰러집니다.", "Landing the direct hit and juice together gives Orange some of the highest burst in the game, so it punishes melee fighters like Red, Crimson, and Azure. With only 4,400 HP, though, Orange falls before reaching Blue firing from beyond 9 tiles or Purple poisoning over walls."],
    history: [["v1.3.0", "네 번째 캐릭터로 정식 추가", "v1.3.0", "Added as the fourth character"], ["v1.3.2", "파편 범위 조정", "v1.3.2", "Fragment range adjusted"], ["v1.4.2", "직격 750, 파편 700으로 조정", "v1.4.2", "Adjusted to 750 direct and 700 fragment damage"], ["v1.4.10", "장전 0.5초, 폭탄 사거리 9로 개선", "v1.4.10", "Improved to 0.5s reload and 9 bomb range"], ["v1.6.0", "체력 5,800→4,400, 과즙 피해 700→1,300", "v1.6.0", "HP 5,800→4,400; juice damage 700→1,300"]],
    other: ["본 게임에서는 궁극기가 없습니다. 궁극기 ‘오렌지 껍질 회수’는 베타 테스트에서만 시험 중입니다. 시즌 6에서 체력이 5,800에서 4,400으로 줄어든 대신 과즙 피해가 700에서 1,300으로 크게 올랐습니다.", "Orange has no ultimate in the main game; Returning Peels is still in beta testing. Season 6 cut health from 5,800 to 4,400 but raised juice damage from 700 to 1,300."],
  },
  yellow: {
    setting: ["평범한 전기 기술자입니다. 월세를 벌기 위해 대회에 참가했습니다.", "An ordinary electrician who joined the tournament to pay rent."],
    attack: ["사거리 12타일의 전기구슬을 0.3초 간격으로 날려 2,200 피해를 주고, 맞은 적의 이동속도를 2초 동안 25% 줄입니다. 탄약 1개당 재장전은 0.9초입니다.", "Fires electric orbs with 12-tile range every 0.3 seconds for 2,200 damage, slowing the target by 25% for 2 seconds. Reload is 0.9s per ammo."],
    strong: ["Red·Green·Pink·Gold·Ivory·Mint 100%, Chartreuse 84.7%, Azure 67.3%, Blue 66.7%", "Red, Green, Pink, Gold, Ivory, Mint 100%; Chartreuse 84.7%; Azure 67.3%; Blue 66.7%"],
    weak: ["Orange·Crimson 0%, Cyan 2.7%, Purple 9.7%", "Orange, Crimson 0%; Cyan 2.7%; Purple 9.7%"],
    matchup: ["감속 덕분에 접근해야 하는 레드·그린과 느린 캐릭터들을 멀리서 붙잡아 둡니다. 반대로 한 번에 큰 피해를 주는 오렌지와 크림슨, 넓은 탄막으로 구슬 싸움을 이기는 시안, 독으로 꾸준히 깎는 퍼플에게는 크게 밀립니다. 이들 앞에서는 전기 회로로 길목을 먼저 막아 두세요.", "Yellow's slow pins Red, Green, and slower fighters at range. It loses badly to Orange's and Crimson's burst, Cyan's wide barrage, and Purple's steady poison. Against them, block lanes with Electric Circuit first."],
    history: [["v1.3.7", "다섯 번째 캐릭터로 추가", "v1.3.7", "Added as the fifth character"], ["v1.3.9", "사거리 12, 감속 1.5초로 조정", "v1.3.9", "Adjusted to 12 range and 1.5s slow"], ["v1.4.3", "피해량 2,400으로 조정", "v1.4.3", "Damage adjusted to 2,400"], ["v1.4.4", "감전 시각 효과 강화", "v1.4.4", "Enhanced electric hit effects"], ["v1.6.0", "공격 간격 0.3초, 궁극기 전기 회로 출시", "v1.6.0", "0.3s cooldown; Electric Circuit ultimate released"]],
    other: ["궁극기 전기 회로는 명중 2회로 충전됩니다. 장치를 목표 지점에 던져 0.35초 뒤 설치하며 최대 4개까지 깔 수 있습니다. 장치가 2개 이상일 때 일반 공격으로 장치를 맞히면 3초 동안 설치 순서대로 전기가 흘러 연결 구간마다 1,200 피해를 줍니다.", "The Electric Circuit ultimate charges after 2 hits. Yellow throws a device that installs after 0.35 seconds, up to four at once. With two or more placed, hitting one with a basic attack sends current through them in order for 3 seconds, dealing 1,200 per connected segment."],
  },
  cyan: {
    setting: ["평범하게 사는 컬러지만 아무래도 수상합니다. 그가 다니던 회사의 제품은 다 이상했던 걸까요?", "A seemingly ordinary Color who is somehow suspicious. Were all of their former company's products this strange?"],
    attack: ["압축 알약 여섯 발을 나란히 퍼지게 쏩니다. 사거리 8.33타일, 한 발당 650 피해로 모두 맞히면 3,900입니다. 공격 간격 0.35초, 탄약 1개당 재장전 0.8초입니다.", "Fires six compressed pills in a spread. Range 8.33 tiles, 650 damage each, 3,900 if all hit. Cooldown 0.35s, reload 0.8s per ammo."],
    strong: ["Green·Pink·Crimson·Ivory·Mint·Azure 100%, Yellow 97.3%, Chartreuse 83.9%", "Green, Pink, Crimson, Ivory, Mint, Azure 100%; Yellow 97.3%; Chartreuse 83.9%"],
    weak: ["Red·Blue·Purple·Gold 0%, Orange 1.4%", "Red, Blue, Purple, Gold 0%; Orange 1.4%"],
    matchup: ["넓은 탄막이 피하기 어려워 다가오는 크림슨·애저·그린과 구슬을 쏘는 옐로우를 이깁니다. 사거리가 8.33타일로 중간이라 블루·퍼플에게는 닿지 못하고, 체력 9,800의 레드는 탄막을 맞으면서도 뚫고 들어옵니다. 골드의 고장 지대 안에서는 공격 자체가 막히니 장판 밖으로 먼저 빠지세요.", "The wide barrage is hard to dodge, beating incoming Crimson, Azure, and Green as well as orb-trading Yellow. With mid-range reach, Cyan cannot touch Blue or Purple, and 9,800-HP Red pushes straight through the barrage. Inside Gold's Malfunction Zone Cyan cannot attack at all, so step out first."],
    history: [["v1.4.0", "여섯 번째 캐릭터로 추가", "v1.4.0", "Added as the sixth character"], ["v1.4.4", "광역 제압 역할과 효과 개선", "v1.4.4", "Improved area-control role and effects"], ["v1.4.8", "알파 시즌 4 전환과 함께 조정", "v1.4.8", "Adjusted with the Alpha Season 4 transition"], ["현재", "질풍 강타 궁극기와 전용 버튼 지원", "Current", "Supports the Gale Strike ultimate and dedicated control"], ["v1.6.0", "궁극기 피해 2,600→3,120", "v1.6.0", "Ultimate damage 2,600→3,120"]],
    other: ["궁극기 질풍 강타는 명중 10회로 충전되며, 전방 10타일까지 거대한 강풍을 쏘아 3,120 피해를 주고 적을 8타일 밀어냅니다. 자기장 가장자리나 벽 쪽으로 밀어낼 때 가장 위협적입니다.", "The Gale Strike ultimate charges after 10 hits, firing a huge gust up to 10 tiles for 3,120 damage and 8 tiles of knockback. It is most dangerous when pushing enemies into the zone edge or walls."],
  },
  purple: {
    setting: ["향수 가게 사장님이자 의사 자격증을 가진 컬러입니다. 가게가 잘 되는 덕분인지는 몰라도 그녀의 독침은 꽤나 아픕니다.", "A perfume-shop owner with a medical license. Whether or not it's thanks to her thriving shop, her needles really hurt."],
    attack: ["첫 공격은 독침 세 발을 -12도·0도·+12도로 쏩니다. 사거리 13타일, 한 발당 1,100 피해를 주고 4초 동안 초당 912의 독 피해를 남깁니다. 다음 공격은 벽을 넘어가는 독병을 11타일까지 던져 반경 4타일에 3,240 피해를 줍니다. 두 공격이 번갈아 나갑니다.", "The first attack fires three needles at -12, 0, and +12 degrees: 13-tile range, 1,100 each, plus 912 poison damage per second for 4 seconds. The next throws a vial over walls up to 11 tiles for 3,240 damage in a 4-tile radius. The two alternate."],
    strong: ["Green·Orange·Cyan·Gold·Ivory·Mint 100%, Chartreuse 91.7%, Yellow 90.3%, Blue 76.7%, Azure 63.0%", "Green, Orange, Cyan, Gold, Ivory, Mint 100%; Chartreuse 91.7%; Yellow 90.3%; Blue 76.7%; Azure 63.0%"],
    weak: ["Red·Pink 0%, Crimson 4.2%", "Red, Pink 0%; Crimson 4.2%"],
    matchup: ["13타일 독침과 벽 넘는 독병으로 원거리 싸움에서는 블루까지 이기는 강자입니다. 하지만 체력이 높고 빠르게 붙는 레드·크림슨, 회복하며 버티는 핑크에게는 독이 쌓이기 전에 쓰러집니다. 이들이 보이면 독침을 건 뒤 곧바로 물러나세요.", "With 13-tile needles and wall-hopping vials, Purple wins ranged duels even against Blue. But high-health, fast Red and Crimson, and self-sustaining Pink, take her down before poison stacks. When they appear, poison and retreat immediately."],
    history: [["v1.4.3", "독침과 약병을 쓰는 캐릭터로 추가", "v1.4.3", "Added with alternating needle and vial attacks"], ["v1.4.6", "약병 폭발 범위 하향", "v1.4.6", "Vial blast radius reduced"], ["v1.4.10", "체력 6,000, 사거리 13으로 개선", "v1.4.10", "Improved to 6,000 HP and 13 range"], ["현재", "독 지속 피해와 약병 마무리 구조 유지", "Current", "Retains poison pressure and vial-finisher flow"], ["v1.6.0", "독침 1,100, 독 초당 912, 독병 3,240", "v1.6.0", "Needle 1,100, poison 912/s, vial 3,240"]],
    other: ["본 게임에서는 궁극기가 없습니다. 궁극기 ‘독성 대도약’은 베타 시즌 7 테스트에서만 시험 중입니다. 공식 능력 ‘광각 독침’으로 독침이 세 방향으로 퍼집니다.", "Purple has no ultimate in the main game; Toxic Leap is being tested in Beta Season 7. The Wide Needle ability spreads needles in three directions."],
  },
  pink: {
    setting: ["음악을 좋아하는 스트리머입니다. 음악이 너무 좋아 돈벌이를 잊어버리는 바람에, 돈을 벌려고 대회에 나갔다가 우승까지 해 버렸습니다.", "A music-loving streamer who forgot to make money because of music, entered the tournament to earn some, and ended up winning."],
    attack: ["자신을 중심으로 음표를 원형으로 퍼뜨립니다. 반경 4.5타일 안의 적에게 2,000 피해를 주고, 아군은 1,400 회복시킵니다. 공격 간격 0.3초, 탄약 1개당 재장전 0.8초이며 이동 배율 1.3으로 빠릅니다.", "Spreads notes in a circle around Pink, dealing 2,000 damage to enemies within 4.5 tiles and healing allies for 1,400. Cooldown 0.3s, reload 0.8s per ammo, and a fast 1.3x move speed."],
    strong: ["Purple·Gold·Ivory 100%, Chartreuse 47.0%(경합)", "Purple, Gold, Ivory 100%; Chartreuse 47.0% (even)"],
    weak: ["Red·Green·Blue·Orange·Yellow·Cyan·Crimson·Mint 0%, Azure 8.3%", "Red, Green, Blue, Orange, Yellow, Cyan, Crimson, Mint 0%; Azure 8.3%"],
    matchup: ["1대1 상성표에서는 가장 약한 캐릭터입니다. 시뮬레이션에 아군이 없어 회복과 앙코르 부활이 전혀 계산되지 않았기 때문입니다. 혼자서는 지속 피해형인 퍼플, 느린 골드·아이보리만 확실히 이깁니다. 팀전에서는 아군과 함께 붙어 다니며 회복과 부활로 가치를 만드는 캐릭터입니다.", "Pink is the weakest fighter in the 1v1 table because the simulation has no allies, so healing and Encore revives never count. Alone, Pink reliably beats only Purple's damage-over-time and slow Gold and Ivory. In team modes, stick with allies and create value through healing and revives."],
    history: [["v1.4.6", "여덟 번째 기본 캐릭터로 추가", "v1.4.6", "Added as the eighth base character"], ["v1.4.7", "기타 모델과 음파 효과 개선", "v1.4.7", "Improved guitar model and sound-wave effects"], ["v1.4.10", "추가 범위 보너스 조정", "v1.4.10", "Adjusted bonus attack range"], ["현재", "체력 11,500의 최고 체력 캐릭터", "Current", "Highest-health character at 11,500 HP"], ["v1.6.0", "체력 10,500→9,000, 음표 피해 2,000", "v1.6.0", "HP 10,500→9,000; note damage 2,000"]],
    other: ["궁극기 앙코르!는 명중 12회로 충전됩니다. 반경 8타일 안의 모든 아군에게 12초 동안 부활 효과를 주고, 효과를 받은 아군이 쓰러지면 그 자리에서 체력 40%와 2초 무적으로 되살아납니다.", "The Encore! ultimate charges after 12 hits. It grants every ally within 8 tiles a revive effect for 12 seconds; an ally who falls under it revives on the spot with 40% health and 2 seconds of invulnerability."],
  },
  crimson: {
    setting: ["레드를 보고 권투를 시작해 세계적인 권투 선수가 되었습니다. 그런데 정작 자기는 레드를 못 이긴다고 합니다. 베타 시즌 1에 영웅 등급으로 합류했습니다.", "Crimson took up boxing after watching Red and became a world-class boxer, yet insists they still can't beat Red. Joined as a Hero fighter in Beta Season 1."],
    attack: ["전방 84도 부채꼴에 -25도·0도·+25도 순서로 0.12초 간격 3연속 펀치를 넣습니다. 한 대당 약 1,333, 모두 맞히면 4,000 피해이며 범위 안의 적을 모두 때립니다. 사거리 3타일, 공격 간격 0.74초, 이동 배율 1.4입니다.", "Throws three punches at -25, 0, and +25 degrees within an 84-degree fan, 0.12 seconds apart. About 1,333 each, 4,000 total, hitting every enemy in the arc. Range 3 tiles, cooldown 0.74s, 1.4x move speed."],
    strong: ["Yellow·Pink 100%, Ivory 99.0%, Purple 95.8%, Chartreuse 93.1%, Gold 72.5%", "Yellow, Pink 100%; Ivory 99.0%; Purple 95.8%; Chartreuse 93.1%; Gold 72.5%"],
    weak: ["Red·Green·Cyan·Azure 0%, Blue 0.2%, Orange 5.7%, Mint 9.3%", "Red, Green, Cyan, Azure 0%; Blue 0.2%; Orange 5.7%; Mint 9.3%"],
    matchup: ["10,500 체력과 빠른 발로 옐로우·퍼플·아이보리처럼 체력이 낮은 원거리 캐릭터를 따라잡아 끝냅니다. 설정처럼 레드는 정말 이기지 못하고, 가까이 올수록 강해지는 그린·오렌지·애저, 넓은 탄막의 시안, 빙결시키는 민트에게도 접근하는 동안 무너집니다. 블루에게는 넉백 때문에 닿기조차 어렵습니다.", "With 10,500 HP and top speed, Crimson runs down fragile ranged fighters like Yellow, Purple, and Ivory. True to the lore, Crimson really can't beat Red, and also collapses on approach against close-range Green, Orange, and Azure, Cyan's wide barrage, and Mint's freezes. Blue's knockback keeps Crimson from even reaching."],
    history: [["v1.5.0", "베타 시즌 1 신규 영웅 캐릭터로 추가", "v1.5.0", "Added as the Beta Season 1 Hero-tier character"], ["v1.6.0", "체력 10,500, 궁극기 5,400 피해·충전 7", "v1.6.0", "HP 10,500; ultimate 5,400 damage, 7 charge"]],
    other: ["궁극기 KO 스트레이트는 명중 7회로 충전되며, 정면 6×6 범위에 5,400 피해와 넉백을 주고 범위 안의 벽을 영구히 부숩니다. 궁극기 게이지는 죽어도 초기화되지 않습니다. 봇 크림슨은 체력이 절반 아래여도 계속 추격하고 날아오는 탄환을 좌우로 피합니다.", "The KO Straight ultimate charges after 7 hits, dealing 5,400 damage and knockback in a 6x6 area ahead and permanently destroying walls inside it. The gauge is kept on death. Bot Crimson keeps chasing below half health and sidesteps incoming projectiles."],
  },
  gold: {
    setting: ["금을 좋아하는 부자 컬러입니다. 돈을 좋아하는데, 어째서인지 자꾸 오렌지에게 눈치를 줍니다. 베타 시즌 2의 전설 등급 캐릭터입니다.", "A rich Color who loves gold and money, and for some reason keeps side-eyeing Orange. The Legendary fighter of Beta Season 2."],
    attack: ["2×2 크기의 금광석을 8타일 앞으로 1.5초 간격으로 던집니다. 광석이 부딪히면 900 피해와 1.5타일 범위 피해를 주고 좌우로 분열하며(각 450, 사거리 8), 분열탄은 다시 금괴 여섯 개로 갈라집니다(각 225, 사거리 6). 같은 단계는 한 대상에게 한 번만 맞습니다.", "Throws a 2x2 gold ore 8 tiles ahead every 1.5 seconds. On impact it deals 900 with a 1.5-tile splash and splits sideways (450 each, 8 range), then each fragment breaks into six gold bars (225 each, 6 range). Each stage hits a target only once."],
    strong: ["Cyan 100%", "Cyan 100%"],
    weak: ["Red·Green·Blue·Orange·Yellow·Purple·Pink·Ivory·Mint 0%, Azure 2.5%, Chartreuse 8.7%, Crimson 27.5%", "Red, Green, Blue, Orange, Yellow, Purple, Pink, Ivory, Mint 0%; Azure 2.5%; Chartreuse 8.7%; Crimson 27.5%"],
    matchup: ["시즌 6에서 단계 피해가 크게 줄어 1대1 상성은 매우 나쁩니다. 확실히 이기는 상대는 고장 지대 안에서 공격이 막히는 시안뿐입니다. 대신 투사체로 받는 피해를 650씩 덜 받고 7,500 체력으로 버티므로, 여러 명이 뒤엉킨 전장에서 분열탄으로 넓게 깎고 고장 지대로 적의 공격을 끊는 역할을 맡으세요.", "Season 6 sharply cut stage damage, so Gold's 1v1 matchups are very poor; the only sure win is Cyan, who cannot attack inside Malfunction Zone. In exchange, Gold takes 650 less from each projectile and has 7,500 HP, so play the brawler in crowded fights: chip wide with splits and cut off attacks with the zone."],
    history: [["v1.5.2", "베타 시즌 2 신규 전설 캐릭터", "v1.5.2", "Added as the Beta Season 2 Legendary fighter"], ["v1.6.0", "체력 7,500, 단계 피해 900/450/225, 궁극기 충전 6", "v1.6.0", "HP 7,500; stage damage 900/450/225; 6 ultimate charge"]],
    other: ["궁극기 고장 지대는 단계별 적중으로 6 충전되며, 한 번의 공격으로 얻는 충전은 최대 6입니다. 발동하면 반경 6타일 장판이 4초 동안 골드를 따라다니며, 안에 있는 적은 공격할 수 없고 이동속도가 50% 줄어듭니다.", "The Malfunction Zone ultimate needs 6 charge from stage hits, with at most 6 per attack. It creates a 6-tile field that follows Gold for 4 seconds; enemies inside cannot attack and move 50% slower."],
  },
  ivory: {
    setting: ["아이스크림 가게 직원입니다. 그런데 아이스크림을 너무 좋아해서 가게 아이스크림이 자꾸 사라집니다. 베타 시즌 3에 합류했습니다.", "An ice cream shop employee who loves ice cream so much that the shop's stock keeps disappearing. Joined in Beta Season 3."],
    attack: ["최대 6타일까지 아이스크림을 던집니다. 착탄 시 2,000 피해를 주고, 반경 2.5타일에 4초 동안 0.5초마다 2,000 피해를 주는 장판을 남깁니다. 장판 피해는 중첩되지 않습니다. 공격 간격 0.7초, 탄약 1개당 재장전 0.9초입니다.", "Throws ice cream up to 6 tiles. It deals 2,000 on impact and leaves a 2.5-tile zone that deals 2,000 every 0.5 seconds for 4 seconds. Zone damage does not stack. Cooldown 0.7s, reload 0.9s per ammo."],
    strong: ["Gold 100%", "Gold 100%"],
    weak: ["Red·Green·Blue·Orange·Yellow·Cyan·Purple·Pink·Chartreuse·Mint 0%, Crimson 1.0%, Azure 34.5%", "Red, Green, Blue, Orange, Yellow, Cyan, Purple, Pink, Chartreuse, Mint 0%; Crimson 1.0%; Azure 34.5%"],
    matchup: ["1대1에서는 골드만 확실히 이깁니다. 사거리가 6타일로 짧고 체력이 6,000이라, 장판을 밟지 않고 피해 가는 상대에게는 정면 승부가 어렵습니다. 애저만 대시 경로가 장판과 겹쳐 비교적 해볼 만합니다. 적이 반드시 지나가야 하는 좁은 길목과 목표 지점을 장판으로 막아 팀의 공간을 지켜 주세요.", "In duels Ivory reliably beats only Gold. With 6-tile range and 6,000 HP, head-on fights against enemies who dodge the zone are hard; only Azure, whose dash paths cross zones, is a closer fight. Block narrow lanes and objectives enemies must cross to hold space for the team."],
    history: [["v1.5.3", "베타 시즌 3 신규 플레이어블 캐릭터로 추가", "v1.5.3", "Added as a new playable fighter in Beta Season 3"], ["v1.6.0", "사거리 6, 피해 2,000, 장판 0.5초 틱, 궁극기 충전 3", "v1.6.0", "Range 6, 2,000 damage, 0.5s zone tick, 3 ultimate charge"]],
    other: ["궁극기 단체 주문은 명중 3회로 충전되며, 최대 20타일 떨어진 목표 지점의 중앙과 대각선 네 방향에 아이스크림 5개를 한꺼번에 던집니다. 넓은 지역을 한 번에 장판으로 덮을 수 있습니다.", "The Group Order ultimate charges after 3 hits and throws five ice creams at once, at the center and four diagonals of a point up to 20 tiles away, covering a wide area in zones."],
  },
  chartreuse: {
    setting: ["어딘가 나사가 빠지고 멍청해 보이는 캐릭터입니다. 하지만 그가 만든 ‘샤단라’는 늘 이런 식이라서, 본인에게는 평범한 무기입니다. 베타 시즌 4의 영웅 캐릭터입니다.", "Seems a bit scatterbrained, but the Shadanra they built always works like this, so to them it's perfectly normal. The Hero fighter of Beta Season 4."],
    attack: ["사거리 9.5타일, 3×3 판정의 탄환을 쏠 때마다 네 가지 중 하나가 무작위로 나갑니다. 강화탄은 2,400 피해, CC탄은 둔화·고장·발각·독·넉백·빙결 중 하나, 흑사병탄은 즉사, 무탄은 피해가 없습니다. 공격 간격 0.55초, 탄약 1개당 재장전 1.2초입니다.", "Each shot (9.5-tile range, 3x3 hitbox) is one of four random rounds: enhanced deals 2,400, CC applies slow, malfunction, reveal, poison, knockback, or freeze, plague executes, and blank does nothing. Cooldown 0.55s, reload 1.2s per ammo."],
    strong: ["Ivory 100%, Gold 91.3%, Mint 68.8%, Pink 53.0%(경합)", "Ivory 100%; Gold 91.3%; Mint 68.8%; Pink 53.0% (even)"],
    weak: ["Blue 0%, Crimson 6.9%, Orange·Purple 8.3%, Yellow 15.3%, Cyan 16.1%, Red 16.3%, Green 19.3%, Azure 42.3%", "Blue 0%; Crimson 6.9%; Orange, Purple 8.3%; Yellow 15.3%; Cyan 16.1%; Red 16.3%; Green 19.3%; Azure 42.3%"],
    matchup: ["결과가 운에 달려 있어 대부분의 상대에게 15~20% 정도의 역전 가능성을 남깁니다. 흑사병탄 한 방이면 누구든 쓰러뜨릴 수 있기 때문입니다. 느린 아이보리·골드와 민트에게는 강하지만, 사거리 밖에서 쏘는 블루에게는 한 발도 닿지 않습니다. 49% 정신 차림으로 무탄을 없앤 6초 안에 승부를 거세요.", "Results depend on luck, leaving a 15-20% upset chance against most opponents because one plague round can drop anyone. Chartreuse beats slow Ivory, Gold, and Mint, but never reaches Blue firing from out of range. Force the fight during the six blank-free seconds of 49% Clear Mind."],
    history: [["v1.5.4", "베타 시즌 4 신규 영웅 캐릭터로 추가", "v1.5.4", "Added as the new Hero fighter for Beta Season 4"], ["v1.6.0", "탄환 판정 3×3, 궁극기 충전 7→4", "v1.6.0", "3x3 hitbox; ultimate charge 7→4"]],
    other: ["궁극기 49% 정신 차림은 명중 4회로 충전되며, 6초 동안 무탄이 사라지고 나머지 세 탄환이 같은 확률로 나옵니다. 시즌 6부터 다른 캐릭터의 투사체는 5×5 판정이지만 샤르트뢰즈만 3×3 전용 판정을 씁니다.", "The 49% Clear Mind ultimate charges after 4 hits; for 6 seconds blank rounds disappear and the other three appear at equal rates. Since Season 6, other projectiles use a 5x5 hitbox while Chartreuse keeps a dedicated 3x3."],
  },
  mint: {
    setting: ["놀이공원 아이스크림 가판대에서 온 베타 시즌 5의 영웅 컨트롤러입니다. 차가운 아이스크림으로 적의 발을 묶어 전장의 흐름을 멈춥니다.", "The Beta Season 5 Hero controller from an amusement-park ice cream stand, stopping the flow of battle by freezing enemies in place."],
    attack: ["아이스크림 탄 3발을 0.12초 간격으로 연속 발사합니다. 한 발당 700 피해, 사거리 10타일이며 적중할 때마다 얼음 수치가 25 쌓입니다. 얼음 수치가 100이 되면 대상은 2초 동안 빙결되어 이동·공격·궁극기를 쓸 수 없습니다. 공격 간격 0.75초, 탄약 1개당 재장전 1.15초입니다.", "Fires three ice cream bullets 0.12 seconds apart for 700 each up to 10 tiles, adding 25 ice per hit. At 100 ice the target freezes for 2 seconds and cannot move, attack, or use its ultimate. Cooldown 0.75s, reload 1.15s per ammo."],
    strong: ["Pink·Gold·Ivory 100%, Azure 94.3%, Crimson 90.7%", "Pink, Gold, Ivory 100%; Azure 94.3%; Crimson 90.7%"],
    weak: ["Green·Orange·Yellow·Cyan·Purple 0%, Blue 4.2%, Red 12.2%, Chartreuse 31.2%", "Green, Orange, Yellow, Cyan, Purple 0%; Blue 4.2%; Red 12.2%; Chartreuse 31.2%"],
    matchup: ["빙결로 돌진을 끊을 수 있어 애저·크림슨처럼 한 방향으로 달려드는 캐릭터에게 강합니다. 하지만 얼음 네 번을 쌓기 전에 피해를 몰아넣는 그린·오렌지, 더 먼 거리에서 쏘는 블루·옐로우·시안·퍼플에게는 빙결을 걸기도 전에 밀립니다.", "Freezes stop dives, so Mint is strong against straight-line attackers like Azure and Crimson. But Green and Orange burst Mint down before four ice stacks land, and Blue, Yellow, Cyan, and Purple outrange Mint before any freeze happens."],
    history: [["v1.5.5", "베타 시즌 5 신규 영웅 캐릭터로 추가, 얼음·빙결·장판 누락 보완", "v1.5.5", "Added as the Beta Season 5 Hero fighter; missing ice, freeze, and field features restored"], ["v1.6.0", "장판 초당 피해 300→450", "v1.6.0", "Field damage per second 300→450"]],
    other: ["특수 공격 아이스크림 장판은 명중 7회로 충전됩니다. 10타일 앞에 반경 9타일 장판을 10초 동안 만들며, 위에 있는 적은 매초 450 피해와 얼음 수치 5를 받고 장판 바깥쪽으로 점점 빠르게 미끄러집니다. Space/Q 또는 궁극기 버튼으로 사용합니다.", "The Ice Cream Field special charges after 7 hits. It creates a 9-tile field 10 tiles ahead for 10 seconds; enemies on it take 450 damage and 5 ice per second while sliding outward ever faster. Use it with Space/Q or the ultimate button."],
  },
  azure: {
    setting: ["애저 해변의 서퍼입니다. 파도를 타고 곧장 적진으로 파고드는 베타 시즌 6의 영웅 캐릭터입니다.", "A surfer from Azure Beach and the Beta Season 6 Hero fighter who rides waves straight into enemy lines."],
    attack: ["파도를 타고 앞으로 2타일 이동하며, 앞쪽 길이 4타일·폭 2타일 범위의 적에게 3,000 피해를 줍니다. 한 번의 대시에서 같은 대상은 한 번만 맞고, 벽에 막히면 벽을 통과하지 않고 대시가 끝납니다. 공격 간격 0.2초, 탄약 1개당 재장전 0.65초입니다.", "Rides a wave two tiles forward, dealing 3,000 to enemies in a 4-by-2-tile area ahead. Each dash hits a target once and ends at walls. Cooldown 0.2s, reload 0.65s per ammo."],
    strong: ["Crimson 100%, Gold 97.5%, Pink 91.7%, Blue 68.5%, Ivory 65.5%, Chartreuse 57.7%", "Crimson 100%; Gold 97.5%; Pink 91.7%; Blue 68.5%; Ivory 65.5%; Chartreuse 57.7%"],
    weak: ["Red·Green·Orange·Cyan 0%, Mint 5.7%, Yellow 32.7%, Purple 37.0%", "Red, Green, Orange, Cyan 0%; Mint 5.7%; Yellow 32.7%; Purple 37.0%"],
    matchup: ["연속 대시로 순식간에 거리를 좁혀 크림슨·골드·핑크를 이기고, 블루도 대시로 추격해 잡을 수 있습니다. 반대로 붙는 순간 큰 피해를 돌려주는 레드·그린·오렌지, 넓은 탄막의 시안, 대시를 빙결로 끊는 민트에게는 정면으로 들어가면 집니다. 이들 앞에서는 빅 웨이브로 먼저 밀어낸 뒤 들어가세요.", "Chained dashes close gaps instantly, beating Crimson, Gold, and Pink and even catching Blue. But Red, Green, and Orange punish contact, Cyan's barrage covers the approach, and Mint freezes the dash, so diving straight in loses. Push them with Big Wave before committing."],
    history: [["v1.6.0", "베타 시즌 6 신규 영웅 캐릭터로 추가, 체력 10,500·재장전 0.65초로 출시", "v1.6.0", "Added as the Beta Season 6 Hero fighter, launching with 10,500 HP and a 0.65s reload"]],
    other: ["궁극기 빅 웨이브는 명중 2회로 충전되며, 폭 4타일의 큰 파도를 전방 6타일까지 보내 4,800 피해와 강한 넉백을 줍니다. 파도만 전진하고 애저 본인은 움직이지 않으며, 벽을 관통합니다. 시즌 스킨 ‘프로 서퍼 애저’가 함께 출시되었습니다.", "The Big Wave ultimate charges after 2 hits, sending a 4-tile-wide wave 6 tiles forward for 4,800 damage and heavy knockback. Only the wave moves, and it passes through walls. The Pro Surfer Azure skin launched alongside."],
  },
};

const guides = [
  { id:"beta6", icon:"β6", title:["베타 시즌 6", "Beta Season 6"], desc:["v1.6.0 바다·여름 해변 업데이트", "The v1.6.0 ocean and summer-beach update"], body:["베타 시즌 6는 2026년 9월 21일 18:00 KST에 시작했습니다. 신규 영웅 애저, 옐로우 궁극기 전기 회로, 3대3 축구 모드 SOCCER KICK, 애저 해변 로비와 14종 전체 밸런스 조정을 포함합니다.", "Beta Season 6 began on September 21, 2026 at 18:00 KST. It adds the Hero fighter Azure, Yellow's Electric Circuit ultimate, the 3v3 SOCCER KICK mode, the Azure Beach lobby, and a full 14-fighter balance pass."], sections:[[["애저", "Azure"], ["서프 대시로 직접 전진하며 3,000 피해를 주고, 빅 웨이브로 벽 너머까지 넉백을 줍니다.", "Surf Dash moves Azure forward for 3,000 damage, and Big Wave knocks enemies back even through walls."]], [["SOCCER KICK", "SOCCER KICK"], ["3대3, 3분 제한, 2골 선승 축구 모드입니다. 전용 60×80 경기장과 매칭 대기열을 사용합니다.", "A 3v3 soccer mode with a three-minute limit where the first team to two goals wins, played in a dedicated 60x80 arena with its own queue."]], [["밸런스", "Balance"], ["모든 일반 투사체 판정을 5×5로 통일했고(샤르트뢰즈는 3×3), 캐릭터별 봇이 전용 공격·궁극기·회피 행동을 사용합니다.", "All basic projectiles now use a 5x5 hitbox (Chartreuse uses 3x3), and bots use character-specific attacks, ultimates, and evasion."]], [["바다 테마", "Ocean theme"], ["애저 해변 로비, 시즌 음악 High Noon Tide, 전용 로딩 화면과 상어·복어·파도 소품이 추가되었습니다.", "Adds the Azure Beach lobby, the High Noon Tide track, a dedicated loading screen, and shark, pufferfish, and wave cosmetics."]]] },
  { id:"soccer", icon:"⚽", title:["사커 킥", "Soccer Kick"], desc:["공을 차 2골을 먼저 넣는 3대3 모드", "A 3v3 mode where the first team to two goals wins"], body:["공을 공격하면 공격 방향으로 공이 날아갑니다. 아군에게 패스하거나 상대 골대로 슛해 득점하세요. 공은 벽에 맞으면 반사됩니다. 캐릭터는 사망해도 잠시 후 자기 진영에서 부활합니다.", "Attacking the ball sends it in the attack direction. Pass to allies or shoot at the enemy goal. The ball bounces off walls, and defeated fighters respawn on their own side after a short delay."], sections:[[["승리 조건", "Win condition"], ["먼저 2골을 넣은 팀이 즉시 승리합니다. 3분이 끝났을 때 0:0 또는 1:1이면 연장전에 들어가며, 연장전에서는 먼저 골을 넣은 팀이 승리합니다.", "The first team to score two goals wins immediately. If the score is 0-0 or 1-1 after three minutes, overtime begins and the next goal wins."]], [["경기 흐름", "Match flow"], ["킥오프와 득점 직후 3초 동안 경기가 멈추며, 득점 시 카메라가 골대를 비춥니다. 같은 팀에게는 조준·피해가 적용되지 않습니다.", "Play pauses for three seconds at kickoff and after each goal, and the camera shows the scoring goal. Aim assist and damage never affect teammates."]], [["매칭", "Matchmaking"], ["전용 대기열은 최대 6명을 받고, 빈자리는 AI로 채웁니다. 전적은 다른 모드와 합산하지 않고 따로 기록합니다.", "The dedicated queue takes up to six players and fills empty slots with AI. Results are recorded separately from other modes."]]] },
  { id:"beta5", icon:"β5", title:["베타 시즌 5", "Beta Season 5"], desc:["v1.5.5 놀이공원 테마 업데이트", "The v1.5.5 amusement-park update"], body:["베타 시즌 5는 2026년 9월 7일 18:00 KST에 시작했습니다. 놀이공원 테마와 신규 영웅 민트, 블루의 특수 공격 돌진을 추가했습니다.", "Beta Season 5 began on September 7, 2026 at 18:00 KST, adding an amusement-park theme, the Hero fighter Mint, and Blue's Ricochet Dash special."], sections:[[["민트", "Mint"], ["아이스크림 탄 3연발로 얼음 수치를 쌓아 빙결시키고, 아이스크림 장판으로 적을 미끄러뜨립니다.", "Mint builds ice with three-round bursts to freeze enemies and makes them slide with Ice Cream Field."]], [["블루 돌진", "Blue's Ricochet Dash"], ["블루가 적중으로 충전한 돌진으로 빠르게 위치를 바꾸며 피해를 줄 수 있습니다.", "Blue can charge Ricochet Dash through hits to reposition quickly while dealing damage."]], [["테마", "Theme"], ["관람차·회전목마가 있는 놀이공원 로비, 시즌 음악 Clockwork Midway와 솜사탕 핑크 스킨이 추가되었습니다.", "Adds an amusement-park lobby with a Ferris wheel and carousel, the Clockwork Midway track, and the Cotton Candy Pink skin."]]] },
  { id:"beta4", icon:"β4", title:["베타 시즌 4", "Beta Season 4"], desc:["v1.5.4 도시 테마 업데이트", "The v1.5.4 urban-theme update"], body:["베타 시즌 4는 샤르트뢰즈, 레드 가드, 도시형 쇼다운과 도시 봉쇄 작전을 추가했습니다. 회색 빌딩 벽과 아스팔트·콘크리트 바닥을 사용하며 수풀은 등장하지 않습니다.", "Beta Season 4 adds Chartreuse, Red Guard, urban Showdown, and City Lockdown. Its battlefield uses gray building walls with asphalt and concrete floors and contains no bushes."], sections:[[["신규 전투 콘텐츠", "New combat content"], ["샤르트뢰즈의 무작위 탄환 4종과 ‘49% 정신 차림’, 레드의 8초 보호막 궁극기 ‘레드 가드’가 추가되었습니다.", "Added Chartreuse's four random rounds and 49% Focus plus Red's eight-second Red Guard shield."]], [["도시 쇼다운", "Urban Showdown"], ["수풀이 없는 도시 전장에서는 빌딩 벽, 사거리와 시야 관리가 핵심입니다.", "Without bushes, the urban arena emphasizes building walls, range, and sightline control."]], [["이벤트", "Event"], ["도시 봉쇄 작전이 추가되고 Take Down이 복각되었습니다.", "City Lockdown was added and Take Down returned."]]] },
  { id:"beta3", icon:"β3", title:["베타 시즌 3", "Beta Season 3"], desc:["v1.5.3 아이스크림 테마 업데이트", "The v1.5.3 ice-cream-theme update"], body:["베타 시즌 3는 지역 제어형 캐릭터 아이보리, 그린 궁극기와 시즌 이벤트를 추가했습니다.", "Beta Season 3 adds the area-control fighter Ivory, Green's ultimate, and seasonal events."], sections:[[["아이보리", "Ivory"], ["아이스크림 투척과 4초 지속 장판으로 길목을 통제하며, 궁극기 단체 주문은 다섯 장판을 배치합니다.", "Ivory controls lanes with ice-cream throws and four-second zones; Group Order deploys five zones."]], [["핑크 궁극기 패치", "Pink ultimate patch"], ["v1.5.3.1에서 핑크 궁극기가 모든 아군에게 부활 기회를 부여하도록 변경되었습니다.", "v1.5.3.1 changed Pink's ultimate to grant every ally a revival opportunity."]]] },
  { id:"beta2", icon:"β2", title:["베타 시즌 2", "Beta Season 2"], desc:["v1.5.2 정식 시즌 업데이트", "The v1.5.2 live season update"], body:["베타 시즌 2는 2026년 8월 3일 00:00 KST에 시작해 8월 10일 00:00 KST에 종료됩니다. Gold와 Gold Rush, 시즌 한정 스킨을 포함합니다.", "Beta Season 2 runs from August 3, 2026 00:00 KST to August 10, 2026 00:00 KST. It includes Gold, Gold Rush, and seasonal skins."], sections:[[["핵심 콘텐츠", "Highlights"], ["신규 전설 캐릭터 Gold, 연쇄 금광석과 고장 지대 궁극기, Gold Rush 경쟁 모드를 추가했습니다.", "Added Gold, the Chain Gold Ore and Malfunction Zone kit, and the Gold Rush competitive mode."]], [["기간", "Schedule"], ["시작 2026.08.03 00:00 KST · 종료 2026.08.10 00:00 KST", "Starts 2026.08.03 00:00 KST · Ends 2026.08.10 00:00 KST"]]] },
  { id:"goldrush", icon:"🪙", title:["골드 러쉬", "Gold Rush"], desc:["금 10개를 지켜 승리하는 10인 모드", "A 10-player mode won by holding 10 gold"], body:["중앙 금광과 맵에 생성되는 금을 자동으로 획득합니다. 금 10개를 모은 뒤 10초간 보유하면 즉시 승리합니다. AI 9명이 함께 경쟁합니다.", "Gold spawning at the center and around the map is collected automatically. Hold 10 gold for 10 seconds to win instantly against nine AI rivals."], sections:[[["승리 조건", "Win condition"], ["금 10개 보유 후 10초 유지. 3분이 끝나면 가장 많은 금을 보유한 플레이어가 승리합니다.", "Hold 10 gold for 10 seconds. At three minutes, the fighter holding the most gold wins."]]] },
  { id:"beta1", icon:"β", title:["베타 시즌 1", "Beta Season 1"], desc:["v1.5.0에서 시작된 COLORS의 첫 베타 시즌과 핵심 변화를 소개합니다.", "Meet the first Beta season of COLORS and its major v1.5.0 changes."], body:["2026년 7월 27일 시작된 베타 시즌 1은 신규 영웅 캐릭터 Crimson, 캐릭터 등급과 구매, β 크레딧, 시즌 한정 스킨을 도입했습니다. 알파 시즌 1~4의 전적은 그대로 보존되며 새로운 경기는 beta1 전적으로 따로 누적됩니다.", "Beta Season 1 launched on July 27, 2026 with the new Hero fighter Crimson, character rarities and purchases, Beta Credits, and seasonal skins. Alpha Season 1–4 records remain intact while new matches are tracked separately under beta1."], sections:[
    [["시즌 핵심", "Season highlights"], ["신규 영웅 Crimson과 KO 스트레이트 궁극기, 캐릭터 등급 시스템, β 크레딧 및 캐릭터 구매 상점이 시즌의 핵심입니다.", "The season centers on the new Hero Crimson and KO Straight ultimate, character rarities, Beta Credits, and the character shop."]],
    [["등급과 구매", "Rarities & unlocks"], ["일반 등급은 Red·Green·Blue, 희귀 등급은 Orange·Yellow·Cyan·Purple·Pink, 영웅 등급은 Crimson입니다. 기존 계정은 기존 8종을 유지하며 Crimson만 신규 구매 대상입니다.", "Common includes Red, Green, and Blue; Rare includes Orange, Yellow, Cyan, Purple, and Pink; Hero includes Crimson. Existing accounts keep the original eight fighters and only Crimson requires a new unlock."]],
    [["β 크레딧", "Beta Credits"], ["쇼다운·Chop Wood·Take Down 승리 시 100 β 크레딧을 받습니다. 희귀 캐릭터는 200, 영웅 Crimson은 900 크레딧이 필요합니다.", "Wins in Showdown, Chop Wood, and Take Down award 100 Beta Credits. Rare fighters cost 200 and Hero Crimson costs 900 credits."]],
    [["시즌 스킨", "Season skins"], ["Crimson Orange, Blood Crimson, Scarlet Red와 순위 보상 왕관 3종이 베타 시즌 1 수집품으로 추가되었습니다.", "Crimson Orange, Blood Crimson, Scarlet Red, and three placement crown skins join the Beta Season 1 collection."]],
    [["전적 보존", "Record preservation"], ["알파 시즌 전적과 전체 계정 기록은 초기화되지 않습니다. 베타 시즌 1 전적만 새로운 시즌 항목으로 분리 기록됩니다.", "Alpha season and lifetime account records are not reset. Beta Season 1 results are stored in a new, separate season entry."]],
  ]},
  { id:"combat", icon:"⚔", title:["전투 기본", "Combat Basics"], desc:["WASD 이동, 마우스 조준, 클릭 공격과 자동 장전의 기본 흐름을 설명합니다.", "Movement, aiming, attacks, ammo, and automatic reload."], body:["모든 캐릭터는 기본적으로 3발의 탄약을 사용합니다. 공격 후 탄약은 캐릭터별 장전 시간에 따라 한 발씩 자동 회복됩니다. 피해를 받지 않고 일정 시간이 지나면 체력이 자연 회복됩니다.", "Every character uses three ammo charges. Ammo automatically returns one at a time based on reload speed. Health regenerates after avoiding damage for a short period."] },
  { id:"showdown", icon:"♛", title:["쇼다운", "Showdown"], desc:["10명이 겨루고 마지막 생존자를 결정하는 배틀로얄 모드입니다.", "A ten-player battle royale where the last fighter standing wins."], body:["자기장은 다섯 단계에 걸쳐 줄어듭니다. 수풀에서는 모습을 숨길 수 있지만 공격하거나 피해를 받으면 잠시 발각됩니다. 마지막 생존자는 1위를 기록합니다.", "The zone shrinks through five phases. Bushes hide fighters, but attacking or taking damage reveals them temporarily. The last survivor takes first place."] },
  { id:"maps", icon:"⌖", title:["맵과 지형", "Maps & Terrain"], desc:["벽, 호수, 수풀과 맵 로테이션이 전투에 미치는 영향입니다.", "How walls, lakes, bushes, and map rotation shape combat."], body:["쇼다운은 세 개의 전장을 순환합니다. 벽은 투사체와 이동을 막고, 호수는 진입할 수 없습니다. 수풀 안의 플레이어는 같은 수풀에 들어오거나 발각되기 전까지 보이지 않습니다.", "Showdown rotates through three arenas. Walls block movement and projectiles, lakes are impassable, and bushes conceal fighters until revealed or approached."] },
  { id:"modes", icon:"◉", title:["게임 모드", "Game Modes"], desc:["쇼다운, 나무 베기와 Take Down의 승리 조건입니다.", "Win conditions for Showdown, Chop Wood, and Take Down."], body:["나무 베기는 상대 팀의 나무를 먼저 파괴하는 팀 모드입니다. Take Down은 중앙 보스와 순위 경쟁을 함께 다룹니다. SOCCER KICK은 3대3으로 2골을 먼저 넣는 팀이 승리합니다.", "Chop Wood is a team race to destroy the enemy tree. Take Down combines a central boss fight with ranking competition. In SOCCER KICK, the first 3v3 team to score two goals wins."] },
  { id:"account", icon:"▣", title:["계정과 성장", "Account & Progression"], desc:["트로피, 승률, 연승, 캐릭터 레벨과 저장 방식입니다.", "Trophies, win rate, streaks, character levels, and saves."], body:["계정에는 모드별 승패, 캐릭터별 기록, 트로피와 최고 연승이 저장됩니다. 캐릭터는 최대 6레벨까지 성장하며, 레벨에 따라 최대 체력과 공격력이 증가합니다.", "Accounts track records by mode and character, trophies, and best streak. Characters can grow to level 6, increasing maximum health and attack power."] },
  { id:"currency", icon:"◇", title:["재화", "Currencies"], desc:["코인, 크레딧과 트로피를 어디서 얻고 사용하는지 확인하세요.", "How to earn and spend coins, credits, and trophies."], body:["코인은 꾸미기 아이템 상점에서 사용합니다. 크레딧은 캐릭터 구매와 성장에 사용되며, 베타 크레딧은 시즌 테스트에서 별도로 관리됩니다. 트로피는 경기 결과와 연승 보너스로 오르거나 내려갑니다.", "Coins buy cosmetics. Credits unlock and upgrade characters, while beta credits are stored separately for season tests. Trophies rise or fall through match results and streak bonuses."] },
];

const legacyPatch = (version, date, titleKo, titleEn, itemsKo) => ({
  version, date, title:[titleKo, titleEn],
  items: itemsKo.map((item) => [item, item]),
  summary:[`${titleKo}의 주요 변경 사항을 기록한 이전 버전 아카이브입니다.`, `Archived changes from ${titleEn}.`],
  impact:["해당 버전 당시의 시스템·캐릭터·전투 환경 변경을 확인할 수 있습니다.", "Shows how systems, fighters, and combat changed in this historical version."],
});

const legacyPatches = [
  legacyPatch("v1.4.10", "2026.07.05", "퍼플·Take Down 대규모 개선", "Purple & Take Down Overhaul", ["퍼플 체력 4,800→6,000, 독침 직격 피해·발각 추가", "퍼플 독병 피해·사거리와 지속 독 피해 상향", "Orange 재장전·사거리·폭발 범위 상향 및 광역 폭발 능력 구현", "Take Down 캐릭터 선택과 멀티플레이 자동 매칭 추가", "전 캐릭터 AI 거리 유지·후퇴 로직 개선"]),
  legacyPatch("v1.4.9", "2026.06.30", "레드 공격 범위 조정", "Red Attack Range", ["Red 펀치 가로 사거리 2타일 증가"]),
  legacyPatch("v1.4.8", "2026.06.30", "알파 시즌 4", "Alpha Season 4", ["알파 시즌 4 전환", "Take Down 이벤트와 전용 8방향 대칭 맵 추가", "Take Down AI 캐릭터 중복 방지"]),
  legacyPatch("v1.4.7", "2026.06.29", "모델·이펙트·상점 개선", "Models, Effects & Shop", ["캐릭터 관절 구체 제거와 모델 외형 개선", "Pink 기타 디테일과 음파 이펙트 추가", "상점 레벨업 UI와 스킨 장착·해제 기능 개선", "캐릭터별 재장전 시간을 1발 기준으로 정리"]),
  legacyPatch("v1.4.6", "2026.06.28", "핑크 출시", "Pink Release", ["탱커·서포터 Pink 추가", "상성표를 8캐릭터로 갱신", "Purple 약병 범위 6→5 하향"]),
  legacyPatch("v1.4.5", "2026.06.28", "상태 효과와 AI 개선", "Status Effects & AI", ["둔화·독·피격 발광을 전신에 적용", "봇의 벽·호수 우회 경로 탐색 개선", "클릭 공격 시 가장 가까운 적 자동 조준 추가"]),
  legacyPatch("v1.4.4", "2026.06.28", "퍼플과 스킨 시스템", "Purple & Skins", ["포이즌 컨트롤러 Purple 추가", "Alpha Red 한정 스킨과 스킨 시스템 추가", "전 캐릭터 적중·상태·투사체 꼬리 이펙트 추가", "수동 공격과 탭 전환 프리즈 문제 수정"]),
  legacyPatch("v1.4.3", "2026.06.27", "레벨 6과 전투 모델 개선", "Level 6 & Combat Models", ["캐릭터 최대 레벨 6 추가", "팔꿈치·무릎 관절과 전용 자세 개선", "Yellow·Green·Blue·Orange 밸런스 조정", "벽·호수와 겹친 수풀 제거"]),
  legacyPatch("v1.4.2", "2026.06.25", "성장 시스템과 알파 시즌 3", "Progression & Alpha Season 3", ["코인·캐릭터 레벨·마스터리 시스템 추가", "캐릭터 성장 상점 추가", "알파 시즌 3 전환", "Orange 파편 피해·재장전·범위 조정"]),
  legacyPatch("v1.4.1", "2026.06.25", "캐릭터 밸런스", "Fighter Balance", ["Red 체력·공격 속도 상향", "Orange 체력·직격 피해 하향", "Yellow 사거리·감전 지속시간 하향"]),
  legacyPatch("v1.4.0", "2026.06.25", "시안 출시", "Cyan Release", ["컨트롤 파이터 Cyan 추가", "상성표를 7캐릭터로 갱신", "Chop Wood 맵 세로 배치와 캐릭터 색상 통일"]),
  legacyPatch("v1.3.9", "2026.06.25", "캐릭터 선택 화면 개선", "Character Select Improvements", ["선택 캐릭터 강조와 3D 미리보기 확대", "체력·공격·사거리·기동 스탯 바 추가", "시즌·버전과 캐릭터 설명 배치 개선"]),
  legacyPatch("v1.3.8", "2026.06.25", "캐릭터 모델 개선", "Character Model Update", ["캐릭터 모델에 어깨·허벅지 관절 추가"]),
  legacyPatch("v1.3.7", "2026.06.24", "옐로우 출시", "Yellow Release", ["전기 투사체와 감속을 사용하는 Yellow 추가", "5캐릭터 상성표와 경합 단계 추가", "캐릭터 선택 버튼과 인게임 수치 동기화 개선"]),
  legacyPatch("v1.3.6", "2026.06.22", "알파 시즌 2와 리더보드", "Alpha Season 2 & Leaderboard", ["내 정보·리더보드와 AI 이름 추가", "시즌별 승률과 알파 시즌 2 추가", "Red·Green·Orange 밸런스와 AI 교전 거리 조정"]),
  legacyPatch("v1.3.5", "2026.06.22", "오렌지·레드 상향", "Orange & Red Buffs", ["Orange 파편 피해와 투사체 판정 상향", "Red 공격력 10% 상향", "탄약 UI 갱신 문제 수정"]),
  legacyPatch("v1.3.4", "2026.06.22", "Chop Wood 조정", "Chop Wood Tuning", ["Chop Wood 자기장과 이동 제한 제거", "나무 체력 100→50, 벌목 시간 2초→1초"]),
  legacyPatch("v1.3.3", "2026.06.22", "게임 모드 선택", "Mode Selection", ["Showdown·Chop Wood 모드 선택 UI 추가", "Chop Wood 팀 마커와 킬피드 색상 추가", "Red 공격력 10% 상향"]),
  legacyPatch("v1.3.2", "2026.06.22", "전투 밸런스와 정리", "Combat Balance & Cleanup", ["Orange 파편 사거리 하향", "Red 이동 속도 상향, Blue 공격 속도 하향", "미사용 코드 정리와 Chop Wood 기획 추가"]),
  legacyPatch("v1.3.1", "2026.06.21", "UI·맵 안정성 개선", "UI & Map Stability", ["Orange 조준선과 4캐릭터 상성표 추가", "맵 외부 오브젝트 제거와 경계 벽 추가", "승리 결과 화면·로비 UI·번역 구조 개선"]),
  legacyPatch("v1.3.0", "2026.06.21", "오렌지 출시", "Orange Release", ["폭탄과 5갈래 폭발을 사용하는 Orange 추가", "자기장 색상·축소 시간 조정", "받은 피해 팝업과 Orange 사거리 적용"]),
  legacyPatch("v1.2.9", "2026.06.20", "AI·수풀·로딩 개선", "AI, Bushes & Loading", ["AI 타겟·자기장·캐릭터별 전략 개선", "공격·피격 시 3초 발각되는 수풀 전투 추가", "이동 속도와 Green 판정 조정", "훈련장·로딩·백그라운드 진행 안정화"]),
  legacyPatch("v1.2.8", "2026.06.19", "알파 시즌 1 전투 경험 개선", "Alpha Season 1 Polish", ["알파 시즌 1 UI와 전투 경험 개선", "캐릭터 카드와 재장전·피격 UI 개선", "킬 로그·승률·최고 기록 추가"]),
  legacyPatch("v1.2.6", "2026.06.19", "그린과 통계 조정", "Green & Stats", ["Green 공격 간격 0.40→0.45초", "캐릭터 통계 표시와 기타 버그 개선"]),
  legacyPatch("v1.2.5", "2026.06.19", "훈련장·로딩·밸런스", "Training, Loading & Balance", ["훈련장 더미 자동 부활과 킬로그 정리", "로딩 화면·무한 로딩 문제 개선", "이동 속도와 Green 부메랑 판정 조정"]),
  legacyPatch("v1.2.3", "2026.06.19", "다국어 지원", "Localization", ["한국어·영어 다국어 시스템 추가"]),
  legacyPatch("v1.2.2", "2026.06.19", "로비 메뉴 배치", "Lobby Menu Layout", ["상성표와 패치노트를 로비 우측 상단으로 이동"]),
  legacyPatch("v1.2.1", "2026.06.19", "알파 시즌 1 시작", "Alpha Season 1 Launch", ["알파 시즌 1 시작", "상성표 설명과 패치노트 스크롤 개선"]),
  legacyPatch("v1.2", "2026.06.19", "전적·연승·상성표", "Records, Streaks & Matchups", ["캐릭터별 승률·판수·승리 횟수 추가", "연승 보너스 트로피 시스템 추가", "상성표와 패치노트 추가"]),
  legacyPatch("v1.1", "2026.06.18", "회복·수풀·AI 개선", "Healing, Bushes & AI", ["전투 이탈 후 일괄 회복 방식으로 변경", "수풀 매복 정지와 자기장 중 회복 문제 수정", "수풀 GPU와 AI 타겟팅 최적화"]),
  legacyPatch("v1.0", "2026.06.14", "COLORS 최초 출시", "COLORS Initial Release", ["Red·Green·Blue 3종 캐릭터", "배틀 맵 3종 로테이션", "트로피·순위·수풀 은신·훈련장 시스템"]),
];

const patches = [
  { version:"v1.6.0", date:"2026.09.21", title:["베타 시즌 6 업데이트", "Beta Season 6 Update"], items:[
    ["신규 영웅 캐릭터 애저: 서프 대시와 궁극기 빅 웨이브, 프로 서퍼 애저 스킨 출시", "New Hero fighter Azure with Surf Dash, the Big Wave ultimate, and the Pro Surfer Azure skin"],
    ["옐로우 궁극기 전기 회로: 장치를 최대 4개 설치하고 일반 공격으로 맞히면 설치 순서대로 전류가 흐름", "Yellow's Electric Circuit ultimate: place up to four devices and hit one with a basic attack to send current through them in order"],
    ["신규 모드 SOCCER KICK: 3대3, 3분 제한, 2골 선승, 동점 연장전, 전용 경기장과 매칭", "New SOCCER KICK mode: 3v3, three-minute limit, first to two goals, overtime on ties, dedicated arena and matchmaking"],
    ["버프: 레드 공격 2,400 · 퍼플 독침 1,100/독병 3,240 · 크림슨 체력 10,500/궁극기 5,400 · 애저 체력 10,500 · 시안 궁극기 3,120 · 민트 장판 초당 450", "Buffs: Red attack 2,400 · Purple needle 1,100/vial 3,240 · Crimson HP 10,500/ultimate 5,400 · Azure HP 10,500 · Cyan ultimate 3,120 · Mint field 450/s"],
    ["조정: 블루 구슬 1,200·사거리 17.5·넉백 · 그린 부메랑 1,900 · 오렌지 체력 4,400/과즙 1,300 · 옐로우 공격 간격 0.3초 · 핑크 체력 9,000 · 골드 단계 피해 900/450/225 · 아이보리 사거리 6/피해 2,000 · 샤르트뢰즈 3×3 판정", "Adjustments: Blue marble 1,200, 17.5 range, knockback · Green boomerang 1,900 · Orange HP 4,400/juice 1,300 · Yellow 0.3s cooldown · Pink HP 9,000 · Gold stage damage 900/450/225 · Ivory range 6/damage 2,000 · Chartreuse 3x3 hitbox"],
    ["모든 일반 투사체 판정 5×5 통일, 캐릭터별 봇 전투 리메이크, 궁극기 포함 상성표 재작성", "Unified 5x5 basic projectile hitboxes, rebuilt character-specific bots, and rewrote the matchup table with ultimates included"],
    ["애저 해변 로비, 시즌 음악 High Noon Tide, 시즌 6 로딩 화면과 바다 소품 추가", "Added the Azure Beach lobby, the High Noon Tide track, a Season 6 loading screen, and ocean cosmetics"],
  ], summary:["애저와 SOCCER KICK을 출시하고, 14종 전체 전투 계산을 하나로 통합해 밸런스를 다시 맞춘 시즌 업데이트입니다.", "A season update that launches Azure and SOCCER KICK and rebalances all 14 fighters on a single unified combat model."], impact:["하향만 받은 캐릭터는 없습니다. 오렌지·핑크·아이보리는 체력이나 사거리를 내준 대신 피해가 올랐고, 골드는 단계 피해가 크게 줄어든 대신 체력과 투사체 피해 감소를 얻었습니다. 봇이 캐릭터별 궁극기와 회피를 사용하므로 AI 전투 난도가 올라갑니다.", "No fighter received nerfs only. Orange, Pink, and Ivory traded health or range for damage, while Gold lost stage damage but gained health and projectile damage reduction. Bots now use character-specific ultimates and evasion, raising AI difficulty."] },
  { version:"v1.5.5", date:"2026.09.17", title:["상성표 수정·민트 누락 보완", "Matchup Corrections & Missing Mint Features"], items:[
    ["상성표 수정: 기존 캐릭터들의 상성이 맞지 않았습니다. 민트 포함 13종을 다시 시뮬레이션해 수정했습니다. 블루→샤르트뢰즈는 불가능→완전 유리, 레드→오렌지는 완전 불리→불리로 표기가 바뀌었습니다.", "Matchup corrections: the previous character matchups were inaccurate. We reran simulations for all 13 characters, including Mint. Blue versus Chartreuse changed from Impossible to Dominant, and Red versus Orange from Severe Disadvantage to Disadvantage."],
    ["민트 누락: 민트가 처음 출시된 뒤 메인에 누락된 기능이 많았습니다. 특히 적중당 얼음 25 누적, 얼음 100에서 2초 빙결, 얼음 수치·빙결 표시, 궁극기 충전과 발동이 빠져 있었습니다.", "Missing Mint features: Mint launched with several features absent from the main game, especially 25 ice per hit, a two-second freeze at 100 ice, ice and freeze indicators, and ultimate charging and activation."],
    ["7회 적중으로 준비되는 아이스크림 장판과 장판의 피해·얼음 누적·미끄러짐을 추가했습니다.", "Added Ice Cream Field, charged by seven hits, along with its damage, ice buildup and sliding effects."],
  ], summary:["상성표를 다시 작성하고 메인 민트의 얼음·궁극기 누락을 보완했습니다.", "Rewrote the matchup table and restored Mint's missing ice and ultimate mechanics in the main game."], impact:["상성표는 궁극기·지형을 제외한 일반 공격 1대1 시뮬레이션 기준이며 실전 승률이 아닙니다. 민트는 얼음을 누적해 적의 이동·공격·궁극기를 2초간 막고, Space/Q 또는 궁극기 버튼으로 장판을 설치할 수 있습니다.", "The table models basic-attack duels without ultimates or terrain; it does not represent live win rates. Mint can accumulate ice to block movement, attacks and ultimates for two seconds, and deploy the field with Space/Q or the ultimate button."] },
  { version:"v1.5.4.3", date:"2026.09.01", title:["베타 시즌 5 밸런스 패치", "Beta Season 5 Balance Patch"], items:[
    ["오렌지: 공격 쿨다운 0.35→0.40초, 과즙 피해 700→600, 직격 추가 과즙 4→3개", "Orange: attack cooldown 0.35→0.40s, juice damage 700→600, direct-hit juice count 4→3"],
    ["핑크: 체력 10,500→10,000, 공격 피해 2,100→2,000, 아군 회복 1,400→1,300", "Pink: health 10,500→10,000, attack damage 2,100→2,000, ally healing 1,400→1,300"],
    ["시안: 일반 공격 사거리 8.33→9, 탄속 18→20, 궁극기 피해 1,300→1,400", "Cyan: basic range 8.33→9, projectile speed 18→20, ultimate damage 1,300→1,400"],
  ], summary:["베타 시즌 5 테스트에서만 전승 오렌지와 고승률 핑크를 하향하고 시안을 보강했습니다.", "Beta Season 5 testing exclusively tones down undefeated Orange and high-performing Pink while improving Cyan."], impact:["메인과 베타 시즌 4 수치는 유지되며, 시즌 5에서만 오렌지의 폭발력과 핑크의 유지력이 감소하고 시안의 중거리 명중 안정성이 높아집니다.", "Main and Beta Season 4 remain unchanged; only Season 5 reduces Orange's burst and Pink's sustain while improving Cyan's mid-range reliability."] },
  { version:"v1.5.4.2", date:"2026.08.31", title:["골드 긴급 패치 2", "Gold Emergency Patch 2"], items:[
    ["골드 제1탄 사거리는 8타일로 유지", "Kept Gold's stage-one range at 8 tiles"],
    ["제2탄 사거리 4→8타일, 제3탄 사거리 3→6타일", "Increased stage-two range from 4 to 8 tiles and stage-three range from 3 to 6 tiles"],
    ["고장 지대 궁극기 장판 반경 3→6타일", "Increased Malfunction Zone radius from 3 to 6 tiles"],
    ["골드 대표 색상을 #FFD700으로 통일하고 장판 가시성 강화", "Standardized Gold's color to #FFD700 and improved zone visibility"],
  ], summary:["골드의 후속 분열탄과 궁극기 장판 범위를 두 배로 늘린 긴급 밸런스 패치입니다.", "An emergency balance patch that doubles the reach of Gold's follow-up splits and ultimate field."], impact:["제1탄의 진입 사거리는 그대로지만 분열 이후의 위협 범위와 지역 통제력이 크게 증가합니다.", "The opening projectile keeps its original reach, while follow-up threat range and area control increase substantially."] },
  { version:"v1.5.4", date:"2026.08.24", title:["베타 시즌 4 업데이트", "Beta Season 4 Update"], items:[
    ["신규 영웅 캐릭터 샤르트뢰즈와 무작위 탄환 4종 추가", "Added the new Hero fighter Chartreuse and four randomized ammo types"],
    ["샤르트뢰즈 궁극기 ‘49% 정신 차림’ 추가", "Added Chartreuse's 49% Focus ultimate"],
    ["레드 궁극기 ‘레드 가드’: 8초 보호막과 받는 피해 60% 감소", "Added Red Guard: an eight-second shield with 60% damage reduction"],
    ["쇼다운을 회색 벽·아스팔트·콘크리트 바닥의 도시 테마로 변경", "Changed Showdown to an urban theme with gray walls, asphalt, and concrete"],
    ["도시 봉쇄 작전 이벤트와 Take Down 복각", "Added the City Lockdown event and brought back Take Down"],
    ["시즌 전용 음악, 샤르트뢰즈 GLB 걷기 모델과 전투 이펙트 추가", "Added seasonal music, Chartreuse's GLB walk model, and combat effects"],
    ["레드·그린·시안 버프, 핑크·크림슨 너프, 퍼플·옐로우 조정", "Buffed Red, Green, and Cyan; nerfed Pink and Crimson; adjusted Purple and Yellow"],
  ], summary:["샤르트뢰즈와 레드 궁극기를 출시하고 쇼다운 전장을 도시 테마로 개편한 베타 시즌 4 업데이트입니다.", "Beta Season 4 introduces Chartreuse and Red's ultimate while rebuilding Showdown around an urban battlefield."], impact:["무작위 탄환과 보호막이 새로운 변수로 추가되며, 수풀이 없는 도시 맵에서는 벽과 사거리 관리가 더 중요해집니다.", "Random ammo and shielding add new variables, while the bushless city map puts more emphasis on walls and range control."] },
  { version:"v1.5.3.1", date:"2026.08.12", title:["핑크 궁극기 패치", "Pink Ultimate Patch"], items:[
    ["핑크 궁극기를 모든 아군에게 부활 효과를 부여하는 능력으로 리워크", "Reworked Pink's ultimate to grant revival to all allies"],
    ["부활 대상은 사망 위치에서 3초 연출 후 부활", "Revive targets return at their death position after a three-second sequence"],
    ["부활 대상 음표 표시와 강화된 부활 이펙트 추가", "Added a musical-note marker and enhanced revival effects"],
    ["로비와 캐릭터 미리보기를 분리하고 GLB 전환 안정성 개선", "Separated lobby and character previews and improved GLB transition stability"],
  ], summary:["핑크의 궁극기를 팀 전체 부활 지원 능력으로 재설계하고 캐릭터 미리보기 구조를 안정화했습니다.", "This patch redesigns Pink's ultimate as a team-wide revival tool and stabilizes character previews."], impact:["핑크는 전투 전에 아군에게 부활 기회를 미리 부여해 팀 교전의 흐름을 뒤집을 수 있습니다.", "Pink can pre-apply revival to allies and potentially reverse the outcome of a team fight."] },
  { version:"v1.5.3", date:"2026.08.10", title:["베타 시즌 3 업데이트", "Beta Season 3 Update"], items:[
    ["신규 캐릭터 아이보리와 아이스크림 투사체·지속 장판 추가", "Added Ivory with ice-cream projectiles and persistent zones"],
    ["그린 궁극기와 ‘주문 왔어요~!’ 승리 누적 이벤트 추가", "Added Green's ultimate and the Orders Up win-streak event"],
    ["베타 시즌 3 맵 테마, 시즌 스킨과 이벤트 보상 추가", "Added the Beta Season 3 map theme, seasonal skins, and event rewards"],
    ["재시작 후 잔여 이펙트·오브젝트와 쇼다운 시작 승리음 문제 수정", "Fixed leftover effects after restart and the Showdown victory sound at match start"],
    ["옐로우 공격력·쿨다운 조정과 퍼플 독침 확산각·독병 사거리 조정", "Adjusted Yellow's damage and cooldown plus Purple's needle spread and poison-bottle range"],
  ], summary:["지역 제어형 캐릭터 아이보리와 새로운 시즌 이벤트를 중심으로 전투 표현과 안정성을 개선한 업데이트입니다.", "Beta Season 3 centers on the area-control fighter Ivory and a new seasonal event while improving combat presentation and stability."], impact:["아이보리의 지속 장판이 좁은 길과 목표 지역을 통제하며, 캐릭터별 사거리와 재장전 관리의 중요성이 커집니다.", "Ivory's persistent zones control chokepoints and objectives, increasing the importance of character range and reload management."] },
  { version:"v1.5.2", date:"2026.08.03", title:["베타 시즌 2 업데이트", "Beta Season 2 Update"], items:[
    ["베타 시즌 2 정식 시작 및 Gold 추가", "Launched Beta Season 2 and added Gold"],
    ["연쇄 금광석 3단 분열과 고장 지대 궁극기 추가", "Added three-stage Chain Gold Ore and Malfunction Zone"],
    ["AI 9명과 경쟁하는 Gold Rush 모드 추가", "Added Gold Rush with nine AI rivals"],
    ["전체 상성표와 시즌 위키 갱신", "Updated the full matchup table and season wiki"],
  ], summary:["베타 시즌 2는 Gold와 Gold Rush를 중심으로 한 일주일 정식 시즌입니다.", "Beta Season 2 is a one-week live season centered on Gold and Gold Rush."], impact:["Gold의 분열 경로와 고장 지대가 좁은 길 교전에 새로운 제어 선택지를 만듭니다.", "Gold's split paths and Malfunction Zone add new control decisions in chokepoint fights."] },
  { version:"v1.5.1", date:"2026.08.01", title:["베타 시즌 1 업데이트", "Beta Season 1 Update"], items:[
    ["Green·Orange·Red·Yellow 전용 3D 모델과 전 캐릭터 카툰 셰이딩 적용", "Added dedicated 3D models for Green, Orange, Red, and Yellow plus cartoon shading for all fighters"],
    ["Crimson 조준선과 멀티플레이 타격 이펙트·사운드 동기화 개선", "Improved Crimson aiming and multiplayer hit effect/audio synchronization"],
    ["상성표·카메라·캐릭터별 사거리와 시즌 로비 UI 개선", "Updated matchups, camera, per-fighter ranges, and the seasonal lobby UI"],
  ], summary:["베타 시즌 1의 3D 표현과 전투 동기화, 로비 정보를 다듬은 업데이트입니다.", "A Beta Season 1 update polishing 3D presentation, combat sync, and lobby information."], impact:["캐릭터 구분과 조준 피드백이 선명해지고 원격 전투 표현이 안정화되었습니다.", "Fighters are easier to read, aiming feedback is clearer, and remote combat presentation is more stable."] },
  { version:"v1.5.0", date:"2026.07.27", title:["베타 시즌 1 시작", "Beta Season 1 Launch"], items:[
    ["신규 영웅 캐릭터 Crimson과 KO 스트레이트 궁극기 추가", "Added the new Hero fighter Crimson and KO Straight ultimate"],
    ["캐릭터 등급, 구매 상점과 β 크레딧 도입", "Introduced character rarities, character shop, and Beta Credits"],
    ["기존 계정의 알파 시즌 전적과 보유 캐릭터 보존", "Preserved Alpha season records and existing character ownership"],
    ["베타 시즌 1 한정 스킨과 왕관 보상 추가", "Added Beta Season 1 limited skins and crown rewards"],
  ], summary:["COLORS의 첫 베타 시즌입니다. 신규 캐릭터와 성장 경제를 도입하면서 기존 계정의 기록과 보유 자산은 그대로 이어집니다.", "The first Beta season of COLORS introduces a new fighter and progression economy while preserving existing account records and ownership."], impact:["Crimson을 해제하고 캐릭터별 수집·성장을 이어가는 장기 목표가 추가됩니다. 경기 승리는 β 크레딧 획득과 직접 연결됩니다.", "Players gain a new long-term goal through unlocking Crimson and expanding their roster. Match wins now directly award Beta Credits."] },
  { version:"v1.4.14", date:"2026.07.19", title:["알파 시즌 라스트 패치", "Alpha Season Final Patch"], items:[
    ["쇼다운 멀티플레이와 계정 기반 글로벌 트로피 리더보드 추가", "Added Showdown multiplayer and account-based global trophy leaderboard"],
    ["스폰과 AI 배치를 경기마다 무작위화", "Randomized spawns and AI placement each match"],
    ["Chop Wood 승리 보상과 캐릭터·시즌별 기록 개선", "Improved Chop Wood rewards and per-character/season records"],
  ], summary:["알파 시즌을 마무리하며 멀티플레이 경쟁과 기록 시스템을 크게 확장한 업데이트입니다. 경기마다 달라지는 배치와 글로벌 순위표로 반복 플레이의 변화를 강화했습니다.", "The Alpha Season finale expands multiplayer competition and progression. Randomized match layouts and global rankings add more variety to repeat play."], impact:["계정 기록과 리더보드 경쟁이 중요한 장기 목표가 되었으며, 고정된 스폰을 외우는 전략의 효과는 줄어듭니다.", "Account records and leaderboard placement now provide long-term goals, while memorizing fixed spawns is less effective."] },
  { version:"v1.4.13", date:"2026.07.16", title:["전투 및 Take Down 개선", "Combat & Take Down Improvements"], items:[
    ["Green 부메랑 사거리 증가와 공격 각도 조정", "Increased Green boomerang range and adjusted spread"],
    ["멀티플레이 공격 효과와 사운드 동기화 개선", "Improved multiplayer attack effect and sound sync"],
    ["Take Down 보스 방향 안내와 맵 정보 추가", "Added boss direction indicator and map info to Take Down"],
  ], summary:["Green의 공격 감각을 다듬고 멀티플레이 전투 피드백과 Take Down의 길 찾기를 개선했습니다.", "This update refines Green's attack feel, improves multiplayer combat feedback, and makes Take Down easier to navigate."], impact:["Green은 조금 더 안정적으로 중거리 교전을 할 수 있으며, Take Down에서는 보스 위치를 놓쳐 시간을 낭비하는 상황이 줄어듭니다.", "Green can fight more reliably at mid range, and Take Down players spend less time losing track of the boss."] },
  { version:"v1.4.12", date:"2026.07.15", title:["안정성 업데이트", "Stability Update"], items:[
    ["로비와 전투 전환 안정성 개선", "Improved lobby-to-battle transitions"],
    ["캐릭터별 효과와 AI 행동 보정", "Polished character effects and AI behavior"],
  ], summary:["새 기능보다 게임 흐름의 안정성과 캐릭터 표현 품질에 집중한 유지보수 업데이트입니다.", "A maintenance-focused update improving flow stability and character presentation rather than adding major features."], impact:["로비에서 전투로 넘어갈 때 발생하던 불안정한 상황이 줄고, AI의 행동이 더 자연스럽게 보입니다.", "Transitions from lobby to battle are more reliable, and AI behavior appears more natural."] },
  { version:"v1.4.11", date:"2026.07.09", title:["캐릭터 포즈 업데이트", "Character Pose Update"], items:[
    ["캐릭터별 전용 자세와 소품 추가", "Added unique poses and props for characters"],
    ["Take Down 캐릭터 선택 화면 개선", "Improved Take Down character selection"],
  ], summary:["캐릭터의 개성을 강화하고 Take Down 출전 준비 과정을 알아보기 쉽게 만든 시각 개선 업데이트입니다.", "A visual update that strengthens character identity and clarifies the Take Down preparation flow."], impact:["로비에서 캐릭터를 구분하기 쉬워졌으며, Take Down에서 출전 가능한 캐릭터를 더 빠르게 선택할 수 있습니다.", "Characters are easier to distinguish in the lobby, and eligible Take Down fighters can be selected more quickly."] },
  ...legacyPatches,
];

let lang = localStorage.getItem("skullCreekLang") === "en" ? "en" : "ko";
let route = "home";
const tr = (key) => copy[lang][key] || key;
const loc = (pair) => pair[lang === "ko" ? 0 : 1];
const fmt = (value) => new Intl.NumberFormat(lang === "ko" ? "ko-KR" : "en-US", { maximumFractionDigits: 2 }).format(value);

function wikiStats(id) {
  const fallbackColors = { crimson: 0x8b0000, gold: 0xd4a928, azure: 0x007fff };
  return { color: fallbackColors[id], ...CHARACTERS[id], ...(LIVE_CHARACTERS[id] || {}) };
}

function moveSpeedLabel(multiplier) {
  if (multiplier >= 1.4) return lang === "ko" ? "매우 빠름" : "Very Fast";
  if (multiplier >= 1.2) return lang === "ko" ? "빠름" : "Fast";
  return lang === "ko" ? "보통" : "Normal";
}

function betaAttackStats(id) {
  const stats = wikiStats(id);
  if (id === "red") return { damage: stats.attackDamage * stats.attackCount, range: stats.attackRange };
  if (id === "green") return { damage: stats.boomerangDamage * stats.boomerangAngles.length, range: stats.boomerangRange };
  if (id === "blue") return { damage: stats.bulletDamage, range: stats.bulletRange };
  if (id === "orange") return { damage: stats.bombDamage + stats.bombSplashDamage * stats.bombDirectHitJuiceCount, range: stats.bombRange };
  if (id === "yellow") return { damage: stats.electricDamage, range: stats.electricRange };
  if (id === "cyan") return { damage: stats.spreadLineDamage * stats.spreadLineCount, range: stats.spreadLineRange };
  if (id === "crimson") return { damage: stats.attackDamage * stats.attackCount, range: stats.attackRange };
  if (id === "gold") return { damage: stats.stage1Damage, range: stats.stage1Range };
  if (id === "ivory") return { damage: stats.iceCreamDamage, range: stats.iceCreamRange };
  if (id === "chartreuse") return { damage: stats.chartreuseDamage, range: stats.chartreuseRange };
  if (id === "purple") return { damage: stats.vialDamage, range: stats.vialRange };
  if (id === "mint") return { damage: stats.iceBulletDamage * stats.burstCount, range: stats.iceBulletRange };
  if (id === "azure") return { damage: stats.surfDamage, range: stats.surfLength };
  return { damage: stats.healCircleDamage, range: stats.healCircleRange };
}

function applyLanguage() {
  document.documentElement.lang = lang;
  $$("[data-t]").forEach((el) => {
    if (el.dataset.t === "heroTitle") el.innerHTML = tr(el.dataset.t);
    else el.textContent = tr(el.dataset.t);
  });
  $$("[data-t-placeholder]").forEach((el) => { el.placeholder = tr(el.dataset.tPlaceholder); });
  $("#lang-button").textContent = lang === "ko" ? "EN" : "KO";
  const target = routeFromPath();
  renderRoute(target.route, false);
  if (target.character && $("#article-dialog").open) openCharacter(target.character, false);
  if (target.guide && $("#article-dialog").open) openGuide(target.guide, false);
}

function characterCard(id) {
  const stats = wikiStats(id);
  const meta = characterMeta[id];
  const attackStats = betaAttackStats(id);
  // 위키 데이터가 없는 신규 캐릭터 때문에 목록 전체가 죽지 않도록 건너뛴다
  if (!stats || !meta) return "";
  return `<article class="character-card" data-open="char:${id}" tabindex="0" role="button" aria-label="${id}">
    <div class="portrait" style="--char:#${stats.color.toString(16).padStart(6,"0")}" data-letter="${id[0].toUpperCase()}"></div>
    <div class="char-card-body">
      <div class="char-title"><h3>${id[0].toUpperCase()+id.slice(1)}</h3><span class="role-pill" style="--char:#${stats.color.toString(16).padStart(6,"0")}">${loc(meta.role)}</span></div>
      <p>${loc(meta.desc)}</p>
      <div class="mini-stats"><div><span>${tr("hp")}</span><strong>${fmt(stats.maxHealth)}</strong></div><div><span>${tr("damage")}</span><strong>${fmt(attackStats.damage)}</strong></div><div><span>${tr("speed")}</span><strong>${moveSpeedLabel(stats.moveSpeedMultiplier)}</strong></div></div>
    </div>
  </article>`;
}

function sectionHead(title, desc, action = "") {
  return `<div class="section-head"><div><h2>${title}</h2><p>${desc}</p></div>${action}</div>`;
}

function renderHome() {
  const cards = Object.keys(characterMeta).map(characterCard).join("");
  return `${sectionHead(tr("allCharacters"), tr("charDesc"), `<button data-route="characters">${tr("viewAll")} →</button>`)}
    <div class="character-grid">${cards}</div>
    <div class="home-panels">
      <section class="info-panel">
        <h3>${tr("beginnerGuides")}</h3><p>${tr("guideDesc")}</p>
        <div class="guide-links">${guides.slice(0,4).map(g => `<button class="guide-link" data-open="guide:${g.id}"><span>${g.icon}</span>${loc(g.title)}</button>`).join("")}</div>
      </section>
      <section class="info-panel dark">
        <h3>${tr("latestPatch")}</h3><p>${tr("seasonDesc")}</p>
        ${patches.slice(0,3).map(p => `<div class="patch-line"><b>${p.version} · ${loc(p.title)}</b><span>${p.date} · ${loc(p.items[0])}</span></div>`).join("")}
      </section>
    </div>`;
}

function renderCharacters() {
  return `${sectionHead(tr("allCharacters"), tr("charDesc"))}<div class="character-grid">${Object.keys(characterMeta).map(characterCard).join("")}</div>`;
}

function renderSystems() {
  return `${sectionHead(tr("allGuides"), tr("guidePageDesc"))}<div class="doc-grid">${guides.map(g => `<article class="doc-card"><div class="doc-icon">${g.icon}</div><h3>${loc(g.title)}</h3><p>${loc(g.desc)}</p><button data-open="guide:${g.id}">${tr("open")} →</button></article>`).join("")}</div>`;
}

function renderShop() {
  const skins = Object.values(SKINS);
  const fighters = [
    ["Red · Green · Blue", "common", 0],
    ["Orange · Yellow · Cyan · Purple · Pink", "rare", 200],
    ["Crimson · Ivory · Chartreuse · Mint · Azure", "hero", 900],
    ["Gold", "legendary", 1200],
  ];
  return `${sectionHead(tr("shopTitle"), tr("shopDesc"))}
    <div class="home-panels"><section class="info-panel"><h3>${lang === "ko" ? "캐릭터 해금" : "Character Unlocks"}</h3><p>${lang === "ko" ? "크레딧으로 캐릭터를 해금합니다. 이미 보유한 캐릭터는 다시 구매할 필요가 없습니다." : "Unlock fighters with Credits. Fighters already owned never need to be purchased again."}</p>${fighters.map(([names, rarity, cost]) => `<div class="patch-line"><b>${names}</b><span>${rarity} · ${cost ? `◇ ${fmt(cost)}` : tr("free")}</span></div>`).join("")}</section><section class="info-panel"><h3>${lang === "ko" ? "수집품 상점" : "Collection Shop"}</h3><p>${lang === "ko" ? "시즌 스킨은 코인으로 구매하며 순위 보상 스킨은 조건을 달성하면 무료로 지급됩니다." : "Seasonal skins cost Coins, while placement reward skins are granted free when their conditions are met."}</p></section></div>
    <div class="skin-grid">${skins.map((skin) => `<article class="skin-card">
      <div class="skin-swatch">${skin.character[0].toUpperCase()}</div>
      <h3>${skin.name}</h3><p>${skin.character[0].toUpperCase()+skin.character.slice(1)} · ${skin.season.toUpperCase()}</p>
      <div class="price"><span class="rarity">${skin.rarity}</span><span>◈ ${skin.cost ? fmt(skin.cost) : tr("free")}</span></div>
    </article>`).join("")}</div>
    <div class="home-panels"><section class="info-panel"><h3>${lang === "ko" ? "재화 안내" : "Currency Guide"}</h3><p>${loc(guides.find(g=>g.id==="currency").body)}</p><button class="guide-link" data-open="guide:currency"><span>◇</span>${tr("open")}</button></section><section class="info-panel"><h3>${lang === "ko" ? "캐릭터 성장" : "Character Progression"}</h3><p>${loc(guides.find(g=>g.id==="account").body)}</p><button class="guide-link" data-open="guide:account"><span>▣</span>${tr("open")}</button></section></div>`;
}

function renderPatches() {
  const patchCard = (p) => `<article class="patch-card">
    <time>${p.date}</time>
    <h3>${p.version} · ${loc(p.title)}</h3>
    <p class="patch-summary">${loc(p.summary)}</p>
    <h4>${lang === "ko" ? "주요 변경 사항" : "Key changes"}</h4>
    <ul>${p.items.map(i=>`<li>${loc(i)}</li>`).join("")}</ul>
    <div class="patch-impact"><strong>${lang === "ko" ? "플레이 영향" : "Gameplay impact"}</strong><p>${loc(p.impact)}</p></div>
  </article>`;
  const betaPatches = patches.filter((patch) => Number(patch.version.match(/^v1\.(\d+)/)?.[1] ?? 0) >= 5);
  const alphaPatches = patches.filter((patch) => !betaPatches.includes(patch));
  const group = (title, entries, open = false) => `<details class="patch-season-group" ${open ? "open" : ""}>
    <summary><span class="patch-season-arrow" aria-hidden="true"></span><span><strong>${title}</strong><small>${entries.length}${lang === "ko" ? "개 업데이트" : " updates"}</small></span></summary>
    <div class="patch-list">${entries.map(patchCard).join("")}</div>
  </details>`;
  return `${sectionHead(tr("patchTitle"), tr("patchDesc"))}
    ${group(lang === "ko" ? "베타 시즌" : "Beta Seasons", betaPatches, true)}
    ${group(lang === "ko" ? "알파 시즌" : "Alpha Seasons", alphaPatches)}`;
}

const routePaths = {
  home: `${BASE}wiki/`,
  characters: `${BASE}wiki/characters/`,
  systems: `${BASE}wiki/guides/`,
  shop: `${BASE}wiki/shop/`,
  patches: `${BASE}wiki/patches/`,
};

function renderRoute(nextRoute, updateUrl = true) {
  route = ["home","characters","systems","shop","patches"].includes(nextRoute) ? nextRoute : "home";
  const renderers = { home:renderHome, characters:renderCharacters, systems:renderSystems, shop:renderShop, patches:renderPatches };
  $("#page-content").innerHTML = renderers[route]();
  $$("[data-route]").forEach((el) => el.classList.toggle("active", el.dataset.route === route));
  if (updateUrl && location.pathname !== routePaths[route]) history.pushState(null, "", routePaths[route]);
  const titles = {
    home: "COLORS 위키",
    characters: `${tr("characters")} | COLORS 위키`,
    systems: `${tr("systems")} | COLORS 위키`,
    shop: `${tr("shop")} | COLORS 위키`,
    patches: `${tr("patches")} | COLORS 위키`,
  };
  document.title = titles[route];
}

function openCharacter(id, updateUrl = true) {
  const stats = wikiStats(id);
  const meta = characterMeta[id];
  const detail = characterDetails[id];
  if (!stats || !meta || !detail) return;
  const color = `#${stats.color.toString(16).padStart(6,"0")}`;
  const attackStats = betaAttackStats(id);
  const rows = [
    [tr("hp"), fmt(stats.maxHealth)], [tr("role"), loc(meta.role)], [tr("basicAttack"), loc(meta.attack)],
    [tr("damage"), fmt(attackStats.damage)], [tr("range"), attackStats.range], [tr("cooldown"), `${stats.attackCooldown}s`],
    [tr("reload"), `${stats.reloadDuration}s`], [tr("speed"), `${moveSpeedLabel(stats.moveSpeedMultiplier)} · ${stats.moveSpeedMultiplier}×`],
  ];
  const historyRows = detail.history.map((entry) => {
    const offset = lang === "ko" ? 0 : 2;
    return `<tr><th>${entry[offset]}</th><td>${entry[offset + 1]}</td></tr>`;
  }).join("");
  const labels = lang === "ko"
    ? ["개요", "설정", "체력·속도", "일반 공격", "팁", "상성", "변천사", "기타"]
    : ["Overview", "Concept", "Health & Speed", "Basic Attack", "Tips", "Matchups", "History", "Other"];
  $("#dialog-content").innerHTML = `<div class="article-hero" style="--char:${color}"><div><p>${tr("dataNote")}</p><h2>${id[0].toUpperCase()+id.slice(1)}</h2><p>${loc(meta.role)} · ${loc(meta.attack)}</p></div></div>
    <div class="article-body">
      <nav class="article-toc" aria-label="${lang === "ko" ? "문서 목차" : "Article contents"}">${labels.map((label,index)=>`<a href="#char-section-${index+1}"><b>${index+1}</b>${label}</a>`).join("")}</nav>

      <section class="character-section" id="char-section-1"><h3><span>1</span>${labels[0]}</h3><p>${loc(meta.desc)}</p></section>

      <section class="character-section" id="char-section-2"><h3><span>2</span>${labels[1]}</h3><p>${loc(detail.setting)}</p></section>

      <section class="character-section" id="char-section-3"><h3><span>3</span>${labels[2]}</h3>
        <div class="headline-stats">
          <div><small>${tr("hp")}</small><strong>${fmt(stats.maxHealth)}</strong><span>${lang === "ko" ? "기본 최대 체력" : "Base maximum health"}</span></div>
          <div><small>${tr("speed")}</small><strong>${moveSpeedLabel(stats.moveSpeedMultiplier)}</strong><span>${stats.moveSpeedMultiplier}× · ${lang === "ko" ? "베타 이동 배율" : "Beta movement multiplier"}</span></div>
        </div>
        <table class="stat-table"><tbody>${rows.map(([a,b])=>`<tr><th>${a}</th><td>${b}</td></tr>`).join("")}</tbody></table>
      </section>

      <section class="character-section" id="char-section-4"><h3><span>4</span>${labels[3]}</h3>
        <div class="attack-card" style="--char:${color}"><div><small>${tr("basicAttack")}</small><strong>${loc(meta.attack)}</strong></div><p>${loc(detail.attack)}</p></div>
      </section>

      <section class="character-section" id="char-section-5"><h3><span>5</span>${labels[4]}</h3>
        <div class="tip-box">${loc(meta.tip)}<br><small>${tr("guideNote")}</small></div>
      </section>

      <section class="character-section" id="char-section-6"><h3><span>6</span>${labels[5]}</h3>
        <div class="matchup-grid">
          <div class="matchup-good"><small>${lang === "ko" ? "상대하기 좋음" : "Favorable"}</small><strong>${loc(detail.strong)}</strong></div>
          <div class="matchup-bad"><small>${lang === "ko" ? "주의할 상대" : "Watch out for"}</small><strong>${loc(detail.weak)}</strong></div>
        </div>
        <p>${loc(detail.matchup)}</p>
        <p><small>${tr("matchupNote")}</small></p>
      </section>

      <section class="character-section" id="char-section-7"><h3><span>7</span>${labels[6]}</h3>
        <table class="stat-table history-table"><tbody>${historyRows}</tbody></table>
      </section>

      <section class="character-section" id="char-section-8"><h3><span>8</span>${labels[7]}</h3><p>${loc(detail.other)}</p>
        <p><button class="guide-link" data-dialog-open="guide:combat"><span>⚔</span>${loc(guides.find((guide) => guide.id === "combat").title)}</button></p>
      </section>
    </div>`;
  document.title = `${id[0].toUpperCase()+id.slice(1)} | COLORS 위키`;
  if (!$("#article-dialog").open) $("#article-dialog").showModal();
  if (updateUrl && location.pathname !== `${BASE}wiki/characters/${id}/`) {
    history.pushState(null, "", `${BASE}wiki/characters/${id}/`);
  }
}

function openGuide(id, updateUrl = true) {
  const guide = guides.find(g => g.id === id);
  if (!guide) return;
  const extraSections = guide.sections?.map(([title, body], index) => `<section class="character-section"><h3><span>${index + 1}</span>${loc(title)}</h3><p>${loc(body)}</p></section>`).join("") || "";
  $("#dialog-content").innerHTML = `<div class="article-hero" style="--char:#e63232"><div><p>${tr("allGuides")}</p><h2>${loc(guide.title)}</h2><p>${loc(guide.desc)}</p></div></div><div class="article-body"><h3>${lang==="ko"?"핵심 내용":"Essentials"}</h3><p>${loc(guide.body)}</p>${extraSections}<div class="tip-box">${tr("dataNote")} · ${tr("liveDataDesc")}</div></div>`;
  document.title = `${loc(guide.title)} | COLORS 위키`;
  if (!$("#article-dialog").open) $("#article-dialog").showModal();
  if (id === "beta1" && updateUrl && wikiPath() !== "/wiki/seasons/beta-1/") {
    history.pushState(null, "", `${BASE}wiki/seasons/beta-1/`);
  }
  if (id === "beta2" && updateUrl && wikiPath() !== "/wiki/seasons/beta-2/") {
    history.pushState(null, "", `${BASE}wiki/seasons/beta-2/`);
  }
}

function openArticle(value) {
  const [type,id] = value.split(":");
  if (type === "char") openCharacter(id);
  if (type === "guide") openGuide(id);
}

function routeFromPath() {
  const path = wikiPath();
  const charMatch = path.match(/^\/wiki\/characters\/([a-z]+)\/?$/);
  if (charMatch && characterMeta[charMatch[1]]) return { route: "characters", character: charMatch[1] };
  if (path.startsWith("/wiki/characters")) return { route: "characters" };
  if (path.startsWith("/wiki/seasons/beta-1")) return { route: "systems", guide: "beta1" };
  if (path.startsWith("/wiki/seasons/beta-2")) return { route: "systems", guide: "beta2" };
  if (path.startsWith("/wiki/guides")) return { route: "systems" };
  if (path.startsWith("/wiki/shop")) return { route: "shop" };
  if (path.startsWith("/wiki/patches")) return { route: "patches" };
  return { route: "home" };
}

function closeArticle() {
  $("#article-dialog").close();
  if (/^\/wiki\/characters\/[a-z]+\/?$/.test(wikiPath())) {
    history.pushState(null, "", routePaths.characters);
    renderRoute("characters", false);
  }
}

function search(query) {
  const q = query.trim().toLowerCase();
  const box = $("#search-results");
  if (!q) { box.classList.add("hidden"); return; }
  const results = [
    ...Object.keys(characterMeta).map(id => ({ open:`char:${id}`, title:id[0].toUpperCase()+id.slice(1), desc:loc(characterMeta[id].desc), hay:[id, ...characterMeta[id].role, ...characterMeta[id].attack, ...characterMeta[id].desc].join(" ").toLowerCase() })),
    ...guides.map(g => ({ open:`guide:${g.id}`, title:loc(g.title), desc:loc(g.desc), hay:[g.id,...g.title,...g.desc,...g.body].join(" ").toLowerCase() })),
  ].filter(item => item.hay.includes(q)).slice(0,8);
  box.innerHTML = results.length ? results.map(r=>`<button class="search-item" data-open="${r.open}"><span>◇</span><span><strong>${r.title}</strong><small>${r.desc}</small></span></button>`).join("") : `<div class="search-item">${tr("noResult")}</div>`;
  box.classList.remove("hidden");
}

document.addEventListener("click", (event) => {
  const routeButton = event.target.closest("[data-route]");
  const openButton = event.target.closest("[data-open]");
  const dialogButton = event.target.closest("[data-dialog-open]");
  if (routeButton) {
    renderRoute(routeButton.dataset.route);
    if (!event.target.closest(".quick-links")) $("#page-content").focus({ preventScroll:true });
    $("#search-results").classList.add("hidden");
  }
  if (openButton) { openArticle(openButton.dataset.open); $("#search-results").classList.add("hidden"); }
  if (dialogButton) openArticle(dialogButton.dataset.dialogOpen);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && document.activeElement !== $("#search-input")) { event.preventDefault(); $("#search-input").focus(); }
  if ((event.key === "Enter" || event.key === " ") && document.activeElement?.classList.contains("character-card")) { event.preventDefault(); openArticle(document.activeElement.dataset.open); }
});
$("#search-input").addEventListener("input", (event) => search(event.target.value));
$("#search-form").addEventListener("submit", (event) => event.preventDefault());
$("#lang-button").addEventListener("click", () => {
  lang = lang === "ko" ? "en" : "ko";
  localStorage.setItem("skullCreekLang", lang);
  applyLanguage();
});
$("#dialog-close").addEventListener("click", closeArticle);
$("#article-dialog").addEventListener("click", (event) => {
  if (event.target === $("#article-dialog")) closeArticle();
});

window.addEventListener("popstate", () => {
  const target = routeFromPath();
  if ($("#article-dialog").open) $("#article-dialog").close();
  renderRoute(target.route, false);
  if (target.character) openCharacter(target.character, false);
  if (target.guide) openGuide(target.guide, false);
});

const initialTarget = routeFromPath();
route = initialTarget.route;
applyLanguage();
if (initialTarget.character) openCharacter(initialTarget.character, false);
if (initialTarget.guide) openGuide(initialTarget.guide, false);
