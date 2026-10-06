"""Build the beta obelisk runtime GLB with Blender (run with blender -b --python ...)."""
from pathlib import Path
import bpy

root = Path(__file__).resolve().parent.parent
folder = root / 'assets/3d/environment/beta-obelisk'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(folder / 'obelisk.fbx'))
for material in bpy.data.materials:
    if not material.use_nodes:
        continue
    for node in material.node_tree.nodes:
        if node.type != 'TEX_IMAGE':
            continue
        socket = next((link.to_socket.name for output in node.outputs for link in output.links), '')
        texture = {'Base Color': 'obelisk.png', 'Color': 'obelisk_normal.png',
                   'Metallic': 'obelisk_metallic.png', 'Roughness': 'obelisk_roughness.png'}.get(socket)
        if texture:
            image = bpy.data.images.load(str(folder / texture), check_existing=True)
            if socket != 'Base Color':
                image.colorspace_settings.name = 'Non-Color'
            image.scale(1024, 1024)
            node.image = image
for obj in list(bpy.context.scene.objects):
    if obj.type != 'MESH':
        bpy.data.objects.remove(obj, do_unlink=True)
        continue
    obj.data.validate(clean_customdata=True)
    obj.data.update()
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    from mathutils import Vector
    coords = [obj.matrix_world @ Vector(v) for v in obj.bound_box]
    print('OBELISK_BOUNDS', [(min(v[i] for v in coords), max(v[i] for v in coords)) for i in range(3)])
    before = len(obj.data.polygons)
    modifier = obj.modifiers.new('Runtime obelisk reduction', 'DECIMATE')
    modifier.ratio = min(1, 6000 / before)
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    obj.data.validate(clean_customdata=True)
    obj.data.update()
    print('OBELISK_FACES', before, len(obj.data.polygons))
    obj.select_set(False)
bpy.ops.export_scene.gltf(filepath=str(folder / 'obelisk.glb'), export_format='GLB',
                          export_animations=False, export_image_format='AUTO')
