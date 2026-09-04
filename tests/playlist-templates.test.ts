import { describe, expect, it } from "vitest";

import { playlistTemplateItems } from "../lib/playlist-templates";

const items = [
  { id: "a", title: "أ", artist: "فنان", album: "ألبوم", uri: "a", duration: 10, mediaType: "audio" as const, addedAt: 1, isFavorite: true },
  { id: "b", title: "ب", artist: "فنان", album: "ألبوم", uri: "b", duration: 40, mediaType: "audio" as const, addedAt: 3 },
  { id: "v", title: "فيديو", artist: "", album: "", uri: "v", duration: 50, mediaType: "video" as const, addedAt: 4 },
];

describe("playlist templates", () => {
  it("creates favorites from audio items only", () => {
    expect(playlistTemplateItems("favorites", items)).toEqual(["a"]);
  });

  it("orders fresh items by newest import", () => {
    expect(playlistTemplateItems("fresh", items)).toEqual(["b", "a"]);
  });
});
