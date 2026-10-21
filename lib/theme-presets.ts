export const ACCENT_THEMES = [
  { id: "ocean", name: "محيط", description: "أزرق REMO الكلاسيكي", color: "#2EC5FF" },
  { id: "violet", name: "بنفسجي", description: "لمسة هادئة وأنيقة", color: "#A78BFA" },
  { id: "ember", name: "شعلة", description: "دفء برتقالي نابض", color: "#FF8A3D" },
  { id: "emerald", name: "زمرد", description: "أخضر متوازن", color: "#36D399" },
] as const;

export type AccentThemeId = (typeof ACCENT_THEMES)[number]["id"];

export function getAccentTheme(id: AccentThemeId) {
  return ACCENT_THEMES.find((theme) => theme.id === id) ?? ACCENT_THEMES[0];
}
