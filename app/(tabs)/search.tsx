import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { colors, EmptyState, MediaRow } from "@/components/remo-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useLibrary } from "@/lib/library-context";
import { usePlayer } from "@/lib/player-context";
import type { MediaItem } from "@/types/media";

export default function SearchScreen() {
  const router = useRouter();
  const { items } = useLibrary();
  const { playItem } = usePlayer();
  const [query, setQuery] = useState("");
  const results = useMemo(() => { const needle = query.trim().toLocaleLowerCase("ar"); if (!needle) return []; return items.filter((item) => `${item.title} ${item.artist} ${item.album}`.toLocaleLowerCase("ar").includes(needle)); }, [items, query]);
  const openItem = async (item: MediaItem) => { await playItem(item, results.filter((result) => result.mediaType === item.mediaType)); router.push(item.mediaType === "video" ? "/player/video" as never : "/player/audio" as never); };
  return <ScreenContainer className="px-0"><View style={styles.header}><Text style={styles.title}>بحث</Text><View style={styles.searchBox}><MaterialIcons name="search" size={22} color={colors.muted} /><TextInput value={query} onChangeText={setQuery} placeholder="ابحث في مكتبتك" placeholderTextColor={colors.muted} returnKeyType="search" style={styles.input} textAlign="right" autoCapitalize="none" /></View></View>{query.trim() ? <FlatList data={results} keyExtractor={(item) => item.id} renderItem={({ item }) => <MediaRow item={item} onPress={() => void openItem(item)} />} ListEmptyComponent={<EmptyState icon="search-off" title="لا توجد نتائج" description="جرّب كتابة جزء آخر من اسم الملف أو الفنان." />} contentContainerStyle={styles.list} /> : <EmptyState icon="manage-search" title="ابحث في ملفك المفضل" description="اكتب اسم أغنية أو فيديو أو ألبوم للعثور عليه داخل المكتبة." />}</ScreenContainer>;
}

const styles = StyleSheet.create({ header: { paddingHorizontal: 18, paddingTop: 13, gap: 14 }, title: { color: colors.text, fontSize: 25, lineHeight: 32, fontWeight: "900", textAlign: "right" }, searchBox: { minHeight: 52, paddingHorizontal: 13, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flexDirection: "row-reverse", alignItems: "center", gap: 9 }, input: { flex: 1, minHeight: 46, color: colors.text, fontSize: 14 }, list: { paddingTop: 18, paddingBottom: 92 }, });
