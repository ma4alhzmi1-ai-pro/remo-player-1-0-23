package com.remokeyboard.ime;

import android.content.SharedPreferences;
import android.graphics.Color;

/** ألوان مفاتيح خفيفة تحاكي تخطيط الكمبيوتر مع ثيمات محلية. */
final class KeyboardPalette {
    final int background;
    final int surface;
    final int key;
    final int keySpecial;
    final int text;
    final int muted;
    final int accent;

    private KeyboardPalette(int background, int surface, int key, int keySpecial, int text, int muted, int accent) {
        this.background = background;
        this.surface = surface;
        this.key = key;
        this.keySpecial = keySpecial;
        this.text = text;
        this.muted = muted;
        this.accent = accent;
    }

    static KeyboardPalette from(SharedPreferences preferences) {
        String theme = preferences.getString("theme", "navy");
        if ("rose".equals(theme)) {
            return new KeyboardPalette(Color.rgb(25, 19, 23), Color.rgb(16, 14, 16), Color.rgb(111, 70, 86), Color.rgb(42, 31, 36), Color.WHITE, Color.rgb(250, 210, 231), Color.rgb(249, 172, 212));
        }
        if ("ramadan".equals(theme)) {
            return new KeyboardPalette(Color.rgb(13, 23, 21), Color.rgb(8, 15, 14), Color.rgb(67, 84, 75), Color.rgb(39, 47, 42), Color.rgb(252, 247, 230), Color.rgb(210, 198, 171), Color.rgb(213, 174, 85));
        }
        if ("light".equals(theme)) {
            return new KeyboardPalette(Color.rgb(226, 233, 239), Color.WHITE, Color.rgb(245, 247, 250), Color.rgb(204, 216, 227), Color.rgb(22, 35, 48), Color.rgb(77, 98, 120), Color.rgb(0, 119, 190));
        }
        return new KeyboardPalette(Color.BLACK, Color.rgb(9, 9, 9), Color.rgb(128, 128, 128), Color.rgb(38, 38, 38), Color.WHITE, Color.rgb(201, 201, 201), Color.rgb(92, 200, 255));
    }
}
