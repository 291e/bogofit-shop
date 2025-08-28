/*
  Warnings:

  - Made the column `address1` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `agreePrivacy` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `customsId` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ordererName` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ordererPhone` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `recipientName` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `recipientPhone` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `zipCode` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/

-- 기존 NULL 값들을 기본값으로 업데이트
UPDATE "Order" SET "ordererName" = '주문자' WHERE "ordererName" IS NULL;
UPDATE "Order" SET "ordererPhone" = '010-0000-0000' WHERE "ordererPhone" IS NULL;
UPDATE "Order" SET "recipientName" = '수령인' WHERE "recipientName" IS NULL;
UPDATE "Order" SET "recipientPhone" = '010-0000-0000' WHERE "recipientPhone" IS NULL;
UPDATE "Order" SET "zipCode" = '00000' WHERE "zipCode" IS NULL;
UPDATE "Order" SET "address1" = '주소' WHERE "address1" IS NULL;
UPDATE "Order" SET "customsId" = 'P000000000000' WHERE "customsId" IS NULL;
UPDATE "Order" SET "agreePrivacy" = true WHERE "agreePrivacy" IS NULL;

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "isGuestOrder" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "address1" SET NOT NULL,
ALTER COLUMN "agreePrivacy" SET NOT NULL,
ALTER COLUMN "agreePrivacy" SET DEFAULT true,
ALTER COLUMN "customsId" SET NOT NULL,
ALTER COLUMN "ordererName" SET NOT NULL,
ALTER COLUMN "ordererPhone" SET NOT NULL,
ALTER COLUMN "recipientName" SET NOT NULL,
ALTER COLUMN "recipientPhone" SET NOT NULL,
ALTER COLUMN "zipCode" SET NOT NULL;

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
