import { extensionOf } from "./media-utils";
import {
  isExoPlayerSourceError,
  isLegacyExtractionFormat,
  getFfmpegExtractionStrategy,
  extractAndPrepareVideo,
  checkExtractedCache,
  getExtractedCacheUri,
  cancelExtraction,
  type ExtractionProgress,
  type ExtractionResult,
  type ExtractionStrategy,
} from "./ffmpeg-extractor";

export type VideoPlaybackEngine = "media3" | "libvlc";

export {
  isExoPlayerSourceError,
  isLegacyExtractionFormat,
  getFfmpegExtractionStrategy,
  extractAndPrepareVideo,
  checkExtractedCache,
  getExtractedCacheUri,
  cancelExtraction,
  type ExtractionProgress,
  type ExtractionResult,
  type ExtractionStrategy,
};

// هذه الامتدادات المتخصصة تفشل أدوات استخراج Media3 القياسية في قراءتها افتراضياً.
// يتم توجيهها إلى محرك LibVLC مباشرة للاستفادة من مكتبات الترميز والحاويات الخاصة.
const compatibilityFirstExtensions = new Set([
  // حاويات نادرة أو خاصة
  "mvr", "mp5", "bik", "amv", "crf", "evo", "gvi", "gxf", "mtv", "mxf",
  "mxg", "nsv", "nuv", "rec", "rmvb", "rpl", "thp", "tod", "txd",
  "vlc", "vro", "wtv", "xesc", "iso", "bin"
]);

function extractExt(uriOrName?: string | null): string {
  if (!uriOrName) return "";
  const clean = uriOrName.split(/[?#]/)[0] ?? "";
  return extensionOf(clean);
}

export function preferredVideoPlaybackEngine(uri: string, filename?: string): VideoPlaybackEngine {
  const extFromName = extractExt(filename);
  if (extFromName && compatibilityFirstExtensions.has(extFromName)) {
    return "libvlc";
  }
  const extFromUri = extractExt(uri);
  if (extFromUri && compatibilityFirstExtensions.has(extFromUri)) {
    return "libvlc";
  }
  return "media3";
}

export function shouldUseLibVlcFallback(errorMessage: string | null | undefined): boolean {
  if (!errorMessage) return true;
  const normalized = errorMessage.toLowerCase();

  const patterns = [
    "decoder", "codec", "unsupported", "source", "extractor", "format", "render",
    "renderer", "parsing", "malformed", "initialization", "load error", "source error",
    "media period", "track", "read error", "none of the available", "could read the stream",
    "playback exception", "contentismalformed", "datatype", "extractors", "ts", "mp4", "mkv",
    "أداة الاستخراج", "أدوات الاستخراج", "خطأ في المصدر", "فشل في القراءة",
    "تعذر قراءة", "الترميز غير مدعوم", "مشغل الفيديو", "محرك التشغيل", "لم يتمكن"
  ];

  return patterns.some((pattern) => normalized.includes(pattern.toLowerCase()));
}

export function shouldAttemptFfmpegExtraction(
  uriOrName?: string | null,
  errorMessage?: string | null
): boolean {
  return isLegacyExtractionFormat(uriOrName) || isExoPlayerSourceError(errorMessage);
}

export function isCompatibilityPlaybackEngine(engine: VideoPlaybackEngine): boolean {
  return engine === "libvlc";
}

export function shouldAdvanceAfterCompatibilityStop(input: {
  hasStarted: boolean;
  hasError: boolean;
  isNavigating: boolean;
  isRepeatingOne: boolean;
  isAutoAdvancing: boolean;
}): boolean {
  return input.hasStarted && !input.hasError && !input.isNavigating && !input.isRepeatingOne && !input.isAutoAdvancing;
}