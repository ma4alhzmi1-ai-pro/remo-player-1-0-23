export type VideoGestureAction =
  | { type: "seek"; seconds: number }
  | { type: "volume"; delta: number }
  | { type: "brightness"; delta: number }
  | null;

const HORIZONTAL_SWIPE_THRESHOLD = 32;
const VERTICAL_SWIPE_THRESHOLD = 28;
const ACTIVATION_SWIPE_THRESHOLD = 8;

export function shouldActivateVideoGesture(translationX: number, translationY: number, controlsLocked: boolean): boolean {
  if (controlsLocked || ![translationX, translationY].every(Number.isFinite)) return false;
  return Math.abs(translationX) >= ACTIVATION_SWIPE_THRESHOLD || Math.abs(translationY) >= ACTIVATION_SWIPE_THRESHOLD;
}

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

export function resolveLocalBrightness(startBrightness: number, translationY: number, surfaceHeight: number): number | null {
  if (![startBrightness, translationY, surfaceHeight].every(Number.isFinite) || surfaceHeight <= 0) return null;
  const delta = -translationY / (surfaceHeight * 0.75);
  return Math.max(0.05, Math.min(1, startBrightness + delta));
}

export function resolveLocalVolume(
  startVolume: number,
  translationY: number,
  surfaceHeight: number,
  maxVolume = 1.0
): number | null {
  if (![startVolume, translationY, surfaceHeight, maxVolume].every(Number.isFinite) || surfaceHeight <= 0) return null;
  const delta = -translationY / (surfaceHeight * 0.75);
  return Math.max(0, Math.min(maxVolume, startVolume + delta));
}

export function resolvePinchScale(
  initialDistance: number,
  currentDistance: number,
  initialScale: number,
  minScale = 0.6,
  maxScale = 3.5
): number | null {
  if (![initialDistance, currentDistance, initialScale].every(Number.isFinite) || initialDistance <= 0) return null;
  const factor = currentDistance / initialDistance;
  return Math.max(minScale, Math.min(maxScale, Number((initialScale * factor).toFixed(2))));
}

export function resolveSeekHudData(
  translationX: number,
  surfaceWidth: number,
  currentTime: number,
  duration: number
): { targetTime: number; deltaSeconds: number } | null {
  if (![translationX, surfaceWidth, currentTime, duration].every(Number.isFinite) || surfaceWidth <= 0 || duration <= 0) return null;
  const speedFactor = duration > 600 ? 90 : duration > 180 ? 45 : 20;
  const deltaSeconds = Math.round((translationX / (surfaceWidth * 0.4)) * speedFactor);
  const targetTime = Math.max(0, Math.min(duration, currentTime + deltaSeconds));
  return { targetTime, deltaSeconds };
}

