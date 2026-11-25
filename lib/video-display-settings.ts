import AsyncStorage from "@react-native-async-storage/async-storage";

export type VideoFitMode = "auto" | "contain" | "cover" | "fill";
export type FrameAspect = "source" | "screen" | "16:9" | "4:3" | "1:1" | "21:9";

const REMEMBERED_ASPECT_KEY = "remo.video.remembered_aspect.v1";

const VALID_FIT_MODES: readonly VideoFitMode[] = ["auto", "contain", "cover", "fill"];
const VALID_FRAME_ASPECTS: readonly FrameAspect[] = ["16:9", "4:3", "1:1", "21:9", "source", "screen"];

export function resolveVideoContentFit(mode: VideoFitMode, isLandscape: boolean, cinematic: boolean) {
  if (mode !== "auto") return mode;
  return cinematic ? "cover" : "contain";
}

export function resolveSourceAspect(width: number, height: number): number | null {
  if (![width, height].every(Number.isFinite) || width <= 0 || height <= 0) return null;
  return width / height;
}

export function resolveFrameDimensions(frame: FrameAspect, viewportWidth: number, viewportHeight: number, sourceAspect = 16 / 9) {
  if (!Number.isFinite(viewportWidth) || !Number.isFinite(viewportHeight) || viewportWidth <= 0 || viewportHeight <= 0 || frame === "screen") return null;
  const ratioMap: Record<Exclude<FrameAspect, "screen" | "source">, number> = {
    "16:9": 16 / 9,
    "4:3": 4 / 3,
    "1:1": 1,
    "21:9": 21 / 9,
  };
  const ratio = frame === "source" ? sourceAspect : ratioMap[frame];
  if (!Number.isFinite(ratio) || ratio <= 0) return null;
  return {
    width: Math.min(viewportWidth, viewportHeight * ratio),
    height: Math.min(viewportHeight, viewportWidth / ratio),
  };
}

export function resolveFixedFrameLayout(frame: FrameAspect, viewportWidth: number, viewportHeight: number, sourceAspect = 16 / 9) {
  const dimensions = resolveFrameDimensions(frame, viewportWidth, viewportHeight, sourceAspect);
  const width = dimensions?.width ?? viewportWidth;
  const height = dimensions?.height ?? viewportHeight;
  if (![width, height].every(Number.isFinite) || width <= 0 || height <= 0) return null;
  return {
    width,
    height,
    left: Math.max(0, (viewportWidth - width) / 2),
    top: Math.max(0, (viewportHeight - height) / 2),
  };
}

export function nextQuickFrameAspect(current: FrameAspect | null): { frameAspect: FrameAspect; videoFit: VideoFitMode; label: string } {
  const index = current ? VALID_FRAME_ASPECTS.indexOf(current) : -1;
  const next = VALID_FRAME_ASPECTS[(index + 1) % VALID_FRAME_ASPECTS.length];
  const labels: Record<FrameAspect, string> = {
    "16:9": "16:9",
    "4:3": "4:3",
    "1:1": "1:1",
    "21:9": "21:9 (سينمائي)",
    source: "الأصل",
    screen: "ملء الشاشة",
  };
  return {
    frameAspect: next,
    videoFit: next === "screen" ? "fill" : "contain",
    label: labels[next],
  };
}

export async function loadRememberedVideoAspect(): Promise<{ videoFit: VideoFitMode; frameAspect: FrameAspect } | null> {
  try {
    const raw = await AsyncStorage.getItem(REMEMBERED_ASPECT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { videoFit?: VideoFitMode; frameAspect?: FrameAspect };
    if (
      parsed.videoFit &&
      VALID_FIT_MODES.includes(parsed.videoFit) &&
      parsed.frameAspect &&
      VALID_FRAME_ASPECTS.includes(parsed.frameAspect)
    ) {
      return { videoFit: parsed.videoFit, frameAspect: parsed.frameAspect };
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveRememberedVideoAspect(value: { videoFit: VideoFitMode; frameAspect: FrameAspect }): Promise<void> {
  try {
    await AsyncStorage.setItem(REMEMBERED_ASPECT_KEY, JSON.stringify(value));
  } catch {
    // ignore storage errors
  }
}
