"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useBusiness } from "@/hooks/useBusiness";
import { Bell, Search, Menu, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface BusinessHeaderProps {
  onMenuClick?: () => void;
}

export default function BusinessHeader({ onMenuClick }: BusinessHeaderProps) {
  const { user, logout } = useAuth();
  const { business } = useBusiness();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      {/* 왼쪽: 메뉴 버튼 & 브랜드명 */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {business?.businessName || "비즈니스 관리자"}
          </h1>
          <p className="text-sm text-gray-500">
            {business?.businessType === "BRAND" && "브랜드"}
            {business?.businessType === "RETAILER" && "리테일러"}
            {business?.businessType === "MARKETPLACE" && "마켓플레이스"}
            {business?.businessType === "DISTRIBUTOR" && "유통업체"}
          </p>
        </div>
      </div>

      {/* 오른쪽: 검색, 알림, 프로필 */}
      <div className="flex items-center gap-4">
        {/* 검색 */}
        <div className="hidden md:flex items-center">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="검색..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 알림 */}
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
        </Button>

        {/* 프로필 드롭다운 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={(user?.profile as string) || ""}
                  alt={(user?.name as string) || ""}
                />
                <AvatarFallback>
                  {(user?.name as string)?.charAt(0) ||
                    (user?.userId as string)?.charAt(0) ||
                    "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <div className="flex flex-col space-y-1 p-2">
              <p className="text-sm font-medium leading-none">
                {(user?.name as string) || (user?.userId as string) || "사용자"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {(user?.email as string) || ""}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>프로필</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>설정</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>로그아웃</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 알림 패널 */}
      {showNotifications && (
        <div className="absolute top-16 right-6 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium">알림</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm">새로운 주문이 들어왔습니다.</p>
                  <p className="text-xs text-gray-500">5분 전</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm">상품이 승인되었습니다.</p>
                  <p className="text-xs text-gray-500">1시간 전</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
