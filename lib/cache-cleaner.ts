import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_CLEANUP_KEY = 'remo-player.last-cache-cleanup.v1';

/**
 * Scans the app cache and document directories for orphaned video copies
 * and extraction files, freeing up gigabytes of leaked space.
 */
export async function cleanOrphanedCacheFiles(): Promise<{ freedBytes: number; deletedCount: number }> {
  let freedBytes = 0;
  let deletedCount = 0;

  try {
    const cacheDir = FileSystem.cacheDirectory;
    if (cacheDir) {
      const files = await FileSystem.readDirectoryAsync(cacheDir).catch(() => [] as string[]);
      for (const file of files) {
        // Look for temporary video copies, ffmpeg extractions, or duplicate temp files
        if (
          file.startsWith('remo-video-') ||
          file.startsWith('remo-extracted-') ||
          file.startsWith('temp-') ||
          file.endsWith('.tmp')
        ) {
          const fileUri = `${cacheDir}${file}`;
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
        }
      }
    }

    // Also check document directory for any accidental temp copies
    const docDir = FileSystem.documentDirectory;
    if (docDir) {
      const files = await FileSystem.readDirectoryAsync(docDir).catch(() => [] as string[]);
      for (const file of files) {
        if (file.startsWith('remo-video-') || file.startsWith('remo-extracted-')) {
          const fileUri = `${docDir}${file}`;
          try {
            const info = await FileSystem.getInfoAsync(fileUri);
            if (info.exists) {
              freedBytes += info.size || 0;
              await FileSystem.deleteAsync(fileUri, { idempotent: true });
              deletedCount += 1;
            }
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
 * Calculates total size of temporary cache files
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
