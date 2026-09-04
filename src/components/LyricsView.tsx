import React from "react";
import { Music, FileText } from "lucide-react";
import { MediaItem } from "../types";

interface LyricsViewProps {
  currentTrack: MediaItem;
  currentTime: number;
  onSeekToTime?: (seconds: number) => void;
}

interface LyricLine {
  time: number; // in seconds
  text: string;
}

export const LyricsView: React.FC<LyricsViewProps> = ({ currentTrack, currentTime, onSeekToTime }) => {
  // Parse lyrics string into timestamped lines if LRC format exists, else split by newline
  const parseLyrics = (rawLyrics?: string): LyricLine[] => {
    if (!rawLyrics) {
      return [
        { time: 0, text: "لا توجد كلمات متاحة لهذا المقطع." },
        { time: 10, text: "استمتع بالاستماع إلى الموسيقى الهادئة." },
      ];
    }

    const lines = rawLyrics.split("\n");
    const parsed: LyricLine[] = [];
    const lrcRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\](.*)/;

    let hasTimestamps = false;

    for (const line of lines) {
      const match = line.match(lrcRegex);
      if (match) {
        hasTimestamps = true;
        const mins = parseInt(match[1], 10);
        const secs = parseInt(match[2], 10);
        const millis = match[3] ? parseInt(match[3].padEnd(3, "0").slice(0, 3), 10) : 0;
        const totalSecs = mins * 60 + secs + millis / 1000;
        parsed.push({ time: totalSecs, text: match[4].trim() });
      }
    }

    if (!hasTimestamps) {
      // Fallback: distribute lines evenly across duration or show as static lines
      const duration = currentTrack.duration || 180;
      const step = duration / Math.max(lines.length, 1);
      return lines.map((text, idx) => ({
        time: idx * step,
        text: text.trim(),
      }));
    }

    return parsed.sort((a, b) => a.time - b.time);
  };

  const lyricLines = parseLyrics(currentTrack.lyrics);

  // Find active line index based on currentTime
  const activeIndex = lyricLines.findIndex((line, idx) => {
    const nextLineTime = lyricLines[idx + 1]?.time ?? Infinity;
    return currentTime >= line.time && currentTime < nextLineTime;
  });

  const currentActiveIdx = activeIndex !== -1 ? activeIndex : 0;

  return (
    <div className="w-full h-72 sm:h-80 bg-[#111F33]/90 border border-[#2EC5FF]/30 rounded-3xl p-6 overflow-y-auto flex flex-col items-center shadow-2xl relative scroll-smooth">
      <div className="sticky top-0 bg-[#111F33]/95 backdrop-blur-md w-full py-2 mb-2 border-b border-[#1f3554] flex items-center justify-between px-2">
        <span className="text-xs font-bold text-[#2EC5FF] flex items-center gap-1.5">
          <FileText className="w-4 h-4" /> كلمات الأغنية المتزامنة
        </span>
        <span className="text-[10px] text-[#91A1B7]">اسحب أو انقر للانتقال</span>
      </div>

      <div className="w-full space-y-4 py-8 text-center">
        {lyricLines.map((line, idx) => {
          const isActive = idx === currentActiveIdx;
          return (
            <div
              key={idx}
              onClick={() => onSeekToTime && onSeekToTime(line.time)}
              className={`transition-all duration-300 cursor-pointer px-4 py-2 rounded-2xl ${
                isActive
                  ? "text-[#2EC5FF] font-bold text-lg scale-105 bg-[#2EC5FF]/10 border border-[#2EC5FF]/30 shadow-lg"
                  : "text-[#91A1B7] hover:text-[#F4F8FF] text-sm opacity-70"
              }`}
            >
              {line.text}
            </div>
          );
        })}
      </div>
    </div>
  );
};
