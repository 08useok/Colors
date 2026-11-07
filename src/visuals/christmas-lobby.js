import * as THREE from 'three';

// Official Season 1 Christmas lobby. Uses the same placement spots as the Halloween and Champions decor
// (props on parapets or outside walkable rooms; collision, entrances and teleports are untouched),
// plus snow falling over the whole play area.
export const CHRISTMAS_COLORS = { pine: 0x1f6b3a, darkPine: 0x14482a, red: 0xd62839, gold: 0xf2c14e, white: 0xf7fbff, trunk: 0x6b4226 };
const BAUBLES = [0xd62839, 0xf2c14e, 0x4fa3ff, 0xf7fbff, 0xb06bff];

export function createChristmasLobby(scene, map) {
  const root = new THREE.Group(); root.name = 'official-christmas'; map.add(root);
  const backdrop = new THREE.Group(); backdrop.name = 'official-christmas-backdrop'; scene.add(backdrop);
  const standard = (color, metalness = .05, roughness = .75) => new THREE.MeshStandardMaterial({ color, metalness, roughness });
  const pine = standard(CHRISTMAS_COLORS.pine), darkPine = standard(CHRISTMAS_COLORS.darkPine), trunk = standard(CHRISTMAS_COLORS.trunk);
  const gold = standard(CHRISTMAS_COLORS.gold, .7, .3), red = standard(CHRISTMAS_COLORS.red, .1, .5), white = standard(CHRISTMAS_COLORS.white, 0, .9);
  const mesh = (parent, geometry, material, x, y, z) => { const m = new THREE.Mesh(geometry, material); m.position.set(x, y, z); parent.add(m); return m; };
  const lights = [];
  const tree = (parent, scale) => {
    mesh(parent, new THREE.CylinderGeometry(.18 * scale, .22 * scale, .5 * scale, 8), trunk, 0, .25 * scale, 0);
    [[1, .5], [.8, 1.15], [.58, 1.75]].forEach(([r, y], i) => mesh(parent, new THREE.ConeGeometry(r * scale, .9 * scale, 12), i % 2 ? darkPine : pine, 0, (y + .3) * scale, 0));
    const star = mesh(parent, new THREE.OctahedronGeometry(.18 * scale), new THREE.MeshBasicMaterial({ color: CHRISTMAS_COLORS.gold }), 0, 2.55 * scale, 0);
    for (let i = 0; i < 7; i++) {
      const angle = i * 2.4, y = .55 + (i % 3) * .55, r = .85 - (i % 3) * .2;
      const bauble = mesh(parent, new THREE.SphereGeometry(.08 * scale, 8, 6), new THREE.MeshBasicMaterial({ color: BAUBLES[i % BAUBLES.length] }),
        Math.cos(angle) * r * scale, (y + .3) * scale, Math.sin(angle) * r * scale);
      lights.push({ bauble, color: new THREE.Color(BAUBLES[i % BAUBLES.length]), phase: i + parent.id });
    }
    return star;
  };
  const stars = [];

  // Small Christmas trees on the parapets where the trophies / jack-o'-lanterns stood.
  for (const [x, z, y] of [[-9,-10,4.1],[9,-10,4.1],[-10,9,4.1],[10,9,4.1],[-10,0,4.1],[10,0,4.1],[-47,-9,8.8],[-47,9,8.8],[47,-9,5.6],[47,9,5.6],[-9,-47,7.4],[9,-47,7.4],[-9,47,10.8],[9,47,10.8]]) {
    const group = new THREE.Group(); group.name = 'christmas-tree'; group.position.set(x, y, z); root.add(group);
    stars.push(tree(group, .7));
  }

  // Candy canes and presents where the banners stood.
  const caneGeometry = new THREE.CylinderGeometry(.1, .1, 3, 8), hook = new THREE.TorusGeometry(.35, .1, 8, 16, Math.PI);
  const box = new THREE.BoxGeometry(.8, .7, .8), ribbonX = new THREE.BoxGeometry(.82, .72, .16), ribbonZ = new THREE.BoxGeometry(.16, .72, .82);
  [[-17,-16],[17,-16],[-23,14],[23,14],[-31,-18],[31,-18]].forEach(([x, z], i) => {
    const group = new THREE.Group(); group.name = 'candy-cane'; group.position.set(x, -2.5, z); root.add(group);
    const cane = mesh(group, caneGeometry, i % 2 ? red : white, 0, 1.5, 0);
    mesh(group, hook, i % 2 ? white : red, .35, 3, 0).rotation.z = 0;
    cane.name = 'cane';
    for (const [dx, dz, color] of [[.8, .3, BAUBLES[i % 5]], [-.7, .5, BAUBLES[(i + 2) % 5]]]) {
      mesh(group, box, standard(color, .1, .6), dx, .35, dz);
      mesh(group, ribbonX, gold, dx, .35, dz); mesh(group, ribbonZ, gold, dx, .35, dz);
    }
  });

  // A giant lit tree behind the north room, where the stadium / castle stood.
  const giant = new THREE.Group(); giant.name = 'christmas-grand-tree'; giant.position.set(0, -2, -80); backdrop.add(giant);
  stars.push(tree(giant, 9));

  // Snow over the play area: points recycled from the top as they fall below the ground.
  const COUNT = 1400, AREA = 70, HEIGHT = 36;
  const positions = new Float32Array(COUNT * 3), seeds = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() * 2 - 1) * AREA; positions[i * 3 + 2] = (Math.random() * 2 - 1) * AREA;
    seeds[i] = Math.random();
  }
  const snowGeometry = new THREE.BufferGeometry();
  snowGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const snow = new THREE.Points(snowGeometry, new THREE.PointsMaterial({ color: 0xffffff, size: .22, transparent: true, opacity: .85, depthWrite: false }));
  snow.name = 'christmas-snow'; snow.frustumCulled = false; scene.add(snow);

  return {
    root, backdrop, snow,
    update(time) {
      for (const star of stars) star.rotation.y = time * .8;
      for (const light of lights) light.bauble.material.color.copy(light.color).multiplyScalar(.55 + .45 * Math.abs(Math.sin(time * 2 + light.phase)));
      for (let i = 0; i < COUNT; i++) {
        const s = seeds[i];
        positions[i * 3 + 1] = HEIGHT - ((time * (1.2 + s * 1.3) + s * HEIGHT) % (HEIGHT + 4)) - 2;
        positions[i * 3] += Math.sin(time * .7 + s * 40) * .004;
      }
      snowGeometry.attributes.position.needsUpdate = true;
    },
  };
}
