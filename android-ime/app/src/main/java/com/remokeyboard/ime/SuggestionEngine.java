@@
-package com.remokeyboard.ime;
-
-import java.util.ArrayList;
-import java.util.Arrays;
-import java.util.List;
-
-/** قاموس بادئ صغير يعمل دون شبكة وقابل للاستبدال بقاموس موسع لاحقًا. */
-final class SuggestionEngine {
-    private static final List<String> ARABIC = Arrays.asList(
-        "مرحبا", "السلام", "عليكم", "كيف", "شكرا", "من", "هذا", "هذه", "الآن", "اليوم", "الله", "جميل", "ممتاز", "ريمو"
-    );
-    private static final List<String> ENGLISH = Arrays.asList(
-        "hello", "thanks", "please", "keyboard", "today", "great", "Remo"
-    );
-
-    List<String> forPrefix(String prefix, boolean arabic) {
-        List<String> source = arabic ? ARABIC : ENGLISH;
-        List<String> result = new ArrayList<>();
-        String query = prefix == null ? "" : prefix.toLowerCase();
-        for (String candidate : source) {
-            if (query.isEmpty() || candidate.toLowerCase().startsWith(query)) result.add(candidate);
-            if (result.size() == 3) break;
-        }
-        if (result.isEmpty()) result.addAll(source.subList(0, Math.min(3, source.size())));
-        return result;
-    }
-}
+package com.remokeyboard.ime;
+
+import java.util.ArrayList;
+import java.util.Arrays;
+import java.util.List;
+import android.content.SharedPreferences;
+import android.text.TextUtils;
+
+/**
+ * قاموس بادئ صغير يعمل دون شبكة وقابل للاستبدال بقاموس موسع لاحقًا.
+ * الآن يدعم حفظ "كلمات متعلّمة" محليًا في SharedPreferences وزيادة نتائج الاقتراح.
+ */
+final class SuggestionEngine {
+    private static final List<String> ARABIC = Arrays.asList(
+        "مرحبا", "السلام", "عليكم", "كيف", "شكرا", "من", "هذا", "هذه", "الآن", "اليوم", "الله", "جميل", "ممتاز", "ريمو"
+    );
+    private static final List<String> ENGLISH = Arrays.asList(
+        "hello", "thanks", "please", "keyboard", "today", "great", "Remo"
+    );
+
+    private static final String KEY_LEARNED_AR = "remo.learned.ar.v1";
+    private static final String KEY_LEARNED_EN = "remo.learned.en.v1";
+    private static final int MAX_LEARNED = 1000;
+
+    private final SharedPreferences prefs;
+
+    SuggestionEngine(SharedPreferences prefs) { this.prefs = prefs; }
+
+    List<String> forPrefix(String prefix, boolean arabic) {
+        List<String> source = new ArrayList<>(arabic ? ARABIC : ENGLISH);
+        // أضف الكلمات المتعلّمة محليًا
+        String learnedCsv = prefs.getString(arabic ? KEY_LEARNED_AR : KEY_LEARNED_EN, "");
+        if (!TextUtils.isEmpty(learnedCsv)) {
+            for (String s : learnedCsv.split(",")) {
+                if (!s.trim().isEmpty()) source.add(s);
+            }
+        }
+
+        List<String> result = new ArrayList<>();
+        String query = prefix == null ? "" : prefix.toLowerCase();
+        for (String candidate : source) {
+            if (query.isEmpty() || candidate.toLowerCase().startsWith(query)) result.add(candidate);
+            if (result.size() == 5) break; // الآن نُرجع حتى 5 اقتراحات
+        }
+        if (result.isEmpty()) {
+            for (int i = 0; i < Math.min(3, source.size()); i++) result.add(source.get(i));
+        }
+        return result;
+    }
+
+    void rememberWord(String word, boolean arabic) {
+        if (word == null) return;
+        String clean = word.trim();
+        if (clean.isEmpty()) return;
+        String key = arabic ? KEY_LEARNED_AR : KEY_LEARNED_EN;
+        String csv = prefs.getString(key, "");
+        List<String> items = new ArrayList<>();
+        if (!TextUtils.isEmpty(csv)) {
+            for (String s : csv.split(",")) if (!s.isEmpty()) items.add(s);
+        }
+        // أحفظ الكلمة في البداية وتجنب التكرار
+        items.remove(clean);
+        items.add(0, clean);
+        // اقتطع لحد MAX_LEARNED
+        if (items.size() > MAX_LEARNED) items = items.subList(0, MAX_LEARNED);
+        // اكتب مرة أخرى
+        StringBuilder sb = new StringBuilder();
+        for (int i = 0; i < items.size(); i++) {
+            if (i > 0) sb.append(',');
+            sb.append(items.get(i));
+        }
+        prefs.edit().putString(key, sb.toString()).apply();
+    }
+
+    /**
+     * تذكّر الكلمات من نص كامل (تستخدم عند الإدراج النهائي) — تحفظ آخر كلمة واحدة.
+     */
+    void rememberFromText(String text, boolean arabic) {
+        if (text == null) return;
+        String clean = text.trim();
+        if (clean.isEmpty()) return;
+        // خذ آخر كلمة بعد الفراغ أو السطر
+        int lastSpace = Math.max(clean.lastIndexOf(' '), clean.lastIndexOf('\n'));
+        String last = lastSpace >= 0 ? clean.substring(lastSpace + 1) : clean;
+        rememberWord(last, arabic);
+    }
+}
