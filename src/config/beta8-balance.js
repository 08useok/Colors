import { BETA_ULTIMATE_MOTIONS } from './beta-ultimate-motion.js';
import { BETA_ATTACK_MOTIONS } from "./beta-attack-motion.js";
import { SALMON_CHARACTER } from "./salmon.js?v=1";
// Season 8 only: leave the shared Season 7 definitions and main release intact.
export function applyBeta8Balance(source) {
  const result = structuredClone(source);
  for (const [id, d] of Object.entries(result)) {
    d.basicUltimateChargeMultiplier = 0.5;
    if (BETA_ATTACK_MOTIONS[id]) d.attackWindup = BETA_ATTACK_MOTIONS[id].release;
    const u = d.special ?? d.ultimate;
    if (!u) continue;
    u.motionWindup = BETA_ULTIMATE_MOTIONS[id]?.release ?? 0;
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
  Object.assign(result.purple.ultimate, { projectileCount: 16, projectileSpeed: 14, projectileRadius: 0.14, projectileRange: 10, projectileDamage: 1100 });
  Object.assign(result.purple,{poisonDPS:1250,poisonDuration:5,needleSpeed:36,botAimWindupLeadFactor:.5});
  Object.assign(result.purple.ultimate,{damage:1000,projectileDamage:550,rechargePerHit:.25});
  result.purple.ultimate.chargeRequired = 2;
  result.purple.basicUltimateChargeMultiplier = 1;
  result.purple.botSmartUltimate = true;
  result.pink.pursuesWhileLowHealth = true;
  // Keep random CC poison independent of Purple tuning.
  result.chartreuse.poisonDPS = source.purple.poisonDPS;
  result.purple.basicAttack.description = result.purple.basicAttack.description.replace(' 일반 공격 적중으로 얻는 궁극기 충전량이 기존의 50%입니다.', '') + ' 일반 공격 적중당 궁을 1칸 충전하며 2회 적중으로 준비됩니다. 독 피해는 초당 1250이며 5초 동안 유지됩니다.';
  result.purple.basicAttack.descriptionEn = result.purple.basicAttack.descriptionEn.replace(' Basic hits grant 50% of the previous ultimate charge.', '') + ' Each basic hit grants one ultimate unit; two hits charge it. Poison deals 1250 damage per second and lasts five seconds.';
  const purple = result.purple.ultimate;
  purple.description = `도약 이륙·착지 때 반경 ${purple.radius}타일에 즉시 ${purple.damage} 피해를 주고, 중앙에서 가시 ${purple.projectileCount}발을 사방으로 발사합니다. 가시는 사거리 ${purple.projectileRange}타일, 한 발당 ${purple.projectileDamage} 피해이며 여러 발이 각각 적중할 수 있습니다. 중앙 피해로 궁 0.25칸, 가시 첫 명중으로 별도 0.25칸을 충전하며 같은 적의 나머지 가시는 해당 단계에서 추가 충전하지 않습니다.`;
  purple.descriptionEn = `On takeoff and landing, instantly deals ${purple.damage} damage within ${purple.radius} tiles and fires ${purple.projectileCount} thorns from the center. Each thorn deals ${purple.projectileDamage} damage with ${purple.projectileRange}-tile range; multiple thorns can hit. Central damage and the first thorn hit each grant 0.25 ultimate units per enemy per phase. Further thorns in that phase grant no extra charge.`;
  result.salmon = structuredClone(SALMON_CHARACTER);
  result.ivory.groundAttackRange = result.ivory.iceCreamRange;
  result.purple.groundAttackRange = result.purple.vialRange;
  result.yellow.botGroundAttackSpacing = 1;
  result.cyan.ultimate.damage = 5200;
  result.cyan.ultimate.description = '전방으로 강풍을 발사해 5200 피해를 주고 적을 강하게 밀쳐냅니다.';
  result.cyan.ultimate.descriptionEn = 'Launches a gust forward, dealing 5200 damage and strong knockback.';
  result.cyan.basicAttack.description = `알약 ${result.cyan.spreadLineCount}발을 ${result.cyan.spreadLineSpacing}타일 간격으로 평행 발사합니다. 알약당 ${result.cyan.spreadLineDamage} 피해, 사거리 ${result.cyan.spreadLineRange}타일입니다. 일반 공격 적중당 궁극기를 0.5칸 충전합니다.`;
  result.cyan.basicAttack.descriptionEn = `Fires ${result.cyan.spreadLineCount} parallel pills spaced ${result.cyan.spreadLineSpacing} tiles apart. Each deals ${result.cyan.spreadLineDamage} damage with a ${result.cyan.spreadLineRange}-tile range and grants 0.5 ultimate charge per hit.`;
  // Season 8 bot policy only; manual casts retain their authored targeting.
  for (const id of ['red','pink']) result[id].botTankTarget = true;
  for (const id of ['cyan','azure','crimson']) result[id].botKnockbackUltimateTankRange = 3;
  result.cyan.fullUltimateKnockback = result.azure.fullUltimateKnockback = true;
  result.crystal.shardDamage = 500;
  result.crystal.shardUltimateCharge = 1;
  result.crystal.basicAttack.description += ` 3단계 작은 조각 피해는 ${result.crystal.shardDamage}이며, 3단계 적중도 궁극기를 0.5칸 충전합니다.`;
  result.crystal.basicAttack.descriptionEn += ` Third-stage shards deal ${result.crystal.shardDamage} damage and grant 0.5 ultimate charge.`;
  result.crystal.ultimate.executeBypassesGuard = true;
  result.crystal.ultimate.executionFixedAmount = 28000;
  result.crystal.ultimate.bindStopsMovement = true;
  result.crystal.ultimate.telegraphWidth = 2.4;
  result.crystal.ultimate.telegraphReaction = .1;
  result.crystal.ultimate.telegraphEscapeDuration = 2;
  result.crystal.ultimate.description = '긴 거리를 이동해 적 한 명을 붙잡고 양쪽의 행동을 제한합니다. 궁 사용 표시와 돌진 경로를 보여주고 1.5초 준비한 뒤 표시된 위치로 돌진하며, 분석 시작 8초 뒤 보호막을 무시하는 고정 28000 피해를 줍니다. 체력이 남으면 생존하며 분석이 해제됩니다.';
  result.crystal.ultimate.descriptionEn = 'Shows an ultimate warning and waits 1.5 seconds before dashing along the marked path to bind an enemy, restricting both actors. Eight seconds after binding, deals a fixed 28000 damage ignoring damage-reduction guards. Surviving targets are released.';
  result.cyan.ultimate.chargeRequired = 1.5;
  result.cyan.botKnockbackUltimateTankRange = 4;
  result.azure.surfWidth = 3;
  result.azure.basicAttack.description = result.azure.basicAttack.description.replace('4\u00d72', '4\u00d73');
  result.azure.basicAttack.descriptionEn = result.azure.basicAttack.descriptionEn.replace('4-by-2', '4-by-3');
  result.salmon.botAimLeadFactor = .6;
  result.salmon.attackPerceptionMinRange = 7;
  result.salmon.attackPerceptionRange = result.salmon.attackRange;
  result.gold.projectileDamageReduction = 1650;
  result.gold.maxHealth = Math.round(result.gold.maxHealth * .9);
  for (const key of ['stage1Damage','stage2Damage','stage3Damage']) {
    const before = result.gold[key], after = ({stage1Damage:1300,stage2Damage:600,stage3Damage:300})[key];
    result.gold[key] = after;
    for (const language of ['description','descriptionEn'])
      result.gold.basicAttack[language] = result.gold.basicAttack[language].replaceAll(String(before), String(after));
  }
  const oldGoldTick = result.gold.ultimate.tickDamage;
  result.gold.ultimate.tickDamage = Math.round(oldGoldTick * 1.1);
  for (const language of ['description','descriptionEn'])
    result.gold.ultimate[language] = result.gold.ultimate[language].replaceAll(String(oldGoldTick), String(result.gold.ultimate.tickDamage));
  result.lavender.special.chargeRequired = 1;
  result.crystal.ultimate.chargeRequired = 1.5;
  result.cyan.ultimate.description += ' 필요한 궁극기 충전은 1.5칸이며 일반 공격 3회 적중으로 충전합니다.';
  result.cyan.ultimate.descriptionEn += ' Requires 1.5 ultimate charge units (three basic hits).';
  result.gold.basicAttack.description += ' 받는 투사체 피해를 1650 감소시킵니다.';
  result.gold.basicAttack.descriptionEn += ' Reduces incoming projectile damage by 1650.';
  result.crystal.ultimate.description += ' 피해 감소 보호막을 무시하며, 필요한 궁극기 충전은 1.5칸입니다.';
  result.crystal.ultimate.descriptionEn += ' Execution ignores damage-reduction guards and requires 1.5 charge units.';
  result.red.botAvoidControlProjectiles = true;
  result.red.moveSpeedMultiplier = 1.15;
  Object.assign(result.crystal,{botTrackTargetDuringWindup:true,botAimIntercept:true,botAimLeadFactor:.65});
  Object.assign(result.chartreuse,{botAvoidControlProjectiles:true,botTrackTargetDuringWindup:true,botAimLeadFactor:.3});
  result.mint.botAvoidVolleyProjectiles = true;
  result.cyan.botKnockbackUltimateTankRange = 5;
  result.orange.botTrackTargetDuringWindup = true;
  result.orange.botAimLeadFactor = 1;
  result.orange.botAvoidControlProjectiles = true;
  result.blue.botAvoidBurstProjectiles = true;
  result.blue.botPathDirections = 24;
  result.blue.bulletKnockback = 0;
  result.blue.bulletRange = 20;
  result.blue.attackPerceptionRange = 20;
  result.blue.bulletHitboxMultiplier = 1.1;
  Object.assign(result.blue.special,{chargeRequired:2.5,rechargePerHit:.5});
  Object.assign(result.blue.special,{damageReduction:.7,invulnerableDuringDash:false,guardDuringPreparation:true});
  result.blue.special.description = '빠르게 굴러 이동하며 벽에 부딪히면 튕겨 나갑니다. 경로의 적에게 피해와 넉백을 주고, 궁극기 준비·구르기 중 받는 피해가 70% 감소합니다. 종료·중단 시 보호막이 해제됩니다.';
  result.blue.special.descriptionEn = 'Rolls forward, bouncing off walls and damaging and knocking back enemies. Takes 70% less damage during preparation and rolling; the shield ends when the ultimate ends or is interrupted.';
  result.blue.basicAttack.description = `사거리 ${result.blue.bulletRange}타일의 구슬을 빠르게 던져 ${result.blue.bulletDamage} 피해를 줍니다. 투사체 판정이 10% 커지며 일반 공격 5회 적중으로 궁극기를 충전합니다.`;
  result.blue.basicAttack.descriptionEn = `Throws a fast marble up to ${result.blue.bulletRange} tiles, dealing ${result.blue.bulletDamage} damage. Projectile hitboxes are 10% larger and five basic hits charge the ultimate.`;
  result.blue.special.description += ' 궁극기 5회 적중으로 다음 궁극기를 충전합니다.';
  result.blue.special.descriptionEn += ' Five ultimate hits recharge the next ultimate.';
  // Ordinary bots sidestep incoming shots without gaining movement speed.
  // Preserve authored specialist dodges (Crimson and Chartreuse).
  for (const d of Object.values(result)) {
    if (d.projectileDodgeDuration != null) continue;
    Object.assign(d, {projectileDodgeDuration:.28,projectileDodgeSpeedMultiplier:1,
      projectileDodgeDetectionRange:20,projectileDodgeThreatOnly:true,projectileDodgeCooldown:.9,projectileDodgeChance:.5});
  }
  result.crimson.projectileDodgeSpeedMultiplier = 1.5;
  result.crimson.projectileDodgeCooldown = .9;
  // Use Blue's longer reach instead of retreating forever at low health.
  // Its range band still backs away from nearby enemies.
  result.blue.attackPerceptionMinRange = 14;
  result.blue.pursuesWhileLowHealth = true;
  result.blue.projectileDodgeDuration = .18;
  // Short steps avoid dragging Salmon's long throw sequence off its firing lane.
  result.salmon.projectileDodgeDuration = .12;
  return result;
}
