export type VideoFitMode = "auto" | "contain" | "cover" | "fill";
export type FrameAspect = "source" | "screen" | "16:9" | "4:3" | "1:1" | "21:9";

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
