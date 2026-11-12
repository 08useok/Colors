// Gadgets (가젯), Official Season 1: one per character, used on a cooldown with no per-match limit
// (Brawl Stars' 2025 rules). Damage dealt by a gadget never charges the ultimate or transform gauge.
// Season 1 ships gadgets for Black, White and the BETA FINAL EVENT champion (effect decided later).
//
// kind 'dash'          moves `distance` tiles toward the aim, stopping at walls.
// kind 'empowerAttack' the next basic attack gets `effect` (White: `bugs` bugs instead of one;
//                      Red 'stun', Yellow 'chain', Purple 'poisonBoost').
// kind 'recall'        Green: boomerangs flying out turn back at once, faster.
// kind 'brake'         Blue: for `duration` s a dash that hits a wall stops instead of bouncing, then guards.
// kind 'guard'         takes `damageReduction` less damage for `duration` s.
// Starting values (11.12); the 꼬리잡기 cycle is judged without gadgets.
export const GADGETS = {
  red: { name: '기절 펀치', cooldown: 16, kind: 'empowerAttack', effect: 'stun', stunDuration: 1,
    summary: '다음 일반 공격이 처음 적중한 적을 1초 동안 기절시킵니다.' },
  green: { name: '부메랑 리콜', cooldown: 12, kind: 'recall', returnSpeedBonus: .25,
    summary: '날아가고 있는 부메랑을 모두 즉시 되돌립니다. 돌아오는 속도가 25% 빨라집니다.' },
  blue: { name: '급제동 장치', cooldown: 14, kind: 'brake', duration: 3, guardDuration: 1.5, damageReduction: .25,
    summary: '3초 동안 돌진이 벽에 닿으면 튕기지 않고 멈춥니다. 멈춘 뒤 1.5초 동안 받는 피해가 25% 줄어듭니다.' },
  orange: { name: '껍질 보호', cooldown: 15, kind: 'guard', duration: 3, damageReduction: .3,
    summary: '3초 동안 받는 피해가 30% 줄어듭니다.' },
  yellow: { name: '전선 연결', cooldown: 14, kind: 'empowerAttack', effect: 'chain', chainRange: 6, chainDamage: .4,
    summary: '다음 전기구슬이 적중하면 6타일 안의 가장 가까운 다른 적에게 전류가 이어져 원래 피해의 40%를 줍니다. 둔화는 처음 맞은 적에게만 걸립니다.' },
  purple: { name: '독 농축', cooldown: 14, kind: 'empowerAttack', effect: 'poisonBoost', poisonBonus: 1,
    summary: '다음 독침 공격의 독 지속시간이 1초 늘어납니다. 독 피해는 그대로이고 중첩되지 않습니다.' },
  black: { name: '그림자 걸음', cooldown: 14, kind: 'dash', distance: 5,
    summary: '조준한 방향으로 5타일 빠르게 이동합니다.' },
  white: { name: '벌레 떼', cooldown: 18, kind: 'empowerAttack', effect: 'bugs', bugs: 5,
    summary: '다음 일반 공격이 흰 벌레를 5마리 소환합니다.' },
};
