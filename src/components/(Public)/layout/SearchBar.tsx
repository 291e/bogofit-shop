"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useLanguage } from "@/providers/languageProvider";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  isMobile?: boolean;
}

export function SearchBar({
  className = "",
  placeholder,
  isMobile = false,
}: SearchBarProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(!isMobile);
  
  const searchPlaceholder = placeholder || t("search.placeholder");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      if (isMobile) {
        setIsExpanded(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && isMobile) {
      setIsExpanded(false);
      setSearchQuery("");
    }
  };

  if (isMobile && !isExpanded) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsExpanded(true)}
        aria-label={t("search.button")}
      >
        <Search className="w-5 h-5 text-[#D74FDF]" />
      </Button>
    );
  }

  if (isMobile && isExpanded) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        <div className="flex items-center gap-2 p-4 border-b">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsExpanded(false);
              setSearchQuery("");
            }}
            aria-label={t("search.close")}
          >
            <X className="w-5 h-5" />
          </Button>
          <form onSubmit={handleSearch} className="flex-1">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              className="w-full h-10"
              autoFocus
            />
          </form>
          <Button
            type="button"
            onClick={handleSearch}
            disabled={!searchQuery.trim()}
            className="bg-[#D74FDF] hover:bg-[#B83DCF] text-white"
          >
            {t("search.button")}
          </Button>
        </div>
        {/* 검색 제안이나 최근 검색어 등을 추가할 수 있는 공간 */}
        <div className="flex-1 p-4">
          <p className="text-gray-500 text-sm">{t("search.instruction")}</p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSearch}
      className={`flex items-center gap-2 ${className}`}
    >
      <div className="relative flex-1">
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={searchPlaceholder}
          className="pl-3 pr-10 h-9 rounded-full ring-0"
        />
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
          disabled={!searchQuery.trim()}
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}
