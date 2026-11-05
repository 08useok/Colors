# Blue burst-path movement - beta0.8.63 (2026-10-27)

Final beta8 change: Blue botAvoidBurstProjectiles=true. Shared engine predicts visible hostile bomb/juice trajectories and bomb maximum-range split directions over0.9seconds. It chooses among16 walking directions that stay inside bounds and avoid walls, maximizing closest separation. Reacts only when current motion passes within0.3tiles of the collision margin. Ally projectiles and wall-occluded sources excluded. Manual controls and disabled prior-season flag remain unchanged. Target actor identity is not checked.

This is deterministic tactical walking, comparable to ground-field avoidance, not an additional random dodge roll. The existing50percent common projectile-dodge probability, its cooldown and existing speed remain unchanged. The planner can still cause a bot to avoid a burst when that separate random dodge roll failed. It grants no invulnerability, damage reduction or speed. Existing landing-field avoidance retains priority.

No combat stat changes: Blue HP5200, damage1080, movement1, interval.3, ammo3, reload.5, range20, hitbox multiplier1.1, basic knockback0, ultimate70percent reduction, five-hit charging and prior mechanics retained. Orange stats also unchanged.

Cause: baseline222W18L, all losses start6tiles.8deaths to bomb/direct burst and10to juice. No ultimate cast:14losses at1/2.5charge,3at.5/2.5 and1at1.5/2.5. Direct bomb750+4x1170 and clustered5juice can exceed Blue's full health. Moving away along the incoming line does not escape these blasts. Stat buffs that achieved target240/240 reversed Crimson->Blue down to5/240 and were rejected. Orange juice nerfs weakened Orange->Mint and were rejected. Trajectory-only movement reached237/240; predicting the split fixed the original3.0.65second horizon still had1failure in an extra seed set;0.9second horizon clears all checked sets.

Verification: level6,120x120,bounds59, starts6/10/14/20/28/36, errors.035/.1,10seeds,both creation orders, synthetic shrinking zone30-45s.
- Blue->Orange222/18 ->240/0 standard.
- Additional seed bases314159265,271828182,161803398,42424242: each240/0. Standard+additional1200/0.
- Crimson->Blue240/0 retained.
- Orange->Mint234/6 unchanged; this edge remains imperfect.
- Ego isolated actual browser combat worlds240/0, each distance40wins; space14finished. This is not rendered full-match play verification.
-23syntax modules and29feature suites passed. New suite verifies changed tactical movement, renamed enemy identity, wall occlusion, manual/frozen exclusions, movement capped at normal8tiles/sec and unchanged stats/50percent random dodge.
- Full32640 matrix not rerun; sampled results do not guarantee all-map/all-seed wins. No commit/push.

Evidence: beta8-blue-orange-losses.json, beta8-blue-final-candidates.json, beta8-orange-juice-candidates.json, beta8-blue-burst-verification.json, beta8-blue-burst-browser.json, beta8-blue-orange-240.json. Other candidate artifacts are diagnostic-only; no rejected stat buffs were applied.
