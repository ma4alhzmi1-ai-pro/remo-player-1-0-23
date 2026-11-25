import { describe, expect, it } from "vitest";

import { activeLyricIndex, parseSyncedLyrics } from "../lib/audio-visualizer";

describe("audio visualizer and synced lyrics", () => {
  it("parses LRC timestamps and sorts lyric lines", () => {
    expect(parseSyncedLyrics("[00:12.50]السطر الثاني\n[00:01.00]السطر الأول")).toEqual([
      { time: 1, text: "السطر الأول" },
      { time: 12.5, text: "السطر الثاني" },
    ]);
  });

  it("selects the lyric currently playing", () => {
    const lines = parseSyncedLyrics("[00:01]أ\n[00:05]ب\n[00:09]ج");
    expect(activeLyricIndex(lines, 0)).toBe(-1);
    expect(activeLyricIndex(lines, 6)).toBe(1);
  });
});
