"use client";

import { Bell, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/providers/authProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { LanguageSelector } from "@/components/(Public)/layout/LanguageSelector";
import { useLanguage } from "@/providers/languageProvider";

export default function BusinessHeader() {
  const { t } = useLanguage();
  const { user, isLoading, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Title Section (Matches Admin) */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">비즈니스 대시보드</h2>
          <p className="text-sm text-gray-500 mt-1">
            BOGOFIT 브랜드 관리 시스템
          </p>
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <LanguageSelector />

          {/* Notifications (Matches Admin) */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {!mounted || isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          ) : user ? (
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              {/* User Info (Matches Admin style) */}
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-transparent">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={undefined} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>{t("header.business.profile")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={logout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t("header.business.logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
