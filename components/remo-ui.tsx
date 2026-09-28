import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export const colors = {
  background: "#10161F",
  surface: "#182432",
  raised: "#233246",
  line: "#31445C",
  text: "#F3F7FC",
  muted: "#A8BDD2",
  sky: "#5CC8FF",
  violet: "#B997FF",
  gold: "#D5AE55",
  rose: "#F9ACD4",
  green: "#79D9B4",
  danger: "#FF9B9B",
};

export function Surface({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.surface, style]}>{children}</View>;
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHead}>
      {action ? <Pressable onPress={onAction} hitSlop={10}><Text style={styles.sectionAction}>{action}</Text></Pressable> : <View />}
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

export function IconTile({ icon, label, caption, tint = colors.sky, onPress }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; caption?: string; tint?: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.iconTile, pressed && styles.pressed]}>
      <View style={[styles.iconCircle, { backgroundColor: `${tint}22` }]}><MaterialIcons name={icon} size={23} color={tint} /></View>
      <View style={styles.tileText}><Text style={styles.tileLabel}>{label}</Text>{caption ? <Text style={styles.tileCaption}>{caption}</Text> : null}</View>
    </Pressable>
  );
}

export function PrimaryButton({ label, icon, onPress, quiet = false }: { label: string; icon?: keyof typeof MaterialIcons.glyphMap; onPress?: () => void; quiet?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.primaryButton, quiet && styles.quietButton, pressed && styles.pressed]}>
      {icon ? <MaterialIcons name={icon} size={20} color={quiet ? colors.sky : colors.background} /> : null}
      <Text style={[styles.primaryLabel, quiet && styles.quietLabel]}>{label}</Text>
    </Pressable>
  );
}

export function SettingRow({ icon, title, subtitle, tint = colors.sky, children, onPress }: { icon: keyof typeof MaterialIcons.glyphMap; title: string; subtitle?: string; tint?: string; children?: ReactNode; onPress?: () => void }) {
  const body = <>
    <View style={styles.settingIcon}><MaterialIcons name={icon} size={23} color={tint} /></View>
    <View style={styles.settingCopy}><Text style={styles.settingTitle}>{title}</Text>{subtitle ? <Text style={styles.settingSubtitle}>{subtitle}</Text> : null}</View>
    {children ?? <MaterialIcons name="chevron-left" size={24} color={colors.muted} />}
  </>;
  return onPress ? <Pressable onPress={onPress} style={({ pressed }) => [styles.settingRow, pressed && styles.pressed]}>{body}</Pressable> : <View style={styles.settingRow}>{body}</View>;
}

const styles = StyleSheet.create({
  surface: { backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.line, padding: 16 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.985 }] },
  sectionHead: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginTop: 22, marginBottom: 10 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "800", textAlign: "right" },
  sectionAction: { color: colors.sky, fontSize: 14, fontWeight: "700" },
  iconTile: { minHeight: 70, flexDirection: "row-reverse", alignItems: "center", gap: 12, paddingHorizontal: 13, paddingVertical: 10, backgroundColor: colors.surface, borderRadius: 17, borderWidth: 1, borderColor: colors.line },
  iconCircle: { width: 43, height: 43, alignItems: "center", justifyContent: "center", borderRadius: 14 },
  tileText: { flex: 1 },
  tileLabel: { color: colors.text, fontSize: 15, fontWeight: "800", textAlign: "right" },
  tileCaption: { color: colors.muted, marginTop: 3, fontSize: 12, textAlign: "right" },
  primaryButton: { minHeight: 48, paddingHorizontal: 17, borderRadius: 14, backgroundColor: colors.sky, flexDirection: "row-reverse", gap: 8, alignItems: "center", justifyContent: "center" },
  quietButton: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.sky },
  primaryLabel: { color: colors.background, fontSize: 15, fontWeight: "900" },
  quietLabel: { color: colors.sky },
  settingRow: { minHeight: 68, paddingVertical: 10, flexDirection: "row-reverse", alignItems: "center", gap: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  settingIcon: { width: 28, alignItems: "center" },
  settingCopy: { flex: 1 },
  settingTitle: { color: colors.text, fontWeight: "800", fontSize: 16, textAlign: "right" },
  settingSubtitle: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 2, textAlign: "right" },
});
