import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Artwork, colors } from "@/components/remo-ui";
import { usePlayer } from "@/lib/player-context";

/** Hide the floating mini-player while any full-screen player route is active so it never covers the video surface. */
function isFullScreenPlayerRoute(pathname: string | null | undefined) {
  if (!pathname) return false;
  return pathname === "/player/video"
    || pathname === "/player/audio"
    || pathname.startsWith("/player/video")
    || pathname.startsWith("/player/audio")
    || pathname.startsWith("/player/edit-")
    || pathname.startsWith("/player/lyrics")
    || pathname.startsWith("/player/equalizer");
}

export function MiniPlayer() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentItem, isPlaying, togglePlayback, miniPlayerVisible, dismissMiniPlayer, playNext, playPrevious } = usePlayer();

  if (!currentItem || !miniPlayerVisible) return null;
  if (isFullScreenPlayerRoute(pathname)) return null;

  return (
    <View style={styles.shell} pointerEvents="box-none">
      <Pressable onPress={() => router.push(currentItem.mediaType === "video" ? "/player/video" : "/player/audio")} style={({ pressed }) => [styles.details, pressed && styles.pressed]}>
        <Artwork item={currentItem} size={42} />
        <View style={styles.textWrap}>
          <Text numberOfLines={1} style={styles.title}>{currentItem.title}</Text>
          <Text numberOfLines={1} style={styles.artist}>{currentItem.artist || (currentItem.mediaType === "video" ? "فيديو محلي" : "موسيقى محلية")}</Text>
        </View>
      </Pressable>
      <View style={styles.controlsCluster}>
        <Pressable onPress={() => void playPrevious()} hitSlop={8} style={({ pressed }) => [styles.navButton, pressed && styles.pressed]} accessibilityLabel="المسار السابق">
          <MaterialIcons name="skip-previous" size={24} color={colors.text} />
        </Pressable>
        <Pressable onPress={togglePlayback} hitSlop={10} style={({ pressed }) => [styles.playButton, pressed && styles.pressed]} accessibilityLabel={isPlaying ? "إيقاف مؤقت" : "تشغيل"}>
          <MaterialIcons name={isPlaying ? "pause" : "play-arrow"} size={26} color={colors.text} />
        </Pressable>
        <Pressable onPress={() => void playNext()} hitSlop={8} style={({ pressed }) => [styles.navButton, pressed && styles.pressed]} accessibilityLabel="المسار التالي">
          <MaterialIcons name="skip-next" size={24} color={colors.text} />
        </Pressable>
        <Pressable onPress={dismissMiniPlayer} hitSlop={10} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]} accessibilityLabel="إغلاق المشغل المصغر">
          <MaterialIcons name="close" size={19} color={colors.muted} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { position: "absolute", left: 12, right: 12, bottom: 76, minHeight: 62, borderRadius: 18, flexDirection: "row-reverse", alignItems: "center", padding: 9, backgroundColor: "#142741", borderWidth: 1, borderColor: "#285273", shadowColor: "#000", shadowOpacity: 0.28, shadowRadius: 16, elevation: 12 },
  details: { flex: 1, flexDirection: "row-reverse", alignItems: "center", gap: 10 },
  textWrap: { flex: 1, alignItems: "flex-end" },
  title: { color: colors.text, fontSize: 13, lineHeight: 18, fontWeight: "800", textAlign: "right" },
  artist: { color: colors.muted, fontSize: 11, lineHeight: 16, textAlign: "right" },
  closeButton: { width: 30, height: 30, alignItems: "center", justifyContent: "center", marginLeft: 2 },
  controlsCluster: { flexDirection: "row-reverse", alignItems: "center", gap: 3 },
  navButton: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  playButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#243D60", alignItems: "center", justifyContent: "center" },
  pressed: { opacity: 0.65 },
});