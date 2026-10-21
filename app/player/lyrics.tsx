import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { colors } from "@/components/remo-ui";
import { ScreenContainer } from "@/components/screen-container";
import { usePlayer } from "@/lib/player-context";

export default function LyricsScreen() {
  const router = useRouter();
  const { currentItem } = usePlayer();
  if (!currentItem || currentItem.mediaType !== "audio") return <ScreenContainer><View style={styles.empty}><Text style={styles.emptyText}>اختر أغنية أولاً.</Text></View></ScreenContainer>;
  return <ScreenContainer edges={["top", "bottom", "left", "right"]}><View style={styles.header}><Pressable onPress={() => router.back()} style={styles.backButton}><MaterialIcons name="arrow-forward" size={24} color={colors.text} /></Pressable><View style={styles.titleWrap}><Text numberOfLines={1} style={styles.title}>{currentItem.title}</Text><Text numberOfLines={1} style={styles.artist}>{currentItem.artist}</Text></View></View><ScrollView contentContainerStyle={styles.content}>{currentItem.lyrics ? <Text style={styles.lyrics}>{currentItem.lyrics}</Text> : <View style={styles.emptyLyrics}><MaterialIcons name="lyrics" size={38} color={colors.cyan} /><Text style={styles.emptyTitle}>لا توجد كلمات مضافة</Text><Text style={styles.emptyDescription}>افتح «تحرير الأغنية» من المشغل وألصق الكلمات لتظهر هنا أثناء الاستماع.</Text><Pressable onPress={() => router.push("/player/edit-audio" as never)} style={styles.editButton}><Text style={styles.editText}>إضافة الكلمات</Text></Pressable></View>}</ScrollView></ScreenContainer>;
}
const styles = StyleSheet.create({ header: { minHeight: 64, paddingHorizontal: 16, flexDirection: "row-reverse", alignItems: "center", gap: 10 }, backButton: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" }, titleWrap: { flex: 1, alignItems: "flex-end" }, title: { color: colors.text, fontSize: 16, lineHeight: 22, fontWeight: "900", textAlign: "right" }, artist: { color: colors.muted, fontSize: 12, lineHeight: 17, textAlign: "right" }, content: { paddingHorizontal: 28, paddingVertical: 26, paddingBottom: 45 }, lyrics: { color: colors.text, fontSize: 18, lineHeight: 34, textAlign: "center" }, emptyLyrics: { alignItems: "center", paddingTop: 84 }, emptyTitle: { color: colors.text, fontSize: 18, fontWeight: "900", marginTop: 14 }, emptyDescription: { color: colors.muted, fontSize: 13, lineHeight: 21, textAlign: "center", marginTop: 6 }, editButton: { minHeight: 45, paddingHorizontal: 18, borderRadius: 14, backgroundColor: colors.cyan, alignItems: "center", justifyContent: "center", marginTop: 18 }, editText: { color: colors.background, fontSize: 13, fontWeight: "900" }, empty: { flex: 1, alignItems: "center", justifyContent: "center" }, emptyText: { color: colors.muted } });
