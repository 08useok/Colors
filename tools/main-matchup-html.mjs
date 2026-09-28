// 본 게임 로비 상성표(index.html #matchup-table tbody)를 시즌 6 시뮬레이션으로 생성한다.
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta6Balance } from '../src/config/beta6-balance.js';
import { tournament } from './simulate-beta6-balance.mjs';
const ids = ['red', 'green', 'blue', 'orange', 'yellow', 'cyan', 'purple', 'pink', 'crimson', 'gold', 'ivory', 'chartreuse', 'mint', 'azure'];
const label = { red: '🔴 Red', green: '🟢 Green', blue: '🔵 Blue', orange: '🟠 Orange', yellow: '🟡 Yellow', cyan: '🩵 Cyan', purple: '🟣 Purple', pink: '🩷 Pink', crimson: '🟥 Crimson', gold: '🟨 Gold', ivory: '🤍 Ivory', chartreuse: '🟩 Chartreuse', mint: '🍃 Mint', azure: '🌊 Azure' };
const config = applyBeta6Balance(BETA_CHARACTERS);
const r = tournament(Object.fromEntries(ids.map(id => [id, config[id]])), 50);
// 경계: 95·85·70·55 이상은 유리 쪽, 45·30·15·5 이하는 불리 쪽, 그 사이(45 초과 55 미만)는 경합.
const bucket = p => p >= 95 ? 0 : p >= 85 ? 1 : p >= 70 ? 2 : p >= 55 ? 3 : p > 45 ? 4 : p > 30 ? 5 : p > 15 ? 6 : p > 5 ? 7 : 8;
const rows = ids.map(a => {
  const cells = Array.from({ length: 9 }, () => []);
  for (const b of ids) if (b !== a) { const p = r.matrix[a][b].score * 100; cells[bucket(+p.toFixed(1))].push(`${label[b]} ${p.toFixed(1)}%`); }
  return `                <tr><th scope="row" class="mu-${a}">${label[a]}</th>${cells.map(c => `<td>${c.length ? c.join('<br>') : '—'}</td>`).join('')}</tr>`;
});
console.log(rows.join('\n'));
