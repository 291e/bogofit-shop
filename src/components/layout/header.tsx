"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Menu } from "lucide-react";
import { useState, useEffect } from "react";

const navLinks = [
  { href: "/products", label: "전체상품" },
  { href: "/event", label: "이벤트" },
  { href: "/about", label: "소개" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  // 모바일 메뉴 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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
        {/* 우측: 유저/장바구니/로그인 (데스크탑) */}
        <div className="hidden md:flex items-center gap-2">
          <Link href="/cart">
            <Button variant="ghost" size="icon" aria-label="장바구니">
              <ShoppingCart className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="icon" aria-label="로그인">
              <User className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" variant="secondary">
              회원가입
            </Button>
          </Link>
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

      {/* 모바일 메뉴 드로어 (헤더 외부로 이동) */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex justify-end"
          onClick={() => setOpen(false)}
        >
          <nav
            className="w-64 h-full min-h-screen bg-white shadow-lg p-6 flex flex-col gap-6 animate-in slide-in-from-right-32"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-4 ">
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
              <Link href="/cart">
                <Button variant="outline" size="icon" aria-label="장바구니">
                  <ShoppingCart className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="icon" aria-label="로그인">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" variant="secondary">
                  회원가입
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
