import React from "react";
import { Play, Music, Video, Sparkles, Clock, Flame, Disc3, Heart } from "lucide-react";
import { MediaItem, Playlist, ActiveTab } from "../types";

interface HomeTabProps {
  mediaItems: MediaItem[];
  playlists: Playlist[];
  onPlayItem: (item: MediaItem) => void;
  onChangeTab: (tab: ActiveTab) => void;
  currentTrack: MediaItem | null;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  mediaItems,
  playlists,
  onPlayItem,
  onChangeTab,
  currentTrack,
}) => {
  const audioItems = mediaItems.filter((i) => i.mediaType === "audio");
  const videoItems = mediaItems.filter((i) => i.mediaType === "video");
  const favorites = mediaItems.filter((i) => i.isFavorite);

  // Pick last played or first item for "Continue"
  const continueItem = currentTrack || mediaItems[0];

  return (
    <div className="space-y-6 pb-24 px-4 pt-4 max-w-4xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#111F33] via-[#0d1726] to-[#1a1333] border border-[#2EC5FF]/20 p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#2EC5FF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2EC5FF] bg-[#2EC5FF]/10 px-3 py-1 rounded-full w-fit mb-3 border border-[#2EC5FF]/20">
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "6s" }} />
            <span>مشغل ريمو المحلي v1.0.23</span>
          </div>
          <h2 className="text-2xl font-bold text-[#F4F8FF] tracking-tight mb-2">
            مرحباً بك في عالمك الصوتي والمرئي
          </h2>
          <p className="text-sm text-[#91A1B7] max-w-lg leading-relaxed">
            استمتع بتشغيل ملفاتك المحلية المفضلة بكل سهولة وسلاسة مع تصميم هادئ ومريح للاستخدام طوال اليوم.
          </p>

          <div className="flex flex-wrap gap-3 mt-5">
            <button
              onClick={() => onChangeTab("music")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2EC5FF] text-[#08111F] font-bold text-xs shadow-lg shadow-[#2EC5FF]/20 hover:opacity-90 transition-all"
            >
              <Music className="w-4 h-4" />
              <span>تصفح الموسيقى ({audioItems.length})</span>
            </button>
            <button
              onClick={() => onChangeTab("video")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1f3554] text-[#F4F8FF] font-medium text-xs border border-[#2EC5FF]/30 hover:bg-[#28446b] transition-all"
            >
              <Video className="w-4 h-4 text-[#2EC5FF]" />
              <span>مكتبة الفيديو ({videoItems.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Continue Card */}
      {continueItem && (
        <div className="bg-[#111F33] border border-[#1f3554] rounded-2xl p-4 shadow-lg flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#08111F] flex-shrink-0">
              {continueItem.thumbnailUri ? (
                <img src={continueItem.thumbnailUri} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#2EC5FF]">
                  <Disc3 className="w-7 h-7" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-[#2EC5FF] font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3" /> المتابعة من حيث توقفت
              </span>
              <h3 className="text-sm font-bold text-[#F4F8FF] truncate">{continueItem.title}</h3>
              <p className="text-xs text-[#91A1B7] truncate">{continueItem.artist} • {continueItem.album}</p>
            </div>
          </div>

          <button
            onClick={() => onPlayItem(continueItem)}
            className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#2EC5FF] to-[#8B5CF6] text-white flex items-center justify-center shadow-lg shadow-[#2EC5FF]/30 hover:scale-105 transition-transform flex-shrink-0"
            title="تشغيل"
          >
            <Play className="w-5 h-5 fill-current translate-x-0.5" />
          </button>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#111F33]/80 border border-[#1f3554] rounded-2xl p-4 text-center">
          <Music className="w-5 h-5 text-[#2EC5FF] mx-auto mb-1.5" />
          <h4 className="text-lg font-bold text-[#F4F8FF]">{audioItems.length}</h4>
          <span className="text-[11px] text-[#91A1B7]">ملف صوتي</span>
        </div>
        <div className="bg-[#111F33]/80 border border-[#1f3554] rounded-2xl p-4 text-center">
          <Video className="w-5 h-5 text-[#8B5CF6] mx-auto mb-1.5" />
          <h4 className="text-lg font-bold text-[#F4F8FF]">{videoItems.length}</h4>
          <span className="text-[11px] text-[#91A1B7]">فيديو محلي</span>
        </div>
        <div className="bg-[#111F33]/80 border border-[#1f3554] rounded-2xl p-4 text-center">
          <Heart className="w-5 h-5 text-red-400 mx-auto mb-1.5" />
          <h4 className="text-lg font-bold text-[#F4F8FF]">{favorites.length}</h4>
          <span className="text-[11px] text-[#91A1B7]">المفضلة</span>
        </div>
      </div>

      {/* Recent Media Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-[#F4F8FF] flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#2EC5FF]" /> أحدث الملفات المضافة
          </h3>
          <button
            onClick={() => onChangeTab("music")}
            className="text-xs text-[#2EC5FF] hover:underline"
          >
            عرض الكل
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {mediaItems.slice(0, 4).map((item) => (
            <div
              key={item.id}
              onClick={() => onPlayItem(item)}
              className="bg-[#111F33] hover:bg-[#182842] border border-[#1f3554] rounded-2xl p-3 flex items-center gap-3 cursor-pointer transition-all group"
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#08111F] flex-shrink-0 relative">
                {item.thumbnailUri ? (
                  <img src={item.thumbnailUri} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#2EC5FF]">
                    {item.mediaType === "audio" ? <Music className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Play className="w-4 h-4 text-white fill-current" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-[#F4F8FF] truncate">{item.title}</h4>
                <p className="text-xs text-[#91A1B7] truncate">{item.artist}</p>
              </div>

              <span className="text-[10px] px-2 py-1 rounded-lg bg-[#08111F] text-[#91A1B7]">
                {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
