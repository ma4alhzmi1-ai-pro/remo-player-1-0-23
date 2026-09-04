import { describe, expect, it } from "vitest";

import { defaultSubtitleAppearance, normalizeSubtitleAppearance } from "../lib/subtitle-store";

describe("تفضيلات مظهر الترجمة", () => {
  it("يعيد المظهر الافتراضي عند غياب القيم", () => {
    expect(normalizeSubtitleAppearance(null)).toEqual(defaultSubtitleAppearance);
  });

  it("يقيد حجم الخط إلى نطاق قراءة آمن ويحتفظ بالألوان", () => {
    expect(normalizeSubtitleAppearance({
      fontSize: 99,
      color: "#FFE66D",
      backgroundColor: "rgba(4,28,52,0.88)",
    })).toEqual({
      fontSize: 30,
      color: "#FFE66D",
      backgroundColor: "rgba(4,28,52,0.88)",
    });
    expect(normalizeSubtitleAppearance({ fontSize: 4 }).fontSize).toBe(12);
  });
});
