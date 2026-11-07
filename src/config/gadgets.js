// Gadgets (가젯), Official Season 1: one per character, used on a cooldown with no per-match limit
// (Brawl Stars' 2025 rules). Damage dealt by a gadget never charges the ultimate or transform gauge.
// Season 1 ships gadgets for Black, White and the BETA FINAL EVENT champion (effect decided later).
//
// kind 'dash'          moves `distance` tiles toward the aim, stopping at walls.
// kind 'empowerAttack' the next basic attack gets `effect` (White: `bugs` bugs instead of one).
export const GADGETS = {
  black: { name: '그림자 걸음', cooldown: 14, kind: 'dash', distance: 5,
    summary: '조준한 방향으로 5타일 빠르게 이동합니다.' },
  white: { name: '벌레 떼', cooldown: 18, kind: 'empowerAttack', effect: 'bugs', bugs: 5,
    summary: '다음 일반 공격이 흰 벌레를 5마리 소환합니다.' },
};
