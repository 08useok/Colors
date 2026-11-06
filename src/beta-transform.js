// Transform (변신) for the beta match screen: the round gauge button (key F) and the in-world
// visuals — an aura around transformed fighters, the angel mark halo and Heaven rounds.
import { TRANSFORMS } from "./config/transforms.js";

// Every transform shares one purple effect colour (like a hypercharge), so it reads apart from
// the ultimate (gold) and the character's own colour. The angel-mark halo stays gold.
const EFFECT_COLOR = "#a855f7";

const STYLE = `
.transform-btn { --transform-color:#a855f7; --charge-angle:0deg; position:relative; display:grid; place-content:center; justify-items:center; width:62px; height:62px; margin-top:8px; padding:0; overflow:hidden; border:3px solid #777b82; border-radius:50%; background:conic-gradient(var(--transform-color) 0 var(--charge-angle), #1b2547 var(--charge-angle) 360deg); color:#d8dadd; cursor:pointer; box-shadow:0 10px 30px rgba(0,0,0,.3); transition:filter .2s, box-shadow .2s, transform .15s; }
.transform-btn::before { content:""; position:absolute; inset:6px; border-radius:50%; background:radial-gradient(circle at 45% 35%,#454950,#25282d 70%); }
.transform-btn > * { position:relative; z-index:1; }
.transform-btn .transform-icon { font-size:13px; line-height:1; color:#aeb1b6; }
.transform-btn strong { font-size:11px; margin:1px 0; }
.transform-btn .transform-state { font-size:9px; color:#bfc2c7; }
.transform-btn.ready { border-color:var(--transform-color); color:#fff; box-shadow:0 0 10px var(--transform-color),0 0 26px var(--transform-color); animation:transform-ready-pulse 1s ease-in-out infinite; }
.transform-btn.ready::before, .transform-btn.active::before { background:radial-gradient(circle at 45% 35%,color-mix(in srgb,var(--transform-color) 70%,white),color-mix(in srgb,var(--transform-color) 40%,black) 75%); }
.transform-btn.ready .transform-icon, .transform-btn.ready .transform-state, .transform-btn.active .transform-icon, .transform-btn.active .transform-state { color:#fff; }
.transform-btn.active { border-color:#fff; color:#fff; box-shadow:0 0 14px var(--transform-color),0 0 34px var(--transform-color); }
.transform-btn:active { transform:scale(.94); }
.transform-btn.hidden { display:none; }
.transform-btn.idle { opacity:.6; cursor:default; }
@keyframes transform-ready-pulse { 50% { filter:brightness(1.35); } }
`;

export function createBetaTransform({ THREE, scene, document, anchor, activate }) {
  const style = document.createElement("style");
  style.textContent = STYLE;
  document.head.append(style);
  const button = document.createElement("button");
  button.id = "transform-btn"; button.type = "button"; button.className = "transform-btn hidden";
  button.innerHTML = '<span class="transform-icon" aria-hidden="true">✦</span><strong>변신</strong><span class="transform-state">0%</span>';
  anchor.after(button);
  const state = button.querySelector(".transform-state");
  button.addEventListener("click", () => activate());
  addEventListener("keydown", event => {
    if (event.code !== "KeyF" || event.repeat || button.classList.contains("hidden")) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? "")) return;
    event.preventDefault(); activate();
  });

  // Outside a bot match (lobby, practice) the button still shows for characters that have a
  // transform, dimmed, so players can see it exists.
  function updateButton(actor, time, characterId = actor?.id) {
    const t = actor?.t ?? TRANSFORMS[characterId];
    button.classList.toggle("hidden", !t);
    button.classList.toggle("idle", !!t && !actor?.t);
    if (!t) return;
    if (!actor?.t) {
      button.style.setProperty("--transform-color", EFFECT_COLOR);
      button.style.setProperty("--charge-angle", "0deg");
      button.classList.remove("ready", "active");
      state.textContent = "경기 전용";
      button.title = `변신 · ${t.name}
${t.summary}
봇 대전 경기에서 궁극기를 충전하면 변신 게이지가 찹니다 (F)`;
      button.setAttribute("aria-label", `변신 ${t.name}`);
      return;
    }
    const active = time < actor.transformUntil;
    const ultimateReady = !t.needsUltimate || actor.charge >= actor.u.chargeRequired;
    const ready = !active && actor.transformCharge >= 1 && ultimateReady;
    const ratio = active ? (actor.transformUntil - time) / t.duration : actor.transformCharge;
    button.style.setProperty("--transform-color", EFFECT_COLOR);
    button.style.setProperty("--charge-angle", `${Math.max(0, Math.min(1, ratio)) * 360}deg`);
    button.classList.toggle("ready", ready);
    button.classList.toggle("active", active);
    state.textContent = active ? `${Math.ceil(actor.transformUntil - time)}초` : ready ? "F" : actor.transformCharge >= 1 ? "궁 필요" : `${Math.floor(actor.transformCharge * 100)}%`;
    button.title = `변신 · ${t.name}\n${t.summary}\n` + (active ? "변신 중"
      : ready ? "F 또는 클릭으로 변신"
      : actor.transformCharge >= 1 ? "궁극기가 충전되면 변신할 수 있습니다" : "궁극기를 충전하면 변신 게이지도 함께 찹니다");
    button.setAttribute("aria-label", `변신 ${t.name}`);
  }

  // World visuals keyed by actor.
  const auras = new Map(), halos = new Map();
  // Soft round glow and a vertical fade, drawn once and shared by every aura.
  const glowTexture = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const g = c.getContext("2d"), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(.35, "rgba(255,255,255,.55)"); r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  const fadeTexture = (() => {
    const c = document.createElement("canvas"); c.width = 4; c.height = 64;
    const g = c.getContext("2d"), r = g.createLinearGradient(0, 0, 0, 64);
    r.addColorStop(0, "rgba(255,255,255,0)"); r.addColorStop(.55, "rgba(255,255,255,.35)"); r.addColorStop(1, "rgba(255,255,255,1)");
    g.fillStyle = r; g.fillRect(0, 0, 4, 64);
    return new THREE.CanvasTexture(c);
  })();
  const FLAMES = 34;
  // Purple aura for the whole transform: a ground glow, a column that fades upward and
  // flame sparks rising around the body.
  function makeAura(color) {
    const group = new THREE.Group();
    const glow = (opacity, extra = {}) => ({ color, transparent: true, opacity, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending, ...extra });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.85, .05, 8, 40), new THREE.MeshBasicMaterial(glow(.9)));
    ring.rotation.x = Math.PI / 2; ring.position.y = .08;
    const disc = new THREE.Mesh(new THREE.CircleGeometry(1.25, 32), new THREE.MeshBasicMaterial(glow(.55, { map: glowTexture })));
    disc.rotation.x = -Math.PI / 2; disc.position.y = .06;
    const column = new THREE.Mesh(new THREE.CylinderGeometry(.7, .95, 2.6, 24, 1, true),
      new THREE.MeshBasicMaterial(glow(.38, { map: fadeTexture, side: THREE.DoubleSide })));
    column.position.y = 1.3;
    group.add(disc, ring, column);
    const light = new THREE.Color(color).lerp(new THREE.Color(0xffffff), .45);
    const flames = Array.from({ length: FLAMES }, (_, i) => {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: i % 4 === 0 ? light : color,
        transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }));
      sprite.userData = { angle: i * 2.39996, radius: .38 + (i * 37 % 10) / 30, speed: .55 + (i * 53 % 10) / 22, offset: (i * 29 % 34) / 34, size: .36 + (i * 17 % 10) / 36 };
      group.add(sprite);
      return sprite;
    });
    group.userData.parts = { ring, disc, column, flames };
    return group;
  }
  function animateAura(group, time, remaining) {
    const { ring, disc, column, flames } = group.userData.parts;
    const pulse = .5 + .5 * Math.sin(time * 8);
    // Flicker during the last second so players see the transform ending.
    const fade = remaining < 1 ? .35 + .65 * Math.abs(Math.sin(time * 14)) : 1;
    ring.scale.setScalar(1 + pulse * .12);
    ring.material.opacity = .9 * fade;
    disc.material.opacity = (.4 + pulse * .2) * fade;
    column.material.opacity = (.28 + pulse * .14) * fade;
    column.rotation.y = time * 1.5;
    for (const sprite of flames) {
      const f = sprite.userData, life = (time * f.speed + f.offset) % 1;
      const angle = f.angle + time * .9;
      const radius = f.radius * (1 - life * .45);
      sprite.position.set(Math.cos(angle) * radius, .15 + life * 2.6, Math.sin(angle) * radius);
      sprite.scale.setScalar(f.size * (1.2 - life * .7));
      sprite.material.opacity = Math.sin(life * Math.PI) * .95 * fade;
    }
  }
  function makeHalo() {
    const halo = new THREE.Mesh(new THREE.TorusGeometry(.4, .055, 8, 32),
      new THREE.MeshBasicMaterial({ color: 0xffe680, transparent: true, opacity: .95, depthWrite: false, depthTest: false, toneMapped: false }));
    halo.rotation.x = Math.PI / 2; halo.renderOrder = 35;
    return halo;
  }
  function sync(map, key, wanted, create, place) {
    let mesh = map.get(key);
    if (!wanted) { if (mesh) { scene.remove(mesh); dispose(mesh); map.delete(key); } return; }
    if (!mesh) { mesh = create(); scene.add(mesh); map.set(key, mesh); }
    place(mesh);
  }
  // Sprites share one geometry inside three.js, so only their materials are freed.
  function dispose(object) { object.traverse(part => { if (!part.isSprite) part.geometry?.dispose(); part.material?.dispose(); }); }

  function updateWorld(world, positionOf, visibleTo) {
    const seen = new Set();
    for (const actor of world?.actors ?? []) {
      seen.add(actor.key);
      const position = positionOf(actor);
      const show = position && actor.hp > 0 && visibleTo(actor);
      const transformed = show && actor.t && world.time < actor.transformUntil;
      sync(auras, actor.key, transformed, () => makeAura(new THREE.Color(EFFECT_COLOR)), group => {
        group.position.set(position.x, position.y, position.z);
        animateAura(group, world.time, actor.transformUntil - world.time);
      });
      const marked = show && world.time < (actor.angelMarkUntil ?? 0);
      sync(halos, actor.key, marked, makeHalo, halo => {
        halo.position.set(position.x, position.y + 2.75 + Math.sin(world.time * 4) * .06, position.z);
        halo.material.opacity = world.time > actor.angelMarkUntil - 1 ? .45 + .5 * Math.abs(Math.sin(world.time * 10)) : .95;
      });
    }
    for (const map of [auras, halos]) for (const key of [...map.keys()]) if (!seen.has(key)) sync(map, key, false);
  }
  function clear() { for (const map of [auras, halos]) for (const key of [...map.keys()]) sync(map, key, false); }

  function heavenMesh() {
    const group = new THREE.Group();
    group.add(new THREE.Mesh(new THREE.SphereGeometry(.17, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false })));
    const glow = new THREE.Mesh(new THREE.SphereGeometry(.3, 12, 10),
      new THREE.MeshBasicMaterial({ color: 0xffe680, transparent: true, opacity: .45, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.26, .03, 6, 24), new THREE.MeshBasicMaterial({ color: 0xffe680, toneMapped: false }));
    ring.rotation.x = Math.PI / 2; ring.position.y = .2;
    group.add(glow, ring);
    return group;
  }
  return { button, updateButton, updateWorld, clear, heavenMesh, effectColor: new THREE.Color(EFFECT_COLOR).getHex() };
}
