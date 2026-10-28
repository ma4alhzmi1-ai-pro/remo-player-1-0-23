#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="$ROOT/android-ime/app/src/main/assets/NotoColorEmoji.ttf"
mkdir -p "$(dirname "$DEST")"
curl --fail --location --retry 3 --silent --show-error \
  "https://github.com/googlefonts/noto-emoji/raw/main/fonts/NotoColorEmoji.ttf" \
  --output "$DEST"
test "$(wc -c < "$DEST")" -gt 1000000
echo "Embedded Noto Color Emoji font: $(du -h "$DEST" | cut -f1)"
