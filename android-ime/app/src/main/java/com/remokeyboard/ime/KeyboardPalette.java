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
        } else if ("ramadan".equals(theme)) {
            base = new KeyboardPalette(Color.rgb(13, 23, 21), Color.rgb(8, 15, 14), Color.rgb(67, 84, 75), Color.rgb(39, 47, 42), Color.rgb(252, 247, 230), Color.rgb(210, 198, 171), Color.rgb(213, 174, 85));
        } else if ("light".equals(theme)) {
            base = new KeyboardPalette(Color.rgb(226, 233, 239), Color.WHITE, Color.rgb(245, 247, 250), Color.rgb(204, 216, 227), Color.rgb(22, 35, 48), Color.rgb(77, 98, 120), Color.rgb(0, 119, 190));
        } else {
            base = new KeyboardPalette(Color.BLACK, Color.rgb(9, 9, 9), Color.rgb(128, 128, 128), Color.rgb(38, 38, 38), Color.WHITE, Color.rgb(201, 201, 201), Color.rgb(92, 200, 255));
        }
        return base.withKeyStyle(preferences.getString("key_style", "desktop"));
    }

    private KeyboardPalette withKeyStyle(String style) {
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
