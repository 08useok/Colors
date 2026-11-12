// Measures the official 20-character ring links (gadgets on) with the official balance applied, in parallel.
// Each link runs in its own process: 3 maps × 2 orders × seeds × aim errors (default 4 seeds × 0 / 0.08 = 48 games).
// Usage: node tools/probe-official-ring.mjs                       → every ring link with OFFICIAL_BALANCE
//        PATCH='{"salmon":{"maxHealth":7000}}' LINKS='[["ivory","salmon"]]' node tools/probe-official-ring.mjs
// PATCH is applied on top of OFFICIAL_BALANCE. A single link run: node tools/probe-official-ring.mjs --link a b
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { maps, defs as betaDefs } from './simulate-gadgets-three-maps.mjs';
import { fight } from './measure-natural-ring.mjs';
import { applyOfficialBalance, OFFICIAL_RING } from '../src/official/official-balance.js';

const SEEDS = [20261112, 20261113, 20261114, 20261115], AIMS = [0, .08];
const patch = JSON.parse(process.env.PATCH ?? '{}');
if (process.argv[2] === '--link') {
  // fight() reads the shared defs object; apply the official balance and the probe patch to it in place.
  applyOfficialBalance(betaDefs, Infinity); applyOfficialBalance(betaDefs, Infinity, patch);
  const [a, b] = process.argv.slice(3), tally = { w: 0, l: 0, d: 0 }, byMap = {};
  for (const seed of SEEDS) for (const aimError of AIMS) for (const layout of maps) for (const mirror of [-1, 1]) {
    const r = fight(a, b, layout, mirror, { seed, aimError }), k = r === 'win' ? 'w' : r === 'loss' ? 'l' : 'd';
    tally[k]++; (byMap[layout.id] ??= { w: 0, l: 0, d: 0 })[k]++;
  }
  process.stdout.write(JSON.stringify({ a, b, ...tally, byMap }));
} else {
  const links = JSON.parse(process.env.LINKS ?? 'null') ?? OFFICIAL_RING.map((a, i) => [a, OFFICIAL_RING[(i + 1) % OFFICIAL_RING.length]]);
  const self = fileURLToPath(import.meta.url);
  const results = await Promise.all(links.map(([a, b]) => new Promise((resolve, reject) => {
    const p = spawn(process.execPath, [self, '--link', a, b], { env: process.env }); let out = '', err = '';
    p.stdout.on('data', d => out += d); p.stderr.on('data', d => err += d);
    p.on('close', code => code ? reject(new Error(err)) : resolve(JSON.parse(out)));
  })));
  for (const r of results) console.log(`${r.a}>${r.b} ${r.w}-${r.l}${r.d ? '-' + r.d : ''}  [${Object.entries(r.byMap).map(([m, s]) => `${m} ${s.w}-${s.l}-${s.d}`).join(' | ')}]${r.l || r.d ? '' : ' ✔'}`);
  console.log(`perfect ${results.filter(r => !r.l && !r.d).length}/${results.length}`);
}
