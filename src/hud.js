import { THREE, G, CONST } from "./shared.js";
import { DOM } from "./LANGS/dom-core.js";
import { getReloadInterval } from "./combat.js";

export function rebuildAmmoPips(getPlayer) {
  const player = getPlayer();
  const count = player?.maxAmmo ?? CONST.maxAmmo;
  DOM.ammoPips.innerHTML = "";
  const spread = 64;
  const step = count > 1 ? spread / (count - 1) : 0;
  for (let i = 0; i < count; i++) {
    const pip = document.createElement("div");
    pip.className = "ammo-fan-segment filled";
    const angle = count > 1 ? -spread / 2 + i * step : 0;
    pip.style.transform = `rotate(${angle}deg)`;
    DOM.ammoPips.appendChild(pip);
  }
}

export function updateAmmoPips(value) {
  [...DOM.ammoPips.children].forEach((pip, index) => {
    pip.classList.toggle("filled", index < value);
  });
}

export function formatTime(seconds) {
  const clamped = Math.max(0, Math.ceil(seconds));
  const m = `${Math.floor(clamped / 60)}`.padStart(2, "0");
  const s = `${clamped % 60}`.padStart(2, "0");
  return `${m}:${s}`;
}

export function addKillFeed(text) {
  const item = document.createElement("div");
  item.className = "kill-item";
  item.textContent = text;
  DOM.killFeed.prepend(item);
  if (DOM.killFeed.children.length > 6) DOM.killFeed.lastChild?.remove();
  window.setTimeout(() => item.remove(), 5200);
}

export function flashHitMarker() {
  DOM.hitMarker.classList.remove("flash");
  void DOM.hitMarker.offsetWidth;
  DOM.hitMarker.classList.add("flash");
}

export function showDamageTakenIndicator(amount) {
  DOM.damageTakenIndicator.textContent = `-${Math.round(amount)}`;
  DOM.damageTakenIndicator.classList.remove("flash");
  void DOM.damageTakenIndicator.offsetWidth;
  DOM.damageTakenIndicator.classList.add("flash");
}

export function createAttackEffect(attacker, hitIndex) {
  const scene = G.scene;
  const state = G.state;
  const tilt = (hitIndex === 0 ? -20 : 20) * (Math.PI / 180);
  const effectYaw = attacker.yaw + tilt;
  const color0 = hitIndex === 0 ? 0xffcb66 : 0xff8d57;
  const fwdDist = CONST.attackDepth * 0.5;
  const cx = attacker.mesh.position.x + Math.sin(attacker.yaw) * fwdDist;
  const cz = attacker.mesh.position.z + Math.cos(attacker.yaw) * fwdDist;

  const torusMesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.72 + hitIndex * 0.08, 0.08, 8, 20, Math.PI * 0.78),
    new THREE.MeshBasicMaterial({ color: color0, transparent: true, opacity: 0.85 }),
  );
  torusMesh.rotation.y = effectYaw - Math.PI / 2;
  torusMesh.rotation.x = Math.PI / 2;
  torusMesh.position.set(cx, 1.25, cz);
  scene.add(torusMesh);
  state.effects.push({ mesh: torusMesh, life: 0.22, maxLife: 0.22, type: "attack" });

  const slashMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.26, CONST.attackDepth * 0.9),
    new THREE.MeshBasicMaterial({
      color: hitIndex === 0 ? 0xfff2bb : 0xffd4aa,
      transparent: true, opacity: 1.0, side: THREE.DoubleSide, depthWrite: false,
    }),
  );
  slashMesh.rotation.set(0, effectYaw, 0);
  slashMesh.position.set(cx, 0.9, cz);
  scene.add(slashMesh);
  state.effects.push({ mesh: slashMesh, life: 0.13, maxLife: 0.13, type: "slash" });
}

export function createHitSpark(position) {
  const spark = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.36, 0),
    new THREE.MeshBasicMaterial({ color: 0xffe388, transparent: true, opacity: 0.92 }),
  );
  spark.position.copy(position);
  G.scene.add(spark);
  G.state.effects.push({ mesh: spark, life: 0.18, maxLife: 0.18, type: "spark" });
}

export function createDamagePopup(position, amount) {
  const cvs = document.createElement("canvas");
  cvs.width = 128; cvs.height = 64;
  const ctx = cvs.getContext("2d");
  ctx.font = "bold 40px sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.lineWidth = 6;
  ctx.strokeStyle = "rgba(40, 20, 0, 0.75)";
  ctx.fillStyle = "#ffd27a";
  const text = `${Math.round(amount)}`;
  ctx.strokeText(text, 64, 32);
  ctx.fillText(text, 64, 32);

  const texture = new THREE.CanvasTexture(cvs);
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }),
  );
  sprite.scale.set(1.4, 0.7, 1);
  sprite.position.copy(position);
  sprite.position.y += 3.6;
  sprite.position.x += (Math.random() - 0.5) * 0.6;
  G.scene.add(sprite);
  G.state.effects.push({ mesh: sprite, life: 0.7, maxLife: 0.7, type: "damagePopup" });
}

export function updateEffects(dt) {
  const state = G.state;
  for (let i = state.effects.length - 1; i >= 0; i--) {
    const effect = state.effects[i];
    effect.life -= dt;
    if (effect.life <= 0) {
      G.scene.remove(effect.mesh);
      if (effect.type === "damagePopup") {
        effect.mesh.material.map.dispose();
        effect.mesh.material.dispose();
      }
      state.effects.splice(i, 1);
      continue;
    }
    const alpha = effect.life / effect.maxLife;
    if (effect.type === "attack") {
      effect.mesh.scale.setScalar(1 + (1 - alpha) * 0.28);
      effect.mesh.material.opacity = alpha * 0.85;
    } else if (effect.type === "slash") {
      effect.mesh.scale.x = 1 + (1 - alpha) * 1.8;
      effect.mesh.scale.y = 1.0;
      effect.mesh.material.opacity = alpha * alpha;
    } else if (effect.type === "damagePopup") {
      effect.mesh.position.y += dt * 1.4;
      effect.mesh.material.opacity = alpha;
    } else {
      effect.mesh.scale.setScalar(1 + (1 - alpha) * 1.6);
      effect.mesh.material.opacity = alpha;
    }
  }
}

export function updateHud(getPlayer, getCurrentZone, zonePhases, zoneRing, t) {
  const state = G.state;
  const player = getPlayer();
  if (!player) return;

  const healthRatio = THREE.MathUtils.clamp(player.health / player.maxHealth, 0, 1);
  DOM.healthFill.style.width = `${healthRatio * 100}%`;
  DOM.healthText.textContent = `${Math.round(player.health)} / ${player.maxHealth}`;
  DOM.healthValue.textContent = `${Math.round(player.health)}`;
  DOM.charName.textContent = player.name;
  const reloadInterval = getReloadInterval(player);
  const reloadProgress = player.ammo >= player.maxAmmo
    ? 1 : THREE.MathUtils.clamp(player.reloadTimer / reloadInterval, 0, 1);

  DOM.reloadBar.style.width = `${reloadProgress * 100}%`;
  DOM.reloadBar.dataset.state = player.ammo >= player.maxAmmo ? "full" : "reloading";

  if (player.ammo >= player.maxAmmo) {
    DOM.reloadState.textContent = t("ammoFull");
  } else {
    const remain = Math.max(0, reloadInterval - player.reloadTimer);
    DOM.reloadState.textContent = t("nextAmmo", remain.toFixed(1));
  }
  const attackLabel = player.characterType === "green" ? t("boomerang")
    : player.characterType === "blue" ? t("sniper") : t("doublePunch");
  DOM.attackState.textContent = player.ammo <= 0 ? t("noAmmo") : attackLabel;
  DOM.spreadState.textContent = t("stability", Math.round((1 - player.spread * 0.55) * 100));
  updateAmmoPips(player.ammo);

  if (state.trainingMode) {
    DOM.survivorsPanel.style.display = "none";
    DOM.zonePanel.classList.add("is-hidden-panel");
    DOM.warning.classList.add("hidden");
    zoneRing.ring.visible = false;
    zoneRing.wall.visible = false;
    DOM.exitTrainingBtn.classList.remove("hidden");
  } else {
    DOM.exitTrainingBtn.classList.add("hidden");
    DOM.survivorsPanel.style.display = "";
    const alive = state.players.filter(f => !f.dead).length;
    DOM.survivorsLabel.textContent = `${alive}`;
    const zone = getCurrentZone();
    const showZoneEvent = state.gameTime >= zonePhases[1].start;
    DOM.zonePanel.classList.toggle("is-hidden-panel", !showZoneEvent);
    DOM.zoneState.textContent = t(zone.labelKey);
    DOM.zoneTimer.textContent = formatTime(zone.phaseEnd - state.gameTime);
    DOM.warning.classList.toggle("hidden", !state.playerOutsideZone);
    zoneRing.ring.visible = true;
    zoneRing.wall.visible = true;
  }
}
