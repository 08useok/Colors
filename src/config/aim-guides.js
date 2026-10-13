import { beta6Ultimate } from './beta6-balance.js';

// Coordinates are local: x sideways, z forward. Distances use combat tiles.
export function attackGuide(id, d, { distance = Infinity, index = 0 } = {}) {
  const beam = (range, width = .35) => [{ type: 'beam', range, width }];
  if (id === 'cyan') return beam(d.spreadLineRange, (d.spreadLineCount - 1) * (d.spreadLineSpacing ?? .75) + .26);
  if (id === 'gold') return beam(d.stage1Range, d.stage1Size);
  if (id === 'mint') return beam(d.iceBulletRange, .4);
  if (id === 'azure') return beam(d.surfLength, d.surfWidth);
  if (id === 'ivory') { const range = Math.min(distance, d.iceCreamRange); return [...beam(range), { type: 'ring', z: range, radius: d.iceCreamZoneRadius }]; }
  if (id === 'crystal') return beam(d.crystalRange);
  return [];
}

export function ultimateGuide(id, d, { distance = Infinity, yaw = 0 } = {}) {
  const u = beta6Ultimate(d, id);
  if (!u) return [];
  const beam = (range, width = .35) => ({ type: 'beam', range, width });
  const ring = (radius, z = 0, x = 0) => ({ type: 'ring', radius, z, x });
  if (id === 'blue') return [beam(u.speed * u.duration, u.hitRadius * 2)];
  if (id === 'cyan') return [beam(u.range, u.projectileRadius * 2)];
  if (id === 'crimson' || id === 'azure') return [beam(u.range, u.width)];
  if (id === 'crystal') return [beam(u.range, 1.1)];
  if (id === 'orange') return [{ type: 'fan', range: u.range, angle: u.spreadAngle }];
  if (id === 'yellow') { const range = Math.min(distance, u.throwRange ?? (Number.isFinite(distance) ? distance : 8)); return [beam(range), ring(.7, range)]; }
  if (id === 'mint') { const range = Math.min(distance, u.castRange); return [beam(range), ring(u.radius, range)]; }
  if (id === 'purple') { const range = Math.min(distance, u.range); return [beam(range), ring(u.radius), ring(u.radius, range)]; }
  if (id === 'ivory') {
    const range = Math.min(distance, u.castRange), offset = u.patternRadius / Math.sqrt(2);
    return [beam(range), ...[[0, 0], [-offset, -offset], [-offset, offset], [offset, -offset], [offset, offset]].map(([x, z]) => ring(d.iceCreamZoneRadius, range + x * Math.sin(yaw) + z * Math.cos(yaw), x * Math.cos(yaw) - z * Math.sin(yaw)))];
  }
  if (u.radius) return [ring(u.radius)];
  return [ring(.8)]; // Self buffs have no directional attack range.
}
