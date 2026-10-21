import { describe, expect, it } from "vitest";

import { parseSubtitleResponse } from "../server/video-translation";

describe("video translation subtitle parsing", () => {
  it("keeps valid timed translated cues and sorts them chronologically", () => {
    const track = parseSubtitleResponse(JSON.stringify({
      detectedLanguage: "English",
      cues: [
        { start: 4, end: 6, text: "كيف حالك؟" },
        { start: 0, end: 2.5, text: "مرحباً" },
        { start: 5, end: 5, text: "invalid" },
      ],
    }), "العربية");
    expect(track.detectedLanguage).toBe("English");
    expect(track.cues).toEqual([
      { start: 0, end: 2.5, text: "مرحباً" },
      { start: 4, end: 6, text: "كيف حالك؟" },
    ]);
  });
});
