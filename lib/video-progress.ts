import type { ProgressDirection } from "./video-settings";

/** يحول موضع اللمس داخل الشريط المرئي إلى وقت التشغيل وفق اتجاه الشريط المختار (RTL أو LTR). */
export function resolveVideoProgressSeek(
  locationX: number,
  trackWidth: number,
  duration: number,
  direction: ProgressDirection = "rtl",
) {
  if (![locationX, trackWidth, duration].every(Number.isFinite) || trackWidth <= 0 || duration <= 0) return null;
  const clamped = Math.max(0, Math.min(1, locationX / trackWidth));
  const fraction = direction === "ltr" ? clamped : 1 - clamped;
  return Number((duration * fraction).toFixed(3));
}
