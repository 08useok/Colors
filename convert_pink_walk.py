"""
AccuRIG FBX → GLB 변환
walk-m2l.fbx (루프 걷기) 를 pink_rigged.glb 로 변환
CC_Base 스켈레톤 + 애니메이션 그대로 유지
"""
import bpy
import sys

INPUT  = r"C:\Users\useok\Downloads\pink_fbx_extracted\walk-m2l.fbx"
OUTPUT = r"C:\Users\useok\OneDrive\문서\New project\assets\3d\pink\pink_rigged.glb"

print("=== AccuRIG FBX → GLB 변환 ===")

# 씬 초기화 (background 모드에서는 read_homefile 불필요)
for obj in bpy.data.objects:
    bpy.data.objects.remove(obj, do_unlink=True)

# FBX 임포트 (애니메이션 포함)
bpy.ops.import_scene.fbx(
    filepath=INPUT,
    use_anim=True,
    ignore_leaf_bones=False,
    force_connect_children=False,
    automatic_bone_orientation=False,
    global_scale=1.0,
)


objs = list(bpy.context.scene.objects)
print(f"임포트된 오브젝트: {[o.name for o in objs]}")

# 애니메이션 클립 확인
for action in bpy.data.actions:
    print(f"액션: {action.name}  (프레임: {action.frame_range[0]:.0f}~{action.frame_range[1]:.0f})")

# 아마추어 찾기
arm = next((o for o in objs if o.type == 'ARMATURE'), None)
if arm:
    print(f"아마추어: {arm.name}")
    print(f"본 목록: {[b.name for b in arm.data.bones[:10]]}...")

# GLB 내보내기 (애니메이션 포함)
# 씬 단위를 미터로 고정 → sizeVec.y가 ~1.0으로 나옴
bpy.context.scene.unit_settings.scale_length = 1.0

bpy.ops.export_scene.gltf(
    filepath=OUTPUT,
    export_format='GLB',
    export_skins=True,
    export_animations=True,
    export_nla_strips=True,
    export_anim_single_armature=True,
    use_selection=False,
)

print(f"완료 → {OUTPUT}")
