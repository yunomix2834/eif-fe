"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { DEFAULT_THEME_ACCENT, isThemeAccent } from "@global/utils/color";

export type ThemeMode = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemeMode) => void;
  accent: string;
  setAccent: (accent: string) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const THEME_KEY = "eif:theme";
const ACCENT_KEY = "eif:accent";
const SETTINGS_EVENT = "eif:theme-settings-change";

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

function subscribeSettings(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(SETTINGS_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(SETTINGS_EVENT, onChange);
  };
}

function getThemeSnapshot(): ThemeMode {
  const value = window.localStorage.getItem(THEME_KEY);
  return isThemeMode(value) ? value : "system";
}

function getAccentSnapshot(): string {
  const value = window.localStorage.getItem(ACCENT_KEY);
  return isThemeAccent(value) ? value : DEFAULT_THEME_ACCENT;
}

function subscribeColorScheme(onChange: () => void): () => void {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function isDarkModePreferredSnapshot(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getThemeServerSnapshot(): ThemeMode {
  return "system";
}

function getAccentServerSnapshot(): string {
  return DEFAULT_THEME_ACCENT;
}

function isDarkModePreferredServerSnapshot(): boolean {
  return false;
}

function emitSettingsChange(): void {
  window.dispatchEvent(new Event(SETTINGS_EVENT));
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeSettings,
    getThemeSnapshot,
    getThemeServerSnapshot,
  );
  const accent = useSyncExternalStore(
    subscribeSettings,
    getAccentSnapshot,
    getAccentServerSnapshot,
  );
  const prefersDark = useSyncExternalStore(
    subscribeColorScheme,
    isDarkModePreferredSnapshot,
    isDarkModePreferredServerSnapshot,
  );

  const resolvedTheme =
    theme === "system" ? (prefersDark ? "dark" : "light") : theme;

  useEffect(() => {
    // Đọc trực tiếp snapshot thật từ browser thay vì dùng server snapshot của
    // hydration. Nhờ vậy React không ghi đè màu đã bootstrap trong <head>
    // bằng màu mặc định trong một frame rồi mới đổi lại.
    const actualTheme = getThemeSnapshot();
    const actualPrefersDark = isDarkModePreferredSnapshot();
    const actualResolvedTheme =
      actualTheme === "system"
        ? actualPrefersDark
          ? "dark"
          : "light"
        : actualTheme;

    document.documentElement.dataset.theme = actualResolvedTheme;
    document.documentElement.style.setProperty("--accent", getAccentSnapshot());
    document.documentElement.dataset.themeReady = "true";
  }, [resolvedTheme, accent]);

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    window.localStorage.setItem(THEME_KEY, nextTheme);
    emitSettingsChange();
  }, []);

  const setAccent = useCallback((nextAccent: string) => {
    if (!isThemeAccent(nextAccent)) return;
    window.localStorage.setItem(ACCENT_KEY, nextAccent);
    emitSettingsChange();
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, accent, setAccent }),
    [theme, resolvedTheme, setTheme, accent, setAccent],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
