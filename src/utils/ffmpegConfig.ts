/**
 * FFmpeg optimization configuration for converting MVR to MP4
 * Ensures zero jitter/shaking, high compatibility across devices (Android/iOS/Web),
 * and constant frame rate (CFR) with yuv420p pixel format.
 */

export const MVR_TO_MP4_FFMPEG_COMMAND = `
ffmpeg -i input.mvr \\
  -c:v libx264 \\
  -preset medium \\
  -crf 23 \\
  -pix_fmt yuv420p \\
  -fps_mode cfr \\
  -r 30 \\
  -c:a aac \\
  -b:a 192k \\
  -movflags +faststart \\
  output.mp4
`.trim();

export const FFmpegOptimizationNotes = {
  videoCodec: "libx264 (H.264) for universal browser and mobile compatibility",
  preset: "medium (balanced encoding speed and compression efficiency)",
  crf: "23 (optimal visual quality with standard bitrate)",
  pixelFormat: "yuv420p (prevents color distortion and playback errors on mobile/Android)",
  frameRateControl: "-fps_mode cfr -r 30 (Forces Constant Frame Rate to completely eliminate video jitter/shaking)",
  containerFlag: "-movflags +faststart (Enables web streaming and instant playback start)",
};
