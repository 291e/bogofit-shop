import { NextRequest, NextResponse } from "next/server";
import { createJWT, setAuthCookie } from "@/lib/jwt-server";
import { decodeGraphQLToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, password, isBusiness = false, graphqlToken } = body;

    console.log("[Auth Login] 요청 데이터:", {
      userId,
      passwordLength: password?.length,
      isBusiness,
      hasGraphqlToken: !!graphqlToken,
    });

    if (!userId) {
      return NextResponse.json(
        { error: "아이디가 필요합니다" },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "비밀번호가 필요합니다" },
        { status: 400 }
      );
    }

    // GraphQL 토큰을 통한 로그인 처리
    if (password === "graphql" && graphqlToken) {
      console.log("[Auth Login] GraphQL 토큰 처리 시작");

      const decodedPayload = decodeGraphQLToken(graphqlToken);
      console.log("[Auth Login] 디코딩된 토큰 페이로드:", decodedPayload);

      if (!decodedPayload || !decodedPayload.id) {
        console.log("[Auth Login] 토큰 디코딩 실패");
        return NextResponse.json(
          { error: "유효하지 않은 토큰입니다" },
          { status: 401 }
        );
      }

      // 토큰의 사용자 ID로 DB에서 사용자 정보 조회
      const user = await prisma.user.findUnique({
        where: { id: decodedPayload.id },
        include: {
          brand: {
            select: {
              id: true,
              name: true,
              status: true,
              isActive: true,
            },
          },
        },
      });

      if (!user) {
        console.log("[Auth Login] GraphQL 토큰의 사용자를 찾을 수 없음");
        return NextResponse.json(
          { error: "사용자를 찾을 수 없습니다" },
          { status: 401 }
        );
      }

      // JWT 토큰 생성 및 응답
      const token = await createJWT({
        userId: user.id,
        email: user.email,
        name: user.name || user.userId,
        isBusiness: user.isBusiness || false,
        brandId: user.brand?.id,
      });

      const response = NextResponse.json({
        success: true,
        message: "로그인 성공",
        user: {
          id: user.id,
          userId: user.userId,
          email: user.email,
          name: user.name || user.userId,
          isBusiness: user.isBusiness || false,
          brand: user.brand,
        },
      });

      setAuthCookie(response, token);
      return response;
    }

    // Prisma 직접 로그인 처리
    console.log("[Auth Login] 사용자 조회 시작:", userId);
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ userId: userId }, { email: userId }],
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            status: true,
            isActive: true,
          },
        },
      },
    });

    console.log("[Auth Login] 사용자 조회 결과:", {
      found: !!user,
      userId: user?.userId,
      email: user?.email,
      isBusiness: user?.isBusiness,
    });

    if (!user) {
      console.log("[Auth Login] 사용자를 찾을 수 없음:", userId);
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다" },
        { status: 401 }
      );
    }

    // 비밀번호 검증 (OAuth 로그인은 특수 플래그로 스킵)
    if (password !== "oauth") {
      console.log("[Auth Login] 비밀번호 검증 시작:", {
        inputPassword: password,
        hasStoredPassword: !!user.password,
        storedPasswordLength: user.password?.length,
        isPasswordHashed:
          user.password?.startsWith("$2b$") ||
          user.password?.startsWith("$2a$"),
      });

      if (!user.password) {
        console.log(
          "[Auth Login] 저장된 비밀번호가 없음 - GraphQL 로그인 필요"
        );
        return NextResponse.json(
          {
            error: "GraphQL_LOGIN_REQUIRED",
            message: "GraphQL 로그인이 필요한 계정입니다",
          },
          { status: 422 } // Unprocessable Entity - GraphQL로 재시도 필요
        );
      }

      let isValidPassword = false;

      // bcrypt 해시인지 확인
      if (
        user.password.startsWith("$2b$") ||
        user.password.startsWith("$2a$")
      ) {
        // bcrypt 해시와 비교
        isValidPassword = await bcrypt.compare(password, user.password);
        console.log("[Auth Login] bcrypt 검증 결과:", isValidPassword);
      } else {
        // 평문 비밀번호와 직접 비교 (레거시 지원)
        isValidPassword = password === user.password;
        console.log("[Auth Login] 평문 검증 결과:", isValidPassword);

        // 로그인 성공 시 비밀번호를 bcrypt로 업그레이드
        if (isValidPassword) {
          console.log("[Auth Login] 평문 비밀번호를 bcrypt로 업그레이드 중...");
          const hashedPassword = await bcrypt.hash(password, 12);
          await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
          });
          console.log("[Auth Login] 비밀번호 업그레이드 완료");
        }
      }

      if (!isValidPassword) {
        console.log("[Auth Login] 비밀번호 불일치 - 로그인 실패");
        return NextResponse.json(
          { error: "비밀번호가 일치하지 않습니다" },
          { status: 401 }
        );
      }
    }

    // 사업자 로그인인 경우 권한 확인
    if (isBusiness && !user.isBusiness) {
      return NextResponse.json(
        { error: "사업자 권한이 없습니다" },
        { status: 403 }
      );
    }

    // JWT 토큰 생성
    const token = await createJWT({
      userId: user.id,
      email: user.email,
      name: user.name || user.userId,
      isBusiness: user.isBusiness,
      brandId: user.brand?.id,
    });

    // 응답 생성 및 쿠키 설정
    const response = NextResponse.json({
      success: true,
      message: "로그인 성공",
      user: {
        id: user.id,
        userId: user.userId,
        email: user.email,
        name: user.name || user.userId,
        isBusiness: user.isBusiness,
        brand: user.brand,
      },
    });

    // httpOnly 쿠키에 토큰 설정
    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error("[Auth Login] 오류:", error);
    return NextResponse.json(
      { error: "로그인 처리 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
