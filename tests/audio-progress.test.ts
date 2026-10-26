import { describe, expect, it } from "vitest";

import { resolveAudioProgressSeek } from "../lib/audio-progress";

describe("audio progress seeking", () => {
  it("maps a right-to-left drag position to the matching playback time", () => {
    expect(resolveAudioProgressSeek(75, 300, 240)).toBe(180);
  });

  it("clamps drags before and after the visual track", () => {
    expect(resolveAudioProgressSeek(-12, 300, 240)).toBe(240);
    expect(resolveAudioProgressSeek(360, 300, 240)).toBe(0);
  });

  it("does not seek while dimensions or duration are unknown", () => {
    expect(resolveAudioProgressSeek(20, 0, 240)).toBeNull();
    expect(resolveAudioProgressSeek(20, 300, 0)).toBeNull();
  });
});
