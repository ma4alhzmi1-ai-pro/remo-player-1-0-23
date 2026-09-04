import { describe, expect, it } from "vitest";

import { compareVersions, isValidReleaseFeed } from "../lib/github-update-core";

describe("فحص تحديثات GitHub", () => {
  it("يقارن أرقام الإصدارات الرقمية دون الاعتماد على ترتيب نصي", () => {
    expect(compareVersions("1.0.50", "1.0.49")).toBe(1);
    expect(compareVersions("1.0.9", "1.0.10")).toBe(-1);
    expect(compareVersions("1.2", "1.2.0")).toBe(0);
    expect(compareVersions("إصدار", "1.2.0")).toBeNull();
  });

  it("لا يقبل إلا ملف تحديث من مستودع إصدارات REMO PLAYER العام", () => {
    expect(isValidReleaseFeed({
      schemaVersion: 1,
      appName: "REMO PLAYER",
      version: "1.0.50",
      versionCode: 52,
      publishedAt: "2026-08-27T19:10:20Z",
      releaseUrl: "https://github.com/ma4alhzmi1-ai-pro/remo-player-releases/releases/tag/v1.0.50",
      apkUrl: "https://github.com/ma4alhzmi1-ai-pro/remo-player-releases/releases/download/v1.0.50/REMO-PLAYER-1.0.50.apk",
      sha256: "abc",
      notes: "تحسينات",
    })).toBe(true);
    expect(isValidReleaseFeed({ appName: "REMO PLAYER", releaseUrl: "https://example.com" })).toBe(false);
  });
});
