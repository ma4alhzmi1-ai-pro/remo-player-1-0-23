import React, { useState } from "react";
import { Music, Play, Heart, Plus, Sparkles, FolderPlus, Check } from "lucide-react";
import { MediaItem, Playlist } from "../types";

interface MusicTabProps {
  mediaItems: MediaItem[];
  playlists: Playlist[];
  onPlayTrack: (item: MediaItem) => void;
  onToggleFavorite: (id: string) => void;
  onAddToPlaylist: (playlistId: string, itemId: string) => void;
  onOpenUpload: () => void;
}

export const MusicTab: React.FC<MusicTabProps> = ({
  mediaItems,
  playlists,
  onPlayTrack,
  onToggleFavorite,
  onAddToPlaylist,
  onOpenUpload,
}) => {
  const [filter, setFilter] = useState<"all" | "favorites">("all");
  const [activeMenuTrackId, setActiveMenuTrackId] = useState<string | null>(null);

  const audioList = mediaItems.filter((i) => i.mediaType === "audio" && (filter === "all" || i.isFavorite));

  return (
    <div className="space-y-4 pb-28 px-4 pt-4 max-w-4xl mx-auto">
      {/* Header & Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#F4F8FF] tracking-tight">مكتبة الموسيقى</h2>
          <p className="text-xs text-[#91A1B7]">استمع إلى ملفاتك الصوتية المفضلة</p>
        </div>

        <div className="flex items-center gap-2 bg-[#111F33] p-1 rounded-xl border border-[#1f3554]">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === "all" ? "bg-[#2EC5FF] text-[#08111F]" : "text-[#91A1B7] hover:text-[#F4F8FF]"
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setFilter("favorites")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === "favorites" ? "bg-[#2EC5FF] text-[#08111F]" : "text-[#91A1B7] hover:text-[#F4F8FF]"
            }`}
          >
            المفضلة
          </button>
        </div>
      </div>

      {audioList.length === 0 ? (
        <div className="text-center py-16 bg-[#111F33]/50 border border-dashed border-[#1f3554] rounded-3xl p-6">
          <Music className="w-12 h-12 text-[#91A1B7] mx-auto mb-3 opacity-50" />
          <h3 className="text-base font-bold text-[#F4F8FF] mb-1">لا توجد ملفات صوتية</h3>
          <p className="text-xs text-[#91A1B7] mb-4">أضف ملفاتك الصوتية لتستمتع بالتشغيل الفوري</p>
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 bg-[#2EC5FF] text-[#08111F] rounded-xl text-xs font-bold shadow-lg shadow-[#2EC5FF]/20"
          >
            إضافة ملف صوتي
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {audioList.map((item) => (
            <div
              key={item.id}
              className="relative bg-[#111F33] hover:bg-[#182842] border border-[#1f3554] rounded-2xl p-3.5 flex items-center gap-3.5 transition-all group shadow-sm"
            >
              {/* Thumbnail / Play Button */}
              <div
                onClick={() => onPlayTrack(item)}
                className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#08111F] flex-shrink-0 cursor-pointer"
              >
                {item.thumbnailUri ? (
                  <img src={item.thumbnailUri} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#2EC5FF]">
                    <Music className="w-6 h-6" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Play className="w-5 h-5 text-white fill-current" />
                </div>
              </div>

              {/* Meta */}
              <div onClick={() => onPlayTrack(item)} className="flex-1 min-w-0 cursor-pointer">
                <h4 className="text-sm font-bold text-[#F4F8FF] truncate">{item.title}</h4>
                <p className="text-xs text-[#91A1B7] truncate">{item.artist} • {item.album}</p>
              </div>

              {/* Duration */}
              <span className="text-xs text-[#91A1B7] hidden sm:block">
                {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, "0")}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onToggleFavorite(item.id)}
                  className={`p-2 rounded-xl transition-colors ${
                    item.isFavorite ? "text-red-400 bg-red-500/10" : "text-[#91A1B7] hover:text-red-400 hover:bg-[#1a2d4a]"
                  }`}
                  title="المفضلة"
                >
                  <Heart className={`w-4 h-4 ${item.isFavorite ? "fill-current" : ""}`} />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setActiveMenuTrackId(activeMenuTrackId === item.id ? null : item.id)}
                    className="p-2 rounded-xl text-[#91A1B7] hover:text-[#2EC5FF] hover:bg-[#1a2d4a] transition-colors"
                    title="إضافة لقائمة تشغيل"
                  >
                    <FolderPlus className="w-4 h-4" />
                  </button>

                  {/* Playlist dropdown */}
                  {activeMenuTrackId === item.id && (
                    <div className="absolute left-0 bottom-full mb-2 w-48 bg-[#0d1726] border border-[#1f3554] rounded-2xl p-2 shadow-2xl z-20">
                      <p className="text-[10px] text-[#91A1B7] px-2 py-1 font-semibold">إضافة إلى قائمة:</p>
                      {playlists.map((pl) => {
                        const inPlaylist = pl.itemIds.includes(item.id);
                        return (
                          <button
                            key={pl.id}
                            onClick={() => {
                              onAddToPlaylist(pl.id, item.id);
                              setActiveMenuTrackId(null);
                            }}
                            className="w-full text-right px-3 py-1.5 rounded-xl text-xs text-[#F4F8FF] hover:bg-[#1f3554] flex items-center justify-between transition-colors"
                          >
                            <span className="truncate">{pl.name}</span>
                            {inPlaylist && <Check className="w-3.5 h-3.5 text-[#2EC5FF]" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
