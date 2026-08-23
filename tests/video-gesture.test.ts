import { describe, expect, it } from "vitest";

import { resolveVideoGesture } from "../lib/video-gesture";

describe("video gesture resolution", () => {
  it("seeks forward and backward for deliberate horizontal swipes", () => {
    expect(resolveVideoGesture(70, 8)).toEqual({ type: "seek", seconds: 10 });
    expect(resolveVideoGesture(-70, 8)).toEqual({ type: "seek", seconds: -10 });
  });

  it("raises and lowers volume for vertical swipes", () => {
    expect(resolveVideoGesture(6, -60)).toEqual({ type: "volume", delta: 0.1 });
    expect(resolveVideoGesture(6, 60)).toEqual({ type: "volume", delta: -0.1 });
  });

  it("ignores taps and short accidental movement", () => {
    expect(resolveVideoGesture(12, 9)).toBeNull();
  });
});
