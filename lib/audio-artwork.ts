import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";

const CUSTOM_ARTWORK_PREFIX = "@remo_player_audio_artwork_";

/**
 * Retrieves custom user-selected artwork for an audio track
 */
export async function getCustomAudioArtwork(itemId: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(`${CUSTOM_ARTWORK_PREFIX}${itemId}`);
  } catch {
    return null;
  }
}

/**
 * Saves custom user-selected artwork for an audio track
 */
export async function saveCustomAudioArtwork(itemId: string, imageUri: string): Promise<void> {
  try {
    await AsyncStorage.setItem(`${CUSTOM_ARTWORK_PREFIX}${itemId}`, imageUri);
  } catch {
    // ignore
  }
}

/**
 * Resolves album artwork for an audio item across Android MediaStore,
 * local directory images, and custom user-set images.
 */
export async function resolveAudioThumbnail(
  assetId?: string | null,
  fileUri?: string | null
): Promise<string | undefined> {
  if (Platform.OS === "web") return undefined;

  // 1. Check custom saved artwork
  if (assetId) {
    const custom = await getCustomAudioArtwork(assetId);
    if (custom) return custom;
  }

  // 2. On Android, check Android MediaStore albumart URI
  if (Platform.OS === "android" && assetId) {
    const cleanId = assetId.replace(/^device:/, "");
    const numericId = cleanId.replace(/\D/g, "");
    if (numericId) {
      return `content://media/external/audio/media/${numericId}/albumart`;
    }
  }

  // 3. For local file paths (file://...), search for folder image
  if (fileUri && fileUri.startsWith("file://")) {
    try {
      const folder = fileUri.substring(0, fileUri.lastIndexOf("/"));
      const candidates = ["cover.jpg", "cover.png", "folder.jpg", "album.jpg", "artwork.jpg", "front.jpg"];
      for (const candidate of candidates) {
        const candidateUri = `${folder}/${candidate}`;
        const info = await FileSystem.getInfoAsync(candidateUri);
        if (info.exists) return candidateUri;
      }
    } catch {
      // ignore
    }
  }

  return undefined;
}
