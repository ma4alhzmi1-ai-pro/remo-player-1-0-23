import { describe, expect, it } from "vitest";

import { resolveFrameDimensions, resolveVideoContentFit } from "../lib/video-display-settings";

describe("video display settings", () => {
  it("uses containment in auto mode on every orientation and only covers in cinematic mode", () => {
    expect(resolveVideoContentFit("auto", false, false)).toBe("contain");
    expect(resolveVideoContentFit("auto", true, false)).toBe("contain");
    expect(resolveVideoContentFit("auto", false, true)).toBe("cover");
  });

  it("preserves an explicit content fit selection", () => {
    expect(resolveVideoContentFit("fill", false, false)).toBe("fill");
    expect(resolveVideoContentFit("contain", true, true)).toBe("contain");
  });

  it("centers requested aspect frames within the current viewport", () => {
    expect(resolveFrameDimensions("16:9", 1000, 600)).toEqual({ width: 1000, height: 562.5 });
    expect(resolveFrameDimensions("1:1", 1000, 600)).toEqual({ width: 600, height: 600 });
    expect(resolveFrameDimensions("screen", 1000, 600)).toBeNull();
  });
});
