import type { MediaItem } from "@/types/media";

export const videoExtensions = ["mvr", "dvd", "avi", "mov", "mp4", "wmv", "rmvb", "3gp", "m4v", "mkv", "ts", "mpg", "mpeg", "flv", "fvl", "amv", "bik", "bin", "iso", "crf", "evo", "gvi", "gxf", "mp2", "mtv", "mxf", "mxg", "nsv", "nuv", "ogm", "ogx", "ps", "rec", "rm", "rpl", "thp", "tod", "tts", "txd", "vlc", "vob", "vro", "wtv", "xesc", "webm"] as const;
export const audioExtensions = ["mp3", "wav", "aac", "flac", "669", "amb", "aob", "caf", "it", "m4a", "m5p", "mlp", "mod", "mpc", "mus", "oga", "ogg", "oma", "opus", "rmi", "s3m", "tak", "thd", "tta", "voc", "vpf", "w64", "wma", "wv", "xa", "xm"] as const;

export function extensionOf(name: string) {
  return name.toLowerCase().split(".").pop() ?? "";
}

export function getMediaCompatibility(name: string) {
  const extension = extensionOf(name);
  if ((videoExtensions as readonly string[]).includes(extension)) return { kind: "video" as const, extension, message: `صيغة .${extension.toUpperCase()} مُدرجة للفهرسة؛ التشغيل الفعلي يعتمد على ترميز الملف ودعم Android.` };
  if ((audioExtensions as readonly string[]).includes(extension)) return { kind: "audio" as const, extension, message: `صيغة .${extension.toUpperCase()} مُدرجة للفهرسة؛ التشغيل الفعلي يعتمد على ترميز الملف ودعم Android.` };
  return { kind: null, extension, message: "امتداد غير معروف." };
}

export function cleanMediaTitle(filename: string) {
  const withoutExtension = filename.replace(/\.[^/.]+$/, "");
  return withoutExtension.replace(/[_.-]+/g, " ").trim() || "ملف بدون اسم";
}

export function parseArtistAndTitle(filename: string) {
  const withoutExtension = filename.replace(/\.[^/.]+$/, "");
  const normalized = withoutExtension.replace(/[_.]+/g, " ").trim();
  const parts = normalized.split(/\s+-\s+/).map((part) => part.replace(/-/g, " ").trim()).filter(Boolean);
  if (parts.length >= 2) return { artist: parts[0], title: parts.slice(1).join(" - ") };
  return { artist: "فنان غير معروف", title: cleanMediaTitle(filename) };
}

export function inferMediaKind(name: string, mimeType?: string | null): MediaItem["mediaType"] | null {
  const lowerName = name.toLowerCase();
  if (mimeType?.startsWith("video/") || (videoExtensions as readonly string[]).includes(extensionOf(lowerName))) return "video";
  if (mimeType?.startsWith("audio/") || (audioExtensions as readonly string[]).includes(extensionOf(lowerName))) return "audio";
  return null;
}

export function mergeMediaItems(current: MediaItem[], incoming: MediaItem[]) {
  const byUri = new Map(current.map((item) => [item.uri, item]));
  incoming.forEach((item) => {
    const existing = byUri.get(item.uri);
    byUri.set(item.uri, existing ? {
      ...item,
      thumbnailUri: existing.thumbnailUri ?? item.thumbnailUri,
      lyrics: existing.lyrics ?? item.lyrics,
      isFavorite: existing.isFavorite ?? item.isFavorite,
    } : item);
  });
  return Array.from(byUri.values()).sort((a, b) => b.addedAt - a.addedAt);
}
