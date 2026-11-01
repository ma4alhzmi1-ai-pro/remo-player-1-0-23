/** يحول موضع اللمس داخل الشريط المرئي من اليسار إلى اليمين إلى ثانية. */
export function resolveAudioProgressSeek(locationX: number, trackWidth: number, duration: number) {
  if (!Number.isFinite(locationX) || !Number.isFinite(trackWidth) || !Number.isFinite(duration) || trackWidth <= 0 || duration <= 0) {
    return null;
  }
  const ratio = Math.max(0, Math.min(locationX / trackWidth, 1));
  return ratio * duration;
}
