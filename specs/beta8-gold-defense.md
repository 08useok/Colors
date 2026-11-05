# Gold vs Green - beta 0.8.60 (2026-10-27)

Final change: Gold projectileDamageReduction 1200 -> 1650. Existing AI, HP7380, stage damage1300/600/300, ultimate tick138 and prior seasons retained. This is a generic projectile defense buff, with no opponent-ID bonus.

Cause: close-range Green boomerangs bypassed the old flat defense with enough residual damage to kill Gold. Moving to a5-8 tile band plus predictive aim improved the standard set to221/240; defense1500 plus that AI reached240/240 but weakened Salmon->Gold from238/2 to195/45 and failed3 new-seed games. That movement candidate was rejected. Existing AI with defense1600 reached240/240 standard but239/240 new seed;1650 passed both sampled sets. Values are sampled candidates, not a proof of a global minimum or all-seed wins.

Profile: level6,120x120 bounds59, starts6/10/14/20/28/36, aim errors.035/.1,10seeds and reversed creation order,240 games per set. Shrinking synthetic zone30-45s. No rendered full match play-through was performed.

Final Node verification:
- Gold->Green:163W74L3D ->240W0L0D.
- New seed base314159265:240W0L0D.
- Salmon->Gold:238W2L unchanged; this edge still has2 failures.
- Purple->Crystal and Yellow->Ivory:240W0L each retained.
- Ego isolated browser combat worlds:240W0L, all6 distances40W each. Space11 finished. First assertion incorrectly expected defense scaling; flat defense does not scale with level, expectation corrected and same space resumed.
- Syntax23 modules and feature26 suites; see beta8-maintenance-verification.json.

Evidence: beta8-gold-verification.json, beta8-gold-defense-browser.json, beta8-gold-green-240.json. Candidate evidence: beta8-gold-band-candidates.json, beta8-gold-defense-candidates.json, beta8-gold-defense-only.json. Full32640 matrix has not been rerun after this change. No commit/push.
