import AsyncStorage from "@react-native-async-storage/async-storage";

import { normalizeEqualizerBands, type EqualizerPresetId } from "./equalizer-settings";

export const EQUALIZER_STORAGE_KEY = "remo-player.equalizer.v1";
export type RoomEffect = "none" | "small" | "medium" | "large";
export type StoredEqualizer = { enabled: boolean; preset: EqualizerPresetId; bands: number[]; room: RoomEffect; bass: number; virtualizer: number };

export const DEFAULT_EQUALIZER: StoredEqualizer = {
  enabled: true,
  preset: "heavy-metal",
  bands: [4, 1, 9, 3, 0],
  room: "none",
  bass: 0,
  virtualizer: 4,
};

export function normalizeStoredEqualizer(value: Partial<StoredEqualizer> | null | undefined): StoredEqualizer {
  return {
    enabled: value?.enabled !== false,
    preset: value?.preset ?? DEFAULT_EQUALIZER.preset,
    bands: normalizeEqualizerBands(value?.bands ?? DEFAULT_EQUALIZER.bands),
    room: value?.room === "small" || value?.room === "medium" || value?.room === "large" ? value.room : "none",
    bass: Math.max(0, Math.min(100, value?.bass ?? 0)),
    virtualizer: Math.max(0, Math.min(100, value?.virtualizer ?? 4)),
  };
}

export async function loadEqualizerSettings(): Promise<StoredEqualizer> {
  try {
    const raw = await AsyncStorage.getItem(EQUALIZER_STORAGE_KEY);
    return raw ? normalizeStoredEqualizer(JSON.parse(raw) as Partial<StoredEqualizer>) : DEFAULT_EQUALIZER;
  } catch {
    return DEFAULT_EQUALIZER;
  }
}

export async function saveEqualizerSettings(value: StoredEqualizer): Promise<void> {
  await AsyncStorage.setItem(EQUALIZER_STORAGE_KEY, JSON.stringify(normalizeStoredEqualizer(value)));
}
