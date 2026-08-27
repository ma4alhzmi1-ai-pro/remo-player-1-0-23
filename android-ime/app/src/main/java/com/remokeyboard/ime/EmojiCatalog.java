package com.remokeyboard.ime;

import android.content.Context;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

/** فهرس Unicode محلي كبير، يُحمّل من assets عند فتح لوحة الإيموجي فقط. */
final class EmojiCatalog {
    static final class Item {
        final String group;
        final String subgroup;
        final String emoji;
        final String name;

        Item(String group, String subgroup, String emoji, String name) {
            this.group = group;
            this.subgroup = subgroup;
            this.emoji = emoji;
            this.name = name;
        }
    }

    private static List<Item> cached;

    private EmojiCatalog() { }

    static synchronized List<Item> all(Context context) {
        if (cached != null) return cached;
        ArrayList<Item> values = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(context.getAssets().open("emoji_catalog.tsv"), "UTF-8"))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.startsWith("#")) continue;
                String[] fields = line.split("\\t", 4);
                if (fields.length == 4) values.add(new Item(fields[0], fields[1], fields[2], fields[3]));
            }
        } catch (Exception ignored) { }
        cached = Collections.unmodifiableList(values);
        return cached;
    }

    static List<Item> find(Context context, String term, int maxResults) {
        String query = term == null ? "" : term.trim().toLowerCase(Locale.ROOT);
        List<Item> matches = new ArrayList<>();
        for (Item item : all(context)) {
            if (query.isEmpty() || item.name.toLowerCase(Locale.ROOT).contains(query) || item.group.toLowerCase(Locale.ROOT).contains(query)) {
                matches.add(item);
                if (matches.size() >= maxResults) break;
            }
        }
        return matches;
    }
}
