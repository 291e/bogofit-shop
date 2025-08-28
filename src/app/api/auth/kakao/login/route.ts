import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createJWT, setAuthCookie } from "@/lib/jwt-server";

type KakaoUserResponse = {
  id: number;
  kakao_account?: {
    email?: string;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
      thumbnail_image_url?: string;
    };
  };
};

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: "accessToken is required" },
        { status: 400 }
      );
    }

    // Fetch Kakao user info
    const meRes = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      // Kakao API should not be cached
      cache: "no-store",
    });

    if (!meRes.ok) {
      const errText = await meRes.text();
      return NextResponse.json(
        { error: "Failed to fetch Kakao user", details: errText },
        { status: 401 }
      );
    }

    const kakaoUser = (await meRes.json()) as KakaoUserResponse;
    const socialId = String(kakaoUser.id);
    const email =
      kakaoUser.kakao_account?.email || `kakao_${socialId}@kakao.user`;
    const name =
      kakaoUser.kakao_account?.profile?.nickname || `kakao_${socialId}`;

    // Find existing provider link
  const provider = await prisma.provider.findUnique({
      where: {
        provider_socialId: {
          provider: "kakao",
          socialId,
        },
      },
      include: { user: { include: { brand: true } } },
    });

    let user = provider?.user || null;

    if (!user) {
      // Try find by email
      user = await prisma.user.findUnique({
        where: { email },
        include: { brand: true },
      });

      if (!user) {
        // Create a new user
        const userIdBase = `kakao_${socialId}`;
        let userId = userIdBase;
        // Ensure userId unique
        let suffix = 0;
        // Attempt up to a few variations to avoid collision
        while (true) {
          try {
            user = await prisma.user.create({
              data: {
                userId,
                email,
                name,
                password: null,
                isBusiness: false,
              },
              include: { brand: true },
            });
            break;
          } catch (e) {
            if (typeof e === "object" && e !== null && "code" in e && (e as { code?: string }).code === "P2002") {
              suffix += 1;
              userId = `${userIdBase}_${suffix}`;
              continue;
            }
            throw e;
          }
        }
      }

      // Link provider
      await prisma.provider.create({
        data: {
          provider: "kakao",
          socialId,
          email,
          userId: user.id,
        },
      });
    }

    // Create JWT and set cookie
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
      message: "Kakao login success",
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
  } catch (error) {
    console.error("[Kakao Fallback Login] error:", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
