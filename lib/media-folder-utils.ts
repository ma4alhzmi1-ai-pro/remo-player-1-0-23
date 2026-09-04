import type { MediaItem } from "@/types/media";

export type MediaFolder = {
  id: string;
  name: string;
  path: string;
  items: MediaItem[];
};

function safelyDecodeUri(uri: string) {
  try {
    return decodeURIComponent(uri);
  } catch {
    return uri;
  }
}

/**
 * يستخرج مجلد العنصر من عنوانه الكامل. لا يعتمد المفتاح على الاسم الأخير للمجلد،
 * لذلك يبقى كل "Music" أو "Download" منفصلاً مهما تكرر اسمه على الهاتف أو SD.
 */
export function getMediaFolderPath(uri: string) {
  const decoded = safelyDecodeUri(uri).split(/[?#]/, 1)[0] ?? uri;
  const normalized = decoded.replace(/\\/g, "/").replace(/\/+$/, "");
  const finalSlash = normalized.lastIndexOf("/");
  if (finalSlash < 0) return "بدون مسار";
  return normalized.slice(0, finalSlash) || "/";
}

export function getMediaFolderName(path: string) {
  const parts = path.split("/").filter(Boolean);
  const name = parts.at(-1);
  return name || "المجلد الرئيسي";
}

export function groupMediaFolders(items: MediaItem[]): MediaFolder[] {
  const grouped = new Map<string, MediaItem[]>();
  for (const item of items) {
    const path = getMediaFolderPath(item.uri);
    grouped.set(path, [...(grouped.get(path) ?? []), item]);
  }

  return Array.from(grouped.entries())
    .map(([path, folderItems]) => ({
      id: `folder:${path}`,
      name: getMediaFolderName(path),
      path,
      items: folderItems,
    }))
    .sort((first, second) => first.path.localeCompare(second.path, "ar"));
}
