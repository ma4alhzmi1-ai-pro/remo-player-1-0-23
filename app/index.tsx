import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { colors } from "@/components/remo-ui";

export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.topGlow} />
      <View style={styles.content}>
        <Image source={require("@/assets/images/developer-welcome.png")} style={styles.developerImage} contentFit="contain" accessibilityLabel="هوية المطور محمد الحزمي" />
        <View style={styles.copy}>
          <Text style={styles.badge}>ريموكيبورد مزخرف</Text>
          <Text style={styles.title}>اكتب بطريقتك</Text>
          <Text style={styles.subtitle}>لوحة مفاتيح عربية خفيفة للزخرفة والثيمات والكتابة السريعة.</Text>
        </View>
        <Pressable onPress={() => router.replace("/(tabs)" as never)} style={({ pressed }) => [styles.enter, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="الدخول إلى التطبيق">
          <MaterialIcons name="arrow-back" size={22} color={colors.background} />
          <Text style={styles.enterText}>الدخول إلى ريموكيبورد</Text>
        </Pressable>
        <Text style={styles.credit}>برمجة وتطوير المطور محمد الحزمي · 2026</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#050607", overflow: "hidden" },
  topGlow: { position: "absolute", top: -120, left: -100, right: -100, height: 320, backgroundColor: "#6E4B1422", borderRadius: 260 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 48, paddingBottom: 34, justifyContent: "space-between" },
  developerImage: { width: "100%", height: "48%", alignSelf: "center" },
  copy: { alignItems: "center", marginTop: -18 },
  badge: { color: "#E7BE64", fontWeight: "800", fontSize: 13, letterSpacing: 0.5 },
  title: { color: colors.text, fontSize: 31, fontWeight: "900", textAlign: "center", marginTop: 9 },
  subtitle: { color: "#BFCADA", fontSize: 14, lineHeight: 22, textAlign: "center", marginTop: 9, maxWidth: 300 },
  enter: { backgroundColor: "#E7BE64", minHeight: 54, borderRadius: 17, alignItems: "center", justifyContent: "center", flexDirection: "row-reverse", gap: 9, shadowColor: "#E7BE64", shadowOpacity: 0.28, shadowOffset: { width: 0, height: 8 }, shadowRadius: 18, elevation: 6 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  enterText: { color: "#10161F", fontSize: 16, fontWeight: "900" },
  credit: { color: "#8492A3", fontSize: 11, textAlign: "center", marginTop: 13 },
});
