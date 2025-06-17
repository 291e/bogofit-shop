import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const user = await req.json();
    if (!user?.userId || !user?.email || !user?.id) {
      return NextResponse.json(
        { success: false, error: "id, userId, email 필수" },
        { status: 400 }
      );
    }

    // 먼저 해당 ID나 userId로 기존 사용자가 있는지 확인
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: user.id }, { userId: user.userId }, { email: user.email }],
      },
    });

    if (existingUser) {
      // 기존 사용자가 있으면 업데이트만 수행
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          email: user.email,
          profile: user.profile || null,
          phoneNumber: user.phoneNumber || null,
          name: user.name || user.userId,
          isAdmin: user.isAdmin || false,
          updatedAt: new Date(),
        },
      });

      console.log(`[API/user/upsert] 기존 사용자 업데이트: ${updatedUser.id}`);
      return NextResponse.json({
        success: true,
        action: "updated",
        user: updatedUser,
      });
    } else {
      // 새 사용자 생성
      const newUser = await prisma.user.create({
        data: {
          id: user.id,
          userId: user.userId,
          email: user.email,
          profile: user.profile || null,
          phoneNumber: user.phoneNumber || null,
          name: user.name || user.userId,
          isAdmin: user.isAdmin || false,
        },
      });

      console.log(`[API/user/upsert] 새 사용자 생성: ${newUser.id}`);
      return NextResponse.json({
        success: true,
        action: "created",
        user: newUser,
      });
    }
  } catch (error) {
    console.error("[API/user/upsert] 에러:", error);

    // Prisma 유니크 제약 조건 에러인 경우
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      console.warn("[API/user/upsert] 유니크 제약 조건 위반, 무시됨");
      return NextResponse.json({ success: true, action: "ignored" });
    }

    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
