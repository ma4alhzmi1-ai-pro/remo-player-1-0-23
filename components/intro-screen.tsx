import { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";

import { colors } from "@/components/remo-ui";

export function IntroScreen({ onComplete }: { onComplete: () => void }) {
  const motion = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(onComplete, 2200);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(motion, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(motion, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [motion]);

  const imageStyle = {
    opacity: motion.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] }),
    transform: [{ scale: motion.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.02] }) }],
  };
  const glowStyle = {
    opacity: motion.interpolate({ inputRange: [0, 1], outputRange: [0.48, 1] }),
    transform: [{ scale: motion.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.08] }) }],
  };

  return <View style={styles.container}>
    <Animated.View style={[styles.glow, glowStyle]} pointerEvents="none" />
    <View style={styles.center}>
      <Animated.View style={imageStyle}><Image source={require("@/assets/images/icon.png")} style={styles.logo} resizeMode="cover" /></Animated.View>
      <Text style={styles.title}>REMO PLAYER</Text>
      <Text style={styles.tagline}>مشغل الموسيقى والفيديو المحلي</Text>
    </View>
    <View style={styles.footer}>
      <Text style={styles.hint}>جاري التشغيل الآمن...</Text>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#030A12" },
  glow: { position: "absolute", width: 420, height: 420, borderRadius: 210, backgroundColor: "rgba(19, 125, 160, 0.16)", top: "17%", alignSelf: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 13, paddingBottom: 38 },
  logo: { width: 112, height: 112, borderRadius: 30, borderWidth: 1, borderColor: "rgba(255,255,255,0.20)" },
  title: { color: colors.text, fontSize: 28, fontWeight: "900", letterSpacing: 1.8 },
  tagline: { color: "rgba(244,248,255,0.62)", fontSize: 14, fontWeight: "600" },
  footer: { position: "absolute", bottom: 38, left: 20, right: 20, alignItems: "center" },
  hint: { color: "rgba(244,248,255,0.72)", fontSize: 12, fontWeight: "900", letterSpacing: 1.4 },
});
