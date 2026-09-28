import * as THREE from "three";

function mesh(geometry, material, position = [0, 0, 0]) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(...position);
  object.castShadow = true;
  object.receiveShadow = true;
  return object;
}

export function createYellowCircuitDeviceMesh() {
  const group = new THREE.Group();
  group.name = "YellowCircuitDevice";
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x302b20, metalness: 0.82, roughness: 0.28 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xa88720, metalness: 0.72, roughness: 0.3 });
  const yellow = new THREE.MeshStandardMaterial({ color: 0xffff45, emissive: 0xffc400, emissiveIntensity: 1.8, metalness: 0.28, roughness: 0.24 });
  const ceramic = new THREE.MeshStandardMaterial({ color: 0xfff2a3, emissive: 0x6b4d00, emissiveIntensity: 0.45, roughness: 0.42 });

  group.add(
    mesh(new THREE.CylinderGeometry(0.7, 0.78, 0.18, 16), darkMetal, [0, 0.09, 0]),
    mesh(new THREE.CylinderGeometry(0.6, 0.68, 0.24, 16), brass, [0, 0.28, 0]),
    mesh(new THREE.CylinderGeometry(0.42, 0.52, 0.12, 16), darkMetal, [0, 0.46, 0]),
    mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.72, 10), brass, [0, 0.76, 0]),
  );

  for (const angle of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
    const foot = mesh(new THREE.BoxGeometry(0.32, 0.12, 0.24), darkMetal, [Math.sin(angle) * 0.68, 0.08, Math.cos(angle) * 0.68]);
    foot.rotation.y = angle;
    group.add(foot);
  }

  for (const side of [-1, 1]) {
    const insulator = new THREE.Group();
    insulator.position.set(side * 0.38, 0.58, 0);
    for (let index = 0; index < 3; index += 1) {
      insulator.add(mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.08, 12), ceramic, [0, index * 0.11, 0]));
    }
    insulator.add(mesh(new THREE.SphereGeometry(0.1, 10, 8), yellow, [0, 0.34, 0]));
    group.add(insulator);
  }

  const lowerCoil = mesh(new THREE.TorusGeometry(0.43, 0.095, 10, 28), yellow, [0, 0.79, 0]);
  lowerCoil.rotation.x = Math.PI / 2;
  const upperCoil = mesh(new THREE.TorusGeometry(0.31, 0.075, 10, 24), yellow, [0, 1.02, 0]);
  upperCoil.rotation.x = Math.PI / 2;
  upperCoil.rotation.z = Math.PI / 4;
  const core = mesh(new THREE.OctahedronGeometry(0.23, 1), new THREE.MeshBasicMaterial({ color: 0xffffc4, toneMapped: false }), [0, 0.96, 0]);
  core.name = "YellowCircuitCore";
  group.add(lowerCoil, upperCoil, core);
  group.userData.core = core;
  return group;
}

export function updateYellowCircuitDeviceMesh(group, time) {
  const core = group?.userData?.core;
  if (!core) return;
  core.rotation.y = time * 3.2;
  core.rotation.x = time * 1.7;
  const pulse = 0.92 + Math.sin(time * 7) * 0.12;
  core.scale.setScalar(pulse);
}

export function createYellowCircuitWireMesh(start, end, active = false) {
  const points = [];
  const tubularSegments = 28;
  const radialSegments = 8;
  for (let index = 0; index <= 14; index += 1) {
    const t = index / 14;
    const point = start.clone().lerp(end, t);
    point.y -= Math.sin(t * Math.PI) * 0.2;
    points.push(point);
  }
  const geometry = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points),
    tubularSegments,
    active ? 0.12 : 0.1,
    radialSegments,
    false,
  );
  const colors = [];
  const yellow = new THREE.Color(active ? 0xffffa8 : 0xe6b91f);
  const dark = new THREE.Color(0x2b2619);
  for (let index = 0; index < geometry.attributes.position.count; index += 1) {
    const ring = Math.floor(index / (radialSegments + 1));
    const color = active || Math.floor(ring / 3) % 2 === 0 ? yellow : dark;
    colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    vertexColors: true,
    emissive: active ? 0xffd400 : 0x3a2800,
    emissiveIntensity: active ? 2.1 : 0.42,
    metalness: 0.24,
    roughness: 0.5,
    transparent: active,
    opacity: 1,
  });
  const wire = new THREE.Mesh(geometry, material);
  wire.name = active ? "YellowCircuitCurrent" : "YellowCircuitCable";
  wire.castShadow = true;
  return wire;
}
