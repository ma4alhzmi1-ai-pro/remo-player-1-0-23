import { MediaItem, Playlist } from "../types";

export const INITIAL_MEDIA_ITEMS: MediaItem[] = [
  {
    id: "m-1",
    title: "نسمات هادئة (Ambient Breeze)",
    artist: "ريمون ساوندز",
    album: "رحلة الاسترخاء",
    uri: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: 372,
    mediaType: "audio",
    addedAt: Date.now() - 86400000 * 3,
    thumbnailUri: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
    lyrics: "نسمات الصباح الدافئة...\nتحملني إلى أفق بعيد...\nحيث السكون والسلام يغمر الروح.",
    isFavorite: true,
    fileSize: "5.8 MB"
  },
  {
    id: "m-2",
    title: "إيقاع العزيمة (Focus Rhythm)",
    artist: "استوديو ريمو",
    album: "تركيز وتطوير",
    uri: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: 423,
    mediaType: "audio",
    addedAt: Date.now() - 86400000 * 2,
    thumbnailUri: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80",
    lyrics: "خطوة بخطوة نحو الهدف...\nلا توقف، استمر في التقدم.",
    isFavorite: true,
    fileSize: "6.4 MB"
  },
  {
    id: "m-3",
    title: "صوت الطبيعة والأمطار",
    artist: "طبيعة بلا حدود",
    album: "أصوات الأرض",
    uri: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration: 544,
    mediaType: "audio",
    addedAt: Date.now() - 86400000,
    thumbnailUri: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80",
    lyrics: "قطرات المطر تتساقط برفق...\nتغسل الهموم وتجدد النشاط.",
    isFavorite: false,
    fileSize: "8.2 MB"
  },
  {
    id: "m-4",
    title: "جولة في الطبيعة الخلابة",
    artist: "فريق ريمو للتوثيق",
    album: "وثائقيات ريمو",
    uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    duration: 596,
    mediaType: "video",
    addedAt: Date.now() - 86400000 * 5,
    thumbnailUri: "https://images.unsplash.com/photo-1426604966848-d7adac902bff?w=600&q=80",
    lyrics: "استعراض لجمال الطبيعة البرية والمشاهد الخلابة في الغابات والجبال.",
    isFavorite: true,
    fileSize: "45.2 MB"
  },
  {
    id: "m-5",
    title: "رحلة عبر الفضاء والمجرات",
    artist: "سينما ريمو",
    album: "عالم الأسرار",
    uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    duration: 653,
    mediaType: "video",
    addedAt: Date.now() - 86400000 * 4,
    thumbnailUri: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80",
    lyrics: "نظرة مستقبلية على تقنيات استكشاف الفضاء والمحطات المدارية.",
    isFavorite: false,
    fileSize: "58.7 MB"
  },
  {
    id: "m-6",
    title: "لحن الغروب الهادئ",
    artist: "عازف البيانو",
    album: "أمسيات موسيقية",
    uri: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    duration: 312,
    mediaType: "audio",
    addedAt: Date.now() - 3600000 * 12,
    thumbnailUri: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80",
    isFavorite: false,
    fileSize: "4.7 MB"
  }
];

export const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: "pl-1",
    name: "مفضلتي الشخصية",
    description: "الأغاني والمقاطع المفضلة لدي",
    itemIds: ["m-1", "m-2", "m-4"],
    createdAt: Date.now() - 86400000 * 10
  },
  {
    id: "pl-2",
    name: "جلسات التركيز والعمل",
    description: "موسيقى هادئة لزيادة الإنتاجية",
    itemIds: ["m-1", "m-3"],
    createdAt: Date.now() - 86400000 * 5
  }
];
