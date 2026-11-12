// Greedy search for official balance numbers that make every official ring link win all 48 duels.
// A 1v1 link only depends on its two characters, so a change to X is judged on prev→X and X→next only.
// Cost = losses + draws/2 summed over the ring. Values stay within ±40% of the beta numbers.
// Usage: node tools/tune-official-ring.mjs [minutes]   → writes specs/official-ring-tuning-20261112.json (best patch + log)
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { defs as betaDefs } from './simulate-gadgets-three-maps.mjs';
import { OFFICIAL_RING, OFFICIAL_BALANCE } from '../src/official/official-balance.js';

const minutes = Number(process.argv[2] ?? 60), deadline = Date.now() + minutes * 60000;
const probe = fileURLToPath(new URL('./probe-official-ring.mjs', import.meta.url));
const OUT = new URL('../specs/official-ring-tuning-20261112.json', import.meta.url);
const ring = OFFICIAL_RING, n = ring.length, links = ring.map((a, i) => [a, ring[(i + 1) % n]]);
const base = id => betaDefs[id];
const LIMIT = .4, RANGE_LIMIT = .25; // ranges change the feel most, so they move less
const limitOf = k => /Range$/.test(k) ? RANGE_LIMIT : LIMIT;

const runLink = (a, b, patch) => new Promise((resolve, reject) => {
  const p = spawn(process.execPath, [probe, '--link', a, b], { env: { ...process.env, PATCH: JSON.stringify(patch) } }); let out = '', err = '';
  p.stdout.on('data', d => out += d); p.stderr.on('data', d => err += d);
  p.on('close', code => code ? reject(new Error(err.slice(0, 500))) : resolve(JSON.parse(out)));
});
const cost = r => r.l + r.d / 2;
async function pool(jobs, size = 15) { const out = []; let i = 0; await Promise.all(Array.from({ length: size }, async () => { while (i < jobs.length) { const k = i++; out[k] = await jobs[k](); } })); return out; }

// Tunable numeric fields per character (top level only): health, damage, reload, speed, range.
const BOT_ONLY = /Perception|Dodge|^bot|approach/;
const fields = id => Object.entries(base(id)).filter(([k, v]) => typeof v === 'number' && v > 0 && !BOT_ONLY.test(k) &&
  (k === 'maxHealth' || k === 'reloadDuration' || k === 'moveSpeedMultiplier' || /Damage$/.test(k) || /Range$/.test(k))).map(([k]) => k);
const better = k => k === 'reloadDuration' ? -1 : 1; // multiplying by >1 is a buff except for reload time
const value = (patch, id, k) => patch[id]?.[k] ?? base(id)[k];
function withChange(patch, id, k, factor) {
  const b = base(id)[k], v = value(patch, id, k) * factor, lim = limitOf(k);
  if (v > b * (1 + lim) + 1e-9 || v < b * (1 - lim) - 1e-9) return null;
  const rounded = k === 'moveSpeedMultiplier' || k === 'reloadDuration' || /Range$/.test(k) ? Math.round(v * 100) / 100 : Math.round(v / 10) * 10;
  return { ...patch, [id]: { ...(patch[id] ?? {}), [k]: rounded } };
}

// Resume from the saved best patch (if any), dropping bot-only fields and clamping values into the limits.
let patch = structuredClone(OFFICIAL_BALANCE);
if (process.env.RESUME !== '0' && fs.existsSync(OUT)) {
  const saved = JSON.parse(fs.readFileSync(OUT, 'utf8')).patch ?? {};
  for (const [id, vals] of Object.entries(saved)) for (const [k, v] of Object.entries(vals)) {
    if (BOT_ONLY.test(k) || typeof v !== 'number') continue;
    const b = base(id)[k], lim = limitOf(k), c = Math.min(b * (1 + lim), Math.max(b * (1 - lim), v));
    (patch[id] ??= {})[k] = /Range$/.test(k) || k === 'moveSpeedMultiplier' || k === 'reloadDuration' ? Math.round(c * 100) / 100 : Math.round(c / 10) * 10;
  }
}
let results = await pool(links.map(([a, b]) => () => runLink(a, b, patch)));
const log = [];
const total = () => results.reduce((s, r) => s + cost(r), 0);
const save = () => fs.writeFileSync(OUT, JSON.stringify({ date: '2026-11-12', ring, cost: total(), perfect: results.filter(r => !cost(r)).length, patch, results, log }, null, 1) + '\n');
console.log('start cost', total(), 'perfect', results.filter(r => !cost(r)).length); save();
const tried = new Set();
while (Date.now() < deadline && total() > 0) {
  // Worst link first; candidates: buff its source (attack side) or nerf its target.
  const order = results.map((r, i) => [i, cost(r)]).filter(([, c]) => c > 0).sort((x, y) => y[1] - x[1]);
  let accepted = false;
  for (const [li] of order) {
    const [src, tgt] = links[li], cands = [];
    for (const [id, sign] of [[src, 1], [tgt, -1]]) for (const k of fields(id)) for (const step of [1.1, 1.2]) {
      const f = sign * better(k) > 0 ? step : 1 / step, next = withChange(patch, id, k, f);
      const key = JSON.stringify([id, k, next?.[id]?.[k]]);
      if (next && !tried.has(key + JSON.stringify(patch))) cands.push({ id, k, f, next, key });
    }
    if (!cands.length) continue;
    // Evaluate each candidate on the two links that involve the changed character.
    const evals = await pool(cands.map(c => async () => {
      const i = ring.indexOf(c.id), ins = (i + n - 1) % n, outs = i;
      const [r1, r2] = await Promise.all([runLink(...links[ins], c.next), runLink(...links[outs], c.next)]);
      return { c, ins, outs, r1, r2, delta: cost(r1) + cost(r2) - cost(results[ins]) - cost(results[outs]) };
    }));
    for (const e of evals) tried.add(e.c.key + JSON.stringify(patch));
    const best = evals.filter(e => e.delta < 0).sort((x, y) => x.delta - y.delta)[0];
    if (best) {
      patch = best.c.next; results[best.ins] = best.r1; results[best.outs] = best.r2; accepted = true;
      log.push({ id: best.c.id, key: best.c.k, value: patch[best.c.id][best.c.k], delta: best.delta, cost: total() });
      console.log(`${best.c.id}.${best.c.k} → ${patch[best.c.id][best.c.k]}  Δ${best.delta}  cost ${total()}  perfect ${results.filter(r => !cost(r)).length}`);
      save(); break;
    }
    if (Date.now() >= deadline) break;
  }
  if (!accepted) { console.log('no improving single change left'); break; }
}
save();
console.log('final cost', total(), 'perfect', results.filter(r => !cost(r)).length, '/', n);
