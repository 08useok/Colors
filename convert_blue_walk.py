"""Convert the supplied Blue AccuRIG motion FBXs into textured GLB files."""
from pathlib import Path

import bpy


SOURCE_DIR = Path(r"C:\Users\useok\Downloads\blue+toy+figure+3d+model")
OUTPUT_DIR = Path(r"C:\Users\useok\OneDrive\문서\New project\assets\3d\blue")
CLIPS = ("walk-m1s", "walk-m2l", "walk-m3e")


def convert_clip(name):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.fbx(
        filepath=str(SOURCE_DIR / f"{name}.fbx"),
        use_anim=True,
        ignore_leaf_bones=False,
        automatic_bone_orientation=False,
    )
    print(
        f"{name}: meshes={sum(o.type == 'MESH' for o in bpy.context.scene.objects)}, "
        f"armatures={sum(o.type == 'ARMATURE' for o in bpy.context.scene.objects)}, "
        f"actions={len(bpy.data.actions)}, images={len(bpy.data.images)}"
    )
    bpy.ops.export_scene.gltf(
        filepath=str(OUTPUT_DIR / f"{name}.glb"),
        export_format="GLB",
        export_skins=True,
        export_animations=True,
        export_nla_strips=True,
        export_anim_single_armature=True,
        export_materials="EXPORT",
        export_image_format="AUTO",
        use_selection=False,
    )


OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
for clip in CLIPS:
    convert_clip(clip)
