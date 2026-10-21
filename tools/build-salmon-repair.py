"""Keep Salmon's authored body; rebuild its simple head/face without generated dents."""
import bpy
import bmesh
import json
import math
import numpy as np
from pathlib import Path
from mathutils import Vector, Matrix

root=Path(__file__).resolve().parent.parent
out=root/'output/salmon-model-review'
source=out/'source'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(next(source.glob('*.fbx'))))
body=next(o for o in bpy.context.scene.objects if o.type=='MESH')
body.data.transform(body.matrix_world);body.matrix_world=Matrix.Identity(4)
xyz=np.array([tuple(v.co) for v in body.data.vertices])
sample=xyz[(xyz[:,2]>.10)&(xyz[:,2]<.39)&(xyz[:,1]>.015)]
solution=np.linalg.lstsq(np.column_stack((2*sample,np.ones(len(sample)))),(sample*sample).sum(axis=1),rcond=None)[0]
center=solution[:3];radius=math.sqrt(float(solution[3]+np.dot(center,center)))
print('HEAD_FIT',center.tolist(),radius)

def material(name,color,roughness=.65):
    m=bpy.data.materials.new(name);m.diffuse_color=(*color,1)
    p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Roughness'].default_value=roughness;p.inputs['Metallic'].default_value=0
    return m

# Source base-color texture dominant salmon pixel: sRGB #FE7974.
# Blender node colors are linear, so convert rather than entering sRGB directly.
source_coral_srgb=(254/255,121/255,116/255)
def srgb_to_linear(v):return v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4
coral=material('Salmon coral',tuple(srgb_to_linear(v) for v in source_coral_srgb))
white=material('Eye white',(.96,.96,.93),.4)
black=material('Eye pupil',(.012,.009,.012),.25)
line=material('Face features',(.055,.018,.018),.6)
cheek=material('Cheek coral',(.64,.12,.085))
red=material('Bobber red',(.86,.075,.045))
cream=material('Bobber cream',(.94,.9,.78))

# Preserve the original torso/limbs and UVs, but remove the generated head.
bm=bmesh.new();bm.from_mesh(body.data)
bmesh.ops.delete(bm,geom=[v for v in bm.verts if v.co.z>.082],context='VERTS')
bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.00001)
bmesh.ops.holes_fill(bm,edges=[e for e in bm.edges if e.is_boundary],sides=0)
bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
bm.to_mesh(body.data);bm.free();body.data.update()
body.name='Salmon body (source repaired)';body.data.materials.clear();body.data.materials.append(coral)
body.data.normals_split_custom_set([(0,0,0)]*len(body.data.loops))
for p in body.data.polygons:p.use_smooth=True
bpy.context.view_layer.objects.active=body
smooth=body.modifiers.new('gentle-body-surface','SMOOTH');smooth.factor=.5;smooth.iterations=10
bpy.ops.object.modifier_apply(modifier=smooth.name)

def sphere(name,position,scale,mat,segments=32,rings=20):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,location=position)
    o=bpy.context.object;o.name=name;o.scale=scale;o.data.materials.append(mat)
    for p in o.data.polygons:p.use_smooth=True
    return o

cx,cy,cz=map(float,center)
sphere('Smooth neck join',(cx,cy,.077),(.042,.042,.035),coral,32,20)
sphere('Salmon smooth round head',(cx,cy,cz),(radius,radius,radius),coral,64,40)

def surface(x,z,offset=.001):
    return (cx+x,cy-math.sqrt(max(.0001,radius*radius-x*x-(z-cz)**2))-offset,z)

def curve(name,points,mat,thickness):
    c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=12
    c.bevel_depth=thickness;c.bevel_resolution=3
    spline=c.splines.new('BEZIER');spline.bezier_points.add(len(points)-1)
    for p,co in zip(spline.bezier_points,points):p.co=co;p.handle_left_type='AUTO';p.handle_right_type='AUTO'
    o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);o.data.materials.append(mat)

for side in [-1,1]:
    x=side*radius*.40;z=cz+radius*.045
    base=surface(x,z,.004)
    sphere('Eye white',base,(radius*.255,.014,radius*.315),white,40,28)
    pupil=(base[0]-side*.003,base[1]-.014,base[2]-.001)
    sphere('Pupil',pupil,(radius*.145,.006,radius*.215),black,32,24)
    sphere('Eye highlight',(pupil[0]-.006,pupil[1]-.0055,pupil[2]+.014),(.006,.0025,.008),white,16,12)
    for n in [0,1]:
        outer=x+side*radius*.235
        points=[(cx+outer,base[1]+.002,z+radius*(.13+n*.07)),
                (cx+outer+side*.009,base[1]+.004,z+radius*(.15+n*.09)),
                surface(outer+side*.014,z+radius*(.20+n*.09),.002)]
        curve('Eyelash',points,line,.0018)
    browz=cz+radius*.54
    curve('Eyebrow',[surface(x-side*.023,browz),surface(x,browz+.009),surface(x+side*.022,browz-.002)],line,.0025)
    for n in [0,1]:
        cheekx=side*radius*(.57+n*.10);cheekz=cz-radius*(.30-n*.04)
        sphere('Cheek dot',surface(cheekx,cheekz,.0015),(.0055,.002,.007),cheek,20,12)

curve('Smile',[surface(-radius*.22,cz-radius*.43,.002),surface(0,cz-radius*.53,.002),surface(radius*.22,cz-radius*.43,.002)],line,.0023)

# One integrated float head ornament, with no hat/clothes/extra accessories.
bobber_center=(cx+radius*.59,cy,cz+radius*.99)
bobber_radius=radius*.19
for name,phi,mat in [('Bobber upper',0,red),('Bobber lower',math.pi/2,cream)]:
    # UV-sphere mesh split at the equator to keep a clean two-color float.
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=24,location=bobber_center,radius=bobber_radius)
    o=bpy.context.object;o.name=name;o.data.materials.append(mat)
    bm=bmesh.new();bm.from_mesh(o.data)
    if phi==0:remove=[v for v in bm.verts if v.co.z<-.000001]
    else:remove=[v for v in bm.verts if v.co.z>.000001]
    bmesh.ops.delete(bm,geom=remove,context='VERTS');bm.to_mesh(o.data);bm.free()
    o.scale.z=1.1
    for p in o.data.polygons:p.use_smooth=True
sphere('Bobber blunt stem',(bobber_center[0]+.009,bobber_center[1],bobber_center[2]+bobber_radius*1.1),(.004,.004,.012),red,20,12)

# Apply scale/convert curves; preserve separate material boundaries for clean facial details.
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.convert(target='MESH')
bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
for o in meshes:
    bm=bmesh.new();bm.from_mesh(o.data)
    bmesh.ops.dissolve_degenerate(bm,edges=list(bm.edges),dist=.0000001)
    bm.to_mesh(o.data);bm.free()
    for p in o.data.polygons:p.use_smooth=True
triangles=sum(len(o.data.loop_triangles) for o in meshes)
for o in meshes:o.data.calc_loop_triangles()
triangles=sum(len(o.data.loop_triangles) for o in meshes)
print('REBUILT_TRIANGLES',triangles)
fixed=out/'fixed';fixed.mkdir(exist_ok=True)
before=(xyz.min(axis=0).tolist(),xyz.max(axis=0).tolist())
afterxyz=[o.matrix_world@v.co for o in meshes for v in o.data.vertices]
after=([min(p[i] for p in afterxyz) for i in range(3)],[max(p[i] for p in afterxyz) for i in range(3)])
(out/'fixed-audit.json').write_text(json.dumps({'source_triangles':30810,'fixed_triangles':triangles,'rigged':False,'body_color_srgb_hex':'#FE7974','body_color_source':'Most frequent original base-color texture pixel; converted from sRGB to linear','head_fit':{'center':center.tolist(),'radius':radius},'source_bounds':before,'fixed_bounds':after,'changes':['Source body retained and gently smoothed','Head and face rebuilt as clean geometry','Single float ornament rebuilt','Procedural flat colors; noisy generated normal/metallic/roughness maps excluded']},indent=2),encoding='utf-8')
bpy.ops.export_scene.fbx(filepath=str(fixed/'salmon-fixed.fbx'),use_selection=True,object_types={'MESH'},add_leaf_bones=False,bake_anim=False,path_mode='AUTO')
bpy.ops.export_scene.gltf(filepath=str(fixed/'salmon-fixed.glb'),export_format='GLB',use_selection=True,export_animations=False)

# Studio view of the actual exported geometry.
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=32;scene.cycles.use_denoising=True
scene.render.resolution_x=720;scene.render.resolution_y=960;scene.render.resolution_percentage=100
scene.world=bpy.data.worlds.new('studio');scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.55,.55,.55,1)
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.5
scene.view_settings.view_transform='AgX'
def aim(o,point):o.rotation_euler=(Vector(point)-o.location).to_track_quat('-Z','Y').to_euler()
data=bpy.data.cameras.new('camera');camera=bpy.data.objects.new('camera',data);scene.collection.objects.link(camera)
camera.location=(0,-2.3,.03);aim(camera,(0,0,0));data.type='ORTHO';data.ortho_scale=1.15;scene.camera=camera
for name,position,power,size in [('key',(-1,-2,2),130,3),('fill',(1,-1,.7),70,3),('rim',(0,1,1.5),90,2)]:
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size
    o=bpy.data.objects.new(name,data);scene.collection.objects.link(o);o.location=position;aim(o,(0,0,0))
scene.render.filepath=str(out/'fixed-front.png');bpy.ops.render.render(write_still=True)
camera.location=(1.3,-2.3,.15);aim(camera,(0,0,0));scene.render.filepath=str(out/'fixed-angle.png');bpy.ops.render.render(write_still=True)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(fixed/'salmon-fixed.blend'))
print('SALMON_FIXED_READY',triangles)
