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
import { useLanguage } from "@/providers/languageProvider";

// Components
import { SearchBar } from "@/components/(Public)/layout/SearchBar";
import { CartBadge } from "@/components/(Public)/cart/CartBadge";
import { LanguageSelector } from "@/components/(Public)/layout/LanguageSelector";

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
  const [user, setUser] = useState<{ userId: string; name?: string; hasBusinessAccess?: boolean } | null>(null);

  // Hooks
  const pathname = usePathname();
  const { isAuthenticated, logout, getToken } = useAuth();
  const router = useRouter();
  const { t, language } = useLanguage();
  // Effects
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!isAuthenticated || !getToken()) {
      setUser(null);
      return;
    }

    const token = getToken();
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const rawName = payload.name || payload.userId || "User";
      const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();

      // Check business access
      const isBusiness = payload.isBusiness === 'True' || payload.isBusiness === true;
      const isAdmin = payload.isAdmin === 'True' || payload.isAdmin === true;

      const hasAccess = isBusiness || isAdmin;

      setUser({
        userId: payload.userId || payload.sub || "User",
        name: formattedName,
        hasBusinessAccess: hasAccess
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
                  <p>{t("header.goToHome")}</p>
                </TooltipContent>
              </Tooltip>

              <div className="flex flex-col justify-center">
                <div className="flex-col md:flex-row flex items-start md:items-center gap-0 md:gap-3 text-base line-seed-kr select-none">
                  <span className="font-bold text-gray-900">BOGOFIT</span>
                  <Badge variant="outline" className="pt-1 bg-[#ff84cd] text-white">
                    {t("common.tagline")}
                  </Badge>
                </div>
                <div className="hidden md:flex items-center gap-6 mt-1 text-sm line-seed-kr">
                  <Link href="/recommend" className={getNavLinkClassName("/recommend")}>
                    {t("navigation.recommend")}
                  </Link>
                  <Link href="/ranking" className={getNavLinkClassName("/ranking")}>
                    {t("navigation.ranking")}
                  </Link>
                  <Link href="/sale" className={getNavLinkClassName("/sale")}>
                    {t("navigation.sale")}
                  </Link>
                  <Link href="/brands" className={getNavLinkClassName("/brands")}>
                    {t("navigation.brands")}
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Section: Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <SearchBar className="w-64 xl:w-72" />

              <div className="flex items-center gap-2">
                {/* Language Selector */}
                <LanguageSelector />
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
                            <p>{t("header.cart")}</p>
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
                            <p>{t("header.wishlist")}</p>
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
                                <span className="text-xs text-gray-500">{t("user.welcomeMessage")}</span>
                              </div>
                            </div>
                            <DropdownMenuSeparator />
                            {user?.hasBusinessAccess && (
                              <>
                                <DropdownMenuItem asChild>
                                  <Link href="/business" className="flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4" />
                                    {t("header.userMenu.businessDashboard")}
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem asChild>
                              <Link href="/myPage?section=order" className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {t("header.userMenu.orderHistory")}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href="/myPage?section=coupon" className="flex items-center gap-2">
                                <Ticket className="w-4 h-4" />
                                {t("header.userMenu.coupon")}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href="/myPage?section=address" className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {t("header.userMenu.addressBook")}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href="/myPage?section=recent" className="flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4" />
                                {t("header.userMenu.recentlyViewed")}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href="/myPage?section=profile" className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                {t("header.userMenu.editProfile")}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                              <LogOut className="w-4 h-4 mr-2" />
                              {t("common.logout")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    ) : (
                      <Link href="/login">
                        <Button variant="ghost" size="sm" className="gap-2">
                          <User className="w-4 h-4" />
                          <span className="hidden xl:inline">{t("common.login")}</span>
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
              <LanguageSelector />

              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t("header.mobile.openMenu")}
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
                        { href: "/recommend", label: t("navigation.recommend") },
                        { href: "/category", label: t("navigation.category") },
                        { href: "/sale", label: t("navigation.sale") },
                        { href: "/products", label: t("navigation.allProducts") }
                      ].map(({ href, label }) => (
                        <Link
                          key={href}
                          href={href}
                          className={`flex items-center px-3 py-3 text-base font-medium rounded-lg transition-colors ${pathname === href
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
                                {user?.name || user?.userId || t("user.user")}
                                {language === "ko" && "님"}
                              </p>
                              <p className="text-xs text-gray-500">{t("user.welcomeMessage")}</p>
                            </div>
                          </div>

                          {/* User Menu Links */}
                          <div className="space-y-1">
                            {user?.hasBusinessAccess && (
                              <Link
                                href="/business"
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-blue-600 bg-blue-50 hover:text-blue-700 hover:bg-blue-100 mb-1"
                                onClick={() => setOpen(false)}
                              >
                                <ShoppingBag className="w-4 h-4" />
                                {t("header.userMenu.businessDashboard") || "Business Dashboard"}
                              </Link>
                            )}
                            {[
                              { href: "/myPage?section=order", icon: Clock, label: t("header.userMenu.orderHistory") },
                              { href: "/myPage?section=coupon", icon: Ticket, label: t("header.userMenu.coupon") },
                              { href: "/myPage?section=address", icon: MapPin, label: t("header.userMenu.addressBook") },
                              { href: "/myPage?section=recent", icon: ShoppingBag, label: t("header.userMenu.recentlyViewed") },
                              { href: "/myPage?section=profile", icon: User, label: t("header.userMenu.editProfile") }
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
                              {t("common.logout")}
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
                          {t("common.login")}
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
