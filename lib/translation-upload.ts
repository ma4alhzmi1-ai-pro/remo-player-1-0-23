import * as FileSystem from "expo-file-system/legacy";

export const MAX_TRANSLATION_VIDEO_BYTES = 6 * 1024 * 1024;

export async function readVideoForTranslation(uri: string) {
  if (!uri.startsWith("file://")) throw new Error("اختر فيديو مستورداً أو ملفاً محلياً متاحاً للترجمة.");
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists || info.isDirectory) throw new Error("تعذر الوصول إلى ملف الفيديو.");
  if (typeof info.size !== "number" || info.size > MAX_TRANSLATION_VIDEO_BYTES) {
    throw new Error("ترجمة الذكاء الاصطناعي تدعم حالياً فيديوهات قصيرة بحجم يصل إلى 6MB.");
  }
  return FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
}
