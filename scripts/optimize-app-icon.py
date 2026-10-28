from pathlib import Path
from PIL import Image

project = Path(__file__).resolve().parents[1]
source = project / "assets/images/icon.png"
targets = [
    project / "assets/images/icon.png",
    project / "assets/images/splash-icon.png",
    project / "assets/images/favicon.png",
    project / "assets/images/android-icon-foreground.png",
]

with Image.open(source) as original:
    image = original.convert("RGBA")
    image.thumbnail((512, 512), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (512, 512), (16, 22, 31, 255))
    offset = ((512 - image.width) // 2, (512 - image.height) // 2)
    canvas.alpha_composite(image, offset)
    for target in targets:
        canvas.save(target, format="PNG", optimize=True, compress_level=9)
        print(f"{target.name}: {target.stat().st_size} bytes")
