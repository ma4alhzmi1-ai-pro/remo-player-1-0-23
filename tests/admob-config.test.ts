import { describe, expect, it } from "vitest";

const ANDROID_TEST_APP_ID = "ca-app-pub-3940256099942544~3347511713";

function isAdMobAppId(value: string) {
  return /^ca-app-pub-\d{16}~\d+$/.test(value);
}

describe("AdMob development configuration", () => {
  it("uses a syntactically valid Google test App ID until production identifiers are configured", () => {
    expect(isAdMobAppId(ANDROID_TEST_APP_ID)).toBe(true);
  });
});
