import { describe, expect, it } from "vitest";

import { resolveSafeVideoSeek } from "../lib/video-seek";

describe("safe video seeking", () => {
  it("keeps relative seeking inside the known video bounds", () => {
    expect(resolveSafeVideoSeek(20, 100, 10)).toBe(30);
    expect(resolveSafeVideoSeek(5, 100, -10)).toBe(0);
    expect(resolveSafeVideoSeek(95, 100, 10)).toBe(100);
  });

  it("does not seek while the native player has no duration", () => {
    expect(resolveSafeVideoSeek(5, 0, 10)).toBeNull();
    expect(resolveSafeVideoSeek(Number.NaN, 100, 10)).toBeNull();
  });
});
