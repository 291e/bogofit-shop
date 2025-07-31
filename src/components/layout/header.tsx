"use client";

import React from "react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();
  const isLoggedIn = true; 

  return (
    <div className="fixed top-0 left-0 w-full h-18 bg-gray-800 text-white flex items-center justify-between px-6 text-sm z-50">
      {/* Logo và tên web bên trái */}
      <div className="flex items-center gap-3">
        <Logo
          useImage={true}
          className="h-14 w-14"
          imageSrc="/Logo/BOGOFIT LOGO.png"
          imageAlt="BOGOFIT Logo"
        />
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">BOGOFIT</h1>
          <p className="text-center text-xs text-gray-300 font-medium">Business</p>
        </div>
      </div>

      {/* Bên phải: tuỳ trạng thái đăng nhập */}
      {isLoggedIn ? (
        <div className="flex items-center gap-4 text-gray-200">
          <span className="font-medium text-lg">이름</span>
          <Button
            variant="outline"
            size="sm"
            className="text-white"
          >
            프로필
          </Button>

        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="text-white "
            onClick={() => router.push("/login")}
          >
            로그인
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-white "
            onClick={() => router.push("/register")}
          >
            회원가입
          </Button>
        </div>
      )}
    </div>
  );
}