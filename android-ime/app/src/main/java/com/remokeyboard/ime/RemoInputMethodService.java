package com.remokeyboard.ime;

import android.Manifest;
import android.content.BroadcastReceiver;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.inputmethodservice.InputMethodService;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.text.TextUtils;
import android.view.KeyEvent;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputConnection;
import android.widget.Toast;
import java.util.ArrayList;
import java.util.Locale;

/** خدمة إدخال حقيقية: تكتب مباشرة في الحقل النشط لدى أي تطبيق أندرويد. */
public class RemoInputMethodService extends InputMethodService {
    static final String ACTION_THEME_CHANGED = "com.remokeyboard.ime.THEME_CHANGED";
    private SharedPreferences preferences;
    private ClipboardRepository clipboard;
    private RemoKeyboardView keyboardView;
    private SpeechRecognizer speechRecognizer;
    private TextToSpeech textToSpeech;
    private boolean ttsReady = false;
    private ClipboardManager systemClipboard;
    private ClipboardManager.OnPrimaryClipChangedListener clipboardListener;
    private final BroadcastReceiver themeReceiver = new BroadcastReceiver() {
        @Override public void onReceive(Context context, Intent intent) {
            if (keyboardView != null) keyboardView.reloadTheme();
        }
    };

    @Override public void onCreate() {
        super.onCreate();
        preferences = getSharedPreferences("remo_keyboard", Context.MODE_PRIVATE);
        clipboard = new ClipboardRepository(preferences);
        systemClipboard = (ClipboardManager) getSystemService(CLIPBOARD_SERVICE);
        clipboardListener = this::captureSystemClipboard;
        if (systemClipboard != null) systemClipboard.addPrimaryClipChangedListener(clipboardListener);
        if (Build.VERSION.SDK_INT >= 33) registerReceiver(themeReceiver, new IntentFilter(ACTION_THEME_CHANGED), Context.RECEIVER_NOT_EXPORTED);
        else registerReceiver(themeReceiver, new IntentFilter(ACTION_THEME_CHANGED));
    }

    @Override public void onWindowShown() {
        super.onWindowShown();
        if (keyboardView != null) keyboardView.resetWindowPosition();
    }

    @Override public android.view.View onCreateInputView() {
        keyboardView = new RemoKeyboardView(this, this, preferences);
        return keyboardView;
    }

    @Override public void onStartInput(EditorInfo attribute, boolean restarting) {
        super.onStartInput(attribute, restarting);
        if (keyboardView != null) keyboardView.refreshSuggestions();
    }

    void commitText(String text) {
        InputConnection connection = getCurrentInputConnection();
        if (connection == null || TextUtils.isEmpty(text)) return;
        connection.commitText(text, 1);
        vibrateIfEnabled();
        if (text.equals(" ") || text.equals("\n") || text.contains("،") || text.contains(".") || text.contains("؟")) {
            String word = getCurrentWordBeforeCursor();
            if (!TextUtils.isEmpty(word)) {
                speakWord(word.trim());
            }
        }
        if (keyboardView != null) keyboardView.refreshSuggestions();
    }

    void deleteBeforeCursor() {
        InputConnection connection = getCurrentInputConnection();
        if (connection != null) connection.deleteSurroundingText(1, 0);
        vibrateIfEnabled();
        if (keyboardView != null) keyboardView.refreshSuggestions();
    }

    void sendEnterOrNext() {
        InputConnection connection = getCurrentInputConnection();
        EditorInfo editor = getCurrentInputEditorInfo();
        if (connection == null) return;
        int action = editor == null ? EditorInfo.IME_ACTION_NONE : (editor.imeOptions & EditorInfo.IME_MASK_ACTION);
        boolean completed = (action == EditorInfo.IME_ACTION_NEXT || action == EditorInfo.IME_ACTION_DONE || action == EditorInfo.IME_ACTION_GO || action == EditorInfo.IME_ACTION_SEND)
            && connection.performEditorAction(action);
        if (!completed) connection.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_ENTER));
        vibrateIfEnabled();
    }

    void sendDesktopKey(int keyCode) {
        sendDesktopKey(keyCode, 0);
    }

    void sendDesktopKey(int keyCode, int metaState) {
        InputConnection connection = getCurrentInputConnection();
        if (connection == null) return;
        connection.sendKeyEvent(new KeyEvent(0, 0, KeyEvent.ACTION_DOWN, keyCode, 0, metaState));
        connection.sendKeyEvent(new KeyEvent(0, 0, KeyEvent.ACTION_UP, keyCode, 0, metaState));
        vibrateIfEnabled();
    }

    void pasteClipboardItem(String text) { commitText(text); }

    ClipboardRepository getClipboard() { return clipboard; }

    void openSettings() {
        Intent intent = new Intent(this, KeyboardSettingsActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(intent);
    }

    String getCurrentWordBeforeCursor() {
        InputConnection connection = getCurrentInputConnection();
        if (connection == null) return "";
        CharSequence before = connection.getTextBeforeCursor(72, 0);
        if (before == null) return "";
        String source = before.toString();
        int start = Math.max(
            Math.max(source.lastIndexOf(' '), source.lastIndexOf('\n')),
            Math.max(source.lastIndexOf('،'), source.lastIndexOf('؛'))
        );
        return source.substring(start + 1);
    }

    String getSelectedTextOrCurrentWord() {
        InputConnection connection = getCurrentInputConnection();
        if (connection == null) return "";
        CharSequence selected = connection.getSelectedText(0);
        if (selected != null && selected.length() > 0) return selected.toString();
        return getCurrentWordBeforeCursor();
    }

    void replaceSelectedTextOrCurrentWord(String original, String replacement) {
        InputConnection connection = getCurrentInputConnection();
        if (connection == null || TextUtils.isEmpty(replacement)) return;
        CharSequence selected = connection.getSelectedText(0);
        if (selected != null && selected.length() > 0) {
            connection.commitText(replacement, 1);
        } else if (!TextUtils.isEmpty(original)) {
            connection.deleteSurroundingText(original.length(), 0);
            connection.commitText(replacement, 1);
        } else {
            connection.commitText(replacement, 1);
        }
        vibrateIfEnabled();
        if (keyboardView != null) keyboardView.refreshSuggestions();
    }

    void beginVoiceInput() {
        if (!preferences.getBoolean("voice_typing_enabled", true)) {
            Toast.makeText(this, "الكتابة بالصوت معطلة؛ يمكنك تفعيلها من إعدادات الكيبورد", Toast.LENGTH_SHORT).show();
            return;
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            Toast.makeText(this, "فعّل إذن الميكروفون من إعدادات ريموكيبورد أولًا", Toast.LENGTH_LONG).show();
            return;
        }
        if (!SpeechRecognizer.isRecognitionAvailable(this)) {
            Toast.makeText(this, "التعرّف الصوتي غير متاح في هذا الجهاز", Toast.LENGTH_LONG).show();
            return;
        }
        endVoiceInput();
        try {
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this);
            speechRecognizer.setRecognitionListener(new RecognitionListener() {
                @Override public void onReadyForSpeech(android.os.Bundle params) { Toast.makeText(RemoInputMethodService.this, "تحدث الآن… (الكتابة بالصوت)", Toast.LENGTH_SHORT).show(); }
                @Override public void onBeginningOfSpeech() { }
                @Override public void onRmsChanged(float rmsdB) { }
                @Override public void onBufferReceived(byte[] buffer) { }
                @Override public void onEndOfSpeech() { }
                @Override public void onError(int error) { Toast.makeText(RemoInputMethodService.this, "تعذر تحويل الصوت إلى نص، حاول مجددًا", Toast.LENGTH_SHORT).show(); }
                @Override public void onResults(android.os.Bundle results) {
                    ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                    if (matches != null && !matches.isEmpty()) {
                        commitText(matches.get(0) + " ");
                        if (keyboardView != null) keyboardView.refreshSuggestions();
                    }
                    endVoiceInput();
                }
                @Override public void onPartialResults(android.os.Bundle partialResults) { }
                @Override public void onEvent(int eventType, android.os.Bundle params) { }
            });
            android.content.Intent intent = new android.content.Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            boolean isArabic = keyboardView == null || keyboardView.isArabicPage();
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, isArabic ? "ar-SA" : Locale.getDefault().toLanguageTag());
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, false);
            speechRecognizer.startListening(intent);
        } catch (Exception e) {
            Toast.makeText(this, "تعذر تشغيل الإملاء الصوتي", Toast.LENGTH_SHORT).show();
        }
    }

    private void endVoiceInput() {
        if (speechRecognizer != null) {
            speechRecognizer.destroy();
            speechRecognizer = null;
        }
    }

    private void ensureTts() {
        if (textToSpeech == null) {
            try {
                textToSpeech = new TextToSpeech(getApplicationContext(), status -> {
                    if (status == TextToSpeech.SUCCESS && textToSpeech != null) {
                        ttsReady = true;
                        try { textToSpeech.setLanguage(new Locale("ar")); } catch (Exception ignored) { }
                    }
                });
            } catch (Exception ignored) { }
        }
    }

    void speakKey(String label, boolean isArabicPage) {
        if (!preferences.getBoolean("talking_keyboard_enabled", false)) return;
        ensureTts();
        if (!ttsReady || textToSpeech == null || TextUtils.isEmpty(label)) return;
        try {
            String spoken = getSpokenLabel(label);
            boolean isArabic = isSpokenArabic(spoken);
            textToSpeech.setLanguage(isArabic ? new Locale("ar") : Locale.ENGLISH);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                textToSpeech.speak(spoken, TextToSpeech.QUEUE_FLUSH, null, "key_" + System.currentTimeMillis());
            } else {
                textToSpeech.speak(spoken, TextToSpeech.QUEUE_FLUSH, null);
            }
        } catch (Exception ignored) { }
    }

    void speakWord(String word) {
        if (!preferences.getBoolean("talking_keyboard_enabled", false)) return;
        ensureTts();
        if (!ttsReady || textToSpeech == null || TextUtils.isEmpty(word)) return;
        try {
            textToSpeech.setLanguage(new Locale("ar"));
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                textToSpeech.speak(word, TextToSpeech.QUEUE_FLUSH, null, "word_" + System.currentTimeMillis());
            } else {
                textToSpeech.speak(word, TextToSpeech.QUEUE_FLUSH, null);
            }
        } catch (Exception ignored) { }
    }

    public static void speakStatic(android.content.Context context, String text, boolean isArabic) {
        try {
            final android.speech.tts.TextToSpeech[] ttsHolder = new android.speech.tts.TextToSpeech[1];
            ttsHolder[0] = new android.speech.tts.TextToSpeech(context.getApplicationContext(), status -> {
                if (status == android.speech.tts.TextToSpeech.SUCCESS && ttsHolder[0] != null) {
                    try {
                        ttsHolder[0].setLanguage(isArabic ? new Locale("ar") : Locale.ENGLISH);
                        ttsHolder[0].speak(text, android.speech.tts.TextToSpeech.QUEUE_FLUSH, null, "static_" + System.currentTimeMillis());
                    } catch (Exception ignored) {}
                }
            });
        } catch (Exception ignored) {}
    }

    private boolean isSpokenArabic(String text) {
        for (char c : text.toCharArray()) {
            if (c >= 0x0600 && c <= 0x06FF) return true;
        }
        return false;
    }

    private String getSpokenLabel(String key) {
        if (key.equals(" ")) return "مسافة";
        if (key.contains("مسافة")) return "مسافة";
        if (key.equals("⌫") || key.equals("Backspace")) return "حذف";
        if (key.equals("↵") || key.equals("⏎") || key.equals("تنفيذ") || key.equals("Enter")) return "إدخال";
        if (key.equals("⇧") || key.equals("Shift")) return "تبديل حالة الحروف";
        if (key.equals("123")) return "لوحة الأرقام";
        if (key.equals("ABC")) return "لوحة الإنجليزية";
        if (key.equals("▣")) return "الحافظة";
        if (key.equals("☺")) return "الإيموجي";
        if (key.equals("⚙")) return "إعدادات الكيبورد";
        if (key.equals("文")) return "ترجمة";
        if (key.equals("⌕")) return "بحث الرموز";
        if (key.equals("،")) return "فاصلة";
        if (key.equals(".")) return "نقطة";
        if (key.equals("؟")) return "علامة استفهام";
        if (key.equals("!")) return "علامة تعجب";
        switch (key) {
            case "ا": return "ألف";
            case "ب": return "باء";
            case "ت": return "تاء";
            case "ث": return "ثاء";
            case "ج": return "جيم";
            case "ح": return "حاء";
            case "خ": return "خاء";
            case "د": return "دال";
            case "ذ": return "ذال";
            case "ر": return "راء";
            case "ز": return "زاي";
            case "س": return "سين";
            case "ش": return "شين";
            case "ص": return "صاد";
            case "ض": return "ضاد";
            case "ط": return "طاء";
            case "ظ": return "ظاء";
            case "ع": return "عين";
            case "غ": return "غين";
            case "ف": return "فاء";
            case "ق": return "قاف";
            case "ك": return "كاف";
            case "ل": return "لام";
            case "م": return "ميم";
            case "ن": return "نون";
            case "ه": return "هاء";
            case "و": return "واو";
            case "ي": return "ياء";
            case "ء": return "همزة";
            case "أ": return "ألف همزة";
            case "إ": return "إلف همزة";
            case "آ": return "ألف ممدودة";
            case "ؤ": return "واو همزة";
            case "ئ": return "ياء همزة";
            case "ة": return "تاء مربوطة";
            case "ى": return "ألف مقصورة";
            case "لا": return "لام ألف";
            case "٠": case "0": return "صفر";
            case "١": case "1": return "واحد";
            case "٢": case "2": return "اثنان";
            case "٣": case "3": return "ثلاثة";
            case "٤": case "4": return "أربعة";
            case "٥": case "5": return "خمسة";
            case "٦": case "6": return "ستة";
            case "٧": case "7": return "سبعة";
            case "٨": case "8": return "ثمانية";
            case "٩": case "9": return "تسعة";
            default: return key;
        }
    }

    private void captureSystemClipboard() {
        if (systemClipboard == null || !systemClipboard.hasPrimaryClip()) return;
        ClipData clip = systemClipboard.getPrimaryClip();
        if (clip == null || clip.getItemCount() == 0) return;
        CharSequence content = clip.getItemAt(0).coerceToText(this);
        if (content != null) clipboard.remember(content.toString());
    }

    private void vibrateIfEnabled() {
        if (!preferences.getBoolean("vibration", true)) return;
        Vibrator vibrator = (Vibrator) getSystemService(VIBRATOR_SERVICE);
        if (vibrator == null) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) vibrator.vibrate(VibrationEffect.createOneShot(12, VibrationEffect.DEFAULT_AMPLITUDE));
        else vibrator.vibrate(12);
    }

    @Override public void onDestroy() {
        endVoiceInput();
        if (textToSpeech != null) {
            try {
                textToSpeech.stop();
                textToSpeech.shutdown();
                textToSpeech = null;
            } catch (Exception ignored) { }
        }
        if (systemClipboard != null && clipboardListener != null) systemClipboard.removePrimaryClipChangedListener(clipboardListener);
        try { unregisterReceiver(themeReceiver); } catch (IllegalArgumentException ignored) { }
        super.onDestroy();
    }
}
