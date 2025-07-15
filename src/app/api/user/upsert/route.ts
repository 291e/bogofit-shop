import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/user/upsert:
 *   post:
 *     tags:
 *       - User
 *     summary: 사용자 생성/업데이트
 *     description: 새 사용자를 생성하거나 기존 사용자 정보를 업데이트합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - userId
 *               - email
 *             properties:
 *               id:
 *                 type: string
 *                 description: 사용자 고유 ID
 *                 example: "user123"
 *               userId:
 *                 type: string
 *                 description: 사용자 식별자
 *                 example: "john_doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 이메일 주소
 *                 example: "john@example.com"
 *               profile:
 *                 type: string
 *                 description: 프로필 이미지 URL
 *                 example: "https://example.com/profile.jpg"
 *               phoneNumber:
 *                 type: string
 *                 description: 전화번호
 *                 example: "010-1234-5678"
 *               name:
 *                 type: string
 *                 description: 사용자 이름
 *                 example: "홍길동"
 *               isAdmin:
 *                 type: boolean
 *                 description: 관리자 여부
 *                 example: false
 *     responses:
 *       200:
 *         description: 사용자 생성/업데이트 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 action:
 *                   type: string
 *                   enum: [created, updated, ignored]
 *                   description: 수행된 작업
 *                   example: "created"
 *                 user:
 *                   type: object
 *                   description: 생성/업데이트된 사용자 정보
 *       400:
 *         description: 잘못된 요청 (필수 필드 누락)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

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
