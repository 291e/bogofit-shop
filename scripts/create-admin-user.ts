import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log("🔧 관리자 사용자 생성 중...\n");

    const adminData = {
      userId: "admin",
      email: "admin@bogofit.com",
      name: "관리자",
      password: await bcrypt.hash("admin123", 12),
      isAdmin: true,
      isBusiness: false,
    };

    // 이미 존재하는지 확인
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ userId: adminData.userId }, { email: adminData.email }],
      },
    });

    if (existingUser) {
      console.log("⚠️  이미 존재하는 사용자입니다.");
      console.log(`   - 사용자 ID: ${existingUser.userId}`);
      console.log(`   - 이메일: ${existingUser.email}`);
      console.log(`   - 관리자 권한: ${existingUser.isAdmin}`);

      if (!existingUser.isAdmin) {
        console.log("\n🔄 기존 사용자에게 관리자 권한을 부여하시겠습니까?");
        console.log("   다음 명령을 실행하세요:");
        console.log(
          `   npx ts-node scripts/make-user-admin.ts ${existingUser.id}`
        );
      }
      return;
    }

    // 새 관리자 사용자 생성
    const newAdmin = await prisma.user.create({
      data: adminData,
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

    console.log("✅ 관리자 사용자가 성공적으로 생성되었습니다!");
    console.log(`   - 사용자 ID: ${newAdmin.userId}`);
    console.log(`   - 이메일: ${newAdmin.email}`);
    console.log(`   - 이름: ${newAdmin.name}`);
    console.log(`   - 비밀번호: admin123`);
    console.log(`   - 관리자 권한: ${newAdmin.isAdmin}`);
    console.log(`   - 생성일: ${newAdmin.createdAt.toLocaleDateString()}`);

    console.log("\n🚀 이제 다음 정보로 로그인할 수 있습니다:");
    console.log(`   - 아이디: ${newAdmin.userId}`);
    console.log(`   - 비밀번호: admin123`);
  } catch (error) {
    console.error("❌ 관리자 사용자 생성 실패:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
