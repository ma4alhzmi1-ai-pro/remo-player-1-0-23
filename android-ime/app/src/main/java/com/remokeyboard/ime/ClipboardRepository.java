package com.remokeyboard.ime;

import android.content.SharedPreferences;
import org.json.JSONArray;
import org.json.JSONException;
import java.util.ArrayList;
import java.util.List;

/** حافظة محلية لا تفرض حدًا على طول النص، مع حد للعناصر لحماية الذاكرة. */
final class ClipboardRepository {
    private static final String KEY = "clipboard_entries";
    private static final String PINNED_KEY = "clipboard_pinned";
    private static final int DEFAULT_CAPACITY = 30;
    private final SharedPreferences preferences;

    ClipboardRepository(SharedPreferences preferences) {
        this.preferences = preferences;
    }

    void remember(String value) {
        if (value == null || value.trim().isEmpty()) return;
        List<String> entries = getAll();
        entries.remove(value);
        entries.add(0, value);
        int capacity = preferences.getInt("clipboard_capacity", DEFAULT_CAPACITY);
        while (entries.size() > Math.max(1, capacity)) {
            int removable = entries.size() - 1;
            while (removable >= 0 && isPinned(entries.get(removable))) removable--;
            if (removable < 0) break;
            entries.remove(removable);
        }
        save(entries);
    }

    boolean isPinned(String value) { return getPinned().contains(value); }

    void togglePinned(String value) {
        if (value == null || value.isEmpty()) return;
        List<String> pinned = getPinned();
        if (pinned.contains(value)) pinned.remove(value); else pinned.add(value);
        savePinned(pinned);
    }

    void remove(String value) {
        List<String> entries = getAll();
        entries.remove(value);
        save(entries);
        List<String> pinned = getPinned();
        pinned.remove(value);
        savePinned(pinned);
    }

    void clearUnpinned() {
        List<String> kept = new ArrayList<>();
        for (String entry : getAll()) if (isPinned(entry)) kept.add(entry);
        save(kept);
    }

    List<String> getAll() {
        List<String> entries = new ArrayList<>();
        try {
            JSONArray source = new JSONArray(preferences.getString(KEY, "[]"));
            for (int index = 0; index < source.length(); index++) entries.add(source.getString(index));
        } catch (JSONException ignored) { }
        return entries;
    }

    private List<String> getPinned() {
        List<String> pinned = new ArrayList<>();
        try {
            JSONArray source = new JSONArray(preferences.getString(PINNED_KEY, "[]"));
            for (int index = 0; index < source.length(); index++) pinned.add(source.getString(index));
        } catch (JSONException ignored) { }
        return pinned;
    }

    private void save(List<String> entries) {
        JSONArray target = new JSONArray();
        for (String entry : entries) target.put(entry);
        preferences.edit().putString(KEY, target.toString()).apply();
    }

    private void savePinned(List<String> entries) {
        JSONArray target = new JSONArray();
        for (String entry : entries) target.put(entry);
        preferences.edit().putString(PINNED_KEY, target.toString()).apply();
    }
}
