export function shouldPauseVideoForBackground(
  nextAppState: string,
  isPictureInPictureActiveOrRequested: boolean,
  isManualBackgroundPlaybackEnabled = false,
) {
  return nextAppState === "background" && !isPictureInPictureActiveOrRequested && !isManualBackgroundPlaybackEnabled;
}
