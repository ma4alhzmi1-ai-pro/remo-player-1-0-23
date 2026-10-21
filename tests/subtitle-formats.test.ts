import { describe, expect, it } from "vitest";

import { inferMediaKind } from "../lib/media-utils";
import { parseSubtitleFile, supportsSubtitleImport } from "../lib/subtitle-formats";

describe("media format support", () => {
  it("classifies requested media containers for indexing", () => {
    expect(inferMediaKind("movie.vob")).toBe("video");
    expect(inferMediaKind("concert.mxf")).toBe("video");
    expect(inferMediaKind("song.tak")).toBe("audio");
    expect(inferMediaKind("track.wv")).toBe("audio");
  });

  it("parses SRT, ASS and MicroDVD text subtitles", () => {
    expect(parseSubtitleFile("1\n00:00:01,000 --> 00:00:03,000\nمرحبا\n", "captions.srt")).toEqual([{ start: 1, end: 3, text: "مرحبا" }]);
    expect(parseSubtitleFile("Dialogue: 0,0:00:02.00,0:00:04.50,Default,,0,0,0,,Hello\\NWorld", "styled.ass")[0]).toEqual({ start: 2, end: 4.5, text: "Hello\nWorld" });
    expect(parseSubtitleFile("{25}{75}مرحبا|بالعالم", "legacy.sub")[0]).toEqual({ start: 1, end: 3, text: "مرحبا\nبالعالم" });
    expect(supportsSubtitleImport("caption.vtt")).toBe(true);
  });
});
