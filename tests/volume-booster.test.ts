import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { resolveLocalVolume } from "../lib/video-gesture";

const audioPatch = readFileSync(new URL("../scripts/patch-expo-audio-media-controls.mjs", import.meta.url), "utf8");
const videoPatch = readFileSync(new URL("../scripts/patch-expo-video-media-controls.mjs", import.meta.url), "utf8");
const nativeControls = readFileSync(new URL("../lib/native-audio-controls.ts", import.meta.url), "utf8");
const videoPlayer = readFileSync(new URL("../app/player/video.tsx", import.meta.url), "utf8");
const audioPlayer = readFileSync(new URL("../app/player/audio.tsx", import.meta.url), "utf8");
const equalizer = readFileSync(new URL("../app/player/equalizer.tsx", import.meta.url), "utf8");

describe("native volume booster and audio processor unit", () => {
  it("resolves local volume and permits boosting up to 200% (2.0)", () => {
    expect(resolveLocalVolume(1.0, -100, 400, 2.0)).toBeGreaterThan(1.0);
    expect(resolveLocalVolume(0.8, -600, 400, 2.0)).toBe(2.0);
    expect(resolveLocalVolume(1.5, 600, 400, 2.0)).toBe(0);
    expect(resolveLocalVolume(0.5, 0, 400, 2.0)).toBe(0.5);
  });

  it("patches Android LoudnessEnhancer into expo-audio native layer", () => {
    expect(audioPatch).toContain("android.media.audiofx.LoudnessEnhancer");
    expect(audioPatch).toContain("applyLoudnessEnhancer");
    expect(audioPatch).toContain("setVolumeBoostAsync");
    expect(audioPatch).toContain("setAbsoluteAudioBoostAsync");
    expect(audioPatch).toContain("gainmB");
  });

  it("patches Android LoudnessEnhancer into expo-video native layer", () => {
    expect(videoPatch).toContain("android.media.audiofx.LoudnessEnhancer");
    expect(videoPatch).toContain("videoLoudnessEnhancer");
    expect(videoPatch).toContain("setVolumeBoost");
    expect(videoPatch).toContain("applyVolumeBoost");
  });

  it("exposes volume booster and 200% range in native audio controls", () => {
    expect(nativeControls).toContain("setVolumeBoost");
    expect(nativeControls).toContain("getVolumeBoost");
    expect(nativeControls).toContain("applyAbsoluteAudioBoost");
    expect(nativeControls).toContain("Math.min(2.0");
  });

  it("wires video player to real native volume boost and visual HUD indicator", () => {
    expect(videoPlayer).toContain("resolveLocalVolume(volumeStartRef.current, gesture.dy, mediaSurfaceHeight, 2.0)");
    expect(videoPlayer).toContain("setVolumeBoost");
    expect(videoPlayer).toContain("cycleVolumeBoost");
    expect(videoPlayer).toContain("⚡ تعزيز الصوت (Booster)");
  });

  it("wires audio player and equalizer to real native audio processor booster", () => {
    expect(audioPlayer).toContain("resolveLocalVolume(systemVolumeStartRef.current, gesture.dy, 360, 2.0)");
    expect(audioPlayer).toContain("applyAbsoluteAudioBoost");
    expect(audioPlayer).toContain("⚡ تعزيز الصوت (Booster)");
    expect(equalizer).toContain("Volume Booster");
    expect(equalizer).toContain("applyBoosterLevel");
  });
});
