package com.remokeyboard.ime;

import android.content.Context;
import android.graphics.Typeface;
import java.util.HashMap;
import java.util.Map;

/**
 * محرك الخطوط والزخارف العربية والإنجليزية للوحة مفاتيح ريمو كيبورد.
 * يدعم: خط كوفي، خط الرقعة، خط عريض، خط الثلث، الخط السلطاني، خط النقاء، والخطوط اللاتينية المزخرفة.
 */
public final class CalligraphyEngine {
    public enum FontType {
        DEFAULT("عادي", "Default"),
        CAIRO("خط القاهرة", "Cairo"),
        TAJAWAL("خط تجوال", "Tajawal"),
        AMIRI("خط الأميري", "Amiri"),
        AREF_RUQAA("رقعة عارف", "Aref Ruqaa"),
        MARHEY("خط مرحي", "Marhey"),
        CHANGA("خط تشانغا", "Changa"),
        REEM_KUFI("ريم كوفي", "Reem Kufi"),
        SCHEHERAZADE("شهرزاد التراثي", "Scheherazade"),
        LEMONADA("ليمونادا", "Lemonada"),
        ALMARAI("خط المراعي", "Almarai"),
        LATEEF("خط لطيف", "Lateef"),
        RAQQAS("خط الرقاص", "Rakkas"),
        MESSIRI("المسيري", "El Messiri"),
        KUFI("كوفي مزخرف", "Kufi"),
        RUQAH("الرقعة المدمج", "Ruq'ah"),
        BOLD("عريض", "Bold"),
        THULUTH("الثلث", "Thuluth"),
        SULTANI("السلطاني", "Sultani"),
        NAQAA("النقاء", "Naqa'a"),
        DIWANI("ديواني", "Diwani"),
        NASKH("النسخ القرآني", "Naskh"),
        ANDALUSI("الأندلسي", "Andalusi"),
        FARISI("الفارسي", "Farisi"),
        OSMANI("العثماني", "Osmani"),
        IJAZA("الإجازة", "Ijaza"),
        KUFI_SQUARE("كوفي مربع هندسي", "KufiSquare"),
        RUQAH_MODERN("الرقعة الحديث", "RuqahModern"),
        MUSNAD("المسند الحميري", "Musnad"),
        EN_BOLD("إنجليزي عريض", "Bold"),
        EN_SCRIPT("إنجليزي متصل", "Script"),
        EN_CIRCLED("إنجليزي دوائر", "Circled"),
        EN_SMALLCAPS("إنجليزي مصغر", "SmallCaps");

        public final String nameAr;
        public final String nameEn;

        FontType(String nameAr, String nameEn) {
            this.nameAr = nameAr;
            this.nameEn = nameEn;
        }
    }

    private static final Map<Character, String> KUFI_MAP = new HashMap<>();
    private static final Map<Character, String> RUQAH_MAP = new HashMap<>();
    private static final Map<Character, String> BOLD_MAP = new HashMap<>();
    private static final Map<Character, String> THULUTH_MAP = new HashMap<>();
    private static final Map<Character, String> SULTANI_MAP = new HashMap<>();
    private static final Map<Character, String> DIWANI_MAP = new HashMap<>();

    static {
        // خط كوفي
        KUFI_MAP.put('ا', "ﭑ");
        KUFI_MAP.put('ب', "ﭖ");
        KUFI_MAP.put('ت', "ٺ");
        KUFI_MAP.put('ث', "ٽ");
        KUFI_MAP.put('ج', "ڃ");
        KUFI_MAP.put('ح', "ځ");
        KUFI_MAP.put('خ', "څ");
        KUFI_MAP.put('د', "ڊ");
        KUFI_MAP.put('ذ', "ڋ");
        KUFI_MAP.put('ر', "ڔ");
        KUFI_MAP.put('ز', "ڗ");
        KUFI_MAP.put('س', "ښ");
        KUFI_MAP.put('ش', "ڛ");
        KUFI_MAP.put('ص', "ڝ");
        KUFI_MAP.put('ض', "ڞ");
        KUFI_MAP.put('ط', "ڟ");
        KUFI_MAP.put('ع', "؏");
        KUFI_MAP.put('ف', "ڡ");
        KUFI_MAP.put('ق', "ڧ");
        KUFI_MAP.put('ك', "ڪ");
        KUFI_MAP.put('ل', "ڷ");
        KUFI_MAP.put('م', "۾");
        KUFI_MAP.put('ن', "ڹ");
        KUFI_MAP.put('ه', "ھ");
        KUFI_MAP.put('و', "ۅ");
        KUFI_MAP.put('ي', "ۍ");

        // خط الرقعة
        RUQAH_MAP.put('ا', "ا");
        RUQAH_MAP.put('ب', "بـ");
        RUQAH_MAP.put('ت', "تـ");
        RUQAH_MAP.put('ث', "ثـ");
        RUQAH_MAP.put('ج', "جـ");
        RUQAH_MAP.put('ح', "حـ");
        RUQAH_MAP.put('خ', "خـ");
        RUQAH_MAP.put('س', "سـ");
        RUQAH_MAP.put('ش', "شـ");
        RUQAH_MAP.put('ص', "صـ");
        RUQAH_MAP.put('ض', "ضـ");
        RUQAH_MAP.put('ط', "طـ");
        RUQAH_MAP.put('ع', "عـ");
        RUQAH_MAP.put('غ', "غـ");
        RUQAH_MAP.put('ف', "فـ");
        RUQAH_MAP.put('ق', "قـ");
        RUQAH_MAP.put('ك', "كـ");
        RUQAH_MAP.put('ل', "لـ");
        RUQAH_MAP.put('م', "مـ");
        RUQAH_MAP.put('ن', "نـ");
        RUQAH_MAP.put('ه', "هـ");
        RUQAH_MAP.put('ي', "يـ");

        // خط عريض
        BOLD_MAP.put('ا', "إﺂ");
        BOLD_MAP.put('ب', "ﭚ");
        BOLD_MAP.put('ت', "ﭞ");
        BOLD_MAP.put('ث', "ﭢ");
        BOLD_MAP.put('ج', "ﭲ");
        BOLD_MAP.put('ح', "ﺣ");
        BOLD_MAP.put('خ', "ﺧ");
        BOLD_MAP.put('س', "ﺳ");
        BOLD_MAP.put('ش', "ﺷ");
        BOLD_MAP.put('ص', "ﺻ");
        BOLD_MAP.put('ض', "ﺿ");
        BOLD_MAP.put('ط', "ﻃ");
        BOLD_MAP.put('ع', "ﻋ");
        BOLD_MAP.put('غ', "ﻏ");
        BOLD_MAP.put('ف', "ﻓ");
        BOLD_MAP.put('ق', "ﻗ");
        BOLD_MAP.put('ك', "ﻛ");
        BOLD_MAP.put('ل', "ﻟ");
        BOLD_MAP.put('م', "ﻣ");
        BOLD_MAP.put('ن', "ﻧ");
        BOLD_MAP.put('ه', "ﻫ");
        BOLD_MAP.put('و', "ﯠ");
        BOLD_MAP.put('ي', "ﻳ");

        // خط الثلث
        THULUTH_MAP.put('ا', "آ");
        THULUTH_MAP.put('ب', "بّ");
        THULUTH_MAP.put('ت', "تّ");
        THULUTH_MAP.put('ث', "ثّ");
        THULUTH_MAP.put('ج', "جّ");
        THULUTH_MAP.put('ح', "حّ");
        THULUTH_MAP.put('خ', "خّ");
        THULUTH_MAP.put('س', "سّ");
        THULUTH_MAP.put('ش', "شّ");
        THULUTH_MAP.put('ص', "صّ");
        THULUTH_MAP.put('ع', "عّ");
        THULUTH_MAP.put('ل', "لّ");
        THULUTH_MAP.put('م', "مّ");
        THULUTH_MAP.put('ن', "نّ");
        THULUTH_MAP.put('و', "وّ");
        THULUTH_MAP.put('ي', "يّ");

        // خط سلطاني
        SULTANI_MAP.put('ا', "ٱ");
        SULTANI_MAP.put('ب', "ٻ");
        SULTANI_MAP.put('ت', "ٺ");
        SULTANI_MAP.put('ث', "ٽ");
        SULTANI_MAP.put('ج', "چ");
        SULTANI_MAP.put('ح', "ځ");
        SULTANI_MAP.put('خ', "څ");
        SULTANI_MAP.put('د', "ډ");
        SULTANI_MAP.put('ذ', "ڌ");
        SULTANI_MAP.put('ر', "ړ");
        SULTANI_MAP.put('ز', "ږ");
        SULTANI_MAP.put('س', "ښ");
        SULTANI_MAP.put('ش', "ڛ");
        SULTANI_MAP.put('ص', "ڝ");
        SULTANI_MAP.put('ض', "ڞ");
        SULTANI_MAP.put('ع', "؏");
        SULTANI_MAP.put('ف', "ڤ");
        SULTANI_MAP.put('ق', "ڨ");
        SULTANI_MAP.put('ك', "ګ");
        SULTANI_MAP.put('ل', "ڵ");
        SULTANI_MAP.put('م', "مـ");
        SULTANI_MAP.put('ن', "ڼ");
        SULTANI_MAP.put('و', "ۊ");
        SULTANI_MAP.put('ي', "ۍ");

        // خط ديواني
        DIWANI_MAP.put('ا', "ٱ");
        DIWANI_MAP.put('ب', "بـِ");
        DIWANI_MAP.put('ت', "تـِ");
        DIWANI_MAP.put('ج', "جـِ");
        DIWANI_MAP.put('ح', "حـِ");
        DIWANI_MAP.put('س', "سـِ");
        DIWANI_MAP.put('ش', "شـِ");
        DIWANI_MAP.put('ع', "عـِ");
        DIWANI_MAP.put('ف', "فـِ");
        DIWANI_MAP.put('ك', "كـِ");
        DIWANI_MAP.put('ل', "لـِ");
        DIWANI_MAP.put('م', "مـِ");
        DIWANI_MAP.put('ن', "نـِ");
        DIWANI_MAP.put('ي', "يـِ");
    }

    private static final Map<String, Typeface> TYPEFACE_CACHE = new HashMap<>();

    /** تحويل الحرف المفرد أثناء النقر على المفتاح */
    public static String transformChar(char c, FontType fontType) {
        if (fontType == null || fontType == FontType.DEFAULT) {
            return String.valueOf(c);
        }

        switch (fontType) {
            case MUSNAD:
                return toMusnad(c);
            case EN_BOLD:
                return toEnBold(c);
            case EN_SCRIPT:
                return toEnScript(c);
            case EN_CIRCLED:
                return toEnCircled(c);
            case EN_SMALLCAPS:
                return toEnSmallCaps(c);
            default:
                // خطوط الرقعة والنسخ والكوفي والقاهرة وتجوال والأميري وتشانغا وغيرها هي خطوط طباعية حقيقية تُعرض على المفاتيح عبر Typeface
                return String.valueOf(c);
        }
    }

    /** تحويل نص كامل للخط المحدد */
    public static String transformText(String text, FontType fontType) {
        if (text == null || fontType == null || fontType == FontType.DEFAULT) {
            return text;
        }

        StringBuilder sb = new StringBuilder();
        for (char c : text.toCharArray()) {
            sb.append(transformChar(c, fontType));
        }
        return sb.toString();
    }

    private static String toEnBold(char c) {
        if (c >= 'A' && c <= 'Z') return new String(Character.toChars(0x1D400 + (c - 'A')));
        if (c >= 'a' && c <= 'z') return new String(Character.toChars(0x1D41A + (c - 'a')));
        if (c >= '0' && c <= '9') return new String(Character.toChars(0x1D7CE + (c - '0')));
        return String.valueOf(c);
    }

    private static String toEnScript(char c) {
        if (c >= 'a' && c <= 'z') return new String(Character.toChars(0x1D4EA + (c - 'a')));
        if (c >= 'A' && c <= 'Z') return new String(Character.toChars(0x1D4D0 + (c - 'A')));
        return String.valueOf(c);
    }

    private static String toEnCircled(char c) {
        if (c >= 'A' && c <= 'Z') return String.valueOf((char) (0x24B6 + (c - 'A')));
        if (c >= 'a' && c <= 'z') return String.valueOf((char) (0x24D0 + (c - 'a')));
        if (c >= '1' && c <= '9') return String.valueOf((char) (0x2460 + (c - '1')));
        if (c == '0') return "⓪";
        return String.valueOf(c);
    }

    private static String toEnSmallCaps(char c) {
        String s = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ";
        char lower = Character.toLowerCase(c);
        if (lower >= 'a' && lower <= 'z') {
            return String.valueOf(s.charAt(lower - 'a'));
        }
        return String.valueOf(c);
    }

    private static String toMusnad(char c) {
        switch (c) {
            case 'ا': case 'أ': case 'إ': case 'آ': case 'ء': return "𐩱";
            case 'ب': return "𐩨";
            case 'ت': return "𐩩";
            case 'ث': return "𐩻";
            case 'ج': return "𐩴";
            case 'ح': return "𐩢";
            case 'خ': return "𐩭";
            case 'د': return "𐩵";
            case 'ذ': return "𐩹";
            case 'ر': return "𐩧";
            case 'ز': return "𐩸";
            case 'س': return "𐩪";
            case 'ش': return "𐩦";
            case 'ص': return "𐩮";
            case 'ض': return "𐩳";
            case 'ط': return "𐩷";
            case 'ظ': case 'ع': return "𐩲";
            case 'غ': return "𐩶";
            case 'ف': return "𐩰";
            case 'ق': return "𐩤";
            case 'ك': return "𐩫";
            case 'ل': return "𐩡";
            case 'م': return "𐩣";
            case 'ن': return "𐩬";
            case 'ه': return "𐩠";
            case 'و': return "𐩥";
            case 'ي': case 'ى': return "𐩺";
            case 'ة': return "𐩩";
            default: return String.valueOf(c);
        }
    }

    /** الحصول على نمط الخط المناسب لأزرار الكيبورد */
    public static Typeface getTypeface(Context context, FontType fontType, int defaultStyle) {
        if (fontType == null || fontType == FontType.DEFAULT) {
            return Typeface.create("sans-serif", defaultStyle);
        }

        String assetPath = null;
        switch (fontType) {
            case CAIRO:
                assetPath = "fonts/cairo.ttf";
                break;
            case TAJAWAL:
                assetPath = "fonts/tajawal.ttf";
                break;
            case AMIRI:
            case NASKH:
            case THULUTH:
            case ANDALUSI:
            case OSMANI:
            case IJAZA:
            case SCHEHERAZADE:
                assetPath = "fonts/amiri.ttf";
                break;
            case AREF_RUQAA:
            case RUQAH:
            case RUQAH_MODERN:
            case DIWANI:
            case FARISI:
            case RAQQAS:
                assetPath = "fonts/aref_ruqaa.ttf";
                break;
            case REEM_KUFI:
            case KUFI:
            case KUFI_SQUARE:
                assetPath = "fonts/reem_kufi.ttf";
                break;
            case ALMARAI:
            case SULTANI:
            case NAQAA:
                assetPath = "fonts/almarai.ttf";
                break;
            case CHANGA:
            case BOLD:
                assetPath = "fonts/changa.ttf";
                break;
            case LEMONADA:
            case MARHEY:
            case LATEEF:
            case MESSIRI:
                assetPath = "fonts/lemonada.ttf";
                break;
            case EN_BOLD:
                return Typeface.create("sans-serif", Typeface.BOLD);
            case EN_SCRIPT:
                return Typeface.create(Typeface.SERIF, Typeface.ITALIC);
            case EN_CIRCLED:
                return Typeface.create(Typeface.MONOSPACE, defaultStyle);
            case EN_SMALLCAPS:
                return Typeface.create("sans-serif", Typeface.BOLD);
            default:
                break;
        }

        if (assetPath != null && context != null) {
            try {
                synchronized (TYPEFACE_CACHE) {
                    Typeface cached = TYPEFACE_CACHE.get(assetPath);
                    if (cached != null) return cached;
                    Typeface loaded = Typeface.createFromAsset(context.getAssets(), assetPath);
                    if (loaded != null) {
                        TYPEFACE_CACHE.put(assetPath, loaded);
                        return loaded;
                    }
                }
            } catch (Exception ignored) {}
        }

        return Typeface.create("sans-serif", defaultStyle);
    }
}
