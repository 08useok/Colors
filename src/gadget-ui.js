// Gadget (가젯) button for the official-season match screen: a round cooldown gauge next to the
// transform button, key E. Shown only for characters that have a gadget.
const STYLE = `
.gadget-btn { --gadget-color:#38d9c8; --charge-angle:360deg; position:relative; display:grid; place-content:center; justify-items:center; width:56px; height:56px; margin-top:8px; padding:0; overflow:hidden; border:3px solid #777b82; border-radius:50%; background:conic-gradient(var(--gadget-color) 0 var(--charge-angle), #1b2547 var(--charge-angle) 360deg); color:#d8dadd; cursor:pointer; box-shadow:0 10px 30px rgba(0,0,0,.3); transition:filter .2s, box-shadow .2s, transform .15s; }
.gadget-btn::before { content:""; position:absolute; inset:6px; border-radius:50%; background:radial-gradient(circle at 45% 35%,#454950,#25282d 70%); }
.gadget-btn > * { position:relative; z-index:1; }
.gadget-btn .gadget-icon { font-size:12px; line-height:1; }
.gadget-btn strong { font-size:10px; margin:1px 0; }
.gadget-btn .gadget-state { font-size:9px; color:#bfc2c7; }
.gadget-btn.ready { border-color:var(--gadget-color); color:#fff; box-shadow:0 0 10px var(--gadget-color),0 0 22px var(--gadget-color); }
.gadget-btn.ready::before { background:radial-gradient(circle at 45% 35%,color-mix(in srgb,var(--gadget-color) 70%,white),color-mix(in srgb,var(--gadget-color) 40%,black) 75%); }
.gadget-btn.ready .gadget-state { color:#fff; }
.gadget-btn:active { transform:scale(.94); }
.gadget-btn.hidden { display:none; }
`;

export function createGadgetUi({ document, anchor, activate }) {
  const style = document.createElement("style");
  style.textContent = STYLE;
  document.head.append(style);
  const button = document.createElement("button");
  button.id = "gadget-btn"; button.type = "button"; button.className = "gadget-btn hidden";
  button.innerHTML = '<span class="gadget-icon" aria-hidden="true">⚙</span><strong>가젯</strong><span class="gadget-state">E</span>';
  anchor.after(button);
  const state = button.querySelector(".gadget-state");
  button.addEventListener("click", () => activate());
  addEventListener("keydown", event => {
    // The lobby's room door also uses E; it handles the key first and marks it as used.
    if (event.code !== "KeyE" || event.repeat || event.defaultPrevented || button.classList.contains("hidden")) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? "")) return;
    event.preventDefault(); activate();
  });

  function updateButton(actor, time) {
    const g = actor?.g;
    button.classList.toggle("hidden", !g);
    if (!g) return;
    const left = Math.max(0, (actor.gadgetReadyAt ?? 0) - time), ready = left <= 0;
    button.style.setProperty("--charge-angle", `${(1 - left / g.cooldown) * 360}deg`);
    button.classList.toggle("ready", ready);
    state.textContent = ready ? "E" : `${Math.ceil(left)}초`;
    button.title = `가젯 · ${g.name}\n${g.summary}\n쿨타임 ${g.cooldown}초 · ` + (ready ? "E 또는 클릭으로 사용" : `${Math.ceil(left)}초 뒤 사용 가능`);
    button.setAttribute("aria-label", `가젯 ${g.name}`);
  }
  return { button, updateButton };
}
