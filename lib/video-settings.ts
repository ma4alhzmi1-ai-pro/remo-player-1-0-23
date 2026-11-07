import AsyncStorage from "@react-native-async-storage/async-storage";

export type ToolbarPosition = "center" | "top" | "bottom" | "left" | "right";
export type ProgressDirection = "rtl" | "ltr";
export type ProgressStyle = "line" | "thick" | "glow" | "dashed";
export type ProgressThumbStyle = "circle" | "square" | "diamond";

export const VIDEO_TOOL_IDS = ["memory", "focus", "back", "rewind", "previous", "play", "next", "forward", "background", "display", "speed", "rotate", "lock", "night", "mute", "mirror", "repeat", "ab"] as const;
export type VideoToolId = (typeof VIDEO_TOOL_IDS)[number];

export type VideoSettings = {
  decoderMode: "auto" | "hardware" | "software";
  qualityEnhancementEnabled: boolean;
  preferredAudioLanguage: string;
  seekInterval: number;
  doubleTapSeekEnabled: boolean;
  longPressSpeedEnabled: boolean;
  longPressSpeed: number;
  longPressVibrationEnabled: boolean;
  directAspectSwitchEnabled: boolean;
  rememberBackgroundPlayback: boolean;
  rememberAspectRatio: boolean;
  toolbarPosition: ToolbarPosition;
  toolbarButtons: VideoToolId[];
  toolbarButtonColor: string;
  toolbarBorderColor: string;
  progressStyle: ProgressStyle;
  progressThumbStyle: ProgressThumbStyle;
  progressDirection: ProgressDirection;
  progressDragDirection: ProgressDirection;
  progressScrubSpeed: number;
};

export const DEFAULT_VIDEO_SETTINGS: VideoSettings = {
  decoderMode: "auto",
  qualityEnhancementEnabled: true,
  preferredAudioLanguage: "system",
  seekInterval: 10,
  doubleTapSeekEnabled: true,
  longPressSpeedEnabled: true,
  longPressSpeed: 1.5,
  longPressVibrationEnabled: true,
  directAspectSwitchEnabled: false,
  rememberBackgroundPlayback: false,
  rememberAspectRatio: false,
  toolbarPosition: "center",
  toolbarButtons: [...VIDEO_TOOL_IDS],
  toolbarButtonColor: "rgba(8,17,31,0.79)",
  toolbarBorderColor: "rgba(255,255,255,0.18)",
  progressStyle: "line",
  progressThumbStyle: "circle",
  progressDirection: "rtl",
  progressDragDirection: "rtl",
  progressScrubSpeed: 1,
};

const STORAGE_KEY = "remo.video.settings.v1";

function normalize(value: Partial<VideoSettings> | null | undefined): VideoSettings {
  const seekInterval = value?.seekInterval === 5 || value?.seekInterval === 10 || value?.seekInterval === 15 || value?.seekInterval === 30 ? value.seekInterval : DEFAULT_VIDEO_SETTINGS.seekInterval;
  const longPressSpeed = value?.longPressSpeed === 1.25 || value?.longPressSpeed === 1.5 || value?.longPressSpeed === 2 ? value.longPressSpeed : DEFAULT_VIDEO_SETTINGS.longPressSpeed;
  const progressScrubSpeed = value?.progressScrubSpeed === 0.5 || value?.progressScrubSpeed === 1 || value?.progressScrubSpeed === 1.5 || value?.progressScrubSpeed === 2 ? value.progressScrubSpeed : DEFAULT_VIDEO_SETTINGS.progressScrubSpeed;
  const toolbarButtons = Array.isArray(value?.toolbarButtons) ? value.toolbarButtons.filter((id): id is VideoToolId => (VIDEO_TOOL_IDS as readonly string[]).includes(id)) : DEFAULT_VIDEO_SETTINGS.toolbarButtons;
  return {
    decoderMode: value?.decoderMode === "hardware" || value?.decoderMode === "software" ? value.decoderMode : DEFAULT_VIDEO_SETTINGS.decoderMode,
    qualityEnhancementEnabled: value?.qualityEnhancementEnabled ?? DEFAULT_VIDEO_SETTINGS.qualityEnhancementEnabled,
    preferredAudioLanguage: typeof value?.preferredAudioLanguage === "string" && value.preferredAudioLanguage.trim() ? value.preferredAudioLanguage : DEFAULT_VIDEO_SETTINGS.preferredAudioLanguage,
    seekInterval,
    doubleTapSeekEnabled: value?.doubleTapSeekEnabled ?? DEFAULT_VIDEO_SETTINGS.doubleTapSeekEnabled,
    longPressSpeedEnabled: value?.longPressSpeedEnabled ?? DEFAULT_VIDEO_SETTINGS.longPressSpeedEnabled,
    longPressSpeed,
    longPressVibrationEnabled: value?.longPressVibrationEnabled ?? DEFAULT_VIDEO_SETTINGS.longPressVibrationEnabled,
    directAspectSwitchEnabled: value?.directAspectSwitchEnabled ?? DEFAULT_VIDEO_SETTINGS.directAspectSwitchEnabled,
    rememberBackgroundPlayback: value?.rememberBackgroundPlayback ?? DEFAULT_VIDEO_SETTINGS.rememberBackgroundPlayback,
    rememberAspectRatio: value?.rememberAspectRatio ?? DEFAULT_VIDEO_SETTINGS.rememberAspectRatio,
    toolbarPosition: value?.toolbarPosition === "top" || value?.toolbarPosition === "bottom" || value?.toolbarPosition === "left" || value?.toolbarPosition === "right" ? value.toolbarPosition : DEFAULT_VIDEO_SETTINGS.toolbarPosition,
    toolbarButtons: toolbarButtons.length ? [...new Set(toolbarButtons)] : DEFAULT_VIDEO_SETTINGS.toolbarButtons,
    toolbarButtonColor: typeof value?.toolbarButtonColor === "string" && value.toolbarButtonColor ? value.toolbarButtonColor : DEFAULT_VIDEO_SETTINGS.toolbarButtonColor,
    toolbarBorderColor: typeof value?.toolbarBorderColor === "string" && value.toolbarBorderColor ? value.toolbarBorderColor : DEFAULT_VIDEO_SETTINGS.toolbarBorderColor,
    progressStyle: value?.progressStyle === "thick" || value?.progressStyle === "glow" || value?.progressStyle === "dashed" ? value.progressStyle : DEFAULT_VIDEO_SETTINGS.progressStyle,
    progressThumbStyle: value?.progressThumbStyle === "square" || value?.progressThumbStyle === "diamond" ? value.progressThumbStyle : DEFAULT_VIDEO_SETTINGS.progressThumbStyle,
    progressDirection: value?.progressDirection === "ltr" ? "ltr" : DEFAULT_VIDEO_SETTINGS.progressDirection,
    progressDragDirection: value?.progressDragDirection === "ltr" ? "ltr" : DEFAULT_VIDEO_SETTINGS.progressDragDirection,
    progressScrubSpeed,
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
