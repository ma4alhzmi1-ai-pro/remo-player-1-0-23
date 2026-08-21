import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useState } from "react";
import { Image, Modal, StyleSheet, Text, View } from "react-native";

import { colors } from "@/components/remo-ui";

export function DeveloperCreditToast() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
    <View style={styles.backdrop} pointerEvents="none">
      <View style={styles.card}>
        <Image source={require("@/assets/images/icon.png")} style={styles.icon} />
        <View style={styles.copy}>
          <View style={styles.badge}><MaterialIcons name="verified" size={15} color={colors.cyan} /><Text style={styles.badgeText}>REMO PLAYER</Text></View>
          <Text style={styles.message}>هذا التطبيق من برمجة وتطوير المطور محمد الحزمي</Text>
        </View>
      </View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: "center", justifyContent: "center", padding: 26, backgroundColor: "rgba(1, 8, 16, 0.72)" },
  card: { width: "100%", maxWidth: 360, minHeight: 142, padding: 18, borderRadius: 25, backgroundColor: "#102035", borderWidth: 1, borderColor: "#287CA2", flexDirection: "row-reverse", alignItems: "center", gap: 14, shadowColor: "#000", shadowOpacity: 0.4, shadowRadius: 20, elevation: 10 },
  icon: { width: 78, height: 78, borderRadius: 20 },
  copy: { flex: 1, alignItems: "flex-end" },
  badge: { flexDirection: "row-reverse", gap: 4, alignItems: "center", marginBottom: 7 },
  badgeText: { color: colors.cyan, fontSize: 11, fontWeight: "900", letterSpacing: 0.4 },
  message: { color: colors.text, fontSize: 16, lineHeight: 25, fontWeight: "800", textAlign: "right" },
});
