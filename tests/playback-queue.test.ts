import { describe, expect, it } from "vitest";

import { buildPlaybackQueue, nextQueueItem, previousQueueItem } from "../lib/playback-queue";
import type { MediaItem } from "../types/media";

const audio = (id: string): MediaItem => ({ id, title: id, artist: "فنان", album: "ألبوم", uri: `file://${id}.mp3`, duration: 60, mediaType: "audio", addedAt: 1 });
const video = (id: string): MediaItem => ({ id, title: id, artist: "فيديو", album: "فيديو", uri: `file://${id}.mp4`, duration: 60, mediaType: "video", addedAt: 1 });

describe("playback queue", () => {
  it("keeps only the current media type and wraps next/previous", () => {
    const queue = buildPlaybackQueue(audio("a"), undefined, [audio("a"), video("v"), audio("b")]);
    expect(queue.map((item) => item.id)).toEqual(["a", "b"]);
    expect(nextQueueItem(queue, "b")?.id).toBe("a");
    expect(previousQueueItem(queue, "a")?.id).toBe("b");
  });

  it("chooses a different item when shuffle is active", () => {
    const queue = [audio("a"), audio("b"), audio("c")];
    expect(nextQueueItem(queue, "b", true, () => 0)?.id).toBe("a");
    expect(nextQueueItem(queue, "b", true, () => 0.99)?.id).toBe("c");
  });

  it("stops at the last item when repeat-all is disabled", () => {
    const queue = [audio("a"), audio("b")];
    expect(nextQueueItem(queue, "b", false, Math.random, false)).toBeNull();
    expect(nextQueueItem(queue, "b", false, Math.random, true)?.id).toBe("a");
  });
});
