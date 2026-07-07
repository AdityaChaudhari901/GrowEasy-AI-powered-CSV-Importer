"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction
} from "react";

export type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: Dispatch<SetStateAction<ThemeMode>>;
  toggleTheme: () => void;
};

type ThemeProviderProps = {
  children: ReactNode;
};

const STORAGE_KEY = "groweasy-theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

const isThemeMode = (value: string | null): value is ThemeMode =>
  value === "light" || value === "dark";

const preferredTheme = (): ThemeMode => {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEY);
  if (isThemeMode(storedTheme)) {
    return storedTheme;
  }

  return "light";
};

const applyTheme = (theme: ThemeMode) => {
  document.documentElement.dataset.theme = theme;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initialTheme = preferredTheme();
    applyTheme(initialTheme);
    setTheme(initialTheme);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    applyTheme(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [isReady, theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      setTheme,
      theme,
      toggleTheme: () =>
        setTheme((currentTheme) =>
          currentTheme === "dark" ? "light" : "dark"
        )
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside <ThemeProvider>.");
  }

  return context;
}
