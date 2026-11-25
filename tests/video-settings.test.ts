import { describe, expect, it } from "vitest";
import { DEFAULT_VIDEO_SETTINGS, matchPreferredAudioTrack, normalizeVideoSettings } from "../lib/video-settings";
import { resolveDoubleTapSeekSeconds, resolveVideoGesture } from "../lib/video-gesture";
import { nextQuickFrameAspect } from "../lib/video-display-settings";

describe("video settings normalization and helpers", () => {
  it("defaults progressPosition to bottom and normalizes center or bottom", () => {
    expect(DEFAULT_VIDEO_SETTINGS.progressPosition).toBe("bottom");
    expect(normalizeVideoSettings({ progressPosition: "center" }).progressPosition).toBe("center");
    expect(normalizeVideoSettings({ progressPosition: "invalid" as any }).progressPosition).toBe("bottom");
  });

  it("matches audio tracks using ISO-639-1, ISO-639-2 and labels", () => {
    const tracks = [
      { id: "1", language: "eng", label: "English" },
      { id: "2", language: "ara", label: "Arabic Stereo" },
      { id: "3", language: "tr", label: "Türkçe" },
    ];
    expect(matchPreferredAudioTrack(tracks, "ar")?.id).toBe("2");
    expect(matchPreferredAudioTrack(tracks, "en")?.id).toBe("1");
    expect(matchPreferredAudioTrack(tracks, "tr")?.id).toBe("3");
    expect(matchPreferredAudioTrack(tracks, "system", "ar")?.id).toBe("2");
  });

  it("computes double-tap seek deltas by screen side", () => {
    expect(resolveDoubleTapSeekSeconds(320, 400, 15)).toBe(15);
    expect(resolveDoubleTapSeekSeconds(80, 400, 15)).toBe(-15);
    expect(resolveDoubleTapSeekSeconds(80, 0, 15)).toBeNull();
  });

  it("respects swipe seek direction for LTR and RTL settings", () => {
    expect(resolveVideoGesture(70, 0, 100, 300, "ltr")).toEqual({ type: "seek", seconds: 10 });
    expect(resolveVideoGesture(70, 0, 100, 300, "rtl")).toEqual({ type: "seek", seconds: -10 });
  });

  it("cycles aspect ratios directly for directAspectSwitchEnabled", () => {
    const first = nextQuickFrameAspect("16:9");
    expect(first.frameAspect).toBe("4:3");
    const last = nextQuickFrameAspect("screen");
    expect(last.frameAspect).toBe("16:9");
  });
});
