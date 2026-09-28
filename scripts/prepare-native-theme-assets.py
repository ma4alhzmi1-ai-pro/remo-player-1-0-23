from pathlib import Path
from PIL import Image, ImageOps

PROJECT = Path(__file__).resolve().parents[1]
SOURCE_DIR = Path("/home/ubuntu/webdev-static-assets")
DESTINATION = PROJECT / "android-ime" / "app" / "src" / "main" / "res" / "drawable-nodpi"

THEMES = {
    "remo-feminine-rose-silk.png": "remo_feminine_rose_silk.webp",
    "remo-feminine-lilac-butterflies.png": "remo_feminine_lilac_butterflies.webp",
    "remo-feminine-pearl-bloom.png": "remo_feminine_pearl_bloom.webp",
    "remo-feminine-violet-marble.png": "remo_feminine_violet_marble.webp",
    "remo-masculine-neon-grid.png": "remo_masculine_neon_grid.webp",
    "remo-masculine-ember-steel.png": "remo_masculine_ember_steel.webp",
    "remo-masculine-blue-flame.png": "remo_masculine_blue_flame.webp",
    "remo-masculine-forest-camo.png": "remo_masculine_forest_camo.webp",
    "remo-islamic-lanterns.png": "remo_islamic_lanterns.webp",
    "remo-islamic-mosque-dusk.png": "remo_islamic_mosque_dusk.webp",
}

DESTINATION.mkdir(parents=True, exist_ok=True)
processed = []
missing = []
for source_name, output_name in THEMES.items():
    source = SOURCE_DIR / source_name
    if not source.exists() or source.stat().st_size < 1024:
        missing.append(source_name)
        continue
    with Image.open(source) as image:
        rgb = ImageOps.exif_transpose(image).convert("RGB")
        fitted = ImageOps.fit(rgb, (900, 600), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
        destination = DESTINATION / output_name
        fitted.save(destination, "WEBP", quality=72, method=6)
        processed.append((output_name, destination.stat().st_size))

if missing:
    raise SystemExit("الخلفيات غير جاهزة بعد: " + ", ".join(missing))
if len(processed) != len(THEMES):
    raise SystemExit("عدد الخلفيات المعالجة غير مكتمل")
print("تم تحسين الخلفيات:")
for name, size in processed:
    print(f"- {name}: {size // 1024}KB")
