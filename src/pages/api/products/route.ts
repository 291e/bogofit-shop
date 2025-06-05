import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const page = parseInt((req.query.page as string) || "1", 10);
      const limit = parseInt((req.query.limit as string) || "20", 10);
      const skip = (page - 1) * limit;
      const [products, total] = await Promise.all([
        prisma.products.findMany({
          skip,
          take: limit,
          orderBy: { id: "desc" },
        }),
        prisma.products.count(),
      ]);
      return res.status(200).json({
        products,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      return res.status(500).json({ message: "DB 조회 오류", error });
    }
  }
  return res.status(405).json({ message: "Method Not Allowed" });
}
