package com.remokeyboard.ime;

import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.view.Gravity;
import android.view.View;
import android.widget.HorizontalScrollView;
import android.widget.LinearLayout;
import android.widget.PopupWindow;
import android.widget.TextView;
import java.util.List;

/** لوحة إدخال بأسلوب مفاتيح الكمبيوتر مع رموز ثانوية وصف أدوات ووظائف إدخال فعلية. */
final class RemoKeyboardView extends LinearLayout {
    private enum Page { ARABIC, ENGLISH, NUMBERS, SYMBOLS }
    private final RemoInputMethodService service;
    private final SharedPreferences preferences;
    private final SuggestionEngine suggestionEngine = new SuggestionEngine();
    private final LinearLayout suggestions;
    private final LinearLayout keyArea;
    private Page page = Page.ARABIC;
    private KeyboardPalette palette;
    private boolean englishCaps = false;

    RemoKeyboardView(Context context, RemoInputMethodService service, SharedPreferences preferences) {
        super(context);
        this.service = service;
        this.preferences = preferences;
        setOrientation(VERTICAL);
        setPadding(dp(4), dp(3), dp(4), dp(4));
        rebuildPalette();

        suggestions = new LinearLayout(context);
        suggestions.setGravity(Gravity.CENTER_VERTICAL | Gravity.RIGHT);
        suggestions.setPadding(dp(3), 0, dp(3), 0);
        addView(suggestions, new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(30)));
        addView(buildToolbar(), new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(42)));
        keyArea = new LinearLayout(context);
        keyArea.setOrientation(VERTICAL);
        addView(keyArea, new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT));
        renderKeys();
        refreshSuggestions();
    }

    private void rebuildPalette() {
        palette = KeyboardPalette.from(preferences);
        setBackgroundColor(palette.background);
    }

    private View buildToolbar() {
        HorizontalScrollView scroll = new HorizontalScrollView(getContext());
        scroll.setHorizontalScrollBarEnabled(false);
        LinearLayout row = new LinearLayout(getContext());
        row.setGravity(Gravity.CENTER);
        row.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        row.setPadding(dp(4), 0, dp(4), dp(3));
        addTool(row, "⌁", "الزخرفة", this::showDecorationPopup);
        addTool(row, "文", "الترجمة", () -> showMessage("افتح إعدادات الترجمة لتفعيلها"));
        addTool(row, "▤", "الحاسبة", () -> setPage(Page.NUMBERS));
        addTool(row, "↕", "ارتفاع المفاتيح", () -> showMessage("غيّر الارتفاع من الإعدادات"));
        addTool(row, "⚙", "إعدادات الكيبورد", service::openSettings);
        return scrollWith(row, scroll);
    }

    private View scrollWith(LinearLayout row, HorizontalScrollView scroll) {
        scroll.addView(row);
        return scroll;
    }

    private void addTool(LinearLayout row, String symbol, String description, Runnable action) {
        TextView tool = textButton(symbol, 25, palette.text, palette.surface, dp(3));
        tool.setContentDescription(description);
        tool.setOnClickListener(v -> action.run());
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(dp(55), LayoutParams.MATCH_PARENT);
        params.setMargins(dp(2), 0, dp(2), 0);
        row.addView(tool, params);
    }

    void refreshSuggestions() {
        suggestions.removeAllViews();
        List<String> values = suggestionEngine.forPrefix(service.getCurrentWordBeforeCursor(), page == Page.ARABIC);
        for (String value : values) {
            TextView chip = textButton(value, 14, palette.muted, palette.surface, dp(3));
            chip.setOnClickListener(v -> service.commitText(value + " "));
            LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(0, LayoutParams.MATCH_PARENT, 1f);
            params.setMargins(dp(2), 0, dp(2), dp(2));
            suggestions.addView(chip, params);
        }
    }

    private void renderKeys() {
        rebuildPalette();
        keyArea.removeAllViews();
        if (page == Page.ARABIC) {
            row(new String[]{"١\nض", "٢\nص", "٣\nث", "٤\nق", "٥\nف", "٦\nغ", "٧\nع", "٨\nه", "٩\nخ", "٠\nح", "$\nج"});
            row(new String[]{"ش", "ي\nس", "ب\nي", "أ\nب", "ل", "ا", "ت", "ن", "م", "ك", "ط"});
            row(new String[]{"ء\nئ", "؟\nؤ", "ظ", "ذ", "د", "ز", "ر", "و", "ة", "⌫"});
            bottomRow("123\n◉", "◎", "/", "◀ العربية ▶", "▣", ".", "تنفيذ");
        } else if (page == Page.ENGLISH) {
            row(letterCase(new String[]{"1\nq", "2\nw", "3\ne", "4\nr", "5\nt", "6\ny", "7\nu", "8\ni", "9\no", "0\np"}));
            row(letterCase(new String[]{"a", "s", "d", "f", "g", "h", "j", "k", "l"}));
            row(letterCase(new String[]{"⇧", "z", "x", "c", "v", "b", "n", "m", "⌫"}));
            bottomRow("123\n◉", "◎", "/", "◀ English ▶", "▣", ".", "تنفيذ");
        } else if (page == Page.NUMBERS) {
            String[] digits = numberRow();
            row(digits);
            row(new String[]{"@", "#", "$", "%", "&", "*", "−", "+", "(", ")"});
            row(new String[]{"ALT", "!", "\"", "'", "؛", "،", "/", "؟", "⌫"});
            bottomRow("#+=", "◎", "=", "◀ العربية ▶", "▣", ".", "تنفيذ");
        } else {
            row(new String[]{"😀", "🥹", "😍", "🫶", "🔥", "✨", "❤️", "🙏"});
            row(new String[]{"😂", "😊", "😎", "🤍", "🌙", "⭐", "🎉", "💡"});
            row(new String[]{"،", "؛", "؟", "!", ".", "…", "«", "»", "⌫"});
            bottomRow("123", "◎", "/", "◀ العربية ▶", "▣", ".", "تنفيذ");
        }
    }

    private String[] numberRow() {
        String system = preferences.getString("numerals", "arabic_indic");
        if ("latin".equals(system)) return new String[]{"1","2","3","4","5","6","7","8","9","0"};
        if ("eastern".equals(system)) return new String[]{"۱","۲","۳","۴","۵","۶","۷","۸","۹","۰"};
        return new String[]{"١","٢","٣","٤","٥","٦","٧","٨","٩","٠"};
    }

    private void row(String[] labels) {
        LinearLayout row = new LinearLayout(getContext());
        row.setGravity(Gravity.CENTER);
        row.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        int height = preferences.getInt("key_height", 61);
        LinearLayout.LayoutParams rowParams = new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(height));
        rowParams.setMargins(0, dp(3), 0, dp(1));
        keyArea.addView(row, rowParams);
        for (String label : labels) addKey(row, label, 1f);
    }

    private void bottomRow(String first, String emoji, String slash, String language, String clipboard, String dot, String enter) {
        LinearLayout row = new LinearLayout(getContext());
        row.setGravity(Gravity.CENTER);
        row.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        LinearLayout.LayoutParams rowParams = new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(61));
        rowParams.setMargins(0, dp(3), 0, dp(1));
        keyArea.addView(row, rowParams);
        addKey(row, first, 1.08f);
        addKey(row, emoji, .66f);
        addKey(row, slash, .72f);
        addKey(row, language, 2.35f);
        addKey(row, clipboard, .72f);
        addKey(row, dot, .62f);
        addKey(row, enter, 1.2f);
    }

    private void addKey(LinearLayout row, String label, float weight) {
        String primary = primaryKey(label);
        boolean special = primary.equals("⌫") || primary.equals("تنفيذ") || primary.startsWith("◀") || primary.equals("⇧") || primary.equals("▣") || primary.equals("123") || primary.equals("#+=");
        TextView key = textButton(label, label.contains("\n") ? 15 : (label.length() > 8 ? 14 : 22), palette.text, special ? palette.keySpecial : palette.key, dp(2));
        key.setTypeface(Typeface.create("sans", special ? Typeface.BOLD : Typeface.NORMAL));
        key.setGravity(Gravity.CENTER);
        key.setLines(label.contains("\n") ? 2 : 1);
        key.setLineSpacing(0, .87f);
        key.setOnClickListener(v -> handleKey(primary));
        if (primary.equals("ة")) key.setOnLongClickListener(v -> { showAlternatives(key, new String[]{"ة", "َ", "ً", "ُ", "ٌ", "ِ", "ٍ", "ْ", "ّ", "ٰ"}); return true; });
        if (primary.equals("ت")) key.setOnLongClickListener(v -> { showAlternatives(key, new String[]{"ت", "ـ", "تـ", "ـت", "ۃ"}); return true; });
        if (primary.equals("123")) key.setOnLongClickListener(v -> { service.beginVoiceInput(); return true; });
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(0, LayoutParams.MATCH_PARENT, weight);
        params.setMargins(dp(3), 0, dp(3), 0);
        row.addView(key, params);
    }

    private String primaryKey(String label) {
        int breakAt = label.lastIndexOf('\n');
        return breakAt >= 0 ? label.substring(breakAt + 1) : label;
    }

    private void handleKey(String label) {
        if (label.equals("⌫")) { service.deleteBeforeCursor(); return; }
        if (label.equals("تنفيذ")) { service.sendEnterOrNext(); return; }
        if (label.equals("▣")) { showClipboardPopup(); return; }
        if (label.equals("◎")) { setPage(page == Page.SYMBOLS ? Page.ARABIC : Page.SYMBOLS); return; }
        if (label.equals("123")) { setPage(Page.NUMBERS); return; }
        if (label.equals("#+=")) { setPage(Page.SYMBOLS); return; }
        if (label.equals("ALT")) { setPage(Page.SYMBOLS); return; }
        if (label.startsWith("◀")) { setPage(page == Page.ARABIC ? Page.ENGLISH : Page.ARABIC); return; }
        if (label.equals("⇧")) { englishCaps = !englishCaps; renderKeys(); return; }
        service.commitText(label);
    }

    private void setPage(Page target) {
        page = target;
        renderKeys();
        refreshSuggestions();
    }

    private String[] letterCase(String[] letters) {
        if (!englishCaps) return letters;
        String[] result = new String[letters.length];
        for (int index = 0; index < letters.length; index++) {
            String value = letters[index];
            int breakAt = value.lastIndexOf('\n');
            result[index] = breakAt >= 0 ? value.substring(0, breakAt + 1) + value.substring(breakAt + 1).toUpperCase(java.util.Locale.US) : value.toUpperCase(java.util.Locale.US);
        }
        return result;
    }

    private void showAlternatives(View anchor, String[] alternatives) {
        LinearLayout menu = new LinearLayout(getContext());
        menu.setPadding(dp(4), dp(4), dp(4), dp(4));
        menu.setBackground(rounded(palette.surface, dp(4), false));
        PopupWindow popup = new PopupWindow(menu, LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT, true);
        for (String alternative : alternatives) {
            TextView candidate = textButton(alternative, 20, palette.text, palette.key, dp(2));
            candidate.setOnClickListener(v -> { service.commitText(alternative); popup.dismiss(); });
            menu.addView(candidate, new LinearLayout.LayoutParams(dp(42), dp(48)));
        }
        popup.setOutsideTouchable(true);
        popup.setElevation(dp(8));
        popup.showAsDropDown(anchor, -dp(42), -dp(116));
    }

    private void showClipboardPopup() {
        List<String> entries = service.getClipboard().getAll();
        if (entries.isEmpty()) { showMessage("الحافظة فارغة"); return; }
        LinearLayout list = new LinearLayout(getContext());
        list.setOrientation(VERTICAL);
        list.setPadding(dp(7), dp(7), dp(7), dp(7));
        list.setBackground(rounded(palette.surface, dp(4), false));
        PopupWindow popup = new PopupWindow(list, dp(312), LayoutParams.WRAP_CONTENT, true);
        int count = Math.min(entries.size(), 5);
        for (int index = 0; index < count; index++) {
            String entry = entries.get(index);
            String preview = entry.length() > 90 ? entry.substring(0, 90) + "…" : entry;
            TextView item = textButton(preview, 15, palette.text, palette.key, dp(2));
            item.setGravity(Gravity.RIGHT | Gravity.CENTER_VERTICAL);
            item.setOnClickListener(v -> { service.pasteClipboardItem(entry); popup.dismiss(); });
            LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(47));
            params.setMargins(0, dp(2), 0, dp(2));
            list.addView(item, params);
        }
        popup.setElevation(dp(8));
        popup.showAtLocation(this, Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL, 0, dp(248));
    }

    private void showDecorationPopup() {
        LinearLayout list = new LinearLayout(getContext());
        list.setOrientation(VERTICAL);
        list.setPadding(dp(7), dp(7), dp(7), dp(7));
        list.setBackground(rounded(palette.surface, dp(4), false));
        String[] examples = {"✦ ريموكيبورد ✦", "༺ ريمو ༻", "⌁ مرحبًا بك ⌁", "𓆩 ريموكيبورد 𓆪"};
        PopupWindow popup = new PopupWindow(list, dp(270), LayoutParams.WRAP_CONTENT, true);
        for (String example : examples) {
            TextView item = textButton(example, 17, palette.text, palette.key, dp(2));
            item.setOnClickListener(v -> { service.commitText(example); popup.dismiss(); });
            LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(45));
            params.setMargins(0, dp(2), 0, dp(2));
            list.addView(item, params);
        }
        popup.setElevation(dp(8));
        popup.showAtLocation(this, Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL, 0, dp(248));
    }

    private void showMessage(String value) {
        android.widget.Toast.makeText(getContext(), value, android.widget.Toast.LENGTH_SHORT).show();
    }

    private TextView textButton(String value, int size, int foreground, int background, int radius) {
        TextView view = new TextView(getContext());
        view.setText(value);
        view.setTextSize(size);
        view.setTextColor(foreground);
        view.setGravity(Gravity.CENTER);
        view.setPadding(dp(3), 0, dp(3), 0);
        view.setBackground(rounded(background, radius, background == palette.key));
        view.setClickable(true);
        return view;
    }

    private GradientDrawable rounded(int color, int radius, boolean lightEdge) {
        GradientDrawable shape = new GradientDrawable();
        shape.setColor(color);
        shape.setCornerRadius(radius);
        shape.setStroke(dp(1), lightEdge ? Color.argb(110, 240, 240, 240) : Color.argb(80, 130, 130, 130));
        return shape;
    }

    private int dp(int value) { return (int) (value * getResources().getDisplayMetrics().density + 0.5f); }
}
