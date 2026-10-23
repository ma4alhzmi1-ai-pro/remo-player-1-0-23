import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { MediaItem } from "@/types/media";

export const colors = {
  background: "#08111F",
  surface: "#111F33",
  surfaceAlt: "#172942",
  cyan: "#2EC5FF",
  violet: "#8B5CF6",
  text: "#F4F8FF",
  muted: "#91A1B7",
  border: "#233856",
  success: "#44D7A8",
};

export function formatDuration(rawSeconds: number) {
  const seconds = Math.max(0, Math.round(rawSeconds || 0));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remaining = seconds % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`
    : `${minutes}:${String(remaining).padStart(2, "0")}`;
}

export function Artwork({
  item,
  size = 52,
  isCurrent = false,
}: {
  item: MediaItem;
  size?: number;
  isCurrent?: boolean;
}) {
  const isVideo = item.mediaType === "video";
  const initial = item.title.trim().charAt(0).toLocaleUpperCase("ar") || "♫";

  return (
    <View
      style={[
        styles.artwork,
        { width: size, height: size, borderRadius: Math.max(12, size * 0.23) },
        isVideo && styles.videoArtwork,
        isCurrent && styles.artworkActive,
      ]}
    >
      {item.thumbnailUri ? (
        <Image source={{ uri: item.thumbnailUri }} style={StyleSheet.absoluteFillObject} />
      ) : (
        <View style={[styles.audioFallback, { borderRadius: Math.max(12, size * 0.23) }]}>
          <Text style={[styles.audioInitial, { fontSize: Math.max(16, size * 0.34) }]}>
            {initial}
          </Text>
          <MaterialIcons
            name="music-note"
            size={Math.max(15, size * 0.28)}
            color="rgba(255,255,255,0.72)"
            style={styles.audioNote}
          />
        </View>
      )}
      {isVideo ? (
        <View style={styles.videoPlayBadge}>
          <MaterialIcons name="play-arrow" size={Math.max(19, size * 0.38)} color={colors.text} />
        </View>
      ) : null}
      {isCurrent && (
        <View style={styles.artworkPlayingOverlay}>
          <MaterialIcons name="graphic-eq" size={Math.max(16, size * 0.35)} color={colors.cyan} />
        </View>
      )}
    </View>
  );
}

export function ActivePlayingBadge({
  label = "مشغّل هنا",
  compact = false,
}: {
  label?: string;
  compact?: boolean;
}) {
  return (
    <View style={[styles.activeBadgeContainer, compact && styles.activeBadgeCompact]}>
      <MaterialIcons name="graphic-eq" size={compact ? 12 : 14} color="#08111F" />
      <Text style={[styles.activeBadgeText, compact && styles.activeBadgeTextCompact]}>
        {label}
      </Text>
    </View>
  );
}

export function MediaRow({
  item,
  onPress,
  onLongPress,
  trailing,
  isCurrent = false,
  isPlaying = false,
}: {
  item: MediaItem;
  onPress: () => void;
  onLongPress?: () => void;
  trailing?: React.ReactNode;
  isCurrent?: boolean;
  isPlaying?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.mediaRow,
        isCurrent && styles.mediaRowActive,
        pressed && styles.pressed,
      ]}
    >
      <Artwork item={item} isCurrent={isCurrent} />
      <View style={styles.mediaInfo}>
        <View style={styles.mediaTitleRow}>
          {isCurrent && (
            <View style={styles.mediaPlayingDot}>
              <MaterialIcons
                name={isPlaying ? "graphic-eq" : "play-arrow"}
                size={13}
                color={colors.cyan}
              />
            </View>
          )}
          <Text
            numberOfLines={1}
            style={[styles.mediaTitle, isCurrent && styles.mediaTitleActive]}
          >
            {item.title}
          </Text>
        </View>
        <Text numberOfLines={1} style={styles.mediaMeta}>
          {item.artist} · {item.album}
        </Text>
      </View>
      <View style={styles.trailing}>
        {trailing ?? (
          isCurrent ? (
            <ActivePlayingBadge label={isPlaying ? "تشغيل" : "مؤقت"} compact />
          ) : (
            <Text style={styles.duration}>
              {item.duration ? formatDuration(item.duration) : "جاهز"}
            </Text>
          )
        )}
      </View>
    </Pressable>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <MaterialIcons name={icon} size={32} color={colors.cyan} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.primaryButtonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  artwork: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#2A2150",
    borderWidth: 1,
    borderColor: "#41346F",
  },
  artworkActive: {
    borderColor: colors.cyan,
    borderWidth: 2,
    shadowColor: colors.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  artworkPlayingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8, 17, 31, 0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  videoArtwork: {
    backgroundColor: "#0D3E52",
    borderColor: "#1B627D",
  },
  audioFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#3C2B68",
    justifyContent: "center",
    alignItems: "center",
  },
  audioInitial: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  audioNote: {
    position: "absolute",
    left: 6,
    bottom: 5,
  },
  videoPlayBadge: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.54)",
    alignItems: "center",
    justifyContent: "center",
  },
  mediaRow: {
    minHeight: 72,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mediaRowActive: {
    backgroundColor: "rgba(46, 197, 255, 0.09)",
    borderLeftWidth: 3,
    borderLeftColor: colors.cyan,
  },
  pressed: {
    opacity: 0.68,
  },
  mediaInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  mediaTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  mediaPlayingDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(46, 197, 255, 0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  mediaTitle: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
    textAlign: "right",
  },
  mediaTitleActive: {
    color: colors.cyan,
    fontWeight: "900",
  },
  mediaMeta: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
    textAlign: "right",
  },
  trailing: {
    minWidth: 54,
    alignItems: "flex-start",
  },
  duration: {
    color: colors.muted,
    fontSize: 12,
    fontVariant: ["tabular-nums"],
  },
  activeBadgeContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.cyan,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  activeBadgeCompact: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeBadgeText: {
    color: "#08111F",
    fontSize: 11,
    fontWeight: "900",
  },
  activeBadgeTextCompact: {
    fontSize: 9,
    fontWeight: "900",
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 56,
    gap: 10,
  },
  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10263B",
    borderWidth: 1,
    borderColor: "#1A526C",
    marginBottom: 4,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "800",
    textAlign: "center",
  },
  emptyDescription: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  primaryButton: {
    minHeight: 46,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "800",
  },
});
