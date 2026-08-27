package com.remokeyboard.ime;

import android.content.SharedPreferences;
import org.json.JSONArray;
import org.json.JSONException;
import java.util.ArrayList;
import java.util.List;

/** حافظة محلية لا تفرض حدًا على طول النص، مع حد للعناصر لحماية الذاكرة. */
final class ClipboardRepository {
    private static final String KEY = "clipboard_entries";
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
        while (entries.size() > Math.max(1, capacity)) entries.remove(entries.size() - 1);
        save(entries);
    }

    List<String> getAll() {
        List<String> entries = new ArrayList<>();
        try {
            JSONArray source = new JSONArray(preferences.getString(KEY, "[]"));
            for (int index = 0; index < source.length(); index++) entries.add(source.getString(index));
        } catch (JSONException ignored) { }
        return entries;
    }

    private void save(List<String> entries) {
        JSONArray target = new JSONArray();
        for (String entry : entries) target.put(entry);
        preferences.edit().putString(KEY, target.toString()).apply();
    }
}
