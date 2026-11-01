/** يحول موضع اللمس داخل الشريط المرئي من اليسار إلى اليمين إلى وقت التشغيل. */
export function resolveVideoProgressSeek(locationX: number, trackWidth: number, duration: number) {
  if (![locationX, trackWidth, duration].every(Number.isFinite) || trackWidth <= 0 || duration <= 0) return null;
  // RTL timeline: the right edge is the beginning and the left edge is the end.
  const fraction = 1 - Math.max(0, Math.min(1, locationX / trackWidth));
  return Number((duration * fraction).toFixed(3));
}
