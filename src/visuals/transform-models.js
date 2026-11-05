const FORM_IDS = new Set(['orange', 'chartreuse']);
const MOTIONS = ['Idle', 'Walk', 'Attack', 'Ultimate'];

export function createTransformModels({ THREE, loader, clone }) {
  const assets = new Map();
  const forms = new Map();

  function preload(id) {
    if (!FORM_IDS.has(id) || assets.has(id)) return;
    const entry = {};
    assets.set(id, entry);
    loader.loadAsync(`./assets/3d/${id}/transform/motions.glb?v=1`).then(asset => {
      if (!MOTIONS.every(name => asset.animations.some(clip => clip.name === name))) {
        throw new Error('Transform model is missing motion clips');
      }
      entry.asset = asset;
    }).catch(error => {
      assets.delete(id);
      console.warn(`Could not load ${id} transform model`, error);
    });
  }

  function remove(actor, form) {
    for (const [object, visible] of form.hidden) object.visible = visible;
    if (form.pivot) {
      form.mixer.stopAllAction();
      form.mixer.uncacheRoot(form.model);
      form.pivot.removeFromParent();
      form.model.traverse(part => { if (part.isSkinnedMesh) part.skeleton.dispose(); });
    }
    forms.delete(actor);
  }

  function cue(actor, name, time) {
    if (!FORM_IDS.has(actor.id) || time >= actor.transformUntil) return;
    if (!forms.has(actor)) forms.set(actor, { hidden: new Map() });
    forms.get(actor).cue = { name, time };
  }

  function update(world, dt, resolve) {
    const active = new Set();
    for (const actor of world.actors) {
      if (!FORM_IDS.has(actor.id) || actor.hp <= 0 || world.time >= actor.transformUntil) continue;
      const target = resolve(actor);
      if (!target) continue;
      active.add(actor);
      let form = forms.get(actor);
      if (!form) {
        form = { hidden: new Map() };
        forms.set(actor, form);
      }
      const asset = assets.get(actor.id)?.asset;
      if (!asset) continue;
      if (!form.pivot) {
        const model = clone(asset.scene);
        const bounds = new THREE.Box3().setFromObject(model, true);
        const scale = (actor.id === 'chartreuse' ? 2.85 : 2.7) / (bounds.max.y - bounds.min.y);
        const center = bounds.getCenter(new THREE.Vector3());
        const pivot = new THREE.Group();
        pivot.name = `TransformModel:${actor.id}`;
        pivot.scale.setScalar(scale);
        pivot.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
        pivot.add(model);
        model.traverse(part => {
          if (!part.isMesh) return;
          part.castShadow = true;
          part.receiveShadow = true;
          part.frustumCulled = false;
        });
        const mixer = new THREE.AnimationMixer(model);
        const actions = Object.fromEntries(MOTIONS.map(name => [name, mixer.clipAction(asset.animations.find(clip => clip.name === name))]));
        for (const name of ['Attack', 'Ultimate']) actions[name].setLoop(THREE.LoopOnce, 1);
        target.root.add(pivot);
        Object.assign(form, { model, pivot, mixer, actions });
      }
      const base = target.base.filter(Boolean);
      for (const object of form.hidden.keys()) if (!base.includes(object)) form.hidden.delete(object);
      for (const object of base) {
        if (!form.hidden.has(object)) form.hidden.set(object, object.visible);
        object.visible = false;
      }
      const cue = form.cue;
      const useCue = cue && world.time - cue.time < form.actions[cue.name].getClip().duration;
      const name = useCue ? cue.name : Math.hypot(actor.vx ?? 0, actor.vz ?? 0) > .25 ? 'Walk' : 'Idle';
      if (name !== form.current || (useCue && cue !== form.playedCue)) {
        form.mixer.stopAllAction();
        form.actions[name].reset().play();
        form.current = name;
        form.playedCue = useCue ? cue : null;
      }
      form.mixer.update(dt);
    }
    for (const [actor, form] of forms) if (!active.has(actor)) remove(actor, form);
  }

  return { preload, update, cue, clear() { for (const [actor, form] of forms) remove(actor, form); } };
}
