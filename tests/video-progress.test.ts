import { describe, expect, it } from "vitest";

import { resolveVideoProgressSeek } from "../lib/video-progress";

describe("video progress seeking", () => {
  it("maps a right-to-left touch point to the matching playback time", () => {
    expect(resolveVideoProgressSeek(50, 200, 120)).toBe(90);
  });

  it("clamps touches before and after the visual track", () => {
    expect(resolveVideoProgressSeek(-10, 200, 120)).toBe(120);
    expect(resolveVideoProgressSeek(260, 200, 120)).toBe(0);
  });

  it("does not seek from invalid geometry", () => {
    expect(resolveVideoProgressSeek(40, 0, 120)).toBeNull();
    expect(resolveVideoProgressSeek(40, 200, 0)).toBeNull();
  });
});
