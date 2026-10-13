export function createAimGuide(THREE, parent, color = 0xffffff) {
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .4, side: THREE.DoubleSide, depthWrite: false, depthTest: false, toneMapped: false });
  group.visible = false;
  parent.add(group);
  let signature = '';
  return {
    group,
    show(parts, position, yaw, opacity = .4) {
      group.visible = parts.length > 0;
      group.position.copy(position);
      group.position.y += .2;
      group.rotation.y = yaw;
      material.opacity = opacity;
      const key = JSON.stringify(parts, (k, v) => typeof v === 'number' ? Math.round(v * 100) / 100 : v);
      if (signature === key) return;
      signature = key;
      for (const mesh of [...group.children]) { mesh.geometry.dispose(); group.remove(mesh); }
      for (const p of parts) {
        let geometry;
        if (p.type === 'beam') geometry = new THREE.PlaneGeometry(p.width, Math.max(.001, p.range));
        else if (p.type === 'ring') geometry = new THREE.RingGeometry(Math.max(.01, p.radius - .08), p.radius, 48);
        else {
          const shape = new THREE.Shape(); shape.moveTo(0, 0);
          for (let i = 0; i <= 32; i++) { const a = -p.angle / 2 + p.angle * i / 32; shape.lineTo(Math.sin(a) * p.range, Math.cos(a) * p.range); }
          shape.closePath(); geometry = new THREE.ShapeGeometry(shape);
        }
        const mesh = new THREE.Mesh(geometry, material);
        // ShapeGeometry's positive Y must become positive ground Z.
        mesh.rotation.x = p.type === 'fan' ? Math.PI / 2 : -Math.PI / 2;
        mesh.position.set(p.x ?? 0, .01, p.z ?? (p.type === 'beam' ? p.range / 2 : 0));
        mesh.renderOrder = 20;
        group.add(mesh);
      }
    },
    hide() { group.visible = false; },
  };
}
