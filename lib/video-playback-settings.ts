import AsyncStorage from "@react-native-async-storage/async-storage";

export const VIDEO_PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4] as const;

export const VIDEO_BACKGROUND_STORAGE_KEY = "@remo_video_background_playback_v1";

export function nextVideoPlaybackSpeed(currentSpeed: number): number {
  const currentIndex = VIDEO_PLAYBACK_SPEEDS.indexOf(currentSpeed as (typeof VIDEO_PLAYBACK_SPEEDS)[number]);
  return VIDEO_PLAYBACK_SPEEDS[(currentIndex + 1) % VIDEO_PLAYBACK_SPEEDS.length];
}

/**
 * يسترجع إعداد تشغيل الفيديو في الخلفية وعند قفل الشاشة.
 * القيمة الافتراضية: مفعل (true) بعد طلب المستخدم لدعم الميزة، مع إمكانية التبديل في الإعدادات.
 */
export async function getVideoBackgroundPlaybackSetting(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(VIDEO_BACKGROUND_STORAGE_KEY);
    if (value === null) return true;
    return value === "true";
  } catch {
    return true;
  }
}

/**
 * يحفظ إعداد تشغيل الفيديو في الخلفية وعند قفل الشاشة.
 */
export async function setVideoBackgroundPlaybackSetting(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(VIDEO_BACKGROUND_STORAGE_KEY, enabled ? "true" : "false");
  } catch (error) {
    console.warn("تعذر حفظ إعداد تشغيل الفيديو في الخلفية", error);
  }
}
