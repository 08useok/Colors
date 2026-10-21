// Season 8 only: leave the shared Season 7 definitions and main release intact.
export function applyBeta8Balance(source) {
  const result = structuredClone(source);
  for (const [id, d] of Object.entries(result)) {
    d.basicUltimateChargeMultiplier = 0.5;
    const u = d.special ?? d.ultimate;
    if (!u) continue;
    const replacements = [];
    for (const key of ['damage', 'damagePerSecond', 'tickDamage', 'connectionDamage']) {
      if (typeof u[key] !== 'number') continue;
      const before = u[key], after = Math.round(before * 1.25);
      u[key] = after;
      replacements.push([before, after]);
    }
    if (id === 'crimson') {
      d.ultimateDamage = Math.round(d.ultimateDamage * 1.25);
      u.damage = d.ultimateDamage;
    }
    // These ultimates reuse basic attack damage; scale only ultimate instances.
    if (id === 'ivory' || id === 'chartreuse') u.damageMultiplier = 1.25;
    for (const key of ['description', 'descriptionEn']) {
      if (!u[key]) continue;
      for (const [before, after] of replacements) {
        u[key] = u[key].replaceAll(String(before), String(after))
          .replaceAll(before.toLocaleString('en-US'), after.toLocaleString('en-US'));
      }
      if (u.damageMultiplier) u[key] += key === 'description'
        ? ' 궁극기로 발생한 공격 피해가 25% 증가합니다.'
        : ' Damage from this ultimate is increased by 25%.';
    }
    d.basicAttack.description += ' 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다.';
    if (d.basicAttack.descriptionEn) d.basicAttack.descriptionEn += ' Basic hits grant 50% of the previous ultimate charge.';
  }
  result.lavender.sprayCloseTickInterval = 0.25;
  // Multipliers keep level-scaled sprayDamage compatible with each fixed band.
  result.lavender.sprayDamageBands = [
    { maxRange: 3, multiplier: 1 },
    { maxRange: 6, multiplier: 1.25 },
    { maxRange: 9, multiplier: 1.5 },
  ];
  result.lavender.basicAttack.description = '전방 9타일·60도 범위에 향수를 분사합니다. 가까울수록 틱 간격이 0.25초, 지속시간이 0.75초까지 짧아지고, 최대 사거리에서는 0.5초 간격·1.5초 지속입니다. 첫 적중 거리로 간격과 지속시간을 정하며 최대 3회 적중합니다. 틱 피해는 근거리 0~3타일 1100, 중거리 3타일 초과~6타일 1375, 원거리 6타일 초과~9타일 1650으로 고정되며, 적중당 궁극기를 0.5칸 충전합니다.';
  result.lavender.basicAttack.descriptionEn = 'Sprays perfume in a 9-tile, 60-degree fan. Nearby mist lasts 0.75 seconds and ticks every 0.25 seconds; at maximum range it lasts 1.5 seconds and ticks every 0.5 seconds. Timing is fixed at first contact, with up to three hits. Each hit deals fixed damage by current distance band: 1100 at 0–3 tiles, 1375 at over 3–6 tiles, and 1650 at over 6–9 tiles and grants 0.5 ultimate charge.';
  Object.assign(result.purple.ultimate, { projectileCount: 16, projectileSpeed: 14, projectileRadius: 0.14 });
  const purple = result.purple.ultimate;
  purple.description = `도약 이륙·착지 시 각각 가시 ${purple.projectileCount}발을 사방으로 발사합니다. 사거리 ${purple.radius}타일, 같은 적은 각 발사에서 한 번만 ${purple.damage} 피해를 받습니다. 기존 원형 즉시 피해를 가시 명중으로 대체합니다.`;
  purple.descriptionEn = `Fires ${purple.projectileCount} radial thorns on takeoff and landing. Range: ${purple.radius} tiles. Each enemy can take ${purple.damage} damage once per burst. Thorns replace the instant area hit.`;
  return result;
}
