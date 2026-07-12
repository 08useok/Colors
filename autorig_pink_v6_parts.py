"""
v6 HYBRID: 분리된 파트는 100% 직접 배정, part_0(몸통+왼팔)만 존 기반
실측 데이터:
  part_0  → 메인 몸통+왼팔 (존 웨이트)
  part_1  → 머리
  part_2,3→ 발 (X<0=L, X>0=R로 내부 분리)
  part_4,5→ 다리 (X<0=L, X>0=R로 내부 분리)
  part_6  → hips
  part_7  → upper_arm_R
  part_8  → forearm_R
  part_9~13→ shoulder_R 디테일
"""
import bpy
from mathutils import Vector

INPUT  = r"C:\Users\useok\Downloads\pink cartoon character 3d model.glb"
OUTPUT = r"C:\Users\useok\OneDrive\문서\New project\assets\3d\pink\pink_rigged.glb"

print("=== Auto-rig Pink v6 hybrid ===")

bpy.ops.wm.read_homefile(use_empty=True)
bpy.ops.import_scene.gltf(filepath=INPUT)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

mesh_objs = {o.name: o for o in bpy.context.scene.objects if o.type == 'MESH'}
print(f"Parts loaded: {sorted(mesh_objs.keys())}")

# ── 전역 Z 범위 ───────────────────────────────────────────────────────────────
all_z = [
    (o.matrix_world @ v.co).z
    for o in mesh_objs.values()
    for v in o.data.vertices
]
Z_MIN, Z_MAX = min(all_z), max(all_z)
H = Z_MAX - Z_MIN
print(f"Global Z: {Z_MIN:.3f}~{Z_MAX:.3f}  H={H:.3f}")

def zf(z): return (z - Z_MIN) / H   # 0=발끝, 1=머리꼭대기

# ── 아마추어 ──────────────────────────────────────────────────────────────────
def pz(f): return Z_MIN + H * f

arm_data = bpy.data.armatures.new("pink_rig")
arm_obj  = bpy.data.objects.new("pink_armature", arm_data)
bpy.context.collection.objects.link(arm_obj)
bpy.context.view_layer.objects.active = arm_obj
bpy.ops.object.mode_set(mode='EDIT')
eb = arm_data.edit_bones

BONES = {
  'hips':       ((0,0,pz(.40)),(0,0,pz(.48)),None),
  'spine':      ((0,0,pz(.48)),(0,0,pz(.58)),'hips'),
  'chest':      ((0,0,pz(.58)),(0,0,pz(.70)),'spine'),
  'neck':       ((0,0,pz(.70)),(0,0,pz(.78)),'chest'),
  'head':       ((0,0,pz(.78)),(0,0,pz(1.0)),'neck'),
  'shoulder_L': ((-0.10,0,pz(.68)),(-0.13,0,pz(.67)),'chest'),
  'upper_arm_L':((-0.13,0,pz(.67)),(-0.17,0,pz(.53)),'shoulder_L'),
  'forearm_L':  ((-0.17,0,pz(.53)),(-0.19,0,pz(.39)),'upper_arm_L'),
  'hand_L':     ((-0.19,0,pz(.39)),(-0.20,0,pz(.30)),'forearm_L'),
  'shoulder_R': ((+0.10,0,pz(.68)),(+0.13,0,pz(.67)),'chest'),
  'upper_arm_R':((+0.13,0,pz(.67)),(+0.17,0,pz(.53)),'shoulder_R'),
  'forearm_R':  ((+0.17,0,pz(.53)),(+0.19,0,pz(.39)),'upper_arm_R'),
  'hand_R':     ((+0.19,0,pz(.39)),(+0.20,0,pz(.30)),'forearm_R'),
  'thigh_L':    ((-0.04,0,pz(.40)),(-0.04,0,pz(.20)),'hips'),
  'shin_L':     ((-0.04,0,pz(.20)),(-0.04,0,pz(.04)),'thigh_L'),
  'foot_L':     ((-0.04,0,pz(.04)),(-0.04,.05,pz(.0)),'shin_L'),
  'thigh_R':    ((+0.04,0,pz(.40)),(+0.04,0,pz(.20)),'hips'),
  'shin_R':     ((+0.04,0,pz(.20)),(+0.04,0,pz(.04)),'thigh_R'),
  'foot_R':     ((+0.04,0,pz(.04)),(+0.04,.05,pz(.0)),'shin_R'),
}
for name,(h,t,p) in BONES.items():
    b = eb.new(name); b.head=Vector(h); b.tail=Vector(t)
    if p and p in eb: b.parent=eb[p]; b.use_connect=False
bpy.ops.object.mode_set(mode='OBJECT')

BONE_NAMES = list(BONES.keys())

def init_vgroups(obj):
    for bn in BONE_NAMES:
        if bn not in obj.vertex_groups:
            obj.vertex_groups.new(name=bn)

def assign(obj, vidx_list, bone, w=1.0):
    obj.vertex_groups[bone].add(vidx_list, w, 'REPLACE')

# ══════════════════════════════════════════════════════════════════════════════
# 1. part_0 — 메인 몸통+왼팔 → 존 기반 하드 컷오프
# ══════════════════════════════════════════════════════════════════════════════
if 'tripo_part_0' in mesh_objs:
    o = mesh_objs['tripo_part_0']
    init_vgroups(o)
    counts = {bn: 0 for bn in BONE_NAMES}

    # part_0 내부 X 범위
    wxs = [(o.matrix_world @ v.co).x for v in o.data.vertices]
    cx0 = (max(wxs)+min(wxs))/2
    hw0 = (max(wxs)-min(wxs))/2

    for v in o.data.vertices:
        wco = o.matrix_world @ v.co
        vx, vz = wco.x, wco.z
        z = zf(vz)
        # 왼쪽 기준 (part_0에는 오른팔 없음 → 왼팔만 존재)
        left  = vx < cx0
        x_abs = abs(vx - cx0) / max(hw0, 0.001)

        # 왼팔 영역: z=52~82%, |X|>0.45 AND 왼쪽
        if 0.52 < z < 0.82 and x_abs > 0.45 and left:
            if z > 0.67:   bone = 'shoulder_L'
            elif z > 0.54: bone = 'upper_arm_L'
            else:          bone = 'forearm_L'
        elif z > 0.78:     bone = 'head'
        elif z > 0.70:     bone = 'neck'
        elif z > 0.58:     bone = 'chest'
        elif z > 0.48:     bone = 'spine'
        elif z > 0.38:     bone = 'hips'
        elif z > 0.22:     bone = 'thigh_L' if left else 'thigh_R'
        elif z > 0.07:     bone = 'shin_L'  if left else 'shin_R'
        else:              bone = 'foot_L'  if left else 'foot_R'

        assign(o, [v.index], bone)
        counts[bone] += 1

    print("part_0 distribution:")
    for bn,c in sorted(counts.items(), key=lambda x:-x[1]):
        if c: print(f"  {bn}: {c}")

# ══════════════════════════════════════════════════════════════════════════════
# 2. part_1 — 머리 → 100% head
# ══════════════════════════════════════════════════════════════════════════════
if 'tripo_part_1' in mesh_objs:
    o = mesh_objs['tripo_part_1']
    init_vgroups(o)
    assign(o, list(range(len(o.data.vertices))), 'head')
    print(f"part_1 → head ({len(o.data.vertices)}v)")

# ══════════════════════════════════════════════════════════════════════════════
# 3. part_2, 3 — 발 → X<0=foot_L, X>0=foot_R
# ══════════════════════════════════════════════════════════════════════════════
for pname in ('tripo_part_2', 'tripo_part_3'):
    if pname not in mesh_objs: continue
    o = mesh_objs[pname]
    init_vgroups(o)
    l_idx = [v.index for v in o.data.vertices if (o.matrix_world @ v.co).x <= 0]
    r_idx = [v.index for v in o.data.vertices if (o.matrix_world @ v.co).x >  0]
    if l_idx: assign(o, l_idx, 'foot_L')
    if r_idx: assign(o, r_idx, 'foot_R')
    print(f"{pname} → foot_L:{len(l_idx)} foot_R:{len(r_idx)}")

# ══════════════════════════════════════════════════════════════════════════════
# 4. part_4, 5 — 다리 → X<0=thigh_L, X>0=thigh_R  (shin 분리)
# ══════════════════════════════════════════════════════════════════════════════
for pname in ('tripo_part_4', 'tripo_part_5'):
    if pname not in mesh_objs: continue
    o = mesh_objs[pname]
    init_vgroups(o)
    shin_z = pz(0.22)
    for v in o.data.vertices:
        wco = o.matrix_world @ v.co
        left = wco.x <= 0
        bone = ('shin_L' if left else 'shin_R') if wco.z < shin_z else \
               ('thigh_L' if left else 'thigh_R')
        assign(o, [v.index], bone)
    print(f"{pname} → thigh+shin L/R")

# ══════════════════════════════════════════════════════════════════════════════
# 5. part_6 — 엉덩이 → 100% hips
# ══════════════════════════════════════════════════════════════════════════════
if 'tripo_part_6' in mesh_objs:
    o = mesh_objs['tripo_part_6']
    init_vgroups(o)
    assign(o, list(range(len(o.data.vertices))), 'hips')
    print(f"part_6 → hips ({len(o.data.vertices)}v)")

# ══════════════════════════════════════════════════════════════════════════════
# 6. part_7 — 오른 upper arm → 100% upper_arm_R
# ══════════════════════════════════════════════════════════════════════════════
if 'tripo_part_7' in mesh_objs:
    o = mesh_objs['tripo_part_7']
    init_vgroups(o)
    assign(o, list(range(len(o.data.vertices))), 'upper_arm_R')
    print(f"part_7 → upper_arm_R ({len(o.data.vertices)}v)")

# ══════════════════════════════════════════════════════════════════════════════
# 7. part_8 — 오른 forearm → 100% forearm_R
# ══════════════════════════════════════════════════════════════════════════════
if 'tripo_part_8' in mesh_objs:
    o = mesh_objs['tripo_part_8']
    init_vgroups(o)
    assign(o, list(range(len(o.data.vertices))), 'forearm_R')
    print(f"part_8 → forearm_R ({len(o.data.vertices)}v)")

# ══════════════════════════════════════════════════════════════════════════════
# 8. part_9~13 — 오른팔 디테일 → shoulder_R
# ══════════════════════════════════════════════════════════════════════════════
for pname in ('tripo_part_9','tripo_part_10','tripo_part_11','tripo_part_12','tripo_part_13'):
    if pname not in mesh_objs: continue
    o = mesh_objs[pname]
    init_vgroups(o)
    assign(o, list(range(len(o.data.vertices))), 'shoulder_R')
    print(f"{pname} → shoulder_R ({len(o.data.vertices)}v)")

# ── 한번에 parent_set(ARMATURE_NAME) → 올바른 bind matrix 생성 ───────────────
print("\nParenting all meshes to armature...")
bpy.ops.object.select_all(action='DESELECT')
for o in mesh_objs.values():
    o.select_set(True)
arm_obj.select_set(True)
bpy.context.view_layer.objects.active = arm_obj
bpy.ops.object.parent_set(type='ARMATURE_NAME')
print("Parented ✓")

# ── Export ────────────────────────────────────────────────────────────────────
print("\nExporting GLB...")
bpy.ops.export_scene.gltf(
    filepath=OUTPUT,
    export_format='GLB',
    export_skins=True,
    use_selection=False,
)
print(f"Done → {OUTPUT}")
