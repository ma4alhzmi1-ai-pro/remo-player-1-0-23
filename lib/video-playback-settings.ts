import AsyncStorage from "@react-native-async-storage/async-storage";

export const VIDEO_PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4] as const;

export const VIDEO_BACKGROUND_STORAGE_KEY = "@remo_video_background_playback_v1";
export const VIDEO_HARDWARE_ACCEL_KEY = "@remo_hardware_acceleration_v1";
export const VIDEO_BUFFER_CACHE_KEY = "@remo_buffer_cache_size_v1";
export const VIDEO_AUTO_NEXT_KEY = "@remo_auto_next_video_v1";
export const VIDEO_AUDIO_BOOST_KEY = "@remo_audio_boost_v1";
export const VIDEO_ENGINE_KEY = "@remo_preferred_engine_v1";

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

export async function setVideoBackgroundPlaybackSetting(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(VIDEO_BACKGROUND_STORAGE_KEY, enabled ? "true" : "false");
  } catch (error) {
    console.warn("تعذر حفظ إعداد تشغيل الفيديو في الخلفية", error);
  }
}

/**
 * تسريع العتاد GPU (افتراضياً: مفعل).
 */
export async function getHardwareAccelerationSetting(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(VIDEO_HARDWARE_ACCEL_KEY);
    if (value === null) return true;
    return value === "true";
  } catch {
    return true;
  }
}

export async function setHardwareAccelerationSetting(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(VIDEO_HARDWARE_ACCEL_KEY, enabled ? "true" : "false");
  } catch (error) {
    console.warn("تعذر حفظ إعداد تسريع العتاد", error);
  }
}

/**
 * حجم التخزين المؤقت المسبق (16MB، 32MB، 64MB).
 */
export async function getBufferCacheSetting(): Promise<"16mb" | "32mb" | "64mb"> {
  try {
    const value = await AsyncStorage.getItem(VIDEO_BUFFER_CACHE_KEY);
    if (value === "16mb" || value === "32mb" || value === "64mb") return value;
    return "32mb";
  } catch {
    return "32mb";
  }
}

export async function setBufferCacheSetting(size: "16mb" | "32mb" | "64mb"): Promise<void> {
  try {
    await AsyncStorage.setItem(VIDEO_BUFFER_CACHE_KEY, size);
  } catch (error) {
    console.warn("تعذر حفظ حجم الذاكرة المؤقتة", error);
  }
}

/**
 * الانتقال التلقائي للفيديو التالي دون توقف (افتراضياً: مفعل).
 */
export async function getAutoNextVideoSetting(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(VIDEO_AUTO_NEXT_KEY);
    if (value === null) return true;
    return value === "true";
  } catch {
    return true;
  }
}

export async function setAutoNextVideoSetting(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(VIDEO_AUTO_NEXT_KEY, enabled ? "true" : "false");
  } catch (error) {
    console.warn("تعذر حفظ إعداد الانتقال التلقائي", error);
  }
}
