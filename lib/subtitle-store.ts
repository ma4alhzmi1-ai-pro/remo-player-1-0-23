import AsyncStorage from "@react-native-async-storage/async-storage";

export type LocalSubtitleCue = { start: number; end: number; text: string };
export type LocalSubtitleTrack = {
  targetLanguage: string;
  detectedLanguage: string;
  createdAt: number;
  cues: LocalSubtitleCue[];
};

export type SubtitleAppearance = {
  fontSize: number;
  color: string;
  backgroundColor: string;
};

export const defaultSubtitleAppearance: SubtitleAppearance = {
  fontSize: 15,
  color: "#FFFFFF",
  backgroundColor: "rgba(0,0,0,0.78)",
};

const keyFor = (mediaId: string) => `remo-player.subtitles.v1:${mediaId}`;
const appearanceKey = "remo-player.subtitle-appearance.v1";

export async function loadLocalSubtitles(mediaId: string) {
  const stored = await AsyncStorage.getItem(keyFor(mediaId));
  if (!stored) return null;
  try {
    const track = JSON.parse(stored) as LocalSubtitleTrack;
    return Array.isArray(track.cues) ? track : null;
  } catch {
    return null;
  }
}

export async function saveLocalSubtitles(mediaId: string, track: LocalSubtitleTrack) {
  await AsyncStorage.setItem(keyFor(mediaId), JSON.stringify(track));
}

export function normalizeSubtitleAppearance(input: Partial<SubtitleAppearance> | null | undefined): SubtitleAppearance {
  const fontSize = Number(input?.fontSize);
  return {
    fontSize: Number.isFinite(fontSize) ? Math.max(12, Math.min(30, fontSize)) : defaultSubtitleAppearance.fontSize,
    color: typeof input?.color === "string" ? input.color : defaultSubtitleAppearance.color,
    backgroundColor: typeof input?.backgroundColor === "string" ? input.backgroundColor : defaultSubtitleAppearance.backgroundColor,
  };
}

export async function loadSubtitleAppearance(): Promise<SubtitleAppearance> {
  const stored = await AsyncStorage.getItem(appearanceKey);
  if (!stored) return defaultSubtitleAppearance;
  try {
    return normalizeSubtitleAppearance(JSON.parse(stored) as Partial<SubtitleAppearance>);
  } catch {
    return defaultSubtitleAppearance;
  }
}

export async function saveSubtitleAppearance(appearance: SubtitleAppearance) {
  await AsyncStorage.setItem(appearanceKey, JSON.stringify(appearance));
}
