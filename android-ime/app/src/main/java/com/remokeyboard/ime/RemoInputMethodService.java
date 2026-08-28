package com.remokeyboard.ime;

import android.Manifest;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.inputmethodservice.InputMethodService;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.text.TextUtils;
import android.view.KeyEvent;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputConnection;
import android.widget.Toast;
import java.util.ArrayList;
import java.util.Locale;

/** خدمة إدخال حقيقية: تكتب مباشرة في الحقل النشط لدى أي تطبيق أندرويد. */
public class RemoInputMethodService extends InputMethodService {
    private SharedPreferences preferences;
    private ClipboardRepository clipboard;
    private RemoKeyboardView keyboardView;
    private SpeechRecognizer speechRecognizer;
    private ClipboardManager systemClipboard;
    private ClipboardManager.OnPrimaryClipChangedListener clipboardListener;

    @Override public void onCreate() {
        super.onCreate();
        preferences = getSharedPreferences("remo_keyboard", Context.MODE_PRIVATE);
        clipboard = new ClipboardRepository(preferences);
        systemClipboard = (ClipboardManager) getSystemService(CLIPBOARD_SERVICE);
        clipboardListener = this::captureSystemClipboard;
        if (systemClipboard != null) systemClipboard.addPrimaryClipChangedListener(clipboardListener);
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
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            Toast.makeText(this, "فعّل إذن الميكروفون من إعدادات ريموكيبورد أولًا", Toast.LENGTH_LONG).show();
            return;
        }
        if (!SpeechRecognizer.isRecognitionAvailable(this)) {
            Toast.makeText(this, "التعرّف الصوتي غير متاح في هذا الجهاز", Toast.LENGTH_LONG).show();
            return;
        }
        endVoiceInput();
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this);
        speechRecognizer.setRecognitionListener(new RecognitionListener() {
            @Override public void onReadyForSpeech(android.os.Bundle params) { Toast.makeText(RemoInputMethodService.this, "تحدث الآن…", Toast.LENGTH_SHORT).show(); }
            @Override public void onBeginningOfSpeech() { }
            @Override public void onRmsChanged(float rmsdB) { }
            @Override public void onBufferReceived(byte[] buffer) { }
            @Override public void onEndOfSpeech() { }
            @Override public void onError(int error) { Toast.makeText(RemoInputMethodService.this, "تعذر تحويل الصوت إلى نص، حاول مجددًا", Toast.LENGTH_SHORT).show(); }
            @Override public void onResults(android.os.Bundle results) {
                ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                if (matches != null && !matches.isEmpty()) commitText(matches.get(0));
                endVoiceInput();
            }
            @Override public void onPartialResults(android.os.Bundle partialResults) { }
            @Override public void onEvent(int eventType, android.os.Bundle params) { }
        });
        android.content.Intent intent = new android.content.Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault().toLanguageTag());
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, false);
        speechRecognizer.startListening(intent);
    }

    private void endVoiceInput() {
        if (speechRecognizer != null) {
            speechRecognizer.destroy();
            speechRecognizer = null;
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
        if (systemClipboard != null && clipboardListener != null) systemClipboard.removePrimaryClipChangedListener(clipboardListener);
        super.onDestroy();
    }
}
