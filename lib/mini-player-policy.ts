export function shouldRenderMiniPlayer({
  hasCurrentItem,
  enabled,
  pathname,
}: {
  hasCurrentItem: boolean;
  enabled: boolean;
  pathname: string;
}) {
  return hasCurrentItem && enabled && !pathname.startsWith("/player/");
}

export function shouldKeepVideoSessionOnRouteExit(mediaType: "audio" | "video") {
  return mediaType === "video" || mediaType === "audio";
}
