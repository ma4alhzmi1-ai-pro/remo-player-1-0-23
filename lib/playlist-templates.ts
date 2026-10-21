import type { MediaItem } from "@/types/media";

export const PLAYLIST_TEMPLATES = [
  { id: "fresh", name: "أضيف حديثاً", description: "أحدث الموسيقى في مكتبتك", icon: "fiber-new" as const, color: "#2EC5FF" },
  { id: "favorites", name: "المفضلة", description: "كل المقاطع التي أعجبتك", icon: "favorite" as const, color: "#FF7A79" },
  { id: "focus", name: "تركيز", description: "جلسة استماع هادئة ومنظمة", icon: "headphones" as const, color: "#A78BFA" },
  { id: "drive", name: "رحلة", description: "موسيقى جاهزة للطريق", icon: "directions-car" as const, color: "#FFB25B" },
] as const;

export type PlaylistTemplateId = (typeof PLAYLIST_TEMPLATES)[number]["id"];

export function playlistTemplateItems(templateId: PlaylistTemplateId, items: MediaItem[]) {
  const audio = items.filter((item) => item.mediaType === "audio");
  if (templateId === "favorites") return audio.filter((item) => item.isFavorite).map((item) => item.id);
  if (templateId === "fresh") return [...audio].sort((a, b) => b.addedAt - a.addedAt).slice(0, 30).map((item) => item.id);
  if (templateId === "focus") return [...audio].sort((a, b) => a.title.localeCompare(b.title, "ar")).slice(0, 30).map((item) => item.id);
  return [...audio].sort((a, b) => b.duration - a.duration).slice(0, 30).map((item) => item.id);
}
