import { describe, expect, it } from "vitest";

import { nextVideoPlaybackSpeed, VIDEO_PLAYBACK_SPEEDS } from "../lib/video-playback-settings";

describe("video playback speed settings", () => {
  it("provides the requested 0.25x through 4x speeds", () => {
    expect(VIDEO_PLAYBACK_SPEEDS).toEqual([0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4]);
  });

  it("cycles from the fastest speed back to the slowest", () => {
    expect(nextVideoPlaybackSpeed(1)).toBe(1.25);
    expect(nextVideoPlaybackSpeed(4)).toBe(0.25);
    expect(nextVideoPlaybackSpeed(99)).toBe(0.25);
  });
});
