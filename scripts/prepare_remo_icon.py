from pathlib import Path

from PIL import Image


source = Path("/home/ubuntu/upload/ChatGPTImage21أغسطس2026،07_58_01م.png")
destination = Path("/home/ubuntu/remo-player/assets/images")

outputs = {
    "icon.png": 512,
    "splash-icon.png": 512,
    "favicon.png": 192,
    "android-icon-foreground.png": 432,
}

with Image.open(source) as image:
    base = image.convert("RGB")
    for filename, dimension in outputs.items():
        resized = base.resize((dimension, dimension), Image.Resampling.LANCZOS)
        resized.save(destination / filename, format="PNG", optimize=True, compress_level=9)
