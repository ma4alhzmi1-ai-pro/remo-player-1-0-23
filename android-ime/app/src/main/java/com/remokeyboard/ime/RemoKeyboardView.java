package com.remokeyboard.ime;

import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.text.InputType;
import android.view.Gravity;
import android.view.View;
import android.widget.HorizontalScrollView;
import android.widget.LinearLayout;
import android.widget.PopupWindow;
import android.widget.TextView;
import android.widget.Toast;
import java.util.List;

/** واجهة مفاتيح برمجية، خفيفة وآمنة من الاعتماد على KeyboardView المهمل. */
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
        setPadding(dp(5), dp(5), dp(5), dp(5));
        rebuildPalette();

        suggestions = new LinearLayout(context);
        suggestions.setGravity(Gravity.CENTER_VERTICAL | Gravity.RIGHT);
        addView(suggestions, new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(34)));

        addView(buildToolbar(), new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(40)));
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
        row.setGravity(Gravity.CENTER_VERTICAL | Gravity.RIGHT);
        row.setPadding(0, 0, 0, dp(3));
        addTool(row, "◎", "الإيموجي", () -> setPage(Page.SYMBOLS));
        addTool(row, "✧", "زخرفة", () -> showDecorationPopup());
        addTool(row, "▣", "الحافظة", () -> showClipboardPopup());
        addTool(row, "◉", "الصوت", service::beginVoiceInput);
        addTool(row, "⚙", "إعدادات الكيبورد", service::openSettings);
        scroll.addView(row);
        return scroll;
    }

    private void addTool(LinearLayout row, String symbol, String label, Runnable action) {
        TextView tool = textButton(symbol + "  " + label, 14, palette.muted, palette.surface);
        tool.setContentDescription(label);
        tool.setOnClickListener(v -> action.run());
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.MATCH_PARENT);
        params.setMargins(dp(2), 0, dp(2), 0);
        row.addView(tool, params);
    }

    void refreshSuggestions() {
        suggestions.removeAllViews();
        boolean arabic = page == Page.ARABIC;
        List<String> values = suggestionEngine.forPrefix(service.getCurrentWordBeforeCursor(), arabic);
        for (String value : values) {
            TextView chip = textButton(value, 15, palette.text, palette.surface);
            chip.setOnClickListener(v -> service.commitText(value + " "));
            LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(0, LayoutParams.MATCH_PARENT, 1f);
            params.setMargins(dp(2), 0, dp(2), dp(3));
            suggestions.addView(chip, params);
        }
    }

    private void renderKeys() {
        keyArea.removeAllViews();
        if (page == Page.ARABIC) {
            row(new String[]{"ض","ص","ث","ق","ف","غ","ع","ه","خ","ح","ج"});
            row(new String[]{"ش","س","ي","ب","ل","ا","ت","ن","م","ك","ط"});
            row(new String[]{"⇧","ئ","ء","ؤ","ر","لا","ى","ة","و","ز","ظ","⌫"});
            bottomRow("123", "🌐 العربية", "مسافة", "⏎");
        } else if (page == Page.ENGLISH) {
            row(letterCase(new String[]{"q","w","e","r","t","y","u","i","o","p"}));
            row(letterCase(new String[]{"a","s","d","f","g","h","j","k","l"}));
            String[] bottomLetters = letterCase(new String[]{"z","x","c","v","b","n","m"});
            row(new String[]{"⇧", bottomLetters[0], bottomLetters[1], bottomLetters[2], bottomLetters[3], bottomLetters[4], bottomLetters[5], bottomLetters[6], "⌫"});
            bottomRow("123", "🌐 EN", "space", "⏎");
        } else if (page == Page.NUMBERS) {
            String numeralSystem = preferences.getString("numerals", "arabic_indic");
            String[] digits = "latin".equals(numeralSystem)
                ? new String[]{"1","2","3","4","5","6","7","8","9","0"}
                : "eastern".equals(numeralSystem)
                    ? new String[]{"۱","۲","۳","۴","۵","۶","۷","۸","۹","۰"}
                    : new String[]{"١","٢","٣","٤","٥","٦","٧","٨","٩","٠"};
            row(digits);
            row(new String[]{"@","#","$","%","&","*","-","+","(",")"});
            row(new String[]{"ALT","!","\"","'","؛","،","/","؟","⌫"});
            bottomRow("#+=", "🌐 العربية", "مسافة", "⏎");
        } else {
            row(new String[]{"😀","😂","😍","🥰","😊","👍","🔥","✨","❤️","🙏"});
            row(new String[]{"،","؛","؟","!",".","…","«","»","(",")"});
            row(new String[]{"~","`","|","•","√","π","÷","×","{","}","⌫"});
            bottomRow("123", "🌐 العربية", "مسافة", "⏎");
        }
    }

    private void row(String[] labels) {
        LinearLayout row = new LinearLayout(getContext());
        row.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams rowParams = new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(preferences.getInt("key_height", 49)));
        rowParams.setMargins(0, dp(2), 0, dp(2));
        keyArea.addView(row, rowParams);
        for (String label : labels) addKey(row, label, 1f);
    }

    private void bottomRow(String mode, String language, String space, String enter) {
        LinearLayout row = new LinearLayout(getContext());
        row.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams rowParams = new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(preferences.getInt("key_height", 49)));
        rowParams.setMargins(0, dp(2), 0, dp(1));
        keyArea.addView(row, rowParams);
        addKey(row, mode, 1.1f);
        addKey(row, language, 1.5f);
        addKey(row, space, 3.1f);
        addKey(row, enter, 1.3f);
    }

    private void addKey(LinearLayout row, String label, float weight) {
        boolean special = label.equals("⌫") || label.equals("⏎") || label.equals("مسافة") || label.equals("space") || label.startsWith("🌐") || label.equals("⇧");
        TextView key = textButton(label, label.length() > 7 ? 13 : 20, palette.text, special ? palette.keySpecial : palette.key);
        key.setTypeface(Typeface.create("sans", special ? Typeface.BOLD : Typeface.NORMAL));
        key.setGravity(Gravity.CENTER);
        key.setOnClickListener(v -> handleKey(label));
        if (label.equals("ة")) key.setOnLongClickListener(v -> { showAlternatives(key, new String[]{"ة", "َ", "ً", "ُ", "ٌ", "ِ", "ٍ", "ْ", "ّ", "ٰ"}); return true; });
        if (label.equals("ت")) key.setOnLongClickListener(v -> { showAlternatives(key, new String[]{"ت", "ـ", "تـ", "ـت", "ۃ"}); return true; });
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(0, LayoutParams.MATCH_PARENT, weight);
        params.setMargins(dp(2), 0, dp(2), 0);
        row.addView(key, params);
    }

    private void handleKey(String label) {
        if (label.equals("⌫")) { service.deleteBeforeCursor(); return; }
        if (label.equals("⏎")) { service.sendEnterOrNext(); return; }
        if (label.equals("مسافة") || label.equals("space")) { service.commitText(" "); return; }
        if (label.equals("123")) { setPage(Page.NUMBERS); return; }
        if (label.equals("#+=")) { setPage(Page.SYMBOLS); return; }
        if (label.equals("ALT")) { setPage(Page.SYMBOLS); return; }
        if (label.startsWith("🌐")) { setPage(page == Page.ARABIC ? Page.ENGLISH : Page.ARABIC); return; }
        if (label.equals("⇧")) {
            if (page == Page.ENGLISH) {
                englishCaps = !englishCaps;
                renderKeys();
            } else Toast.makeText(getContext(), "اضغط مطولًا على ة للتشكيل وعلى ت للمد", Toast.LENGTH_SHORT).show();
            return;
        }
        service.commitText(label);
    }

    private void setPage(Page target) {
        page = target;
        renderKeys();
        refreshSuggestions();
    }

    private String[] letterCase(String[] letters) {
        if (!englishCaps) return letters;
        String[] transformed = new String[letters.length];
        for (int index = 0; index < letters.length; index++) transformed[index] = letters[index].toUpperCase(java.util.Locale.US);
        return transformed;
    }

    private TextView textButton(String text, int size, int foreground, int background) {
        TextView view = new TextView(getContext());
        view.setText(text);
        view.setTextSize(size);
        view.setTextColor(foreground);
        view.setSingleLine(true);
        view.setGravity(Gravity.CENTER);
        view.setPadding(dp(6), 0, dp(6), 0);
        view.setBackground(rounded(background, dp(8)));
        view.setClickable(true);
        return view;
    }

    private void showAlternatives(View anchor, String[] alternatives) {
        LinearLayout menu = new LinearLayout(getContext());
        menu.setPadding(dp(4), dp(4), dp(4), dp(4));
        menu.setBackground(rounded(palette.surface, dp(12)));
        for (String alternative : alternatives) {
            TextView candidate = textButton(alternative, 19, palette.text, palette.key);
            candidate.setOnClickListener(v -> { service.commitText(alternative); });
            menu.addView(candidate, new LinearLayout.LayoutParams(dp(40), dp(42)));
        }
        PopupWindow popup = new PopupWindow(menu, LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT, true);
        popup.setOutsideTouchable(true);
        popup.setElevation(dp(8));
        for (int i = 0; i < menu.getChildCount(); i++) {
            final View candidate = menu.getChildAt(i);
            candidate.setOnClickListener(v -> { service.commitText(((TextView) v).getText().toString()); popup.dismiss(); });
        }
        popup.showAsDropDown(anchor, -dp(45), -dp(110));
    }

    private void showClipboardPopup() {
        List<String> entries = service.getClipboard().getAll();
        if (entries.isEmpty()) { Toast.makeText(getContext(), "الحافظة فارغة", Toast.LENGTH_SHORT).show(); return; }
        LinearLayout list = new LinearLayout(getContext());
        list.setOrientation(VERTICAL);
        list.setPadding(dp(8), dp(8), dp(8), dp(8));
        list.setBackground(rounded(palette.surface, dp(12)));
        PopupWindow popup = new PopupWindow(list, dp(300), LayoutParams.WRAP_CONTENT, true);
        int count = Math.min(entries.size(), 5);
        for (int index = 0; index < count; index++) {
            String entry = entries.get(index);
            String preview = entry.length() > 80 ? entry.substring(0, 80) + "…" : entry;
            TextView item = textButton(preview, 15, palette.text, palette.key);
            item.setGravity(Gravity.RIGHT | Gravity.CENTER_VERTICAL);
            item.setOnClickListener(v -> { service.pasteClipboardItem(entry); popup.dismiss(); });
            LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(44));
            params.setMargins(0, dp(2), 0, dp(2));
            list.addView(item, params);
        }
        popup.setElevation(dp(8));
        popup.showAtLocation(this, Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL, 0, dp(245));
    }

    private void showDecorationPopup() {
        LinearLayout list = new LinearLayout(getContext());
        list.setOrientation(VERTICAL);
        list.setPadding(dp(8), dp(8), dp(8), dp(8));
        list.setBackground(rounded(palette.surface, dp(12)));
        String[] examples = {"✦ ريموكيبورد ✦", "༺ ريمو ༻", "⌁ مرحبًا بك ⌁", "𓆩 ريموكيبورد 𓆪"};
        PopupWindow popup = new PopupWindow(list, dp(260), LayoutParams.WRAP_CONTENT, true);
        for (String example : examples) {
            TextView item = textButton(example, 17, palette.text, palette.key);
            item.setOnClickListener(v -> { service.commitText(((TextView) v).getText().toString()); popup.dismiss(); });
            LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(44));
            params.setMargins(0, dp(2), 0, dp(2));
            list.addView(item, params);
        }
        popup.setElevation(dp(8));
        popup.showAtLocation(this, Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL, 0, dp(245));
    }

    private GradientDrawable rounded(int color, int radius) {
        GradientDrawable shape = new GradientDrawable();
        shape.setColor(color);
        shape.setCornerRadius(radius);
        shape.setStroke(dp(1), Color.argb(42, 255, 255, 255));
        return shape;
    }

    private int dp(int value) { return (int) (value * getResources().getDisplayMetrics().density + 0.5f); }
}
