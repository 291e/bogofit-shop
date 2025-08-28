import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, Clock, Ticket, MapPin, User, ShoppingBag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  user: { userId: string };
  onLogout: () => Promise<void>;
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 hover:bg-gray-100 p-2 focus-visible:ring-0"
          aria-label="유저 메뉴"
        >
          {/* 사용자 프로필 아바타 */}
          <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {(user?.userId?.charAt(0) || "U").toUpperCase()}
            </span>
          </div>
          <span className="font-medium text-gray-900 hidden xl:inline">
            {user?.userId || "사용자"}님
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* 사용자 정보 헤더 */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none">
              {user?.userId || "사용자"}님
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              보고핏과 함께해요!
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* 나의 쇼핑 정보 */}
        <DropdownMenuItem asChild>
          <Link href="/myPage?section=order" className="cursor-pointer">
            <Clock className="w-4 h-4 mr-2" />
            주문 내역 조회
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/myPage?section=coupon" className="cursor-pointer">
            <Ticket className="w-4 h-4 mr-2" />
            쿠폰 내역
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/myPage?section=address" className="cursor-pointer">
            <MapPin className="w-4 h-4 mr-2" />
            배송 주소록 관리
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* 활동 정보 */}
        <DropdownMenuItem asChild>
          <Link href="/myPage?section=recent" className="cursor-pointer">
            <ShoppingBag className="w-4 h-4 mr-2" />
            최근 본 상품
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* 나의 정보 */}
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <User className="w-4 h-4 mr-2" />
            회원 정보 수정
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onLogout}
          className="text-red-500 cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-2" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
