import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createJWT, setAuthCookie } from "@/lib/jwt-server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      email,
      password,
      name,
      phoneNumber,
      gender,
      birthDate,
      profile,
      zipCode,
      address,
      addressDetail,
      // termsAgreement,
      // verificationMethod,
    } = body;

    console.log("[Signup API] 회원가입 요청:", { userId, email, name });

    // 필수 필드 검증
    if (!userId || !email || !password || !name) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다" },
        { status: 400 }
      );
    }

    // 중복 확인 (userId 또는 email)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ userId: userId }, { email: email }],
      },
    });

    if (existingUser) {
      const duplicateField =
        existingUser.userId === userId ? "사용자명" : "이메일";
      return NextResponse.json(
        { error: `이미 사용 중인 ${duplicateField}입니다` },
        { status: 409 }
      );
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 12);

    // 사용자 생성
    const newUser = await prisma.user.create({
      data: {
        userId,
        email,
        password: hashedPassword,
        name,
        phoneNumber: phoneNumber || null,
        gender: gender || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        profile: profile || null,
        isBusiness: false,
        isAdmin: false,
        // termsAgreement와 verificationMethod는 필요시 별도 테이블로 저장
      },
      include: {
        brand: {
          select: { id: true, name: true, status: true, isActive: true },
        },
      },
    });

    // 주소 정보가 있다면 별도로 저장
    if (zipCode && address) {
      await prisma.address.create({
        data: {
          userId: newUser.id,
          label: "기본 주소",
          recipient: name,
          zipCode,
          address1: address,
          address2: addressDetail || null,
          phone: phoneNumber || "",
          isDefault: true,
        },
      });
    }

    console.log("[Signup API] 사용자 생성 성공:", {
      id: newUser.id,
      userId: newUser.userId,
      email: newUser.email,
    });

    // JWT 토큰 생성 및 쿠키 설정 (자동 로그인)
    const token = await createJWT({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name || newUser.userId,
      isBusiness: newUser.isBusiness || false,
      brandId: newUser.brand?.id,
    });

    // 응답 생성 및 쿠키 설정
    const response = NextResponse.json({
      success: true,
      message: "회원가입이 완료되었습니다",
      user: {
        id: newUser.id,
        userId: newUser.userId,
        email: newUser.email,
        name: newUser.name || newUser.userId,
        isBusiness: newUser.isBusiness || false,
        brand: newUser.brand,
      },
    });

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error("[Signup API] 오류:", error);
    return NextResponse.json(
      { error: "회원가입 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
