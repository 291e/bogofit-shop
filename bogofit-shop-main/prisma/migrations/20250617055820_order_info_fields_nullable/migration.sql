-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "address1" TEXT,
ADD COLUMN     "address2" TEXT,
ADD COLUMN     "agreePrivacy" BOOLEAN,
ADD COLUMN     "customsId" TEXT,
ADD COLUMN     "ordererEmail" TEXT,
ADD COLUMN     "ordererName" TEXT,
ADD COLUMN     "ordererPhone" TEXT,
ADD COLUMN     "ordererTel" TEXT,
ADD COLUMN     "recipientName" TEXT,
ADD COLUMN     "recipientPhone" TEXT,
ADD COLUMN     "recipientTel" TEXT,
ADD COLUMN     "zipCode" TEXT;
