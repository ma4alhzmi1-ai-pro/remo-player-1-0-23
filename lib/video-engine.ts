import { extensionOf } from "./media-utils";

export type VideoPlaybackEngine = "media3" | "libvlc";

// These extensions frequently contain proprietary or non-standard container layouts.
// They are sent to LibVLC first, while ordinary media keeps the lower-overhead Media3 path.
const compatibilityFirstExtensions = new Set([
  "amv", "bik", "crf", "evo", "gvi", "gxf", "mvr", "mp5", "mtv", "mxf",
  "mxg", "nsv", "nuv", "rec", "rm", "rmvb", "rpl", "thp", "tod", "txd",
  "vlc", "vro", "wtv", "xesc",
]);

export function preferredVideoPlaybackEngine(uriOrName: string): VideoPlaybackEngine {
  return compatibilityFirstExtensions.has(extensionOf(uriOrName)) ? "libvlc" : "media3";
}

export function shouldUseLibVlcFallback(errorMessage: string | null | undefined): boolean {
  if (!errorMessage) return false;
  const normalized = errorMessage.toLowerCase();
  return ["decoder", "codec", "unsupported", "source", "extractor", "format", "render"].some((keyword) => normalized.includes(keyword));
}

export function isCompatibilityPlaybackEngine(engine: VideoPlaybackEngine): boolean {
  return engine === "libvlc";
}
