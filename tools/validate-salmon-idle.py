import bpy,json,math
from pathlib import Path
root=Path(__file__).resolve().parent.parent
folder=root/'output/salmon-model-review/idle'
report=[]
for ext in ['fbx','glb']:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if ext=='fbx':bpy.ops.import_scene.fbx(filepath=str(folder/('salmon-idle.'+ext)))
    else:bpy.ops.import_scene.gltf(filepath=str(folder/('salmon-idle.'+ext)))
    rigs=[o for o in bpy.context.scene.objects if o.type=='ARMATURE'];meshes=[o for o in bpy.context.scene.objects if o.type=='MESH' and any(m.type=='ARMATURE' for m in o.modifiers)]
    assert len(rigs)==1 and len(rigs[0].data.bones)==17
    print('REIMPORT_COUNTS',ext,len(meshes),len(bpy.data.actions),[a.name for a in bpy.data.actions]);assert len(meshes)==23 and len(bpy.data.actions)>0
    for mesh in meshes:
        assert any(m.type=='ARMATURE' for m in mesh.modifiers)
        assert all(abs(sum(g.weight for g in v.groups)-1)<.001 for v in mesh.data.vertices)
    rig=rigs[0]
    if ext=='glb':
        idle=next(a for a in bpy.data.actions if a.name=='Salmon_Idle')
        rig.animation_data.action=idle
        if hasattr(idle,'slots') and len(idle.slots):rig.animation_data.action_slot=idle.slots[0]
    assert rig.animation_data and rig.animation_data.action
    matrices=[]
    for f in [3,10]:
        bpy.context.scene.frame_set(f);bpy.context.view_layer.update()
        matrices.append([list(row) for row in next(b for b in rig.pose.bones if 'spine' in b.name.lower()).matrix])
    assert matrices[0]!=matrices[1]
    report.append({'format':ext,'bones':len(rig.data.bones),'skinned_meshes':len(meshes),'actions':[a.name for a in bpy.data.actions],'normalized_weights':True,'animated_spine':True})
(folder.parent/'idle-export-validation.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print('RIG_REIMPORT_PASSED',report)
