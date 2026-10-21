import { mapBlocked } from './event-maps.js';

export function betaShowdownProfile(season8) {
  const scale = season8 ? 2.5 : 1;
  return Object.freeze({ scale, halfSize: 20 * scale, actorLimit: 20 * scale - 1, playerSpawnZ: 15 * scale, botSpawnRadius: 9 * scale, navigationStep: 1.5 * scale });
}

// Preserve the intended spawn when clear; otherwise find the closest open floor.
export function safeShowdownSpawn(layout, point, radius = .7) {
  if (!mapBlocked(layout, point.x, point.z, radius)) return { ...point };
  for (let distance = .5; distance <= Math.max(layout.halfWidth, layout.halfDepth) * 2; distance += .5) {
    for (let i = 0; i < 48; i++) {
      const yaw = i * Math.PI * 2 / 48;
      const candidate = { x: point.x + Math.cos(yaw) * distance, z: point.z + Math.sin(yaw) * distance };
      if (!mapBlocked(layout, candidate.x, candidate.z, radius)) return candidate;
    }
  }
  throw new Error('No safe Showdown spawn found');
}
