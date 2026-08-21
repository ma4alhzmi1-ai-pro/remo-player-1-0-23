import AsyncStorage from "@react-native-async-storage/async-storage";

export type LocalSubtitleCue = { start: number; end: number; text: string };
export type LocalSubtitleTrack = {
  targetLanguage: string;
  detectedLanguage: string;
  createdAt: number;
  cues: LocalSubtitleCue[];
};

const keyFor = (mediaId: string) => `remo-player.subtitles.v1:${mediaId}`;

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
