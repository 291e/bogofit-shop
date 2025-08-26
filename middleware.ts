import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/jwt-server";

// 인증이 필요한 경로들
const protectedPaths = [
  "/myPage",
  "/cart",
  "/order",
  "/payment",
  "/profile",
  "/address",
];

// 사업자 전용 경로들
const businessPaths = ["/business"];

// 관리자 전용 경로들
const adminPaths = ["/admin"];

// 인증된 사용자가 접근하면 안 되는 경로들 (로그인, 회원가입 등)
const publicOnlyPaths = ["/login", "/register", "/reset-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API 경로는 미들웨어에서 처리하지 않음 (각 API에서 개별 처리)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // 정적 파일들은 처리하지 않음
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/public/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  try {
    // 쿠키에서 사용자 정보 가져오기
    const user = await getUserFromRequest(request);
    const isAuthenticated = !!user;

    console.log("[Middleware]", {
      pathname,
      isAuthenticated,
      user: user
        ? {
            userId: user.userId,
            isBusiness: user.isBusiness,
            isAdmin: user.isAdmin,
          }
        : null,
    });

    // 인증된 사용자가 public-only 경로에 접근하는 경우
    if (
      isAuthenticated &&
      publicOnlyPaths.some((path) => pathname.startsWith(path))
    ) {
      const redirectUrl = new URL("/", request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // 관리자 전용 경로 체크
    if (adminPaths.some((path) => pathname.startsWith(path))) {
      if (!isAuthenticated) {
        const redirectUrl = new URL("/login", request.url);
        redirectUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(redirectUrl);
      }

      if (!user.isAdmin) {
        const redirectUrl = new URL("/", request.url);
        return NextResponse.redirect(redirectUrl);
      }
    }

    // 사업자 전용 경로 체크
    if (businessPaths.some((path) => pathname.startsWith(path))) {
      if (!isAuthenticated) {
        const redirectUrl = new URL("/login", request.url);
        redirectUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(redirectUrl);
      }

      if (!user.isBusiness) {
        const redirectUrl = new URL("/", request.url);
        return NextResponse.redirect(redirectUrl);
      }
    }

    // 일반 보호된 경로 체크
    if (protectedPaths.some((path) => pathname.startsWith(path))) {
      if (!isAuthenticated) {
        const redirectUrl = new URL("/login", request.url);
        redirectUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(redirectUrl);
      }
    }

    // 사용자 정보를 헤더에 추가 (서버 컴포넌트에서 사용 가능)
    const requestHeaders = new Headers(request.headers);
    if (user) {
      requestHeaders.set("x-user-id", user.userId);
      requestHeaders.set(
        "x-user-data",
        encodeURIComponent(JSON.stringify(user))
      );
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error("[Middleware] 오류:", error);

    // 인증 오류 시 보호된 경로는 로그인 페이지로 리다이렉트
    if (
      protectedPaths.some((path) => pathname.startsWith(path)) ||
      businessPaths.some((path) => pathname.startsWith(path)) ||
      adminPaths.some((path) => pathname.startsWith(path))
    ) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
