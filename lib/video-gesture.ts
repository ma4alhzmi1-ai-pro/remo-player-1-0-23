export type VideoGestureAction =
  | { type: "seek"; seconds: number }
  | { type: "volume"; delta: number }
  | { type: "brightness"; delta: number }
  | null;

const HORIZONTAL_SWIPE_THRESHOLD = 32;
const VERTICAL_SWIPE_THRESHOLD = 28;

export function resolveVideoGesture(translationX: number, translationY: number, touchX: number, surfaceWidth: number): VideoGestureAction {
  if (![translationX, translationY, touchX, surfaceWidth].every(Number.isFinite) || surfaceWidth <= 0) {
    return null;
  }

  const horizontalDistance = Math.abs(translationX);
  const verticalDistance = Math.abs(translationY);

  if (horizontalDistance >= verticalDistance && horizontalDistance >= HORIZONTAL_SWIPE_THRESHOLD) {
    const seconds = Math.max(5, Math.min(45, Math.round(horizontalDistance / 7)));
    return { type: "seek", seconds: translationX > 0 ? seconds : -seconds };
  }

  if (verticalDistance >= VERTICAL_SWIPE_THRESHOLD) {
    const delta = translationY < 0 ? 0.1 : -0.1;
    return touchX >= surfaceWidth / 2 ? { type: "brightness", delta } : { type: "volume", delta };
  }

  return null;
}
