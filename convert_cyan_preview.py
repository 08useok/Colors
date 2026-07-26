"""Convert the Cyan base character FBX into a web-ready preview GLB.

Unlike convert_cyan_walk.py this keeps no animation — the lobby preview only
needs the static model. Textures are packed into the GLB so the browser does
not need the source .fbm directory.

Run with Blender in background mode:
    blender --background --python convert_cyan_preview.py
"""
from pathlib import Path

import bpy


SOURCE = Path(
    r"C:\Users\useok\Downloads\cute+3d+character"
    r"\tripo_convert_a202915d-1f69-4771-a21e-14cfdec532de.fbx"
)
OUTPUT = Path(
    r"C:\Users\useok\OneDrive\문서\New project\assets\3d\cyan\cyan_preview.glb"
)


bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(
    filepath=str(SOURCE),
    use_anim=False,
    ignore_leaf_bones=False,
    automatic_bone_orientation=False,
)

meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
armatures = [obj for obj in bpy.context.scene.objects if obj.type == "ARMATURE"]
print(
    f"cyan_preview: meshes={len(meshes)}, armatures={len(armatures)}, "
    f"images={len(bpy.data.images)}"
)

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.export_scene.gltf(
    filepath=str(OUTPUT),
    export_format="GLB",
    export_skins=True,
    export_animations=False,
    export_materials="EXPORT",
    export_image_format="AUTO",
    use_selection=False,
)
print(f"Exported {OUTPUT}")
