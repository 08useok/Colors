// Gem Grab map 「보석 샘터」: four small springs around the gem altar, three lanes split by long
// walls, a bush in the middle lane and bush pockets along both side lanes. Drawn with the legend in
// drawn-map.js (one character = 2 x 2 tiles, top half only, bottom half turned 180°).
// The centre (|x| < 4, |z| < 10) stays open for the altar and both Hot Zone layouts.
import { drawnTeamMap, mirrorDrawnRows } from './drawn-map.js';

export const GEM_SPRINGS_MAP_NAME = '보석 샘터';
export const GEM_SPRINGS_MAP_INDEX = 4;
export const GEM_SPRINGS_TOP_HALF = Object.freeze([
  '       B  B  B      ',
  '                    ',
  ' **              ** ',
  ' **   --    --   ** ',
  '      |      |      ',
  '~~    |      |    ~~',
  '~~                ~~',
  '   ---   **   ---   ',
  '   #     **     #   ',
  ' **  |        |  ** ',
  ' **  |        |  ** ',
  '     |        |     ',
  '  -    ~    ~    -  ',
  '                    ',
  '                    ',
]);
export const GEM_SPRINGS_ROWS = mirrorDrawnRows(GEM_SPRINGS_TOP_HALF);

export function gemSpringsMap() {
  return drawnTeamMap(GEM_SPRINGS_ROWS, { id: 'gemGrab-springs', name: GEM_SPRINGS_MAP_NAME, index: GEM_SPRINGS_MAP_INDEX, profile: 'springs' });
}
