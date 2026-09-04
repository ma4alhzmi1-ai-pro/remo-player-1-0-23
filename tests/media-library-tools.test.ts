import { describe, expect, it } from "vitest";

import { filterMediaItems, nextMediaSort, sortMediaItems } from "../lib/media-library-tools";

const items = [
  { id: "1", title: "زيتون", artist: "أ", album: "ألبوم", uri: "file:///music/z.mp3", duration: 30, mediaType: "audio" as const, addedAt: 10 },
  { id: "2", title: "Alpha", artist: "B", album: "Collection", uri: "file:///videos/a.mp4", duration: 90, mediaType: "video" as const, addedAt: 30 },
  { id: "3", title: "Beta", artist: "C", album: "Collection", uri: "file:///videos/b.mp4", duration: 60, mediaType: "video" as const, addedAt: 20 },
];

describe("media library tools", () => {
  it("filters across visible media metadata", () => {
    expect(filterMediaItems(items, "collection").map((item) => item.id)).toEqual(["2", "3"]);
    expect(filterMediaItems(items, "videos").map((item) => item.id)).toEqual(["2", "3"]);
  });

  it("sorts by recency, title, and duration without mutating input", () => {
    expect(sortMediaItems(items, "recent").map((item) => item.id)).toEqual(["2", "3", "1"]);
    expect(sortMediaItems(items, "duration").map((item) => item.id)).toEqual(["2", "3", "1"]);
    expect(items.map((item) => item.id)).toEqual(["1", "2", "3"]);
  });

  it("cycles through each library sort option", () => {
    expect(nextMediaSort("recent")).toBe("title");
    expect(nextMediaSort("title")).toBe("duration");
    expect(nextMediaSort("duration")).toBe("recent");
  });
});
