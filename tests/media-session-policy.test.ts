import { describe, expect, it } from "vitest";

import { resolveMediaSessionPolicy } from "../lib/media-session-policy";

describe("media session policy", () => {
  it("keeps background playback and lock-screen controls exclusive to music", () => {
    expect(resolveMediaSessionPolicy("audio")).toEqual({
      allowBackgroundPlayback: true,
      enableLockScreenControls: true,
    });
  });

  it("prevents video from inheriting the music background session by default", () => {
    expect(resolveMediaSessionPolicy("video")).toEqual({
      allowBackgroundPlayback: false,
      enableLockScreenControls: false,
    });
  });

  it("enables background playback and lock-screen controls for video when explicitly allowed", () => {
    expect(resolveMediaSessionPolicy("video", true)).toEqual({
      allowBackgroundPlayback: true,
      enableLockScreenControls: true,
    });
  });
});
