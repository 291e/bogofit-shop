-- CreateEnum
CREATE TYPE "ShippingType" AS ENUM ('DOMESTIC', 'OVERSEAS');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "shippingType" "ShippingType" NOT NULL DEFAULT 'OVERSEAS',
ADD COLUMN     "subCategory" TEXT;
