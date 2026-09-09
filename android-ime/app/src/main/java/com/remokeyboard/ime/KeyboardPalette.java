package com.remokeyboard.ime;

import android.content.SharedPreferences;
import android.graphics.Color;

/** ألوان ومقاييس مفاتيح قابلة للتغيير عبر الثيم واستايل المفاتيح. */
final class KeyboardPalette {
    final int background;
    final int surface;
    final int key;
    final int keySpecial;
    final int text;
    final int muted;
    final int accent;
    final int keyRadius;
    final int keyAlpha;
    final int keyStroke;

    private KeyboardPalette(int background, int surface, int key, int keySpecial, int text, int muted, int accent) {
        this(background, surface, key, keySpecial, text, muted, accent, 8, 232, Color.argb(72, 255, 255, 255));
    }

    private KeyboardPalette(int background, int surface, int key, int keySpecial, int text, int muted, int accent, int keyRadius, int keyAlpha, int keyStroke) {
        this.background = background;
        this.surface = surface;
        this.key = key;
        this.keySpecial = keySpecial;
        this.text = text;
        this.muted = muted;
        this.accent = accent;
        this.keyRadius = keyRadius;
        this.keyAlpha = keyAlpha;
        this.keyStroke = keyStroke;
    }

    static KeyboardPalette from(SharedPreferences preferences) {
        String theme = preferences.getString("theme", "navy");
        KeyboardPalette base;
        if ("custom".equals(theme)) {
            base = new KeyboardPalette(
                preferenceColor(preferences, "custom_background_color", "#101010"),
                preferenceColor(preferences, "custom_surface_color", "#161616"),
                preferenceColor(preferences, "custom_key_color", "#777777"),
                preferenceColor(preferences, "custom_special_key_color", "#343434"),
                preferenceColor(preferences, "custom_text_color", "#FFFFFF"),
                preferenceColor(preferences, "custom_muted_color", "#D0D0D0"),
                preferenceColor(preferences, "custom_accent_color", "#8CCCFF")
            );
        } else if ("rose".equals(theme)) {
            base = new KeyboardPalette(Color.rgb(25, 19, 23), Color.rgb(16, 14, 16), Color.rgb(111, 70, 86), Color.rgb(42, 31, 36), Color.WHITE, Color.rgb(250, 210, 231), Color.rgb(249, 172, 212));
        } else if ("youth_cyber".equals(theme)) {
            base = new KeyboardPalette(Color.rgb(15, 23, 42), Color.rgb(8, 14, 28), Color.rgb(30, 41, 59), Color.rgb(22, 32, 48), Color.WHITE, Color.rgb(148, 163, 184), Color.rgb(6, 182, 212));
        } else if ("youth_drift".equals(theme)) {
            base = new KeyboardPalette(Color.rgb(9, 9, 11), Color.rgb(15, 15, 18), Color.rgb(24, 24, 27), Color.rgb(39, 39, 42), Color.WHITE, Color.rgb(253, 186, 116), Color.rgb(249, 115, 22));
        } else if ("youth_sunset".equals(theme)) {
            base = new KeyboardPalette(Color.rgb(30, 27, 75), Color.rgb(19, 17, 50), Color.rgb(49, 46, 129), Color.rgb(67, 56, 202), Color.WHITE, Color.rgb(216, 180, 254), Color.rgb(192, 132, 252));
        } else if ("sport_racing".equals(theme) || "sport".equals(theme)) {
            base = new KeyboardPalette(Color.rgb(24, 24, 27), Color.rgb(15, 15, 17), Color.rgb(39, 39, 42), Color.rgb(220, 38, 38), Color.WHITE, Color.rgb(254, 202, 202), Color.rgb(239, 68, 68));
        } else if ("sport_football".equals(theme)) {
            base = new KeyboardPalette(Color.rgb(6, 78, 59), Color.rgb(4, 47, 36), Color.rgb(6, 95, 70), Color.rgb(16, 185, 129), Color.WHITE, Color.rgb(167, 243, 208), Color.rgb(52, 211, 153));
        } else if ("feminine_lavender".equals(theme)) {
            base = new KeyboardPalette(Color.rgb(46, 16, 101), Color.rgb(30, 10, 68), Color.rgb(59, 7, 100), Color.rgb(88, 28, 135), Color.WHITE, Color.rgb(233, 213, 255), Color.rgb(216, 180, 254));
        } else if ("feminine_emerald".equals(theme)) {
            base = new KeyboardPalette(Color.rgb(2, 44, 34), Color.rgb(1, 28, 22), Color.rgb(6, 78, 59), Color.rgb(4, 120, 87), Color.WHITE, Color.rgb(167, 243, 208), Color.rgb(110, 231, 183));
        } else if ("feminine_rose_gold".equals(theme)) {
            base = new KeyboardPalette(Color.rgb(63, 23, 40), Color.rgb(42, 14, 26), Color.rgb(80, 29, 54), Color.rgb(112, 38, 74), Color.WHITE, Color.rgb(251, 207, 232), Color.rgb(244, 114, 182));
        } else if ("girly_pink_glam".equals(theme)) {
            base = new KeyboardPalette(Color.rgb(74, 14, 46), Color.rgb(48, 8, 29), Color.rgb(112, 26, 69), Color.rgb(159, 18, 57), Color.WHITE, Color.rgb(254, 205, 211), Color.rgb(244, 63, 94));
        } else if ("girly_pastel_candy".equals(theme) || "cute".equals(theme)) {
            base = new KeyboardPalette(Color.rgb(255, 231, 241), Color.rgb(255, 245, 250), Color.rgb(255, 173, 204), Color.rgb(231, 139, 176), Color.rgb(78, 39, 58), Color.rgb(145, 91, 116), Color.rgb(214, 75, 132));
        } else if ("nature".equals(theme)) {
            base = new KeyboardPalette(Color.rgb(20, 48, 31), Color.rgb(14, 35, 23), Color.rgb(67, 119, 74), Color.rgb(39, 78, 52), Color.rgb(243, 255, 233), Color.rgb(184, 209, 179), Color.rgb(123, 203, 106));
        } else if ("ramadan".equals(theme)) {
            base = new KeyboardPalette(Color.rgb(13, 23, 21), Color.rgb(8, 15, 14), Color.rgb(67, 84, 75), Color.rgb(39, 47, 42), Color.rgb(252, 247, 230), Color.rgb(210, 198, 171), Color.rgb(213, 174, 85));
        } else if ("light".equals(theme)) {
            base = new KeyboardPalette(Color.rgb(226, 233, 239), Color.WHITE, Color.rgb(245, 247, 250), Color.rgb(204, 216, 227), Color.rgb(22, 35, 48), Color.rgb(77, 98, 120), Color.rgb(0, 119, 190));
        } else if ("girly_cotton_cloud".equals(theme)) {
            base = new KeyboardPalette(Color.rgb(30, 30, 56), Color.rgb(20, 20, 38), Color.rgb(44, 44, 84), Color.rgb(71, 71, 135), Color.WHITE, Color.rgb(196, 181, 253), Color.rgb(167, 139, 250));
        } else if ("default_amoled".equals(theme)) {
            base = new KeyboardPalette(Color.BLACK, Color.rgb(8, 8, 8), Color.rgb(28, 28, 28), Color.rgb(44, 44, 44), Color.WHITE, Color.rgb(200, 200, 200), Color.rgb(56, 189, 248));
        } else if ("default_slate".equals(theme)) {
            base = new KeyboardPalette(Color.rgb(15, 23, 42), Color.rgb(10, 15, 30), Color.rgb(51, 65, 85), Color.rgb(71, 85, 105), Color.WHITE, Color.rgb(203, 213, 225), Color.rgb(148, 163, 184));
        } else if ("default_pearl".equals(theme)) {
            base = new KeyboardPalette(Color.rgb(241, 245, 249), Color.WHITE, Color.rgb(255, 255, 255), Color.rgb(226, 232, 240), Color.rgb(15, 23, 42), Color.rgb(71, 85, 105), Color.rgb(37, 99, 235));
        } else if ("default_royal_blue".equals(theme)) {
            base = new KeyboardPalette(Color.rgb(11, 25, 44), Color.rgb(7, 16, 29), Color.rgb(30, 62, 98), Color.rgb(25, 118, 210), Color.WHITE, Color.rgb(187, 222, 251), Color.rgb(0, 141, 255));
        } else if ("flag_sa".equals(theme)) {
            base = new KeyboardPalette(Color.rgb(7, 54, 31), Color.rgb(5, 38, 22), Color.rgb(30, 116, 67), Color.rgb(20, 83, 48), Color.WHITE, Color.rgb(190, 224, 201), Color.rgb(221, 236, 226));
        } else if ("flag_ps".equals(theme)) {
            base = new KeyboardPalette(Color.rgb(28, 30, 32), Color.rgb(12, 13, 15), Color.rgb(173, 45, 51), Color.rgb(42, 93, 57), Color.WHITE, Color.rgb(214, 214, 214), Color.rgb(220, 75, 75));
        } else if ("flag_ae".equals(theme)) {
            base = new KeyboardPalette(Color.rgb(22, 32, 30), Color.rgb(12, 20, 18), Color.rgb(179, 55, 55), Color.rgb(35, 111, 70), Color.WHITE, Color.rgb(204, 221, 211), Color.rgb(218, 91, 77));
        } else if ("flag_jo".equals(theme)) {
            base = new KeyboardPalette(Color.rgb(30, 30, 34), Color.rgb(13, 14, 16), Color.rgb(143, 48, 48), Color.rgb(43, 93, 60), Color.WHITE, Color.rgb(214, 214, 214), Color.rgb(218, 83, 83));
        } else {
            base = new KeyboardPalette(Color.BLACK, Color.rgb(9, 9, 9), Color.rgb(128, 128, 128), Color.rgb(38, 38, 38), Color.WHITE, Color.rgb(201, 201, 201), Color.rgb(92, 200, 255));
        }
        return base.withKeyStyle(preferences.getString("key_style", "desktop"), theme);
    }

    private KeyboardPalette withKeyStyle(String style, String theme) {
        if ("desktop".equals(style)) {
            if ("navy".equals(theme)) return new KeyboardPalette(
                Color.rgb(216, 234, 228), Color.rgb(184, 210, 202), Color.rgb(248, 250, 249),
                Color.rgb(222, 233, 229), Color.rgb(43, 56, 52), Color.rgb(104, 124, 118),
                Color.rgb(80, 137, 125), 7, 255, Color.rgb(67, 91, 84)
            );
            return new KeyboardPalette(background, surface, key, keySpecial, text, muted, accent, 7, 255, Color.argb(72, 255, 255, 255));
        }
        if ("glass".equals(style)) return new KeyboardPalette(background, surface, key, keySpecial, text, muted, accent, 15, 164, Color.argb(116, 235, 250, 255));
        if ("neon".equals(style)) return new KeyboardPalette(background, surface, key, keySpecial, text, muted, accent, 9, 214, Color.argb(170, Color.red(accent), Color.green(accent), Color.blue(accent)));
        if ("slim".equals(style)) return new KeyboardPalette(background, surface, key, keySpecial, text, muted, accent, 4, 245, Color.argb(46, 255, 255, 255));
        if ("pro".equals(style)) return new KeyboardPalette(background, surface, key, keySpecial, text, muted, accent, 11, 238, Color.argb(98, 255, 255, 255));
        return new KeyboardPalette(background, surface, key, keySpecial, text, muted, accent, 6, 236, Color.argb(76, 255, 255, 255));
    }

    private static int preferenceColor(SharedPreferences preferences, String key, String fallback) {
        try { return Color.parseColor(preferences.getString(key, fallback)); }
        catch (Exception ignored) { return Color.parseColor(fallback); }
    }
}
