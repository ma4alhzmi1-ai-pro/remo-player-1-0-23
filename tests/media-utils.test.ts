import { describe, expect, it } from "vitest";

import { cleanMediaTitle, inferMediaKind, mergeMediaItems, parseArtistAndTitle } from "../lib/media-utils";
import type { MediaItem } from "../types/media";

const audio: MediaItem = {
  id: "1",
  title: "أغنية",
  artist: "فنان",
  album: "ألبوم",
  uri: "file:///audio.mp3",
  duration: 180,
  mediaType: "audio",
  addedAt: 10,
};

describe("media utilities", () => {
  it("cleans local media filenames into readable titles", () => {
    expect(cleanMediaTitle("night_drive-v2.mp3")).toBe("night drive v2");
    expect(cleanMediaTitle(".mp3")).toBe("ملف بدون اسم");
  });

  it("detects supported audio and video files using MIME type or extension", () => {
    expect(inferMediaKind("recording", "audio/mpeg")).toBe("audio");
    expect(inferMediaKind("holiday.MKV")).toBe("video");
    expect(inferMediaKind("notes.txt", "text/plain")).toBeNull();
  });

  it("indexes MVR and FVL filenames as video formats", () => {
    expect(inferMediaKind("sample.mvr")).toBe("video");
    expect(inferMediaKind("sample.fvl")).toBe("video");
  });

  it("extracts an artist and title from a common local media filename", () => {
    expect(parseArtistAndTitle("Nour - Midnight City.mp3")).toEqual({ artist: "Nour", title: "Midnight City" });
    expect(parseArtistAndTitle("ambient_loop.wav")).toEqual({ artist: "فنان غير معروف", title: "ambient loop" });
  });

  it("merges media by URI and keeps the latest additions first", () => {
    const newerAudio = { ...audio, title: "أغنية محدثة", addedAt: 30 };
    const video: MediaItem = { ...audio, id: "2", uri: "file:///clip.mp4", title: "مقطع", mediaType: "video", addedAt: 20 };
    const merged = mergeMediaItems([audio], [video, newerAudio]);
    expect(merged.map((item) => item.id)).toEqual(["1", "2"]);
    expect(merged[0].title).toBe("أغنية محدثة");
  });
});
