import { THREE, G } from "./shared.js";
import { DOM } from "./LANGS/dom-core.js";

export const zonePhases = [
  { start: 0,   end: 15,  radius: 52, damage: 0,    labelKey: "zoneWaiting" },
  { start: 15,  end: 30,  radius: 42, damage: 150,  labelKey: "zonePhase1" },
  { start: 30,  end: 45,  radius: 32, damage: 250,  labelKey: "zonePhase2" },
  { start: 45,  end: 60,  radius: 23, damage: 400,  labelKey: "zonePhase3" },
  { start: 60,  end: 75,  radius: 15, damage: 650,  labelKey: "zonePhase4" },
  { start: 75,  end: 999, radius: 8,  damage: 1000, labelKey: "zoneFinal" },
];

export function getCurrentZone() {
  const state = G.state;
  const first = zonePhases[0];
  if (state.gameTime < first.end) {
    return { labelKey: first.labelKey, radius: first.radius, damage: first.damage, phaseEnd: first.end };
  }
  for (let i = 1; i < zonePhases.length; i++) {
    const phase = zonePhases[i];
    const prev = zonePhases[i - 1];
    if (state.gameTime < phase.end) {
      const t = phase.end === phase.start ? 1 : THREE.MathUtils.clamp((state.gameTime - phase.start) / (phase.end - phase.start), 0, 1);
      const radius = THREE.MathUtils.lerp(prev.radius, phase.radius, t);
      return { labelKey: phase.labelKey, radius, damage: phase.damage, phaseEnd: phase.end };
    }
  }
  const final = zonePhases[zonePhases.length - 1];
  return { labelKey: final.labelKey, radius: final.radius, damage: final.damage, phaseEnd: final.end };
}

export function createZoneRing() {
  const scene = G.scene;
  const geo = new THREE.RingGeometry(0.96, 1.0, 96);
  const mat = new THREE.MeshBasicMaterial({ color: 0x5dea6a, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
  const ring = new THREE.Mesh(geo, mat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.08;
  scene.add(ring);

  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, 12, 96, 1, true),
    new THREE.MeshBasicMaterial({ color: 0x4ac75a, transparent: true, opacity: 0.08, side: THREE.DoubleSide }),
  );
  wall.position.y = 6;
  scene.add(wall);
  return { ring, wall };
}

export function updateZoneVisual(zone, zoneRing) {
  const state = G.state;
  zoneRing.ring.scale.set(zone.radius, zone.radius, zone.radius);
  zoneRing.wall.scale.set(zone.radius, 1, zone.radius);
  zoneRing.ring.position.set(state.safeCenter.x, 0.08, state.safeCenter.y);
  zoneRing.wall.position.set(state.safeCenter.x, 6, state.safeCenter.y);
}

export function updateZoneDamage(dt, zone, applyDamage, audio) {
  const state = G.state;
  if (state.trainingMode) return;
  state.playerOutsideZone = false;
  for (const fighter of state.players) {
    if (fighter.dead || zone.damage <= 0) continue;
    const dx = fighter.mesh.position.x - state.safeCenter.x;
    const dz = fighter.mesh.position.z - state.safeCenter.y;
    const distance = Math.hypot(dx, dz);
    if (distance > zone.radius) {
      applyDamage(fighter, zone.damage * dt);
      if (fighter.isPlayer) {
        state.playerOutsideZone = true;
        DOM.warning.classList.remove("hidden");
        if (state.gameTime > state.feedback.warningPulseUntil) {
          audio.play("warning");
          state.feedback.warningPulseUntil = state.gameTime + 1.25;
        }
      }
    }
  }
}
