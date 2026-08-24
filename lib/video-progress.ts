/**
 * يحول موضع اللمس داخل شريط التقدم إلى وقت تشغيل آمن بالثواني.
 */
export function resolveVideoProgressSeek(locationX: number, trackWidth: number, duration: number) {
  if (!Number.isFinite(locationX) || !Number.isFinite(trackWidth) || !Number.isFinite(duration) || trackWidth <= 0 || duration <= 0) {
    return null;
  }
  const fraction = Math.max(0, Math.min(1, locationX / trackWidth));
  return Number((duration * fraction).toFixed(3));
}
