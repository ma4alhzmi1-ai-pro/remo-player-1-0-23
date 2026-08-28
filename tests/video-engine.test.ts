import { describe, expect, it } from "vitest";

import { preferredVideoPlaybackEngine, shouldAdvanceAfterCompatibilityStop, shouldUseLibVlcFallback } from "../lib/video-engine";

describe("video playback engine selection", () => {
  it("routes MVR and MP5 files to the compatibility engine before playback", () => {
    expect(preferredVideoPlaybackEngine("camera-recording.MVR")).toBe("libvlc");
    expect(preferredVideoPlaybackEngine("archive.mp5")).toBe("libvlc");
  });

  it("keeps common MP4 and FLV files on Media3 before a decoder error", () => {
    expect(preferredVideoPlaybackEngine("movie.mp4")).toBe("media3");
    expect(preferredVideoPlaybackEngine("legacy.flv")).toBe("media3");
  });

  it("uses the compatibility fallback only for meaningful Media3 playback failures", () => {
    expect(shouldUseLibVlcFallback("Decoder initialization failed")).toBe(true);
    expect(shouldUseLibVlcFallback("Unsupported container format")).toBe(true);
    expect(shouldUseLibVlcFallback("Network is slow")).toBe(false);
  });

  it("falls back for parser and renderer failures reported asynchronously", () => {
    expect(shouldUseLibVlcFallback("Unable to parse malformed media source")).toBe(true);
    expect(shouldUseLibVlcFallback("Video renderer initialization failed")).toBe(true);
    expect(shouldUseLibVlcFallback("Media period failed to load track")).toBe(true);
  });

  it("does not advance after a compatibility stop before first play", () => {
    expect(shouldAdvanceAfterCompatibilityStop({ hasStarted: false, hasError: true, isNavigating: false, isRepeatingOne: false, isAutoAdvancing: false })).toBe(false);
    expect(shouldAdvanceAfterCompatibilityStop({ hasStarted: false, hasError: false, isNavigating: false, isRepeatingOne: false, isAutoAdvancing: false })).toBe(false);
    expect(shouldAdvanceAfterCompatibilityStop({ hasStarted: true, hasError: false, isNavigating: false, isRepeatingOne: false, isAutoAdvancing: false })).toBe(true);
  });
});
