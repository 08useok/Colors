// Transform (변신) for the beta match screen: the round gauge button (key F) and the in-world
// visuals — an aura around transformed fighters, the angel mark halo and Heaven rounds.

const STYLE = `
.transform-btn { --transform-color:#fff2a8; --charge-angle:0deg; position:relative; display:grid; place-content:center; justify-items:center; width:62px; height:62px; margin-top:8px; padding:0; overflow:hidden; border:3px solid #777b82; border-radius:50%; background:conic-gradient(var(--transform-color) 0 var(--charge-angle), #1b2547 var(--charge-angle) 360deg); color:#d8dadd; cursor:pointer; box-shadow:0 10px 30px rgba(0,0,0,.3); transition:filter .2s, box-shadow .2s, transform .15s; }
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

  function updateButton(actor, time) {
    const t = actor?.t;
    button.classList.toggle("hidden", !t);
    if (!t) return;
    const active = time < actor.transformUntil;
    const ultimateReady = !t.needsUltimate || actor.charge >= actor.u.chargeRequired;
    const ready = !active && actor.transformCharge >= 1 && ultimateReady;
    const ratio = active ? (actor.transformUntil - time) / t.duration : actor.transformCharge;
    button.style.setProperty("--transform-color", t.color);
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
  function makeAura(color) {
    const group = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.85, .05, 8, 40),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .85, depthWrite: false, toneMapped: false }));
    ring.rotation.x = Math.PI / 2; ring.position.y = .08;
    const column = new THREE.Mesh(new THREE.CylinderGeometry(.75, .9, 2.4, 24, 1, true),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .16, side: THREE.DoubleSide, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }));
    column.position.y = 1.2;
    group.add(ring, column);
    group.userData.parts = { ring, column };
    return group;
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
  function dispose(object) { object.traverse(part => { part.geometry?.dispose(); part.material?.dispose(); }); }

  function updateWorld(world, positionOf, visibleTo) {
    const seen = new Set();
    for (const actor of world?.actors ?? []) {
      seen.add(actor.key);
      const position = positionOf(actor);
      const show = position && actor.hp > 0 && visibleTo(actor);
      const transformed = show && actor.t && world.time < actor.transformUntil;
      sync(auras, actor.key, transformed, () => makeAura(new THREE.Color(actor.t.color)), group => {
        group.position.set(position.x, position.y, position.z);
        const pulse = .5 + .5 * Math.sin(world.time * 8);
        group.userData.parts.ring.scale.setScalar(1 + pulse * .12);
        group.userData.parts.column.material.opacity = .1 + pulse * .1;
        group.rotation.y = world.time * 1.5;
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
  return { button, updateButton, updateWorld, clear, heavenMesh };
}
