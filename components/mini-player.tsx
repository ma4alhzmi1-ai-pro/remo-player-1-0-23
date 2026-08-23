import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Artwork, colors } from "@/components/remo-ui";
import { usePlayer } from "@/lib/player-context";

export function MiniPlayer() {
  const router = useRouter();
  const { currentItem, isPlaying, togglePlayback } = usePlayer();

  if (!currentItem || currentItem.mediaType === "video") return null;

  return (
    <View style={styles.shell}>
      <Pressable onPress={() => router.push("/player/audio")} style={({ pressed }) => [styles.details, pressed && styles.pressed]}>
        <Artwork item={currentItem} size={42} />
        <View style={styles.textWrap}>
          <Text numberOfLines={1} style={styles.title}>{currentItem.title}</Text>
          <Text numberOfLines={1} style={styles.artist}>{currentItem.artist}</Text>
        </View>
      </Pressable>
      <Pressable onPress={togglePlayback} hitSlop={12} style={({ pressed }) => [styles.playButton, pressed && styles.pressed]}>
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
  playButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#243D60", alignItems: "center", justifyContent: "center", marginRight: 4 },
  pressed: { opacity: 0.65 },
});
