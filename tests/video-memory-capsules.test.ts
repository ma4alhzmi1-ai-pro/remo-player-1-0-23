import { describe, expect, it } from "vitest";

import { createVideoMemoryCapsule, removeVideoMemoryCapsule, upsertVideoMemoryCapsule } from "../lib/video-memory-capsules";

describe("video memory capsules", () => {
  it("creates a safe labeled capsule", () => {
    const capsule = createVideoMemoryCapsule(-4, "  بداية مهمة  ");
    expect(capsule.position).toBe(0);
    expect(capsule.label).toBe("بداية مهمة");
    expect(capsule.id).toContain("capsule-");
  });

  it("updates a nearby capsule instead of creating duplicates", () => {
    const original = createVideoMemoryCapsule(42, "المشهد الأول");
    const updated = upsertVideoMemoryCapsule([original], createVideoMemoryCapsule(43, "المشهد المعدل"));
    expect(updated).toHaveLength(1);
    expect(updated[0].label).toBe("المشهد المعدل");
  });

  it("sorts capsules and removes one by id", () => {
    const first = createVideoMemoryCapsule(80, "الثاني");
    const second = createVideoMemoryCapsule(10, "الأول");
    const sorted = upsertVideoMemoryCapsule(upsertVideoMemoryCapsule([], first), second);
    expect(sorted.map((item) => item.position)).toEqual([10, 80]);
    expect(removeVideoMemoryCapsule(sorted, first.id)).toHaveLength(1);
  });
});
