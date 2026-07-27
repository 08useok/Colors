"""Clone Cyan's rigged GLBs into a green character."""
from pathlib import Path

import bpy
import numpy as np


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "assets" / "3d" / "cyan"
OUTPUT = ROOT / "assets" / "3d" / "green"
CLIPS = ("walk-m1s", "walk-m2l", "walk-m3e")


def recolor_cyan_to_green():
    for image in bpy.data.images:
        if image.size[0] == 0 or "Diffuse" not in image.name:
            continue
        pixels = np.empty(len(image.pixels), dtype=np.float32)
        image.pixels.foreach_get(pixels)
        rgba = pixels.reshape((-1, 4))
        red, green, blue = rgba[:, 0], rgba[:, 1], rgba[:, 2]
        cyan_mask = (
            (green > 0.16)
            & (blue > 0.16)
            & (green > red * 1.12)
            & (blue > red * 1.12)
        )
        brightness = np.maximum(green, blue)
        rgba[cyan_mask, 0] = 0.0
        rgba[cyan_mask, 1] = brightness[cyan_mask]
        rgba[cyan_mask, 2] = 0.0
        image.pixels.foreach_set(rgba.reshape(-1))
        image.update()
        image.pack()
        print(f"Recolored {image.name}: {int(cyan_mask.sum())} cyan pixels")

    for material in bpy.data.materials:
        if not material.use_nodes:
            continue
        principled = material.node_tree.nodes.get("Principled BSDF")
        if principled is None:
            continue
        color = principled.inputs["Base Color"].default_value
        if color[1] > color[0] * 1.12 and color[2] > color[0] * 1.12:
            brightness = max(color[1], color[2])
            principled.inputs["Base Color"].default_value = (0.0, brightness, 0.0, color[3])


def convert_clip(clip):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(SOURCE / f"{clip}.glb"))
    recolor_cyan_to_green()
    for material in bpy.data.materials:
        material.name = material.name.replace("Cyan", "Green").replace("cyan", "green")
    for obj in bpy.context.scene.objects:
        obj.name = obj.name.replace("Cyan", "Green").replace("cyan", "green")
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
    print(f"Created Cyan-based Green {clip}")


for name in CLIPS:
    convert_clip(name)
