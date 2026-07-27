const degrees = (value) => value * (Math.PI / 180);

// Beta Season balance source of truth. Values here are intentionally
// independent from the Alpha Season configuration in characters.js.
export const BETA_CHARACTERS = {
  red: {
    maxHealth: 9800, moveSpeedMultiplier: 1.4, attackCooldown: 0.55, reloadDuration: 0.5, maxAmmo: 3,
    attackRange: 5, attackHalfAngle: degrees(45), attackDamage: 2200, attackCount: 2, attackIntervalMs: 240,
    description: "레드는 TV에 나오는 복싱 선수입니다. 하지만 때로는 무식해서 펀치를 잘 못 때리죠.",
    basicAttack: {
      name: "잽 잽",
      description: "레드의 주 공격 기술입니다. 왼쪽 팔로 오른쪽을 때리고 오른쪽 팔로 왼쪽을 때리지요.",
    },
  },
  green: {
    maxHealth: 8400, moveSpeedMultiplier: 1.2, attackCooldown: 0.45, reloadDuration: 0.5, maxAmmo: 3,
    boomerangDamage: 950, boomerangRange: 6.5, boomerangSpeed: 20,
    boomerangReturnSpeedMultiplier: 1.1,
    boomerangFarThreshold: 3.5, boomerangFarMultiplier: 0.625,
    boomerangAngles: [-25, -25 / 3, 25 / 3, 25].map(degrees),
    description: "그린은 유일하게 항구 출신이 아닌 캐릭터입니다. 그가 살던 곳은 평범한 시골인데, 돈을 벌어서 이사 가려고 이 대회에 참가하게 되었습니다.",
    basicAttack: {
      name: "부메랑",
      description: "부메랑 4개를 던집니다. 적이 가까울수록 더 큰 피해를 줍니다.",
    },
  },
  blue: {
    maxHealth: 5200, moveSpeedMultiplier: 1, attackCooldown: 0.3, reloadDuration: 0.3, maxAmmo: 3,
    bulletDamage: 1000, bulletRange: 16, bulletSpeed: 35.2,
    description: "블루는 평범한 일반인입니다. 하지만 그의 손만큼 빠른 사람은 없습니다. 아마도요?",
    basicAttack: {
      name: "스피드 구슬",
      description: "엄청난 속도로 구슬을 던집니다. 맞으면 하나도 안 아프지만 여러 대 맞으면 꽤나 아플걸요?",
    },
  },
  orange: {
    maxHealth: 5800, moveSpeedMultiplier: 1, attackCooldown: 0.35, reloadDuration: 0.5, maxAmmo: 3,
    bombDamage: 750, bombRange: 9, bombSpeed: 22, betaSplashRadius: 2.2,
    description: "오렌지는 평범한 오렌지 농부입니다. 하지만 컬러스의 첫 번째 우승자가 되려고 합니다. 오직 오렌지 하나만으로요...",
    basicAttack: {
      name: "오렌지 슛",
      description: "평범한 오렌지를 투척합니다. 오렌지가 최대 사정거리에 도달하면 과즙 5개를 퍼트립니다. 그러나 조심하세요! 오렌지를 그냥 맞으면 과즙을 다 맞아버립니다!",
    },
    officialAbility: { id: "wideBlast", name: "광역 폭발", description: "폭발 범위 25% 증가" },
    blastRadiusMultiplier: 1.25,
  },
  yellow: {
    maxHealth: 5800, moveSpeedMultiplier: 1, attackCooldown: 0.35, reloadDuration: 0.5, maxAmmo: 3,
    electricDamage: 2400, electricRange: 12, electricSpeed: 16, shockSlowPercent: 0.12, shockDuration: 1.5,
    description: "옐로우는 평범한 전기 기술자입니다. 그가 월세를 벌고자 이 대회에 참가했습니다.",
    basicAttack: {
      name: "찌릿찌릿 전기구슬",
      description: "전기구슬을 날립니다. 맞은 캐릭터는 이동속도가 대폭 감소됩니다. 그래서 적군이 자꾸 피하는 거군요!",
    },
  },
  cyan: {
    maxHealth: 6200, moveSpeedMultiplier: 1, attackCooldown: 0.35, reloadDuration: 0.5, maxAmmo: 3,
    spreadLineDamage: 450, spreadLineRange: 8.33, spreadLineSpeed: 18, spreadLineCount: 6, betaAngleSpacing: 0.095,
    description: "시안은 평범하게 사는 컬러이지만, 아무래도 수상합니다. 그가 다녔던 회사의 제품은 다 이상한 걸까요?",
    basicAttack: {
      name: "압축 알약",
      description: "압축된 알약을 발사하여 적에게 피해를 입힙니다. 알약은 직선으로 빠르게 날아가며, 멀리 있는 적도 정확하게 공격할 수 있습니다.",
    },
    ultimate: {
      id: "galeStrike", name: "질풍 강타", description: "전방으로 거대한 강풍을 발사해 피해를 주고 강하게 밀쳐냅니다.",
      damage: 800, range: 10, projectileRadius: 4, speedMultiplier: 5 / 3, knockback: 8, chargeRequired: 12,
    },
  },
  purple: {
    maxHealth: 6000, moveSpeedMultiplier: 1, attackCooldown: 0.45, reloadDuration: 0.5, maxAmmo: 3,
    needleDamage: 700, needleRange: 13, needleSpeed: 18,
    poisonDPS: 760, poisonDuration: 4,
    vialDamage: 3040, vialRange: 13, vialSpeed: 18, vialSplashRadius: 5,
    description: "퍼플은 향수 가게의 사장님이자 의사 자격증이 있는 컬러입니다. 그녀의 향수 가게가 잘 되는 탓인지는 모르지만 그녀의 독침은 꽤나 아픕니다.",
    basicAttack: {
      name: "독침과 독병",
      description: "첫 번째 일반 공격은 독침 2발을 발사하여 적에게 피해를 입힙니다. 명중한 적은 일정 시간 동안 독에 걸립니다. 두 번째 일반 공격은 벽을 넘어가는 독병을 던집니다. 독병은 착지 후 깨지며 주변 적에게 광역 피해를 부여합니다.",
    },
    officialAbility: { id: "twinNeedle", name: "쌍독침", description: "독침 2발을 11도 부채꼴로 발사" },
    needleCount: 2, needleSpreadAngle: degrees(11),
  },
  pink: {
    maxHealth: 11500, moveSpeedMultiplier: 1.4, attackCooldown: 0.2, reloadDuration: 0.4, maxAmmo: 3,
    healCircleDamage: 2400, healCircleHeal: 1600, healCircleRange: 4.5, abilityRangeMultiplier: 1.2,
    description: "핑크는 음악을 좋아하는 스트리머입니다. 그녀는 음악이 너무 좋아서 돈벌이를 까먹는 바람에 돈을 벌려고 대회에 나갔다가 우승해버립니다.",
    basicAttack: {
      name: "퍼지는 음표",
      description: "원형으로 퍼지는 음표를 발사합니다. 음표는 적에게 피해를 주고, 아군에게는 체력을 회복시킵니다.",
    },
    ultimate: {
      id: "encore", name: "앙코르!", description: "반경 8타일 안에서 쓰러진 아군을 체력 40%와 2초 무적으로 부활시킵니다.",
      chargeRequired: 15, radius: 8, reviveHealthRatio: 0.4, invulnerabilityDuration: 2,
    },
  },
  crimson: {
    maxHealth: 9800, moveSpeedMultiplier: 1.5, attackCooldown: 0.74, reloadDuration: 0.5, maxAmmo: 3,
    attackRange: 2.5, attackDamage: 900, attackCount: 3, attackIntervalMs: 120,
    attackHalfAngle: degrees(42), attackAngles: [-25, 0, 25].map(degrees),
    description: "크림슨은 레드를 보고 권투를 시작해서 세계적인 권투 선수가 되었습니다. 근데 정작 자기는 레드를 못 이긴다고 하네요.",
    basicAttack: {
      name: "3연속 펀치",
      description: "3연속 펀치로 적에게 피해를 입힙니다.",
    },
    ultimate: {
      name: "KO 스트레이트",
      description: "엄청난 펀치를 날립니다. 너무 강한 펀치를 날린 나머지 벽도 부서지고 적도 밀려납니다.",
    },
    ultimateDamage: 2500, ultimateLength: 5, ultimateWidth: 5, ultimateKnockback: 1, ultimateChargeRequired: 9,
  },
  gold: {
    maxHealth: 6200, moveSpeedMultiplier: 1, attackCooldown: 0.8, reloadDuration: 0.7, maxAmmo: 3,
    description: "금을 좋아하는 컬러입니다. 부자이고, 돈을 좋아합니다. 근데 자꾸 오렌지한테 눈치를 주는데요?",
    basicAttack: {
      name: "연쇄 금광석",
      description: "금광석을 던져 폭발시키고 좌우 90도로 분열합니다. 분열탄은 다시 각각 6방향으로 갈라집니다.",
    },
    stage1Damage: 4000, stage1Range: 8, stage1Speed: 16, stage1SplashRadius: 1.5,
    stage2Damage: 2000, stage2Range: 4, stage2Speed: 18,
    stage3Damage: 1000, stage3Range: 3, stage3Speed: 20,
    projectileRadius: 0.2, ultimateChargeRequired: 12, maxChargePerAttack: 6,
    ultimate: {
      id: "malfunctionZone", name: "고장 지대",
      description: "최대 8타일 거리에 반경 3타일 장판을 설치합니다. 적은 공격할 수 없고 이동속도가 50% 감소합니다.",
      castRange: 8, radius: 3, duration: 4, delay: 0.35,
    },
  },
};
