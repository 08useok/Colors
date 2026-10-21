import bpy,json
from pathlib import Path
root=Path(__file__).resolve().parent.parent
out=root/'output/salmon-model-review'
results=[]
for ext in ['fbx','glb']:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    path=out/'fixed'/('salmon-fixed.'+ext)
    if ext=='fbx':bpy.ops.import_scene.fbx(filepath=str(path))
    else:bpy.ops.import_scene.gltf(filepath=str(path))
    meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
    for o in meshes:o.data.calc_loop_triangles()
    triangles=sum(len(o.data.loop_triangles) for o in meshes)
    expected=json.loads((out/'fixed-audit.json').read_text())['fixed_triangles']
    assert abs(triangles-expected)<=1,(ext,triangles,expected)
    assert not any(o.type=='ARMATURE' for o in bpy.context.scene.objects)
    assert all(len(o.data.materials)>0 for o in meshes)
    coral=bpy.data.materials.get('Salmon coral')
    rgb=tuple(coral.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value[:3])
    srgb=(254/255,121/255,116/255)
    expected_rgb=tuple(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in srgb)
    assert all(abs(a-b)<.0001 for a,b in zip(rgb,expected_rgb)),(ext,rgb,expected_rgb)
    assert all(all(__import__('math').isfinite(c) for c in v.co) for o in meshes for v in o.data.vertices)
    results.append({'format':ext,'meshes':len(meshes),'triangles':triangles,'materials':len(bpy.data.materials),'rigged':False,'body_color_srgb_hex':'#FE7974','body_color_verified':True,'bytes':path.stat().st_size,'passed':True})
(out/'export-validation.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
print('EXPORT_VALIDATION_PASSED',results)
