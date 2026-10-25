/** يحول موضع الإصبع الفيزيائي داخل الشريط المرئي إلى وقت التشغيل. */
export function resolveVideoProgressSeek(locationX: number, trackWidth: number, duration: number) {
  if (![locationX, trackWidth, duration].every(Number.isFinite) || trackWidth <= 0 || duration <= 0) return null;
  // RTL timeline: dragging left advances playback and dragging right rewinds.
  const fraction = 1 - Math.max(0, Math.min(1, locationX / trackWidth));
  return Number((duration * fraction).toFixed(3));
}
