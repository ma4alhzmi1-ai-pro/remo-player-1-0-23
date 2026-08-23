import { access, copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const patchRoot = path.join(projectRoot, "native-patches", "expo-video");
const packageRoot = path.join(projectRoot, "node_modules", "expo-video");
const files = [
  "android/src/main/java/expo/modules/video/playbackService/ExpoVideoPlaybackService.kt",
  "android/src/main/java/expo/modules/video/playbackService/VideoMediaSessionCallback.kt",
  "android/src/main/res/drawable/next_track.xml",
  "android/src/main/res/drawable/previous_track.xml",
];

try {
  await access(packageRoot);
  for (const relativePath of files) {
    const source = path.join(patchRoot, relativePath);
    const destination = path.join(packageRoot, relativePath);
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(source, destination);
  }
  console.log("[REMO PLAYER] تم تطبيق تحكمات التالي والسابق الأصلية لإشعار الفيديو.");
} catch (error) {
  console.error("[REMO PLAYER] تعذر تطبيق تعديل تحكمات فيديو Android.", error);
  process.exitCode = 1;
}
