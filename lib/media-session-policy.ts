export type MediaSessionKind = "audio" | "video";

export type MediaSessionPolicy = {
  allowBackgroundPlayback: boolean;
  enableLockScreenControls: boolean;
};

/**
 * يحدد سياسة تشغيل الوسائط في الخلفية وعناصر التحكم في شاشة القفل.
 * للموسيقى: مفعلة دائماً.
 * للفيديو: تتبع خيار التشغيل في الخلفية (افتراضياً false إذا لم يتم تفعيله).
 */
export function resolveMediaSessionPolicy(kind: MediaSessionKind, allowVideoBackground = false): MediaSessionPolicy {
  if (kind === "audio") {
    return {
      allowBackgroundPlayback: true,
      enableLockScreenControls: true,
    };
  }

  return {
    allowBackgroundPlayback: allowVideoBackground,
    enableLockScreenControls: allowVideoBackground,
  };
}
