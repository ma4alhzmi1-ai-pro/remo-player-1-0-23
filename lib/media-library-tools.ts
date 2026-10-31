import type { MediaItem } from "@/types/media";

export type MediaSort = "recent" | "title" | "duration";

export function filterMediaItems(items: MediaItem[], query: string) {
  const normalized = query.trim().toLocaleLowerCase("ar");
  if (!normalized) return items;
  return items.filter((item) => `${item.title} ${item.artist} ${item.album} ${item.uri}`.toLocaleLowerCase("ar").includes(normalized));
}

export function sortMediaItems(items: MediaItem[], sort: MediaSort) {
  return [...items].sort((left, right) => {
    if (sort === "title") return left.title.localeCompare(right.title, "ar");
    if (sort === "duration") return (right.duration || 0) - (left.duration || 0);
    return right.addedAt - left.addedAt;
  });
}

export function nextMediaSort(sort: MediaSort): MediaSort {
  return sort === "recent" ? "title" : sort === "title" ? "duration" : "recent";
}
