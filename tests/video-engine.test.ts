import { describe, expect, it } from "vitest";

import { preferredVideoPlaybackEngine, shouldUseLibVlcFallback } from "../lib/video-engine";

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
});
