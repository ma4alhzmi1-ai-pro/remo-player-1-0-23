import React from "react";
import { Play, Pause, SkipForward, Disc3, Maximize2, X } from "lucide-react";
import { MediaItem } from "../types";

interface MiniPlayerProps {
  currentTrack: MediaItem | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onNext: () => void;
  onOpenModal: () => void;
  onClose: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onNext,
  onOpenModal,
  onClose,
}) => {
  if (!currentTrack || currentTrack.mediaType !== "audio") return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-16 left-3 right-3 z-20 max-w-xl mx-auto bg-[#111F33]/95 backdrop-blur-xl border border-[#2EC5FF]/30 rounded-2xl p-3 shadow-2xl shadow-black/60 flex items-center gap-3">
      {/* Thumbnail */}
      <div
        onClick={onOpenModal}
        className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#08111F] flex-shrink-0 cursor-pointer group"
      >
        {currentTrack.thumbnailUri ? (
          <img src={currentTrack.thumbnailUri} alt={currentTrack.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#2EC5FF]">
            <Disc3 className="w-6 h-6 animate-spin" style={{ animationDuration: "8s" }} />
          </div>
        )}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <Maximize2 className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Title & Artist */}
      <div onClick={onOpenModal} className="flex-1 min-w-0 cursor-pointer">
        <h4 className="text-sm font-bold text-[#F4F8FF] truncate">{currentTrack.title}</h4>
        <p className="text-xs text-[#91A1B7] truncate">{currentTrack.artist}</p>
        {/* Progress bar */}
        <div className="w-full bg-[#08111F] h-1 rounded-full mt-2 overflow-hidden">
          <div className="bg-gradient-to-r from-[#2EC5FF] to-[#8B5CF6] h-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onTogglePlay}
          className="w-10 h-10 rounded-full bg-[#2EC5FF] text-[#08111F] flex items-center justify-center hover:scale-105 transition-transform shadow-md shadow-[#2EC5FF]/30"
          title={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current translate-x-0.5" />}
        </button>

        <button
          onClick={onNext}
          className="p-2 rounded-xl text-[#91A1B7] hover:text-[#F4F8FF] hover:bg-[#1a2d4a] transition-colors"
          title="التالي"
        >
          <SkipForward className="w-5 h-5" />
        </button>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-[#91A1B7] hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="إغلاق المشغل"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
