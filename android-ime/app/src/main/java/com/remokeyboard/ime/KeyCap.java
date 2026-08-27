package com.remokeyboard.ime;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.widget.TextView;

/** مفتاح بطبقتين: حرف أساسي واضح ورمز ثانوي صغير في الزاوية. */
final class KeyCap extends TextView {
    private String secondary = "";
    private final Paint secondaryPaint = new Paint(Paint.ANTI_ALIAS_FLAG);

    KeyCap(Context context) {
        super(context);
        setIncludeFontPadding(false);
    }

    void setKeyLabel(String value) {
        int split = value.indexOf('\n');
        if (split < 0) {
            secondary = "";
            setText(value);
        } else {
            secondary = value.substring(0, split);
            setText(value.substring(split + 1));
        }
    }

    void setSecondaryColor(int color) {
        secondaryPaint.setColor(color);
    }

    @Override protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        if (secondary.isEmpty()) return;
        secondaryPaint.setTypeface(getTypeface());
        secondaryPaint.setTextSize(Math.max(9f, getTextSize() * 0.47f));
        secondaryPaint.setTextAlign(Paint.Align.LEFT);
        canvas.drawText(secondary, getPaddingLeft() + getTextSize() * 0.16f, getTextSize() * 0.80f, secondaryPaint);
    }
}
