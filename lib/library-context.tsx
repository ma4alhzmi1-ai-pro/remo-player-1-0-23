import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Platform } from "react-native";

import { inferMediaKind, mergeMediaItems, parseArtistAndTitle } from "@/lib/media-utils";
import { createPlaylistBackup, mergeRestoredPlaylists, parsePlaylistBackup } from "@/lib/playlist-backup";
import { PLAYLIST_TEMPLATES, playlistTemplateItems, type PlaylistTemplateId } from "@/lib/playlist-templates";
import type { MediaItem, Playlist } from "@/types/media";

const LIBRARY_KEY = "remo-player.library.v1";
const PLAYLISTS_KEY = "remo-player.playlists.v1";

function getMediaLibrary() {
  if (Platform.OS === "web") return null;
  return require("expo-media-library") as typeof import("expo-media-library");
}

async function createVideoThumbnail(uri: string, durationSeconds = 0) {
  if (Platform.OS === "web") return undefined;
  const VideoThumbnails = require("expo-video-thumbnails") as typeof import("expo-video-thumbnails");
  const preferredTime = Math.min(Math.max(250, Math.round(durationSeconds * 160)), 3_000);
  for (const time of [preferredTime, 0]) {
    try {
      const result = await VideoThumbnails.getThumbnailAsync(uri, { time, quality: 0.72 });
      if (result.uri) return result.uri;
    } catch {
      // Retry from the first frame for short clips and videos without a keyframe at the preferred time.
    }
  }
  return undefined;
}

async function mapWithConcurrency<T, R>(values: T[], mapper: (value: T) => Promise<R>, concurrency = 4) {
  const results = new Array<R>(values.length);
  let index = 0;
  const worker = async () => {
    while (index < values.length) {
      const currentIndex = index++;
      results[currentIndex] = await mapper(values[currentIndex]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, worker));
  return results;
}

type LibraryContextValue = {
  items: MediaItem[];
  playlists: Playlist[];
  isReady: boolean;
  isRefreshing: boolean;
  refreshDeviceLibrary: () => Promise<boolean>;
  importFiles: () => Promise<void>;
  createPlaylist: (name: string) => Promise<Playlist | null>;
  createPlaylistFromTemplate: (templateId: PlaylistTemplateId) => Promise<boolean>;
  addItemToPlaylist: (playlistId: string, itemId: string) => Promise<void>;
  removeItemFromPlaylist: (playlistId: string, itemId: string) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  updateMediaItem: (itemId: string, changes: Partial<Pick<MediaItem, "title" | "artist" | "album" | "thumbnailUri" | "lyrics" | "isFavorite">>) => Promise<void>;
  exportPlaylistBackup: () => Promise<boolean>;
  importPlaylistBackup: () => Promise<number>;
};

const LibraryContext = createContext<LibraryContextValue | null>(null);

async function persistImportedFile(asset: DocumentPicker.DocumentPickerAsset) {
  if (Platform.OS === "web") return asset.uri;
  const libraryDirectory = new Directory(Paths.document, "remo-player-media");
  if (!libraryDirectory.exists) libraryDirectory.create({ idempotent: true, intermediates: true });
  const filename = asset.name.replace(/[^\w.()-]+/g, "_");
  const destination = new File(libraryDirectory, `${Date.now()}-${filename}`);
  try {
    new File(asset.uri).copy(destination);
    return destination.uri;
  } catch {
    return asset.uri;
  }
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const [storedItems, storedPlaylists] = await Promise.all([
          AsyncStorage.getItem(LIBRARY_KEY),
          AsyncStorage.getItem(PLAYLISTS_KEY),
        ]);
        if (storedItems) setItems(JSON.parse(storedItems));
        if (storedPlaylists) setPlaylists(JSON.parse(storedPlaylists));
      } finally {
        setIsReady(true);
      }
    };
    void hydrate();
  }, []);

  useEffect(() => {
    if (isReady) void AsyncStorage.setItem(LIBRARY_KEY, JSON.stringify(items));
  }, [isReady, items]);

  useEffect(() => {
    if (isReady) void AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  }, [isReady, playlists]);

  const refreshDeviceLibrary = useCallback(async () => {
    const MediaLibrary = getMediaLibrary();
    if (!MediaLibrary) return false;
    setIsRefreshing(true);
    try {
      const permission = await MediaLibrary.requestPermissionsAsync(false, ["audio", "video"]);
      if (!permission.granted) return false;

      const getAllAssets = async (mediaType: "audio" | "video") => {
        const collected: Awaited<ReturnType<typeof MediaLibrary.getAssetsAsync>>["assets"] = [];
        let after: string | undefined;
        let hasNextPage = true;
        while (hasNextPage) {
          const page = await MediaLibrary.getAssetsAsync({
            first: 200,
            after,
            mediaType,
            sortBy: [[MediaLibrary.SortBy.modificationTime, false]],
          });
          collected.push(...page.assets);
          after = page.endCursor;
          hasNextPage = page.hasNextPage && Boolean(page.endCursor);
        }
        return collected;
      };

      const [audioAssets, videoAssets] = await Promise.all([
        getAllAssets(MediaLibrary.MediaType.audio),
        getAllAssets(MediaLibrary.MediaType.video),
      ]);

      const asMediaItem = async (asset: (typeof audioAssets)[number]): Promise<MediaItem> => {
        const parsed = parseArtistAndTitle(asset.filename);
        const isVideo = asset.mediaType === "video";
        let uri = asset.uri;
        try {
          const info = await MediaLibrary.getAssetInfoAsync(asset);
          uri = info.localUri ?? asset.uri;
        } catch {
          uri = asset.uri;
        }
        return {
          id: `device:${asset.id}`,
          title: parsed.title,
          artist: isVideo ? "فيديو محلي" : parsed.artist,
          album: isVideo ? "مقاطع الفيديو" : "الموسيقى المحلية",
          uri,
          duration: Math.max(0, asset.duration ?? 0),
          mediaType: isVideo ? "video" : "audio",
          addedAt: asset.modificationTime || asset.creationTime || Date.now(),
          thumbnailUri: isVideo ? await createVideoThumbnail(uri, asset.duration ?? 0) : undefined,
        };
      };

      const scanned = await mapWithConcurrency([...audioAssets, ...videoAssets], asMediaItem);
      setItems((current) => mergeMediaItems(current, scanned));
      return true;
    } catch {
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const importFiles = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;

    const imported = (await Promise.all(result.assets.map(async (asset): Promise<MediaItem | null> => {
        const mediaType = inferMediaKind(asset.name, asset.mimeType);
        if (!mediaType) return null;
        const persistentUri = await persistImportedFile(asset);
        const parsed = parseArtistAndTitle(asset.name);
        return {
          id: `import:${persistentUri}:${asset.lastModified ?? Date.now()}`,
          title: parsed.title,
          artist: mediaType === "video" ? "فيديو مستورد" : parsed.artist,
          album: mediaType === "video" ? "الفيديوهات المستوردة" : "الموسيقى المستوردة",
          uri: persistentUri,
          duration: 0,
          mediaType,
          addedAt: asset.lastModified ?? Date.now(),
          thumbnailUri: mediaType === "video" ? await createVideoThumbnail(persistentUri) : undefined,
        };
      }))).filter((item): item is MediaItem => item !== null);

    if (imported.length) setItems((current) => mergeMediaItems(current, imported));
  }, []);

  const createPlaylist = useCallback(async (rawName: string) => {
    const name = rawName.trim();
    if (!name || playlists.some((playlist) => playlist.name.toLowerCase() === name.toLowerCase())) return null;
    const playlist = { id: `playlist:${Date.now()}`, name, itemIds: [], createdAt: Date.now() };
    setPlaylists((current) => [
      playlist,
      ...current,
    ]);
    return playlist;
  }, [playlists]);

  const createPlaylistFromTemplate = useCallback(async (templateId: PlaylistTemplateId) => {
    const template = PLAYLIST_TEMPLATES.find((item) => item.id === templateId);
    if (!template) return false;
    const duplicateCount = playlists.filter((playlist) => playlist.name === template.name).length;
    const name = duplicateCount ? `${template.name} ${duplicateCount + 1}` : template.name;
    const itemIds = playlistTemplateItems(templateId, items);
    setPlaylists((current) => [{ id: `playlist:${templateId}:${Date.now()}`, name, itemIds, createdAt: Date.now() }, ...current]);
    return true;
  }, [items, playlists]);

  const addItemToPlaylist = useCallback(async (playlistId: string, itemId: string) => {
    setPlaylists((current) => current.map((playlist) => {
      if (playlist.id !== playlistId || playlist.itemIds.includes(itemId)) return playlist;
      return { ...playlist, itemIds: [...playlist.itemIds, itemId] };
    }));
  }, []);

  const removeItemFromPlaylist = useCallback(async (playlistId: string, itemId: string) => {
    setPlaylists((current) => current.map((playlist) => (
      playlist.id === playlistId ? { ...playlist, itemIds: playlist.itemIds.filter((id) => id !== itemId) } : playlist
    )));
  }, []);

  const deletePlaylist = useCallback(async (playlistId: string) => {
    setPlaylists((current) => current.filter((playlist) => playlist.id !== playlistId));
  }, []);

  const updateMediaItem = useCallback(async (itemId: string, changes: Partial<Pick<MediaItem, "title" | "artist" | "album" | "thumbnailUri" | "lyrics" | "isFavorite">>) => {
    setItems((current) => current.map((item) => item.id === itemId ? { ...item, ...changes } : item));
  }, []);

  const exportPlaylistBackup = useCallback(async () => {
    if (Platform.OS === "web" || !(await Sharing.isAvailableAsync())) return false;
    const backupDirectory = new Directory(Paths.document, "remo-player-backups");
    if (!backupDirectory.exists) backupDirectory.create({ idempotent: true, intermediates: true });
    const backupFile = new File(backupDirectory, `remo-player-playlists-${Date.now()}.json`);
    backupFile.create({ overwrite: true, intermediates: true });
    backupFile.write(JSON.stringify(createPlaylistBackup(playlists), null, 2));
    await Sharing.shareAsync(backupFile.uri, { dialogTitle: "حفظ نسخة REMO PLAYER الاحتياطية", mimeType: "application/json" });
    return true;
  }, [playlists]);

  const importPlaylistBackup = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ["application/json", "text/json", "text/plain"], copyToCacheDirectory: true });
    if (result.canceled) return 0;
    try {
      const backup = parsePlaylistBackup(await new File(result.assets[0].uri).text());
      if (!backup) return 0;
      setPlaylists((current) => mergeRestoredPlaylists(current, backup.playlists));
      return backup.playlists.length;
    } catch {
      return 0;
    }
  }, []);

  const value = useMemo<LibraryContextValue>(() => ({
    items,
    playlists,
    isReady,
    isRefreshing,
    refreshDeviceLibrary,
    importFiles,
    createPlaylist,
    createPlaylistFromTemplate,
    addItemToPlaylist,
    removeItemFromPlaylist,
    deletePlaylist,
    updateMediaItem,
    exportPlaylistBackup,
    importPlaylistBackup,
  }), [items, playlists, isReady, isRefreshing, refreshDeviceLibrary, importFiles, createPlaylist, createPlaylistFromTemplate, addItemToPlaylist, removeItemFromPlaylist, deletePlaylist, updateMediaItem, exportPlaylistBackup, importPlaylistBackup]);

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) throw new Error("useLibrary must be used within LibraryProvider");
  return context;
}
