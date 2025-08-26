import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkAdminUsers() {
  try {
    console.log("🔍 관리자 사용자 조회 중...\n");

    // 모든 관리자 사용자 조회
    const adminUsers = await prisma.user.findMany({
      where: { isAdmin: true },
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
        isAdmin: true,
        isBusiness: true,
        createdAt: true,
      },
    });

    if (adminUsers.length === 0) {
      console.log("❌ 관리자 사용자가 없습니다.");
      console.log("\n🔧 관리자 사용자를 생성하려면 다음 명령을 실행하세요:");
      console.log("npx ts-node scripts/create-admin-user.ts");
    } else {
      console.log(`✅ 관리자 사용자 ${adminUsers.length}명 발견:`);
      adminUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.userId} (${user.email})`);
        console.log(`   - ID: ${user.id}`);
        console.log(`   - 이름: ${user.name}`);
        console.log(`   - 관리자: ${user.isAdmin}`);
        console.log(`   - 사업자: ${user.isBusiness}`);
        console.log(`   - 가입일: ${user.createdAt.toLocaleDateString()}`);
      });
    }

    // 전체 사용자 수 조회
    const totalUsers = await prisma.user.count();
    console.log(`\n📊 전체 사용자 수: ${totalUsers}명`);
  } catch (error) {
    console.error("❌ 오류 발생:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUsers();
