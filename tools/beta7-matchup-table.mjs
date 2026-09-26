import { readFileSync, writeFileSync } from 'node:fs';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { tournament } from './simulate-beta6-balance.mjs';
const root = new URL('../', import.meta.url);
const names = { red:'레드', green:'그린', blue:'블루', orange:'오렌지', yellow:'옐로우', cyan:'시안', purple:'퍼플', pink:'핑크', crimson:'크림슨', gold:'골드', ivory:'아이보리', chartreuse:'샤르트뢰즈', mint:'민트', azure:'애저', crystal:'크리스탈' };
const targets = JSON.parse(readFileSync(new URL('specs/counter-targets.json', root), 'utf8')).selected.map(t => ({ ...t }));
// Season 7 cycle: orange -> crystal -> red (crystal inserted between orange and red).
for (const t of targets) { if (t.id === 'orange') t.targetWin = 'crystal'; if (t.id === 'red') t.targetLoss = 'crystal'; }
targets.push({ id: 'crystal', targetWin: 'red', targetLoss: 'orange' });
const result = tournament(applyBeta7Balance(BETA_CHARACTERS), 50);
const ids = targets.map(t => t.id), by = Object.fromEntries(targets.map(t => [t.id, t]));
const cell = (a, b) => {
  if (a === b) return 'X';
  const s = result.matrix[a][b].score, t = (s * 100).toFixed(1) + '%';
  const win = by[a].targetWin === b, loss = by[a].targetLoss === b;
  if (win && s === 1 || loss && s === 0) return `**${t}**`;
  if (s === 1 || s === 0) return `*${t}*`;
  return t;
};
const lines = ['| 카운터 / 카운팅 | ' + ids.map(i => names[i]).join(' | ') + ' |', '|---|' + ids.map(() => '---:').join('|') + '|'];
for (const a of ids) lines.push(`| **${names[a]}** | ` + ids.map(b => cell(a, b)).join(' | ') + ' |');
const audit = ['| 캐릭터 | 100% 목표 상대 | 결과 | 0% 목표 상대 | 결과 | 100% / 0% 상대 수 |', '|---|---|---:|---|---:|---:|'];
let ok = 0;
for (const t of targets) {
  const row = result.matrix[t.id], w = row[t.targetWin].score, l = row[t.targetLoss].score;
  if (w === 1 && l === 0) ok++;
  audit.push(`| ${names[t.id]} | ${names[t.targetWin]} | ${(w*100).toFixed(1)}% | ${names[t.targetLoss]} | ${(l*100).toFixed(1)}% | ${Object.values(row).filter(v => v.score === 1).length} / ${Object.values(row).filter(v => v.score === 0).length} |`);
}
const md = `\n## 시즌 7 상성표\n\n각 칸은 행 캐릭터의 **승리 + 무승부 0.5점** 비율이다. 조합당 600전(거리 10·13·16, 조준 오차 0.035·0.1, 시드 50개, 순서 교환 2회), 자기 대전은 X다. 지정 상대에게 실제로 100%·0%를 달성한 칸은 **굵게**, 지정 상대가 아닌데 100%·0%인 칸은 *이탤릭체*다. 순환은 … → 오렌지 → 크리스탈 → 레드 → … 로 크리스탈을 끼워 넣었다.\n\n${lines.join('\n')}\n\n### 목표 대비\n\n${audit.join('\n')}\n\n지정 상성 ${ok}/15 캐릭터가 100%·0% 목표 상대를 모두 달성했다.\n`;
writeFileSync(new URL('specs/beta-season-7-matchups.md', root), md.trimStart().replace(/^## /, '# ') );
console.log(ok, 'of 15');
