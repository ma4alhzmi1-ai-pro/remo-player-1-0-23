import { describe, expect, it } from "vitest";

import { resolveMediaSessionPolicy } from "../lib/media-session-policy";

describe("media session policy", () => {
  it("keeps background playback and lock-screen controls exclusive to music", () => {
    expect(resolveMediaSessionPolicy("audio")).toEqual({
      allowBackgroundPlayback: true,
      enableLockScreenControls: true,
    });
  });

  it("prevents video from inheriting the music background session", () => {
    expect(resolveMediaSessionPolicy("video")).toEqual({
      allowBackgroundPlayback: false,
      enableLockScreenControls: false,
    });
  });
});
