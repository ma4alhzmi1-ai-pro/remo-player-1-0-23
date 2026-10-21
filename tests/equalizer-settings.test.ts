import { describe, expect, it } from "vitest";

import { EQUALIZER_FREQUENCIES, EQUALIZER_PRESETS, normalizeEqualizerBands, presetBands } from "../lib/equalizer-settings";

describe("equalizer settings", () => {
  it("keeps five frequency bands within the supported range", () => {
    expect(normalizeEqualizerBands([-99, -2, 4.6, 20])).toEqual([-12, -2, 5, 12, 0]);
    expect(EQUALIZER_FREQUENCIES).toHaveLength(5);
  });

  it("provides all fourteen requested preset curves", () => {
    expect(EQUALIZER_PRESETS).toHaveLength(14);
    expect(presetBands("heavy-metal")).toEqual([4, 1, 9, 3, 0]);
    expect(presetBands("amplifier")).toEqual([8, 5, 2, 4, 6]);
  });
});
