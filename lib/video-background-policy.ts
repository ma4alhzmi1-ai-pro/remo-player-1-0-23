export function shouldPauseVideoForBackground(nextAppState: string, isPictureInPictureActiveOrRequested: boolean) {
  return nextAppState === "background" && !isPictureInPictureActiveOrRequested;
}
