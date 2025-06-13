import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const user = await req.json();
    if (!user?.userId || !user?.email) {
      return NextResponse.json(
        { success: false, error: "userId, email 필수" },
        { status: 400 }
      );
    }
    await prisma.user.upsert({
      where: { userId: user.userId },
      update: {
        email: user.email,
        profile: user.profile || null,
        phoneNumber: user.phoneNumber || null,
        name: user.name || user.userId,
        isAdmin: user.isAdmin || false,
        updatedAt: new Date(),
      },
      create: {
        userId: user.userId,
        email: user.email,
        profile: user.profile || null,
        phoneNumber: user.phoneNumber || null,
        name: user.name || user.userId,
        isAdmin: user.isAdmin || false,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
