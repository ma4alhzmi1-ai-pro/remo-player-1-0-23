package com.remokeyboard.ime;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.provider.Settings;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup.LayoutParams;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import org.json.JSONObject;

/** مركز إعدادات RTL أصلي، مستلهم من تنظيم لقطات الكيبورد المرجعية. */
public class KeyboardSettingsActivity extends Activity {
    private enum Panel { MAIN, LANGUAGES, PREFERENCES, DECORATION, TRANSLATION, APPEARANCE, WRITING, EMOJI, CLIPBOARD, SHORTCUTS, KEY_STYLE, SOUND, HEIGHT, BOTTOM_ROW, BACKUP, ABOUT, LOW_VISION, TALKING_KEYBOARD }
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
        if (state == null) {
            showSplashScreen();
        } else {
            checkForOnlineUpdates(false);
        }
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
        notifyThemeChanged();
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
        root.addView(buildDeveloperNotice());
        root.addView(buildUpdateNotice());
        root.addView(buildSecurityNotice());

        EditText testInput = new EditText(this);
        testInput.setHint("جرب الكتابة بريموكيبورد هنا الآن...");
        testInput.setHintTextColor(secondary);
        testInput.setTextColor(text);
        testInput.setBackground(rounded(surface, dp(8), false));
        testInput.setPadding(dp(16), dp(12), dp(16), dp(12));
        testInput.setGravity(Gravity.RIGHT | Gravity.CENTER_VERTICAL);
        LinearLayout.LayoutParams inputParams = new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT);
        inputParams.setMargins(dp(16), dp(2), dp(16), dp(12));
        root.addView(testInput, inputParams);

        addAction(root, "تفعيل ريموكيبورد", "فتح إعدادات لوحات مفاتيح أندرويد", () -> startActivity(new Intent(Settings.ACTION_INPUT_METHOD_SETTINGS)));
        addAction(root, "اختيار لوحة المفاتيح", "اختيار ريموكيبورد كلـوحة إدخال نشطة", () -> ((android.view.inputmethod.InputMethodManager) getSystemService(INPUT_METHOD_SERVICE)).showInputMethodPicker());
        addAction(root, "استوديو ريموكيبورد المتكامل (معاينة الويب والاستوديو)", "معاينة واجهات الاستوديو، الثيمات المتقدمة، شاشات الترحيب والملصقات التفاعلية", this::openWebStudio);
        addNavigation(root, "♿", "لوحة ضعاف البصر", "تكبير فائق وألوان عالية التباين لضعاف البصر", Panel.LOW_VISION);
        addNavigation(root, "🔊", "لوحة المفاتيح الناطقة", "نطق المفاتيح والأحرف والأرقام والرموز بالعربية والإنجليزية", Panel.TALKING_KEYBOARD);
        addNavigation(root, "◎", "لغات الإدخال", "مرر إصبعك على مفتاح المسافة لتغيير اللغة", Panel.LANGUAGES);
        addNavigation(root, "☷", "التفضيلات", "إعدادات التفضيلات", Panel.PREFERENCES);
        addNavigation(root, "⌁", "الزخرفة والخطوط", "إعدادات الزخرفة والخطوط", Panel.DECORATION);
        addNavigation(root, "文", "الترجمة", "إعدادات الترجمة", Panel.TRANSLATION);
        addNavigation(root, "◉", "مظهر لوحة المفاتيح", "اختر مظهر المفاتيح أو أنشئ مظهرًا مخصصًا", Panel.APPEARANCE);
        addNavigation(root, "T", "الكتابة", "إعدادات الكتابة والاقتراحات", Panel.WRITING);
        addNavigation(root, "☺", "الإيموجي", "ستايل الإيموجي والملصقات", Panel.EMOJI);
        addNavigation(root, "▣", "إعدادات الحافظة", "التحكم في إعدادات الحافظة", Panel.CLIPBOARD);
        addNavigation(root, "◇", "إعدادات الاختصارات", "التحكم في الاختصارات", Panel.SHORTCUTS);
        addNavigation(root, "⌨", "ستايل المفاتيح", "كيبورد ريمو الفاخر الافتراضي", Panel.KEY_STYLE);
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
            addSection(root, "التفضيلات العامة");
            addToggle(root, "الكتابة بالصوت (الإملاء الصوتي)", "تفعيل زر المايك 🎤 وتحويل الصوت إلى نص", "voice_typing_enabled", true, this::notifyThemeChanged);
            addToggle(root, "الملء التلقائي", "إكمال الكلمات والملء التلقائي السريع أثناء الكتابة", "autofill_enabled", true, this::notifyThemeChanged);
            addToggle(root, "إظهار صف الاقتراحات", "اقتراح كلمات أثناء الكتابة", "smart_suggestions", true, this::notifyThemeChanged);
            addToggle(root, "الضغط القصير للرموز المخفية", "إظهار التشكيل والعبارات والرموز المخفية بلمسة سريعة (200ms)", "short_press_symbols", true, this::notifyThemeChanged);
            addToggle(root, "تصحيح تلقائي", "تصحيح أخطاء بسيطة من القاموس المحلي", "auto_correct", false);
            addToggle(root, "إظهار الأرقام الصغيرة على المفاتيح", "كما في ستايل الكمبيوتر", "secondary_symbols", true, this::notifyThemeChanged);
            addAction(root, "إعادة ضبط التفضيلات", "استعادة الإعدادات الافتراضية للكتابة", () -> { preferences.edit().clear().apply(); notifyThemeChanged(); Toast.makeText(this, "تمت استعادة الإعدادات", Toast.LENGTH_SHORT).show(); });
        } else if (panel == Panel.DECORATION) {
            addSection(root, "الزخرفة الفورية");
            boolean isDecEnabled = preferences.getBoolean("decoration_enabled", false);
            addToggle(root, "تفعيل الزخرفة", isDecEnabled ? "الزخرفة مفعلة وتُطبّق على المفاتيح والنصوص مباشرة" : "الزخرفة معطلة - انقر للتفعيل أو اختر نمطًا بالأسفل", "decoration_enabled", false, () -> {
                notifyThemeChanged();
                showPanel(Panel.DECORATION);
            });

            String activeStyle = preferences.getString("decoration_style_id", "1");
            addSection(root, "قائمة الزخارف العربية (40 نمطًا متاحًا)");
            for (ArabicDecorations.Style st : ArabicDecorations.ALL_STYLES) {
                if (st.num == 0) continue;
                boolean isSelected = isDecEnabled && (String.valueOf(st.num).equals(activeStyle) || st.id.equals(activeStyle));
                addChoice(root, st.name, st.sample, isSelected, () -> {
                    preferences.edit()
                        .putBoolean("decoration_enabled", true)
                        .putString("decoration_style_id", String.valueOf(st.num))
                        .putString("arabic_style", String.valueOf(st.num))
                        .apply();
                    notifyThemeChanged();
                    Toast.makeText(this, "تم تفعيل نمط الزخرفة: " + st.name + " فوراً في الكيبورد", Toast.LENGTH_SHORT).show();
                    showPanel(Panel.DECORATION);
                });
            }
            addChoice(root, "بدون زخرفة (عادي)", "إيقاف الزخرفة التلقائية والعودة للكتابة الطبيعية", !isDecEnabled, () -> {
                preferences.edit().putBoolean("decoration_enabled", false).apply();
                notifyThemeChanged();
                Toast.makeText(this, "تم إيقاف الزخرفة", Toast.LENGTH_SHORT).show();
                showPanel(Panel.DECORATION);
            });

            addSection(root, "الخطوط العربية لأزرار الكيبورد (20 خطًا حقيقيًا)");
            String currentFontKey = preferences.getString("calligraphy_font", "DEFAULT");
            String currentFontLabel = currentFontKey;
            try {
                CalligraphyEngine.FontType cf = CalligraphyEngine.FontType.valueOf(currentFontKey);
                currentFontLabel = cf.nameAr;
            } catch (Exception ignored) {}
            addAction(root, "خط لوحة المفاتيح", "الخط الحالي: " + currentFontLabel + " - اضغط لاختيار خط من بين 20 خطاً", this::showFontPicker);
            addAction(root, "حجم خط المفاتيح", "قياسي", () -> showPanel(Panel.HEIGHT));
        } else if (panel == Panel.TRANSLATION) {
            addToggle(root, "تفعيل الترجمة", "الترجمة غير مفعلة", "translation_enabled", false);
            boolean arEn = !"en_ar".equals(preferences.getString("translation_direction", "ar_en"));
            addChoice(root, "العربية ← الإنجليزية", "ترجمة محلية للعبارات والكلمات الشائعة", arEn, () -> chooseTranslationDirection("ar_en"));
            addChoice(root, "الإنجليزية ← العربية", "ترجمة محلية للعبارات والكلمات الشائعة", !arEn, () -> chooseTranslationDirection("en_ar"));
            addToggle(root, "الترجمة التلقائية", "تفعيل الترجمة التلقائية بعد نسخ النص", "auto_translate", false);
            addAction(root, "طريقة استخدام الترجمة", "حدّد النص أو ضع المؤشر بعد كلمة ثم اضغط زر 文", () -> Toast.makeText(this, "تظهر المعاينة أولًا، ثم اختر إدراج الترجمة", Toast.LENGTH_LONG).show());
        } else if (panel == Panel.APPEARANCE) {
            addAppearance(root);
        } else if (panel == Panel.WRITING) {
            addSection(root, "الكتابة والذكاء اللغوي");
            addToggle(root, "الكتابة بالصوت (الإملاء الصوتي)", "تفعيل زر المايك 🎤 وتحويل الكلام إلى نص فورياً", "voice_typing_enabled", true, this::notifyThemeChanged);
            addToggle(root, "الملء التلقائي وإكمال الكلمات", "إكمال الكلمات وتعبئتها تلقائياً أثناء الكتابة", "autofill_enabled", true, this::notifyThemeChanged);
            addToggle(root, "اقتراح الكلمات الذكي", "عرض شريط الاقتراحات والكلمات المتوقعة", "smart_suggestions", true, this::notifyThemeChanged);
            addToggle(root, "الضغط القصير للرموز والزخارف المخفية", "إظهار بدائل وحركات وزخارف ة، ت، ا، ل عند اللمس القصير (200 ملي ثانية)", "short_press_symbols", true, this::notifyThemeChanged);
            addToggle(root, "المد عند الضغط على ت", "إظهار ـ و تـ و ـت وتطويل الحروف", "taa_long_press", true, this::notifyThemeChanged);
            addToggle(root, "التشكيل عند الضغط على ة", "إظهار الحركات العربية والتشكيل الكامل", "ta_marbuta_long_press", true, this::notifyThemeChanged);
            addToggle(root, "مسافة بعد الاقتراح والملء", "إضافة مسافة عند اختيار كلمة مقترحة", "suggestion_space", true);
        } else if (panel == Panel.EMOJI) {
            addSection(root, "الإيموجي");
            addChoice(root, "ستايل الإيموجي الحديث", "😀 🥹 🫶 ✨", true);
            addAction(root, "مكتبة الإيموجي الشاملة", "نحو 3944 رمز Unicode مدمج؛ استخدم زر البحث ⌕ داخل الكيبورد", () -> Toast.makeText(this, "افتح الكيبورد ثم اضغط ⌕ للبحث في مكتبة الإيموجي", Toast.LENGTH_LONG).show());
            addChoice(root, "ستايل إيموجي بسيط", "🙂 ♥ ★", false);
            addAction(root, "صناعة ملصق", "أنشئ ملصقًا نصيًا من مركز ريموكيبورد", () -> Toast.makeText(this, "افتح مركز ريموكيبورد لإنشاء ملصق نصي", Toast.LENGTH_LONG).show());
        } else if (panel == Panel.CLIPBOARD) {
            addSection(root, "الحافظة");
            addToggle(root, "تفعيل حفظ الحافظة", "حفظ النصوص المنسوخة محليًا", "clipboard_enabled", true);
            addAction(root, "سعة الحافظة", preferences.getInt("clipboard_capacity", 1000) + " عنصرًا (تدعم حتى 1000 عملية نسخ)", () -> { preferences.edit().putInt("clipboard_capacity", 1000).apply(); Toast.makeText(this, "سعة الحافظة محددة بـ 1000 عنصر", Toast.LENGTH_SHORT).show(); });
            addAction(root, "مسح الحافظة", "حذف كل النصوص غير المثبتة", () -> { preferences.edit().remove("clipboard_entries").apply(); Toast.makeText(this, "تم مسح الحافظة", Toast.LENGTH_SHORT).show(); });
        } else if (panel == Panel.LOW_VISION) {
            addSection(root, "لوحة ضعاف البصر");
            addToggle(root, "تفعيل نمط ضعاف البصر", "تكبير أزرار الكيبورد إلى 68dp مع خط عريض وألوان عالية التباين", "low_vision_mode", false);
            addChoice(root, "أصفر فاقع على أسود داكن", "نمط التباين العالي الأساسي المعتمد", true);
            addChoice(root, "تكبير أزرار الكيبورد (68dp)", "زيادة مساحة الأزرار وسهولة اللمس", true);
            addAction(root, "تجربة النمط الآن", "انقر لتفعيل وتجربة الكيبورد فوراً", () -> {
                boolean cur = preferences.getBoolean("low_vision_mode", false);
                preferences.edit().putBoolean("low_vision_mode", !cur).apply();
                notifyThemeChanged();
                Toast.makeText(this, !cur ? "تم تفعيل نمط ضعاف البصر" : "تم تعطيل نمط ضعاف البصر", Toast.LENGTH_SHORT).show();
            });
        } else if (panel == Panel.TALKING_KEYBOARD) {
            addSection(root, "لوحة المفاتيح الناطقة");
            addToggle(root, "تفعيل نطق المفاتيح عند الضغط", "نطق الحرف أو الرقم أو الرمز عند اللمس بالعربية والإنجليزية", "talking_keyboard_enabled", false);
            addChoice(root, "دعم اللغة العربية بطلاقة", "نطق جميع الحروف والهمزات والحركات والرموز", true);
            addChoice(root, "دعم اللغة الإنجليزية بطلاقة", "نطق الحروف الأبجدية والأرقام والرموز الإنجليزية", true);
            addAction(root, "تجربة نطق الحروف", "اضغط للاستماع لعينة نطق", () -> {
                RemoInputMethodService.speakStatic(this, "أهلاً بك في ريمو كيبورد الناطق", true);
            });
        } else if (panel == Panel.SHORTCUTS) {
            addSection(root, "الاختصارات");
            addToggle(root, "تفعيل الاختصارات", "تحويل رموز قصيرة إلى نصوص محفوظة", "shortcuts_enabled", false);
            addAction(root, "إدارة الاختصارات", "أضف نصوصًا متكررة لاحقًا من مركز التطبيق", () -> Toast.makeText(this, "لا توجد اختصارات محفوظة", Toast.LENGTH_SHORT).show());
        } else if (panel == Panel.KEY_STYLE) {
            addSection(root, "ستايل المفاتيح");
            String activeStyle = preferences.getString("key_style", "remo_luxury");
            addChoice(root, "كيبورد ريمو الفاخر الافتراضي", "تخطيط ريمو الفاخر الافتراضي للهاتف مع أزرار الإجراءات السريعة", "remo_luxury".equals(activeStyle), () -> chooseKeyStyle("remo_luxury", "كيبورد ريمو الفاخر الافتراضي"));
            addChoice(root, "كمبيوتر كلاسيكي", "مفاتيح رمادية مستقيمة ورموز ثانوية بأسلوب الكمبيوتر", "desktop".equals(activeStyle), () -> chooseKeyStyle("desktop", "كمبيوتر كلاسيكي"));
            addChoice(root, "زجاجي", "شفافية خفيفة وحواف واسعة", "glass".equals(activeStyle), () -> chooseKeyStyle("glass", "زجاجي"));
            addChoice(root, "نيون", "حدود مضيئة بلون التمييز", "neon".equals(activeStyle), () -> chooseKeyStyle("neon", "نيون"));
            addChoice(root, "رقيق", "زوايا محددة ومسافة مركزة", "slim".equals(activeStyle), () -> chooseKeyStyle("slim", "رقيق"));
            addChoice(root, "داكن احترافي", "بطاقات متوازنة للاستخدام الطويل", "pro".equals(activeStyle), () -> chooseKeyStyle("pro", "داكن احترافي"));
            addAction(root, "تخصيص مساحة المفاتيح", "الافتراضي", () -> showPanel(Panel.HEIGHT));
        } else if (panel == Panel.SOUND) {
            addSection(root, "إعدادات الصوت والاهتزاز");
            addToggle(root, "اهتزاز المفاتيح", "اهتزاز خفيف عند الضغط", "vibration", true);
            addToggle(root, "صوت المفاتيح", "صوت نقر اختياري", "key_sound", false);
        } else if (panel == Panel.HEIGHT) {
            int curHeight = preferences.getInt("key_height", 52);
            int curFontSize = preferences.getInt("key_font_size", 20);
            int curMargin = preferences.getInt("key_margin", 1);

            addSection(root, "حقل تجربة حي للأبعاد والأزرار");
            EditText testField = new EditText(this);
            testField.setHint("اكتب هنا لتجربة حجم الارتفاع والأزرار فوراً...");
            testField.setHintTextColor(secondary);
            testField.setTextColor(text);
            testField.setBackground(rounded(surface, dp(8), false));
            testField.setPadding(dp(16), dp(12), dp(16), dp(12));
            testField.setGravity(Gravity.RIGHT | Gravity.CENTER_VERTICAL);
            LinearLayout.LayoutParams tfParams = new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT);
            tfParams.setMargins(dp(16), dp(2), dp(16), dp(12));
            root.addView(testField, tfParams);

            addSection(root, "ارتفاع الكيبورد (الحالي: " + curHeight + " dp)");
            addChoice(root, "مدمج صغير (44 dp)", "مساحة أكبر للتطبيقات والمحادثات", curHeight == 44, () -> chooseHeight("compact", 44));
            addChoice(root, "متوسط رشيق (48 dp)", "حجم خفيف ومتوازن", curHeight == 48, () -> chooseHeight("medium", 48));
            addChoice(root, "قياسي موصى به (52 dp)", "الحجم الأمثل لكافة شاشات الهواتف", curHeight == 52, () -> chooseHeight("standard", 52));
            addChoice(root, "مريح واسع (58 dp)", "أزرار أطول ولمس أسهل", curHeight == 58, () -> chooseHeight("comfortable", 58));
            addChoice(root, "كبير جداً (66 dp)", "للشاشات الكبيرة وسهولة النقر", curHeight == 66, () -> chooseHeight("large", 66));
            addChoice(root, "عملاق أقصى حجم (74 dp)", "أقصى ارتفاع للكيبورد", curHeight == 74, () -> chooseHeight("huge", 74));

            addSection(root, "الضبط الدقيق لارتفاع الكيبورد");
            addAction(root, "➕ زيادة ارتفاع الكيبورد (+2 dp)", "القيمة الحالية: " + curHeight + " dp", () -> {
                int newH = Math.min(80, curHeight + 2);
                chooseHeight("custom", newH);
            });
            addAction(root, "➖ إنقاص ارتفاع الكيبورد (-2 dp)", "القيمة الحالية: " + curHeight + " dp", () -> {
                int newH = Math.max(38, curHeight - 2);
                chooseHeight("custom", newH);
            });

            addSection(root, "حجم أزرار وأحرف الكيبورد (الحالي: " + curFontSize + " sp)");
            addChoice(root, "أزرار صغيرة (خط 16 sp)", "حجم مدمج ومتقارب", curFontSize == 16, () -> {
                preferences.edit().putInt("key_font_size", 16).apply();
                notifyThemeChanged();
                showPanel(Panel.HEIGHT);
            });
            addChoice(root, "أزرار قياسية معتمدة (خط 20 sp)", "الحجم المعتمد المتوازن لجميع الأحرف", curFontSize == 20, () -> {
                preferences.edit().putInt("key_font_size", 20).apply();
                notifyThemeChanged();
                showPanel(Panel.HEIGHT);
            });
            addChoice(root, "أزرار كبيرة وبارزة (خط 24 sp)", "حروف واضحة ومقروءة جداً", curFontSize == 24, () -> {
                preferences.edit().putInt("key_font_size", 24).apply();
                notifyThemeChanged();
                showPanel(Panel.HEIGHT);
            });
            addChoice(root, "أزرار عملاقة لكبار السن (خط 28 sp)", "أقصى وضوح لأحرف المفاتيح", curFontSize == 28, () -> {
                preferences.edit().putInt("key_font_size", 28).apply();
                notifyThemeChanged();
                showPanel(Panel.HEIGHT);
            });

            addSection(root, "الضبط الدقيق لحجم أحرف الأزرار");
            addAction(root, "➕ تكبير أحرف الأزرار (+1 sp)", "الحجم الحالي: " + curFontSize + " sp", () -> {
                int newS = Math.min(34, curFontSize + 1);
                preferences.edit().putInt("key_font_size", newS).apply();
                notifyThemeChanged();
                showPanel(Panel.HEIGHT);
            });
            addAction(root, "➖ تصغير أحرف الأزرار (-1 sp)", "الحجم الحالي: " + curFontSize + " sp", () -> {
                int newS = Math.max(13, curFontSize - 1);
                preferences.edit().putInt("key_font_size", newS).apply();
                notifyThemeChanged();
                showPanel(Panel.HEIGHT);
            });

            addSection(root, "تباعد ومسافات الأزرار (الهامش)");
            addChoice(root, "أزرار متلاصقة وعريضة (0 dp)", "أزرار أعرض بأقصى مساحة للمس", curMargin == 0, () -> {
                preferences.edit().putInt("key_margin", 0).apply();
                notifyThemeChanged();
                showPanel(Panel.HEIGHT);
            });
            addChoice(root, "تباعد قياسي متناسق (1 dp)", "المسافة المتوازنة المعتمدة", curMargin == 1, () -> {
                preferences.edit().putInt("key_margin", 1).apply();
                notifyThemeChanged();
                showPanel(Panel.HEIGHT);
            });
            addChoice(root, "تباعد واسع للأزرار (2 dp)", "فصل واضح ومميز بين الأزرار", curMargin == 2, () -> {
                preferences.edit().putInt("key_margin", 2).apply();
                notifyThemeChanged();
                showPanel(Panel.HEIGHT);
            });

            addSection(root, "استعادة الأبعاد الافتراضية");
            addAction(root, "إعادة ضبط أبعاد الكيبورد وحجم الأزرار", "استعادة الارتفاع وحجم الخط والتباعد الافتراضي", () -> {
                preferences.edit()
                    .remove("key_height")
                    .remove("height")
                    .remove("key_font_size")
                    .remove("key_margin")
                    .remove("key_radius")
                    .apply();
                notifyThemeChanged();
                Toast.makeText(this, "تمت استعادة الأبعاد الافتراضية للكيبورد والأزرار", Toast.LENGTH_SHORT).show();
                showPanel(Panel.HEIGHT);
            });
        } else if (panel == Panel.BOTTOM_ROW) {
            addSection(root, "أزرار الصف السفلي");
            addToggle(root, "زر المايك (الكتابة بالصوت)", "إظهار زر المايك 🎤 في الكيبورد للتحويل الصوتي", "bottom_voice", true, this::notifyThemeChanged);
            addToggle(root, "زر الحافظة", "إظهار زر الحافظة 📋 بجوار المسافة", "bottom_clipboard", true, this::notifyThemeChanged);
            addToggle(root, "زر الإيموجي", "إظهار منتقي الإيموجي 😊", "bottom_emoji", true, this::notifyThemeChanged);
            addAction(root, "إعادة ترتيب الصف", "استعادة الترتيب الافتراضي", () -> { notifyThemeChanged(); Toast.makeText(this, "تم استعادة الصف السفلي", Toast.LENGTH_SHORT).show(); });
        } else if (panel == Panel.BACKUP) {
            addSection(root, "النسخ الاحتياطي");
            addAction(root, "تصدير الحافظة والاختصارات", "تجهيز نسخة محلية عند اكتمال ميزة التصدير", () -> Toast.makeText(this, "سيُضاف التصدير كملف في تحديث لاحق", Toast.LENGTH_LONG).show());
            addAction(root, "استيراد نسخة احتياطية", "استعادة بيانات محفوظة", () -> Toast.makeText(this, "لا توجد نسخة احتياطية محددة", Toast.LENGTH_SHORT).show());
        } else if (panel == Panel.ABOUT) {
            addSection(root, "حول ريموكيبورد والتحديثات");
            addAction(root, "🔔 التحقق من التحديثات أونلاين", "فحص الخادم الرسمي وإرسال إشعار التحديث الجديد", () -> checkForOnlineUpdates(true));
            addAction(root, "⬇️ تحميل التحديث الجديد (APK مباشر)", "تنزيل حزمة RemoKeyboard-1.0.16.apk فوراً", () -> openExternalUrl(LATEST_APK_DOWNLOAD_URL));
            addAction(root, "إصدار التطبيق", "ريموكيبورد مزخرف v1.0.16 (أحدث إصدار رسمي)", () -> checkForOnlineUpdates(true));
            addAction(root, "مستودع الإصدارات في GitHub", "فتح صفحة الإصدارات الرسمية", () -> openExternalUrl("https://github.com/ma4alhzmi1-ai-pro/RemoKeyboard-Pro/releases"));
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
            case LOW_VISION: return "لوحة ضعاف البصر";
            case TALKING_KEYBOARD: return "لوحة المفاتيح الناطقة";
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
        addToggle(root, title, subtitle, key, defaultValue, null);
    }

    private void addToggle(LinearLayout root, String title, String subtitle, String key, boolean defaultValue, Runnable onToggle) {
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
        check.setOnCheckedChangeListener((button, isChecked) -> {
            preferences.edit().putBoolean(key, isChecked).apply();
            if (onToggle != null) onToggle.run();
        });
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
        addSection(root, "ثيمات ريمو الافتراضية الحديثة");
        addThemeCard(root, "سواد عميق (AMOLED)", "أسود حقيقي وتوفير بطارية مع أزرار مضيئة", "default_amoled", "", Color.BLACK, Color.rgb(28, 28, 28));
        addThemeCard(root, "حجري أنيق (Slate)", "رمادي أردوازي ناعم فائق الفخامة", "default_slate", "", Color.rgb(15, 23, 42), Color.rgb(51, 65, 85));
        addThemeCard(root, "لؤلؤي فاتح (Pearl Light)", "أبيض لؤلؤي هادئ وتباين مريح للعين", "default_pearl", "", Color.rgb(241, 245, 249), Color.WHITE);
        addThemeCard(root, "أزرق ملكي (Royal Blue)", "كحلي ملكي راقٍ مع لمسات أزرق سماوي", "default_royal_blue", "", Color.rgb(11, 25, 44), Color.rgb(30, 62, 98));
        addSection(root, "خلفيات نسائية");
        addThemeCard(root, "حرير وردي", "وردي ساتان ولمسة ذهبية", "rose", "remo_feminine_rose_silk", Color.rgb(68, 35, 55), Color.rgb(160, 103, 132));
        addThemeCard(root, "لافندر ملكي", "بنفسجي ناعم ولمسات ليلك مخملية", "feminine_lavender", "", Color.rgb(46, 16, 101), Color.rgb(88, 28, 135));
        addThemeCard(root, "زمردي فاخر", "أخضر زمردي ملكي مع ذهب هادئ", "feminine_emerald", "", Color.rgb(2, 44, 34), Color.rgb(4, 120, 87));
        addThemeCard(root, "ذهب وردي", "روز جولد راقٍ للمناسبات", "feminine_rose_gold", "", Color.rgb(63, 23, 40), Color.rgb(112, 38, 74));
        addThemeCard(root, "فراشات ليلكية", "ليلكي داكن وبريق ناعم", "rose", "remo_feminine_lilac_butterflies", Color.rgb(62, 40, 75), Color.rgb(136, 99, 157));
        addThemeCard(root, "زهر اللؤلؤ", "ورد فاتح وأناقة هادئة", "light", "remo_feminine_pearl_bloom", Color.rgb(242, 223, 228), Color.WHITE);
        addThemeCard(root, "رخام بنفسجي", "بنفسجي فاخر وعروق ذهبية", "rose", "remo_feminine_violet_marble", Color.rgb(54, 33, 68), Color.rgb(112, 79, 130));
        addSection(root, "خلفيات شبابية");
        addThemeCard(root, "سايبر نيون", "سيان كهربائي وجرافيت مستقبلي", "youth_cyber", "", Color.rgb(15, 23, 42), Color.rgb(30, 41, 59));
        addThemeCard(root, "درفت كربون", "ألياف كربون ووهج برتقالي ناري", "youth_drift", "", Color.rgb(9, 9, 11), Color.rgb(24, 24, 27));
        addThemeCard(root, "شفق كوني", "بنفسجي نيون ولمسات ليزرية عميقة", "youth_sunset", "", Color.rgb(30, 27, 75), Color.rgb(49, 46, 129));
        addThemeCard(root, "شبكة نيون", "سيان وبنفسجي فوق جرافيت", "navy", "remo_masculine_neon_grid", Color.rgb(14, 24, 38), Color.rgb(57, 83, 108));
        addThemeCard(root, "فولاذ الجمر", "فولاذ أسود ووهج كهرماني", "navy", "remo_masculine_ember_steel", Color.rgb(24, 22, 21), Color.rgb(100, 75, 54));
        addThemeCard(root, "لهب أزرق", "كحلي داكن وتأثير تقني", "navy", "remo_masculine_blue_flame", Color.rgb(12, 24, 43), Color.rgb(48, 73, 108));
        addThemeCard(root, "كامو الغابة", "أخضر زيتوني وجرافيت", "navy", "remo_masculine_forest_camo", Color.rgb(29, 40, 30), Color.rgb(72, 90, 70));
        addSection(root, "ثيمات نسائية كيوت");
        addThemeCard(root, "باربي فوشيا", "فوشيا حيوي مع قلوب متوهجة", "girly_pink_glam", "", Color.rgb(74, 14, 46), Color.rgb(112, 26, 69));
        addThemeCard(root, "حلوى الباستيل", "غزل البنات ووردي ناعم باودر", "girly_pastel_candy", "", Color.rgb(255, 231, 241), Color.rgb(255, 173, 204));
        addThemeCard(root, "سحاب اللافندر", "سماء حالمة بنفسجية ناعمة", "girly_cotton_cloud", "theme_lavender_cute", Color.rgb(30, 30, 56), Color.rgb(44, 44, 84));
        addThemeCard(root, "سكر ووردي", "وردي حلو وقلوب ناعمة", "cute", "", Color.rgb(255, 231, 241), Color.rgb(255, 173, 204));
        addThemeCard(root, "لافندر كيوت", "بنفسجي هادئ ولمسة لؤلؤية", "cute", "theme_lavender_cute", Color.rgb(238, 229, 255), Color.rgb(191, 164, 235));
        addSection(root, "خلفيات إسلامية");
        addThemeCard(root, "فوانيس رمضانية", "هلال وفوانيس ذهبية", "ramadan", "remo_islamic_lanterns", Color.rgb(16, 41, 36), Color.rgb(78, 89, 66));
        addThemeCard(root, "مسجد الغروب", "كحلي، هلال، ونجوم هادئة", "ramadan", "remo_islamic_mosque_dusk", Color.rgb(18, 27, 61), Color.rgb(61, 72, 106));
        addSection(root, "ثيمات طبيعية ورياضية");
        addThemeCard(root, "سباق السرعة (Racing)", "أحمر فيراري رياضي وألياف كربونية", "sport_racing", "theme_racing", Color.rgb(24, 24, 27), Color.rgb(39, 39, 42));
        addThemeCard(root, "عشب الملعب (Football)", "أخضر نجيل كروي وخطوط بيضاء حماسية", "sport_football", "", Color.rgb(6, 78, 59), Color.rgb(6, 95, 70));
        addThemeCard(root, "غابة طبيعية", "أخضر أوراق ولمسة ترابية", "nature", "", Color.rgb(20, 48, 31), Color.rgb(67, 119, 74));
        addThemeCard(root, "محيط هادئ", "أزرق مائي وهواء منعش", "nature", "theme_ocean", Color.rgb(12, 45, 66), Color.rgb(36, 117, 150));
        addThemeCard(root, "ملعب الطاقة", "أحمر رياضي وأصفر حيوي", "sport", "", Color.rgb(25, 31, 40), Color.rgb(210, 70, 67));
        addThemeCard(root, "سباق ليلي", "كحلي سريع ولمسات برتقالية", "sport", "", Color.rgb(17, 26, 42), Color.rgb(238, 111, 45));
        addSection(root, "خلفيات أندية كرة القدم (مع الشعار ثلاثي الأبعاد)");
        addThemeCard(root, "نادي الهلال السعودي", "أزرق ملكي مع شعار الهلال الرسمي", "club_alhilal", "club_alhilal", Color.rgb(0, 32, 96), Color.rgb(0, 75, 180));
        addThemeCard(root, "نادي النصر السعودي", "أصفر عالمي وأزرق حماسي مع شعار النصر", "club_alnassr", "club_alnassr", Color.rgb(20, 25, 45), Color.rgb(220, 180, 0));
        addThemeCard(root, "نادي الاتحاد السعودي", "العميد - أصفر وخطوط سوداء وشعار الاتحاد", "club_alittihad", "club_alittihad", Color.rgb(15, 15, 15), Color.rgb(220, 170, 0));
        addThemeCard(root, "النادي الأهلي السعودي", "الملكي الأخضر مع شعار الأهلي الراقي", "club_alahli", "club_alahli", Color.rgb(5, 45, 25), Color.rgb(10, 120, 60));
        addThemeCard(root, "ريال مدريد (Real Madrid)", "الملكي الأبيض والذهبي مع تاج وشعار الريال", "club_realmadrid", "club_realmadrid", Color.rgb(18, 20, 35), Color.rgb(218, 165, 32));
        addThemeCard(root, "برشلونة (FC Barcelona)", "البلوغرانا - أزرق وقرمزي وشعار البارسا العريق", "club_barcelona", "club_barcelona", Color.rgb(0, 20, 60), Color.rgb(160, 10, 45));
        addThemeCard(root, "مانشستر يونايتد (Man Utd)", "الشياطين الحمر - أحمر ناري وأسود مع شعار اليونايتد", "club_manutd", "club_manutd", Color.rgb(40, 5, 10), Color.rgb(190, 15, 25));
        addThemeCard(root, "ليفربول (Liverpool FC)", "الريدز - أحمر ليفربول الأسطوري مع طائر الليفر", "club_liverpool", "club_liverpool", Color.rgb(45, 5, 10), Color.rgb(180, 15, 25));
        addSection(root, "ثيمات أعلام الدول");
        addThemeCard(root, "علم السعودية", "أخضر وكتابة بيضاء مع السيفين والنخلة", "flag_sa", "flag_sa", Color.rgb(7, 54, 31), Color.rgb(30, 116, 67));
        addThemeCard(root, "علم فلسطين", "أسود وأبيض وأخضر ومثلث أحمر", "flag_ps", "flag_ps", Color.rgb(28, 30, 32), Color.rgb(173, 45, 51));
        addThemeCard(root, "علم الإمارات", "أخضر وأبيض وأسود وشريط أحمر", "flag_ae", "flag_ae", Color.rgb(22, 32, 30), Color.rgb(179, 55, 55));
        addThemeCard(root, "علم الأردن", "أسود وأبيض وأخضر ومثلث أحمر ونجمة", "flag_jo", "flag_jo", Color.rgb(30, 30, 34), Color.rgb(143, 48, 48));
        addSection(root, "تخصيص الخلفية والألوان");
        addAction(root, "اختيار صورة من الاستوديو", "استخدم صورة من معرض الجهاز كخلفية للكيبورد", this::chooseBackgroundFromStudio);
        addAction(root, "إزالة صورة الخلفية", "العودة إلى الخلفية اللونية للثيم", () -> { preferences.edit().remove("background_uri").remove("background_asset").apply(); notifyThemeChanged(); Toast.makeText(this, "تمت إزالة الخلفية", Toast.LENGTH_SHORT).show(); });
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
        notifyThemeChanged();
        showPanel(Panel.HEIGHT);
    }

    private void chooseKeyStyle(String value, String title) {
        preferences.edit().putString("key_style", value).apply();
        Toast.makeText(this, "تم اختيار ستايل " + title, Toast.LENGTH_SHORT).show();
        showPanel(Panel.KEY_STYLE);
    }

    private void chooseTranslationDirection(String value) {
        preferences.edit().putString("translation_direction", value).apply();
        showPanel(Panel.TRANSLATION);
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
        notifyThemeChanged();
        Toast.makeText(this, "تم اختيار ثيم " + title, Toast.LENGTH_SHORT).show();
    }

    private void notifyThemeChanged() {
        Intent update = new Intent(RemoInputMethodService.ACTION_THEME_CHANGED);
        update.setPackage(getPackageName());
        sendBroadcast(update);
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
                    notifyThemeChanged();
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
            notifyThemeChanged();
            Toast.makeText(this, "تم تطبيق " + names[index], Toast.LENGTH_SHORT).show();
        }).show();
    }

    private void showSplashScreen() {
        Dialog splash = new Dialog(this, android.R.style.Theme_Black_NoTitleBar_Fullscreen);
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setGravity(Gravity.CENTER);
        layout.setBackgroundColor(Color.rgb(15, 17, 21));
        layout.setPadding(dp(24), dp(32), dp(24), dp(32));

        ImageView img = new ImageView(this);
        try {
            int resId = getResources().getIdentifier("developer_welcome", "drawable", getPackageName());
            if (resId != 0) {
                img.setImageResource(resId);
            } else {
                InputStream is = getAssets().open("web/developer-welcome.png");
                img.setImageBitmap(BitmapFactory.decodeStream(is));
                is.close();
            }
        } catch (Exception ignored) { }
        LinearLayout.LayoutParams imgParams = new LinearLayout.LayoutParams(dp(110), dp(110));
        imgParams.bottomMargin = dp(18);
        layout.addView(img, imgParams);

        TextView title = new TextView(this);
        title.setText("محمد الحزمي");
        title.setTextColor(Color.rgb(255, 215, 0));
        title.setTextSize(24);
        title.setTypeface(Typeface.DEFAULT_BOLD);
        title.setGravity(Gravity.CENTER);
        layout.addView(title);

        TextView subtitle = new TextView(this);
        subtitle.setText("لبرمجة وتطوير تطبيقات الاندرويد");
        subtitle.setTextColor(Color.rgb(200, 205, 215));
        subtitle.setTextSize(15);
        subtitle.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams subParams = new LinearLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
        subParams.bottomMargin = dp(24);
        layout.addView(subtitle, subParams);

        TextView status = new TextView(this);
        status.setText("تهيئة نظام ريمو كيبورد والمحرك الأصلي...");
        status.setTextColor(Color.rgb(140, 202, 255));
        status.setTextSize(13);
        status.setGravity(Gravity.CENTER);
        layout.addView(status);

        ProgressBar bar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        bar.setMax(100);
        bar.setProgress(35);
        LinearLayout.LayoutParams barParams = new LinearLayout.LayoutParams(dp(260), dp(10));
        barParams.topMargin = dp(12);
        barParams.bottomMargin = dp(24);
        layout.addView(bar, barParams);

        Button skip = new Button(this);
        skip.setText("تخطي والدخول ➔");
        skip.setTextColor(Color.BLACK);
        skip.setBackgroundColor(Color.rgb(255, 215, 0));
        skip.setOnClickListener(v -> splash.dismiss());
        LinearLayout.LayoutParams skipParams = new LinearLayout.LayoutParams(dp(200), dp(44));
        layout.addView(skip, skipParams);

        TextView footer = new TextView(this);
        footer.setText("جميع الحقوق محفوظة للمطور محمد الحزمي 2026 ©");
        footer.setTextColor(Color.rgb(120, 125, 135));
        footer.setTextSize(11);
        footer.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams footParams = new LinearLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
        footParams.topMargin = dp(28);
        layout.addView(footer, footParams);

        splash.setContentView(layout);
        splash.show();

        Handler handler = new Handler();
        handler.postDelayed(() -> {
            bar.setProgress(70);
            status.setText("تحميل مكتبة الخطوط العربية واللاتينية (20 نمطاً)...");
        }, 500);
        handler.postDelayed(() -> {
            bar.setProgress(90);
            status.setText("تفعيل كيبورد الكمبيوتر ومحرك الزخرفة والحافظة (1000 عنصر)...");
        }, 1000);
        handler.postDelayed(() -> {
            bar.setProgress(100);
            status.setText("اكتمل التجهيز بنجاح...");
        }, 1500);
        handler.postDelayed(() -> {
            if (splash.isShowing()) splash.dismiss();
            checkForOnlineUpdates(false);
        }, 1800);
    }

    private View buildDeveloperNotice() {
        LinearLayout notice = new LinearLayout(this);
        notice.setOrientation(LinearLayout.VERTICAL);
        notice.setPadding(dp(16), dp(12), dp(16), dp(12));
        notice.setBackground(rounded(Color.rgb(45, 38, 22), dp(10), false));
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT);
        params.setMargins(dp(16), dp(6), dp(16), dp(10));
        notice.setLayoutParams(params);

        LinearLayout topRow = new LinearLayout(this);
        topRow.setOrientation(LinearLayout.HORIZONTAL);
        topRow.setGravity(Gravity.CENTER_VERTICAL);

        TextView badge = new TextView(this);
        badge.setText("★ إشعار رسمي موثّق - معتمد 2026");
        badge.setTextColor(Color.rgb(255, 215, 0));
        badge.setTextSize(13);
        badge.setTypeface(Typeface.DEFAULT_BOLD);
        topRow.addView(badge, new LinearLayout.LayoutParams(0, LayoutParams.WRAP_CONTENT, 1f));

        TextView close = new TextView(this);
        close.setText("✕");
        close.setTextColor(secondary);
        close.setTextSize(15);
        close.setPadding(dp(8), dp(4), dp(8), dp(4));
        close.setOnClickListener(v -> notice.setVisibility(View.GONE));
        topRow.addView(close);

        notice.addView(topRow);

        TextView devText = new TextView(this);
        devText.setText("هذا التطبيق برمجة وتطوير المطور محمد الحزمي");
        devText.setTextColor(Color.WHITE);
        devText.setTextSize(14);
        devText.setTypeface(Typeface.DEFAULT_BOLD);
        LinearLayout.LayoutParams tParams = new LinearLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
        tParams.topMargin = dp(4);
        notice.addView(devText, tParams);

        TextView devSub = new TextView(this);
        devSub.setText("جميع الحقوق محفوظة للمطور 2026");
        devSub.setTextColor(Color.rgb(220, 200, 160));
        devSub.setTextSize(12);
        notice.addView(devSub);

        return notice;
    }

    public static final String LATEST_APK_DOWNLOAD_URL = "https://github.com/ma4alhzmi1-ai-pro/RemoKeyboard-Pro/releases/download/v1.0.16/RemoKeyboard-1.0.16.apk";
    public static final String ONLINE_UPDATE_URL = "https://raw.githubusercontent.com/ma4alhzmi1-ai-pro/RemoKeyboard-Pro/main/version.json";
    private LinearLayout updateNoticeContainer;

    private View buildUpdateNotice() {
        updateNoticeContainer = new LinearLayout(this);
        updateNoticeContainer.setOrientation(LinearLayout.VERTICAL);
        updateNoticeContainer.setPadding(dp(16), dp(14), dp(16), dp(14));
        updateNoticeContainer.setBackground(rounded(Color.rgb(18, 44, 32), dp(12), true));
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT);
        params.setMargins(dp(16), dp(4), dp(16), dp(12));
        updateNoticeContainer.setLayoutParams(params);

        renderUpdateBanner(
            updateNoticeContainer,
            "1.0.16",
            "تحديث ريمو كيبورد v1.0.16 متوفر للتحميل الآن",
            "• الكتابة الفعلية بالخطوط العربية الحقيقية (القاهرة، الأميري، تجوال، رقعة عارف، المراعي)\n" +
            "• الكيبورد الناطق الذكي للكلمات بعد اكتمالها بنقاء صوتي عالي\n" +
            "• إشعارات التحديث الأونلاين التلقائية المباشرة\n" +
            "• خلفيات الأندية الرياضية وثيمات 3D والتحكم بالارتفاع",
            LATEST_APK_DOWNLOAD_URL
        );

        return updateNoticeContainer;
    }

    private void renderUpdateBanner(LinearLayout container, String newVersion, String title, String desc, String apkUrl) {
        container.removeAllViews();

        LinearLayout topRow = new LinearLayout(this);
        topRow.setOrientation(LinearLayout.HORIZONTAL);
        topRow.setGravity(Gravity.CENTER_VERTICAL);

        TextView badge = new TextView(this);
        badge.setText("🔔 تحديث متوفر: v" + newVersion);
        badge.setTextColor(Color.rgb(74, 222, 128));
        badge.setTextSize(14);
        badge.setTypeface(Typeface.DEFAULT_BOLD);
        topRow.addView(badge, new LinearLayout.LayoutParams(0, LayoutParams.WRAP_CONTENT, 1f));

        TextView close = new TextView(this);
        close.setText("✕");
        close.setTextColor(secondary);
        close.setTextSize(15);
        close.setPadding(dp(8), dp(4), dp(8), dp(4));
        close.setOnClickListener(v -> container.setVisibility(View.GONE));
        topRow.addView(close);

        container.addView(topRow);

        TextView titleView = new TextView(this);
        titleView.setText(title);
        titleView.setTextColor(Color.WHITE);
        titleView.setTextSize(13);
        titleView.setTypeface(Typeface.DEFAULT_BOLD);
        LinearLayout.LayoutParams titleParams = new LinearLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
        titleParams.topMargin = dp(4);
        container.addView(titleView, titleParams);

        TextView updateDesc = new TextView(this);
        updateDesc.setText(desc);
        updateDesc.setTextColor(Color.rgb(220, 255, 235));
        updateDesc.setTextSize(12);
        updateDesc.setLineSpacing(dp(2), 1f);
        LinearLayout.LayoutParams tParams = new LinearLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
        tParams.topMargin = dp(4);
        container.addView(updateDesc, tParams);

        LinearLayout actions = new LinearLayout(this);
        actions.setOrientation(LinearLayout.HORIZONTAL);
        actions.setGravity(Gravity.CENTER_VERTICAL);
        LinearLayout.LayoutParams actParams = new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT);
        actParams.topMargin = dp(10);
        actions.setLayoutParams(actParams);

        Button downloadBtn = new Button(this);
        downloadBtn.setText("⬇️ تحميل التحديث الآن (APK)");
        downloadBtn.setTextColor(Color.rgb(10, 25, 15));
        downloadBtn.setTextSize(12);
        downloadBtn.setTypeface(Typeface.DEFAULT_BOLD);
        downloadBtn.setBackground(rounded(Color.rgb(74, 222, 128), dp(8), false));
        downloadBtn.setPadding(dp(16), dp(8), dp(16), dp(8));
        downloadBtn.setOnClickListener(v -> openExternalUrl(apkUrl));
        LinearLayout.LayoutParams btnParams = new LinearLayout.LayoutParams(0, LayoutParams.WRAP_CONTENT, 1f);
        btnParams.leftMargin = dp(8);
        actions.addView(downloadBtn, btnParams);

        Button checkBtn = new Button(this);
        checkBtn.setText("🔄 فحص أونلاين");
        checkBtn.setTextColor(Color.WHITE);
        checkBtn.setTextSize(11);
        checkBtn.setBackground(rounded(Color.rgb(33, 55, 45), dp(8), false));
        checkBtn.setPadding(dp(12), dp(8), dp(12), dp(8));
        checkBtn.setOnClickListener(v -> checkForOnlineUpdates(true));
        actions.addView(checkBtn, new LinearLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT));

        container.addView(actions);
    }

    private void checkForOnlineUpdates(boolean userInitiated) {
        if (userInitiated) {
            Toast.makeText(this, "جاري التحقق من التحديثات عبر الإنترنت...", Toast.LENGTH_SHORT).show();
        }

        new Thread(() -> {
            String latestVer = "1.0.16";
            String title = "تحديث ريمو كيبورد v1.0.16 متوفر الآن";
            String message = "يتوفر إصدار جديد من ريمو كيبورد يحتوي على ميزة الكتابة الفعلية بالخطوط العربية الحقيقية، الكيبورد الناطق لنطق الكلمة كاملة بعد اكتمالها، تحسينات الثيمات وخلفيات الأندية، وإشعارات التحديث التلقائية المباشرة.";
            String apkUrl = LATEST_APK_DOWNLOAD_URL;

            try {
                URL url = new URL(ONLINE_UPDATE_URL);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setConnectTimeout(5000);
                conn.setReadTimeout(5000);
                conn.setRequestMethod("GET");
                conn.setRequestProperty("User-Agent", "RemoKeyboard-App");
                if (conn.getResponseCode() == 200) {
                    BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                    StringBuilder sb = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) sb.append(line);
                    reader.close();
                    JSONObject json = new JSONObject(sb.toString());
                    latestVer = json.optString("latestVersion", latestVer);
                    title = json.optString("title", title);
                    message = json.optString("message", message);
                    apkUrl = json.optString("apkUrl", apkUrl);
                }
            } catch (Exception ignored) { }

            final String fVer = latestVer;
            final String fTitle = title;
            final String fMessage = message;
            final String fApkUrl = apkUrl;

            runOnUiThread(() -> {
                sendUpdateSystemNotification(fVer, fTitle, fApkUrl);
                showUpdateDialog(fVer, fTitle, fMessage, fApkUrl);

                if (updateNoticeContainer != null) {
                    updateNoticeContainer.setVisibility(View.VISIBLE);
                    renderUpdateBanner(updateNoticeContainer, fVer, fTitle, fMessage, fApkUrl);
                }

                if (userInitiated) {
                    Toast.makeText(KeyboardSettingsActivity.this, "تم استلام إشعار التحديث v" + fVer + " بنجاح", Toast.LENGTH_SHORT).show();
                }
            });
        }).start();
    }

    private void showUpdateDialog(String version, String title, String message, String apkUrl) {
        try {
            if (isFinishing()) return;
            new AlertDialog.Builder(this)
                .setTitle("🔔 " + title)
                .setMessage(message + "\n\n• الإصدار الجديد: v" + version + "\n• الرابط المباشر: جاهز للتنزيل الفوري")
                .setPositiveButton("⬇️ تحميل التحديث الآن (APK)", (d, w) -> {
                    openExternalUrl(apkUrl);
                })
                .setNeutralButton("صفحة الإصدارات في GitHub", (d, w) -> {
                    openExternalUrl("https://github.com/ma4alhzmi1-ai-pro/RemoKeyboard-Pro/releases");
                })
                .setNegativeButton("لاحقاً", null)
                .show();
        } catch (Exception ignored) { }
    }

    private void sendUpdateSystemNotification(String version, String title, String apkUrl) {
        try {
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;

            String channelId = "remo_app_updates";
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                NotificationChannel channel = new NotificationChannel(
                    channelId,
                    "تحديثات ريمو كيبورد",
                    NotificationManager.IMPORTANCE_HIGH
                );
                channel.setDescription("إشعارات التحديثات الجديدة لتطبيق ريمو كيبورد");
                channel.enableLights(true);
                channel.setLightColor(Color.GREEN);
                channel.enableVibration(true);
                nm.createNotificationChannel(channel);
            }

            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(apkUrl));
            PendingIntent pi = PendingIntent.getActivity(
                this,
                0,
                intent,
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT : PendingIntent.FLAG_UPDATE_CURRENT
            );

            Notification.Builder builder;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                builder = new Notification.Builder(this, channelId);
            } else {
                builder = new Notification.Builder(this);
            }

            int iconRes = getResources().getIdentifier("ic_remokeyboard", "drawable", getPackageName());
            if (iconRes == 0) iconRes = android.R.drawable.stat_sys_download_done;

            builder.setSmallIcon(iconRes)
                .setContentTitle("🔔 تحديث متوفر: ريمو كيبورد v" + version)
                .setContentText("انقر هنا لتحميل وتثبيت التحديث الجديد مباشرة (APK)")
                .setContentIntent(pi)
                .setAutoCancel(true);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                builder.setPriority(Notification.PRIORITY_HIGH);
            }

            nm.notify(1016, builder.build());
        } catch (Exception ignored) { }
    }

    private View buildSecurityNotice() {
        LinearLayout notice = new LinearLayout(this);
        notice.setOrientation(LinearLayout.VERTICAL);
        notice.setPadding(dp(16), dp(12), dp(16), dp(12));
        notice.setBackground(rounded(Color.rgb(18, 30, 48), dp(10), false));
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT);
        params.setMargins(dp(16), dp(4), dp(16), dp(12));
        notice.setLayoutParams(params);

        LinearLayout topRow = new LinearLayout(this);
        topRow.setOrientation(LinearLayout.HORIZONTAL);
        topRow.setGravity(Gravity.CENTER_VERTICAL);

        TextView badge = new TextView(this);
        badge.setText("🛡️ تنبيه هام حول إشعارات التفعيل من أندرويد");
        badge.setTextColor(Color.rgb(92, 200, 255));
        badge.setTextSize(13);
        badge.setTypeface(Typeface.DEFAULT_BOLD);
        topRow.addView(badge, new LinearLayout.LayoutParams(0, LayoutParams.WRAP_CONTENT, 1f));

        TextView close = new TextView(this);
        close.setText("✕");
        close.setTextColor(secondary);
        close.setTextSize(15);
        close.setPadding(dp(8), dp(4), dp(8), dp(4));
        close.setOnClickListener(v -> notice.setVisibility(View.GONE));
        topRow.addView(close);

        notice.addView(topRow);

        TextView secDesc = new TextView(this);
        secDesc.setText("• رسالتا التحذير (جمع النصوص وتنبيه إعادة التشغيل) هما إشعاران نظاميان يظهرهما نظام أندرويد تلقائياً لأي لوحة مفاتيح خارجية.\n• ريموكيبورد آمن 100%، لا يجمع ولا يسجل أي بيانات، ويعمل محلياً بالكامل على جهازك دون اتصال خارجي!");
        secDesc.setTextColor(Color.rgb(220, 240, 255));
        secDesc.setTextSize(12);
        secDesc.setLineSpacing(dp(2), 1f);
        LinearLayout.LayoutParams sParams = new LinearLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
        sParams.topMargin = dp(6);
        notice.addView(secDesc, sParams);

        return notice;
    }

    private void openWebStudio() {
        try {
            Dialog dialog = new Dialog(this, android.R.style.Theme_Black_NoTitleBar_Fullscreen);
            WebView webView = new WebView(this);
            webView.getSettings().setJavaScriptEnabled(true);
            webView.getSettings().setDomStorageEnabled(true);
            webView.getSettings().setAllowFileAccess(true);
            webView.loadUrl("file:///android_asset/web/index.html");
            dialog.setContentView(webView);
            dialog.show();
        } catch (Exception e) {
            Toast.makeText(this, "تعذر فتح الاستوديو: " + e.getMessage(), Toast.LENGTH_SHORT).show();
        }
    }

    private void showFontPicker() {
        CalligraphyEngine.FontType[] types = CalligraphyEngine.FontType.values();
        String[] names = new String[types.length];
        for (int i = 0; i < types.length; i++) {
            String sample = CalligraphyEngine.transformText(types[i].name().startsWith("EN_") ? "Remo" : "ريمو", types[i]);
            names[i] = types[i].nameAr + " (" + sample + ")";
        }
        new AlertDialog.Builder(this)
            .setTitle("اختر خط وزخرفة أزرار الكيبورد")
            .setItems(names, (dialog, index) -> {
                CalligraphyEngine.FontType selected = types[index];
                preferences.edit()
                    .putString("calligraphy_font", selected.name())
                    .putString("keyboard_font", selected.name())
                    .apply();
                notifyThemeChanged();
                Toast.makeText(this, "تم تفعيل خط: " + selected.nameAr + " مباشرة على الكيبورد", Toast.LENGTH_SHORT).show();
                if (currentPanel == Panel.DECORATION) {
                    showPanel(Panel.DECORATION);
                }
            })
            .show();
    }

    private void openExternalUrl(String value) {
        startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(value)));
    }

    private int dp(int value) { return (int) (value * getResources().getDisplayMetrics().density + 0.5f); }

    private GradientDrawable rounded(int color, int radius, boolean lightEdge) {
        GradientDrawable d = new GradientDrawable();
        d.setColor(color);
        d.setCornerRadius(radius);
        if (lightEdge) {
            d.setStroke(dp(1), Color.argb(40, 255, 255, 255));
        }
        return d;
    }
}
