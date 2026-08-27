import Constants from "expo-constants";
import { Linking } from "react-native";

import { compareVersions, isValidReleaseFeed, type ReleaseFeed } from "./github-update-core";

export const REMO_UPDATE_FEED_URL = "https://raw.githubusercontent.com/ma4alhzmi1-ai-pro/remo-player-releases/main/latest.json";

export type { ReleaseFeed } from "./github-update-core";

export type UpdateCheckResult =
  | { status: "available"; release: ReleaseFeed }
  | { status: "current"; release: ReleaseFeed }
  | { status: "unavailable" };

export function currentAppVersion() {
  return Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? "0.0.0";
}

export async function checkGithubForUpdate(fetcher: typeof fetch = fetch): Promise<UpdateCheckResult> {
  try {
    const response = await fetcher(REMO_UPDATE_FEED_URL, {
      headers: { "Cache-Control": "no-cache", Accept: "application/json" },
    });
    const payload: unknown = response.ok ? await response.json() : null;
    if (!isValidReleaseFeed(payload)) return { status: "unavailable" };
    const release = payload;
    const comparison = compareVersions(release.version, currentAppVersion());
    return comparison !== null && comparison > 0 ? { status: "available", release } : { status: "current", release };
  } catch {
    return { status: "unavailable" };
  }
}

export async function openOfficialUpdate(releaseUrl: string): Promise<boolean> {
  try {
    if (!/^https:\/\/github\.com\/ma4alhzmi1-ai-pro\/remo-player-releases\/releases\//.test(releaseUrl)) return false;
    if (!(await Linking.canOpenURL(releaseUrl))) return false;
    await Linking.openURL(releaseUrl);
    return true;
  } catch {
    return false;
  }
}
