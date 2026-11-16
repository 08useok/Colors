// Wiki-only snapshot. Main: published master 21877dc; beta/official: development data 2026-11-12.
// This file never changes the game configuration.
export const WIKI_UPDATED="2026.11.12";
export const WIKI_EDITIONS={
  "main": [
    "메인 · 시즌 8 · v1.8.1",
    "Main · Season 8 · v1.8.1"
  ],
  "beta": [
    "베타 · 시즌 9 개발 데이터",
    "Beta · Season 9 development data"
  ],
  "official": [
    "정식 시즌 1 · 개발 버전",
    "Official Season 1 · Development"
  ]
};
export const WIKI_NAMES={
  "crystal": [
    "크리스탈",
    "Crystal"
  ],
  "lavender": [
    "라벤더",
    "Lavender"
  ],
  "salmon": [
    "살몬",
    "Salmon"
  ],
  "raspberry": [
    "라즈베리",
    "Raspberry"
  ],
  "black": [
    "블랙",
    "Black"
  ],
  "white": [
    "화잇",
    "White"
  ]
};
export const CURRENT_WIKI_PATCHES=[
  {
    "version": "v1.8.1",
    "date": "2026.11.11",
    "title": [
      "메인 · 3대3 진영",
      "Main · 3v3 camera orientation"
    ],
    "items": [
      [
        "사커 킥·찹 우드에서도 내 진영이 화면 아래쪽에 오도록 카메라와 입력 방향을 맞췄습니다.",
        "Soccer Kick and Chop Wood orient the camera and controls with your team at the bottom."
      ]
    ],
    "summary": [
      "메인 · 3대3 진영",
      "Main · 3v3 camera orientation"
    ],
    "impact": [
      "적용 범위는 각 항목의 메인·베타·개발 표시를 따릅니다.",
      "Scope follows each item’s main, beta or development label."
    ]
  },
  {
    "version": "BETA 9",
    "date": "2026.11.12",
    "title": [
      "베타 · 챔피언스와 전용 맵",
      "Beta · Champions and dedicated maps"
    ],
    "items": [
      [
        "젬 그랩·녹아웃 각 9명으로 시작해 8명이 남으면 사커 킥 최종전으로 진행합니다. 전체 플레이어 공통 기록으로 순위를 매깁니다.",
        "Gem Grab and Knockout begin with nine characters each; eight survivors advance to Soccer Kick. Rankings use shared player records."
      ],
      [
        "3라운드부터 두 모드의 생존 캐릭터를 교환합니다. 우승 보상은 가젯이며 구체 효과는 미확정입니다.",
        "The surviving groups swap modes from round three. The champion reward is a gadget; its effect is pending."
      ],
      [
        "녹아웃 전용 맵 「물길 협곡」: 물은 걷기를 막지만 투사체와 시야는 통과합니다.",
        "The dedicated Knockout map Waterway Canyon uses water that blocks walking but allows projectiles and vision."
      ]
    ],
    "summary": [
      "베타 · 챔피언스와 전용 맵",
      "Beta · Champions and dedicated maps"
    ],
    "impact": [
      "적용 범위는 각 항목의 메인·베타·개발 표시를 따릅니다.",
      "Scope follows each item’s main, beta or development label."
    ]
  },
  {
    "version": "DEV 2026.11.12",
    "date": "2026.11.12",
    "title": [
      "모델·걷기와 정식 시즌 1 개발",
      "Models, locomotion and Official Season 1 development"
    ],
    "items": [
      [
        "블랙·화잇의 모델과 전투 시제품을 베타·정식 개발 페이지에 연결했습니다. 메인 시즌 8에는 포함되지 않습니다.",
        "Black and White models and combat prototypes are wired into beta and official development pages, not the main Season 8 roster."
      ],
      [
        "후속 기본 모델 6종과 새 스킨 4종에 기존 걷기 스타일과 출발·정지 전환을 적용했습니다. 실제 플레이 시각 검증은 미확인입니다.",
        "Six later base models and four new skins use the classic walking style and start/stop transitions. In-game visual verification remains unconfirmed."
      ],
      [
        "정식 시즌 1 경쟁전은 실제 플레이어를 매칭하고 20초 뒤 빈 자리를 봇으로 채웁니다.",
        "Official Season 1 ranked matches players and fills remaining seats with bots after 20 seconds."
      ]
    ],
    "summary": [
      "모델·걷기와 정식 시즌 1 개발",
      "Models, locomotion and Official Season 1 development"
    ],
    "impact": [
      "적용 범위는 각 항목의 메인·베타·개발 표시를 따릅니다.",
      "Scope follows each item’s main, beta or development label."
    ]
  }
];
export const WIKI_BASE_CHARACTERS={
  "red": {
    "color": 16711680,
    "maxHealth": 9800,
    "attackType": "punch",
    "reloadDuration": 0.9,
    "attackCooldown": 0.55,
    "attackRange": 5.5,
    "ultimate": {
      "name": "레드 가드",
      "duration": 8,
      "damageReduction": 0.6,
      "chargeRequired": 7
    },
    "moveSpeedMultiplier": 1.4,
    "walk": {
      "cycleSpeed": 9,
      "armAmp": 0.34,
      "legAmp": 0.4,
      "armRestZ": 0.3141592653589793
    }
  },
  "green": {
    "color": 65280,
    "maxHealth": 8400,
    "attackType": "boomerang",
    "reloadDuration": 1,
    "attackCooldown": 0.45,
    "moveSpeedMultiplier": 1.2,
    "boomerangCount": 4,
    "boomerangDamage": 1000,
    "boomerangRange": 7,
    "boomerangSpeed": 20,
    "boomerangReturnSpeedMultiplier": 1.1,
    "boomerangReturnDamageMultiplier": 0.35,
    "boomerangFarThreshold": 3.5,
    "boomerangFarMultiplier": 0.625,
    "boomerangAngles": [
      -0.2617993877991494,
      -0.08726646259971647,
      0.08726646259971647,
      0.2617993877991494
    ],
    "ultimate": {
      "name": "은신 수풀",
      "radius": 2.2,
      "duration": 10,
      "revealDuration": 3,
      "chargeRequired": 7
    },
    "walk": {
      "cycleSpeed": 8,
      "armAmp": 0.3,
      "legAmp": 0.38,
      "armRestZ": 0.18849555921538758
    }
  },
  "blue": {
    "color": 255,
    "maxHealth": 4800,
    "attackType": "bullet",
    "reloadDuration": 0.5,
    "attackCooldown": 0.3,
    "bulletDamage": 1500,
    "bulletRange": 16,
    "bulletSpeed": 32,
    "ultimate": {
      "name": "돌진",
      "damage": 1600,
      "speed": 24,
      "duration": 1.15,
      "hitRadius": 1.2,
      "chargeRequired": 4,
      "rechargePerHit": 0.33
    },
    "moveSpeedMultiplier": 1,
    "walk": {
      "cycleSpeed": 7,
      "armAmp": 0.2,
      "legAmp": 0.34,
      "armRestZ": 0.09424777960769379
    }
  },
  "orange": {
    "color": 16753920,
    "maxHealth": 5800,
    "attackType": "bomb",
    "reloadDuration": 1,
    "attackCooldown": 0.35,
    "bombDamage": 900,
    "bombSplashDamage": 700,
    "bombRange": 9,
    "bombSpeed": 26,
    "bombSplashCount": 5,
    "bombDirectHitJuiceCount": 4,
    "bombSplashSpeed": 10,
    "bombSplashRange": 4.4,
    "bombSplashHitRadius": 0.75,
    "moveSpeedMultiplier": 1,
    "walk": {
      "cycleSpeed": 8,
      "armAmp": 0.25,
      "legAmp": 0.36,
      "armRestZ": 0.15707963267948966
    }
  },
  "yellow": {
    "color": 16776960,
    "maxHealth": 5800,
    "attackType": "electric",
    "reloadDuration": 0.9,
    "attackCooldown": 0.45,
    "attackDelay": 0.12,
    "electricDamage": 2200,
    "electricRange": 12,
    "electricSpeed": 16,
    "shockSlowPercent": 0.25,
    "shockDuration": 2,
    "ultimate": {
      "name": "전기 회로",
      "chargeRequired": 2,
      "maxDevices": 4,
      "circuitDuration": 3,
      "connectionDamage": 1200,
      "connectionRadius": 0.7,
      "deviceThrowSpeed": 14,
      "deviceInstallDelay": 0.35
    },
    "moveSpeedMultiplier": 1,
    "walk": {
      "cycleSpeed": 8,
      "armAmp": 0.25,
      "legAmp": 0.36,
      "armRestZ": 0.15707963267948966
    }
  },
  "cyan": {
    "color": 1044734,
    "maxHealth": 7200,
    "attackType": "spreadLine",
    "reloadDuration": 0.8,
    "attackCooldown": 0.35,
    "spreadLineDamage": 750,
    "spreadLineRange": 8.33,
    "spreadLineSpeed": 18,
    "spreadLineCount": 6,
    "spreadLineSpacing": 0.75,
    "ultimate": {
      "name": "질풍 강타",
      "damage": 1300,
      "range": 10,
      "width": 10,
      "speedMultiplier": 1.6666666666666667,
      "knockback": 8,
      "chargeRequired": 6
    },
    "moveSpeedMultiplier": 1,
    "walk": {
      "cycleSpeed": 8,
      "armAmp": 0.25,
      "legAmp": 0.36,
      "armRestZ": 0.15707963267948966
    }
  },
  "purple": {
    "color": 8388736,
    "maxHealth": 6000,
    "attackType": "poison",
    "reloadDuration": 1.1,
    "attackCooldown": 0.45,
    "needleRange": 14,
    "needleSpeed": 18,
    "needleDamage": 700,
    "poisonDPS": 760,
    "poisonDuration": 4,
    "needleCount": 3,
    "needleRadial": false,
    "needleSpreadAngle": 0.4188790204786391,
    "vialRange": 11,
    "vialSpeed": 18,
    "vialDamage": 2700,
    "vialSplashRadius": 4,
    "moveSpeedMultiplier": 1,
    "walk": {
      "cycleSpeed": 7,
      "armAmp": 0.22,
      "legAmp": 0.34,
      "armRestZ": 0.12566370614359174
    }
  },
  "pink": {
    "color": 16043475,
    "maxHealth": 10500,
    "attackType": "heal_circle",
    "reloadDuration": 0.8,
    "attackCooldown": 0.3,
    "healCircleRange": 4.5,
    "healCircleDamage": 2100,
    "healCircleHeal": 1400,
    "ultimate": {
      "name": "앙코르!",
      "reviveHealthRatio": 0.4,
      "duration": 12,
      "reviveDelay": 3,
      "invulnerabilityDuration": 2,
      "radius": 8,
      "chargeRequired": 15
    },
    "moveSpeedMultiplier": 1.3,
    "walk": {
      "cycleSpeed": 9,
      "armAmp": 0.34,
      "legAmp": 0.4,
      "armRestZ": 0.3141592653589793
    }
  },
  "crimson": {
    "color": 10485760,
    "maxHealth": 9800,
    "attackType": "punchCombo",
    "reloadDuration": 0.9,
    "attackCooldown": 0.74,
    "moveSpeedMultiplier": 1.4,
    "attackRange": 3.5,
    "attackDamage": 1333.3333333333333,
    "attackCount": 3,
    "attackIntervalMs": 120,
    "attackHalfAngle": 0.7330382858376184,
    "attackAngles": [
      -0.4363323129985824,
      0,
      0.4363323129985824
    ],
    "ultimate": {
      "name": "KO 스트레이트",
      "damage": 3000,
      "size": 6,
      "knockback": 1,
      "chargeRequired": 9
    },
    "walk": {
      "cycleSpeed": 9,
      "armAmp": 0.36,
      "legAmp": 0.42,
      "armRestZ": 0.3141592653589793
    }
  },
  "gold": {
    "color": 16766720,
    "maxHealth": 6200,
    "attackType": "goldOre",
    "reloadDuration": 1.2,
    "attackCooldown": 0.8,
    "moveSpeedMultiplier": 1,
    "stage1Damage": 4000,
    "stage1Range": 8,
    "stage1Speed": 16,
    "stage1Size": 2,
    "stage1SplashRadius": 1.5,
    "stage2Damage": 2000,
    "stage2Range": 8,
    "stage2Speed": 18,
    "stage3Damage": 1000,
    "stage3Range": 6,
    "stage3Speed": 20,
    "projectileRadius": 0.2,
    "maxChargePerAttack": 6,
    "ultimate": {
      "name": "Malfunction Zone",
      "damage": 0,
      "radius": 6,
      "duration": 4,
      "delay": 0.35,
      "chargeRequired": 12
    },
    "walk": {
      "cycleSpeed": 8,
      "armAmp": 0.25,
      "legAmp": 0.36,
      "armRestZ": 0.15707963267948966
    }
  },
  "ivory": {
    "color": 16777200,
    "maxHealth": 7200,
    "attackType": "punch",
    "reloadDuration": 1.3,
    "attackCooldown": 0.65,
    "iceCreamDamage": 1100,
    "iceCreamRange": 10,
    "iceCreamSpeed": 12,
    "iceCreamZoneRadius": 2.8,
    "iceCreamZoneDuration": 4,
    "iceCreamZoneTickInterval": 1,
    "ultimate": {
      "name": "단체 주문",
      "patternRadius": 3.2,
      "castRange": 12,
      "chargeRequired": 8
    },
    "moveSpeedMultiplier": 1,
    "walk": {
      "cycleSpeed": 7,
      "armAmp": 0.24,
      "legAmp": 0.34,
      "armRestZ": 0.15707963267948966
    }
  },
  "chartreuse": {
    "color": 12711946,
    "maxHealth": 6200,
    "attackType": "chartreuse",
    "reloadDuration": 1.2,
    "attackCooldown": 0.55,
    "moveSpeedMultiplier": 1,
    "chartreuseRange": 9.5,
    "chartreuseSpeed": 22,
    "chartreuseDamage": 1200,
    "chartreuseEnhancedDamage": 2400,
    "ultimate": {
      "name": "49% 정신 차림",
      "duration": 6,
      "chargeRequired": 8
    },
    "walk": {
      "cycleSpeed": 8,
      "armAmp": 0.25,
      "legAmp": 0.36,
      "armRestZ": 0.15707963267948966
    }
  },
  "mint": {
    "color": 10026972,
    "maxHealth": 6600,
    "attackType": "mintIce",
    "reloadDuration": 1.15,
    "attackCooldown": 0.75,
    "moveSpeedMultiplier": 1.05,
    "maxAmmo": 3,
    "iceBulletDamage": 700,
    "iceBulletRange": 10,
    "iceBulletSpeed": 20,
    "burstCount": 3,
    "burstIntervalMs": 120,
    "icePerHit": 25,
    "freezeThreshold": 100,
    "freezeDuration": 2,
    "ultimate": {
      "name": "아이스크림 장판",
      "castRange": 10,
      "radius": 9,
      "duration": 10,
      "icePerSecond": 5,
      "damagePerSecond": 300,
      "chargeRequired": 7,
      "slideStrength": 3.2,
      "slideAcceleration": 0.6
    },
    "walk": {
      "cycleSpeed": 8,
      "armAmp": 0.25,
      "legAmp": 0.36,
      "armRestZ": 0.15707963267948966
    }
  }
};
export const WIKI_SKINS={
  "beta9_raspberry_champions": {
    "id": "beta9_raspberry_champions",
    "name": "챔피언스 라즈베리",
    "nameEn": "Champions Raspberry",
    "character": "raspberry",
    "season": "beta9",
    "rarity": "epic",
    "cost": 0,
    "desc": "남색과 금빛 우승자 의상을 입은 라즈베리"
  },
  "beta9_salmon_champions": {
    "id": "beta9_salmon_champions",
    "name": "챔피언스 살몬",
    "nameEn": "Champions Salmon",
    "character": "salmon",
    "season": "beta9",
    "rarity": "epic",
    "cost": 0,
    "desc": "금빛 트로피와 낚시찌 장식을 단 살몬"
  },
  "official1_red_santa": {
    "id": "official1_red_santa",
    "name": "산타 레드",
    "nameEn": "Santa Red",
    "character": "red",
    "season": "official1",
    "rarity": "epic",
    "cost": 0,
    "desc": "산타 모자와 포근한 겨울 코트를 입은 레드"
  },
  "official1_green_elf": {
    "id": "official1_green_elf",
    "name": "크리스마스 엘프 그린",
    "nameEn": "Christmas Elf Green",
    "character": "green",
    "season": "official1",
    "rarity": "epic",
    "cost": 0,
    "desc": "황금 종과 줄무늬 양말로 꾸민 크리스마스 엘프"
  },
  "beta8_ivory_skeleton": {
    "id": "beta8_ivory_skeleton",
    "name": "해골 아이보리",
    "nameEn": "Skeleton Ivory",
    "character": "ivory",
    "season": "beta8",
    "rarity": "epic",
    "cost": 0,
    "previewOnly": true,
    "desc": "뼈 장식과 유령빛 의상의 할로윈 아이보리 · 베타 무료 시험"
  },
  "beta8_orange_jack_o_lantern": {
    "id": "beta8_orange_jack_o_lantern",
    "name": "잭오랜턴 오렌지",
    "character": "orange",
    "season": "beta8",
    "rarity": "epic",
    "cost": 0,
    "previewOnly": true,
    "desc": "호박등과 망토를 두른 할로윈 오렌지 · 베타 무료 시험"
  },
  "beta8_purple_potion_witch": {
    "id": "beta8_purple_potion_witch",
    "name": "마녀 퍼플",
    "character": "purple",
    "season": "beta8",
    "rarity": "epic",
    "cost": 0,
    "previewOnly": true,
    "desc": "초록 물약을 만드는 보라색 마녀 · 베타 무료 시험"
  },
  "beta8_lavender_ghost_bride": {
    "id": "beta8_lavender_ghost_bride",
    "name": "유령 신부 라벤더",
    "character": "lavender",
    "season": "beta8",
    "rarity": "epic",
    "cost": 0,
    "previewOnly": true,
    "desc": "보라색 향기와 베일을 두른 유령 신부 · 베타 무료 시험"
  },
  "alpha_red": {
    "id": "alpha_red",
    "name": "Alpha Red",
    "nameKey": "skinAlphaRedName",
    "character": "red",
    "season": "alpha3",
    "rarity": "rare",
    "cost": 1000,
    "desc": "skinAlphaRedDesc"
  },
  "alpha_champion_cyan": {
    "id": "alpha_champion_cyan",
    "name": "Champion Cyan",
    "nameKey": "skinChampionCyanName",
    "character": "cyan",
    "season": "alpha4",
    "rarity": "rare",
    "cost": 0,
    "desc": "skinChampionCyanDesc"
  },
  "beta_red_orange": {
    "id": "beta_red_orange",
    "name": "Crimson Orange",
    "nameKey": "skinBetaRedOrangeName",
    "character": "orange",
    "season": "beta1",
    "rarity": "rare",
    "cost": 1000,
    "desc": "skinBetaRedOrangeDesc"
  },
  "beta_red_crimson": {
    "id": "beta_red_crimson",
    "name": "Blood Crimson",
    "nameKey": "skinBetaRedCrimsonName",
    "character": "crimson",
    "season": "beta1",
    "rarity": "epic",
    "cost": 2500,
    "desc": "skinBetaRedCrimsonDesc"
  },
  "beta_red_red": {
    "id": "beta_red_red",
    "name": "Scarlet Red",
    "nameKey": "skinBetaRedRedName",
    "character": "red",
    "season": "beta1",
    "rarity": "legendary",
    "cost": 5000,
    "desc": "skinBetaRedRedDesc"
  },
  "crown_pink": {
    "id": "crown_pink",
    "name": "Runner-up Crown",
    "nameKey": "skinCrownPinkName",
    "character": "pink",
    "season": "beta1",
    "rarity": "rare",
    "cost": 0,
    "desc": "skinCrownPinkDesc"
  },
  "crown_green": {
    "id": "crown_green",
    "name": "Third-place Crown",
    "nameKey": "skinCrownGreenName",
    "character": "green",
    "season": "beta1",
    "rarity": "rare",
    "cost": 0,
    "desc": "skinCrownGreenDesc"
  },
  "beta2_gold_yellow": {
    "id": "beta2_gold_yellow",
    "name": "Gold Rush Yellow",
    "nameKey": "skinBeta2GoldYellowName",
    "character": "yellow",
    "season": "beta2",
    "rarity": "rare",
    "cost": 1000,
    "desc": "skinBeta2GoldYellowDesc"
  },
  "beta2_gold_orange": {
    "id": "beta2_gold_orange",
    "name": "Gold Rush Orange",
    "nameKey": "skinBeta2GoldOrangeName",
    "character": "orange",
    "season": "beta2",
    "rarity": "legendary",
    "cost": 5000,
    "desc": "skinBeta2GoldOrangeDesc"
  },
  "beta2_gold_gold": {
    "id": "beta2_gold_gold",
    "name": "Gold Rush Gold",
    "nameKey": "skinBeta2GoldGoldName",
    "character": "gold",
    "season": "beta2",
    "rarity": "epic",
    "cost": 2500,
    "desc": "skinBeta2GoldGoldDesc"
  },
  "beta2_ivory_shopkeeper": {
    "id": "beta2_ivory_shopkeeper",
    "name": "점원 아이보리",
    "nameKey": "skinBeta2IvoryShopkeeperName",
    "character": "ivory",
    "season": "beta2",
    "rarity": "epic",
    "cost": 2500,
    "desc": "skinBeta2IvoryShopkeeperDesc"
  },
  "beta5_pink_cotton_candy": {
    "id": "beta5_pink_cotton_candy",
    "name": "솜사탕 핑크",
    "nameKey": "skinBeta5PinkCottonCandyName",
    "character": "pink",
    "season": "beta5",
    "rarity": "epic",
    "cost": 2500,
    "desc": "skinBeta5PinkCottonCandyDesc"
  },
  "beta6_cyan_aqua_scout": {
    "id": "beta6_cyan_aqua_scout",
    "name": "잠수부 시안",
    "nameKey": "skinBeta6CyanAquaScoutName",
    "character": "cyan",
    "season": "beta6",
    "rarity": "epic",
    "cost": 2500,
    "desc": "skinBeta6CyanAquaScoutDesc"
  },
  "beta6_chartreuse_pufferfish_boy": {
    "id": "beta6_chartreuse_pufferfish_boy",
    "name": "복어 샤트",
    "nameKey": "skinBeta6ChartreusePufferfishBoyName",
    "character": "chartreuse",
    "season": "beta6",
    "rarity": "rare",
    "cost": 1000,
    "desc": "skinBeta6ChartreusePufferfishBoyDesc"
  },
  "beta6_orange_citrus_luau_buddy": {
    "id": "beta6_orange_citrus_luau_buddy",
    "name": "트로피컬 오렌지",
    "nameKey": "skinBeta6OrangeCitrusLuauBuddyName",
    "character": "orange",
    "season": "beta6",
    "rarity": "epic",
    "cost": 2500,
    "desc": "skinBeta6OrangeCitrusLuauBuddyDesc"
  },
  "beta6_azure_blue_wave_buddy": {
    "id": "beta6_azure_blue_wave_buddy",
    "name": "프로 서퍼 애저",
    "nameKey": "skinBeta6AzureBlueWaveBuddyName",
    "character": "azure",
    "season": "beta6",
    "rarity": "legendary",
    "cost": 5000,
    "desc": "skinBeta6AzureBlueWaveBuddyDesc"
  },
  "beta7_gold_pharaoh": {
    "id": "beta7_gold_pharaoh",
    "name": "파라오 골드",
    "nameEn": "Pharaoh Gold",
    "descEn": "The ruler of the ruins, wearing a golden crown and ancient curse symbols",
    "character": "gold",
    "season": "beta7",
    "rarity": "hero",
    "cost": 3500,
    "desc": "황금 왕관과 고대 저주 문양을 두른 유적의 지배자"
  },
  "beta7_green_mummy": {
    "id": "beta7_green_mummy",
    "name": "미라 그린",
    "nameEn": "Mummy Green",
    "descEn": "An ancient ambusher with fluttering bandages in the mist of the tomb",
    "character": "green",
    "season": "beta7",
    "rarity": "epic",
    "cost": 2500,
    "desc": "무덤 안개 속에서 붕대를 흩날리는 고대의 기습자"
  },
  "beta7_blue_scarab": {
    "id": "beta7_blue_scarab",
    "name": "스카라베 블루",
    "nameEn": "Scarab Blue",
    "descEn": "A guardian with golden wings, bouncing between the walls of the ruins",
    "character": "blue",
    "season": "beta7",
    "rarity": "epic",
    "cost": 2500,
    "desc": "금빛 날개로 유적 벽 사이를 튕겨 다니는 수호자"
  },
  "beta7_crystal_ruin_explorer": {
    "id": "beta7_crystal_ruin_explorer",
    "name": "보석 공주 크리스탈",
    "nameEn": "Gem Princess Crystal",
    "descEn": "A princess protecting ancient crystals with blue gems and a crown",
    "character": "crystal",
    "season": "beta7",
    "rarity": "rare",
    "cost": 1000,
    "desc": "푸른 보석과 왕관으로 고대 유적의 결정을 지키는 공주"
  }
};
export const ROSTER_PALETTE=[
  {
    "number": 19,
    "name": "Black",
    "hex": "#000000"
  },
  {
    "number": 20,
    "name": "White",
    "hex": "#FFFFFF"
  },
  {
    "number": 21,
    "name": "Maroon",
    "hex": "#800000"
  },
  {
    "number": 22,
    "name": "Brown",
    "hex": "#653700"
  },
  {
    "number": 23,
    "name": "Tan",
    "hex": "#D1B26F"
  },
  {
    "number": 24,
    "name": "Beige",
    "hex": "#E6DAA6"
  },
  {
    "number": 25,
    "name": "Cream",
    "hex": "#FFFFC2"
  },
  {
    "number": 26,
    "name": "Olive",
    "hex": "#808010"
  },
  {
    "number": 27,
    "name": "Clover",
    "hex": "#008F00"
  },
  {
    "number": 28,
    "name": "Indigo",
    "hex": "#4B0082"
  },
  {
    "number": 29,
    "name": "Lilac",
    "hex": "#CEA2FD"
  },
  {
    "number": 30,
    "name": "Hot Pink",
    "hex": "#FF028D"
  },
  {
    "number": 31,
    "name": "Ruby",
    "hex": "#CA0147"
  },
  {
    "number": 32,
    "name": "Hacienda",
    "hex": "#9E8022"
  },
  {
    "number": 33,
    "name": "Silver",
    "hex": "#C0C0C0"
  },
  {
    "number": 34,
    "name": "Coral",
    "hex": "#FF7F50"
  },
  {
    "number": 35,
    "name": "Flame",
    "hex": "#E25822"
  },
  {
    "number": 36,
    "name": "Lava",
    "hex": "#CF1020"
  },
  {
    "number": 37,
    "name": "Scarlet",
    "hex": "#FF2400"
  },
  {
    "number": 38,
    "name": "Peach",
    "hex": "#FFB07C"
  },
  {
    "number": 39,
    "name": "Cooper",
    "hex": "#B87333"
  },
  {
    "number": 40,
    "name": "Light Cream",
    "hex": "#FFFEED"
  },
  {
    "number": 41,
    "name": "Dandelion",
    "hex": "#FEDF08"
  },
  {
    "number": 42,
    "name": "Moss",
    "hex": "#009051"
  },
  {
    "number": 43,
    "name": "Mint-Cyan",
    "hex": "#66ECE9"
  },
  {
    "number": 44,
    "name": "Aqua",
    "hex": "#00FFFF"
  },
  {
    "number": 45,
    "name": "Cobalt",
    "hex": "#030AA7"
  },
  {
    "number": 46,
    "name": "Baby Blue",
    "hex": "#A2CFFE"
  },
  {
    "number": 47,
    "name": "Navy",
    "hex": "#01153E"
  },
  {
    "number": 48,
    "name": "Midnight",
    "hex": "#03012D"
  },
  {
    "number": 49,
    "name": "Dark Lilac",
    "hex": "#9C6DA5"
  },
  {
    "number": 50,
    "name": "Baby Pink",
    "hex": "#FFB7CE"
  },
  {
    "number": 51,
    "name": "Magenta",
    "hex": "#FF00FF"
  },
  {
    "number": 52,
    "name": "Rainbow",
    "kind": "gradient"
  },
  {
    "number": 53,
    "name": "Fusion Cream",
    "kind": "gradient"
  },
  {
    "number": 54,
    "name": "Maple",
    "hex": "#B88E72"
  },
  {
    "number": 55,
    "name": "Brick",
    "hex": "#A03623"
  },
  {
    "number": 56,
    "name": "Korn",
    "hex": "#FBEC5D"
  },
  {
    "number": 57,
    "name": "Teal",
    "hex": "#008080"
  },
  {
    "number": 58,
    "name": "Violet",
    "hex": "#9A0EEA"
  },
  {
    "number": 59,
    "name": "Orchid",
    "hex": "#7A81FF"
  },
  {
    "number": 60,
    "name": "Iron",
    "hex": "#5E5E5E"
  },
  {
    "number": 61,
    "name": "Gray",
    "hex": "#808080"
  },
  {
    "number": 62,
    "name": "Carmine",
    "hex": "#D60036"
  },
  {
    "number": 63,
    "name": "Bronze",
    "hex": "#A87900"
  },
  {
    "number": 64,
    "name": "Amber",
    "hex": "#FFBF00"
  },
  {
    "number": 65,
    "name": "Banana",
    "hex": "#FFFC79"
  },
  {
    "number": 66,
    "name": "Butter",
    "hex": "#FFFF81"
  },
  {
    "number": 67,
    "name": "Vanilla",
    "hex": "#F3E5AB"
  },
  {
    "number": 68,
    "name": "Lime",
    "hex": "#AAFF32"
  },
  {
    "number": 69,
    "name": "Emerald",
    "hex": "#028F1E"
  },
  {
    "number": 70,
    "name": "Acid",
    "hex": "#00FF22"
  },
  {
    "number": 71,
    "name": "Spring",
    "hex": "#00F900"
  },
  {
    "number": 72,
    "name": "Aquamarine",
    "hex": "#2EE8BB"
  },
  {
    "number": 73,
    "name": "Sapphire",
    "hex": "#0F52BA"
  },
  {
    "number": 74,
    "name": "Royal Blue",
    "hex": "#4169E1"
  },
  {
    "number": 75,
    "name": "Night",
    "hex": "#040348"
  },
  {
    "number": 76,
    "name": "Fuchsia",
    "hex": "#ED0DD9"
  },
  {
    "number": 77,
    "name": "Rose",
    "hex": "#FF007F"
  },
  {
    "number": 78,
    "name": "Turquoise",
    "hex": "#06C2AC"
  },
  {
    "number": 79,
    "name": "Platinum",
    "hex": "#E5E4E2"
  },
  {
    "number": 80,
    "name": "Crisp",
    "hex": "#EAEBAF"
  },
  {
    "number": 81,
    "name": "Vermilion",
    "hex": "#F4320C"
  },
  {
    "number": 82,
    "name": "Sunflower",
    "hex": "#FFC512"
  },
  {
    "number": 83,
    "name": "Fern",
    "hex": "#548D44"
  },
  {
    "number": 84,
    "name": "Jade",
    "hex": "#00A86B"
  },
  {
    "number": 85,
    "name": "Ocean",
    "hex": "#005493"
  },
  {
    "number": 86,
    "name": "Sea",
    "hex": "#3C9992"
  },
  {
    "number": 87,
    "name": "Heliotrope",
    "hex": "#D94FF5"
  },
  {
    "number": 88,
    "name": "Wisteria",
    "hex": "#A87DC2"
  },
  {
    "number": 89,
    "name": "Blossom",
    "hex": "#FEE9D8"
  },
  {
    "number": 90,
    "name": "Almond Blossom",
    "hex": "#F2ACB8"
  },
  {
    "number": 91,
    "name": "Light Rainbow",
    "kind": "pending"
  },
  {
    "number": 92,
    "name": "Apricot",
    "hex": "#FFB16D"
  },
  {
    "number": 93,
    "name": "Marigold",
    "hex": "#FCC006"
  },
  {
    "number": 94,
    "name": "Saffron",
    "hex": "#F4C430"
  },
  {
    "number": 95,
    "name": "Pistachio",
    "hex": "#93C572"
  },
  {
    "number": 96,
    "name": "Sage",
    "hex": "#87AE73"
  },
  {
    "number": 97,
    "name": "Celadon",
    "hex": "#ACE1AF"
  },
  {
    "number": 98,
    "name": "Pearl",
    "hex": "#EAE0C8"
  },
  {
    "number": 99,
    "name": "Opal",
    "hex": "#AEE0E4"
  },
  {
    "number": 100,
    "name": "Iridescent",
    "hex": "#3A5B52"
  },
  {
    "number": 101,
    "name": "Cerulean",
    "hex": "#55AAEE"
  },
  {
    "number": 102,
    "name": "Periwinkle",
    "hex": "#8E82FE"
  },
  {
    "number": 103,
    "name": "Moonstone",
    "hex": "#3AA8C1"
  },
  {
    "number": 104,
    "name": "Slate",
    "hex": "#516572"
  },
  {
    "number": 105,
    "name": "Smoke",
    "hex": "#BFC8C3"
  },
  {
    "number": 106,
    "name": "Ash",
    "hex": "#BEBAA7"
  }
];
export const TRANSFORMS={
  "orange": {
    "name": "껍질이 왜 이렇게 많아?!",
    "color": "#ff9b32",
    "duration": 6,
    "chargeMultiplier": 1.5,
    "needsUltimate": true,
    "summary": "궁극기 껍질 15개(거리별 1·2·3·4·5개), 껍질 하나당 1,000 피해",
    "peelRows": [
      1,
      2,
      3,
      4,
      5
    ],
    "peelSpacing": 1.3,
    "peelDamage": 1000
  },
  "chartreuse": {
    "name": "천사",
    "color": "#fff2a8",
    "duration": 6,
    "chargeMultiplier": 1.5,
    "summary": "모든 일반 공격이 Heaven 탄환 · 맞은 적은 표식 중 CC를 받으면 즉사",
    "heaven": true,
    "markDuration": 6
  }
};
export const TRANSFORM_STATS={
  "damageBonus": 0.05,
  "healthBonus": 0.2,
  "damageReduction": 0.1
};
export const GADGETS={
  "black": {
    "name": "그림자 걸음",
    "cooldown": 14,
    "kind": "dash",
    "distance": 5,
    "summary": "조준한 방향으로 5타일 빠르게 이동합니다."
  },
  "white": {
    "name": "벌레 떼",
    "cooldown": 18,
    "kind": "empowerAttack",
    "effect": "bugs",
    "bugs": 5,
    "summary": "다음 일반 공격이 흰 벌레를 5마리 소환합니다."
  }
};
const editions={
  "main": {
    "lavender": {
      "maxHealth": 6000,
      "moveSpeedMultiplier": 1,
      "attackCooldown": 0.9,
      "reloadDuration": 1.2,
      "maxAmmo": 3,
      "attackRange": 9,
      "sprayAngle": 1.0471975511965976,
      "spraySpeed": 20,
      "sprayDuration": 1.5,
      "sprayTickInterval": 0.5,
      "sprayDamage": 1100,
      "description": "향수 분사로 전방을 압박하고 넓은 향기 장판으로 적의 이동을 방해하는 캐릭터입니다.",
      "basicAttack": {
        "name": "향수 스프레이",
        "description": "전방 9타일·60도 범위에 향수를 분사합니다. 가까울수록 틱 간격이 0.25초, 지속시간이 0.75초까지 짧아지고, 최대 사거리에서는 0.5초 간격·1.5초 지속입니다. 첫 적중 거리로 간격과 지속시간을 정하며 최대 3회 적중합니다. 틱 피해는 근거리 0~3타일 1100, 중거리 3타일 초과~6타일 1375, 원거리 6타일 초과~9타일 1650으로 고정되며, 적중당 궁극기를 0.5칸 충전합니다.",
        "descriptionEn": "Sprays perfume in a 9-tile, 60-degree fan. Nearby mist lasts 0.75 seconds and ticks every 0.25 seconds; at maximum range it lasts 1.5 seconds and ticks every 0.5 seconds. Timing is fixed at first contact, with up to three hits. Each hit deals fixed damage by current distance band: 1100 at 0–3 tiles, 1375 at over 3–6 tiles, and 1650 at over 6–9 tiles and grants 0.5 ultimate charge."
      },
      "special": {
        "id": "fragranceField",
        "name": "향기 장판",
        "description": "자신을 따라다니는 반경 6타일의 향기 장판을 6초 동안 생성합니다. 장판 안 적은 70% 느려지고 매초 975 피해를 받습니다.",
        "radius": 6,
        "duration": 6,
        "tickInterval": 1,
        "damagePerSecond": 975,
        "slowPercent": 0.7,
        "chargeRequired": 1,
        "rechargePerHit": 0.025,
        "motionWindup": 0.24
      },
      "sprayDistanceDamageBonus": 0.5,
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.12,
      "sprayCloseTickInterval": 0.25,
      "sprayDamageBands": [
        {
          "maxRange": 3,
          "multiplier": 1
        },
        {
          "maxRange": 6,
          "multiplier": 1.25
        },
        {
          "maxRange": 9,
          "multiplier": 1.5
        }
      ],
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5,
      "color": 11832296
    },
    "red": {
      "color": 16711680,
      "maxHealth": 9000,
      "attackType": "punch",
      "reloadDuration": 0.9,
      "attackCooldown": 0.55,
      "attackRange": 5.5,
      "ultimate": {
        "id": "redGuard",
        "name": "레드 가드",
        "description": "8초 동안 피해를 60% 감소시키는 보호막을 생성합니다. 피해를 받을 때마다 궁극기가 2칸 충전됩니다.",
        "nameEn": "Red Guard",
        "descriptionEn": "Creates a shield that reduces damage taken by 60% for 8 seconds. Taking a hit charges 2 ultimate units.",
        "duration": 8,
        "damageReduction": 0.6,
        "chargeRequired": 7,
        "motionWindup": 0.16
      },
      "moveSpeedMultiplier": 1.15,
      "walk": {
        "cycleSpeed": 9,
        "armAmp": 0.34,
        "legAmp": 0.4,
        "armRestZ": 0.3141592653589793
      },
      "maxAmmo": 3,
      "attackHalfAngle": 0.7853981633974483,
      "attackWidthMultiplier": 1.2941176470588236,
      "attackDamage": 2400,
      "attackCount": 2,
      "attackIntervalMs": 240,
      "description": "레드는 TV에 나오는 복싱 선수입니다. 하지만 때로는 무식해서 펀치를 잘 못 때리죠.",
      "descriptionEn": "Red is a boxer you see on TV. He is not always the sharpest, though, so his punches sometimes miss.",
      "basicAttack": {
        "name": "잽 잽",
        "description": "레드의 주 공격 기술입니다. 왼쪽 팔로 오른쪽을 때리고 오른쪽 팔로 왼쪽을 때리지요. 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다.",
        "nameEn": "Jab Jab",
        "descriptionEn": "Red's signature move. He swings his left arm to the right, then his right arm to the left. Basic hits grant 50% of the previous ultimate charge."
      },
      "ultimateChargeOnHit": 2,
      "pursuesWhileLowHealth": true,
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.08,
      "botTankTarget": true,
      "botAvoidControlProjectiles": true,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5
    },
    "green": {
      "color": 65280,
      "maxHealth": 8400,
      "attackType": "boomerang",
      "reloadDuration": 1,
      "attackCooldown": 0.45,
      "moveSpeedMultiplier": 1.2,
      "boomerangCount": 4,
      "boomerangDamage": 1710,
      "boomerangRange": 7,
      "boomerangSpeed": 20,
      "boomerangReturnSpeedMultiplier": 1.1,
      "boomerangReturnDamageMultiplier": 0.35,
      "boomerangFarThreshold": 3.5,
      "boomerangFarMultiplier": 0.625,
      "boomerangAngles": [
        -0.4363323129985824,
        -0.1454441043328608,
        0.1454441043328608,
        0.4363323129985824
      ],
      "ultimate": {
        "id": "hidingBush",
        "name": "은신 수풀",
        "description": "자신의 위치에 3타일 크기의 수풀을 소환해 최대 10초 동안 그 안에 숨습니다. 공격하면 3초간 노출됩니다.",
        "nameEn": "Hiding Bush",
        "descriptionEn": "Summons a 3-tile bush at your feet and hides inside it for up to 10 seconds. Attacking exposes you for 3 seconds.",
        "chargeRequired": 7,
        "radius": 1.5,
        "duration": 10,
        "revealDuration": 3,
        "motionWindup": 0.18
      },
      "walk": {
        "cycleSpeed": 8,
        "armAmp": 0.3,
        "legAmp": 0.38,
        "armRestZ": 0.18849555921538758
      },
      "maxAmmo": 3,
      "description": "그린은 유일하게 항구 출신이 아닌 캐릭터입니다. 그가 살던 곳은 평범한 시골인데, 돈을 벌어서 이사 가려고 이 대회에 참가하게 되었습니다.",
      "descriptionEn": "Green is the only fighter who is not from the harbor. He grew up in an ordinary rural town and entered the tournament hoping to earn enough to move away.",
      "basicAttack": {
        "name": "부메랑",
        "description": "부메랑 4개를 던집니다. 적이 가까울수록 더 큰 피해를 줍니다. 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다.",
        "nameEn": "Boomerang",
        "descriptionEn": "Throws four boomerangs. The closer the enemy, the more damage each one deals. Basic hits grant 50% of the previous ultimate charge."
      },
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.14,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5
    },
    "blue": {
      "color": 255,
      "maxHealth": 5200,
      "attackType": "bullet",
      "reloadDuration": 0.5,
      "attackCooldown": 0.3,
      "bulletDamage": 1080,
      "bulletRange": 20,
      "bulletSpeed": 68.75,
      "ultimate": {
        "name": "돌진",
        "damage": 1600,
        "speed": 24,
        "duration": 1.15,
        "hitRadius": 1.2,
        "chargeRequired": 4,
        "rechargePerHit": 0.33
      },
      "moveSpeedMultiplier": 1,
      "walk": {
        "cycleSpeed": 7,
        "armAmp": 0.2,
        "legAmp": 0.34,
        "armRestZ": 0.09424777960769379
      },
      "maxAmmo": 3,
      "description": "블루는 평범한 일반인입니다. 하지만 그의 손만큼 빠른 사람은 없습니다. 아마도요?",
      "descriptionEn": "Blue is an ordinary guy. But nobody has hands as fast as his. Probably.",
      "basicAttack": {
        "name": "스피드 구슬",
        "description": "사거리 20타일의 구슬을 빠르게 던져 1080 피해를 줍니다. 투사체 판정이 10% 커지며 일반 공격 5회 적중으로 궁극기를 충전합니다.",
        "nameEn": "Speed Marble",
        "descriptionEn": "Throws a fast marble up to 20 tiles, dealing 1080 damage. Projectile hitboxes are 10% larger and five basic hits charge the ultimate."
      },
      "special": {
        "id": "blueDash",
        "name": "돌진",
        "description": "빠르게 굴러 이동하며 벽에 부딪히면 튕겨 나갑니다. 경로의 적에게 피해와 넉백을 주고, 궁극기 준비·구르기 중 받는 피해가 70% 감소합니다. 종료·중단 시 보호막이 해제됩니다. 궁극기 5회 적중으로 다음 궁극기를 충전합니다.",
        "nameEn": "Ricochet Dash",
        "descriptionEn": "Rolls forward, bouncing off walls and damaging and knocking back enemies. Takes 70% less damage during preparation and rolling; the shield ends when the ultimate ends or is interrupted. Five ultimate hits recharge the next ultimate.",
        "damage": 2000,
        "speed": 24,
        "duration": 1.15,
        "hitRadius": 1.2,
        "chargeRequired": 2.5,
        "rechargePerHit": 0.5,
        "motionWindup": 0.12,
        "damageReduction": 0.7,
        "invulnerableDuringDash": false,
        "guardDuringPreparation": true
      },
      "bulletKnockback": 0,
      "attackPerceptionMinRange": 14,
      "attackPerceptionRange": 20,
      "ultimateUseHealthMin": 0.1,
      "ultimateUseHealthMax": 0.25,
      "dashAwayFromTarget": true,
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.06,
      "botAvoidBurstProjectiles": true,
      "botPathDirections": 24,
      "bulletHitboxMultiplier": 1.1,
      "projectileDodgeDuration": 0.18,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5,
      "pursuesWhileLowHealth": true
    },
    "orange": {
      "color": 16753920,
      "maxHealth": 4000,
      "attackType": "bomb",
      "reloadDuration": 1,
      "attackCooldown": 0.35,
      "bombDamage": 750,
      "bombSplashDamage": 1170,
      "bombRange": 9,
      "bombSpeed": 22,
      "bombSplashCount": 5,
      "bombDirectHitJuiceCount": 4,
      "bombSplashSpeed": 10,
      "bombSplashRange": 4.4,
      "bombSplashHitRadius": 0.75,
      "moveSpeedMultiplier": 1,
      "walk": {
        "cycleSpeed": 8,
        "armAmp": 0.25,
        "legAmp": 0.36,
        "armRestZ": 0.15707963267948966
      },
      "maxAmmo": 3,
      "description": "오렌지는 평범한 오렌지 농부입니다. 하지만 컬러스의 첫 번째 우승자가 되려고 합니다. 오직 오렌지 하나만으로요...",
      "descriptionEn": "Orange is a plain orange farmer, yet he intends to become the first champion of Colors. Armed with nothing but oranges...",
      "basicAttack": {
        "name": "오렌지 슛",
        "description": "평범한 오렌지를 투척합니다. 오렌지가 최대 사정거리에 도달하면 과즙 5개를 퍼트립니다. 그러나 조심하세요! 오렌지를 그냥 맞으면 과즙을 다 맞아버립니다! 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다.",
        "nameEn": "Orange Shot",
        "descriptionEn": "Throws an ordinary orange. At maximum range it bursts into five splashes of juice. Careful though: taking the orange head-on means eating every splash too! Basic hits grant 50% of the previous ultimate charge."
      },
      "officialAbility": {
        "id": "wideBlast",
        "name": "광역 폭발",
        "description": "폭발 범위 25% 증가",
        "nameEn": "Wide Blast",
        "descriptionEn": "Increases blast radius by 25%."
      },
      "blastRadiusMultiplier": 1.25,
      "ultimate": {
        "id": "returningPeels",
        "name": "오렌지 껍질 회수",
        "description": "오렌지 껍질 5개를 부채꼴로 던집니다. 최대 사거리에서 2초간 멈춘 뒤 같은 피해량으로 되돌아옵니다.",
        "nameEn": "Returning Peels",
        "descriptionEn": "Throws five peels in a fan. They wait for two seconds at maximum range, then return at full damage.",
        "chargeRequired": 8,
        "count": 5,
        "damage": 1750,
        "range": 10,
        "speed": 16,
        "spreadAngle": 1.0471975511965976,
        "pauseDuration": 2,
        "hitRadius": 0.32,
        "rechargePerHit": 0.33,
        "motionWindup": 0.22
      },
      "orangeUltimateEnabled": true,
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.13,
      "botTrackTargetDuringWindup": true,
      "botAimLeadFactor": 1,
      "botAvoidControlProjectiles": true,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5
    },
    "yellow": {
      "color": 16776960,
      "maxHealth": 5800,
      "attackType": "electric",
      "reloadDuration": 0.9,
      "attackCooldown": 0.3,
      "attackDelay": 0.12,
      "electricDamage": 2200,
      "electricRange": 12,
      "electricSpeed": 16,
      "shockSlowPercent": 0.25,
      "shockDuration": 3,
      "ultimate": {
        "id": "electricCircuit",
        "name": "전기 회로",
        "description": "장치를 목표 지점으로 던지고 0.35초 설치 대기 후 사용할 수 있습니다. 장치가 2개 이상일 때 일반 공격으로 맞히면 설치 순서대로 전기가 흐르며 구간당 1500 피해를 줍니다.",
        "nameEn": "Electric Circuit",
        "descriptionEn": "Places a device anywhere. With two or more devices, hit one with a basic attack to power a three-second circuit that damages enemies along each connection.",
        "chargeRequired": 2,
        "maxDevices": 4,
        "duration": null,
        "circuitDuration": 3,
        "connectionDamage": 1500,
        "connectionRadius": 0.7,
        "deviceThrowSpeed": 14,
        "deviceInstallDelay": 0.35,
        "motionWindup": 0.24
      },
      "moveSpeedMultiplier": 1,
      "walk": {
        "cycleSpeed": 8,
        "armAmp": 0.25,
        "legAmp": 0.36,
        "armRestZ": 0.15707963267948966
      },
      "maxAmmo": 3,
      "description": "옐로우는 평범한 전기 기술자입니다. 그가 월세를 벌고자 이 대회에 참가했습니다.",
      "descriptionEn": "Yellow is an ordinary electrician who joined the tournament to cover his rent.",
      "basicAttack": {
        "name": "찌릿찌릿 전기구슬",
        "description": "전기구슬을 날립니다. 맞은 캐릭터는 이동속도가 대폭 감소됩니다. 그래서 적군이 자꾸 피하는 거군요! 적중 시 3초 동안 이동속도를 25% 감소시킵니다. 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다.",
        "nameEn": "Zappy Orb",
        "descriptionEn": "Fires an electric orb. Anyone hit is slowed sharply, which is why enemies keep dodging it. Hits slow enemies by 25% for 3 seconds. Basic hits grant 50% of the previous ultimate charge."
      },
      "botTargetCircuitDevices": true,
      "botAvoidLandingZones": true,
      "botLandingDodgeSpeedMultiplier": 2,
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.12,
      "botGroundAttackSpacing": 1,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5
    },
    "cyan": {
      "color": 1044734,
      "maxHealth": 6200,
      "attackType": "spreadLine",
      "reloadDuration": 0.8,
      "attackCooldown": 0.35,
      "spreadLineDamage": 700,
      "spreadLineRange": 8.33,
      "spreadLineSpeed": 18,
      "spreadLineCount": 6,
      "spreadLineSpacing": 0.75,
      "ultimate": {
        "id": "galeStrike",
        "name": "질풍 강타",
        "description": "전방으로 강풍을 발사해 5200 피해를 주고 적을 강하게 밀쳐냅니다. 필요한 궁극기 충전은 1.5칸이며 일반 공격 3회 적중으로 충전합니다.",
        "nameEn": "Gale Strike",
        "descriptionEn": "Launches a gust forward, dealing 5200 damage and strong knockback. Requires 1.5 ultimate charge units (three basic hits).",
        "damage": 5200,
        "range": 10,
        "projectileRadius": 4,
        "speedMultiplier": 1.6666666666666667,
        "knockback": 8,
        "chargeRequired": 1.5,
        "motionWindup": 0.2
      },
      "moveSpeedMultiplier": 1,
      "walk": {
        "cycleSpeed": 8,
        "armAmp": 0.25,
        "legAmp": 0.36,
        "armRestZ": 0.15707963267948966
      },
      "maxAmmo": 3,
      "betaAngleSpacing": 0.095,
      "description": "시안은 평범하게 사는 컬러이지만, 아무래도 수상합니다. 그가 다녔던 회사의 제품은 다 이상한 걸까요?",
      "descriptionEn": "Cyan lives an ordinary life, but something about him is off. Was every product at his old company this strange?",
      "basicAttack": {
        "name": "압축 알약",
        "description": "알약 6발을 0.75타일 간격으로 평행 발사합니다. 알약당 700 피해, 사거리 8.33타일입니다. 일반 공격 적중당 궁극기를 0.5칸 충전합니다.",
        "nameEn": "Compressed Pill",
        "descriptionEn": "Fires 6 parallel pills spaced 0.75 tiles apart. Each deals 700 damage with a 8.33-tile range and grants 0.5 ultimate charge per hit."
      },
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.08,
      "botKnockbackUltimateTankRange": 5,
      "fullUltimateKnockback": true,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5
    },
    "purple": {
      "color": 8388736,
      "maxHealth": 6000,
      "attackType": "poison",
      "reloadDuration": 1.1,
      "attackCooldown": 0.45,
      "needleRange": 13,
      "needleSpeed": 36,
      "needleDamage": 1100,
      "poisonDPS": 1250,
      "poisonDuration": 5,
      "needleCount": 3,
      "needleRadial": false,
      "needleSpreadAngle": 0.4188790204786391,
      "vialRange": 11,
      "vialSpeed": 18,
      "vialDamage": 2920,
      "vialSplashRadius": 4,
      "moveSpeedMultiplier": 1,
      "walk": {
        "cycleSpeed": 7,
        "armAmp": 0.22,
        "legAmp": 0.34,
        "armRestZ": 0.12566370614359174
      },
      "maxAmmo": 3,
      "description": "퍼플은 향수 가게의 사장님이자 의사 자격증이 있는 컬러입니다. 그녀의 향수 가게가 잘 되는 탓인지는 모르지만 그녀의 독침은 꽤나 아픕니다.",
      "descriptionEn": "Purple runs a perfume shop and holds a medical license. Perhaps that is why business is good, but her needles sting badly.",
      "basicAttack": {
        "name": "독침과 독병",
        "description": "첫 번째 일반 공격은 독침 3발을 전방 24도 부채꼴로 발사하여 적에게 피해를 입힙니다. 명중한 적은 일정 시간 동안 독에 걸립니다. 두 번째 일반 공격은 벽을 넘어가는 독병을 던집니다. 독병은 착지 후 깨지며 주변 적에게 광역 피해를 부여합니다. 일반 공격 적중당 궁을 1칸 충전하며 2회 적중으로 준비됩니다. 독 피해는 초당 1250이며 5초 동안 유지됩니다.",
        "nameEn": "Needle & Vial",
        "descriptionEn": "The first attack fires three needles in a 24-degree forward fan, poisoning anyone they hit. The second lobs a vial over walls that shatters on landing for area damage. Each basic hit grants one ultimate unit; two hits charge it. Poison deals 1250 damage per second and lasts five seconds."
      },
      "officialAbility": {
        "id": "wideNeedle",
        "name": "광각 독침",
        "description": "독침 3발을 -12도, 0도, +12도로 발사",
        "nameEn": "Wide Needle",
        "descriptionEn": "Fires three needles at -12, 0, and +12 degrees."
      },
      "ultimate": {
        "id": "toxicLeap",
        "name": "독성 대도약",
        "description": "도약 이륙·착지 때 반경 3.5타일에 즉시 1000 피해를 주고, 중앙에서 가시 16발을 사방으로 발사합니다. 가시는 사거리 10타일, 한 발당 550 피해이며 여러 발이 각각 적중할 수 있습니다. 중앙 피해로 궁 0.25칸, 가시 첫 명중으로 별도 0.25칸을 충전하며 같은 적의 나머지 가시는 해당 단계에서 추가 충전하지 않습니다.",
        "nameEn": "Toxic Leap",
        "descriptionEn": "On takeoff and landing, instantly deals 1000 damage within 3.5 tiles and fires 16 thorns from the center. Each thorn deals 550 damage with 10-tile range; multiple thorns can hit. Central damage and the first thorn hit each grant 0.25 ultimate units per enemy per phase. Further thorns in that phase grant no extra charge.",
        "chargeRequired": 2,
        "damage": 1000,
        "range": 12,
        "radius": 3.5,
        "duration": 0.8,
        "jumpHeight": 5,
        "motionWindup": 0.16,
        "projectileCount": 16,
        "projectileSpeed": 14,
        "projectileRadius": 0.14,
        "projectileRange": 10,
        "projectileDamage": 550,
        "rechargePerHit": 0.25
      },
      "purpleUltimateEnabled": true,
      "basicUltimateChargeMultiplier": 1,
      "attackWindup": 0.14,
      "botAimWindupLeadFactor": 0.5,
      "botSmartUltimate": true,
      "groundAttackRange": 11,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5
    },
    "pink": {
      "color": 16043475,
      "maxHealth": 9900,
      "attackType": "heal_circle",
      "reloadDuration": 0.8,
      "attackCooldown": 0.3,
      "healCircleRange": 4.5,
      "healCircleDamage": 2200,
      "healCircleHeal": 1400,
      "ultimate": {
        "id": "encore",
        "name": "앙코르!",
        "description": "반경 8타일 안의 모든 아군에게 12초 동안 부활 효과를 부여합니다. 효과를 받은 아군이 사망하면 그 자리에서 체력 40%와 2초 무적으로 부활하며, 이미 쓰러진 아군은 즉시 부활합니다.",
        "nameEn": "Encore!",
        "descriptionEn": "Grants every ally within 8 tiles a 12-second revival effect. If an affected ally falls, they revive in place at 40% health with 2 seconds of invulnerability; already-fallen allies revive immediately.",
        "chargeRequired": 12,
        "radius": 8,
        "reviveHealthRatio": 0.4,
        "invulnerabilityDuration": 2,
        "motionWindup": 0.26
      },
      "moveSpeedMultiplier": 1.3,
      "walk": {
        "cycleSpeed": 9,
        "armAmp": 0.34,
        "legAmp": 0.4,
        "armRestZ": 0.3141592653589793
      },
      "maxAmmo": 3,
      "abilityRangeMultiplier": 1.2,
      "description": "핑크는 음악을 좋아하는 스트리머입니다. 그녀는 음악이 너무 좋아서 돈벌이를 까먹는 바람에 돈을 벌려고 대회에 나갔다가 우승해버립니다.",
      "descriptionEn": "Pink is a streamer who loves music so much she forgets to earn a living. She entered the tournament for the prize money and ended up winning it.",
      "basicAttack": {
        "name": "퍼지는 음표",
        "description": "원형으로 퍼지는 음표를 발사합니다. 음표는 적에게 피해를 주고, 아군에게는 체력을 회복시킵니다. 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다.",
        "nameEn": "Spreading Notes",
        "descriptionEn": "Releases notes that spread in a circle, damaging enemies and healing allies. Basic hits grant 50% of the previous ultimate charge."
      },
      "pursuesWhileLowHealth": true,
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.12,
      "botTankTarget": true,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5
    },
    "crimson": {
      "color": 10485760,
      "maxHealth": 10500,
      "attackType": "punchCombo",
      "reloadDuration": 0.9,
      "attackCooldown": 0.74,
      "moveSpeedMultiplier": 1.4,
      "attackRange": 3,
      "attackDamage": 1333.3333333333333,
      "attackCount": 3,
      "attackIntervalMs": 120,
      "attackHalfAngle": 0.7330382858376184,
      "attackAngles": [
        -0.4363323129985824,
        0,
        0.4363323129985824
      ],
      "ultimate": {
        "name": "KO 스트레이트",
        "description": "엄청난 펀치를 날립니다. 너무 강한 펀치를 날린 나머지 벽도 부서지고 적도 밀려납니다.",
        "nameEn": "KO Straight",
        "descriptionEn": "Throws a monstrous punch. It lands so hard that walls break and enemies are shoved away.",
        "motionWindup": 0.22,
        "damage": 6750
      },
      "walk": {
        "cycleSpeed": 9,
        "armAmp": 0.36,
        "legAmp": 0.42,
        "armRestZ": 0.3141592653589793
      },
      "maxAmmo": 3,
      "attackDamages": [
        1333,
        1333,
        1334
      ],
      "description": "크림슨은 레드를 보고 권투를 시작해서 세계적인 권투 선수가 되었습니다. 근데 정작 자기는 레드를 못 이긴다고 하네요.",
      "descriptionEn": "Crimson took up boxing after watching Red and became world class, yet he still says he cannot beat Red.",
      "basicAttack": {
        "name": "3연속 펀치",
        "description": "3연속 펀치로 적에게 피해를 입힙니다. 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다.",
        "nameEn": "Triple Punch",
        "descriptionEn": "Hammers enemies with three consecutive punches. Basic hits grant 50% of the previous ultimate charge."
      },
      "ultimateDamage": 6750,
      "ultimateLength": 6,
      "ultimateWidth": 6,
      "ultimateKnockback": 1,
      "ultimateChargeRequired": 3,
      "pursuesWhileLowHealth": true,
      "projectileDodgeDuration": 0.18,
      "projectileDodgeSpeedMultiplier": 1.5,
      "projectileDodgeForwardFactor": 0.6,
      "projectileDodgeDetectionRange": 20,
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.07,
      "botKnockbackUltimateTankRange": 3,
      "projectileDodgeCooldown": 0.9
    },
    "gold": {
      "color": 16766720,
      "maxHealth": 7380,
      "attackType": "goldOre",
      "reloadDuration": 1.2,
      "attackCooldown": 1.5,
      "moveSpeedMultiplier": 1,
      "stage1Damage": 1300,
      "stage1Range": 8,
      "stage1Speed": 16,
      "stage1Size": 2,
      "stage1SplashRadius": 1.5,
      "stage2Damage": 600,
      "stage2Range": 8,
      "stage2Speed": 18,
      "stage3Damage": 300,
      "stage3Range": 6,
      "stage3Speed": 20,
      "projectileRadius": 0.2,
      "maxChargePerAttack": 6,
      "ultimate": {
        "id": "malfunctionZone",
        "name": "고장 지대",
        "description": "자신의 위치에 반경 6타일 장판을 소환합니다. 장판은 4초 동안 자신을 따라다니며 적의 공격을 막고 이동속도를 50% 감소시킵니다. 설치 대기는 0.2초이며, 장판 안 적에게 1초마다 138 피해를 줍니다.",
        "nameEn": "Malfunction Zone",
        "descriptionEn": "Summons a 6-tile radius field on Gold that follows for 4 seconds. Enemies inside cannot attack and move 50% slower. Activates after 0.2 seconds and deals 138 damage to enemies inside every 1 seconds.",
        "castRange": 0,
        "radius": 6,
        "duration": 4,
        "delay": 0.2,
        "followsCaster": true,
        "tickDamage": 138,
        "tickInterval": 1,
        "motionWindup": 0.24
      },
      "walk": {
        "cycleSpeed": 8,
        "armAmp": 0.25,
        "legAmp": 0.36,
        "armRestZ": 0.15707963267948966
      },
      "maxAmmo": 3,
      "description": "금을 좋아하는 컬러입니다. 부자이고, 돈을 좋아합니다. 근데 자꾸 오렌지한테 눈치를 주는데요?",
      "descriptionEn": "A color who loves gold. He is rich, he loves money, and he keeps side-eyeing Orange for some reason.",
      "basicAttack": {
        "name": "연쇄 금광석",
        "description": "2×2타일 정십이면체 금광석을 직선으로 8타일 발사합니다. 충돌한 금광석은 폭발하며 좌우 90도로 분열하고, 분열탄은 각각 6개의 금괴 투사체로 갈라집니다. 단계별 피해는 1300 / 600 / 300입니다. 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다. 받는 투사체 피해를 1650 감소시킵니다.",
        "nameEn": "Chain Gold Ore",
        "descriptionEn": "Launches a 2x2 dodecahedral gold ore 8 tiles forward. On impact it explodes and splits 90 degrees to each side, and each fragment breaks into six gold bar projectiles. Stage damage: 1300 / 600 / 300. Basic hits grant 50% of the previous ultimate charge. Reduces incoming projectile damage by 1650."
      },
      "ultimateChargeRequired": 6,
      "projectileDamageReduction": 1650,
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.14,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5
    },
    "ivory": {
      "color": 16777200,
      "maxHealth": 6600,
      "attackType": "punch",
      "reloadDuration": 0.9,
      "attackCooldown": 0.7,
      "iceCreamDamage": 2400,
      "iceCreamRange": 9,
      "iceCreamSpeed": 28,
      "iceCreamZoneRadius": 5,
      "iceCreamZoneDuration": 4,
      "iceCreamZoneTickInterval": 1,
      "ultimate": {
        "id": "groupOrder",
        "name": "단체 주문",
        "description": "0~20타일 안의 조준한 위치를 중심으로 중앙과 대각선 네 방향에 아이스크림 5개를 던집니다. 착탄 피해는 2400, 장판 피해는 1초마다 2600입니다. 장판 피해는 중첩되지 않습니다. 궁극기로 발생한 공격 피해가 25% 증가합니다. 겹친 착탄 피해는 대상당 한 번만 받습니다.",
        "nameEn": "Group Order",
        "descriptionEn": "Aims the center within 20 tiles, including at your feet, and throws five ice creams in a diagonal pattern. Each deals 2400 impact damage and leaves a non-stacking zone dealing 2600 damage every 1 seconds. Damage from this ultimate is increased by 25%. Overlapping impacts damage each target only once.",
        "castRange": 20,
        "patternRadius": 3.5,
        "chargeRequired": 3,
        "rechargePerHit": 0.1,
        "motionWindup": 0.28,
        "damageMultiplier": 1.25
      },
      "moveSpeedMultiplier": 1,
      "walk": {
        "cycleSpeed": 7,
        "armAmp": 0.24,
        "legAmp": 0.34,
        "armRestZ": 0.15707963267948966
      },
      "maxAmmo": 3,
      "description": "아이스크림 가게의 직원입니다. 근데 아이스크림을 너무 좋아해서 아이스크림이 자꾸 사라집니다.",
      "descriptionEn": "A cheerful ice cream shop employee who controls the battlefield with ice cream that refuses to melt.",
      "basicAttack": {
        "name": "안 녹는 아이스크림",
        "description": "0~9타일 안의 조준한 위치에 아이스크림을 던집니다. 착탄 시 2400 피해를 주고, 반경 5타일에 4초 동안 1초마다 2600 피해를 주는 장판을 만듭니다. 장판 피해는 중첩되지 않습니다. 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다.",
        "nameEn": "Unmelting Ice Cream",
        "descriptionEn": "Throws ice cream at an aimed position within 9 tiles, including at your feet. It deals 2400 impact damage and leaves a 5-tile-radius zone for 4 seconds that deals 2600 damage every 1 seconds. Zone damage does not stack. Basic hits grant 50% of the previous ultimate charge."
      },
      "iceCreamZoneDamage": 2600,
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.2,
      "groundAttackRange": 9,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5
    },
    "chartreuse": {
      "color": 12711946,
      "maxHealth": 8200,
      "attackType": "chartreuse",
      "reloadDuration": 1.2,
      "attackCooldown": 0.55,
      "moveSpeedMultiplier": 1,
      "chartreuseRange": 9.5,
      "chartreuseSpeed": 22,
      "chartreuseDamage": 1320,
      "chartreuseEnhancedDamage": 2640,
      "ultimate": {
        "id": "clearMind",
        "name": "49% 정신 차림",
        "description": "6초 동안 무탄이 사라지고 세 탄환이 동일 확률로 등장합니다. 궁극기로 발생한 공격 피해가 25% 증가합니다.",
        "nameEn": "49% Clear Mind",
        "descriptionEn": "For 6 seconds, blank rounds are removed and the other three appear equally. Damage from this ultimate is increased by 25%.",
        "chargeRequired": 4,
        "duration": 6,
        "motionWindup": 0.18,
        "damageMultiplier": 1.25
      },
      "walk": {
        "cycleSpeed": 8,
        "armAmp": 0.25,
        "legAmp": 0.36,
        "armRestZ": 0.15707963267948966
      },
      "maxAmmo": 3,
      "description": "어딘가 나사빠지고 멍청해 보이는 캐릭터, 하지만 그가 만든 '샤단라'는 항상 이래서 평범합니다.",
      "descriptionEn": "A controller-leaning random damage dealer.",
      "basicAttack": {
        "name": "무슨 공격이지?",
        "description": "강화탄, CC탄, 흑사병탄, 무탄 중 하나를 무작위로 발사합니다. 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다.",
        "nameEn": "What Attack?",
        "descriptionEn": "Fires one random round: enhanced, CC, plague, or blank. Basic hits grant 50% of the previous ultimate charge."
      },
      "projectileSize": 0.3,
      "projectileDodgeDuration": 0.12,
      "projectileDodgeSpeedMultiplier": 3,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeKinds": [
        "bullet",
        "electric",
        "enhanced",
        "cc",
        "plague"
      ],
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.08,
      "poisonDPS": 820,
      "botAvoidControlProjectiles": true,
      "botTrackTargetDuringWindup": true,
      "botAimLeadFactor": 0.3
    },
    "mint": {
      "color": 10026972,
      "maxHealth": 6600,
      "attackType": "mintIce",
      "reloadDuration": 1.15,
      "attackCooldown": 0.75,
      "moveSpeedMultiplier": 1.05,
      "maxAmmo": 3,
      "iceBulletDamage": 1000,
      "iceBulletRange": 10,
      "iceBulletSpeed": 20,
      "burstCount": 3,
      "burstIntervalMs": 120,
      "icePerHit": 25,
      "freezeThreshold": 100,
      "freezeDuration": 2,
      "ultimate": {
        "name": "아이스크림 장판",
        "castRange": 10,
        "radius": 9,
        "duration": 10,
        "icePerSecond": 5,
        "damagePerSecond": 300,
        "chargeRequired": 7,
        "slideStrength": 3.2,
        "slideAcceleration": 0.6
      },
      "walk": {
        "cycleSpeed": 8,
        "armAmp": 0.25,
        "legAmp": 0.36,
        "armRestZ": 0.15707963267948966
      },
      "description": "차가운 아이스크림으로 적의 움직임을 얼려 버리는 베타 시즌 5 신규 컨트롤러입니다.",
      "descriptionEn": "A Beta Season 5 controller who freezes enemy movement with ice-cold ice cream.",
      "basicAttack": {
        "name": "아이스크림 탄",
        "description": "아이스크림 탄환을 3발 연속 발사합니다. 적중할 때마다 얼음 수치가 25 누적되며, 100이 되면 적이 2초 동안 빙결됩니다. 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다.",
        "nameEn": "Ice Cream Bullets",
        "descriptionEn": "Fires three ice cream bullets in succession. Each hit adds 25 ice; at 100, the target freezes for 2 seconds. Basic hits grant 50% of the previous ultimate charge."
      },
      "special": {
        "id": "iceCreamField",
        "name": "아이스크림 장판",
        "description": "지정한 위치에 10초 동안 반경 9타일의 얼음 장판을 생성합니다. 장판 위의 적은 중심에서 바깥으로 밀려나며, 미는 속도는 초당 3.2타일에서 시작해 매초 0.6씩 빨라집니다. 매초 563 피해와 얼음 수치 5를 받습니다. 얼어 있는 적은 밀리지 않으며 벽을 넘지 않습니다.",
        "nameEn": "Ice Cream Field",
        "descriptionEn": "Creates a 9-tile ice field for 10 seconds. Enemies on it are pushed outward from the centre, starting at 3.2 tiles per second and speeding up by 0.6 each second. They take 563 damage plus 5 ice each second. Frozen enemies are not pushed, and walls stop the push.",
        "castRange": 10,
        "radius": 9,
        "duration": 10,
        "icePerSecond": 5,
        "damagePerSecond": 563,
        "chargeRequired": 7,
        "slideStrength": 3.2,
        "slideAcceleration": 0.6,
        "rechargePerHit": 0.33,
        "motionWindup": 0.24
      },
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.08,
      "botAvoidVolleyProjectiles": true,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5
    },
    "azure": {
      "maxHealth": 10500,
      "moveSpeedMultiplier": 1.12,
      "attackCooldown": 0.2,
      "reloadDuration": 0.65,
      "maxAmmo": 3,
      "surfDashDistance": 2,
      "surfDamage": 3000,
      "surfLength": 4,
      "surfWidth": 3,
      "description": "파도를 타고 전장을 가로지르는 베타 시즌 6 신규 돌격 캐릭터입니다.",
      "descriptionEn": "A Beta Season 6 diver who rides waves straight through the fight.",
      "basicAttack": {
        "name": "서프 대시",
        "description": "파도를 타고 전방 2타일 이동하며, 앞쪽 4×3타일 범위의 적에게 3000 피해를 줍니다. 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다.",
        "nameEn": "Surf Dash",
        "descriptionEn": "Rides a wave two tiles forward and deals 3000 damage in a 4-by-3-tile area ahead. Basic hits grant 50% of the previous ultimate charge."
      },
      "ultimate": {
        "id": "bigWave",
        "name": "빅 웨이브",
        "description": "큰 파도를 전방으로 보내 6000 피해와 강한 넉백을 줍니다. 애저 본인은 이동하지 않습니다.",
        "nameEn": "Big Wave",
        "descriptionEn": "Launches a huge wave dealing 6000 damage and knockback while Azure remains in place.",
        "damage": 6000,
        "range": 6,
        "width": 4,
        "knockback": 9,
        "chargeRequired": 2,
        "motionWindup": 0.24
      },
      "surfSpeed": 17,
      "approachSurfRange": 18,
      "approachSurfDistance": 4,
      "approachSurfCooldown": 0.5,
      "botApproachMin": 3.2,
      "botFireRangeFactor": 0.75,
      "botIdealDistance": 2.2,
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.1,
      "botKnockbackUltimateTankRange": 3,
      "fullUltimateKnockback": true,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5,
      "color": 32767
    },
    "crystal": {
      "maxHealth": 6000,
      "moveSpeedMultiplier": 1.05,
      "attackCooldown": 0.65,
      "reloadDuration": 1.1,
      "maxAmmo": 3,
      "crystalDamage": 2000,
      "crystalRange": 12,
      "crystalSpeed": 20,
      "fragmentDamage": 1000,
      "fragmentCount": 6,
      "fragmentRange": 4.5,
      "fragmentSpeed": 16,
      "shardDamage": 500,
      "shardCount": 12,
      "shardRange": 3.5,
      "shardSpeed": 18,
      "description": "수정탄을 연쇄 분열시키고 적을 분석해 제거하는 캐릭터입니다.",
      "descriptionEn": "Splits crystal shots into cascading shards and analyzes one enemy for elimination.",
      "basicAttack": {
        "name": "연쇄 수정탄",
        "description": "2000 피해의 수정탄이 6개 조각, 다시 12개 작은 조각으로 분열합니다. 같은 단계는 한 대상에게 한 번만 적중합니다. 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다. 3단계 작은 조각 피해는 500이며, 3단계 적중도 궁극기를 0.5칸 충전합니다.",
        "nameEn": "Crystal Cascade",
        "descriptionEn": "A 2,000-damage crystal splits into six fragments, then twelve shards. Each stage can hit the same target only once. Basic hits grant 50% of the previous ultimate charge. Third-stage shards deal 500 damage and grant 0.5 ultimate charge."
      },
      "ultimate": {
        "id": "crystalAnalysis",
        "name": "수정 분석",
        "chargeRequired": 1.5,
        "range": 18,
        "dashSpeed": 28,
        "analysisDuration": 8,
        "description": "긴 거리를 이동해 적 한 명을 붙잡고 양쪽의 행동을 제한합니다. 궁 사용 표시와 돌진 경로를 보여주고 1.5초 준비한 뒤 표시된 위치로 돌진하며, 분석 시작 8초 뒤 보호막을 무시하는 고정 28000 피해를 줍니다. 체력이 남으면 생존하며 분석이 해제됩니다. 피해 감소 보호막을 무시하며, 필요한 궁극기 충전은 1.5칸입니다.",
        "nameEn": "Crystal Analysis",
        "descriptionEn": "Shows an ultimate warning and waits 1.5 seconds before dashing along the marked path to bind an enemy, restricting both actors. Eight seconds after binding, deals a fixed 28000 damage ignoring damage-reduction guards. Surviving targets are released. Execution ignores damage-reduction guards and requires 1.5 charge units.",
        "motionWindup": 1.5,
        "executeBypassesGuard": true,
        "executionFixedAmount": 28000,
        "bindStopsMovement": true,
        "telegraphWidth": 2.4,
        "telegraphReaction": 0.1,
        "telegraphEscapeDuration": 2
      },
      "botAimLeadFactor": 0.65,
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.12,
      "shardUltimateCharge": 1,
      "botTrackTargetDuringWindup": true,
      "botAimIntercept": true,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5,
      "color": 7268351
    },
    "salmon": {
      "maxHealth": 7600,
      "moveSpeedMultiplier": 1,
      "attackCooldown": 2,
      "reloadDuration": null,
      "maxAmmo": 5,
      "attackRange": 8.5,
      "throwSpeed": 14,
      "throwWindup": 0.36,
      "impactRadius": 1.75,
      "directDamage": 2400,
      "splashDamage": 600,
      "landingDamage": 600,
      "noAutomaticReload": true,
      "basicUltimateChargeMultiplier": 1,
      "description": "낚시찌로 적을 포획하고, 빗나간 찌를 직접 회수하는 낚시꾼.",
      "basicAttack": {
        "name": "낚시 찌 투척",
        "nameEn": "Bobber Toss",
        "description": "8.5타일 곡사 투척. 가장 가까운 적 1명에게 3000 피해와 1.2초 포획, 주변에 600 피해. 포획 대상은 착지할 때 추가 600 피해를 받습니다. 포획 시 탄약 1발과 궁 4포인트 회복. 4타일 이내 빗나간 찌는 공격 버튼으로 회수합니다."
      },
      "ultimate": {
        "id": "bigCatch",
        "name": "월척이다!",
        "nameEn": "Big Catch!",
        "description": "원형 테두리에 체력 900인 포획 장치 8개를 설치합니다. 접촉 시 3000 피해와 1.2초 포획 후 해당 장치는 즉시 파괴됩니다. 포획 대상은 착지할 때 추가 600 피해를 받습니다. 투척물이 땅에 닿으면 설치 대기 없이 생성됩니다. 적은 장치를 파괴해 탈출할 수 있습니다.",
        "chargeRequired": 20,
        "castRange": 8.5,
        "throwSpeed": 14,
        "installDelay": 0,
        "radius": 3.5,
        "count": 8,
        "deviceHealth": 900,
        "damage": 3000,
        "landingDamage": 600,
        "deviceRadius": 1
      },
      "botAimLeadFactor": 0.6,
      "attackPerceptionMinRange": 7,
      "attackPerceptionRange": 8.5,
      "projectileDodgeDuration": 0.12,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5,
      "color": 16677236
    }
  },
  "beta": {
    "lavender": {
      "maxHealth": 6000,
      "moveSpeedMultiplier": 1,
      "attackCooldown": 0.9,
      "reloadDuration": 1.2,
      "maxAmmo": 3,
      "attackRange": 9,
      "sprayAngle": 1.0471975511965976,
      "spraySpeed": 20,
      "sprayDuration": 1.5,
      "sprayTickInterval": 0.5,
      "sprayDamage": 1100,
      "description": "향수 분사로 전방을 압박하고 넓은 향기 장판으로 적의 이동을 방해하는 캐릭터입니다.",
      "basicAttack": {
        "name": "향수 스프레이",
        "description": "전방 9타일·60도 범위에 향수를 분사합니다. 가까울수록 틱 간격이 0.25초, 지속시간이 0.75초까지 짧아지고, 최대 사거리에서는 0.5초 간격·1.5초 지속입니다. 첫 적중 거리로 간격과 지속시간을 정하며 최대 3회 적중합니다. 틱 피해는 근거리 0~3타일 1100, 중거리 3타일 초과~6타일 1375, 원거리 6타일 초과~9타일 1650으로 고정되며, 적중당 궁극기를 0.5칸 충전합니다.",
        "descriptionEn": "Sprays perfume in a 9-tile, 60-degree fan. Nearby mist lasts 0.75 seconds and ticks every 0.25 seconds; at maximum range it lasts 1.5 seconds and ticks every 0.5 seconds. Timing is fixed at first contact, with up to three hits. Each hit deals fixed damage by current distance band: 1100 at 0–3 tiles, 1375 at over 3–6 tiles, and 1650 at over 6–9 tiles and grants 0.5 ultimate charge."
      },
      "special": {
        "id": "fragranceField",
        "name": "향기 장판",
        "description": "자신을 따라다니는 반경 6타일의 향기 장판을 6초 동안 생성합니다. 장판 안 적은 70% 느려지고 매초 975 피해를 받습니다.",
        "radius": 6,
        "duration": 6,
        "tickInterval": 1,
        "damagePerSecond": 975,
        "slowPercent": 0.7,
        "chargeRequired": 1,
        "rechargePerHit": 0.025,
        "motionWindup": 0.24
      },
      "sprayDistanceDamageBonus": 0.5,
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.12,
      "sprayCloseTickInterval": 0.25,
      "sprayDamageBands": [
        {
          "maxRange": 3,
          "multiplier": 1
        },
        {
          "maxRange": 6,
          "multiplier": 1.25
        },
        {
          "maxRange": 9,
          "multiplier": 1.5
        }
      ],
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5,
      "color": 11832296
    },
    "red": {
      "color": 16711680,
      "maxHealth": 9000,
      "attackType": "punch",
      "reloadDuration": 0.9,
      "attackCooldown": 0.55,
      "attackRange": 4,
      "ultimate": {
        "id": "redGuard",
        "name": "레드 가드",
        "description": "4초 동안 피해를 75% 감소시키는 보호막을 생성합니다. 피해를 받을 때마다 궁극기가 2칸 충전됩니다.",
        "nameEn": "Red Guard",
        "descriptionEn": "Creates a shield that reduces damage taken by 75% for 4 seconds. Taking a hit charges 2 ultimate units.",
        "duration": 4,
        "damageReduction": 0.75,
        "chargeRequired": 7,
        "motionWindup": 0.16
      },
      "moveSpeedMultiplier": 1.25,
      "walk": {
        "cycleSpeed": 9,
        "armAmp": 0.34,
        "legAmp": 0.4,
        "armRestZ": 0.3141592653589793
      },
      "maxAmmo": 3,
      "attackHalfAngle": 0.7853981633974483,
      "attackWidthMultiplier": 1.2941176470588236,
      "attackDamage": 2000,
      "attackCount": 2,
      "attackIntervalMs": 240,
      "description": "레드는 TV에 나오는 복싱 선수입니다. 하지만 때로는 무식해서 펀치를 잘 못 때리죠.",
      "descriptionEn": "Red is a boxer you see on TV. He is not always the sharpest, though, so his punches sometimes miss.",
      "basicAttack": {
        "name": "잽 잽",
        "description": "레드의 주 공격 기술입니다. 왼쪽 팔로 오른쪽을 때리고 오른쪽 팔로 왼쪽을 때리지요. 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다.",
        "nameEn": "Jab Jab",
        "descriptionEn": "Red's signature move. He swings his left arm to the right, then his right arm to the left. Basic hits grant 50% of the previous ultimate charge."
      },
      "ultimateChargeOnHit": 2,
      "pursuesWhileLowHealth": true,
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.08,
      "botTankTarget": true,
      "botAvoidControlProjectiles": true,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5,
      "botIdealDistance": 3
    },
    "green": {
      "color": 65280,
      "maxHealth": 9600,
      "attackType": "boomerang",
      "reloadDuration": 1,
      "attackCooldown": 0.45,
      "moveSpeedMultiplier": 1.2,
      "boomerangCount": 4,
      "boomerangDamage": 1710,
      "boomerangRange": 7,
      "boomerangSpeed": 20,
      "boomerangReturnSpeedMultiplier": 1.1,
      "boomerangReturnDamageMultiplier": 0.35,
      "boomerangFarThreshold": 3.5,
      "boomerangFarMultiplier": 0.625,
      "boomerangAngles": [
        -0.4363323129985824,
        -0.1454441043328608,
        0.1454441043328608,
        0.4363323129985824
      ],
      "ultimate": {
        "id": "hidingBush",
        "name": "은신 수풀",
        "description": "자신의 위치에 3타일 크기의 수풀을 소환해 최대 10초 동안 그 안에 숨습니다. 공격하면 3초간 노출됩니다.",
        "nameEn": "Hiding Bush",
        "descriptionEn": "Summons a 3-tile bush at your feet and hides inside it for up to 10 seconds. Attacking exposes you for 3 seconds.",
        "chargeRequired": 7,
        "radius": 1.5,
        "duration": 10,
        "revealDuration": 3,
        "motionWindup": 0.18
      },
      "walk": {
        "cycleSpeed": 8,
        "armAmp": 0.3,
        "legAmp": 0.38,
        "armRestZ": 0.18849555921538758
      },
      "maxAmmo": 3,
      "description": "그린은 유일하게 항구 출신이 아닌 캐릭터입니다. 그가 살던 곳은 평범한 시골인데, 돈을 벌어서 이사 가려고 이 대회에 참가하게 되었습니다.",
      "descriptionEn": "Green is the only fighter who is not from the harbor. He grew up in an ordinary rural town and entered the tournament hoping to earn enough to move away.",
      "basicAttack": {
        "name": "부메랑",
        "description": "부메랑 4개를 던집니다. 적이 가까울수록 더 큰 피해를 줍니다. 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다.",
        "nameEn": "Boomerang",
        "descriptionEn": "Throws four boomerangs. The closer the enemy, the more damage each one deals. Basic hits grant 50% of the previous ultimate charge."
      },
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.14,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5
    },
    "blue": {
      "color": 255,
      "maxHealth": 5200,
      "attackType": "bullet",
      "reloadDuration": 0.5,
      "attackCooldown": 0.3,
      "bulletDamage": 1080,
      "bulletRange": 20,
      "bulletSpeed": 68.75,
      "ultimate": {
        "name": "돌진",
        "damage": 1600,
        "speed": 24,
        "duration": 1.15,
        "hitRadius": 1.2,
        "chargeRequired": 4,
        "rechargePerHit": 0.33
      },
      "moveSpeedMultiplier": 1,
      "walk": {
        "cycleSpeed": 7,
        "armAmp": 0.2,
        "legAmp": 0.34,
        "armRestZ": 0.09424777960769379
      },
      "maxAmmo": 3,
      "description": "블루는 평범한 일반인입니다. 하지만 그의 손만큼 빠른 사람은 없습니다. 아마도요?",
      "descriptionEn": "Blue is an ordinary guy. But nobody has hands as fast as his. Probably.",
      "basicAttack": {
        "name": "스피드 구슬",
        "description": "사거리 20타일의 구슬을 빠르게 던져 1080 피해를 줍니다. 투사체 판정이 10% 커지며 일반 공격 5회 적중으로 궁극기를 충전합니다.",
        "nameEn": "Speed Marble",
        "descriptionEn": "Throws a fast marble up to 20 tiles, dealing 1080 damage. Projectile hitboxes are 10% larger and five basic hits charge the ultimate."
      },
      "special": {
        "id": "blueDash",
        "name": "돌진",
        "description": "빠르게 굴러 이동하며 벽에 부딪히면 튕겨 나갑니다. 경로의 적에게 피해와 넉백을 주고, 궁극기 준비·구르기 중 받는 피해가 70% 감소합니다. 종료·중단 시 보호막이 해제됩니다. 궁극기 5회 적중으로 다음 궁극기를 충전합니다.",
        "nameEn": "Ricochet Dash",
        "descriptionEn": "Rolls forward, bouncing off walls and damaging and knocking back enemies. Takes 70% less damage during preparation and rolling; the shield ends when the ultimate ends or is interrupted. Five ultimate hits recharge the next ultimate.",
        "damage": 2000,
        "speed": 24,
        "duration": 1.15,
        "hitRadius": 1.2,
        "chargeRequired": 2.5,
        "rechargePerHit": 0.5,
        "motionWindup": 0.12,
        "damageReduction": 0.7,
        "invulnerableDuringDash": false,
        "guardDuringPreparation": true
      },
      "bulletKnockback": 0,
      "attackPerceptionMinRange": 14,
      "attackPerceptionRange": 20,
      "ultimateUseHealthMin": 0.1,
      "ultimateUseHealthMax": 0.25,
      "dashAwayFromTarget": true,
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.06,
      "botAvoidBurstProjectiles": true,
      "botPathDirections": 24,
      "bulletHitboxMultiplier": 1.1,
      "projectileDodgeDuration": 0.18,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5,
      "pursuesWhileLowHealth": true
    },
    "orange": {
      "color": 16753920,
      "maxHealth": 3400,
      "attackType": "bomb",
      "reloadDuration": 1,
      "attackCooldown": 0.35,
      "bombDamage": 750,
      "bombSplashDamage": 1170,
      "bombRange": 9,
      "bombSpeed": 22,
      "bombSplashCount": 5,
      "bombDirectHitJuiceCount": 4,
      "bombSplashSpeed": 10,
      "bombSplashRange": 4.4,
      "bombSplashHitRadius": 0.75,
      "moveSpeedMultiplier": 1,
      "walk": {
        "cycleSpeed": 8,
        "armAmp": 0.25,
        "legAmp": 0.36,
        "armRestZ": 0.15707963267948966
      },
      "maxAmmo": 3,
      "description": "오렌지는 평범한 오렌지 농부입니다. 하지만 컬러스의 첫 번째 우승자가 되려고 합니다. 오직 오렌지 하나만으로요...",
      "descriptionEn": "Orange is a plain orange farmer, yet he intends to become the first champion of Colors. Armed with nothing but oranges...",
      "basicAttack": {
        "name": "오렌지 슛",
        "description": "평범한 오렌지를 투척합니다. 오렌지가 최대 사정거리에 도달하면 과즙 5개를 퍼트립니다. 그러나 조심하세요! 오렌지를 그냥 맞으면 과즙을 다 맞아버립니다! 오렌지 적중은 궁극기를 10%, 과즙은 하나당 5% 충전하며 함께 맞으면 더해집니다.",
        "nameEn": "Orange Shot",
        "descriptionEn": "Throws an ordinary orange. At maximum range it bursts into five splashes of juice. Careful though: taking the orange head-on means eating every splash too! Basic hits grant 50% of the previous ultimate charge."
      },
      "officialAbility": {
        "id": "wideBlast",
        "name": "광역 폭발",
        "description": "폭발 범위 25% 증가",
        "nameEn": "Wide Blast",
        "descriptionEn": "Increases blast radius by 25%."
      },
      "blastRadiusMultiplier": 1.25,
      "ultimate": {
        "id": "returningPeels",
        "name": "오렌지 껍질 회수",
        "description": "오렌지 껍질 5개를 부채꼴로 던집니다. 최대 사거리에서 2초간 멈춘 뒤 같은 피해량으로 되돌아옵니다.",
        "nameEn": "Returning Peels",
        "descriptionEn": "Throws five peels in a fan. They wait for two seconds at maximum range, then return at full damage.",
        "chargeRequired": 8,
        "count": 5,
        "damage": 1750,
        "range": 10,
        "speed": 16,
        "spreadAngle": 1.0471975511965976,
        "pauseDuration": 2,
        "hitRadius": 0.32,
        "rechargePerHit": 0.33,
        "motionWindup": 0.22
      },
      "orangeUltimateEnabled": true,
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.13,
      "botTrackTargetDuringWindup": true,
      "botAimLeadFactor": 1,
      "botAvoidControlProjectiles": true,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5,
      "ultimateChargeShare": {
        "bomb": 0.1,
        "juice": 0.05
      }
    },
    "yellow": {
      "color": 16776960,
      "maxHealth": 6800,
      "attackType": "electric",
      "reloadDuration": 0.9,
      "attackCooldown": 0.3,
      "attackDelay": 0,
      "electricDamage": 2500,
      "electricRange": 14,
      "electricSpeed": 30,
      "shockSlowPercent": 0.4,
      "shockDuration": 3,
      "ultimate": {
        "id": "electricCircuit",
        "name": "전기 회로",
        "description": "장치를 목표 지점으로 던지고 0.35초 설치 대기 후 사용할 수 있습니다. 장치가 2개 이상일 때 일반 공격으로 맞히면 설치 순서대로 전기가 흐르며 구간당 1500 피해를 줍니다.",
        "nameEn": "Electric Circuit",
        "descriptionEn": "Places a device anywhere. With two or more devices, hit one with a basic attack to power a three-second circuit that damages enemies along each connection.",
        "chargeRequired": 2,
        "maxDevices": 4,
        "duration": null,
        "circuitDuration": 3,
        "connectionDamage": 1500,
        "connectionRadius": 0.7,
        "deviceThrowSpeed": 14,
        "deviceInstallDelay": 0.35,
        "motionWindup": 0.24
      },
      "moveSpeedMultiplier": 1,
      "walk": {
        "cycleSpeed": 8,
        "armAmp": 0.25,
        "legAmp": 0.36,
        "armRestZ": 0.15707963267948966
      },
      "maxAmmo": 3,
      "description": "옐로우는 평범한 전기 기술자입니다. 그가 월세를 벌고자 이 대회에 참가했습니다.",
      "descriptionEn": "Yellow is an ordinary electrician who joined the tournament to cover his rent.",
      "basicAttack": {
        "name": "찌릿찌릿 전기구슬",
        "description": "전기구슬을 날립니다. 맞은 캐릭터는 이동속도가 대폭 감소됩니다. 그래서 적군이 자꾸 피하는 거군요! 적중 시 3초 동안 이동속도를 40% 감소시킵니다. 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다.",
        "nameEn": "Zappy Orb",
        "descriptionEn": "Fires an electric orb. Anyone hit is slowed sharply, which is why enemies keep dodging it. Hits slow enemies by 40% for 3 seconds. Basic hits grant 50% of the previous ultimate charge."
      },
      "botTargetCircuitDevices": true,
      "botAvoidLandingZones": true,
      "botLandingDodgeSpeedMultiplier": 2,
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0,
      "botGroundAttackSpacing": 1,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5,
      "electricRadius": 0.5
    },
    "cyan": {
      "color": 1044734,
      "maxHealth": 8200,
      "attackType": "spreadLine",
      "reloadDuration": 0.8,
      "attackCooldown": 0.35,
      "spreadLineDamage": 1000,
      "spreadLineRange": 8.33,
      "spreadLineSpeed": 18,
      "spreadLineCount": 6,
      "spreadLineSpacing": 0.75,
      "ultimate": {
        "id": "galeStrike",
        "name": "질풍 강타",
        "description": "전방으로 강풍을 발사해 5200 피해를 주고 적을 강하게 밀쳐냅니다. 필요한 궁극기 충전은 1.5칸이며 일반 공격 3회 적중으로 충전합니다.",
        "nameEn": "Gale Strike",
        "descriptionEn": "Launches a gust forward, dealing 5200 damage and strong knockback. Requires 1.5 ultimate charge units (three basic hits).",
        "damage": 5200,
        "range": 10,
        "projectileRadius": 4,
        "speedMultiplier": 1.6666666666666667,
        "knockback": 8,
        "chargeRequired": 1.5,
        "motionWindup": 0.2
      },
      "moveSpeedMultiplier": 1,
      "walk": {
        "cycleSpeed": 8,
        "armAmp": 0.25,
        "legAmp": 0.36,
        "armRestZ": 0.15707963267948966
      },
      "maxAmmo": 3,
      "betaAngleSpacing": 0.095,
      "description": "시안은 평범하게 사는 컬러이지만, 아무래도 수상합니다. 그가 다녔던 회사의 제품은 다 이상한 걸까요?",
      "descriptionEn": "Cyan lives an ordinary life, but something about him is off. Was every product at his old company this strange?",
      "basicAttack": {
        "name": "압축 알약",
        "description": "알약 6발을 0.75타일 간격으로 평행 발사합니다. 알약당 1000 피해, 사거리 8.33타일입니다. 일반 공격 적중당 궁극기를 0.5칸 충전합니다.",
        "nameEn": "Compressed Pill",
        "descriptionEn": "Fires 6 parallel pills spaced 0.75 tiles apart. Each deals 1000 damage with a 8.33-tile range and grants 0.5 ultimate charge per hit."
      },
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.08,
      "botKnockbackUltimateTankRange": 5,
      "fullUltimateKnockback": true,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5
    },
    "purple": {
      "color": 8388736,
      "maxHealth": 6000,
      "attackType": "poison",
      "reloadDuration": 1.1,
      "attackCooldown": 0.45,
      "needleRange": 13,
      "needleSpeed": 36,
      "needleDamage": 1100,
      "poisonDPS": 1250,
      "poisonDuration": 5,
      "needleCount": 3,
      "needleRadial": false,
      "needleSpreadAngle": 0.4188790204786391,
      "vialRange": 11,
      "vialSpeed": 18,
      "vialDamage": 2920,
      "vialSplashRadius": 4,
      "moveSpeedMultiplier": 1,
      "walk": {
        "cycleSpeed": 7,
        "armAmp": 0.22,
        "legAmp": 0.34,
        "armRestZ": 0.12566370614359174
      },
      "maxAmmo": 3,
      "description": "퍼플은 향수 가게의 사장님이자 의사 자격증이 있는 컬러입니다. 그녀의 향수 가게가 잘 되는 탓인지는 모르지만 그녀의 독침은 꽤나 아픕니다.",
      "descriptionEn": "Purple runs a perfume shop and holds a medical license. Perhaps that is why business is good, but her needles sting badly.",
      "basicAttack": {
        "name": "독침과 독병",
        "description": "첫 번째 일반 공격은 독침 3발을 전방 24도 부채꼴로 발사하여 적에게 피해를 입힙니다. 명중한 적은 일정 시간 동안 독에 걸립니다. 두 번째 일반 공격은 벽을 넘어가는 독병을 던집니다. 독병은 착지 후 깨지며 주변 적에게 광역 피해를 부여합니다. 일반 공격 적중당 궁을 1칸 충전하며 2회 적중으로 준비됩니다. 독 피해는 초당 1250이며 5초 동안 유지됩니다.",
        "nameEn": "Needle & Vial",
        "descriptionEn": "The first attack fires three needles in a 24-degree forward fan, poisoning anyone they hit. The second lobs a vial over walls that shatters on landing for area damage. Each basic hit grants one ultimate unit; two hits charge it. Poison deals 1250 damage per second and lasts five seconds."
      },
      "officialAbility": {
        "id": "wideNeedle",
        "name": "광각 독침",
        "description": "독침 3발을 -12도, 0도, +12도로 발사",
        "nameEn": "Wide Needle",
        "descriptionEn": "Fires three needles at -12, 0, and +12 degrees."
      },
      "ultimate": {
        "id": "toxicLeap",
        "name": "독성 대도약",
        "description": "도약 이륙·착지 때 반경 3.5타일에 즉시 1000 피해를 주고, 중앙에서 가시 16발을 사방으로 발사합니다. 가시는 사거리 10타일, 한 발당 550 피해이며 여러 발이 각각 적중할 수 있습니다. 중앙 피해로 궁 0.25칸, 가시 첫 명중으로 별도 0.25칸을 충전하며 같은 적의 나머지 가시는 해당 단계에서 추가 충전하지 않습니다.",
        "nameEn": "Toxic Leap",
        "descriptionEn": "On takeoff and landing, instantly deals 1000 damage within 3.5 tiles and fires 16 thorns from the center. Each thorn deals 550 damage with 10-tile range; multiple thorns can hit. Central damage and the first thorn hit each grant 0.25 ultimate units per enemy per phase. Further thorns in that phase grant no extra charge.",
        "chargeRequired": 2,
        "damage": 1000,
        "range": 12,
        "radius": 3.5,
        "duration": 0.8,
        "jumpHeight": 5,
        "motionWindup": 0.16,
        "projectileCount": 16,
        "projectileSpeed": 14,
        "projectileRadius": 0.14,
        "projectileRange": 10,
        "projectileDamage": 550,
        "rechargePerHit": 0.25
      },
      "purpleUltimateEnabled": true,
      "basicUltimateChargeMultiplier": 1,
      "attackWindup": 0.14,
      "botAimWindupLeadFactor": 0.5,
      "botSmartUltimate": true,
      "groundAttackRange": 11,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5
    },
    "pink": {
      "color": 16043475,
      "maxHealth": 9900,
      "attackType": "heal_circle",
      "reloadDuration": 0.8,
      "attackCooldown": 0.3,
      "healCircleRange": 4.5,
      "healCircleDamage": 2200,
      "healCircleHeal": 1400,
      "ultimate": {
        "id": "encore",
        "name": "앙코르!",
        "description": "반경 8타일 안의 모든 아군에게 12초 동안 부활 효과를 부여합니다. 효과를 받은 아군이 사망하면 그 자리에서 체력 40%와 2초 무적으로 부활하며, 이미 쓰러진 아군은 즉시 부활합니다.",
        "nameEn": "Encore!",
        "descriptionEn": "Grants every ally within 8 tiles a 12-second revival effect. If an affected ally falls, they revive in place at 40% health with 2 seconds of invulnerability; already-fallen allies revive immediately.",
        "chargeRequired": 12,
        "radius": 8,
        "reviveHealthRatio": 0.4,
        "invulnerabilityDuration": 2,
        "motionWindup": 0.26
      },
      "moveSpeedMultiplier": 1.3,
      "walk": {
        "cycleSpeed": 9,
        "armAmp": 0.34,
        "legAmp": 0.4,
        "armRestZ": 0.3141592653589793
      },
      "maxAmmo": 3,
      "abilityRangeMultiplier": 1.2,
      "description": "핑크는 음악을 좋아하는 스트리머입니다. 그녀는 음악이 너무 좋아서 돈벌이를 까먹는 바람에 돈을 벌려고 대회에 나갔다가 우승해버립니다.",
      "descriptionEn": "Pink is a streamer who loves music so much she forgets to earn a living. She entered the tournament for the prize money and ended up winning it.",
      "basicAttack": {
        "name": "퍼지는 음표",
        "description": "원형으로 퍼지는 음표를 발사합니다. 음표는 적에게 피해를 주고, 아군에게는 체력을 회복시킵니다. 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다.",
        "nameEn": "Spreading Notes",
        "descriptionEn": "Releases notes that spread in a circle, damaging enemies and healing allies. Basic hits grant 50% of the previous ultimate charge."
      },
      "pursuesWhileLowHealth": true,
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.12,
      "botTankTarget": true,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5
    },
    "crimson": {
      "color": 10485760,
      "maxHealth": 13000,
      "attackType": "punchCombo",
      "reloadDuration": 0.9,
      "attackCooldown": 0.6,
      "moveSpeedMultiplier": 1.4,
      "attackRange": 3,
      "attackDamage": 1333.3333333333333,
      "attackCount": 3,
      "attackIntervalMs": 120,
      "attackHalfAngle": 0.7330382858376184,
      "attackAngles": [
        -0.4363323129985824,
        0,
        0.4363323129985824
      ],
      "ultimate": {
        "name": "KO 스트레이트",
        "description": "엄청난 펀치를 날립니다. 너무 강한 펀치를 날린 나머지 벽도 부서지고 적도 밀려납니다.",
        "nameEn": "KO Straight",
        "descriptionEn": "Throws a monstrous punch. It lands so hard that walls break and enemies are shoved away.",
        "motionWindup": 0.22,
        "damage": 6750
      },
      "walk": {
        "cycleSpeed": 9,
        "armAmp": 0.36,
        "legAmp": 0.42,
        "armRestZ": 0.3141592653589793
      },
      "maxAmmo": 3,
      "attackDamages": [
        1333,
        1333,
        1334
      ],
      "description": "크림슨은 레드를 보고 권투를 시작해서 세계적인 권투 선수가 되었습니다. 근데 정작 자기는 레드를 못 이긴다고 하네요.",
      "descriptionEn": "Crimson took up boxing after watching Red and became world class, yet he still says he cannot beat Red.",
      "basicAttack": {
        "name": "3연속 펀치",
        "description": "3연속 펀치로 적에게 피해를 입힙니다. 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다.",
        "nameEn": "Triple Punch",
        "descriptionEn": "Hammers enemies with three consecutive punches. Basic hits grant 50% of the previous ultimate charge."
      },
      "ultimateDamage": 6750,
      "ultimateLength": 6,
      "ultimateWidth": 6,
      "ultimateKnockback": 1,
      "ultimateChargeRequired": 3,
      "pursuesWhileLowHealth": true,
      "projectileDodgeDuration": 0.18,
      "projectileDodgeSpeedMultiplier": 1.5,
      "projectileDodgeForwardFactor": 0.6,
      "projectileDodgeDetectionRange": 20,
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.07,
      "botKnockbackUltimateTankRange": 3,
      "projectileDodgeCooldown": 0.9
    },
    "gold": {
      "color": 16766720,
      "maxHealth": 7000,
      "attackType": "goldOre",
      "reloadDuration": 1.2,
      "attackCooldown": 1.5,
      "moveSpeedMultiplier": 1,
      "stage1Damage": 3400,
      "stage1Range": 8,
      "stage1Speed": 26,
      "stage1Size": 2.6,
      "stage1SplashRadius": 2,
      "stage2Damage": 1700,
      "stage2Range": 8,
      "stage2Speed": 18,
      "stage3Damage": 850,
      "stage3Range": 6,
      "stage3Speed": 20,
      "projectileRadius": 0.2,
      "maxChargePerAttack": 6,
      "ultimate": {
        "id": "malfunctionZone",
        "name": "고장 지대",
        "description": "자신의 위치에 반경 4.5타일 장판을 소환합니다. 장판은 4초 동안 자신을 따라다닙니다. 안에 있는 적에게 고장을 적용해 이동속도를 50% 감소시키고 일반공격과 궁극기 사용을 막습니다. 고장 중 공격·궁극기 UI가 회색으로 표시됩니다. 아군과 골드 본인은 영향을 받지 않습니다. 설치 대기는 0.2초이며, 장판 안 적에게 1초마다 138 피해를 줍니다.",
        "nameEn": "Malfunction Zone",
        "descriptionEn": "Summons a 4.5-tile radius field on Gold that follows for 4 seconds. Enemies inside cannot attack and move 50% slower. Activates after 0.2 seconds and deals 138 damage to enemies inside every 1 seconds.",
        "castRange": 0,
        "radius": 4.5,
        "duration": 4,
        "delay": 0.2,
        "followsCaster": true,
        "tickDamage": 138,
        "tickInterval": 1,
        "motionWindup": 0.24
      },
      "walk": {
        "cycleSpeed": 8,
        "armAmp": 0.25,
        "legAmp": 0.36,
        "armRestZ": 0.15707963267948966
      },
      "maxAmmo": 3,
      "description": "금을 좋아하는 컬러입니다. 부자이고, 돈을 좋아합니다. 근데 자꾸 오렌지한테 눈치를 주는데요?",
      "descriptionEn": "A color who loves gold. He is rich, he loves money, and he keeps side-eyeing Orange for some reason.",
      "basicAttack": {
        "name": "연쇄 금광석",
        "description": "2.6×2.6타일 정십이면체 금광석을 직선으로 8타일 발사합니다. 충돌한 금광석은 폭발하며 좌우 90도로 분열하고, 분열탄은 각각 6개의 금괴 투사체로 갈라집니다. 단계별 피해는 3400 / 1700 / 850입니다. 분열탄과 금괴는 같은 공격에 이미 맞은 적을 통과합니다. 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다. 받는 투사체 피해를 900 감소시킵니다.",
        "nameEn": "Chain Gold Ore",
        "descriptionEn": "Launches a 2.6x2.6 dodecahedral gold ore 8 tiles forward. On impact it explodes and splits 90 degrees to each side, and each fragment breaks into six gold bar projectiles. Stage damage: 3400 / 1700 / 850. Fragments and bars pass through enemies the same attack already hit. Basic hits grant 50% of the previous ultimate charge. Reduces incoming projectile damage by 900."
      },
      "ultimateChargeRequired": 6,
      "projectileDamageReduction": 900,
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.14,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5,
      "goldSplitsSkipHitTargets": true
    },
    "ivory": {
      "color": 16777200,
      "maxHealth": 6600,
      "attackType": "punch",
      "reloadDuration": 1.05,
      "attackCooldown": 0.7,
      "iceCreamDamage": 1600,
      "iceCreamRange": 9,
      "iceCreamSpeed": 28,
      "iceCreamZoneRadius": 4,
      "iceCreamZoneDuration": 4,
      "iceCreamZoneTickInterval": 1,
      "ultimate": {
        "id": "groupOrder",
        "name": "단체 주문",
        "description": "0~20타일 안의 조준한 위치를 중심으로 중앙과 대각선 네 방향에 아이스크림 5개를 던집니다. 착탄 피해는 1600, 장판 피해는 1초마다 1300입니다. 장판 피해는 중첩되지 않습니다. 궁극기로 발생한 공격 피해가 25% 증가합니다. 겹친 착탄 피해는 대상당 한 번만 받습니다.",
        "nameEn": "Group Order",
        "descriptionEn": "Aims the center within 20 tiles, including at your feet, and throws five ice creams in a diagonal pattern. Each deals 1600 impact damage and leaves a non-stacking zone dealing 1300 damage every 1 seconds. Damage from this ultimate is increased by 25%. Overlapping impacts damage each target only once.",
        "castRange": 20,
        "patternRadius": 3.5,
        "chargeRequired": 3,
        "rechargePerHit": 0.1,
        "motionWindup": 0.28,
        "damageMultiplier": 1.25
      },
      "moveSpeedMultiplier": 1,
      "walk": {
        "cycleSpeed": 7,
        "armAmp": 0.24,
        "legAmp": 0.34,
        "armRestZ": 0.15707963267948966
      },
      "maxAmmo": 3,
      "description": "아이스크림 가게의 직원입니다. 근데 아이스크림을 너무 좋아해서 아이스크림이 자꾸 사라집니다.",
      "descriptionEn": "A cheerful ice cream shop employee who controls the battlefield with ice cream that refuses to melt.",
      "basicAttack": {
        "name": "안 녹는 아이스크림",
        "description": "0~9타일 안의 조준한 위치에 아이스크림을 던집니다. 착탄 시 1600 피해를 주고, 반경 4타일에 4초 동안 1초마다 1300 피해를 주는 장판을 만듭니다. 장판 피해는 중첩되지 않습니다. 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다.",
        "nameEn": "Unmelting Ice Cream",
        "descriptionEn": "Throws ice cream at an aimed position within 9 tiles, including at your feet. It deals 1600 impact damage and leaves a 4-tile-radius zone for 4 seconds that deals 1300 damage every 1 seconds. Zone damage does not stack. Basic hits grant 50% of the previous ultimate charge."
      },
      "iceCreamZoneDamage": 1300,
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.2,
      "groundAttackRange": 9,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5
    },
    "chartreuse": {
      "color": 12711946,
      "maxHealth": 8200,
      "attackType": "chartreuse",
      "reloadDuration": 1.1,
      "attackCooldown": 0.55,
      "moveSpeedMultiplier": 1,
      "chartreuseRange": 11,
      "chartreuseSpeed": 26,
      "chartreuseDamage": 1380,
      "chartreuseEnhancedDamage": 2760,
      "ultimate": {
        "id": "clearMind",
        "name": "49% 정신 차림",
        "description": "6초 동안 무탄이 사라지고 세 탄환이 동일 확률로 등장합니다. 궁극기로 발생한 공격 피해가 50% 증가합니다.",
        "nameEn": "49% Clear Mind",
        "descriptionEn": "For 6 seconds, blank rounds are removed and the other three appear equally. Damage from this ultimate is increased by 50%.",
        "chargeRequired": 4,
        "duration": 6,
        "motionWindup": 0.18,
        "damageMultiplier": 1.5
      },
      "walk": {
        "cycleSpeed": 8,
        "armAmp": 0.25,
        "legAmp": 0.36,
        "armRestZ": 0.15707963267948966
      },
      "maxAmmo": 3,
      "description": "어딘가 나사빠지고 멍청해 보이는 캐릭터, 하지만 그가 만든 '샤단라'는 항상 이래서 평범합니다.",
      "descriptionEn": "A controller-leaning random damage dealer.",
      "basicAttack": {
        "name": "무슨 공격이지?",
        "description": "강화탄, CC탄, 흑사병탄, 무탄 중 하나를 무작위로 발사합니다. 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다.",
        "nameEn": "What Attack?",
        "descriptionEn": "Fires one random round: enhanced, CC, plague, or blank. Basic hits grant 50% of the previous ultimate charge."
      },
      "projectileSize": 0.3,
      "projectileDodgeDuration": 0.12,
      "projectileDodgeSpeedMultiplier": 3,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeKinds": [
        "bullet",
        "electric",
        "enhanced",
        "cc",
        "plague"
      ],
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.08,
      "poisonDPS": 820,
      "botAvoidControlProjectiles": true,
      "botTrackTargetDuringWindup": true,
      "botAimLeadFactor": 0.3
    },
    "mint": {
      "color": 10026972,
      "maxHealth": 8600,
      "attackType": "mintIce",
      "reloadDuration": 1.15,
      "attackCooldown": 0.55,
      "moveSpeedMultiplier": 1.15,
      "maxAmmo": 3,
      "iceBulletDamage": 1200,
      "iceBulletRange": 10,
      "iceBulletSpeed": 20,
      "burstCount": 3,
      "burstIntervalMs": 80,
      "icePerHit": 25,
      "freezeThreshold": 75,
      "freezeDuration": 2,
      "ultimate": {
        "name": "아이스크림 장판",
        "castRange": 10,
        "radius": 9,
        "duration": 10,
        "icePerSecond": 5,
        "damagePerSecond": 300,
        "chargeRequired": 7,
        "slideStrength": 3.2,
        "slideAcceleration": 0.6
      },
      "walk": {
        "cycleSpeed": 8,
        "armAmp": 0.25,
        "legAmp": 0.36,
        "armRestZ": 0.15707963267948966
      },
      "description": "차가운 아이스크림으로 적의 움직임을 얼려 버리는 베타 시즌 5 신규 컨트롤러입니다.",
      "descriptionEn": "A Beta Season 5 controller who freezes enemy movement with ice-cold ice cream.",
      "basicAttack": {
        "name": "아이스크림 탄",
        "description": "아이스크림 탄환을 3발 연속 발사합니다. 3발은 좌우 9도로 부채꼴처럼 퍼져 나갑니다. 적중할 때마다 얼음 수치가 25 누적되며, 75가 되면 적이 2초 동안 빙결됩니다. 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다.",
        "nameEn": "Ice Cream Bullets",
        "descriptionEn": "Fires three ice cream bullets in succession, fanning out 9° to each side. Each hit adds 25 ice; at 75, the target freezes for 2 seconds. Basic hits grant 50% of the previous ultimate charge."
      },
      "special": {
        "id": "iceCreamField",
        "name": "아이스크림 장판",
        "description": "지정한 위치에 10초 동안 반경 9타일의 얼음 장판을 생성합니다. 장판 위의 적은 중심에서 바깥으로 밀려나며, 미는 속도는 초당 3.2타일에서 시작해 매초 0.6씩 빨라집니다. 매초 563 피해와 얼음 수치 25를 받아, 장판 위에 3초 있으면 빙결됩니다. 빙결 중에는 얼음이 쌓이지 않고 풀린 뒤 다시 쌓입니다. 얼어 있는 적은 밀리지 않으며 벽을 넘지 않습니다.",
        "nameEn": "Ice Cream Field",
        "descriptionEn": "Creates a 9-tile ice field for 10 seconds. Enemies on it are pushed outward from the centre, starting at 3.2 tiles per second and speeding up by 0.6 each second. They take 563 damage plus 25 ice each second, so 3 seconds on it freezes them. No ice builds while frozen; it builds again after thawing. Frozen enemies are not pushed, and walls stop the push.",
        "castRange": 10,
        "radius": 9,
        "duration": 10,
        "icePerSecond": 25,
        "damagePerSecond": 563,
        "chargeRequired": 4,
        "slideStrength": 3.2,
        "slideAcceleration": 0.6,
        "rechargePerHit": 0.33,
        "motionWindup": 0.24
      },
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0,
      "botAvoidVolleyProjectiles": true,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5,
      "burstSpreadAngle": 0.15707963267948966,
      "iceBlockedWhileFrozen": true
    },
    "azure": {
      "maxHealth": 10500,
      "moveSpeedMultiplier": 1.12,
      "attackCooldown": 0.2,
      "reloadDuration": 0.65,
      "maxAmmo": 3,
      "surfDashDistance": 2,
      "surfDamage": 3000,
      "surfLength": 4,
      "surfWidth": 3,
      "description": "파도를 타고 전장을 가로지르는 베타 시즌 6 신규 돌격 캐릭터입니다.",
      "descriptionEn": "A Beta Season 6 diver who rides waves straight through the fight.",
      "basicAttack": {
        "name": "서프 대시",
        "description": "파도를 타고 전방 2타일 이동하며, 앞쪽 4×3타일 범위의 적에게 3000 피해를 줍니다. 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다.",
        "nameEn": "Surf Dash",
        "descriptionEn": "Rides a wave two tiles forward and deals 3000 damage in a 4-by-3-tile area ahead. Basic hits grant 50% of the previous ultimate charge."
      },
      "ultimate": {
        "id": "bigWave",
        "name": "빅 웨이브",
        "description": "큰 파도를 전방 10타일·폭 5타일로 보내 6000 피해와 강한 넉백을 줍니다. 애저 본인은 이동하지 않습니다.",
        "nameEn": "Big Wave",
        "descriptionEn": "Launches a huge 10-tile, 5-wide wave dealing 6000 damage and knockback while Azure remains in place.",
        "damage": 6000,
        "range": 10,
        "width": 5,
        "knockback": 9,
        "chargeRequired": 2,
        "motionWindup": 0.24
      },
      "surfSpeed": 17,
      "approachSurfRange": 18,
      "approachSurfDistance": 4,
      "approachSurfCooldown": 0.5,
      "botApproachMin": 3.2,
      "botFireRangeFactor": 0.75,
      "botIdealDistance": 2.2,
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.1,
      "botKnockbackUltimateTankRange": 3,
      "fullUltimateKnockback": true,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5,
      "pursuesWhileLowHealth": true,
      "color": 32767
    },
    "crystal": {
      "maxHealth": 6600,
      "moveSpeedMultiplier": 1.05,
      "attackCooldown": 0.65,
      "reloadDuration": 1.1,
      "maxAmmo": 3,
      "crystalDamage": 2000,
      "crystalRange": 12,
      "crystalSpeed": 20,
      "fragmentDamage": 1000,
      "fragmentCount": 6,
      "fragmentRange": 4.5,
      "fragmentSpeed": 16,
      "shardDamage": 500,
      "shardCount": 12,
      "shardRange": 3.5,
      "shardSpeed": 18,
      "description": "수정탄을 연쇄 분열시키고 적을 분석해 제거하는 캐릭터입니다.",
      "descriptionEn": "Splits crystal shots into cascading shards and analyzes one enemy for elimination.",
      "basicAttack": {
        "name": "연쇄 수정탄",
        "description": "2000 피해의 수정탄이 6개 조각, 다시 12개 작은 조각으로 분열합니다. 같은 단계는 한 대상에게 한 번만 적중합니다. 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다. 3단계 작은 조각 피해는 500이며, 3단계 적중도 궁극기를 0.5칸 충전합니다.",
        "nameEn": "Crystal Cascade",
        "descriptionEn": "A 2,000-damage crystal splits into six fragments, then twelve shards. Each stage can hit the same target only once. Basic hits grant 50% of the previous ultimate charge. Third-stage shards deal 500 damage and grant 0.5 ultimate charge."
      },
      "ultimate": {
        "id": "crystalAnalysis",
        "name": "수정 분석",
        "chargeRequired": 1.5,
        "range": 18,
        "dashSpeed": 28,
        "analysisDuration": 8,
        "description": "긴 거리를 이동해 적 한 명을 붙잡고 양쪽의 행동을 제한합니다. 궁 사용 표시와 돌진 경로를 보여주고 1.5초 준비한 뒤 표시된 위치로 돌진하며, 분석 시작 8초 뒤 보호막을 무시하는 고정 28000 피해를 줍니다. 체력이 남으면 생존하며 분석이 해제됩니다. 피해 감소 보호막을 무시하며, 필요한 궁극기 충전은 1.5칸입니다.",
        "nameEn": "Crystal Analysis",
        "descriptionEn": "Shows an ultimate warning and waits 1.5 seconds before dashing along the marked path to bind an enemy, restricting both actors. Eight seconds after binding, deals a fixed 28000 damage ignoring damage-reduction guards. Surviving targets are released. Execution ignores damage-reduction guards and requires 1.5 charge units.",
        "motionWindup": 1.5,
        "executeBypassesGuard": true,
        "executionFixedAmount": 28000,
        "bindStopsMovement": true,
        "telegraphWidth": 2.4,
        "telegraphReaction": 0.1,
        "telegraphEscapeDuration": 2
      },
      "botAimLeadFactor": 0.65,
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.12,
      "shardUltimateCharge": 1,
      "botTrackTargetDuringWindup": true,
      "botAimIntercept": true,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5,
      "color": 7268351
    },
    "salmon": {
      "maxHealth": 7200,
      "moveSpeedMultiplier": 1,
      "attackCooldown": 1.5,
      "reloadDuration": null,
      "maxAmmo": 5,
      "attackRange": 8.5,
      "throwSpeed": 26,
      "throwWindup": 0.22,
      "impactRadius": 2.3,
      "directDamage": 2700,
      "splashDamage": 600,
      "landingDamage": 600,
      "noAutomaticReload": true,
      "basicUltimateChargeMultiplier": 1,
      "description": "낚시찌로 적을 포획하고, 빗나간 찌를 직접 회수하는 낚시꾼.",
      "basicAttack": {
        "name": "낚시 찌 투척",
        "nameEn": "Bobber Toss",
        "description": "8.5타일 곡사 투척. 가장 가까운 적 1명에게 3300 피해와 2.4초 포획, 주변에 600 피해. 포획 대상은 착지할 때 추가 600 피해를 받습니다. 투척 명중으로 포획 시 탄약 1발과 궁 4포인트 회복. 빗나간 찌도 적이 닿으면 1명을 2.4초간 띄운 뒤 사라지며, 착지 피해 600을 줍니다. 이 접촉에는 투척 명중 피해와 탄약·궁 회복이 없습니다. 4타일 이내 빗나간 찌는 공격 버튼으로 회수합니다."
      },
      "ultimate": {
        "id": "bigCatch",
        "name": "월척이다!",
        "nameEn": "Big Catch!",
        "description": "원형 테두리에 체력 900인 포획 장치 8개를 설치합니다. 접촉 시 3000 피해와 2.4초 포획 후 해당 장치는 즉시 파괴됩니다. 포획 대상은 착지할 때 추가 600 피해를 받습니다. 투척물이 땅에 닿으면 설치 대기 없이 생성됩니다. 적은 장치를 파괴해 탈출할 수 있습니다.",
        "chargeRequired": 20,
        "castRange": 8.5,
        "throwSpeed": 14,
        "installDelay": 0,
        "radius": 3.5,
        "count": 8,
        "deviceHealth": 900,
        "damage": 3000,
        "landingDamage": 600,
        "deviceRadius": 1
      },
      "botAimLeadFactor": 0.6,
      "attackPerceptionMinRange": 7.8,
      "attackPerceptionRange": 8.5,
      "projectileDodgeDuration": 0.12,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5,
      "salmonAirborneDuration": 2.4,
      "pursuesWhileLowHealth": true,
      "color": 16677236
    },
    "raspberry": {
      "name": "라즈베리",
      "nameEn": "Raspberry",
      "rarity": "hero",
      "color": 14037868,
      "maxHealth": 4800,
      "moveSpeedMultiplier": 1,
      "attackCooldown": 0.8,
      "reloadDuration": 1.2,
      "maxAmmo": 3,
      "attackRange": 18,
      "vineRange": 18,
      "vineSpeed": 36,
      "vineDamage": 2250,
      "vineRadius": 0.35,
      "vineBindDuration": 0.6,
      "vineTraitBindBonus": 1.4,
      "basicUltimateChargeMultiplier": 1,
      "pursuesWhileLowHealth": true,
      "botAvoidControlProjectiles": [
        "shock"
      ],
      "basicAttack": {
        "name": "덩굴 저격",
        "nameEn": "Vine Snipe",
        "description": "사거리 18타일의 직선 덩굴탄을 쏴 2,250 피해를 주고 2초 동안 이동을 묶습니다(기본 0.6초 + 특성 1.4초). 묶인 적은 공격과 제자리 궁극기는 쓸 수 있지만 이동·돌진·점프는 할 수 없습니다. 벽이나 첫 적에게 맞으면 사라집니다.",
        "descriptionEn": "Fires a straight 18-tile vine shot dealing 2,250 damage and binding movement for 2 seconds (0.6 base + 1.4 trait). Bound enemies can still attack and use in-place ultimates but cannot move, dash or jump. Stops at walls and the first enemy."
      },
      "ultimate": {
        "id": "vinePrison",
        "name": "덩굴 감옥",
        "nameEn": "Vine Prison",
        "castRange": 10,
        "radius": 3.5,
        "telegraph": 0.4,
        "damage": 600,
        "bindDuration": 2,
        "duration": 4,
        "slowPercent": 0.3,
        "chargeRequired": 6,
        "rechargePerHit": 0,
        "motionWindup": 0,
        "description": "10타일 안의 지점에 반지름 3.5타일 덩굴 감옥을 예고하고 0.4초 뒤 발동합니다. 발동 순간 안에 있는 적은 600 피해와 2초 속박을 받고, 4초 동안 영역 안에서는 30% 느려집니다. 공중의 적과 벽 뒤의 적은 영향을 받지 않습니다.",
        "descriptionEn": "Marks a 3.5-tile vine prison within 10 tiles and triggers it after 0.4 seconds. Enemies inside take 600 damage and a 2-second bind, then are slowed by 30% while inside for 4 seconds. Airborne enemies and enemies behind walls are unaffected."
      }
    },
    "black": {
      "maxHealth": 7800,
      "moveSpeedMultiplier": 1.2,
      "maxAmmo": 3,
      "reloadDuration": 1,
      "attackCooldown": 0.45,
      "attackRange": 3,
      "attackHalfAngle": 0.4363323129985824,
      "attackDamage": 2000,
      "description": "그림자를 다루는 근접 암살자. 공격하거나 피해를 받으면 3초 동안 드러납니다.",
      "basicAttack": {
        "name": "그림자 주먹",
        "description": "전방 3타일, 50도 범위에 2,000 피해를 줍니다."
      },
      "ultimate": {
        "name": "그림자 잠입",
        "chargeRequired": 5,
        "range": 9,
        "damage": 1200,
        "count": 3,
        "interval": 0.2,
        "description": "9타일 안의 가까운 적 뒤로 순간이동하고 1,200 피해를 3회 줍니다. 벽을 통과하지 않습니다."
      },
      "color": 0
    },
    "white": {
      "maxHealth": 6200,
      "moveSpeedMultiplier": 1,
      "maxAmmo": 3,
      "reloadDuration": 1.4,
      "attackCooldown": 0.6,
      "attackRange": 9,
      "bottleSpeed": 18,
      "bottleDamage": 1400,
      "bottleRadius": 1.5,
      "bugHealth": 600,
      "bugSpeed": 8.8,
      "bugDamage": 300,
      "bugInterval": 0.8,
      "bugRange": 7,
      "bugDuration": 6,
      "bugLimit": 6,
      "description": "실험병과 흰 벌레로 견제하는 원거리 소환사.",
      "basicAttack": {
        "name": "화잇병 투척",
        "description": "9타일 안에 병을 던져 반경 1.5타일에 1,400 피해를 주고 흰 벌레를 소환합니다."
      },
      "ultimate": {
        "name": "대형 실험병",
        "chargeRequired": 6,
        "range": 9,
        "damage": 2800,
        "radius": 3,
        "bugHealth": 3000,
        "bugDamage": 700,
        "bugSpeed": 7.2,
        "bugDuration": 10,
        "bugInterval": 1,
        "description": "큰 병을 던져 반경 3타일에 2,800 피해를 주고 10초간 큰 벌레를 소환합니다."
      },
      "color": 16777215
    }
  },
  "official": {
    "lavender": {
      "maxHealth": 6000,
      "moveSpeedMultiplier": 1,
      "attackCooldown": 0.9,
      "reloadDuration": 1.2,
      "maxAmmo": 3,
      "attackRange": 9,
      "sprayAngle": 1.0471975511965976,
      "spraySpeed": 20,
      "sprayDuration": 1.5,
      "sprayTickInterval": 0.5,
      "sprayDamage": 1100,
      "description": "향수 분사로 전방을 압박하고 넓은 향기 장판으로 적의 이동을 방해하는 캐릭터입니다.",
      "basicAttack": {
        "name": "향수 스프레이",
        "description": "전방 9타일·60도 범위에 향수를 분사합니다. 가까울수록 틱 간격이 0.25초, 지속시간이 0.75초까지 짧아지고, 최대 사거리에서는 0.5초 간격·1.5초 지속입니다. 첫 적중 거리로 간격과 지속시간을 정하며 최대 3회 적중합니다. 틱 피해는 근거리 0~3타일 1100, 중거리 3타일 초과~6타일 1375, 원거리 6타일 초과~9타일 1650으로 고정되며, 적중당 궁극기를 0.5칸 충전합니다.",
        "descriptionEn": "Sprays perfume in a 9-tile, 60-degree fan. Nearby mist lasts 0.75 seconds and ticks every 0.25 seconds; at maximum range it lasts 1.5 seconds and ticks every 0.5 seconds. Timing is fixed at first contact, with up to three hits. Each hit deals fixed damage by current distance band: 1100 at 0–3 tiles, 1375 at over 3–6 tiles, and 1650 at over 6–9 tiles and grants 0.5 ultimate charge."
      },
      "special": {
        "id": "fragranceField",
        "name": "향기 장판",
        "description": "자신을 따라다니는 반경 6타일의 향기 장판을 6초 동안 생성합니다. 장판 안 적은 70% 느려지고 매초 975 피해를 받습니다.",
        "radius": 6,
        "duration": 6,
        "tickInterval": 1,
        "damagePerSecond": 975,
        "slowPercent": 0.7,
        "chargeRequired": 1,
        "rechargePerHit": 0.025,
        "motionWindup": 0.24
      },
      "sprayDistanceDamageBonus": 0.5,
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.12,
      "sprayCloseTickInterval": 0.25,
      "sprayDamageBands": [
        {
          "maxRange": 3,
          "multiplier": 1
        },
        {
          "maxRange": 6,
          "multiplier": 1.25
        },
        {
          "maxRange": 9,
          "multiplier": 1.5
        }
      ],
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5,
      "color": 11832296
    },
    "red": {
      "color": 16711680,
      "maxHealth": 9000,
      "attackType": "punch",
      "reloadDuration": 0.9,
      "attackCooldown": 0.55,
      "attackRange": 4,
      "ultimate": {
        "id": "redGuard",
        "name": "레드 가드",
        "description": "4초 동안 피해를 75% 감소시키는 보호막을 생성합니다. 피해를 받을 때마다 궁극기가 2칸 충전됩니다.",
        "nameEn": "Red Guard",
        "descriptionEn": "Creates a shield that reduces damage taken by 75% for 4 seconds. Taking a hit charges 2 ultimate units.",
        "duration": 4,
        "damageReduction": 0.75,
        "chargeRequired": 7,
        "motionWindup": 0.16
      },
      "moveSpeedMultiplier": 1.25,
      "walk": {
        "cycleSpeed": 9,
        "armAmp": 0.34,
        "legAmp": 0.4,
        "armRestZ": 0.3141592653589793
      },
      "maxAmmo": 3,
      "attackHalfAngle": 0.7853981633974483,
      "attackWidthMultiplier": 1.2941176470588236,
      "attackDamage": 2000,
      "attackCount": 2,
      "attackIntervalMs": 240,
      "description": "레드는 TV에 나오는 복싱 선수입니다. 하지만 때로는 무식해서 펀치를 잘 못 때리죠.",
      "descriptionEn": "Red is a boxer you see on TV. He is not always the sharpest, though, so his punches sometimes miss.",
      "basicAttack": {
        "name": "잽 잽",
        "description": "레드의 주 공격 기술입니다. 왼쪽 팔로 오른쪽을 때리고 오른쪽 팔로 왼쪽을 때리지요. 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다.",
        "nameEn": "Jab Jab",
        "descriptionEn": "Red's signature move. He swings his left arm to the right, then his right arm to the left. Basic hits grant 50% of the previous ultimate charge."
      },
      "ultimateChargeOnHit": 2,
      "pursuesWhileLowHealth": true,
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.08,
      "botTankTarget": true,
      "botAvoidControlProjectiles": true,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5,
      "botIdealDistance": 3
    },
    "green": {
      "color": 65280,
      "maxHealth": 9600,
      "attackType": "boomerang",
      "reloadDuration": 1,
      "attackCooldown": 0.45,
      "moveSpeedMultiplier": 1.2,
      "boomerangCount": 4,
      "boomerangDamage": 1710,
      "boomerangRange": 7,
      "boomerangSpeed": 20,
      "boomerangReturnSpeedMultiplier": 1.1,
      "boomerangReturnDamageMultiplier": 0.35,
      "boomerangFarThreshold": 3.5,
      "boomerangFarMultiplier": 0.625,
      "boomerangAngles": [
        -0.4363323129985824,
        -0.1454441043328608,
        0.1454441043328608,
        0.4363323129985824
      ],
      "ultimate": {
        "id": "hidingBush",
        "name": "은신 수풀",
        "description": "자신의 위치에 3타일 크기의 수풀을 소환해 최대 10초 동안 그 안에 숨습니다. 공격하면 3초간 노출됩니다.",
        "nameEn": "Hiding Bush",
        "descriptionEn": "Summons a 3-tile bush at your feet and hides inside it for up to 10 seconds. Attacking exposes you for 3 seconds.",
        "chargeRequired": 7,
        "radius": 1.5,
        "duration": 10,
        "revealDuration": 3,
        "motionWindup": 0.18
      },
      "walk": {
        "cycleSpeed": 8,
        "armAmp": 0.3,
        "legAmp": 0.38,
        "armRestZ": 0.18849555921538758
      },
      "maxAmmo": 3,
      "description": "그린은 유일하게 항구 출신이 아닌 캐릭터입니다. 그가 살던 곳은 평범한 시골인데, 돈을 벌어서 이사 가려고 이 대회에 참가하게 되었습니다.",
      "descriptionEn": "Green is the only fighter who is not from the harbor. He grew up in an ordinary rural town and entered the tournament hoping to earn enough to move away.",
      "basicAttack": {
        "name": "부메랑",
        "description": "부메랑 4개를 던집니다. 적이 가까울수록 더 큰 피해를 줍니다. 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다.",
        "nameEn": "Boomerang",
        "descriptionEn": "Throws four boomerangs. The closer the enemy, the more damage each one deals. Basic hits grant 50% of the previous ultimate charge."
      },
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.14,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5
    },
    "blue": {
      "color": 255,
      "maxHealth": 5200,
      "attackType": "bullet",
      "reloadDuration": 0.5,
      "attackCooldown": 0.3,
      "bulletDamage": 1080,
      "bulletRange": 20,
      "bulletSpeed": 68.75,
      "ultimate": {
        "name": "돌진",
        "damage": 1600,
        "speed": 24,
        "duration": 1.15,
        "hitRadius": 1.2,
        "chargeRequired": 4,
        "rechargePerHit": 0.33
      },
      "moveSpeedMultiplier": 1,
      "walk": {
        "cycleSpeed": 7,
        "armAmp": 0.2,
        "legAmp": 0.34,
        "armRestZ": 0.09424777960769379
      },
      "maxAmmo": 3,
      "description": "블루는 평범한 일반인입니다. 하지만 그의 손만큼 빠른 사람은 없습니다. 아마도요?",
      "descriptionEn": "Blue is an ordinary guy. But nobody has hands as fast as his. Probably.",
      "basicAttack": {
        "name": "스피드 구슬",
        "description": "사거리 20타일의 구슬을 빠르게 던져 1080 피해를 줍니다. 투사체 판정이 10% 커지며 일반 공격 5회 적중으로 궁극기를 충전합니다.",
        "nameEn": "Speed Marble",
        "descriptionEn": "Throws a fast marble up to 20 tiles, dealing 1080 damage. Projectile hitboxes are 10% larger and five basic hits charge the ultimate."
      },
      "special": {
        "id": "blueDash",
        "name": "돌진",
        "description": "빠르게 굴러 이동하며 벽에 부딪히면 튕겨 나갑니다. 경로의 적에게 피해와 넉백을 주고, 궁극기 준비·구르기 중 받는 피해가 70% 감소합니다. 종료·중단 시 보호막이 해제됩니다. 궁극기 5회 적중으로 다음 궁극기를 충전합니다.",
        "nameEn": "Ricochet Dash",
        "descriptionEn": "Rolls forward, bouncing off walls and damaging and knocking back enemies. Takes 70% less damage during preparation and rolling; the shield ends when the ultimate ends or is interrupted. Five ultimate hits recharge the next ultimate.",
        "damage": 2000,
        "speed": 24,
        "duration": 1.15,
        "hitRadius": 1.2,
        "chargeRequired": 2.5,
        "rechargePerHit": 0.5,
        "motionWindup": 0.12,
        "damageReduction": 0.7,
        "invulnerableDuringDash": false,
        "guardDuringPreparation": true
      },
      "bulletKnockback": 0,
      "attackPerceptionMinRange": 14,
      "attackPerceptionRange": 20,
      "ultimateUseHealthMin": 0.1,
      "ultimateUseHealthMax": 0.25,
      "dashAwayFromTarget": true,
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.06,
      "botAvoidBurstProjectiles": true,
      "botPathDirections": 24,
      "bulletHitboxMultiplier": 1.1,
      "projectileDodgeDuration": 0.18,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5,
      "pursuesWhileLowHealth": true
    },
    "orange": {
      "color": 16753920,
      "maxHealth": 3400,
      "attackType": "bomb",
      "reloadDuration": 1,
      "attackCooldown": 0.35,
      "bombDamage": 750,
      "bombSplashDamage": 1170,
      "bombRange": 9,
      "bombSpeed": 22,
      "bombSplashCount": 5,
      "bombDirectHitJuiceCount": 4,
      "bombSplashSpeed": 10,
      "bombSplashRange": 4.4,
      "bombSplashHitRadius": 0.75,
      "moveSpeedMultiplier": 1,
      "walk": {
        "cycleSpeed": 8,
        "armAmp": 0.25,
        "legAmp": 0.36,
        "armRestZ": 0.15707963267948966
      },
      "maxAmmo": 3,
      "description": "오렌지는 평범한 오렌지 농부입니다. 하지만 컬러스의 첫 번째 우승자가 되려고 합니다. 오직 오렌지 하나만으로요...",
      "descriptionEn": "Orange is a plain orange farmer, yet he intends to become the first champion of Colors. Armed with nothing but oranges...",
      "basicAttack": {
        "name": "오렌지 슛",
        "description": "평범한 오렌지를 투척합니다. 오렌지가 최대 사정거리에 도달하면 과즙 5개를 퍼트립니다. 그러나 조심하세요! 오렌지를 그냥 맞으면 과즙을 다 맞아버립니다! 오렌지 적중은 궁극기를 10%, 과즙은 하나당 5% 충전하며 함께 맞으면 더해집니다.",
        "nameEn": "Orange Shot",
        "descriptionEn": "Throws an ordinary orange. At maximum range it bursts into five splashes of juice. Careful though: taking the orange head-on means eating every splash too! Basic hits grant 50% of the previous ultimate charge."
      },
      "officialAbility": {
        "id": "wideBlast",
        "name": "광역 폭발",
        "description": "폭발 범위 25% 증가",
        "nameEn": "Wide Blast",
        "descriptionEn": "Increases blast radius by 25%."
      },
      "blastRadiusMultiplier": 1.25,
      "ultimate": {
        "id": "returningPeels",
        "name": "오렌지 껍질 회수",
        "description": "오렌지 껍질 5개를 부채꼴로 던집니다. 최대 사거리에서 2초간 멈춘 뒤 같은 피해량으로 되돌아옵니다.",
        "nameEn": "Returning Peels",
        "descriptionEn": "Throws five peels in a fan. They wait for two seconds at maximum range, then return at full damage.",
        "chargeRequired": 8,
        "count": 5,
        "damage": 1750,
        "range": 10,
        "speed": 16,
        "spreadAngle": 1.0471975511965976,
        "pauseDuration": 2,
        "hitRadius": 0.32,
        "rechargePerHit": 0.33,
        "motionWindup": 0.22
      },
      "orangeUltimateEnabled": true,
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.13,
      "botTrackTargetDuringWindup": true,
      "botAimLeadFactor": 1,
      "botAvoidControlProjectiles": true,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5,
      "ultimateChargeShare": {
        "bomb": 0.1,
        "juice": 0.05
      }
    },
    "yellow": {
      "color": 16776960,
      "maxHealth": 6800,
      "attackType": "electric",
      "reloadDuration": 0.9,
      "attackCooldown": 0.3,
      "attackDelay": 0,
      "electricDamage": 2500,
      "electricRange": 14,
      "electricSpeed": 30,
      "shockSlowPercent": 0.4,
      "shockDuration": 3,
      "ultimate": {
        "id": "electricCircuit",
        "name": "전기 회로",
        "description": "장치를 목표 지점으로 던지고 0.35초 설치 대기 후 사용할 수 있습니다. 장치가 2개 이상일 때 일반 공격으로 맞히면 설치 순서대로 전기가 흐르며 구간당 1500 피해를 줍니다.",
        "nameEn": "Electric Circuit",
        "descriptionEn": "Places a device anywhere. With two or more devices, hit one with a basic attack to power a three-second circuit that damages enemies along each connection.",
        "chargeRequired": 2,
        "maxDevices": 4,
        "duration": null,
        "circuitDuration": 3,
        "connectionDamage": 1500,
        "connectionRadius": 0.7,
        "deviceThrowSpeed": 14,
        "deviceInstallDelay": 0.35,
        "motionWindup": 0.24
      },
      "moveSpeedMultiplier": 1,
      "walk": {
        "cycleSpeed": 8,
        "armAmp": 0.25,
        "legAmp": 0.36,
        "armRestZ": 0.15707963267948966
      },
      "maxAmmo": 3,
      "description": "옐로우는 평범한 전기 기술자입니다. 그가 월세를 벌고자 이 대회에 참가했습니다.",
      "descriptionEn": "Yellow is an ordinary electrician who joined the tournament to cover his rent.",
      "basicAttack": {
        "name": "찌릿찌릿 전기구슬",
        "description": "전기구슬을 날립니다. 맞은 캐릭터는 이동속도가 대폭 감소됩니다. 그래서 적군이 자꾸 피하는 거군요! 적중 시 3초 동안 이동속도를 40% 감소시킵니다. 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다.",
        "nameEn": "Zappy Orb",
        "descriptionEn": "Fires an electric orb. Anyone hit is slowed sharply, which is why enemies keep dodging it. Hits slow enemies by 40% for 3 seconds. Basic hits grant 50% of the previous ultimate charge."
      },
      "botTargetCircuitDevices": true,
      "botAvoidLandingZones": true,
      "botLandingDodgeSpeedMultiplier": 2,
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0,
      "botGroundAttackSpacing": 1,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5,
      "electricRadius": 0.5
    },
    "cyan": {
      "color": 1044734,
      "maxHealth": 8200,
      "attackType": "spreadLine",
      "reloadDuration": 0.8,
      "attackCooldown": 0.35,
      "spreadLineDamage": 1000,
      "spreadLineRange": 8.33,
      "spreadLineSpeed": 18,
      "spreadLineCount": 6,
      "spreadLineSpacing": 0.75,
      "ultimate": {
        "id": "galeStrike",
        "name": "질풍 강타",
        "description": "전방으로 강풍을 발사해 5200 피해를 주고 적을 강하게 밀쳐냅니다. 필요한 궁극기 충전은 1.5칸이며 일반 공격 3회 적중으로 충전합니다.",
        "nameEn": "Gale Strike",
        "descriptionEn": "Launches a gust forward, dealing 5200 damage and strong knockback. Requires 1.5 ultimate charge units (three basic hits).",
        "damage": 5200,
        "range": 10,
        "projectileRadius": 4,
        "speedMultiplier": 1.6666666666666667,
        "knockback": 8,
        "chargeRequired": 1.5,
        "motionWindup": 0.2
      },
      "moveSpeedMultiplier": 1,
      "walk": {
        "cycleSpeed": 8,
        "armAmp": 0.25,
        "legAmp": 0.36,
        "armRestZ": 0.15707963267948966
      },
      "maxAmmo": 3,
      "betaAngleSpacing": 0.095,
      "description": "시안은 평범하게 사는 컬러이지만, 아무래도 수상합니다. 그가 다녔던 회사의 제품은 다 이상한 걸까요?",
      "descriptionEn": "Cyan lives an ordinary life, but something about him is off. Was every product at his old company this strange?",
      "basicAttack": {
        "name": "압축 알약",
        "description": "알약 6발을 0.75타일 간격으로 평행 발사합니다. 알약당 1000 피해, 사거리 8.33타일입니다. 일반 공격 적중당 궁극기를 0.5칸 충전합니다.",
        "nameEn": "Compressed Pill",
        "descriptionEn": "Fires 6 parallel pills spaced 0.75 tiles apart. Each deals 1000 damage with a 8.33-tile range and grants 0.5 ultimate charge per hit."
      },
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.08,
      "botKnockbackUltimateTankRange": 5,
      "fullUltimateKnockback": true,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5
    },
    "purple": {
      "color": 8388736,
      "maxHealth": 6000,
      "attackType": "poison",
      "reloadDuration": 1.1,
      "attackCooldown": 0.45,
      "needleRange": 13,
      "needleSpeed": 36,
      "needleDamage": 1100,
      "poisonDPS": 1250,
      "poisonDuration": 5,
      "needleCount": 3,
      "needleRadial": false,
      "needleSpreadAngle": 0.4188790204786391,
      "vialRange": 11,
      "vialSpeed": 18,
      "vialDamage": 2920,
      "vialSplashRadius": 4,
      "moveSpeedMultiplier": 1,
      "walk": {
        "cycleSpeed": 7,
        "armAmp": 0.22,
        "legAmp": 0.34,
        "armRestZ": 0.12566370614359174
      },
      "maxAmmo": 3,
      "description": "퍼플은 향수 가게의 사장님이자 의사 자격증이 있는 컬러입니다. 그녀의 향수 가게가 잘 되는 탓인지는 모르지만 그녀의 독침은 꽤나 아픕니다.",
      "descriptionEn": "Purple runs a perfume shop and holds a medical license. Perhaps that is why business is good, but her needles sting badly.",
      "basicAttack": {
        "name": "독침과 독병",
        "description": "첫 번째 일반 공격은 독침 3발을 전방 24도 부채꼴로 발사하여 적에게 피해를 입힙니다. 명중한 적은 일정 시간 동안 독에 걸립니다. 두 번째 일반 공격은 벽을 넘어가는 독병을 던집니다. 독병은 착지 후 깨지며 주변 적에게 광역 피해를 부여합니다. 일반 공격 적중당 궁을 1칸 충전하며 2회 적중으로 준비됩니다. 독 피해는 초당 1250이며 5초 동안 유지됩니다.",
        "nameEn": "Needle & Vial",
        "descriptionEn": "The first attack fires three needles in a 24-degree forward fan, poisoning anyone they hit. The second lobs a vial over walls that shatters on landing for area damage. Each basic hit grants one ultimate unit; two hits charge it. Poison deals 1250 damage per second and lasts five seconds."
      },
      "officialAbility": {
        "id": "wideNeedle",
        "name": "광각 독침",
        "description": "독침 3발을 -12도, 0도, +12도로 발사",
        "nameEn": "Wide Needle",
        "descriptionEn": "Fires three needles at -12, 0, and +12 degrees."
      },
      "ultimate": {
        "id": "toxicLeap",
        "name": "독성 대도약",
        "description": "도약 이륙·착지 때 반경 3.5타일에 즉시 1000 피해를 주고, 중앙에서 가시 16발을 사방으로 발사합니다. 가시는 사거리 10타일, 한 발당 550 피해이며 여러 발이 각각 적중할 수 있습니다. 중앙 피해로 궁 0.25칸, 가시 첫 명중으로 별도 0.25칸을 충전하며 같은 적의 나머지 가시는 해당 단계에서 추가 충전하지 않습니다.",
        "nameEn": "Toxic Leap",
        "descriptionEn": "On takeoff and landing, instantly deals 1000 damage within 3.5 tiles and fires 16 thorns from the center. Each thorn deals 550 damage with 10-tile range; multiple thorns can hit. Central damage and the first thorn hit each grant 0.25 ultimate units per enemy per phase. Further thorns in that phase grant no extra charge.",
        "chargeRequired": 2,
        "damage": 1000,
        "range": 12,
        "radius": 3.5,
        "duration": 0.8,
        "jumpHeight": 5,
        "motionWindup": 0.16,
        "projectileCount": 16,
        "projectileSpeed": 14,
        "projectileRadius": 0.14,
        "projectileRange": 10,
        "projectileDamage": 550,
        "rechargePerHit": 0.25
      },
      "purpleUltimateEnabled": true,
      "basicUltimateChargeMultiplier": 1,
      "attackWindup": 0.14,
      "botAimWindupLeadFactor": 0.5,
      "botSmartUltimate": true,
      "groundAttackRange": 11,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5
    },
    "pink": {
      "color": 16043475,
      "maxHealth": 9900,
      "attackType": "heal_circle",
      "reloadDuration": 0.8,
      "attackCooldown": 0.3,
      "healCircleRange": 4.5,
      "healCircleDamage": 2200,
      "healCircleHeal": 1400,
      "ultimate": {
        "id": "encore",
        "name": "앙코르!",
        "description": "반경 8타일 안의 모든 아군에게 12초 동안 부활 효과를 부여합니다. 효과를 받은 아군이 사망하면 그 자리에서 체력 40%와 2초 무적으로 부활하며, 이미 쓰러진 아군은 즉시 부활합니다.",
        "nameEn": "Encore!",
        "descriptionEn": "Grants every ally within 8 tiles a 12-second revival effect. If an affected ally falls, they revive in place at 40% health with 2 seconds of invulnerability; already-fallen allies revive immediately.",
        "chargeRequired": 12,
        "radius": 8,
        "reviveHealthRatio": 0.4,
        "invulnerabilityDuration": 2,
        "motionWindup": 0.26
      },
      "moveSpeedMultiplier": 1.3,
      "walk": {
        "cycleSpeed": 9,
        "armAmp": 0.34,
        "legAmp": 0.4,
        "armRestZ": 0.3141592653589793
      },
      "maxAmmo": 3,
      "abilityRangeMultiplier": 1.2,
      "description": "핑크는 음악을 좋아하는 스트리머입니다. 그녀는 음악이 너무 좋아서 돈벌이를 까먹는 바람에 돈을 벌려고 대회에 나갔다가 우승해버립니다.",
      "descriptionEn": "Pink is a streamer who loves music so much she forgets to earn a living. She entered the tournament for the prize money and ended up winning it.",
      "basicAttack": {
        "name": "퍼지는 음표",
        "description": "원형으로 퍼지는 음표를 발사합니다. 음표는 적에게 피해를 주고, 아군에게는 체력을 회복시킵니다. 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다.",
        "nameEn": "Spreading Notes",
        "descriptionEn": "Releases notes that spread in a circle, damaging enemies and healing allies. Basic hits grant 50% of the previous ultimate charge."
      },
      "pursuesWhileLowHealth": true,
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.12,
      "botTankTarget": true,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5
    },
    "crimson": {
      "color": 10485760,
      "maxHealth": 13000,
      "attackType": "punchCombo",
      "reloadDuration": 0.9,
      "attackCooldown": 0.6,
      "moveSpeedMultiplier": 1.4,
      "attackRange": 3,
      "attackDamage": 1333.3333333333333,
      "attackCount": 3,
      "attackIntervalMs": 120,
      "attackHalfAngle": 0.7330382858376184,
      "attackAngles": [
        -0.4363323129985824,
        0,
        0.4363323129985824
      ],
      "ultimate": {
        "name": "KO 스트레이트",
        "description": "엄청난 펀치를 날립니다. 너무 강한 펀치를 날린 나머지 벽도 부서지고 적도 밀려납니다.",
        "nameEn": "KO Straight",
        "descriptionEn": "Throws a monstrous punch. It lands so hard that walls break and enemies are shoved away.",
        "motionWindup": 0.22,
        "damage": 6750
      },
      "walk": {
        "cycleSpeed": 9,
        "armAmp": 0.36,
        "legAmp": 0.42,
        "armRestZ": 0.3141592653589793
      },
      "maxAmmo": 3,
      "attackDamages": [
        1333,
        1333,
        1334
      ],
      "description": "크림슨은 레드를 보고 권투를 시작해서 세계적인 권투 선수가 되었습니다. 근데 정작 자기는 레드를 못 이긴다고 하네요.",
      "descriptionEn": "Crimson took up boxing after watching Red and became world class, yet he still says he cannot beat Red.",
      "basicAttack": {
        "name": "3연속 펀치",
        "description": "3연속 펀치로 적에게 피해를 입힙니다. 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다.",
        "nameEn": "Triple Punch",
        "descriptionEn": "Hammers enemies with three consecutive punches. Basic hits grant 50% of the previous ultimate charge."
      },
      "ultimateDamage": 6750,
      "ultimateLength": 6,
      "ultimateWidth": 6,
      "ultimateKnockback": 1,
      "ultimateChargeRequired": 3,
      "pursuesWhileLowHealth": true,
      "projectileDodgeDuration": 0.18,
      "projectileDodgeSpeedMultiplier": 1.5,
      "projectileDodgeForwardFactor": 0.6,
      "projectileDodgeDetectionRange": 20,
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.07,
      "botKnockbackUltimateTankRange": 3,
      "projectileDodgeCooldown": 0.9
    },
    "gold": {
      "color": 16766720,
      "maxHealth": 7000,
      "attackType": "goldOre",
      "reloadDuration": 1.2,
      "attackCooldown": 1.5,
      "moveSpeedMultiplier": 1,
      "stage1Damage": 3400,
      "stage1Range": 8,
      "stage1Speed": 26,
      "stage1Size": 2.6,
      "stage1SplashRadius": 2,
      "stage2Damage": 1700,
      "stage2Range": 8,
      "stage2Speed": 18,
      "stage3Damage": 850,
      "stage3Range": 6,
      "stage3Speed": 20,
      "projectileRadius": 0.2,
      "maxChargePerAttack": 6,
      "ultimate": {
        "id": "malfunctionZone",
        "name": "고장 지대",
        "description": "자신의 위치에 반경 4.5타일 장판을 소환합니다. 장판은 4초 동안 자신을 따라다닙니다. 안에 있는 적에게 고장을 적용해 이동속도를 50% 감소시키고 일반공격과 궁극기 사용을 막습니다. 고장 중 공격·궁극기 UI가 회색으로 표시됩니다. 아군과 골드 본인은 영향을 받지 않습니다. 설치 대기는 0.2초이며, 장판 안 적에게 1초마다 138 피해를 줍니다.",
        "nameEn": "Malfunction Zone",
        "descriptionEn": "Summons a 4.5-tile radius field on Gold that follows for 4 seconds. Enemies inside cannot attack and move 50% slower. Activates after 0.2 seconds and deals 138 damage to enemies inside every 1 seconds.",
        "castRange": 0,
        "radius": 4.5,
        "duration": 4,
        "delay": 0.2,
        "followsCaster": true,
        "tickDamage": 138,
        "tickInterval": 1,
        "motionWindup": 0.24
      },
      "walk": {
        "cycleSpeed": 8,
        "armAmp": 0.25,
        "legAmp": 0.36,
        "armRestZ": 0.15707963267948966
      },
      "maxAmmo": 3,
      "description": "금을 좋아하는 컬러입니다. 부자이고, 돈을 좋아합니다. 근데 자꾸 오렌지한테 눈치를 주는데요?",
      "descriptionEn": "A color who loves gold. He is rich, he loves money, and he keeps side-eyeing Orange for some reason.",
      "basicAttack": {
        "name": "연쇄 금광석",
        "description": "2.6×2.6타일 정십이면체 금광석을 직선으로 8타일 발사합니다. 충돌한 금광석은 폭발하며 좌우 90도로 분열하고, 분열탄은 각각 6개의 금괴 투사체로 갈라집니다. 단계별 피해는 3400 / 1700 / 850입니다. 분열탄과 금괴는 같은 공격에 이미 맞은 적을 통과합니다. 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다. 받는 투사체 피해를 900 감소시킵니다.",
        "nameEn": "Chain Gold Ore",
        "descriptionEn": "Launches a 2.6x2.6 dodecahedral gold ore 8 tiles forward. On impact it explodes and splits 90 degrees to each side, and each fragment breaks into six gold bar projectiles. Stage damage: 3400 / 1700 / 850. Fragments and bars pass through enemies the same attack already hit. Basic hits grant 50% of the previous ultimate charge. Reduces incoming projectile damage by 900."
      },
      "ultimateChargeRequired": 6,
      "projectileDamageReduction": 900,
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.14,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5,
      "goldSplitsSkipHitTargets": true
    },
    "ivory": {
      "color": 16777200,
      "maxHealth": 6600,
      "attackType": "punch",
      "reloadDuration": 1.05,
      "attackCooldown": 0.7,
      "iceCreamDamage": 1600,
      "iceCreamRange": 9,
      "iceCreamSpeed": 28,
      "iceCreamZoneRadius": 4,
      "iceCreamZoneDuration": 4,
      "iceCreamZoneTickInterval": 1,
      "ultimate": {
        "id": "groupOrder",
        "name": "단체 주문",
        "description": "0~20타일 안의 조준한 위치를 중심으로 중앙과 대각선 네 방향에 아이스크림 5개를 던집니다. 착탄 피해는 1600, 장판 피해는 1초마다 1300입니다. 장판 피해는 중첩되지 않습니다. 궁극기로 발생한 공격 피해가 25% 증가합니다. 겹친 착탄 피해는 대상당 한 번만 받습니다.",
        "nameEn": "Group Order",
        "descriptionEn": "Aims the center within 20 tiles, including at your feet, and throws five ice creams in a diagonal pattern. Each deals 1600 impact damage and leaves a non-stacking zone dealing 1300 damage every 1 seconds. Damage from this ultimate is increased by 25%. Overlapping impacts damage each target only once.",
        "castRange": 20,
        "patternRadius": 3.5,
        "chargeRequired": 3,
        "rechargePerHit": 0.1,
        "motionWindup": 0.28,
        "damageMultiplier": 1.25
      },
      "moveSpeedMultiplier": 1,
      "walk": {
        "cycleSpeed": 7,
        "armAmp": 0.24,
        "legAmp": 0.34,
        "armRestZ": 0.15707963267948966
      },
      "maxAmmo": 3,
      "description": "아이스크림 가게의 직원입니다. 근데 아이스크림을 너무 좋아해서 아이스크림이 자꾸 사라집니다.",
      "descriptionEn": "A cheerful ice cream shop employee who controls the battlefield with ice cream that refuses to melt.",
      "basicAttack": {
        "name": "안 녹는 아이스크림",
        "description": "0~9타일 안의 조준한 위치에 아이스크림을 던집니다. 착탄 시 1600 피해를 주고, 반경 4타일에 4초 동안 1초마다 1300 피해를 주는 장판을 만듭니다. 장판 피해는 중첩되지 않습니다. 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다.",
        "nameEn": "Unmelting Ice Cream",
        "descriptionEn": "Throws ice cream at an aimed position within 9 tiles, including at your feet. It deals 1600 impact damage and leaves a 4-tile-radius zone for 4 seconds that deals 1300 damage every 1 seconds. Zone damage does not stack. Basic hits grant 50% of the previous ultimate charge."
      },
      "iceCreamZoneDamage": 1300,
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.2,
      "groundAttackRange": 9,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5
    },
    "chartreuse": {
      "color": 12711946,
      "maxHealth": 8200,
      "attackType": "chartreuse",
      "reloadDuration": 1.1,
      "attackCooldown": 0.55,
      "moveSpeedMultiplier": 1,
      "chartreuseRange": 11,
      "chartreuseSpeed": 26,
      "chartreuseDamage": 1380,
      "chartreuseEnhancedDamage": 2760,
      "ultimate": {
        "id": "clearMind",
        "name": "49% 정신 차림",
        "description": "6초 동안 무탄이 사라지고 세 탄환이 동일 확률로 등장합니다. 궁극기로 발생한 공격 피해가 50% 증가합니다.",
        "nameEn": "49% Clear Mind",
        "descriptionEn": "For 6 seconds, blank rounds are removed and the other three appear equally. Damage from this ultimate is increased by 50%.",
        "chargeRequired": 4,
        "duration": 6,
        "motionWindup": 0.18,
        "damageMultiplier": 1.5
      },
      "walk": {
        "cycleSpeed": 8,
        "armAmp": 0.25,
        "legAmp": 0.36,
        "armRestZ": 0.15707963267948966
      },
      "maxAmmo": 3,
      "description": "어딘가 나사빠지고 멍청해 보이는 캐릭터, 하지만 그가 만든 '샤단라'는 항상 이래서 평범합니다.",
      "descriptionEn": "A controller-leaning random damage dealer.",
      "basicAttack": {
        "name": "무슨 공격이지?",
        "description": "강화탄, CC탄, 흑사병탄, 무탄 중 하나를 무작위로 발사합니다. 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다.",
        "nameEn": "What Attack?",
        "descriptionEn": "Fires one random round: enhanced, CC, plague, or blank. Basic hits grant 50% of the previous ultimate charge."
      },
      "projectileSize": 0.3,
      "projectileDodgeDuration": 0.12,
      "projectileDodgeSpeedMultiplier": 3,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeKinds": [
        "bullet",
        "electric",
        "enhanced",
        "cc",
        "plague"
      ],
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.08,
      "poisonDPS": 820,
      "botAvoidControlProjectiles": true,
      "botTrackTargetDuringWindup": true,
      "botAimLeadFactor": 0.3
    },
    "mint": {
      "color": 10026972,
      "maxHealth": 8600,
      "attackType": "mintIce",
      "reloadDuration": 1.15,
      "attackCooldown": 0.55,
      "moveSpeedMultiplier": 1.15,
      "maxAmmo": 3,
      "iceBulletDamage": 1200,
      "iceBulletRange": 10,
      "iceBulletSpeed": 20,
      "burstCount": 3,
      "burstIntervalMs": 80,
      "icePerHit": 25,
      "freezeThreshold": 75,
      "freezeDuration": 2,
      "ultimate": {
        "name": "아이스크림 장판",
        "castRange": 10,
        "radius": 9,
        "duration": 10,
        "icePerSecond": 5,
        "damagePerSecond": 300,
        "chargeRequired": 7,
        "slideStrength": 3.2,
        "slideAcceleration": 0.6
      },
      "walk": {
        "cycleSpeed": 8,
        "armAmp": 0.25,
        "legAmp": 0.36,
        "armRestZ": 0.15707963267948966
      },
      "description": "차가운 아이스크림으로 적의 움직임을 얼려 버리는 베타 시즌 5 신규 컨트롤러입니다.",
      "descriptionEn": "A Beta Season 5 controller who freezes enemy movement with ice-cold ice cream.",
      "basicAttack": {
        "name": "아이스크림 탄",
        "description": "아이스크림 탄환을 3발 연속 발사합니다. 3발은 좌우 9도로 부채꼴처럼 퍼져 나갑니다. 적중할 때마다 얼음 수치가 25 누적되며, 75가 되면 적이 2초 동안 빙결됩니다. 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다.",
        "nameEn": "Ice Cream Bullets",
        "descriptionEn": "Fires three ice cream bullets in succession, fanning out 9° to each side. Each hit adds 25 ice; at 75, the target freezes for 2 seconds. Basic hits grant 50% of the previous ultimate charge."
      },
      "special": {
        "id": "iceCreamField",
        "name": "아이스크림 장판",
        "description": "지정한 위치에 10초 동안 반경 9타일의 얼음 장판을 생성합니다. 장판 위의 적은 중심에서 바깥으로 밀려나며, 미는 속도는 초당 3.2타일에서 시작해 매초 0.6씩 빨라집니다. 매초 563 피해와 얼음 수치 25를 받아, 장판 위에 3초 있으면 빙결됩니다. 빙결 중에는 얼음이 쌓이지 않고 풀린 뒤 다시 쌓입니다. 얼어 있는 적은 밀리지 않으며 벽을 넘지 않습니다.",
        "nameEn": "Ice Cream Field",
        "descriptionEn": "Creates a 9-tile ice field for 10 seconds. Enemies on it are pushed outward from the centre, starting at 3.2 tiles per second and speeding up by 0.6 each second. They take 563 damage plus 25 ice each second, so 3 seconds on it freezes them. No ice builds while frozen; it builds again after thawing. Frozen enemies are not pushed, and walls stop the push.",
        "castRange": 10,
        "radius": 9,
        "duration": 10,
        "icePerSecond": 25,
        "damagePerSecond": 563,
        "chargeRequired": 4,
        "slideStrength": 3.2,
        "slideAcceleration": 0.6,
        "rechargePerHit": 0.33,
        "motionWindup": 0.24
      },
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0,
      "botAvoidVolleyProjectiles": true,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5,
      "burstSpreadAngle": 0.15707963267948966,
      "iceBlockedWhileFrozen": true
    },
    "azure": {
      "maxHealth": 10500,
      "moveSpeedMultiplier": 1.12,
      "attackCooldown": 0.2,
      "reloadDuration": 0.65,
      "maxAmmo": 3,
      "surfDashDistance": 2,
      "surfDamage": 3000,
      "surfLength": 4,
      "surfWidth": 3,
      "description": "파도를 타고 전장을 가로지르는 베타 시즌 6 신규 돌격 캐릭터입니다.",
      "descriptionEn": "A Beta Season 6 diver who rides waves straight through the fight.",
      "basicAttack": {
        "name": "서프 대시",
        "description": "파도를 타고 전방 2타일 이동하며, 앞쪽 4×3타일 범위의 적에게 3000 피해를 줍니다. 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다.",
        "nameEn": "Surf Dash",
        "descriptionEn": "Rides a wave two tiles forward and deals 3000 damage in a 4-by-3-tile area ahead. Basic hits grant 50% of the previous ultimate charge."
      },
      "ultimate": {
        "id": "bigWave",
        "name": "빅 웨이브",
        "description": "큰 파도를 전방 10타일·폭 5타일로 보내 6000 피해와 강한 넉백을 줍니다. 애저 본인은 이동하지 않습니다.",
        "nameEn": "Big Wave",
        "descriptionEn": "Launches a huge 10-tile, 5-wide wave dealing 6000 damage and knockback while Azure remains in place.",
        "damage": 6000,
        "range": 10,
        "width": 5,
        "knockback": 9,
        "chargeRequired": 2,
        "motionWindup": 0.24
      },
      "surfSpeed": 17,
      "approachSurfRange": 18,
      "approachSurfDistance": 4,
      "approachSurfCooldown": 0.5,
      "botApproachMin": 3.2,
      "botFireRangeFactor": 0.75,
      "botIdealDistance": 2.2,
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.1,
      "botKnockbackUltimateTankRange": 3,
      "fullUltimateKnockback": true,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5,
      "pursuesWhileLowHealth": true,
      "color": 32767
    },
    "crystal": {
      "maxHealth": 6600,
      "moveSpeedMultiplier": 1.05,
      "attackCooldown": 0.65,
      "reloadDuration": 1.1,
      "maxAmmo": 3,
      "crystalDamage": 2000,
      "crystalRange": 12,
      "crystalSpeed": 20,
      "fragmentDamage": 1000,
      "fragmentCount": 6,
      "fragmentRange": 4.5,
      "fragmentSpeed": 16,
      "shardDamage": 500,
      "shardCount": 12,
      "shardRange": 3.5,
      "shardSpeed": 18,
      "description": "수정탄을 연쇄 분열시키고 적을 분석해 제거하는 캐릭터입니다.",
      "descriptionEn": "Splits crystal shots into cascading shards and analyzes one enemy for elimination.",
      "basicAttack": {
        "name": "연쇄 수정탄",
        "description": "2000 피해의 수정탄이 6개 조각, 다시 12개 작은 조각으로 분열합니다. 같은 단계는 한 대상에게 한 번만 적중합니다. 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다. 3단계 작은 조각 피해는 500이며, 3단계 적중도 궁극기를 0.5칸 충전합니다.",
        "nameEn": "Crystal Cascade",
        "descriptionEn": "A 2,000-damage crystal splits into six fragments, then twelve shards. Each stage can hit the same target only once. Basic hits grant 50% of the previous ultimate charge. Third-stage shards deal 500 damage and grant 0.5 ultimate charge."
      },
      "ultimate": {
        "id": "crystalAnalysis",
        "name": "수정 분석",
        "chargeRequired": 1.5,
        "range": 18,
        "dashSpeed": 28,
        "analysisDuration": 8,
        "description": "긴 거리를 이동해 적 한 명을 붙잡고 양쪽의 행동을 제한합니다. 궁 사용 표시와 돌진 경로를 보여주고 1.5초 준비한 뒤 표시된 위치로 돌진하며, 분석 시작 8초 뒤 보호막을 무시하는 고정 28000 피해를 줍니다. 체력이 남으면 생존하며 분석이 해제됩니다. 피해 감소 보호막을 무시하며, 필요한 궁극기 충전은 1.5칸입니다.",
        "nameEn": "Crystal Analysis",
        "descriptionEn": "Shows an ultimate warning and waits 1.5 seconds before dashing along the marked path to bind an enemy, restricting both actors. Eight seconds after binding, deals a fixed 28000 damage ignoring damage-reduction guards. Surviving targets are released. Execution ignores damage-reduction guards and requires 1.5 charge units.",
        "motionWindup": 1.5,
        "executeBypassesGuard": true,
        "executionFixedAmount": 28000,
        "bindStopsMovement": true,
        "telegraphWidth": 2.4,
        "telegraphReaction": 0.1,
        "telegraphEscapeDuration": 2
      },
      "botAimLeadFactor": 0.65,
      "basicUltimateChargeMultiplier": 0.5,
      "attackWindup": 0.12,
      "shardUltimateCharge": 1,
      "botTrackTargetDuringWindup": true,
      "botAimIntercept": true,
      "projectileDodgeDuration": 0.28,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5,
      "color": 7268351
    },
    "salmon": {
      "maxHealth": 7200,
      "moveSpeedMultiplier": 1,
      "attackCooldown": 1.5,
      "reloadDuration": null,
      "maxAmmo": 5,
      "attackRange": 8.5,
      "throwSpeed": 26,
      "throwWindup": 0.22,
      "impactRadius": 2.3,
      "directDamage": 2700,
      "splashDamage": 600,
      "landingDamage": 600,
      "noAutomaticReload": true,
      "basicUltimateChargeMultiplier": 1,
      "description": "낚시찌로 적을 포획하고, 빗나간 찌를 직접 회수하는 낚시꾼.",
      "basicAttack": {
        "name": "낚시 찌 투척",
        "nameEn": "Bobber Toss",
        "description": "8.5타일 곡사 투척. 가장 가까운 적 1명에게 3300 피해와 2.4초 포획, 주변에 600 피해. 포획 대상은 착지할 때 추가 600 피해를 받습니다. 투척 명중으로 포획 시 탄약 1발과 궁 4포인트 회복. 빗나간 찌도 적이 닿으면 1명을 2.4초간 띄운 뒤 사라지며, 착지 피해 600을 줍니다. 이 접촉에는 투척 명중 피해와 탄약·궁 회복이 없습니다. 4타일 이내 빗나간 찌는 공격 버튼으로 회수합니다."
      },
      "ultimate": {
        "id": "bigCatch",
        "name": "월척이다!",
        "nameEn": "Big Catch!",
        "description": "원형 테두리에 체력 900인 포획 장치 8개를 설치합니다. 접촉 시 3000 피해와 2.4초 포획 후 해당 장치는 즉시 파괴됩니다. 포획 대상은 착지할 때 추가 600 피해를 받습니다. 투척물이 땅에 닿으면 설치 대기 없이 생성됩니다. 적은 장치를 파괴해 탈출할 수 있습니다.",
        "chargeRequired": 20,
        "castRange": 8.5,
        "throwSpeed": 14,
        "installDelay": 0,
        "radius": 3.5,
        "count": 8,
        "deviceHealth": 900,
        "damage": 3000,
        "landingDamage": 600,
        "deviceRadius": 1
      },
      "botAimLeadFactor": 0.6,
      "attackPerceptionMinRange": 7.8,
      "attackPerceptionRange": 8.5,
      "projectileDodgeDuration": 0.12,
      "projectileDodgeSpeedMultiplier": 1,
      "projectileDodgeDetectionRange": 20,
      "projectileDodgeThreatOnly": true,
      "projectileDodgeCooldown": 0.9,
      "projectileDodgeChance": 0.5,
      "salmonAirborneDuration": 2.4,
      "pursuesWhileLowHealth": true,
      "color": 16677236
    },
    "raspberry": {
      "name": "라즈베리",
      "nameEn": "Raspberry",
      "rarity": "hero",
      "color": 14037868,
      "maxHealth": 4800,
      "moveSpeedMultiplier": 1,
      "attackCooldown": 0.8,
      "reloadDuration": 1.2,
      "maxAmmo": 3,
      "attackRange": 18,
      "vineRange": 18,
      "vineSpeed": 36,
      "vineDamage": 2250,
      "vineRadius": 0.35,
      "vineBindDuration": 0.6,
      "vineTraitBindBonus": 1.4,
      "basicUltimateChargeMultiplier": 1,
      "pursuesWhileLowHealth": true,
      "botAvoidControlProjectiles": [
        "shock"
      ],
      "basicAttack": {
        "name": "덩굴 저격",
        "nameEn": "Vine Snipe",
        "description": "사거리 18타일의 직선 덩굴탄을 쏴 2,250 피해를 주고 2초 동안 이동을 묶습니다(기본 0.6초 + 특성 1.4초). 묶인 적은 공격과 제자리 궁극기는 쓸 수 있지만 이동·돌진·점프는 할 수 없습니다. 벽이나 첫 적에게 맞으면 사라집니다.",
        "descriptionEn": "Fires a straight 18-tile vine shot dealing 2,250 damage and binding movement for 2 seconds (0.6 base + 1.4 trait). Bound enemies can still attack and use in-place ultimates but cannot move, dash or jump. Stops at walls and the first enemy."
      },
      "ultimate": {
        "id": "vinePrison",
        "name": "덩굴 감옥",
        "nameEn": "Vine Prison",
        "castRange": 10,
        "radius": 3.5,
        "telegraph": 0.4,
        "damage": 600,
        "bindDuration": 2,
        "duration": 4,
        "slowPercent": 0.3,
        "chargeRequired": 6,
        "rechargePerHit": 0,
        "motionWindup": 0,
        "description": "10타일 안의 지점에 반지름 3.5타일 덩굴 감옥을 예고하고 0.4초 뒤 발동합니다. 발동 순간 안에 있는 적은 600 피해와 2초 속박을 받고, 4초 동안 영역 안에서는 30% 느려집니다. 공중의 적과 벽 뒤의 적은 영향을 받지 않습니다.",
        "descriptionEn": "Marks a 3.5-tile vine prison within 10 tiles and triggers it after 0.4 seconds. Enemies inside take 600 damage and a 2-second bind, then are slowed by 30% while inside for 4 seconds. Airborne enemies and enemies behind walls are unaffected."
      }
    },
    "black": {
      "maxHealth": 7800,
      "moveSpeedMultiplier": 1.2,
      "maxAmmo": 3,
      "reloadDuration": 1,
      "attackCooldown": 0.45,
      "attackRange": 3,
      "attackHalfAngle": 0.4363323129985824,
      "attackDamage": 2000,
      "description": "그림자를 다루는 근접 암살자. 공격하거나 피해를 받으면 3초 동안 드러납니다.",
      "basicAttack": {
        "name": "그림자 주먹",
        "description": "전방 3타일, 50도 범위에 2,000 피해를 줍니다."
      },
      "ultimate": {
        "name": "그림자 잠입",
        "chargeRequired": 5,
        "range": 9,
        "damage": 1200,
        "count": 3,
        "interval": 0.2,
        "description": "9타일 안의 가까운 적 뒤로 순간이동하고 1,200 피해를 3회 줍니다. 벽을 통과하지 않습니다."
      },
      "color": 0
    },
    "white": {
      "maxHealth": 6200,
      "moveSpeedMultiplier": 1,
      "maxAmmo": 3,
      "reloadDuration": 1.4,
      "attackCooldown": 0.6,
      "attackRange": 9,
      "bottleSpeed": 18,
      "bottleDamage": 1400,
      "bottleRadius": 1.5,
      "bugHealth": 600,
      "bugSpeed": 8.8,
      "bugDamage": 300,
      "bugInterval": 0.8,
      "bugRange": 7,
      "bugDuration": 6,
      "bugLimit": 6,
      "description": "실험병과 흰 벌레로 견제하는 원거리 소환사.",
      "basicAttack": {
        "name": "화잇병 투척",
        "description": "9타일 안에 병을 던져 반경 1.5타일에 1,400 피해를 주고 흰 벌레를 소환합니다."
      },
      "ultimate": {
        "name": "대형 실험병",
        "chargeRequired": 6,
        "range": 9,
        "damage": 2800,
        "radius": 3,
        "bugHealth": 3000,
        "bugDamage": 700,
        "bugSpeed": 7.2,
        "bugDuration": 10,
        "bugInterval": 1,
        "description": "큰 병을 던져 반경 3타일에 2,800 피해를 주고 10초간 큰 벌레를 소환합니다."
      },
      "color": 16777215
    }
  }
};
export function wikiCharacters(edition="main"){return structuredClone(editions[edition]??editions.main);}
export function wikiAttackStats(id,d) {
 if(id==='lavender')return {damage:d.sprayDamage,range:d.attackRange};
 if(id==='salmon')return {damage:d.directDamage,range:d.attackRange};
 if(id==='raspberry')return {damage:d.vineDamage,range:d.vineRange};
 if(id==='black')return {damage:d.attackDamage,range:d.attackRange};
 if(id==='white')return {damage:d.bottleDamage,range:d.attackRange};
 if(d.attackDamage!=null)return {damage:d.attackDamage*(d.attackCount??1),range:d.attackRange};
 if(d.boomerangDamage!=null)return {damage:d.boomerangDamage*d.boomerangAngles.length,range:d.boomerangRange};
 if(d.bulletDamage!=null)return {damage:d.bulletDamage,range:d.bulletRange};
 if(d.bombDamage!=null)return {damage:d.bombDamage+d.bombSplashDamage*d.bombDirectHitJuiceCount,range:d.bombRange};
 if(d.electricDamage!=null)return {damage:d.electricDamage,range:d.electricRange};
 if(d.spreadLineDamage!=null)return {damage:d.spreadLineDamage*d.spreadLineCount,range:d.spreadLineRange};
 if(d.stage1Damage!=null)return {damage:d.stage1Damage,range:d.stage1Range};
 if(d.iceCreamDamage!=null)return {damage:d.iceCreamDamage,range:d.iceCreamRange};
 if(d.chartreuseDamage!=null)return {damage:d.chartreuseDamage,range:d.chartreuseRange};
 if(d.needleDamage!=null)return {damage:d.needleDamage,range:d.needleRange};
 if(d.iceBulletDamage!=null)return {damage:d.iceBulletDamage*d.burstCount,range:d.iceBulletRange};
 if(d.surfDamage!=null)return {damage:d.surfDamage,range:d.surfLength};
 if(d.crystalDamage!=null)return {damage:d.crystalDamage,range:d.crystalRange};
 return {damage:d.healCircleDamage??0,range:d.healCircleRange??0};
}
export const wikiUltimate=function beta6Ultimate(d, id) {
  if (id === 'orange') return d.orangeUltimateEnabled ? d.ultimate : null;
  if (id === 'purple') return d.purpleUltimateEnabled ? d.ultimate : null;
  if (id === 'crimson') return { ...d.ultimate, damage: d.ultimateDamage, range: d.ultimateLength, width: d.ultimateWidth, knockback: d.ultimateKnockback, chargeRequired: d.ultimateChargeRequired };
  if (id === 'gold') return { ...d.ultimate, chargeRequired: d.ultimateChargeRequired };
  return d.special || d.ultimate || null;
};
