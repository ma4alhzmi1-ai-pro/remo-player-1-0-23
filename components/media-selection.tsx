import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/components/remo-ui";

export function SelectionToolbar({
  count,
  onClose,
  onShare,
  onDelete,
}: {
  count: number;
  onClose: () => void;
  onShare: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.toolbar}>
      <Pressable onPress={onClose} style={styles.toolbarButton} accessibilityLabel="إلغاء التحديد">
        <MaterialIcons name="close" size={22} color={colors.text} />
      </Pressable>
      <Text style={styles.count}>{count} محدد</Text>
      <View style={styles.actions}>
        <Pressable onPress={onShare} style={styles.action} accessibilityLabel="مشاركة الملفات المحددة">
          <MaterialIcons name="share" size={21} color={colors.cyan} />
          <Text style={styles.actionText}>مشاركة</Text>
        </Pressable>
        <Pressable onPress={onDelete} style={styles.action} accessibilityLabel="حذف الملفات المحددة">
          <MaterialIcons name="delete-outline" size={22} color="#FF8A9B" />
          <Text style={[styles.actionText, styles.deleteText]}>حذف</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: { minHeight: 62, paddingHorizontal: 14, flexDirection: "row-reverse", alignItems: "center", gap: 12, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  toolbarButton: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: colors.surfaceAlt },
  count: { flex: 1, color: colors.text, fontSize: 16, fontWeight: "900", textAlign: "right" },
  actions: { flexDirection: "row-reverse", alignItems: "center", gap: 10 },
  action: { minWidth: 54, alignItems: "center", justifyContent: "center", gap: 2 },
  actionText: { color: colors.cyan, fontSize: 10, fontWeight: "900" },
  deleteText: { color: "#FF8A9B" },
});
