#!/usr/bin/env python3
"""Build an offline catalog of fully-qualified Unicode emoji for the Android IME."""

from pathlib import Path
from urllib.request import urlopen
import re

SOURCE = "https://www.unicode.org/Public/emoji/latest/emoji-test.txt"
ROOT = Path(__file__).resolve().parents[1]
DESTINATION = ROOT / "android-ime" / "app" / "src" / "main" / "assets" / "emoji_catalog.tsv"

line_pattern = re.compile(r"^([0-9A-F ]+)\s*;\s*fully-qualified\s*#\s*(\S+)\s+E[0-9.]+\s+(.+)$")
group = "Smileys & Emotion"
subgroup = "face-smiling"
items: list[tuple[str, str, str, str]] = []
seen: set[str] = set()

with urlopen(SOURCE, timeout=30) as response:
    source_text = response.read().decode("utf-8")

for raw_line in source_text.splitlines():
    if raw_line.startswith("# group: "):
        group = raw_line.removeprefix("# group: ").strip()
        continue
    if raw_line.startswith("# subgroup: "):
        subgroup = raw_line.removeprefix("# subgroup: ").strip()
        continue
    match = line_pattern.match(raw_line)
    if not match:
        continue
    codepoints, emoji, name = match.groups()
    if emoji in seen:
        continue
    seen.add(emoji)
    items.append((group, subgroup, emoji, name))

DESTINATION.parent.mkdir(parents=True, exist_ok=True)
with DESTINATION.open("w", encoding="utf-8", newline="\n") as output:
    output.write("# Unicode Emoji Test catalog, fully-qualified entries only.\n")
    output.write("# group\tsubgroup\temoji\tname\n")
    for row in items:
        output.write("\t".join(value.replace("\t", " ") for value in row) + "\n")

print(f"Built {len(items)} fully-qualified emoji entries at {DESTINATION}")
