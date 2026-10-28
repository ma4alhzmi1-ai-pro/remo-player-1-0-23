package com.remokeyboard.ime;

public final class TranslationEngineHarness {
    private static void expect(String actual, String expected, String label) {
        if (!expected.equals(actual)) throw new AssertionError(label + ": expected '" + expected + "' but got '" + actual + "'");
        System.out.println("✓ " + label);
    }

    public static void main(String[] args) {
        expect(TranslationEngine.translate("صباح الخير", true).value, "good morning", "ترجمة عبارة عربية شائعة");
        expect(TranslationEngine.translate("شكرا", true).value, "thank you", "ترجمة كلمة عربية شائعة");
        expect(TranslationEngine.translate("hello", false).value, "مرحبا", "ترجمة إنجليزية إلى عربية");
        expect(TranslationEngine.translate("hello friend", false).value, "مرحبا صديق", "ترجمة كلمات إنجليزية متتابعة");
        expect(TranslationEngine.translate("نص غير معروف", true).value, "نص غير معروف", "الحفاظ على النص غير المتاح محليًا");
        System.out.println("اكتمل اختبار محرك الترجمة المحلي.");
    }
}
