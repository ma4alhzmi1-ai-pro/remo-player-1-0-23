package com.remokeyboard.ime;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.view.View;
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
        secondaryPaint.setTextSize(Math.max(8f, getTextSize() * 0.42f));
        boolean visualLeftToRight = getLayoutDirection() == View.LAYOUT_DIRECTION_LTR;
        secondaryPaint.setTextAlign(visualLeftToRight ? Paint.Align.RIGHT : Paint.Align.LEFT);
        float x = visualLeftToRight ? getWidth() - getPaddingRight() - getTextSize() * 0.15f : getPaddingLeft() + getTextSize() * 0.15f;
        canvas.drawText(secondary, x, getPaddingTop() + getTextSize() * 0.62f, secondaryPaint);
    }
}
