"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";

const navLinks = [
  { href: "/products", label: "전체상품" },
  { href: "/event", label: "이벤트" },
  { href: "/about", label: "소개" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 단일 인증 훅 사용
  const { user, isAuthenticated, logout } = useAuth();

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
        {/* 좌측: 로고 */}
        <div className="flex items-center gap-2">
          <Link href="/">
            <span className="font-bold text-xl tracking-tight select-none text-[#D74FDF]">
              BOGOFIT
            </span>
          </Link>
        </div>
        {/* 중앙: 메뉴 (데스크탑) */}
        <nav className="hidden md:flex gap-6 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {/* 우측: 유저/로그인 (데스크탑) */}
        <div className="hidden md:flex items-center gap-2">
          {mounted && isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Link href="/profile">
                <span className="text-sm font-semibold mr-2">
                  {user.userId}
                </span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                aria-label="로그아웃"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="icon" aria-label="로그인">
                <User className="w-5 h-5" />
              </Button>
            </Link>
          )}
        </div>
        {/* 모바일: 햄버거 메뉴 */}
        <div className="md:hidden flex items-center">
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
            className="w-64 h-full min-h-screen bg-white shadow-lg p-6 flex flex-col gap-6 animate-in slide-in-from-right-32"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-base font-semibold hover:text-primary transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex gap-2 mt-8">
              {mounted && isAuthenticated && user ? (
                <div className="flex flex-col gap-2">
                  <Link href="/profile" onClick={() => setOpen(false)}>
                    <span className="text-sm font-semibold mr-2 text-[#D74FDF]">
                      {user.userId}님
                    </span>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleLogout();
                      setOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    로그아웃
                  </Button>
                </div>
              ) : (
                <Link href="/login" onClick={() => setOpen(false)}>
                  <Button variant="ghost" size="icon" aria-label="로그인">
                    <User className="w-5 h-5" />
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
