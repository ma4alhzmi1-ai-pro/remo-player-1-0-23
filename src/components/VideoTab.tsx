import React from "react";
import { Video, Play, Clock, Sparkles } from "lucide-react";
import { MediaItem } from "../types";

interface VideoTabProps {
  mediaItems: MediaItem[];
  onPlayVideo: (item: MediaItem) => void;
  onOpenUpload: () => void;
}

export const VideoTab: React.FC<VideoTabProps> = ({ mediaItems, onPlayVideo, onOpenUpload }) => {
  const videoList = mediaItems.filter((i) => i.mediaType === "video");

  return (
    <div className="space-y-4 pb-28 px-4 pt-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#F4F8FF] tracking-tight">مكتبة الفيديو</h2>
          <p className="text-xs text-[#91A1B7]">شاهد مقاطع الفيديو المحلية بوضوح وعالية الدقة</p>
        </div>

        <button
          onClick={onOpenUpload}
          className="px-3.5 py-2 rounded-xl bg-[#2EC5FF] text-[#08111F] text-xs font-bold shadow-lg shadow-[#2EC5FF]/20 hover:opacity-90"
        >
          إضافة فيديو
        </button>
      </div>

      {videoList.length === 0 ? (
        <div className="text-center py-16 bg-[#111F33]/50 border border-dashed border-[#1f3554] rounded-3xl p-6">
          <Video className="w-12 h-12 text-[#91A1B7] mx-auto mb-3 opacity-50" />
          <h3 className="text-base font-bold text-[#F4F8FF] mb-1">لا توجد ملفات فيديو</h3>
          <p className="text-xs text-[#91A1B7] mb-4">أضف مقاطع فيديو محلية للبدء في مشاهدتها</p>
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 bg-[#2EC5FF] text-[#08111F] rounded-xl text-xs font-bold shadow-lg shadow-[#2EC5FF]/20"
          >
            إضافة فيديو جديد
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {videoList.map((item) => (
            <div
              key={item.id}
              onClick={() => onPlayVideo(item)}
              className="bg-[#111F33] hover:bg-[#182842] border border-[#1f3554] rounded-2xl overflow-hidden shadow-lg cursor-pointer group transition-all"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video bg-[#08111F] overflow-hidden">
                {item.thumbnailUri ? (
                  <img src={item.thumbnailUri} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#2EC5FF]">
                    <Video className="w-10 h-10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-[#2EC5FF] text-[#08111F] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-current translate-x-0.5" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] text-white flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#2EC5FF]" />
                  <span>
                    {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, "0")}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="p-3.5">
                <h3 className="text-sm font-bold text-[#F4F8FF] truncate mb-1">{item.title}</h3>
                <p className="text-xs text-[#91A1B7] truncate">{item.artist} • {item.album}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
