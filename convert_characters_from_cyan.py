"""Create beta character GLBs from Cyan while preserving rig and animation."""
from io import BytesIO
import json
from pathlib import Path
import struct

from PIL import Image


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "assets" / "3d" / "cyan"
CLIPS = ("walk-m1s", "walk-m2l", "walk-m3e")
TARGETS = {
    "red": (0xEF, 0x3C, 0x58),
    "orange": (0xF2, 0x9A, 0x38),
    "yellow": (0xF1, 0xDD, 0x42),
}


def recolor_diffuse(image_bytes, target_rgb):
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    pixels = image.load()
    target_scale = tuple(channel / max(target_rgb) for channel in target_rgb)

    for y in range(image.height):
        for x in range(image.width):
            red, green, blue = pixels[x, y]
            if green > 40 and blue > 40 and green > red * 1.12 and blue > red * 1.12:
                brightness = max(green, blue)
                pixels[x, y] = tuple(round(brightness * scale) for scale in target_scale)

    output = BytesIO()
    image.save(output, format="JPEG", quality=95, subsampling=0)
    return output.getvalue()


def convert_glb(source_path, output_path, character_id, target_rgb):
    source = source_path.read_bytes()
    _, version, _ = struct.unpack_from("<4sII", source, 0)
    json_length, json_type = struct.unpack_from("<II", source, 12)
    json_start = 20
    document = json.loads(source[json_start:json_start + json_length].rstrip(b" \0"))
    bin_header = json_start + json_length
    bin_length, bin_type = struct.unpack_from("<II", source, bin_header)
    binary = bytearray(source[bin_header + 8:bin_header + 8 + bin_length])

    for image in document.get("images", []):
        if "Diffuse" not in image.get("name", ""):
            continue
        view = document["bufferViews"][image["bufferView"]]
        offset = view.get("byteOffset", 0)
        old_length = view["byteLength"]
        replacement = recolor_diffuse(binary[offset:offset + old_length], target_rgb)
        padded = replacement + b"\0" * ((4 - len(replacement) % 4) % 4)
        binary[offset:offset + old_length] = padded
        delta = len(padded) - old_length
        view["byteLength"] = len(replacement)
        for other_view in document["bufferViews"]:
            if other_view is not view and other_view.get("byteOffset", 0) > offset:
                other_view["byteOffset"] = other_view.get("byteOffset", 0) + delta

    source_name = "Cyan"
    target_name = character_id.capitalize()
    for material in document.get("materials", []):
        material["name"] = material.get("name", "").replace(source_name, target_name).replace("cyan", character_id)
    for node in document.get("nodes", []):
        node["name"] = node.get("name", "").replace(source_name, target_name).replace("cyan", character_id)

    document["buffers"][0]["byteLength"] = len(binary)
    json_bytes = json.dumps(document, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    json_bytes += b" " * ((4 - len(json_bytes) % 4) % 4)
    binary += b"\0" * ((4 - len(binary) % 4) % 4)
    total_length = 12 + 8 + len(json_bytes) + 8 + len(binary)
    output = (
        struct.pack("<4sII", b"glTF", version, total_length)
        + struct.pack("<II", len(json_bytes), json_type)
        + json_bytes
        + struct.pack("<II", len(binary), bin_type)
        + binary
    )
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_bytes(output)
    print(f"Created Cyan-based {target_name}: {output_path.name}")


for target_id, color in TARGETS.items():
    for clip in CLIPS:
        convert_glb(
            SOURCE / f"{clip}.glb",
            ROOT / "assets" / "3d" / target_id / f"{clip}.glb",
            target_id,
            color,
        )
