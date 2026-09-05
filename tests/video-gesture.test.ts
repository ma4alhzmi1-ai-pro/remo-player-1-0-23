import { describe, expect, it } from "vitest";

import { resolveLocalBrightness, resolveLocalVolume, resolveVideoGesture, shouldActivateVideoGesture } from "../lib/video-gesture";

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

  it("activates the responder only for a real movement when controls are unlocked", () => {
    expect(shouldActivateVideoGesture(7, 0, false)).toBe(false);
    expect(shouldActivateVideoGesture(9, 0, false)).toBe(true);
    expect(shouldActivateVideoGesture(0, -9, false)).toBe(true);
    expect(shouldActivateVideoGesture(40, 0, true)).toBe(false);
    expect(shouldActivateVideoGesture(Number.NaN, 40, false)).toBe(false);
  });

  it("tracks the local brightness preview continuously and keeps it within a safe visual range", () => {
    expect(resolveLocalBrightness(0.7, -80, 400)).toBeCloseTo(0.967, 2);
    expect(resolveLocalBrightness(0.7, 120, 400)).toBeCloseTo(0.3, 2);
    expect(resolveLocalBrightness(0.3, 500, 400)).toBe(0.05);
    expect(resolveLocalBrightness(0.8, -500, 400)).toBe(1);
    expect(resolveLocalBrightness(0.8, 20, 0)).toBeNull();
  });

  it("tracks volume continuously and clamps it to the player range", () => {
    expect(resolveLocalVolume(0.7, -80, 400)).toBeCloseTo(0.967, 2);
    expect(resolveLocalVolume(0.7, 120, 400)).toBeCloseTo(0.3, 2);
    expect(resolveLocalVolume(0.2, 500, 400)).toBe(0);
    expect(resolveLocalVolume(0.8, -500, 400)).toBe(1);
    expect(resolveLocalVolume(0.8, 20, 0)).toBeNull();
  });
});
