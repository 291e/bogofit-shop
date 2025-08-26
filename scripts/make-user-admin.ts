import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function makeUserAdmin() {
  try {
    const userIdentifier = process.argv[2];

    if (!userIdentifier) {
      console.log("❌ 사용자 ID 또는 이메일을 입력해주세요.");
      console.log(
        "사용법: npx ts-node scripts/make-user-admin.ts <userId 또는 email>"
      );
      return;
    }

    console.log(`🔍 사용자 조회 중: ${userIdentifier}\n`);

    // 사용자 조회
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { userId: userIdentifier },
          { email: userIdentifier },
          { id: userIdentifier },
        ],
      },
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
        isAdmin: true,
        isBusiness: true,
      },
    });

    if (!user) {
      console.log("❌ 사용자를 찾을 수 없습니다.");
      return;
    }

    console.log("📋 사용자 정보:");
    console.log(`   - ID: ${user.id}`);
    console.log(`   - 사용자 ID: ${user.userId}`);
    console.log(`   - 이메일: ${user.email}`);
    console.log(`   - 이름: ${user.name}`);
    console.log(`   - 현재 관리자 권한: ${user.isAdmin}`);
    console.log(`   - 사업자 권한: ${user.isBusiness}`);

    if (user.isAdmin) {
      console.log("\n⚠️  이미 관리자 권한을 가지고 있습니다.");
      return;
    }

    // 관리자 권한 부여
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { isAdmin: true },
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
        isAdmin: true,
        isBusiness: true,
      },
    });

    console.log("\n✅ 관리자 권한이 성공적으로 부여되었습니다!");
    console.log(`   - 사용자 ID: ${updatedUser.userId}`);
    console.log(`   - 이메일: ${updatedUser.email}`);
    console.log(`   - 관리자 권한: ${updatedUser.isAdmin}`);

    console.log("\n🚀 이제 관리자 페이지에 접근할 수 있습니다:");
    console.log("   - 로그아웃 후 다시 로그인해주세요.");
    console.log("   - /admin 페이지에 접근 가능합니다.");
  } catch (error) {
    console.error("❌ 관리자 권한 부여 실패:", error);
  } finally {
    await prisma.$disconnect();
  }
}

makeUserAdmin();
