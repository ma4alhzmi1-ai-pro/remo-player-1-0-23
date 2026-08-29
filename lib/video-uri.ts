import * as FileSystem from "expo-file-system/legacy";

function stableUriKey(uri: string): string {
  let hash = 2166136261;
  for (let index = 0; index < uri.length; index += 1) {
    hash ^= uri.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function sourceExtension(uri: string): string {
  const withoutQuery = uri.split(/[?#]/, 1)[0] ?? uri;
  const extension = withoutQuery.split(".").pop()?.toLowerCase() ?? "mp4";
  return /^[a-z0-9]{1,8}$/.test(extension) ? extension : "mp4";
}

/**
 * Android media-library items can expose content:// URIs. Resolve those on demand
 * to an app-cache file so both Media3 and LibVLC receive a seekable file URI.
 */
export async function resolvePlayableVideoUri(uri: string, nameOrUri = uri): Promise<string> {
  if (!/^content:\/\//i.test(uri)) return uri;
  const baseDirectory = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!baseDirectory) return uri;
  const target = `${baseDirectory}remo-video-${stableUriKey(uri)}.${sourceExtension(nameOrUri)}`;
  try {
    const existing = await FileSystem.getInfoAsync(target);
    if (existing.exists && (existing.size ?? 0) > 0) return target;
    await FileSystem.copyAsync({ from: uri, to: target });
    const copied = await FileSystem.getInfoAsync(target);
    return copied.exists && (copied.size ?? 0) > 0 ? target : uri;
  } catch {
    return uri;
  }
}
