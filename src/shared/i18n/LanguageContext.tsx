"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

import en, { type TranslationKeys } from "./locales/en";
import id from "./locales/id";

/* ── Types ────────────────────────────────────────── */
export type Locale = "en" | "id";

const DICTIONARIES: Record<Locale, TranslationKeys> = { en, id };

interface LanguageContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: TranslationKeys;
}

/* ── Context ──────────────────────────────────────── */
const LanguageContext = createContext<LanguageContextValue>({
  locale: "en",
  setLocale: () => {},
  t: en,
});

/* ── Provider ─────────────────────────────────────── */
const STORAGE_KEY = "orama-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  /* Hydrate from localStorage (client only) */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved && (saved === "en" || saved === "id")) {
        setLocaleState(saved);
      }
    } catch {
      /* SSR or private mode — ignore */
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const value: LanguageContextValue = {
    locale,
    setLocale,
    t: DICTIONARIES[locale],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/* ── Hook ─────────────────────────────────────────── */
export function useTranslation() {
  return useContext(LanguageContext);
}
