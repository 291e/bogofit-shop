"use client";

import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import ko from "@/i18n/locales/ko.json";
import vi from "@/i18n/locales/vi.json";
import zh from "@/i18n/locales/zh.json";

export type Locale = "ko" | "vi" | "zh";

type MessageValue = string | { [key: string]: MessageValue };
type Messages = Record<string, MessageValue>;

const dictionaries: Record<Locale, Messages> = { ko, vi, zh } as const;

interface I18nContextValue {
  locale: Locale;
  t: (key: string) => string;
  setLocale: (l: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("ko");

  // hydrate from localStorage
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("app-locale");
      if (saved === "ko" || saved === "vi" || saved === "zh") {
        setLocale(saved);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("app-locale", locale);
      // Update document lang attribute
      if (typeof document !== "undefined") {
        document.documentElement.lang = locale === "ko" ? "ko" : locale === "vi" ? "vi" : "zh";
      }
    } catch {}
  }, [locale]);

  const t = useMemo(() => {
    const dict = dictionaries[locale] || {};
    const getByPath = (obj: MessageValue, path: string): MessageValue | undefined => {
      if (!obj) return undefined;
      if (Object.prototype.hasOwnProperty.call(obj, path)) return (obj as Record<string, MessageValue>)[path];
      const parts = path.split(".");
      let cur: MessageValue = obj;
      for (const p of parts) {
        if (cur && typeof cur === "object" && p in cur) {
          cur = (cur as Record<string, MessageValue>)[p];
        } else {
          return undefined;
        }
      }
      return cur;
    };
    return (key: string) => {
      const val = getByPath(dict, key);
      return typeof val === "string" ? val : key;
    };
  }, [locale]);

  const value = useMemo(() => ({ locale, t, setLocale }), [locale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
