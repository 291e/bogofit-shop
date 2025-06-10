import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: true, message: "인증 정보가 없습니다." },
        { status: 401 }
      );
    }
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ payments });
  } catch {
    return NextResponse.json(
      { error: true, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
