import { describe, expect, it } from "vitest";
import { shouldRenderMiniPlayer } from "../lib/mini-player-policy";

describe("mini-player handoff", () => {
  it("appears only after an explicit handoff outside player routes", () => {
    expect(shouldRenderMiniPlayer({ hasCurrentItem: true, enabled: true, pathname: "/video" })).toBe(true);
    expect(shouldRenderMiniPlayer({ hasCurrentItem: true, enabled: true, pathname: "/player/video" })).toBe(false);
  });
  it("stays hidden without an item or handoff", () => {
    expect(shouldRenderMiniPlayer({ hasCurrentItem: false, enabled: true, pathname: "/video" })).toBe(false);
    expect(shouldRenderMiniPlayer({ hasCurrentItem: true, enabled: false, pathname: "/video" })).toBe(false);
  });
});
