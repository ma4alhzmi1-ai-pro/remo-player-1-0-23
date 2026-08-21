import type { MediaItem } from "@/types/media";

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
  if (mimeType?.startsWith("video/") || /\.(mp4|mkv|webm|mov|avi|m4v|3gp)$/i.test(lowerName)) return "video";
  if (mimeType?.startsWith("audio/") || /\.(mp3|m4a|aac|wav|flac|ogg|opus|wma)$/i.test(lowerName)) return "audio";
  return null;
}

export function mergeMediaItems(current: MediaItem[], incoming: MediaItem[]) {
  const byUri = new Map(current.map((item) => [item.uri, item]));
  incoming.forEach((item) => byUri.set(item.uri, item));
  return Array.from(byUri.values()).sort((a, b) => b.addedAt - a.addedAt);
}
