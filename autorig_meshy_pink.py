"""
Meshy AI 핑크 모델 리깅
- Y-up 단일 메시 (join 불필요)
- 실측: Y=60-70% 에서 |X|>0.55 half_w = 팔 (58~67%)
- 하드 컷오프 방식 (v5 기반)
"""
import bpy
from mathutils import Vector

INPUT  = r"C:\Users\useok\Downloads\Meshy_AI_pink_model_0712014753_texture.glb"
OUTPUT = r"C:\Users\useok\OneDrive\문서\New project\assets\3d\pink\pink_rigged.glb"

print("=== Meshy Pink Rigging ===")

bpy.ops.wm.read_homefile(use_empty=True)
bpy.ops.import_scene.gltf(filepath=INPUT)

# ParentNode 분리 후 transform 적용
bpy.ops.object.select_all(action='DESELECT')
mesh_list = [o for o in bpy.context.scene.objects if o.type == 'MESH']
for o in mesh_list:
    o.select_set(True)
if mesh_list:
    bpy.context.view_layer.objects.active = mesh_list[0]
    bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM')

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

body = [o for o in bpy.context.scene.objects if o.type == 'MESH'][0]
body.name = "pink_body"
print(f"Mesh: {body.name}, verts: {len(body.data.vertices)}")

# 바운딩박스
coords = [body.matrix_world @ v.co for v in body.data.vertices]
min_z = min(c.z for c in coords); max_z = max(c.z for c in coords)
min_x = min(c.x for c in coords); max_x = max(c.x for c in coords)
H = max_z - min_z
half_w = (max_x - min_x) / 2
cx = (max_x + min_x) / 2
print(f"Z: {min_z:.3f}~{max_z:.3f}  H={H:.3f}  half_w={half_w:.3f}")

def pz(f): return min_z + H * f

# ── 아마추어 ──────────────────────────────────────────────────────────────────
arm_data = bpy.data.armatures.new("pink_rig")
arm_obj  = bpy.data.objects.new("pink_armature", arm_data)
bpy.context.collection.objects.link(arm_obj)
bpy.context.view_layer.objects.active = arm_obj
bpy.ops.object.mode_set(mode='EDIT')
eb = arm_data.edit_bones

BONES = {
  'hips':       ((0,0,pz(.40)),(0,0,pz(.48)),None),
  'spine':      ((0,0,pz(.48)),(0,0,pz(.57)),'hips'),
  'chest':      ((0,0,pz(.57)),(0,0,pz(.68)),'spine'),
  'neck':       ((0,0,pz(.68)),(0,0,pz(.76)),'chest'),
  'head':       ((0,0,pz(.76)),(0,0,pz(1.0)),'neck'),
  'shoulder_L': ((-0.12,0,pz(.66)),(-0.16,0,pz(.65)),'chest'),
  'upper_arm_L':((-0.16,0,pz(.65)),(-0.22,0,pz(.53)),'shoulder_L'),
  'forearm_L':  ((-0.22,0,pz(.53)),(-0.25,0,pz(.41)),'upper_arm_L'),
  'hand_L':     ((-0.25,0,pz(.41)),(-0.27,0,pz(.33)),'forearm_L'),
  'shoulder_R': ((+0.12,0,pz(.66)),(+0.16,0,pz(.65)),'chest'),
  'upper_arm_R':((+0.16,0,pz(.65)),(+0.22,0,pz(.53)),'shoulder_R'),
  'forearm_R':  ((+0.22,0,pz(.53)),(+0.25,0,pz(.41)),'upper_arm_R'),
  'hand_R':     ((+0.25,0,pz(.41)),(+0.27,0,pz(.33)),'forearm_R'),
  'thigh_L':    ((-0.06,0,pz(.38)),(-0.06,0,pz(.20)),'hips'),
  'shin_L':     ((-0.06,0,pz(.20)),(-0.05,0,pz(.05)),'thigh_L'),
  'foot_L':     ((-0.05,0,pz(.05)),(-0.05,.06,pz(.0)),'shin_L'),
  'thigh_R':    ((+0.06,0,pz(.38)),(+0.06,0,pz(.20)),'hips'),
  'shin_R':     ((+0.06,0,pz(.20)),(+0.05,0,pz(.05)),'thigh_R'),
  'foot_R':     ((+0.05,0,pz(.05)),(+0.05,.06,pz(.0)),'shin_R'),
}
for name,(h,t,p) in BONES.items():
    b = eb.new(name); b.head=Vector(h); b.tail=Vector(t)
    if p and p in eb: b.parent=eb[p]; b.use_connect=False
bpy.ops.object.mode_set(mode='OBJECT')

# ── 버텍스 그룹 할당 (하드 컷오프) ───────────────────────────────────────────
bpy.context.view_layer.objects.active = body
for name in BONES:
    body.vertex_groups.new(name=name)

counts = {n: 0 for n in BONES}

# 실측 기반 임계값
ARM_Z_LO    = 0.52   # Y=52% 이상
ARM_Z_HI    = 0.80   # Y=80% 미만
ARM_X_THRESH = 0.52  # |X|/half_w > 이값 = 팔

SHIN_Z_SPLIT = 0.22
FOOT_Z_SPLIT = 0.06

for v in body.data.vertices:
    wco = body.matrix_world @ v.co
    vz, vx = wco.z, wco.x
    z_f   = (vz - min_z) / H
    x_abs = abs(vx - cx) / half_w
    left  = vx < cx

    # 1. 팔 (중간 높이 + 외측)
    if ARM_Z_LO < z_f < ARM_Z_HI and x_abs > ARM_X_THRESH:
        side = 'L' if left else 'R'
        if z_f > 0.64:   bone = f'shoulder_{side}'
        elif z_f > 0.53: bone = f'upper_arm_{side}'
        else:            bone = f'forearm_{side}'

    # 2. 다리 (하단)
    elif z_f <= 0.42:
        side = 'L' if left else 'R'
        if z_f < FOOT_Z_SPLIT:     bone = f'foot_{side}'
        elif z_f < SHIN_Z_SPLIT:   bone = f'shin_{side}'
        else:                       bone = f'thigh_{side}'

    # 3. 몸통/머리
    else:
        if z_f > 0.76:   bone = 'head'
        elif z_f > 0.68: bone = 'neck'
        elif z_f > 0.57: bone = 'chest'
        elif z_f > 0.48: bone = 'spine'
        else:             bone = 'hips'

    body.vertex_groups[bone].add([v.index], 1.0, 'REPLACE')
    counts[bone] += 1

print("=== Vertex distribution ===")
for bn,c in sorted(counts.items(), key=lambda x:-x[1]):
    if c: print(f"  {bn}: {c}")

# ── 아마추어 연결 ─────────────────────────────────────────────────────────────
bpy.ops.object.select_all(action='DESELECT')
body.select_set(True)
arm_obj.select_set(True)
bpy.context.view_layer.objects.active = arm_obj
bpy.ops.object.parent_set(type='ARMATURE_NAME')
print("Parented ✓")

bpy.ops.export_scene.gltf(
    filepath=OUTPUT,
    export_format='GLB',
    export_skins=True,
    use_selection=False,
)
print(f"Done → {OUTPUT}")
