import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  autoStart?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, autoStart = true }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('تهيئة نظام ريمو كيبورد...');

  useEffect(() => {
    if (!autoStart) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 2;
        if (next < 25) {
          setStatusText('تهيئة نظام ريمو كيبورد والمحرك الأصلي...');
        } else if (next < 55) {
          setStatusText('تحميل مكتبة الخطوط العربية واللاتينية (16 نمطاً)...');
        } else if (next < 80) {
          setStatusText('تفعيل كيبورد الكمبيوتر ومحرك الزخرفة (60 نمطاً)...');
        } else if (next < 100) {
          setStatusText('اكتمال الإعداد والتجهيز بنجاح...');
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 400);
          return 100;
        }
        return next;
      });
    }, 45); // ~2.2 seconds total

    return () => clearInterval(interval);
  }, [autoStart, onComplete]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#070709] text-white flex flex-col items-center justify-between p-4 sm:p-8 select-none overflow-y-auto animate-fadeIn"
      dir="rtl"
    >
      {/* Subtle Luxury Ambient Background Glow */}
      <div className="absolute inset-0 bg-radial from-amber-500/10 via-black to-black pointer-events-none" />

      {/* Top Header Badge */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-amber-500/30 text-amber-300 text-xs font-semibold backdrop-blur-md shadow-lg shadow-amber-950/40">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>تطبيق ريمو كيبورد الرسمي v1.0.16</span>
        </div>

        <button
          onClick={onComplete}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 active:scale-95 transition-all shadow-md backdrop-blur-md"
        >
          <span>تخطي والدخول</span>
          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
        </button>
      </div>

      {/* Main Image Showcase (User Uploaded Artwork) */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center max-w-3xl w-full">
        <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.2)] bg-black/60 group">
          <img
            src="/developer-welcome.png"
            alt="محمد الحزمي لبرمجة وتطوير تطبيقات الاندرويد"
            className="w-full h-auto object-contain max-h-[55vh] transition-transform duration-700 group-hover:scale-[1.01]"
            onError={(e) => {
              // Fallback to splash-welcome.png if developer-welcome fails
              (e.target as HTMLImageElement).src = '/splash-welcome.png';
            }}
          />
          {/* Subtle Golden Scanline / Highlight */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
        </div>

        {/* Developer Attribution Title */}
        <div className="text-center mt-4 sm:mt-6 space-y-1">
          <h2 className="text-xl sm:text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
            محمد الحزمي
          </h2>
          <p className="text-xs sm:text-sm text-amber-200/80 font-medium">
            لبرمجة وتطوير تطبيقات الاندرويد
          </p>
        </div>
      </div>

      {/* Entry Countdown & Progress Section (شريط عداد دخول التطبيق) */}
      <div className="relative z-10 w-full max-w-xl pb-4 sm:pb-6 space-y-3">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
          <span className="text-amber-300/90 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-400" />
            <span>{statusText}</span>
          </span>
          <span className="font-mono text-amber-400 bg-black/60 px-2 py-0.5 rounded border border-amber-500/30">
            {progress}%
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full h-3 bg-zinc-900/90 rounded-full border border-amber-500/30 p-0.5 overflow-hidden shadow-inner">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all duration-100 ease-out shadow-[0_0_15px_rgba(245,158,11,0.6)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Footer info */}
        <div className="text-center">
          <p className="text-[11px] text-zinc-500 font-sans">
            جميع الحقوق محفوظة للمطور محمد الحزمي 2026 ©
          </p>
        </div>
      </div>
    </div>
  );
};
