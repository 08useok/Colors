import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { tournament } from './simulate-beta6-balance.mjs';
const c = applyBeta7Balance(BETA_CHARACTERS);
Object.assign(c.ivory, JSON.parse(process.argv[2] ?? '{}'));
const threshold = Number(process.argv[3] ?? 0.99), forced = (process.argv[4] ?? '').split(',').filter(Boolean);
const r = tournament(c, 20), ids = Object.keys(c);
const score = (a, b) => r.matrix[a][b].score;
const win = (a, b) => forced.includes(a + '>' + b) || score(a, b) >= threshold;
const old = ['red','blue','chartreuse','ivory','gold','cyan','green','azure','crimson','yellow','mint','pink','purple','orange','crystal'];
const oldEdges = new Set(old.map((a,i)=>a+'>'+old[(i+1)%old.length]));
const results = [];
const start = ids[0];
function dfs(path, used) {
  const last = path[path.length-1];
  if (path.length === ids.length) { if (win(last, start)) { const edges = path.map((a,i)=>[a, path[(i+1)%path.length]]); const kept = edges.filter(([a,b])=>oldEdges.has(a+'>'+b)).length; const weak = edges.filter(([a,b])=>score(a,b)<threshold); results.push({ kept, weak, path: [...path] }); } return; }
  for (const n of ids) if (!used.has(n) && win(last, n)) { used.add(n); path.push(n); dfs(path, used); path.pop(); used.delete(n); }
}
dfs([start], new Set([start]));
console.log('azure>ivory', (score('azure','ivory')*100).toFixed(0)+'%', 'ivory avg', r.averages.ivory.toFixed(1), 'cycles', results.length);
results.sort((x, y) => x.weak.length - y.weak.length || y.kept - x.kept);
for (const b of results.slice(0, 3)) console.log('kept', b.kept, 'weak', b.weak.map(([a,c2])=>a+'>'+c2+':'+(score(a,c2)*100).toFixed(0)).join(' ')||'-', '\n ', b.path.join(' > '));
