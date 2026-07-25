"""Clone the Blue GLB motion set into a green-textured rigged character."""
from pathlib import Path

import bpy
import numpy as np


PROJECT_DIR = Path(__file__).resolve().parent
SOURCE_DIR = PROJECT_DIR / "assets" / "3d" / "blue"
OUTPUT_DIR = PROJECT_DIR / "assets" / "3d" / "green"
CLIPS = ("walk-m1s", "walk-m2l", "walk-m3e")


def recolor_blue_texture_to_green():
    for image in bpy.data.images:
        if "Diffuse" not in image.name or image.size[0] == 0:
            continue
        pixels = np.empty(len(image.pixels), dtype=np.float32)
        image.pixels.foreach_get(pixels)
        rgba = pixels.reshape((-1, 4))
        red, green, blue = rgba[:, 0], rgba[:, 1], rgba[:, 2]
        blue_mask = (blue > 0.12) & (blue > red * 1.12) & (blue > green * 1.08)
        brightness = np.maximum(np.maximum(red, green), blue)
        rgba[blue_mask, 0] = 0.0
        rgba[blue_mask, 1] = brightness[blue_mask]
        rgba[blue_mask, 2] = 0.0
        image.pixels.foreach_set(rgba.reshape(-1))
        image.update()
        image.pack()
        print(f"Recolored {image.name}: {int(blue_mask.sum())} pixels")


def convert_clip(name):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(SOURCE_DIR / f"{name}.glb"))
    recolor_blue_texture_to_green()
    for material in bpy.data.materials:
        material.name = material.name.replace("blue", "green").replace("Blue", "Green")
    for obj in bpy.context.scene.objects:
        obj.name = obj.name.replace("blue", "green").replace("Blue", "Green")
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
    print(
        f"{name}: meshes={sum(o.type == 'MESH' for o in bpy.context.scene.objects)}, "
        f"armatures={sum(o.type == 'ARMATURE' for o in bpy.context.scene.objects)}, "
        f"actions={len(bpy.data.actions)}"
    )


OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
for clip in CLIPS:
    convert_clip(clip)
