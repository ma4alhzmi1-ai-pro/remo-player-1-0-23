import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { clampBrightnessValue } from "../lib/system-brightness";
import { clampSubtitleOffset, SUBTITLE_STYLE_PRESETS } from "../lib/subtitle-store";

const audioSource = readFileSync(new URL("../app/player/audio.tsx", import.meta.url), "utf8");
const videoSource = readFileSync(new URL("../app/player/video.tsx", import.meta.url), "utf8");

describe("system brightness, subtitle sync, and scrubber integrity", () => {
  it("clamps brightness safely between 5% and 100%", () => {
    expect(clampBrightnessValue(-1)).toBe(0.05);
    expect(clampBrightnessValue(0.74)).toBe(0.74);
    expect(clampBrightnessValue(2)).toBe(1);
    expect(clampBrightnessValue(Number.NaN)).toBe(0.6);
  });

  it("clamps subtitle offset cleanly in 0.5s increments", () => {
    expect(clampSubtitleOffset(1.4)).toBe(1.5);
    expect(clampSubtitleOffset(-15)).toBe(-10);
    expect(clampSubtitleOffset(14)).toBe(10);
    expect(SUBTITLE_STYLE_PRESETS.length).toBeGreaterThanOrEqual(4);
  });

  it("aligns the audio scrubber thumb directly with RTL progressPercent and LTR layout lock", () => {
    expect(audioSource).not.toContain("100 - progressPercent");
    expect(audioSource).toContain("direction: \"ltr\"");
    expect(audioSource).toContain("pendingAudioSeekRef");
  });

  it("wires video player to system brightness, hardware STREAM_MUSIC volume, and real subtitle controls", () => {
    expect(videoSource).toContain("applySystemOrScreenBrightness");
    expect(videoSource).toContain("setSystemMusicVolume(nextVolume, true)");
    expect(videoSource).toContain("pendingVideoSeekRef");
    expect(videoSource).toContain("sleepModalOpen");
    expect(videoSource).not.toContain("في إصدار لاحق");
  });
});
