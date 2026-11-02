/** يحول موضع اللمس داخل الشريط المرئي من اليسار إلى اليمين إلى ثانية. */
export function resolveAudioProgressSeek(locationX: number, trackWidth: number, duration: number) {
  if (!Number.isFinite(locationX) || !Number.isFinite(trackWidth) || !Number.isFinite(duration) || trackWidth <= 0 || duration <= 0) {
    return null;
  }
  // RTL timeline: right edge is the start, left edge is the end.
  // RTL timeline: the right edge is the beginning and the left edge is the end.
  const ratio = 1 - Math.max(0, Math.min(locationX / trackWidth, 1));
  return ratio * duration;
}
