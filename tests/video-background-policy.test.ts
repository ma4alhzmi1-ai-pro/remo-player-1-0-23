import { describe, expect, it } from "vitest";

import { shouldPauseVideoForBackground } from "../lib/video-background-policy";

describe("video background policy", () => {
  it("pauses ordinary video playback when the app enters the background", () => {
    expect(shouldPauseVideoForBackground("background", false)).toBe(true);
  });

  it("keeps only user-requested PiP out of the ordinary background pause rule", () => {
    expect(shouldPauseVideoForBackground("background", true)).toBe(false);
    expect(shouldPauseVideoForBackground("active", false)).toBe(false);
    expect(shouldPauseVideoForBackground("inactive", false)).toBe(false);
  });
});
