import bpy
from mathutils import Vector

INPUT  = r"C:\Users\useok\Downloads\pink cartoon character 3d model.glb"
OUTPUT = r"C:\Users\useok\OneDrive\문서\New project\assets\3d\pink\pink_rigged.glb"

print("=== Auto-rig Pink v5 (hard cutoff) ===")

bpy.ops.wm.read_homefile(use_empty=True)
bpy.ops.import_scene.gltf(filepath=INPUT)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

bpy.ops.object.select_all(action='DESELECT')
mesh_objs = [o for o in bpy.context.scene.objects if o.type == 'MESH']
for o in mesh_objs: o.select_set(True)
bpy.context.view_layer.objects.active = mesh_objs[0]
bpy.ops.object.join()
body = bpy.context.active_object
body.name = "pink_body"

bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.remove_doubles(threshold=0.0001)
bpy.ops.mesh.delete_loose()
bpy.ops.object.mode_set(mode='OBJECT')

coords = [body.matrix_world @ v.co for v in body.data.vertices]
min_x = min(c.x for c in coords); max_x = max(c.x for c in coords)
min_z = min(c.z for c in coords); max_z = max(c.z for c in coords)
H = max_z - min_z; W = max_x - min_x; cx = (min_x+max_x)/2; half_w = W*0.5
print(f"BBox X={min_x:.3f}~{max_x:.3f} Z={min_z:.3f}~{max_z:.3f}")

def pz(f): return min_z + H * f
def px(f, s): return cx + s * half_w * f

# Armature
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
  'shoulder_L': ((px(.55,-1),0,pz(.68)),(px(.70,-1),0,pz(.67)),'chest'),
  'upper_arm_L':((px(.70,-1),0,pz(.67)),(px(.85,-1),0,pz(.53)),'shoulder_L'),
  'forearm_L':  ((px(.85,-1),0,pz(.53)),(px(.90,-1),0,pz(.39)),'upper_arm_L'),
  'hand_L':     ((px(.90,-1),0,pz(.39)),(px(.95,-1),0,pz(.30)),'forearm_L'),
  'shoulder_R': ((px(.55,+1),0,pz(.68)),(px(.70,+1),0,pz(.67)),'chest'),
  'upper_arm_R':((px(.70,+1),0,pz(.67)),(px(.85,+1),0,pz(.53)),'shoulder_R'),
  'forearm_R':  ((px(.85,+1),0,pz(.53)),(px(.90,+1),0,pz(.39)),'upper_arm_R'),
  'hand_R':     ((px(.90,+1),0,pz(.39)),(px(.95,+1),0,pz(.30)),'forearm_R'),
  'thigh_L':    ((px(.20,-1),0,pz(.40)),(px(.20,-1),0,pz(.20)),'hips'),
  'shin_L':     ((px(.20,-1),0,pz(.20)),(px(.18,-1),0,pz(.04)),'thigh_L'),
  'foot_L':     ((px(.18,-1),0,pz(.04)),(px(.18,-1),.06,pz(.0)),'shin_L'),
  'thigh_R':    ((px(.20,+1),0,pz(.40)),(px(.20,+1),0,pz(.20)),'hips'),
  'shin_R':     ((px(.20,+1),0,pz(.20)),(px(.18,+1),0,pz(.04)),'thigh_R'),
  'foot_R':     ((px(.18,+1),0,pz(.04)),(px(.18,+1),.06,pz(.0)),'shin_R'),
}
for name,(h,t,p) in BONES.items():
    b = eb.new(name); b.head=Vector(h); b.tail=Vector(t)
    if p and p in eb: b.parent=eb[p]; b.use_connect=False
bpy.ops.object.mode_set(mode='OBJECT')

# -----------------------------------------------------------------------
# 하드 컷오프 웨이트 할당 (실제 버텍스 분포 기반)
# 실측 데이터: Z=60-70%에서 |X|>0.55 half_w = 팔
# -----------------------------------------------------------------------
bpy.context.view_layer.objects.active = body
for name in BONES: body.vertex_groups.new(name=name)

ARM_X_THRESH = 0.55   # |X|/half_w > 이값이면 팔로 판정
ARM_Z_LO     = 0.52
ARM_Z_HI     = 0.82

LEG_Z_LO     = 0.02
LEG_Z_HI     = 0.44
SHIN_Z_SPLIT = 0.22
FOOT_Z_SPLIT = 0.07

counts = {n: 0 for n in BONES}

def assign(v_idx, bone, w=1.0):
    body.vertex_groups[bone].add([v_idx], w, 'REPLACE')
    counts[bone] += 1

for v in body.data.vertices:
    wco = body.matrix_world @ v.co
    vx, vz = wco.x, wco.z
    z_f   = (vz - min_z) / H          # 0=발 1=머리
    x_abs = abs(vx - cx) / half_w     # 0=중심 1=측면
    left  = vx < cx

    # 1. 팔 (Z=52~82%, |X|>0.55)
    if ARM_Z_LO < z_f < ARM_Z_HI and x_abs > ARM_X_THRESH:
        side = 'L' if left else 'R'
        if z_f > 0.64:
            assign(v.index, f'shoulder_{side}')
        elif z_f > 0.50:
            assign(v.index, f'upper_arm_{side}')
        else:
            assign(v.index, f'forearm_{side}')

    # 2. 다리 (Z=2~44%)
    elif LEG_Z_LO < z_f < LEG_Z_HI:
        side = 'L' if left else 'R'
        if z_f < FOOT_Z_SPLIT:
            assign(v.index, f'foot_{side}')
        elif z_f < SHIN_Z_SPLIT:
            assign(v.index, f'shin_{side}')
        else:
            assign(v.index, f'thigh_{side}')

    # 3. 몸통/머리 (나머지)
    else:
        if z_f > 0.78:
            assign(v.index, 'head')
        elif z_f > 0.70:
            assign(v.index, 'neck')
        elif z_f > 0.58:
            assign(v.index, 'chest')
        elif z_f > 0.48:
            assign(v.index, 'spine')
        else:
            assign(v.index, 'hips')

print("=== Vertex distribution ===")
for bn, cnt in sorted(counts.items(), key=lambda x: -x[1]):
    if cnt > 0: print(f"  {bn}: {cnt}")

bpy.ops.object.select_all(action='DESELECT')
body.select_set(True)
arm_obj.select_set(True)
bpy.context.view_layer.objects.active = arm_obj
bpy.ops.object.parent_set(type='ARMATURE_NAME')
print("Parented ✓")

bpy.ops.export_scene.gltf(
    filepath=OUTPUT, export_format='GLB',
    export_skins=True, use_selection=False,
)
print(f"Done -> {OUTPUT}")
