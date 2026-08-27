package com.remokeyboard.ime;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.net.Uri;
import android.provider.Settings;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup.LayoutParams;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.Switch;
import android.widget.TextView;

/** نقطة الدخول الأصلية لتفعيل IME ومنح إذن الميكروفون على أجهزة أندرويد. */
public class KeyboardSettingsActivity extends Activity {
    private SharedPreferences preferences;
    private final int sky = Color.rgb(92, 200, 255);
    private final int navy = Color.rgb(16, 22, 31);
    private final int surface = Color.rgb(24, 36, 50);

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        preferences = getSharedPreferences("remo_keyboard", Context.MODE_PRIVATE);
        getWindow().setStatusBarColor(navy);
        render();
    }

    private void render() {
        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(20), dp(28), dp(20), dp(28));
        root.setBackgroundColor(navy);
        root.setGravity(Gravity.RIGHT);
        scroll.addView(root);

        TextView title = label("ريموكيبورد مزخرف", 28, Color.WHITE);
        title.setGravity(Gravity.RIGHT);
        root.addView(title);
        TextView intro = label("لوحة مفاتيح عربية خفيفة مع زخرفة وثيمات وأدوات كتابة.", 16, Color.rgb(188, 207, 226));
        intro.setGravity(Gravity.RIGHT);
        root.addView(intro, margins(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT, 0, 8, 0, 22));

        TextView activate = button("1. تفعيل ريموكيبورد من إعدادات النظام", sky, navy);
        activate.setOnClickListener(v -> startActivity(new Intent(Settings.ACTION_INPUT_METHOD_SETTINGS)));
        root.addView(activate, margins(LayoutParams.MATCH_PARENT, dp(52), 0, 0, 0, 10));

        TextView picker = button("2. اختيار لوحة المفاتيح الآن", surface, Color.WHITE);
        picker.setOnClickListener(v -> ((android.view.inputmethod.InputMethodManager) getSystemService(INPUT_METHOD_SERVICE)).showInputMethodPicker());
        root.addView(picker, margins(LayoutParams.MATCH_PARENT, dp(52), 0, 0, 0, 18));

        section(root, "إعدادات الكتابة");
        addSwitch(root, "اهتزاز المفاتيح", "vibration", true);
        addNumeralButton(root, "نظام الأرقام: ١٢٣ عربية هندية", "arabic_indic");
        addNumeralButton(root, "نظام الأرقام: ۱۲۳ شرقية", "eastern");
        addNumeralButton(root, "نظام الأرقام: 123 لاتينية", "latin");
        TextView mic = button("السماح بالميكروفون للتحويل الصوتي", surface, Color.WHITE);
        mic.setOnClickListener(v -> requestMicPermission());
        root.addView(mic, margins(LayoutParams.MATCH_PARENT, dp(48), 0, 0, 0, 14));

        section(root, "مظهر لوحة المفاتيح");
        addThemeButton(root, "الثيم الداكن الشبابي", "navy");
        addThemeButton(root, "الثيم النسائي الوردي", "rose");
        addThemeButton(root, "ثيم المناسبات الإسلامية", "ramadan");
        addThemeButton(root, "الثيم الفاتح", "light");

        section(root, "حول التطبيق");
        TextView version = button("إصدار التطبيق: ريموكيبورد مزخرف 1.0.1", surface, Color.WHITE);
        root.addView(version, margins(LayoutParams.MATCH_PARENT, dp(44), 0, 0, 0, 7));
        TextView update = button("التحقق من التحديث", surface, Color.WHITE);
        update.setOnClickListener(v -> openExternalUrl("https://github.com/ma4alhzmi1-ai-pro/remo-player-1-0-23/releases"));
        root.addView(update, margins(LayoutParams.MATCH_PARENT, dp(44), 0, 0, 0, 7));
        TextView about = button("عن المطور: محمد الحزمي", surface, Color.WHITE);
        about.setOnClickListener(v -> openExternalUrl("https://t.me/moh_alymani1"));
        root.addView(about, margins(LayoutParams.MATCH_PARENT, dp(44), 0, 0, 0, 7));

        TextView note = label("يمكنك تعديل الزخرفة والحافظة والملصقات من مركز ريموكيبورد المرافق. تبقى النصوص محفوظة على جهازك.", 14, Color.rgb(169, 188, 207));
        note.setGravity(Gravity.RIGHT);
        root.addView(note, margins(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT, 0, 24, 0, 0));
        setContentView(scroll);
    }

    private void section(LinearLayout root, String name) {
        TextView heading = label(name, 19, sky);
        heading.setGravity(Gravity.RIGHT);
        root.addView(heading, margins(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT, 0, 15, 0, 8));
    }

    private void addSwitch(LinearLayout root, String name, String key, boolean defaultValue) {
        Switch control = new Switch(this);
        control.setText(name);
        control.setTextColor(Color.WHITE);
        control.setTextSize(16);
        control.setChecked(preferences.getBoolean(key, defaultValue));
        control.setGravity(Gravity.RIGHT | Gravity.CENTER_VERTICAL);
        control.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        control.setPadding(dp(12), 0, dp(12), 0);
        control.setBackground(round(surface));
        control.setOnCheckedChangeListener((button, checked) -> preferences.edit().putBoolean(key, checked).apply());
        root.addView(control, margins(LayoutParams.MATCH_PARENT, dp(48), 0, 0, 0, 8));
    }

    private void addThemeButton(LinearLayout root, String name, String value) {
        TextView option = button(name, surface, Color.WHITE);
        option.setOnClickListener(v -> preferences.edit().putString("theme", value).apply());
        root.addView(option, margins(LayoutParams.MATCH_PARENT, dp(44), 0, 0, 0, 7));
    }

    private void addNumeralButton(LinearLayout root, String name, String value) {
        TextView option = button(name, surface, Color.WHITE);
        option.setOnClickListener(v -> preferences.edit().putString("numerals", value).apply());
        root.addView(option, margins(LayoutParams.MATCH_PARENT, dp(44), 0, 0, 0, 7));
    }

    private void requestMicPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, 1001);
        }
    }

    private void openExternalUrl(String value) {
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(value));
        startActivity(intent);
    }

    private TextView label(String text, int size, int color) {
        TextView view = new TextView(this);
        view.setText(text);
        view.setTextSize(size);
        view.setTextColor(color);
        view.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        return view;
    }

    private TextView button(String text, int background, int foreground) {
        TextView view = label(text, 16, foreground);
        view.setGravity(Gravity.CENTER);
        view.setBackground(round(background));
        view.setClickable(true);
        return view;
    }

    private android.graphics.drawable.GradientDrawable round(int color) {
        android.graphics.drawable.GradientDrawable shape = new android.graphics.drawable.GradientDrawable();
        shape.setColor(color);
        shape.setCornerRadius(dp(14));
        return shape;
    }

    private LinearLayout.LayoutParams margins(int width, int height, int left, int top, int right, int bottom) {
        LinearLayout.LayoutParams result = new LinearLayout.LayoutParams(width, height);
        result.setMargins(dp(left), dp(top), dp(right), dp(bottom));
        return result;
    }

    private int dp(int value) { return (int) (value * getResources().getDisplayMetrics().density + 0.5f); }
}
