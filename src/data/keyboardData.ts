import { KeyboardTheme, ClipItem, SourceFileMeta } from '../types/keyboard';
import { ARABIC_DECORATIONS } from '../utils/arabicDecorations';

export { ARABIC_DECORATIONS };
export { CALLIGRAPHY_FONTS, getFontById } from '../utils/calligraphyFonts';

export interface KeyDefinition {
  primary: string;
  secondary?: string;
  weight?: number;
  isAction?: boolean;
}

export const REMO_DEFAULT_THEME: KeyboardTheme = {
  id: 'remo-obsidian',
  name: 'Remo Obsidian Luxury',
  nameAr: 'كيبورد ريمو الفاخر الافتراضي',
  category: 'افتراضي',
  bgGradient: 'bg-black',
  keyboardBg: 'bg-[#09090b]',
  keyBg: 'bg-gradient-to-b from-[#38393e] to-[#222326] hover:from-[#43444a] hover:to-[#2c2d32] active:from-[#1b1c1e] active:to-[#121315] shadow-[0_2px_4px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.14)]',
  keyBorder: 'border-zinc-700/60 border-b-zinc-900 border-b-2',
  keyText: 'text-white',
  keySecondary: 'text-zinc-400',
  keyAccent: 'text-cyan-400',
  accentBg: 'bg-gradient-to-b from-[#3a3b40] to-[#25262a] hover:from-[#484950] hover:to-[#2d2e33] text-white border-zinc-700/70',
  accentText: 'text-white',
  specialKeyBg: 'bg-gradient-to-b from-[#2b2c30] to-[#1c1d20] hover:from-[#36373d] hover:to-[#232427] text-zinc-200 border-zinc-700/60',
  spaceBg: 'bg-gradient-to-b from-[#333438] to-[#1f2023] text-zinc-100 border-zinc-700/60',
  spaceText: 'text-zinc-200',
  badge: 'الافتراضي الفاخر ⭐'
};

export const KEYBOARD_THEMES: KeyboardTheme[] = [
  // 1. الثيمات النسائية والكيوت (قلوب، ورود، دبادب)
  {
    id: 'cute-teddy-bears',
    name: 'Teddy Bears & Love',
    nameAr: 'دبادب حب وكيوت',
    category: 'نسائي',
    bgGradient: 'bg-gradient-to-b from-[#ffe4e6] via-[#fecdd3] to-[#fda4af]',
    keyboardBg: 'bg-[#ffe4e6]',
    keyBg: 'bg-white hover:bg-rose-50 active:bg-rose-100 text-rose-950 shadow-[0_3px_10px_rgba(244,63,94,0.25)]',
    keyBorder: 'border-rose-200 border-b-rose-400 border-b-2',
    keyText: 'text-rose-950 font-bold',
    keySecondary: 'text-rose-500',
    keyAccent: 'text-pink-600',
    accentBg: 'bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold',
    accentText: 'text-white',
    specialKeyBg: 'bg-rose-100 text-rose-900 border-rose-200',
    spaceBg: 'bg-white text-rose-950 border-rose-200 font-bold',
    badge: '🧸 دبادب وحب'
  },
  {
    id: 'royal-roses',
    name: 'Red Roses & Velvet',
    nameAr: 'ورود حمراء مخملية',
    category: 'نسائي',
    bgGradient: 'bg-gradient-to-b from-[#4c0519] via-[#881337] to-[#9f1239]',
    keyboardBg: 'bg-[#500724]',
    keyBg: 'bg-gradient-to-b from-[#9f1239] to-[#881337] hover:from-[#be123c] hover:to-[#9f1239] shadow-[0_0_12px_rgba(244,63,94,0.4)]',
    keyBorder: 'border-rose-500 border-b-rose-800 border-b-2',
    keyText: 'text-rose-100 font-bold',
    keySecondary: 'text-rose-300',
    keyAccent: 'text-yellow-300',
    accentBg: 'bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold',
    accentText: 'text-white',
    specialKeyBg: 'bg-[#700f2e] text-rose-200 border-rose-500',
    spaceBg: 'bg-gradient-to-r from-rose-700 to-red-700 text-white border-rose-400 font-bold',
    badge: '🌹 ورود حمراء'
  },
  {
    id: 'pink-hearts-sparkle',
    name: 'Sparkling Pink Hearts',
    nameAr: 'قلوب متلألئة وزهور وردية',
    category: 'نسائي',
    bgGradient: 'bg-gradient-to-b from-[#fdf2f8] via-[#fce7f3] to-[#fbcfe8]',
    keyboardBg: 'bg-[#fce7f3]',
    keyBg: 'bg-white hover:bg-pink-50 active:bg-pink-100 text-pink-900 shadow-[0_2px_8px_rgba(236,72,153,0.2)]',
    keyBorder: 'border-pink-300 border-b-pink-400 border-b-2',
    keyText: 'text-pink-950 font-bold',
    keySecondary: 'text-pink-600',
    keyAccent: 'text-rose-500',
    accentBg: 'bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold',
    accentText: 'text-white',
    specialKeyBg: 'bg-pink-100 text-pink-900 border-pink-300',
    spaceBg: 'bg-white text-pink-950 border-pink-300 font-bold',
    badge: '💖 قلوب لامعة'
  },

  // 2. الثيمات الرياضية (أندية سعودية، إنجليزية، إسبانية)
  {
    id: 'club-alhilal',
    name: 'Al Hilal SFC (Blue Wave)',
    nameAr: 'نادي الهلال السعودي (الموج الأزرق)',
    category: 'رياضي',
    bgGradient: 'bg-gradient-to-b from-[#1e3a8a] via-[#1d4ed8] to-[#1e40af]',
    keyboardBg: 'bg-[#172554]',
    keyBg: 'bg-gradient-to-b from-[#2563eb] to-[#1d4ed8] hover:from-[#3b82f6] hover:to-[#2563eb] shadow-[0_0_12px_rgba(37,99,235,0.4)]',
    keyBorder: 'border-blue-400 border-b-blue-900 border-b-2',
    keyText: 'text-white font-black',
    keySecondary: 'text-blue-200',
    keyAccent: 'text-cyan-300',
    accentBg: 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black',
    accentText: 'text-white',
    specialKeyBg: 'bg-[#1e3a8a] text-blue-200 border-blue-400',
    spaceBg: 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white border-blue-300 font-bold',
    badge: '💙 نادي الهلال'
  },
  {
    id: 'club-alnassr',
    name: 'Al Nassr FC (Global)',
    nameAr: 'نادي النصر السعودي (العالمي)',
    category: 'رياضي',
    bgGradient: 'bg-gradient-to-b from-[#18181b] via-[#27272a] to-[#09090b]',
    keyboardBg: 'bg-[#121214]',
    keyBg: 'bg-gradient-to-b from-[#eab308] to-[#ca8a04] hover:from-[#facc15] hover:to-[#eab308] shadow-[0_0_12px_rgba(234,179,8,0.4)]',
    keyBorder: 'border-yellow-400 border-b-yellow-700 border-b-2',
    keyText: 'text-black font-black',
    keySecondary: 'text-yellow-950',
    keyAccent: 'text-white',
    accentBg: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black',
    accentText: 'text-black',
    specialKeyBg: 'bg-[#1f1f23] text-yellow-400 border-yellow-500',
    spaceBg: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black border-yellow-300 font-bold',
    badge: '💛 نادي النصر'
  },
  {
    id: 'club-alittihad',
    name: 'Al Ittihad FC ( العميد)',
    nameAr: 'نادي الاتحاد السعودي (العميد)',
    category: 'رياضي',
    bgGradient: 'bg-gradient-to-b from-[#18181b] via-[#111113] to-[#09090b]',
    keyboardBg: 'bg-[#0f0f11]',
    keyBg: 'bg-gradient-to-b from-[#facc15] to-[#eab308] hover:from-[#fde047] hover:to-[#facc15] shadow-[0_0_10px_rgba(250,204,21,0.3)]',
    keyBorder: 'border-yellow-500 border-b-black border-b-2',
    keyText: 'text-black font-black',
    keySecondary: 'text-zinc-900',
    keyAccent: 'text-amber-300',
    accentBg: 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-black font-black',
    accentText: 'text-black',
    specialKeyBg: 'bg-[#18181b] text-yellow-400 border-yellow-500',
    spaceBg: 'bg-gradient-to-r from-yellow-400 to-amber-400 text-black border-yellow-300 font-bold',
    badge: '🖤💛 نادي الاتحاد'
  },
  {
    id: 'club-alahli',
    name: 'Al Ahli SFC (The Royal)',
    nameAr: 'نادي الأهلي السعودي (الراقي)',
    category: 'رياضي',
    bgGradient: 'bg-gradient-to-b from-[#064e3b] via-[#022c22] to-[#021a14]',
    keyboardBg: 'bg-[#02231c]',
    keyBg: 'bg-gradient-to-b from-[#059669] to-[#047857] hover:from-[#10b981] hover:to-[#059669] shadow-[0_0_12px_rgba(5,150,105,0.4)]',
    keyBorder: 'border-emerald-400 border-b-emerald-900 border-b-2',
    keyText: 'text-white font-black',
    keySecondary: 'text-emerald-200',
    keyAccent: 'text-yellow-300',
    accentBg: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black',
    accentText: 'text-white',
    specialKeyBg: 'bg-[#064e3b] text-emerald-200 border-emerald-400',
    spaceBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-300 font-bold',
    badge: '💚 نادي الأهلي'
  },
  {
    id: 'club-realmadrid',
    name: 'Real Madrid CF (Los Blancos)',
    nameAr: 'نادي ريال مدريد الإسباني (الملكي)',
    category: 'رياضي',
    bgGradient: 'bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617]',
    keyboardBg: 'bg-[#0b1329]',
    keyBg: 'bg-gradient-to-b from-white to-slate-200 hover:from-slate-50 hover:to-white text-slate-900 shadow-[0_0_12px_rgba(255,255,255,0.25)]',
    keyBorder: 'border-amber-300 border-b-slate-400 border-b-2',
    keyText: 'text-slate-950 font-black',
    keySecondary: 'text-slate-600',
    keyAccent: 'text-amber-500',
    accentBg: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black',
    accentText: 'text-slate-950',
    specialKeyBg: 'bg-slate-800 text-amber-300 border-amber-400/50',
    spaceBg: 'bg-gradient-to-r from-white to-slate-200 text-slate-900 border-amber-300 font-bold',
    badge: '👑 ريال مدريد'
  },
  {
    id: 'club-barcelona',
    name: 'FC Barcelona (Blaugrana)',
    nameAr: 'نادي برشلونة الإسباني (البارسا)',
    category: 'رياضي',
    bgGradient: 'bg-gradient-to-b from-[#1e1b4b] via-[#172554] to-[#090d16]',
    keyboardBg: 'bg-[#0d1629]',
    keyBg: 'bg-gradient-to-b from-[#1d4ed8] to-[#1e3a8a] hover:from-[#2563eb] hover:to-[#1d4ed8] shadow-[0_0_12px_rgba(29,78,216,0.4)]',
    keyBorder: 'border-amber-400 border-b-red-700 border-b-2',
    keyText: 'text-white font-black',
    keySecondary: 'text-amber-300',
    keyAccent: 'text-red-400',
    accentBg: 'bg-gradient-to-r from-red-600 to-blue-600 text-white font-black',
    accentText: 'text-white',
    specialKeyBg: 'bg-[#1e1b4b] text-amber-300 border-amber-400',
    spaceBg: 'bg-gradient-to-r from-blue-700 via-indigo-700 to-red-700 text-white border-amber-300 font-bold',
    badge: '🔴🔵 برشلونة'
  },
  {
    id: 'club-manutd',
    name: 'Manchester United (Red Devils)',
    nameAr: 'نادي مانشستر يونايتد (الشياطين الحمر)',
    category: 'رياضي',
    bgGradient: 'bg-gradient-to-b from-[#450a0a] via-[#260505] to-[#120202]',
    keyboardBg: 'bg-[#1a0303]',
    keyBg: 'bg-gradient-to-b from-[#dc2626] to-[#b91c1c] hover:from-[#ef4444] hover:to-[#dc2626] shadow-[0_0_12px_rgba(220,38,38,0.4)]',
    keyBorder: 'border-amber-400 border-b-red-950 border-b-2',
    keyText: 'text-white font-black',
    keySecondary: 'text-red-200',
    keyAccent: 'text-amber-300',
    accentBg: 'bg-gradient-to-r from-red-600 to-amber-500 text-white font-black',
    accentText: 'text-white',
    specialKeyBg: 'bg-[#581c1c] text-amber-300 border-amber-400',
    spaceBg: 'bg-gradient-to-r from-red-700 to-red-800 text-white border-amber-400 font-bold',
    badge: '👹 مانشستر يونايتد'
  },
  {
    id: 'club-liverpool',
    name: 'Liverpool FC (The Reds)',
    nameAr: 'نادي ليفربول الإنجليزي (الريدز)',
    category: 'رياضي',
    bgGradient: 'bg-gradient-to-b from-[#500724] via-[#380417] to-[#18010b]',
    keyboardBg: 'bg-[#22020e]',
    keyBg: 'bg-gradient-to-b from-[#e11d48] to-[#be123c] hover:from-[#f43f5e] hover:to-[#e11d48] shadow-[0_0_12px_rgba(225,29,72,0.4)]',
    keyBorder: 'border-yellow-400 border-b-rose-950 border-b-2',
    keyText: 'text-white font-black',
    keySecondary: 'text-rose-200',
    keyAccent: 'text-yellow-300',
    accentBg: 'bg-gradient-to-r from-rose-600 to-yellow-500 text-white font-black',
    accentText: 'text-white',
    specialKeyBg: 'bg-[#6b0f2a] text-yellow-300 border-yellow-400',
    spaceBg: 'bg-gradient-to-r from-rose-700 to-red-700 text-white border-yellow-400 font-bold',
    badge: '🔴 ليفربول'
  },

  // 3. الثيمات الجديدة المستوحاة من لقطات الشاشة (Heart Glow, RGB Neon, Galaxy Sparkle, Cute Sweets)
  {
    id: 'heart-glow',
    name: 'Romantic Heart Glow',
    nameAr: 'قلوب متوهجة رومانسية',
    category: 'رومانسي',
    bgGradient: 'bg-gradient-to-b from-[#2e0814] via-[#1a040b] to-[#0d0205]',
    keyboardBg: 'bg-[#120205]',
    keyBg: 'bg-gradient-to-b from-[#e11d48] to-[#9f1239] hover:from-[#f43f5e] hover:to-[#be123c] shadow-[0_0_12px_rgba(225,29,72,0.4)]',
    keyBorder: 'border-rose-400 border-b-rose-700 border-b-2',
    keyText: 'text-white font-bold',
    keySecondary: 'text-rose-200',
    keyAccent: 'text-yellow-300',
    accentBg: 'bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold',
    accentText: 'text-white',
    specialKeyBg: 'bg-[#581c87] text-rose-200 border-rose-400',
    spaceBg: 'bg-gradient-to-r from-rose-600 to-pink-600 text-white border-rose-300',
    badge: '❤️ قلوب متوهجة'
  },
  {
    id: 'rgb-neon-led',
    name: 'RGB Neon LED Border Glow',
    nameAr: 'إضاءة نيون LED قوس قزح',
    category: 'مضيء',
    bgGradient: 'bg-gradient-to-b from-[#09090b] via-[#050507] to-[#000000]',
    keyboardBg: 'bg-[#050507]',
    keyBg: 'bg-[#18181b] hover:bg-[#27272a] active:bg-[#09090b] shadow-[0_0_10px_rgba(6,182,212,0.3)]',
    keyBorder: 'border-cyan-400 border-b-pink-500 border-b-2',
    keyText: 'text-cyan-300 font-bold',
    keySecondary: 'text-pink-400',
    keyAccent: 'text-yellow-300',
    accentBg: 'bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-black font-black',
    accentText: 'text-black',
    specialKeyBg: 'bg-[#1e1b4b] text-cyan-200 border-cyan-400',
    spaceBg: 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white border-cyan-300 font-bold',
    badge: '🌈 نيون LED'
  },
  {
    id: 'galaxy-sparkle',
    name: 'Galaxy Purple Sparkle',
    nameAr: 'مجرة أرجوانية مع أحجار لامعة',
    category: 'فاخر',
    bgGradient: 'bg-gradient-to-b from-[#3b0764] via-[#1e1b4b] to-[#0f172a]',
    keyboardBg: 'bg-[#170f2b]',
    keyBg: 'bg-gradient-to-b from-[#6b21a8] to-[#4c1d95] hover:from-[#7e22ce] hover:to-[#581c87] shadow-[0_0_15px_rgba(168,85,247,0.4)]',
    keyBorder: 'border-purple-400 border-b-fuchsia-600 border-b-2',
    keyText: 'text-purple-100 font-bold',
    keySecondary: 'text-fuchsia-300',
    keyAccent: 'text-yellow-300',
    accentBg: 'bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-bold',
    accentText: 'text-white',
    specialKeyBg: 'bg-[#311042] text-fuchsia-200 border-purple-400',
    spaceBg: 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white border-purple-300',
    badge: '✨ مجرة لامعة'
  },
  {
    id: 'cute-sweets',
    name: 'Cute Sweet Pastels',
    nameAr: 'حلويات وبستيل لطيف',
    category: 'كيوت',
    bgGradient: 'bg-gradient-to-b from-[#fce7f3] via-[#fbcfe8] to-[#f472b6]',
    keyboardBg: 'bg-[#fbcfe8]',
    keyBg: 'bg-white hover:bg-pink-50 active:bg-pink-100 text-pink-900 shadow-[0_2px_6px_rgba(244,114,182,0.3)]',
    keyBorder: 'border-pink-300 border-b-pink-400 border-b-2',
    keyText: 'text-pink-950 font-bold',
    keySecondary: 'text-pink-600',
    keyAccent: 'text-rose-500',
    accentBg: 'bg-gradient-to-r from-pink-400 to-rose-400 text-white font-bold',
    accentText: 'text-white',
    specialKeyBg: 'bg-pink-100 text-pink-900 border-pink-300',
    spaceBg: 'bg-white text-pink-950 border-pink-300 font-bold',
    badge: '🧁 حلويات لطيفة'
  },
  // 1. الألوان الافتراضية والصلبة (Default & Solid Colors)
  REMO_DEFAULT_THEME,
  {
    id: 'matte-black',
    name: 'Stealth Matte Black',
    nameAr: 'أسود ملكي مطفأ',
    category: 'افتراضي',
    bgGradient: 'bg-[#050507]',
    keyboardBg: 'bg-[#09090b]',
    keyBg: 'bg-[#18181b] hover:bg-[#27272a] active:bg-[#09090b] shadow-[0_2px_4px_rgba(0,0,0,0.7)]',
    keyBorder: 'border-zinc-800 border-b-zinc-950 border-b-2',
    keyText: 'text-zinc-100',
    keySecondary: 'text-zinc-500',
    keyAccent: 'text-amber-400',
    accentBg: 'bg-zinc-800 hover:bg-zinc-700 text-white',
    accentText: 'text-white',
    specialKeyBg: 'bg-[#121215] text-zinc-300 border-zinc-800',
    spaceBg: 'bg-[#18181b] text-zinc-200 border-zinc-800',
    badge: 'افتراضي فخم'
  },
  {
    id: 'slate-gray',
    name: 'Titanium Classic Gray',
    nameAr: 'رمادي تيتانيوم كلاسيكي',
    category: 'افتراضي',
    bgGradient: 'bg-[#1e293b]',
    keyboardBg: 'bg-[#0f172a]',
    keyBg: 'bg-[#334155] hover:bg-[#475569] active:bg-[#1e293b] shadow-md',
    keyBorder: 'border-[#475569] border-b-[#0f172a] border-b-2',
    keyText: 'text-slate-100',
    keySecondary: 'text-slate-400',
    keyAccent: 'text-sky-400',
    accentBg: 'bg-sky-500 hover:bg-sky-400 text-slate-950',
    accentText: 'text-slate-950',
    specialKeyBg: 'bg-[#1e293b] text-slate-300 border-[#334155]',
    spaceBg: 'bg-[#334155] text-slate-100',
    badge: 'كلاسيك رصاصي'
  },
  {
    id: 'deep-navy',
    name: 'Deep Royal Navy',
    nameAr: 'كحلي ملكي عميق',
    category: 'افتراضي',
    bgGradient: 'bg-[#0a1128]',
    keyboardBg: 'bg-[#03071e]',
    keyBg: 'bg-[#1c2541] hover:bg-[#233157] active:bg-[#0b132b] shadow-md',
    keyBorder: 'border-[#3a506b]/60 border-b-[#03071e] border-b-2',
    keyText: 'text-blue-50',
    keySecondary: 'text-blue-300/70',
    keyAccent: 'text-cyan-400',
    accentBg: 'bg-cyan-500 hover:bg-cyan-400 text-black',
    accentText: 'text-black',
    specialKeyBg: 'bg-[#0b132b] text-blue-200 border-[#1c2541]',
    spaceBg: 'bg-[#1c2541] text-blue-100',
    badge: 'أزرق كحلي'
  },
  {
    id: 'burgundy-wine',
    name: 'Burgundy Damascus Wine',
    nameAr: 'عنابي دمشقي كلاسيكي',
    category: 'افتراضي',
    bgGradient: 'bg-[#2b0914]',
    keyboardBg: 'bg-[#18040b]',
    keyBg: 'bg-[#4a1525] hover:bg-[#5e1b30] active:bg-[#2c0813] shadow-md',
    keyBorder: 'border-[#70243b]/60 border-b-[#18040b] border-b-2',
    keyText: 'text-rose-100',
    keySecondary: 'text-rose-300/60',
    keyAccent: 'text-amber-400',
    accentBg: 'bg-amber-500 hover:bg-amber-400 text-black',
    accentText: 'text-black',
    specialKeyBg: 'bg-[#260711] text-rose-200 border-[#4a1525]',
    spaceBg: 'bg-[#4a1525] text-rose-100',
    badge: 'عنابي داكن'
  },
  {
    id: 'forest-green',
    name: 'Emerald Forest Green',
    nameAr: 'أخضر زمردي فاخر',
    category: 'افتراضي',
    bgGradient: 'bg-[#062419]',
    keyboardBg: 'bg-[#03150e]',
    keyBg: 'bg-[#0f432f] hover:bg-[#165a40] active:bg-[#072419] shadow-md',
    keyBorder: 'border-[#1b6b4d]/70 border-b-[#03150e] border-b-2',
    keyText: 'text-emerald-100',
    keySecondary: 'text-emerald-300/60',
    keyAccent: 'text-emerald-400',
    accentBg: 'bg-emerald-500 hover:bg-emerald-400 text-black',
    accentText: 'text-black',
    specialKeyBg: 'bg-[#08291c] text-emerald-200 border-[#0f432f]',
    spaceBg: 'bg-[#0f432f] text-emerald-100',
    badge: 'أخضر ملكي'
  },
  {
    id: 'pure-white-minimal',
    name: 'Pure Clean White',
    nameAr: 'أبيض ناصع مينيمال',
    category: 'افتراضي',
    bgGradient: 'bg-[#f1f5f9]',
    keyboardBg: 'bg-[#e2e8f0]',
    keyBg: 'bg-white hover:bg-slate-50 active:bg-slate-200 text-slate-800 shadow-[0_2px_4px_rgba(0,0,0,0.1)]',
    keyBorder: 'border-slate-300 border-b-slate-400 border-b-2',
    keyText: 'text-slate-900',
    keySecondary: 'text-slate-500',
    keyAccent: 'text-blue-600',
    accentBg: 'bg-blue-600 hover:bg-blue-500 text-white',
    accentText: 'text-white',
    specialKeyBg: 'bg-[#cbd5e1] text-slate-800 border-slate-300',
    spaceBg: 'bg-white text-slate-900 border-slate-300',
    badge: 'أبيض نقي'
  },

  // 2. الثيمات الشبابية (Youth & Tech & Gaming)
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk 2077 Neon',
    nameAr: 'سايبر بنك نيون شبابي',
    category: 'شبابي',
    bgGradient: 'bg-gradient-to-b from-[#0a0a14] via-[#120f26] to-[#080711]',
    keyboardBg: 'bg-[#0d0b1a]',
    keyBg: 'bg-gradient-to-b from-[#1f1938] to-[#120e24] hover:from-[#2e2652] hover:to-[#1b1536] shadow-[0_2px_8px_rgba(244,63,94,0.3)]',
    keyBorder: 'border-pink-500/50 border-b-cyan-500 border-b-2',
    keyText: 'text-cyan-300',
    keySecondary: 'text-yellow-400',
    keyAccent: 'text-pink-400',
    accentBg: 'bg-gradient-to-r from-pink-500 to-yellow-500 text-black font-bold',
    accentText: 'text-black',
    specialKeyBg: 'bg-[#16102a] text-yellow-300 border-yellow-500/40',
    spaceBg: 'bg-gradient-to-r from-[#1b1433] via-[#2a1638] to-[#1b1433] text-cyan-200 border-pink-500/40',
    badge: 'Cyberpunk'
  },
  {
    id: 'carbon-drift',
    name: 'Midnight Carbon Drift',
    nameAr: 'كاربون دريفت وسرعة',
    category: 'شبابي',
    bgGradient: 'bg-neutral-950',
    keyboardBg: 'bg-[#0f0f11]',
    keyBg: 'bg-gradient-to-b from-[#2a2a2e] to-[#171719] hover:from-[#3a3a40] hover:to-[#222225] shadow-md',
    keyBorder: 'border-red-600/60 border-b-red-600 border-b-2',
    keyText: 'text-zinc-100',
    keySecondary: 'text-red-400',
    keyAccent: 'text-red-500',
    accentBg: 'bg-red-600 hover:bg-red-500 text-white',
    accentText: 'text-white',
    specialKeyBg: 'bg-[#1b1b1e] text-red-300 border-red-900/60',
    spaceBg: 'bg-[#222226] text-zinc-200 border-red-600/40',
    badge: 'Racing'
  },
  {
    id: 'gaming-rgb',
    name: 'Pro Gamer RGB Chroma',
    nameAr: 'ألعاب RGB كروما الاحترافي',
    category: 'شبابي',
    bgGradient: 'bg-[#090a15]',
    keyboardBg: 'bg-[#070811]',
    keyBg: 'bg-[#13172e] hover:bg-[#1c2245] active:bg-[#0d1021] shadow-[0_2px_10px_rgba(59,130,246,0.3)]',
    keyBorder: 'border-indigo-500/60 border-b-cyan-400 border-b-2',
    keyText: 'text-cyan-200',
    keySecondary: 'text-purple-300',
    keyAccent: 'text-cyan-300',
    accentBg: 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 text-white',
    accentText: 'text-white',
    specialKeyBg: 'bg-[#0d1022] text-cyan-300 border-indigo-500/50',
    spaceBg: 'bg-[#13172e] text-cyan-200 border-cyan-400/50',
    badge: 'RGB Chroma'
  },
  {
    id: 'midnight-tech',
    name: 'Midnight Blue Flame',
    nameAr: 'لهب الفولاذ الأزرق الشبابي',
    category: 'شبابي',
    bgGradient: 'bg-gradient-to-b from-blue-950/90 via-slate-950 to-slate-950',
    keyboardBg: 'bg-slate-950',
    keyBg: 'bg-gradient-to-b from-[#162744] to-[#0c182c] hover:from-[#1f3760] hover:to-[#12233f] shadow-md',
    keyBorder: 'border-blue-500/50 border-b-blue-500 border-b-2',
    keyText: 'text-blue-100',
    keySecondary: 'text-blue-300',
    keyAccent: 'text-blue-400',
    accentBg: 'bg-blue-600 hover:bg-blue-500 text-white',
    accentText: 'text-white',
    specialKeyBg: 'bg-[#0a1424] text-blue-300 border-blue-600/40',
    spaceBg: 'bg-[#102038] text-blue-100 border-blue-500/40',
    badge: 'Blue Flame'
  },

  // 3. الثيمات الرياضية (Sports & Stadiums & Football)
  {
    id: 'stadium-pitch',
    name: 'Champions Football Pitch',
    nameAr: 'عشب الملاعب والأبطال الرياضي',
    category: 'رياضي',
    bgGradient: 'bg-gradient-to-b from-[#063319] via-[#042412] to-[#021309]',
    keyboardBg: 'bg-[#042211]',
    keyBg: 'bg-gradient-to-b from-[#115e34] to-[#0b4224] hover:from-[#167843] hover:to-[#0e522d] shadow-[0_2px_4px_rgba(0,0,0,0.5)]',
    keyBorder: 'border-emerald-400/60 border-b-white border-b-2',
    keyText: 'text-white font-bold',
    keySecondary: 'text-yellow-300',
    keyAccent: 'text-yellow-400',
    accentBg: 'bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold',
    accentText: 'text-black',
    specialKeyBg: 'bg-[#08351d] text-emerald-200 border-emerald-500/50',
    spaceBg: 'bg-[#0e522d] text-white border-white/60',
    badge: 'Football ⚽'
  },
  {
    id: 'barca-sport',
    name: 'Blaugrana Legend Sport',
    nameAr: 'بلوغرانا الأبطال الرياضي',
    category: 'رياضي',
    bgGradient: 'bg-gradient-to-b from-[#0a1128] via-[#1c0817] to-[#080512]',
    keyboardBg: 'bg-[#0b0c1b]',
    keyBg: 'bg-gradient-to-b from-[#0c2340] to-[#590d22] hover:from-[#133560] hover:to-[#78122e] shadow-md',
    keyBorder: 'border-amber-400/70 border-b-amber-400 border-b-2',
    keyText: 'text-amber-100',
    keySecondary: 'text-amber-300',
    keyAccent: 'text-amber-400',
    accentBg: 'bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold',
    accentText: 'text-blue-950',
    specialKeyBg: 'bg-[#1b0816] text-amber-200 border-amber-500/40',
    spaceBg: 'bg-gradient-to-r from-[#0c2340] via-[#590d22] to-[#0c2340] text-amber-100 border-amber-400/50',
    badge: 'Blaugrana 🏆'
  },
  {
    id: 'real-madrid-white',
    name: 'Royal Champion White Gold',
    nameAr: 'الملكي الأبيض والذهب الرياضي',
    category: 'رياضي',
    bgGradient: 'bg-gradient-to-b from-[#f8fafc] via-[#e2e8f0] to-[#cbd5e1]',
    keyboardBg: 'bg-[#e2e8f0]',
    keyBg: 'bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 shadow-[0_2px_5px_rgba(0,0,0,0.15)]',
    keyBorder: 'border-amber-400/80 border-b-indigo-900 border-b-2',
    keyText: 'text-slate-950 font-bold',
    keySecondary: 'text-indigo-900 font-semibold',
    keyAccent: 'text-amber-500',
    accentBg: 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold',
    accentText: 'text-black',
    specialKeyBg: 'bg-[#1e1b4b] text-amber-300 border-amber-400',
    spaceBg: 'bg-white text-indigo-950 border-amber-400/80 font-bold',
    badge: 'Royal Gold 👑'
  },
  {
    id: 'racing-red',
    name: 'Ferrari Velocity Racing',
    nameAr: 'حلبة السباق الحمراء الرياضية',
    category: 'رياضي',
    bgGradient: 'bg-gradient-to-b from-[#260307] via-[#120204] to-[#080102]',
    keyboardBg: 'bg-[#0f0103]',
    keyBg: 'bg-gradient-to-b from-[#c8102e] to-[#7f0b1c] hover:from-[#e01435] hover:to-[#960d21] shadow-[0_2px_6px_rgba(200,16,46,0.5)]',
    keyBorder: 'border-red-400/60 border-b-white border-b-2',
    keyText: 'text-white font-bold',
    keySecondary: 'text-yellow-300',
    keyAccent: 'text-yellow-300',
    accentBg: 'bg-white hover:bg-slate-100 text-red-700 font-black',
    accentText: 'text-red-700',
    specialKeyBg: 'bg-[#40050e] text-white border-red-500',
    spaceBg: 'bg-[#960d21] text-white border-white/60',
    badge: 'Velocity 🏎️'
  },
  {
    id: 'champion-gold',
    name: 'Golden World Cup Arena',
    nameAr: 'ليالي المونديال والكأس الذهبية',
    category: 'رياضي',
    bgGradient: 'bg-[#0f1118]',
    keyboardBg: 'bg-[#07080c]',
    keyBg: 'bg-gradient-to-b from-[#242114] to-[#17150c] hover:from-[#332f1c] hover:to-[#211e11] shadow-md',
    keyBorder: 'border-amber-500/70 border-b-amber-400 border-b-2',
    keyText: 'text-amber-200 font-bold',
    keySecondary: 'text-amber-400',
    keyAccent: 'text-amber-300',
    accentBg: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold',
    accentText: 'text-black',
    specialKeyBg: 'bg-[#15130b] text-amber-300 border-amber-600/50',
    spaceBg: 'bg-[#1c1a0f] text-amber-200 border-amber-500/60',
    badge: 'World Cup 🥇'
  },

  // 4. الثيمات النسائية الراقية (Feminine Luxury & Silk)
  {
    id: 'rose-gold-luxury',
    name: 'Pearl Rose Gold Luxury',
    nameAr: 'لؤلؤ الروز جولد النسائي الملكي',
    category: 'نسائي',
    bgGradient: 'bg-gradient-to-b from-[#231219] via-[#1a0c13] to-[#12080d]',
    keyboardBg: 'bg-[#140a0f]',
    keyBg: 'bg-gradient-to-b from-[#4a2434] to-[#2d141e] hover:from-[#5c2d41] hover:to-[#3b1b28] shadow-[0_2px_5px_rgba(244,114,182,0.25)]',
    keyBorder: 'border-pink-300/40 border-b-amber-300 border-b-2',
    keyText: 'text-rose-100',
    keySecondary: 'text-amber-200',
    keyAccent: 'text-pink-300',
    accentBg: 'bg-gradient-to-r from-rose-300 via-pink-300 to-amber-200 text-rose-950 font-bold',
    accentText: 'text-rose-950',
    specialKeyBg: 'bg-[#220d17] text-rose-200 border-pink-400/30',
    spaceBg: 'bg-[#3b1b28] text-rose-100 border-pink-300/40',
    badge: 'Rose Gold ✨'
  },
  {
    id: 'lavender-silk',
    name: 'Royal Lavender Silk',
    nameAr: 'حرير اللافندر النسائي الفاخر',
    category: 'نسائي',
    bgGradient: 'bg-gradient-to-b from-[#1b122c] via-[#120b1f] to-[#0c0714]',
    keyboardBg: 'bg-[#0f0919]',
    keyBg: 'bg-gradient-to-b from-[#352454] to-[#201533] hover:from-[#432e6b] hover:to-[#2a1c42] shadow-[0_2px_6px_rgba(168,85,247,0.3)]',
    keyBorder: 'border-purple-400/50 border-b-purple-300 border-b-2',
    keyText: 'text-purple-100',
    keySecondary: 'text-purple-300',
    keyAccent: 'text-purple-300',
    accentBg: 'bg-gradient-to-r from-purple-400 to-pink-400 text-purple-950 font-bold',
    accentText: 'text-purple-950',
    specialKeyBg: 'bg-[#180f26] text-purple-200 border-purple-500/30',
    spaceBg: 'bg-[#281b40] text-purple-100 border-purple-400/40',
    badge: 'Lavender 💜'
  },
  {
    id: 'velvet-emerald',
    name: 'Feminine Velvet Emerald',
    nameAr: 'مخمل الزمرد النسائي الأنيق',
    category: 'نسائي',
    bgGradient: 'bg-gradient-to-b from-[#092218] via-[#051710] to-[#030e0a]',
    keyboardBg: 'bg-[#04120d]',
    keyBg: 'bg-gradient-to-b from-[#104330] to-[#0a291e] hover:from-[#17573f] hover:to-[#0f3b2b] shadow-md',
    keyBorder: 'border-emerald-300/50 border-b-amber-300 border-b-2',
    keyText: 'text-emerald-100',
    keySecondary: 'text-amber-200',
    keyAccent: 'text-emerald-300',
    accentBg: 'bg-gradient-to-r from-emerald-400 to-amber-300 text-emerald-950 font-bold',
    accentText: 'text-emerald-950',
    specialKeyBg: 'bg-[#071d15] text-emerald-200 border-emerald-500/40',
    spaceBg: 'bg-[#0e3627] text-emerald-100 border-emerald-300/40',
    badge: 'Velvet Emerald 💚'
  },
  {
    id: 'pearl-champagne',
    name: 'Soft Champagne Shimmer',
    nameAr: 'بريق الشمبانيا واللؤلؤ الناعم',
    category: 'نسائي',
    bgGradient: 'bg-[#1a1714]',
    keyboardBg: 'bg-[#100e0c]',
    keyBg: 'bg-gradient-to-b from-[#383129] to-[#241f1a] hover:from-[#473e34] hover:to-[#2e2721] shadow-md',
    keyBorder: 'border-amber-200/50 border-b-amber-100 border-b-2',
    keyText: 'text-amber-100',
    keySecondary: 'text-amber-200/70',
    keyAccent: 'text-amber-300',
    accentBg: 'bg-gradient-to-r from-amber-200 to-amber-100 text-amber-950 font-bold',
    accentText: 'text-amber-950',
    specialKeyBg: 'bg-[#1b1713] text-amber-200 border-amber-300/30',
    spaceBg: 'bg-[#2b2520] text-amber-100 border-amber-200/40',
    badge: 'Champagne 🥂'
  },

  // 5. الثيمات البناتية المبهجة والكيوت (Girly & Kawaii & Pastel)
  {
    id: 'barbie-glow',
    name: 'Barbie Neon Glow',
    nameAr: 'باربي بينك نيون المشرق',
    category: 'بناتي',
    bgGradient: 'bg-gradient-to-b from-[#3d0b28] via-[#240618] to-[#15030e]',
    keyboardBg: 'bg-[#1d0513]',
    keyBg: 'bg-gradient-to-b from-[#be185d] to-[#831843] hover:from-[#db2777] hover:to-[#9d174d] shadow-[0_2px_8px_rgba(244,63,94,0.4)]',
    keyBorder: 'border-pink-300/60 border-b-white border-b-2',
    keyText: 'text-white font-bold',
    keySecondary: 'text-pink-200',
    keyAccent: 'text-pink-300',
    accentBg: 'bg-white hover:bg-pink-100 text-pink-700 font-extrabold shadow-sm',
    accentText: 'text-pink-700',
    specialKeyBg: 'bg-[#50072b] text-pink-100 border-pink-400/50',
    spaceBg: 'bg-[#9d174d] text-white border-white/60',
    badge: 'Barbie Glow 💖'
  },
  {
    id: 'sweet-candy-pastel',
    name: 'Sweet Candy Pastel',
    nameAr: 'باستيل سويت كاندي اللطيف',
    category: 'بناتي',
    bgGradient: 'bg-gradient-to-b from-[#fdf2f8] via-[#fce7f3] to-[#fbcfe8]',
    keyboardBg: 'bg-[#fbcfe8]',
    keyBg: 'bg-white hover:bg-pink-50 active:bg-pink-100 text-pink-900 shadow-[0_2px_5px_rgba(244,114,182,0.3)]',
    keyBorder: 'border-pink-300 border-b-pink-400 border-b-2',
    keyText: 'text-pink-950 font-bold',
    keySecondary: 'text-pink-500',
    keyAccent: 'text-pink-600',
    accentBg: 'bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold',
    accentText: 'text-white',
    specialKeyBg: 'bg-[#f472b6] text-white border-pink-400',
    spaceBg: 'bg-white text-pink-950 border-pink-300',
    badge: 'Sweet Candy 🍭'
  },
  {
    id: 'strawberry-milk',
    name: 'Strawberry Milk Kawaii',
    nameAr: 'فراولة وحليب كيوت ناعم',
    category: 'بناتي',
    bgGradient: 'bg-gradient-to-b from-[#2e101b] via-[#1a080f] to-[#100409]',
    keyboardBg: 'bg-[#15060c]',
    keyBg: 'bg-gradient-to-b from-[#6b1e38] to-[#431122] hover:from-[#7e2443] hover:to-[#53152a] shadow-md',
    keyBorder: 'border-rose-300/50 border-b-rose-200 border-b-2',
    keyText: 'text-rose-100 font-semibold',
    keySecondary: 'text-rose-200',
    keyAccent: 'text-rose-300',
    accentBg: 'bg-gradient-to-r from-rose-400 to-pink-300 text-rose-950 font-bold',
    accentText: 'text-rose-950',
    specialKeyBg: 'bg-[#290915] text-rose-200 border-rose-400/40',
    spaceBg: 'bg-[#501429] text-rose-100 border-rose-300/40',
    badge: 'Strawberry 🍓'
  },
  {
    id: 'purple-blossom',
    name: 'Lilac Blossom Kawaii',
    nameAr: 'زهور البنفسج واللافندر الكيوت',
    category: 'بناتي',
    bgGradient: 'bg-gradient-to-b from-[#f3e8ff] via-[#e9d5ff] to-[#d8b4fe]',
    keyboardBg: 'bg-[#d8b4fe]',
    keyBg: 'bg-white hover:bg-purple-50 active:bg-purple-100 text-purple-900 shadow-[0_2px_4px_rgba(168,85,247,0.25)]',
    keyBorder: 'border-purple-300 border-b-purple-400 border-b-2',
    keyText: 'text-purple-950 font-bold',
    keySecondary: 'text-purple-500',
    keyAccent: 'text-purple-600',
    accentBg: 'bg-purple-600 hover:bg-purple-500 text-white font-bold',
    accentText: 'text-white',
    specialKeyBg: 'bg-[#c084fc] text-white border-purple-400',
    spaceBg: 'bg-white text-purple-950 border-purple-300',
    badge: 'Lilac Blossom 🌸'
  },
  {
    id: 'rose-silk',
    name: 'Rose Silk Bloom',
    nameAr: 'حرير الوردي النسائي الهادئ',
    category: 'بناتي',
    bgGradient: 'bg-gradient-to-b from-pink-950/70 via-rose-950/60 to-slate-950',
    keyboardBg: 'bg-pink-950/80',
    keyBg: 'bg-pink-900/40 hover:bg-pink-800/50 active:bg-pink-900/70 shadow-md',
    keyBorder: 'border-pink-500/30',
    keyText: 'text-pink-100',
    keySecondary: 'text-pink-300/70',
    keyAccent: 'text-pink-400',
    accentBg: 'bg-pink-500 hover:bg-pink-400 active:bg-pink-600',
    accentText: 'text-slate-950',
    specialKeyBg: 'bg-pink-950/60 text-pink-200 hover:bg-pink-900/60',
    spaceBg: 'bg-pink-900/50 text-pink-100 border-pink-500/30',
    badge: 'Rose Silk 🌷'
  },

  // 6. الثيمات الإسلامية والتراثية
  {
    id: 'islamic-gold',
    name: 'Islamic Lanterns',
    nameAr: 'فوانيس ذهبية إسلامية',
    category: 'إسلامي',
    bgGradient: 'bg-gradient-to-b from-amber-950/50 via-slate-950 to-slate-950',
    keyboardBg: 'bg-stone-950',
    keyBg: 'bg-gradient-to-b from-[#332514] to-[#1c140a] hover:from-[#42311b] hover:to-[#261c0e] shadow-md',
    keyBorder: 'border-amber-600/50 border-b-amber-400 border-b-2',
    keyText: 'text-amber-100',
    keySecondary: 'text-amber-300/70',
    keyAccent: 'text-amber-400',
    accentBg: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold',
    accentText: 'text-slate-950',
    specialKeyBg: 'bg-[#181109] text-amber-300 border-amber-600/40',
    spaceBg: 'bg-[#241a0d] text-amber-100 border-amber-500/40',
    badge: 'إسلامي ذهبي 🕌'
  },

  // 7. ثيم الكمبيوتر الميكانيكي
  {
    id: 'pc-classic',
    name: 'Mechanical PC Gray',
    nameAr: 'مفاتيح كمبيوتر كلاسيكي ميكانيكي',
    category: 'كمبيوتر',
    bgGradient: 'bg-neutral-900',
    keyboardBg: 'bg-neutral-900',
    keyBg: 'bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 shadow-sm',
    keyBorder: 'border-neutral-600 border-b-2 shadow-sm',
    keyText: 'text-neutral-200 font-mono',
    keySecondary: 'text-neutral-400',
    keyAccent: 'text-emerald-400',
    accentBg: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    accentText: 'text-white',
    specialKeyBg: 'bg-neutral-800/90 text-neutral-300 border-neutral-700',
    spaceBg: 'bg-neutral-800 text-neutral-200 border-neutral-600',
    badge: 'Mechanical 104 ⌨️'
  },

  // 8. الثيم الداكن والزجاجي
  {
    id: 'neon-dark',
    name: 'Neon Dark',
    nameAr: 'نيون داكن احترافي',
    category: 'داكن',
    bgGradient: 'bg-slate-950',
    keyboardBg: 'bg-slate-950',
    keyBg: 'bg-slate-800/90 hover:bg-slate-700/90 active:bg-cyan-950 shadow-md',
    keyBorder: 'border-slate-700/70',
    keyText: 'text-slate-100',
    keySecondary: 'text-slate-400',
    keyAccent: 'text-cyan-400',
    accentBg: 'bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600',
    accentText: 'text-slate-950',
    specialKeyBg: 'bg-slate-900/90 text-slate-300 hover:bg-slate-800',
    spaceBg: 'bg-slate-800 text-slate-100 border-slate-700',
    badge: 'داكن'
  },
  {
    id: 'glass-modern',
    name: 'Modern Glass',
    nameAr: 'زجاجي حديث شفاف',
    category: 'داكن',
    bgGradient: 'bg-slate-900/80 backdrop-blur-xl',
    keyboardBg: 'bg-slate-950/80',
    keyBg: 'bg-white/10 hover:bg-white/15 active:bg-white/20 backdrop-blur-md',
    keyBorder: 'border-white/20 shadow-inner',
    keyText: 'text-slate-100',
    keySecondary: 'text-slate-300',
    keyAccent: 'text-teal-300',
    accentBg: 'bg-teal-500/80 hover:bg-teal-400 text-slate-950',
    accentText: 'text-slate-950',
    specialKeyBg: 'bg-white/5 text-slate-200 hover:bg-white/10 border-white/10',
    spaceBg: 'bg-white/10 text-white border-white/20',
    badge: 'Glassmorphism'
  }
];

// Exact rows according to user's reference image
export const REMO_ROW_1: KeyDefinition[] = [
  { primary: 'ض', secondary: '1' },
  { primary: 'ص', secondary: '2' },
  { primary: 'ث', secondary: '3' },
  { primary: 'ق', secondary: '4' },
  { primary: 'ف', secondary: '5' },
  { primary: 'غ', secondary: '6' },
  { primary: 'ع', secondary: '7' },
  { primary: 'ه', secondary: '8' },
  { primary: 'خ', secondary: '9' },
  { primary: 'ح', secondary: '0' },
  { primary: 'ج', secondary: '$' }
];

export const REMO_ROW_2: KeyDefinition[] = [
  { primary: 'ش' },
  { primary: 'س' },
  { primary: 'ي', secondary: 'ى' },
  { primary: 'ب', secondary: 'پ' },
  { primary: 'ل' },
  { primary: 'ا', secondary: 'أ' },
  { primary: 'ت', secondary: 'ـ' },
  { primary: 'ن' },
  { primary: 'م' },
  { primary: 'ك', secondary: 'گ' },
  { primary: 'ط' }
];

export const REMO_ROW_3: KeyDefinition[] = [
  { primary: 'ئ', secondary: 'ء' },
  { primary: 'ؤ' },
  { primary: 'ظ', secondary: '؟' },
  { primary: 'ذ' },
  { primary: 'د' },
  { primary: 'ز', secondary: 'ژ' },
  { primary: 'ر' },
  { primary: 'و' },
  { primary: 'ة', secondary: 'ْ' },
  { primary: '⌫', isAction: true, weight: 1.35 }
];

// English QWERTY definitions
export const ENGLISH_ROW_1: KeyDefinition[] = [
  { primary: 'q', secondary: '1' },
  { primary: 'w', secondary: '2' },
  { primary: 'e', secondary: '3' },
  { primary: 'r', secondary: '4' },
  { primary: 't', secondary: '5' },
  { primary: 'y', secondary: '6' },
  { primary: 'u', secondary: '7' },
  { primary: 'i', secondary: '8' },
  { primary: 'o', secondary: '9' },
  { primary: 'p', secondary: '0' }
];

export const ENGLISH_ROW_2: KeyDefinition[] = [
  { primary: 'a' },
  { primary: 's' },
  { primary: 'd' },
  { primary: 'f' },
  { primary: 'g' },
  { primary: 'h' },
  { primary: 'j' },
  { primary: 'k' },
  { primary: 'l' }
];

export const ENGLISH_ROW_3: KeyDefinition[] = [
  { primary: '⇧', isAction: true, weight: 1.2 },
  { primary: 'z' },
  { primary: 'x' },
  { primary: 'c' },
  { primary: 'v' },
  { primary: 'b' },
  { primary: 'n' },
  { primary: 'm' },
  { primary: '⌫', isAction: true, weight: 1.35 }
];

// Numbers & Symbols Rows
export const SYMBOLS_ROW_1: KeyDefinition[] = [
  { primary: '1' }, { primary: '2' }, { primary: '3' }, { primary: '4' }, { primary: '5' },
  { primary: '6' }, { primary: '7' }, { primary: '8' }, { primary: '9' }, { primary: '0' }
];

export const SYMBOLS_ROW_2: KeyDefinition[] = [
  { primary: '@' }, { primary: '#' }, { primary: '$' }, { primary: '%' }, { primary: '&' },
  { primary: '*' }, { primary: '−' }, { primary: '+' }, { primary: '(' }, { primary: ')' }
];

export const SYMBOLS_ROW_3: KeyDefinition[] = [
  { primary: '!' }, { primary: '"' }, { primary: '\'' }, { primary: '؛' }, { primary: '،' },
  { primary: '.' }, { primary: '/' }, { primary: '؟' }, { primary: '=' }, { primary: '⌫', isAction: true, weight: 1.35 }
];

export const MATH_SYMBOLS = [
  '=', '+', '−', '×', '÷', '%', '√', 'π', '°', '²', '³', '≠', '≈', '≤', '≥', '∞', '∑', '∫', '∆'
];

export const TASHKEEL_OPTIONS = [
  { char: 'َ', name: 'فتحة' },
  { char: 'ُ', name: 'ضمة' },
  { char: 'ِ', name: 'كسرة' },
  { char: 'ً', name: 'تنوين فتح' },
  { char: 'ٌ', name: 'تنوين ضم' },
  { char: 'ٍ', name: 'تنوين كسر' },
  { char: 'ّ', name: 'شدة' },
  { char: 'ْ', name: 'سكون' },
  { char: 'ـ', name: 'تطويل (كشيدة)' },
];

export const INITIAL_CLIPS: ClipItem[] = [
  {
    id: '1',
    text: 'السلام عليكم ورحمة الله وبركاته 🌹',
    isPinned: true,
    timestamp: 'ثابت'
  },
  {
    id: '2',
    text: 'جزاك الله خيراً وبارك فيك ✨',
    isPinned: true,
    timestamp: 'ثابت'
  },
  {
    id: '3',
    text: 'ريمو كيبورد - لوحة المفاتيح العربية الذكية',
    isPinned: false,
    timestamp: 'مؤخراً'
  }
];

export const EMOJI_CATEGORIES = [
  {
    name: 'ابتسامات ووجوه',
    icon: '😊',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥹', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🫣', '🤗', '🫡', '🤔']
  },
  {
    name: 'إيماءات وأيدي',
    icon: '👍',
    emojis: ['👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '🫵', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🫶', '👐', '🤲', '🤝', '🙏', '✍️', '💪']
  },
  {
    name: 'قلوب ومشاعر',
    icon: '❤️',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '✨', '🌟', '💫', '🔥', '🎉', '🎊', '🌹', '🌸', '💐']
  },
  {
    name: 'أعلام عربية ودول',
    icon: '🇸🇦',
    emojis: ['🇸🇦', '🇦🇪', '🇶🇦', '🇰🇼', '🇧🇭', '🇴🇲', '🇪🇬', '🇯🇴', '🇵🇸', '🇮🇶', '🇸🇾', '🇱🇧', '🇾🇪', '🇲🇦', '🇩🇿', '🇹🇳', '🇱🇾', '🇸🇩', '🇸🇴', '🇲🇷']
  }
];

export const isHeartTheme = (themeId: string, category: string): boolean => {
  const heartIds = [
    'cute-teddy-bears', 'royal-roses', 'pink-hearts-sparkle', 'heart-glow', 'cute-sweets',
    'rose-gold-luxury', 'lavender-silk', 'rose-silk', 'barbie-glow', 'sweet-candy-pastel',
    'strawberry-milk', 'purple-blossom'
  ];
  return heartIds.includes(themeId) || category === 'نسائي' || category === 'بناتي' || category === 'رومانسي';
};

export const isSportsTheme = (themeId: string, category: string): boolean => {
  const sportsIds = [
    'club-alhilal', 'club-alnassr', 'club-alittihad', 'club-alahli',
    'club-realmadrid', 'club-barcelona', 'club-manutd', 'club-liverpool',
    'stadium-pitch', 'barca-sport', 'real-madrid-white', 'racing-red', 'champion-gold'
  ];
  return sportsIds.includes(themeId) || themeId.startsWith('club-') || category === 'رياضي';
};

export const getSportsClubWatermark = (themeId: string) => {
  switch (themeId) {
    case 'club-alhilal':
      return { name: 'Al Hilal SFC', icon: '🌙', badge: 'نادي الهلال السعودي (الموج الأزرق)', color: 'text-blue-400' };
    case 'club-alnassr':
      return { name: 'Al Nassr FC', icon: '⭐', badge: 'نادي النصر السعودي (العالمي)', color: 'text-yellow-400' };
    case 'club-alittihad':
      return { name: 'Al Ittihad FC', icon: '🐅', badge: 'نادي الاتحاد السعودي (العميد)', color: 'text-yellow-500' };
    case 'club-alahli':
      return { name: 'Al Ahli SFC', icon: '👑', badge: 'نادي الأهلي السعودي (الراقي)', color: 'text-emerald-400' };
    case 'club-realmadrid':
      return { name: 'Real Madrid CF', icon: '👑', badge: 'نادي ريال مدريد (الملكي)', color: 'text-amber-300' };
    case 'club-barcelona':
      return { name: 'FC Barcelona', icon: '🔵🔴', badge: 'نادي برشلونة (البارسا)', color: 'text-blue-500' };
    case 'club-manutd':
      return { name: 'Manchester United', icon: '👹', badge: 'مانشستر يونايتد (الشياطين الحمر)', color: 'text-red-500' };
    case 'club-liverpool':
      return { name: 'Liverpool FC', icon: '🔴', badge: 'نادي ليفربول (الريدز)', color: 'text-rose-500' };
    default:
      return { name: 'Sports Club', icon: '⚽', badge: 'النادي الرياضي', color: 'text-cyan-400' };
  }
};

export const SOURCE_FILES: SourceFileMeta[] = [
  {
    path: 'android-ime/app/src/main/java/com/remokeyboard/ime/RemoInputMethodService.java',
    title: 'RemoInputMethodService.java',
    category: 'Android IME (Java)',
    description: 'النواة الرئيسية لخدمة لوحة المفاتيح؛ تدير دورة حياة InputMethodService، معالجة مفاتيح الإدخال، ربط الحافظة واقتراحات الكلمات ومفتاح التشكيل.'
  },
  {
    path: 'android-ime/app/src/main/java/com/remokeyboard/ime/RemoKeyboardView.java',
    title: 'RemoKeyboardView.java',
    category: 'Android IME (Java)',
    description: 'عرض الرسوميات المخصص للوحة المفاتيح؛ يرسم الأزرار، التدرجات، الحواف، معالجة الضغط المطول (الحركات والمد «ـ» على مفتاح ت/ة)، والانتقال بين الحافظة والإيموجي.'
  },
  {
    path: 'android-ime/app/src/main/java/com/remokeyboard/ime/KeyboardPalette.java',
    title: 'KeyboardPalette.java',
    category: 'Android IME (Java)',
    description: 'منظومة الثيمات والألوان؛ يحدد لوحات الألوان للثيمات: نيون، وردي حريري، شبابي، إسلامي، كمبيوتر كلاسيكي، والخلفيات المخصصة من الاستوديو.'
  },
  {
    path: 'android-ime/app/src/main/java/com/remokeyboard/ime/ClipboardRepository.java',
    title: 'ClipboardRepository.java',
    category: 'Android IME (Java)',
    description: 'مستودع تخزين الحافظة المحلية؛ يدعم التمرير، تثبيت النصوص المفضلة، حذف عنصر محدد، وتفريغ العناصر غير المثبتة تلقائياً.'
  },
  {
    path: 'android-ime/app/src/main/java/com/remokeyboard/ime/TranslationEngine.java',
    title: 'TranslationEngine.java',
    category: 'Android IME (Java)',
    description: 'محرك الترجمة الفورية أثناء الكتابة والتحويل اللغوي المباشر.'
  },
  {
    path: 'android-ime/app/src/main/java/com/remokeyboard/ime/EmojiCatalog.java',
    title: 'EmojiCatalog.java',
    category: 'Android IME (Java)',
    description: 'فهرس ومكتبة الإيموجي والرموز الشاملة مع التصنيفات والرموز المفضلة والبحث.'
  },
  {
    path: '.github/workflows/build-remo-keyboard-apk.yml',
    title: 'build-remo-keyboard-apk.yml',
    category: 'Workflow & Docs',
    description: 'أتمتة بناء ملف APK المستقل على GitHub Actions باستخدام Gradle وتنزيل حزمة RemoKeyboard-1.0.13-Android-APK.zip مباشرة.'
  },
  {
    path: 'app/(tabs)/keyboard-studio.tsx',
    title: 'keyboard-studio.tsx',
    category: 'Expo / React Native',
    description: 'واجهة استوديو تخصيص لوحة المفاتيح والتحكم في الثيمات والألوان وصور الخلفية داخل تطبيق المساعد.'
  }
];
