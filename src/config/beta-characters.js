const degrees = (value) => value * (Math.PI / 180);

// Beta Season balance source of truth. Values here are intentionally
// independent from the Alpha Season configuration in characters.js.
export const BETA_CHARACTERS = {
  red: {
    maxHealth: 9800, moveSpeedMultiplier: 1.4, attackCooldown: 0.55, reloadDuration: 0.9, maxAmmo: 3,
    attackRange: 5.5, attackHalfAngle: degrees(45), attackWidthMultiplier: 1 + 0.5 / 1.7,
    attackDamage: 2200, attackCount: 2, attackIntervalMs: 240,
    description: "레드는 TV에 나오는 복싱 선수입니다. 하지만 때로는 무식해서 펀치를 잘 못 때리죠.",
    descriptionEn: "Red is a boxer you see on TV. He is not always the sharpest, though, so his punches sometimes miss.",
    basicAttack: {
      name: "잽 잽",
      description: "레드의 주 공격 기술입니다. 왼쪽 팔로 오른쪽을 때리고 오른쪽 팔로 왼쪽을 때리지요.",
      nameEn: "Jab Jab",
      descriptionEn: "Red's signature move. He swings his left arm to the right, then his right arm to the left."
    },
    ultimate: { id: "redGuard", name: "레드 가드", description: "8초 동안 피해를 60% 감소시키는 보호막을 생성합니다.", nameEn: "Red Guard", descriptionEn: "Creates a shield that reduces damage taken by 60% for 8 seconds.", duration: 8, damageReduction: 0.6, chargeRequired: 7 },
  },
  green: {
    maxHealth: 8400, moveSpeedMultiplier: 1.2, attackCooldown: 0.45, reloadDuration: 1.0, maxAmmo: 3,
    boomerangDamage: 1000, boomerangRange: 7, boomerangSpeed: 20,
    boomerangReturnSpeedMultiplier: 1.1,
    boomerangReturnDamageMultiplier: 0.35,
    boomerangFarThreshold: 3.5, boomerangFarMultiplier: 0.625,
    boomerangAngles: [-25, -25 / 3, 25 / 3, 25].map(degrees),
    description: "그린은 유일하게 항구 출신이 아닌 캐릭터입니다. 그가 살던 곳은 평범한 시골인데, 돈을 벌어서 이사 가려고 이 대회에 참가하게 되었습니다.",
    descriptionEn: "Green is the only fighter who is not from the harbor. He grew up in an ordinary rural town and entered the tournament hoping to earn enough to move away.",
    basicAttack: {
      name: "부메랑",
      description: "부메랑 4개를 던집니다. 적이 가까울수록 더 큰 피해를 줍니다.",
      nameEn: "Boomerang",
      descriptionEn: "Throws four boomerangs. The closer the enemy, the more damage each one deals."
    },
    ultimate: {
      id: "hidingBush", name: "은신 수풀", description: "자신의 위치에 3타일 크기의 수풀을 소환해 최대 10초 동안 그 안에 숨습니다. 공격하면 3초간 노출됩니다.",
      nameEn: "Hiding Bush", descriptionEn: "Summons a 3-tile bush at your feet and hides inside it for up to 10 seconds. Attacking exposes you for 3 seconds.",
      chargeRequired: 7, radius: 1.5, duration: 10, revealDuration: 3,
    },
  },
  blue: {
    maxHealth: 5200, moveSpeedMultiplier: 1, attackCooldown: 0.3, reloadDuration: 0.5, maxAmmo: 3,
    bulletDamage: 1000, bulletRange: 16, bulletSpeed: 35.2,
    description: "블루는 평범한 일반인입니다. 하지만 그의 손만큼 빠른 사람은 없습니다. 아마도요?",
    descriptionEn: "Blue is an ordinary guy. But nobody has hands as fast as his. Probably.",
    basicAttack: {
      name: "스피드 구슬",
      description: "엄청난 속도로 구슬을 던집니다. 맞으면 하나도 안 아프지만 여러 대 맞으면 꽤나 아플걸요?",
      nameEn: "Speed Marble",
      descriptionEn: "Hurls marbles at blistering speed. One barely stings, but a few in a row will hurt."
    },
    special: {
      id: "bounceShot", name: "바운스 샷",
      description: "탄환 8발을 빠르게 발사합니다. 탄환은 벽에 최대 3번 반사되고 적을 관통하며 계속 이동합니다.",
      nameEn: "Bounce Shot", descriptionEn: "Rapidly fires eight piercing bullets that can bounce off walls up to three times.",
      projectileCount: 8, intervalMs: 70, spreadAngle: degrees(18), damage: 650,
      speed: 28, range: 22, maxBounces: 3, cooldown: 10,
    },
  },
  orange: {
    maxHealth: 5800, moveSpeedMultiplier: 1, attackCooldown: 0.35, reloadDuration: 1.0, maxAmmo: 3,
    bombDamage: 750, bombRange: 9, bombSpeed: 22,
    bombSplashDamage: 700, bombSplashCount: 5, bombDirectHitJuiceCount: 4,
    bombSplashSpeed: 10, bombSplashRange: 4.4, bombSplashHitRadius: 0.75,
    description: "오렌지는 평범한 오렌지 농부입니다. 하지만 컬러스의 첫 번째 우승자가 되려고 합니다. 오직 오렌지 하나만으로요...",
    descriptionEn: "Orange is a plain orange farmer, yet he intends to become the first champion of Colors. Armed with nothing but oranges...",
    basicAttack: {
      name: "오렌지 슛",
      description: "평범한 오렌지를 투척합니다. 오렌지가 최대 사정거리에 도달하면 과즙 5개를 퍼트립니다. 그러나 조심하세요! 오렌지를 그냥 맞으면 과즙을 다 맞아버립니다!",
      nameEn: "Orange Shot",
      descriptionEn: "Throws an ordinary orange. At maximum range it bursts into five splashes of juice. Careful though: taking the orange head-on means eating every splash too!"
    },
    officialAbility: { id: "wideBlast", name: "광역 폭발", description: "폭발 범위 25% 증가",
      nameEn: "Wide Blast", descriptionEn: "Increases blast radius by 25%." },
    blastRadiusMultiplier: 1.25,
  },
  yellow: {
    maxHealth: 5800, moveSpeedMultiplier: 1, attackCooldown: 0.45, reloadDuration: 0.9, maxAmmo: 3,
    electricDamage: 2200, electricRange: 12, electricSpeed: 16, attackDelay: 0.12, shockSlowPercent: 0.25, shockDuration: 2,
    description: "옐로우는 평범한 전기 기술자입니다. 그가 월세를 벌고자 이 대회에 참가했습니다.",
    descriptionEn: "Yellow is an ordinary electrician who joined the tournament to cover his rent.",
    basicAttack: {
      name: "찌릿찌릿 전기구슬",
      description: "전기구슬을 날립니다. 맞은 캐릭터는 이동속도가 대폭 감소됩니다. 그래서 적군이 자꾸 피하는 거군요!",
      nameEn: "Zappy Orb",
      descriptionEn: "Fires an electric orb. Anyone hit is slowed sharply, which is why enemies keep dodging it."
    },
  },
  cyan: {
    maxHealth: 6200, moveSpeedMultiplier: 1, attackCooldown: 0.35, reloadDuration: 1.1, maxAmmo: 3,
    spreadLineDamage: 650, spreadLineRange: 8.33, spreadLineSpeed: 18, spreadLineCount: 6, betaAngleSpacing: 0.095,
    description: "시안은 평범하게 사는 컬러이지만, 아무래도 수상합니다. 그가 다녔던 회사의 제품은 다 이상한 걸까요?",
    descriptionEn: "Cyan lives an ordinary life, but something about him is off. Was every product at his old company this strange?",
    basicAttack: {
      name: "압축 알약",
      description: "압축된 알약을 발사하여 적에게 피해를 입힙니다. 알약은 직선으로 빠르게 날아가며, 멀리 있는 적도 정확하게 공격할 수 있습니다.",
      nameEn: "Compressed Pill",
      descriptionEn: "Fires compressed pills that travel fast in a straight line, letting him hit distant targets accurately."
    },
    ultimate: {
      id: "galeStrike", name: "질풍 강타", description: "전방으로 거대한 강풍을 발사해 피해를 주고 강하게 밀쳐냅니다.",
      nameEn: "Gale Strike", descriptionEn: "Unleashes a massive gust forward that damages and strongly knocks back everything it hits.",
      damage: 1300, range: 10, projectileRadius: 4, speedMultiplier: 5 / 3, knockback: 8, chargeRequired: 12,
    },
  },
  purple: {
    maxHealth: 6000, moveSpeedMultiplier: 1, attackCooldown: 0.45, reloadDuration: 1.1, maxAmmo: 3,
    needleDamage: 700, needleRange: 13, needleSpeed: 18,
    poisonDPS: 760, poisonDuration: 4,
    vialDamage: 2700, vialRange: 11, vialSpeed: 18, vialSplashRadius: 4,
    description: "퍼플은 향수 가게의 사장님이자 의사 자격증이 있는 컬러입니다. 그녀의 향수 가게가 잘 되는 탓인지는 모르지만 그녀의 독침은 꽤나 아픕니다.",
    descriptionEn: "Purple runs a perfume shop and holds a medical license. Perhaps that is why business is good, but her needles sting badly.",
    basicAttack: {
      name: "독침과 독병",
      description: "첫 번째 일반 공격은 독침 3발을 전방 24도 부채꼴로 발사하여 적에게 피해를 입힙니다. 명중한 적은 일정 시간 동안 독에 걸립니다. 두 번째 일반 공격은 벽을 넘어가는 독병을 던집니다. 독병은 착지 후 깨지며 주변 적에게 광역 피해를 부여합니다.",
      nameEn: "Needle & Vial",
      descriptionEn: "The first attack fires three needles in a 24-degree forward fan, poisoning anyone they hit. The second lobs a vial over walls that shatters on landing for area damage."
    },
    officialAbility: { id: "wideNeedle", name: "광각 독침", description: "독침 3발을 -12도, 0도, +12도로 발사",
      nameEn: "Wide Needle", descriptionEn: "Fires three needles at -12, 0, and +12 degrees." },
    needleCount: 3, needleRadial: false, needleSpreadAngle: degrees(24),
  },
  pink: {
    maxHealth: 10500, moveSpeedMultiplier: 1.3, attackCooldown: 0.3, reloadDuration: 0.8, maxAmmo: 3,
    healCircleDamage: 2100, healCircleHeal: 1400, healCircleRange: 4.5, abilityRangeMultiplier: 1.2,
    description: "핑크는 음악을 좋아하는 스트리머입니다. 그녀는 음악이 너무 좋아서 돈벌이를 까먹는 바람에 돈을 벌려고 대회에 나갔다가 우승해버립니다.",
    descriptionEn: "Pink is a streamer who loves music so much she forgets to earn a living. She entered the tournament for the prize money and ended up winning it.",
    basicAttack: {
      name: "퍼지는 음표",
      description: "원형으로 퍼지는 음표를 발사합니다. 음표는 적에게 피해를 주고, 아군에게는 체력을 회복시킵니다.",
      nameEn: "Spreading Notes",
      descriptionEn: "Releases notes that spread in a circle, damaging enemies and healing allies."
    },
    ultimate: {
      id: "encore", name: "앙코르!", description: "반경 8타일 안의 모든 아군에게 12초 동안 부활 효과를 부여합니다. 효과를 받은 아군이 사망하면 그 자리에서 체력 40%와 2초 무적으로 부활하며, 이미 쓰러진 아군은 즉시 부활합니다.",
      nameEn: "Encore!", descriptionEn: "Grants every ally within 8 tiles a 12-second revival effect. If an affected ally falls, they revive in place at 40% health with 2 seconds of invulnerability; already-fallen allies revive immediately.",
      chargeRequired: 15, radius: 8, reviveHealthRatio: 0.4, invulnerabilityDuration: 2,
    },
  },
  crimson: {
    maxHealth: 9800, moveSpeedMultiplier: 1.4, attackCooldown: 0.74, reloadDuration: 0.9, maxAmmo: 3,
    attackRange: 6, attackDamage: 4000 / 3, attackDamages: [1333, 1333, 1334], attackCount: 3, attackIntervalMs: 120,
    attackHalfAngle: degrees(42), attackAngles: [-25, 0, 25].map(degrees),
    description: "크림슨은 레드를 보고 권투를 시작해서 세계적인 권투 선수가 되었습니다. 근데 정작 자기는 레드를 못 이긴다고 하네요.",
    descriptionEn: "Crimson took up boxing after watching Red and became world class, yet he still says he cannot beat Red.",
    basicAttack: {
      name: "3연속 펀치",
      description: "3연속 펀치로 적에게 피해를 입힙니다.",
      nameEn: "Triple Punch",
      descriptionEn: "Hammers enemies with three consecutive punches."
    },
    ultimate: {
      name: "KO 스트레이트",
      description: "엄청난 펀치를 날립니다. 너무 강한 펀치를 날린 나머지 벽도 부서지고 적도 밀려납니다.",
      nameEn: "KO Straight",
      descriptionEn: "Throws a monstrous punch. It lands so hard that walls break and enemies are shoved away.",
    },
    ultimateDamage: 3000, ultimateLength: 6, ultimateWidth: 6, ultimateKnockback: 1, ultimateChargeRequired: 9,
  },
  gold: {
    maxHealth: 6200, moveSpeedMultiplier: 1, attackCooldown: 0.8, reloadDuration: 1.2, maxAmmo: 3,
    description: "금을 좋아하는 컬러입니다. 부자이고, 돈을 좋아합니다. 근데 자꾸 오렌지한테 눈치를 주는데요?",
    descriptionEn: "A color who loves gold. He is rich, he loves money, and he keeps side-eyeing Orange for some reason.",
    basicAttack: {
      name: "연쇄 금광석",
      description: "2×2타일 정십이면체 금광석을 직선으로 8타일 발사합니다. 충돌한 금광석은 폭발하며 좌우 90도로 분열하고, 분열탄은 각각 6개의 금괴 투사체로 갈라집니다.",
      nameEn: "Chain Gold Ore",
      descriptionEn: "Launches a 2x2 dodecahedral gold ore 8 tiles forward. On impact it explodes and splits 90 degrees to each side, and each fragment breaks into six gold bar projectiles."
    },
    stage1Damage: 4000, stage1Range: 8, stage1Speed: 16, stage1Size: 2, stage1SplashRadius: 1.5,
    stage2Damage: 2000, stage2Range: 4, stage2Speed: 18,
    stage3Damage: 1000, stage3Range: 3, stage3Speed: 20,
    projectileRadius: 0.2, ultimateChargeRequired: 12, maxChargePerAttack: 6,
    ultimate: {
      id: "malfunctionZone", name: "고장 지대",
      description: "자신의 위치에 반경 3타일 장판을 소환합니다. 장판은 4초 동안 자신을 따라다니며 적의 공격을 막고 이동속도를 50% 감소시킵니다.",
      nameEn: "Malfunction Zone",
      descriptionEn: "Summons a 3-tile radius field on Gold that follows for 4 seconds. Enemies inside cannot attack and move 50% slower.",
      castRange: 0, radius: 3, duration: 4, delay: 0.35, followsCaster: true,
    },
  },
  ivory: {
    maxHealth: 6200, moveSpeedMultiplier: 1, attackCooldown: 0.7, reloadDuration: 1.3, maxAmmo: 3,
    iceCreamDamage: 1100, iceCreamRange: 10, iceCreamSpeed: 14, iceCreamZoneRadius: 2.5,
    iceCreamZoneDuration: 4, iceCreamZoneTickInterval: 1,
    description: "아이스크림 가게의 직원입니다. 근데 아이스크림을 너무 좋아해서 아이스크림이 자꾸 사라집니다.",
    descriptionEn: "A cheerful ice cream shop employee who controls the battlefield with ice cream that refuses to melt.",
    basicAttack: {
      name: "안 녹는 아이스크림",
      description: "최대 사거리 10타일에 아이스크림을 던집니다. 착탄 시 1100 피해를 주고, 4초 동안 매초 1100 피해를 주는 장판을 만듭니다. 장판 피해는 중첩되지 않습니다.",
      nameEn: "Unmelting Ice Cream",
      descriptionEn: "Throws ice cream exactly 10 tiles. It deals 1,100 impact damage and leaves a four-second zone that deals 1,100 damage each second. Zone damage does not stack.",
    },
    ultimate: {
      id: "groupOrder", name: "단체 주문",
      description: "최대 20타일 거리의 중앙과 대각선 네 방향에 아이스크림 5개를 던집니다.",
      nameEn: "Group Order", descriptionEn: "Throws five ice creams at a target area up to 20 tiles away: one in the center and one in each diagonal direction.",
      castRange: 20, patternRadius: 3.5, chargeRequired: 12,
    },
  },
  chartreuse: {
    maxHealth: 6200, moveSpeedMultiplier: 1, attackCooldown: 0.55, reloadDuration: 1.2, maxAmmo: 3,
    chartreuseRange: 9.5, chartreuseSpeed: 22, chartreuseDamage: 1200, chartreuseEnhancedDamage: 2400,
    description: "어딘가 나사빠지고 멍청해 보이는 캐릭터, 하지만 그가 만든 '샤단라'는 항상 이래서 평범합니다.",
    descriptionEn: "A controller-leaning random damage dealer.",
    basicAttack: { name: "무슨 공격이지?", description: "강화탄, CC탄, 흑사병탄, 무탄 중 하나를 무작위로 발사합니다.", nameEn: "What Attack?", descriptionEn: "Fires one random round: enhanced, CC, plague, or blank." },
    ultimate: { id: "clearMind", name: "49% 정신 차림", description: "6초 동안 무탄이 사라지고 세 탄환이 동일 확률로 등장합니다.", nameEn: "49% Clear Mind", descriptionEn: "For 6 seconds, blank rounds are removed and the other three appear equally.", chargeRequired: 8, duration: 6 },
  },
  mint: {
    maxHealth: 6600, moveSpeedMultiplier: 1.05, attackCooldown: 0.75, reloadDuration: 1.15, maxAmmo: 3,
    iceBulletDamage: 700, iceBulletRange: 10, iceBulletSpeed: 20,
    burstCount: 3, burstIntervalMs: 120, icePerHit: 25, freezeThreshold: 100, freezeDuration: 2,
    description: "차가운 아이스크림으로 적의 움직임을 얼려 버리는 베타 시즌 5 신규 컨트롤러입니다.",
    descriptionEn: "A Beta Season 5 controller who freezes enemy movement with ice-cold ice cream.",
    basicAttack: {
      name: "아이스크림 탄",
      description: "아이스크림 탄환을 3발 연속 발사합니다. 적중할 때마다 얼음 수치가 25 누적되며, 100이 되면 적이 2초 동안 빙결됩니다.",
      nameEn: "Ice Cream Bullets",
      descriptionEn: "Fires three ice cream bullets in succession. Each hit adds 25 ice; at 100, the target freezes for 2 seconds.",
    },
    special: {
      id: "iceCreamField", name: "아이스크림 장판",
      description: "지정한 위치에 6초 동안 반경 3타일의 얼음 장판을 생성합니다. 적은 미끄러지고 1초마다 얼음 수치가 20 누적됩니다.",
      nameEn: "Ice Cream Field", descriptionEn: "Creates a 3-tile ice field for 6 seconds. Enemies slide and gain 20 ice each second.",
      castRange: 10, radius: 3, duration: 6, icePerSecond: 20, cooldown: 8, slideStrength: 3.2,
    },
  },
};
