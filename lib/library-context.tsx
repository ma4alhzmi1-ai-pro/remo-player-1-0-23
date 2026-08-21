import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { Directory, File, Paths } from "expo-file-system";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Platform } from "react-native";

import { inferMediaKind, mergeMediaItems, parseArtistAndTitle } from "@/lib/media-utils";
import type { MediaItem, Playlist } from "@/types/media";

const LIBRARY_KEY = "remo-player.library.v1";
const PLAYLISTS_KEY = "remo-player.playlists.v1";

function getMediaLibrary() {
  if (Platform.OS === "web") return null;
  return require("expo-media-library") as typeof import("expo-media-library");
}

type LibraryContextValue = {
  items: MediaItem[];
  playlists: Playlist[];
  isReady: boolean;
  isRefreshing: boolean;
  refreshDeviceLibrary: () => Promise<boolean>;
  importFiles: () => Promise<void>;
  createPlaylist: (name: string) => Promise<boolean>;
  addItemToPlaylist: (playlistId: string, itemId: string) => Promise<void>;
  removeItemFromPlaylist: (playlistId: string, itemId: string) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  updateMediaItem: (itemId: string, changes: Partial<Pick<MediaItem, "title" | "artist" | "album" | "thumbnailUri" | "lyrics" | "isFavorite">>) => Promise<void>;
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

      const [audioPage, videoPage] = await Promise.all([
        MediaLibrary.getAssetsAsync({
          first: 250,
          mediaType: MediaLibrary.MediaType.AUDIO,
        }),
        MediaLibrary.getAssetsAsync({
          first: 250,
          mediaType: MediaLibrary.MediaType.VIDEO,
        }),
      ]);

      const asMediaItem = (asset: (typeof audioPage.assets)[number]): MediaItem => {
        const parsed = parseArtistAndTitle(asset.filename);
        return {
          id: `device:${asset.id}`,
          title: parsed.title,
          artist: asset.mediaType === "video" ? "فيديو محلي" : parsed.artist,
          album: asset.mediaType === "video" ? "مقاطع الفيديو" : "الموسيقى المحلية",
          uri: asset.uri,
          duration: Math.max(0, asset.duration ?? 0),
          mediaType: asset.mediaType === "video" ? "video" : "audio",
          addedAt: asset.modificationTime || asset.creationTime || Date.now(),
        };
      };

      setItems((current) => mergeMediaItems(current, [...audioPage.assets, ...videoPage.assets].map(asMediaItem)));
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
        };
      }))).filter((item): item is MediaItem => item !== null);

    if (imported.length) setItems((current) => mergeMediaItems(current, imported));
  }, []);

  const createPlaylist = useCallback(async (rawName: string) => {
    const name = rawName.trim();
    if (!name || playlists.some((playlist) => playlist.name.toLowerCase() === name.toLowerCase())) return false;
    setPlaylists((current) => [
      { id: `playlist:${Date.now()}`, name, itemIds: [], createdAt: Date.now() },
      ...current,
    ]);
    return true;
  }, [playlists]);

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

  const value = useMemo<LibraryContextValue>(() => ({
    items,
    playlists,
    isReady,
    isRefreshing,
    refreshDeviceLibrary,
    importFiles,
    createPlaylist,
    addItemToPlaylist,
    removeItemFromPlaylist,
    deletePlaylist,
    updateMediaItem,
  }), [items, playlists, isReady, isRefreshing, refreshDeviceLibrary, importFiles, createPlaylist, addItemToPlaylist, removeItemFromPlaylist, deletePlaylist, updateMediaItem]);

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) throw new Error("useLibrary must be used within LibraryProvider");
  return context;
}
