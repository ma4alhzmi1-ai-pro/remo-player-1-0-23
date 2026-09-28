#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$(mktemp -d)"
trap 'rm -rf "$OUT"' EXIT
javac -encoding UTF-8 -d "$OUT" \
  "$ROOT/android-ime/app/src/main/java/com/remokeyboard/ime/TranslationEngine.java" \
  "$ROOT/scripts/TranslationEngineHarness.java"
java -cp "$OUT" com.remokeyboard.ime.TranslationEngineHarness
