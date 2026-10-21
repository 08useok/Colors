// The base Crystal FBX is Z-up inside an Armature rotated to Y-up.
// Hips local X/Y therefore move across the floor; local Z is the gait bounce.
// Remove only net horizontal travel, keeping the authored sway and limb motion.
export function crystalWalkInPlace(clip) {
  if (!clip || clip.name !== "Armature|Armature|walking_2|baselayer") return clip;
  const source = clip.tracks.find(track => track.name === "Hips.position");
  if (!source || source.times.length < 2) return clip;
  const result = clip.clone();
  const track = result.tracks.find(track => track.name === source.name);
  const last = source.values.length - 3;
  const startTime = source.times[0];
  const duration = source.times[source.times.length - 1] - startTime;
  if (duration <= 0) return result;
  for (let key = 0; key < track.times.length; key++) {
    const progress = (track.times[key] - startTime) / duration;
    for (const axis of [0, 1]) {
      track.values[key * 3 + axis] -= (source.values[last + axis] - source.values[axis]) * progress;
    }
  }
  return result;
}
