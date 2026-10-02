import { describe, expect, it } from "vitest";

import { shouldKeepVideoSessionOnRouteExit, shouldRenderMiniPlayer } from "../lib/mini-player-policy";

describe("mini player visibility", () => {
  it("appears only after leaving a player route with an active item", () => {
    expect(shouldRenderMiniPlayer({ hasCurrentItem: true, enabled: true, pathname: "/video" })).toBe(true);
    expect(shouldRenderMiniPlayer({ hasCurrentItem: true, enabled: true, pathname: "/player/video" })).toBe(false);
  });

  it("does not render without an explicit handoff", () => {
    expect(shouldRenderMiniPlayer({ hasCurrentItem: true, enabled: false, pathname: "/video" })).toBe(false);
    expect(shouldRenderMiniPlayer({ hasCurrentItem: false, enabled: true, pathname: "/video" })).toBe(false);
  });

  it("keeps both audio and video sessions eligible for in-app handoff", () => {
    expect(shouldKeepVideoSessionOnRouteExit("video")).toBe(true);
    expect(shouldKeepVideoSessionOnRouteExit("audio")).toBe(true);
  });
});
