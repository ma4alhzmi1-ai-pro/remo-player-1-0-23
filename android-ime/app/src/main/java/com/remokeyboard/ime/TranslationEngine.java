package com.remokeyboard.ime;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/** ترجمة محلية مساعدة للعبارات والكلمات الشائعة، لا تعتمد على الشبكة. */
final class TranslationEngine {
    static final class Result {
        final String value;
        final int knownTokens;
        Result(String value, int knownTokens) { this.value = value; this.knownTokens = knownTokens; }
    }

    private static final Map<String, String> AR_TO_EN = new HashMap<>();
    private static final Map<String, String> EN_TO_AR = new HashMap<>();

    static {
        put("مرحبا", "hello"); put("مرحباً", "hello"); put("اهلا", "welcome"); put("أهلا", "welcome");
        put("صباح الخير", "good morning"); put("مساء الخير", "good evening"); put("كيف حالك", "how are you");
        put("شكرا", "thank you"); put("شكراً", "thank you"); put("من فضلك", "please"); put("عفوا", "you are welcome");
        put("نعم", "yes"); put("لا", "no"); put("ربما", "maybe"); put("الان", "now"); put("الآن", "now");
        put("اليوم", "today"); put("غدا", "tomorrow"); put("غداً", "tomorrow"); put("امس", "yesterday"); put("أمس", "yesterday");
        put("انا", "I"); put("أنا", "I"); put("انت", "you"); put("أنت", "you"); put("هو", "he"); put("هي", "she"); put("نحن", "we"); put("هم", "they");
        put("اسمي", "my name is"); put("اسم", "name"); put("صديق", "friend"); put("عائلة", "family");
        put("بيت", "home"); put("مدرسة", "school"); put("عمل", "work"); put("هاتف", "phone"); put("رسالة", "message");
        put("احب", "love"); put("أحب", "love"); put("اريد", "want"); put("أريد", "want"); put("احتاج", "need"); put("أحتاج", "need");
        put("جميل", "beautiful"); put("رائع", "great"); put("ممتاز", "excellent"); put("سعيد", "happy"); put("سريع", "fast");
        put("ماء", "water"); put("طعام", "food"); put("قهوة", "coffee"); put("وقت", "time"); put("مكان", "place");
        put("اين", "where"); put("أين", "where"); put("متى", "when"); put("لماذا", "why"); put("ماذا", "what"); put("كيف", "how");
        put("سلام", "peace"); put("الله", "God"); put("رمضان", "Ramadan"); put("مبارك", "blessed");
    }

    private TranslationEngine() { }

    private static void put(String arabic, String english) {
        AR_TO_EN.put(arabic, english);
        EN_TO_AR.putIfAbsent(english.toLowerCase(Locale.ROOT), arabic);
    }

    static Result translate(String value, boolean arabicToEnglish) {
        if (value == null || value.trim().isEmpty()) return new Result("", 0);
        String input = value.trim();
        Map<String, String> dictionary = arabicToEnglish ? AR_TO_EN : EN_TO_AR;
        String phrase = dictionary.get(arabicToEnglish ? input : input.toLowerCase(Locale.ROOT));
        if (phrase != null) return new Result(phrase, 1);
        StringBuilder output = new StringBuilder();
        int known = 0;
        String[] tokens = input.split("(?<=\\s)|(?=\\s)");
        for (String token : tokens) {
            String lookup = trimPunctuation(token);
            String replacement = dictionary.get(arabicToEnglish ? lookup : lookup.toLowerCase(Locale.ROOT));
            if (replacement != null) { output.append(token.replace(lookup, replacement)); known++; }
            else output.append(token);
        }
        return new Result(output.toString(), known);
    }

    private static String trimPunctuation(String value) {
        return value.replaceAll("^[\\p{Punct}،؛؟]+|[\\p{Punct}،؛؟]+$", "");
    }
}
