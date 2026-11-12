// Beta Knockout map 「물길 협곡」: a rocky canyon cut across the middle by a river with three crossings.
// The drawing below IS the map. One character = 2 x 2 tiles on the 40 x 60 team field
// (20 columns x 30 rows); only the top half is drawn, the bottom half is the same picture turned 180°.
//   -  rock wall (thin, horizontal)     |  rock wall (thin, vertical)
//   ~  water: blocks walking, projectiles fly over it      *  bush
//   B  enemy start line (decoration only; spawns come from the team arena)
import { TEAM_ARENA } from './beta9-team-arena.js';

export const CANYON_MAP_NAME = '물길 협곡';
export const CANYON_TOP_HALF = Object.freeze([
  '       B  B  B      ',
  '                    ',
  '   --          --   ',
  '   |   **  **   |   ',
  '       **  **       ',
  '  ~~~          ~~~  ',
  '  ~~~   ----   ~~~  ',
  '          |         ',
  ' **   |        **   ',
  ' **   |   ~~   **   ',
  '          ~~        ',
  '   ---         ---  ',
  '~~~~~~    ||    ~~~~',
  '~~~~~~    ||    ~~~~',
  '                    ',
]);
// Full drawing: top half, then the same rows turned 180° (B becomes A, our start line).
export const CANYON_ROWS = Object.freeze([...CANYON_TOP_HALF,
  ...CANYON_TOP_HALF.slice().reverse().map(row => [...row].reverse().join('').replaceAll('B', 'A'))]);

const CELL = 2, THIN = 1;
const cellX = col => -TEAM_ARENA.halfWidth + col * CELL, cellZ = row => -TEAM_ARENA.halfDepth + row * CELL;

// Horizontal runs of one character in one row → one rectangle per run.
function rowRuns(char) {
  const runs = [];
  CANYON_ROWS.forEach((line, row) => {
    for (let col = 0; col < line.length; col++) {
      if (line[col] !== char) continue;
      let end = col; while (line[end + 1] === char) end++;
      runs.push({ row, from: col, to: end }); col = end;
    }
  });
  return runs;
}
// Vertical runs of '|' in one column → one thin wall per run.
function columnRuns(char) {
  const runs = [], cols = CANYON_ROWS[0].length;
  for (let col = 0; col < cols; col++) for (let row = 0; row < CANYON_ROWS.length; row++) {
    if (CANYON_ROWS[row][col] !== char) continue;
    let end = row; while (CANYON_ROWS[end + 1]?.[col] === char) end++;
    runs.push({ col, from: row, to: end, cols: 1 }); row = end;
  }
  // Side-by-side columns with the same span ("||") are one solid pillar, not two thin walls with a gap.
  const merged = [];
  for (const run of runs) {
    const left = merged.find(m => m.from === run.from && m.to === run.to && m.col + m.cols === run.col);
    if (left) left.cols++; else merged.push({ ...run });
  }
  return merged;
}

export function canyonKnockoutMap() {
  const { halfWidth, halfDepth } = TEAM_ARENA;
  const full = ({ row, from, to }) => ({ x: cellX(from) + (to - from + 1) * CELL / 2, z: cellZ(row) + CELL / 2, width: (to - from + 1) * CELL, depth: CELL });
  const walls = [
    ...rowRuns('-').map(run => ({ ...full(run), depth: THIN })),
    ...columnRuns('|').map(({ col, from, to, cols }) => ({ x: cellX(col) + cols * CELL / 2, z: cellZ(from) + (to - from + 1) * CELL / 2,
      width: cols > 1 ? cols * CELL : THIN, depth: (to - from + 1) * CELL })),
  ];
  return { id: 'knockout-canyon', name: CANYON_MAP_NAME, index: 3, profile: 'river', halfWidth, halfDepth,
    walls, bushes: rowRuns('*').map(full), lakes: rowRuns('~').map(full) };
}
