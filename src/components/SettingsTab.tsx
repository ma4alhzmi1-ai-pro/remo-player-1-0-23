import React, { useState } from "react";
import { Settings, Shield, Sparkles, Smartphone, HardDrive, RefreshCw, Info, Code, Check } from "lucide-react";
import { AppSettings, MediaItem, Playlist } from "../types";
import { MVR_TO_MP4_FFMPEG_COMMAND, FFmpegOptimizationNotes } from "../utils/ffmpegConfig";

interface SettingsTabProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  mediaItems: MediaItem[];
  playlists: Playlist[];
  onResetData: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onUpdateSettings,
  mediaItems,
  playlists,
  onResetData,
}) => {
  const [showFfmpegModal, setShowFfmpegModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(MVR_TO_MP4_FFMPEG_COMMAND);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-28 px-4 pt-4 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-[#F4F8FF] tracking-tight">الإعدادات والتفضيلات</h2>
        <p className="text-xs text-[#91A1B7]">تخصيص تجربة التشغيل وإدارة البيانات المحلية</p>
      </div>

      {/* FFmpeg MVR to MP4 Optimizer Card */}
      <div className="bg-gradient-to-br from-[#111F33] to-[#1a1333] border border-[#2EC5FF]/30 rounded-3xl p-5 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#2EC5FF] flex items-center gap-2">
            <Code className="w-4 h-4" /> إعدادات تحويل MVR إلى MP4 (FFmpeg)
          </h3>
          <span className="text-[10px] bg-[#2EC5FF]/20 text-[#2EC5FF] px-2.5 py-0.5 rounded-full font-semibold">
            مُحسّن لمنع الارتجاف
          </span>
        </div>
        <p className="text-xs text-[#91A1B7] leading-relaxed">
          إعدادات ترميز الفيديو المتقدمة لضمان توافق تامة مع معايير الحاوية ومنع أي اهتزاز أو ارتجاف في الصورة أثناء التشغيل عبر إجبار معدل الإطارات الثابت (CFR).
        </p>
        <button
          onClick={() => setShowFfmpegModal(true)}
          className="px-4 py-2 rounded-xl bg-[#2EC5FF] text-[#08111F] text-xs font-bold shadow-lg shadow-[#2EC5FF]/20 hover:opacity-90 transition-all"
        >
          عرض كود وأوامر FFmpeg
        </button>
      </div>

      {/* Playback Preferences */}
      <div className="bg-[#111F33] border border-[#1f3554] rounded-3xl p-5 space-y-4 shadow-lg">
        <h3 className="text-sm font-bold text-[#2EC5FF] flex items-center gap-2">
          <Settings className="w-4 h-4" /> إعدادات التشغيل
        </h3>

        <div className="flex items-center justify-between py-2 border-b border-[#1f3554]">
          <div>
            <h4 className="text-sm font-semibold text-[#F4F8FF]">التشغيل التلقائي للملف التالي</h4>
            <p className="text-xs text-[#91A1B7]">الانتقال تلقائياً للملف الموالي عند انتهاء الحالي</p>
          </div>
          <input
            type="checkbox"
            checked={settings.autoPlayNext}
            onChange={(e) => onUpdateSettings({ autoPlayNext: e.target.checked })}
            className="w-5 h-5 rounded accent-[#2EC5FF] cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <h4 className="text-sm font-semibold text-[#F4F8FF]">الاهتزاز والتغذية الراجعة</h4>
            <p className="text-xs text-[#91A1B7]">تفعيل التأثيرات اللمسية عند الضغط على الأزرار</p>
          </div>
          <input
            type="checkbox"
            checked={settings.haptics}
            onChange={(e) => onUpdateSettings({ haptics: e.target.checked })}
            className="w-5 h-5 rounded accent-[#2EC5FF] cursor-pointer"
          />
        </div>
      </div>

      {/* Storage & Data Stats */}
      <div className="bg-[#111F33] border border-[#1f3554] rounded-3xl p-5 space-y-4 shadow-lg">
        <h3 className="text-sm font-bold text-[#2EC5FF] flex items-center gap-2">
          <HardDrive className="w-4 h-4" /> التخزين والبيانات المحلية
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#08111F] p-3.5 rounded-2xl border border-[#1f3554]">
            <span className="text-xs text-[#91A1B7]">إجمالي الملفات</span>
            <p className="text-lg font-bold text-[#F4F8FF] mt-1">{mediaItems.length} ملف</p>
          </div>
          <div className="bg-[#08111F] p-3.5 rounded-2xl border border-[#1f3554]">
            <span className="text-xs text-[#91A1B7]">قوائم التشغيل</span>
            <p className="text-lg font-bold text-[#F4F8FF] mt-1">{playlists.length} قائمة</p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <p className="text-xs text-[#91A1B7]">إعادة ضبط البيانات الافتراضية للمكتبة</p>
          <button
            onClick={onResetData}
            className="px-3.5 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>استعادة الافتراضي</span>
          </button>
        </div>
      </div>

      {/* App Info & Credits */}
      <div className="bg-[#111F33] border border-[#1f3554] rounded-3xl p-5 space-y-3 shadow-lg">
        <h3 className="text-sm font-bold text-[#2EC5FF] flex items-center gap-2">
          <Info className="w-4 h-4" /> حول التطبيق
        </h3>
        <p className="text-xs text-[#91A1B7] leading-relaxed">
          <strong>Remo Player 1.0.23</strong> هو تطبيق مشغل وسائط محلي متطور مصمم خصيصاً لتوفير تجربة تشغيل سريعة، نظيفة، وآمنة للملفات المحلية بدون أي إعلانات أو تتبع سحابي.
        </p>
        <div className="text-[11px] text-[#2EC5FF] pt-1">
          جميع الحقوق محفوظة © 2026 - Remo Player Project
        </div>
      </div>

      {/* FFmpeg Modal */}
      {showFfmpegModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111F33] border border-[#2EC5FF]/30 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#F4F8FF]">إعدادات FFmpeg لتحويل MVR إلى MP4</h3>
              <button onClick={() => setShowFfmpegModal(false)} className="text-gray-400 hover:text-white text-xs">
                إغلاق
              </button>
            </div>

            <div className="bg-[#08111F] p-3 rounded-2xl border border-[#1f3554] font-mono text-[11px] text-[#2EC5FF] overflow-x-auto whitespace-pre">
              {MVR_TO_MP4_FFMPEG_COMMAND}
            </div>

            <div className="space-y-2 text-xs text-[#91A1B7]">
              <p>• <strong>الترميز:</strong> {FFmpegOptimizationNotes.videoCodec}</p>
              <p>• <strong>معدل الإطارات:</strong> {FFmpegOptimizationNotes.frameRateControl}</p>
              <p>• <strong>تنسيق الألوان:</strong> {FFmpegOptimizationNotes.pixelFormat}</p>
              <p>• <strong>الحاوية:</strong> {FFmpegOptimizationNotes.containerFlag}</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleCopyCommand}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2EC5FF] text-[#08111F] text-xs font-bold"
              >
                {copied ? <Check className="w-4 h-4" /> : null}
                <span>{copied ? "تم النسخ!" : "نسخ الأمر"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
