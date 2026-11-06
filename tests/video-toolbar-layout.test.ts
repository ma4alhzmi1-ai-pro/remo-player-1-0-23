import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../app/player/video.tsx", import.meta.url), "utf8");

describe("video toolbar layout", () => {
  it("gives the horizontal quick-actions ScrollView a real height", () => {
    expect(source).toContain('style={styles.quickIconsScroll}');
    expect(source).toContain('quickIconsScroll: { height: 46');
    expect(source).toContain('quickIcons: { minHeight: 42, height: 42');
  });

  it("keeps the toolbar above the native video surface", () => {
    expect(source).toContain('overlay: { ...StyleSheet.absoluteFillObject, zIndex: 100, elevation: 100');
    expect(source).toContain('controlDock: { width: "96%"');
  });
});
