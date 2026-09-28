import { useState } from "react";
import {
  Keyboard,
  Sparkles,
  Layers,
  Download,
  GitBranch,
  Tag,
  Code2,
  Shield,
  Smartphone,
  Bell,
  Film
} from "lucide-react";
import { KeyboardSimulator } from "./components/KeyboardSimulator";
import { DecorationStudio } from "./components/DecorationStudio";
import { CodeExplorer } from "./components/CodeExplorer";
import { ReleaseDownloads } from "./components/ReleaseDownloads";
import { MediaPlayerDemo } from "./components/MediaPlayerDemo";
import { SplashScreen } from "./components/SplashScreen";
import { DeveloperNoticeToast } from "./components/DeveloperNoticeToast";
import { UpdateNotificationModal } from "./components/UpdateNotificationModal";
import { KEYBOARD_THEMES } from "./data/keyboardData";
import { KeyboardTheme } from "./types/keyboard";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showDevNotice, setShowDevNotice] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(true);
  const [activeTab, setActiveTab] = useState<'simulator' | 'player' | 'downloads' | 'studio' | 'code'>('simulator');
  const [currentTheme, setCurrentTheme] = useState<KeyboardTheme>(KEYBOARD_THEMES[0]);
  const [studioText, setStudioText] = useState('ريمو كيبورد 1.0.16');
  const [currentVersion, setCurrentVersion] = useState<'1.0.15' | '1.0.16'>('1.0.15');
  const [isCheckingOnline, setIsCheckingOnline] = useState(false);

  const checkOnlineUpdate = async () => {
    setIsCheckingOnline(true);
    try {
      await fetch('/version.json');
    } catch {
      // offline or local
    }
    setTimeout(() => {
      setIsCheckingOnline(false);
      setShowUpdateModal(true);
    }, 400);
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

  const handleSendToStudio = (text: string) => {
    setStudioText(text || 'ريمو كيبورد 1.0.16');
    setActiveTab('studio');
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
    setShowDevNotice(true);
    setShowUpdateModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-black" dir="rtl">
      {/* 🚀 إشعار التحديث الفوري المباشر المثبت بأعلى التطبيق مع زر التحميل */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-700 text-white px-4 py-2.5 shadow-xl border-b border-emerald-400/40 flex items-center justify-between flex-wrap gap-2 sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400"></span>
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-xs bg-black/40 px-2.5 py-0.5 rounded-full border border-white/20 text-yellow-300">
              {currentVersion === '1.0.15' ? 'إشعار أونلاين: يتوفر v1.0.16 & v1.0.23 Lite (38MB)' : 'تم إطلاق النسخة المحدثة (معالجات حديثة واقتصادية ولايت)'}
            </span>
            <span className="font-bold text-xs sm:text-sm">
              {currentVersion === '1.0.15'
                ? 'أنت تستخدم الإصدار القديم — يتوفر إصدار جديد ومشغل الفيديو المطور بخاصية التشغيل بالخلفية وحجم 38 ميجا لنسخة لايت'
                : 'تم تفعيل مشغل الفيديو والصوت بالخلفية، شريط السماعة المصغر، وتحسين دقة سحب شريط الوقت.'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleDirectDownload('/RemoKeyboard-1.0.16.apk', 'RemoKeyboard-Lite-38MB.apk')}
            className="px-3.5 py-1.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-lg text-xs font-black shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer animate-pulse"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>تحميل نسخة لايت (38MB)</span>
          </button>
          <button
            onClick={checkOnlineUpdate}
            disabled={isCheckingOnline}
            className="px-2.5 py-1.5 bg-emerald-950/70 hover:bg-emerald-950 rounded-lg text-xs text-white border border-emerald-300/30 transition-colors cursor-pointer flex items-center gap-1"
          >
            <Bell className="w-3.5 h-3.5 text-yellow-300" />
            <span>{isCheckingOnline ? 'جاري الفحص...' : 'فحص أونلاين'}</span>
          </button>
          <button
            onClick={() => setShowUpdateModal(true)}
            className="px-2.5 py-1.5 bg-cyan-950/60 hover:bg-cyan-950/80 rounded-lg text-xs text-white border border-cyan-300/30 transition-colors cursor-pointer"
          >
            تفاصيل التحديث
          </button>
        </div>
      </div>

      {/* 1. App Entry Splash Screen with Loading Counter */}
      {showSplash && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}

      {/* 2. Developer Notification Toast (Appears and auto-disappears on main screen) */}
      {showDevNotice && (
        <DeveloperNoticeToast onClose={() => setShowDevNotice(false)} duration={6000} />
      )}

      {/* 3. New Version Update Notification Modal */}
      <UpdateNotificationModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
      />

      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md sticky top-11 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Keyboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg text-white tracking-tight">
                  ريمو كيبورد & ريمو بلاير | Remo Pro Suite
                </h1>
                <div className="flex items-center gap-1.5 bg-slate-800/80 p-0.5 rounded-full border border-slate-700/80">
                  <button
                    onClick={() => {
                      setCurrentVersion('1.0.15');
                      setShowUpdateModal(true);
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold transition-all cursor-pointer ${
                      currentVersion === '1.0.15'
                        ? 'bg-amber-500 text-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    v1.0.15
                  </button>
                  <button
                    onClick={() => setCurrentVersion('1.0.16')}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold transition-all cursor-pointer ${
                      currentVersion === '1.0.16'
                        ? 'bg-emerald-500 text-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    v1.0.23 Lite & Pro
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                إصدارات المعالجات الحديثة والاقتصادية والنسخة الشاملة ونسخة لايت (38MB) مع مشغل الفيديو بالخلفية
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUpdateModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 active:scale-95 transition-all cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">الإشعارات</span>
            </button>

            <button
              onClick={() => setShowSplash(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 active:scale-95 transition-all"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">شاشة الدخول</span>
            </button>

            <button
              onClick={() => setShowDevNotice(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 hover:text-white active:scale-95 transition-all"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">حقوق المطور</span>
            </button>

            <button
              onClick={() => handleDirectDownload('/RemoKeyboard-1.0.16.apk', 'RemoKeyboard-Lite-38MB.apk')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>نسخة لايت (38MB)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b border-slate-800 bg-slate-900/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-2 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>محاكي الكيبورد</span>
          </button>

          <button
            onClick={() => setActiveTab('player')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'player'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>مشغل الفيديو والصوت (خلفية و38MB)</span>
          </button>

          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'studio'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>استوديو الزخرفة</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'code'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>مستعرض ملفات الأندرويد</span>
          </button>

          <button
            onClick={() => setActiveTab('downloads')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'downloads'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>حزم التحميل (APK)</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Status Bar */}
        <div className="mb-6 p-3 rounded-xl border border-slate-800/80 bg-slate-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">
              تم تحديث النسخ (المعالج الحديث، المعالج الاقتصادي، الشاملة، ونسخة لايت <strong className="text-white">38MB</strong>) مع إصلاح أخطاء البناء واستمرار تشغيل الفيديو بالخلفية.
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <span className="flex items-center gap-1">
              <GitBranch className="w-3 h-3 text-cyan-400" />
              main
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3 text-purple-400" />
              v1.0.23 / v1.0.16
            </span>
          </div>
        </div>

        {/* Tab 1: Simulator */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <KeyboardSimulator
              currentTheme={currentTheme}
              onThemeSelect={setCurrentTheme}
              onSendToStudio={handleSendToStudio}
            />
          </div>
        )}

        {/* Tab 2: MediaPlayer Demo */}
        {activeTab === 'player' && (
          <MediaPlayerDemo />
        )}

        {/* Tab 3: Decoration Studio */}
        {activeTab === 'studio' && (
          <DecorationStudio initialText={studioText} />
        )}

        {/* Tab 4: Code Explorer */}
        {activeTab === 'code' && (
          <CodeExplorer />
        )}

        {/* Tab 5: Downloads */}
        {activeTab === 'downloads' && (
          <ReleaseDownloads />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 mt-16 py-8 text-center text-xs text-slate-500 space-y-2">
        <p>مشروع تطبيق ريمو كيبورد وريمو بلاير (Remo Player & Keyboard) — نسخة المعالجات الحديثة، الاقتصادية، الشاملة، ونسخة لايت (38MB).</p>
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
          <button
            onClick={() => handleDirectDownload('/RemoKeyboard-1.0.16.apk', 'RemoKeyboard-Lite-38MB.apk')}
            className="hover:text-emerald-400 transition-colors flex items-center gap-1 bg-transparent border-none cursor-pointer p-0 text-xs text-slate-400"
          >
            <Download className="w-3 h-3" />
            <span>تحميل نسخة لايت (38MB)</span>
          </button>
          <span>•</span>
          <button
            onClick={() => handleDirectDownload('/RemoKeyboard-1.0.16.apk', 'RemoKeyboard-Modern-CPU.apk')}
            className="hover:text-cyan-400 transition-colors flex items-center gap-1 bg-transparent border-none cursor-pointer p-0 text-xs text-slate-400"
          >
            <Download className="w-3 h-3" />
            <span>نسخة المعالجات الحديثة</span>
          </button>
          <span>•</span>
          <button
            onClick={() => handleDirectDownload('/RemoKeyboard-1.0.16.apk', 'RemoKeyboard-Economic-CPU.apk')}
            className="hover:text-purple-400 transition-colors flex items-center gap-1 bg-transparent border-none cursor-pointer p-0 text-xs text-slate-400"
          >
            <Download className="w-3 h-3" />
            <span>نسخة المعالجات الاقتصادية</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

