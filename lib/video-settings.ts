import AsyncStorage from "@react-native-async-storage/async-storage";

export type VideoSettings = {
  decoderMode: "auto" | "hardware" | "software";
  seekInterval: number;
  longPressSpeedEnabled: boolean;
  longPressSpeed: number;
  longPressVibrationEnabled: boolean;
  qualityBoost: boolean;
  preferredAudioLanguage: string;
  toolbarPosition: "center" | "top" | "bottom" | "sides";
  toolbarTools: string[];
  toolbarButtonColor: string;
  toolbarBorderColor: string;
  progressStyle: "solid" | "gradient" | "dashed";
  progressThumb: "circle" | "diamond" | "square";
  progressDirection: "rtl" | "ltr";
  seekDirection: "right" | "left";
  seekSensitivity: number;
};

export const DEFAULT_VIDEO_SETTINGS: VideoSettings = {
  decoderMode: "auto",
  seekInterval: 10,
  longPressSpeedEnabled: true,
  longPressSpeed: 1.5,
  longPressVibrationEnabled: true,
  qualityBoost: true,
  preferredAudioLanguage: "auto",
  toolbarPosition: "center",
  toolbarTools: ["back", "rewind", "previous", "play", "next", "forward", "background", "options", "fit", "speed", "rotate", "lock", "night", "mute", "mirror", "repeat", "ab"],
  toolbarButtonColor: "#FFFFFF",
  toolbarBorderColor: "rgba(255,255,255,0.16)",
  progressStyle: "solid",
  progressThumb: "circle",
  progressDirection: "rtl",
  seekDirection: "right",
  seekSensitivity: 1,
};

const STORAGE_KEY = "remo.video.settings.v1";

function normalize(value: Partial<VideoSettings> | null | undefined): VideoSettings {
  const seekInterval = value?.seekInterval === 5 || value?.seekInterval === 10 || value?.seekInterval === 15 || value?.seekInterval === 30 ? value.seekInterval : DEFAULT_VIDEO_SETTINGS.seekInterval;
  const longPressSpeed = value?.longPressSpeed === 1.25 || value?.longPressSpeed === 1.5 || value?.longPressSpeed === 2 ? value.longPressSpeed : DEFAULT_VIDEO_SETTINGS.longPressSpeed;
  return {
    decoderMode: value?.decoderMode === "hardware" || value?.decoderMode === "software" ? value.decoderMode : DEFAULT_VIDEO_SETTINGS.decoderMode,
    seekInterval,
    longPressSpeedEnabled: value?.longPressSpeedEnabled ?? DEFAULT_VIDEO_SETTINGS.longPressSpeedEnabled,
    longPressSpeed,
    longPressVibrationEnabled: value?.longPressVibrationEnabled ?? DEFAULT_VIDEO_SETTINGS.longPressVibrationEnabled,
    qualityBoost: value?.qualityBoost ?? DEFAULT_VIDEO_SETTINGS.qualityBoost,
    preferredAudioLanguage: typeof value?.preferredAudioLanguage === "string" ? value.preferredAudioLanguage : DEFAULT_VIDEO_SETTINGS.preferredAudioLanguage,
    toolbarPosition: ["center", "top", "bottom", "sides"].includes(value?.toolbarPosition ?? "") ? value!.toolbarPosition! : DEFAULT_VIDEO_SETTINGS.toolbarPosition,
    toolbarTools: Array.isArray(value?.toolbarTools) ? value!.toolbarTools!.filter((item) => typeof item === "string") : DEFAULT_VIDEO_SETTINGS.toolbarTools,
    toolbarButtonColor: typeof value?.toolbarButtonColor === "string" ? value.toolbarButtonColor : DEFAULT_VIDEO_SETTINGS.toolbarButtonColor,
    toolbarBorderColor: typeof value?.toolbarBorderColor === "string" ? value.toolbarBorderColor : DEFAULT_VIDEO_SETTINGS.toolbarBorderColor,
    progressStyle: ["solid", "gradient", "dashed"].includes(value?.progressStyle ?? "") ? value!.progressStyle! : DEFAULT_VIDEO_SETTINGS.progressStyle,
    progressThumb: ["circle", "diamond", "square"].includes(value?.progressThumb ?? "") ? value!.progressThumb! : DEFAULT_VIDEO_SETTINGS.progressThumb,
    progressDirection: value?.progressDirection === "ltr" ? "ltr" : "rtl",
    seekDirection: value?.seekDirection === "left" ? "left" : "right",
    seekSensitivity: [0.5, 1, 1.5, 2].includes(value?.seekSensitivity ?? 1) ? value?.seekSensitivity ?? 1 : 1,
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
