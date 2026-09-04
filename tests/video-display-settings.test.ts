import { describe, expect, it } from "vitest";

import { resolveFixedFrameLayout, resolveFrameDimensions, resolveSourceAspect, resolveVideoContentFit } from "../lib/video-display-settings";

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

  it("uses the active video track ratio when source framing is selected", () => {
    expect(resolveSourceAspect(1440, 1080)).toBeCloseTo(4 / 3);
    expect(resolveSourceAspect(1920, 0)).toBeNull();
    expect(resolveFrameDimensions("source", 1000, 600, 4 / 3)).toEqual({ width: 800, height: 600 });
    expect(resolveFrameDimensions("source", 1000, 600, 16 / 9)).toEqual({ width: 1000, height: 562.5 });
  });

  it("positions a fixed video frame exactly in the center of a wide landscape surface", () => {
    expect(resolveFixedFrameLayout("16:9", 2400, 1080)).toEqual({ width: 1920, height: 1080, left: 240, top: 0 });
    expect(resolveFixedFrameLayout("4:3", 2400, 1080)).toEqual({ width: 1440, height: 1080, left: 480, top: 0 });
  });

  it("centers a 4:3 frame vertically inside a tall portrait surface", () => {
    expect(resolveFixedFrameLayout("4:3", 1080, 2400)).toEqual({ width: 1080, height: 810, left: 0, top: 795 });
  });
});
