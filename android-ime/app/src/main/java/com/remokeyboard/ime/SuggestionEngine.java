package com.remokeyboard.ime;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/** قاموس بادئ صغير يعمل دون شبكة وقابل للاستبدال بقاموس موسع لاحقًا. */
final class SuggestionEngine {
    private static final List<String> ARABIC = Arrays.asList(
        "مرحبا", "السلام", "عليكم", "كيف", "شكرا", "من", "هذا", "هذه", "الآن", "اليوم", "الله", "جميل", "ممتاز", "ريمو"
    );
    private static final List<String> ENGLISH = Arrays.asList(
        "hello", "thanks", "please", "keyboard", "today", "great", "Remo"
    );

    List<String> forPrefix(String prefix, boolean arabic) {
        List<String> source = arabic ? ARABIC : ENGLISH;
        List<String> result = new ArrayList<>();
        String query = prefix == null ? "" : prefix.toLowerCase();
        for (String candidate : source) {
            if (query.isEmpty() || candidate.toLowerCase().startsWith(query)) result.add(candidate);
            if (result.size() == 3) break;
        }
        if (result.isEmpty()) result.addAll(source.subList(0, Math.min(3, source.size())));
        return result;
    }
}
