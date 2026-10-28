import React, { useState } from 'react';
import { KeyboardTheme, CalligraphyFont } from '../types/keyboard';
import { 
  CornerDownLeft, 
  Delete, 
  Volume2, 
  VolumeX, 
  Languages, 
  Copy, 
  Scissors, 
  RotateCcw,
  Sparkles,
  Search,
  Calendar,
  Layers,
  HelpCircle,
  Maximize2
} from 'lucide-react';

interface PCKeyboardLayoutProps {
  theme: KeyboardTheme;
  language: 'ar' | 'en';
  activeFont: CalligraphyFont;
  soundFeedback: boolean;
  onKeyInput: (char: string) => void;
  onDelete: () => void;
  onForwardDelete: () => void;
  onEnter: () => void;
  onSpace: () => void;
  onTab: () => void;
  onMoveCursor: (direction: 'left' | 'right' | 'up' | 'down' | 'home' | 'end') => void;
  onSelectAll: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onCut: () => void;
  onUndo: () => void;
  onClear: () => void;
  onToggleLanguage: () => void;
  onToggleSound: () => void;
  onOpenThemes?: () => void;
  onOpenClipboard?: () => void;
  onInsertDate?: () => void;
}

export const PCKeyboardLayout: React.FC<PCKeyboardLayoutProps> = ({
  theme,
  language,
  activeFont,
  soundFeedback,
  onKeyInput,
  onDelete,
  onForwardDelete,
  onEnter,
  onSpace,
  onTab,
  onMoveCursor,
  onSelectAll,
  onCopy,
  onPaste,
  onCut,
  onUndo,
  onClear,
  onToggleLanguage,
  onToggleSound,
  onOpenThemes,
  onOpenClipboard,
  onInsertDate
}) => {
  const [capsLock, setCapsLock] = useState(false);
  const [shiftActive, setShiftActive] = useState(false);
  const [ctrlActive, setCtrlActive] = useState(false);
  const [altActive, setAltActive] = useState(false);
  const [numLock, setNumLock] = useState(true);
  const [showNumpad, setShowNumpad] = useState(true);
  const [showFunctionRow, setShowFunctionRow] = useState(true);
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  // High-fidelity mechanical switch click simulation (Web Audio API)
  const playMechanicalClick = (type: 'standard' | 'space' | 'enter' | 'modifier' = 'standard') => {
    if (!soundFeedback) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Crisp mechanical click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const freqMap = {
        standard: 800,
        space: 400,
        enter: 600,
        modifier: 950
      };

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freqMap[type], ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Audio context may be blocked by browser policy until interaction
    }
  };

  const handleKeyPress = (keyId: string, action: () => void, soundType: 'standard' | 'space' | 'enter' | 'modifier' = 'standard') => {
    setPressedKey(keyId);
    playMechanicalClick(soundType);
    action();
    setTimeout(() => setPressedKey(null), 120);
  };

  // Typing a letter with Shift and Capslock awareness
  const handleCharClick = (arChar: string, enChar: string, arShiftChar?: string, enShiftChar?: string) => {
    let chosen = '';
    if (language === 'ar') {
      if (shiftActive && arShiftChar) {
        chosen = arShiftChar;
      } else {
        chosen = arChar;
      }
    } else {
      const isUpper = (capsLock && !shiftActive) || (!capsLock && shiftActive);
      if (shiftActive && enShiftChar) {
        chosen = enShiftChar;
      } else {
        chosen = isUpper ? enChar.toUpperCase() : enChar.toLowerCase();
      }
    }

    // Check Ctrl shortcut combinations
    if (ctrlActive) {
      const lower = enChar.toLowerCase();
      if (lower === 'a') { onSelectAll(); setCtrlActive(false); return; }
      if (lower === 'c') { onCopy(); setCtrlActive(false); return; }
      if (lower === 'v') { onPaste(); setCtrlActive(false); return; }
      if (lower === 'x') { onCut(); setCtrlActive(false); return; }
      if (lower === 'z') { onUndo(); setCtrlActive(false); return; }
    }

    const transformed = activeFont.transformChar(chosen);
    onKeyInput(transformed);

    // Auto-release Shift after single character if active
    if (shiftActive) {
      setShiftActive(false);
    }
  };

  // PC Number row definition
  const numRow = [
    { ar: 'ذ', en: '`', arShift: 'ّ', enShift: '~' },
    { ar: '1', en: '1', arShift: '!', enShift: '!' },
    { ar: '2', en: '2', arShift: '@', enShift: '@' },
    { ar: '3', en: '3', arShift: '#', enShift: '#' },
    { ar: '4', en: '4', arShift: '$', enShift: '$' },
    { ar: '5', en: '5', arShift: '%', enShift: '%' },
    { ar: '6', en: '6', arShift: '^', enShift: '^' },
    { ar: '7', en: '7', arShift: '&', enShift: '&' },
    { ar: '8', en: '8', arShift: '*', enShift: '*' },
    { ar: '9', en: '9', arShift: ')', enShift: '(' },
    { ar: '0', en: '0', arShift: '(', enShift: ')' },
    { ar: '-', en: '-', arShift: '_', enShift: '_' },
    { ar: '=', en: '=', arShift: '+', enShift: '+' }
  ];

  // QWERTY / Arabic Rows
  const qRow = [
    { ar: 'ض', en: 'Q', arShift: 'َ', enShift: 'Q' },
    { ar: 'ص', en: 'W', arShift: 'ً', enShift: 'W' },
    { ar: 'ث', en: 'E', arShift: 'ُ', enShift: 'E' },
    { ar: 'ق', en: 'R', arShift: 'ٌ', enShift: 'R' },
    { ar: 'ف', en: 'T', arShift: 'لإ', enShift: 'T' },
    { ar: 'غ', en: 'Y', arShift: 'إ', enShift: 'Y' },
    { ar: 'ع', en: 'U', arShift: '‘', enShift: 'U' },
    { ar: 'ه', en: 'I', arShift: '÷', enShift: 'I' },
    { ar: 'خ', en: 'O', arShift: '×', enShift: 'O' },
    { ar: 'ح', en: 'P', arShift: '؛', enShift: 'P' },
    { ar: 'ج', en: '[', arShift: '<', enShift: '{' },
    { ar: 'د', en: ']', arShift: '>', enShift: '}' },
    { ar: '\\', en: '\\', arShift: '|', enShift: '|' }
  ];

  const aRow = [
    { ar: 'ش', en: 'A', arShift: 'ِ', enShift: 'A' },
    { ar: 'س', en: 'S', arShift: 'ٍ', enShift: 'S' },
    { ar: 'ي', en: 'D', arShift: ']', enShift: 'D' },
    { ar: 'ب', en: 'F', arShift: '[', enShift: 'F' },
    { ar: 'ل', en: 'G', arShift: 'لأ', enShift: 'G' },
    { ar: 'ا', en: 'H', arShift: 'أ', enShift: 'H' },
    { ar: 'ت', en: 'J', arShift: 'ـ', enShift: 'J' },
    { ar: 'ن', en: 'K', arShift: '،', enShift: 'K' },
    { ar: 'م', en: 'L', arShift: '/', enShift: 'L' },
    { ar: 'ك', en: ';', arShift: ':', enShift: ':' },
    { ar: 'ط', en: '\'', arShift: '"', enShift: '"' }
  ];

  const zRow = [
    { ar: 'ئ', en: 'Z', arShift: '~', enShift: 'Z' },
    { ar: 'ء', en: 'X', arShift: 'ْ', enShift: 'X' },
    { ar: 'ؤ', en: 'C', arShift: '}', enShift: 'C' },
    { ar: 'ر', en: 'V', arShift: '{', enShift: 'V' },
    { ar: 'لا', en: 'B', arShift: 'لآ', enShift: 'B' },
    { ar: 'ى', en: 'N', arShift: 'آ', enShift: 'N' },
    { ar: 'ة', en: 'M', arShift: '’', enShift: 'M' },
    { ar: 'و', en: ',', arShift: ',', enShift: '<' },
    { ar: 'ز', en: '.', arShift: '.', enShift: '>' },
    { ar: 'ظ', en: '/', arShift: '؟', enShift: '?' }
  ];

  return (
    <div className={`w-full rounded-2xl border ${theme.keyBorder} ${theme.keyboardBg} p-2.5 sm:p-4 select-none shadow-2xl transition-all duration-200`} dir="ltr">
      {/* PC Top Status Bar */}
      <div className="flex items-center justify-between px-2 py-1.5 mb-2.5 bg-black/40 rounded-xl border border-white/5 text-[11px] font-mono">
        <div className="flex items-center gap-2.5 text-slate-400">
          <span className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${capsLock ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-slate-600'}`} />
            <span>CAPS</span>
          </span>
          <span className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${numLock ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-slate-600'}`} />
            <span>NUM</span>
          </span>
          <span className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${shiftActive ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-slate-600'}`} />
            <span>SHIFT</span>
          </span>
          <span className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${ctrlActive ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-slate-600'}`} />
            <span>CTRL</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFunctionRow(!showFunctionRow)}
            className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 transition-colors text-[10px]"
          >
            {showFunctionRow ? 'إخفاء F-Keys' : 'إظهار F-Keys'}
          </button>
          <button
            onClick={() => setShowNumpad(!showNumpad)}
            className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 transition-colors text-[10px]"
          >
            {showNumpad ? 'إخفاء NumPad' : 'إظهار NumPad'}
          </button>
          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
            {language === 'ar' ? 'العربية 101/102' : 'US English PC'}
          </span>
        </div>
      </div>

      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1">
        {/* Main Keyboard Cluster (60% / 80%) */}
        <div className="flex-1 min-w-[580px] flex flex-col gap-1.5">
          {/* Row 0: Function Keys (F1 - F12, Esc) */}
          {showFunctionRow && (
            <div className="flex gap-1 justify-between mb-1 pb-1 border-b border-white/5">
              <button
                onClick={() => handleKeyPress('esc', onClear, 'modifier')}
                className={`h-7 px-2.5 rounded text-[10px] font-bold tracking-wider uppercase border border-red-500/30 bg-red-950/40 text-red-300 hover:bg-red-900/60 active:scale-95 transition-all shadow-sm`}
                title="مسح النص / إلغاء"
              >
                Esc
              </button>

              <div className="flex gap-1">
                <button
                  onClick={() => handleKeyPress('f1', () => alert('تعليمات ريمو كيبورد: يدعم الاختصارات والخطوط وتغيير الثيمات وتصدير النصوص!'), 'modifier')}
                  className="h-7 px-2 rounded text-[10px] font-semibold border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                >
                  F1
                </button>
                <button
                  onClick={() => handleKeyPress('f2', () => onInsertDate && onInsertDate(), 'modifier')}
                  className="h-7 px-2 rounded text-[10px] font-semibold border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  title="إدراج التاريخ والوقت"
                >
                  F2
                </button>
                <button
                  onClick={() => handleKeyPress('f3', onSelectAll, 'modifier')}
                  className="h-7 px-2 rounded text-[10px] font-semibold border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  title="تحديد الكل"
                >
                  F3
                </button>
                <button
                  onClick={() => handleKeyPress('f4', onCopy, 'modifier')}
                  className="h-7 px-2 rounded text-[10px] font-semibold border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  title="نسخ"
                >
                  F4
                </button>
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => handleKeyPress('f5', () => window.location.reload(), 'modifier')}
                  className="h-7 px-2 rounded text-[10px] font-semibold border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  title="تحديث"
                >
                  F5
                </button>
                <button
                  onClick={() => handleKeyPress('f6', () => onOpenClipboard && onOpenClipboard(), 'modifier')}
                  className="h-7 px-2 rounded text-[10px] font-semibold border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  title="الحافظة الذكية"
                >
                  F6
                </button>
                <button
                  onClick={() => handleKeyPress('f7', () => onKeyInput('ـ'), 'modifier')}
                  className="h-7 px-2 rounded text-[10px] font-semibold border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  title="إدراج كشيدة تطويل (ـ)"
                >
                  F7
                </button>
                <button
                  onClick={() => handleKeyPress('f8', onToggleLanguage, 'modifier')}
                  className="h-7 px-2 rounded text-[10px] font-semibold border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  title="تبديل اللغة"
                >
                  F8
                </button>
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => handleKeyPress('f9', onToggleSound, 'modifier')}
                  className="h-7 px-2 rounded text-[10px] font-semibold border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  title="كتم/تشغيل الصوت الميكانيكي"
                >
                  {soundFeedback ? <Volume2 className="w-3 h-3 text-emerald-400" /> : <VolumeX className="w-3 h-3 text-red-400" />}
                </button>
                <button
                  onClick={() => handleKeyPress('f10', () => onOpenThemes && onOpenThemes(), 'modifier')}
                  className="h-7 px-2 rounded text-[10px] font-semibold border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  title="الثيمات والألوان"
                >
                  F10
                </button>
                <button
                  onClick={() => handleKeyPress('f11', onSelectAll, 'modifier')}
                  className="h-7 px-2 rounded text-[10px] font-semibold border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  title="تحديد الكل"
                >
                  F11
                </button>
                <button
                  onClick={() => handleKeyPress('f12', onCopy, 'modifier')}
                  className="h-7 px-2 rounded text-[10px] font-semibold border border-white/10 bg-white/5 text-emerald-300 hover:bg-white/10"
                  title="نسخ النص كاملاً"
                >
                  F12
                </button>
              </div>
            </div>
          )}

          {/* Row 1: Number Row */}
          <div className="flex gap-1 justify-between">
            {numRow.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleKeyPress(`num-${idx}`, () => handleCharClick(item.ar, item.en, item.arShift, item.enShift))}
                className={`flex-1 h-9 sm:h-10 rounded-lg border ${theme.keyBorder} ${theme.keyBg} active:scale-95 transition-all flex flex-col items-center justify-center relative p-0.5 shadow-sm group hover:brightness-110`}
              >
                <span className={`text-[10px] ${theme.keySecondary} leading-none font-mono`}>
                  {shiftActive ? (language === 'ar' ? item.arShift : item.enShift) : (language === 'ar' ? item.arShift : item.enShift)}
                </span>
                <span className={`text-xs sm:text-sm font-bold ${theme.keyText} leading-none`}>
                  {language === 'ar' ? item.ar : item.en}
                </span>
              </button>
            ))}

            <button
              onClick={() => handleKeyPress('backspace', onDelete, 'enter')}
              className={`w-14 sm:w-16 h-9 sm:h-10 rounded-lg border border-red-500/30 bg-red-950/40 text-red-200 hover:bg-red-900/60 active:scale-95 transition-all flex items-center justify-center gap-1 shadow-sm`}
              title="حذف للخلف (Backspace)"
            >
              <Delete className="w-4 h-4" />
              <span className="text-[10px] font-mono hidden sm:inline">Backspace</span>
            </button>
          </div>

          {/* Row 2: Tab & QWERTY */}
          <div className="flex gap-1 justify-between">
            <button
              onClick={() => handleKeyPress('tab', onTab, 'modifier')}
              className={`w-12 sm:w-14 h-9 sm:h-10 rounded-lg border ${theme.keyBorder} ${theme.specialKeyBg} active:scale-95 transition-all flex items-center justify-center shadow-sm text-[10px] font-mono font-bold`}
              title="مسافة الجدولة (Tab)"
            >
              Tab ⇥
            </button>

            {qRow.map((item, idx) => {
              const displayChar = language === 'ar' 
                ? (activeFont.id !== 'default' ? activeFont.transformChar(item.ar) : item.ar)
                : (capsLock ? item.en.toUpperCase() : item.en.toLowerCase());
              return (
                <button
                  key={idx}
                  onClick={() => handleKeyPress(`q-${idx}`, () => handleCharClick(item.ar, item.en, item.arShift, item.enShift))}
                  className={`flex-1 h-9 sm:h-10 rounded-lg border ${theme.keyBorder} ${theme.keyBg} active:scale-95 transition-all flex flex-col items-center justify-center relative p-0.5 shadow-sm hover:brightness-110`}
                >
                  <div className="flex justify-between w-full px-1">
                    <span className={`text-[9px] ${theme.keySecondary} font-mono uppercase`}>
                      {item.en}
                    </span>
                    {item.arShift && (
                      <span className="text-[9px] text-amber-400/80 font-bold">
                        {item.arShift}
                      </span>
                    )}
                  </div>
                  <span 
                    style={{ 
                      fontFamily: (language === 'ar' && activeFont.fontFamily && activeFont.fontFamily !== 'inherit') 
                        ? activeFont.fontFamily 
                        : undefined 
                    }}
                    className={`text-sm sm:text-base font-bold ${language === 'ar' ? 'text-amber-300' : theme.keyText}`}
                  >
                    {displayChar}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Row 3: CapsLock & Home Row */}
          <div className="flex gap-1 justify-between">
            <button
              onClick={() => {
                setCapsLock(!capsLock);
                playMechanicalClick('modifier');
              }}
              className={`w-14 sm:w-16 h-9 sm:h-10 rounded-lg border ${capsLock ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]' : `${theme.keyBorder} ${theme.specialKeyBg}`} active:scale-95 transition-all flex items-center justify-between px-2 text-[10px] font-mono`}
              title="تثبيت الحروف الكبيرة (Caps Lock)"
            >
              <span>Caps</span>
              <span className={`w-1.5 h-1.5 rounded-full ${capsLock ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            </button>

            {aRow.map((item, idx) => {
              const displayChar = language === 'ar' 
                ? (activeFont.id !== 'default' ? activeFont.transformChar(item.ar) : item.ar)
                : (capsLock ? item.en.toUpperCase() : item.en.toLowerCase());
              return (
                <button
                  key={idx}
                  onClick={() => handleKeyPress(`a-${idx}`, () => handleCharClick(item.ar, item.en, item.arShift, item.enShift))}
                  className={`flex-1 h-9 sm:h-10 rounded-lg border ${theme.keyBorder} ${theme.keyBg} active:scale-95 transition-all flex flex-col items-center justify-center relative p-0.5 shadow-sm hover:brightness-110`}
                >
                  <div className="flex justify-between w-full px-1">
                    <span className={`text-[9px] ${theme.keySecondary} font-mono uppercase`}>
                      {item.en}
                    </span>
                    {item.arShift && (
                      <span className="text-[9px] text-amber-400/80 font-bold">
                        {item.arShift}
                      </span>
                    )}
                  </div>
                  <span 
                    style={{ 
                      fontFamily: (language === 'ar' && activeFont.fontFamily && activeFont.fontFamily !== 'inherit') 
                        ? activeFont.fontFamily 
                        : undefined 
                    }}
                    className={`text-sm sm:text-base font-bold ${language === 'ar' ? 'text-amber-300' : theme.keyText}`}
                  >
                    {displayChar}
                  </span>
                </button>
              );
            })}

            <button
              onClick={() => handleKeyPress('enter', onEnter, 'enter')}
              className={`w-16 sm:w-20 h-9 sm:h-10 rounded-lg border border-emerald-500/40 bg-emerald-600 hover:bg-emerald-500 text-white font-bold active:scale-95 transition-all flex items-center justify-center gap-1 shadow-md`}
              title="سطر جديد (Enter)"
            >
              <CornerDownLeft className="w-4 h-4" />
              <span className="text-[10px] font-mono hidden sm:inline">Enter</span>
            </button>
          </div>

          {/* Row 4: Shift & Bottom Letter Row */}
          <div className="flex gap-1 justify-between">
            <button
              onClick={() => {
                setShiftActive(!shiftActive);
                playMechanicalClick('modifier');
              }}
              className={`w-16 sm:w-20 h-9 sm:h-10 rounded-lg border ${shiftActive ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]' : `${theme.keyBorder} ${theme.specialKeyBg}`} active:scale-95 transition-all flex items-center justify-center gap-1 text-[10px] font-mono font-bold`}
              title="مفتاح Shift"
            >
              <span>Shift ⇧</span>
            </button>

            {zRow.map((item, idx) => {
              const displayChar = language === 'ar' 
                ? (activeFont.id !== 'default' ? activeFont.transformChar(item.ar) : item.ar)
                : (capsLock ? item.en.toUpperCase() : item.en.toLowerCase());
              return (
                <button
                  key={idx}
                  onClick={() => handleKeyPress(`z-${idx}`, () => handleCharClick(item.ar, item.en, item.arShift, item.enShift))}
                  className={`flex-1 h-9 sm:h-10 rounded-lg border ${theme.keyBorder} ${theme.keyBg} active:scale-95 transition-all flex flex-col items-center justify-center relative p-0.5 shadow-sm hover:brightness-110`}
                >
                  <div className="flex justify-between w-full px-1">
                    <span className={`text-[9px] ${theme.keySecondary} font-mono uppercase`}>
                      {item.en}
                    </span>
                    {item.arShift && (
                      <span className="text-[9px] text-amber-400/80 font-bold">
                        {item.arShift}
                      </span>
                    )}
                  </div>
                  <span 
                    style={{ 
                      fontFamily: (language === 'ar' && activeFont.fontFamily && activeFont.fontFamily !== 'inherit') 
                        ? activeFont.fontFamily 
                        : undefined 
                    }}
                    className={`text-sm sm:text-base font-bold ${language === 'ar' ? 'text-amber-300' : theme.keyText}`}
                  >
                    {displayChar}
                  </span>
                </button>
              );
            })}

            <button
              onClick={() => {
                setShiftActive(!shiftActive);
                playMechanicalClick('modifier');
              }}
              className={`w-16 sm:w-20 h-9 sm:h-10 rounded-lg border ${shiftActive ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 font-bold' : `${theme.keyBorder} ${theme.specialKeyBg}`} active:scale-95 transition-all flex items-center justify-center text-[10px] font-mono font-bold`}
              title="مفتاح Shift الأيمن"
            >
              <span>⇧ Shift</span>
            </button>
          </div>

          {/* Row 5: Modifier Row & Spacebar */}
          <div className="flex gap-1 justify-between">
            <button
              onClick={() => {
                setCtrlActive(!ctrlActive);
                playMechanicalClick('modifier');
              }}
              className={`w-12 sm:w-14 h-9 sm:h-10 rounded-lg border ${ctrlActive ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold' : `${theme.keyBorder} ${theme.specialKeyBg}`} active:scale-95 transition-all flex items-center justify-center text-[10px] font-mono font-bold`}
              title="اختصارات Ctrl (A: تحديد، C: نسخ، V: لصق، Z: تراجع)"
            >
              Ctrl
            </button>

            <button
              onClick={() => handleKeyPress('win', () => alert('قائمة ويندوز: ريمو كيبورد الاحترافي 2026!'), 'modifier')}
              className={`w-10 sm:w-12 h-9 sm:h-10 rounded-lg border ${theme.keyBorder} ${theme.specialKeyBg} active:scale-95 transition-all flex items-center justify-center text-[10px] font-mono font-bold text-cyan-400`}
              title="مفتاح Windows"
            >
              ❖
            </button>

            <button
              onClick={() => {
                onToggleLanguage();
                playMechanicalClick('modifier');
              }}
              className={`w-12 sm:w-14 h-9 sm:h-10 rounded-lg border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 active:scale-95 transition-all flex items-center justify-center text-[10px] font-mono font-bold`}
              title="Alt: تبديل اللغة (عربي / إنجليزي)"
            >
              Alt
            </button>

            {/* Spacebar */}
            <button
              onClick={() => handleKeyPress('space', onSpace, 'space')}
              className={`flex-1 h-9 sm:h-10 rounded-lg border ${theme.keyBorder} ${theme.keyBg} hover:bg-white/10 active:scale-98 transition-all flex items-center justify-center shadow-inner text-xs font-bold text-slate-300 tracking-wider`}
            >
              <span className="opacity-70 font-mono">
                {language === 'ar' ? 'مسطرة المسافة — Space' : 'Mechanical Spacebar'}
              </span>
            </button>

            <button
              onClick={() => {
                onToggleLanguage();
                playMechanicalClick('modifier');
              }}
              className={`w-12 sm:w-14 h-9 sm:h-10 rounded-lg border ${theme.keyBorder} ${theme.specialKeyBg} active:scale-95 transition-all flex items-center justify-center text-[10px] font-mono font-bold`}
              title="AltGr"
            >
              AltGr
            </button>

            <button
              onClick={() => handleKeyPress('menu', () => onOpenThemes && onOpenThemes(), 'modifier')}
              className={`w-10 sm:w-12 h-9 sm:h-10 rounded-lg border ${theme.keyBorder} ${theme.specialKeyBg} active:scale-95 transition-all flex items-center justify-center text-[10px] font-mono font-bold`}
              title="قائمة الخيارات"
            >
              ☰
            </button>

            <button
              onClick={() => {
                setCtrlActive(!ctrlActive);
                playMechanicalClick('modifier');
              }}
              className={`w-12 sm:w-14 h-9 sm:h-10 rounded-lg border ${ctrlActive ? 'border-amber-500 bg-amber-500/20 text-amber-300' : `${theme.keyBorder} ${theme.specialKeyBg}`} active:scale-95 transition-all flex items-center justify-center text-[10px] font-mono font-bold`}
            >
              Ctrl
            </button>
          </div>
        </div>

        {/* Navigation & Directional Arrows Cluster */}
        <div className="w-24 sm:w-28 flex flex-col justify-between border-r border-white/5 pr-1 pl-1">
          {/* Editing Cluster */}
          <div className="grid grid-cols-2 gap-1 mb-2">
            <button
              onClick={() => handleKeyPress('ins', () => onKeyInput('ـ'), 'modifier')}
              className="h-8 rounded border border-white/10 bg-white/5 text-[10px] font-mono text-slate-300 hover:bg-white/10 active:scale-95"
              title="إدراج كشيدة تطويل (ـ)"
            >
              Ins
            </button>
            <button
              onClick={() => handleKeyPress('del', onForwardDelete, 'modifier')}
              className="h-8 rounded border border-red-500/20 bg-red-950/30 text-[10px] font-mono text-red-300 hover:bg-red-900/50 active:scale-95"
              title="حذف للأمام (Delete)"
            >
              Del
            </button>
            <button
              onClick={() => handleKeyPress('home', () => onMoveCursor('home'), 'modifier')}
              className="h-8 rounded border border-white/10 bg-white/5 text-[10px] font-mono text-slate-300 hover:bg-white/10 active:scale-95"
              title="بداية السطر"
            >
              Home
            </button>
            <button
              onClick={() => handleKeyPress('end', () => onMoveCursor('end'), 'modifier')}
              className="h-8 rounded border border-white/10 bg-white/5 text-[10px] font-mono text-slate-300 hover:bg-white/10 active:scale-95"
              title="نهاية السطر"
            >
              End
            </button>
            <button
              onClick={() => handleKeyPress('pgup', () => onMoveCursor('up'), 'modifier')}
              className="h-8 rounded border border-white/10 bg-white/5 text-[10px] font-mono text-slate-300 hover:bg-white/10 active:scale-95"
              title="لأعلى"
            >
              PgUp
            </button>
            <button
              onClick={() => handleKeyPress('pgdn', () => onMoveCursor('down'), 'modifier')}
              className="h-8 rounded border border-white/10 bg-white/5 text-[10px] font-mono text-slate-300 hover:bg-white/10 active:scale-95"
              title="لأسفل"
            >
              PgDn
            </button>
          </div>

          {/* Dedicated Arrow Keys */}
          <div className="flex flex-col items-center gap-1 mt-auto">
            <button
              onClick={() => handleKeyPress('up', () => onMoveCursor('up'), 'modifier')}
              className={`w-10 h-8 rounded-lg border ${theme.keyBorder} ${theme.keyBg} hover:bg-white/10 active:scale-95 flex items-center justify-center text-slate-200 shadow-sm`}
              title="مؤشر لأعلى"
            >
              ▲
            </button>
            <div className="flex gap-1">
              <button
                onClick={() => handleKeyPress('left', () => onMoveCursor('left'), 'modifier')}
                className={`w-10 h-8 rounded-lg border ${theme.keyBorder} ${theme.keyBg} hover:bg-white/10 active:scale-95 flex items-center justify-center text-slate-200 shadow-sm`}
                title="مؤشر لليسار"
              >
                ◀
              </button>
              <button
                onClick={() => handleKeyPress('down', () => onMoveCursor('down'), 'modifier')}
                className={`w-10 h-8 rounded-lg border ${theme.keyBorder} ${theme.keyBg} hover:bg-white/10 active:scale-95 flex items-center justify-center text-slate-200 shadow-sm`}
                title="مؤشر لأسفل"
              >
                ▼
              </button>
              <button
                onClick={() => handleKeyPress('right', () => onMoveCursor('right'), 'modifier')}
                className={`w-10 h-8 rounded-lg border ${theme.keyBorder} ${theme.keyBg} hover:bg-white/10 active:scale-95 flex items-center justify-center text-slate-200 shadow-sm`}
                title="مؤشر لليمين"
              >
                ▶
              </button>
            </div>
          </div>
        </div>

        {/* Dedicated PC NumPad */}
        {showNumpad && (
          <div className="w-36 sm:w-40 flex flex-col gap-1 border-r border-white/5 pr-1 pl-1 bg-black/20 p-1.5 rounded-xl">
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => {
                  setNumLock(!numLock);
                  playMechanicalClick('modifier');
                }}
                className={`h-8 rounded border ${numLock ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold' : 'border-white/10 bg-white/5 text-slate-400'} text-[10px] font-mono active:scale-95`}
                title="NumLock"
              >
                Num
              </button>
              <button
                onClick={() => handleKeyPress('np-div', () => onKeyInput('/'))}
                className="h-8 rounded border border-white/10 bg-white/5 text-xs font-bold text-slate-300 hover:bg-white/10 active:scale-95"
              >
                /
              </button>
              <button
                onClick={() => handleKeyPress('np-mul', () => onKeyInput('*'))}
                className="h-8 rounded border border-white/10 bg-white/5 text-xs font-bold text-slate-300 hover:bg-white/10 active:scale-95"
              >
                *
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1">
              {['7', '8', '9', '4', '5', '6', '1', '2', '3'].map((n) => (
                <button
                  key={n}
                  onClick={() => handleKeyPress(`np-${n}`, () => onKeyInput(n))}
                  className={`h-9 rounded-lg border ${theme.keyBorder} ${theme.keyBg} text-sm font-bold ${theme.keyText} hover:brightness-110 active:scale-95 flex items-center justify-center shadow-sm`}
                >
                  {n}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => handleKeyPress('np-0', () => onKeyInput('0'))}
                className={`col-span-2 h-9 rounded-lg border ${theme.keyBorder} ${theme.keyBg} text-sm font-bold ${theme.keyText} hover:brightness-110 active:scale-95 flex items-center justify-center shadow-sm`}
              >
                0
              </button>
              <button
                onClick={() => handleKeyPress('np-dot', () => onKeyInput('.'))}
                className={`h-9 rounded-lg border ${theme.keyBorder} ${theme.keyBg} text-sm font-bold ${theme.keyText} hover:brightness-110 active:scale-95 flex items-center justify-center shadow-sm`}
              >
                .
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1 mt-0.5">
              <button
                onClick={() => handleKeyPress('np-plus', () => onKeyInput('+'))}
                className="h-8 rounded border border-white/10 bg-white/5 text-xs font-bold text-slate-300 hover:bg-white/10 active:scale-95"
              >
                +
              </button>
              <button
                onClick={() => handleKeyPress('np-enter', onEnter, 'enter')}
                className="h-8 rounded border border-emerald-500/40 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-mono font-bold active:scale-95"
              >
                Enter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PC Shortcut Hints Footer */}
      <div className="mt-3 pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 font-mono">
        <div className="flex items-center gap-3">
          <span><kbd className="px-1.5 py-0.5 bg-black/50 border border-white/10 rounded text-amber-300">Ctrl+A</kbd> تحديد</span>
          <span><kbd className="px-1.5 py-0.5 bg-black/50 border border-white/10 rounded text-amber-300">Ctrl+C</kbd> نسخ</span>
          <span><kbd className="px-1.5 py-0.5 bg-black/50 border border-white/10 rounded text-amber-300">Ctrl+V</kbd> لصق</span>
          <span><kbd className="px-1.5 py-0.5 bg-black/50 border border-white/10 rounded text-amber-300">Ctrl+Z</kbd> تراجع</span>
          <span><kbd className="px-1.5 py-0.5 bg-black/50 border border-white/10 rounded text-cyan-300">Alt</kbd> تبديل اللغة</span>
        </div>
        <div className="text-emerald-400 font-sans font-bold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>كيبورد الكمبيوتر الميكانيكي نشط (104 أزرار كاملة باحترافية)</span>
        </div>
      </div>
    </div>
  );
};
