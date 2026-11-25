import AsyncStorage from "@react-native-async-storage/async-storage";

export type ChromaShape = "halo" | "bars" | "rings";

const KEY = "remo.audio.visualizer.v1";

export function parseSyncedLyrics(raw: string | undefined): Array<{ time: number; text: string }> {
  if (!raw?.trim()) return [];
  return raw.split(/\r?\n/).flatMap((line) => {
    const matches = [...line.matchAll(/\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g)];
    const text = line.replace(/\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g, "").trim();
    return matches.map((match) => {
      const fraction = match[3] ? Number(`0.${match[3]}`) : 0;
      return { time: Number(match[1]) * 60 + Number(match[2]) + fraction, text };
    });
  }).filter((line) => line.text.length > 0).sort((a, b) => a.time - b.time);
}

export function activeLyricIndex(lines: Array<{ time: number; text: string }>, seconds: number): number {
  let active = -1;
  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index].time <= seconds) active = index;
    else break;
  }
  return active;
}

export async function loadChromaShape(): Promise<ChromaShape> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw === "bars" || raw === "rings" || raw === "halo" ? raw : "halo";
  } catch {
    return "halo";
  }
}

export async function saveChromaShape(shape: ChromaShape): Promise<void> {
  await AsyncStorage.setItem(KEY, shape);
}
