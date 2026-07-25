"""Convert the supplied Cyan AccuRIG walk FBXs into web-ready GLB files.

Run with Blender in background mode. Textures referenced by the FBXs are
packed into each GLB so the browser does not need the source .fbm directory.
"""
from pathlib import Path

import bpy


SOURCE_DIR = Path(r"C:\Users\useok\Downloads\cute+3d+character")
OUTPUT_DIR = Path(r"C:\Users\useok\OneDrive\문서\New project\assets\3d\cyan")
CLIPS = ("walk-m1s", "walk-m2l", "walk-m3e")


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def convert_clip(name):
    source = SOURCE_DIR / f"{name}.fbx"
    output = OUTPUT_DIR / f"{name}.glb"
    reset_scene()
    bpy.ops.import_scene.fbx(
        filepath=str(source),
        use_anim=True,
        ignore_leaf_bones=False,
        automatic_bone_orientation=False,
    )

    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    armatures = [obj for obj in bpy.context.scene.objects if obj.type == "ARMATURE"]
    print(
        f"{name}: meshes={len(meshes)}, armatures={len(armatures)}, "
        f"actions={len(bpy.data.actions)}, images={len(bpy.data.images)}"
    )

    bpy.ops.export_scene.gltf(
        filepath=str(output),
        export_format="GLB",
        export_skins=True,
        export_animations=True,
        export_nla_strips=True,
        export_anim_single_armature=True,
        export_materials="EXPORT",
        export_image_format="AUTO",
        use_selection=False,
    )
    print(f"Exported {output}")


OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
for clip in CLIPS:
    convert_clip(clip)
