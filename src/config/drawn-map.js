// Maps drawn as text on the 40 x 60 team field. One character = 2 x 2 tiles (20 columns x 30 rows).
// Only the top half (15 rows) is drawn; the bottom half is the same picture turned 180°.
//   -  wall (thin, horizontal)     |  wall (thin, vertical; "||" side by side = one solid pillar)
//   #  solid wall block (full cell)
//   ~  water: blocks walking, projectiles fly over it      *  bush
//   B  enemy start line (decoration only; spawns come from the team arena)
import { TEAM_ARENA } from './beta9-team-arena.js';

const CELL = 2, THIN = 1;
const cellX = col => -TEAM_ARENA.halfWidth + col * CELL, cellZ = row => -TEAM_ARENA.halfDepth + row * CELL;

// Top half, then the same rows turned 180° (B becomes A, our start line).
export function mirrorDrawnRows(topHalf) {
  return Object.freeze([...topHalf,
    ...topHalf.slice().reverse().map(row => [...row].reverse().join('').replaceAll('B', 'A'))]);
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

export function drawnTeamMap(rows, meta) {
  const { halfWidth, halfDepth } = TEAM_ARENA;
  const full = ({ row, from, to }) => ({ x: cellX(from) + (to - from + 1) * CELL / 2, z: cellZ(row) + CELL / 2, width: (to - from + 1) * CELL, depth: CELL });
  const walls = [
    ...rowRuns(rows, '-').map(run => ({ ...full(run), depth: THIN })),
    ...rowRuns(rows, '#').map(full),
    ...columnRuns(rows, '|').map(({ col, from, to, cols }) => ({ x: cellX(col) + cols * CELL / 2, z: cellZ(from) + (to - from + 1) * CELL / 2,
      width: cols > 1 ? cols * CELL : THIN, depth: (to - from + 1) * CELL })),
  ];
  return { ...meta, halfWidth, halfDepth, walls, bushes: rowRuns(rows, '*').map(full), lakes: rowRuns(rows, '~').map(full) };
}
