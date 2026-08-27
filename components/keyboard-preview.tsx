import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Page = "arabic" | "numbers" | "emoji";

type KeyboardPreviewProps = { onInput: (value: string) => void; onDelete: () => void; theme?: "navy" | "rose" | "ramadan" | "light" };

const arabicRows = [
  ["ض", "ص", "ث", "ق", "ف", "غ", "ع", "ه", "خ", "ح", "ج"],
  ["ش", "س", "ي", "ب", "ل", "ا", "ت", "ن", "م", "ك", "ط"],
  ["⇧", "ئ", "ء", "ؤ", "ر", "لا", "ى", "ة", "و", "ز", "ظ", "⌫"],
];
const numberRows = [
  ["١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩", "٠"],
  ["@", "#", "$", "%", "&", "*", "-", "+", "(", ")"],
  ["!", "؟", "،", "؛", "«", "»", "[", "]", "⌫"],
];
const emojiRows = [
  ["😀", "🥹", "😍", "🫶", "🔥", "✨", "❤️", "🙏"],
  ["😂", "😊", "😎", "🤍", "🌙", "⭐", "🎉", "💡"],
];

const palettes = {
  navy: { base: "#10161F", key: "#2A3A50", special: "#37516F", text: "#F3F7FC", accent: "#5CC8FF" },
  rose: { base: "#35192D", key: "#693557", special: "#974979", text: "#FFF8FC", accent: "#F9ACD4" },
  ramadan: { base: "#162625", key: "#314F49", special: "#6C5126", text: "#FCF7E6", accent: "#D5AE55" },
  light: { base: "#EAF3FA", key: "#FFFFFF", special: "#BFDCF2", text: "#162330", accent: "#0077BE" },
};

export function KeyboardPreview({ onInput, onDelete, theme = "navy" }: KeyboardPreviewProps) {
  const [page, setPage] = useState<Page>("arabic");
  const [longPress, setLongPress] = useState<"ة" | "ت" | null>(null);
  const palette = palettes[theme];
  const rows = useMemo(() => page === "arabic" ? arabicRows : page === "numbers" ? numberRows : emojiRows, [page]);
  const alternatives = longPress === "ة" ? ["َ", "ً", "ُ", "ٌ", "ِ", "ٍ", "ْ", "ّ", "ٰ"] : ["ـ", "تـ", "ـت", "ۃ"];

  const action = (key: string) => {
    if (key === "⌫") return onDelete();
    if (key === "⇧") return;
    onInput(key);
  };

  return (
    <View style={[styles.wrap, { backgroundColor: palette.base }]}> 
      <View style={styles.suggestions}><Text style={[styles.suggestion, { color: palette.text }]}>ريمو</Text><Text style={[styles.suggestion, { color: palette.text }]}>مرحبا</Text><Text style={[styles.suggestion, { color: palette.text }]}>شكراً</Text></View>
      <View style={styles.tools}><Text style={[styles.tool, { color: palette.accent }]}>◎ إيموجي</Text><Text style={[styles.tool, { color: palette.accent }]}>✧ زخرفة</Text><Text style={[styles.tool, { color: palette.accent }]}>▣ الحافظة</Text><Text style={[styles.tool, { color: palette.accent }]}>◉ صوت</Text></View>
      {longPress ? <View style={[styles.alternatives, { backgroundColor: palette.special }]}>{alternatives.map((value) => <Pressable key={value} onPress={() => { onInput(value); setLongPress(null); }} style={[styles.alt, { backgroundColor: palette.key }]}><Text style={[styles.keyText, { color: palette.text }]}>{value}</Text></Pressable>)}</View> : null}
      {rows.map((row, rowIndex) => <View key={`${page}-${rowIndex}`} style={styles.keyRow}>{row.map((key) => <Pressable key={key} onLongPress={() => (key === "ة" || key === "ت") && setLongPress(key)} onPress={() => action(key)} style={({ pressed }) => [styles.key, { backgroundColor: ["⌫", "⇧"].includes(key) ? palette.special : palette.key }, pressed && { opacity: 0.7 }]}><Text style={[styles.keyText, { color: palette.text }]}>{key}</Text></Pressable>)}</View>)}
      <View style={styles.keyRow}>
        <Pressable onPress={() => setPage(page === "numbers" ? "arabic" : "numbers")} style={[styles.bottomKey, { backgroundColor: palette.special }]}><Text style={[styles.bottomText, { color: palette.text }]}>{page === "numbers" ? "أ ب ت" : "123"}</Text></Pressable>
        <Pressable onPress={() => setPage(page === "emoji" ? "arabic" : "emoji")} style={[styles.bottomKey, { backgroundColor: palette.special }]}><Text style={[styles.bottomText, { color: palette.text }]}>◎</Text></Pressable>
        <Pressable onPress={() => onInput(" ")} style={[styles.spaceKey, { backgroundColor: palette.key }]}><Text style={[styles.bottomText, { color: palette.text }]}>العربية</Text></Pressable>
        <Pressable onPress={() => onInput("\n")} style={[styles.bottomKey, { backgroundColor: palette.special }]}><Text style={[styles.bottomText, { color: palette.text }]}>↵</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 18, padding: 7, overflow: "hidden" },
  suggestions: { height: 31, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-around" },
  suggestion: { fontSize: 13, fontWeight: "700" },
  tools: { height: 32, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-around", borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#ffffff26" },
  tool: { fontSize: 11, fontWeight: "700" },
  keyRow: { flexDirection: "row-reverse", gap: 4, marginTop: 5 },
  key: { flex: 1, minHeight: 41, alignItems: "center", justifyContent: "center", borderRadius: 7 },
  keyText: { fontSize: 18, fontWeight: "800" },
  bottomKey: { minHeight: 42, minWidth: 43, paddingHorizontal: 8, alignItems: "center", justifyContent: "center", borderRadius: 7 },
  spaceKey: { flex: 1, minHeight: 42, alignItems: "center", justifyContent: "center", borderRadius: 7 },
  bottomText: { fontSize: 14, fontWeight: "800" },
  alternatives: { flexDirection: "row-reverse", gap: 4, borderRadius: 10, padding: 5, marginTop: 5 },
  alt: { flex: 1, minHeight: 37, borderRadius: 6, alignItems: "center", justifyContent: "center" },
});
