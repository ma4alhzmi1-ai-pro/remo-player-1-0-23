import { Platform } from "react-native";

export type PlayerDiagnostic = {
  event: string;
  details?: Record<string, string | number | boolean | null | undefined>;
};

/**
 * Diagnostic breadcrumbs are intentionally lightweight: React Native forwards
 * console output to Android logcat in release/debug builds without shipping a
 * separate logging dependency or persisting user media information.
 */
export function logPlayerDiagnostic({ event, details = {} }: PlayerDiagnostic) {
  if (Platform.OS !== "android") return;
  const payload = Object.entries(details)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(" ");
  console.info(`[REMO_PLAYER] ${event}${payload ? ` ${payload}` : ""}`);
}
