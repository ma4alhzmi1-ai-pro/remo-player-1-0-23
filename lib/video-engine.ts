import { extensionOf } from "./media-utils";

export type VideoPlaybackEngine = "media3" | "libvlc";

// هذه الامتدادات غالبًا تحتوي على ترميزات أو حاويات غير قياسية.
// يتم إرسالها إلى LibVLC أولاً، بينما يحتفظ الوسائط العادية بمسار Media3 الأقل استهلاكًا.
const compatibilityFirstExtensions = new Set([
  // الامتدادات الأصلية
  "amv", "bik", "crf", "evo", "gvi", "gxf", "mvr", "mp5", "mtv", "mxf",
  "mxg", "nsv", "nuv", "rec", "rm", "rmvb", "rpl", "thp", "tod", "txd",
  "vlc", "vro", "wtv", "xesc",
  // إضافات لتغطية صيغ أخرى قد تكون غير مدعومة جيدًا من Media3
  "iso", "bin", "ogm", "ogx", "ps", "ts", "wmv", "avi", "mpg", "flv",
]);

export function preferredVideoPlaybackEngine(uriOrName: string): VideoPlaybackEngine {
  return compatibilityFirstExtensions.has(extensionOf(uriOrName)) ? "libvlc" : "media3";
}

export function shouldUseLibVlcFallback(errorMessage: string | null | undefined): boolean {
  if (!errorMessage) return false;
  const normalized = errorMessage.toLowerCase();

  // قائمة موسّعة من الكلمات المفتاحية التي تشير إلى فشل Media3 في قراءة المصدر
  const patterns = [
    // الإنجليزية (الأكثر شيوعًا)
    "decoder", "codec", "unsupported", "source", "extractor", "format", "render",
    "renderer", "parsing", "malformed", "initialization", "load error", "source error",
    "media period", "track", "read error", "none of the available", "could read the stream",
    "playback exception",
    // العربية (بعض الأجهزة تعرض رسائل مترجمة)
    "أداة الاستخراج", "أدوات الاستخراج", "خطأ في المصدر", "فشل في القراءة",
    "تعذر قراءة", "الترميز غير مدعوم", "مشغل الفيديو", "محرك التشغيل"
  ];

  return patterns.some((pattern) => normalized.includes(pattern.toLowerCase()));
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