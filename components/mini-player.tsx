import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Artwork, colors } from "@/components/remo-ui";
import { usePlayer } from "@/lib/player-context";
import { shouldRenderMiniPlayer } from "@/lib/mini-player-policy";

export function MiniPlayer() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentItem, isPlaying, togglePlayback, miniPlayerVisible, dismissMiniPlayer } = usePlayer();

  if (!shouldRenderMiniPlayer({ hasCurrentItem: Boolean(currentItem), enabled: miniPlayerVisible, pathname }) || !currentItem) return null;

  return (
    <View style={styles.shell}>
      <Pressable
        onPress={() => router.push(currentItem.mediaType === "video" ? "/player/video" : "/player/audio")}
        style={({ pressed }) => [styles.details, pressed && styles.pressed]}
        accessibilityLabel="العودة إلى المشغل"
      >
        <Artwork item={currentItem} size={42} />
        <View style={styles.textWrap}>
          <Text numberOfLines={1} style={styles.title}>{currentItem.title}</Text>
          <Text numberOfLines={1} style={styles.artist}>{currentItem.artist}</Text>
        </View>
      </Pressable>
      <Pressable
        onPress={dismissMiniPlayer}
        hitSlop={12}
        style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
        accessibilityLabel="إغلاق المشغل المصغر"
      >
        <MaterialIcons name="close" size={21} color={colors.muted} />
      </Pressable>
      <Pressable
        onPress={togglePlayback}
        hitSlop={12}
        style={({ pressed }) => [styles.playButton, pressed && styles.pressed]}
        accessibilityLabel={isPlaying ? "إيقاف التشغيل" : "استئناف التشغيل"}
      >
        <MaterialIcons name={isPlaying ? "pause" : "play-arrow"} size={28} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { position: "absolute", left: 12, right: 12, bottom: 76, minHeight: 62, borderRadius: 18, flexDirection: "row-reverse", alignItems: "center", padding: 9, backgroundColor: "#142741", borderWidth: 1, borderColor: "#285273", shadowColor: "#000", shadowOpacity: 0.28, shadowRadius: 16, elevation: 12 },
  details: { flex: 1, flexDirection: "row-reverse", alignItems: "center", gap: 10 },
  textWrap: { flex: 1, alignItems: "flex-end" },
  title: { color: colors.text, fontSize: 13, lineHeight: 18, fontWeight: "800", textAlign: "right" },
  artist: { color: colors.muted, fontSize: 11, lineHeight: 16, textAlign: "right" },
  closeButton: { width: 32, height: 32, alignItems: "center", justifyContent: "center", marginLeft: 2 },
  playButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#243D60", alignItems: "center", justifyContent: "center", marginRight: 4 },
  pressed: { opacity: 0.65 },
});
