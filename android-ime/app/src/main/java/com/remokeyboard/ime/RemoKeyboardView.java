package com.remokeyboard.ime;

import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.GradientDrawable;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AbsListView;
import android.widget.BaseAdapter;
import android.widget.HorizontalScrollView;
import android.widget.Button;
import android.widget.EditText;
import android.widget.GridView;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.PopupWindow;
import android.widget.TextView;

import java.io.InputStream;
import java.util.List;

/** لوحة إدخال عربية بأسلوب مفاتيح الحاسوب، تدعم شريط أدوات وإيموجي وملصقات محلية. */
final class RemoKeyboardView extends LinearLayout {
    private enum Page { ARABIC, ENGLISH, NUMBERS, SYMBOLS, EMOJI }

    private static final String[][] EMOJI_CATEGORIES = {
        {"الكل", ""}, {"☺ الوجوه", "Smileys & Emotion"}, {"👋 الأشخاص", "People & Body"},
        {"🦊 الطبيعة", "Animals & Nature"}, {"🍔 طعام", "Food & Drink"}, {"✈ سفر", "Travel & Places"},
        {"⚽ نشاط", "Activities"}, {"💡 أدوات", "Objects"}, {"♥ رموز", "Symbols"}, {"⚑ أعلام", "Flags"}
    };

    private static final String[][] STICKERS = {
        {"emoji_1f44b", "👋 مرحبًا"}, {"emoji_1f44d", "👍 رائع"}, {"emoji_1f64f", "🙏 شكرًا"},
        {"emoji_1f389", "🎉 مبروك"}, {"emoji_1f90d", "🤍 محبة"}, {"emoji_1f319", "🌙 مساء الخير"}
    };

    private final RemoInputMethodService service;
    private final SharedPreferences preferences;
    private final SuggestionEngine suggestionEngine = new SuggestionEngine();
    private final LinearLayout suggestions;
    private final LinearLayout keyArea;
    private Page page = Page.ARABIC;
    private KeyboardPalette palette;
    private boolean englishCaps = false;
    private boolean desktopCtrl = false;
    private boolean desktopAlt = false;
    private boolean desktopMeta = false;
    private boolean desktopShift = false;
    private String emojiGroupFilter = "";

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
        addView(suggestions, new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(28)));
        addView(buildToolbar(), new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(40)));

        keyArea = new LinearLayout(context);
        keyArea.setOrientation(VERTICAL);
        addView(keyArea, new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT));
        renderKeys();
        refreshSuggestions();
    }

    private void rebuildPalette() {
        palette = KeyboardPalette.from(preferences);
        applyKeyboardBackground();
    }

    private void applyKeyboardBackground() {
        String studioUri = preferences.getString("background_uri", "");
        if (studioUri != null && !studioUri.isEmpty()) {
            try {
                InputStream stream = getContext().getContentResolver().openInputStream(android.net.Uri.parse(studioUri));
                Drawable drawable = Drawable.createFromStream(stream, "remo_studio_background");
                if (stream != null) stream.close();
                if (drawable != null) { setBackground(drawable); return; }
            } catch (Exception ignored) { }
        }
        String asset = preferences.getString("background_asset", "");
        if (asset != null && !asset.isEmpty()) {
            int resource = getResources().getIdentifier(asset, "drawable", getContext().getPackageName());
            if (resource != 0) { setBackgroundResource(resource); return; }
        }
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
        addTool(row, "☺", "الإيموجي الحديث", () -> setPage(Page.EMOJI));
        addTool(row, "⌕", "بحث في مكتبة الإيموجي", this::showEmojiExplorerPopup);
        addTool(row, "✦", "الملصقات", this::showStickerPopup);
        addTool(row, "文", "ترجمة النص المحدد أو الكلمة الحالية", this::showTranslationPopup);
        addTool(row, "▦", "الأرقام", () -> setPage(Page.NUMBERS));
        addTool(row, "⌂", "مظهر الكيبورد", () -> showMessage("غيّر المظهر من إعدادات الكيبورد"));
        addTool(row, "⚙", "إعدادات الكيبورد", service::openSettings);
        scroll.addView(row);
        return scroll;
    }

    private void addTool(LinearLayout row, String symbol, String description, Runnable action) {
        TextView tool = textButton(symbol, 21, palette.text, palette.surface, dp(14));
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
            TextView chip = textButton(value, 14, palette.muted, palette.surface, dp(14));
            chip.setOnClickListener(v -> service.commitText(value + " "));
            LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(0, LayoutParams.MATCH_PARENT, 1f);
            params.setMargins(dp(2), 0, dp(2), dp(2));
            suggestions.addView(chip, params);
        }
    }

    private void renderKeys() {
        rebuildPalette();
        keyArea.removeAllViews();
        if (isDesktopClassic()) {
            desktopFunctionRow();
            desktopModifierRow();
        }
        if (page == Page.ARABIC) {
            if (isDesktopClassic()) row(numberRow());
            row(isDesktopClassic() ? new String[]{"ض", "ص", "ث", "ق", "ف", "غ", "ع", "ه", "خ", "ح", "ج"} : new String[]{"١\nض", "٢\nص", "٣\nث", "٤\nق", "٥\nف", "٦\nغ", "٧\nع", "٨\nه", "٩\nخ", "٠\nح", "$\nج"});
            row(isDesktopClassic() ? new String[]{"ش", "س", "ي", "ب", "ل", "ا", "ت", "ن", "م", "ك", "ط"} : new String[]{"~\nش", "@\nس", "^\nي", "•\nب", "ل", "ا", "ت", "ن", "م", "ك", "ط"});
            rowWeighted(isDesktopClassic() ? new String[]{"Shift", "ئ", "ء", "ؤ", "ر", "لا", "ى", "ة", "و", "ز", "ظ", "Backspace"} : new String[]{"⇧", "ء\nئ", "؟\nؤ", "+\nظ", "−\nذ", "د", "ز", "ر", "و", "ة", "ى", "⌫"}, isDesktopClassic() ? new float[]{1.45f,1f,1f,1f,1f,1f,1f,1f,1f,1f,1f,1.65f} : null);
            bottomRow("◉\n123", "⚙", "،", "مسافة\nالعربية", "▣", "☺", isDesktopClassic() ? "Enter" : "تنفيذ");
        } else if (page == Page.ENGLISH) {
            if (isDesktopClassic()) row(numberRow());
            row(letterCase(new String[]{"1\nq", "2\nw", "3\ne", "4\nr", "5\nt", "6\ny", "7\nu", "8\ni", "9\no", "0\np"}));
            row(letterCase(new String[]{"a", "s", "d", "f", "g", "h", "j", "k", "l"}));
            row(letterCase(new String[]{"⇧", "z", "x", "c", "v", "b", "n", "m", "⌫"}));
            bottomRow("◉\n123", "⚙", ",", "مسافة\nEnglish", "▣", "☺", "تنفيذ");
        } else if (page == Page.NUMBERS) {
            row(numberRow());
            row(new String[]{"@", "#", "$", "%", "&", "*", "−", "+", "(", ")"});
            row(new String[]{"ALT", "!", "\"", "'", "؛", "،", "/", "؟", "⌫"});
            bottomRow("#+=", "⚙", "=", "مسافة\nالعربية", "▣", "☺", "تنفيذ");
        } else if (page == Page.SYMBOLS) {
            row(new String[]{"~", "`", "|", "•", "√", "Π", "÷", "×", "{", "}"});
            row(new String[]{"£", "¢", "€", "¥", "°", "^", "=", "_", "[", "]"});
            row(new String[]{"ALT", "!", "\"", "'", ":", ";", "/", "?", "⌫"});
            bottomRow("123", "⚙", "ABC", "مسافة\nالعربية", "▣", "☺", "تنفيذ");
        } else {
            emojiCategoryRow();
            emojiCatalogGrid();
            bottomRow("123", "⚙", "ABC", "مسافة\nالعربية", "▣", "☺", "تنفيذ");
        }
    }

    private String[] numberRow() {
        String system = preferences.getString("numerals", "arabic_indic");
        if ("latin".equals(system)) return new String[]{"1","2","3","4","5","6","7","8","9","0"};
        if ("eastern".equals(system)) return new String[]{"۱","۲","۳","۴","۵","۶","۷","۸","۹","۰"};
        return new String[]{"١","٢","٣","٤","٥","٦","٧","٨","٩","٠"};
    }

    private void emojiCategoryRow() {
        HorizontalScrollView scroll = new HorizontalScrollView(getContext());
        scroll.setHorizontalScrollBarEnabled(false);
        LinearLayout row = new LinearLayout(getContext());
        row.setGravity(Gravity.CENTER);
        row.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        LinearLayout.LayoutParams rowParams = new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(36));
        rowParams.setMargins(0, dp(3), 0, 0);
        keyArea.addView(scroll, rowParams);
        for (String[] category : EMOJI_CATEGORIES) {
            String label = category[0];
            String group = category[1];
            boolean active = group.equals(emojiGroupFilter);
            TextView tab = textButton(label, 12, active ? palette.text : palette.muted, active ? palette.keySpecial : palette.surface, dp(12));
            tab.setOnClickListener(v -> { emojiGroupFilter = group; renderKeys(); });
            LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(dp(84), LayoutParams.MATCH_PARENT);
            params.setMargins(dp(2), 0, dp(2), 0);
            row.addView(tab, params);
        }
        scroll.addView(row, new HorizontalScrollView.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.MATCH_PARENT));
    }

    private void emojiCatalogGrid() {
        GridView grid = new GridView(getContext());
        grid.setNumColumns(7);
        grid.setGravity(Gravity.CENTER);
        grid.setHorizontalSpacing(dp(3));
        grid.setVerticalSpacing(dp(3));
        grid.setStretchMode(GridView.STRETCH_COLUMN_WIDTH);
        grid.setPadding(dp(2), dp(3), dp(2), dp(3));
        grid.setVerticalScrollBarEnabled(true);
        grid.setFastScrollEnabled(true);
        List<EmojiCatalog.Item> items = EmojiCatalog.filter(getContext(), emojiGroupFilter, "");
        grid.setAdapter(new EmojiGridAdapter(items));
        grid.setOnItemClickListener((parent, view, position, id) -> service.commitText(items.get(position).emoji));
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(isDesktopClassic() ? 190 : 224));
        params.setMargins(0, dp(2), 0, dp(1));
        keyArea.addView(grid, params);
    }

    private final class EmojiGridAdapter extends BaseAdapter {
        private final List<EmojiCatalog.Item> items;

        EmojiGridAdapter(List<EmojiCatalog.Item> items) { this.items = items; }

        @Override public int getCount() { return items.size(); }
        @Override public EmojiCatalog.Item getItem(int position) { return items.get(position); }
        @Override public long getItemId(int position) { return position; }

        @Override public View getView(int position, View convertView, ViewGroup parent) {
            TextView tile = convertView instanceof TextView ? (TextView) convertView : new TextView(getContext());
            EmojiCatalog.Item item = getItem(position);
            tile.setText(item.emoji);
            tile.setTextSize(27);
            tile.setTypeface(EmojiCatalog.typeface(getContext()));
            tile.setTextColor(palette.text);
            tile.setGravity(Gravity.CENTER);
            tile.setPadding(dp(1), 0, dp(1), 0);
            tile.setContentDescription(item.name);
            tile.setBackground(rounded(Color.argb(palette.keyAlpha, Color.red(palette.key), Color.green(palette.key), Color.blue(palette.key)), dp(8), true));
            tile.setLayoutParams(new AbsListView.LayoutParams(LayoutParams.MATCH_PARENT, dp(44)));
            return tile;
        }
    }

    private void row(String[] labels) {
        LinearLayout row = new LinearLayout(getContext());
        row.setGravity(Gravity.CENTER);
        // صفوف اللوحة العادية معرفة بترتيب بصري من اليسار إلى اليمين كما في المرجع.
        // يبقى نمط الكمبيوتر الكلاسيكي على اتجاهه السابق دون إعادة ترتيب.
        row.setLayoutDirection(isDesktopClassic() ? View.LAYOUT_DIRECTION_RTL : View.LAYOUT_DIRECTION_LTR);
        int height = preferences.getInt("key_height", 52);
        LinearLayout.LayoutParams rowParams = new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(height));
        rowParams.setMargins(0, dp(3), 0, dp(1));
        keyArea.addView(row, rowParams);
        for (String label : labels) addKey(row, label, 1f);
    }

    private void rowWeighted(String[] labels, float[] weights) {
        LinearLayout row = new LinearLayout(getContext());
        row.setGravity(Gravity.CENTER);
        row.setLayoutDirection(isDesktopClassic() ? View.LAYOUT_DIRECTION_RTL : View.LAYOUT_DIRECTION_LTR);
        int height = preferences.getInt("key_height", 52);
        LinearLayout.LayoutParams rowParams = new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(height));
        rowParams.setMargins(0, dp(3), 0, dp(1));
        keyArea.addView(row, rowParams);
        for (int index = 0; index < labels.length; index++) addKey(row, labels[index], weights == null ? 1f : weights[index]);
    }

    private boolean isDesktopClassic() { return "desktop".equals(preferences.getString("key_style", "desktop")); }

    private void desktopFunctionRow() {
        LinearLayout row = new LinearLayout(getContext());
        row.setGravity(Gravity.CENTER);
        row.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        LinearLayout.LayoutParams rowParams = new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(35));
        rowParams.setMargins(0, dp(2), 0, dp(2));
        keyArea.addView(row, rowParams);
        String[] functions = {"Esc", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"};
        for (String value : functions) addKey(row, value, 1f);
    }

    private void desktopModifierRow() {
        LinearLayout row = new LinearLayout(getContext());
        row.setGravity(Gravity.CENTER);
        row.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        LinearLayout.LayoutParams rowParams = new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(35));
        rowParams.setMargins(0, dp(2), 0, dp(2));
        keyArea.addView(row, rowParams);
        String[] modifiers = {"Tab", "Ctrl", "Alt", "Win", "Insert", "Home", "End", "PgUp", "PgDn", "Print", "Pause", "⌕", "文", "▣", "⚙"};
        for (String value : modifiers) addKey(row, value, value.length() > 4 ? 1.15f : 1f);
    }

    private void bottomRow(String first, String emoji, String slash, String language, String clipboard, String dot, String enter) {
        LinearLayout row = new LinearLayout(getContext());
        row.setGravity(Gravity.CENTER);
        row.setLayoutDirection(isDesktopClassic() ? View.LAYOUT_DIRECTION_RTL : View.LAYOUT_DIRECTION_LTR);
        LinearLayout.LayoutParams rowParams = new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(53));
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
        boolean special = primary.equals("⌫") || primary.equals("Backspace") || primary.equals("تنفيذ") || primary.equals("Enter") || primary.startsWith("◀") || primary.equals("⇧") || primary.equals("Shift") || primary.equals("▣") || primary.equals("123") || primary.equals("#+=") || primary.equals("ABC") || isDesktopControl(primary);
        TextView key = textButton(label, label.contains("\n") ? 21 : (label.length() > 8 ? 13 : 20), palette.text, special ? palette.keySpecial : palette.key, dp(8));
        key.setTypeface(Typeface.create("sans", special ? Typeface.BOLD : Typeface.NORMAL));
        key.setGravity(Gravity.CENTER);
        key.setOnClickListener(v -> {
            if (label.equals("مسافة\nالعربية")) service.commitText(" ");
            else if (label.equals("مسافة\nEnglish")) service.commitText(" ");
            else handleKey(primary);
        });
        if (label.equals("مسافة\nالعربية") || label.equals("مسافة\nEnglish")) {
            key.setOnTouchListener(new OnTouchListener() {
                private float downX;
                @Override public boolean onTouch(View v, MotionEvent event) {
                    if (event.getAction() == MotionEvent.ACTION_DOWN) {
                        downX = event.getRawX();
                        return true;
                    }
                    if (event.getAction() == MotionEvent.ACTION_UP) {
                        float distance = event.getRawX() - downX;
                        if (Math.abs(distance) >= dp(48)) {
                            setPage(page == Page.ARABIC ? Page.ENGLISH : Page.ARABIC);
                        } else {
                            v.performClick();
                        }
                        return true;
                    }
                    return event.getAction() == MotionEvent.ACTION_MOVE || event.getAction() == MotionEvent.ACTION_CANCEL;
                }
            });
        }
        key.setLongClickable(true);
        if (primary.equals("ا")) key.setOnLongClickListener(v -> { showAlternatives(key, new String[]{"ا", "أ", "إ", "آ", "ٱ"}); return true; });
        if (primary.equals("ل")) key.setOnLongClickListener(v -> { showAlternatives(key, new String[]{"ل", "لا", "لأ", "لإ", "لآ"}); return true; });
        if (primary.equals("ة")) key.setOnLongClickListener(v -> { showAlternatives(key, new String[]{"ة", "ةَ", "ةً", "ةُ", "ةٌ", "ةِ", "ةٍ", "ةْ", "ةّ", "ةٰ"}, new String[]{"ة", "َ", "ً", "ُ", "ٌ", "ِ", "ٍ", "ْ", "ّ", "ٰ"}); return true; });
        if (primary.equals("ت")) key.setOnLongClickListener(v -> { showAlternatives(key, new String[]{"ت", "تـ", "تـت", "ـت", "ۃ"}, new String[]{"ت", "ـ", "تـ", "ـت", "ۃ"}); return true; });
        if (primary.equals("123")) key.setOnLongClickListener(v -> { service.beginVoiceInput(); return true; });
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(0, LayoutParams.MATCH_PARENT, weight);
        params.setMargins(dp(1), 0, dp(1), 0);
        row.addView(key, params);
    }

    private String primaryKey(String label) {
        int breakAt = label.lastIndexOf('\n');
        return breakAt >= 0 ? label.substring(breakAt + 1) : label;
    }

    private void handleKey(String label) {
        if (label.equals("⌫") || label.equals("Backspace")) { service.deleteBeforeCursor(); return; }
        if (label.equals("تنفيذ") || label.equals("Enter")) { service.sendEnterOrNext(); return; }
        if (label.equals("▣")) { showClipboardPopup(); return; }
        if (label.equals("☺")) { setPage(Page.EMOJI); return; }
        if (label.equals("ABC")) { setPage(Page.ARABIC); return; }
        if (label.equals("◎")) { setPage(page == Page.SYMBOLS ? Page.ARABIC : Page.SYMBOLS); return; }
        if (label.equals("123")) { setPage(Page.NUMBERS); return; }
        if (label.equals("#+=")) { setPage(Page.SYMBOLS); return; }
        if (label.equals("ALT")) { setPage(Page.SYMBOLS); return; }
        if (label.startsWith("◀")) { setPage(page == Page.ARABIC ? Page.ENGLISH : Page.ARABIC); return; }
        if (label.equals("⇧") || label.equals("Shift")) { desktopShift = isDesktopClassic() ? !desktopShift : false; englishCaps = isDesktopClassic() ? desktopShift : !englishCaps; renderKeys(); return; }
        if (isDesktopModifier(label)) { toggleDesktopModifier(label); return; }
        if (label.equals("Esc")) { service.sendDesktopKey(KeyEvent.KEYCODE_ESCAPE); return; }
        if (label.equals("Tab")) { service.sendDesktopKey(KeyEvent.KEYCODE_TAB); return; }
        if (label.equals("←")) { service.sendDesktopKey(KeyEvent.KEYCODE_DPAD_LEFT); return; }
        if (label.equals("→")) { service.sendDesktopKey(KeyEvent.KEYCODE_DPAD_RIGHT); return; }
        if (label.equals("↑")) { service.sendDesktopKey(KeyEvent.KEYCODE_DPAD_UP); return; }
        if (label.equals("↓")) { service.sendDesktopKey(KeyEvent.KEYCODE_DPAD_DOWN); return; }
        if (label.equals("Insert")) { service.sendDesktopKey(KeyEvent.KEYCODE_INSERT); return; }
        if (label.equals("Home")) { service.sendDesktopKey(KeyEvent.KEYCODE_MOVE_HOME); return; }
        if (label.equals("End")) { service.sendDesktopKey(KeyEvent.KEYCODE_MOVE_END); return; }
        if (label.equals("PgUp")) { service.sendDesktopKey(KeyEvent.KEYCODE_PAGE_UP); return; }
        if (label.equals("PgDn")) { service.sendDesktopKey(KeyEvent.KEYCODE_PAGE_DOWN); return; }
        if (label.equals("Print")) { service.sendDesktopKey(KeyEvent.KEYCODE_SYSRQ); return; }
        if (label.equals("Pause")) { service.sendDesktopKey(KeyEvent.KEYCODE_BREAK); return; }
        if (label.matches("F([1-9]|1[0-2])")) { service.sendDesktopKey(desktopFunctionKeyCode(label)); return; }
        if (sendDesktopCharacter(label)) return;
        if (label.equals("⌕")) { showEmojiExplorerPopup(); return; }
        if (label.equals("文")) { showTranslationPopup(); return; }
        if (label.equals("⚙")) { service.openSettings(); return; }
        service.commitText(label);
    }

    private boolean isDesktopControl(String label) {
        return label.equals("Esc") || label.matches("F([1-9]|1[0-2])") || label.equals("Tab") || label.equals("Ctrl") || label.equals("Alt") || label.equals("Win") || label.equals("Ins") || label.equals("Home") || label.equals("End") || label.equals("PgUp") || label.equals("PgDn") || label.equals("Print") || label.equals("Pause") || label.equals("Shift") || label.equals("←") || label.equals("→") || label.equals("↑") || label.equals("↓");
    }

    private boolean isDesktopModifier(String label) {
        return isDesktopClassic() && (label.equals("Ctrl") || label.equals("Alt") || label.equals("Win"));
    }

    private void toggleDesktopModifier(String label) {
        if (label.equals("Ctrl")) desktopCtrl = !desktopCtrl;
        if (label.equals("Alt")) desktopAlt = !desktopAlt;
        if (label.equals("Win")) desktopMeta = !desktopMeta;
        renderKeys();
    }

    private boolean sendDesktopCharacter(String label) {
        if (!isDesktopClassic() || (!desktopCtrl && !desktopAlt && !desktopMeta)) return false;
        String value = primaryKey(label).toLowerCase(java.util.Locale.US);
        int keyCode = desktopKeyCode(value);
        if (keyCode == KeyEvent.KEYCODE_UNKNOWN) return false;
        int meta = 0;
        if (desktopCtrl) meta |= KeyEvent.META_CTRL_ON;
        if (desktopAlt) meta |= KeyEvent.META_ALT_ON;
        if (desktopMeta) meta |= KeyEvent.META_META_ON;
        if (desktopShift) meta |= KeyEvent.META_SHIFT_ON;
        service.sendDesktopKey(keyCode, meta);
        desktopCtrl = false;
        desktopAlt = false;
        desktopMeta = false;
        desktopShift = false;
        englishCaps = false;
        renderKeys();
        return true;
    }

    private int desktopFunctionKeyCode(String value) {
        switch (value) {
            case "F1": return KeyEvent.KEYCODE_F1; case "F2": return KeyEvent.KEYCODE_F2; case "F3": return KeyEvent.KEYCODE_F3;
            case "F4": return KeyEvent.KEYCODE_F4; case "F5": return KeyEvent.KEYCODE_F5; case "F6": return KeyEvent.KEYCODE_F6;
            case "F7": return KeyEvent.KEYCODE_F7; case "F8": return KeyEvent.KEYCODE_F8; case "F9": return KeyEvent.KEYCODE_F9;
            case "F10": return KeyEvent.KEYCODE_F10; case "F11": return KeyEvent.KEYCODE_F11; case "F12": return KeyEvent.KEYCODE_F12;
            default: return KeyEvent.KEYCODE_UNKNOWN;
        }
    }

    private int desktopKeyCode(String value) {
        switch (value) {
            case "a": return KeyEvent.KEYCODE_A; case "b": return KeyEvent.KEYCODE_B; case "c": return KeyEvent.KEYCODE_C; case "d": return KeyEvent.KEYCODE_D;
            case "e": return KeyEvent.KEYCODE_E; case "f": return KeyEvent.KEYCODE_F; case "g": return KeyEvent.KEYCODE_G; case "h": return KeyEvent.KEYCODE_H;
            case "i": return KeyEvent.KEYCODE_I; case "j": return KeyEvent.KEYCODE_J; case "k": return KeyEvent.KEYCODE_K; case "l": return KeyEvent.KEYCODE_L;
            case "m": return KeyEvent.KEYCODE_M; case "n": return KeyEvent.KEYCODE_N; case "o": return KeyEvent.KEYCODE_O; case "p": return KeyEvent.KEYCODE_P;
            case "q": return KeyEvent.KEYCODE_Q; case "r": return KeyEvent.KEYCODE_R; case "s": return KeyEvent.KEYCODE_S; case "t": return KeyEvent.KEYCODE_T;
            case "u": return KeyEvent.KEYCODE_U; case "v": return KeyEvent.KEYCODE_V; case "w": return KeyEvent.KEYCODE_W; case "x": return KeyEvent.KEYCODE_X;
            case "y": return KeyEvent.KEYCODE_Y; case "z": return KeyEvent.KEYCODE_Z;
            case "0": return KeyEvent.KEYCODE_0; case "1": return KeyEvent.KEYCODE_1; case "2": return KeyEvent.KEYCODE_2; case "3": return KeyEvent.KEYCODE_3;
            case "4": return KeyEvent.KEYCODE_4; case "5": return KeyEvent.KEYCODE_5; case "6": return KeyEvent.KEYCODE_6; case "7": return KeyEvent.KEYCODE_7;
            case "8": return KeyEvent.KEYCODE_8; case "9": return KeyEvent.KEYCODE_9;
            default: return KeyEvent.KEYCODE_UNKNOWN;
        }
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
        showAlternatives(anchor, alternatives, alternatives);
    }

    private void showAlternatives(View anchor, String[] labels, String[] insertValues) {
        HorizontalScrollView scroll = new HorizontalScrollView(getContext());
        scroll.setHorizontalScrollBarEnabled(false);
        scroll.setFillViewport(true);
        LinearLayout menu = new LinearLayout(getContext());
        menu.setGravity(Gravity.CENTER);
        menu.setPadding(dp(6), dp(6), dp(6), dp(6));
        menu.setLayoutDirection(View.LAYOUT_DIRECTION_LTR);
        menu.setBackground(rounded(palette.surface, dp(8), false));
        scroll.addView(menu, new HorizontalScrollView.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.MATCH_PARENT));
        PopupWindow popup = new PopupWindow(scroll, LayoutParams.MATCH_PARENT, dp(64), true);
        for (int index = 0; index < labels.length; index++) {
            String label = labels[index];
            String insertValue = insertValues[index];
            TextView candidate = textButton(label, 21, palette.text, palette.key, dp(8));
            candidate.setContentDescription("اختيار " + label);
            candidate.setOnClickListener(v -> { service.commitText(insertValue); popup.dismiss(); });
            LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(dp(48), dp(50));
            params.setMargins(dp(2), 0, dp(2), 0);
            menu.addView(candidate, params);
        }
        popup.setOutsideTouchable(true);
        popup.setElevation(dp(10));
        popup.showAtLocation(this, Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL, 0, dp(70));
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
            TextView item = textButton(preview, 15, palette.text, palette.key, dp(9));
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
            TextView item = textButton(example, 17, palette.text, palette.key, dp(9));
            item.setOnClickListener(v -> { service.commitText(example); popup.dismiss(); });
            LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(45));
            params.setMargins(0, dp(2), 0, dp(2));
            list.addView(item, params);
        }
        popup.setElevation(dp(8));
        popup.showAtLocation(this, Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL, 0, dp(248));
    }

    private void showTranslationPopup() {
        if (!preferences.getBoolean("translation_enabled", false)) {
            showMessage("فعّل الترجمة من إعدادات الكيبورد أولًا");
            return;
        }
        String source = service.getSelectedTextOrCurrentWord();
        if (source.trim().isEmpty()) {
            showMessage("حدّد النص أو ضع المؤشر بعد الكلمة المراد ترجمتها");
            return;
        }
        boolean arabicToEnglish = !"en_ar".equals(preferences.getString("translation_direction", "ar_en"));
        TranslationEngine.Result result = TranslationEngine.translate(source, arabicToEnglish);
        LinearLayout panel = new LinearLayout(getContext());
        panel.setOrientation(VERTICAL);
        panel.setPadding(dp(11), dp(11), dp(11), dp(11));
        panel.setBackground(rounded(palette.surface, dp(12), false));
        TextView heading = textButton(arabicToEnglish ? "ترجمة عربية ← إنجليزية" : "ترجمة إنجليزية ← عربية", 15, palette.text, palette.surface, dp(6));
        heading.setTypeface(Typeface.DEFAULT_BOLD);
        panel.addView(heading, new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(35)));
        TextView original = textButton(source, 15, palette.muted, palette.key, dp(8));
        original.setGravity(Gravity.RIGHT | Gravity.CENTER_VERTICAL);
        panel.addView(original, new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(48)));
        TextView translated = textButton(result.value, 18, palette.text, palette.keySpecial, dp(8));
        translated.setGravity(Gravity.RIGHT | Gravity.CENTER_VERTICAL);
        panel.addView(translated, new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(54)));
        TextView note = textButton(result.knownTokens > 0 ? "ترجمة محلية مساعدة — راجع النتيجة قبل الإدراج" : "لا يوجد تطابق محلي كامل؛ سيبقى النص كما هو", 11, palette.muted, palette.surface, dp(6));
        panel.addView(note, new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(32)));
        TextView insert = textButton("إدراج الترجمة", 15, palette.text, palette.accent, dp(9));
        panel.addView(insert, new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(45)));
        PopupWindow popup = new PopupWindow(panel, dp(335), LayoutParams.WRAP_CONTENT, true);
        insert.setOnClickListener(v -> { service.replaceSelectedTextOrCurrentWord(source, result.value); popup.dismiss(); });
        popup.setElevation(dp(12));
        popup.showAtLocation(this, Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL, 0, dp(228));
    }

    private void showStickerPopup() {
        LinearLayout list = new LinearLayout(getContext());
        list.setOrientation(VERTICAL);
        list.setPadding(dp(8), dp(8), dp(8), dp(8));
        list.setBackground(rounded(palette.surface, dp(10), false));
        PopupWindow popup = new PopupWindow(list, dp(312), LayoutParams.WRAP_CONTENT, true);
        TextView title = textButton("ملصقات ريمو المدمجة", 14, palette.text, palette.surface, dp(8));
        title.setTypeface(Typeface.DEFAULT_BOLD);
        list.addView(title, new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(35)));
        LinearLayout row = new LinearLayout(getContext());
        row.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        for (String[] sticker : STICKERS) {
            ImageButton item = new ImageButton(getContext());
            item.setContentDescription(sticker[1]);
            item.setScaleType(ImageView.ScaleType.CENTER_INSIDE);
            int resource = getResources().getIdentifier(sticker[0], "drawable", getContext().getPackageName());
            if (resource != 0) item.setImageResource(resource);
            item.setBackground(rounded(palette.key, dp(10), true));
            item.setOnClickListener(v -> { service.commitText(sticker[1]); popup.dismiss(); });
            LinearLayout.LayoutParams itemParams = new LinearLayout.LayoutParams(0, dp(54), 1f);
            itemParams.setMargins(dp(2), 0, dp(2), 0);
            row.addView(item, itemParams);
        }
        list.addView(row, new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(56)));
        popup.setElevation(dp(10));
        popup.showAtLocation(this, Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL, 0, dp(248));
    }

    private void showEmojiExplorerPopup() {
        LinearLayout panel = new LinearLayout(getContext());
        panel.setOrientation(VERTICAL);
        panel.setPadding(dp(9), dp(9), dp(9), dp(9));
        panel.setBackground(rounded(palette.surface, dp(12), false));
        TextView heading = textButton("مكتبة Unicode — " + EmojiCatalog.all(getContext()).size() + " إيموجي", 14, palette.text, palette.surface, dp(8));
        heading.setTypeface(Typeface.DEFAULT_BOLD);
        panel.addView(heading, new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(34)));
        EditText search = new EditText(getContext());
        search.setSingleLine(true);
        search.setHint("ابحث بالإنجليزية: heart, face, moon…");
        search.setTextColor(palette.text);
        search.setHintTextColor(palette.muted);
        search.setTextSize(13);
        search.setBackground(rounded(palette.key, dp(8), true));
        search.setPadding(dp(11), 0, dp(11), 0);
        panel.addView(search, new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(42)));
        Button find = new Button(getContext());
        find.setText("بحث");
        find.setTextColor(palette.text);
        find.setTextSize(13);
        find.setBackground(rounded(palette.keySpecial, dp(8), false));
        panel.addView(find, new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(40)));
        GridView results = new GridView(getContext());
        results.setNumColumns(6);
        results.setGravity(Gravity.CENTER);
        results.setHorizontalSpacing(dp(3));
        results.setVerticalSpacing(dp(3));
        results.setStretchMode(GridView.STRETCH_COLUMN_WIDTH);
        results.setPadding(dp(2), dp(3), dp(2), dp(3));
        results.setVerticalScrollBarEnabled(true);
        results.setFastScrollEnabled(true);
        panel.addView(results, new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(280)));
        PopupWindow popup = new PopupWindow(panel, dp(350), dp(420), true);
        find.setOnClickListener(v -> renderEmojiSearchResults(results, EmojiCatalog.filter(getContext(), "", search.getText().toString()), popup));
        renderEmojiSearchResults(results, EmojiCatalog.all(getContext()), popup);
        popup.setElevation(dp(12));
        popup.showAtLocation(this, Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL, 0, dp(226));
    }

    private void renderEmojiSearchResults(GridView container, List<EmojiCatalog.Item> items, PopupWindow popup) {
        container.setAdapter(new EmojiGridAdapter(items));
        container.setOnItemClickListener((parent, view, position, id) -> {
            service.commitText(items.get(position).emoji);
            popup.dismiss();
        });
    }

    private void showMessage(String value) {
        android.widget.Toast.makeText(getContext(), value, android.widget.Toast.LENGTH_SHORT).show();
    }

    private TextView textButton(String value, int size, int foreground, int background, int radius) {
        TextView view = value.contains("\n") ? new KeyCap(getContext()) : new TextView(getContext());
        if (view instanceof KeyCap) {
            ((KeyCap) view).setKeyLabel(value);
            ((KeyCap) view).setSecondaryColor(palette.muted);
        } else view.setText(value);
        view.setTextSize(size);
        view.setTextColor(foreground);
        view.setGravity(Gravity.CENTER);
        view.setPadding(dp(3), 0, dp(3), 0);
        int alphaBackground = background == palette.key ? Color.argb(palette.keyAlpha, Color.red(background), Color.green(background), Color.blue(background)) : background;
        view.setBackground(rounded(alphaBackground, radius, background == palette.key));
        view.setClickable(true);
        return view;
    }

    private GradientDrawable rounded(int color, int radius, boolean lightEdge) {
        GradientDrawable shape = new GradientDrawable();
        shape.setColor(color);
        shape.setCornerRadius(lightEdge ? dp(palette.keyRadius) : radius);
        shape.setStroke(dp(1), lightEdge ? palette.keyStroke : Color.argb(50, 180, 190, 200));
        return shape;
    }

    private int dp(int value) { return (int) (value * getResources().getDisplayMetrics().density + 0.5f); }
}
