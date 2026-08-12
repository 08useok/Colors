import * as THREE from "three";

const CROWN_STYLES = {
  alphaChampion: {
    metal: 0x24dbe8, emissive: 0x07556b, jewel: 0xffd43b, jewelEmissive: 0x6b3d00,
    spikeCount: 6, metalness: 0.9, roughness: 0.16, emissiveIntensity: 0.38,
  },
  champion: {
    metal: 0xffd43b, emissive: 0x5a3500, jewel: 0xe92d4f, jewelEmissive: 0x5d0013,
    spikeCount: 5, metalness: 0.88, roughness: 0.18, emissiveIntensity: 0.28,
  },
  runnerUp: {
    metal: 0xdce7ef, emissive: 0x263844, jewel: 0x3a8cff, jewelEmissive: 0x08265f,
    spikeCount: 4, metalness: 0.94, roughness: 0.22, emissiveIntensity: 0.16,
  },
  third: {
    metal: 0xb86b32, emissive: 0x3d1608, jewel: 0x36c56a, jewelEmissive: 0x073d1a,
    spikeCount: 3, metalness: 0.76, roughness: 0.3, emissiveIntensity: 0.1,
  },
};

// 순위별 약 19,000~20,000개의 삼각형으로 구성된 공용 고해상도 왕관.
export function createHighPolyCrown(variant = "champion") {
  const style = CROWN_STYLES[variant] || CROWN_STYLES.champion;
  const crown = new THREE.Group();
  const gold = new THREE.MeshStandardMaterial({
    color: style.metal,
    emissive: style.emissive,
    emissiveIntensity: style.emissiveIntensity,
    metalness: style.metalness,
    roughness: style.roughness,
  });
  const jewel = new THREE.MeshStandardMaterial({
    color: style.jewel,
    emissive: style.jewelEmissive,
    emissiveIntensity: 0.55,
    metalness: 0.25,
    roughness: 0.12,
  });

  const profile = [];
  for (let i = 0; i < 32; i += 1) {
    const t = i / 31;
    const edgeCurve = Math.sin(t * Math.PI) * 0.035;
    const engravedRipple = Math.sin(t * Math.PI * 6) * 0.008;
    profile.push(new THREE.Vector2(0.57 + edgeCurve + engravedRipple, t * 0.42));
  }
  const band = new THREE.Mesh(new THREE.LatheGeometry(profile, 256), gold);
  band.position.y = -0.08;
  crown.add(band);

  const lowerRim = new THREE.Mesh(new THREE.TorusGeometry(0.585, 0.048, 12, 128), gold);
  lowerRim.rotation.x = Math.PI / 2;
  lowerRim.position.y = -0.07;
  crown.add(lowerRim);

  for (let i = 0; i < style.spikeCount; i += 1) {
    const angle = (i / style.spikeCount) * Math.PI * 2;
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.52, 24), gold);
    spike.position.set(Math.cos(angle) * 0.48, 0.57, Math.sin(angle) * 0.48);
    spike.rotation.z = -Math.cos(angle) * 0.09;
    spike.rotation.x = Math.sin(angle) * 0.09;
    crown.add(spike);

    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.085, 1), jewel);
    gem.position.set(Math.cos(angle) * 0.585, 0.14, Math.sin(angle) * 0.585);
    gem.rotation.set(0.35, -angle, 0.25);
    crown.add(gem);
  }

  crown.traverse((part) => {
    if (!part.isMesh) return;
    part.castShadow = true;
    part.receiveShadow = true;
  });
  crown.scale.setScalar(0.36);
  crown.userData.approximateTriangles = 18944 + style.spikeCount * 80;
  crown.userData.bottomY = -0.118;
  crown.userData.variant = variant;
  return crown;
}

export function fitCrownToHead(crown, headTop) {
  crown.position.y = headTop - crown.userData.bottomY * crown.scale.y;
}

export function getCrownVariant(skinId) {
  if (skinId === "alpha_champion_cyan") return "alphaChampion";
  if (skinId === "crown_pink") return "runnerUp";
  if (skinId === "crown_green") return "third";
  return "champion";
}
