export type VideoFitMode = "auto" | "contain" | "cover" | "fill";
export type FrameAspect = "screen" | "16:9" | "4:3" | "1:1" | "21:9";

export function resolveVideoContentFit(mode: VideoFitMode, isLandscape: boolean, cinematic: boolean) {
  if (mode !== "auto") return mode;
  return cinematic ? "cover" : "contain";
}

export function resolveFrameDimensions(frame: FrameAspect, viewportWidth: number, viewportHeight: number) {
  if (!Number.isFinite(viewportWidth) || !Number.isFinite(viewportHeight) || viewportWidth <= 0 || viewportHeight <= 0 || frame === "screen") return null;
  const ratioMap: Record<Exclude<FrameAspect, "screen">, number> = {
    "16:9": 16 / 9,
    "4:3": 4 / 3,
    "1:1": 1,
    "21:9": 21 / 9,
  };
  const ratio = ratioMap[frame];
  return {
    width: Math.min(viewportWidth, viewportHeight * ratio),
    height: Math.min(viewportHeight, viewportWidth / ratio),
  };
}
