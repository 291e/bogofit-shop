import { NextRequest, NextResponse } from "next/server";
import { createJWT, setAuthCookie } from "@/lib/jwt-server";
import { decodeGraphQLToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      password,
      isBusiness = false,
      userInfo,
      graphqlToken,
    } = body;

    console.log("[Auth Login] 요청 데이터:", {
      userId,
      passwordLength: password?.length,
      isBusiness,
      hasUserInfo: !!userInfo,
      hasGraphqlToken: !!graphqlToken,
    });

    if (!userId && !graphqlToken) {
      return NextResponse.json(
        { error: "아이디 또는 토큰이 필요합니다" },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "비밀번호가 필요합니다" },
        { status: 400 }
      );
    }

    // GraphQL 로그인 성공 시 토큰을 검증하고 사용자 정보 추출
    if (password === "graphql" && graphqlToken) {
      console.log("[Auth Login] GraphQL 토큰 검증 시작");

      // GraphQL 토큰 디코딩 (검증 없이 구조 확인)
      const decodedPayload = decodeGraphQLToken(graphqlToken);
      console.log("[Auth Login] 디코딩된 토큰 페이로드:", decodedPayload);

      if (!decodedPayload || !decodedPayload.id) {
        console.log("[Auth Login] 토큰 디코딩 실패 또는 사용자 ID 없음");
        return NextResponse.json(
          { error: "유효하지 않은 토큰입니다" },
          { status: 401 }
        );
      }

      const userId = decodedPayload.id;

      console.log("[Auth Login] 토큰에서 추출한 사용자 ID:", userId);

      // 토큰의 사용자 ID로 DB에서 사용자 정보 조회
      const user = await prisma.user.findUnique({
        where: { id: userId },
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
        console.log("[Auth Login] 사용자를 찾을 수 없음:", userId);
        console.log(
          "[Auth Login] 회원가입이 완료되지 않았거나 DB 동기화 문제일 수 있습니다."
        );
        return NextResponse.json(
          { error: "사용자를 찾을 수 없습니다. 회원가입을 먼저 완료해주세요." },
          { status: 401 }
        );
      }

      console.log("[Auth Login] 사용자 조회 성공:", {
        userId: user.userId,
        email: user.email,
        isBusiness: user.isBusiness,
      });

      // 새로운 JWT 토큰 생성 (현재 프로젝트 형식에 맞게)
      const newToken = await createJWT({
        userId: user.id,
        email: user.email,
        name: user.name || user.userId,
        isBusiness: user.isBusiness || false,
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
          isBusiness: user.isBusiness || false,
          brand: user.brand,
        },
      });

      setAuthCookie(response, newToken);
      return response;
    }

    // 일반적인 로그인 처리 (DB 조회 필요)
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
      const isValidPassword = await bcrypt.compare(
        password,
        user.password || ""
      );
      if (!isValidPassword) {
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
