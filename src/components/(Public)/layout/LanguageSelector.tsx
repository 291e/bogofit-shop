"use client";

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/providers/languageProvider";
import type { Language } from "@/i18n";
import { Check } from "lucide-react";

const languages: { 
  code: Language; 
  nameKey: string;
  nativeNameKey: string;
  flag: string;
  flagClass: string;
}[] = [
  { code: "en", nameKey: "language.english", nativeNameKey: "language.englishNative", flag: "🇬🇧", flagClass: "fi fi-gb" },
  { code: "vi", nameKey: "language.vietnamese", nativeNameKey: "language.vietnameseNative", flag: "🇻🇳", flagClass: "fi fi-vn" },
  { code: "ko", nameKey: "language.korean", nativeNameKey: "language.koreanNative", flag: "🇰🇷", flagClass: "fi fi-kr" },
  { code: "zh", nameKey: "language.chinese", nativeNameKey: "language.chineseNative", flag: "🇨🇳", flagClass: "fi fi-cn" },
];

export function LanguageSelector() {
  const { language, changeLanguage, mounted, t } = useLanguage();

  if (!mounted) {
    return null;
  }

  const currentLanguage = languages.find((lang) => lang.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          aria-label={t("language.selectLanguage")}
        >
          {currentLanguage ? (
            <span className={`${currentLanguage.flagClass} text-lg`} />
          ) : (
            <Globe className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className="flex items-center justify-between cursor-pointer gap-2"
          >
            <div className="flex items-center gap-3 flex-1">
              <span className={`${lang.flagClass} text-xl shrink-0`} />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{t(lang.nativeNameKey)}</span>
                <span className="text-xs text-muted-foreground">{t(lang.nameKey)}</span>
              </div>
            </div>
            {language === lang.code && (
              <Check className="h-4 w-4 text-[#FF84CD] shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

