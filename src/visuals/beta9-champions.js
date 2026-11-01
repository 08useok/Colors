import * as THREE from 'three';

export const CHAMPIONS_COLORS = { gold: 0xf2c14e, deepGold: 0xb8860b, navy: 0x121a33, royal: 0x263a6e, silver: 0xcfd8e8, light: 0xfff4c8 };
// Banner colours follow the roadmap's TOP 9 final: one flag per finalist slot.
const FINALIST_COLORS = [0xff4444, 0x44cc66, 0x4488ff, 0xffa500, 0xffe14d, 0x0ff0fe, 0xb36bff, 0xf4a6c0, 0xfe7974];

// Season 9 Champions lobby. Same placement rules as the Halloween decor: props sit on
// parapets or outside walkable rooms and never change collision, entrances or teleports.
export function createChampionsLobby(scene, map) {
  const root = new THREE.Group(); root.name = 'beta9-champions'; map.add(root);
  const backdrop = new THREE.Group(); backdrop.name = 'beta9-champions-stadium'; scene.add(backdrop);
  const standard = (color, metalness = .1, roughness = .7) => new THREE.MeshStandardMaterial({ color, metalness, roughness });
  const gold = standard(CHAMPIONS_COLORS.gold, .75, .3), navy = standard(CHAMPIONS_COLORS.navy), silver = standard(CHAMPIONS_COLORS.silver, .6, .35);
  const glow = new THREE.MeshBasicMaterial({ color: CHAMPIONS_COLORS.light });
  const mesh = (parent, geometry, material, x, y, z) => { const m = new THREE.Mesh(geometry, material); m.position.set(x, y, z); parent.add(m); return m; };

  // Small trophies on the parapets where the jack-o'-lanterns stood.
  const cup = new THREE.CylinderGeometry(.5, .22, .8, 16), stemShape = new THREE.CylinderGeometry(.09, .09, .4, 8), base = new THREE.BoxGeometry(.7, .22, .7);
  const handle = new THREE.TorusGeometry(.22, .05, 6, 12);
  const trophies = [];
  for (const [x, z, y] of [[-9,-10,4.1],[9,-10,4.1],[-10,9,4.1],[10,9,4.1],[-10,0,4.1],[10,0,4.1],[-47,-9,8.8],[-47,9,8.8],[47,-9,5.6],[47,9,5.6],[-9,-47,7.4],[9,-47,7.4],[-9,47,10.8],[9,47,10.8]]) {
    const group = new THREE.Group(); group.name = 'champion-trophy'; group.position.set(x, y, z); root.add(group);
    mesh(group, base, navy, 0, .11, 0);
    mesh(group, stemShape, gold, 0, .42, 0);
    mesh(group, cup, gold, 0, 1.02, 0);
    for (const side of [-1, 1]) mesh(group, handle, gold, side * .5, 1.05, 0).rotation.y = Math.PI / 2;
    trophies.push(group);
  }

  // Finalist banners where the grave markers stood.
  const flags = [];
  const pole = new THREE.CylinderGeometry(.08, .08, 4.2, 8), cloth = new THREE.PlaneGeometry(1.6, 1.1, 6, 1);
  [[-17,-16],[17,-16],[-23,14],[23,14],[-31,-18],[31,-18]].forEach(([x, z], i) => {
    const group = new THREE.Group(); group.name = 'finalist-banner'; group.position.set(x, -2.5, z); root.add(group);
    mesh(group, pole, silver, 0, 2.1, 0);
    mesh(group, new THREE.SphereGeometry(.16, 10, 8), gold, 0, 4.3, 0);
    const flag = mesh(group, cloth, new THREE.MeshStandardMaterial({ color: FINALIST_COLORS[i % FINALIST_COLORS.length], side: THREE.DoubleSide, roughness: .8 }), .82, 3.55, 0);
    flags.push({ flag, base: flag.geometry.attributes.position.array.slice(), phase: i });
  });

  // Stadium silhouette and a giant trophy behind the north room, replacing the castle and moon.
  for (const [x, h] of [[-30,14],[-18,18],[18,18],[30,14]]) mesh(backdrop, new THREE.BoxGeometry(10, h, 7), navy, x, h / 2 - 2.6, -78);
  mesh(backdrop, new THREE.BoxGeometry(70, 3, 7), standard(CHAMPIONS_COLORS.royal), 0, 19, -78);
  const giant = new THREE.Group(); giant.name = 'champions-grand-trophy'; giant.position.set(0, 4, -80); backdrop.add(giant);
  mesh(giant, new THREE.BoxGeometry(8, 3, 8), navy, 0, 1.5, 0);
  mesh(giant, new THREE.CylinderGeometry(.9, .9, 6, 16), gold, 0, 6, 0);
  mesh(giant, new THREE.CylinderGeometry(6, 2.4, 9, 24), gold, 0, 13.5, 0);
  for (const side of [-1, 1]) mesh(giant, new THREE.TorusGeometry(3, .45, 8, 20), gold, side * 6, 14, 0).rotation.y = Math.PI / 2;
  const star = mesh(giant, new THREE.OctahedronGeometry(1.6), new THREE.MeshBasicMaterial({ color: CHAMPIONS_COLORS.light, fog: false }), 0, 20.5, 0);
  star.name = 'champions-star';

  // Spotlight beams sweeping the sky.
  const beams = [];
  const beamGeometry = new THREE.ConeGeometry(3.2, 60, 16, 1, true); beamGeometry.translate(0, -30, 0);
  for (const x of [-34, -12, 12, 34]) {
    const beam = mesh(backdrop, beamGeometry, new THREE.MeshBasicMaterial({ color: CHAMPIONS_COLORS.light, transparent: true, opacity: .12, depthWrite: false, side: THREE.DoubleSide, fog: false }), x, 46, -76);
    beam.name = 'champions-spotlight'; beams.push({ beam, phase: x });
  }

  return {
    root, backdrop,
    update(time) {
      for (const t of trophies) t.rotation.y = time * .4;
      star.rotation.y = time * .8;
      for (const { beam, phase } of beams) beam.rotation.z = Math.PI + Math.sin(time * .35 + phase) * .32;
      for (const f of flags) {
        const pos = f.flag.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) pos.array[i * 3 + 2] = Math.sin(time * 2.4 + f.phase + f.base[i * 3] * 1.8) * .12 * (f.base[i * 3] + .8);
        pos.needsUpdate = true;
      }
    },
  };
}
