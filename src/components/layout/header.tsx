"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useCart } from "@/hooks/useCart";
import Image from "next/image";

// 분리된 컴포넌트들 import
import { UserMenu } from "./header/UserMenu";
import { CartButton } from "./header/CartButton";
import { SearchBar } from "./header/SearchBar";

// 데이터 import
import { navLinks } from "@/contents/Header/navLinks";

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
      <header className="sticky top-0 z-30 w-full backdrop-blur bg-white/95 shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* 좌측: 로고 영역 */}
            <div className="flex items-center gap-3 lg:gap-6">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.svg"
                  alt="BOGOFIT"
                  width={48}
                  height={48}
                  className="lg:w-[56px] lg:h-[56px] rounded-lg"
                />
              </Link>

              {/* 브랜드 정보 - 데스크톱만 표시 */}
              <div className="hidden lg:flex flex-col justify-center">
                <div className="flex items-center gap-3 text-base line-seed-kr select-none">
                  <span className="font-bold text-gray-900">BOGOFIT</span>
                  <span className="text-gray-500">BEAUTY</span>
                  <span className="text-gray-300 text-sm">|</span>
                  <span className="text-gray-500">AI STYLING</span>
                </div>
                <div className="flex items-center gap-6 mt-1 text-sm line-seed-kr">
                  <Link
                    href="/recommend"
                    className="text-[#FF84CD] font-medium"
                  >
                    추천
                  </Link>
                  <Link href="/ranking" className="text-gray-600">
                    랭킹
                  </Link>
                  <Link href="/sale" className="text-gray-600">
                    세일
                  </Link>
                  <Link href="/brands" className="text-gray-600">
                    브랜드
                  </Link>
                </div>
              </div>
            </div>

            {/* 우측: 사용자 액션 (데스크톱) */}
            <div className="hidden lg:flex items-center gap-4">
              {/* 검색바 */}
              <SearchBar className="w-64 xl:w-72" />

              {/* 사용자 메뉴 & 장바구니 */}
              <div className="flex items-center gap-2">
                {mounted && (
                  <>
                    {isAuthenticated && user ? (
                      <UserMenu user={user} onLogout={handleLogout} />
                    ) : (
                      <Link href="/login">
                        <Button variant="ghost" size="sm" className="gap-2">
                          <User className="w-4 h-4" />
                          <span className="hidden xl:inline">로그인</span>
                        </Button>
                      </Link>
                    )}
                    {isAuthenticated && <CartButton cart={cart} />}
                  </>
                )}
              </div>
            </div>

            {/* 모바일 액션 버튼들 */}
            <div className="flex lg:hidden items-center gap-2">
              {mounted && <SearchBar isMobile={true} />}
              {mounted && isAuthenticated && <CartButton cart={cart} />}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(true)}
                aria-label="메뉴 열기"
                className="text-[#D74FDF] hover:bg-pink-50"
              >
                <Menu className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 모바일 메뉴 드로어 */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <nav
            className="fixed right-0 top-0 h-full w-full max-w-xs sm:max-w-sm bg-white shadow-xl flex flex-col animate-in slide-in-from-right-32 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="BOGOFIT"
                  width={32}
                  height={32}
                  className="rounded-md"
                />
                <span className="font-bold text-lg text-[#D74FDF]">
                  BOGOFIT
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-gray-100"
              >
                <span className="text-gray-500 text-lg">✕</span>
              </Button>
            </div>

            {/* 메뉴 항목들 */}
            <div className="flex-1 px-4 py-2 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center px-3 py-3 text-base font-medium text-gray-700 hover:text-[#D74FDF] hover:bg-pink-50 rounded-lg transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* 사용자 정보 */}
            <div className="border-t border-gray-200 p-4">
              {mounted && isAuthenticated && user ? (
                <div className="space-y-3">
                  {/* 사용자 프로필 */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user.userId.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {user.userId}님
                      </p>
                      <p className="text-xs text-gray-500">환영합니다!</p>
                    </div>
                  </div>

                  {/* 메뉴 링크들 */}
                  <div className="space-y-1">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-[#D74FDF] hover:bg-pink-50 rounded-lg transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      <User className="w-4 h-4" />내 정보 수정
                    </Link>
                    <Link
                      href="/myPage"
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-[#D74FDF] hover:bg-pink-50 rounded-lg transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      <span className="w-4 h-4 text-center">📋</span>
                      마이페이지
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
                    >
                      <span className="w-4 h-4 text-center">🚪</span>
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
          </nav>
        </div>
      )}
    </>
  );
}
