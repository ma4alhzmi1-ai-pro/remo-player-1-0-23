import { describe, expect, it } from "vitest";
import { resolveVideoProgressSeek } from "../lib/video-progress";

describe("video progress seeking", () => {
  it("maps the RTL touch point to the matching playback time", () => {
    expect(resolveVideoProgressSeek(50, 200, 120)).toBe(90);
    expect(resolveVideoProgressSeek(50, 200, 120, "rtl")).toBe(90);
  });

  it("maps the LTR touch point to the matching playback time", () => {
    expect(resolveVideoProgressSeek(50, 200, 120, "ltr")).toBe(30);
    expect(resolveVideoProgressSeek(200, 200, 120, "ltr")).toBe(120);
  });

  it("clamps touches before and after the visual track", () => {
    expect(resolveVideoProgressSeek(-10, 200, 120)).toBe(120);
    expect(resolveVideoProgressSeek(260, 200, 120)).toBe(0);
    expect(resolveVideoProgressSeek(-10, 200, 120, "ltr")).toBe(0);
    expect(resolveVideoProgressSeek(260, 200, 120, "ltr")).toBe(120);
  });

  it("does not seek from invalid geometry", () => {
    expect(resolveVideoProgressSeek(40, 0, 120)).toBeNull();
    expect(resolveVideoProgressSeek(40, 200, 0)).toBeNull();
  });
});
