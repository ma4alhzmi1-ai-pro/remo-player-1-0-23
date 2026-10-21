import { describe, expect, it } from "vitest";

import { resumePosition } from "../lib/playback-memory";

describe("playback memory", () => {
  it("only resumes meaningful positions that are not at the end of a media item", () => {
    expect(resumePosition(null, 100)).toBe(0);
    expect(resumePosition({ itemId: "a", position: 3, updatedAt: 1 }, 100)).toBe(0);
    expect(resumePosition({ itemId: "a", position: 42, updatedAt: 1 }, 100)).toBe(42);
    expect(resumePosition({ itemId: "a", position: 99, updatedAt: 1 }, 100)).toBe(0);
  });
});
