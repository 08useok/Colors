import { THREE, G } from "./shared.js";
import { CHARACTERS } from "./character.js";

export function updateFighterAnimation(fighter, dt) {
  if (fighter.dead) return;

  const pulse = (time, start, peak, end) => {
    if (time <= start || time >= end) return 0;
    if (time <= peak) return (time - start) / Math.max(peak - start, 0.0001);
    return 1 - (time - peak) / Math.max(end - peak, 0.0001);
  };

  const state = G.state;
  const camera = G.camera;
  const body = fighter.mesh.userData;
  const speed = Math.hypot(
    fighter.mesh.position.x - (fighter.lastX ?? fighter.mesh.position.x),
    fighter.mesh.position.z - (fighter.lastZ ?? fighter.mesh.position.z),
  ) / Math.max(dt, 0.001);
  fighter.lastX = fighter.mesh.position.x;
  fighter.lastZ = fighter.mesh.position.z;

  const charType = fighter.characterType;
  const walkStyle = CHARACTERS[charType]?.walk ?? CHARACTERS.red.walk;
  const walkCycle = state.gameTime * walkStyle.cycleSpeed + fighter.id;
  const swing = Math.min(1, speed / 8);
  let leftLeg = Math.sin(walkCycle) * walkStyle.legAmp * swing;
  let rightLeg = -Math.sin(walkCycle) * walkStyle.legAmp * swing;
  let leftArmX = -Math.sin(walkCycle) * walkStyle.armAmp * swing;
  let rightArmX = Math.sin(walkCycle) * walkStyle.armAmp * swing;
  let leftArmZ = walkStyle.armRestZ;
  let rightArmZ = -walkStyle.armRestZ;
  let bodyZ = Math.sin(walkCycle * 0.5) * 0.03;
  let bodyY = 0;
  let headX = 0;
  let headY = 0;

  if (fighter.attackAnimTime >= 0) {
    fighter.attackAnimTime += dt;
    const t = fighter.attackAnimTime;

    if (charType === "green") {
      const windup = pulse(t, 0, 0.1, 0.2);
      const release = pulse(t, 0.2, 0.28, 0.5);
      rightArmX += windup * 0.9 - release * 1.6;
      rightArmZ += -windup * 0.4 - release * 0.2;
      leftArmX += -windup * 0.15 + release * 0.25;
      bodyY += windup * 0.12 - release * 0.28;
      bodyZ += -windup * 0.04 + release * 0.06;
      headY += windup * 0.06 - release * 0.14;
      rightLeg += -windup * 0.08 + release * 0.15;
    } else if (charType === "blue") {
      const raise = Math.min(1, t / 0.06) * (t > 0.5 ? Math.max(0, 1 - (t - 0.5) / 0.1) : 1);
      const recoil = pulse(t, 0.06, 0.1, 0.25);
      rightArmX += -raise * 1.3 + recoil * 0.3;
      leftArmX += -raise * 1.1 + recoil * 0.2;
      bodyZ += -recoil * 0.05;
      headX += recoil * 0.04;
    } else {
      const punchOne = pulse(t, 0.02, 0.11, 0.2);
      const punchTwo = pulse(t, 0.2, 0.31, 0.43);
      const recover = pulse(t, 0.43, 0.5, 0.6);
      leftLeg += -punchOne * 0.08 + punchTwo * 0.18;
      rightLeg += punchOne * 0.18 - punchTwo * 0.08;
      leftArmX += -fighter.attackSwing * 0.32 - punchTwo * 1.25 + recover * 0.18;
      rightArmX += -fighter.attackSwing * 0.42 - punchOne * 1.35 + recover * 0.2;
      leftArmZ += punchTwo * 0.18;
      rightArmZ += -punchOne * 0.18;
      bodyZ += punchOne * 0.06 - punchTwo * 0.05;
      bodyY += -punchOne * 0.22 + punchTwo * 0.22;
      headY += -punchOne * 0.12 + punchTwo * 0.12;
      headX += punchOne * 0.03 + punchTwo * 0.03;
    }

    if (t > 0.6) fighter.attackAnimTime = -1;
  }

  body.leftLeg.rotation.x = leftLeg;
  body.rightLeg.rotation.x = rightLeg;
  body.leftArm.rotation.x = leftArmX;
  body.rightArm.rotation.x = rightArmX;
  body.leftArm.rotation.z = leftArmZ;
  body.rightArm.rotation.z = rightArmZ;
  body.body.rotation.z = bodyZ;
  body.body.rotation.y = bodyY;
  body.head.rotation.y = headY;
  body.head.rotation.x = headX;

  fighter.attackSwing = Math.max(0, fighter.attackSwing - dt * 5);
  fighter.spread = Math.max(0, fighter.spread - dt * 0.13);
  fighter.recoilKick = Math.max(0, fighter.recoilKick - dt * 3.4);
  fighter.pitchKick = Math.max(0, fighter.pitchKick - dt * 4.2);

  if (fighter.flashTimer) {
    fighter.flashTimer -= dt;
    fighter.flashMaterial.emissive = new THREE.Color(0x7f0f0f);
    fighter.flashMaterial.emissiveIntensity = fighter.flashTimer > 0 ? 0.75 : 0;
  } else {
    fighter.flashMaterial.emissiveIntensity = 0;
  }

  const fill = fighter.healthBar.userData.fill;
  const healthRatio = fighter.health / fighter.maxHealth;
  fill.scale.x = THREE.MathUtils.clamp(healthRatio, 0, 1);
  fill.position.x = (-1.31 * (1 - fill.scale.x)) * 0.5;
  fighter.healthBar.quaternion.copy(camera.quaternion);
}
