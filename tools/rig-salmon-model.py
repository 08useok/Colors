"""Build a simple humanoid Salmon rig and an original in-place walk preview."""
import bpy, math, json
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parent.parent
out=root/'output/salmon-model-review'
bpy.ops.wm.open_mainfile(filepath=str(out/'fixed/salmon-fixed.blend'))
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
bpy.ops.object.select_all(action='DESELECT')
data=bpy.data.armatures.new('Salmon humanoid skeleton');rig=bpy.data.objects.new('SalmonRig',data);bpy.context.collection.objects.link(rig)
rig.select_set(True);bpy.context.view_layer.objects.active=rig;bpy.ops.object.mode_set(mode='EDIT')
segments={}
def bone(name,a,b,parent=None):
    o=data.edit_bones.new(name);o.head=a;o.tail=b
    if parent:o.parent=data.edit_bones[parent]
    segments[name]=(Vector(a),Vector(b));return o
bone('root',(0,0,-.46),(0,0,-.40))
bone('pelvis',(0,0,-.18),(0,0,-.10),'root')
bone('spine',(0,0,-.10),(0,0,.035),'pelvis')
bone('neck',(0,0,.035),(0,0,.105),'spine')
bone('head',(0,0,.105),(0,0,.39),'neck')
for side,sign in [('L',1),('R',-1)]:
    bone('upper_arm.'+side,(sign*.072,0,.026),(sign*.18,0,.026),'spine')
    bone('forearm.'+side,(sign*.18,0,.026),(sign*.278,0,.026),'upper_arm.'+side)
    bone('hand.'+side,(sign*.278,0,.026),(sign*.335,0,.026),'forearm.'+side)
    bone('thigh.'+side,(sign*.047,0,-.16),(sign*.055,0,-.30),'pelvis')
    bone('shin.'+side,(sign*.055,0,-.30),(sign*.055,0,-.423),'thigh.'+side)
    bone('foot.'+side,(sign*.055,0,-.423),(sign*.055,-.045,-.455),'shin.'+side)
bpy.ops.object.mode_set(mode='OBJECT')
def distance(p,a,b):
    d=b-a;t=max(0,min(1,(p-a).dot(d)/d.length_squared));return (p-a-t*d).length
counts={};minsum=1.;maxsum=0.
for obj in meshes:
    obj.vertex_groups.clear();obj.parent=rig
    mod=obj.modifiers.new('Salmon skin','ARMATURE');mod.object=rig
    groups={n:obj.vertex_groups.new(name=n) for n in segments}
    rigid=None if obj.name.startswith('Salmon body') else ('neck' if obj.name=='Smooth neck join' else 'head')
    for v in obj.data.vertices:
        if rigid:weights=[(rigid,1.)]
        else:
            p=obj.matrix_world@v.co;side='L' if p.x>=0 else 'R'
            if abs(p.x)>.078 and p.z>-.065:
                candidates=['spine','upper_arm.'+side,'forearm.'+side,'hand.'+side]
            elif p.z<-.16:
                candidates=['pelvis','thigh.'+side,'shin.'+side,'foot.'+side]
            else:candidates=['pelvis','spine','neck']
            distances=sorted((distance(p,*segments[n]),n) for n in candidates)[:2]
            values=[(n,1/max(d,.008)**4) for d,n in distances];total=sum(w for n,w in values)
            weights=[(n,w/total) for n,w in values]
        for n,w in weights:groups[n].add([v.index],w,'REPLACE')
        total=sum(w for n,w in weights);minsum=min(minsum,total);maxsum=max(maxsum,total)
    counts[obj.name]={'vertices':len(obj.data.vertices),'rigid_bone':rigid}
assert abs(minsum-1)<1e-6 and abs(maxsum-1)<1e-6
scene=bpy.context.scene;scene.render.fps=24;scene.frame_start=1;scene.frame_end=25
for pb in rig.pose.bones:pb.rotation_mode='XYZ'
for frame in range(1,26):
    phase=(frame-1)/24*2*math.pi
    for side,sign in [('L',1),('R',-1)]:
        s=math.sin(phase)*sign
        arm=rig.pose.bones['upper_arm.'+side];arm.rotation_mode='QUATERNION'
        rest=data.bones[arm.name];basis=rest.matrix_local.to_quaternion()
        direction=(rest.tail_local-rest.head_local).normalized()
        turn=direction.rotation_difference(Vector((sign*.25,.28*s,-.92)).normalized())
        arm.rotation_quaternion=basis.inverted()@turn@basis
        arm.keyframe_insert('rotation_quaternion',frame=frame)
        for n,rot in [('thigh',(.32*s,0,0)),('shin',(-.24*max(0,-s),0,0)),('foot',(.1*s,0,0)),('forearm',(-.08*s,0,0))]:
            pb=rig.pose.bones[n+'.'+side];pb.rotation_euler=rot;pb.keyframe_insert('rotation_euler',frame=frame)
    pb=rig.pose.bones['pelvis'];pb.location=(0,.003*(1-math.cos(phase*2)),0);pb.keyframe_insert('location',frame=frame)
rig.animation_data.action.name='Salmon_Walk_InPlace'
scene.frame_set(1)
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True)
for obj in meshes:obj.select_set(True)
bpy.context.view_layer.objects.active=rig
folder=out/'rigged';folder.mkdir(exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(folder/'salmon-rigged.glb'),export_format='GLB',use_selection=True,export_animations=True,export_frame_range=True,export_force_sampling=True)
bpy.ops.export_scene.fbx(filepath=str(folder/'salmon-rigged.fbx'),use_selection=True,object_types={'MESH','ARMATURE'},add_leaf_bones=False,bake_anim=True,bake_anim_use_all_actions=False,bake_anim_use_nla_strips=False)
scene.camera.location=(1.3,-2.3,.15);scene.camera.rotation_euler=(Vector((0,0,0))-scene.camera.location).to_track_quat('-Z','Y').to_euler()
scene.frame_set(7);scene.render.filepath=str(out/'rigged-walk.png');bpy.ops.render.render(write_still=True)
scene.frame_set(1);bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(folder/'salmon-rigged.blend'))
report={'bones':len(data.bones),'mesh_objects':len(meshes),'weight_sum_min':minsum,'weight_sum_max':maxsum,'walk':'Salmon_Walk_InPlace','frames':[1,25],'fps':24,'source_color':'#FE7974','binding':'body: spatial two-bone weights; face/ornament: rigid head; neck: rigid neck','objects':counts,'limitations':['Custom simple rig, not Meshy auto-rig','Walk-in-place demonstration only; foot contact and complex combat poses not production validated','No playable Salmon combat implementation']}
(out/'rig-validation.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print('SALMON_RIG_READY',len(data.bones),minsum,maxsum)
