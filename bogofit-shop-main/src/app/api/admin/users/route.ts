import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags: [User]
 *     summary: 관리자 - 사용자 목록 조회 (페이지네이션)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 페이지당 개수
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: userId/email/name 검색어
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [all, admin, business, regular]
 *         description: 필터 타입
 *     responses:
 *       200:
 *         description: 사용자 목록과 페이지네이션 정보
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: 인증 실패
 *   post:
 *     tags: [User]
 *     summary: 관리자 - 사용자 생성
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               isAdmin:
 *                 type: boolean
 *               isBusiness:
 *                 type: boolean
 *             required: [userId, email, password, name]
 *     responses:
 *       200:
 *         description: 생성된 사용자 반환
 *       409:
 *         description: 중복 사용자
 */

// 사용자 목록 조회
export async function GET(request: NextRequest) {
  try {
    const [, errorResponse] = await requireAdminAuth(request);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";
    const filter = searchParams.get("filter") || ""; // all, admin, business, regular

    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { userId: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    if (filter === "admin") {
      where.isAdmin = true;
    } else if (filter === "business") {
      where.isBusiness = true;
    } else if (filter === "regular") {
      where.isAdmin = false;
      where.isBusiness = false;
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          userId: true,
          email: true,
          name: true,
          phoneNumber: true,
          isAdmin: true,
          isBusiness: true,
          createdAt: true,
          updatedAt: true,
          brand: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          _count: {
            select: {
              orders: true,
              reviews: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("사용자 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// 사용자 생성
export async function POST(request: NextRequest) {
  try {
    const [adminUser, errorResponse] = await requireAdminAuth(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { userId, email, password, name, phoneNumber, isAdmin, isBusiness } =
      body;

    // 필수 필드 검증
    if (!userId || !email || !password || !name) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다" },
        { status: 400 }
      );
    }

    // 중복 체크
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ userId }, { email }, ...(phoneNumber ? [{ phoneNumber }] : [])],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "이미 존재하는 사용자입니다" },
        { status: 409 }
      );
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 12);

    // 사용자 생성
    const newUser = await prisma.user.create({
      data: {
        userId,
        email,
        password: hashedPassword,
        name,
        phoneNumber: phoneNumber || null,
        isAdmin: isAdmin || false,
        isBusiness: isBusiness || false,
      },
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
        phoneNumber: true,
        isAdmin: true,
        isBusiness: true,
        createdAt: true,
      },
    });

    console.log(
      `[Admin] 새 사용자 생성: ${newUser.userId} by ${adminUser?.userId || "unknown"}`
    );

    return NextResponse.json({
      success: true,
      user: newUser,
      message: "사용자가 성공적으로 생성되었습니다",
    });
  } catch (error) {
    console.error("사용자 생성 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
