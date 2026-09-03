import React, { useState } from "react";
import { Search, Music, Video, Play, Sparkles } from "lucide-react";
import { MediaItem } from "../types";

interface SearchTabProps {
  mediaItems: MediaItem[];
  onPlayItem: (item: MediaItem) => void;
}

export const SearchTab: React.FC<SearchTabProps> = ({ mediaItems, onPlayItem }) => {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "audio" | "video">("all");

  const results = mediaItems.filter((item) => {
    const matchesQuery =
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.artist.toLowerCase().includes(query.toLowerCase()) ||
      item.album.toLowerCase().includes(query.toLowerCase());
    const matchesType = typeFilter === "all" || item.mediaType === typeFilter;
    return matchesQuery && matchesType;
  });

  return (
    <div className="space-y-4 pb-28 px-4 pt-4 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-[#F4F8FF] tracking-tight">البحث المتقدم</h2>
        <p className="text-xs text-[#91A1B7]">ابحث في مكتبتك عن أي ملف صوتي أو فيديو</p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute right-4 top-3.5 w-5 h-5 text-[#91A1B7]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث بالعنوان، الفنان، أو الألبوم..."
          className="w-full bg-[#111F33] border border-[#1f3554] rounded-2xl pr-12 pl-4 py-3 text-sm text-[#F4F8FF] focus:outline-none focus:border-[#2EC5FF] shadow-inner"
          autoFocus
        />
      </div>

      {/* Type Filters */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTypeFilter("all")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            typeFilter === "all" ? "bg-[#2EC5FF] text-[#08111F]" : "bg-[#111F33] text-[#91A1B7] hover:text-[#F4F8FF]"
          }`}
        >
          الكل ({mediaItems.length})
        </button>
        <button
          onClick={() => setTypeFilter("audio")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            typeFilter === "audio" ? "bg-[#2EC5FF] text-[#08111F]" : "bg-[#111F33] text-[#91A1B7] hover:text-[#F4F8FF]"
          }`}
        >
          الصوتيات
        </button>
        <button
          onClick={() => setTypeFilter("video")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            typeFilter === "video" ? "bg-[#2EC5FF] text-[#08111F]" : "bg-[#111F33] text-[#91A1B7] hover:text-[#F4F8FF]"
          }`}
        >
          الفيديو
        </button>
      </div>

      {/* Results List */}
      <div className="space-y-2 pt-2">
        {results.length === 0 ? (
          <div className="text-center py-16 text-[#91A1B7] text-xs">لا توجد نتائج مطابقة لبحثك</div>
        ) : (
          results.map((item) => (
            <div
              key={item.id}
              onClick={() => onPlayItem(item)}
              className="bg-[#111F33] hover:bg-[#182842] border border-[#1f3554] rounded-2xl p-3.5 flex items-center gap-3.5 cursor-pointer transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#08111F] flex items-center justify-center text-[#2EC5FF] flex-shrink-0 overflow-hidden relative">
                {item.thumbnailUri ? (
                  <img src={item.thumbnailUri} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : item.mediaType === "audio" ? (
                  <Music className="w-6 h-6" />
                ) : (
                  <Video className="w-6 h-6" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Play className="w-4 h-4 text-white fill-current" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#F4F8FF] truncate">{item.title}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#08111F] text-[#2EC5FF]">
                    {item.mediaType === "audio" ? "صوت" : "فيديو"}
                  </span>
                </div>
                <p className="text-xs text-[#91A1B7] truncate">{item.artist} • {item.album}</p>
              </div>

              <span className="text-xs text-[#91A1B7]">
                {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, "0")}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
