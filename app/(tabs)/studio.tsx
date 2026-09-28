import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { colors, PrimaryButton, SectionTitle, Surface } from "@/components/remo-ui";
import { decorateText, emojiGroups, loadClipboard, loadSettings, loadStickers, rememberClipboardText, saveClipboard, saveStickers, type ClipboardEntry, type RemoSettings, type StickerDraft } from "@/lib/remo-storage";

type StudioTab = "decorate" | "clipboard" | "stickers";

export default function StudioScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const initialTab: StudioTab = params.tab === "clipboard" ? "clipboard" : "decorate";
  const [tab, setTab] = useState<StudioTab>(initialTab);
  const [text, setText] = useState("ريموكيبورد");
  const [clipboard, setClipboard] = useState<ClipboardEntry[]>([]);
  const [stickers, setStickers] = useState<StickerDraft[]>([]);
  const [settings, setSettings] = useState<RemoSettings | null>(null);
  const [stickerEmoji, setStickerEmoji] = useState("✨");
  const [stickerText, setStickerText] = useState("صباح الخير");

  const refresh = useCallback(() => { Promise.all([loadClipboard(), loadStickers(), loadSettings()]).then(([c, s, st]) => { setClipboard(c); setStickers(s); setSettings(st); }); }, []);
  useEffect(() => { refresh(); }, [refresh]);
  const decorations = useMemo(() => decorateText(text), [text]);
  const copy = async (value: string) => { await Clipboard.setStringAsync(value); setClipboard(await rememberClipboardText(value, settings?.clipboardLimit ?? 30)); Alert.alert("تم النسخ", "يمكنك لصق النص أو اختياره من حافظة ريموكيبورد."); };
  const togglePinned = async (entry: ClipboardEntry) => { const next = clipboard.map((item) => item.id === entry.id ? { ...item, pinned: !item.pinned } : item); setClipboard(next); await saveClipboard(next); };
  const removeEntry = async (id: string) => { const next = clipboard.filter((entry) => entry.id !== id); setClipboard(next); await saveClipboard(next); };
  const createSticker = async () => { const clean = stickerText.trim(); if (!clean) return; const next = [{ id: `${Date.now()}`, text: clean, emoji: stickerEmoji, background: "#B997FF" }, ...stickers]; setStickers(next); await saveStickers(next); Alert.alert("تم حفظ الملصق", "حُفظ الملصق النصي في جهازك ويمكن نسخه واستخدامه من مركز ريموكيبورد."); };

  return <ScreenContainer className="px-5"><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    <Text style={styles.title}>استوديو ريمو</Text><Text style={styles.subtitle}>الزخرفة والحافظة والملصقات تعمل محليًا على جهازك.</Text>
    <View style={styles.tabs}>{([ ["decorate", "زخرفة"], ["clipboard", "حافظة"], ["stickers", "ملصقات"] ] as [StudioTab, string][]).map(([id, label]) => <Pressable key={id} onPress={() => setTab(id)} style={[styles.tab, tab === id && styles.activeTab]}><Text style={[styles.tabText, tab === id && styles.activeTabText]}>{label}</Text></Pressable>)}</View>
    {tab === "decorate" ? <Decorate text={text} setText={setText} decorations={decorations} copy={copy} /> : null}
    {tab === "clipboard" ? <ClipboardList entries={clipboard} copy={copy} onPin={togglePinned} onRemove={removeEntry} /> : null}
    {tab === "stickers" ? <Stickers stickers={stickers} stickerEmoji={stickerEmoji} setStickerEmoji={setStickerEmoji} stickerText={stickerText} setStickerText={setStickerText} create={createSticker} copy={copy} /> : null}
  </ScrollView></ScreenContainer>;
}

function Decorate({ text, setText, decorations, copy }: { text: string; setText: (value: string) => void; decorations: ReturnType<typeof decorateText>; copy: (value: string) => void }) {
  return <><SectionTitle title="حوّل النص" /><Surface><TextInput value={text} onChangeText={setText} placeholder="اكتب النص هنا" placeholderTextColor={colors.muted} style={styles.studioInput} textAlign="right" /><Text style={styles.inputHint}>نستخدم رموز Unicode قابلة للنسخ، من دون الاتصال بخادم.</Text></Surface><SectionTitle title="النتائج" />{decorations.map((item) => <Pressable onPress={() => copy(item.value)} key={item.id} style={({ pressed }) => [styles.decoration, pressed && { opacity: 0.7 }]}><MaterialIcons name="content-copy" size={19} color={colors.violet} /><View style={styles.decorationCopy}><Text style={styles.decorationTitle}>{item.title}</Text><Text style={styles.decorationValue}>{item.value}</Text></View></Pressable>)}</>;
}

function ClipboardList({ entries, copy, onPin, onRemove }: { entries: ClipboardEntry[]; copy: (value: string) => void; onPin: (entry: ClipboardEntry) => void; onRemove: (id: string) => void }) {
  return <><SectionTitle title="الحافظة المحفوظة" action={`${entries.length} عنصر`} />{entries.length === 0 ? <Surface style={styles.empty}><MaterialIcons name="content-paste" size={30} color={colors.muted} /><Text style={styles.emptyTitle}>الحافظة فارغة الآن</Text><Text style={styles.emptyText}>انسخ نصًا من المعاينة أو من أدوات الزخرفة لإضافته هنا.</Text></Surface> : entries.map((entry) => <Surface key={entry.id} style={styles.clipEntry}><View style={styles.clipActions}><Pressable onPress={() => onRemove(entry.id)} hitSlop={10}><MaterialIcons name="delete-outline" size={20} color={colors.danger} /></Pressable><Pressable onPress={() => onPin(entry)} hitSlop={10}><MaterialIcons name={entry.pinned ? "push-pin" : "push-pin"} size={20} color={entry.pinned ? colors.gold : colors.muted} /></Pressable><Pressable onPress={() => copy(entry.text)} hitSlop={10}><MaterialIcons name="content-copy" size={20} color={colors.sky} /></Pressable></View><Text numberOfLines={3} style={styles.clipText}>{entry.text}</Text><Text style={styles.clipMeta}>{entry.pinned ? "مثبّت" : "محفوظ محليًا"} · {entry.text.length} حرفًا</Text></Surface>)}</>;
}

function Stickers({ stickers, stickerEmoji, setStickerEmoji, stickerText, setStickerText, create, copy }: { stickers: StickerDraft[]; stickerEmoji: string; setStickerEmoji: (value: string) => void; stickerText: string; setStickerText: (value: string) => void; create: () => void; copy: (value: string) => void }) {
  return <><SectionTitle title="إنشاء ملصق نصي" /><Surface><TextInput value={stickerText} onChangeText={setStickerText} placeholder="نص الملصق" placeholderTextColor={colors.muted} style={styles.studioInput} textAlign="right" /><View style={styles.emojiRow}>{emojiGroups[0].values.map((emoji) => <Pressable key={emoji} onPress={() => setStickerEmoji(emoji)} style={[styles.emojiChoice, stickerEmoji === emoji && styles.emojiSelected]}><Text style={styles.emojiValue}>{emoji}</Text></Pressable>)}</View><PrimaryButton label="حفظ الملصق" icon="add-circle-outline" onPress={create} /></Surface><SectionTitle title="ملصقاتي" action={`${stickers.length} محفوظ`} />{stickers.length === 0 ? <Surface style={styles.empty}><MaterialIcons name="sticky-note-2" size={30} color={colors.muted} /><Text style={styles.emptyTitle}>أنشئ أول ملصق لك</Text><Text style={styles.emptyText}>سيبقى الملصق محفوظًا داخل التطبيق على هذا الجهاز.</Text></Surface> : <View style={styles.stickerGrid}>{stickers.map((item) => <Pressable key={item.id} onPress={() => copy(`${item.emoji} ${item.text}`)} style={[styles.sticker, { backgroundColor: item.background }]}><Text style={styles.stickerEmoji}>{item.emoji}</Text><Text style={styles.stickerText}>{item.text}</Text></Pressable>)}</View>}</>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 20, paddingBottom: 36 }, title: { color: colors.text, fontSize: 23, fontWeight: "900", textAlign: "right" }, subtitle: { color: colors.muted, textAlign: "right", marginTop: 6, fontSize: 13 },
  tabs: { flexDirection: "row-reverse", padding: 4, marginTop: 19, borderRadius: 15, backgroundColor: colors.surface, gap: 3 }, tab: { flex: 1, minHeight: 37, justifyContent: "center", alignItems: "center", borderRadius: 11 }, activeTab: { backgroundColor: colors.raised }, tabText: { color: colors.muted, fontSize: 13, fontWeight: "800" }, activeTabText: { color: colors.sky },
  studioInput: { color: colors.text, fontSize: 17, minHeight: 45, borderBottomWidth: 1, borderColor: colors.line, paddingVertical: 7 }, inputHint: { color: colors.muted, fontSize: 11, textAlign: "right", marginTop: 10, marginBottom: 13 },
  decoration: { minHeight: 72, flexDirection: "row-reverse", alignItems: "center", gap: 12, padding: 13, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.line, marginBottom: 9 }, decorationCopy: { flex: 1 }, decorationTitle: { color: colors.muted, fontSize: 12, textAlign: "right" }, decorationValue: { color: colors.text, fontSize: 18, fontWeight: "800", marginTop: 4, textAlign: "right" },
  empty: { minHeight: 160, justifyContent: "center", alignItems: "center", gap: 8 }, emptyTitle: { color: colors.text, fontWeight: "900", fontSize: 16 }, emptyText: { color: colors.muted, fontSize: 12, textAlign: "center", lineHeight: 19, paddingHorizontal: 12 },
  clipEntry: { marginBottom: 9 }, clipActions: { flexDirection: "row", gap: 17, justifyContent: "flex-end", marginBottom: 9 }, clipText: { color: colors.text, textAlign: "right", lineHeight: 20, fontSize: 14 }, clipMeta: { color: colors.muted, textAlign: "right", marginTop: 7, fontSize: 11 },
  emojiRow: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 7, marginVertical: 14 }, emojiChoice: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: colors.raised }, emojiSelected: { borderWidth: 2, borderColor: colors.sky }, emojiValue: { fontSize: 19 }, stickerGrid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 10 }, sticker: { width: "48%", minHeight: 111, borderRadius: 17, padding: 13, justifyContent: "space-between" }, stickerEmoji: { textAlign: "right", fontSize: 26 }, stickerText: { color: colors.background, fontWeight: "900", textAlign: "right", fontSize: 15 },
});
