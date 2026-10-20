import * as THREE from 'three';

export const BETA8_LOBBY_ROOMS = Object.freeze([
  Object.freeze({ id: 'graveyard', name: '달빛 묘지', x: 0, z: 40, y: 8.2, action: '녹아웃 입장', radius: 3.2 }),
  Object.freeze({ id: 'workshop', name: '호박 작업장', x: 40, z: 0, y: 3, action: '시즌 상점 열기', radius: 3.2 }),
]);

export function beta8LobbyRoomAt(x, z) {
  return BETA8_LOBBY_ROOMS.find(room => Math.hypot(x - room.x, z - room.z) <= room.radius);
}

// Permanent lobby furnishings: parented to the lobby so matches hide them together.
export function createBeta8LobbyRooms(map, solids) {
  const root = new THREE.Group(); root.name = 'beta8-lobby-rooms'; map.add(root);
  const mat = (color, glow = false) => glow ? new THREE.MeshBasicMaterial({ color }) : new THREE.MeshStandardMaterial({ color, roughness: .78 });
  const stone = mat(0x564264), dark = mat(0x251c33), bone = mat(0xf3e5c9), wood = mat(0x6b3929);
  const orange = mat(0xff852a), green = mat(0xa9e668, true), violet = mat(0xc8acff, true), gold = mat(0xffd285, true);
  const ghosts = [], lanterns = [];
  function mesh(group, geometry, material, x, y, z) {
    const item = new THREE.Mesh(geometry, material); item.position.set(x, y, z);
    item.castShadow = true; item.receiveShadow = true; group.add(item); return item;
  }
  function box(group, x, y, z, w, h, d, material, solid = false) {
    const item = mesh(group, new THREE.BoxGeometry(w, h, d), material, x, y, z);
    if (solid) solids.push({ x: group.position.x + x, z: group.position.z + z, halfW: w / 2, halfD: d / 2,
      top: group.position.y + y + h / 2, mesh: item, walkable: false, destructible: false });
    return item;
  }
  function sign(group, text, x, y, z, color = '#f3e5c9') {
    const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 160;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#251c33'; ctx.fillRect(0, 0, 1024, 160);
    ctx.strokeStyle = color; ctx.lineWidth = 8; ctx.strokeRect(5, 5, 1014, 150);
    ctx.fillStyle = color; ctx.font = 'bold 68px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 512, 83);
    const material = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), side: THREE.DoubleSide });
    const item = mesh(group, new THREE.PlaneGeometry(6.2, .97), material, x, y, z);
    item.name = text; return item;
  }
  function pumpkin(group, x, z) {
    const body = mesh(group, new THREE.SphereGeometry(.55, 12, 8), orange, x, .48, z); body.scale.y = .8;
    mesh(group, new THREE.CylinderGeometry(.06, .08, .22, 6), wood, x, 1, z);
    for (const side of [-1, 1]) box(group, x + side * .18, .56, z + .49, .12, .12, .04, gold);
    box(group, x, .34, z + .5, .25, .07, .04, gold);
  }
  for (const room of BETA8_LOBBY_ROOMS) {
    const group = new THREE.Group(); group.name = `beta8-${room.id}`; group.position.set(room.x, room.y, room.z); root.add(group);
    if (room.id === 'graveyard') {
      // Wide center aisle from the southern staircase to the matchmaking plinth.
      for (let z = -7; z <= 5; z += 2) box(group, 0, .025, z, 3.6, .05, 1.6, stone);
      for (const x of [-7.4, 7.4]) for (const z of [-3, 3.8]) {
        box(group, x, .09, z, 2.7, .18, 2.2, dark);
        box(group, x, .9, z - .6, 1.5, 1.8, .45, stone, true);
        mesh(group, new THREE.SphereGeometry(.75, 12, 8), stone, x, 1.8, z - .6).scale.set(1, .6, .3);
        box(group, x, 1.2, z - .36, .12, .65, .03, bone);
        box(group, x, 1.32, z - .35, .5, .12, .03, bone);
        pumpkin(group, x + (x < 0 ? 1.5 : -1.5), z + .3);
      }
      for (const x of [-3.5, 3.5]) {
        box(group, x, 1.8, 5.8, .55, 3.6, .55, stone, true);
        const lantern = mesh(group, new THREE.OctahedronGeometry(.35), violet, x, 4, 5.8); lanterns.push(lantern);
      }
      box(group, 0, 3.5, 5.8, 7.6, .45, .65, dark);
      sign(group, '달빛 묘지 · KNOCKOUT', 0, 3.5, 5.43, '#cfb2ff').rotation.y = Math.PI;
      sign(group, '3 대 3 · 2라운드 선승', 0, .8, 5.43, '#cfb2ff').rotation.y = Math.PI;
      for (const side of [-1, 1]) {
        const ghost = new THREE.Group(); ghost.position.set(side * 10, 2.2, 0); group.add(ghost);
        mesh(ghost, new THREE.SphereGeometry(.6, 14, 10), bone, 0, .3, 0);
        mesh(ghost, new THREE.ConeGeometry(.6, 1.2, 10), bone, 0, -.2, 0).rotation.z = Math.PI;
        for (const eye of [-1, 1]) mesh(ghost, new THREE.SphereGeometry(.09, 8, 6), dark, eye * .2, .4, .52);
        ghosts.push({ mesh: ghost, y: ghost.position.y, phase: side });
      }
    } else {
      // Workbenches stay against the back wall; the corridor and center stay open.
      for (const z of [-9.5, 9.5]) {
        box(group, 4.5, 1.2, z, 3.2, .28, 2, wood, true);
        for (const x of [3.3, 5.7]) box(group, x, .55, z, .2, 1.1, 1.6, dark);
        for (let i = 0; i < 3; i++) {
          mesh(group, new THREE.CylinderGeometry(.15, .24, .45, 10), i % 2 ? violet : green, 3.5 + i, 1.65, z);
          mesh(group, new THREE.CylinderGeometry(.09, .09, .15, 8), wood, 3.5 + i, 1.95, z);
        }
      }
      box(group, 5.4, .3, 0, 2.6, .6, 2.6, dark, true);
      mesh(group, new THREE.SphereGeometry(1.1, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), dark, 5.4, 1.4, 0).rotation.z = Math.PI;
      mesh(group, new THREE.CircleGeometry(.95, 24), green, 5.4, 1.42, 0).rotation.x = -Math.PI / 2;
      for (const z of [-5, 5]) pumpkin(group, 5.4, z);
      const banner = sign(group, '호박 작업장 · 시즌 상점', 5.2, 3.6, 0, '#ffd285'); banner.rotation.y = -Math.PI / 2;
      for (let i = 0; i < 5; i++) {
        const bubble = mesh(group, new THREE.SphereGeometry(.12 + i * .02, 8, 6), green, 5.4 + Math.sin(i) * .5, 1.8 + i * .25, Math.cos(i) * .5);
        ghosts.push({ mesh: bubble, y: bubble.position.y, phase: i });
      }
      for (const z of [-9.5, 9.5]) box(group, -5, .6, z, 1.8, 1.2, 1.8, wood, true);
    }
    // Square mosaic, without a ring or automatic teleport trigger.
    box(group, 0, .04, 0, 2.8, .08, 2.8, room.id === 'graveyard' ? violet : gold);
    const hint = sign(group, room.action, 0, .12, 0, room.id === 'graveyard' ? '#cfb2ff' : '#ffd285');
    hint.rotation.x = -Math.PI / 2;
  }
  return { root, update(time) {
    for (const g of ghosts) g.mesh.position.y = g.y + Math.sin(time * 1.6 + g.phase) * .18;
    for (const lamp of lanterns) lamp.rotation.y = time * .5;
  } };
}
