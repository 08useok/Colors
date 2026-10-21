"""Create one gentle three-second idle for the existing Salmon rig."""
import bpy,math,json
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parent.parent;out=root/'output/salmon-model-review'
bpy.ops.wm.open_mainfile(filepath=str(out/'rigged/salmon-rigged.blend'))
rig=bpy.data.objects['SalmonRig'];rig.animation_data_clear()
for action in bpy.data.actions:action.use_fake_user=True
for pb in rig.pose.bones:
    pb.location=(0,0,0);pb.rotation_mode='XYZ';pb.rotation_euler=(0,0,0);pb.scale=(1,1,1)
scene=bpy.context.scene;scene.frame_start=1;scene.frame_end=73;scene.render.fps=24
for frame in range(1,74):
    phase=(frame-1)/72*math.tau
    for name,rotation in [('spine',(.012*math.sin(phase),0,.012*math.sin(phase))),('head',(-.008*math.sin(phase),0,-.008*math.sin(phase)))]:
        pb=rig.pose.bones[name];pb.rotation_euler=rotation;pb.keyframe_insert('rotation_euler',frame=frame)
    for side,sign in [('L',1),('R',-1)]:
        arm=rig.pose.bones['upper_arm.'+side];arm.rotation_mode='QUATERNION'
        rest=rig.data.bones[arm.name];basis=rest.matrix_local.to_quaternion()
        direction=(rest.tail_local-rest.head_local).normalized()
        turn=direction.rotation_difference(Vector((sign*(.25+.014*math.sin(phase)),.012*math.sin(phase),-.92)).normalized())
        arm.rotation_quaternion=basis.inverted()@turn@basis;arm.keyframe_insert('rotation_quaternion',frame=frame)
        forearm=rig.pose.bones['forearm.'+side];forearm.rotation_euler=(.018*math.sin(phase),0,0);forearm.keyframe_insert('rotation_euler',frame=frame)
rig.animation_data.action.name='Salmon_Idle'
# Foot chains remain static; all keyed transforms meet at the loop seam.
poses=[]
for frame in [1,19,73]:
    scene.frame_set(frame);bpy.context.view_layer.update()
    poses.append({pb.name:[v for row in pb.matrix for v in row] for pb in rig.pose.bones})
for n in ['foot.L','foot.R']:
    assert max(abs(a-b) for a,b in zip(poses[0][n],poses[1][n]))<1e-6
for n in poses[0]:assert max(abs(a-b) for a,b in zip(poses[0][n],poses[2][n]))<1e-6
folder=out/'idle';folder.mkdir(exist_ok=True)
scene.frame_set(1);bpy.ops.object.select_all(action='DESELECT');rig.select_set(True)
for obj in scene.objects:
    if obj.type=='MESH':obj.select_set(True)
bpy.context.view_layer.objects.active=rig
bpy.ops.export_scene.gltf(filepath=str(folder/'salmon-idle.glb'),export_format='GLB',use_selection=True,export_animations=True,export_frame_range=False,export_force_sampling=True)
bpy.ops.export_scene.fbx(filepath=str(folder/'salmon-idle.fbx'),use_selection=True,object_types={'MESH','ARMATURE'},add_leaf_bones=False,bake_anim=True,bake_anim_use_all_actions=False,bake_anim_use_nla_strips=False)
bpy.context.preferences.filepaths.save_version=0;bpy.ops.wm.save_as_mainfile(filepath=str(folder/'salmon-idle.blend'))
(out/'idle-validation.json').write_text(json.dumps({'clip':'Salmon_Idle','duration_seconds':3,'fps':24,'frames':[1,73],'bones':len(rig.data.bones),'feet_static':True,'loop_seam_equal':True,'changes':'Small spine/head sway and relaxed arm movement; no locomotion or translation'},indent=2),encoding='utf-8')
scene.render.resolution_x=360;scene.render.resolution_y=480;scene.cycles.samples=12
frames=out/'idle-frames';frames.mkdir(exist_ok=True)
for i in range(12):
    scene.frame_set(1+i*6);scene.render.filepath=str(frames/f'{i:02d}.png');bpy.ops.render.render(write_still=True)
print('SALMON_IDLE_READY')
