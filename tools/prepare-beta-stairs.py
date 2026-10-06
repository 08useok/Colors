"""Build the beta stairs runtime GLB with Blender (run with blender -b --python ...)."""
from pathlib import Path
import bpy

root = Path(__file__).resolve().parent.parent
folder = root / 'assets/3d/environment/beta-stairs'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(folder / 'stairs.fbx'))
for material in bpy.data.materials:
    if not material.use_nodes:
        continue
    for node in material.node_tree.nodes:
        if node.type != 'TEX_IMAGE':
            continue
        socket = next((link.to_socket.name for output in node.outputs for link in output.links), '')
        texture = {'Base Color': 'stairs.png', 'Color': 'stairs_normal.png',
                   'Metallic': 'stairs_metallic.png', 'Roughness': 'stairs_roughness.png'}.get(socket)
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
    print('STAIRS_BOUNDS', [(min(v[i] for v in coords), max(v[i] for v in coords)) for i in range(3)])
    # FBX Z becomes glTF Y; Blender +Y becomes glTF -Z (the ascending end).
    from mathutils.bvhtree import BVHTree
    bvh=BVHTree.FromObject(obj,bpy.context.evaluated_depsgraph_get())
    tread=[]
    for i in range(41):
        hit=bvh.ray_cast(Vector((0,-.5+i/40,2)),Vector((0,0,-1)))[0]
        if hit is None: raise RuntimeError('Missing central stair tread')
        tread.append(hit.z)
    import json
    (folder/'stairs-profile.json').write_text(json.dumps({'low':tread[0],'high':tread[-1],'treads':tread,'ascendingAxis':'-Z'},indent=2)+'\n')
    profile={'low':tread[0],'high':tread[-1],'treads':tread,'ascendingAxis':'-Z'}
    (root/'src/config/beta-stairs-profile.js').write_text('// Generated from the FBX central tread ray samples by prepare-beta-stairs.py.\nexport const BETA_STAIRS_PROFILE = '+json.dumps(profile,separators=(',',':'))+';\n',encoding='utf-8')
    print('STAIRS_WALK_RISE',tread[-1]-tread[0])
    before = len(obj.data.polygons)
    modifier = obj.modifiers.new('Runtime stairs reduction', 'DECIMATE')
    modifier.ratio = min(1, 15000 / before)
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    obj.data.validate(clean_customdata=True)
    obj.data.update()
    print('STAIRS_FACES', before, len(obj.data.polygons))
    obj.select_set(False)
bpy.ops.export_scene.gltf(filepath=str(folder / 'stairs.glb'), export_format='GLB',
                          export_animations=False, export_image_format='AUTO')
