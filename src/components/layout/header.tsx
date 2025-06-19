"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, User, LogOut, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useCart } from "@/hooks/useCart";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

const navLinks = [
  { href: "/products", label: "전체상품" },
  { href: "/category/top", label: "상의" },
  { href: "/category/bottom", label: "하의" },
  { href: "/category/outer", label: "아우터" },
  { href: "/category/onepiece", label: "원피스" },
  { href: "/event", label: "이벤트" },
  { href: "/about", label: "소개" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 단일 인증 훅 사용
  const { user, isAuthenticated, logout } = useAuth();

  // 장바구니 훅 사용
  const { cart } = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  // 모바일 메뉴 열릴 때 body 스크롤 방지 - 클라이언트 사이드에서만 실행
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

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  // 디버깅 로그 (필요시에만 사용)
  // console.log({
  //   mounted,
  //   loading,
  //   isAuthenticated,
  //   user: user?.userId || "없음",
  //   userFromQuery: userFromQuery?.userId || "없음",
  // });

  return (
    <>
      <header className="sticky top-0 z-30 w-full h-16 flex items-center justify-between px-4 sm:px-8 backdrop-blur bg-white shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          {/* 좌측: 로고 */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight select-none text-[#D74FDF]">
                BOGOFIT
              </span>
              <Image
                src="/logo.svg"
                alt="브랜드 로고"
                width={30}
                height={30}
                className="rounded-lg"
              />
            </Link>
          </div>
          {/* 중앙: 메뉴 (데스크탑) */}
          <nav className="hidden md:flex gap-6 absolute left-1/2 -translate-x-1/2">
            <div className="relative group">
              <Link
                href="/products"
                className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
              >
                전체상품
              </Link>
            </div>

            {/* 기타 메뉴 */}
            {navLinks.slice(1).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {/* 우측: 장바구니 + 유저/로그인 (데스크탑) */}
          <div className="hidden md:flex items-center gap-6">
            {mounted && isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="유저 메뉴">
                    <span className="text-sm font-semibold mr-2">
                      {user.userId}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/myPage">마이페이지</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-500"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> 로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="icon" aria-label="로그인">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
            )}

            {/* 장바구니 아이콘 */}
            {mounted && isAuthenticated && (
              <Link href="/cart">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="장바구니"
                  className="relative"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cart && cart.totalItems > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {cart.totalItems > 99 ? "99+" : cart.totalItems}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}
          </div>
        </div>
        {/* 모바일: 장바구니 + 햄버거 메뉴 */}
        <div className="md:hidden flex items-center gap-2">
          {/* 모바일 장바구니 아이콘 */}
          {mounted && isAuthenticated && (
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                aria-label="장바구니"
                className="relative"
              >
                <ShoppingCart className="w-6 h-6 text-[#D74FDF]" />
                {cart && cart.totalItems > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {cart.totalItems > 99 ? "99+" : cart.totalItems}
                  </Badge>
                )}
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            aria-label="메뉴 열기"
          >
            <Menu className="w-10 h-10 text-[#D74FDF]" />
          </Button>
        </div>
      </header>

      {/* 모바일 메뉴 드로어 */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex justify-end"
          onClick={() => setOpen(false)}
        >
          <nav
            className="w-80 h-full min-h-screen bg-gradient-to-br from-white via-pink-50 to-purple-50 shadow-2xl p-6 flex flex-col gap-6 animate-in slide-in-from-right-32 border-l border-pink-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 로고 및 닫기 */}
            <div className="flex items-center justify-between pb-4 border-b border-pink-200">
              <span className="font-bold text-xl text-[#D74FDF]">BOGOFIT</span>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* 메뉴 항목들 */}
            <div className="flex flex-col gap-2">
              {/* 전체상품 드롭다운 */}
              <div className="space-y-2">
                <Link
                  href="/products"
                  className="flex items-center justify-between px-4 py-3 text-base font-semibold text-gray-800 hover:text-[#D74FDF] hover:bg-white/50 rounded-xl transition-all"
                  onClick={() => setOpen(false)}
                >
                  <span>전체상품</span>
                </Link>
              </div>

              {/* 기타 메뉴 */}
              {navLinks.slice(1).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center px-4 py-3 text-base font-semibold text-gray-800 hover:text-[#D74FDF] hover:bg-white/50 rounded-xl transition-all"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* 사용자 정보 */}
            <div className="mt-auto pt-6 border-t border-pink-200">
              {mounted && isAuthenticated && user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white/70 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user.userId.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {user.userId}님
                      </p>
                      <p className="text-xs text-gray-500">환영합니다!</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#D74FDF] hover:bg-white/50 rounded-lg transition-all"
                      onClick={() => setOpen(false)}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      내 정보 수정
                    </Link>
                    <Link
                      href="/myPage"
                      className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#D74FDF] hover:bg-white/50 rounded-lg transition-all"
                      onClick={() => setOpen(false)}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      마이페이지
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-all w-full text-left"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      로그아웃
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all"
                  onClick={() => setOpen(false)}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  로그인
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
