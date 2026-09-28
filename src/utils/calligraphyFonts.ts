import { CalligraphyFont, CalligraphyFontId } from '../types/keyboard';

// Map for English Unicode Transformations
const LATIN_MAPS: Record<string, { upper: number; lower: number; digits?: number }> = {
  bold: { upper: 0x1D400, lower: 0x1D41A, digits: 0x1D7CE },
  italic: { upper: 0x1D434, lower: 0x1D44E },
  script: { upper: 0x1D4D0, lower: 0x1D4EA },
  double: { upper: 0x1D538, lower: 0x1D552, digits: 0x1D7D8 },
  circled: { upper: 0x24B6, lower: 0x24D0, digits: 0x2460 },
  monospace: { upper: 0x1D670, lower: 0x1D68A, digits: 0x1D7F6 }
};

const SMALL_CAPS_MAP: Record<string, string> = {
  a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ғ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ',
  k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 'ꜱ', t: 'ᴛ',
  u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
};

function transformLatinChar(char: string, style: 'bold' | 'italic' | 'script' | 'double' | 'circled' | 'smallcaps'): string {
  if (style === 'smallcaps') {
    const lower = char.toLowerCase();
    return SMALL_CAPS_MAP[lower] || char;
  }

  const map = LATIN_MAPS[style];
  if (!map) return char;

  const code = char.charCodeAt(0);
  // Uppercase A-Z (65-90)
  if (code >= 65 && code <= 90) {
    if (style === 'circled') {
      return String.fromCodePoint(0x24B6 + (code - 65));
    }
    return String.fromCodePoint(map.upper + (code - 65));
  }
  // Lowercase a-z (97-122)
  if (code >= 97 && code <= 122) {
    if (style === 'circled') {
      return String.fromCodePoint(0x24D0 + (code - 97));
    }
    return String.fromCodePoint(map.lower + (code - 97));
  }
  // Digits 0-9 (48-57)
  if (map.digits && code >= 48 && code <= 57) {
    if (style === 'circled') {
      if (code === 48) return '⓪';
      return String.fromCodePoint(0x2460 + (code - 49));
    }
    return String.fromCodePoint(map.digits + (code - 48));
  }

  return char;
}

// Arabic Kufic stylizer: geometric accents and Kufic character shaping
const KUFI_ACCENTS = ['ـ', 'ـ', 'ْ', 'ُ', 'َ'];
function transformKufiChar(char: string): string {
  const kufiCharMap: Record<string, string> = {
    'ض': 'ضـ',
    'ص': 'صـ',
    'ق': 'قـ',
    'ف': 'فـ',
    'غ': 'غـ',
    'ع': 'عـ',
    'ه': 'هـ',
    'خ': 'خـ',
    'ح': 'حـ',
    'ج': 'جـ',
    'ش': 'شـ',
    'س': 'سـ',
    'ي': 'يـ',
    'ب': 'بـ',
    'ت': 'تـ',
    'ن': 'نـ',
    'م': 'مـ',
    'ك': 'كـ',
    'ط': 'طـ'
  };
  return kufiCharMap[char] || char;
}

// Ruq'ah stylizer: smooth ligatures, distinctive slant and compact forms
const RUQAH_MARKS = ['َ', 'ُ', 'ِ', 'ْ'];
function transformRuqahChar(char: string): string {
  const ruqahMap: Record<string, string> = {
    'ي': 'ے',
    'ى': 'ے',
    'ك': 'ڪ',
    'ه': 'ھ',
    'م': 'مـ',
    'ن': 'نْ',
    'ت': 'ٺ',
    'ب': 'ٻ'
  };
  return ruqahMap[char] || char;
}

// Thuluth calligraphy: majestic flourishes, Quranic marks and tashkeel
const THULUTH_MARKS = ['ّ', 'َ', 'ُ', 'ِ', 'ً', 'ٌ', 'ٍ', 'ْ', 'ٰ'];
let thuluthIndex = 0;
function transformThuluthChar(char: string): string {
  if (char === ' ') return '  ';
  const mark = THULUTH_MARKS[thuluthIndex % THULUTH_MARKS.length];
  thuluthIndex++;
  const nonConnectors = [' ', '\n', '،', '.', '؟', '!', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  if (nonConnectors.includes(char)) return char;
  return char + mark;
}

// Sultani royal calligraphy: regal decorative markers and royal accents
function transformSultaniChar(char: string): string {
  const sultaniMap: Record<string, string> = {
    'ا': 'أّ',
    'ل': 'لـ',
    'م': 'مـ',
    'ر': 'رّ',
    'و': 'وّ',
    'ي': 'يـّ',
    'ه': 'ھـ',
    'س': 'سـّ',
    'ش': 'شـّ'
  };
  return sultaniMap[char] || char;
}

// Naqaa: pure, spaced, elegant aesthetic
function transformNaqaaChar(char: string): string {
  if (char === ' ') return '   ';
  return char + ' ';
}

// Diwani: flowing curvature and graceful ascenders
function transformDiwaniChar(char: string): string {
  const diwaniMap: Record<string, string> = {
    'ا': 'ٱ',
    'ل': 'ڶ',
    'و': 'ۅ',
    'ر': 'ڒ',
    'ز': 'ژ',
    'د': 'ډ',
    'ذ': 'ڎ',
    'ك': 'ڪ',
    'ي': 'ۍ',
    'ن': 'ڼ'
  };
  return diwaniMap[char] || char;
}

// Arabic Bold with heavy stroke presence
function transformArabicBoldChar(char: string): string {
  const boldMap: Record<string, string> = {
    'ض': 'ضّ',
    'ص': 'صّ',
    'ث': 'ثّ',
    'ق': 'قّ',
    'ف': 'فّ',
    'غ': 'غّ',
    'ع': 'عّ',
    'ه': 'هّ',
    'خ': 'خّ',
    'ح': 'حّ',
    'ج': 'جّ',
    'ش': 'شّ',
    'س': 'سّ',
    'ي': 'يّ',
    'ب': 'بّ',
    'ت': 'تّ',
    'ن': 'نّ',
    'م': 'مّ',
    'ك': 'كّ',
    'ط': 'طّ',
    'د': 'دّ',
    'ذ': 'ذّ',
    'ر': 'رّ',
    'ز': 'زّ',
    'و': 'وّ'
  };
  return boldMap[char] || char;
}

// 1. الخط النسخي القرآني
const NASKH_MARKS = ['َ', 'ُ', 'ِ', 'ْ', 'ً', 'ٌ', 'ٍ', 'ّ'];
let naskhIndex = 0;
function transformNaskhChar(char: string): string {
  if (char === ' ') return ' ';
  const nonConnectors = ['\n', '،', '.', '؟', '!', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  if (nonConnectors.includes(char)) return char;
  const mark = NASKH_MARKS[naskhIndex % NASKH_MARKS.length];
  naskhIndex++;
  return char + mark;
}

// 2. الخط الأندلسي المغاربي
const ANDALUSI_MAP: Record<string, string> = {
  'ف': 'ڢ',
  'ق': 'ڧ',
  'ن': 'ڽ',
  'ي': 'ۍ',
  'ك': 'ڪ',
  'ص': 'ڝ',
  'ض': 'ڞ',
  'ط': 'ڟ',
  'م': '۾'
};
function transformAndalusiChar(char: string): string {
  return ANDALUSI_MAP[char] || char;
}

// 3. الخط الفارسي والنستعليق
const FARISI_MAP: Record<string, string> = {
  'ي': 'ے',
  'ى': 'ے',
  'ك': 'ک',
  'گ': 'گ',
  'ه': 'ھ',
  'ة': 'ۂ',
  'و': 'ۆ',
  'ر': 'ر',
  'ز': 'ژ'
};
function transformFarisiChar(char: string): string {
  return FARISI_MAP[char] || char;
}

// 4. الخط العثماني الهمايوني
const OSMANI_MAP: Record<string, string> = {
  'ا': 'ٱ',
  'و': 'ۅ',
  'ي': 'ے',
  'ك': 'ڪ',
  'ت': 'ٺ',
  'ب': 'ٻ',
  'ج': 'ڃ',
  'ح': 'ځ',
  'خ': 'څ'
};
function transformOsmaniChar(char: string): string {
  return OSMANI_MAP[char] || char;
}

// 5. خط الإجازة
function transformIjazaChar(char: string): string {
  const ijazaMap: Record<string, string> = {
    'ا': 'آ',
    'ل': 'لـِ',
    'م': 'مـُ',
    'ن': 'نْ',
    'ي': 'يـِ',
    'و': 'وْ'
  };
  return ijazaMap[char] || char;
}

// 6. الخط الكوفي المربع
function transformKufiSquareChar(char: string): string {
  if (char === ' ') return '  ';
  const nonConnectors = ['\n', '،', '.', '؟', '!'];
  if (nonConnectors.includes(char)) return char;
  return char + 'ـ';
}

// 7. خط الرقعة الحديث
function transformRuqahModernChar(char: string): string {
  const map: Record<string, string> = {
    'س': 'سـ',
    'ش': 'شـ',
    'ص': 'صـ',
    'ض': 'ضـ',
    'ط': 'طـ',
    'ع': 'عـ',
    'غ': 'غـ',
    'ف': 'فـ',
    'ق': 'قـ',
    'ك': 'ڪـ',
    'ل': 'لـ',
    'م': 'مـ',
    'ن': 'نـ',
    'ه': 'ھـ',
    'ي': 'يـ'
  };
  return map[char] || char;
}

// 8. خط المسند العربي القديم (حميري وسبئي)
const MUSNAD_MAP: Record<string, string> = {
  'ا': '𐩱', 'أ': '𐩱', 'إ': '𐩱', 'آ': '𐩱', 'ء': '𐩱',
  'ب': '𐩨',
  'ت': '𐩩',
  'ث': '𐩻',
  'ج': '𐩴',
  'ح': '𐩢',
  'خ': '𐩭',
  'د': '𐩵',
  'ذ': '𐩹',
  'ر': '𐩧',
  'ز': '𐩸',
  'س': '𐩪',
  'ش': '𐩦',
  'ص': '𐩮',
  'ض': '𐩳',
  'ط': '𐩷',
  'ظ': '𐩲',
  'ع': '𐩲',
  'غ': '𐩶',
  'ف': '𐩰',
  'ق': '𐩤',
  'ك': '𐩫',
  'ل': '𐩡',
  'م': '𐩣',
  'ن': '𐩬',
  'ه': '𐩠',
  'و': '𐩥',
  'ي': '𐩺', 'ى': '𐩺', 'ة': '𐩩'
};
function transformMusnadChar(char: string): string {
  return MUSNAD_MAP[char] || char;
}

export const CALLIGRAPHY_FONTS: CalligraphyFont[] = [
  {
    id: 'default',
    nameAr: 'خط عادي',
    nameEn: 'Normal Font',
    sample: 'ريمو كيبورد',
    category: 'عربي',
    description: 'الخط الطبيعي الافتراضي للوحة المفاتيح',
    fontFamily: 'inherit',
    transformChar: (c) => c,
    transformText: (t) => t
  },
  // الخطوط العربية العالمية الحقيقية (Google Fonts Web Fonts)
  {
    id: 'cairo',
    nameAr: 'خط القاهرة (Cairo)',
    nameEn: 'Cairo Font',
    sample: 'ريمو كيبورد الحديث',
    category: 'عربي',
    description: 'خط كوفي حديث وعصري فائق الوضوح والأناقة على المفاتيح',
    fontFamily: "'Cairo', sans-serif",
    transformChar: (c) => c,
    transformText: (t) => t
  },
  {
    id: 'tajawal',
    nameAr: 'خط تجوال (Tajawal)',
    nameEn: 'Tajawal Modern',
    sample: 'ريمو كيبورد الهندسي',
    category: 'عربي',
    description: 'خط هندسي عربي راقٍ متوازن ومريح جداً للعين عند الكتابة',
    fontFamily: "'Tajawal', sans-serif",
    transformChar: (c) => c,
    transformText: (t) => t
  },
  {
    id: 'amiri',
    nameAr: 'خط الأميري (Amiri)',
    nameEn: 'Amiri Classical',
    sample: 'ريمو كيبورد العريق',
    category: 'عربي',
    description: 'إحياء الخط البولاقي الكلاسيكي التراثي الفخم للنسخ الأصيل',
    fontFamily: "'Amiri', serif",
    transformChar: (c) => c,
    transformText: (t) => t
  },
  {
    id: 'aref-ruqaa',
    nameAr: 'رقعة عارف (Aref Ruqaa)',
    nameEn: 'Aref Ruqaa Hand',
    sample: 'ريمو كيبورد اليدوي',
    category: 'عربي',
    description: 'خط الرقعة العربي الأصيل بانحناءاته اليدوية الرشيقة والواقعية',
    fontFamily: "'Aref Ruqaa', cursive",
    transformChar: (c) => c,
    transformText: (t) => t
  },
  {
    id: 'marhey',
    nameAr: 'خط مرحي (Marhey)',
    nameEn: 'Marhey Playful',
    sample: 'ريمو كيبورد المرح',
    category: 'عربي',
    description: 'خط عربي شبابي مرح وجريء يعطي الأزرار حيوية استثنائية',
    fontFamily: "'Marhey', cursive",
    transformChar: (c) => c,
    transformText: (t) => t
  },
  {
    id: 'changa',
    nameAr: 'خط تشانغا (Changa)',
    nameEn: 'Changa Techno',
    sample: 'ريمو كيبورد المودرن',
    category: 'عربي',
    description: 'خط تقني بمقاطع هندسية متماسكة يبرز وضوح الحروف الصغيرة',
    fontFamily: "'Changa', sans-serif",
    transformChar: (c) => c,
    transformText: (t) => t
  },
  {
    id: 'reem-kufi',
    nameAr: 'ريم كوفي (Reem Kufi)',
    nameEn: 'Reem Kufic',
    sample: 'ريمو كيبورد الفاطمي',
    category: 'عربي',
    description: 'الخط الكوفي الفاطمي العريق بأصالته ونقوشه الإسلامية المهيبة',
    fontFamily: "'Reem Kufi', sans-serif",
    transformChar: (c) => transformKufiChar(c),
    transformText: (t) => t.split('').map(transformKufiChar).join('')
  },
  {
    id: 'scheherazade',
    nameAr: 'شهرزاد التراثي',
    nameEn: 'Scheherazade New',
    sample: 'ريمو كيبورد القرآني',
    category: 'عربي',
    description: 'خط النسخ التقليدي الشامل لحركات التلاوة والضبط القرآني التام',
    fontFamily: "'Scheherazade New', serif",
    transformChar: (c) => c,
    transformText: (t) => t
  },
  {
    id: 'lemonada',
    nameAr: 'ليمونادا (Lemonada)',
    nameEn: 'Lemonada Cute',
    sample: 'ريمو كيبورد اللطيف',
    category: 'عربي',
    description: 'خط ناعم ومنعش لطيف جداً يلائم الثيمات البناتية والشبابية',
    fontFamily: "'Lemonada', cursive",
    transformChar: (c) => c,
    transformText: (t) => t
  },
  {
    id: 'almarai',
    nameAr: 'خط المراعي (Almarai)',
    nameEn: 'Almarai Clean',
    sample: 'ريمو كيبورد المتزن',
    category: 'عربي',
    description: 'خط عربي حديث فائق الدقة والنقاء صمم خصيصاً لواجهات المستخدم',
    fontFamily: "'Almarai', sans-serif",
    transformChar: (c) => c,
    transformText: (t) => t
  },
  {
    id: 'lateef',
    nameAr: 'خط لطيف (Lateef)',
    nameEn: 'Lateef Flowing',
    sample: 'ريمو كيبورد الانسيابي',
    category: 'عربي',
    description: 'خط نسخي رحب وانسيابي ذو مدود سلسة تحاكي خط النستعليق',
    fontFamily: "'Lateef', serif",
    transformChar: (c) => c,
    transformText: (t) => t
  },
  {
    id: 'rakkas',
    nameAr: 'خط الرقاص (Rakkas)',
    nameEn: 'Rakkas Display',
    sample: 'ريمو كيبورد الإبداعي',
    category: 'عربي',
    description: 'خط فلكلوري إبداعي مستلهم من فنون الخط العربي المسرحي',
    fontFamily: "'Rakkas', cursive",
    transformChar: (c) => (c === ' ' ? ' ' : c + '؏'),
    transformText: (t) => t.split('').map((c) => (c === ' ' ? ' ' : c + '؏')).join('')
  },
  {
    id: 'el-messiri',
    nameAr: 'المسيري (El Messiri)',
    nameEn: 'El Messiri Art',
    sample: 'ريمو كيبورد الشاعري',
    category: 'عربي',
    description: 'خط يجمع بين الزوايا المتقاطعة والمنحنيات الشعرية الآسرة',
    fontFamily: "'El Messiri', sans-serif",
    transformChar: (c) => (c === ' ' ? ' ' : c + ' ̶'),
    transformText: (t) => t.split('').map((c) => (c === ' ' ? ' ' : c + ' ̶')).join('')
  },
  // الخطوط والزخارف التراثية
  {
    id: 'kufi',
    nameAr: 'خط كوفي مزخرف',
    nameEn: 'Kufi Script',
    sample: 'ريـمـو ڪـيـبـورد',
    category: 'عربي',
    description: 'خط كوفي هندسي راقٍ يتميز بالاستقامة والمدود الهندسية الرائعة',
    fontFamily: "'Reem Kufi', 'Noto Kufi Arabic', sans-serif",
    transformChar: (c) => transformKufiChar(c),
    transformText: (text) => {
      return text.split('').map((char, i, arr) => {
        if (char === ' ' || i === arr.length - 1) return char;
        const nonConnectors = ['ا', 'أ', 'إ', 'آ', 'د', 'ذ', 'ر', 'ز', 'و', 'ؤ', 'ء', ' '];
        if (nonConnectors.includes(char)) return char;
        return char + 'ـ';
      }).join('');
    }
  },
  {
    id: 'ruqah',
    nameAr: 'خط الرقعة المدمج',
    nameEn: 'Ruqah Script',
    sample: 'رَيـمۅ ڪيـبۅرد',
    category: 'عربي',
    description: 'خط الرقعة العربي الكلاسيكي السلس والسريع بحروف مدمجة',
    fontFamily: "'Aref Ruqaa', cursive",
    transformChar: (c) => transformRuqahChar(c),
    transformText: (text) => {
      return text.split('').map((char) => transformRuqahChar(char)).join('');
    }
  },
  {
    id: 'bold',
    nameAr: 'خط عريض',
    nameEn: 'Bold Script',
    sample: 'رَيـّمـّو كـّيـّبـّوّرد',
    category: 'عربي',
    description: 'خط عريض قوي ومميز يبرز النصوص في المحادثات والملاحظات',
    fontFamily: "'Cairo', sans-serif",
    transformChar: (c) => {
      if (/[a-zA-Z0-9]/.test(c)) return transformLatinChar(c, 'bold');
      return transformArabicBoldChar(c);
    },
    transformText: (text) => {
      return text.split('').map((c) => {
        if (/[a-zA-Z0-9]/.test(c)) return transformLatinChar(c, 'bold');
        return transformArabicBoldChar(c);
      }).join('');
    }
  },
  {
    id: 'thuluth',
    nameAr: 'خط الثلث',
    nameEn: 'Thuluth Script',
    sample: 'رَّيـْـمُــوْ كِـيـْبُـوْرْد',
    category: 'عربي',
    description: 'أمير الخطوط العربية بحركاته وتشكيلاته التراثية الفخمة',
    fontFamily: "'Amiri', serif",
    transformChar: (c) => transformThuluthChar(c),
    transformText: (text) => {
      thuluthIndex = 0;
      return text.split('').map(transformThuluthChar).join('');
    }
  },
  {
    id: 'sultani',
    nameAr: 'الخط السلطاني',
    nameEn: 'Sultani Royal',
    sample: '꧁رَيـمـّو كِـيـبـوّرد꧂',
    category: 'عربي',
    description: 'الخط السلطاني الملكي المزين بالأقواس والأكاليل الملكية الفخمة',
    fontFamily: "'Amiri', serif",
    transformChar: (c) => transformSultaniChar(c),
    transformText: (text) => {
      const core = text.split('').map(transformSultaniChar).join('');
      return `꧁${core}꧂`;
    }
  },
  {
    id: 'naqaa',
    nameAr: 'خط النقاء',
    nameEn: 'Naqaa Pure',
    sample: 'ر يـ مـ و   كـ يـ بـ و ر د',
    category: 'عربي',
    description: 'خط نقي وأنيق يعتمد على المسافات الجمالية والراحة البصرية',
    fontFamily: "'Tajawal', 'Almarai', sans-serif",
    transformChar: (c) => transformNaqaaChar(c),
    transformText: (text) => {
      return text.split('').map(transformNaqaaChar).join('');
    }
  },
  {
    id: 'diwani',
    nameAr: 'خط ديواني',
    nameEn: 'Diwani Script',
    sample: 'رَيـمـۍ ڪيـبۅرد',
    category: 'عربي',
    description: 'الخط الديواني العثماني ذو الانحناءات الرشيقة والتداخل الفني',
    fontFamily: "'Aref Ruqaa', cursive",
    transformChar: (c) => transformDiwaniChar(c),
    transformText: (text) => {
      return text.split('').map(transformDiwaniChar).join('');
    }
  },
  {
    id: 'naskh',
    nameAr: 'النسخ القرآني',
    nameEn: 'Quranic Naskh',
    sample: 'رَّيـْمـُـوْ كِـيـْبـُـوْرْد',
    category: 'عربي',
    description: 'خط النسخ الواضح المشكول بحركات الإعراب والتلاوة القرآنية العطرة',
    fontFamily: "'Amiri', 'Scheherazade New', serif",
    transformChar: (c) => transformNaskhChar(c),
    transformText: (text) => {
      naskhIndex = 0;
      return text.split('').map(transformNaskhChar).join('');
    }
  },
  {
    id: 'andalusi',
    nameAr: 'الخط الأندلسي',
    nameEn: 'Andalusi Script',
    sample: 'رَيـ۾ـۍ ڪـيـٻـۅرد',
    category: 'عربي',
    description: 'الخط الأندلسي الفاسي برسم حروفه ونقاطه المغربية الأصيلة',
    fontFamily: "'Scheherazade New', 'Amiri', serif",
    transformChar: (c) => transformAndalusiChar(c),
    transformText: (text) => {
      return text.split('').map(transformAndalusiChar).join('');
    }
  },
  {
    id: 'farisi',
    nameAr: 'الفارسي (نستعليق)',
    nameEn: 'Nastaliq / Farisi',
    sample: 'ریـمـۆ کـیـبـۆرد',
    category: 'عربي',
    description: 'خط التعليق والنستعليق الفارسي الانسيابي بمدوده الأنيقة',
    fontFamily: "'Lateef', 'Amiri', serif",
    transformChar: (c) => transformFarisiChar(c),
    transformText: (text) => {
      return text.split('').map(transformFarisiChar).join('');
    }
  },
  {
    id: 'osmani',
    nameAr: 'الخط العثماني',
    nameEn: 'Osmani Royal',
    sample: 'ٱريـمـۅ ڪـيـٻـۅرد',
    category: 'عربي',
    description: 'الخط العثماني التراثي المستوحى من نقوش الطغراء والفرمانات',
    fontFamily: "'Amiri', serif",
    transformChar: (c) => transformOsmaniChar(c),
    transformText: (text) => {
      return text.split('').map(transformOsmaniChar).join('');
    }
  },
  {
    id: 'ijaza',
    nameAr: 'خط الإجازة',
    nameEn: 'Ijaza Calligraphy',
    sample: 'آريـمـُـوْ كِـيـْٻـوْرْد',
    category: 'عربي',
    description: 'خط الإجازة التراثي الجامع بين بهاء الثلث ودقة النسخ',
    fontFamily: "'Amiri', serif",
    transformChar: (c) => transformIjazaChar(c),
    transformText: (text) => {
      return text.split('').map(transformIjazaChar).join('');
    }
  },
  {
    id: 'kufi-square',
    nameAr: 'كوفي مربع هندسي',
    nameEn: 'Geometric Kufic',
    sample: 'رـيـمـو كـيـبـوـرـد',
    category: 'عربي',
    description: 'خط كوفي هندسي متناسق بمدود هندسية مستقيمة فخمة',
    fontFamily: "'Cairo', 'Changa', monospace",
    transformChar: (c) => transformKufiSquareChar(c),
    transformText: (text) => {
      return text.split('').map(transformKufiSquareChar).join('');
    }
  },
  {
    id: 'ruqah-modern',
    nameAr: 'الرقعة الحديث',
    nameEn: 'Modern Ruqah',
    sample: 'ريـمـو ڪـيـبـورد',
    category: 'عربي',
    description: 'تطوير حديث لخط الرقعة السريع والعملي مع كافات ووصلات مدمجة',
    fontFamily: "'Aref Ruqaa', sans-serif",
    transformChar: (c) => transformRuqahModernChar(c),
    transformText: (text) => {
      return text.split('').map(transformRuqahModernChar).join('');
    }
  },
  {
    id: 'musnad',
    nameAr: 'خط المسند الحميري',
    nameEn: 'Ancient Musnad',
    sample: '𐩧𐩺𐩣𐩥 𐩫𐩺𐩨𐩥𐩧𐩵',
    category: 'عربي',
    description: 'خط المسند العربي التراثي الأصيل لممالك حمير وسبأ وحضرموت باليمن',
    fontFamily: "'Segoe UI Historic', 'Noto Sans Old South Arabian', sans-serif",
    transformChar: (c) => transformMusnadChar(c),
    transformText: (text) => {
      return text.split('').map(transformMusnadChar).join('');
    }
  },
  {
    id: 'en-bold',
    nameAr: 'إنجليزي عريض',
    nameEn: 'English Bold',
    sample: '𝗥𝗲𝗺𝗼 𝗞𝗲𝘆𝗯𝗼𝗮𝗿𝗱',
    category: 'إنجليزي',
    description: 'حروف إنجليزية عريضة بتنسيق Unicode Mathematical Bold',
    transformChar: (c) => transformLatinChar(c, 'bold'),
    transformText: (text) => text.split('').map((c) => transformLatinChar(c, 'bold')).join('')
  },
  {
    id: 'en-italic',
    nameAr: 'إنجليزي مائل',
    nameEn: 'English Italic',
    sample: '𝘙𝘦𝘮𝘰 𝘒𝘦𝘺𝘣𝘰𝘢𝘳𝘥',
    category: 'إنجليزي',
    description: 'حروف إنجليزية مائلة أنيقة للتأكيد والتنسيق الراقي',
    transformChar: (c) => transformLatinChar(c, 'italic'),
    transformText: (text) => text.split('').map((c) => transformLatinChar(c, 'italic')).join('')
  },
  {
    id: 'en-script',
    nameAr: 'إنجليزي متصل (رقعة)',
    nameEn: 'English Cursive',
    sample: '𝓡𝓮𝓶𝓸 𝓚𝓮𝔂𝓫𝓸𝓪𝓻𝓭',
    category: 'إنجليزي',
    description: 'خط إنجليزي متصل ورومانسي بأسلوب الخط اليدوي الفاخر',
    transformChar: (c) => transformLatinChar(c, 'script'),
    transformText: (text) => text.split('').map((c) => transformLatinChar(c, 'script')).join('')
  },
  {
    id: 'en-double',
    nameAr: 'إنجليزي مفرغ (Double)',
    nameEn: 'Double-Struck',
    sample: 'ℝ𝕖𝕞𝕠 𝕂𝕖𝕪𝕓𝕠𝕒𝕣𝕕',
    category: 'إنجليزي',
    description: 'خط مجسم ومفرغ ثلاثي الأبعاد مميز للتسميات والعناوين',
    transformChar: (c) => transformLatinChar(c, 'double'),
    transformText: (text) => text.split('').map((c) => transformLatinChar(c, 'double')).join('')
  },
  {
    id: 'en-circled',
    nameAr: 'إنجليزي دوائر',
    nameEn: 'Circled Letters',
    sample: 'Ⓡⓔⓜⓞ Ⓚⓔⓨⓑⓞⓐⓡⓓ',
    category: 'إنجليزي',
    description: 'حروف وأرقام إنجليزية محاطة بدوائر فنية مبهجة',
    transformChar: (c) => transformLatinChar(c, 'circled'),
    transformText: (text) => text.split('').map((c) => transformLatinChar(c, 'circled')).join('')
  },
  {
    id: 'en-smallcaps',
    nameAr: 'إنجليزي أحرف صغيرة (SmallCaps)',
    nameEn: 'Small Capitals',
    sample: 'ʀᴇᴍᴏ ᴋᴇʏʙᴏᴀʀᴅ',
    category: 'إنجليزي',
    description: 'أحرف كابيتال مصغرة متناسقة تستخدم في المطبوعات الراقية',
    transformChar: (c) => transformLatinChar(c, 'smallcaps'),
    transformText: (text) => text.split('').map((c) => transformLatinChar(c, 'smallcaps')).join('')
  }
];

export function getFontById(id: CalligraphyFontId): CalligraphyFont {
  return CALLIGRAPHY_FONTS.find((f) => f.id === id) || CALLIGRAPHY_FONTS[0];
}
