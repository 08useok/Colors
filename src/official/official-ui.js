// Official Season 1 screens: battle pass, gem shop (with daily gems and exchanges), ranked, and the power
// block on character cards. The page passes its save, modal and match starter; this file owns no game state.
import * as P from './progression.js?v=2';

const num = v => Number(v || 0).toLocaleString('ko-KR');
const rewardText = r => r.label ?? [r.coins ? `코인 ${num(r.coins)}` : '', r.credits ? `크레딧 ${num(r.credits)}` : '', r.gems ? `💎 ${num(r.gems)}` : ''].filter(Boolean).join(' + ');
const MODE_LABEL = { gemGrab: '젬 그랩', knockout: '녹아웃', hotZone: '핫 존' };

export function createOfficialUi({ state, save, title, content, toast, characters, startRanked, onChange = () => {} }) {
  const official = () => state.official;
  const name = id => characters.find(c => c.id === id)?.name ?? id;
  let current = null, rankedPick = null;
  const rerender = () => { onChange(); current?.(); };

  // ── Character card: power line + upgrade button ────────────────────────
  function powerHtml(id) {
    const power = P.powerOf(official(), id), cost = P.nextPowerCost(official(), id);
    const unlocks = [`가젯 ${power >= P.GADGET_POWER ? '해금' : `파워 ${P.GADGET_POWER}에 해금`}`, `변신 ${power >= P.TRANSFORM_POWER ? '해금' : `파워 ${P.TRANSFORM_POWER}에 해금`}`].join(' · ');
    return `<p class="official-power"><strong>⚡ 파워 ${power} / ${P.POWER_MAX}</strong> · 체력·피해 +${Math.round((P.powerMultiplier(power) - 1) * 100)}%<br><small>${unlocks}</small></p>`
      + (state.ownedCharacters.includes(id) ? `<button data-official-upgrade="${id}" ${cost == null ? 'disabled' : ''}>${cost == null ? '최대 파워' : `파워 업 · 코인 ${num(cost)}`}</button>` : '');
  }
  function upgrade(id) {
    const result = P.upgradePower(state, id);
    if (!result.ok) return toast(result.reason === 'coins' ? `코인이 부족합니다 (필요 ${num(result.cost)}).` : '이미 최대 파워입니다.');
    save(); toast(`${name(id)} 파워 ${result.power} 달성!${result.power === P.GADGET_POWER ? ' 가젯 해금' : result.power === P.TRANSFORM_POWER ? ' 변신 해금' : ''}`);
    onChange();
  }

  // ── Battle pass ─────────────────────────────────────────────────────────
  function renderBattlePass() {
    current = renderBattlePass;
    const o = official(), tier = P.passTier(o), xpInTier = (o.pass.xp % P.PASS_XP_PER_TIER), max = tier >= P.PASS_TIERS;
    title.textContent = '🎄 배틀 패스 · 정식 시즌 1';
    content.innerHTML = `<section class="official-pass-head"><p><strong>${tier}단계</strong> / ${P.PASS_TIERS} · ${max ? '최대 단계' : `다음 단계까지 ${xpInTier} / ${P.PASS_XP_PER_TIER} XP`}</p>
      <p>판마다 경험치: 승리 40 · 무승부 25 · 패배 20 (중도 이탈 0)</p>
      <p>💎 보유 ${num(o.gems)} · ${o.pass.premium ? '<strong>프리미엄 패스 보유</strong>' : `<button data-official-premium>프리미엄 패스 구매 · 💎 ${P.PASS_PREMIUM_COST}</button>`}</p></section>
      <div class="official-pass-grid">${P.PASS_REWARDS.map(r => {
        const reached = r.tier <= tier;
        const cell = track => {
          const claimed = o.pass.claimed[track].includes(r.tier), locked = !reached || (track === 'premium' && !o.pass.premium);
          return `<div class="official-pass-cell ${track}${claimed ? ' claimed' : ''}"><small>${track === 'free' ? '무료' : '프리미엄'}</small><span>${rewardText(r[track])}</span><button data-official-claim="${r.tier}" data-track="${track}" ${claimed || locked ? 'disabled' : ''}>${claimed ? '받음' : locked ? '잠김' : '받기'}</button></div>`;
        };
        return `<article class="official-pass-tier${reached ? ' reached' : ''}"><b>${r.tier}</b>${cell('free')}${cell('premium')}</article>`;
      }).join('')}</div>${o.pendingRewards.length ? `<p>지급 대기: ${o.pendingRewards.length}개 (스킨·신규 캐릭터는 출시되면 지급됩니다)</p>` : ''}`;
  }
  function claim(tier, track) {
    const result = P.claimPassReward(state, tier, track);
    if (!result.ok) return toast({ locked: '아직 도달하지 않은 단계입니다.', premium: '프리미엄 패스가 필요합니다.', claimed: '이미 받았습니다.' }[result.reason] ?? '받을 수 없습니다.');
    save(); toast(`${tier}단계 보상: ${rewardText(result.reward)}`); rerender();
  }
  function buyPremium() {
    const result = P.buyPremiumPass(official());
    if (!result.ok) return toast(result.reason === 'gems' ? `보석이 부족합니다 (💎 ${P.PASS_PREMIUM_COST} 필요).` : '이미 보유 중입니다.');
    save(); toast('프리미엄 패스를 구매했습니다!'); rerender();
  }

  // ── Gem shop ────────────────────────────────────────────────────────────
  function renderGemShop() {
    current = renderGemShop;
    const o = official(), ready = P.dailyGemsReady(o);
    title.textContent = '💎 보석 상점';
    content.innerHTML = `<section><p>💎 보유 <strong>${num(o.gems)}</strong> · 코인 ${num(state.coins)} · 크레딧 ${num(state.credits)}</p>
      <p><button data-official-daily ${ready ? '' : 'disabled'}>${ready ? `오늘의 보석 받기 · 💎 ${P.DAILY_GEMS}` : '오늘의 보석 받음 (내일 다시)'}</button></p></section>
      <h3>보석 교환</h3><div class="beta-grid">${P.GEM_EXCHANGES.map(e => `<article class="beta-card"><h3>${e.coins ? `코인 ${num(e.coins)}` : `크레딧 ${num(e.credits)}`}</h3><button data-official-exchange="${e.id}" ${o.gems < e.gems ? 'disabled' : ''}>💎 ${e.gems}로 교환</button></article>`).join('')}</div>
      <h3>보석 패키지</h3><p>결제 기능은 아직 준비 중입니다. 가격은 결제를 붙일 때 확정됩니다.</p>
      <div class="beta-grid">${P.GEM_PACKAGES.map(g => `<article class="beta-card"><h3>💎 ${num(g)}</h3><button disabled>결제 준비 중</button></article>`).join('')}</div>`;
  }
  function daily() { const got = P.claimDailyGems(official()); if (!got) return toast('오늘은 이미 받았습니다.'); save(); toast(`보석 ${got}개를 받았습니다.`); rerender(); }
  function exchange(id) {
    const result = P.exchangeGems(state, id);
    if (!result.ok) return toast('보석이 부족합니다.');
    save(); toast(`교환 완료: ${result.exchange.coins ? `코인 ${num(result.exchange.coins)}` : `크레딧 ${num(result.exchange.credits)}`}`); rerender();
  }

  // ── Ranked ──────────────────────────────────────────────────────────────
  function renderRanked(selected = state.selectedCharacter) {
    current = () => renderRanked(selected); rankedPick = selected;
    const r = official().ranked, rank = P.rankOf(r.points), next = P.RANKS[P.RANKS.indexOf(rank) + 1];
    const eligible = state.ownedCharacters.filter(id => P.rankedEligible(state, id));
    const ok = P.rankedEligible(state, selected);
    title.textContent = '🏅 경쟁전 · 시즌 ' + P.RANKED_SEASON;
    content.innerHTML = `<section><p><strong>${rank.name}</strong> · ${num(r.points)}점${next ? ` (다음 ${next.name}까지 ${num(next.min - r.points)}점)` : ''} · 최고 ${num(r.best)}점</p>
      <p>${r.wins}승 ${r.losses}패 ${r.draws}무 · 승리 +${P.RANKED_WIN} · 패배 -${P.RANKED_LOSS} · 시즌마다 초기화</p>
      <p><strong>파워 11 캐릭터만</strong> 출전할 수 있습니다. 모두 파워 11(가젯·변신 해금)로 겨룹니다.</p>
      <p>같은 모드를 고른, 점수가 비슷한 플레이어와 매칭합니다(처음 ±150점, 기다릴수록 넓어짐). 20초 안에 6명이 모이지 않으면 빈자리는 봇이 채웁니다.</p></section>
      <h3>출전 캐릭터 (현재: ${name(selected)} ${ok ? '✅' : '— 파워 11 아님'})</h3>
      <p>${eligible.length ? eligible.map(id => `<button data-official-ranked-pick="${id}" ${id === selected ? 'disabled' : ''}>${name(id)}</button>`).join(' ') : '파워 11 캐릭터가 없습니다. 캐릭터 화면에서 파워를 올려 주세요.'}</p>
      <h3>모드</h3><p>${P.RANKED_MODES.map(m => `<button data-official-ranked-start="${m}" ${ok ? '' : 'disabled'}>${MODE_LABEL[m]} 매칭 시작</button>`).join(' ')}</p>`;
  }

  content.addEventListener('click', event => {
    const b = event.target.closest('button'); if (!b || !content.contains(b)) return;
    if (b.dataset.officialUpgrade) upgrade(b.dataset.officialUpgrade);
    else if (b.dataset.officialClaim) claim(Number(b.dataset.officialClaim), b.dataset.track);
    else if (b.hasAttribute('data-official-premium')) buyPremium();
    else if (b.hasAttribute('data-official-daily')) daily();
    else if (b.dataset.officialExchange) exchange(b.dataset.officialExchange);
    else if (b.dataset.officialRankedPick) renderRanked(b.dataset.officialRankedPick);
    else if (b.dataset.officialRankedStart) {
      const id = rankedPick || state.selectedCharacter;
      if (!P.rankedEligible(state, id)) return toast('파워 11 캐릭터만 경쟁전에 나갈 수 있습니다.');
      startRanked(b.dataset.officialRankedStart, id);
    }
  });

  return {
    powerHtml, renderBattlePass, renderGemShop, renderRanked,
    stopRendering() { current = null; },
    // Called by the page when a match ends: battle pass XP, and rank points for ranked matches.
    matchEnded({ won, draw, abandoned, ranked }) {
      const xp = P.passXpForMatch({ won, draw, abandoned });
      const before = P.passTier(official()), after = P.addPassXp(official(), xp);
      const rankedResult = ranked ? P.recordRanked(official(), { won, draw, abandoned }) : null;
      save();
      const parts = [xp ? `패스 +${xp} XP${after > before ? ` (${after}단계!)` : ''}` : ''];
      if (rankedResult) parts.push(`경쟁전 ${rankedResult.delta >= 0 ? '+' : ''}${rankedResult.delta}점 · ${rankedResult.rank.name}${rankedResult.promoted ? ' 승급!' : ''}`);
      return parts.filter(Boolean).join(' · ');
    },
  };
}
