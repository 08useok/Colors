// QA: two real browsers play one Official Season 1 ranked match (경쟁전) through the local Worker.
// Starts headless Chrome with two separate profiles (separate saves), queues both for the same mode,
// checks that they land in one match (host + guest, bots fill after the timeout), that the guest's HUD
// mirrors the host's, and that both end with the same result and opposite/matching rank changes.
// Needs: the page served (default http://localhost:3456/official.html) and `npm run dev` (port 8787).
// Run: node tools/qa-ranked-two-browsers.mjs [mode=hotZone] [pageUrl]
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import WebSocket from 'ws';

const mode = process.argv[2] ?? 'hotZone';
const pageUrl = process.argv[3] ?? 'http://localhost:3456/official.html';
const outDir = process.env.QA_OUT ?? mkdtempSync(join(tmpdir(), 'colors-ranked-qa-'));
const chromePath = [process.env.CHROME, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome'].find(p => p && existsSync(p));
if (!chromePath) { console.log('qa ranked: skipped (no Chrome/Edge found)'); process.exit(0); }
const port = 9333;
const chrome = spawn(chromePath, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'colors-chrome-'))}`,
  '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--mute-audio', '--autoplay-policy=no-user-gesture-required', '--window-size=1280,800', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let version;
for (let i = 0; i < 50 && !version; i++) { try { version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); } catch { await sleep(200); } }
const ws = new WebSocket(version.webSocketDebuggerUrl);
await new Promise(r => ws.on('open', r));
let id = 0; const pending = new Map(), listeners = [];
ws.on('message', raw => { const msg = JSON.parse(raw); if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); } else for (const l of listeners) l(msg); });
const cdp = (method, params = {}, sessionId) => new Promise((resolve, reject) => { const n = ++id; pending.set(n, m => m.error ? reject(new Error(`${method}: ${m.error.message}`)) : resolve(m.result)); ws.send(JSON.stringify({ id: n, method, params, sessionId })); });

async function openPlayer(name) {
  const { browserContextId } = await cdp('Target.createBrowserContext');
  const { targetId } = await cdp('Target.createTarget', { url: 'about:blank', browserContextId });
  const { sessionId } = await cdp('Target.attachToTarget', { targetId, flatten: true });
  const errors = [];
  listeners.push(msg => {
    if (msg.sessionId !== sessionId) return;
    if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text);
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') errors.push(msg.params.args.map(a => a.value ?? a.description).join(' '));
  });
  await cdp('Runtime.enable', {}, sessionId); await cdp('Page.enable', {}, sessionId);
  const evaluate = async expression => { const r = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, sessionId); if (r.exceptionDetails) throw new Error(`${name}: ${r.exceptionDetails.exception?.description ?? r.exceptionDetails.text}`); return r.result.value; };
  return { name, sessionId, errors, evaluate, go: url => cdp('Page.navigate', { url }, sessionId),
    shot: async file => { const { data } = await cdp('Page.captureScreenshot', { format: 'png' }, sessionId); writeFileSync(join(outDir, file), Buffer.from(data, 'base64')); } };
}
const waitFor = async (player, expression, timeout = 60000) => { const end = Date.now() + timeout; while (Date.now() < end) { const v = await player.evaluate(expression).catch(() => null); if (v) return v; await sleep(500); } throw new Error(`${player.name}: timed out waiting for ${expression}`); };
const ready = "document.getElementById('beta-toast') && typeof document.querySelector('[data-panel=\"ranked\"]')?.click === 'function' && !document.documentElement.classList.contains('beta6-loading') ? true : null";
async function prepare(player, character, points) {
  await player.go(pageUrl);
  await waitFor(player, "localStorage.getItem('colorsOfficialSeason1') ? true : null");
  await player.evaluate(`(() => { const s = JSON.parse(localStorage.getItem('colorsOfficialSeason1')); s.selectedCharacter = '${character}'; if (!s.ownedCharacters.includes('${character}')) s.ownedCharacters.push('${character}');
    s.official.power['${character}'] = 11; s.official.ranked.points = ${points}; localStorage.setItem('colorsOfficialSeason1', JSON.stringify(s)); return true; })()`);
  await player.go(pageUrl);
  await waitFor(player, ready, 90000);
  await sleep(1500);
}
const hud = "({ role: canvas.dataset.rankedRole || '', queue: canvas.dataset.rankedQueue || '', box: document.getElementById('official-ranked-queue')?.textContent || '', mode: canvas.dataset.betaMode || '', rivals: document.getElementById('gold-rush-rivals')?.textContent || '', timer: document.getElementById('gold-rush-timer')?.textContent || '', toast: document.getElementById('beta-toast')?.textContent || '', points: JSON.parse(localStorage.getItem('colorsOfficialSeason1')).official.ranked })";
const canvasExpr = "document.querySelector('canvas')";

let ok = true;
const fail = message => { ok = false; console.log('FAIL', message); };
try {
  const A = await openPlayer('A'), B = await openPlayer('B');
  await Promise.all([prepare(A, 'red', 820), prepare(B, 'blue', 760)]);
  for (const p of [A, B]) await p.evaluate(`window.canvas = ${canvasExpr}; true`);
  const before = { A: (await A.evaluate(hud)).points, B: (await B.evaluate(hud)).points };
  const queueIn = p => p.evaluate(`(() => { document.querySelector('[data-panel="ranked"]').click(); const b = document.querySelector('[data-official-ranked-start="${mode}"]'); if (!b || b.disabled) return 'no-button'; b.click(); return 'queued'; })()`);
  console.log('queue', await queueIn(A), await queueIn(B));
  const t0 = Date.now();
  await sleep(3000);
  const waiting = await A.evaluate(hud);
  console.log('A waiting:', waiting.box);
  if (!waiting.box.includes('찾은 인원 2/6')) fail('A should see 2 compatible players in the queue');
  const roleA = await waitFor(A, "canvas.dataset.rankedRole || null", 40000), roleB = await waitFor(B, "canvas.dataset.rankedRole || null", 10000);
  console.log(`matched after ${((Date.now() - t0) / 1000).toFixed(1)} s: A=${roleA}, B=${roleB}`);
  if (roleA !== 'host' || roleB !== 'guest') fail('A (820) should host, B (760) should be the guest');
  const host = roleA === 'host' ? A : B, guest = host === A ? B : A;
  // Let the match run; compare HUDs (the guest sees the score turned around) and take screenshots.
  for (let i = 0; i < 6; i++) {
    await sleep(5000);
    const [h, g] = await Promise.all([host.evaluate(hud), guest.evaluate(hud)]);
    console.log(`t+${(i + 1) * 5}s host: ${h.rivals} ${h.timer} | guest: ${g.rivals} ${g.timer}`);
    if (i === 1) { await host.shot('host.png'); await guest.shot('guest.png'); }
  }
  // Wait for the end (hot zone ≤ 2 min, knockout/gem grab ≤ 3+ min).
  await waitFor(host, "canvas.dataset.rankedRole ? null : true", 300000);
  await waitFor(guest, "canvas.dataset.rankedRole ? null : true", 20000);
  await sleep(2500);
  const [h, g] = await Promise.all([host.evaluate(hud), guest.evaluate(hud)]);
  const after = { [host.name]: h.points, [guest.name]: g.points };
  const delta = n => after[n].points - before[n].points;
  const outcome = n => after[n].wins > before[n].wins ? 'win' : after[n].losses > before[n].losses ? 'loss' : after[n].draws > before[n].draws ? 'draw' : 'none';
  console.log(`host ${host.name}: ${outcome(host.name)} ${delta(host.name)} · guest ${guest.name}: ${outcome(guest.name)} ${delta(guest.name)}`);
  const pair = `${outcome(host.name)}/${outcome(guest.name)}`;
  if (!['win/loss', 'loss/win', 'draw/draw'].includes(pair)) fail(`host and guest (opposite teams) should have mirrored results, got ${pair}`);
  for (const p of [A, B]) if (p.errors.length) { console.log(`${p.name} errors:`, p.errors.slice(0, 5)); fail(`${p.name} had page errors`); }
  console.log('screenshots:', outDir);
} catch (error) { fail(error.stack ?? error.message); }
finally { ws.close(); chrome.kill(); }
console.log(ok ? 'qa ranked two browsers: ok' : 'qa ranked two browsers: FAILED');
process.exit(ok ? 0 : 1);
