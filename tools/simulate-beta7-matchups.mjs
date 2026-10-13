import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { tournament } from './simulate-beta6-balance.mjs';
import { BETA7_COUNTER_CYCLE, BETA7_COUNTER_TARGETS } from '../src/config/beta7-counter-targets.js';
const config=applyBeta7Balance(BETA_CHARACTERS);
const repetitions=Number(process.argv.find(arg=>arg.startsWith('--repetitions='))?.split('=')[1]??3);
assert(Number.isInteger(repetitions)&&repetitions>0);
const result=process.argv.includes('--extended')?JSON.parse(readFileSync(new URL('../specs/beta7-matchup-extended-results.json',import.meta.url),'utf8')):process.argv.includes('--reuse')?JSON.parse(readFileSync(new URL('../specs/beta7-matchup-results.json',import.meta.url),'utf8')):tournament(config,repetitions);
assert.deepEqual([...BETA7_COUNTER_CYCLE].sort(),Object.keys(config).sort());
assert.equal(new Set(BETA7_COUNTER_CYCLE).size,16);
const targetById=Object.fromEntries(BETA7_COUNTER_TARGETS.map(t=>[t.id,t]));
const audit=BETA7_COUNTER_TARGETS.map(t=>{
 assert.equal(targetById[t.targetWin].targetLoss,t.id);
 assert.equal(targetById[t.targetLoss].targetWin,t.id);
 const row=result.matrix[t.id];
 return {...t,winScore:row[t.targetWin].score,lossScore:row[t.targetLoss].score,
  winCount:Object.values(row).filter(v=>v.score===1).length,lossCount:Object.values(row).filter(v=>v.score===0).length};
});
writeFileSync(new URL('../specs/beta7-counter-targets.json',import.meta.url),JSON.stringify({
 kind:'design-targets-not-combat-rules',season:'beta7',cycle:BETA7_COUNTER_CYCLE,selected:BETA7_COUNTER_TARGETS,
 audit,achieved:audit.every(r=>r.winScore===1&&r.lossScore===0&&r.winCount===1&&r.lossCount===1),
},null,2)+'\n');
writeFileSync(new URL('../specs/beta7-matchup-results.json',import.meta.url),JSON.stringify({
 scope:'beta season 7, current 16 characters',initialCharge:0,drawScore:.5,
 gold:{stage1Damage:config.gold.stage1Damage,stage2Damage:config.gold.stage2Damage,stage3Damage:config.gold.stage3Damage,tickDamage:config.gold.ultimate.tickDamage??0,tickInterval:config.gold.ultimate.tickInterval??1,ultimateDelay:config.gold.ultimate.delay,ultimateRadius:config.gold.ultimate.radius},
 ivory:{damage:config.ivory.iceCreamDamage,zoneDamage:config.ivory.iceCreamZoneDamage??config.ivory.iceCreamDamage,tickInterval:config.ivory.iceCreamZoneTickInterval,range:config.ivory.iceCreamRange,ultimateRange:config.ivory.ultimate.castRange},
 yellow:{shockDuration:config.yellow.shockDuration,shockSlowPercent:config.yellow.shockSlowPercent,botTargetCircuitDevices:config.yellow.botTargetCircuitDevices??false,botAvoidLandingZones:config.yellow.botAvoidLandingZones??false,botLandingDodgeSpeedMultiplier:config.yellow.botLandingDodgeSpeedMultiplier??1},
 chartreuseBot:{duration:config.chartreuse.projectileDodgeDuration,speedMultiplier:config.chartreuse.projectileDodgeSpeedMultiplier,detectionRange:config.chartreuse.projectileDodgeDetectionRange,kinds:config.chartreuse.projectileDodgeKinds},
  crystalBot:{aimLeadFactor:config.crystal.botAimLeadFactor??.65},
 lavender:{range:config.lavender.attackRange,tickInterval:config.lavender.sprayTickInterval,damage:config.lavender.sprayDamage,distanceBonus:config.lavender.sprayDistanceDamageBonus,slow:config.lavender.special.slowPercent,chargeRequired:config.lavender.special.chargeRequired,rechargePerHit:config.lavender.special.rechargePerHit},
 ...result,
},null,2)+'\n');
console.table(Object.entries(result.averages).sort((a,b)=>b[1]-a[1]).map(([id,winRate])=>({id,winRate,games:Object.values(result.matrix[id]).reduce((sum,v)=>sum+v.games,0)})));
const names={red:'레드',orange:'오렌지',yellow:'옐로우',green:'그린',blue:'블루',cyan:'시안',purple:'퍼플',pink:'핑크',crimson:'크림슨',gold:'골드',ivory:'아이보리',chartreuse:'샤르트뢰즈',mint:'민트',azure:'애저',crystal:'크리스탈',lavender:'라벤더'};
const ids=Object.keys(names);
const cell=(id,other)=>{
 if(id===other)return '×';
 const score=result.matrix[id][other].score,text=(100*score).toFixed(1),target=targetById[id];
 if((score===1&&target.targetWin===other)||(score===0&&target.targetLoss===other))return `**${text}**`;
 return score===1||score===0?`*${text}*`:text;
};
const matrix=[`| 카운터 / 카운팅 | ${ids.map(id=>names[id]).join(' | ')} | 평균 |`,
 `|---|${ids.map(()=> '---:').join('|')}|---:|`,
 ...ids.map(id=>`| ${names[id]} | ${ids.map(other=>cell(id,other)).join(' | ')} | ${result.averages[id].toFixed(2)} |`)];
const averages=Object.entries(result.averages).sort((a,b)=>b[1]-a[1]).map(([id,score],i)=>`| ${i+1} | ${names[id]} | ${score.toFixed(2)}% |`);
writeFileSync(new URL('../specs/beta7-matchups.md',import.meta.url),[
 '# 베타 시즌 7 최신 1대1 승률','',
 `6레벨·궁 충전 0 시작. 거리 10·13·16타일 × 조준 오차 0.035·0.1, 조건당 ${result.repetitions}회·진영 양방향. 상대별 ${result.repetitions*12}경기, 캐릭터별 ${result.repetitions*180}경기, 총 ${result.games.toLocaleString('en-US')}경기. 무승부는 0.5승으로 반영한다. 시뮬레이션 결과이며 실전 승률이나 승리 보장으로 해석하지 않는다.`,'',
 '라벤더: 사거리 9타일, 틱 간격 0.5초, 틱 피해 1,100~1,650, 최대 3회 적중, 궁극기 둔화 70%, 궁 충전 요구량 2칸, 장판 재충전 0.05칸.','',
 `옐로우: 적중 둔화 ${config.yellow.shockDuration}초·${config.yellow.shockSlowPercent*100}%. 봇은 설치된 장치가 두 개 이상이면 적과의 거리와 별도로 장치에 일반 공격을 발사하고, 장치가 사거리 밖이면 접근한다.`,'',
 `옐로우 봇은 아이스크림 일반·궁 착탄 범위와 장판을 예측해 회피하며, 회피 중에만 이동 배율 ${config.yellow.botLandingDodgeSpeedMultiplier??1}을 적용한다. 플레이어 이동에는 적용하지 않는다.`,'',
 `샤르트뢰즈 봇은 지정된 직선 탄환 종류를 ${config.chartreuse.projectileDodgeDetectionRange}타일 안에서 감지하면 ${config.chartreuse.projectileDodgeDuration}초 동안 이동 배율 ${config.chartreuse.projectileDodgeSpeedMultiplier}로 옆으로 회피한다. 퍼플 독침·독병에는 이 회피를 적용하지 않으며 플레이어 이동은 수동이다.`,'',
 `골드: 금광석 ${config.gold.stage1Damage}, 2·3단계 ${config.gold.stage2Damage}·${config.gold.stage3Damage}, 궁 설치 대기 ${config.gold.ultimate.delay}초, 장판 ${config.gold.ultimate.tickInterval??1}초마다 ${config.gold.ultimate.tickDamage??0} 피해. 아이보리: 착탄 피해 ${config.ivory.iceCreamDamage}, 일반·궁 장판 ${config.ivory.iceCreamZoneTickInterval}초마다 ${config.ivory.iceCreamZoneDamage??config.ivory.iceCreamDamage} 피해, 일반 0~${config.ivory.iceCreamRange}타일·궁 중심 0~${config.ivory.ultimate.castRange}타일 거리 조준.`,'',
 '## 꼬리잡기 목표','',BETA7_COUNTER_CYCLE.map(id=>names[id]).join(' → ')+' → 레드','',
  `크리스탈 봇은 상대 이동 예측에 ${config.crystal.botAimLeadFactor??.65} 계수를 적용한다. 플레이어 직접 조준과 능력치는 유지한다.`,'',
 '화살표 앞 캐릭터가 뒤 캐릭터에게 100% 승리하는 것이 목표다. 지정 상대에게 실제로 100%·0%를 달성한 칸은 **굵게**, 그 밖의 상대에게 100%·0%인 칸은 *이탤릭체*로 표시한다. 각 캐릭터가 오직 한 상대에게만 100%, 한 상대에게만 0%인 전체 목표는 아직 미달이다.','',
 '| 캐릭터 | 100% 목표 상대 | 실제 승률 | 0% 목표 상대 | 실제 승률 | 100% / 0% 상대 수 |','|---|---|---:|---|---:|---:|',
 ...audit.map(r=>`| ${names[r.id]} | ${names[r.targetWin]} | ${(r.winScore*100).toFixed(1)}% | ${names[r.targetLoss]} | ${(r.lossScore*100).toFixed(1)}% | ${r.winCount} / ${r.lossCount} |`),'',
 '## 평균 승률','', '| 순위 | 캐릭터 | 평균 승률 |','|---:|---|---:|',...averages,'',
 '## 상대별 승률','', '행 캐릭터가 열 캐릭터를 이기는 비율이다. 단위는 %, 같은 캐릭터는 검사하지 않아 ×로 표시한다.','', ...matrix,'',
 `[원본 결과](beta7-matchup-results.json) · 재실행: \`node tools/simulate-beta7-matchups.mjs --repetitions=${result.repetitions}\``,'',
].join('\n'));
