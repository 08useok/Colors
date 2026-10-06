"""Build the beta wall runtime GLB with Blender (run with blender -b --python ...)."""
from pathlib import Path
import bpy

root = Path(__file__).resolve().parent.parent
folder = root / 'assets/3d/environment/beta-wall'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(folder / 'wall.fbx'))
for material in bpy.data.materials:
    if not material.use_nodes:
        continue
    for node in material.node_tree.nodes:
        if node.type != 'TEX_IMAGE':
            continue
        socket = next((link.to_socket.name for output in node.outputs for link in output.links), '')
        texture = {'Base Color': 'wall.png', 'Color': 'wall_normal.png',
                   'Metallic': 'wall_metallic.png', 'Roughness': 'wall_roughness.png'}.get(socket)
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
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    before = len(obj.data.polygons)
    modifier = obj.modifiers.new('Runtime wall reduction', 'DECIMATE')
    modifier.ratio = min(1, 6000 / before)
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    print('WALL_FACES', before, len(obj.data.polygons))
    obj.select_set(False)
bpy.ops.export_scene.gltf(filepath=str(folder / 'wall.glb'), export_format='GLB',
                          export_animations=False, export_image_format='AUTO')
