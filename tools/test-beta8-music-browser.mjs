import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync, existsSync, createReadStream, statSync, writeFileSync} from 'node:fs';
import {resolve, extname, sep} from 'node:path';
import {chromium} from 'file:///C:/Users/useok/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const root = resolve('.'), errors = [], report = [];
const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = resolve(root, '.' + path);
  if (!file.startsWith(root + sep) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404).end(); return;
  }
  res.setHeader('Content-Type', ({'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png', '.mp3':'audio/mpeg'})[extname(file)] ?? 'application/octet-stream');
  if (path === '/src/beta-season.js') {
    res.end(readFileSync(file, 'utf8') + '\nwindow.__musicQA={lobby:betaSeasonBgm, fallback:betaBattleBgm, oldGem:gemGrabBgm, tracks:beta8MatchBgm, active:()=>activeBetaBgm, startGoldRush, endGoldRush};');
  } else {
    res.setHeader('Content-Length', statSync(file).size);
    createReadStream(file).pipe(res);
  }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
let browser;
try {
  browser = await chromium.launch({channel:'msedge', headless:true, args:['--disable-gpu']});
  const page = await browser.newPage();
  page.on('pageerror', error => errors.push(error.message));
  const base = 'http://127.0.0.1:' + server.address().port;
  const load = async (query = '') => {
    await page.goto(base + '/beta-season.html' + query, {waitUntil:'domcontentloaded'});
    await page.waitForFunction(() => window.__musicQA, null, {timeout:90000});
  };
  const capture = async (label, mode, expected) => {
    await page.waitForFunction(mode => {
      const q = __musicQA, track = mode ? q.tracks[mode] : q.lobby;
      return q.active() === track && !track.paused && track.currentTime > .1 && Number.isFinite(track.duration);
    }, mode, {timeout:30000});
    const result = await page.evaluate(({label, mode}) => {
      const q = __musicQA, track = mode ? q.tracks[mode] : q.lobby;
      return {label, source:new URL(track.src).pathname, duration:track.duration, loop:track.loop, volume:track.volume,
        playing:[q.lobby, q.fallback, q.oldGem, ...Object.values(q.tracks)].filter(t => t && !t.paused).length};
    }, {label, mode});
    assert.equal(result.source, '/assets/' + expected + '.mp3');
    assert.equal(result.playing, 1);
    assert.equal(result.loop, true);
    assert.equal(result.volume, .45);
    report.push(result);
    console.log('PASS music:', label);
  };
  await load();
  await page.keyboard.press('Shift');
  await capture('lobby', null, 'beta8-midnight-at-the-manor-gates');
  const cases = [
    ['knockout', 'beta8-the-midnight-gambit'],
    ['soccer', 'beta8-trick-or-goal'],
    ['gemGrab', 'beta8-the-midnight-gem-heist'],
    ['showdown', 'beta8-graveyard-gambit'],
    ['goldRush', 'beta8-vault-of-the-greedy-phantom'],
    ['chopWood', 'beta8-the-crooked-grove'],
  ];
  for (const [mode, filename] of cases) {
    await page.evaluate(mode => __musicQA.startGoldRush(mode), mode);
    await capture(mode, mode, filename);
    await page.evaluate(() => __musicQA.endGoldRush('QA', false, null, true));
    await capture(mode + ' return', null, 'beta8-midnight-at-the-manor-gates');
  }
  await page.evaluate(() => __musicQA.startGoldRush('showdown', true));
  await capture('showdown+', 'showdown', 'beta8-graveyard-gambit');
  // Direct transitions must also stop the previous mode's track.
  await page.evaluate(() => __musicQA.startGoldRush('soccer'));
  await capture('showdown+ to soccer', 'soccer', 'beta8-trick-or-goal');
  await page.evaluate(() => __musicQA.endGoldRush('QA', false, null, true));
  for (const season of ['beta5', 'beta6', 'beta7']) {
    await load('?test=' + season);
    assert.equal(await page.evaluate(() => Object.keys(__musicQA.tracks).length), 0);
    if (season === 'beta7') {
      await page.keyboard.press('Shift');
      await page.evaluate(() => __musicQA.startGoldRush('gemGrab'));
      await page.waitForFunction(() => __musicQA.active() === __musicQA.oldGem && !__musicQA.oldGem.paused && __musicQA.oldGem.currentTime > .1);
      assert((await page.evaluate(() => __musicQA.active().src)).includes('beta7-before-the-vault-closes'));
    }
  }
  assert.deepEqual(errors, []);
  writeFileSync('specs/beta8-music-verification.json', JSON.stringify({date:'2026-10-15', report, previousSeasonsUnchanged:true, pageErrors:errors}, null, 2) + '\n');
} finally {
  if (browser) await browser.close();
  server.closeAllConnections();
  await new Promise(done => server.close(done));
}
