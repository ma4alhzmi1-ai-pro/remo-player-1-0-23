/**
 * يعيد وقت قفز آمن داخل حدود فيديو جاهز للبحث، أو null عندما لا تكون البيانات جاهزة.
 */
export function resolveSafeVideoSeek(currentTime: number, duration: number, offsetSeconds: number) {
  if (!Number.isFinite(currentTime) || !Number.isFinite(duration) || !Number.isFinite(offsetSeconds) || duration <= 0) return null;
  return Math.max(0, Math.min(duration, currentTime + offsetSeconds));
}
