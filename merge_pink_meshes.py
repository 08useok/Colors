"""
Pink FBX 메시 합치기 스크립트
Blender에서 실행: Scripting 탭 → Open → 이 파일 → Run Script

작업:
1. walk-m2l.fbx 임포트
2. 모든 메시를 하나로 합치기 (Ctrl+J)
3. 같은 경로로 재export
"""
import bpy
import os

FBX_PATH = r"C:\Users\useok\OneDrive\문서\New project\assets\3d\pink\walk-m2l.fbx"

# 기존 씬 정리
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# FBX 임포트
bpy.ops.import_scene.fbx(filepath=FBX_PATH)
print("임포트 완료")

# 아마추어(뼈대) 찾기
armature = None
for obj in bpy.context.scene.objects:
    if obj.type == 'ARMATURE':
        armature = obj
        break

# 메시 목록
meshes = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
print(f"메시 개수: {len(meshes)} → {[m.name for m in meshes]}")

if len(meshes) > 1:
    # 전체 선택 해제 후 메시만 선택
    bpy.ops.object.select_all(action='DESELECT')
    for mesh in meshes:
        mesh.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]

    # 메시 합치기
    bpy.ops.object.join()
    print("메시 합치기 완료")
else:
    print("메시가 1개뿐 — 합칠 필요 없음")

# FBX 재export (덮어쓰기)
bpy.ops.export_scene.fbx(
    filepath=FBX_PATH,
    use_selection=False,
    apply_scale_options='FBX_SCALE_NONE',
    add_leaf_bones=False,
    bake_anim=True,
    bake_anim_use_all_bones=False,
    bake_anim_use_nla_strips=False,
    bake_anim_use_all_actions=False,
    path_mode='AUTO',
    embed_textures=False,
)
print(f"재export 완료: {FBX_PATH}")
