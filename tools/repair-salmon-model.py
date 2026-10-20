"""Compare Salmon's imported material, clean shading and gentle surface smoothing."""
import bpy
import json
from pathlib import Path
from mathutils import Vector

root = Path(__file__).resolve().parent.parent
source = root / 'output/salmon-model-review/source'
out = source.parent
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(next(source.glob('*.fbx'))))
obj = next(o for o in bpy.context.scene.objects if o.type == 'MESH')
original_data = obj.data.copy()
material = obj.data.materials[0]
bsdf = next(n for n in material.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
normal = next(n for n in material.node_tree.nodes if n.type == 'NORMAL_MAP')
textures = { 'Base Color': next(source.glob('*_texture.png')), 'Normal': next(source.glob('*_normal.png')),
             'Roughness': next(source.glob('*_roughness.png')), 'Metallic': next(source.glob('*_metallic.png')) }
for name, path in textures.items():
    node = next((l.from_node for l in material.node_tree.links if l.to_socket == bsdf.inputs.get(name)), None)
    if name == 'Normal':
        node = next(l.from_node for l in material.node_tree.links if l.to_socket == normal.inputs['Color'])
    if node and node.type == 'TEX_IMAGE':
        node.image = bpy.data.images.load(str(path), check_existing=True)
        node.image.colorspace_settings.name = 'sRGB' if name == 'Base Color' else 'Non-Color'
original_material = material.copy()

scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 24
scene.cycles.use_denoising = True
scene.render.resolution_x = 720
scene.render.resolution_y = 960
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.world = bpy.data.worlds.new('comparison-world')
scene.world.use_nodes = True
scene.world.node_tree.nodes['Background'].inputs['Color'].default_value = (.55,.55,.55,1)
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value = .5
scene.view_settings.view_transform = 'AgX'

def aim(item, point):
    item.rotation_euler = (Vector(point) - item.location).to_track_quat('-Z', 'Y').to_euler()

camera_data = bpy.data.cameras.new('comparison-camera')
camera = bpy.data.objects.new('comparison-camera', camera_data); scene.collection.objects.link(camera)
camera.location = (0, -2.3, .03); aim(camera, (0, 0, 0)); camera_data.type = 'ORTHO'; camera_data.ortho_scale = 1.15
scene.camera = camera
for name, position, power, size in [('key',(-1,-2,2),130,3),('fill',(1,-1,.7),70,3),('rim',(0,1,1.5),90,2)]:
    data = bpy.data.lights.new(name, 'AREA'); data.energy = power; data.shape = 'DISK'; data.size = size
    light = bpy.data.objects.new(name,data); scene.collection.objects.link(light); light.location = position; aim(light,(0,0,0))

report = {}
for variant in ['original', 'material-only', 'clean-normals', 'smooth-surface']:
    obj.data = original_data.copy()
    obj.data.materials.clear(); mat = original_material.copy(); obj.data.materials.append(mat)
    p = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    if variant != 'original':
        for name, value in [('Normal',None),('Metallic',0),('Roughness',.8)]:
            for link in list(p.inputs[name].links): mat.node_tree.links.remove(link)
            if value is not None: p.inputs[name].default_value=value
    if variant in ['clean-normals','smooth-surface']:
        obj.data.normals_split_custom_set([(0,0,0)] * len(obj.data.loops))
        for poly in obj.data.polygons: poly.use_smooth = True
    if variant == 'smooth-surface':
        bpy.context.view_layer.objects.active=obj; obj.select_set(True)
        modifier=obj.modifiers.new('gentle-surface-repair','SMOOTH'); modifier.factor=.5; modifier.iterations=3
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    scene.render.filepath=str(out / (variant+'.png'))
    bpy.ops.render.render(write_still=True)
    obj.data.calc_loop_triangles()
    report[variant]={'triangles':len(obj.data.loop_triangles),'vertices':len(obj.data.vertices)}
    if variant == 'original':
        # Opposite-side reference disambiguates FBX's authored facing direction.
        camera.location.y=2.3;aim(camera,(0,0,0));scene.render.filepath=str(out/'original-opposite.png');bpy.ops.render.render(write_still=True)
        camera.location.y=-2.3;aim(camera,(0,0,0))
(out/'repair-comparison.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
bpy.ops.wm.save_as_mainfile(filepath=str(out/'repair-preview.blend'))
print('SALMON_COMPARISON',json.dumps(report))
