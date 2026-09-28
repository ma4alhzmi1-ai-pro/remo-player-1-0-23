import { beforeEach, describe, expect, it, vi } from "vitest";

const data = new Map<string, string>();

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(async (key: string) => data.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => { data.set(key, value); }),
  },
}));

import { decorateText, loadClipboard, rememberClipboardText, saveClipboard } from "../lib/remo-storage";

describe("أدوات ريموكيبورد المحلية", () => {
  beforeEach(() => data.clear());

  it("ينشئ أنماط زخرفة عربية قابلة للنسخ من النص المدخل", () => {
    const values = decorateText("ريمو");
    expect(values).toHaveLength(6);
    expect(values.map((item) => item.value)).toContain("✦ ريمو ✦");
    expect(values.every((item) => item.value.includes("ريمو"))).toBe(true);
  });

  it("يحافظ على النص الطويل كاملًا داخل الحافظة المحلية", async () => {
    const longText = "م".repeat(12000);
    const entries = await rememberClipboardText(longText, 30);
    expect(entries).toHaveLength(1);
    expect(entries[0].text).toBe(longText);
    expect((await loadClipboard())[0].text.length).toBe(12000);
  });

  it("يرفع النص المنسوخ حديثًا ويزيل التكرار مع احترام الحد العددي", async () => {
    await rememberClipboardText("الأول", 2);
    await rememberClipboardText("الثاني", 2);
    await rememberClipboardText("الأول", 2);
    await rememberClipboardText("الثالث", 2);
    expect((await loadClipboard()).map((entry) => entry.text)).toEqual(["الثالث", "الأول"]);
  });

  it("يحافظ على العناصر المثبتة عند تطبيق حد التخزين", async () => {
    await saveClipboard([{ id: "pinned", text: "نص مثبّت", createdAt: 1, pinned: true }]);
    const entries = await rememberClipboardText("نص عادي", 1);
    expect(entries.map((entry) => entry.text)).toEqual(["نص مثبّت"]);
  });
});
