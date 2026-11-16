// Main (Season 8) Champions: its own event and standings, separate from the beta Champions.
// Opens 11.16 18:10 KST; every day at 18:10 the last character of each mode group is out. 17 → 10 or fewer:
// Soccer Kick final (bottom 2 out daily) → 4: 1v1 duel tournament → the winner's crown skin for everyone who took part.
import { createChampionsRules } from './champions-rules.js';

export const MAIN_CHAMPIONS = createChampionsRules({
  id: 'main-s8-champions-2026',
  start: Date.parse('2026-11-16T18:10:00+09:00'),
  roundMs: 86400000,
  swapRound: 3,
  finalSize: 10, finalCut: 2, tournamentSize: 4,
  groups: [
    { id: 'gemGrab', name: 'GEM GRAB', characters: ['red', 'green', 'blue', 'orange', 'pink', 'gold', 'mint', 'lavender', 'salmon'] },
    { id: 'knockout', name: 'KNOCKOUT', characters: ['purple', 'ivory', 'yellow', 'cyan', 'crimson', 'chartreuse', 'azure', 'crystal'] },
  ],
});
// Crown reward skin per character; only the champion's one is granted.
export const mainChampionsCrownSkin = character => `crown_main_champions_${character}`;
