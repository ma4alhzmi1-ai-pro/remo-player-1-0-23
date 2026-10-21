export const VIDEO_PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4] as const;

export function nextVideoPlaybackSpeed(currentSpeed: number): number {
  const currentIndex = VIDEO_PLAYBACK_SPEEDS.indexOf(currentSpeed as (typeof VIDEO_PLAYBACK_SPEEDS)[number]);
  return VIDEO_PLAYBACK_SPEEDS[(currentIndex + 1) % VIDEO_PLAYBACK_SPEEDS.length];
}
