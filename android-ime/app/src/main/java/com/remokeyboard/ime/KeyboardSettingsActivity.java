package com.remokeyboard.ime;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup.LayoutParams;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

/** مركز إعدادات RTL أصلي، مستلهم من تنظيم لقطات الكيبورد المرجعية. */
public class KeyboardSettingsActivity extends Activity {
    private enum Panel { MAIN, LANGUAGES, PREFERENCES, DECORATION, TRANSLATION, APPEARANCE, WRITING, EMOJI, CLIPBOARD, SHORTCUTS, KEY_STYLE, SOUND, HEIGHT, BOTTOM_ROW, BACKUP, ABOUT }
    private static final int PICK_BACKGROUND_FROM_STUDIO = 3402;
    private SharedPreferences preferences;
    private Panel currentPanel = Panel.MAIN;
    private final int background = Color.rgb(30, 32, 34);
    private final int surface = Color.rgb(33, 35, 37);
    private final int divider = Color.rgb(66, 68, 70);
    private final int text = Color.rgb(244, 244, 246);
    private final int secondary = Color.rgb(191, 191, 196);
    private final int disabled = Color.rgb(113, 113, 118);
    private final int accent = Color.rgb(140, 202, 255);

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        preferences = getSharedPreferences("remo_keyboard", Context.MODE_PRIVATE);
        getWindow().setStatusBarColor(background);
        getWindow().setNavigationBarColor(Color.rgb(27, 22, 18));
        showPanel(Panel.MAIN);
    }

    @Override public void onBackPressed() {
        if (currentPanel != Panel.MAIN) showPanel(Panel.MAIN);
        else super.onBackPressed();
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != PICK_BACKGROUND_FROM_STUDIO || resultCode != RESULT_OK || data == null || data.getData() == null) return;
        Uri uri = data.getData();
        int flags = data.getFlags() & (Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
        try { getContentResolver().takePersistableUriPermission(uri, flags); } catch (SecurityException ignored) { }
        preferences.edit().putString("background_uri", uri.toString()).remove("background_asset").apply();
        Toast.makeText(this, "تم اختيار الخلفية من الاستوديو", Toast.LENGTH_SHORT).show();
        showPanel(Panel.APPEARANCE);
    }

    private void showPanel(Panel panel) {
        currentPanel = panel;
        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.setBackgroundColor(background);
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        root.setPadding(0, dp(18), 0, dp(28));
        root.setBackgroundColor(background);
        scroll.addView(root, new ScrollView.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT));
        if (panel == Panel.MAIN) renderMain(root); else renderDetail(root, panel);
        setContentView(scroll);
    }

    private void renderMain(LinearLayout root) {
        addHeader(root, "إعدادات ريموكيبورد مزخرف", false);
        addAction(root, "تفعيل ريموكيبورد", "فتح إعدادات لوحات مفاتيح أندرويد", () -> startActivity(new Intent(Settings.ACTION_INPUT_METHOD_SETTINGS)));
        addAction(root, "اختيار لوحة المفاتيح", "اختيار ريموكيبورد كلـوحة إدخال نشطة", () -> ((android.view.inputmethod.InputMethodManager) getSystemService(INPUT_METHOD_SERVICE)).showInputMethodPicker());
        addNavigation(root, "◎", "لغات الإدخال", "مرر إصبعك على مفتاح المسافة لتغيير اللغة", Panel.LANGUAGES);
        addNavigation(root, "☷", "التفضيلات", "إعدادات التفضيلات", Panel.PREFERENCES);
        addNavigation(root, "⌁", "الزخرفة والخطوط", "إعدادات الزخرفة والخطوط", Panel.DECORATION);
        addNavigation(root, "文", "الترجمة", "إعدادات الترجمة", Panel.TRANSLATION);
        addNavigation(root, "◉", "مظهر لوحة المفاتيح", "اختر مظهر المفاتيح أو أنشئ مظهرًا مخصصًا", Panel.APPEARANCE);
        addNavigation(root, "T", "الكتابة", "إعدادات الكتابة والاقتراحات", Panel.WRITING);
        addNavigation(root, "☺", "الإيموجي", "ستايل الإيموجي والملصقات", Panel.EMOJI);
        addNavigation(root, "▣", "إعدادات الحافظة", "التحكم في إعدادات الحافظة", Panel.CLIPBOARD);
        addNavigation(root, "◇", "إعدادات الاختصارات", "التحكم في الاختصارات", Panel.SHORTCUTS);
        addNavigation(root, "⌨", "ستايل المفاتيح", "ستايل الكمبيوتر الافتراضي", Panel.KEY_STYLE);
        addNavigation(root, "◖", "إعدادات الصوت والاهتزاز", "التحكم في أصوات المفاتيح والاهتزاز", Panel.SOUND);
        addNavigation(root, "▤", "ارتفاع الكيبورد وحجم الأحرف", "التحكم في ارتفاع الكيبورد وحجم الأحرف على المفاتيح", Panel.HEIGHT);
        addNavigation(root, "☰", "أزرار الصف السفلي", "إزالة الحافظة أو الإيموجي أو استبدالهما", Panel.BOTTOM_ROW);
        addNavigation(root, "▧", "النسخ الاحتياطي", "النسخ الاحتياطي للحافظة والاختصارات", Panel.BACKUP);
        addNavigation(root, "ⓘ", "حول التطبيق", "الإصدار، التحديث، المطور، وسياسة الخصوصية", Panel.ABOUT);
    }

    private void renderDetail(LinearLayout root, Panel panel) {
        String title = titleFor(panel);
        addHeader(root, title, true);
        if (panel == Panel.LANGUAGES) {
            addSection(root, "لغات الإدخال");
            addChoice(root, "العربية", "اللغة الأساسية", true);
            addChoice(root, "الإنجليزية", "التبديل من مفتاح المسافة", true);
            addChoice(root, "إضافة لغة أخرى", "تتوفر تخطيطات إضافية في التحديثات القادمة", false);
            addSection(root, "نظام الأرقام");
            addChoice(root, "١٢٣ عربية هندية", "النظام النشط", "arabic_indic".equals(preferences.getString("numerals", "arabic_indic")), () -> chooseNumerals("arabic_indic"));
            addChoice(root, "۱۲۳ شرقية", "الفارسية والأردية", "eastern".equals(preferences.getString("numerals", "arabic_indic")), () -> chooseNumerals("eastern"));
            addChoice(root, "123 لاتينية", "المفاتيح الرقمية العالمية", "latin".equals(preferences.getString("numerals", "arabic_indic")), () -> chooseNumerals("latin"));
        } else if (panel == Panel.PREFERENCES) {
            addSection(root, "التفضيلات");
            addToggle(root, "إظهار صف الاقتراحات", "اقتراح كلمات أثناء الكتابة", "smart_suggestions", true);
            addToggle(root, "تصحيح تلقائي", "تصحيح أخطاء بسيطة من القاموس المحلي", "auto_correct", false);
            addToggle(root, "إظهار الأرقام الصغيرة على المفاتيح", "كما في ستايل الكمبيوتر", "secondary_symbols", true);
            addAction(root, "إعادة ضبط التفضيلات", "استعادة الإعدادات الافتراضية للكتابة", () -> { preferences.edit().clear().apply(); Toast.makeText(this, "تمت استعادة الإعدادات", Toast.LENGTH_SHORT).show(); });
        } else if (panel == Panel.DECORATION) {
            addSection(root, "الزخرفة");
            addToggle(root, "تفعيل الزخرفة", "الزخرفة غير مفعلة", "decoration_enabled", false);
            addAction(root, "زخارف عربية", "1 - زخرفة الكتابة", () -> selectValue("arabic_style", "الزخارف العربية مفعلة"));
            addAction(root, "زخارف إنجليزية", "بدون زخرفة", () -> selectValue("english_style", "زخارف إنجليزية مفعلة"));
            addSection(root, "الخطوط");
            addAction(root, "خط لوحة المفاتيح", "افتراضي", () -> selectValue("keyboard_font", "تم اختيار الخط الافتراضي"));
            addAction(root, "حجم خط المفاتيح", "قياسي", () -> showPanel(Panel.HEIGHT));
        } else if (panel == Panel.TRANSLATION) {
            addToggle(root, "تفعيل الترجمة", "الترجمة غير مفعلة", "translation_enabled", false);
            addAction(root, "الترجمة من", "العربية", () -> selectValue("translation_from", "العربية"));
            addAction(root, "الترجمة إلى", "الإنجليزية", () -> selectValue("translation_to", "الإنجليزية"));
            addToggle(root, "الترجمة التلقائية", "تفعيل الترجمة التلقائية بعد نسخ النص", "auto_translate", false);
            addAction(root, "طريقة استخدام الترجمة", "اضغط زر الترجمة من شريط أدوات الكيبورد", () -> Toast.makeText(this, "انسخ النص ثم اضغط زر الترجمة في الكيبورد", Toast.LENGTH_LONG).show());
        } else if (panel == Panel.APPEARANCE) {
            addAppearance(root);
        } else if (panel == Panel.WRITING) {
            addSection(root, "الكتابة");
            addToggle(root, "اقتراح الكلمات", "يستخدم قاموسًا محليًا خفيفًا", "smart_suggestions", true);
            addToggle(root, "المد عند الضغط المطول على ت", "إظهار ـ و تـ و ـت", "taa_long_press", true);
            addToggle(root, "التشكيل عند الضغط المطول على ة", "إظهار الحركات العربية", "ta_marbuta_long_press", true);
            addToggle(root, "مسافة بعد الاقتراح", "إضافة مسافة عند اختيار كلمة مقترحة", "suggestion_space", true);
        } else if (panel == Panel.EMOJI) {
            addSection(root, "الإيموجي");
            addChoice(root, "ستايل الإيموجي الحديث", "😀 🥹 🫶 ✨", true);
            addChoice(root, "ستايل إيموجي بسيط", "🙂 ♥ ★", false);
            addAction(root, "صناعة ملصق", "أنشئ ملصقًا نصيًا من مركز ريموكيبورد", () -> Toast.makeText(this, "افتح مركز ريموكيبورد لإنشاء ملصق نصي", Toast.LENGTH_LONG).show());
        } else if (panel == Panel.CLIPBOARD) {
            addSection(root, "الحافظة");
            addToggle(root, "تفعيل حفظ الحافظة", "حفظ النصوص المنسوخة محليًا", "clipboard_enabled", true);
            addAction(root, "سعة الحافظة", preferences.getInt("clipboard_capacity", 30) + " عنصرًا", () -> { preferences.edit().putInt("clipboard_capacity", 50).apply(); Toast.makeText(this, "تم ضبط السعة على 50 عنصرًا", Toast.LENGTH_SHORT).show(); });
            addAction(root, "مسح الحافظة", "حذف كل النصوص غير المثبتة", () -> { preferences.edit().remove("clipboard_entries").apply(); Toast.makeText(this, "تم مسح الحافظة", Toast.LENGTH_SHORT).show(); });
        } else if (panel == Panel.SHORTCUTS) {
            addSection(root, "الاختصارات");
            addToggle(root, "تفعيل الاختصارات", "تحويل رموز قصيرة إلى نصوص محفوظة", "shortcuts_enabled", false);
            addAction(root, "إدارة الاختصارات", "أضف نصوصًا متكررة لاحقًا من مركز التطبيق", () -> Toast.makeText(this, "لا توجد اختصارات محفوظة", Toast.LENGTH_SHORT).show());
        } else if (panel == Panel.KEY_STYLE) {
            addSection(root, "ستايل المفاتيح");
            addChoice(root, "ستايل الكمبيوتر", "مفاتيح مستطيلة رمادية ورموز ثانوية", true);
            addChoice(root, "ستايل ناعم", "حواف أكثر استدارة", false);
            addAction(root, "تخصيص مساحة المفاتيح", "الافتراضي", () -> showPanel(Panel.HEIGHT));
        } else if (panel == Panel.SOUND) {
            addSection(root, "إعدادات الصوت والاهتزاز");
            addToggle(root, "اهتزاز المفاتيح", "اهتزاز خفيف عند الضغط", "vibration", true);
            addToggle(root, "صوت المفاتيح", "صوت نقر اختياري", "key_sound", false);
        } else if (panel == Panel.HEIGHT) {
            addSection(root, "ارتفاع الكيبورد");
            addChoice(root, "مدمج", "مساحة أكبر للتطبيق", "compact".equals(preferences.getString("height", "standard")), () -> chooseHeight("compact", 54));
            addChoice(root, "قياسي", "الموصى به", "standard".equals(preferences.getString("height", "standard")), () -> chooseHeight("standard", 61));
            addChoice(root, "مريح", "مفاتيح أعلى ولمس أسهل", "comfortable".equals(preferences.getString("height", "standard")), () -> chooseHeight("comfortable", 70));
            addSection(root, "حجم الأحرف");
            addChoice(root, "قياسي", "توازن بين الرموز والحروف", true);
            addChoice(root, "كبير", "وضوح أعلى", false);
        } else if (panel == Panel.BOTTOM_ROW) {
            addSection(root, "أزرار الصف السفلي");
            addToggle(root, "زر الحافظة", "إظهار رمز الحافظة بجوار المسافة", "bottom_clipboard", true);
            addToggle(root, "زر الإيموجي", "إظهار منتقي الإيموجي", "bottom_emoji", true);
            addToggle(root, "زر التسجيل الصوتي", "يظهر مع زر 123", "bottom_voice", true);
            addAction(root, "إعادة ترتيب الصف", "استعادة الترتيب الافتراضي", () -> Toast.makeText(this, "تم استعادة الصف السفلي", Toast.LENGTH_SHORT).show());
        } else if (panel == Panel.BACKUP) {
            addSection(root, "النسخ الاحتياطي");
            addAction(root, "تصدير الحافظة والاختصارات", "تجهيز نسخة محلية عند اكتمال ميزة التصدير", () -> Toast.makeText(this, "سيُضاف التصدير كملف في تحديث لاحق", Toast.LENGTH_LONG).show());
            addAction(root, "استيراد نسخة احتياطية", "استعادة بيانات محفوظة", () -> Toast.makeText(this, "لا توجد نسخة احتياطية محددة", Toast.LENGTH_SHORT).show());
        } else if (panel == Panel.ABOUT) {
            addSection(root, "حول ريموكيبورد");
            addAction(root, "إصدار التطبيق", "ريموكيبورد مزخرف 1.0.3", () -> {});
            addAction(root, "التحقق من التحديث", "فتح صفحة الإصدارات", () -> openExternalUrl("https://github.com/ma4alhzmi1-ai-pro/remo-player-1-0-23/releases"));
            addAction(root, "عن المطور", "محمد الحزمي", () -> openExternalUrl("https://t.me/moh_alymani1"));
            addAction(root, "سياسة الخصوصية", "خصوصية الحافظة والصوت والروابط", () -> Toast.makeText(this, "تظل بيانات الحافظة محلية على الجهاز", Toast.LENGTH_LONG).show());
        }
    }

    private String titleFor(Panel panel) {
        switch (panel) {
            case LANGUAGES: return "لغات الإدخال";
            case PREFERENCES: return "التفضيلات";
            case DECORATION: return "الزخرفة والخطوط";
            case TRANSLATION: return "إعدادات الترجمة";
            case APPEARANCE: return "مظهر لوحة المفاتيح";
            case WRITING: return "إعدادات الكتابة";
            case EMOJI: return "الإيموجي";
            case CLIPBOARD: return "إعدادات الحافظة";
            case SHORTCUTS: return "إعدادات الاختصارات";
            case KEY_STYLE: return "ستايل المفاتيح";
            case SOUND: return "إعدادات الصوت والاهتزاز";
            case HEIGHT: return "ارتفاع الكيبورد وحجم الأحرف";
            case BOTTOM_ROW: return "أزرار الصف السفلي";
            case BACKUP: return "النسخ الاحتياطي";
            default: return "حول التطبيق";
        }
    }

    private void addHeader(LinearLayout root, String title, boolean back) {
        LinearLayout header = new LinearLayout(this);
        header.setGravity(Gravity.CENTER_VERTICAL | Gravity.RIGHT);
        header.setPadding(dp(26), dp(12), dp(26), dp(18));
        header.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        TextView arrow = label(back ? "→" : "", 35, text);
        arrow.setGravity(Gravity.CENTER);
        arrow.setOnClickListener(v -> { if (back) showPanel(Panel.MAIN); });
        TextView heading = label(title, 29, text);
        heading.setTypeface(Typeface.create("sans", Typeface.NORMAL));
        heading.setGravity(Gravity.RIGHT | Gravity.CENTER_VERTICAL);
        header.addView(arrow, new LinearLayout.LayoutParams(dp(58), dp(52)));
        header.addView(heading, new LinearLayout.LayoutParams(0, dp(52), 1f));
        root.addView(header);
    }

    private void addNavigation(LinearLayout root, String icon, String title, String subtitle, Panel target) {
        LinearLayout item = itemRow(icon, title, subtitle, accent);
        item.setOnClickListener(v -> showPanel(target));
        root.addView(item, new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(107)));
        addDivider(root);
    }

    private void addSection(LinearLayout root, String value) {
        TextView heading = label(value, 17, secondary);
        heading.setGravity(Gravity.RIGHT);
        heading.setPadding(dp(30), dp(22), dp(30), dp(8));
        root.addView(heading, new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT));
    }

    private void addAction(LinearLayout root, String title, String subtitle, Runnable action) {
        LinearLayout item = itemRow("", title, subtitle, text);
        item.setPadding(dp(30), 0, dp(30), 0);
        item.setOnClickListener(v -> action.run());
        root.addView(item, new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(96)));
        addDivider(root);
    }

    private void addChoice(LinearLayout root, String title, String subtitle, boolean selected) {
        addChoice(root, title, subtitle, selected, () -> {});
    }

    private void addChoice(LinearLayout root, String title, String subtitle, boolean selected, Runnable action) {
        LinearLayout item = itemRow(selected ? "◉" : "○", title, subtitle, selected ? accent : disabled);
        item.setPadding(dp(30), 0, dp(30), 0);
        item.setOnClickListener(v -> action.run());
        root.addView(item, new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(84)));
        addDivider(root);
    }

    private void addToggle(LinearLayout root, String title, String subtitle, String key, boolean defaultValue) {
        LinearLayout row = new LinearLayout(this);
        row.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        row.setGravity(Gravity.CENTER_VERTICAL | Gravity.RIGHT);
        row.setPadding(dp(30), dp(8), dp(30), dp(8));
        LinearLayout copy = new LinearLayout(this);
        copy.setOrientation(LinearLayout.VERTICAL);
        copy.setGravity(Gravity.RIGHT);
        TextView name = label(title, 20, text);
        name.setGravity(Gravity.RIGHT);
        TextView description = label(subtitle, 16, preferences.getBoolean(key, defaultValue) ? secondary : disabled);
        description.setGravity(Gravity.RIGHT);
        copy.addView(name);
        copy.addView(description);
        CheckBox check = new CheckBox(this);
        check.setChecked(preferences.getBoolean(key, defaultValue));
        check.setButtonTintList(android.content.res.ColorStateList.valueOf(secondary));
        check.setOnCheckedChangeListener((button, isChecked) -> preferences.edit().putBoolean(key, isChecked).apply());
        row.addView(copy, new LinearLayout.LayoutParams(0, LayoutParams.WRAP_CONTENT, 1f));
        row.addView(check, new LinearLayout.LayoutParams(dp(55), dp(55)));
        root.addView(row, new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(116)));
        addDivider(root);
    }

    private LinearLayout itemRow(String icon, String title, String subtitle, int iconColor) {
        LinearLayout row = new LinearLayout(this);
        row.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        row.setGravity(Gravity.CENTER_VERTICAL | Gravity.RIGHT);
        row.setPadding(dp(30), dp(10), dp(30), dp(10));
        row.setBackgroundColor(surface);
        LinearLayout copy = new LinearLayout(this);
        copy.setOrientation(LinearLayout.VERTICAL);
        copy.setGravity(Gravity.RIGHT | Gravity.CENTER_VERTICAL);
        TextView name = label(title, 22, text);
        name.setGravity(Gravity.RIGHT);
        TextView description = label(subtitle, 16, secondary);
        description.setGravity(Gravity.RIGHT);
        description.setPadding(0, dp(3), 0, 0);
        copy.addView(name);
        copy.addView(description);
        if (!icon.isEmpty()) {
            TextView symbol = label(icon, 29, iconColor);
            symbol.setGravity(Gravity.CENTER);
            row.addView(symbol, new LinearLayout.LayoutParams(dp(58), LayoutParams.MATCH_PARENT));
        }
        row.addView(copy, new LinearLayout.LayoutParams(0, LayoutParams.WRAP_CONTENT, 1f));
        return row;
    }

    private void addDivider(LinearLayout root) {
        View line = new View(this);
        line.setBackgroundColor(divider);
        root.addView(line, new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(1)));
    }

    private void addAppearance(LinearLayout root) {
        LinearLayout tabs = new LinearLayout(this);
        tabs.setGravity(Gravity.CENTER);
        tabs.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        tabs.setPadding(dp(20), dp(7), dp(20), dp(0));
        String[] labels = {"الثيمات", "ثيماتي", "تخصيص"};
        for (String name : labels) {
            TextView tab = label(name, 18, "الثيمات".equals(name) ? accent : secondary);
            tab.setGravity(Gravity.CENTER);
            if ("الثيمات".equals(name)) tab.setBackground(underline(accent));
            tabs.addView(tab, new LinearLayout.LayoutParams(0, dp(45), 1f));
        }
        root.addView(tabs);
        addSection(root, "خلفيات نسائية");
        addThemeCard(root, "حرير وردي", "وردي ساتان ولمسة ذهبية", "rose", "remo_feminine_rose_silk", Color.rgb(68, 35, 55), Color.rgb(160, 103, 132));
        addThemeCard(root, "فراشات ليلكية", "ليلكي داكن وبريق ناعم", "rose", "remo_feminine_lilac_butterflies", Color.rgb(62, 40, 75), Color.rgb(136, 99, 157));
        addThemeCard(root, "زهر اللؤلؤ", "ورد فاتح وأناقة هادئة", "light", "remo_feminine_pearl_bloom", Color.rgb(242, 223, 228), Color.WHITE);
        addThemeCard(root, "رخام بنفسجي", "بنفسجي فاخر وعروق ذهبية", "rose", "remo_feminine_violet_marble", Color.rgb(54, 33, 68), Color.rgb(112, 79, 130));
        addSection(root, "خلفيات شبابية");
        addThemeCard(root, "شبكة نيون", "سيان وبنفسجي فوق جرافيت", "navy", "remo_masculine_neon_grid", Color.rgb(14, 24, 38), Color.rgb(57, 83, 108));
        addThemeCard(root, "فولاذ الجمر", "فولاذ أسود ووهج كهرماني", "navy", "remo_masculine_ember_steel", Color.rgb(24, 22, 21), Color.rgb(100, 75, 54));
        addThemeCard(root, "لهب أزرق", "كحلي داكن وتأثير تقني", "navy", "remo_masculine_blue_flame", Color.rgb(12, 24, 43), Color.rgb(48, 73, 108));
        addThemeCard(root, "كامو الغابة", "أخضر زيتوني وجرافيت", "navy", "remo_masculine_forest_camo", Color.rgb(29, 40, 30), Color.rgb(72, 90, 70));
        addSection(root, "خلفيات إسلامية");
        addThemeCard(root, "فوانيس رمضانية", "هلال وفوانيس ذهبية", "ramadan", "remo_islamic_lanterns", Color.rgb(16, 41, 36), Color.rgb(78, 89, 66));
        addThemeCard(root, "مسجد الغروب", "كحلي، هلال، ونجوم هادئة", "ramadan", "remo_islamic_mosque_dusk", Color.rgb(18, 27, 61), Color.rgb(61, 72, 106));
        addSection(root, "تخصيص الخلفية والألوان");
        addAction(root, "اختيار صورة من الاستوديو", "استخدم صورة من معرض الجهاز كخلفية للكيبورد", this::chooseBackgroundFromStudio);
        addAction(root, "إزالة صورة الخلفية", "العودة إلى الخلفية اللونية للثيم", () -> { preferences.edit().remove("background_uri").remove("background_asset").apply(); Toast.makeText(this, "تمت إزالة الخلفية", Toast.LENGTH_SHORT).show(); });
        addAction(root, "لوحات ألوان جاهزة", "ليلي، وردي، زمردي، أو أزرق تقني", this::showColorPresets);
        addAction(root, "لون الخلفية", currentColor("custom_background_color", "#101010"), () -> editColor("custom_background_color", "لون الخلفية", "#101010"));
        addAction(root, "لون المفاتيح", currentColor("custom_key_color", "#777777"), () -> editColor("custom_key_color", "لون المفاتيح", "#777777"));
        addAction(root, "لون النص", currentColor("custom_text_color", "#FFFFFF"), () -> editColor("custom_text_color", "لون النص", "#FFFFFF"));
        addAction(root, "لون التمييز", currentColor("custom_accent_color", "#8CCCFF"), () -> editColor("custom_accent_color", "لون التمييز", "#8CCCFF"));
    }

    private void addThemeCard(LinearLayout root, String title, String subtitle, String value, String asset, int base, int keyColor) {
        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.VERTICAL);
        card.setPadding(dp(10), dp(10), dp(10), dp(10));
        card.setBackground(round(surface, 0));
        LinearLayout preview = new LinearLayout(this);
        preview.setOrientation(LinearLayout.VERTICAL);
        preview.setPadding(dp(8), dp(8), dp(8), dp(8));
        int previewImage = getResources().getIdentifier(asset, "drawable", getPackageName());
        if (previewImage != 0) preview.setBackgroundResource(previewImage);
        else preview.setBackground(round(base, dp(10)));
        for (int row = 0; row < 3; row++) {
            LinearLayout keys = new LinearLayout(this);
            keys.setPadding(0, dp(2), 0, dp(2));
            for (int key = 0; key < 9; key++) {
                View block = new View(this);
                block.setBackground(round(keyColor, dp(3)));
                LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(0, dp(14), 1f);
                params.setMargins(dp(2), 0, dp(2), 0);
                keys.addView(block, params);
            }
            preview.addView(keys);
        }
        TextView label = label(title, 21, text);
        label.setGravity(Gravity.RIGHT);
        TextView detail = label(subtitle, 15, secondary);
        detail.setGravity(Gravity.RIGHT);
        card.addView(preview, new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(80)));
        card.addView(label, new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT));
        card.addView(detail, new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT));
        card.setOnClickListener(v -> selectTheme(value, asset, title));
        root.addView(card, new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, dp(145)));
        addDivider(root);
    }

    private GradientDrawable underline(int color) {
        GradientDrawable drawable = new GradientDrawable();
        drawable.setColor(Color.TRANSPARENT);
        drawable.setStroke(dp(0), Color.TRANSPARENT);
        drawable.setSize(1, dp(3));
        return drawable;
    }

    private GradientDrawable round(int color, int radius) {
        GradientDrawable shape = new GradientDrawable();
        shape.setColor(color);
        shape.setCornerRadius(radius);
        return shape;
    }

    private TextView label(String value, int size, int color) {
        TextView view = new TextView(this);
        view.setText(value);
        view.setTextSize(size);
        view.setTextColor(color);
        view.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        view.setIncludeFontPadding(true);
        return view;
    }

    private void selectValue(String key, String message) {
        preferences.edit().putString(key, message).apply();
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }

    private void chooseNumerals(String value) {
        preferences.edit().putString("numerals", value).apply();
        showPanel(Panel.LANGUAGES);
    }

    private void chooseHeight(String value, int height) {
        preferences.edit().putString("height", value).putInt("key_height", height).apply();
        showPanel(Panel.HEIGHT);
    }

    private void chooseBackgroundFromStudio() {
        Intent pick = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        pick.setType("image/*");
        pick.addCategory(Intent.CATEGORY_OPENABLE);
        pick.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
        startActivityForResult(pick, PICK_BACKGROUND_FROM_STUDIO);
    }

    private void selectTheme(String theme, String asset, String title) {
        preferences.edit().putString("theme", theme).putString("background_asset", asset).remove("background_uri").apply();
        Toast.makeText(this, "تم اختيار ثيم " + title, Toast.LENGTH_SHORT).show();
    }

    private String currentColor(String key, String fallback) {
        return preferences.getString(key, fallback);
    }

    private void editColor(String key, String title, String fallback) {
        EditText input = new EditText(this);
        input.setSingleLine(true);
        input.setHint("مثال: #5CC8FF");
        input.setText(currentColor(key, fallback));
        input.setTextColor(text);
        input.setHintTextColor(secondary);
        input.setSelectAllOnFocus(true);
        input.setPadding(dp(24), dp(8), dp(24), dp(8));
        new AlertDialog.Builder(this)
            .setTitle(title)
            .setMessage("أدخل رمز اللون بصيغة HEX مثل #5CC8FF")
            .setView(input)
            .setNegativeButton("إلغاء", null)
            .setPositiveButton("تطبيق", (dialog, which) -> {
                String value = input.getText().toString().trim();
                try {
                    Color.parseColor(value);
                    preferences.edit()
                        .putString("theme", "custom")
                        .putString(key, value)
                        .putString("custom_surface_color", currentColor("custom_surface_color", "#161616"))
                        .putString("custom_special_key_color", currentColor("custom_special_key_color", "#343434"))
                        .apply();
                    Toast.makeText(this, "تم تطبيق اللون على لوحة المفاتيح", Toast.LENGTH_SHORT).show();
                } catch (IllegalArgumentException error) {
                    Toast.makeText(this, "صيغة اللون غير صحيحة", Toast.LENGTH_SHORT).show();
                }
            }).show();
    }

    private void showColorPresets() {
        String[] names = {"ليلي فضي", "وردي أنيق", "زمردي ذهبي", "أزرق تقني"};
        new AlertDialog.Builder(this).setTitle("لوحات ألوان جاهزة").setItems(names, (dialog, index) -> {
            String[][] palettes = {
                {"#0C1018", "#777B85", "#FFFFFF", "#9BCBFF", "#202633", "#333B4A"},
                {"#351A30", "#B56C92", "#FFF7FB", "#F9ACD4", "#4A283F", "#6D3A59"},
                {"#102A27", "#53766B", "#FCF6DF", "#D5AE55", "#1B3A35", "#344C46"},
                {"#0E1B34", "#365B8A", "#F4F8FF", "#5CC8FF", "#142A4C", "#28446B"}
            };
            String[] colors = palettes[index];
            preferences.edit()
                .putString("theme", "custom")
                .putString("custom_background_color", colors[0])
                .putString("custom_key_color", colors[1])
                .putString("custom_text_color", colors[2])
                .putString("custom_accent_color", colors[3])
                .putString("custom_surface_color", colors[4])
                .putString("custom_special_key_color", colors[5])
                .apply();
            Toast.makeText(this, "تم تطبيق " + names[index], Toast.LENGTH_SHORT).show();
        }).show();
    }

    private void openExternalUrl(String value) {
        startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(value)));
    }

    private int dp(int value) { return (int) (value * getResources().getDisplayMetrics().density + 0.5f); }
}
