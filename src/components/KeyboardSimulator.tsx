import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { 
  KeyboardTheme, 
  KeyboardLanguage, 
  ClipItem,
  CalligraphyFontId,
  KeyboardLayoutMode,
  KeyThemeCategory
} from '../types/keyboard';
import { PCKeyboardLayout } from './PCKeyboardLayout';
import { 
  REMO_ROW_1,
  REMO_ROW_2,
  REMO_ROW_3,
  ENGLISH_ROW_1,
  ENGLISH_ROW_2,
  ENGLISH_ROW_3,
  SYMBOLS_ROW_1,
  SYMBOLS_ROW_2,
  SYMBOLS_ROW_3,
  MATH_SYMBOLS,
  TASHKEEL_OPTIONS, 
  KEYBOARD_THEMES,
  INITIAL_CLIPS,
  EMOJI_CATEGORIES,
  ARABIC_DECORATIONS,
  CALLIGRAPHY_FONTS,
  getFontById,
  KeyDefinition,
  isHeartTheme,
  isSportsTheme,
  getSportsClubWatermark
} from '../data/keyboardData';
import { 
  Delete, 
  CornerDownLeft, 
  Settings, 
  Smile, 
  Clipboard, 
  Sparkles, 
  Copy, 
  Check, 
  Trash2, 
  Pin, 
  Mic, 
  Languages, 
  Calculator, 
  MoveHorizontal, 
  Palette,
  Volume2,
  X,
  ChevronLeft,
  ChevronRight,
  Scissors,
  Upload,
  Image as ImageIcon,
  Sliders,
  Smartphone,
  Hash,
  ClipboardList,
  SmilePlus
} from 'lucide-react';

interface KeyboardSimulatorProps {
  currentTheme: KeyboardTheme;
  onThemeSelect: (theme: KeyboardTheme) => void;
  onSendToStudio?: (text: string) => void;
}

export function KeyboardSimulator({
  currentTheme,
  onThemeSelect,
  onSendToStudio
}: KeyboardSimulatorProps) {
  const [text, setText] = useState('مرحباً بك في ريمو كيبورد');
  const [language, setLanguage] = useState<KeyboardLanguage>('ar');
  const [page, setPage] = useState<'letters' | 'symbols'>('letters');
  const [keyboardMode, setKeyboardMode] = useState<KeyboardLayoutMode>(currentTheme.id === 'pc-classic' ? 'pc' : 'mobile');
  const [history, setHistory] = useState<string[]>([]);
  const [activeFontId, setActiveFontId] = useState<CalligraphyFontId>('default');
  const [activeDecorationId, setActiveDecorationId] = useState<string>('0');

  // Modals / Panels
  const [showFontsBar, setShowFontsBar] = useState(false);
  const [showDecorationModal, setShowDecorationModal] = useState(false);
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [showMathModal, setShowMathModal] = useState(false);
  const [showCursorModal, setShowCursorModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showClipboard, setShowClipboard] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [selectedThemeCategory, setSelectedThemeCategory] = useState<KeyThemeCategory | 'الكل'>('الكل');

  // Custom photo wallpaper state
  const [customWallpaper, setCustomWallpaper] = useState<string | null>(() => {
    return localStorage.getItem('remo_custom_wallpaper') || null;
  });
  const [wallpaperOverlay, setWallpaperOverlay] = useState<number>(() => {
    const saved = localStorage.getItem('remo_wallpaper_overlay');
    return saved !== null ? parseFloat(saved) : 0.45;
  });
  const [keyTextSize, setKeyTextSize] = useState<number>(() => {
    const saved = localStorage.getItem('remo_key_text_size');
    return saved ? parseInt(saved, 10) : 110;
  });
  const [portraitHeight, setPortraitHeight] = useState<number>(() => {
    const saved = localStorage.getItem('remo_portrait_height');
    return saved ? parseInt(saved, 10) : 35;
  });
  const [landscapeHeight, setLandscapeHeight] = useState<number>(() => {
    const saved = localStorage.getItem('remo_landscape_height');
    return saved ? parseInt(saved, 10) : 53;
  });

  useEffect(() => {
    localStorage.setItem('remo_key_text_size', keyTextSize.toString());
  }, [keyTextSize]);

  useEffect(() => {
    localStorage.setItem('remo_portrait_height', portraitHeight.toString());
  }, [portraitHeight]);

  useEffect(() => {
    localStorage.setItem('remo_landscape_height', landscapeHeight.toString());
  }, [landscapeHeight]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 6 * 1024 * 1024) {
      alert('حجم الصورة كبير، يرجى اختيار صورة أقل من 6 ميجابايت');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCustomWallpaper(dataUrl);
      try {
        localStorage.setItem('remo_custom_wallpaper', dataUrl);
      } catch {
        // LocalStorage fallback
      }
      const photoTheme: KeyboardTheme = {
        id: 'custom-wallpaper',
        name: 'Custom Photo Theme',
        nameAr: 'ثيم صورتي الخاصة',
        category: 'افتراضي',
        bgGradient: 'from-black via-zinc-900 to-black',
        keyboardBg: 'bg-transparent',
        keyBg: 'bg-black/60 backdrop-blur-sm hover:bg-black/75',
        keyText: 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]',
        keySecondary: 'text-amber-300 drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]',
        keyBorder: 'border-white/20',
        keyAccent: 'text-amber-400',
        accentBg: 'bg-amber-600/75 backdrop-blur-sm hover:bg-amber-600/85',
        accentText: 'text-black',
        specialKeyBg: 'bg-amber-600/75 backdrop-blur-sm hover:bg-amber-600/85'
      };
      onThemeSelect(photoTheme);
    };
    reader.readAsDataURL(file);
  };

  const clearCustomWallpaper = () => {
    setCustomWallpaper(null);
    localStorage.removeItem('remo_custom_wallpaper');
  };

  // States for secondary tools
  const [clips, setClips] = useState<ClipItem[]>(INITIAL_CLIPS);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [soundFeedback, setSoundFeedback] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [englishShift, setEnglishShift] = useState(false);
  const [decorationSearch, setDecorationSearch] = useState('');

  // Translation states
  const [transSourceText, setTransSourceText] = useState('');
  const [transResultText, setTransResultText] = useState('');
  const [transDirection, setTransDirection] = useState<'ar_en' | 'en_ar'>('ar_en');

  // Textarea Ref for cursor navigation
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeFont = getFontById(activeFontId);

  // Sound & Haptic simulation
  const triggerHaptic = () => {
    if (!hapticFeedback) return;
    try {
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(15);
      }
    } catch {
      // Vibration restricted
    }
  };

  const playClickSound = () => {
    triggerHaptic();
    if (!soundFeedback) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio context might be restricted before interaction
    }
  };

  // Handle typing a character
  const handleKeyInput = (char: string) => {
    playClickSound();

    let transformed = char;
    if (activeFont.id !== 'default') {
      transformed = activeFont.transformChar(char);
    }

    setText((prev) => prev + transformed);
  };

  const handleDelete = () => {
    playClickSound();
    setText((prev) => (prev.length > 0 ? prev.slice(0, -1) : ''));
  };

  const handleSpace = () => {
    playClickSound();
    if (activeFont.id === 'naqaa') {
      setText((prev) => prev + '   ');
    } else {
      setText((prev) => prev + ' ');
    }
  };

  const handleEnter = () => {
    playClickSound();
    setText((prev) => prev + '\n');
  };

  const handleCopyText = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Voice dictation simulation
  const handleVoiceToggle = () => {
    playClickSound();
    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      return;
    }

    setIsRecordingVoice(true);
    const phrases = [
      ' مرحبًا بك في ريمو كيبورد الأصلي',
      ' تم الإدخال الصوتي بنجاح',
      ' سبحان الله وبحمده سبحان الله العظيم',
      ' الخطوط العربية جاهزة للكتابة'
    ];
    const picked = phrases[Math.floor(Math.random() * phrases.length)];

    setTimeout(() => {
      setText((prev) => prev + picked);
      setIsRecordingVoice(false);
    }, 1200);
  };

  // Translation Simulation
  const handleTranslate = () => {
    playClickSound();
    const query = transSourceText || text;
    if (!query.trim()) return;

    if (transDirection === 'ar_en') {
      const dictionary: Record<string, string> = {
        'مرحبا': 'Hello',
        'السلام عليكم': 'Peace be upon you',
        'شكرا': 'Thank you',
        'كيبورد': 'Keyboard',
        'ريمو': 'Remo',
        'جميل': 'Beautiful',
        'نعم': 'Yes',
        'لا': 'No'
      };
      const found = dictionary[query.trim()] || `[Translated: ${query}]`;
      setTransResultText(found);
    } else {
      const dictionary: Record<string, string> = {
        'hello': 'مرحبًا',
        'thanks': 'شكرًا لك',
        'keyboard': 'لوحة المفاتيح',
        'remo': 'ريمو'
      };
      const found = dictionary[query.trim().toLowerCase()] || `[مترجم: ${query}]`;
      setTransResultText(found);
    }
  };

  const handleInsertTranslation = () => {
    if (!transResultText) return;
    setText((prev) => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + transResultText);
    setShowTranslationModal(false);
  };

  // Cursor & Text Navigation
  const moveCursor = (direction: 'left' | 'right') => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (direction === 'left' && start > 0) {
      el.setSelectionRange(start - 1, end - 1);
    } else if (direction === 'right' && end < text.length) {
      el.setSelectionRange(start + 1, end + 1);
    }
    el.focus();
  };

  const handleSelectAll = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.select();
  };

  const handleCutText = () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start !== end) {
      const selected = text.slice(start, end);
      navigator.clipboard.writeText(selected);
      setHistory((prev) => [...prev, text]);
      setText(text.slice(0, start) + text.slice(end));
    }
  };

  const handleForwardDelete = () => {
    playClickSound();
    const el = textareaRef.current;
    if (!el) {
      setText((prev) => (prev.length > 0 ? prev.slice(0, -1) : ''));
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    setHistory((prev) => [...prev, text]);
    if (start !== end) {
      setText((prev) => prev.slice(0, start) + prev.slice(end));
    } else if (start < text.length) {
      setText((prev) => prev.slice(0, start) + prev.slice(start + 1));
      setTimeout(() => {
        el.setSelectionRange(start, start);
      }, 0);
    }
  };

  const handleTab = () => {
    playClickSound();
    setHistory((prev) => [...prev, text]);
    setText((prev) => prev + '    ');
  };

  const handleMoveCursorPC = (direction: 'left' | 'right' | 'up' | 'down' | 'home' | 'end') => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const len = text.length;

    if (direction === 'left') {
      const next = Math.max(0, start - 1);
      el.setSelectionRange(next, next);
    } else if (direction === 'right') {
      const next = Math.min(len, start + 1);
      el.setSelectionRange(next, next);
    } else if (direction === 'home') {
      el.setSelectionRange(0, 0);
    } else if (direction === 'end') {
      el.setSelectionRange(len, len);
    } else if (direction === 'up') {
      const lastLine = text.lastIndexOf('\n', start - 1);
      const next = lastLine >= 0 ? lastLine : 0;
      el.setSelectionRange(next, next);
    } else if (direction === 'down') {
      const nextLine = text.indexOf('\n', start);
      const next = nextLine >= 0 ? nextLine + 1 : len;
      el.setSelectionRange(next, next);
    }
    el.focus();
  };

  const handlePasteText = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setHistory((prev) => [...prev, text]);
        setText((prev) => prev + clipText);
      } else if (clips.length > 0) {
        setHistory((prev) => [...prev, text]);
        setText((prev) => prev + clips[0].text);
      }
    } catch {
      if (clips.length > 0) {
        setHistory((prev) => [...prev, text]);
        setText((prev) => prev + clips[0].text);
      }
    }
  };

  const handleUndoText = () => {
    if (history.length > 0) {
      const previous = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1));
      setText(previous);
    }
  };

  const handleClearText = () => {
    setHistory((prev) => [...prev, text]);
    setText('');
  };

  const handleInsertDate = () => {
    const dateStr = new Date().toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setHistory((prev) => [...prev, text]);
    setText((prev) => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + dateStr);
  };

  // Apply Decoration Style from Modal
  const applyDecoration = (styleId: string) => {
    setActiveDecorationId(styleId);
    const style = ARABIC_DECORATIONS.find((s) => s.id === styleId);
    if (style && text) {
      const decorated = style.transform(text);
      setText(decorated);
    }
    setShowDecorationModal(false);
  };

  // Switch font and transform existing text if desired
  const selectFont = (fontId: CalligraphyFontId) => {
    playClickSound();
    setActiveFontId(fontId);
    const font = getFontById(fontId);
    if (font.id !== 'default' && text.trim()) {
      setText(font.transformText(text));
    }
  };

  // Render individual Key
  const renderKeyCap = (keyDef: KeyDefinition, idx: number) => {
    const rawPrimary = englishShift && language === 'en' ? keyDef.primary.toUpperCase() : keyDef.primary;
    const isBackspace = keyDef.primary === '⌫';
    const isShift = keyDef.primary === '⇧';
    const hasSecondary = !!keyDef.secondary;

    // Apply live Arabic font transformation to primary key character
    const displayedPrimary = (language === 'ar' && activeFont.id !== 'default' && !isBackspace && !isShift)
      ? activeFont.transformChar(rawPrimary)
      : rawPrimary;

    const flexGrow = keyDef.weight || 1;
    const isHeart = isHeartTheme(currentTheme.id, currentTheme.category);

    const keyClass = isHeart && !keyDef.isAction
      ? 'h-11 sm:h-12 relative rounded-[45%_45%_45%_45%/35%_35%_65%_65%] bg-gradient-to-b from-pink-500 via-rose-600 to-pink-700 text-white shadow-[0_3px_10px_rgba(244,63,94,0.5)] border-2 border-pink-300 transition-all active:scale-95 flex flex-col items-center justify-center select-none hover:brightness-110'
      : `h-11 sm:h-12 relative rounded-lg border transition-all active:scale-95 flex flex-col items-center justify-center select-none ${
          keyDef.isAction 
            ? currentTheme.specialKeyBg 
            : currentTheme.keyBg
        } ${currentTheme.keyBorder}`;

    return (
      <button
        key={`${rawPrimary}-${idx}`}
        style={{ flex: `${flexGrow} ${flexGrow} 0px` }}
        onClick={() => {
          if (isBackspace) handleDelete();
          else if (isShift) setEnglishShift(!englishShift);
          else handleKeyInput(displayedPrimary);
        }}
        onContextMenu={(e) => {
          if (hasSecondary && keyDef.secondary) {
            e.preventDefault();
            handleKeyInput(keyDef.secondary);
          }
        }}
        className={keyClass}
        title={hasSecondary ? `نقرة للأساسي: ${displayedPrimary} | نقرة يمنى للثانوي: ${keyDef.secondary}` : displayedPrimary}
      >
        {/* Secondary Symbol (Top right corner as in user's image) */}
        {hasSecondary && (
          <span className={`absolute top-0.5 right-1.5 text-[9px] sm:text-[10px] font-mono font-medium leading-none ${currentTheme.keySecondary} opacity-75`}>
            {keyDef.secondary}
          </span>
        )}

        {/* Primary Letter / Symbol */}
        {isBackspace ? (
          <Delete className="w-5 h-5 text-zinc-100" />
        ) : isShift ? (
          <span className={`text-base font-bold ${englishShift ? 'text-cyan-400' : 'text-zinc-200'}`}>⇧</span>
        ) : (
          <span 
            className={`text-base sm:text-lg font-bold leading-none ${currentTheme.keyText}`}
            style={{ 
              fontSize: `${keyTextSize}%`,
              fontFamily: (language === 'ar' && activeFont.fontFamily && activeFont.fontFamily !== 'inherit') 
                ? activeFont.fontFamily 
                : undefined 
            }}
          >
            {displayedPrimary}
          </span>
        )}
      </button>
    );
  };

  // Active keyboard rows based on language and symbols page
  const getActiveRows = () => {
    if (page === 'symbols') {
      return [SYMBOLS_ROW_1, SYMBOLS_ROW_2, SYMBOLS_ROW_3];
    }
    if (language === 'en') {
      return [ENGLISH_ROW_1, ENGLISH_ROW_2, ENGLISH_ROW_3];
    }
    return [REMO_ROW_1, REMO_ROW_2, REMO_ROW_3];
  };

  const rows = getActiveRows();

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
      {/* Top Bar / Status Header */}
      <div className="p-3.5 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 bg-zinc-900/60">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">ريمو كيبورد الأصلي v1.0.15</span>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/70 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                الافتراضي: {currentTheme.nameAr}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              لوحة مفاتيح الخطوط والزخارف العربية والترجمة الاحترافية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme switcher */}
          <button
            onClick={() => setShowThemeModal(!showThemeModal)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 active:scale-95 transition-all"
            title="تغيير ثيم اللوحة"
          >
            <Palette className="w-3.5 h-3.5 text-pink-400" />
            <span>الثيمات</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundFeedback(!soundFeedback)}
            className={`p-1.5 rounded-lg text-xs border transition-all ${
              soundFeedback 
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}
            title={soundFeedback ? 'صوت النقر مفعل' : 'صوت النقر معطل'}
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Haptic Vibration Toggle */}
          <button
            onClick={() => setHapticFeedback(!hapticFeedback)}
            className={`p-1.5 rounded-lg text-xs border transition-all ${
              hapticFeedback 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}
            title={hapticFeedback ? 'اهتزاز اللمس مفعل' : 'اهتزاز اللمس معطل'}
          >
            <Smartphone className="w-4 h-4" />
          </button>

          {/* Copy Text */}
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 transition-all shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
          </button>
        </div>
      </div>

      {/* Theme Drawer */}
      {showThemeModal && (
        <div className="p-4 bg-zinc-900 border-b border-zinc-800 animate-fadeIn space-y-3">
          {/* Hidden File Input for Custom Photo Upload */}
          <input 
            ref={fileInputRef} 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleImageUpload} 
          />

          {/* Header & Photo Upload Action Button */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-pink-400" />
              <span className="text-xs font-bold text-white">كتالوج ثيمات ريمو كيبورد وتخصيص المظهر</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:from-amber-400 hover:to-orange-400 active:scale-95 transition-all shadow-md"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>رفع صورة وجعلها ثيم الكيبورد</span>
              </button>

              <button
                onClick={() => setShowThemeModal(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Custom Photo Wallpaper Status & Controls */}
          {customWallpaper && (
            <div className="p-3 rounded-xl bg-zinc-950 border border-amber-500/40 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-lg border border-amber-400/50 bg-cover bg-center shrink-0 shadow-md"
                  style={{ backgroundImage: `url(${customWallpaper})` }}
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-amber-300">صورتك المخصصة مفعلة كثيم للكيبورد</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 font-mono">نشط</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">تظهر الصورة الآن كخلفية لجميع أزرار الكيبورد</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                  <Sliders className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-[11px]">عتامة الخلفية:</span>
                  <input
                    type="range"
                    min="0.1"
                    max="0.85"
                    step="0.05"
                    value={wallpaperOverlay}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setWallpaperOverlay(val);
                      localStorage.setItem('remo_wallpaper_overlay', val.toString());
                    }}
                    className="w-20 accent-amber-500 cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-zinc-400">{Math.round(wallpaperOverlay * 100)}%</span>
                </div>

                <button
                  onClick={clearCustomWallpaper}
                  className="px-2.5 py-1 rounded-lg text-xs bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 transition-colors"
                >
                  إزالة الصورة
                </button>
              </div>
            </div>
          )}

          {/* Theme Category Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {(['الكل', 'افتراضي', 'شبابي', 'رياضي', 'نسائي', 'بناتي', 'داكن', 'إسلامي'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedThemeCategory(cat)}
                className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap transition-all text-xs border ${
                  selectedThemeCategory === cat
                    ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
                    : 'bg-zinc-800/80 text-zinc-300 border-zinc-700/70 hover:bg-zinc-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Theme Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2.5 max-h-64 overflow-y-auto pr-1">
            {KEYBOARD_THEMES.filter(th => selectedThemeCategory === 'الكل' || th.category === selectedThemeCategory).map((th) => (
              <button
                key={th.id}
                onClick={() => {
                  onThemeSelect(th);
                  const clubWallpapers: Record<string, string> = {
                    'club-alhilal': '/alhilal_wallpaper.jpg',
                    'club-alnassr': '/alnassr_wallpaper.jpg',
                    'club-alittihad': '/alittihad_wallpaper.jpg',
                    'club-alahli': '/alahli_wallpaper.jpg',
                    'club-realmadrid': '/realmadrid_wallpaper.jpg',
                    'club-barcelona': '/barcelona_wallpaper.jpg',
                    'club-manutd': '/manutd_wallpaper.jpg',
                    'club-liverpool': '/liverpool_wallpaper.jpg',
                  };
                  if (clubWallpapers[th.id]) {
                    const img = clubWallpapers[th.id];
                    setCustomWallpaper(img);
                    localStorage.setItem('remo_custom_wallpaper', img);
                  }
                }}
                className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between gap-2 active:scale-95 ${
                  currentTheme.id === th.id && !customWallpaper
                    ? 'border-amber-400 bg-amber-950/30 ring-2 ring-amber-400/50 shadow-md'
                    : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-zinc-800 text-zinc-300">
                    {th.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <span 
                      className={`w-2.5 h-2.5 rounded-full ${th.accentBg}`} 
                    />
                    {currentTheme.id === th.id && !customWallpaper && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-white block truncate">{th.nameAr}</span>
                  <span className="text-[10px] text-zinc-400 block truncate font-mono">{th.name}</span>
                </div>

                {/* Key cap preview mock */}
                <div className="flex items-center gap-1 pt-1 border-t border-zinc-800/60">
                  <div className={`h-4 flex-1 rounded text-[9px] font-bold flex items-center justify-center ${th.keyBg} ${th.keyBorder} border ${th.keyText}`}>
                    ض
                  </div>
                  <div className={`h-4 flex-1 rounded text-[9px] font-bold flex items-center justify-center ${th.specialKeyBg} ${th.keyBorder} border ${th.keyText}`}>
                    ↵
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Textarea Live Field */}
      <div className="p-4 bg-black/60 border-b border-zinc-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium">محرر الكتابة المباشر:</span>
            {activeFont.id !== 'default' && (
              <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300 text-[11px] font-bold">
                خط الكتابة: {activeFont.nameAr}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setText('')}
              className="text-zinc-400 hover:text-rose-400 transition-colors"
            >
              مسح
            </button>
            <span className="font-mono text-zinc-500">{text.length} حرف</span>
          </div>
        </div>
        
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          dir="rtl"
          placeholder="انقر هنا واكتب باستخدام أزرار كيبورد ريمو أدناه بالخطوط العربية الحقيقية..."
          style={{
            fontFamily: (activeFont.fontFamily && activeFont.fontFamily !== 'inherit')
              ? activeFont.fontFamily
              : undefined
          }}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-lg text-white focus:outline-none focus:border-zinc-700 resize-none leading-relaxed tracking-wide shadow-inner"
        />

        {/* Action Pills & Tashkeel */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-zinc-400 text-[11px] shrink-0">حركات وتشكيل:</span>
            {TASHKEEL_OPTIONS.map((tash) => (
              <button
                key={tash.name}
                onClick={() => handleKeyInput(tash.char)}
                className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 font-mono text-xs transition-colors shrink-0"
                title={tash.name}
              >
                {tash.char === 'ـ' ? 'ـ (كشيدة)' : `ب${tash.char}`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Open 40 Decorations Modal */}
            <button
              onClick={() => setShowDecorationModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:brightness-110 transition-all shadow-sm active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>قائمة الزخرفة (40 نمط)</span>
            </button>

            {onSendToStudio && (
              <button
                onClick={() => onSendToStudio(text)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition-all"
              >
                <span>الاستوديو</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KEYBOARD BODY (Obsidian Style Matching Provided Image) */}
      <div 
        className={`p-3 sm:p-5 ${customWallpaper ? 'bg-zinc-950' : currentTheme.keyboardBg} transition-colors select-none relative overflow-hidden`}
        style={{
          paddingTop: `${portraitHeight * 0.3}px`,
          paddingBottom: `${portraitHeight * 0.3}px`,
          ...(customWallpaper ? {
            backgroundImage: `url(${customWallpaper})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : {})
        }}
      >
        {/* Sports Theme Watermark Background */}
        {isSportsTheme(currentTheme.id, currentTheme.category) && !customWallpaper && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20 z-0 select-none">
            <span className="text-7xl sm:text-9xl mb-2 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
              {getSportsClubWatermark(currentTheme.id).icon}
            </span>
            <span className="text-xs sm:text-sm font-black tracking-widest uppercase text-white text-center px-4">
              {getSportsClubWatermark(currentTheme.id).badge}
            </span>
          </div>
        )}

        {/* Custom wallpaper dark tint overlay */}
        {customWallpaper && (
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity z-0"
            style={{ backgroundColor: `rgba(0, 0, 0, ${wallpaperOverlay})` }}
          />
        )}
        <div className="relative z-10">
        {/* Layout Mode Selector (Mobile Phone / PC Mechanical Keyboard) */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 p-1.5 bg-black/40 rounded-xl border border-white/5 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                playClickSound();
                setKeyboardMode('mobile');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                keyboardMode === 'mobile'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>📱 كيبورد ريمو الفاخر الافتراضي</span>
            </button>
            <button
              onClick={() => {
                playClickSound();
                setKeyboardMode('pc');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                keyboardMode === 'pc'
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>💻 كيبورد الكمبيوتر الميكانيكي (104 أزرار كاملة)</span>
            </button>
          </div>

          <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline">
            {keyboardMode === 'pc' ? 'لوحة مفاتيح كمبيوتر ميكانيكية بكافة الأزرار والاختصارات' : 'كيبورد ريمو الفاخر الافتراضي للهاتف'}
          </span>
        </div>

        {/* TOP TOOLBAR: Exact 4 Icons from Reference Image */}
        {/* 1: Calligraphy/Fonts [ع] | 2: Translation [文A] | 3: Math [−× / +=] | 4: Cursor [< I >] */}
        <div className="flex items-center justify-between mb-3 px-2 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 shadow-inner">
          <div className="flex items-center gap-2">
            {/* 1. Calligraphy / Fonts Button [ع] */}
            <button
              onClick={() => setShowFontsBar(!showFontsBar)}
              className={`px-3 py-1.5 rounded-lg font-bold text-sm flex items-center gap-1.5 transition-all border ${
                showFontsBar || activeFont.id !== 'default'
                  ? 'bg-amber-500 text-black border-amber-400 shadow-md ring-2 ring-amber-400/40'
                  : 'bg-zinc-800 text-zinc-100 border-zinc-700 hover:bg-zinc-700'
              }`}
              title="كيبورد الخطوط العربية والإنجليزية"
            >
              <span className="text-base font-serif">ع</span>
              <span className="text-xs">الخطوط {activeFont.id !== 'default' ? `(${activeFont.nameAr})` : ''}</span>
            </button>

            {/* 2. Instant Translation Button [文A] */}
            <button
              onClick={() => {
                setShowTranslationModal(!showTranslationModal);
                setTransSourceText(text);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all border ${
                showTranslationModal 
                  ? 'bg-blue-500 text-white border-blue-400' 
                  : 'bg-zinc-800 text-zinc-100 border-zinc-700 hover:bg-zinc-700'
              }`}
              title="الترجمة الفورية"
            >
              <Languages className="w-4 h-4" />
              <span>ترجمة</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* 3. Math & Calculator Button [−× / +=] */}
            <button
              onClick={() => setShowMathModal(!showMathModal)}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all border ${
                showMathModal 
                  ? 'bg-emerald-500 text-black border-emerald-400' 
                  : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700'
              }`}
              title="رموز الرياضيات والحاسبة"
            >
              <Calculator className="w-4 h-4" />
              <span className="font-mono text-xs">+−×</span>
            </button>

            {/* 4. Cursor / Text Selection Pad [< I >] */}
            <button
              onClick={() => setShowCursorModal(!showCursorModal)}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all border ${
                showCursorModal 
                  ? 'bg-purple-500 text-white border-purple-400' 
                  : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700'
              }`}
              title="التحكم بالمؤشر والتحديد"
            >
              <MoveHorizontal className="w-4 h-4" />
              <span className="font-mono text-xs">&lt; I &gt;</span>
            </button>
          </div>
        </div>

        {/* EXPANDED CALLIGRAPHY FONTS STRIP (كيبورد الخطوط) */}
        {showFontsBar && (
          <div className="mb-3 p-2.5 rounded-xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-black border border-amber-500/40 space-y-2 animate-fadeIn shadow-xl">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                اختر خط الكتابة لأزرار الكيبورد:
              </span>
              <button
                onClick={() => setShowFontsBar(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Fonts Row Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5">
              {CALLIGRAPHY_FONTS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => selectFont(f.id)}
                  style={{
                    fontFamily: f.fontFamily && f.fontFamily !== 'inherit' ? f.fontFamily : undefined
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex flex-col items-center gap-0.5 border ${
                    activeFontId === f.id
                      ? 'bg-amber-500 text-black border-amber-400 shadow-md scale-105'
                      : 'bg-zinc-800/90 text-zinc-200 border-zinc-700 hover:bg-zinc-700'
                  }`}
                >
                  <span>{f.nameAr}</span>
                  <span className="text-[10px] opacity-80 font-normal">{f.sample}</span>
                </button>
              ))}
            </div>

            <p className="text-[11px] text-zinc-400 px-1">
              {activeFont.description}
            </p>
          </div>
        )}

        {/* MATH SYMBOLS DRAWER */}
        {showMathModal && (
          <div className="mb-3 p-3 rounded-xl bg-zinc-900 border border-emerald-500/40 space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between text-xs border-b border-zinc-800 pb-2">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Calculator className="w-4 h-4" />
                لوحة الرموز الرياضية والحاسبة
              </span>
              <button onClick={() => setShowMathModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 text-center">
              {MATH_SYMBOLS.map((sym) => (
                <button
                  key={sym}
                  onClick={() => handleKeyInput(sym)}
                  className="h-10 rounded-lg bg-zinc-800 hover:bg-emerald-600 hover:text-white border border-zinc-700 text-base font-bold transition-all active:scale-95"
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CURSOR / NAVIGATION DRAWER */}
        {showCursorModal && (
          <div className="mb-3 p-3 rounded-xl bg-zinc-900 border border-purple-500/40 space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between text-xs border-b border-zinc-800 pb-2">
              <span className="font-bold text-purple-400 flex items-center gap-1.5">
                <MoveHorizontal className="w-4 h-4" />
                أدوات التحكم بالنص والمؤشر
              </span>
              <button onClick={() => setShowCursorModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 py-1">
              <button
                onClick={() => moveCursor('right')}
                className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center gap-1 border border-zinc-700 active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
                <span>تحريك يمين</span>
              </button>
              <button
                onClick={() => moveCursor('left')}
                className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center gap-1 border border-zinc-700 active:scale-95"
              >
                <span>تحريك يسار</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleSelectAll}
                className="px-3.5 py-2 rounded-lg bg-purple-950/70 hover:bg-purple-900 text-purple-200 font-bold text-xs border border-purple-500/40 active:scale-95"
              >
                تحديد الكل
              </button>
              <button
                onClick={handleCutText}
                className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center gap-1 border border-zinc-700 active:scale-95"
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>قص</span>
              </button>
              <button
                onClick={handleCopyText}
                className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center gap-1 border border-zinc-700 active:scale-95"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ</span>
              </button>
            </div>
          </div>
        )}

        {/* TRANSLATION MODAL */}
        {showTranslationModal && (
          <div className="mb-3 p-3.5 rounded-xl bg-zinc-900 border border-blue-500/40 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between text-xs border-b border-zinc-800 pb-2">
              <span className="font-bold text-blue-400 flex items-center gap-1.5">
                <Languages className="w-4 h-4" />
                مترجم ريمو كيبورد الفوري
              </span>
              <button onClick={() => setShowTranslationModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTransDirection('ar_en')}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                  transDirection === 'ar_en' ? 'bg-blue-500 text-white border-blue-400' : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                }`}
              >
                عربي ← إنجليزي
              </button>
              <button
                onClick={() => setTransDirection('en_ar')}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                  transDirection === 'en_ar' ? 'bg-blue-500 text-white border-blue-400' : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                }`}
              >
                إنجليزي ← عربي
              </button>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={transSourceText}
                onChange={(e) => setTransSourceText(e.target.value)}
                placeholder="أدخل الكلمة أو العبارة للترجمة..."
                className="w-full bg-black/60 border border-zinc-800 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTranslate}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs active:scale-95"
                >
                  ترجمة فورية
                </button>
                {transResultText && (
                  <button
                    onClick={handleInsertTranslation}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-bold text-xs active:scale-95"
                  >
                    إدراج في النص
                  </button>
                )}
              </div>
            </div>

            {transResultText && (
              <div className="p-2.5 rounded-lg bg-black/70 border border-zinc-800 text-sm font-semibold text-emerald-300">
                الترجمة: {transResultText}
              </div>
            )}
          </div>
        )}

        {/* CLIPBOARD DRAWER */}
        {showClipboard && (
          <div className="mb-3 p-3 rounded-xl bg-zinc-900/95 border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Clipboard className="w-3.5 h-3.5 text-emerald-400" />
                الحافظة الذكية (تثبيت وحذف وتمرير)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (text.trim()) {
                      setClips([{ id: Date.now().toString(), text: text.trim(), isPinned: false, timestamp: 'الآن' }, ...clips]);
                    }
                  }}
                  className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px]"
                >
                  + إضافة الحالي
                </button>
                <button
                  onClick={() => setClips(clips.filter(c => c.isPinned))}
                  className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 hover:text-rose-400 text-[11px]"
                >
                  تفريغ غير المثبت
                </button>
                <button onClick={() => setShowClipboard(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {clips.map((clip) => (
                <div
                  key={clip.id}
                  className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 flex items-start justify-between gap-2 hover:border-zinc-700 group transition-all"
                >
                  <button
                    onClick={() => {
                      setText((prev) => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + clip.text);
                      setShowClipboard(false);
                    }}
                    className="text-right text-xs text-zinc-200 hover:text-cyan-300 flex-1 line-clamp-2"
                  >
                    {clip.text}
                  </button>
                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    <button
                      onClick={() => setClips(clips.map(c => c.id === clip.id ? { ...c, isPinned: !c.isPinned } : c))}
                      className={`p-1 rounded transition-colors ${clip.isPinned ? 'text-amber-400' : 'text-zinc-500'}`}
                    >
                      <Pin className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setClips(clips.filter(c => c.id !== clip.id))}
                      className="p-1 rounded text-zinc-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EMOJI DRAWER */}
        {showEmojis && (
          <div className="mb-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2 overflow-x-auto">
                {EMOJI_CATEGORIES.map((cat, idx) => (
                  <button
                    key={cat.name}
                    onClick={() => setActiveEmojiCategory(idx)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                      activeEmojiCategory === idx
                        ? 'bg-amber-500 text-black'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="text-[11px]">{cat.name}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setShowEmojis(false)} className="text-zinc-400 hover:text-white mr-2">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-14 gap-1.5 max-h-36 overflow-y-auto p-1 text-xl">
              {EMOJI_CATEGORIES[activeEmojiCategory].emojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleKeyInput(emoji)}
                  className="w-9 h-9 rounded-lg hover:bg-white/10 active:scale-125 flex items-center justify-center transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS MODAL */}
        {showSettingsModal && (
          <div className="mb-3 p-3.5 rounded-xl bg-zinc-900 border border-zinc-700 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-cyan-400" />
                إعدادات وتخصيص ريمو كيبورد
              </span>
              <button onClick={() => setShowSettingsModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                <span>الصوت والاهتزاز عند النقر</span>
                <button
                  onClick={() => setSoundFeedback(!soundFeedback)}
                  className={`px-3 py-1 rounded-full font-bold text-[11px] ${soundFeedback ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}
                >
                  {soundFeedback ? 'مفعل' : 'معطل'}
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                <span>إظهار شريط الخطوط التلقائي</span>
                <button
                  onClick={() => setShowFontsBar(!showFontsBar)}
                  className={`px-3 py-1 rounded-full font-bold text-[11px] ${showFontsBar ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}
                >
                  {showFontsBar ? 'ظاهر' : 'مخفي'}
                </button>
              </div>

              {/* حجم الأحرف على الأزرار */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 sm:col-span-2">
                <span>حجم الأحرف على الأزرار ({keyTextSize}%)</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setKeyTextSize(Math.max(80, keyTextSize - 5))}
                    className="w-7 h-7 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-cyan-400">{keyTextSize}%</span>
                  <button
                    onClick={() => setKeyTextSize(Math.min(150, keyTextSize + 5))}
                    className="w-7 h-7 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* إرتفاع الكيبورد في الوضع العمودي للجهاز */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                <span>إرتفاع الوضع العمودي ({portraitHeight}%)</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPortraitHeight(Math.max(20, portraitHeight - 3))}
                    className="w-7 h-7 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-emerald-400">{portraitHeight}%</span>
                  <button
                    onClick={() => setPortraitHeight(Math.min(60, portraitHeight + 3))}
                    className="w-7 h-7 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* إرتفاع الكيبورد في الوضع الأفقي للجهاز */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                <span>إرتفاع الوضع الأفقي ({landscapeHeight}%)</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setLandscapeHeight(Math.max(30, landscapeHeight - 3))}
                    className="w-7 h-7 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-amber-400">{landscapeHeight}%</span>
                  <button
                    onClick={() => setLandscapeHeight(Math.min(80, landscapeHeight + 3))}
                    className="w-7 h-7 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MAIN KEYBOARD ROWS */}
        {keyboardMode === 'pc' ? (
          <PCKeyboardLayout
            theme={currentTheme}
            language={language}
            activeFont={activeFont}
            soundFeedback={soundFeedback}
            onKeyInput={handleKeyInput}
            onDelete={handleDelete}
            onForwardDelete={handleForwardDelete}
            onEnter={handleEnter}
            onSpace={handleSpace}
            onTab={handleTab}
            onMoveCursor={handleMoveCursorPC}
            onSelectAll={handleSelectAll}
            onCopy={handleCopyText}
            onPaste={handlePasteText}
            onCut={handleCutText}
            onUndo={handleUndoText}
            onClear={handleClearText}
            onToggleLanguage={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            onToggleSound={() => setSoundFeedback(!soundFeedback)}
            onOpenThemes={() => setShowThemeModal(true)}
            onOpenClipboard={() => setShowClipboard(true)}
            onInsertDate={handleInsertDate}
          />
        ) : (
          <div className="space-y-1.5" dir="ltr">
            {/* Row 1, Row 2, Row 3 (تخطيط غير معكوس: ض من اليسار إلى ج في اليمين، والـ Backspace في يمين الصف الثالث) */}
            {rows.map((row, rowIdx) => (
              <div key={rowIdx} className="flex justify-center gap-1 sm:gap-1.5" dir="ltr">
                {row.map((keyDef, idx) => renderKeyCap(keyDef, idx))}
              </div>
            ))}

            {/* Row 4: Professional Bottom Row */}
            <div className="flex items-center gap-1 sm:gap-1.5 pt-1" dir="ltr">
              {/* 1. ?123 Symbols Toggle */}
              <button
                onClick={() => {
                  playClickSound();
                  setPage(page === 'symbols' ? 'letters' : 'symbols');
                }}
                style={{ flex: '1 1 0px' }}
                className={`h-11 sm:h-12 rounded-xl border font-bold text-xs sm:text-sm flex items-center justify-center gap-1 transition-all active:scale-95 ${
                  page === 'symbols' ? 'bg-amber-500 text-black border-amber-400 font-extrabold shadow-lg shadow-amber-500/20' : currentTheme.specialKeyBg
                } ${currentTheme.keyBorder}`}
                title="التبديل بين الحروف والأرقام والرموز"
              >
                <Hash className="w-3.5 h-3.5 opacity-80" />
                <span>{page === 'symbols' ? 'أب‌ج' : '?123'}</span>
              </button>

              {/* 2. Settings [Sliders] */}
              <button
                onClick={() => {
                  playClickSound();
                  setShowSettingsModal(!showSettingsModal);
                }}
                style={{ flex: '0.8 1 0px' }}
                className={`h-11 sm:h-12 rounded-xl border flex items-center justify-center transition-all active:scale-95 hover:border-cyan-400/50 ${currentTheme.specialKeyBg} ${currentTheme.keyBorder}`}
                title="إعدادات الكيبورد"
              >
                <Sliders className="w-4 h-4 text-cyan-400" />
              </button>

              {/* 3. Voice [Mic] */}
              <button
                onClick={handleVoiceToggle}
                style={{ flex: '0.8 1 0px' }}
                className={`h-11 sm:h-12 rounded-xl border flex items-center justify-center transition-all active:scale-95 ${
                  isRecordingVoice 
                    ? 'bg-rose-500 text-white animate-pulse border-rose-400 shadow-lg shadow-rose-500/30' 
                    : `${currentTheme.specialKeyBg} ${currentTheme.keyBorder} hover:border-emerald-400/50`
                }`}
                title="الكتابة بالصوت (إملاء صوتي)"
              >
                <Mic className={`w-4 h-4 ${isRecordingVoice ? 'text-white' : 'text-emerald-400'}`} />
              </button>

              {/* 4. Wide Space Bar */}
              <button
                onClick={handleSpace}
                style={{ flex: '3.2 1 0px' }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setLanguage(language === 'ar' ? 'en' : 'ar');
                }}
                className={`h-11 sm:h-12 rounded-xl border font-semibold text-xs sm:text-sm tracking-wide flex flex-col items-center justify-center transition-all active:scale-98 shadow-sm ${
                  currentTheme.spaceBg || currentTheme.keyBg
                } ${currentTheme.keyBorder} ${currentTheme.spaceText || currentTheme.keyText}`}
                title="مسافة | انقر بزر الفأرة الأيمن لتبديل اللغة (عربي / إنجليزي)"
              >
                <div className="flex items-center gap-2 font-bold">
                  <span className="text-[10px] opacity-60">◄</span>
                  <span>
                    {language === 'ar' ? 'العربية' : 'English'}
                    {activeFont.id !== 'default' ? ` • ${activeFont.nameAr}` : ''}
                  </span>
                  <span className="text-[10px] opacity-60">►</span>
                </div>
                <span className="w-12 h-0.5 bg-current opacity-30 rounded-full mt-0.5" />
              </button>

              {/* 5. Clipboard [ClipboardList] */}
              <button
                onClick={() => {
                  playClickSound();
                  setShowClipboard(!showClipboard);
                  setShowEmojis(false);
                }}
                style={{ flex: '0.8 1 0px' }}
                className={`h-11 sm:h-12 rounded-xl border flex items-center justify-center transition-all active:scale-95 ${
                  showClipboard ? 'bg-emerald-500 text-black border-emerald-400 font-bold shadow-lg shadow-emerald-500/20' : `${currentTheme.specialKeyBg} ${currentTheme.keyBorder} hover:border-purple-400/50`
                }`}
                title="الحافظة"
              >
                <ClipboardList className="w-4 h-4 text-purple-400" />
              </button>

              {/* 6. Emoji [SmilePlus] */}
              <button
                onClick={() => {
                  playClickSound();
                  setShowEmojis(!showEmojis);
                  setShowClipboard(false);
                }}
                style={{ flex: '0.8 1 0px' }}
                className={`h-11 sm:h-12 rounded-xl border flex items-center justify-center transition-all active:scale-95 ${
                  showEmojis ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-lg shadow-amber-500/20' : `${currentTheme.specialKeyBg} ${currentTheme.keyBorder} hover:border-pink-400/50`
                }`}
                title="الإيموجي والوجوه التعبيرية"
              >
                <SmilePlus className="w-4 h-4 text-pink-400" />
              </button>

              {/* 7. Enter Key [CornerDownLeft] */}
              <button
                id="default-keyboard-enter-button"
                onClick={handleEnter}
                style={{ flex: '1.2 1 0px' }}
                className={`h-11 sm:h-12 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md ${
                  currentTheme.accentBg
                } ${currentTheme.accentText}`}
                title="إدخال / سطر جديد (⏎)"
              >
                <CornerDownLeft className="w-4 h-4 stroke-[2.5]" />
                <span className="text-xs font-bold hidden sm:inline">إدخال</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer info tip */}
        <div className="mt-3.5 flex items-center justify-between text-[11px] text-zinc-400 px-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>نصيحة: انقر نقرة يمنى على أي حرف لكتابة الرمز الثانوي العلوي مباشرة أو اضغط مطولاً.</span>
          </div>
          <span className="font-mono text-zinc-500 text-[10px]">Remo Obsidian IME</span>
        </div>
        </div>
      </div>

      {/* 40 ARABIC DECORATION STYLES MODAL (Matching User's Screenshots!) */}
      {showDecorationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">قائمة زخرفة النصوص (40 نمط عربي)</h3>
              </div>
              <button
                onClick={() => setShowDecorationModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search and preview */}
            <div className="p-3 bg-zinc-950/60 border-b border-zinc-800 space-y-2">
              <input
                type="text"
                value={decorationSearch}
                onChange={(e) => setDecorationSearch(e.target.value)}
                placeholder="ابحث في قائمة الزخارف..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
              <div className="text-xs text-zinc-400 flex items-center justify-between">
                <span>اختر النمط المطلوب لتطبيقه فوراً على النص الحالي:</span>
                <span className="text-amber-400 font-bold">{text || 'ريمو كيبورد'}</span>
              </div>
            </div>

            {/* List of 40 Styles */}
            <div className="p-3 overflow-y-auto space-y-1.5 flex-1 divide-y divide-zinc-800/40">
              {ARABIC_DECORATIONS.filter(s => s.name.includes(decorationSearch) || s.previewSample.includes(decorationSearch)).map((style) => {
                const isSelected = activeDecorationId === style.id;
                const preview = style.transform(text || 'ريمو كيبورد');

                return (
                  <button
                    key={style.id}
                    onClick={() => applyDecoration(style.id)}
                    className={`w-full p-3 rounded-xl text-right transition-all flex items-center justify-between gap-3 group ${
                      isSelected 
                        ? 'bg-amber-500/15 border border-amber-500/50 text-white' 
                        : 'hover:bg-zinc-800/70 text-zinc-200'
                    }`}
                  >
                    <div className="space-y-1 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isSelected ? 'text-amber-400' : 'text-zinc-400'}`}>
                          {style.name}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] bg-amber-500 text-black font-bold px-1.5 py-0.2 rounded-full">
                            محدد
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-white truncate group-hover:text-amber-300 transition-colors">
                        {preview}
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-amber-400 bg-amber-500 text-black' : 'border-zinc-700 bg-zinc-800'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
              <button
                onClick={() => applyDecoration('0')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                إلغاء الزخرفة (عادي)
              </button>
              <button
                onClick={() => setShowDecorationModal(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black"
              >
                موافق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
