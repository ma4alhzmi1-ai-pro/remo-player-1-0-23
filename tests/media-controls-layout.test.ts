import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const contextSource = readFileSync(new URL("../lib/player-context.tsx", import.meta.url), "utf8");
const videoPatch = readFileSync(new URL("../scripts/patch-expo-video-media-controls.mjs", import.meta.url), "utf8");
const audioPatch = readFileSync(new URL("../scripts/patch-expo-audio-media-controls.mjs", import.meta.url), "utf8");

describe("media notification and lock-screen layout", () => {
  it("requests only previous, play/pause and next for music", () => {
    expect(contextSource).toContain("showSeekBackward: false");
    expect(contextSource).toContain("showSeekForward: false");
    expect(contextSource).toContain("showSkipPrevious: true");
    expect(contextSource).toContain("showSkipNext: true");
  });

  it("patches video MediaSession with the three primary controls", () => {
    expect(videoPatch).toContain("ImmutableList.of(skipPreviousButton, playPauseButton, skipNextButton)");
    expect(videoPatch).toContain('SKIP_NEXT_COMMAND');
    expect(videoPatch).toContain('SKIP_PREVIOUS_COMMAND');
  });

  it("keeps native audio queue actions wired to the React queue", () => {
    expect(audioPatch).toContain('ACTION_SKIP_NEXT -> dispatchQueueActionInternal("next")');
    expect(audioPatch).toContain('ACTION_SKIP_PREVIOUS -> dispatchQueueActionInternal("previous")');
  });
});
