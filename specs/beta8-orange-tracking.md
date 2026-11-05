# Orange release tracking and control-path walking - beta0.8.64 (2026-10-27)

Final beta8 AI changes:
- Orange botTrackTargetDuringWindup=true. At actual release it recalculates aim using the current living, non-hidden target and projectile speed. The original random aim error is retained; no reroll, extra ammo or damage. Explicit manual angle and non-automatic attacks retain their original aim. botAimLeadFactor=1.
- Orange botAvoidControlProjectiles=true. Mint ice projectiles carry generic control:'ice' metadata. The existing geometric path planner can recognize that metadata without checking opponent actor ID, use0.9seconds of visible trajectory information, and walk at normal speed. Wall-occluded projectiles excluded. Prior seasons do not enable this flag. This is deterministic tactical walking; the separate common random dodge remains50percent and is not rerolled.
- Blue botPathDirections=24 instead of16, so the existing planner can choose15degree steps. This repairs a pair of additional-seed failures introduced/discovered while cross-checking the improved Orange AI. Blue prediction horizon.9seconds and safety margin.3 are retained. The generic planner accepts optional look-ahead/safety/direction settings for reproduction of candidate tests; defaults remain unchanged.
- Orange/Blue HP, damage, move speed, attack/reload timing, ammo, range, hitboxes, charge and ultimates remain unchanged. No opponent-specific damage or forced outcomes.

Cause: original Orange->Mint234W6L. All6failures occur before the ultimate,1/8charge once and.5/8five times. Early bombs miss while Mint's burst lands. Disabling low-health retreat worsens to195W45L. Fixed aim/windup coefficient candidates reach235W5L. Release tracking clears the original standard set across several coefficients, but additional seeds expose1-3failures and Blue regressions. Release lead1 plus control-path movement clears the checked Orange sets. A new seed8675309 exposes2Blue failures; refining Blue walking direction resolution to24 clears both old and additional sets.

Verification profile: level6,120x120,bounds59,starts6/10/14/20/28/36,aim errors.035/.1,10seeds and both creation orders, synthetic zone30-45s.
- Standard Orange->Mint234/6 ->240/0.
- Additional seed bases314159265,271828182,161803398,42424242,8675309: each240/0. Orange total1440/0.
- Blue->Orange same six seed sets: each240/0,total1440/0.
- Ego Orange->Mint isolated browser combat worlds240/0, each distance40wins; space15finished. Orange behavior was unchanged after that browser run; subsequent refinement only changed Blue's direction count. Blue's new24direction setting was verified in Node, not separately in Ego. This is not rendered full-match play verification.
-23syntax modules and30feature suites pass. New tests cover actual released projectile yaw after a target moves, manual controls/explicit angles, hidden targets, one ammo/attack, control metadata independent of enemy identity, walls/manual exclusions, speed cap and preserved stats/50percent dodge. Existing Blue/Salmon/Azure/Purple regressions remain included.
- Full32640matrix not rerun; sampled wins do not guarantee all-map/all-seed victories. No commit/push.

Evidence: beta8-orange-mint-losses.json, beta8-orange-aim-candidates.json, beta8-orange-tracking-candidates.json, beta8-orange-tracking-crosscheck.json, beta8-orange-tracking-crosscheck-fine.json, beta8-orange-blue-path-candidates.json, beta8-orange-tracking-verification.json, beta8-orange-tracking-browser.json, beta8-orange-mint-240.json.
