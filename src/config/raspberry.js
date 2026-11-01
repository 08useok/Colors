// Raspberry — vine sniper. Values follow specs/characters/raspberry.md (confirmed 2026-10-20/11-01).
// Beta Season 9 only; not part of the Season 8 main roster or the 17-character counter cycle.
export const RASPBERRY_CHARACTER = {
  name: '라즈베리',
  nameEn: 'Raspberry',
  rarity: 'hero',
  color: 0xd6336c,
  maxHealth: 4800,
  moveSpeedMultiplier: 1,
  // 2026-11-01: 2.4 s was longer than the 2 s reload, so ammo never ran down. Three shots now fit in 1.6 s.
  attackCooldown: .8,
  reloadDuration: 2,
  maxAmmo: 3,
  // AI range and aim guide use attackRange; the shot itself uses the vine* values.
  attackRange: 18,
  vineRange: 18,
  vineSpeed: 24,
  vineDamage: 2050,
  vineRadius: .15,
  vineBindDuration: .6,
  // Built-in trait: +1 s on basic-attack binds only (1.6 s total). Ultimates never get it.
  vineTraitBindBonus: 1,
  // Six basic hits fully charge the ultimate; the beta 50% basic-charge multiplier does not apply.
  basicUltimateChargeMultiplier: 1,
  basicAttack: {
    name: '덩굴 저격',
    nameEn: 'Vine Snipe',
    description: '사거리 18타일의 직선 덩굴탄을 쏴 2,050 피해를 주고 1.6초 동안 이동을 묶습니다(기본 0.6초 + 특성 1초). 묶인 적은 공격과 제자리 궁극기는 쓸 수 있지만 이동·돌진·점프는 할 수 없습니다. 벽이나 첫 적에게 맞으면 사라집니다.',
    descriptionEn: 'Fires a straight 18-tile vine shot dealing 2,050 damage and binding movement for 1.6 seconds (0.6 base + 1 trait). Bound enemies can still attack and use in-place ultimates but cannot move, dash or jump. Stops at walls and the first enemy.',
  },
  ultimate: {
    id: 'vinePrison',
    name: '덩굴 감옥',
    nameEn: 'Vine Prison',
    castRange: 10,
    radius: 3.5,
    telegraph: .4,
    damage: 600,
    bindDuration: 2,
    duration: 4,
    slowPercent: .3,
    chargeRequired: 6,
    rechargePerHit: 0,
    motionWindup: 0,
    description: '10타일 안의 지점에 반지름 3.5타일 덩굴 감옥을 예고하고 0.4초 뒤 발동합니다. 발동 순간 안에 있는 적은 600 피해와 2초 속박을 받고, 4초 동안 영역 안에서는 30% 느려집니다. 공중의 적과 벽 뒤의 적은 영향을 받지 않습니다.',
    descriptionEn: 'Marks a 3.5-tile vine prison within 10 tiles and triggers it after 0.4 seconds. Enemies inside take 600 damage and a 2-second bind, then are slowed by 30% while inside for 4 seconds. Airborne enemies and enemies behind walls are unaffected.',
  },
};
