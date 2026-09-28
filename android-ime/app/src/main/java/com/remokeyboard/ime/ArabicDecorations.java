package com.remokeyboard.ime;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * قائمة الزخارف العربية الـ 40 نمط الأصلية لمحرك ريمو كيبورد.
 * تتطابق بالكامل مع ستايلات الزخرفة في استوديو ريمو، وتعمل بشكل حقيقي عند الكتابة وتفعيل الإعدادات.
 */
public final class ArabicDecorations {

    public static class Style {
        public final int num;
        public final String id;
        public final String name;
        public final String sample;

        public Style(int num, String id, String name, String sample) {
            this.num = num;
            this.id = id;
            this.name = name;
            this.sample = sample;
        }
    }

    private static final List<Character> NON_CONNECTORS = Arrays.asList('ا', 'أ', 'إ', 'آ', 'د', 'ذ', 'ر', 'ز', 'و', 'ؤ', 'ء', ' ');

    public static final List<Style> ALL_STYLES = new ArrayList<>();

    static {
        ALL_STYLES.add(new Style(0, "0", "بدون زخرفة", "ريمو كيبورد"));
        ALL_STYLES.add(new Style(1, "1", "1- زَّخْرَفَةُ الْكِتَابَةِ", "رَّيـْـمُــوْ كِـيـْبُـوْرْد"));
        ALL_STYLES.add(new Style(2, "2", "2- رَّخـ,ـرفـ,ـة آلـ,ـكـ,ـتـ,ـآبـ,ـة", "رَّيـ,ـمـ,ـو آلـ,ـكـ,ـيـ,ـبـ,ـورد"));
        ALL_STYLES.add(new Style(3, "3", "3- زَخْرَفَةُ الْكِتَابَةِ", "رَيـْمـُو الْكِـيـْبـُورْد"));
        ALL_STYLES.add(new Style(4, "4", "4- زَخْرفَةُ آلْكِتَآبَةّ", "رَيْـمُو آلْكِـتَآبَةّ"));
        ALL_STYLES.add(new Style(5, "5", "5- زَخِرَفَةُ الْكِتَأبَةٌ", "رَخِرَفَةُ الْكِتَأبَةٌ"));
        ALL_STYLES.add(new Style(6, "6", "6- زَخُـ رفَةُ آلْكِتَابَة", "رَخُـ رفَةُ آلْكِتَابَة"));
        ALL_STYLES.add(new Style(7, "7", "7- زّخـ❤️ـرفـ❤️ـة آلـكـ❤️ـتـ❤️ـآبـ❤️ـة", "رّيـ❤️ـمـ❤️ـو آلـكـ❤️ـيـ❤️ـبـ❤️ـورد"));
        ALL_STYLES.add(new Style(8, "8", "8- زَّخـےـرفـےـةُ آلـكـےـتـےـآبـےـة", "رَّيـےـمـےـو آلـكـےـيـےـبـےـورد"));
        ALL_STYLES.add(new Style(9, "9", "9- زُخْـ'ـرُفَـ'ـةُ اُلْـ'ـكُـ'ـتُـ'ـاُبَـ'ـةُ", "رُيـْـ'ـمُـ'ـو اُلـ'ـكـ'ـيـ'ـبـ'ـورد"));
        ALL_STYLES.add(new Style(10, "10", "10- رَخِبِرفَةُ الْكِتَابَةِ", "رَخِبِرفَةُ الْكِتَابَةِ"));
        ALL_STYLES.add(new Style(11, "11", "11- أنجليزي معرب (عربيزي)", "Remo Keyboard (3rabyzy)"));
        ALL_STYLES.add(new Style(12, "12", "12- زخـرفـهـة آلـكـهـتـآبـهـة", "ريـهـمـهـو آلـكـهـيـهـبـهـورد"));
        ALL_STYLES.add(new Style(13, "13", "13- زخرفة الأسماء الملكية ꧁꧂", "꧁ ༒ ريمو كيبورد ༒ ꧂"));
        ALL_STYLES.add(new Style(14, "14", "14- زخرفة الأقواس والرموز ⦅⦆", "⦅ ❖ ريمو كيبورد ❖ ⦆"));
        ALL_STYLES.add(new Style(15, "15", "15- زَّخْـۖـرَفَـۗـةُ الْـۘـكِـۖـتَـۗـابَـۘـةُ", "رَّيـْـۖـمُـۗـوْ الـۘـكِـۖـيـۗـبُـۘـوْرْد"));
        ALL_STYLES.add(new Style(16, "16", "16- زَّخْـۖـرَفَـۗـةُ الْكِـۗـتَابَة", "رَّيـْـۖـمُـۗـو الْكِـۗـتَابَة"));
        ALL_STYLES.add(new Style(17, "17", "17- زخـ💔ـرفـ💔ـهـة آلـكـ💔ـتـ💔ـآبـ💔ـهـة", "ريـ💔ـمـ💔ـو آلـكـ💔ـيـ💔ـبـ💔ـورد"));
        ALL_STYLES.add(new Style(18, "18", "18- زخِـرفِة آلـكـِتَـآبِة", "ريـِـمـِـو آلـكـِـتـَـآبـِـة"));
        ALL_STYLES.add(new Style(19, "19", "19- زُّخـرفَةُ الْكُّتَابَة", "رُّيـمـفَةُ الْكُّتَابَة"));
        ALL_STYLES.add(new Style(20, "20", "20- زُخـرفَةُ الْكِتَابَة", "رُيـمـفَةُ الْكِـتَابَة"));
        ALL_STYLES.add(new Style(21, "21", "21- زخـஃـرفـஃـة آلـكـتـآبـஃـة", "ريـஃـمـஃـو آلـكـتـآبـஃـة"));
        ALL_STYLES.add(new Style(22, "22", "22- زخـرفـهـهـہ آلـكـتـآبـهـهـہ", "ريـمـهـہ آلـكـتـآبـهـہ"));
        ALL_STYLES.add(new Style(23, "23", "23- زخـۖـرفـۗـةُ آلـكـۖـتـۗـآبـۖـة", "ريـۖـمـۗـو آلـكـۖـتـۗـآبـۖـة"));
        ALL_STYLES.add(new Style(24, "24", "24- ༊زخـرفـة آلـكـتـابـة༊", "༊ ريمو كيبورد ༊"));
        ALL_STYLES.add(new Style(25, "25", "25- زِخْـٌـرَفَـٍـةُ الِكْـٌـتَـٍـابَـٌـة", "رِخْـٌـمـٍـو الِكْـٌـتَـٍـابَـٌـة"));
        ALL_STYLES.add(new Style(26, "26", "26- زِخْـُـرَفَـِـةُ الْكِتَابَة", "رِخْـُـمـِـو الْكِتَابَة"));
        ALL_STYLES.add(new Style(27, "27", "27- ز خـ ـرفـ ـة الـ ـكـ ـتـ ـابـ ـة", "ر يـ ـمـ ـو الـ ـكـ ـيـ ـبـ ـو ر د"));
        ALL_STYLES.add(new Style(28, "28-", "28- زَخِرِفَة آلَكِتَآبَة", "رَخِرِفَة آلَكِتَآبَة"));
        ALL_STYLES.add(new Style(29, "29", "29- زَخْرِفَةُ الُكِتَابَةُ", "رَيْـمُـو الُكِـتَابَةُ"));
        ALL_STYLES.add(new Style(30, "30", "30- رَخٌـرَفَـةُ الُكِـتُابَةُ", "رَخٌـرَفَـةُ الُكِـتُابَةُ"));
        ALL_STYLES.add(new Style(31, "31", "31- زَخـْـرِفـَـة آلـْـكـِـتـَـآبـَـة", "رَيْـْـمـِـو آلـْـكـِـيـْـبـَـورد"));
        ALL_STYLES.add(new Style(32, "32", "32- رُّخِـرفَةُ الْكِـتَابَةُ", "رُّيـمـو الْكِـتَابَةُ"));
        ALL_STYLES.add(new Style(33, "33", "33- رَّخِـرفَةُ آلْكِـتَآبَةُ", "رَّيـمـو آلْكِـتَآبَةُ"));
        ALL_STYLES.add(new Style(34, "34", "34- رُّخِـرفَةُ آلْكِـتَابَةُ", "رُّيـخِـمـو الْكِـتَابَةُ"));
        ALL_STYLES.add(new Style(35, "35", "35- زَّخْـۜـرَفَـۛـةُ الْكِـۜـتَـۛـابَـۜـةُ", "رَّيـۜـمـۛـو الْكِـۜـتَـۛـابَـۜـةُ"));
        ALL_STYLES.add(new Style(36, "36", "36- زّخـعـرفـعـة آلـكـعـتـعـآبـعـة", "ريـعـمـعـو آلـكـعـيـعـبـعـورد"));
        ALL_STYLES.add(new Style(37, "37", "37- زّخـ=ـرفـ=ـة آلـكـ=ـتـ=ـآبـ=ـة", "ريـ=ـمـ=ـو آلـكـ=ـيـ=ـبـ=ـورد"));
        ALL_STYLES.add(new Style(38, "38", "38- زخـ☘️ـرفة آلـكـتـآبـ☘️ـة", "ريـ☘️ـمـ☘️ـو آلـكـتـآبـ☘️ـة"));
        ALL_STYLES.add(new Style(39, "39", "39- زّخـ⁂ـرفـ⁂ـة آلـكـ⁂ـتـ⁂ـآبـ⁂ـة", "ريـ⁂ـمـ⁂ـو آلـكـ⁂ـتـ⁂ـآبـ⁂ـة"));
        ALL_STYLES.add(new Style(40, "40", "40- زّخـ❀ـرفـ❀ـة آلـكـ❀ـتـ❀ـآبـ❀ـة", "ريـ❀ـمـ❀ـو آلـكـ❀ـتـ❀ـآبـ❀ـة"));
    }

    private static String insertBetweenLetters(String text, String glue) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            sb.append(c);
            if (c != ' ' && i < text.length() - 1 && !NON_CONNECTORS.contains(c)) {
                sb.append(glue);
            }
        }
        return sb.toString();
    }

    /**
     * تحويل حرف مفرد أثناء الكتابة التفاعلية في الكيبورد بحسب النمط المختار
     */
    public static String decorateChar(String charStr, String styleId, int pos) {
        if (charStr == null || charStr.isEmpty()) return charStr;
        if ("0".equals(styleId)) return charStr;

        char c = charStr.charAt(0);
        if (c == ' ' || Character.isWhitespace(c)) return charStr;

        int styleNum = 1;
        try {
            styleNum = Integer.parseInt(styleId);
        } catch (Exception ignored) {}

        switch (styleNum) {
            case 1: {
                String[] marks = {"َّ", "ْ", "ُ", "ِ", "َ", "ٍ", "ٌ"};
                return charStr + marks[pos % marks.length];
            }
            case 2:
                return (c == 'ا' ? "آ" : charStr) + (!NON_CONNECTORS.contains(c) ? "ـ,ـ" : "");
            case 3: {
                String[] marks = {"َ", "ْ", "ُ", "ِ", "َ"};
                return charStr + marks[pos % marks.length];
            }
            case 4:
                return (c == 'ا' ? "آ" : charStr) + (pos % 2 == 0 ? "ْ" : "َ");
            case 5:
                return (c == 'ا' ? "أ" : charStr) + (pos % 3 == 0 ? "ِ" : "َ");
            case 6:
                return (c == 'ا' ? "آ" : charStr) + (pos % 2 == 0 ? "ُـ " : "");
            case 7:
                return (c == 'ا' ? "آ" : charStr) + (!NON_CONNECTORS.contains(c) ? "ـ❤️ـ" : "");
            case 8:
                return (c == 'ا' ? "آ" : charStr) + (!NON_CONNECTORS.contains(c) ? "ـےـ" : "");
            case 9:
                return charStr + (!NON_CONNECTORS.contains(c) ? "ـ'ـ" : "");
            case 10:
                return charStr + "ِبِ";
            case 11: {
                Map<Character, String> franco = new HashMap<>();
                franco.put('ع', "3"); franco.put('ح', "7"); franco.put('خ', "5"); franco.put('ط', "6");
                franco.put('ق', "9"); franco.put('ص', "9'"); franco.put('ض', "9'"); franco.put('غ', "3'");
                franco.put('ء', "2"); franco.put('أ', "2"); franco.put('إ', "2"); franco.put('ش', "sh");
                franco.put('ث', "th"); franco.put('ذ', "th");
                return franco.getOrDefault(c, charStr);
            }
            case 12:
                return (c == 'ا' ? "آ" : charStr) + (!NON_CONNECTORS.contains(c) ? "ـهـ" : "");
            case 15: {
                String[] q = {"ـۖـ", "ـۗـ", "ـۘـ", "ـۙـ", "ـۚـ", "ـۛـ"};
                return charStr + (!NON_CONNECTORS.contains(c) ? q[pos % q.length] : "");
            }
            case 16:
                return charStr + (!NON_CONNECTORS.contains(c) ? "ـۖـ" : "");
            case 17:
                return (c == 'ا' ? "آ" : charStr) + (!NON_CONNECTORS.contains(c) ? "ـ💔ـ" : "");
            case 18:
                return (c == 'ا' ? "آ" : charStr) + (!NON_CONNECTORS.contains(c) ? "ـِـ" : "");
            case 19:
                return charStr + (!NON_CONNECTORS.contains(c) ? "ـُّـ" : "");
            case 20:
                return charStr + (!NON_CONNECTORS.contains(c) ? "ـُـ" : "");
            case 21:
                return (c == 'ا' ? "آ" : charStr) + (!NON_CONNECTORS.contains(c) ? "ـஃـ" : "");
            case 22:
                return (c == 'ا' ? "آ" : charStr) + (!NON_CONNECTORS.contains(c) ? "ـهـہ" : "");
            case 23:
                return charStr + (!NON_CONNECTORS.contains(c) ? (pos % 2 == 0 ? "ـۖـ" : "ـۗـ") : "");
            case 25:
                return charStr + (!NON_CONNECTORS.contains(c) ? "ـٌـ" : "");
            case 26:
                return charStr + (!NON_CONNECTORS.contains(c) ? "ـُـ" : "");
            case 27:
                return charStr + (!NON_CONNECTORS.contains(c) ? "ـ ـ" : "");
            case 28:
                return (c == 'ا' ? "آ" : charStr) + "ِرِ";
            case 29:
                return charStr + "ْرِ";
            case 30:
                return charStr + (!NON_CONNECTORS.contains(c) ? "ـٌـ" : "");
            case 31:
                return (c == 'ا' ? "آ" : charStr) + (!NON_CONNECTORS.contains(c) ? "ـْـ" : "");
            case 32:
            case 34:
                return charStr + (!NON_CONNECTORS.contains(c) ? "ـِـ" : "");
            case 33:
                return (c == 'ا' ? "آ" : charStr) + (!NON_CONNECTORS.contains(c) ? "ـِـ" : "");
            case 35:
                return charStr + (!NON_CONNECTORS.contains(c) ? (pos % 2 == 0 ? "ـۜـ" : "ـۛـ") : "");
            case 36:
                return (c == 'ا' ? "آ" : charStr) + (!NON_CONNECTORS.contains(c) ? "ـعـ" : "");
            case 37:
                return (c == 'ا' ? "آ" : charStr) + (!NON_CONNECTORS.contains(c) ? "ـ=ـ" : "");
            case 38:
                return (c == 'ا' ? "آ" : charStr) + (!NON_CONNECTORS.contains(c) ? "ـ☘️ـ" : "");
            case 39:
                return (c == 'ا' ? "آ" : charStr) + (!NON_CONNECTORS.contains(c) ? "ـ⁂ـ" : "");
            case 40:
                return (c == 'ا' ? "آ" : charStr) + (!NON_CONNECTORS.contains(c) ? "ـ❀ـ" : "");
            default:
                return charStr;
        }
    }

    /**
     * زخرفة نص كامل بحسب النمط المختار
     */
    public static String decorate(String text, String styleId) {
        if (text == null || text.isEmpty()) return text;
        if ("0".equals(styleId)) return text;

        int styleNum = 1;
        try {
            styleNum = Integer.parseInt(styleId);
        } catch (Exception ignored) {}

        switch (styleNum) {
            case 1: {
                String[] marks = {"َّ", "ْ", "ُ", "ِ", "َ", "ٍ", "ٌ"};
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < text.length(); i++) {
                    char c = text.charAt(i);
                    sb.append(c);
                    if (c != ' ') sb.append(marks[i % marks.length]);
                }
                return sb.toString();
            }
            case 2:
                return insertBetweenLetters(text.replace('ا', 'آ'), "ـ,ـ");
            case 3: {
                String[] marks = {"َ", "ْ", "ُ", "ِ", "َ"};
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < text.length(); i++) {
                    char c = text.charAt(i);
                    sb.append(c);
                    if (c != ' ') sb.append(marks[i % marks.length]);
                }
                return sb.toString();
            }
            case 4: {
                StringBuilder sb = new StringBuilder();
                String replaced = text.replace('ا', 'آ');
                for (int i = 0; i < replaced.length(); i++) {
                    sb.append(replaced.charAt(i));
                    sb.append(i % 2 == 0 ? "ْ" : "َ");
                }
                sb.append("ّ");
                return sb.toString();
            }
            case 5: {
                StringBuilder sb = new StringBuilder();
                String replaced = text.replace('ا', 'أ');
                for (int i = 0; i < replaced.length(); i++) {
                    sb.append(replaced.charAt(i));
                    sb.append(i % 3 == 0 ? "ِ" : "َ");
                }
                sb.append("ٌ");
                return sb.toString();
            }
            case 6: {
                StringBuilder sb = new StringBuilder();
                String replaced = text.replace('ا', 'آ');
                for (int i = 0; i < replaced.length(); i++) {
                    sb.append(replaced.charAt(i));
                    if (i % 2 == 0) sb.append("ُـ ");
                }
                return sb.toString();
            }
            case 7:
                return insertBetweenLetters(text.replace('ا', 'آ'), "ـ❤️ـ");
            case 8:
                return insertBetweenLetters(text.replace('ا', 'آ'), "ـےـ");
            case 9:
                return insertBetweenLetters(text, "ـ'ـ");
            case 10: {
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < text.length(); i++) {
                    char c = text.charAt(i);
                    sb.append(c);
                    if (c != ' ') sb.append("ِبِ");
                }
                return sb.toString();
            }
            case 11: {
                Map<Character, String> franco = new HashMap<>();
                franco.put('ع', "3"); franco.put('ح', "7"); franco.put('خ', "5"); franco.put('ط', "6");
                franco.put('ق', "9"); franco.put('ص', "9'"); franco.put('ض', "9'"); franco.put('غ', "3'");
                franco.put('ء', "2"); franco.put('أ', "2"); franco.put('إ', "2"); franco.put('ش', "sh");
                franco.put('ث', "th"); franco.put('ذ', "th");
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < text.length(); i++) {
                    char c = text.charAt(i);
                    sb.append(franco.getOrDefault(c, String.valueOf(c)));
                }
                return sb.toString();
            }
            case 12:
                return insertBetweenLetters(text.replace('ا', 'آ'), "ـهـ");
            case 13:
                return "꧁ ༒ " + text + " ༒ ꧂";
            case 14:
                return "⦅ ❖ " + text + " ❖ ⦆";
            case 15:
                return insertBetweenLetters(text, "ـۖـ");
            case 16:
                return insertBetweenLetters(text, "ـۗـ");
            case 17:
                return insertBetweenLetters(text.replace('ا', 'آ'), "ـ💔ـ");
            case 18:
                return insertBetweenLetters(text.replace('ا', 'آ'), "ـِـ");
            case 19:
                return insertBetweenLetters(text, "ـُّـ");
            case 20:
                return insertBetweenLetters(text, "ـُـ");
            case 21:
                return insertBetweenLetters(text.replace('ا', 'آ'), "ـஃـ");
            case 22:
                return insertBetweenLetters(text.replace('ا', 'آ'), "ـهـہ");
            case 23: {
                StringBuilder sb = new StringBuilder();
                boolean toggle = false;
                for (int i = 0; i < text.length(); i++) {
                    char c = text.charAt(i);
                    sb.append(c);
                    if (c != ' ' && i < text.length() - 1 && !NON_CONNECTORS.contains(c)) {
                        toggle = !toggle;
                        sb.append(toggle ? "ـۖـ" : "ـۗـ");
                    }
                }
                return sb.toString();
            }
            case 24:
                return "༊ " + insertBetweenLetters(text, "ـ") + " ༊";
            case 25:
                return insertBetweenLetters(text, "ـٌـ");
            case 26:
                return insertBetweenLetters(text, "ـُـ");
            case 27:
                return insertBetweenLetters(text, "ـ ـ");
            case 28: {
                StringBuilder sb = new StringBuilder();
                String replaced = text.replace('ا', 'آ');
                for (int i = 0; i < replaced.length(); i++) {
                    char c = replaced.charAt(i);
                    sb.append(c);
                    if (c != ' ') sb.append("ِرِ");
                }
                return sb.toString();
            }
            case 29: {
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < text.length(); i++) {
                    char c = text.charAt(i);
                    sb.append(c);
                    if (c != ' ') sb.append("ْرِ");
                }
                sb.append("ُ");
                return sb.toString();
            }
            case 30:
                return insertBetweenLetters(text, "ـٌـ");
            case 31:
                return insertBetweenLetters(text.replace('ا', 'آ'), "ـْـ");
            case 32:
            case 34:
                return insertBetweenLetters(text, "ـِـ");
            case 33:
                return insertBetweenLetters(text.replace('ا', 'آ'), "ـِـ");
            case 35: {
                StringBuilder sb = new StringBuilder();
                boolean alt = false;
                for (int i = 0; i < text.length(); i++) {
                    char c = text.charAt(i);
                    sb.append(c);
                    if (c != ' ' && i < text.length() - 1 && !NON_CONNECTORS.contains(c)) {
                        alt = !alt;
                        sb.append(alt ? "ـۜـ" : "ـۛـ");
                    }
                }
                return sb.toString();
            }
            case 36:
                return insertBetweenLetters(text.replace('ا', 'آ'), "ـعـ");
            case 37:
                return insertBetweenLetters(text.replace('ا', 'آ'), "ـ=ـ");
            case 38:
                return insertBetweenLetters(text.replace('ا', 'آ'), "ـ☘️ـ");
            case 39:
                return insertBetweenLetters(text.replace('ا', 'آ'), "ـ⁂ـ");
            case 40:
                return insertBetweenLetters(text.replace('ا', 'آ'), "ـ❀ـ");
            default:
                return text;
        }
    }
}
