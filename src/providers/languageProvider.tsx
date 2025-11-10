"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getTranslations, t, type Language } from "@/i18n";

const LANGUAGE_STORAGE_KEY = "bogofit_language";
const DEFAULT_LANGUAGE: Language = "ko";

const languageNames: Record<Language, string> = {
    en: "English",
    vi: "Tiếng Việt",
    ko: "한국어",
    zh: "中文",
};

interface LanguageContextType {
    language: Language;
    languageName: string;
    changeLanguage: (lang: Language) => void;
    mounted: boolean;
    languageNames: Record<Language, string>;
    translations: ReturnType<typeof getTranslations>;
    t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Load language from localStorage
        const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
        if (stored && (stored === "en" || stored === "vi" || stored === "ko" || stored === "zh")) {
            setLanguage(stored);
        }
    }, []);

    const changeLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
        // Update HTML lang attribute
        if (typeof document !== "undefined") {
            document.documentElement.lang = lang;
        }
    };

    const translations = getTranslations(language);
    const translate = (key: string, params?: Record<string, string | number>) => {
        let translated = t(language, key);
        if (params) {
            Object.entries(params).forEach(([paramKey, paramValue]) => {
                translated = translated.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
            });
        }
        return translated;
    };

    return (
        <LanguageContext.Provider
            value={{
                language,
                languageName: languageNames[language],
                changeLanguage,
                mounted,
                languageNames,
                translations,
                t: translate,
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}

