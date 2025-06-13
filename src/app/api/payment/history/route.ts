import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    }

    const payments = await prisma.payment.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ payments });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "결제 내역을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
