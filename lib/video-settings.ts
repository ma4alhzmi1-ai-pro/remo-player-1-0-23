import AsyncStorage from "@react-native-async-storage/async-storage";

export type VideoSettings = {
  seekInterval: number;
  doubleTapSeekEnabled: boolean;
  longPressSpeedEnabled: boolean;
  longPressSpeed: number;
  longPressVibrationEnabled: boolean;
  directAspectSwitchEnabled: boolean;
  rememberBackgroundPlayback: boolean;
  rememberAspectRatio: boolean;
};

export const DEFAULT_VIDEO_SETTINGS: VideoSettings = {
  seekInterval: 10,
  doubleTapSeekEnabled: true,
  longPressSpeedEnabled: true,
  longPressSpeed: 1.5,
  longPressVibrationEnabled: true,
  directAspectSwitchEnabled: false,
  rememberBackgroundPlayback: false,
  rememberAspectRatio: false,
};

const STORAGE_KEY = "remo.video.settings.v1";

function normalize(value: Partial<VideoSettings> | null | undefined): VideoSettings {
  const seekInterval = value?.seekInterval === 5 || value?.seekInterval === 10 || value?.seekInterval === 15 || value?.seekInterval === 30 ? value.seekInterval : DEFAULT_VIDEO_SETTINGS.seekInterval;
  const longPressSpeed = value?.longPressSpeed === 1.25 || value?.longPressSpeed === 1.5 || value?.longPressSpeed === 2 ? value.longPressSpeed : DEFAULT_VIDEO_SETTINGS.longPressSpeed;
  return {
    seekInterval,
    doubleTapSeekEnabled: value?.doubleTapSeekEnabled ?? DEFAULT_VIDEO_SETTINGS.doubleTapSeekEnabled,
    longPressSpeedEnabled: value?.longPressSpeedEnabled ?? DEFAULT_VIDEO_SETTINGS.longPressSpeedEnabled,
    longPressSpeed,
    longPressVibrationEnabled: value?.longPressVibrationEnabled ?? DEFAULT_VIDEO_SETTINGS.longPressVibrationEnabled,
    directAspectSwitchEnabled: value?.directAspectSwitchEnabled ?? DEFAULT_VIDEO_SETTINGS.directAspectSwitchEnabled,
    rememberBackgroundPlayback: value?.rememberBackgroundPlayback ?? DEFAULT_VIDEO_SETTINGS.rememberBackgroundPlayback,
    rememberAspectRatio: value?.rememberAspectRatio ?? DEFAULT_VIDEO_SETTINGS.rememberAspectRatio,
  };
}

export async function loadVideoSettings(): Promise<VideoSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return normalize(raw ? JSON.parse(raw) as Partial<VideoSettings> : null);
  } catch {
    return DEFAULT_VIDEO_SETTINGS;
  }
}

export async function saveVideoSettings(value: Partial<VideoSettings>): Promise<VideoSettings> {
  const next = normalize(value);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
