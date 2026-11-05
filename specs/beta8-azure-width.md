# Azure basic wave width - beta0.8.62 (2026-10-27)

Final beta8-only change: surfWidth2 ->3tiles. Korean/English attack descriptions updated. Shared bot combat, practice mesh/state and aim guide all read this width. HP10500, basic damage3000, range4, ride distance2, speed17, movement/charge/cooldown/AI and ultimate damage6000/width4 are retained. Prior season width2 preserved. No opponent-ID bonus.

Current baseline193W47L (older full matrix194W45L1D is stale). Every failure had0casts and0/.5 charge out of2: basic attacks missed the moving target.35failures end in the synthetic zone,12in combat. Disabling low-health retreat changes the cause but still47losses. Aim/windup21candidates and spacing27candidates did not reach perfect results. Closer spacing plus lead gave226wins at best. The wider normal wave fixes lateral misses without extra HP/damage or altered AI. Width2.5 gave230W10L; width3 gave240W0L with existing AI, while the close-AI variant introduced2draws and was rejected.

Verification profile: level6,120x120,bounds59,start distances6/10/14/20/28/36, aim errors.035/.1,10seeds and both creation orders, synthetic shrinking zone30-45s.
- Azure->Lavender193/47 ->240/0.
- New seed bases314159265,271828182,161803398: each240/0; standard+additional960/0.
- Green->Azure240/0 before and after.
- Ego isolated browser combat worlds240/0, six distances40wins each; space13finished. This is not rendered full-match play verification.
- Syntax23 modules and feature28suites passed. New test covers actual marginal hits at lateral1.25tiles and misses at1.65, prior-season isolation, unchanged stats, attack/ultimate guide widths and VM execution of the actual practice wave constructor yielding mesh width3.
- Full32640 matrix not rerun. Sampled wins are not all-map/all-seed guarantees. No commit/push.

Evidence: beta8-azure-lavender-losses.json, beta8-azure-aim-candidates.json, beta8-azure-spacing-candidates.json, beta8-azure-pursuit-candidates.json, beta8-azure-width-candidates.json, beta8-azure-width-verification.json, beta8-azure-width-browser.json, beta8-azure-lavender-240.json.
