import AsyncStorage from "@react-native-async-storage/async-storage";

export type VideoMemoryCapsule = {
  id: string;
  position: number;
  label: string;
  createdAt: number;
};

const STORAGE_PREFIX = "remo.video.memory-capsules.v1:";
const MAX_CAPSULES = 24;

function storageKey(videoId: string): string {
  return `${STORAGE_PREFIX}${videoId}`;
}

function normalizeCapsules(value: unknown): VideoMemoryCapsule[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Partial<VideoMemoryCapsule> => Boolean(item) && typeof item === "object")
    .map((item, index) => ({
      id: typeof item.id === "string" && item.id ? item.id : `capsule-${item.createdAt ?? index}`,
      position: typeof item.position === "number" && Number.isFinite(item.position) ? Math.max(0, item.position) : 0,
      label: typeof item.label === "string" && item.label.trim() ? item.label.trim() : "كبسولة ذاكرة",
      createdAt: typeof item.createdAt === "number" && Number.isFinite(item.createdAt) ? item.createdAt : index,
    }))
    .sort((a, b) => a.position - b.position)
    .slice(0, MAX_CAPSULES);
}

export async function loadVideoMemoryCapsules(videoId: string): Promise<VideoMemoryCapsule[]> {
  if (!videoId) return [];
  try {
    const raw = await AsyncStorage.getItem(storageKey(videoId));
    return normalizeCapsules(raw ? JSON.parse(raw) : null);
  } catch {
    return [];
  }
}

export async function saveVideoMemoryCapsules(videoId: string, capsules: VideoMemoryCapsule[]): Promise<VideoMemoryCapsule[]> {
  const normalized = normalizeCapsules(capsules);
  await AsyncStorage.setItem(storageKey(videoId), JSON.stringify(normalized));
  return normalized;
}

export function createVideoMemoryCapsule(position: number, label?: string): VideoMemoryCapsule {
  const safePosition = Math.max(0, Number.isFinite(position) ? position : 0);
  return {
    id: `capsule-${Date.now()}-${Math.round(safePosition * 10)}`,
    position: safePosition,
    label: label?.trim() || "كبسولة ذاكرة",
    createdAt: Date.now(),
  };
}

export function upsertVideoMemoryCapsule(capsules: VideoMemoryCapsule[], capsule: VideoMemoryCapsule): VideoMemoryCapsule[] {
  const nearExisting = capsules.find((item) => Math.abs(item.position - capsule.position) < 1.5);
  if (nearExisting) return capsules.map((item) => item.id === nearExisting.id ? { ...item, label: capsule.label } : item);
  return normalizeCapsules([...capsules, capsule]);
}

export function removeVideoMemoryCapsule(capsules: VideoMemoryCapsule[], id: string): VideoMemoryCapsule[] {
  return capsules.filter((item) => item.id !== id);
}
