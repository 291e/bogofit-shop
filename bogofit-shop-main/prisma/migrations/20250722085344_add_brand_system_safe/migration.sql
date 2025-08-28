-- CreateEnum
CREATE TYPE "BrandStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "TermsType" AS ENUM ('SERVICE', 'PRIVACY', 'MARKETING', 'LOCATION', 'THIRDPARTY');

-- CreateEnum
CREATE TYPE "LogAction" AS ENUM ('LOGIN', 'LOGOUT', 'REGISTER', 'PASSWORD_RESET', 'VIEW_PRODUCT', 'ADD_TO_CART', 'REMOVE_FROM_CART', 'CREATE_ORDER', 'CANCEL_ORDER', 'PAYMENT_SUCCESS', 'PAYMENT_FAIL', 'WRITE_REVIEW', 'UPDATE_PROFILE', 'BUSINESS_LOGIN', 'BUSINESS_ACTION');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'DRAFT');

-- CreateEnum
CREATE TYPE "SettlementStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PeriodType" AS ENUM ('DAILY', 'MONTHLY', 'YEARLY');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "brandId" INTEGER,
ADD COLUMN     "settlementId" TEXT,
ADD COLUMN     "settlementStatus" "SettlementStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "totalCommission" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "brandId" INTEGER,
ADD COLUMN     "detailDescription" TEXT,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "totalSales" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalSold" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "storeName" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "brandId" INTEGER,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "gradeId" INTEGER,
ADD COLUMN     "isBusiness" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "UserGrade" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "discountRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pointRate" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "freeShipping" BOOLEAN NOT NULL DEFAULT false,
    "minOrderAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minOrderCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserGrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "description" TEXT,
    "businessNumber" TEXT,
    "status" "BrandStatus" NOT NULL DEFAULT 'PENDING',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bankAccount" TEXT,
    "bankCode" TEXT,
    "accountHolder" TEXT,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TermsAgreement" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "termsType" "TermsType" NOT NULL,
    "termsVersion" TEXT NOT NULL,
    "content" TEXT,
    "isAgreed" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "isWithdraw" BOOLEAN NOT NULL DEFAULT false,
    "withdrawReason" TEXT,
    "withdrawAt" TIMESTAMP(3),
    "agreedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TermsAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLog" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "action" "LogAction" NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "targetType" TEXT,
    "targetId" TEXT,
    "sessionId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "isSuccess" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settlement" (
    "id" TEXT NOT NULL,
    "brandId" INTEGER NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "settlementDate" TIMESTAMP(3),
    "totalSales" DOUBLE PRECISION NOT NULL,
    "totalOrders" INTEGER NOT NULL,
    "commission" DOUBLE PRECISION NOT NULL,
    "commissionRate" DOUBLE PRECISION NOT NULL,
    "adjustments" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "finalAmount" DOUBLE PRECISION NOT NULL,
    "status" "SettlementStatus" NOT NULL DEFAULT 'PENDING',
    "bankAccount" TEXT,
    "bankCode" TEXT,
    "accountHolder" TEXT,
    "notes" TEXT,
    "attachments" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandAnalytics" (
    "id" SERIAL NOT NULL,
    "brandId" INTEGER NOT NULL,
    "period" TEXT NOT NULL,
    "periodType" "PeriodType" NOT NULL,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "totalProducts" INTEGER NOT NULL DEFAULT 0,
    "averageOrderValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bestSellingProduct" TEXT,
    "totalProductViews" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "returnsCount" INTEGER NOT NULL DEFAULT 0,
    "refundsAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewsCount" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrandAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserGrade_name_key" ON "UserGrade"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserGrade_slug_key" ON "UserGrade"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");

-- CreateIndex
CREATE INDEX "TermsAgreement_userId_termsType_termsVersion_idx" ON "TermsAgreement"("userId", "termsType", "termsVersion");

-- CreateIndex
CREATE INDEX "UserLog_userId_createdAt_idx" ON "UserLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "UserLog_action_createdAt_idx" ON "UserLog"("action", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BrandAnalytics_brandId_period_periodType_key" ON "BrandAnalytics"("brandId", "period", "periodType");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "UserGrade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TermsAgreement" ADD CONSTRAINT "TermsAgreement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLog" ADD CONSTRAINT "UserLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "Settlement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandAnalytics" ADD CONSTRAINT "BrandAnalytics_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
