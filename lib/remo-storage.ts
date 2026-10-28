import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeId = "navy" | "rose" | "ramadan" | "light";
export type NumeralId = "arabic_indic" | "eastern" | "latin";

export type RemoSettings = {
  theme: ThemeId;
  numerals: NumeralId;
  keyboardHeight: "compact" | "standard" | "comfortable";
  vibration: boolean;
  keySound: boolean;
  smartSuggestions: boolean;
  clipboardLimit: number;
};

export type ClipboardEntry = {
  id: string;
  text: string;
  createdAt: number;
  pinned: boolean;
};

export type StickerDraft = {
  id: string;
  text: string;
  emoji: string;
  background: string;
};

const SETTINGS_KEY = "remo.settings.v1";
const CLIPBOARD_KEY = "remo.clipboard.v1";
const STICKERS_KEY = "remo.stickers.v1";

export const defaultSettings: RemoSettings = {
  theme: "navy",
  numerals: "arabic_indic",
  keyboardHeight: "standard",
  vibration: true,
  keySound: false,
  smartSuggestions: true,
  clipboardLimit: 30,
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function loadSettings(): Promise<RemoSettings> {
  return { ...defaultSettings, ...(await readJson<Partial<RemoSettings>>(SETTINGS_KEY, {})) };
}

export async function saveSettings(settings: RemoSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function loadClipboard(): Promise<ClipboardEntry[]> {
  return readJson<ClipboardEntry[]>(CLIPBOARD_KEY, []);
}

export async function saveClipboard(entries: ClipboardEntry[]): Promise<void> {
  await AsyncStorage.setItem(CLIPBOARD_KEY, JSON.stringify(entries));
}

export async function rememberClipboardText(text: string, limit: number): Promise<ClipboardEntry[]> {
  const trimmed = text.trim();
  if (!trimmed) return loadClipboard();
  const current = await loadClipboard();
  const withoutDuplicate = current.filter((entry) => entry.text !== trimmed);
  const next = [{ id: `${Date.now()}`, text: trimmed, createdAt: Date.now(), pinned: false }, ...withoutDuplicate];
  const pinned = next.filter((entry) => entry.pinned);
  const unpinned = next.filter((entry) => !entry.pinned).slice(0, Math.max(0, limit - pinned.length));
  const result = [...pinned, ...unpinned];
  await saveClipboard(result);
  return result;
}

export async function loadStickers(): Promise<StickerDraft[]> {
  return readJson<StickerDraft[]>(STICKERS_KEY, []);
}

export async function saveStickers(stickers: StickerDraft[]): Promise<void> {
  await AsyncStorage.setItem(STICKERS_KEY, JSON.stringify(stickers));
}

export const decorateText = (value: string) => {
  const clean = value.trim() || "ريموكيبورد";
  return [
    { id: "spark", title: "لامع", value: `✦ ${clean} ✦` },
    { id: "bracket", title: "فخم", value: `༺ ${clean} ༻` },
    { id: "wave", title: "ناعم", value: `⌁ ${clean} ⌁` },
    { id: "arch", title: "ملكي", value: `𓆩 ${clean} 𓆪` },
    { id: "stars", title: "نجوم", value: `⭒ ${clean} ⭒` },
    { id: "flower", title: "وردي", value: `❀ ${clean} ❀` },
  ];
};

export const emojiGroups = [
  { name: "الأحدث", values: ["😀", "🥹", "🫶", "🫠", "🪩", "✨", "🔥", "💫"] },
  { name: "ابتسامات", values: ["😁", "😂", "🥰", "😍", "🤍", "🤲", "😎", "🤔"] },
  { name: "رموز", values: ["❤️", "✅", "🎉", "🌙", "⭐", "☕", "📌", "💡"] },
];
