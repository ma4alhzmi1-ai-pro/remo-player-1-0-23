/** يحول موضع اللمس على شريط RTL إلى ثانية: اليمين بداية واليسار نهاية. */
export function resolveAudioProgressSeek(locationX: number, trackWidth: number, duration: number) {
  if (!Number.isFinite(locationX) || !Number.isFinite(trackWidth) || !Number.isFinite(duration) || trackWidth <= 0 || duration <= 0) {
    return null;
  }
  const ratio = Math.max(0, Math.min(1 - (locationX / trackWidth), 1));
  return ratio * duration;
}
