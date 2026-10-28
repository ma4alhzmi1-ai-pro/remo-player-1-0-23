package com.remokeyboard.ime;

import android.content.Context;
import android.graphics.Typeface;

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
    private static Typeface emojiTypeface;

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
        List<Item> allMatches = filter(context, "", term);
        if (maxResults <= 0 || allMatches.size() <= maxResults) return allMatches;
        return new ArrayList<>(allMatches.subList(0, maxResults));
    }

    /** يعيد جميع الرموز المطابقة من الفهرس المحلي دون حد اصطناعي للنتائج. */
    static List<Item> filter(Context context, String group, String term) {
        String requestedGroup = group == null ? "" : group.trim();
        String query = term == null ? "" : term.trim().toLowerCase(Locale.ROOT);
        if (requestedGroup.isEmpty() && query.isEmpty()) return all(context);
        List<Item> matches = new ArrayList<>();
        for (Item item : all(context)) {
            boolean inRequestedGroup = requestedGroup.isEmpty() || requestedGroup.equals(item.group);
            boolean matchesQuery = query.isEmpty()
                    || item.name.toLowerCase(Locale.ROOT).contains(query)
                    || item.group.toLowerCase(Locale.ROOT).contains(query)
                    || item.subgroup.toLowerCase(Locale.ROOT).contains(query);
            if (inRequestedGroup && matchesQuery) {
                matches.add(item);
            }
        }
        return matches;
    }

    static synchronized Typeface typeface(Context context) {
        if (emojiTypeface != null) return emojiTypeface;
        try { emojiTypeface = Typeface.createFromAsset(context.getAssets(), "NotoColorEmoji.ttf"); }
        catch (Exception ignored) { emojiTypeface = Typeface.DEFAULT; }
        return emojiTypeface;
    }
}
