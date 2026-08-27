export type ReleaseFeed = {
  schemaVersion: 1;
  appName: "REMO PLAYER";
  version: string;
  versionCode: number;
  publishedAt: string;
  releaseUrl: string;
  apkUrl: string;
  sha256: string;
  notes: string;
};

function versionParts(version: string) {
  if (!/^\d+(?:\.\d+){1,3}$/.test(version)) return null;
  return version.split(".").map((part) => Number(part));
}

export function compareVersions(left: string, right: string): number | null {
  const leftParts = versionParts(left);
  const rightParts = versionParts(right);
  if (!leftParts || !rightParts) return null;
  const length = Math.max(leftParts.length, rightParts.length);
  for (let index = 0; index < length; index += 1) {
    const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (difference !== 0) return difference > 0 ? 1 : -1;
  }
  return 0;
}

export function isValidReleaseFeed(value: unknown): value is ReleaseFeed {
  if (!value || typeof value !== "object") return false;
  const feed = value as Partial<ReleaseFeed>;
  return feed.schemaVersion === 1
    && feed.appName === "REMO PLAYER"
    && typeof feed.version === "string"
    && Number.isInteger(feed.versionCode)
    && typeof feed.releaseUrl === "string" && /^https:\/\/github\.com\/ma4alhzmi1-ai-pro\/remo-player-releases\/releases\//.test(feed.releaseUrl)
    && typeof feed.apkUrl === "string" && /^https:\/\/github\.com\/ma4alhzmi1-ai-pro\/remo-player-releases\/releases\/download\//.test(feed.apkUrl)
    && typeof feed.notes === "string";
}
