import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, View, useColorScheme as useSystemColorScheme } from "react-native";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";

import { SchemeColors, type ColorScheme } from "@/constants/theme";
import { getAccentTheme, type AccentThemeId } from "@/lib/theme-presets";

type ThemeContextValue = {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  accentTheme: AccentThemeId;
  setAccentTheme: (theme: AccentThemeId) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const ACCENT_THEME_KEY = "remo-player.accent-theme.v1";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme() ?? "light";
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(systemScheme);
  const [accentTheme, setAccentThemeState] = useState<AccentThemeId>("ocean");

  const applyScheme = useCallback((scheme: ColorScheme, accentId: AccentThemeId) => {
    const accent = getAccentTheme(accentId).color;
    nativewindColorScheme.set(scheme);
    Appearance.setColorScheme?.(scheme);
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.dataset.theme = scheme;
      root.classList.toggle("dark", scheme === "dark");
      const palette = SchemeColors[scheme];
      Object.entries(palette).forEach(([token, value]) => {
        root.style.setProperty(`--color-${token}`, String(value));
      });
      root.style.setProperty("--color-primary", accent);
    }
  }, []);

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    applyScheme(scheme, accentTheme);
  }, [accentTheme, applyScheme]);

  const setAccentTheme = useCallback((theme: AccentThemeId) => {
    setAccentThemeState(theme);
    void AsyncStorage.setItem(ACCENT_THEME_KEY, theme);
    applyScheme(colorScheme, theme);
  }, [applyScheme, colorScheme]);

  useEffect(() => {
    void AsyncStorage.getItem(ACCENT_THEME_KEY).then((stored) => {
      if (stored === "ocean" || stored === "violet" || stored === "ember" || stored === "emerald") setAccentThemeState(stored);
    });
  }, []);

  useEffect(() => {
    applyScheme(colorScheme, accentTheme);
  }, [accentTheme, applyScheme, colorScheme]);

  const themeVariables = useMemo(
    () =>
      vars({
        "color-primary": getAccentTheme(accentTheme).color,
        "color-background": SchemeColors[colorScheme].background,
        "color-surface": SchemeColors[colorScheme].surface,
        "color-foreground": SchemeColors[colorScheme].foreground,
        "color-muted": SchemeColors[colorScheme].muted,
        "color-border": SchemeColors[colorScheme].border,
        "color-success": SchemeColors[colorScheme].success,
        "color-warning": SchemeColors[colorScheme].warning,
        "color-error": SchemeColors[colorScheme].error,
      }),
    [accentTheme, colorScheme],
  );

  const value = useMemo(
    () => ({
      colorScheme,
      setColorScheme,
      accentTheme,
      setAccentTheme,
    }),
    [accentTheme, colorScheme, setAccentTheme, setColorScheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={[{ flex: 1 }, themeVariables]}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return ctx;
}
