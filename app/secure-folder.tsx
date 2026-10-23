import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";

import { colors, EmptyState, MediaRow } from "@/components/remo-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useLibrary } from "@/lib/library-context";
import { usePlayer } from "@/lib/player-context";
import type { MediaItem } from "@/types/media";

export default function SecureFolderScreen() {
  const router = useRouter();
  const { items, secureItemIds, hasSecurePin, setSecurePin, verifySecurePin, importSecureFiles, hideSecureFolder, setHideSecureFolder } = useLibrary();
  const { playItem, currentItem, isPlaying } = usePlayer();
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const secureItems = useMemo(() => items.filter((item) => secureItemIds.includes(item.id)), [items, secureItemIds]);

  const submitPin = async () => {
    if (!hasSecurePin) {
      if (!(await setSecurePin(pin))) { Alert.alert("رمز غير صالح", "استخدم رمزًا رقميًا من 4 إلى 8 أرقام."); return; }
      setUnlocked(true); setPin(""); return;
    }
    if (await verifySecurePin(pin)) { setUnlocked(true); setPin(""); } else Alert.alert("رمز غير صحيح", "تحقق من الرمز وحاول مرة أخرى.");
  };
  const openItem = async (item: MediaItem) => { await playItem(item, secureItems); router.push((item.mediaType === "video" ? "/player/video" : "/player/audio") as never); };

  if (!unlocked) return <ScreenContainer><View style={styles.lockHeader}><Pressable onPress={() => router.back()} style={styles.iconButton}><MaterialIcons name="arrow-forward" size={24} color={colors.text} /></Pressable><MaterialIcons name="lock" size={48} color={colors.cyan} /><Text style={styles.title}>{hasSecurePin ? "المجلد الآمن" : "إنشاء المجلد الآمن"}</Text><Text style={styles.subtitle}>{hasSecurePin ? "أدخل رمز PIN لعرض الملفات المخفية." : "أنشئ رمز PIN لحماية الملفات الخاصة."}</Text><TextInput value={pin} onChangeText={setPin} keyboardType="number-pad" maxLength={8} secureTextEntry style={styles.pinInput} placeholder="رمز PIN" placeholderTextColor={colors.muted} textAlign="center" /><Pressable onPress={() => void submitPin()} style={styles.primaryButton}><Text style={styles.primaryText}>{hasSecurePin ? "فتح المجلد" : "إنشاء وحماية"}</Text></Pressable></View></ScreenContainer>;

  return <ScreenContainer className="px-0"><View style={styles.header}><Pressable onPress={() => { setUnlocked(false); setPin(""); }} style={styles.iconButton}><MaterialIcons name="lock-open" size={22} color={colors.cyan} /></Pressable><View style={styles.headerCopy}><Text style={styles.title}>المجلد الآمن</Text><Text style={styles.subtitle}>{secureItems.length} ملف محفوظ</Text></View><Pressable onPress={() => router.back()} style={styles.iconButton}><MaterialIcons name="arrow-forward" size={24} color={colors.text} /></Pressable></View><View style={styles.options}><View style={styles.optionCopy}><Text style={styles.optionTitle}>إخفاء من المكتبة العامة</Text><Text style={styles.optionDescription}>لا تظهر الملفات الآمنة في الفيديو والموسيقى والبحث المحلي.</Text></View><Switch value={hideSecureFolder} onValueChange={(value) => void setHideSecureFolder(value)} trackColor={{ false: "#34485A", true: "#247B9D" }} thumbColor={hideSecureFolder ? colors.cyan : "#CBD5E1"} /></View><Pressable onPress={async () => { const count = await importSecureFiles(); if (count) Alert.alert("تمت الإضافة", `تم حفظ ${count} ملف داخل المجلد الآمن.`); }} style={styles.importButton}><MaterialIcons name="add" size={21} color={colors.background} /><Text style={styles.importText}>إضافة ملفات إلى المجلد الآمن</Text></Pressable><FlatList data={secureItems} keyExtractor={(item) => item.id} renderItem={({ item }) => <MediaRow item={item} isCurrent={Boolean(currentItem && currentItem.id === item.id)} isPlaying={isPlaying} onPress={() => void openItem(item)} />} ListEmptyComponent={<EmptyState icon="lock" title="المجلد الآمن فارغ" description="أضف ملفات من زر الإضافة، وستُخفى عن المكتبة العامة." />} contentContainerStyle={styles.list} /></ScreenContainer>;
}

const styles = StyleSheet.create({ lockHeader: { flex: 1, alignItems: "center", justifyContent: "center", padding: 26, gap: 14 }, iconButton: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface }, title: { color: colors.text, fontSize: 22, fontWeight: "900", textAlign: "right" }, subtitle: { color: colors.muted, fontSize: 12, lineHeight: 19, textAlign: "center" }, pinInput: { width: 220, height: 54, borderRadius: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, color: colors.text, fontSize: 22, letterSpacing: 8 }, primaryButton: { minWidth: 220, minHeight: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.cyan }, primaryText: { color: colors.background, fontWeight: "900" }, header: { minHeight: 70, paddingHorizontal: 16, flexDirection: "row-reverse", alignItems: "center", gap: 12 }, headerCopy: { flex: 1, alignItems: "flex-end" }, options: { marginHorizontal: 16, padding: 14, borderRadius: 17, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flexDirection: "row-reverse", alignItems: "center", gap: 12 }, optionCopy: { flex: 1, alignItems: "flex-end" }, optionTitle: { color: colors.text, fontSize: 14, fontWeight: "900", textAlign: "right" }, optionDescription: { color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: "right", marginTop: 3 }, importButton: { margin: 16, minHeight: 48, borderRadius: 14, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 7, backgroundColor: colors.cyan }, importText: { color: colors.background, fontWeight: "900", fontSize: 13 }, list: { paddingBottom: 90 },
});
