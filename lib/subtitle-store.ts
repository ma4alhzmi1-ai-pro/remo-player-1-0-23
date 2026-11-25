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

export const SUBTITLE_STYLE_PRESETS: Array<{
  id: string;
  label: string;
  appearance: SubtitleAppearance;
}> = [
  {
    id: "classic",
    label: "كلاسيكي أبيض",
    appearance: { fontSize: 18, color: "#FFFFFF", backgroundColor: "rgba(0,0,0,0.78)" },
  },
  {
    id: "cinema",
    label: "سينمائي أصفر",
    appearance: { fontSize: 22, color: "#FFE66D", backgroundColor: "rgba(0,0,0,0.34)" },
  },
  {
    id: "night",
    label: "ليلي هادئ",
    appearance: { fontSize: 18, color: "#75E6DA", backgroundColor: "rgba(4,28,52,0.88)" },
  },
  {
    id: "clean",
    label: "شفاف كبير",
    appearance: { fontSize: 26, color: "#FFFFFF", backgroundColor: "rgba(0,0,0,0.34)" },
  },
];

const keyFor = (mediaId: string) => `remo-player.subtitles.v1:${mediaId}`;
const offsetKeyFor = (mediaId: string) => `remo-player.subtitle-offset.v1:${mediaId}`;
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

export function clampSubtitleOffset(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(-10, Math.min(10, Math.round(value * 2) / 2));
}

export async function loadSubtitleOffset(mediaId: string): Promise<number> {
  if (!mediaId) return 0;
  try {
    const raw = await AsyncStorage.getItem(offsetKeyFor(mediaId));
    return raw ? clampSubtitleOffset(Number(raw)) : 0;
  } catch {
    return 0;
  }
}

export async function saveSubtitleOffset(mediaId: string, offsetSeconds: number): Promise<number> {
  const safe = clampSubtitleOffset(offsetSeconds);
  if (mediaId) {
    await AsyncStorage.setItem(offsetKeyFor(mediaId), String(safe));
  }
  return safe;
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
