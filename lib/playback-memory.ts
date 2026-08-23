import AsyncStorage from "@react-native-async-storage/async-storage";

import type { PlaybackSnapshot } from "@/types/media";

const STORAGE_KEY = "@remo-player/playback-memory/v1";
const RESUME_MINIMUM_SECONDS = 4;

export type PlaybackMemory = PlaybackSnapshot & { volume?: number };
type PlaybackMemoryMap = Record<string, PlaybackMemory>;

export function resumePosition(snapshot: PlaybackMemory | null, duration?: number) {
  if (!snapshot || snapshot.position < RESUME_MINIMUM_SECONDS) return 0;
  if (duration && snapshot.position >= Math.max(0, duration - 3)) return 0;
  return Math.max(0, Math.min(snapshot.position, duration || snapshot.position));
}

async function readMemory(): Promise<PlaybackMemoryMap> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) as PlaybackMemoryMap : {};
  } catch {
    return {};
  }
}

export async function getPlaybackMemory(itemId: string) {
  const memory = await readMemory();
  return memory[itemId] ?? null;
}

export async function savePlaybackMemory(snapshot: PlaybackMemory) {
  const memory = await readMemory();
  memory[snapshot.itemId] = snapshot;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch {
    // Resume data is optional and must never affect media playback.
  }
}
