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
      bodyKeys: Object.keys(body),
      fullBody: body,
    });

    if (!password) {
      return NextResponse.json(
        { error: "비밀번호가 필요합니다" },
        { status: 400 }
      );
    }

    // GraphQL 토큰 로그인 처리 (클라이언트에서 GraphQL 로그인 성공 후 호출)
    if ((password === "graphql" || password === "oauth") && graphqlToken) {
      console.log("[Auth Login] GraphQL/OAuth 토큰 로그인 처리");
      return await handleGraphQLTokenLogin(graphqlToken, isBusiness);
    }

    if (!userId) {
      console.log("[Auth Login] userId가 없습니다:", { userId, body });
      return NextResponse.json(
        { error: "아이디가 필요합니다" },
        { status: 400 }
      );
    }

    // 1단계: DB에서 사용자 조회
    console.log("[Auth Login] DB에서 사용자 조회:", userId);
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

    // 2단계: DB에 사용자가 있고 비밀번호도 있으면 자체 로그인 시도
    if (user && user.password) {
      console.log("[Auth Login] 자체 로그인 시도");
      return await handleDirectLogin(user, password, isBusiness);
    }

    // 3단계: DB에 없거나 비밀번호가 없으면 GraphQL 로그인이 필요함을 클라이언트에 알림
    console.log("[Auth Login] GraphQL 로그인 필요");
    return NextResponse.json(
      {
        error: "GRAPHQL_LOGIN_REQUIRED",
        message: "GraphQL 로그인이 필요합니다",
        hasUser: !!user,
        hasPassword: !!user?.password,
      },
      { status: 422 }
    );
  } catch (error) {
    console.error("[Auth Login] 오류:", error);
    return NextResponse.json(
      { error: "로그인 처리 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// GraphQL 토큰으로 로그인 처리
async function handleGraphQLTokenLogin(
  graphqlToken: string,
  isBusiness: boolean
) {
  console.log("[Auth Login] GraphQL 토큰 검증 시작");

  const decodedPayload = decodeGraphQLToken(graphqlToken);
  console.log("[Auth Login] 디코딩된 토큰 페이로드:", decodedPayload);

  if (!decodedPayload || !decodedPayload.id) {
    console.log("[Auth Login] 토큰 디코딩 실패");
    return NextResponse.json(
      { error: "유효하지 않은 토큰입니다" },
      { status: 401 }
    );
  }

  // DB에서 사용자 조회
  let user = await prisma.user.findUnique({
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

  // 사용자가 없으면 새로 생성 (GraphQL에서 로그인 성공했으므로)
  if (!user) {
    console.log("[Auth Login] 새 사용자 생성:", decodedPayload.id);

    const userName =
      decodedPayload.name ||
      decodedPayload.userId ||
      `user_${decodedPayload.id.slice(0, 8)}`;
    const userEmail =
      decodedPayload.email || `${decodedPayload.id}@graphql.user`;

    user = await prisma.user.create({
      data: {
        id: decodedPayload.id,
        userId: userName,
        email: userEmail,
        name: userName,
        password: null, // GraphQL 사용자는 비밀번호 없음
        isBusiness: isBusiness,
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

    console.log("[Auth Login] 새 사용자 생성 완료:", user.userId);
  }

  // 사업자 로그인인 경우 권한 확인
  if (isBusiness && !user.isBusiness) {
    return NextResponse.json(
      { error: "사업자 권한이 없습니다" },
      { status: 403 }
    );
  }

  // JWT 토큰 생성 및 응답
  const token = await createJWT({
    userId: user.id,
    email: user.email,
    name: user.name || user.userId,
    isBusiness: user.isBusiness || false,
    isAdmin: user.isAdmin || false,
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
      isAdmin: user.isAdmin || false,
      brand: user.brand,
    },
  });

  setAuthCookie(response, token);
  return response;
}

// 자체 로그인 처리
async function handleDirectLogin(
  user: {
    id: string;
    userId: string;
    email: string;
    name: string | null;
    password: string | null;
    isBusiness: boolean;
    isAdmin: boolean;
    brand?: {
      id: number;
      name: string;
      status: string;
      isActive: boolean;
    } | null;
  },
  password: string,
  isBusiness: boolean
) {
  console.log("[Auth Login] 자체 로그인 비밀번호 검증");

  let isValidPassword = false;

  // bcrypt 해시인지 확인
  if (
    user.password &&
    (user.password.startsWith("$2b$") || user.password.startsWith("$2a$"))
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
    console.log("[Auth Login] 비밀번호 불일치");
    return NextResponse.json(
      { error: "비밀번호가 일치하지 않습니다" },
      { status: 401 }
    );
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
    isAdmin: user.isAdmin,
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
      isAdmin: user.isAdmin,
      brand: user.brand,
    },
  });

  setAuthCookie(response, token);
  return response;
}
