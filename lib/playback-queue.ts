import type { MediaItem } from "@/types/media";

export function buildPlaybackQueue(item: MediaItem, sourceQueue: MediaItem[] | undefined, library: MediaItem[]) {
  const candidates = (sourceQueue?.length ? sourceQueue : library).filter((candidate) => candidate.mediaType === item.mediaType);
  return candidates.some((candidate) => candidate.id === item.id) ? candidates : [item, ...candidates];
}

export function nextQueueItem(queue: MediaItem[], currentId: string, shuffle = false, random = Math.random, wrap = true) {
  const currentIndex = queue.findIndex((item) => item.id === currentId);
  if (currentIndex < 0 || queue.length < 2) return null;
  if (shuffle) {
    const candidates = queue.filter((item) => item.id !== currentId);
    return candidates[Math.floor(random() * candidates.length)] ?? null;
  }
  if (currentIndex === queue.length - 1 && !wrap) return null;
  return queue[(currentIndex + 1) % queue.length] ?? null;
}

export function previousQueueItem(queue: MediaItem[], currentId: string) {
  const currentIndex = queue.findIndex((item) => item.id === currentId);
  if (currentIndex < 0 || queue.length < 2) return null;
  return queue[(currentIndex - 1 + queue.length) % queue.length] ?? null;
}
