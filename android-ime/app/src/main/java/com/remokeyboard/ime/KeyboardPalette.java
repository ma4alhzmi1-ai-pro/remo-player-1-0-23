package com.remokeyboard.ime;

import android.content.SharedPreferences;
import android.graphics.Color;

/** ألوان محلية صغيرة لتجنب صور الخلفيات الثقيلة. */
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
            return new KeyboardPalette(Color.rgb(54, 25, 45), Color.rgb(79, 37, 65), Color.rgb(105, 53, 87), Color.rgb(151, 73, 121), Color.WHITE, Color.rgb(245, 206, 230), Color.rgb(255, 169, 215));
        }
        if ("ramadan".equals(theme)) {
            return new KeyboardPalette(Color.rgb(22, 38, 37), Color.rgb(31, 57, 53), Color.rgb(49, 79, 73), Color.rgb(108, 81, 38), Color.rgb(252, 247, 230), Color.rgb(210, 198, 171), Color.rgb(213, 174, 85));
        }
        if ("light".equals(theme)) {
            return new KeyboardPalette(Color.rgb(239, 246, 252), Color.WHITE, Color.rgb(222, 235, 247), Color.rgb(190, 221, 243), Color.rgb(22, 35, 48), Color.rgb(77, 98, 120), Color.rgb(0, 119, 190));
        }
        return new KeyboardPalette(Color.rgb(16, 22, 31), Color.rgb(24, 36, 50), Color.rgb(39, 56, 76), Color.rgb(55, 81, 111), Color.rgb(243, 247, 252), Color.rgb(166, 187, 208), Color.rgb(92, 200, 255));
    }
}
