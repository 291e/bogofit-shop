"use client";

import React from "react";
import { useI18n, Locale } from "@/providers/I18nProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

const labels: Record<Locale, string> = {
  ko: "한국어",
  vi: "Tiếng Việt",
  zh: "中文",
};

const flags: Record<Locale, string> = {
  ko: "kr",
  vi: "vn",
  zh: "cn",
};

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="min-w-[128px] justify-between"
          aria-label="Change language"
        >
          <span className="inline-flex items-center gap-2">
            <span className={`fi fi-${flags[locale]} rounded-sm`} aria-hidden />
            {labels[locale]}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(val) => setLocale(val as Locale)}
        >
          {(Object.keys(labels) as Locale[]).map((l) => (
            <DropdownMenuRadioItem key={l} value={l}>
              <span className="inline-flex items-center gap-2">
                <span className={`fi fi-${flags[l]} rounded-sm`} aria-hidden />
                {labels[l]}
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
