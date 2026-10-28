#!/usr/bin/env bash
set -euo pipefail

# Downloads a curated, bundled set of Noto Emoji PNG assets (128 px) for the
# Android keyboard. Source: https://github.com/googlefonts/noto-emoji
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/android-ime/app/src/main/res/drawable-nodpi"
BASE="https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/128"

mkdir -p "$DEST"

codes=(
  1f600 1f603 1f602 1f60d 1f60e 1f914 1f97a 1fae0
  1f525 2728 2b50 1f319 1f31f 1f496 2764 1f90d
  1f44d 1f44f 1f64f 1f91d 1f64c 1f44b 1f4aa 2705
  1f338 1f339 1f33a 1f33f 1f984 1f436 1f431 1f98b
  2615 1f370 1f389 1f381 1f4a1 1f680 1f3ae 1f4f8
)

for code in "${codes[@]}"; do
  target="$DEST/emoji_${code//-/_}.png"
  source_code="${code//-/_}"
  curl --fail --location --silent --show-error \
    "$BASE/emoji_u${source_code}.png" \
    --output "$target"
done

echo "Bundled ${#codes[@]} Noto Emoji images in $DEST"
