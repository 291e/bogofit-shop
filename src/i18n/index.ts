import enTranslations from "./en.json";
import viTranslations from "./vi.json";
import koTranslations from "./ko.json";
import zhTranslations from "./zh.json";

export type Language = "en" | "vi" | "ko" | "zh";

export const translations = {
    en: enTranslations,
    vi: viTranslations,
    ko: koTranslations,
    zh: zhTranslations,
} as const;

export function getTranslations(language: Language) {
    return translations[language];
}

export function t(language: Language, key: string): string {
    const keys = key.split(".");
    let value: unknown = translations[language];

    for (const k of keys) {
        if (typeof value === 'object' && value !== null && k in value) {
            value = (value as Record<string, unknown>)[k];
        } else {
            value = undefined;
        }
        if (value === undefined) {
            // Fallback to Korean if translation not found
            value = translations.ko;
            for (const fallbackKey of keys) {
                if (typeof value === 'object' && value !== null && fallbackKey in value) {
                    value = (value as Record<string, unknown>)[fallbackKey];
                } else {
                    value = undefined;
                }
            }
            break;
        }
    }

    return typeof value === 'string' ? value : key;
}

