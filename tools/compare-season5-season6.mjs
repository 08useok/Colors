// Comparison-only experiment. Never writes game configuration or live matchups.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { CHARACTERS } from '../src/config/characters.js';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { createSeasonDuel } from './season-comparison-model.mjs';

export function comparisonConfigs() {
  const season5 = structuredClone(CHARACTERS);
  const season6 = structuredClone(CHARACTERS);
  season6.azure = structuredClone(BETA_CHARACTERS.azure);
  season6.yellow.ultimate = structuredClone(BETA_CHARACTERS.yellow.ultimate);
  return { season5, season6 };
}
const root = new URL('../', import.meta.url);
const scenarios = [4, 10, 16].flatMap(distance => [0.035, 0.1].map(aimError => ({ distance, aimError })));
const seedBase = 20260917, repetitions = 50;
const names = { red: '레드', green: '그린', blue: '블루', orange: '오렌지', yellow: '옐로우', cyan: '시안', purple: '퍼플', pink: '핑크', crimson: '크림슨', gold: '골드', ivory: '아이보리', chartreuse: '샤르트뢰즈', mint: '민트', azure: '애저' };
const tier = score => 4 - Math.sign(score - 0.5) * [0.05, 0.2, 0.35, 0.45].filter(t => Math.abs(score - 0.5) + 1e-10 >= t).length;
function tournament(config, scenarioOverrides = {}, onlyAzure = false) {
  const ids = Object.keys(config), duel = createSeasonDuel(config);
  const matrix = Object.fromEntries(ids.map(id => [id, {}]));
  const diagnostics = { _events: {}, ...Object.fromEntries(ids.map(id => [id, 0])) };
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    const a = ids[i], b = ids[j];
    if (onlyAzure && a !== 'azure' && b !== 'azure') continue;
    let wins = 0, losses = 0, draws = 0;
    for (let s = 0; s < scenarios.length; s++) for (let n = 0; n < repetitions; n++) for (const mirror of [1, -1]) {
      const seed = seedBase + s * 10000 + n;
      const scenario = { ...scenarios[s], ...scenarioOverrides };
      const result = mirror === 1 ? duel(a, b, scenario, seed, 1, true, diagnostics)
        : -duel(b, a, scenario, seed, -1, true, diagnostics);
      if (result > 0) wins++; else if (result < 0) losses++; else draws++;
    }
    assert.equal(wins + losses + draws, 600);
    const score = (wins + draws / 2) / 600;
    matrix[a][b] = { wins, losses, draws, games: 600, score };
    matrix[b][a] = { wins: losses, losses: wins, draws, games: 600, score: 1 - score };
  }
  for (const a of ids) for (const b of ids.filter(x => x !== a)) {
    if (onlyAzure && a !== 'azure' && b !== 'azure') continue;
    assert(Math.abs(matrix[a][b].score + matrix[b][a].score - 1) < 1e-10);
    assert.equal(tier(matrix[a][b].score) + tier(matrix[b][a].score), 8);
  }
  return { ids, matrix, diagnostics };
}
function run() {
  const configs = comparisonConfigs();
  const season5 = tournament(configs.season5);
  console.log('Season 5: 46,800 duels complete.');
  const season6 = tournament(configs.season6);
  console.log('Season 6: 54,600 duels complete.');
  const average = (season, id, opponents) => opponents.filter(other => other !== id).reduce((sum, other) => sum + season.matrix[id][other].score, 0) / opponents.filter(other => other !== id).length * 100;
  const rows = season5.ids.map(id => {
    const before = average(season5, id, season5.ids), sharedAfter = average(season6, id, season5.ids), after = average(season6, id, season6.ids);
    return { id, before, sharedAfter, after, mechanicsDelta: sharedAfter - before, rosterDelta: after - sharedAfter, totalDelta: after - before };
  });
  const changed = [];
  for (let i = 0; i < season5.ids.length; i++) for (let j = i + 1; j < season5.ids.length; j++) {
    const a = season5.ids[i], b = season5.ids[j], before = season5.matrix[a][b].score, after = season6.matrix[a][b].score;
    if (before !== after) changed.push({ a, b, before, after, tierChanged: tier(before) !== tier(after) });
  }
  // An unchanged shared roster must preserve every matchup not involving Yellow.
  assert(changed.every(p => p.a === 'yellow' || p.b === 'yellow'));
  const baseline = JSON.parse(readFileSync(new URL('specs/matchup-results.json', root), 'utf8'));
  assert.deepEqual(season5.matrix, baseline.matrix, 'Season 5 must reproduce the existing ultimate-inclusive result');
  const azureScore = average(season6, 'azure', season5.ids);
  const closeApproach = tournament(configs.season6, { azureIdeal: 1.5, azureAttackRange: 2 }, true);
  const closeApproachScore = average(closeApproach, 'azure', season5.ids);
  const hashes = Object.fromEntries(['src/config/characters.js', 'src/config/beta-characters.js', 'src/beta-season.js', 'tools/season-comparison-model.mjs', 'tools/compare-season5-season6.mjs'].map(p => [p, createHash('sha256').update(readFileSync(new URL(p, root), 'utf8').replace(/\r\n/g, '\n')).digest('hex')]));
  const report = { model: 'season-comparison-2d-v1', comparisonOnly: true, initialCharge: 0, seed: seedBase, scenarios, repetitions, gamesPerPair: 600, totalGames: 109200, primaryGames: 101400, hashes, rows, changed, azureScore, season5, season6,
    sensitivity: { games: 7800, azureIdeal: 1.5, azureAttackRange: 2, score: closeApproachScore, result: closeApproach } };
  const pct = n => n.toFixed(1), signed = n => `${n >= 0 ? '+' : ''}${pct(n)}`;
  const text = `# 시즌 5 → 시즌 6 비교 실험 (애저 포함 14종)

## 비교 범위

- **반영용 상성표가 아닌 별도 비교 실험**이다. 메인 게임, 현재 상성표, 캐릭터 설정은 변경하지 않는다.
- 시즌 5: 현재 메인 게임의 기존 13종과 궁극기 설정.
- 시즌 6 가정: 기존 13종의 수치·궁극기를 그대로 유지하고 애저와 옐로우의 전기 회로를 추가한다. 민트를 유지한다.
- 현재 베타 6 테스트 페이지는 민트 대신 애저가 들어간 13종이며, 기존 캐릭터 수치도 메인과 다르다. 이 결과는 그 페이지의 실측 결과가 아니다. 테스트 페이지의 다른 밸런스 변경은 가져오지 않았다.

## 방법

- 궁극기 충전 0, 탄약·체력 최대치로 시작하는 1대1. 45초 제한, 60회/초 계산.
- 시작 거리 4·10·16 × 조준 오차 0.035·0.1 × 고정 시드 50개 × 순서·위치 교환 2회 = 조합당 600전.
- 시즌 5 78조합 46,800전, 시즌 6 91조합 54,600전, 합계 **101,400전**.
- 애저의 접근 거리 민감도 검사 7,800전을 별도로 추가했다. 총 계산은 **109,200전**이다.
- 아래 점수는 **(승리 + 무승부 × 0.5) / 경기 수**다. 실제 플레이 승률이 아니다.
- 기존 13종은 이전 2D 모델의 이동·조준·스킬 사용 방식을 그대로 재사용하고, 시즌 5 전체 결과가 기존 결과 JSON과 일치하는지 검사했다.
- 지형·내부 벽·팀 전투·축구 모드·플레이어 숙련도는 제외한다. 핑크의 아군 부활 효과는 1대1에서 사용할 대상이 없다.

## 기존 13종 변화

‘동일 상대’는 양쪽 모두 기존 12종만 상대한다. ‘14종 평균’은 애저까지 13종을 상대하므로, 변화가 캐릭터 자체의 강화·약화를 뜻하지 않는다.

| 캐릭터 | 시즌 5 | 시즌 6 동일 상대 | 시즌 6 14종 평균 | 궁극기 추가 영향 | 상대 추가 영향 | 총 변화 |
|---|---:|---:|---:|---:|---:|---:|
${rows.map(r => `| ${names[r.id]} | ${pct(r.before)}% | ${pct(r.sharedAfter)}% | ${pct(r.after)}% | ${signed(r.mechanicsDelta)}%p | ${signed(r.rosterDelta)}%p | ${signed(r.totalDelta)}%p |`).join('\n')}

## 애저 대 기존 13종

애저 평균 점수: **${pct(azureScore)}%**. 기존 캐릭터별 600전이다.

| 상대 | 애저 점수 | 애저 승 / 패 / 무 |
|---|---:|---:|
${season5.ids.map(id => { const r = season6.matrix.azure[id]; return `| ${names[id]} | ${pct(r.score * 100)}% | ${r.wins} / ${r.losses} / ${r.draws} |`; }).join('\n')}

### 접근 거리 추가 비교

같은 상대·시드·시작 조건에서 애저만 목표 거리 1.5타일, 공격 시작 거리 2타일로 변경하면 평균 **${pct(closeApproachScore)}%**다(추가 7,800전). 본 비교의 애저는 목표 거리 3.2타일, 공격 시작 거리 4타일이다. 이 조건에서는 더 근접하는 정책도 낮은 점수를 해결하지 못했다. 파도 속도·공격 중 이동 제한·상대의 거리 유지·중심점 충돌 판정이 함께 작용한 결과이며, 실제 플레이에서 애저가 같은 비율로 패배한다는 뜻은 아니다.

## 궁극기 실제 발동

충전 가능하도록 구현한 것과 실제 한 경기에서 발동한 것은 다르다. 아래는 충전 0으로 시작한 본 실험의 발동 횟수이며 캐릭터별 경기 수가 다르다(시즌 5: 7,200전, 시즌 6: 7,800전).

| 캐릭터 | 시즌 5 발동 | 시즌 6 발동 |
|---|---:|---:|
${season6.ids.map(id => `| ${names[id]} | ${season5.diagnostics[id] ?? '—'} | ${season6.diagnostics[id]} |`).join('\n')}

- 애저 일반 공격 명중: ${season6.diagnostics._events.azureBasicHit ?? 0}회. 빅 웨이브 명중: ${season6.diagnostics._events.azureUltimateHit ?? 0}회.
- 옐로우 장치 설치: ${season6.diagnostics._events.devicePlaced ?? 0}회. 회로 가동: ${season6.diagnostics._events.circuitActivated ?? 0}회. 회로 피해 적중: ${season6.diagnostics._events.circuitHit ?? 0}회.
- 기존 78조합 중 점수 변경 ${changed.length}개, 상성 단계 변경 ${changed.filter(p => p.tierChanged).length}개.

| 기존 조합 | 앞 캐릭터의 시즌 5 점수 | 시즌 6 점수 |
|---|---:|---:|
${changed.map(p => `| ${names[p.a]} → ${names[p.b]} | ${pct(p.before * 100)}% | ${pct(p.after * 100)}% |`).join('\n')}

옐로우는 이 배치·조준 정책에서 장치가 공격을 가로막거나 장치를 쏘느라 직접 공격 기회를 소모하지만 회로 피해를 주지 못했다. 따라서 동일 상대 평균이 낮아졌다. 애저가 포함된 전체 평균 상승과 구분해서 봐야 한다.

## 신규 기술 모델의 가정

- 애저: 일반 파도 속도 10, 길이 4·폭 2, 본체 이동 최대 2, 피해 3,000. 궁극기 파도 속도 8, 길이 6·폭 4, 피해 4,800, 본체 고정. 파도마다 대상 한 번만 타격하며 일반 명중으로만 충전한다. 파도가 끝날 때까지 다음 공격을 막는다.
- 애저 판정은 베타 코드처럼 0.1타일 이하로 나누어 대상 중심과 파도 폭을 검사한다. 넉백 속도 9는 감쇠 이동을 약 1타일 즉시 이동으로 근사했다. 내부 벽이 없어 벽 관통의 이득은 비교하지 못한다.
- 옐로우: 충전 시 적의 좌우 2.5타일에 번갈아 장치를 둔다. 2개 이상이면 가장 가까운 사거리 내 장치를 일반 공격으로 조준한다. 실제 탄약·공격 주기·탄의 비행 시간을 소모하고 장치 충돌 후 회로를 가동한다. 장치 배치 전략에 따라 결과는 달라진다.
- 회로는 설치 순서대로 0.18초 간격으로 각 구간을 한 번 검사한다. 3초는 시각 효과 시간이며 지속 피해로 계산하지 않는다. 장치 하나만 맞히면 탄은 소모되지만 회로 피해는 없다. 회로 피해는 궁극기를 충전하지 않는다.
- 궁극기 효과가 검증용 충전 완료 상황에서는 작동해도, 자연 충전 경기에서는 발동하지 않을 수 있다. 충전 0의 짧은 1대1 결과로 팀 전투의 궁극기 가치를 판단하면 안 된다.

## 재현

\`node tools/compare-season5-season6.mjs\`

모델 검증: \`node tools/test-season-comparison.mjs\`. 전체 조합과 승·패·무·소스 해시는 \`season5-vs-season6-comparison.json\`에 저장한다. 이 도구는 비교 문서·데이터 두 파일만 갱신한다.
`;
  writeFileSync(new URL('specs/season5-vs-season6-comparison.json', root), JSON.stringify(report, null, 2) + '\n');
  writeFileSync(new URL('specs/season5-vs-season6-comparison.md', root), text);
  console.table(rows.map(r => ({ character: r.id, season5: pct(r.before), sameOpponents: pct(r.sharedAfter), season6: pct(r.after), delta: signed(r.totalDelta) })));
  console.log(JSON.stringify({ azureScore, changed, diagnostics: season6.diagnostics }, null, 2));
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) run();
