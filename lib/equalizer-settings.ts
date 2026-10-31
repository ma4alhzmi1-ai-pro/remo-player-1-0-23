export type EqualizerPresetId = "custom" | "normal" | "classical" | "dance" | "flat" | "folk" | "heavy-metal" | "hiphop" | "jazz" | "pop" | "rock" | "vocal" | "techno" | "amplifier";

export const EQUALIZER_FREQUENCIES = [60, 230, 910, 3600, 14000] as const;

export const EQUALIZER_PRESETS: Array<{ id: EqualizerPresetId; label: string; bands: number[] }> = [
  { id: "custom", label: "عرف", bands: [0, 0, 0, 0, 0] },
  { id: "normal", label: "عادي", bands: [1, 0, 0, 0, 1] },
  { id: "classical", label: "كلاسيكي", bands: [0, 0, 2, 4, 4] },
  { id: "dance", label: "رقص", bands: [5, 3, 0, 3, 5] },
  { id: "flat", label: "ثابت", bands: [0, 0, 0, 0, 0] },
  { id: "folk", label: "شعبي", bands: [3, 2, 0, 2, 4] },
  { id: "heavy-metal", label: "هيفي ميتال", bands: [4, 1, 9, 3, 0] },
  { id: "hiphop", label: "هيب هوب", bands: [7, 3, -1, 2, 5] },
  { id: "jazz", label: "جاز", bands: [2, 0, 5, 3, 2] },
  { id: "pop", label: "بوب", bands: [-1, 3, 5, 3, 0] },
  { id: "rock", label: "روك", bands: [5, 3, 0, 4, 5] },
  { id: "vocal", label: "تعزيز الصوت", bands: [-3, -1, 6, 4, 1] },
  { id: "techno", label: "تيكنو", bands: [5, 2, -1, 3, 6] },
  { id: "amplifier", label: "مضخم", bands: [8, 5, 2, 4, 6] },
];

export function clampEqualizerBand(value: number) {
  return Math.max(-12, Math.min(12, Math.round(value)));
}

export function normalizeEqualizerBands(values: number[]) {
  return EQUALIZER_FREQUENCIES.map((_, index) => clampEqualizerBand(values[index] ?? 0));
}

export function presetBands(id: EqualizerPresetId) {
  return [...(EQUALIZER_PRESETS.find((preset) => preset.id === id) ?? EQUALIZER_PRESETS[0]).bands];
}

export function isEqualizerPresetId(value: unknown): value is EqualizerPresetId {
  return typeof value === "string" && EQUALIZER_PRESETS.some((preset) => preset.id === value);
}
