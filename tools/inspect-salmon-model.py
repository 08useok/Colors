"""Read the user-supplied Salmon FBX in Blender without changing its source."""
import bpy
import json
from pathlib import Path
from mathutils import Vector

root = Path(__file__).resolve().parent.parent
source = root / 'output/salmon-model-review/source'
out = source.parent
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(next(source.glob('*.fbx'))))
report = {'meshes': [], 'materials': [], 'armatures': [], 'textures': []}
for obj in bpy.context.scene.objects:
    if obj.type == 'ARMATURE':
        report['armatures'].append(obj.name)
    if obj.type != 'MESH':
        continue
    data = obj.data
    data.calc_loop_triangles()
    points = [obj.matrix_world @ Vector(v) for v in obj.bound_box]
    report['meshes'].append({
        'name': obj.name, 'vertices': len(data.vertices), 'faces': len(data.polygons),
        'triangles': len(data.loop_triangles), 'smooth_faces': sum(p.use_smooth for p in data.polygons),
        'custom_normals': data.has_custom_normals,
        'bounds': [[min(v[i] for v in points) for i in range(3)], [max(v[i] for v in points) for i in range(3)]],
        'modifiers': [m.type for m in obj.modifiers],
    })
for material in bpy.data.materials:
    report['materials'].append({'name': material.name, 'nodes': [
        {'name': n.name, 'type': n.type,
         'image': n.image.filepath if n.type == 'TEX_IMAGE' and n.image else None}
        for n in material.node_tree.nodes] if material.use_nodes else [],
        'links': [{'from': l.from_node.name + ':' + l.from_socket.name, 'to': l.to_node.name + ':' + l.to_socket.name}
                  for l in material.node_tree.links] if material.use_nodes else []})
report['total_triangles'] = sum(m['triangles'] for m in report['meshes'])
report['total_faces'] = sum(m['faces'] for m in report['meshes'])
for file in source.glob('*.png'):
    image = bpy.data.images.load(str(file), check_existing=True)
    report['textures'].append({'name': file.name, 'size': list(image.size)})
(out / 'source-audit.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print(json.dumps(report, indent=2))
