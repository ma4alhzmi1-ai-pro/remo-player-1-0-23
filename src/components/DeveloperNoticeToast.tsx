import React, { useEffect, useState } from 'react';
import { Shield, X, Award, CheckCircle2 } from 'lucide-react';

interface DeveloperNoticeToastProps {
  onClose?: () => void;
  duration?: number;
}

export const DeveloperNoticeToast: React.FC<DeveloperNoticeToastProps> = ({
  onClose,
  duration = 6000
}) => {
  const [visible, setVisible] = useState(true);
  const [progressWidth, setProgressWidth] = useState(100);

  useEffect(() => {
    const step = 50;
    const totalSteps = duration / step;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const remaining = 100 - (currentStep / totalSteps) * 100;
      setProgressWidth(Math.max(0, remaining));

      if (currentStep >= totalSteps) {
        clearInterval(interval);
        setVisible(false);
        if (onClose) onClose();
      }
    }, step);

    return () => clearInterval(interval);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div 
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg animate-bounce-short transition-all duration-500 shadow-2xl"
      dir="rtl"
    >
      <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500/60 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-4 sm:p-5 shadow-[0_10px_35px_rgba(245,158,11,0.25)] backdrop-blur-xl">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            {/* Golden Seal Icon */}
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30 border border-amber-300/40">
              <Award className="w-6 h-6 text-black" />
            </div>

            {/* Notification Text requested exactly by the user */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                  إشعار رسمي موثّق
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>معتمد 2026</span>
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                هذا التطبيق برمجة وتطوير المطور محمد الحزمي
              </h3>
              <p className="text-xs sm:text-sm text-amber-200/90 font-medium">
                جميع الحقوق محفوظة للمطور 2026
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => {
              setVisible(false);
              if (onClose) onClose();
            }}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            title="إغلاق الإشعار"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Countdown Bar */}
        <div className="mt-3.5 w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-100 ease-linear"
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
};
