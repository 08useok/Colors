import { CHARACTERS } from "./config/characters.js";
import { BETA_CHARACTERS } from "./config/beta-characters.js";
import { SKINS } from "./config/skins.js";

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
    allCharacters: "전체 캐릭터", charDesc: "서로 다른 색과 전투 방식을 가진 11명의 파이터를 만나보세요.",
    viewAll: "모두 보기", beginnerGuides: "초보자 가이드", guideDesc: "처음 전장에 들어가기 전에 알아둘 핵심 정보",
    latestPatch: "최근 업데이트", seasonDesc: "베타 시즌 1의 최신 변경 사항", hp: "체력", damage: "공격", range: "사거리",
    speed: "이동 속도", cooldown: "공격 간격", reload: "장전", role: "역할", basicAttack: "일반 공격",
    strategy: "초보자 운영 팁", related: "관련 문서", open: "문서 보기", allGuides: "게임 가이드",
    guidePageDesc: "전투 규칙부터 계정 성장까지, 플레이에 필요한 시스템을 익혀보세요.",
    shopTitle: "상점과 수집품", shopDesc: "재화, 캐릭터 성장, 스킨과 꾸미기 아이템 정보를 확인하세요.",
    patchTitle: "패치노트", patchDesc: "COLORS의 시즌별 주요 변경 내역입니다.", free: "무료",
    noResult: "검색 결과가 없습니다.", dataNote: "베타 시즌 게임 코드 기준", guideNote: "공략은 초보자용 추천이며 절대적인 정답은 아닙니다.",
  },
  en: {
    wiki: "Game Wiki", home: "Home", characters: "Characters", systems: "Game Guide", shop: "Shop",
    patches: "Patch Notes", play: "Play Game", official: "OFFICIAL GAME WIKI",
    heroTitle: "Before entering battle,<br><em>learn every color.</em>",
    heroDesc: "Explore character stats, combat rules, maps, seasons, and everything else in COLORS.",
    searchPlaceholder: "Search characters, skills, and maps", battleRules: "Combat Rules", categories: "Categories",
    liveData: "Beta game data", liveDataDesc: "Stats and basic attacks use the Beta config.",
    footer: "Numerical information is loaded from the current game configuration.", backGame: "Back to game →",
    allCharacters: "All Characters", charDesc: "Meet eleven fighters with distinct colors and combat styles.",
    viewAll: "View all", beginnerGuides: "Beginner Guides", guideDesc: "Essentials to know before your first battle",
    latestPatch: "Latest Updates", seasonDesc: "Recent changes in Beta Season 1", hp: "HP", damage: "Damage", range: "Range",
    speed: "Move Speed", cooldown: "Cooldown", reload: "Reload", role: "Role", basicAttack: "Basic Attack",
    strategy: "Beginner Strategy", related: "Related articles", open: "Open article", allGuides: "Game Guide",
    guidePageDesc: "Learn the systems you need, from combat rules to account progression.",
    shopTitle: "Shop & Collections", shopDesc: "Currencies, character progression, skins, and cosmetics.",
    patchTitle: "Patch Notes", patchDesc: "Major changes across COLORS seasons.", free: "Free",
    noResult: "No results found.", dataNote: "Beta Season game config", guideNote: "Tips are beginner recommendations, not absolute rules.",
  },
};

const characterMeta = {
  red: {
    role: ["탱커", "Tank"], attack: ["크림슨 슬래시", "Crimson Slash"],
    desc: ["높은 체력과 빠른 기동력으로 거리를 좁혀 연속 타격을 가하는 근접 파이터입니다.", "A durable, fast melee fighter who closes the gap and strikes twice."],
    tip: ["벽과 수풀을 이용해 접근하세요. 원거리 교전보다 짧은 순간에 거리를 좁히는 것이 중요합니다.", "Use walls and bushes to approach. Commit only when you can close the gap quickly."],
    range: 5, damage: 4400,
  },
  green: {
    role: ["암살자", "Assassin"], attack: ["부메랑 투척", "Boomerang Throw"],
    desc: ["네 개의 부메랑을 부채꼴로 던지는 중거리 파이터입니다. 가까울수록 모든 탄을 맞히기 쉽습니다.", "A mid-range fighter throwing four boomerangs in a fan. Close targets can take every hit."],
    tip: ["너무 멀면 피해량이 줄어듭니다. 적의 공격을 피한 직후 한 걸음 접근해 집중 사격하세요.", "Long-range damage falls off. Step in after dodging and land the full spread."],
    range: 7, damage: 3800,
  },
  blue: {
    role: ["저격수", "Sniper"], attack: ["정밀 사격", "Precision Shot"],
    desc: ["가장 긴 사거리와 빠른 탄속을 가진 원거리 파이터입니다. 체력은 가장 낮습니다.", "A long-range marksman with the greatest reach and high projectile speed, but the lowest health."],
    tip: ["전장의 가장자리에서 사거리를 유지하세요. 근접 파이터가 다가오면 공격보다 거리 확보가 먼저입니다.", "Hold max range near open lanes. Reposition before firing when melee fighters get close."],
    range: 16, damage: 1500,
  },
  orange: {
    role: ["범위 딜러", "Area Damage"], attack: ["폭발탄", "Explosive Round"],
    desc: ["직격 피해 뒤 다섯 갈래 폭발을 일으켜 좁은 지역을 장악합니다.", "Explosive shots deal direct damage and split into a five-way blast."],
    tip: ["적의 발밑보다 도망갈 방향을 겨냥하세요. 벽과 좁은 길에서 파편을 맞히기 쉽습니다.", "Aim where enemies will retreat. Corridors make the five-way blast much harder to avoid."],
    range: 9, damage: 4250,
  },
  yellow: {
    role: ["컨트롤러", "Controller"], attack: ["전기 구슬", "Volt Shot"],
    desc: ["전기 투사체로 적의 이동 속도를 낮춰 후속 공격을 연결하는 제어형 파이터입니다.", "Electric projectiles slow enemies and set up follow-up attacks."],
    tip: ["첫 명중의 감속을 활용해 두 번째 공격을 맞히세요. 팀 모드에서는 아군의 추격을 돕습니다.", "Use the first hit's slow to secure the next. In teams, slow targets for allies to chase."],
    range: 12, damage: 2400,
  },
  cyan: {
    role: ["광역 제압", "Area Control"], attack: ["래피드 버스트", "Rapid Burst"],
    desc: ["여섯 발의 일렬 탄막으로 넓은 지역을 제압하며, 공격을 충전해 궁극기를 사용합니다.", "Suppresses a wide lane with six shots and charges a powerful ultimate."],
    tip: ["탄막의 중앙을 적에게 맞추기보다 이동 경로를 덮으세요. 궁극기는 좁은 길에서 효과적입니다.", "Cover escape routes with the spread. Save the ultimate for lanes where knockback matters."],
    range: 8.33, damage: 3600,
  },
  crimson: {
    role: ["근접 브루저", "Melee Bruiser"], attack: ["3연속 펀치", "Triple Punch"],
    desc: ["부채꼴 범위를 세 번 두들기고, 벽까지 부수는 궁극기로 한타를 여는 근접 브루저입니다.", "A melee bruiser who hammers a fan-shaped area three times and opens fights with a wall-breaking ultimate."],
    tip: ["게임 내 가장 빠른 이동속도로 거리를 좁히세요. 궁극기 게이지는 죽어도 유지되니 아껴뒀다가 벽 뒤 적을 노리세요.", "Use the fastest movement in the game to close the gap. The ultimate gauge survives death, so save it for enemies hiding behind walls."],
    range: 2.5, damage: 2700,
  },
  purple: {
    role: ["지속 피해", "Damage over Time"], attack: ["맹독침", "Venom Needle"],
    desc: ["독침과 폭발 약병을 번갈아 사용해 직접 피해와 지속 피해를 함께 가합니다.", "Alternates venom needles and explosive vials for direct and damage-over-time pressure."],
    tip: ["독을 묻힌 뒤 거리를 유지하세요. 약병 공격은 체력이 낮은 적이나 모여 있는 적에게 사용하세요.", "Apply poison, then maintain distance. Use the vial to finish weak or grouped targets."],
    range: 13, damage: 3200,
  },
  pink: {
    role: ["탱커·서포터", "Tank / Support"], attack: ["리듬 스트라이크", "Rhythm Strike"],
    desc: ["높은 체력과 빠른 이동 속도를 갖추고, 원형 공격으로 적을 해치고 아군을 회복합니다.", "A fast, high-health support whose circular attack damages enemies and heals allies."],
    tip: ["혼자 추격하기보다 아군과 함께 움직이세요. 공격과 회복이 동시에 적용되는 위치가 가장 좋습니다.", "Stay with allies. Position the circle to hit enemies and heal teammates at the same time."],
    range: 4.5, damage: 2400,
  },
  gold: {
    role: ["고장 지대 컨트롤러", "Malfunction Controller"], attack: ["연쇄 금광석", "Chain Gold Ore"],
    desc: ["2x2 금광석이 적중하면 좌우 분열 후 금괴 여섯 발로 한 번 더 갈라집니다. 단계별 적중으로 고장 지대를 충전합니다.", "A 2x2 gold ore splits left and right on impact, then each fragment bursts into six gold bars. Stage hits charge Malfunction Zone."],
    tip: ["첫 광석은 벽이나 적에게 맞혀야 분열합니다. 궁극기는 근접 전투에서 상대의 공격과 이동을 동시에 끊는 데 사용하세요.", "Land the first ore on a wall or enemy to trigger the split. Use the ultimate in close fights to deny attacks and movement together."],
    range: 8, damage: 4000,
  },
  ivory: {
    role: ["지역 제어", "Area Control"], attack: ["안 녹는 아이스크림", "Unmelting Ice Cream"],
    desc: ["아이스크림 투척과 지속 장판으로 전장을 제어하는 파이터입니다.", "An area-control fighter who uses ice cream throws and lingering zones to control the battlefield."],
    tip: ["적의 현재 위치보다 이동할 길목에 아이스크림을 던지세요. 장판이 남아 있는 동안은 무리하게 추격하지 않아도 공간을 지킬 수 있습니다.", "Throw ice cream at routes the enemy will take, not only their current position. The lingering zone can hold space without over-chasing."],
    range: 10, damage: 1100,
  },
};

const characterDetails = {
  red: {
    setting: ["붉은색을 대표하는 근접 탱커입니다. 높은 체력과 빠른 발을 이용해 선두에서 교전을 여는 전투 콘셉트로 설계되었습니다. 별도의 공식 배경 이야기는 아직 공개되지 않았습니다.", "The red close-range tank. Red is designed to start fights with high health and exceptional speed. No official story background has been published yet."],
    attack: ["전방의 가까운 범위를 두 차례 연속 타격합니다. 한 번의 공격 입력으로 두 타격이 이어지며, 모두 적중하면 총 4,400의 기본 피해를 줍니다.", "Strikes the close area ahead twice in sequence. Both hits deal 4,400 total base damage."],
    strong: ["Blue, Purple처럼 거리를 유지해야 하는 파이터", "Fighters who depend on distance, such as Blue and Purple"],
    weak: ["Yellow의 감속과 Orange의 접근 차단", "Yellow's slow and Orange's area denial"],
    matchup: ["수풀과 벽을 이용해 사격선을 끊은 뒤 단숨에 접근하면 유리합니다. 넓은 공간에서 감속에 걸리면 접근 수단이 없어 불리합니다.", "Break lines of fire with bushes and walls, then close the gap at once. Slows in open space leave Red with few options."],
    history: [["초기", "최초 3개 캐릭터 중 하나로 등장", "Launch", "One of the original three characters"], ["v1.3.2", "이동 속도 상향", "v1.3.2", "Movement speed increased"], ["v1.3.9", "체력 9,800, 공격 간격 0.55초로 조정", "v1.3.9", "Adjusted to 9,800 HP and 0.55s cooldown"], ["v1.4.9", "공격 가로 범위 조정", "v1.4.9", "Horizontal attack reach adjusted"]],
    other: ["공격 유형은 코드에서 punch로 분류됩니다. 모든 수치는 캐릭터 레벨 보정이 적용되기 전 기본값입니다.", "The attack is classified as punch in the game config. Listed values are base stats before character-level bonuses."],
  },
  green: {
    setting: ["녹색을 대표하는 기동형 암살자입니다. 네 발의 부메랑을 한 번에 던져 가까운 적에게 큰 집중 피해를 주는 콘셉트입니다. 공식 배경 이야기는 아직 공개되지 않았습니다.", "The green mobile assassin. Green throws four boomerangs at once for heavy close-to-mid-range burst. No official story background has been published."],
    attack: ["부채꼴로 부메랑 네 개를 발사합니다. 각 부메랑은 베타 기준 950 피해를 주며, 멀리 있는 적에게는 피해 감소가 적용됩니다. 부메랑은 최대 거리에서 되돌아옵니다.", "Fires four boomerangs in a fan. Each deals 950 damage in Beta, with falloff against distant targets, then returns at maximum range."],
    strong: ["느리고 큰 표적, 좁은 길에 들어온 파이터", "Slow targets and fighters caught in narrow lanes"],
    weak: ["Red의 강제 근접전과 Blue의 장거리 견제", "Red's point-blank pressure and Blue's long-range poke"],
    matchup: ["네 발을 모두 맞힐 수 있는 중근거리가 가장 강합니다. Blue를 추격할 때는 탄을 피한 뒤 접근하고, Red에게는 최대 사거리를 유지하세요.", "Green is strongest where all four shots can connect. Dodge before chasing Blue, and hold maximum range against Red."],
    history: [["초기", "최초 3개 캐릭터 중 하나로 등장", "Launch", "One of the original three characters"], ["v1.2.5", "부메랑 피해량 조정", "v1.2.5", "Boomerang damage adjusted"], ["v1.4.3", "부메랑 피해 950, 사거리와 판정 개선", "v1.4.3", "Set to 950 damage with range and hitbox improvements"], ["v1.4.13", "사거리 증가, 발사 각도 축소", "v1.4.13", "Range increased and spread narrowed"]],
    other: ["공격 한 번의 이론상 최대 기본 피해는 3,800입니다. 원거리 피해 감소 때문에 실제 피해는 거리와 적중 수에 따라 달라집니다.", "The theoretical maximum base damage is 3,800. Actual damage varies with range and the number of boomerangs landed."],
  },
  blue: {
    setting: ["파란색을 대표하는 장거리 저격수입니다. 낮은 체력을 긴 사거리와 빠른 탄속으로 보완하는 정밀 사격 콘셉트입니다. 공식 배경 이야기는 아직 공개되지 않았습니다.", "The blue long-range sniper. Blue offsets low health with superior range and fast projectiles. No official story background has been published."],
    attack: ["직선으로 빠른 탄환 한 발을 발사해 베타 기준 1,000의 피해를 줍니다. 사거리 16으로 기본 캐릭터 중 가장 먼 거리에서 공격할 수 있습니다.", "Fires one fast, straight projectile for 1,000 damage in Beta. Its range of 16 is the longest among the base roster."],
    strong: ["Orange, Yellow처럼 중거리에서 준비 시간이 필요한 파이터", "Mid-range fighters who need setup time, such as Orange and Yellow"],
    weak: ["Red와 Green의 빠른 접근", "Fast approaches from Red and Green"],
    matchup: ["항상 퇴로를 남기고 최대 사거리 부근에서 싸우세요. 벽 가까이 몰리면 낮은 체력 때문에 빠르게 쓰러질 수 있습니다.", "Keep an escape route and fight near maximum range. Getting pinned against a wall is especially dangerous with Blue's low health."],
    history: [["초기", "최초 3개 캐릭터 중 하나로 등장", "Launch", "One of the original three characters"], ["v1.3.2", "공격 간격 0.3초로 조정", "v1.3.2", "Cooldown adjusted to 0.3s"], ["v1.4.3", "체력 4,800, 탄속 32로 조정", "v1.4.3", "Adjusted to 4,800 HP and 32 projectile speed"], ["v1.4.14", "전용 3D 모델과 걷기 애니메이션 적용", "v1.4.14", "Received a dedicated 3D model and walk animation"]],
    other: ["공격 유형은 bullet입니다. 베타 일반 공격은 탄환 한 발당 1,000 피해, 탄속 35.2를 기준으로 합니다.", "The attack type is bullet. Its Beta basic attack deals 1,000 per shot with 35.2 projectile speed."],
  },
  orange: {
    setting: ["주황색을 대표하는 광역 피해 파이터입니다. 폭탄의 직격과 다섯 갈래 파편으로 길목을 통제하는 콘셉트입니다. 공식 배경 이야기는 아직 공개되지 않았습니다.", "The orange area-damage fighter. Orange controls lanes with direct bomb hits and five-way fragments. No official story background has been published."],
    attack: ["베타 일반 공격은 폭탄 한 발을 던져 적중 지점 주변에 750의 범위 피해를 줍니다. 공식 능력 ‘광역 폭발’ 적용 시 폭발 범위가 25% 증가합니다.", "The Beta basic attack throws one bomb that deals 750 area damage around the impact. The Wide Blast ability increases its blast radius by 25%."],
    strong: ["Pink 같은 큰 근접 표적과 좁은 길의 적", "Large close-range targets such as Pink and enemies in corridors"],
    weak: ["Blue의 사거리와 Green의 빠른 측면 접근", "Blue's range and Green's fast flanks"],
    matchup: ["적의 현재 위치보다 이동할 방향에 폭탄을 놓으세요. 파편을 모두 맞히려 욕심내기보다 퇴로를 차단하는 것이 안정적입니다.", "Place bombs on escape paths rather than current positions. Denying movement is more reliable than chasing every fragment hit."],
    history: [["v1.3.0", "네 번째 캐릭터로 정식 추가", "v1.3.0", "Added as the fourth character"], ["v1.3.2", "파편 범위 조정", "v1.3.2", "Fragment range adjusted"], ["v1.4.2", "직격 750, 파편 700으로 조정", "v1.4.2", "Adjusted to 750 direct and 700 fragment damage"], ["v1.4.10", "장전 0.5초, 폭탄 사거리 9로 개선", "v1.4.10", "Improved to 0.5s reload and 9 bomb range"]],
    other: ["베타 시즌에서는 기존의 다섯 갈래 파편 대신 하나의 원형 폭발 판정을 사용합니다. 폭탄 속도는 22, 사거리는 9입니다.", "Beta Season replaces the former five-way fragments with a single circular blast. Bomb speed is 22 and range is 9."],
  },
  yellow: {
    setting: ["노란색을 대표하는 전기 제어 파이터입니다. 직접 피해와 감속을 결합해 상대의 이동을 제한하는 콘셉트입니다. 공식 배경 이야기는 아직 공개되지 않았습니다.", "The yellow electric controller. Yellow combines direct damage and slows to limit enemy movement. No official story background has been published."],
    attack: ["전기 구슬 한 발을 발사해 2,400의 기본 피해를 주고, 명중한 적의 이동 속도를 1.5초 동안 감소시킵니다.", "Fires an electric orb for 2,400 base damage and slows the target's movement for 1.5 seconds."],
    strong: ["Red와 Green처럼 접근이 필요한 파이터", "Approach-dependent fighters such as Red and Green"],
    weak: ["Blue의 장거리 사격", "Blue's long-range fire"],
    matchup: ["첫 공격은 피해보다 감속을 건다는 생각으로 사용하세요. 감속된 적의 이동 방향을 읽으면 후속 공격 적중률이 크게 올라갑니다.", "Treat the first hit as setup for the slow. Reading the slowed movement makes follow-up shots much easier."],
    history: [["v1.3.7", "다섯 번째 캐릭터로 추가", "v1.3.7", "Added as the fifth character"], ["v1.3.9", "사거리 12, 감속 1.5초로 조정", "v1.3.9", "Adjusted to 12 range and 1.5s slow"], ["v1.4.3", "피해량 2,400으로 조정", "v1.4.3", "Damage adjusted to 2,400"], ["v1.4.4", "감전 시각 효과 강화", "v1.4.4", "Enhanced electric hit effects"]],
    other: ["공격 유형은 electric입니다. 감속은 피해와 별개로 위치 싸움과 아군의 추격을 돕는 제어 효과입니다.", "The attack type is electric. Its slow is a control effect that helps positioning and allied pursuit beyond raw damage."],
  },
  cyan: {
    setting: ["청록색을 대표하는 광역 제압 파이터입니다. 넓은 탄막과 충전형 궁극기로 다수의 적과 길목을 밀어내는 콘셉트입니다. 공식 배경 이야기는 아직 공개되지 않았습니다.", "The cyan area-control fighter. Cyan uses a broad barrage and charged ultimate to suppress groups and lanes. No official story background has been published."],
    attack: ["나란히 퍼지는 투사체 여섯 발을 발사하며 베타 기준 각 탄은 450 피해를 줍니다. 일반 공격을 적중시켜 궁극기 질풍 강타를 충전할 수 있습니다.", "Fires six parallel projectiles for 450 damage each in Beta. Landing basic attacks charges the Gale Strike ultimate."],
    strong: ["Orange와 Pink처럼 넓은 탄막을 피하기 어려운 표적", "Targets that struggle to avoid broad barrages, such as Orange and Pink"],
    weak: ["Blue의 장거리 견제", "Blue's long-range pressure"],
    matchup: ["한 명에게 모든 탄을 맞히기보다 적의 이동 공간을 줄이는 데 집중하세요. 질풍 강타는 자기장 가장자리에서 밀어내기와 함께 사용하면 강력합니다.", "Focus on reducing movement space rather than landing every shot. Gale Strike is especially strong for knockback near the zone edge."],
    history: [["v1.4.0", "여섯 번째 캐릭터로 추가", "v1.4.0", "Added as the sixth character"], ["v1.4.4", "광역 제압 역할과 효과 개선", "v1.4.4", "Improved area-control role and effects"], ["v1.4.8", "알파 시즌 4 전환과 함께 조정", "v1.4.8", "Adjusted with the Alpha Season 4 transition"], ["현재", "질풍 강타 궁극기와 전용 버튼 지원", "Current", "Supports the Gale Strike ultimate and dedicated control"]],
    other: ["베타 일반 공격 여섯 발의 이론상 최대 피해는 2,700입니다. 궁극기는 12회 충전이 필요하며 피해와 넉백을 함께 적용합니다.", "All six Beta projectiles theoretically deal 2,700. The ultimate requires 12 charges and applies both damage and knockback."],
  },
  crimson: {
    setting: ["진홍색을 대표하는 근접 브루저입니다. 레드를 보고 권투를 시작해 세계적인 선수가 됐지만, 정작 레드는 못 이긴다고 말합니다. 베타 시즌 1에서 영웅 등급으로 합류했습니다.", "The crimson melee bruiser. Crimson took up boxing after watching Red and became world-class, yet still claims he cannot beat Red. Joined in Beta Season 1 as a Hero-tier character."],
    attack: ["전방 84도 부채꼴에 -25도, 0도, +25도 순서로 0.12초 간격 3연타를 넣습니다. 타당 900 피해로 전부 맞히면 2,700이며, 범위 안 여러 적을 동시에 때립니다.", "Throws three punches at -25, 0 and +25 degrees within an 84-degree fan, 0.12s apart. Each hit deals 900 for 2,700 total and strikes every enemy in the arc."],
    strong: ["Blue처럼 체력이 낮고 근접전을 피하려는 원거리 딜러", "Squishy ranged fighters who want to avoid melee, such as Blue"],
    weak: ["Purple의 지속 피해와 거리를 유지하는 견제", "Purple's damage over time and disengage pressure"],
    matchup: ["사거리가 2.5타일로 가장 짧습니다. 벽과 수풀로 접근 경로를 가린 뒤 한 번에 붙으세요. 궁극기는 벽을 부수며 들어가는 진입기로도 쓸 수 있습니다.", "With the shortest range at 2.5 tiles, approach behind walls and bushes, then commit once. The ultimate doubles as an engage tool since it destroys walls."],
    history: [["v1.5.0", "베타 시즌 1 신규 영웅 캐릭터로 추가", "v1.5.0", "Added as the Beta Season 1 Hero-tier character"]],
    other: ["궁극기 KO 스트레이트는 일반 공격 9회 명중으로 충전되며, 정면 5×5 범위에 2,500 피해와 넉백을 주고 범위 안의 벽을 영구히 제거합니다. 게이지는 사망해도 초기화되지 않습니다.", "The KO Straight ultimate charges from nine basic-attack hits, deals 2,500 damage with knockback in a 5x5 area ahead, and permanently removes walls inside it. The gauge is not reset on death."],
  },
  purple: {
    setting: ["보라색을 대표하는 지속 피해 컨트롤러입니다. 독침과 약병을 번갈아 사용해 회복과 위치 선정에 압박을 주는 콘셉트입니다. 공식 배경 이야기는 아직 공개되지 않았습니다.", "The purple damage-over-time controller. Purple alternates needles and vials to pressure healing and positioning. No official story background has been published."],
    attack: ["베타에서는 11도 부채꼴의 독침 두 발과 폭발 약병을 번갈아 사용합니다. 독침은 발당 700, 약병은 넓은 범위에 3,040 피해를 줍니다.", "Beta alternates two needles in an 11-degree fan with an explosive vial. Each needle deals 700, while the vial deals 3,040 area damage."],
    strong: ["Pink처럼 높은 체력과 회복에 의존하는 파이터", "High-health or healing-dependent fighters such as Pink"],
    weak: ["Red와 Green의 빠른 근접 압박", "Fast close-range pressure from Red and Green"],
    matchup: ["독침을 맞힌 뒤 무리하게 추격하지 말고 지속 피해를 활용하세요. 약병 순서일 때는 수풀이나 좁은 길의 적을 노리세요.", "After applying poison, let the damage tick instead of over-chasing. Use the vial against enemies in bushes or narrow lanes."],
    history: [["v1.4.3", "독침과 약병을 쓰는 캐릭터로 추가", "v1.4.3", "Added with alternating needle and vial attacks"], ["v1.4.6", "약병 폭발 범위 하향", "v1.4.6", "Vial blast radius reduced"], ["v1.4.10", "체력 6,000, 사거리 13으로 개선", "v1.4.10", "Improved to 6,000 HP and 13 range"], ["현재", "독 지속 피해와 약병 마무리 구조 유지", "Current", "Retains poison pressure and vial-finisher flow"]],
    other: ["공격 유형은 poison입니다. 독에 걸린 대상은 지속 피해를 받고 회복 효율도 제한될 수 있어 직접 피해 수치 이상으로 압박을 줍니다.", "The attack type is poison. Damage over time and possible healing reduction create pressure beyond the direct damage value."],
  },
  pink: {
    setting: ["분홍색을 대표하는 탱커 겸 서포터입니다. 높은 체력과 빠른 이동, 음악을 연상시키는 원형 공격으로 아군과 함께 전진하는 콘셉트입니다. 공식 배경 이야기는 아직 공개되지 않았습니다.", "The pink tank-support. Pink advances with allies using high health, fast movement, and a music-inspired circular attack. No official story background has been published."],
    attack: ["자신을 중심으로 원형 파동을 발생시킵니다. 베타 기준 범위 안의 적에게 2,400 피해를 주고 아군에게는 1,600의 체력을 회복시킵니다.", "Creates a circular wave centered on Pink. In Beta it deals 2,400 damage to enemies and heals allies for 1,600."],
    strong: ["Purple을 제외한 근접 난전과 팀 교전", "Close brawls and team fights, except against Purple's poison pressure"],
    weak: ["Purple의 지속 피해와 Blue의 장거리 견제", "Purple's damage over time and Blue's long-range pressure"],
    matchup: ["아군과 적을 동시에 범위에 넣는 위치가 가장 좋습니다. 높은 체력만 믿고 혼자 들어가면 짧은 사거리 때문에 집중 공격을 받기 쉽습니다.", "Position to catch allies and enemies in the same wave. Entering alone wastes the support value and exposes Pink's short range."],
    history: [["v1.4.6", "여덟 번째 기본 캐릭터로 추가", "v1.4.6", "Added as the eighth base character"], ["v1.4.7", "기타 모델과 음파 효과 개선", "v1.4.7", "Improved guitar model and sound-wave effects"], ["v1.4.10", "추가 범위 보너스 조정", "v1.4.10", "Adjusted bonus attack range"], ["현재", "체력 11,500의 최고 체력 캐릭터", "Current", "Highest-health character at 11,500 HP"]],
    other: ["공격 유형은 heal_circle입니다. 기본 게임 설정에서는 공격 피해와 회복량이 각각 관리되므로 밸런스 패치에서 서로 다르게 조정될 수 있습니다.", "The attack type is heal_circle. Damage and healing are configured separately and may change independently in balance updates."],
  },
};

characterDetails.gold = {
  setting: ["금을 사랑하는 전설 등급 컨트롤러입니다. 광석을 단계적으로 분열시켜 전장을 넓게 압박합니다.", "A Legendary controller who loves gold and pressures wide areas through staged ore splits."],
  attack: ["첫 광석은 4,000 피해와 1.5타일 범위 피해를 주고 좌우로 분열합니다. 2단계는 각 2,000 피해, 마지막 금괴는 여섯 방향으로 각 1,000 피해를 줍니다.", "The first ore deals 4,000 damage with a 1.5-tile splash then splits sideways. Stage two deals 2,000 each; the final six gold bars deal 1,000 each."],
  strong: ["Crimson, Purple, Pink처럼 접근하거나 좁은 범위에 머무는 상대", "Close or confined fighters such as Crimson, Purple, and Pink"],
  weak: ["Blue, Yellow, Cyan의 장거리 견제", "Long-range pressure from Blue, Yellow, and Cyan"],
  matchup: ["분열 경로를 벽과 통로에 맞춰 예측하기 어렵게 만드세요. 고장 지대 안의 적은 공격할 수 없고 이동 속도가 50% 감소합니다.", "Use walls and lanes to make split paths unpredictable. Enemies in Malfunction Zone cannot attack and move 50% slower."],
  history: [["v1.5.2", "베타 시즌 2 신규 전설 캐릭터", "v1.5.2", "Added as the Beta Season 2 Legendary fighter"]],
  other: ["궁극기는 일반 공격 단계별 적중으로 최대 12 충전됩니다. 한 번의 일반 공격에서 얻는 충전량은 최대 6입니다.", "The ultimate needs 12 charge from stage hits. A single basic attack can contribute at most 6 charge."]
};

characterDetails.ivory = {
  setting: ["아이스크림 가게의 직원입니다. 아이스크림을 던져 착탄 지점과 주변 길목을 장악하는 지역 제어형 파이터입니다.", "An ice cream shop employee who controls impact points and nearby lanes with thrown ice cream."],
  attack: ["최대 사거리 10타일에 아이스크림을 던집니다. 착탄 시 1,100 피해를 주고, 4초 동안 매초 1,100 피해를 주는 장판을 만듭니다. 장판 피해는 중첩되지 않습니다.", "Throws ice cream up to 10 tiles. It deals 1,100 impact damage and leaves a four-second zone that deals 1,100 damage each second. Zone damage does not stack."],
  strong: ["좁은 길에서 이동 경로가 제한된 파이터", "Fighters whose movement is limited in narrow lanes"],
  weak: ["장판 밖에서 긴 사거리로 견제하는 파이터", "Fighters who can poke from long range outside the zone"],
  matchup: ["직접 명중만 노리기보다 도주로와 수풀 입구를 장판으로 막으세요. 궁극기 단체 주문은 여러 길목을 동시에 막거나 한 지역에 압박을 몰아줄 때 효과적입니다.", "Block escape routes and bush entrances with zones instead of relying only on direct hits. Group Order is effective for covering multiple lanes or concentrating pressure on one area."],
  history: [["v1.5.3", "베타 시즌 3 신규 플레이어블 캐릭터로 추가", "v1.5.3", "Added as a new playable fighter in Beta Season 3"]],
  other: ["궁극기 단체 주문은 목표 지점의 중앙과 네 방향에 아이스크림 5개를 던집니다. 궁극기 게이지는 일반 공격과 장판 피해가 적중할 때 충전됩니다.", "Group Order throws five ice creams at the target area: one in the center and one in each cardinal direction. Its gauge charges when basic attacks and zone damage hit."],
};

const guides = [
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
  { id:"modes", icon:"◉", title:["게임 모드", "Game Modes"], desc:["쇼다운, 나무 베기, Rotation과 Take Down의 승리 조건입니다.", "Win conditions for Showdown, Chop Wood, Rotation, and Take Down."], body:["나무 베기는 상대 팀의 나무를 먼저 파괴하는 팀 모드입니다. Rotation은 이벤트 단계를 이어서 진행하며, Take Down은 중앙 보스와 순위 경쟁을 함께 다룹니다.", "Chop Wood is a team race to destroy the enemy tree. Rotation chains event stages, while Take Down combines a central boss fight with ranking competition."] },
  { id:"account", icon:"▣", title:["계정과 성장", "Account & Progression"], desc:["트로피, 승률, 연승, 캐릭터 레벨과 저장 방식입니다.", "Trophies, win rate, streaks, character levels, and saves."], body:["계정에는 모드별 승패, 캐릭터별 기록, 트로피와 최고 연승이 저장됩니다. 캐릭터는 최대 6레벨까지 성장하며, 레벨에 따라 최대 체력과 공격력이 증가합니다.", "Accounts track records by mode and character, trophies, and best streak. Characters can grow to level 6, increasing maximum health and attack power."] },
  { id:"currency", icon:"◇", title:["재화", "Currencies"], desc:["코인, 크레딧과 트로피를 어디서 얻고 사용하는지 확인하세요.", "How to earn and spend coins, credits, and trophies."], body:["코인은 꾸미기 아이템 상점에서 사용합니다. 크레딧은 캐릭터 구매와 성장에 사용되며, 베타 크레딧은 시즌 테스트에서 별도로 관리됩니다. 트로피는 경기 결과와 연승 보너스로 오르거나 내려갑니다.", "Coins buy cosmetics. Credits unlock and upgrade characters, while beta credits are stored separately for season tests. Trophies rise or fall through match results and streak bonuses."] },
];

const patches = [
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
    ["Rotation 3일 진행과 글로벌 이벤트 단계 집계 추가", "Added three-day Rotation progression and global event stage totals"],
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
];

let lang = localStorage.getItem("skullCreekLang") === "en" ? "en" : "ko";
let route = "home";
const tr = (key) => copy[lang][key] || key;
const loc = (pair) => pair[lang === "ko" ? 0 : 1];
const fmt = (value) => new Intl.NumberFormat(lang === "ko" ? "ko-KR" : "en-US", { maximumFractionDigits: 2 }).format(value);

function wikiStats(id) {
  const fallbackColors = { crimson: 0x8b0000, gold: 0xd4a928 };
  return { color: fallbackColors[id], ...CHARACTERS[id], ...(BETA_CHARACTERS[id] || {}) };
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
  if (id === "orange") return { damage: stats.bombDamage, range: stats.bombRange };
  if (id === "yellow") return { damage: stats.electricDamage, range: stats.electricRange };
  if (id === "cyan") return { damage: stats.spreadLineDamage * stats.spreadLineCount, range: stats.spreadLineRange };
  if (id === "crimson") return { damage: stats.attackDamage * stats.attackCount, range: stats.attackRange };
  if (id === "gold") return { damage: stats.stage1Damage, range: stats.stage1Range };
  if (id === "ivory") return { damage: stats.iceCreamDamage, range: stats.iceCreamRange };
  if (id === "purple") return { damage: stats.vialDamage, range: stats.vialRange };
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
  return `${sectionHead(tr("shopTitle"), tr("shopDesc"))}
    <div class="skin-grid">${skins.map((skin) => `<article class="skin-card">
      <div class="skin-swatch">${skin.character[0].toUpperCase()}</div>
      <h3>${skin.name}</h3><p>${skin.character[0].toUpperCase()+skin.character.slice(1)} · ${skin.season.toUpperCase()}</p>
      <div class="price"><span class="rarity">${skin.rarity}</span><span>◈ ${skin.cost ? fmt(skin.cost) : tr("free")}</span></div>
    </article>`).join("")}</div>
    <div class="home-panels"><section class="info-panel"><h3>${lang === "ko" ? "재화 안내" : "Currency Guide"}</h3><p>${loc(guides.find(g=>g.id==="currency").body)}</p><button class="guide-link" data-open="guide:currency"><span>◇</span>${tr("open")}</button></section><section class="info-panel"><h3>${lang === "ko" ? "캐릭터 성장" : "Character Progression"}</h3><p>${loc(guides.find(g=>g.id==="account").body)}</p><button class="guide-link" data-open="guide:account"><span>▣</span>${tr("open")}</button></section></div>`;
}

function renderPatches() {
  return `${sectionHead(tr("patchTitle"), tr("patchDesc"))}<div class="patch-list">${patches.map(p => `<article class="patch-card">
    <time>${p.date}</time>
    <h3>${p.version} · ${loc(p.title)}</h3>
    <p class="patch-summary">${loc(p.summary)}</p>
    <h4>${lang === "ko" ? "주요 변경 사항" : "Key changes"}</h4>
    <ul>${p.items.map(i=>`<li>${loc(i)}</li>`).join("")}</ul>
    <div class="patch-impact"><strong>${lang === "ko" ? "플레이 영향" : "Gameplay impact"}</strong><p>${loc(p.impact)}</p></div>
  </article>`).join("")}</div>`;
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
      </section>

      <section class="character-section" id="char-section-7"><h3><span>7</span>${labels[6]}</h3>
        <table class="stat-table history-table"><tbody>${historyRows}</tbody></table>
      </section>

      <section class="character-section" id="char-section-8"><h3><span>8</span>${labels[7]}</h3><p>${loc(detail.other)}</p>
        <p><button class="guide-link" data-dialog-open="guide:combat"><span>⚔</span>${loc(guides[0].title)}</button></p>
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
