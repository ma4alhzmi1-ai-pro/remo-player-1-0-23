import { describe, expect, it } from "vitest";

import { DEFAULT_EQUALIZER, normalizeStoredEqualizer } from "../lib/equalizer-storage";

describe("إعدادات المعادل المحفوظة", () => {
  it("يعيد القيم الافتراضية الآمنة عند غياب إعدادات محلية", () => {
    expect(normalizeStoredEqualizer(null)).toEqual(DEFAULT_EQUALIZER);
  });

  it("يضبط نطاقات التردد والتعزيز ضمن حدود مؤثر Android", () => {
    expect(normalizeStoredEqualizer({
      enabled: false,
      preset: "rock",
      bands: [40, -30, 2.4],
      bass: 160,
      virtualizer: -5,
      room: "large",
    })).toMatchObject({
      enabled: false,
      preset: "rock",
      bands: [12, -12, 2, 0, 0],
      bass: 100,
      virtualizer: 0,
      room: "large",
    });
  });
});
