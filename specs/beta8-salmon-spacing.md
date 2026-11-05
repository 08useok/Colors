# Salmon spacing and throw aim - beta0.8.61 (2026-10-27)

Final change, beta8 overlay only:
- botAimLeadFactor .65 default -> .6.
- attackPerceptionMinRange7, attackPerceptionRange=attackRange8.5.
- HP7600, direct2400+splash600+landing600, impactRadius1.75, ammo5, cooldown2, movement speed, ultimate damage and low-health retreat remain unchanged. Manual throw aiming stays exact. No enemy-ID checks.

Baseline Salmon->Gold238W2L. Both failures start14/aimError.1, seed indices0,6, normal creation order. No Salmon ultimate: charge8/20 and4/20 at defeat. Early throws miss, floats are recovered, then low-health retreat opens a16-tile gap until the map boundary. Gold finishes via ordinary projectile attacks; one case leaves Gold198HP. Removing retreat worsens results to6W234L, so rejected. Aim-only .6 clears original failures but fails8 across3 new-seed sets. Larger landing radii do not reliably solve those failures and were rejected. The7-8.5tile band avoids early close-range damage while retaining retreat and manual behavior.

Verification: level6,120x120,bounds59, starts6/10/14/20/28/36, aim.035/.1,10seeds and both creation orders. Shrinking zone30-45s, max45s.
- Standard Salmon->Gold240W0L.
- New seed bases314159265,271828182,161803398 and42424242: each240W0L. Standard+additional total1200W0L. Last seed set was not used to select candidates.
- Ivory->Salmon240W0L and Gold->Green240W0L retained.
- Ego isolated actual browser combat worlds240W0L, each distance40W; space12 finished. This is not rendered full-match play verification.
- Syntax23 modules and feature27 suites pass, including manual aim, cloned enemy identity, actual spacing movement, objective navigation, source isolation and preserved combat stats.
- Full32640 matrix not rerun; sampled wins are not an all-map/all-seed guarantee. No commit/push.

Evidence: beta8-salmon-gold-losses.json, beta8-salmon-aim-candidates.json, beta8-salmon-aim-fine-candidates.json, beta8-salmon-radius-candidates.json, beta8-salmon-spacing-candidates.json, beta8-salmon-aim-verification.json, beta8-salmon-spacing-browser.json, beta8-salmon-gold-240.json.
