import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, Download, X, CheckCircle2, Volume2, Type, ExternalLink, Bell, BellRing, Smartphone } from 'lucide-react';

interface UpdateNotificationModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function UpdateNotificationModal({ isOpen: controlledIsOpen, onClose }: UpdateNotificationModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const [notifSent, setNotifSent] = useState(false);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  // Play audio chime
  const playNotificationSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // Audio context might be restricted before interaction
    }
  };

  const sendBrowserNotification = async () => {
    playNotificationSound();
    setNotifSent(true);

    if ('Notification' in window) {
      try {
        let perm = Notification.permission;
        if (perm === 'default') {
          perm = await Notification.requestPermission();
        }
        if (perm === 'granted') {
          new Notification('🔔 تحديث ريمو كيبورد v1.0.16 متوفر الآن!', {
            body: 'ميزة الخطوط العربية الفعلية + الكيبورد الناطق للكلمات كاملة. انقر للتحميل الفوري.',
            icon: '/developer-welcome.png'
          });
        }
      } catch {
        // Notification permission rejected
      }
    }
    setTimeout(() => setNotifSent(false), 3500);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const handleDirectDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300" dir="rtl">
      <div className="relative w-full max-w-lg rounded-2xl border-2 border-emerald-500/60 bg-slate-900 shadow-2xl overflow-hidden text-right">
        {/* Header Banner */}
        <div className="relative p-6 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border-b border-slate-800">
          <button
            onClick={handleClose}
            className="absolute top-4 left-4 p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/40 animate-pulse flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              🔔 إشعار تحديث أونلاين مباشر
            </span>
            <span className="flex items-center gap-1 text-xs text-cyan-400 font-mono font-bold bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              النسخة الجديدة v1.0.16
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">
            تحديث ريمو كيبورد الجديد جاهز للتحميل 🚀
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            تم إرسال هذا الإشعار أونلاين لإعلامك بوجود إصدار أحدث (v1.0.16) يحتوي على ميزات جوهرية جديدة.
          </p>
        </div>

        {/* Features List */}
        <div className="p-5 space-y-3 max-h-[50vh] overflow-y-auto">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/70 border border-emerald-500/40 shadow-sm">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
              <Type className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">الكتابة الفعلية بالخطوط العربية الحقيقية</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                عند اختيار أي خط عربي (القاهرة، الأميري، تجوال، رقعة عارف، المراعي)، يتم كتابة النصوص وتوليدها فعلياً بالخط المحدد وليس مجرد رموز على الأزرار.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/70 border border-purple-500/40 shadow-sm">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 mt-0.5">
              <Volume2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">الكيبورد الناطق الذكي (نطق الكلمة كاملة بعد اكتمالها)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                نطق الكلمة كاملة وبصوت عربي واضح فور الانتهاء منها (عند الضغط على المسافة، الفاصلة، النقطة، أو زر الإدخال)، لتجربة كتابة ذكية وسلسة.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/70 border border-blue-500/40 shadow-sm">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 mt-0.5">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">شعارات الأندية، الثيمات ثلاثية الأبعاد والتحكم بالارتفاع</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                خلفيات حية لأشهر الأندية العربية والعالمية، أزرار القلوب المتوهجة، وتحكم فوري بارتفاع الكيبورد وحجم الخط.
              </p>
            </div>
          </div>

          {/* Quick Notification Broadcast Test */}
          <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-medium">
              <BellRing className="w-4 h-4 text-cyan-400 animate-bounce" />
              <span>إشعار النظام والمتصفح الفوري:</span>
            </div>
            <button
              onClick={sendBrowserNotification}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1"
            >
              {notifSent ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>تم إرسال الإشعار!</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5" />
                  <span>إرسال إشعار للنظام الآن</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <button
              onClick={() => handleDirectDownload('/RemoKeyboard-1.0.16.apk', 'RemoKeyboard-1.0.16.apk')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تحميل التحديث الجديد (APK)</span>
            </button>
            <a
              href="https://github.com/ma4alhzmi1-ai-pro/RemoKeyboard-Pro/releases/download/v1.0.16/RemoKeyboard-1.0.16.apk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-semibold transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>رابط GitHub مباشر</span>
            </a>
          </div>
          <button
            onClick={handleClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800/80 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-all active:scale-95 cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
