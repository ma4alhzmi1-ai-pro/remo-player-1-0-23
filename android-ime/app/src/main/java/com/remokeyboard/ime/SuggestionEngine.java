package com.remokeyboard.ime;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/** قاموس محلي ذكي يدعم الملء التلقائي واقتراح الكلمات والعبارات الشائعة دون الحاجة لاتصال بالإنترنت. */
final class SuggestionEngine {
    private static final List<String> ARABIC = Arrays.asList(
        "السلام", "عليكم", "ورحمة", "الله", "وبركاته", "صباح", "الخير", "مساء", "النور",
        "أهلاً", "وسهلاً", "مرحباً", "شكراً", "جزيلاً", "عفواً", "الحمد", "لله", "إن", "شاء",
        "ما", "تبارك", "جزاك", "خيراً", "بارك", "فيك", "كيف", "الحال", "أخبارك", "تمام",
        "بخير", "نعم", "لا", "أنا", "أنت", "هو", "هي", "نحن", "هم", "هذا", "هذه", "الآن",
        "اليوم", "غداً", "أمس", "جميل", "رائع", "ممتاز", "مبارك", "حبيبي", "صديقي", "أخي",
        "أختي", "كيبورد", "ريمو", "الفاخر", "العربية", "تسلم", "يعطيك", "العافية", "في",
        "على", "من", "إلى", "عن", "مع", "كل", "عام", "وأنتم", "بخير", "رمضان", "كريم",
        "عيد", "سعيد", "جمعة", "مباركة", "بالتوفيق", "مع", "تحياتي", "ألف", "شكر", "صلى",
        "وسلم", "رسول", "سبحان", "وبحمده", "أستغفر", "العظيم", "لا", "إله", "إلا"
    );
    private static final List<String> ENGLISH = Arrays.asList(
        "hello", "thanks", "thank", "you", "please", "keyboard", "today", "tomorrow",
        "yesterday", "great", "good", "morning", "night", "how", "are", "welcome",
        "Remo", "awesome", "perfect", "friend", "happy", "yes", "no", "with", "have", "nice", "day"
    );

    List<String> forPrefix(String prefix, boolean arabic) {
        List<String> source = arabic ? ARABIC : ENGLISH;
        List<String> result = new ArrayList<>();
        String query = prefix == null ? "" : prefix.trim().toLowerCase();
        for (String candidate : source) {
            if (query.isEmpty() || candidate.toLowerCase().startsWith(query)) {
                result.add(candidate);
            }
            if (result.size() >= 4) break;
        }
        if (result.isEmpty()) {
            result.addAll(source.subList(0, Math.min(4, source.size())));
        }
        return result;
    }
}
