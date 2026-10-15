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
  return result;
}
