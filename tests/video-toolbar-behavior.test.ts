import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const video = readFileSync(new URL("../app/player/video.tsx", import.meta.url), "utf8");
const audio = readFileSync(new URL("../app/player/audio.tsx", import.meta.url), "utf8");
const context = readFileSync(new URL("../lib/player-context.tsx", import.meta.url), "utf8");

describe("video toolbar behavior", () => {
  it("separates the bottom progress dock below the toolbar and supports center placement", () => {
    expect(video).toContain('<View style={[styles.progressDock, { borderColor: videoSettings.toolbarBorderColor }]}>');
    expect(video).toContain('styles.controlDock, toolbarPositionStyle');
    expect(video).toContain('bottomOverlayStack: { position: "absolute"');
    expect(video).toContain('videoSettings.progressPosition === "center"');
    expect(video).toContain('videoSettings.progressPosition === "bottom"');
  });

  it("enables responsive horizontal action scrolling", () => {
    expect(video).toContain('directionalLockEnabled');
    expect(video).toContain('display: showTool("memory")');
  });

  it("wires all video settings options functionally inside the video player", () => {
    expect(video).toContain('videoSettings.doubleTapSeekEnabled');
    expect(video).toContain('videoSettings.directAspectSwitchEnabled');
    expect(video).toContain('videoSettings.rememberBackgroundPlayback');
    expect(video).toContain('videoSettings.rememberAspectRatio');
    expect(video).toContain('matchPreferredAudioTrack');
    expect(video).toContain('{videoSettings.longPressSpeed}×');
  });

  it("polls Android STREAM_MUSIC so hardware buttons update the HUD", () => {
    expect(video).toContain('const interval = setInterval(() => void sync(), 250);');
    expect(audio).toContain('const interval = setInterval(() => void sync(), 250);');
  });

  it("advances audio when the background status reaches its end", () => {
    expect(context).toContain('const reachedEnd = Boolean(status.duration && status.currentTime >= Math.max(0, status.duration - 0.15)');
    expect(context).toContain('videoPlayer.addListener("playToEnd"');
  });
});
