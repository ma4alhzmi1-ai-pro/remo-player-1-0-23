import { describe, expect, it } from "vitest";

import { createPlaylistBackup, mergeRestoredPlaylists, parsePlaylistBackup } from "../lib/playlist-backup";

const playlist = { id: "playlist:1", name: "ليلي", itemIds: ["audio:1"], createdAt: 10 };

describe("playlist backup", () => {
  it("serializes and restores a valid playlist backup", () => {
    const backup = createPlaylistBackup([playlist]);
    expect(parsePlaylistBackup(JSON.stringify(backup))?.playlists).toEqual([playlist]);
  });

  it("rejects malformed backup data and preserves IDs when merging", () => {
    expect(parsePlaylistBackup('{"version":1}')).toBeNull();
    expect(mergeRestoredPlaylists([playlist], [playlist])[0].id).not.toBe(playlist.id);
  });
});
