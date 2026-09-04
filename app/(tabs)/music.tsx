import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { BackHandler, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { colors, EmptyState, MediaRow } from "@/components/remo-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useLibrary } from "@/lib/library-context";
import { groupMediaFolders } from "@/lib/media-folder-utils";
import { filterMediaItems, nextMediaSort, sortMediaItems, type MediaSort } from "@/lib/media-library-tools";
import { usePlayer } from "@/lib/player-context";
import type { MediaItem } from "@/types/media";

type MusicView = "tracks" | "albums" | "artists" | "folders";
type Collection = MediaItem & { name: string; count: number; items: MediaItem[]; icon: keyof typeof MaterialIcons.glyphMap };
type Folder = MediaItem & { name: string; path: string; items: MediaItem[] };

const views: { id: MusicView; label: string }[] = [
  { id: "tracks", label: "الأغاني" },
  { id: "albums", label: "الألبومات" },
  { id: "artists", label: "الفنانون" },
  { id: "folders", label: "مجلدات" },
];

export default function MusicScreen() {
  const router = useRouter();
  const { folderPath } = useLocalSearchParams<{ folderPath?: string }>();
  const { items, importFiles, isRefreshing, refreshDeviceLibrary } = useLibrary();
  const { playItem } = usePlayer();
  const [activeView, setActiveView] = useState<MusicView>("tracks");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<MediaSort>("recent");
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const tracks = useMemo(() => sortMediaItems(items.filter((item) => item.mediaType === "audio"), sort), [items, sort]);
  const artists = useMemo(() => groupTracks(tracks, "artist", "person-outline"), [tracks]);
  const albums = useMemo(() => groupTracks(tracks, "album", "album"), [tracks]);
  const folders = useMemo(() => groupFolders(tracks), [tracks]);
  const visibleTracks = useMemo(() => filterMediaItems(tracks, query), [query, tracks]);
  const visibleFolders = useMemo(() => folders.filter((folder) => !query.trim() || `${folder.title} ${folder.path}`.toLocaleLowerCase("ar").includes(query.trim().toLocaleLowerCase("ar"))), [folders, query]);
  const visibleAlbums = useMemo(() => albums.filter((album) => !query.trim() || album.name.toLocaleLowerCase("ar").includes(query.trim().toLocaleLowerCase("ar"))), [albums, query]);
  const visibleArtists = useMemo(() => artists.filter((artist) => !query.trim() || artist.name.toLocaleLowerCase("ar").includes(query.trim().toLocaleLowerCase("ar"))), [artists, query]);

  useEffect(() => {
    if (!selectedCollection && !selectedFolder) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (selectedCollection) { setSelectedCollection(null); return true; }
      if (selectedFolder) { setSelectedFolder(null); return true; }
      return false;
    });
    return () => sub.remove();
  }, [selectedCollection, selectedFolder]);
  useEffect(() => {
    if (!folderPath) return;
    const folder = folders.find((candidate) => candidate.path === folderPath);
    if (!folder) return;
    setActiveView("folders");
    setSelectedCollection(null);
    setSelectedFolder(folder);
  }, [folderPath, folders]);
  const openTrack = async (item: MediaItem, sourceQueue: MediaItem[] = tracks, originFolderPath?: string) => {
    await playItem(item, sourceQueue);
    const route = originFolderPath ? `/player/audio?folderPath=${encodeURIComponent(originFolderPath)}` : "/player/audio";
    router.push(route as never);
  };

  if (selectedCollection) return <CollectionDetail title={selectedCollection.name} subtitle={`${selectedCollection.count} أغنيات`} items={selectedCollection.items} onBack={() => setSelectedCollection(null)} onOpenTrack={(item) => openTrack(item, selectedCollection.items)} />;
  if (selectedFolder) return <CollectionDetail title={selectedFolder.title} subtitle={`${selectedFolder.items.length} أغنيات · ${selectedFolder.path}`} items={selectedFolder.items} backLabel="العودة إلى المجلدات" onBack={() => setSelectedFolder(null)} onOpenTrack={(item) => openTrack(item, selectedFolder.items, selectedFolder.path)} />;

  return <ScreenContainer className="px-0"><FlatList data={activeView === "tracks" ? visibleTracks : activeView === "folders" ? visibleFolders : activeView === "albums" ? visibleAlbums : visibleArtists} keyExtractor={(item) => "items" in item ? (item as unknown as Folder | Collection).name : (item as MediaItem).id} renderItem={({ item }) => {
    if ("items" in item && activeView === "folders") return <FolderRow folder={item as unknown as Folder} onPress={() => setSelectedFolder(item as unknown as Folder)} />;
    if ("items" in item) return <CollectionRow collection={item as unknown as Collection} onPress={() => setSelectedCollection(item as unknown as Collection)} />;
    return <MediaRow item={item as MediaItem} onPress={() => void openTrack(item as MediaItem, visibleTracks)} trailing={<MaterialIcons name="more-vert" size={22} color={colors.muted} />} />;
  }} ListHeaderComponent={<><View style={styles.header}><View style={styles.headerActions}><Pressable onPress={() => router.canGoBack() ? router.back() : router.replace("/" as never)} style={styles.headerButton} accessibilityLabel="رجوع"><MaterialIcons name="arrow-forward" size={25} color={colors.text} /></Pressable><Pressable onPress={() => router.push("/settings" as never)} style={styles.headerButton}><MaterialIcons name="more-vert" size={25} color={colors.text} /></Pressable></View><View style={styles.headerActions}><Pressable onPress={() => router.push("/playlists" as never)} style={styles.headerButton}><MaterialIcons name="queue-music" size={24} color={colors.text} /></Pressable><Pressable onPress={() => void importFiles()} style={styles.headerButton}><MaterialIcons name="add-circle-outline" size={26} color={colors.text} /></Pressable></View></View><View style={styles.search}><MaterialIcons name="search" size={23} color={colors.muted} /><TextInput value={query} onChangeText={setQuery} placeholder="ابحث في الموسيقى والمجلدات" placeholderTextColor={colors.muted} style={styles.searchInput} textAlign="right" returnKeyType="search" /></View><View style={styles.tabs}>{views.map((view) => <Pressable key={view.id} onPress={() => setActiveView(view.id)} style={styles.tab}><Text style={[styles.tabText, activeView === view.id && styles.tabTextActive]}>{view.label}</Text>{activeView === view.id ? <View style={styles.tabLine} /> : null}</Pressable>)}</View><View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{activeView === "folders" ? `المجلدات · ${visibleFolders.length}` : activeView === "artists" ? `الفنانون · ${visibleArtists.length}` : activeView === "albums" ? `الألبومات · ${visibleAlbums.length}` : `الأغاني · ${visibleTracks.length}`}</Text><Pressable onPress={() => setSort((current) => nextMediaSort(current))} style={styles.sortButton} accessibilityLabel="تغيير ترتيب الموسيقى"><MaterialIcons name="sort" size={17} color={colors.cyan} /><Text style={styles.sortText}>{sort === "recent" ? "الأحدث" : sort === "title" ? "العنوان" : "المدة"}</Text></Pressable><Text style={styles.sectionHint}>مكتبتك المحلية</Text></View></>} ListEmptyComponent={<EmptyState icon="library-music" title={query ? "لا توجد نتائج مطابقة" : "لا توجد موسيقى هنا"} description={query ? "جرّب كلمة أخرى أو امسح البحث للعودة إلى مكتبتك كاملة." : activeView === "folders" ? "افحص مكتبة جهازك أو استورد ملفات لإظهار المجلدات الموسيقية." : "استورد ملفات صوتية أو افحص موسيقى جهازك لإظهارها هنا."} actionLabel={query ? undefined : isRefreshing ? "جارِ الفهرسة..." : "فهرسة الموسيقى"} onAction={query ? undefined : () => void refreshDeviceLibrary()} />} ItemSeparatorComponent={() => <View style={styles.separator} />} contentContainerStyle={styles.list} /></ScreenContainer>;
}

function CollectionDetail({ title, subtitle, items, backLabel = "العودة", onBack, onOpenTrack }: { title: string; subtitle: string; items: MediaItem[]; backLabel?: string; onBack: () => void; onOpenTrack: (item: MediaItem) => Promise<void> }) { return <ScreenContainer className="px-0"><View style={styles.detailHeader}><Pressable onPress={onBack} style={styles.folderBackButton} accessibilityLabel={backLabel}><MaterialIcons name="arrow-forward" size={22} color={colors.text} /><Text style={styles.folderBackText}>{backLabel}</Text></Pressable><View style={styles.detailTitleWrap}><Text numberOfLines={1} style={styles.detailTitle}>{title}</Text><Text style={styles.detailSubtitle}>{subtitle}</Text></View></View><FlatList data={items} keyExtractor={(item) => item.id} renderItem={({ item }) => <MediaRow item={item} onPress={() => void onOpenTrack(item)} />} contentContainerStyle={styles.detailList} /></ScreenContainer>; }

function CollectionRow({ collection, onPress }: { collection: Collection; onPress: () => void }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.collectionRow, pressed && styles.pressed]}><MaterialIcons name="more-vert" size={22} color={colors.muted} /><View style={styles.collectionCopy}><Text numberOfLines={1} style={styles.collectionTitle}>{collection.name}</Text><Text style={styles.collectionMeta}>{collection.count} أغنيات</Text></View><View style={styles.collectionIcon}><MaterialIcons name={collection.icon} size={25} color="#B7C0CC" /></View></Pressable>; }
function FolderRow({ folder, onPress }: { folder: Folder; onPress: () => void }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.collectionRow, pressed && styles.pressed]}><MaterialIcons name="more-vert" size={22} color={colors.muted} /><View style={styles.collectionCopy}><Text numberOfLines={1} style={styles.collectionTitle}>{folder.title}</Text><Text numberOfLines={1} style={styles.collectionMeta}>{folder.items.length} أغنيات · {folder.path}</Text></View><View style={styles.collectionIcon}><MaterialIcons name="folder" size={28} color="#B7C0CC" /></View></Pressable>; }
function groupTracks(tracks: MediaItem[], key: "artist" | "album", icon: Collection["icon"]): Collection[] { const groups = new Map<string, MediaItem[]>(); tracks.forEach((track) => groups.set(track[key], [...(groups.get(track[key]) ?? []), track])); return Array.from(groups.entries()).map(([name, groupItems]) => ({ id: `music-${key}:${name}`, title: name, artist: "", album: "", uri: "", duration: 0, mediaType: "audio" as const, addedAt: Math.max(...groupItems.map((item) => item.addedAt), 0), name, count: groupItems.length, items: groupItems, icon })).sort((a, b) => a.name.localeCompare(b.name, "ar")); }
function groupFolders(tracks: MediaItem[]): Folder[] { return groupMediaFolders(tracks).map((folder) => ({ id: `music-${folder.id}`, title: folder.name, artist: "", album: "", uri: folder.path, duration: 0, mediaType: "audio" as const, addedAt: Math.max(...folder.items.map((item) => item.addedAt), 0), name: folder.path, path: folder.path, items: folder.items })); }

const styles = StyleSheet.create({ header: { height: 62, paddingHorizontal: 18, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" }, headerActions: { flexDirection: "row-reverse", gap: 4 }, headerButton: { width: 39, height: 39, borderRadius: 18, alignItems: "center", justifyContent: "center" }, folderBackButton: { minHeight: 39, paddingHorizontal: 11, borderRadius: 14, alignItems: "center", justifyContent: "center", flexDirection: "row-reverse", gap: 5, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, folderBackText: { color: colors.cyan, fontSize: 11, fontWeight: "900" }, search: { minHeight: 49, marginHorizontal: 16, paddingHorizontal: 14, borderRadius: 16, flexDirection: "row-reverse", alignItems: "center", gap: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, searchInput: { flex: 1, minHeight: 44, color: colors.text, fontSize: 13 }, tabs: { flexDirection: "row-reverse", marginTop: 13, borderBottomWidth: 1, borderColor: colors.border }, tab: { flex: 1, height: 45, alignItems: "center", justifyContent: "center", position: "relative" }, tabText: { color: colors.muted, fontSize: 13, fontWeight: "700" }, tabTextActive: { color: colors.text, fontWeight: "900" }, tabLine: { position: "absolute", bottom: 0, width: "72%", height: 3, borderRadius: 2, backgroundColor: colors.cyan }, sectionHeader: { flexDirection: "row-reverse", alignItems: "center", gap: 8, paddingHorizontal: 18, paddingTop: 17, paddingBottom: 8 }, sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "900" }, sectionHint: { color: colors.muted, fontSize: 11, marginRight: "auto" }, sortButton: { minHeight: 30, paddingHorizontal: 8, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flexDirection: "row-reverse", alignItems: "center", gap: 4 }, sortText: { color: colors.cyan, fontSize: 10, fontWeight: "800" }, list: { paddingBottom: 96 }, separator: { height: 1, backgroundColor: colors.border }, collectionRow: { minHeight: 74, paddingHorizontal: 16, backgroundColor: colors.background, flexDirection: "row-reverse", alignItems: "center", gap: 12 }, collectionIcon: { width: 45, alignItems: "center", justifyContent: "center" }, collectionCopy: { flex: 1, alignItems: "flex-end" }, collectionTitle: { color: colors.text, fontSize: 16, fontWeight: "700", textAlign: "right" }, collectionMeta: { color: colors.muted, fontSize: 11, lineHeight: 17 }, detailHeader: { minHeight: 74, paddingHorizontal: 16, flexDirection: "row-reverse", alignItems: "center", gap: 10 }, detailTitleWrap: { flex: 1, alignItems: "flex-end" }, detailTitle: { color: colors.text, fontSize: 20, lineHeight: 27, fontWeight: "900" }, detailSubtitle: { color: colors.muted, fontSize: 11, lineHeight: 17 }, detailList: { paddingBottom: 94, borderTopWidth: 1, borderColor: colors.border }, pressed: { opacity: 0.66 } });
