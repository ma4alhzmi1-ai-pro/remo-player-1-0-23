export type KeyboardLanguage = 'ar' | 'en';

export type KeyThemeCategory = 
  | 'افتراضي' 
  | 'شبابي' 
  | 'رياضي' 
  | 'نسائي' 
  | 'بناتي' 
  | 'داكن' 
  | 'إسلامي' 
  | 'كمبيوتر'
  | 'رومانسي'
  | 'مضيء'
  | 'فاخر'
  | 'كيوت'
  | 'مخصص';

export type KeyThemeId = 
  | 'remo-obsidian'
  | 'matte-black'
  | 'slate-gray'
  | 'deep-navy'
  | 'burgundy-wine'
  | 'forest-green'
  | 'pure-white-minimal'
  // الشبابية
  | 'cyberpunk-neon'
  | 'carbon-drift'
  | 'gaming-rgb'
  | 'midnight-tech'
  // الرياضية
  | 'stadium-pitch'
  | 'barca-sport'
  | 'real-madrid-white'
  | 'racing-red'
  | 'champion-gold'
  | 'club-alhilal'
  | 'club-alnassr'
  | 'club-alittihad'
  | 'club-alahli'
  | 'club-realmadrid'
  | 'club-barcelona'
  | 'club-manutd'
  | 'club-liverpool'
  // النسائية والبناتية والرومانسية
  | 'rose-gold-luxury'
  | 'lavender-silk'
  | 'velvet-emerald'
  | 'pearl-champagne'
  | 'rose-silk'
  | 'barbie-glow'
  | 'sweet-candy-pastel'
  | 'strawberry-milk'
  | 'purple-blossom'
  | 'cute-teddy-bears'
  | 'royal-roses'
  | 'pink-hearts-sparkle'
  | 'heart-glow'
  | 'rgb-neon-led'
  | 'galaxy-sparkle'
  | 'cute-sweets'
  // أخرى موجودة
  | 'neon-dark'
  | 'blue-flame'
  | 'islamic-gold'
  | 'pc-classic'
  | 'glass-modern'
  | 'custom-wallpaper';

export interface KeyboardTheme {
  id: KeyThemeId;
  name: string;
  nameAr: string;
  category: KeyThemeCategory;
  bgGradient: string;
  keyboardBg: string;
  keyBg: string;
  keyBorder: string;
  keyText: string;
  keySecondary: string;
  keyAccent: string;
  accentBg: string;
  accentText: string;
  specialKeyBg: string;
  spaceBg?: string;
  spaceText?: string;
  badge?: string;
  backgroundImage?: string;
}

export type CalligraphyFontId = 
  | 'default'
  // خطوط الويب العربية الحقيقية المشهورة
  | 'cairo'
  | 'tajawal'
  | 'amiri'
  | 'aref-ruqaa'
  | 'marhey'
  | 'changa'
  | 'reem-kufi'
  | 'scheherazade'
  | 'lemonada'
  | 'almarai'
  | 'lateef'
  | 'rakkas'
  | 'el-messiri'
  // أنماط الخطوط والزخرفة التراثية
  | 'kufi'
  | 'ruqah'
  | 'bold'
  | 'thuluth'
  | 'sultani'
  | 'naqaa'
  | 'diwani'
  | 'naskh'
  | 'andalusi'
  | 'farisi'
  | 'osmani'
  | 'ijaza'
  | 'kufi-square'
  | 'ruqah-modern'
  | 'musnad'
  // الإنجليزي
  | 'en-bold'
  | 'en-italic'
  | 'en-script'
  | 'en-double'
  | 'en-circled'
  | 'en-smallcaps';

export type KeyboardLayoutMode = 'mobile' | 'pc';

export interface CalligraphyFont {
  id: CalligraphyFontId;
  nameAr: string;
  nameEn: string;
  sample: string;
  category: 'عربي' | 'إنجليزي';
  description: string;
  fontFamily?: string;
  transformChar: (char: string) => string;
  transformText: (text: string) => string;
}

export interface DecorationStyle {
  id: string;
  num?: number;
  name: string;
  previewSample: string;
  transform: (text: string) => string;
}

export interface ClipItem {
  id: string;
  text: string;
  isPinned: boolean;
  timestamp: string;
}

export interface SourceFileMeta {
  path: string;
  title: string;
  category: 'Android IME (Java)' | 'Expo / React Native' | 'Workflow & Docs';
  description: string;
}

