import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_CLEANUP_KEY = 'remo-player.last-cache-cleanup.v1';
export const LOW_STORAGE_MODE_KEY = 'remo-player.low-storage-saver-mode.v1';

// Maximum allowed cache on low-storage devices before automatic pruning (30 MB)
const LOW_STORAGE_CACHE_LIMIT_BYTES = 30 * 1024 * 1024;
// Maximum allowed cache on standard devices (80 MB)
const STANDARD_CACHE_LIMIT_BYTES = 80 * 1024 * 1024;

export interface CacheCleanupResult {
  freedBytes: number;
  deletedCount: number;
}

/**
 * Checks whether the user has enabled low-storage mode for budget devices
 */
export async function getLowStorageModeEnabled(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(LOW_STORAGE_MODE_KEY);
    return val === 'true';
  } catch {
    return false;
  }
}

/**
 * Toggles low-storage mode for devices with small memory/storage
 */
export async function setLowStorageModeEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(LOW_STORAGE_MODE_KEY, enabled ? 'true' : 'false');
    if (enabled) {
      // Immediately run aggressive deep cleanup
      void cleanOrphanedCacheFiles(true);
    }
  } catch {
    // Ignore
  }
}

/**
 * Scans the app cache and document directories for orphaned video copies,
 * audio extractions, temporary transcoding artifacts, and thumbnail cache.
 * If aggressive=true, cleans all non-essential cached media.
 */
export async function cleanOrphanedCacheFiles(aggressive: boolean = false): Promise<CacheCleanupResult> {
  let freedBytes = 0;
  let deletedCount = 0;

  try {
    const isLowStorage = aggressive || (await getLowStorageModeEnabled());
    const directoriesToInspect = [
      FileSystem.cacheDirectory,
      FileSystem.documentDirectory,
    ].filter(Boolean) as string[];

    for (const dir of directoriesToInspect) {
      const files = await FileSystem.readDirectoryAsync(dir).catch(() => [] as string[]);
      const fileInfos: { name: string; uri: string; size: number; modTime: number }[] = [];

      for (const file of files) {
        const fileUri = `${dir}${file}`;
        const isTemporary =
          file.startsWith('remo-video-') ||
          file.startsWith('remo-extracted-') ||
          file.startsWith('temp-') ||
          file.includes('_converted_') ||
          file.endsWith('.tmp') ||
          file.endsWith('.temp') ||
          file.startsWith('ImagePicker') ||
          file.startsWith('DocumentPicker') ||
          file.startsWith('ExponentExperienceData') ||
          (isLowStorage && (file.endsWith('.mp4') || file.endsWith('.aac') || file.endsWith('.m3u8')) && file.includes('remo-'));

        if (isTemporary) {
          try {
            const info = await FileSystem.getInfoAsync(fileUri);
            if (info.exists) {
              freedBytes += info.size || 0;
              await FileSystem.deleteAsync(fileUri, { idempotent: true });
              deletedCount += 1;
            }
          } catch {
            // Ignore errors for individual files
          }
        } else if (dir === FileSystem.cacheDirectory) {
          // Track general cache files to check if total cache limit is exceeded
          try {
            const info = await FileSystem.getInfoAsync(fileUri);
            if (info.exists && info.size) {
              fileInfos.push({
                name: file,
                uri: fileUri,
                size: info.size,
                modTime: info.modificationTime || Date.now(),
              });
            }
          } catch {
            // Ignore
          }
        }
      }

      // If total remaining cache still exceeds the safety limit, prune oldest files
      const limit = isLowStorage ? LOW_STORAGE_CACHE_LIMIT_BYTES : STANDARD_CACHE_LIMIT_BYTES;
      let totalRemaining = fileInfos.reduce((acc, curr) => acc + curr.size, 0);

      if (totalRemaining > limit) {
        fileInfos.sort((a, b) => a.modTime - b.modTime);
        for (const item of fileInfos) {
          if (totalRemaining <= limit) break;
          try {
            await FileSystem.deleteAsync(item.uri, { idempotent: true });
            freedBytes += item.size;
            deletedCount += 1;
            totalRemaining -= item.size;
          } catch {
            // Ignore
          }
        }
      }
    }

    await AsyncStorage.setItem(CACHE_CLEANUP_KEY, Date.now().toString());
  } catch {
    // Graceful fallback
  }

  return { freedBytes, deletedCount };
}

/**
 * Calculates total size of temporary cache files and reports human-readable size
 */
export async function getCacheSizeInfo(): Promise<{ totalBytes: number; formattedSize: string }> {
  let totalBytes = 0;
  try {
    const cacheDir = FileSystem.cacheDirectory;
    if (cacheDir) {
      const files = await FileSystem.readDirectoryAsync(cacheDir).catch(() => [] as string[]);
      for (const file of files) {
        try {
          const info = await FileSystem.getInfoAsync(`${cacheDir}${file}`);
          if (info.exists) {
            totalBytes += info.size || 0;
          }
        } catch {
          // Ignore
        }
      }
    }
  } catch {
    // Ignore
  }

  const megabytes = (totalBytes / (1024 * 1024)).toFixed(1);
  return {
    totalBytes,
    formattedSize: `${megabytes} MB`,
  };
}
