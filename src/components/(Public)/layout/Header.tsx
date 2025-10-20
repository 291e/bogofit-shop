"use client";

// React & Next.js
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// Icons
import { 
  Menu, 
  User, 
  Clock, 
  Ticket, 
  MapPin, 
  ShoppingBag, 
  LogOut, 
  Heart 
} from "lucide-react";

// Hooks
import { useAuth } from "@/providers/authProvider";

// Components
import { SearchBar } from "@/components/(Public)/layout/SearchBar";
import { CartBadge } from "@/components/(Public)/cart/CartBadge";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

export default function Header() {
  // State
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ userId: string; name?: string } | null>(null);

  // Hooks
  const pathname = usePathname();
  const { isAuthenticated, logout, getToken } = useAuth();
  const router = useRouter();
  // Effects
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setUser(null);
      return;
    }
    
    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const rawName = payload.name || payload.userId || "User";
      const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();
      
      setUser({
        userId: payload.userId || payload.sub || "User",
        name: formattedName
      });
    } catch (error) {
      console.error("Error decoding token:", error);
      setUser({ userId: "User" });
    }
  }, [isAuthenticated, getToken]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Event Handlers
  const handleLogout = useCallback(async () => {
    logout();
    router.replace("/");
  }, [logout, router]);

  // Helper functions
  const getNavLinkClassName = (path: string) => 
    pathname === path
      ? "text-[#FF84CD] font-medium"
      : "text-gray-600 hover:text-[#FF84CD] transition-colors";

  const getUserInitial = () => 
    ((user?.name || user?.userId)?.charAt(0) || "U").toUpperCase();

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-30 w-full backdrop-blur bg-white/95 shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* Left Section: Logo & Brand */}
            <div className="flex items-center gap-3 lg:gap-6">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/" className="flex items-center">
                    <Image
                      src="/logo.svg"
                      alt="BOGOFIT"
                      width={48}
                      height={48}
                      className="lg:w-[56px] lg:h-[56px] rounded-lg"
                    />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>BOGOFIT 홈으로 이동</p>
                </TooltipContent>
              </Tooltip>

              <div className="flex flex-col justify-center">
                <div className="flex-col md:flex-row flex items-start md:items-center gap-0 md:gap-3 text-base line-seed-kr select-none">
                  <span className="font-bold text-gray-900">BOGOFIT</span>
                  <Badge variant="outline" className="pt-1 bg-[#ff84cd] text-white">
                    피트니스 브랜드
                  </Badge>
                </div>
                <div className="hidden md:flex items-center gap-6 mt-1 text-sm line-seed-kr">
                  <Link href="/recommend" className={getNavLinkClassName("/recommend")}>
                    추천
                  </Link>
                  <Link href="/ranking" className={getNavLinkClassName("/ranking")}>
                    랭킹
                  </Link>
                  <Link href="/sale" className={getNavLinkClassName("/sale")}>
                    세일
                  </Link>
                  <Link href="/brands" className={getNavLinkClassName("/brands")}>
                    브랜드
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Section: Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <SearchBar className="w-64 xl:w-72" />

              <div className="flex items-center gap-2">
                {mounted && (
                  <>
                    {isAuthenticated ? (
                      <>
                        {/* Shopping Cart Button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <CartBadge />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>장바구니</p>
                          </TooltipContent>
                        </Tooltip>

                        {/* Wishlist Button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Heart className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>찜한 상품</p>
                          </TooltipContent>
                        </Tooltip>

                        {/* User Dropdown Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src="" alt={user?.name} />
                                <AvatarFallback className="text-xs bg-gradient-to-r from-pink-400 to-purple-400 text-white">
                                  {getUserInitial()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="hidden xl:inline text-sm font-medium">
                                {user?.name || user?.userId}
                              </span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <div className="flex items-center gap-2 p-2">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src="" alt={user?.name} />
                                <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-400 text-white">
                                  {getUserInitial()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{user?.name || user?.userId}</span>
                                <span className="text-xs text-gray-500">환영합니다!</span>
                              </div>
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href="/myPage?section=order" className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                주문 내역
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href="/myPage?section=coupon" className="flex items-center gap-2">
                                <Ticket className="w-4 h-4" />
                                쿠폰
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href="/myPage?section=address" className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                주소록
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href="/myPage?section=recent" className="flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4" />
                                최근 본 상품
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href="/myPage?section=profile" className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                프로필 수정
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                              <LogOut className="w-4 h-4 mr-2" />
                              로그아웃
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    ) : (
                      <Link href="/login">
                        <Button variant="ghost" size="sm" className="gap-2">
                          <User className="w-4 h-4" />
                          <span className="hidden xl:inline">로그인</span>
                        </Button>
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Mobile Section */}
            <div className="flex md:hidden items-center gap-2">
              {mounted && <SearchBar isMobile={true} />}
              
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="메뉴 열기"
                    className="text-[#D74FDF] hover:bg-pink-50"
                  >
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-sm">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <Image
                        src="/logo.png"
                        alt="BOGOFIT"
                        width={24}
                        height={24}
                        className="rounded-md"
                      />
                      <span className="font-bold text-lg text-[#D74FDF]">
                        BOGOFIT
                      </span>
                    </SheetTitle>
                  </SheetHeader>
                  
                  <div className="flex flex-col h-full">
                    {/* Navigation Links */}
                    <div className="flex-1 px-2 py-4 space-y-2">
                      {[
                        { href: "/recommend", label: "추천" },
                        { href: "/category", label: "카테고리" },
                        { href: "/sale", label: "세일" },
                        { href: "/products", label: "전체상품" }
                      ].map(({ href, label }) => (
                        <Link
                          key={href}
                          href={href}
                          className={`flex items-center px-3 py-3 text-base font-medium rounded-lg transition-colors ${
                            pathname === href
                              ? "text-[#FF84CD] bg-pink-50"
                              : "text-gray-700 hover:text-[#FF84CD] hover:bg-pink-50"
                          }`}
                          onClick={() => setOpen(false)}
                        >
                          {label}
                        </Link>
                      ))}
                    </div>

                    <Separator />

                    {/* User Section */}
                    <div className="p-4">
                      {mounted && isAuthenticated ? (
                        <div className="space-y-3">
                          {/* User Profile */}
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src="" alt={user?.name} />
                              <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-400 text-white">
                                {getUserInitial()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">
                                {user?.name || user?.userId || "사용자"}님
                              </p>
                              <p className="text-xs text-gray-500">환영합니다!</p>
                            </div>
                          </div>

                          {/* User Menu Links */}
                          <div className="space-y-1">
                            {[
                              { href: "/myPage?section=order", icon: Clock, label: "주문 내역" },
                              { href: "/myPage?section=coupon", icon: Ticket, label: "쿠폰" },
                              { href: "/myPage?section=address", icon: MapPin, label: "주소록" },
                              { href: "/myPage?section=recent", icon: ShoppingBag, label: "최근 본 상품" },
                              { href: "/myPage?section=profile", icon: User, label: "프로필 수정" }
                            ].map(({ href, icon: Icon, label }) => (
                              <Link
                                key={href}
                                href={href}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-gray-600 hover:text-[#FF84CD] hover:bg-pink-50"
                                onClick={() => setOpen(false)}
                              >
                                <Icon className="w-4 h-4" />
                                {label}
                              </Link>
                            ))}
                            <button
                              onClick={async () => {
                                await handleLogout();
                                setOpen(false);
                              }}
                              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
                            >
                              <LogOut className="w-4 h-4" />
                              로그아웃
                            </button>
                          </div>
                        </div>
                      ) : (
                        <Link
                          href="/login"
                          className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all shadow-md"
                          onClick={() => setOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          로그인
                        </Link>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

    </TooltipProvider>
  );
}
