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

export function Artwork({ item, size = 52 }: { item: MediaItem; size?: number }) {
  const isVideo = item.mediaType === "video";
  const initial = item.title.trim().charAt(0).toLocaleUpperCase("ar") || "♫";
  return (
    <View style={[styles.artwork, { width: size, height: size, borderRadius: Math.max(12, size * 0.23) }, isVideo && styles.videoArtwork]}>
      {item.thumbnailUri ? <Image source={{ uri: item.thumbnailUri }} style={StyleSheet.absoluteFillObject} /> : <View style={[styles.audioFallback, { borderRadius: Math.max(12, size * 0.23) }]}><Text style={[styles.audioInitial, { fontSize: Math.max(16, size * 0.34) }]}>{initial}</Text><MaterialIcons name="music-note" size={Math.max(15, size * 0.28)} color="rgba(255,255,255,0.72)" style={styles.audioNote} /></View>}
      {isVideo ? <View style={styles.videoPlayBadge}><MaterialIcons name="play-arrow" size={Math.max(19, size * 0.38)} color={colors.text} /></View> : null}
    </View>
  );
}

export function MediaRow({ item, onPress, onLongPress, trailing }: { item: MediaItem; onPress: () => void; onLongPress?: () => void; trailing?: React.ReactNode }) {
  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} style={({ pressed }) => [styles.mediaRow, pressed && styles.pressed]}>
      <Artwork item={item} />
      <View style={styles.mediaInfo}>
        <Text numberOfLines={1} style={styles.mediaTitle}>{item.title}</Text>
        <Text numberOfLines={1} style={styles.mediaMeta}>{item.artist} · {item.album}</Text>
      </View>
      <View style={styles.trailing}>{trailing ?? <Text style={styles.duration}>{item.duration ? formatDuration(item.duration) : "جاهز"}</Text>}</View>
    </Pressable>
  );
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: { icon: keyof typeof MaterialIcons.glyphMap; title: string; description: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}><MaterialIcons name={icon} size={32} color={colors.cyan} /></View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
          <Text style={styles.primaryButtonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  artwork: { alignItems: "center", justifyContent: "center", overflow: "hidden", backgroundColor: "#2A2150", borderWidth: 1, borderColor: "#41346F" },
  videoArtwork: { backgroundColor: "#0D3E52", borderColor: "#1B627D" },
  audioFallback: { ...StyleSheet.absoluteFillObject, backgroundColor: "#3C2B68", justifyContent: "center", alignItems: "center" },
  audioInitial: { color: "#FFFFFF", fontWeight: "900" },
  audioNote: { position: "absolute", left: 6, bottom: 5 },
  videoPlayBadge: { width: "48%", aspectRatio: 1, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.54)", alignItems: "center", justifyContent: "center" },
  mediaRow: { minHeight: 72, flexDirection: "row-reverse", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  pressed: { opacity: 0.68 },
  mediaInfo: { flex: 1, alignItems: "flex-end" },
  mediaTitle: { color: colors.text, fontSize: 15, lineHeight: 21, fontWeight: "700", textAlign: "right" },
  mediaMeta: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 2, textAlign: "right" },
  trailing: { width: 48, alignItems: "flex-start" },
  duration: { color: colors.muted, fontSize: 12, fontVariant: ["tabular-nums"] },
  emptyState: { alignItems: "center", paddingHorizontal: 32, paddingTop: 56, gap: 10 },
  emptyIcon: { width: 70, height: 70, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: "#10263B", borderWidth: 1, borderColor: "#1A526C", marginBottom: 4 },
  emptyTitle: { color: colors.text, fontSize: 18, lineHeight: 26, fontWeight: "800", textAlign: "center" },
  emptyDescription: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: "center" },
  primaryButton: { minHeight: 46, paddingHorizontal: 20, borderRadius: 14, backgroundColor: colors.cyan, alignItems: "center", justifyContent: "center", marginTop: 10 },
  primaryButtonText: { color: colors.background, fontSize: 14, lineHeight: 20, fontWeight: "800" },
});
