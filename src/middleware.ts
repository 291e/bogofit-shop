import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 인증이 필요한 경로들
const protectedPaths = [
  '/business/brands',
  '/test-upload'
];

// 인증된 사용자가 접근하면 안되는 경로들 (로그인, 회원가입 등)
const authPaths = [
  '/login'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 쿠키에서 토큰 가져오기
  const token = request.cookies.get('auth_token')?.value;
  
  // 보호된 경로 체크
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAuthPath = authPaths.some(path => pathname === path);
  const isBusinessAuthPath = pathname === '/business';
  
  // 1. 보호된 경로에 토큰 없이 접근 시 적절한 로그인 페이지로 리디렉션
  if (isProtectedPath && !token) {
    // Business 관련 경로는 /business로 리디렉션
    if (pathname.startsWith('/business')) {
      console.log('🔒 Business 인증 필요:', pathname, '→ /business로 리디렉션');
      return NextResponse.redirect(new URL('/business', request.url));
    }
    // 다른 경로는 /login으로 리디렉션
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    console.log('🔒 인증 필요:', pathname, '→ /login으로 리디렉션');
    return NextResponse.redirect(loginUrl);
  }
  
  // 2. 로그인된 상태에서 Public 로그인 페이지 접근 시 홈으로 리디렉션
  if (isAuthPath && token) {
    console.log('✅ 이미 로그인됨:', pathname, '→ 홈으로 리디렉션');
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // 3. 로그인된 상태에서 Business 로그인 페이지 접근 시 brands로 리디렉션
  if (isBusinessAuthPath && token) {
    console.log('✅ Business 이미 로그인됨:', pathname, '→ /business/brands로 리디렉션');
    return NextResponse.redirect(new URL('/business/brands', request.url));
  }
  
  // 4. 정상적인 접근 허용
  return NextResponse.next();
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: [
    /*
     * 다음을 제외한 모든 경로에 매칭:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public 폴더의 파일들 (.html, .png, .svg, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.html|.*\\.png|.*\\.svg|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.ico|.*\\.woff|.*\\.woff2|.*\\.ttf|.*\\.css|.*\\.js).*)',
  ],
};

