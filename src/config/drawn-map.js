// Maps drawn as text. Each character is one cell (CELL x CELL tiles, 2 by default); the field size comes
// from the drawing (columns x rows). Only the top half is drawn; the bottom half is the same picture turned
// 180°. Fields with an odd number of rows add one middle row, which must read the same turned around.
//   -  wall (thin, horizontal)     |  wall (thin, vertical; "||" side by side = one solid pillar)
//   #  solid wall block (full cell)
//   ~  water: blocks walking, projectiles fly over it      *  bush
//   B  enemy start line (decoration only; spawns come from each mode)
import { TEAM_ARENA } from './beta9-team-arena.js';

const THIN = 1;
const turn = row => [...row].reverse().join('');

// Top half (+ optional middle row), then the same rows turned 180° (B becomes A, our start line).
export function mirrorDrawnRows(topHalf, middle = null) {
  if (middle != null && turn(middle) !== middle) throw new Error('middle row must read the same turned 180°');
  return Object.freeze([...topHalf, ...(middle == null ? [] : [middle]),
    ...topHalf.slice().reverse().map(row => turn(row).replaceAll('B', 'A'))]);
}

// Horizontal runs of one character in one row → one rectangle per run.
function rowRuns(rows, char) {
  const runs = [];
  rows.forEach((line, row) => {
    for (let col = 0; col < line.length; col++) {
      if (line[col] !== char) continue;
      let end = col; while (line[end + 1] === char) end++;
      runs.push({ row, from: col, to: end }); col = end;
    }
  });
  return runs;
}
// Vertical runs of '|' in one column → one thin wall per run; same-span neighbours merge into a pillar.
function columnRuns(rows, char) {
  const runs = [], cols = rows[0].length;
  for (let col = 0; col < cols; col++) for (let row = 0; row < rows.length; row++) {
    if (rows[row][col] !== char) continue;
    let end = row; while (rows[end + 1]?.[col] === char) end++;
    runs.push({ col, from: row, to: end, cols: 1 }); row = end;
  }
  const merged = [];
  for (const run of runs) {
    const left = merged.find(m => m.from === run.from && m.to === run.to && m.col + m.cols === run.col);
    if (left) left.cols++; else merged.push({ ...run });
  }
  return merged;
}

export function drawnMap(rows, meta, cell = 2) {
  if (!rows.every(row => row.length === rows[0].length)) throw new Error(`${meta.id}: rows differ in length`);
  const halfWidth = rows[0].length * cell / 2, halfDepth = rows.length * cell / 2;
  const cellX = col => -halfWidth + col * cell, cellZ = row => -halfDepth + row * cell;
  const full = ({ row, from, to }) => ({ x: cellX(from) + (to - from + 1) * cell / 2, z: cellZ(row) + cell / 2, width: (to - from + 1) * cell, depth: cell });
  const walls = [
    ...rowRuns(rows, '-').map(run => ({ ...full(run), depth: THIN })),
    ...rowRuns(rows, '#').map(full),
    ...columnRuns(rows, '|').map(({ col, from, to, cols }) => ({ x: cellX(col) + cols * cell / 2, z: cellZ(from) + (to - from + 1) * cell / 2,
      width: cols > 1 ? cols * cell : THIN, depth: (to - from + 1) * cell })),
  ];
  return { ...meta, halfWidth, halfDepth, walls, bushes: rowRuns(rows, '*').map(full), lakes: rowRuns(rows, '~').map(full) };
}

// 40 x 60 team field (Gem Grab, Knockout, Hot Zone): 20 columns x 30 rows of 2-tile cells.
export function drawnTeamMap(rows, meta) {
  const map = drawnMap(rows, meta);
  if (map.halfWidth !== TEAM_ARENA.halfWidth || map.halfDepth !== TEAM_ARENA.halfDepth) throw new Error(`${meta.id}: not the team field`);
  return map;
}
