import { describe, expect, it } from "vitest";

import { getMediaFolderPath, groupMediaFolders } from "../lib/media-folder-utils";

const item = (id: string, uri: string) => ({
  id,
  title: id,
  artist: "",
  album: "",
  uri,
  duration: 0,
  mediaType: "audio" as const,
  addedAt: 0,
});

describe("media folder utilities", () => {
  it("uses the complete parent path instead of only the folder name", () => {
    const folders = groupMediaFolders([
      item("phone", "file:///storage/emulated/0/Music/Arabic/track.mp3"),
      item("card", "file:///storage/ABCD-1234/Music/Arabic/track.mp3"),
      item("phone-second", "file:///storage/emulated/0/Music/Arabic/other.mp3"),
    ]);

    expect(folders).toHaveLength(2);
    expect(folders.map((folder) => ({ path: folder.path, ids: folder.items.map((track) => track.id) }))).toEqual([
      { path: "file:///storage/ABCD-1234/Music/Arabic", ids: ["card"] },
      { path: "file:///storage/emulated/0/Music/Arabic", ids: ["phone", "phone-second"] },
    ]);
  });

  it("keeps the displayed folder name while retaining its distinct full path", () => {
    const folders = groupMediaFolders([
      item("a", "file:///Music/Downloads/song-a.mp3"),
      item("b", "file:///Podcasts/Downloads/song-b.mp3"),
    ]);

    expect(folders.map((folder) => folder.name)).toEqual(["Downloads", "Downloads"]);
    expect(folders.map((folder) => folder.path)).toEqual([
      "file:///Music/Downloads",
      "file:///Podcasts/Downloads",
    ]);
  });

  it("removes query fragments before grouping a URI", () => {
    expect(getMediaFolderPath("file:///storage/emulated/0/Music/Album/track.mp3?token=1#frame")).toBe("file:///storage/emulated/0/Music/Album");
  });
});
