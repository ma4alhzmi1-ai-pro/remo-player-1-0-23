/** يحول موضع اللمس داخل شريط RTL إلى وقت التشغيل: اليمين بداية واليسار نهاية. */
export function resolveVideoProgressSeek(locationX: number, trackWidth: number, duration: number) {
  if (![locationX, trackWidth, duration].every(Number.isFinite) || trackWidth <= 0 || duration <= 0) return null;
  const fraction = Math.max(0, Math.min(1, 1 - (locationX / trackWidth)));
  return Number((duration * fraction).toFixed(3));
}
