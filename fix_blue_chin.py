"""Rebuild Blue GLBs while smoothing only the Head-weighted lower chin."""
from pathlib import Path
import math

import bpy


ROOT = Path(__file__).resolve().parent
SOURCE = Path(r"C:\Users\useok\Downloads\blue+toy+figure+3d+model")
OUTPUT = ROOT / "assets" / "3d" / "blue"
CLIPS = ("walk-m1s", "walk-m2l", "walk-m3e")


def smooth_lower_chin(mesh_object):
    group_names = {group.index: group.name for group in mesh_object.vertex_groups}
    head_indices = []
    for vertex in mesh_object.data.vertices:
        if not vertex.groups:
            continue
        dominant = max(vertex.groups, key=lambda membership: membership.weight)
        if group_names[dominant.group] == "CC_Base_Head":
            head_indices.append(vertex.index)

    basis = mesh_object.data.shape_keys.key_blocks[0].data
    coordinates = [basis[index].co for index in head_indices]
    min_x = min(co.x for co in coordinates)
    max_x = max(co.x for co in coordinates)
    min_y = min(co.y for co in coordinates)
    max_y = max(co.y for co in coordinates)
    min_z = min(co.z for co in coordinates)
    max_z = max(co.z for co in coordinates)
    center_x = (min_x + max_x) * 0.5
    center_y = (min_y + max_y) * 0.5
    center_z = (min_z + max_z) * 0.5
    radius_x = (max_x - min_x) * 0.5
    radius_y = (max_y - min_y) * 0.5
    lower_radius_z = center_z - 60.8

    deltas = {}
    for index in head_indices:
        coordinate = basis[index].co
        if coordinate.z >= 66.0:
            continue
        normalized_radius = (
            ((coordinate.x - center_x) / radius_x) ** 2
            + ((coordinate.y - center_y) / radius_y) ** 2
        )
        if normalized_radius >= 1.0:
            continue
        target_z = center_z - lower_radius_z * math.sqrt(1.0 - normalized_radius)
        blend = max(0.0, min(1.0, (66.0 - coordinate.z) / 7.5))
        original_z = coordinate.z
        coordinate.z += (target_z - coordinate.z) * blend
        deltas[index] = coordinate.z - original_z

    for key_block in mesh_object.data.shape_keys.key_blocks[1:]:
        for index, delta_z in deltas.items():
            key_block.data[index].co.z += delta_z
    mesh_object.data.update()
    print(f"Smoothed {len(deltas)} Head-only chin vertices")


def convert_clip(clip):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.fbx(
        filepath=str(SOURCE / f"{clip}.fbx"),
        use_anim=True,
        ignore_leaf_bones=False,
        automatic_bone_orientation=False,
    )
    character_mesh = max(
        (obj for obj in bpy.context.scene.objects if obj.type == "MESH"),
        key=lambda obj: len(obj.data.vertices),
    )
    smooth_lower_chin(character_mesh)
    bpy.ops.export_scene.gltf(
        filepath=str(OUTPUT / f"{clip}.glb"),
        export_format="GLB",
        export_skins=True,
        export_animations=True,
        export_nla_strips=True,
        export_anim_single_armature=True,
        export_materials="EXPORT",
        export_image_format="AUTO",
        use_selection=False,
    )


for name in CLIPS:
    convert_clip(name)
