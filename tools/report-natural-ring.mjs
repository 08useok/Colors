// Combine measure-natural-ring.mjs runs, look for a 20-character ring with every link >= 75%,
// fall back to the ring with the strongest weakest link, and write
// specs/natural-counter-ring-75-20261112.{json,md}.  Usage: node tools/report-natural-ring.mjs run1.json run2.json ...
import fs from 'node:fs';
import { maps } from './simulate-gadgets-three-maps.mjs';

const TARGET = .75;
const files = process.argv.slice(2);
if (!files.length) throw new Error('pass the run files written by measure-natural-ring.mjs');
const runs = files.map(f => JSON.parse(fs.readFileSync(f, 'utf8')));
const rows = runs.flatMap(r => r.rows.map(x => ({ ...x, seed: r.seed, aimError: r.aimError })));
const NAME = { red: '레드', green: '그린', blue: '블루', orange: '오렌지', yellow: '옐로', cyan: '시안', purple: '퍼플', pink: '핑크', crimson: '크림슨', gold: '골드',
  ivory: '아이보리', chartreuse: '샤르트뢰즈', mint: '민트', azure: '애저', crystal: '크리스탈', lavender: '라벤더', salmon: '샐먼', raspberry: '라즈베리', black: '블랙', white: '화이트' };
const flip = { win: 'loss', loss: 'win', draw: 'draw' };
const stat = new Map(), ids = new Set();
const add = (a, b, map, res) => {
  for (const k of [`${a}>${b}`, `${a}>${b}@${map}`]) { const s = stat.get(k) ?? { w: 0, l: 0, d: 0 }; s[res === 'win' ? 'w' : res === 'loss' ? 'l' : 'd']++; stat.set(k, s); }
};
for (const r of rows) { ids.add(r.a); ids.add(r.b); add(r.a, r.b, r.map, r.result); add(r.b, r.a, r.map, flip[r.result]); }
const all = [...ids], S = (a, b, map) => stat.get(map ? `${a}>${b}@${map}` : `${a}>${b}`);
const score = (a, b) => { const s = S(a, b); return (s.w + s.d / 2) / (s.w + s.l + s.d); };
const perPair = (() => { const s = S(all[0], all[1]); return s.w + s.l + s.d; })();
const pct = v => (v * 100).toFixed(1) + '%';
const wld = s => `${s.w}/${s.l}/${s.d}`;

function findRing(t, budgetMs) {
  const started = Date.now(), start = all[0], path = [start], used = new Set(path), ok = (a, b) => a !== b && score(a, b) >= t;
  let found = null, steps = 0;
  (function dfs() {
    if (found || Date.now() - started > budgetMs) return;
    const a = path.at(-1);
    if (path.length === all.length) { if (ok(a, start)) found = [...path]; return; }
    if (++steps % 64 === 0) for (const c of all) if (!used.has(c)) {
      if (!all.some(p => (p === a || !used.has(p)) && ok(p, c))) return;
      if (!all.some(n => (n === start || !used.has(n)) && ok(c, n))) return;
    }
    const deg = x => all.filter(z => !used.has(z) && ok(x, z)).length;
    for (const b of all.filter(b => !used.has(b) && ok(a, b)).sort((x, y) => deg(x) - deg(y))) { path.push(b); used.add(b); dfs(); if (found) return; path.pop(); used.delete(b); }
  })();
  return found;
}
const strongWins = a => all.filter(b => b !== a && score(a, b) >= TARGET), strongLosses = a => all.filter(b => b !== a && score(b, a) >= TARGET);
const blockers = all.filter(a => !strongWins(a).length || !strongLosses(a).length);
// The best possible weakest link is capped by every character's best incoming and outgoing scores.
const cap = Math.min(...all.map(a => Math.max(...all.filter(b => b !== a).map(b => score(b, a)))), ...all.map(a => Math.max(...all.filter(b => b !== a).map(b => score(a, b)))));
const thresholds = [...new Set(all.flatMap(a => all.filter(b => b !== a).map(b => score(a, b))))].filter(v => v <= cap + 1e-12).sort((x, y) => y - x);
let best = null;
for (const t of thresholds) { const ring = findRing(t, 8000); if (ring) { best = { t, ring }; break; } }
const target = blockers.length ? null : findRing(TARGET, 60000);

const date = '2026-11-12';
fs.writeFileSync(new URL('../specs/natural-counter-ring-75-20261112.json', import.meta.url), JSON.stringify({
  date, target: TARGET, conditions: runs.map(r => ({ seed: r.seed, aimError: r.aimError, fights: r.rows.length })), gamesPerPair: perPair,
  targetRing: target, blockers, bestRing: best && { weakest: best.t, order: best.ring }, rows }) + '\n');

const L = [];
L.push('# 가젯 모두 켬 · 자연스러운 꼬리잡기 재측정 (75% 기준)', '', `작성일: ${date} · 대상: Colors · Claude 참고용`, '');
L.push('이전 문서 `specs/natural-counter-ring-20261112.md`(연결당 6경기, 시드 1개)를 표본을 늘려 다시 측정했다. 이전 문서는 그대로 두었다.', '');
L.push('**관측 결과로 찾은 고리 후보이며, 확정 하드 카운터·실제 서비스 승률·새 밸런스 목표가 아니다.** 측정을 위해 캐릭터 수치나 경기 결과를 바꾸지 않았다. 기존 18명 설계 꼬리잡기(240-0, `src/config/beta8-counter-targets.js`)는 그대로다.', '');
L.push('## 결론', '');
if (target) L.push(`- 모든 연결이 관측 점수 ${pct(TARGET)} 이상인 20명 고리를 찾았다.`);
else {
  L.push(`- **모든 연결이 ${pct(TARGET)} 이상인 20명 고리는 만들 수 없다.**`);
  if (blockers.length) for (const a of blockers) {
    const top = all.filter(b => b !== a).map(b => [b, score(b, a)]).sort((x, y) => y[1] - x[1]).slice(0, 3);
    L.push(`  - ${NAME[a] ?? a}: ${!strongLosses(a).length ? `${pct(TARGET)} 이상으로 이기는 상대가 없다 (가장 잘하는 상대: ${top.map(([b, v]) => `${NAME[b] ?? b} ${pct(v)}`).join(', ')}).` : `${pct(TARGET)} 이상으로 이기는 상대가 없다.`}`);
  }
}
if (best) L.push(`- 만들 수 있는 가장 강한 고리는 **가장 약한 연결 ${pct(best.t)}**이다. 각 캐릭터를 가장 잘 이기는 상대·가장 잘 이기는 대상의 점수로 정해지는 상한이 ${pct(cap)}이므로, 이보다 높은 고리는 없다.`);
L.push(`- 연결당 ${perPair}경기 (이전 6경기). 맵 3종 × 좌우 반전 2 × 시드 ${new Set(runs.map(r => r.seed)).size}개 × 조준 오차 ${[...new Set(runs.map(r => r.aimError))].join(' / ')}.`, '');
if (best) {
  const ring = best.ring;
  L.push(`## 가장 강한 고리 (가장 약한 연결 ${pct(best.t)})`, '', '```text');
  for (let i = 0; i < ring.length; i += 7) L.push(ring.slice(i, i + 7).map(id => NAME[id] ?? id).join(' → ') + (i + 7 < ring.length ? ' →' : ' →'));
  L.push(`${NAME[ring[0]] ?? ring[0]} (처음으로)`, '```', '');
  L.push(`아래 승/패/무는 각 행의 캐릭터가 「내가 잡는 다음 캐릭터」와 싸운 결과다 (${perPair}경기). 맵별 셀은 승/패/무다.`, '');
  L.push(`| 순서 | 캐릭터 (ID) | 나를 잡는 앞 캐릭터 | 내가 잡는 다음 캐릭터 | 승/패/무 | 승률 | 관측 점수 | ${maps.map(m => m.name).join(' | ')} |`);
  L.push(`|---:|---|---|---|---:|---:|---:|${maps.map(() => '---:').join('|')}|`);
  ring.forEach((a, i) => {
    const prev = ring[(i + ring.length - 1) % ring.length], next = ring[(i + 1) % ring.length], s = S(a, next), n = s.w + s.l + s.d;
    L.push(`| ${i + 1} | ${NAME[a] ?? a} (\`${a}\`) | ${NAME[prev] ?? prev} | ${NAME[next] ?? next} | ${wld(s)} | ${pct(s.w / n)} | ${pct(score(a, next))} | ${maps.map(m => wld(S(a, next, m.id))).join(' | ')} |`);
  });
  L.push('', '```json', JSON.stringify(ring, null, 2), '```', '');
}
L.push(`## 캐릭터별 ${pct(TARGET)} 이상 우세·열세`, '', `관측 점수 ${pct(TARGET)} 이상으로 이기는 상대(강한 우세)와 지는 상대(강한 열세)다. 한쪽이 0명이면 그 기준의 고리에 넣을 수 없다.`, '');
L.push('| 캐릭터 | 강한 우세 | 강한 열세 | 이기는 상대 | 지는 상대 |', '|---|---:|---:|---|---|');
for (const a of [...all].sort((x, y) => strongWins(y).length - strongWins(x).length))
  L.push(`| ${NAME[a] ?? a} | ${strongWins(a).length} | ${strongLosses(a).length} | ${strongWins(a).map(b => NAME[b] ?? b).join(', ') || '—'} | ${strongLosses(a).map(b => NAME[b] ?? b).join(', ') || '—'} |`);
L.push('', '## 측정 조건', '', '| 항목 | 조건 |', '|---|---|');
L.push(`| 대상 | ${all.length}명 (블랙·화이트 초안 포함), ${all.length * (all.length - 1) / 2}쌍 |`, `| 전체 경기 수 | ${rows.length.toLocaleString('ko-KR')}경기 (연결당 ${perPair}경기) |`);
L.push(`| 시드 / 조준 오차 | ${[...new Set(runs.map(r => r.seed))].join(', ')} / ${[...new Set(runs.map(r => r.aimError))].join(', ')} |`, `| 맵 | ${maps.map(m => m.name).join(' / ')} (비교용 고정 합성 맵, 실제 게임 맵과 다름) |`);
L.push('| 시작 거리 / 제한 시간 | 10타일 / 90초 (초과 시 무승부) |', '| 파워 | 7 (체력·피해 ×1.12) |', '| 가젯 / 궁극기 / 변신 | 양쪽 켬 / 켬 / 끔 |', '| 자연 회복 | 전투에서 벗어나 5초 뒤 최대 체력 10%/초 |');
L.push('| 반영된 최근 변경 | 블루 오토 트래커(+피해 10%), 블루 재장전 0.3초, 아이보리 장판 3.5·사거리 9.5, 가젯 #001~#020 |', '');
L.push('## 해석할 때 주의할 점', '');
L.push('- 1대1 봇 시뮬이다. 팀 보호 가젯(핑크 비상 하트, 애저 비상 부표)의 가치, 모드 목표, 사람의 수풀 수색·기습은 반영되지 않는다.');
L.push('- 파워 7·변신 끔 조건이다. 경쟁전(파워 11, 변신 켬)과는 결과가 다를 수 있다.');
L.push('- 관측 점수는 (승 + 무승부 × 0.5) / 경기 수다. 이 기준을 넘는 연결로 만든 고리 후보 하나이며, 유일한 최적 고리라는 뜻이 아니다.');
L.push('- 고리에는 바로 다음 상대 하나만 보인다. 여러 상대를 크게 이기는 캐릭터(위 표의 강한 우세 수)가 고리에서는 한 명만 잡는 것처럼 보일 수 있다.');
if (best) {
  // Links that win overall but lose on one of the maps.
  const flips = best.ring.flatMap((a, i) => { const b = best.ring[(i + 1) % best.ring.length];
    return maps.filter(m => { const s = S(a, b, m.id); return s.l > s.w; }).map(m => `${NAME[a] ?? a} → ${NAME[b] ?? b} (${m.name} ${wld(S(a, b, m.id))})`); });
  if (flips.length) L.push(`- 합산 우세가 모든 맵의 우세는 아니다. 고리 연결 중 특정 맵에서는 지는 연결: ${flips.join(', ')}.`);
}
L.push('');
L.push('## 이전 측정과의 차이', '', '| 항목 | 이전 (`natural-counter-ring-20261112.md`) | 이번 |', '|---|---|---|');
L.push(`| 연결당 경기 수 | 6 | ${perPair} |`, '| 시드 / 조준 오차 | 1개 / 0 | 4개 / 0·0.08 |', '| 연결 기준 | 관측 점수 50% 초과 | 75% 목표 (불가 시 가장 강한 고리) |', '| 블루 | 가젯 발동 문제 포함 | 오토 트래커 + 재장전 버프 반영 |', '');
L.push('## 재현', '', '```bash', 'SEED=20261112 AIM=0 OUT=run.json node tools/measure-natural-ring.mjs   # 시드·조준 오차마다 한 번씩', 'node tools/report-natural-ring.mjs run*.json', '```', '', '원본 경기 자료: `specs/natural-counter-ring-75-20261112.json`', '');
fs.writeFileSync(new URL('../specs/natural-counter-ring-75-20261112.md', import.meta.url), L.join('\n'));
console.log(target ? 'target ring found' : `no ${TARGET} ring; best weakest ${best && pct(best.t)}; cap ${pct(cap)}`);
