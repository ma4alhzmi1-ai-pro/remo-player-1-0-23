import type { Playlist } from "@/types/media";

export const PLAYLIST_BACKUP_VERSION = 1;

export type PlaylistBackup = {
  version: number;
  createdAt: number;
  playlists: Playlist[];
};

function isPlaylist(value: unknown): value is Playlist {
  if (!value || typeof value !== "object") return false;
  const playlist = value as Partial<Playlist>;
  return typeof playlist.id === "string" && typeof playlist.name === "string" && typeof playlist.createdAt === "number" && Array.isArray(playlist.itemIds) && playlist.itemIds.every((id) => typeof id === "string");
}

export function createPlaylistBackup(playlists: Playlist[]): PlaylistBackup {
  return { version: PLAYLIST_BACKUP_VERSION, createdAt: Date.now(), playlists };
}

export function parsePlaylistBackup(raw: string): PlaylistBackup | null {
  try {
    const backup = JSON.parse(raw) as Partial<PlaylistBackup>;
    if (backup.version !== PLAYLIST_BACKUP_VERSION || typeof backup.createdAt !== "number" || !Array.isArray(backup.playlists) || !backup.playlists.every(isPlaylist)) return null;
    return { version: backup.version, createdAt: backup.createdAt, playlists: backup.playlists };
  } catch {
    return null;
  }
}

export function mergeRestoredPlaylists(current: Playlist[], restored: Playlist[]) {
  const ids = new Set(current.map((playlist) => playlist.id));
  const restoredWithSafeIds = restored.map((playlist, index) => {
    if (!ids.has(playlist.id)) { ids.add(playlist.id); return playlist; }
    const id = `playlist:restore:${Date.now()}:${index}`;
    ids.add(id);
    return { ...playlist, id };
  });
  return [...restoredWithSafeIds, ...current];
}
