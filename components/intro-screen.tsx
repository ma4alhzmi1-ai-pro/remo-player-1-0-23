import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";

import { colors } from "@/components/remo-ui";

export function IntroScreen({ onComplete }: { onComplete: () => void }) {
  const player = useVideoPlayer(require("@/assets/video/remo-intro.mp4"), (videoPlayer) => {
    videoPlayer.loop = false;
    videoPlayer.play();
  });

  useEffect(() => {
    const subscription = player.addListener("playToEnd", onComplete);
    return () => subscription.remove();
  }, [onComplete, player]);

  return <View style={styles.container}>
    <VideoView style={styles.video} player={player} nativeControls={false} contentFit="cover" surfaceType="textureView" />
    <View style={styles.fade} pointerEvents="none" />
    <View style={styles.footer} pointerEvents="box-none">
      <Text style={styles.hint}>REMO PLAYER</Text>
      <Pressable onPress={onComplete} style={({ pressed }) => [styles.skip, pressed && styles.dimmed]}>
        <Text style={styles.skipText}>تخطي</Text><MaterialIcons name="arrow-back" size={18} color={colors.text} />
      </Pressable>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#030A12" },
  video: { ...StyleSheet.absoluteFillObject },
  fade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(2, 10, 18, 0.1)" },
  footer: { position: "absolute", bottom: 38, left: 20, right: 20, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" },
  hint: { color: "rgba(244,248,255,0.72)", fontSize: 12, fontWeight: "900", letterSpacing: 1.4 },
  skip: { minHeight: 38, paddingHorizontal: 13, borderRadius: 19, backgroundColor: "rgba(5,18,31,0.68)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", flexDirection: "row-reverse", alignItems: "center", gap: 5 },
  skipText: { color: colors.text, fontSize: 12, fontWeight: "800" },
  dimmed: { opacity: 0.65 },
});
