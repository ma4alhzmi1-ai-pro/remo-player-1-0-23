export type MediaSessionKind = "audio" | "video";

export type MediaSessionPolicy = {
  allowBackgroundPlayback: boolean;
  enableLockScreenControls: boolean;
};

/**
 * الموسيقى وحدها تستخدم خدمة الوسائط في Android. الفيديو يبقى داخل التطبيق
 * ولا يرث جلسة شاشة القفل أو إشعار الموسيقى عند الانتقال بين النوعين.
 */
export function resolveMediaSessionPolicy(kind: MediaSessionKind): MediaSessionPolicy {
  if (kind === "audio") {
    return {
      allowBackgroundPlayback: true,
      enableLockScreenControls: true,
    };
  }

  return {
    allowBackgroundPlayback: false,
    enableLockScreenControls: false,
  };
}
