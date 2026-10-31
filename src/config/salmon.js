import { SALMON_THROW } from './salmon-animation.js';
export const SALMON_AIRBORNE_DURATION = 1.2;
export const SALMON_AIRBORNE_HEIGHT = 4.5;
export const SALMON_CHARACTER = {
  maxHealth:7600, moveSpeedMultiplier:1, attackCooldown:2, reloadDuration:Infinity, maxAmmo:5,
  attackRange:8.5, throwSpeed:14, throwWindup:SALMON_THROW.release, impactRadius:1.75, directDamage:2400, splashDamage:600, landingDamage:600,
  noAutomaticReload:true, basicUltimateChargeMultiplier:1,
  description:'낚시찌로 적을 포획하고, 빗나간 찌를 직접 회수하는 낚시꾼.',
  basicAttack:{name:'낚시 찌 투척',nameEn:'Bobber Toss',description:'8.5타일 곡사 투척. 가장 가까운 적 1명에게 3000 피해와 1.2초 포획, 주변에 600 피해. 포획 대상은 착지할 때 추가 600 피해를 받습니다. 포획 시 탄약 1발과 궁 4포인트 회복. 4타일 이내 빗나간 찌는 공격 버튼으로 회수합니다.'},
  ultimate:{id:'bigCatch',name:'월척이다!',nameEn:'Big Catch!',description:'원형 테두리에 체력 900인 포획 장치 8개를 설치합니다. 접촉 시 3000 피해와 1.2초 포획 후 해당 장치는 즉시 파괴됩니다. 포획 대상은 착지할 때 추가 600 피해를 받습니다. 투척물이 땅에 닿으면 설치 대기 없이 생성됩니다. 적은 장치를 파괴해 탈출할 수 있습니다.',chargeRequired:20,castRange:8.5,throwSpeed:14,installDelay:0,radius:3.5,count:8,deviceHealth:900,damage:3000,landingDamage:600,deviceRadius:1},
};
