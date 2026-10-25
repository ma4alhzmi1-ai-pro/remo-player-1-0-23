import * as FileSystem from "expo-file-system/legacy";
import {
  checkExtractedCache,
  extractAndPrepareVideo,
  isLegacyExtractionFormat,
  type ExtractionOptions,
  type ExtractionResult,
} from "./ffmpeg-extractor";

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
 * Android media-library items expose content:// URIs which expo-video natively supports.
 * If a local file copy is ever required (e.g. for non-standard players), prune previous
 * temporary copies first so storage never balloons.
 */
export async function resolvePlayableVideoUri(uri: string, nameOrUri = uri): Promise<string> {
  // On Android, ExoPlayer/Media3 plays content:// directly without copying.
  // Returning content:// avoids duplicating 500MB - 1GB files in app storage.
  if (!/^content:\/\//i.test(uri)) return uri;
  return uri;
}

/**
 * Resolves a playable video URI with transparent FFMPEG extraction cache checks.
 * If the video is an unsupported legacy format (e.g. FLV, VOB) and has an extracted
 * MP4 cache, returns the cached file immediately.
 */
export async function resolveExtractedPlayableVideoUri(
  uri: string,
  nameOrUri = uri,
  options?: ExtractionOptions
): Promise<{ uri: string; extracted: boolean; isCached?: boolean }> {
  const resolvedBaseUri = await resolvePlayableVideoUri(uri, nameOrUri);

  // Check if an extracted cache exists
  const cached = await checkExtractedCache(resolvedBaseUri);
  if (cached) {
    return { uri: cached, extracted: true, isCached: true };
  }

  // If it's a known legacy container format and extraction is requested or forced
  if (isLegacyExtractionFormat(nameOrUri) && options?.forceTranscode) {
    const res: ExtractionResult = await extractAndPrepareVideo(resolvedBaseUri, {
      ...options,
      fileName: nameOrUri,
    });
    if (res.success && res.outputUri) {
      return { uri: res.outputUri, extracted: true, isCached: res.isCached };
    }
  }

  return { uri: resolvedBaseUri, extracted: false };
}
