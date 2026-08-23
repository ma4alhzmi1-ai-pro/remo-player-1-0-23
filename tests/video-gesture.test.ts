import { describe, expect, it } from "vitest";

import { resolveVideoGesture } from "../lib/video-gesture";

describe("video gesture resolution", () => {
  it("seeks forward and backward for deliberate horizontal swipes", () => {
    expect(resolveVideoGesture(70, 8, 50, 300)).toEqual({ type: "seek", seconds: 10 });
    expect(resolveVideoGesture(-70, 8, 50, 300)).toEqual({ type: "seek", seconds: -10 });
  });

  it("uses the left side for volume and the right side for brightness", () => {
    expect(resolveVideoGesture(6, -60, 50, 300)).toEqual({ type: "volume", delta: 0.1 });
    expect(resolveVideoGesture(6, 60, 50, 300)).toEqual({ type: "volume", delta: -0.1 });
    expect(resolveVideoGesture(6, -60, 250, 300)).toEqual({ type: "brightness", delta: 0.1 });
    expect(resolveVideoGesture(6, 60, 250, 300)).toEqual({ type: "brightness", delta: -0.1 });
  });

  it("ignores taps and short accidental movement", () => {
    expect(resolveVideoGesture(12, 9, 50, 300)).toBeNull();
  });

  it("ignores invalid native gesture values instead of throwing", () => {
    expect(resolveVideoGesture(Number.NaN, 40, 50, 300)).toBeNull();
    expect(resolveVideoGesture(4, 40, Number.NaN, 300)).toBeNull();
    expect(resolveVideoGesture(4, 40, 50, 0)).toBeNull();
  });
});
